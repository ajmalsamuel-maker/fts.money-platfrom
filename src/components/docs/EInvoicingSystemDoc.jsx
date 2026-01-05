import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const EInvoicingSystemDoc = `# E-Invoicing System

## Executive Summary

The FTS.Money E-Invoicing System enables PSPs and merchants to generate, validate, and submit electronic invoices compliant with global standards including **Peppol BIS Billing 3.0**, **ZATCA (Saudi Arabia)**, **FatturaPA (Italy)**, **CFDI (Mexico)**, **UBL 2.1**, and **UN/CEFACT CII D16B**.

### Key Features
- ✅ **Multi-Standard Support** - 8+ international e-invoicing formats
- ✅ **Automated Generation** - Convert transactions to compliant e-invoices
- ✅ **Real-time Validation** - Schema validation before submission
- ✅ **Government Gateway Integration** - Direct submission to tax authorities
- ✅ **QR Code Generation** - Embedded payment/verification QR codes
- ✅ **Multi-Language** - Invoice generation in 20+ languages
- ✅ **Audit Trail** - Complete e-invoice lifecycle tracking

---

## Supported E-Invoicing Standards

### Standards Overview

| Standard | Region | Format | Mandate Status | Use Cases |
|----------|--------|--------|----------------|-----------|
| **Peppol BIS Billing 3.0** | EU, Global | UBL 2.1 XML | Mandatory (EU Public Sector) | Cross-border B2B, B2G |
| **ZATCA (Fatoora)** | Saudi Arabia | UBL 2.1 XML | Mandatory (All businesses) | KSA domestic invoicing |
| **FatturaPA** | Italy | XML (FatturaPA) | Mandatory (All B2B/B2G) | Italian domestic invoicing |
| **CFDI 4.0** | Mexico | XML (CFDI) | Mandatory (All businesses) | Mexican invoicing & tax |
| **UN/CEFACT CII D16B** | Global | XML | Voluntary | International trade |
| **UBL 2.1** | Global | XML | Voluntary | Generic B2B invoicing |
| **Factur-X** | France, Germany | PDF/A-3 + XML | Voluntary | Hybrid paper/digital |
| **PINT (A-NZ)** | Asia-Pacific | UBL 2.1/CII | Emerging | APAC cross-border |

---

## System Architecture

### E-Invoicing Engine Flow
\`\`\`mermaid
graph TB
    A[Transaction Completed] --> B{E-Invoice Enabled?}
    B -->|No| C[Standard Invoice]
    B -->|Yes| D[E-Invoice Generator]
    
    D --> E[Select Standard]
    E --> F{Standard Type}
    
    F -->|Peppol| G[Peppol BIS 3.0 Template]
    F -->|ZATCA| H[ZATCA Phase 2 Template]
    F -->|FatturaPA| I[FatturaPA 1.7 Template]
    F -->|CFDI| J[CFDI 4.0 Template]
    F -->|Other| K[Generic UBL/CII]
    
    G --> L[Populate Invoice Data]
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M[Apply Tax Rules]
    M --> N[Generate QR Code]
    N --> O[XML Schema Validator]
    
    O --> P{Valid?}
    P -->|No| Q[Log Validation Errors]
    P -->|Yes| R[Sign Invoice Cryptographically]
    
    R --> S[Store in Database]
    S --> T{Auto-Submit?}
    
    T -->|Yes| U[Submit to Government Gateway]
    T -->|No| V[Ready for Manual Submission]
    
    U --> W{Submission Result}
    W -->|Success| X[Mark as Submitted]
    W -->|Failure| Y[Retry Queue]
    
    Q --> Z[Alert Merchant]
    X --> AA[Send Invoice to Customer]
    Y --> Z
\`\`\`

### Integration Points
\`\`\`mermaid
sequenceDiagram
    participant PSP as PSP Platform
    participant Engine as E-Invoice Engine
    participant Validator as Schema Validator
    participant Gateway as Government Gateway
    participant Storage as Document Storage
    participant Customer as Customer
    
    PSP->>Engine: Generate E-Invoice
    Engine->>Engine: Select Standard Template
    Engine->>Engine: Populate Data (ISO 20022)
    Engine->>Validator: Validate XML Schema
    
    alt Valid
        Validator-->>Engine: Validation Success
        Engine->>Engine: Cryptographic Signature
        Engine->>Storage: Store E-Invoice
        Engine->>Gateway: Submit to Tax Authority
        
        alt Submission Success
            Gateway-->>Engine: Approval + UUID
            Engine->>Storage: Update Status
            Engine->>Customer: Send E-Invoice (Email/API)
            Engine-->>PSP: Invoice Submitted Successfully
        else Submission Failed
            Gateway-->>Engine: Rejection + Errors
            Engine->>Storage: Log Errors
            Engine-->>PSP: Submission Failed (Retry)
        end
        
    else Invalid
        Validator-->>Engine: Validation Errors
        Engine->>Storage: Log Errors
        Engine-->>PSP: Validation Failed
    end
\`\`\`

---

## Invoice Generation Workflows

### Standard E-Invoice Generation
\`\`\`mermaid
flowchart TD
    A[Transaction Processed] --> B[Gather Invoice Data]
    B --> C{Customer Type}
    
    C -->|B2C| D[Consumer Invoice]
    C -->|B2B| E[Business Invoice]
    C -->|B2G| F[Government Invoice]
    
    D --> G[Select Language/Currency]
    E --> G
    F --> G
    
    G --> H{Destination Country}
    
    H -->|Saudi Arabia| I[ZATCA Template]
    H -->|Italy| J[FatturaPA Template]
    H -->|Mexico| K[CFDI Template]
    H -->|EU| L[Peppol BIS Template]
    H -->|Other| M[Generic UBL Template]
    
    I --> N[Apply VAT Rules]
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Calculate Totals]
    O --> P[Generate Invoice Lines]
    P --> Q[Add Tax Breakdown]
    Q --> R[Generate QR Code]
    R --> S[Create XML Document]
    S --> T[Validate Schema]
    
    T --> U{Valid?}
    U -->|No| V[Fix Errors]
    U -->|Yes| W[Sign Document]
    
    V --> S
    W --> X[Store Invoice]
    X --> Y[Auto-Submit or Manual]
\`\`\`

### ZATCA (Saudi Arabia) Phase 2 Workflow
\`\`\`mermaid
sequenceDiagram
    participant POS as Point of Sale
    participant Engine as E-Invoice Engine
    participant ZATCA as ZATCA Portal
    participant Customer as Customer
    
    Note over POS,ZATCA: Phase 2 - Integration with ZATCA
    
    POS->>Engine: Generate E-Invoice
    Engine->>Engine: Create UBL 2.1 XML
    Engine->>Engine: Add Cryptographic Stamp (CSR)
    Engine->>Engine: Generate QR Code (TLV Format)
    
    Engine->>ZATCA: Submit for Clearance/Reporting
    
    alt Clearance (B2B/B2G)
        ZATCA->>ZATCA: Real-time Validation
        ZATCA-->>Engine: Clearance UUID + Approval
        Engine->>Engine: Update Invoice Status
        Engine->>Customer: Send Cleared Invoice
    else Reporting (B2C)
        ZATCA-->>Engine: Acknowledgment
        Engine->>Customer: Send Invoice (24h Reporting)
    end
    
    Note over Engine,Customer: QR Code: Seller, VAT, Total, Tax, Hash
\`\`\`

### Peppol Network Transmission
\`\`\`mermaid
flowchart LR
    A[Supplier] --> B[Access Point Supplier]
    B --> C[SMP Lookup]
    C --> D{Recipient Found?}
    
    D -->|Yes| E[Access Point Recipient]
    D -->|No| F[Error: Not Registered]
    
    E --> G[Validate Invoice]
    G --> H{Valid?}
    
    H -->|Yes| I[Deliver to Recipient]
    H -->|No| J[Return Error]
    
    I --> K[Recipient System]
    K --> L[Send Receipt]
    L --> M[Confirm Delivery]
\`\`\`

---

## Standard-Specific Implementation

### Peppol BIS Billing 3.0

**Key Fields:**
- Invoice Number (BT-1)
- Invoice Issue Date (BT-2)
- Seller/Buyer Information (BG-4, BG-7)
- Invoice Lines (BG-25)
- VAT Breakdown (BG-23)
- Payment Means (BG-16)

**Example XML Structure:**
\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:ID>INV-2024-001234</cbc:ID>
    <cbc:IssueDate>2024-01-05</cbc:IssueDate>
    <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
    <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
    
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cbc:EndpointID schemeID="0088">5798009883971</cbc:EndpointID>
            <cac:PartyName>
                <cbc:Name>FTS Money Ltd</cbc:Name>
            </cac:PartyName>
        </cac:Party>
    </cac:AccountingSupplierParty>
    
    <cac:InvoiceLine>
        <cbc:ID>1</cbc:ID>
        <cbc:InvoicedQuantity unitCode="C62">1</cbc:InvoicedQuantity>
        <cbc:LineExtensionAmount currencyID="EUR">1000.00</cbc:LineExtensionAmount>
        <cac:Item>
            <cbc:Name>Payment Processing Services</cbc:Name>
        </cac:Item>
    </cac:InvoiceLine>
    
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="EUR">190.00</cbc:TaxAmount>
    </cac:TaxTotal>
    
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="EUR">1000.00</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="EUR">1000.00</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="EUR">1190.00</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="EUR">1190.00</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
</Invoice>
\`\`\`

### ZATCA (Saudi Arabia) Fatoora

**Phase 2 Requirements:**
- Cryptographic Stamp (CSR-based)
- UUID Generation
- QR Code (TLV Format)
- Real-time Clearance (B2B/B2G)
- 24-hour Reporting (B2C)

**QR Code Format (TLV):**
\`\`\`
Tag 1: Seller Name
Tag 2: VAT Registration Number  
Tag 3: Timestamp
Tag 4: Invoice Total (with VAT)
Tag 5: VAT Total
Tag 6: Invoice Hash
Tag 7: Cryptographic Stamp
Tag 8: Public Key
Tag 9: Cryptographic Stamp Signature
\`\`\`

### FatturaPA (Italy)

**Mandatory Elements:**
- SDI Transmission Format
- Progressive Invoice Number
- Buyer/Seller Fiscal Codes
- Nature of Transaction (N1-N7)
- Split Payment Flag
- Withholding Tax Details

**SDI Submission Flow:**
\`\`\`mermaid
sequenceDiagram
    participant Supplier
    participant FTS as FTS E-Invoice Engine
    participant SDI as Sistema di Interscambio
    participant Buyer
    participant Agenzia as Agenzia delle Entrate
    
    Supplier->>FTS: Generate FatturaPA
    FTS->>FTS: Sign with Digital Certificate
    FTS->>SDI: Submit XML (PEC/WS)
    
    SDI->>SDI: Validate Format
    SDI-->>FTS: Receipt of Delivery
    
    SDI->>Buyer: Forward Invoice
    Buyer->>SDI: Accept/Reject
    
    SDI->>Agenzia: Archive Invoice
    SDI-->>FTS: Final Status
    FTS-->>Supplier: Invoice Accepted
\`\`\`

---

## API Integration

### Generate E-Invoice

**Endpoint:** \`POST /functions/generateEInvoice\`

**Request:**
\`\`\`json
{
  "transaction_id": "TXN_123456",
  "standard": "peppol_bis_3",
  "invoice_data": {
    "invoice_number": "INV-2024-001234",
    "issue_date": "2024-01-05",
    "currency": "EUR",
    "supplier": {
      "name": "FTS Money Ltd",
      "vat_number": "IE1234567X",
      "address": "Dublin, Ireland",
      "endpoint_id": "5798009883971"
    },
    "customer": {
      "name": "Acme Corp",
      "vat_number": "DE123456789",
      "address": "Berlin, Germany",
      "endpoint_id": "4025589612345"
    },
    "lines": [{
      "description": "Payment Processing Services",
      "quantity": 1,
      "unit_price": 1000.00,
      "vat_rate": 19.0,
      "vat_category": "S"
    }]
  },
  "auto_submit": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "invoice_id": "EINV_789012",
  "invoice_number": "INV-2024-001234",
  "standard": "peppol_bis_3",
  "status": "submitted",
  "validation": {
    "schema_valid": true,
    "business_rules_valid": true,
    "errors": []
  },
  "submission": {
    "submitted_at": "2024-01-05T14:32:00Z",
    "gateway": "peppol_ap_001",
    "tracking_id": "PEPPOL-2024-9876543"
  },
  "files": {
    "xml_url": "https://storage.fts.money/einvoices/EINV_789012.xml",
    "pdf_url": "https://storage.fts.money/einvoices/EINV_789012.pdf",
    "qr_code": "data:image/png;base64,..."
  }
}
\`\`\`

### Validate E-Invoice Schema

**Endpoint:** \`POST /functions/validateEInvoiceSchema\`

**Request:**
\`\`\`json
{
  "standard": "zatca_phase2",
  "xml_content": "<?xml version='1.0'?>..."
}
\`\`\`

**Response:**
\`\`\`json
{
  "valid": false,
  "errors": [
    {
      "code": "BR-CO-15",
      "severity": "error",
      "message": "Invoice total amount without VAT MUST equal the sum of Invoice line net amounts",
      "location": "/Invoice/cac:LegalMonetaryTotal/cbc:TaxExclusiveAmount"
    }
  ],
  "warnings": [
    {
      "code": "BR-DEC-01",
      "severity": "warning",
      "message": "Maximum 2 decimals recommended for monetary amounts"
    }
  ]
}
\`\`\`

---

## Configuration & Setup

### Enable E-Invoicing for PSP

\`\`\`json
{
  "psp_id": "PSP_001",
  "einvoicing_config": {
    "enabled": true,
    "default_standard": "peppol_bis_3",
    "supported_standards": [
      "peppol_bis_3",
      "zatca_phase2",
      "fatturapa",
      "cfdi_4_0",
      "ubl_2_1"
    ],
    "auto_generation": true,
    "auto_submit": false,
    "gateway_connections": [
      {
        "standard": "peppol_bis_3",
        "access_point": "peppol_ap_001",
        "endpoint_id": "5798009883971",
        "certificate_path": "/certs/peppol.p12"
      },
      {
        "standard": "zatca_phase2",
        "gateway_url": "https://api.zatca.gov.sa/invoices/clearance",
        "api_key": "ZATCA_KEY_xxx",
        "compliance_csid": "CSID_xxx"
      }
    ],
    "validation_rules": {
      "strict_mode": true,
      "block_invalid": true,
      "auto_retry": true,
      "max_retries": 3
    }
  }
}
\`\`\`

---

## Compliance & Validation

### Validation Layers

\`\`\`mermaid
graph TD
    A[E-Invoice Generated] --> B[Layer 1: Syntax Validation]
    B --> C{XML Well-Formed?}
    C -->|No| D[Reject: Syntax Error]
    C -->|Yes| E[Layer 2: Schema Validation]
    
    E --> F{Matches XSD Schema?}
    F -->|No| G[Reject: Schema Violation]
    F -->|Yes| H[Layer 3: Business Rules]
    
    H --> I{EN 16931 Rules Valid?}
    I -->|No| J[Reject: Business Rule Error]
    I -->|Yes| K[Layer 4: Government Rules]
    
    K --> L{Country-Specific Rules?}
    L -->|No| M[Reject: Compliance Error]
    L -->|Yes| N[Layer 5: Cryptographic Check]
    
    N --> O{Signature Valid?}
    O -->|No| P[Reject: Invalid Signature]
    O -->|Yes| Q[Approved for Submission]
\`\`\`

### Common Validation Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| **BR-CO-15** | Invoice totals mismatch | Recalculate line sums |
| **BR-Z-10** | Missing mandatory field | Add required element |
| **BR-S-08** | Invalid VAT category | Use UNCL5305 code |
| **BR-E-01** | Date format incorrect | Use ISO 8601 (YYYY-MM-DD) |
| **BR-DEC-19** | Too many decimal places | Round to 2 decimals |

---

## Automation Features

### Auto-Generation Rules
\`\`\`json
{
  "automation_rules": {
    "trigger": "transaction_completed",
    "conditions": [
      "amount > 100",
      "customer_country IN ['SA', 'IT', 'MX']",
      "customer_type = 'B2B'"
    ],
    "actions": {
      "generate_einvoice": true,
      "standard": "auto_detect_by_country",
      "auto_submit": true,
      "send_to_customer": true,
      "retry_on_failure": {
        "enabled": true,
        "max_attempts": 3,
        "backoff_minutes": [5, 15, 60]
      }
    }
  }
}
\`\`\`

### Retry Logic
\`\`\`mermaid
stateDiagram-v2
    [*] --> Generated: Invoice Created
    Generated --> Validating: Validate Schema
    
    Validating --> ValidationFailed: Errors Found
    Validating --> Validated: Success
    
    ValidationFailed --> [*]: Manual Review Required
    
    Validated --> Submitting: Submit to Gateway
    Submitting --> SubmissionFailed: Timeout/Error
    Submitting --> Submitted: Success
    
    SubmissionFailed --> RetryQueue: Attempt < 3
    SubmissionFailed --> Failed: Attempt = 3
    
    RetryQueue --> Submitting: Wait + Retry
    
    Submitted --> [*]: Complete
    Failed --> [*]: Manual Intervention
\`\`\`

---

## Monitoring & Analytics

### Key Metrics Dashboard

| Metric | Description | Target |
|--------|-------------|--------|
| **Generation Success Rate** | % of invoices generated without errors | > 99% |
| **Validation Pass Rate** | % passing schema validation | > 95% |
| **Submission Success Rate** | % successfully submitted to gateways | > 90% |
| **Average Generation Time** | Time to generate invoice | < 2 seconds |
| **Government Rejection Rate** | % rejected by tax authorities | < 5% |

### Invoice Lifecycle Tracking
\`\`\`mermaid
gantt
    title E-Invoice Lifecycle
    dateFormat  YYYY-MM-DD HH:mm
    section Generation
    Create Invoice       :a1, 2024-01-05 14:30, 1m
    Validate Schema      :a2, after a1, 1m
    Sign Document        :a3, after a2, 30s
    section Submission
    Submit to Gateway    :b1, after a3, 2m
    Gateway Processing   :b2, after b1, 5m
    section Delivery
    Send to Customer     :c1, after b2, 1m
    Customer Receipt     :c2, after c1, 10m
\`\`\`

---

## Best Practices

### For PSPs
1. **Test in Sandbox** - Always test with government sandbox environments before production
2. **Maintain Certificates** - Keep cryptographic certificates valid and renewed
3. **Monitor Rejection Rates** - Investigate and fix common rejection reasons
4. **Backup Storage** - Store all e-invoices for statutory periods (7-10 years)
5. **Version Control** - Track standard versions and migrate when updated

### For Merchants
1. **Accurate Master Data** - Maintain up-to-date supplier/customer information
2. **Test Customer Endpoints** - Verify Peppol endpoints before sending invoices
3. **Review Before Submit** - Check invoices for accuracy before auto-submission
4. **Track Status** - Monitor submission status via dashboard
5. **Archive Properly** - Keep digital and physical copies as required by law

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| **Schema validation fails** | Check error code and location | Review XSD schema requirements |
| **Gateway rejects invoice** | Check rejection reason code | Fix business rule violation |
| **QR code not scanning** | Verify TLV format encoding | Regenerate with correct format |
| **Peppol delivery fails** | Check recipient endpoint ID | Verify SMP registration |
| **Certificate expired** | Check certificate validity dates | Renew with authority |

---

## Future Roadmap

- 🌐 **Expansion to 20+ Standards** - India GST, Australia SBR, Singapore PEPPOL
- 🤖 **AI-Powered Error Correction** - Automatic fix of common validation errors
- 🔗 **Direct ERP Integration** - SAP, Oracle, Dynamics 365 connectors
- 📱 **Mobile Invoice Validation** - Scan and verify QR codes on mobile
- 🔐 **Blockchain Anchoring** - Immutable proof of invoice existence

---

*Document Version: 1.0 | Last Updated: 2025-01-05*
`;

export default EInvoicingSystemDoc;