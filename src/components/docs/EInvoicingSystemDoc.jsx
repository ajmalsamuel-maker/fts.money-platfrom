import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const EInvoicingSystemDoc = `# E-Invoicing System - Complete Technical Specification

## Executive Summary

The FTS.Money E-Invoicing System is a comprehensive, multi-standard electronic invoicing platform that enables Payment Service Providers, merchants, and enterprises to generate, validate, sign, and submit compliant electronic invoices to government tax authorities worldwide. The system supports 8+ international e-invoicing standards, handles complex VAT scenarios, integrates with payment processing, and provides complete audit trails for regulatory compliance.

### What is E-Invoicing?

Electronic invoicing (e-invoicing) is the exchange of invoice documents between suppliers and buyers in a structured electronic format that can be automatically processed without manual intervention. Unlike PDF invoices sent by email, e-invoices are machine-readable structured data (typically XML or JSON) that comply with government-mandated standards and are submitted to tax authorities for real-time verification and approval.

**Why E-Invoicing Matters:**
- **Tax Compliance:** Many countries now mandate e-invoicing for VAT/GST reporting
- **Fraud Prevention:** Government pre-approval prevents fake invoices and VAT fraud
- **Automation:** Structured data enables automatic payment matching and reconciliation
- **Audit Trail:** Complete lifecycle tracking from creation to payment
- **Cross-Border Trade:** Standardized formats facilitate international commerce

### Global E-Invoicing Landscape

**Countries with Mandatory E-Invoicing (2026):**
- Europe: Italy, Spain, France (B2G), Poland, Belgium, Germany (B2G)
- Middle East: Saudi Arabia, UAE, Kuwait, Egypt
- Latin America: Mexico, Brazil, Chile, Argentina, Peru, Colombia
- Asia-Pacific: India, South Korea, Taiwan, Singapore (upcoming)

**Adoption Timeline:**
- 2014-2018: Early adopters (Italy, Mexico, Chile)
- 2019-2021: Rapid expansion (Saudi Arabia, France, Poland)
- 2022-2024: Mass adoption (India, Germany, UAE, Malaysia)
- 2025-2027: Universal adoption (EU-wide mandate, US consideration)

### FTS.Money E-Invoicing System Features

\`\`\`mermaid
mindmap
  root((E-Invoicing<br/>System))
    Multi-Standard Support
      Peppol BIS 3.0
        EU Cross-Border
        Public Sector B2G
        30+ Countries
      ZATCA Phase 2
        Saudi Arabia KSA
        Simplified/Standard
        QR Code Mandatory
      FatturaPA 1.7
        Italy Mandatory
        SDI System
        Digital Signature
      CFDI 4.0
        Mexico SAT
        Timbrado Fiscal
        PAC Integration
      UBL 2.1 Generic
        Global Standard
        ISO 19845
        Flexible Schema
      UN CEFACT CII
        Cross Industry
        D16B Version
        International Trade
      Factur-X
        France Germany
        PDF/A-3 Hybrid
        ZUGFeRD Compatible
      PINT A-NZ
        Asia Pacific
        Emerging Standard
        Australia Singapore
    Automated Generation
      Template Engine
        Country-Specific
        Customer Type
        Industry Vertical
      Data Population
        From Transactions
        ISO 20022 Mapping
        VAT Breakdown
      QR Code Generator
        Payment URLs
        Verification Codes
        Country-Specific
    Validation & Submission
      Schema Validation
        XSD Compliance
        Business Rules
        Field Requirements
      Cryptographic Signing
        Digital Certificates
        XML Signature
        Non-Repudiation
      Government Gateway
        Direct Submission
        Real-Time Response
        Retry Logic
    Lifecycle Management
      Draft Creation
      Approval Workflow
      Submission Tracking
      Status Monitoring
      Archival Storage
      Audit Trail
\`\`\`

---

## Supported E-Invoicing Standards

### 1. Peppol BIS Billing 3.0 (Pan-European Public Procurement)

**Overview:**
Peppol (Pan-European Public Procurement Online) is the EU standard for electronic invoicing in public procurement. BIS Billing 3.0 is based on UBL 2.1 and is mandatory for all B2G (Business-to-Government) transactions in the EU.

**Geographic Coverage:**
- **Mandatory:** All 27 EU member states for B2G
- **Voluntary:** European Economic Area (EEA), EFTA countries
- **Global:** Adopted by Australia, New Zealand, Singapore, Japan

**Technical Specifications:**

\`\`\`yaml
peppol_bis_billing_3:
  base_standard: "UBL 2.1 (ISO 19845)"
  message_type: "Invoice"
  format: "XML"
  character_encoding: "UTF-8"
  
  mandatory_elements:
    invoice_identifiers:
      - invoice_number: "Unique within seller space"
      - issue_date: "YYYY-MM-DD format"
      - due_date: "Payment due date"
      - invoice_type_code: "380 (Commercial invoice)"
      
    party_information:
      supplier:
        - legal_name
        - address (street, city, postal, country)
        - vat_identifier: "Country code + VAT number"
        - endpoint_id: "Peppol participant ID"
        - electronic_address: "0088:1234567890123 format"
      
      customer:
        - legal_name
        - address (full postal address)
        - vat_identifier: "If B2B transaction"
        - endpoint_id: "Peppol access point"
        
    invoice_lines:
      - line_id: "Sequential number"
      - quantity: "Number with unit of measure"
      - item_description: "Clear product/service description"
      - unit_price: "Price per unit"
      - line_total: "Quantity × unit price"
      - vat_category: "S, Z, E, AE, K, G, O"
      - vat_rate: "Percentage (if applicable)"
      
    totals:
      - line_extension_amount: "Sum of all line totals"
      - tax_exclusive_amount: "Before VAT"
      - tax_inclusive_amount: "After VAT"
      - payable_amount: "Final amount due"
      
  optional_but_recommended:
    - payment_means_code: "Bank transfer, card, etc."
    - payment_id: "Structured creditor reference"
    - bank_account: "IBAN + BIC"
    - payment_terms: "Net 30, Net 60, etc."
    - project_reference: "For project-based invoicing"
    - contract_reference: "Contract number"
    - order_reference: "Purchase order number"
    - delivery_date: "Goods/services delivery"
    - buyer_reference: "Buyer's internal ref"
    
  validation_rules:
    - "VAT identifier must match country code"
    - "Endpoint ID must be registered in SML"
    - "Sum of line totals must equal invoice total"
    - "VAT calculation must be mathematically correct"
    - "Currency must be ISO 4217 code"
    - "Country codes must be ISO 3166-1 alpha-2"
    
  peppol_network:
    access_points:
      - "Registered Peppol Access Point required"
      - "FTS.Money operates as certified Access Point"
      - "Direct connection to Peppol network"
    
    sml_smp:
      - "SML (Service Metadata Locator) lookup"
      - "SMP (Service Metadata Publisher) registration"
      - "Endpoint capability discovery"
\`\`\`

**Peppol Invoice Example (Simplified):**

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ID>INV-2026-001234</cbc:ID>
  <cbc:IssueDate>2026-01-05</cbc:IssueDate>
  <cbc:DueDate>2026-02-04</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cbc:EndpointID schemeID="0088">1234567890123</cbc:EndpointID>
      <cac:PartyName>
        <cbc:Name>Example Payments Ltd</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>123 Payment Street</cbc:StreetName>
        <cbc:CityName>Dublin</cbc:CityName>
        <cbc:PostalZone>D02 X234</cbc:PostalZone>
        <cac:Country>
          <cbc:IdentificationCode>IE</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>IE1234567T</cbc:CompanyID>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:InvoiceLine>
    <cbc:ID>1</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">100</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">10000.00</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Name>Payment Processing Services</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>23</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="EUR">100.00</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">2300.00</cbc:TaxAmount>
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="EUR">10000.00</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="EUR">2300.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>S</cbc:ID>
        <cbc:Percent>23</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>VAT</cbc:ID>
        </cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>
  </cac:TaxTotal>
  
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">10000.00</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">10000.00</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">12300.00</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">12300.00</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
</Invoice>
\`\`\`

---

### 2. ZATCA (Saudi Arabia - Fatoora Phase 2)

**Overview:**
ZATCA (Zakat, Tax and Customs Authority) e-invoicing regulation is mandatory for all businesses in Saudi Arabia since December 2021. Phase 2 (Integration Phase) requires real-time submission to ZATCA for clearance before sharing with customers.

**Two Invoice Types:**

\`\`\`mermaid
graph LR
    subgraph "Simplified Tax Invoice (B2C)"
        S1[Retail Sales<br/>Individual Customers]
        S2[Generate Invoice<br/>+ QR Code]
        S3[Store Locally<br/>No Real-Time Submit]
        S4[Periodic Reporting<br/>Monthly to ZATCA]
    end
    
    subgraph "Standard Tax Invoice (B2B)"
        T1[Business Sales<br/>VAT Registered Buyer]
        T2[Generate Invoice<br/>+ Detailed QR]
        T3[Submit to ZATCA<br/>Real-Time Clearance]
        T4[Receive UUID<br/>Clearance Token]
        T5[Share with Customer<br/>Cleared Invoice]
    end
    
    S1 --> S2
    S2 --> S3
    S3 --> S4
    
    T1 --> T2
    T2 --> T3
    T3 --> T4
    T4 --> T5
    
    style S3 fill:#fef3c7
    style T3 fill:#ef4444,color:#fff
    style T4 fill:#10b981,color:#fff
\`\`\`

**ZATCA QR Code Requirements:**

Every ZATCA invoice must include a QR code containing base64-encoded TLV (Tag-Length-Value) data:

\`\`\`yaml
qr_code_fields:
  tag_1_seller_name:
    tag: 0x01
    encoding: "UTF-8 string"
    example: "Example Company Ltd"
    
  tag_2_vat_number:
    tag: 0x02
    encoding: "UTF-8 string"
    example: "300000000000003"
    format: "15 digits"
    
  tag_3_timestamp:
    tag: 0x03
    encoding: "ISO 8601"
    example: "2026-01-05T14:30:00Z"
    
  tag_4_total_with_vat:
    tag: 0x04
    encoding: "Decimal string"
    example: "1150.00"
    
  tag_5_vat_total:
    tag: 0x05
    encoding: "Decimal string"
    example: "150.00"
    
  tag_6_invoice_hash:
    tag: 0x06
    encoding: "Base64 SHA-256 hash"
    purpose: "Invoice integrity verification"
    
  tag_7_ecdsa_signature:
    tag: 0x07
    encoding: "Base64 ECDSA signature"
    purpose: "Cryptographic proof"
    
  tag_8_public_key:
    tag: 0x08
    encoding: "Base64 EC public key"
    purpose: "Signature verification"
    
  tag_9_crypto_stamp:
    tag: 0x09
    encoding: "Base64"
    purpose: "ZATCA clearance stamp"
\`\`\`

**ZATCA Cryptographic Requirements:**

\`\`\`mermaid
sequenceDiagram
    participant Seller as Merchant/PSP
    participant Engine as E-Invoice Engine
    participant CSR as Certificate Authority
    participant ZATCA as ZATCA Platform
    participant Buyer as Customer
    
    Note over Seller,ZATCA: Phase 1: Onboarding
    Seller->>CSR: Generate CSR (Certificate Signing Request)
    CSR->>CSR: Create ECDSA Key Pair (secp256k1)
    CSR-->>Seller: CSR File
    
    Seller->>ZATCA: Submit Onboarding Request + CSR
    ZATCA->>ZATCA: Validate Business Registration
    ZATCA->>ZATCA: Issue X.509 Certificate
    ZATCA-->>Seller: Certificate + Crypto Stamp Identifier
    
    Note over Seller,ZATCA: Phase 2: Invoice Generation
    Seller->>Engine: Create Invoice
    Engine->>Engine: Generate XML (UBL 2.1)
    Engine->>Engine: Calculate Invoice Hash (SHA-256)
    Engine->>Engine: Sign with Private Key (ECDSA)
    Engine->>Engine: Generate QR Code (TLV format)
    Engine-->>Seller: Signed Invoice + QR
    
    Note over Seller,ZATCA: Phase 3: Clearance (B2B only)
    Seller->>ZATCA: POST /invoices/clearance/single
    ZATCA->>ZATCA: Validate Signature
    ZATCA->>ZATCA: Validate Hash
    ZATCA->>ZATCA: Validate Tax Calculation
    ZATCA->>ZATCA: Check Compliance Rules
    
    alt Validation Success
        ZATCA->>ZATCA: Generate Clearance UUID
        ZATCA->>ZATCA: Add Crypto Stamp
        ZATCA-->>Seller: Cleared Invoice + UUID
        Seller->>Buyer: Send Cleared Invoice
    else Validation Failed
        ZATCA-->>Seller: Rejection Errors
        Seller->>Engine: Fix Issues
        Engine->>ZATCA: Resubmit
    end
    
    Note over Seller,ZATCA: Phase 4: Reporting (B2C)
    Seller->>ZATCA: POST /invoices/reporting/single
    ZATCA->>ZATCA: Store for Audit
    ZATCA-->>Seller: Accepted
\`\`\`

**ZATCA Invoice Types & Requirements:**

| Invoice Type | Arabic Name | Customer Type | Real-Time Clearance | QR Code | Signature |
|--------------|-------------|---------------|---------------------|---------|-----------|
| **Standard Tax Invoice** | فاتورة ضريبية | B2B (VAT registered) | ✅ Mandatory | ✅ Detailed 9-field | ✅ ECDSA required |
| **Simplified Tax Invoice** | فاتورة ضريبية مبسطة | B2C (Individual) | ❌ Reporting only | ✅ Simplified 5-field | ✅ ECDSA required |
| **Debit Note** | إشعار مدين | Adjustment (increase) | ✅ If B2B | ✅ | ✅ |
| **Credit Note** | إشعار دائن | Adjustment (decrease) | ✅ If B2B | ✅ | ✅ |
| **Summary Invoice** | فاتورة ملخص | Periodic summary | ✅ If B2B | ✅ | ✅ |

---

### 3. FatturaPA 1.7 (Italy - Sistema di Interscambio)

**Overview:**
FatturaPA (Fattura Elettronica Pubblica Amministrazione) is Italy's mandatory e-invoicing system. All B2B and B2G invoices must be submitted through the SDI (Sistema di Interscambio) for validation before they are legally valid.

**SDI (Sistema di Interscambio) Integration:**

\`\`\`mermaid
flowchart TD
    A[Italian Supplier] --> B[Generate FatturaPA XML]
    B --> C[Sign with Digital Certificate]
    C --> D[Submit to SDI]
    
    D --> E{SDI Validation}
    E -->|Valid| F[SDI Accepts Invoice]
    E -->|Invalid| G[SDI Rejects Invoice]
    
    F --> H[SDI Sends to Recipient]
    H --> I{Recipient Type}
    
    I -->|Business| J[Delivered to Business PEC]
    I -->|Public Admin| K[Delivered to IPA Code]
    
    J --> L[Business Downloads from SDI]
    K --> M[Public Admin System Receives]
    
    L --> N[Invoice Accepted]
    M --> N
    
    G --> O[Supplier Receives Rejection]
    O --> P[Fix Errors]
    P --> B
    
    F --> Q[Supplier Receives Acceptance]
    Q --> R{Payment Due?}
    R -->|Yes| S[5-Day Window]
    S --> T[Buyer Can Reject]
    T -->|Rejected| U[Dispute Resolution]
    T -->|Accepted| V[Invoice Finalized]
    R -->|No rejection| V
    
    style D fill:#2563eb,color:#fff
    style F fill:#10b981,color:#fff
    style G fill:#ef4444,color:#fff
\`\`\`

**FatturaPA Technical Requirements:**

\`\`\`xml
<!-- FatturaPA Structure (Simplified) -->
<?xml version="1.0" encoding="UTF-8"?>
<p:FatturaElettronica xmlns:p="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" versione="FPA12">
  <FatturaElettronicaHeader>
    <DatiTrasmissione>
      <IdTrasmittente>
        <IdPaese>IT</IdPaese>
        <IdCodice>12345678901</IdCodice>
      </IdTrasmittente>
      <ProgressivoInvio>00001</ProgressivoInvio>
      <FormatoTrasmissione>FPA12</FormatoTrasmissione>
      <CodiceDestinatario>ABCDEFG</CodiceDestinatario>
    </DatiTrasmissione>
    
    <CedentePrestatore>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>12345678901</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>Example SRL</Denominazione>
        </Anagrafica>
        <RegimeFiscale>RF01</RegimeFiscale>
      </DatiAnagrafici>
      <Sede>
        <Indirizzo>Via Roma 123</Indirizzo>
        <CAP>00100</CAP>
        <Comune>Roma</Comune>
        <Provincia>RM</Provincia>
        <Nazione>IT</Nazione>
      </Sede>
    </CedentePrestatore>
    
    <CessionarioCommittente>
      <DatiAnagrafici>
        <IdFiscaleIVA>
          <IdPaese>IT</IdPaese>
          <IdCodice>98765432109</IdCodice>
        </IdFiscaleIVA>
        <Anagrafica>
          <Denominazione>Customer Company SpA</Denominazione>
        </Anagrafica>
      </DatiAnagrafici>
    </CessionarioCommittente>
  </FatturaElettronicaHeader>
  
  <FatturaElettronicaBody>
    <DatiGenerali>
      <DatiGeneraliDocumento>
        <TipoDocumento>TD01</TipoDocumento>
        <Divisa>EUR</Divisa>
        <Data>2026-01-05</Data>
        <Numero>2026/001</Numero>
      </DatiGeneraliDocumento>
    </DatiGenerali>
    
    <DatiBeniServizi>
      <DettaglioLinee>
        <NumeroLinea>1</NumeroLinea>
        <Descrizione>Payment processing services</Descrizione>
        <Quantita>100.00</Quantita>
        <PrezzoUnitario>100.00</PrezzoUnitario>
        <PrezzoTotale>10000.00</PrezzoTotale>
        <AliquotaIVA>22.00</AliquotaIVA>
      </DettaglioLinee>
      
      <DatiRiepilogo>
        <AliquotaIVA>22.00</AliquotaIVA>
        <ImponibileImporto>10000.00</ImponibileImporto>
        <Imposta>2200.00</Imposta>
      </DatiRiepilogo>
    </DatiBeniServizi>
  </FatturaElettronicaBody>
</p:FatturaElettronica>
\`\`\`

**Digital Signature Requirements:**
- **Standard:** XAdES-BES (XML Advanced Electronic Signature)
- **Certificate Type:** Qualified certificate from Italian CA
- **Algorithm:** RSA 2048-bit minimum
- **Hash:** SHA-256
- **Timestamp:** RFC 3161 timestamping required

---

### 4. CFDI 4.0 (Mexico - Comprobante Fiscal Digital)

**Overview:**
CFDI (Comprobante Fiscal Digital por Internet) is Mexico's mandatory e-invoicing system administered by SAT (Servicio de Administración Tributaria). All invoices must be stamped by an authorized PAC (Proveedor Autorizado de Certificación) before they are legally valid.

**CFDI Workflow with PAC Integration:**

\`\`\`mermaid
sequenceDiagram
    participant Supplier as Mexican Supplier
    participant Engine as FTS E-Invoice Engine
    participant PAC as Authorized PAC Provider
    participant SAT as SAT (Tax Authority)
    participant Buyer as Customer
    
    Supplier->>Engine: Create CFDI Invoice
    Engine->>Engine: Generate XML (CFDI 4.0 Schema)
    Engine->>Engine: Calculate Total + Taxes
    Engine->>Engine: Add Unique Folio
    
    Engine->>PAC: Submit for Timbrado (Stamping)
    PAC->>PAC: Validate XML Schema
    PAC->>PAC: Validate Tax Calculations
    PAC->>PAC: Check SAT Blacklists
    
    alt Validation Success
        PAC->>SAT: Register Invoice
        SAT-->>PAC: UUID Assigned
        
        PAC->>PAC: Generate Digital Stamp
        PAC->>PAC: Add Timbrado Fiscal
        PAC->>PAC: Add SAT Certificate Chain
        
        PAC-->>Engine: Stamped CFDI + UUID
        Engine->>Engine: Store Stamped Invoice
        Engine-->>Supplier: CFDI Ready
        
        Supplier->>Buyer: Send Stamped CFDI (XML + PDF)
        Buyer->>SAT: Verify UUID (Optional)
        SAT-->>Buyer: Valid Invoice Confirmed
        
    else Validation Failed
        PAC-->>Engine: Rejection Errors
        Engine-->>Supplier: Fix Required
        Supplier->>Engine: Corrected Invoice
        Engine->>PAC: Resubmit
    end
    
    Note over Supplier,SAT: Invoice is legally valid only after PAC stamping
\`\`\`

**CFDI 4.0 New Requirements (2022+):**

\`\`\`yaml
cfdi_4_enhancements:
  global_invoices:
    purpose: "Consolidate multiple B2C sales"
    use_case: "Retail stores, gas stations"
    periodicity: "Daily, weekly, or monthly"
    requirements:
      - "Summary of total sales"
      - "VAT breakdown by rate"
      - "Payment method totals"
      
  payment_complements:
    cfdi_type: "Pago (Payment Receipt)"
    triggers:
      - "Payment received after invoice"
      - "Partial payments on credit"
      - "Deferred payment terms"
    required_fields:
      - related_invoice_uuid
      - payment_date
      - payment_method
      - exchange_rate_if_foreign
      
  foreign_trade:
    cfdi_type: "Comercio Exterior"
    requirements:
      - customs_information
      - incoterms
      - export_certificate_number
      - destination_country
      
  tax_withholding:
    cfdi_type: "Retenciones e información de pagos"
    use_case: "Services with tax withholding"
    withholding_types:
      - ISR (Income tax)
      - IVA (VAT withholding)
      - IEPS (Special tax)
      
  cancellation:
    method: "Electronic cancellation via SAT"
    customer_consent: "Required if invoice >72 hours old"
    cancellation_uuid: "Generated by SAT"
    time_limit: "Can cancel within fiscal year only"
    
  catalog_compliance:
    product_codes: "SAT product/service catalog mandatory"
    unit_codes: "SAT unit of measure catalog"
    tax_codes: "SAT tax regime codes"
    payment_method_codes: "SAT payment method catalog"
    payment_type_codes: "SAT payment type catalog"
\`\`\`

---

### 5. UBL 2.1 (Universal Business Language)

**Overview:**
UBL 2.1 is the international standard for business documents including invoices, purchase orders, and shipping notices. It's the foundation for Peppol and many national e-invoicing systems.

**UBL 2.1 Document Types:**

| Document Type | UBL Name | Use Case | Relationship |
|---------------|----------|----------|--------------|
| **Invoice** | Invoice | Standard billing document | Standalone or references Order |
| **Credit Note** | CreditNote | Returns, discounts, corrections | References original Invoice |
| **Debit Note** | DebitNote | Additional charges | References original Invoice |
| **Reminder** | Reminder | Payment reminder | References unpaid Invoice |
| **Order** | Order | Purchase order | Precedes Invoice |
| **Despatch Advice** | DespatchAdvice | Shipment notification | Between Order and Invoice |
| **Receipt Advice** | ReceiptAdvice | Goods received | Confirms delivery |
| **Application Response** | ApplicationResponse | Accept/reject invoice | Response to Invoice |

**UBL Invoice Lifecycle:**

\`\`\`mermaid
sequenceDiagram
    participant Buyer
    participant Seller
    participant System as E-Invoice System
    
    Buyer->>Seller: Send Order (UBL Order)
    Seller->>Buyer: Order Response (Accept/Reject)
    
    Seller->>System: Fulfill Order
    System->>Buyer: DespatchAdvice (Shipment)
    
    Buyer->>System: Receive Goods
    System->>Seller: ReceiptAdvice (Confirmed)
    
    Seller->>System: Generate Invoice (UBL Invoice)
    System->>Buyer: Send Invoice
    
    Buyer->>System: Validate Invoice
    System->>Seller: ApplicationResponse (Accepted/Rejected)
    
    alt Invoice Accepted
        Buyer->>Seller: Payment
        Seller->>Buyer: Receipt
    else Invoice Rejected
        Buyer->>Seller: ApplicationResponse (Reasons)
        Seller->>System: Issue Credit Note or Corrected Invoice
        System->>Buyer: Send Correction
    end
\`\`\`

---

### 6. UN/CEFACT Cross Industry Invoice (CII D16B)

**Overview:**
UN/CEFACT CII is an alternative to UBL, designed specifically for cross-industry invoicing. It's more flexible than UBL and used extensively in international trade and supply chain scenarios.

**CII vs UBL Comparison:**

| Aspect | UBL 2.1 | UN/CEFACT CII D16B |
|--------|---------|-------------------|
| **Origin** | OASIS (Standards org) | UN/CEFACT (UN body) |
| **Structure** | Hierarchical XML | Contextual XML |
| **Complexity** | More verbose | More compact |
| **Flexibility** | Fixed schema | Context-driven |
| **Use Cases** | Peppol, government | International trade, supply chain |
| **Adoption** | Higher in EU/APAC | Higher in logistics |
| **Interoperability** | Peppol network | EDI systems, EDIFACT |

---

### 7. Factur-X / ZUGFeRD (France & Germany)

**Overview:**
Factur-X (France) and ZUGFeRD (Germany) are hybrid formats combining a human-readable PDF/A-3 with embedded XML invoice data, enabling both visual and automated processing.

**Hybrid PDF/A-3 + XML Structure:**

\`\`\`mermaid
graph TB
    subgraph "Factur-X Invoice File"
        PDF[PDF/A-3 Document<br/>Human-Readable Invoice]
        XML[Embedded XML<br/>Machine-Readable Data]
    end
    
    subgraph "PDF Layer Benefits"
        H1[Visual Presentation<br/>Print-Ready]
        H2[Archived Format<br/>PDF/A-3 Standard]
        H3[No Software Required<br/>Any PDF Reader]
    end
    
    subgraph "XML Layer Benefits"
        M1[Automated Processing<br/>ERP Integration]
        M2[Data Extraction<br/>No Manual Entry]
        M3[Validation<br/>Schema Compliance]
    end
    
    PDF --> H1
    PDF --> H2
    PDF --> H3
    
    XML --> M1
    XML --> M2
    XML --> M3
    
    PDF -.->|Contains| XML
    
    style PDF fill:#ef4444,color:#fff
    style XML fill:#10b981,color:#fff
\`\`\`

**Factur-X Profiles:**

| Profile | Complexity | Fields | Use Case | XML Standard |
|---------|------------|--------|----------|--------------|
| **MINIMUM** | Lowest | ~20 mandatory | Very simple invoices | CII MINIMUM |
| **BASIC WL** | Low | ~40 mandatory | Small business | CII BASIC |
| **BASIC** | Medium | ~60 mandatory | Standard B2B | CII BASIC |
| **EN 16931** | High | ~100 mandatory | EU cross-border | CII EN16931 |
| **EXTENDED** | Highest | ~150+ optional | Complex scenarios | CII EXTENDED |

---

## System Architecture

### Complete E-Invoicing Platform Architecture

\`\`\`mermaid
graph TB
    subgraph "Invoice Generation Layer"
        GEN1[Template Engine<br/>Multi-Standard Templates]
        GEN2[Data Mapper<br/>Transaction → Invoice]
        GEN3[Tax Calculator<br/>VAT Integration]
        GEN4[QR Code Generator<br/>Country-Specific]
        GEN5[Signature Engine<br/>Digital Certificates]
    end
    
    subgraph "Validation & Compliance Layer"
        VAL1[Schema Validator<br/>XSD Validation]
        VAL2[Business Rules<br/>Country-Specific]
        VAL3[Tax Validation<br/>Amount Verification]
        VAL4[Party Validation<br/>VAT Numbers, LEI]
        VAL5[Format Checker<br/>Field Formats]
    end
    
    subgraph "Government Integration Layer"
        GOV1[Peppol Network<br/>Access Point]
        GOV2[ZATCA API<br/>Clearance/Reporting]
        GOV3[SDI Integration<br/>Italian System]
        GOV4[PAC Provider<br/>Mexican Stamping]
        GOV5[Generic Gateway<br/>Other Countries]
    end
    
    subgraph "Storage & Archival Layer"
        STOR1[Document Database<br/>XML Storage]
        STOR2[PDF Archive<br/>Visual Invoices]
        STOR3[Audit Log<br/>Lifecycle Events]
        STOR4[Version Control<br/>Amendment History]
        STOR5[Long-Term Archive<br/>7-10 Year Retention]
    end
    
    subgraph "Delivery & Communication Layer"
        DEL1[Email Delivery<br/>PDF + XML Attachment]
        DEL2[API Webhook<br/>Customer Systems]
        DEL3[Portal Download<br/>Self-Service Access]
        DEL4[EDI Integration<br/>B2B Networks]
    end
    
    GEN1 --> GEN2
    GEN2 --> GEN3
    GEN3 --> GEN4
    GEN4 --> GEN5
    
    GEN5 --> VAL1
    VAL1 --> VAL2
    VAL2 --> VAL3
    VAL3 --> VAL4
    VAL4 --> VAL5
    
    VAL5 --> GOV1
    VAL5 --> GOV2
    VAL5 --> GOV3
    VAL5 --> GOV4
    VAL5 --> GOV5
    
    GOV1 --> STOR1
    GOV2 --> STOR1
    GOV3 --> STOR1
    GOV4 --> STOR1
    GOV5 --> STOR1
    
    STOR1 --> STOR2
    STOR1 --> STOR3
    STOR1 --> STOR4
    STOR4 --> STOR5
    
    STOR1 --> DEL1
    STOR1 --> DEL2
    STOR1 --> DEL3
    STOR1 --> DEL4
    
    style GEN1 fill:#2563eb,color:#fff
    style VAL1 fill:#f59e0b,color:#fff
    style GOV2 fill:#ef4444,color:#fff
    style STOR1 fill:#10b981,color:#fff
\`\`\`

### Invoice Lifecycle State Machine

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Validating: Submit
    
    Validating --> ValidationFailed: Schema/Rule Error
    Validating --> Validated: All Checks Pass
    
    ValidationFailed --> Draft: Fix Errors
    
    Validated --> Signing: Apply Digital Signature
    Signing --> Signed: Certificate Applied
    
    Signed --> SubmittingToGov: Send to Authority
    
    SubmittingToGov --> GovRejected: Authority Rejection
    SubmittingToGov --> GovAccepted: Authority Acceptance
    SubmittingToGov --> Pending: Awaiting Response
    
    Pending --> GovAccepted: Delayed Acceptance
    Pending --> GovRejected: Delayed Rejection
    
    GovRejected --> Draft: Correct and Resubmit
    GovAccepted --> DeliveredToCustomer: Send Invoice
    
    DeliveredToCustomer --> CustomerAccepted: Customer Accepts
    DeliveredToCustomer --> CustomerRejected: Customer Rejects (5-day window)
    
    CustomerRejected --> Disputed: Dispute Process
    CustomerAccepted --> Finalized: Invoice Final
    
    Finalized --> Paid: Payment Received
    Finalized --> Overdue: Payment Late
    
    Overdue --> Paid: Late Payment
    Overdue --> Reminder: Send Reminder
    Reminder --> Paid: Payment Received
    
    Paid --> Archived: Retention Period
    
    Disputed --> CreditNote: Issue Credit Note
    Disputed --> Cancelled: Cancel Invoice
    
    CreditNote --> Archived: After Resolution
    Cancelled --> Archived: Record Keeping
    
    Archived --> [*]: After 7-10 Years
    
    note right of GovAccepted
        Invoice has government UUID
        Legally valid for tax deduction
        Cannot be modified
    end note
    
    note right of Archived
        Immutable storage
        Regulatory retention (7-10 years)
        Available for audits
    end note
\`\`\`

---

## Invoice Generation Workflows

### Automated Invoice Creation from Transactions

**FTS.Money Trigger Points:**

\`\`\`mermaid
flowchart TD
    A[Transaction Completed] --> B{E-Invoice Settings}
    
    B -->|Auto-Generate Enabled| C[Trigger Invoice Engine]
    B -->|Manual Only| D[Wait for Manual Request]
    
    C --> E{Transaction Type}
    E -->|One-Time Sale| F[Standard Invoice]
    E -->|Subscription Payment| G[Recurring Invoice]
    E -->|Refund| H[Credit Note]
    E -->|Adjustment| I[Debit Note]
    
    F --> J[Gather Invoice Data]
    G --> J
    H --> J
    I --> J
    
    J --> K{Data Complete?}
    K -->|Missing Fields| L[Request Missing Data]
    K -->|Complete| M[Select Standard]
    
    L --> N[Merchant Portal Notification]
    N --> O[Merchant Provides Data]
    O --> M
    
    M --> P{Destination Country}
    P -->|Saudi Arabia| Q[ZATCA Template]
    P -->|Italy| R[FatturaPA Template]
    P -->|Mexico| S[CFDI Template]
    P -->|EU B2G| T[Peppol Template]
    P -->|Other EU| U[UBL 2.1 Template]
    P -->|Global| V[UN/CEFACT CII Template]
    
    Q --> W[Populate Template]
    R --> W
    S --> W
    T --> W
    U --> W
    V --> W
    
    W --> X[Apply VAT/Tax Rules]
    X --> Y[Calculate Totals]
    Y --> Z[Generate Line Items]
    Z --> AA[Add Tax Breakdown]
    
    AA --> AB{QR Code Required?}
    AB -->|Yes| AC[Generate QR Code]
    AB -->|No| AD[Skip QR]
    
    AC --> AE[Create XML Document]
    AD --> AE
    
    AE --> AF[Validate Schema]
    AF --> AG{Valid?}
    
    AG -->|No| AH[Log Errors]
    AG -->|Yes| AI[Sign Document]
    
    AH --> AJ[Alert Merchant]
    AJ --> K
    
    AI --> AK[Store Invoice]
    AK --> AL{Auto-Submit Setting}
    
    AL -->|Yes| AM[Submit to Government]
    AL -->|No| AN[Ready for Manual Submit]
    
    AM --> AO{Submission Result}
    AO -->|Success| AP[Mark as Submitted]
    AO -->|Failed| AQ[Retry Queue]
    
    AP --> AR[Send to Customer]
    AQ --> AS[Alert & Manual Review]
    
    style C fill:#10b981,color:#fff
    style AG fill:#f59e0b,color:#fff
    style AP fill:#10b981,color:#fff
    style AQ fill:#ef4444,color:#fff
\`\`\`

### Multi-Language Invoice Generation

**Language Selection Logic:**

\`\`\`mermaid
flowchart LR
    A[Invoice Request] --> B{Language Determination}
    
    B --> C{Explicit Language Set?}
    C -->|Yes| D[Use Specified Language]
    C -->|No| E{Customer Profile Language?}
    
    E -->|Yes| F[Use Customer Language]
    E -->|No| G{Destination Country}
    
    G -->|Saudi Arabia| H[Arabic Primary<br/>English Secondary]
    G -->|Italy| I[Italian]
    G -->|Mexico| J[Spanish]
    G -->|France| K[French]
    G -->|Germany| L[German]
    G -->|Other| M[English Default]
    
    D --> N[Load Language Template]
    F --> N
    H --> N
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Translate Fields]
    O --> P{RTL Language?}
    P -->|Yes Arabic/Hebrew| Q[Apply RTL Layout]
    P -->|No| R[Standard LTR Layout]
    
    Q --> S[Generate Invoice]
    R --> S
    
    style H fill:#10b981,color:#fff
    style Q fill:#8b5cf6,color:#fff
\`\`\`

**Supported Languages (20+):**

\`\`\`yaml
supported_languages:
  european:
    - code: en, name: English, direction: LTR
    - code: de, name: German, direction: LTR
    - code: fr, name: French, direction: LTR
    - code: es, name: Spanish, direction: LTR
    - code: it, name: Italian, direction: LTR
    - code: nl, name: Dutch, direction: LTR
    - code: pl, name: Polish, direction: LTR
    - code: pt, name: Portuguese, direction: LTR
    
  middle_eastern:
    - code: ar, name: Arabic, direction: RTL
    - code: he, name: Hebrew, direction: RTL
    - code: tr, name: Turkish, direction: LTR
    - code: fa, name: Persian, direction: RTL
    
  asian:
    - code: zh, name: Chinese, direction: LTR
    - code: ja, name: Japanese, direction: LTR
    - code: ko, name: Korean, direction: LTR
    - code: th, name: Thai, direction: LTR
    - code: vi, name: Vietnamese, direction: LTR
    - code: id, name: Indonesian, direction: LTR
    
  other:
    - code: ru, name: Russian, direction: LTR
    - code: hi, name: Hindi, direction: LTR
\`\`\`

---

## QR Code Generation

### Country-Specific QR Code Requirements

**ZATCA (Saudi Arabia) QR Code:**

\`\`\`javascript
// Generate ZATCA-compliant QR code
function generateZATCAQRCode(invoice) {
  // TLV (Tag-Length-Value) encoding
  const fields = [
    { tag: 1, value: invoice.seller_name },
    { tag: 2, value: invoice.vat_number },
    { tag: 3, value: invoice.timestamp },
    { tag: 4, value: invoice.total_with_vat.toFixed(2) },
    { tag: 5, value: invoice.vat_amount.toFixed(2) },
    { tag: 6, value: invoice.invoice_hash },
    { tag: 7, value: invoice.ecdsa_signature },
    { tag: 8, value: invoice.public_key },
    { tag: 9, value: invoice.crypto_stamp }
  ];
  
  // Encode to TLV
  let tlv = Buffer.alloc(0);
  for (const field of fields) {
    const tagByte = Buffer.from([field.tag]);
    const valueBuffer = Buffer.from(field.value, 'utf-8');
    const lengthByte = Buffer.from([valueBuffer.length]);
    tlv = Buffer.concat([tlv, tagByte, lengthByte, valueBuffer]);
  }
  
  // Base64 encode
  const base64 = tlv.toString('base64');
  
  // Generate QR code image
  const qrCode = QRCode.toDataURL(base64, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 1
  });
  
  return qrCode;
}
\`\`\`

**European Payment QR Code (EPC QR):**

\`\`\`javascript
// Generate EPC (European Payments Council) QR code
function generateEPCQRCode(invoice) {
  const epcString = [
    'BCD',                              // Service tag
    '002',                              // Version
    '1',                                // Character set (UTF-8)
    'SCT',                              // Identification (SEPA Credit Transfer)
    invoice.payee_bic || '',           // BIC (optional if IBAN only)
    invoice.payee_name,                // Beneficiary name
    invoice.payee_iban,                // IBAN
    'EUR' + invoice.total_amount,      // Amount (EUR prefix)
    '',                                 // Purpose (optional)
    invoice.structured_reference || '', // Structured reference
    invoice.remittance_info || '',     // Unstructured remittance
    ''                                  // Beneficiary to originator info
  ].join('\n');
  
  return QRCode.toDataURL(epcString, {
    errorCorrectionLevel: 'M',
    width: 300
  });
}
\`\`\`

**Swiss QR Bill:**

\`\`\`javascript
// Generate Swiss QR-Bill
function generateSwissQRBill(invoice) {
  const qrData = [
    'SPC',                              // QR type
    '0200',                             // Version
    '1',                                // Coding type (UTF-8)
    invoice.iban,                       // IBAN
    'K',                                // Creditor address type
    invoice.creditor_name,              
    invoice.creditor_street,            
    invoice.creditor_building || '',    
    invoice.creditor_postal_code,       
    invoice.creditor_city,              
    'CH',                               // Country
    '',                                 // Ultimate creditor (usually empty)
    '',                                 
    '',                                 
    '',                                 
    '',                                 
    '',                                 
    '',                                 
    invoice.amount.toFixed(2),          // Amount
    'CHF',                              // Currency
    'K',                                // Debtor address type (if known)
    invoice.debtor_name || '',          
    invoice.debtor_street || '',        
    invoice.debtor_building || '',      
    invoice.debtor_postal_code || '',   
    invoice.debtor_city || '',          
    invoice.debtor_country || '',       
    'QRR',                              // Reference type (QR Reference)
    invoice.qr_reference,               // 27-digit reference
    invoice.additional_info || '',      // Unstructured message
    'EPD',                              // Trailer
    ''                                  
  ].join('\r\n');
  
  return QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'M',
    width: 300
  });
}
\`\`\`

---

## Cryptographic Signing

### Digital Signature Standards

**Signature Algorithms by Country:**

| Country | Standard | Algorithm | Hash | Certificate Authority |
|---------|----------|-----------|------|----------------------|
| **Saudi Arabia** | ECDSA | secp256k1 | SHA-256 | ZATCA-approved CA |
| **Italy** | XAdES-BES | RSA 2048+ | SHA-256 | AgID-qualified CA |
| **Mexico** | SAT Sello | RSA 2048+ | SHA-256 | SAT-authorized PAC |
| **EU (Peppol)** | XAdES-BES | RSA 2048+ | SHA-256 | Qualified CA |
| **France** | PAdES | RSA 2048+ | SHA-256 | ANSSI-qualified |
| **Germany** | XAdES | RSA 2048+ | SHA-256 | BSI-approved |

### XML Signature Implementation

\`\`\`javascript
// XML Digital Signature (XMLDSig) Implementation
const { SignedXml } = require('xml-crypto');
const fs = require('fs');

async function signInvoiceXML(invoiceXML, certificatePath, privateKeyPath) {
  // Load certificate and private key
  const certificate = fs.readFileSync(certificatePath);
  const privateKey = fs.readFileSync(privateKeyPath);
  
  // Create signature object
  const sig = new SignedXml();
  
  // Set signing algorithm
  sig.signatureAlgorithm = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';
  sig.keyInfoProvider = {
    getKeyInfo: () => {
      return \`<X509Data><X509Certificate>\${certificate.toString('base64')}</X509Certificate></X509Data>\`;
    }
  };
  
  // Add reference to sign entire document
  sig.addReference(
    "//*[local-name()='Invoice']",
    [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#'
    ],
    'http://www.w3.org/2001/04/xmlenc#sha256'
  );
  
  // Compute signature
  sig.computeSignature(invoiceXML, {
    privateKey: privateKey,
    prefix: 'ds',
    location: { reference: "//*[local-name()='Invoice']", action: 'append' }
  });
  
  // Get signed XML
  const signedXML = sig.getSignedXml();
  
  // Calculate invoice hash for QR code
  const hash = crypto.createHash('sha256').update(signedXML).digest('base64');
  
  return {
    signedXML: signedXML,
    invoiceHash: hash,
    signature: sig.getSignature(),
    timestamp: new Date().toISOString()
  };
}
\`\`\`

---

## Government Gateway Integration

### Peppol Network Integration

**Peppol 4-Corner Model:**

\`\`\`mermaid
sequenceDiagram
    participant S as Seller
    participant C1 as Corner 1<br/>Seller's Access Point
    participant SML as SML<br/>Service Metadata Locator
    participant SMP as SMP<br/>Service Metadata Publisher
    participant C3 as Corner 3<br/>Buyer's Access Point
    participant B as Buyer
    
    Note over S,B: Discovery Phase
    S->>C1: Send Invoice to Buyer Endpoint
    C1->>SML: Query Buyer's SMP
    SML-->>C1: SMP Address
    C1->>SMP: Query Buyer's Capabilities
    SMP-->>C1: Access Point URL + Supported Doc Types
    
    Note over S,B: Transmission Phase
    C1->>C1: Prepare SBDH Envelope
    C1->>C1: Sign with Access Point Certificate
    C1->>C3: Send Invoice (AS4 Protocol)
    
    C3->>C3: Verify Signature
    C3->>C3: Validate Invoice
    C3->>C3: Check Endpoint Authorization
    
    alt Validation Success
        C3-->>C1: MDN (Message Disposition Notification)
        C3->>B: Deliver Invoice
        B-->>C3: Accept/Reject
        C3->>C1: Application Response
        C1->>S: Final Status
    else Validation Failed
        C3-->>C1: Error Message
        C1->>S: Delivery Failed
    end
\`\`\`

**Peppol Access Point Requirements:**

\`\`\`yaml
access_point_certification:
  legal_requirements:
    - "Legal entity registration"
    - "OpenPeppol membership (€500/year)"
    - "Access Point Agreement signed"
    - "PKI certificates from trust authority"
    
  technical_requirements:
    - "AS4 profile implementation"
    - "SMP (Service Metadata Publisher) hosting"
    - "99.5% uptime guarantee"
    - "Secure message transmission (TLS 1.2+)"
    - "Message integrity validation"
    - "Non-repudiation support"
    
  operational_requirements:
    - "Service Level Agreement compliance"
    - "Incident response procedures"
    - "24/7 monitoring"
    - "Regular testing participation"
    - "Peppol community involvement"
    
  fts_money_status:
    certified: true
    member_since: "2024"
    participant_id: "9914:fts-money-peppol-ap"
    smp_url: "https://smp.peppol.fts.money"
    supported_document_types:
      - "Invoice (BIS Billing 3.0)"
      - "Credit Note (BIS Billing 3.0)"
      - "Order (BIS Ordering 3.0)"
      - "Catalogue (BIS Catalogue 3.0)"
\`\`\`

### ZATCA API Integration (Saudi Arabia)

**ZATCA Platform Endpoints:**

\`\`\`yaml
zatca_api:
  base_url:
    sandbox: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal"
    production: "https://gw-fatoora.zatca.gov.sa/e-invoicing/core"
    
  onboarding:
    endpoint: "/compliance"
    method: POST
    purpose: "Onboard EGS (E-Invoicing Generation Solution)"
    request:
      - csr_file: "Certificate Signing Request"
      - otp: "One-time password from ZATCA portal"
    response:
      - certificate: "X.509 certificate"
      - secret: "API authentication secret"
      - crypto_stamp: "Unique EGS identifier"
      
  clearance_api:
    endpoint: "/invoices/clearance/single"
    method: POST
    purpose: "Clear standard tax invoices (B2B)"
    headers:
      - "Accept-Version: V2"
      - "Authorization: Bearer {token}"
      - "Content-Type: application/json"
    request:
      - invoice_hash: "Base64 SHA-256"
      - uuid: "Unique invoice identifier"
      - invoice: "Base64-encoded signed XML"
    response:
      - clearance_status: "CLEARED / REJECTED"
      - cleared_invoice: "Invoice with ZATCA stamp"
      - warnings: "Non-critical issues"
      - errors: "Rejection reasons (if rejected)"
      
  reporting_api:
    endpoint: "/invoices/reporting/single"
    method: POST
    purpose: "Report simplified invoices (B2C)"
    headers: "Same as clearance"
    request: "Same structure as clearance"
    response:
      - reported_invoice: "Confirmation of reporting"
      - warnings: "Non-critical issues"
      
  compliance_check:
    endpoint: "/compliance/invoices"
    method: POST
    purpose: "Test invoice before production"
    environment: "Sandbox only"
    
  invoice_hash_algorithm:
    steps:
      1: "Canonicalize XML (C14N)"
      2: "Remove UBL signature element"
      3: "Calculate SHA-256 hash"
      4: "Encode to Base64"
    example: "VGhpcyBpcyBhIHNhbXBsZSBoYXNo"
\`\`\`

**ZATCA Error Codes & Resolution:**

| Error Code | Description | Cause | Resolution |
|------------|-------------|-------|------------|
| **INVALID_SIGNATURE** | Digital signature verification failed | Incorrect certificate or signing | Verify certificate from ZATCA, re-sign with correct private key |
| **INVALID_HASH** | Invoice hash doesn't match | Hash calculation error | Ensure correct canonicalization, recalculate hash |
| **INVALID_VAT_CALCULATION** | VAT amount incorrect | Math error in tax calculation | Verify VAT rate, recalculate line totals |
| **MISSING_QR_CODE** | QR code field missing | QR not embedded in XML | Generate TLV QR code, add to invoice |
| **INVALID_VAT_NUMBER** | Supplier VAT invalid | Unregistered VAT number | Verify VAT registration with ZATCA |
| **DUPLICATE_UUID** | Invoice UUID already used | UUID collision | Generate new unique UUID |
| **INVALID_TIMESTAMP** | Timestamp format wrong | Not ISO 8601 | Use YYYY-MM-DDTHH:mm:ssZ format |

### SDI Integration (Italy)

**FatturaPA Submission via SDI:**

\`\`\`mermaid
sequenceDiagram
    participant Seller as Italian Supplier
    participant FTS as FTS E-Invoice Engine
    participant SDI as Sistema di Interscambio
    participant PEC as Buyer's PEC Email
    participant Buyer as Italian Buyer
    
    Seller->>FTS: Create FatturaPA Invoice
    FTS->>FTS: Generate XML (FatturaPA 1.7)
    FTS->>FTS: Sign with Qualified Certificate
    FTS->>FTS: Name File: IT12345678901_00001.xml
    
    FTS->>SDI: Submit via PEC or Web Service
    Note over SDI: Email: sdi01@pec.fatturapa.it
    
    SDI->>SDI: Receive and Queue
    SDI->>Seller: Ricevuta di Consegna (5 seconds)
    Note over Seller: File received confirmation
    
    SDI->>SDI: Validate XML Schema
    SDI->>SDI: Validate Digital Signature
    SDI->>SDI: Validate VAT Numbers
    SDI->>SDI: Validate Recipient Code
    
    alt Validation Failed
        SDI->>Seller: Notifica di Scarto (within 5 days)
        Note over Seller: Invoice rejected, fix and resubmit
    else Validation Passed
        SDI->>Seller: Notifica di Mancata Consegna OR Esito
        SDI->>PEC: Forward to Recipient PEC
        PEC->>Buyer: Invoice Delivered
        
        alt Buyer Accepts (within 15 days)
            Buyer->>SDI: Notifica di Accettazione
            SDI->>Seller: Invoice Accepted
        else Buyer Rejects
            Buyer->>SDI: Notifica di Rifiuto
            SDI->>Seller: Invoice Rejected by Buyer
        else No Response (15 days)
            SDI->>Seller: Decorrenza Termini (deemed accepted)
        end
    end
\`\`\`

**SDI Technical Specifications:**

\`\`\`yaml
sdi_integration:
  submission_methods:
    pec_email:
      address: "sdi01@pec.fatturapa.it"
      format: "XML attachment"
      filename: "{CountryCode}{VATNumber}_{ProgressiveNumber}.xml"
      example: "IT12345678901_00001.xml.p7m"
      signature: "P7M envelope (CAdES)"
      
    web_service:
      protocol: "SOAP over HTTPS"
      endpoint: "https://ivaservizi.agenziaentrate.gov.it/ser/fatturapa/services/ricezione"
      authentication: "X.509 client certificate"
      method: "RicezioneFatture"
      
    sftp:
      available: true
      authentication: "SSH key"
      directory_structure: "Organized by VAT number"
      
  file_size_limits:
    single_invoice: "5 MB"
    batch_submission: "Up to 200 invoices per file"
    
  response_types:
    ricevuta_consegna:
      code: "RC"
      meaning: "Delivery receipt - file received"
      timeframe: "Within 5 seconds"
      
    notifica_scarto:
      code: "NS"
      meaning: "Rejection - validation failed"
      timeframe: "Within 5 days"
      error_codes: "00200-00499 range"
      
    notifica_mancata_consegna:
      code: "MC"
      meaning: "Delivery failed to recipient"
      reason: "Invalid recipient code, PEC not active"
      
    notifica_esito:
      code: "NE"
      meaning: "Successful delivery confirmation"
      
    notifica_accettazione:
      code: "AT"
      meaning: "Buyer explicitly accepted"
      timeframe: "Within 15 days"
      
    notifica_rifiuto:
      code: "DT"
      meaning: "Buyer explicitly rejected"
      timeframe: "Within 15 days"
      reason: "Buyer provides rejection reason"
      
    decorrenza_termini:
      code: "DT"
      meaning: "Deemed accepted (no response after 15 days)"
\`\`\`

### PAC Integration (Mexico)

**Authorized PAC Providers:**

FTS.Money integrates with multiple authorized PACs for redundancy:

\`\`\`yaml
pac_providers:
  primary:
    name: "Finkok"
    endpoint: "https://facturacion.finkok.com/servicios/soap/stamp.wsdl"
    uptime: "99.9%"
    cost: "$0.15 per stamp"
    
  backup_1:
    name: "SW Sapien"
    endpoint: "https://services.sw.com.mx/services/stamp"
    uptime: "99.8%"
    cost: "$0.18 per stamp"
    
  backup_2:
    name: "Ecodex"
    endpoint: "https://app1.ecodex.com.mx:2045/ServicioTimbrado.svc"
    uptime: "99.7%"
    cost: "$0.20 per stamp"
    
pac_workflow:
  step_1_generate_cfdi:
    format: "CFDI 4.0 XML"
    requirements:
      - "RFC (Tax ID) of supplier and customer"
      - "SAT product/service catalog codes"
      - "Tax regime code"
      - "Payment method code"
      - "Payment type code"
      
  step_2_original_string:
    purpose: "Create signature base string"
    format: "Concatenation of key fields"
    separator: "|"
    fields:
      - version
      - series
      - folio
      - date
      - rfc_seller
      - rfc_buyer
      - total
      - currency
      
  step_3_seal_calculation:
    algorithm: "RSA SHA-256"
    input: "Original string from step 2"
    key: "Supplier's private key (CSD - Certificate of Digital Seal)"
    output: "Base64-encoded signature"
    
  step_4_pac_stamping:
    request:
      - cfdi_xml: "Unsigned CFDI"
      - username: "PAC credentials"
      - password: "PAC credentials"
    
    pac_validation:
      - xml_schema_compliance
      - fiscal_folio_uniqueness
      - tax_calculation_accuracy
      - catalog_code_validity
      - rfc_format_check
      
    pac_response:
      - uuid: "SAT-assigned unique ID (36 chars)"
      - stamp_date: "Timbrado timestamp"
      - sat_certificate: "SAT's certificate number"
      - sat_seal: "SAT's digital seal"
      - cfdi_timbrado: "Stamped CFDI XML"
      
  step_5_storage:
    requirement: "Store stamped CFDI for 5 years"
    format: "Original XML + PDF representation"
    audit: "Must be available for SAT audit"
\`\`\`

**CFDI Cancellation Process:**

\`\`\`mermaid
flowchart TD
    A[Cancellation Request] --> B{Invoice Age}
    B -->|< 72 hours| C[Direct Cancellation]
    B -->|> 72 hours| D[Request Customer Consent]
    
    C --> E[Submit to PAC]
    E --> F[PAC Validates]
    F --> G[SAT Cancels UUID]
    G --> H[Cancellation UUID Generated]
    H --> I[Invoice Cancelled]
    
    D --> J{Customer Response}
    J -->|Consent Granted| E
    J -->|Consent Denied| K[Cannot Cancel]
    J -->|No Response 72h| L[Auto-Reject]
    
    K --> M[Dispute Resolution or Credit Note]
    L --> M
    
    I --> N[Update Records]
    N --> O[Notify Customer]
    
    style I fill:#10b981,color:#fff
    style K fill:#ef4444,color:#fff
\`\`\`

---

## Pricing & Business Model

### E-Invoicing Service Pricing

\`\`\`yaml
pricing_structure:
  subscription_tiers:
    included_in_psp:
      - tier: "PSP Professional"
        monthly_fee: "$999"
        invoices_included: "500/month"
        standards: "All supported"
        
      - tier: "PSP Enterprise"
        monthly_fee: "$4,999"
        invoices_included: "Unlimited"
        standards: "All supported"
        
    standalone_service:
      - tier: "Basic"
        monthly_fee: "$199"
        invoices_included: "100/month"
        standards: "UBL, Peppol only"
        
      - tier: "Professional"
        monthly_fee: "$499"
        invoices_included: "1,000/month"
        standards: "All standards"
        
      - tier: "Enterprise"
        monthly_fee: "$1,999"
        invoices_included: "Unlimited"
        standards: "All + custom integration"
        
  usage_fees:
    per_invoice_generation: "$0.15"
    per_government_submission: "$0.10"
    per_qr_code: "$0.02"
    per_signature: "$0.05"
    
    pac_stamping_mexico:
      cost: "$0.15-$0.20"
      passthrough: "Billed at cost + 10%"
      
    peppol_transmission:
      cost: "$0.05"
      included: true
      
  storage_fees:
    first_year: "Included"
    years_2_7: "$0.01 per invoice/year"
    years_8_10: "$0.02 per invoice/year"
    retrieval: "Free (API or portal download)"
    
  professional_services:
    custom_template_design: "$1,000-$5,000"
    government_registration: "$500-$2,000"
    compliance_consultation: "$200/hour"
    integration_support: "$150/hour"
\`\`\`

### Cost-Benefit Analysis for PSPs

**Traditional Approach:**

\`\`\`
Building In-House E-Invoicing:
  Development (6 months):
    - 2 Backend engineers × 6 months × $10K = $120K
    - 1 Frontend engineer × 6 months × $10K = $60K
    - 1 Compliance specialist × 6 months × $8K = $48K
  
  Infrastructure:
    - Government gateway integrations: $50K
    - Digital certificate procurement: $5K
    - Testing and certification: $20K
  
  Ongoing (annual):
    - Maintenance & updates: $80K
    - Certificate renewals: $5K
    - Compliance monitoring: $40K
    - Standard updates: $30K
  
  Total First Year: $458K
  Annual Ongoing: $155K

Using FTS.Money E-Invoicing:
  Setup:
    - Enable service in PSP portal: $0
    - Configuration: 1 hour staff time
  
  Monthly Cost (Professional PSP tier):
    - Included in $999/month PSP subscription
    - No additional fee
  
  Usage Fees:
    - 1,000 invoices/month × $0.15 = $150/month
    - Government submissions included
  
  Total First Year: $13,800 (subscription + usage)
  Savings: $444K (97% cost reduction)
\`\`\`

---

## Operational Procedures

### Daily Operations Checklist

\`\`\`markdown
E-Invoicing Operations - Daily Checklist

□ Morning Health Check (9:00 AM):
  □ Verify government gateway connectivity (Peppol, ZATCA, SDI, PAC)
  □ Check overnight invoice submissions for errors
  □ Review pending clearance requests (ZATCA, Mexico)
  □ Verify digital certificates are valid (not expired)
  
□ Ongoing Monitoring:
  □ Monitor invoice generation queue
  □ Review validation failures and error logs
  □ Check retry queue for failed submissions
  □ Respond to merchant support tickets
  
□ Compliance Monitoring:
  □ Verify tax calculation accuracy (random sampling)
  □ Check for regulatory updates (government announcements)
  □ Review rejection rate by standard (<2% target)
  □ Monitor invoice archival process
  
□ End of Day (6:00 PM):
  □ Generate daily invoice statistics
  □ Review key metrics vs targets
  □ Prepare rejected invoice summary for merchants
  □ Update status dashboard
\`\`\`

### Monthly Compliance Tasks

\`\`\`yaml
monthly_tasks:
  certificate_management:
    - "Check certificate expiry dates (alert 60 days before)"
    - "Renew expiring certificates"
    - "Test new certificates in sandbox"
    - "Update production systems"
    
  standard_updates:
    - "Monitor Peppol BIS release notes"
    - "Check ZATCA portal for announcements"
    - "Review SDI technical bulletins"
    - "Update schema validators if needed"
    
  performance_review:
    metrics_to_review:
      - total_invoices_generated
      - submission_success_rate
      - average_processing_time
      - rejection_rate_by_country
      - storage_usage_growth
      
  merchant_communication:
    - "Send monthly e-invoicing statistics"
    - "Notify of upcoming standard changes"
    - "Share best practices and tips"
    - "Announce new country support"
\`\`\`

---

## Best Practices & Compliance

### For PSP Operators

**1. Sandbox Testing:**

Always test in government sandbox environments before production:

\`\`\`yaml
sandbox_environments:
  peppol:
    network: "Peppol TEST network"
    sml: "http://test-sml.peppolcentral.org"
    participant_id: "Different from production"
    
  zatca:
    url: "https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal"
    certificate: "Separate test certificate"
    crypto_stamp: "Test EGS identifier"
    
  sdi_italy:
    pec: "sditest@pec.fatturapa.it"
    validation: "Full validation, no legal effect"
    
  mexico_pac:
    provider_specific: true
    finkok_test: "http://demo-facturacion.finkok.com/servicios/soap/stamp.wsdl"
\`\`\`

**2. Certificate Management:**

\`\`\`mermaid
gantt
    title Digital Certificate Lifecycle
    dateFormat YYYY-MM-DD
    
    section Certificate Procurement
    Request from CA               :done, req, 2025-01-01, 7d
    CA Verification              :done, ver, 2025-01-08, 5d
    Certificate Issued           :done, iss, 2025-01-13, 1d
    
    section Production Use
    Deploy to Production         :done, prod, 2025-01-14, 1d
    Active Period                :active, use, 2025-01-15, 365d
    
    section Renewal Process
    60-Day Alert                 :crit, alert1, 2026-11-15, 1d
    30-Day Alert                 :crit, alert2, 2026-12-15, 1d
    Request Renewal              :renew, 2026-12-20, 5d
    New Certificate Issued       :newcert, 2026-12-25, 1d
    Deploy New Certificate       :deploy, 2026-12-26, 1d
    Old Certificate Grace Period :grace, 2026-12-27, 7d
    Revoke Old Certificate       :revoke, 2027-01-03, 1d
\`\`\`

**3. Error Handling & Retry Logic:**

\`\`\`javascript
// Intelligent retry logic for failed submissions
async function submitInvoiceWithRetry(invoice, standard, maxRetries = 3) {
  let attempt = 0;
  let lastError = null;
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      
      // Attempt submission
      const result = await submitToGovernmentGateway(invoice, standard);
      
      // Success
      await updateInvoiceStatus(invoice.id, 'submitted', {
        government_uuid: result.uuid,
        submission_timestamp: new Date(),
        attempt_number: attempt
      });
      
      return result;
      
    } catch (error) {
      lastError = error;
      
      // Categorize error
      if (error.code === 'INVALID_SIGNATURE') {
        // Don't retry signature errors - fix required
        throw new Error('Invalid signature - manual fix required');
      }
      
      if (error.code === 'NETWORK_TIMEOUT') {
        // Retry with exponential backoff
        const backoff = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await sleep(backoff);
        continue;
      }
      
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        // Wait for rate limit window
        await sleep(60000); // Wait 1 minute
        continue;
      }
      
      if (error.code === 'GATEWAY_UNAVAILABLE') {
        // Government system down - wait longer
        await sleep(300000); // Wait 5 minutes
        continue;
      }
      
      // Other errors - don't retry
      throw error;
    }
  }
  
  // All retries exhausted
  await updateInvoiceStatus(invoice.id, 'submission_failed', {
    error: lastError.message,
    attempts: attempt,
    last_attempt: new Date()
  });
  
  // Add to manual review queue
  await addToManualReviewQueue(invoice.id, lastError);
  
  throw new Error(\`Submission failed after \${maxRetries} attempts: \${lastError.message}\`);
}
\`\`\`

---

## Integration with FTS.Money Services

### VAT Integration

E-invoicing is tightly integrated with the VAT/Tax Management system:

\`\`\`mermaid
flowchart LR
    A[Transaction] --> B[VAT Engine]
    B --> C[Calculate Tax]
    C --> D[Tax Breakdown]
    
    D --> E[E-Invoice Engine]
    E --> F[Map to Standard]
    
    F --> G{Invoice Standard}
    G -->|Peppol| H[cac:TaxTotal Element]
    G -->|ZATCA| I[cac:TaxTotal + QR]
    G -->|FatturaPA| J[DatiRiepilogo Element]
    G -->|CFDI| K[cfdi:Impuestos Element]
    
    H --> L[Include in Invoice XML]
    I --> L
    J --> L
    K --> L
    
    D --> M[Tax Calculation Log]
    M --> N[Audit Trail]
    
    L --> O[Complete Invoice]
    O --> P[Validation]
    P --> Q[Submission]
    
    style B fill:#06b6d4,color:#fff
    style E fill:#2563eb,color:#fff
    style Q fill:#10b981,color:#fff
\`\`\`

### Payment Processing Integration

\`\`\`javascript
// Automatic invoice generation after successful payment
async function processPaymentWithAutoInvoicing(paymentData) {
  // 1. Process payment
  const payment = await fts.payments.create({
    amount: paymentData.amount,
    currency: paymentData.currency,
    merchant_id: paymentData.merchant_id,
    customer: paymentData.customer
  });
  
  if (payment.status !== 'succeeded') {
    throw new Error('Payment failed');
  }
  
  // 2. Calculate VAT
  const vatCalculation = await fts.tax.calculate({
    amount: paymentData.amount,
    customer_country: paymentData.customer.country,
    merchant_country: payment.merchant_country,
    service_type: paymentData.service_type,
    customer_vat_number: paymentData.customer.vat_number
  });
  
  // 3. Generate e-invoice
  const invoice = await fts.eInvoicing.generate({
    payment_id: payment.id,
    standard: selectStandard(paymentData.customer.country),
    language: paymentData.customer.language || 'en',
    vat_details: vatCalculation,
    auto_submit: true
  });
  
  // 4. Submit to government gateway (if auto_submit)
  if (invoice.requires_clearance) {
    const submission = await submitForClearance(invoice);
    
    // Wait for government approval
    if (submission.status === 'cleared') {
      // Send cleared invoice to customer
      await sendInvoiceToCustomer(invoice.id, submission.cleared_invoice_url);
    }
  } else {
    // Direct send (no clearance needed)
    await sendInvoiceToCustomer(invoice.id, invoice.invoice_url);
  }
  
  return {
    payment: payment,
    vat: vatCalculation,
    invoice: invoice,
    sent: true
  };
}
\`\`\`

---

## Compliance & Best Practices

### Regulatory Retention Requirements

| Country/Region | Retention Period | Storage Format | Accessibility |
|----------------|------------------|----------------|---------------|
| **European Union** | 7-10 years | Original XML + PDF | Must be retrievable within 24h |
| **Saudi Arabia** | 6 years | Signed XML + QR | Must be available for ZATCA audit |
| **Italy** | 10 years | Signed XML (P7M) | Must preserve digital signature |
| **Mexico** | 5 years | Stamped CFDI XML | Must include PAC stamp and UUID |
| **United Kingdom** | 6 years | XML or PDF | HMRC-acceptable format |
| **United States** | 7 years | Any readable format | IRS-accessible |

### Audit Trail Requirements

\`\`\`sql
-- E-Invoice audit log schema
CREATE TABLE einvoice_audit_log (
  id UUID PRIMARY KEY,
  invoice_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_timestamp TIMESTAMP NOT NULL,
  actor_id VARCHAR(100),
  actor_type VARCHAR(50), -- 'user', 'system', 'government'
  event_data JSONB,
  before_state JSONB,
  after_state JSONB,
  ip_address INET,
  user_agent TEXT,
  government_response JSONB,
  
  CONSTRAINT fk_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);

-- Example audit events
INSERT INTO einvoice_audit_log (event_type, event_data) VALUES
('invoice_created', '{"template": "peppol_bis_3", "auto_submit": true}'),
('schema_validated', '{"validator": "peppol", "result": "pass"}'),
('digitally_signed', '{"algorithm": "RSA-SHA256", "certificate": "CN=..."}'),
('submitted_to_government', '{"gateway": "peppol_ap", "endpoint_id": "9914:..."}'),
('government_acceptance', '{"status": "accepted", "uuid": "..."}'),
('delivered_to_customer', '{"method": "email", "recipient": "buyer@example.com"}'),
('customer_opened', '{"timestamp": "2026-01-05T15:30:00Z", "ip": "192.168.1.1"}'),
('payment_received', '{"amount": 1150.00, "method": "bank_transfer"}'),
('archived', '{"retention_period": "10 years", "storage_location": "s3://..."}');
\`\`\`

---

## Conclusion

The FTS.Money E-Invoicing System provides comprehensive, multi-standard electronic invoicing capabilities enabling Payment Service Providers and enterprises to comply with global e-invoicing mandates without building complex infrastructure in-house.

**Key Benefits:**
1. **Multi-Standard Support** - 8+ formats covering 50+ countries
2. **Automated Compliance** - Government gateway integration with real-time validation
3. **Cryptographic Security** - Digital signatures and non-repudiation
4. **Complete Lifecycle** - Generation, validation, submission, delivery, archival
5. **Seamless Integration** - Works with VAT/Tax and Payment Processing services
6. **White-Label Ready** - Fully brandable for PSP customer use

**Quick Start:**
- **For PSPs:** Enable from Service Marketplace or included in Professional/Enterprise tiers
- **Standalone:** Subscribe at $199-$1,999/month based on volume
- **Documentation:** https://docs.fts.money/einvoicing
- **Support:** einvoicing-support@fts.money

---

*Document Version: 2.0 | Last Updated: 2026-01-05*  
*Classification: Public - Technical Documentation*  
*Word Count: ~5,200 words*

© 2026 FTS.Money. All rights reserved.
`;

export default EInvoicingSystemDoc;