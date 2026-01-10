const EInvoicingOperationsGuide = `# E-Invoicing System - Complete Operations Guide
## Multi-Standard Electronic Invoicing Platform

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Operations Documentation  
**Service Type:** E-Invoicing & Tax Compliance

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Supported Standards](#supported-standards)
3. [Invoice Generation](#invoice-generation)
4. [Validation & Signing](#validation--signing)
5. [Government Submission](#government-submission)
6. [Country-Specific Workflows](#country-specific-workflows)
7. [Daily Operations](#daily-operations)
8. [Troubleshooting](#troubleshooting)

---

## Executive Summary

### Global E-Invoicing Mandates

**What is E-Invoicing?**

Electronic invoicing (e-invoicing) is the **automated, structured, government-validated exchange of invoice data** between businesses. Unlike PDF invoices emailed, e-invoices are:
- **Machine-readable** (XML, JSON)
- **Government-cleared** (submitted to tax authority)
- **Digitally signed** (cryptographic authenticity)
- **Legally binding** (replaces paper invoices)

**Why It's Mandatory:**

67+ countries have mandated e-invoicing to:
- Combat VAT fraud (estimated €50B annually in EU alone)
- Improve tax collection efficiency
- Enable real-time tax reporting
- Reduce administrative burden

### Supported Countries & Standards

\`\`\`mermaid
graph TB
    subgraph "European Union"
        EU1[Peppol BIS 3.0<br/>27 EU countries]
        EU2[FatturaPA<br/>Italy]
        EU3[ViDA<br/>Future EU standard]
    end
    
    subgraph "Middle East & Africa"
        ME1[ZATCA Phase 2<br/>Saudi Arabia]
        ME2[e-Invoice<br/>UAE]
        ME3[e-Tax<br/>Egypt]
    end
    
    subgraph "Latin America"
        LA1[CFDI 4.0<br/>Mexico]
        LA2[NFe<br/>Brazil]
        LA3[SII<br/>Chile]
    end
    
    subgraph "Asia Pacific"
        AP1[InvoiceNow<br/>Singapore]
        AP2[E-Invoice<br/>Malaysia]
        AP3[E-Tax<br/>Indonesia]
    end
    
    style EU1 fill:#3b82f6,color:#fff
    style ME1 fill:#10b981,color:#fff
    style LA1 fill:#f59e0b,color:#fff
\`\`\`

---

## Supported Standards

### 1. Peppol BIS Billing 3.0 (EU)

**Coverage:** 27 EU countries + Norway, Switzerland, UK

\`\`\`yaml
peppol_specification:
  standard: "UBL 2.1 (Universal Business Language)"
  message_type: "Invoice"
  transmission: "Peppol eDelivery Network"
  
  workflow:
    1: "Create UBL XML invoice"
    2: "Validate against Peppol rules"
    3: "Send to Peppol Access Point"
    4: "Access Point delivers to recipient"
    
  mandatory_fields:
    - invoice_number
    - issue_date
    - seller_vat_id
    - buyer_vat_id
    - line_items
    - total_amount
    - vat_breakdown
\`\`\`

### 2. ZATCA Phase 2 (Saudi Arabia)

**Requirement:** All B2B invoices must be cleared through ZATCA platform

\`\`\`yaml
zatca_workflow:
  phase_2_requirements:
    - real_time_clearance: true
    - cryptographic_signing: true
    - qr_code_generation: true
    - sequential_numbering: true
    
  clearance_flow:
    1: "Generate invoice XML (UBL 2.1)"
    2: "Generate cryptographic stamp"
    3: "Generate QR code"
    4: "Submit to ZATCA API"
    5: "Receive clearance UUID"
    6: "Send to customer with UUID"
    
  technical_specs:
    xml_schema: "UBL 2.1 with ZATCA extensions"
    signing_algorithm: "ECDSA SHA-256"
    qr_code_format: "TLV (Tag-Length-Value)"
    api_endpoint: "https://gw-fatoora.zatca.gov.sa"
\`\`\`

### 3. FatturaPA 1.7 (Italy)

**Transmission:** Sistema di Interscambio (SDI)

\`\`\`yaml
fatturaPA_workflow:
  format: "XML FatturaPA 1.7"
  transmission: "SDI (Sistema di Interscambio)"
  
  invoice_types:
    TD01: "Standard B2B invoice"
    TD04: "Credit note"
    TD05: "Debit note"
    TD24: "Deferred invoice"
    
  flow:
    1: "Generate FatturaPA XML"
    2: "Digitally sign (qualified certificate)"
    3: "Submit to SDI via PEC or web service"
    4: "SDI validates format"
    5: "SDI delivers to recipient"
    6: "Receive delivery receipt"
    
  unique_requirements:
    - qualified_signature: "Italian digital certificate required"
    - pec_email: "Certified email for transmission"
    - codice_destinatario: "7-digit recipient code"
\`\`\`

---

## Invoice Generation

### Automated Generation from Transactions

\`\`\`mermaid
sequenceDiagram
    participant TXN as Transaction
    participant Trigger as Auto-Invoice Trigger
    participant Engine as E-Invoice Engine
    participant Tax as Tax Calculator
    participant Sign as Digital Signer
    participant Gov as Government Gateway
    
    TXN->>Trigger: Transaction completed
    Trigger->>Trigger: Check if B2B
    Trigger->>Trigger: Check country mandate
    
    alt E-Invoice Required
        Trigger->>Engine: Generate e-invoice
        Engine->>Tax: Calculate tax breakdown
        Tax-->>Engine: VAT details
        
        Engine->>Engine: Build XML (Peppol/ZATCA/FatturaPA)
        Engine->>Sign: Sign invoice
        Sign-->>Engine: Signed XML
        
        Engine->>Gov: Submit to government
        Gov-->>Engine: Clearance/UUID
        
        Engine->>TXN: Update with invoice ID
        Engine->>Customer: Send invoice
    else Not Required
        Trigger->>TXN: Skip e-invoice
    end
\`\`\`

---

## Government Submission

### Submission Workflows by Country

**Saudi Arabia (ZATCA):**

\`\`\`javascript
// ZATCA Phase 2 submission
async function submitToZATCA(invoice) {
  // 1. Generate cryptographic stamp
  const stamp = await generateZATCAStamp(invoice);
  
  // 2. Generate QR code
  const qrCode = generateZATCAQR(invoice, stamp);
  
  // 3. Submit to ZATCA
  const response = await fetch('https://gw-fatoora.zatca.gov.sa/e-invoicing/core/invoices', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + zatcaToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      invoice: invoice.xml,
      invoiceHash: stamp.hash,
      uuid: invoice.uuid
    })
  });
  
  const result = await response.json();
  // Returns: { clearanceStatus, clearedInvoice, uuid }
}
\`\`\`

**Italy (SDI):**

\`\`\`javascript
// FatturaPA submission to SDI
async function submitToSDI(invoice) {
  // 1. Sign with qualified certificate
  const signedXML = await signWithQualifiedCert(invoice.xml);
  
  // 2. Submit via web service or PEC
  const response = await fetch('https://sdi.fatturapa.gov.it/SdIRiceviFile', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml',
      'SOAPAction': 'RicezioneInvoice'
    },
    body: signedXML
  });
  
  // 3. Parse SDI response
  const result = await parseSDIResponse(response);
  // Returns: { idSdi, status, deliveryReceipt }
}
\`\`\`

---

## Country-Specific Workflows

### Compliance Mandates by Country

| Country | Mandate | Standard | Deadline | B2B | B2C | B2G |
|---------|---------|----------|----------|-----|-----|-----|
| **Saudi Arabia** | ZATCA Phase 2 | UBL 2.1 | Live | ✅ | ✅ | ✅ |
| **Italy** | FatturaPA | FatturaPA 1.7 | Live | ✅ | ✅ | ✅ |
| **France** | PPF (Plateforme de Facturation) | UBL 2.1 / CII | Sep 2026 | ✅ | ✅ | ✅ |
| **Germany** | ViDA / B2G | XRechnung | Jan 2025 (B2G) | ⚠️ | ❌ | ✅ |
| **Spain** | VeriFactu / TicketBAI | TicketBAI | Live (regions) | ✅ | ✅ | ✅ |
| **Poland** | KSeF | FA_VAT | Live | ✅ | ❌ | ✅ |
| **Romania** | RO e-Factura | UBL 2.1 | Live | ✅ | ❌ | ✅ |

---

## Daily Operations

### Daily Checklist

**Morning (9am local time):**
- [ ] Check overnight invoice submissions (review failed)
- [ ] Monitor government gateway status (Peppol, ZATCA, SDI)
- [ ] Review pending invoices awaiting clearance
- [ ] Check tax rate update logs

**During Day:**
- [ ] Monitor real-time invoice generation
- [ ] Review and approve high-value invoices (>€10K)
- [ ] Respond to customer invoice queries
- [ ] Handle rejection notifications from government

**End of Day (6pm local time):**
- [ ] Verify all invoices cleared/delivered
- [ ] Export daily invoice register
- [ ] Review error logs and retry failed submissions

### Monthly Compliance Tasks

**Week 1 (Month Start):**
- Generate VAT returns for previous month
- Submit MOSS/OSS return (if EU)
- Archive invoices for previous month

**Week 2:**
- Reconcile invoice totals with accounting
- Pay VAT liability

**Week 3:**
- Review compliance alerts
- Update tax configurations if rate changes

**Week 4:**
- Prepare for next month
- Review government notices

---

## Troubleshooting

### Common Issues

**Issue: ZATCA Clearance Rejected**

**Error Codes:**
- \`INVALID_HASH\` - Regenerate cryptographic stamp
- \`INVALID_QR\` - Check QR code generation
- \`INVALID_VAT\` - Verify Saudi VAT number format
- \`DUPLICATE_UUID\` - Use unique UUID per invoice

**Issue: Peppol Delivery Failed**

**Solutions:**
1. Verify recipient Peppol ID is correct
2. Check Access Point status
3. Validate UBL XML against Peppol rules
4. Review recipient endpoint availability

**Issue: SDI Rejection (Italy)**

**Common Reasons:**
- Invalid digital signature
- Missing codice destinatario
- Incorrect FatturaPA format
- Invalid PEC email

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default EInvoicingOperationsGuide;