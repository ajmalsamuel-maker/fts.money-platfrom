import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { mt_message, target_standard, enrichment_features } = await req.json();

        // Parse MT message
        const parsed = parseMTMessage(mt_message);
        
        let result;
        if (target_standard === 'ISO20022') {
            result = await mtToISO20022(parsed, enrichment_features, base44);
        } else if (target_standard === 'ISO8583') {
            result = mtToISO8583(parsed);
        }

        return Response.json({ 
            status: 'success',
            translated_message: result,
            enrichments_applied: enrichment_features
        });
    } catch (error) {
        return Response.json({ 
            status: 'error', 
            message: error.message 
        }, { status: 500 });
    }
});

function parseMTMessage(mtMessage) {
    // Parse SWIFT MT format (field-tag based)
    const fields = {};
    const lines = mtMessage.split('\n');
    
    for (const line of lines) {
        const match = line.match(/^:(\d+[A-Z]?):(.*)/);
        if (match) {
            fields[match[1]] = match[2].trim();
        }
    }
    
    return {
        type: mtMessage.includes(':103:') ? 'MT103' : 
              mtMessage.includes(':202:') ? 'MT202' : 
              mtMessage.includes(':940:') ? 'MT940' : 'unknown',
        fields
    };
}

async function mtToISO20022(parsed, enrichment, base44) {
    const msgId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${timestamp}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${parsed.fields['20'] || msgId}</EndToEndId>
        <TxId>${msgId}</TxId>
      </PmtId>`;

    // Amount from field 32A
    if (parsed.fields['32A']) {
        const amountMatch = parsed.fields['32A'].match(/(\w{3})([\d,]+)/);
        if (amountMatch) {
            xml += `
      <IntrBkSttlmAmt Ccy="${amountMatch[1]}">${amountMatch[2].replace(',', '.')}</IntrBkSttlmAmt>`;
        }
    }

    // Debtor (Ordering Customer - field 50K)
    if (parsed.fields['50K']) {
        xml += `
      <Dbtr>
        <Nm>${parsed.fields['50K'].split('\n')[0]}</Nm>`;
        
        // LEI Enrichment
        if (enrichment?.lei_enrichment) {
            const leiData = await fetchLEIForParty(parsed.fields['50K'], base44);
            if (leiData?.lei) {
                xml += `
        <Id>
          <OrgId>
            <LEI>${leiData.lei}</LEI>
          </OrgId>
        </Id>`;
            }
        }
        
        xml += `
      </Dbtr>`;
    }

    // Creditor (Beneficiary Customer - field 59)
    if (parsed.fields['59']) {
        xml += `
      <Cdtr>
        <Nm>${parsed.fields['59'].split('\n')[0]}</Nm>`;
        
        // LEI Enrichment
        if (enrichment?.lei_enrichment) {
            const leiData = await fetchLEIForParty(parsed.fields['59'], base44);
            if (leiData?.lei) {
                xml += `
        <Id>
          <OrgId>
            <LEI>${leiData.lei}</LEI>
          </OrgId>
        </Id>`;
            }
        }
        
        xml += `
      </Cdtr>`;
    }

    // Structured Remittance (from field 70 - Remittance Information)
    if (enrichment?.structured_remittance && parsed.fields['70']) {
        const remittance = parsed.fields['70'];
        const invoiceMatch = remittance.match(/INV[:\s]*(\S+)/i);
        const poMatch = remittance.match(/PO[:\s]*(\S+)/i);
        
        if (invoiceMatch || poMatch) {
            xml += `
      <RmtInf>
        <Strd>`;
            if (invoiceMatch) {
                xml += `
          <RfrdDocInf>
            <Tp>
              <CdOrPrtry>
                <Cd>CINV</Cd>
              </CdOrPrtry>
            </Tp>
            <Nb>${invoiceMatch[1]}</Nb>
          </RfrdDocInf>`;
            }
            if (poMatch) {
                xml += `
          <RfrdDocInf>
            <Tp>
              <CdOrPrtry>
                <Cd>PUOR</Cd>
              </CdOrPrtry>
            </Tp>
            <Nb>${poMatch[1]}</Nb>
          </RfrdDocInf>`;
            }
            xml += `
        </Strd>
      </RmtInf>`;
        } else {
            xml += `
      <RmtInf>
        <Ustrd>${remittance}</Ustrd>
      </RmtInf>`;
        }
    }

    // Purpose Code
    if (enrichment?.purpose_codes && parsed.fields['26T']) {
        const purposeCode = mapMTToPurposeCode(parsed.fields['26T']);
        xml += `
      <Purp>
        <Cd>${purposeCode}</Cd>
      </Purp>`;
    }

    xml += `
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;

    return xml;
}

function mtToISO8583(parsed) {
    // Simplified MT to ISO 8583 conversion
    const iso8583 = {
        mti: '0200', // Financial transaction request
        fields: {
            2: parsed.fields['50K']?.substring(0, 19), // PAN (mock)
            3: '000000', // Processing code
            4: parsed.fields['32A']?.match(/[\d,]+/)?.[0].replace(',', '') || '0',
            7: new Date().toISOString().replace(/[-:TZ.]/g, '').substring(2, 12),
            11: Math.floor(Math.random() * 999999).toString().padStart(6, '0'),
            49: parsed.fields['32A']?.match(/(\w{3})/)?.[1] || 'USD'
        }
    };
    
    return btoa(JSON.stringify(iso8583));
}

async function fetchLEIForParty(partyInfo, base44) {
    try {
        // Extract company name from party info
        const companyName = partyInfo.split('\n')[0].trim();
        
        // Check if we have LEI in our database
        const customers = await base44.asServiceRole.entities.ISOGatewayCustomer.filter({
            company_name: companyName
        });
        
        if (customers.length > 0 && customers[0].lei) {
            return { lei: customers[0].lei };
        }
        
        // Could integrate with GLEIF API here for real-time lookup
        return null;
    } catch (error) {
        console.error('LEI lookup failed:', error);
        return null;
    }
}

function mapMTToPurposeCode(mtCode) {
    const mapping = {
        'SALA': 'SALA', // Salary payment
        'PENS': 'PENS', // Pension payment
        'SUPP': 'SUPP', // Supplier payment
        'TAXS': 'TAXS', // Tax payment
        'DIVD': 'DIVD', // Dividend
        'INTC': 'INTC', // Intra-company payment
    };
    return mapping[mtCode] || 'OTHR';
}