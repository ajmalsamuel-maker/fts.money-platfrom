import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const VATTaxManagementDoc = `# VAT & Tax Management System

## Executive Summary

The FTS.Money VAT & Tax Management System provides comprehensive, automated global tax compliance for payment service providers. Built on international standards including **UN/CEFACT UNCL5305**, **UNSPSC**, **UN CPC**, and **ISO 20022**, the system automatically calculates, collects, and reports VAT/GST across 100+ jurisdictions.

### Key Features
- ✅ **Automated VAT/GST Calculation** - Real-time tax determination based on transaction context
- ✅ **Multi-Jurisdiction Support** - 100+ countries with configurable rate types
- ✅ **Standards Compliance** - UN/CEFACT, ISO 20022, UNSPSC, UN CPC
- ✅ **B2B Reverse Charge** - Automated EU/UK reverse charge mechanism
- ✅ **Digital Services Tax** - MOSS/OSS compliance for cross-border digital services
- ✅ **Exemption Management** - Financial services, healthcare, education exemptions
- ✅ **Real-time Reporting** - VAT reports, tax summaries, jurisdiction analytics

---

## System Architecture

### Core Components
\`\`\`mermaid
graph TB
    A[Payment Transaction] --> B{Tax Configuration Engine}
    B --> C[Jurisdiction Detector]
    B --> D[Category Classifier]
    
    C --> E[Tax Rate Resolver]
    D --> E
    
    E --> F{Tax Type}
    F -->|Standard| G[Apply Standard Rate]
    F -->|Reduced| H[Apply Reduced Rate]
    F -->|Zero| I[Apply Zero Rate]
    F -->|Exempt| J[No Tax Applied]
    F -->|Reverse Charge| K[B2B Reverse Charge]
    
    G --> L[Update Transaction]
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M[Tax Calculation Log]
    M --> N[Reporting Engine]
    N --> O[VAT Returns]
    N --> P[Analytics Dashboard]
\`\`\`

### Data Flow Architecture
\`\`\`mermaid
sequenceDiagram
    participant Merchant
    participant Payment API
    participant Tax Engine
    participant Tax DB
    participant Invoice Generator
    
    Merchant->>Payment API: Process Payment
    Payment API->>Tax Engine: Calculate Tax
    
    Tax Engine->>Tax DB: Get Jurisdiction Rules
    Tax DB-->>Tax Engine: Tax Configuration
    
    Tax Engine->>Tax Engine: Classify Service (UNSPSC/CPC)
    Tax Engine->>Tax Engine: Determine Rate (UNCL5305)
    Tax Engine->>Tax Engine: Apply Special Rules
    
    Tax Engine-->>Payment API: Tax Amount + Breakdown
    Payment API->>Payment API: Update Transaction
    Payment API->>Invoice Generator: Generate Invoice
    
    Invoice Generator-->>Merchant: Invoice with VAT Breakdown
\`\`\`

---

## Tax Classification Standards

### UN/CEFACT UNCL5305 Tax Categories

| Code | Category | Description | Typical Use Case |
|------|----------|-------------|------------------|
| **S** | Standard Rate | Default VAT/GST rate | Most goods and services |
| **Z** | Zero Rated | 0% VAT but input VAT claimable | Exports, books, children's clothing |
| **E** | Exempt | No VAT, no input VAT claim | Financial services, education, healthcare |
| **AE** | Reverse Charge | Buyer accounts for VAT | B2B services, construction |
| **K** | Intra-EU Supply | Cross-border EU B2B | EU digital services |
| **G** | Export Outside EU | Free circulation goods | International exports |
| **O** | Out of Scope | Not subject to VAT | Outside tax territory |
| **L** | Canary Islands | Special rate | Spanish territories |
| **M** | Tax for Margin | Margin scheme | Second-hand goods |

### Service Classification (UNSPSC/UN CPC)

| Service Type | UNSPSC Code | UN CPC Code | Default Rate | Common Exemptions |
|--------------|-------------|-------------|--------------|-------------------|
| Software/SaaS | 81111500 | 47 (Telecom) | Standard | Educational software |
| Payment Processing | 81161500 | 71 (Financial) | Exempt/Standard | Payment facilitation (often exempt) |
| Financial Advisory | 84121500 | 71312 | Exempt | Investment management |
| Cloud Hosting | 81161700 | 84 (Computing) | Standard | Government services |
| Digital Content | 55101500 | 47914 | Standard | Educational content |
| Telecommunications | 81161600 | 47 | Standard | Emergency services |

---

## Tax Calculation Workflows

### Standard Transaction Flow
\`\`\`mermaid
flowchart TD
    A[Transaction Initiated] --> B{Customer Type?}
    B -->|B2C| C[Individual Consumer]
    B -->|B2B| D[Business Customer]
    
    C --> E[Determine Customer Location]
    D --> F{VAT Registered?}
    
    F -->|Yes| G[Apply Reverse Charge]
    F -->|No| H[Charge VAT as B2C]
    
    E --> I{Service Type?}
    I -->|Digital| J[MOSS/OSS Rules]
    I -->|Physical| K[Supply Location Rules]
    I -->|Financial| L[Check Exemptions]
    
    J --> M[Calculate VAT]
    K --> M
    L --> N{Exempt?}
    
    N -->|Yes| O[No VAT Applied]
    N -->|No| M
    
    G --> P[Update Transaction Record]
    H --> M
    M --> P
    O --> P
    
    P --> Q[Generate Tax Log]
    Q --> R[Invoice with VAT Breakdown]
\`\`\`

### Cross-Border Digital Services (MOSS/OSS)
\`\`\`mermaid
flowchart LR
    A[Digital Service Sale] --> B{Customer Location}
    B -->|EU Country| C{Threshold Exceeded?}
    B -->|Non-EU| D[Domestic Rate]
    
    C -->|Yes| E[Destination Country Rate]
    C -->|No| F[Home Country Rate]
    
    E --> G[Register in MOSS/OSS]
    F --> H[Quarterly VAT Return]
    
    G --> I[Single VAT Return]
    I --> J[EU Distributes to Member States]
    
    H --> K[Domestic VAT Authority]
\`\`\`

### B2B Reverse Charge Mechanism
\`\`\`mermaid
sequenceDiagram
    participant Supplier
    participant Customer
    participant Tax Authority
    
    Note over Supplier,Customer: B2B Transaction
    
    Supplier->>Customer: Invoice (VAT = 0)
    Note right of Supplier: Supplier doesn't charge VAT
    
    Customer->>Customer: Self-assess VAT
    Customer->>Tax Authority: Report Output VAT
    Customer->>Tax Authority: Claim Input VAT
    
    Note over Customer,Tax Authority: Net effect = 0 (if fully deductible)
    
    Supplier->>Tax Authority: Report Reverse Charge Sale
\`\`\`

---

## Configuration & Setup

### Tax Jurisdiction Configuration

**Example: UK VAT Configuration**
\`\`\`json
{
  "jurisdiction_code": "GB",
  "jurisdiction_name": "United Kingdom",
  "tax_type": "VAT",
  "currency": "GBP",
  "rates": {
    "standard": 20.0,
    "reduced": 5.0,
    "super_reduced": 0.0,
    "zero": 0.0
  },
  "registration_threshold": 85000,
  "digital_services_rules": {
    "moss_applicable": false,
    "oss_applicable": true,
    "threshold": 8818
  },
  "reverse_charge_rules": {
    "enabled": true,
    "applies_to": ["B2B services", "Construction", "Mobile phones"]
  }
}
\`\`\`

### Tax Category Configuration

**Example: Payment Processing Service**
\`\`\`json
{
  "category_code": "PAYMENT_PROCESSING",
  "category_name": "Payment Processing Services",
  "description": "Transaction processing, merchant acquiring, payment gateway",
  "unspsc_code": "81161500",
  "un_cpc_code": "71",
  "uncl5305_code": "E",
  "default_rate_type": "exempt",
  "is_financial_service": true,
  "iso_20022_code": "VATA",
  "eu_directive_article": "Article 135",
  "jurisdiction_overrides": [
    {
      "jurisdiction_code": "US",
      "rate_type": "standard",
      "custom_rate": null,
      "notes": "US does not exempt payment processing"
    }
  ]
}
\`\`\`

---

## Tax Calculation Logic

### Rate Determination Algorithm

1. **Identify Transaction Context**
   - Customer type (B2C/B2B)
   - Customer location (ISO 3166-1)
   - Service type (UNSPSC/UN CPC)
   - Transaction value

2. **Determine Jurisdiction**
   - Supply location rules
   - Customer location (for digital services)
   - Establishment location (for financial services)

3. **Classify Service Category**
   - Map to UNSPSC code
   - Map to UN CPC code
   - Identify UNCL5305 tax category

4. **Apply Rate Resolution**
   \`\`\`
   IF B2B AND customer_vat_registered AND reverse_charge_eligible THEN
       tax_type = "AE" (Reverse Charge)
       tax_rate = 0
       
   ELSE IF service_category IN exempt_categories THEN
       tax_type = "E" (Exempt)
       tax_rate = 0
       
   ELSE IF export_outside_tax_territory THEN
       tax_type = "G" (Export)
       tax_rate = 0
       
   ELSE
       tax_type = jurisdiction_default_category
       tax_rate = jurisdiction_rates[service_rate_type]
   \`\`\`

5. **Calculate Tax Amount**
   \`\`\`
   vat_amount = (transaction_amount * tax_rate) / 100
   total_amount = transaction_amount + vat_amount
   \`\`\`

---

## API Integration

### Calculate VAT on Transaction

**Endpoint:** \`POST /functions/processTransactionWithVAT\`

**Request:**
\`\`\`json
{
  "merchant_id": "MERCH_001",
  "amount": 1000.00,
  "currency": "EUR",
  "service_type": "digital_services",
  "customer": {
    "type": "B2C",
    "country": "DE",
    "vat_number": null
  },
  "merchant_location": "IE"
}
\`\`\`

**Response:**
\`\`\`json
{
  "transaction_id": "TXN_123456",
  "original_amount": 1000.00,
  "vat_amount": 190.00,
  "total_amount": 1190.00,
  "vat_breakdown": {
    "jurisdiction": "DE",
    "tax_type": "VAT",
    "rate_type": "standard",
    "rate_percentage": 19.0,
    "uncl5305_code": "S",
    "reason": "Digital services B2C - destination country rate"
  },
  "tax_calculation_log_id": "LOG_789"
}
\`\`\`

### Generate VAT Invoice

**Endpoint:** \`POST /functions/generateVATInvoice\`

**Request:**
\`\`\`json
{
  "transaction_id": "TXN_123456",
  "template_type": "b2c",
  "language": "de",
  "include_qr_code": true
}
\`\`\`

**Response:**
\`\`\`json
{
  "invoice_id": "INV_2024_001234",
  "invoice_number": "FTS-2024-001234",
  "pdf_url": "https://storage.fts.money/invoices/INV_2024_001234.pdf",
  "xml_data": "<?xml version='1.0'?>...",
  "qr_code": "data:image/png;base64,..."
}
\`\`\`

---

## Reporting & Analytics

### Tax Summary Report Structure

| Metric | Description | Calculation |
|--------|-------------|-------------|
| **Total VAT Collected** | Sum of all VAT amounts | SUM(vat_amount) WHERE period |
| **Output VAT** | VAT charged on sales | SUM(vat_amount) WHERE type = 'output' |
| **Input VAT** | VAT paid on purchases | SUM(vat_amount) WHERE type = 'input' |
| **Net VAT Payable** | Amount owed to tax authority | Output VAT - Input VAT |
| **Reverse Charge Sales** | B2B services with reverse charge | COUNT(*) WHERE uncl5305_code = 'AE' |
| **Exempt Sales** | Tax-exempt transactions | SUM(amount) WHERE uncl5305_code = 'E' |
| **Zero-Rated Sales** | Zero-rated but taxable | SUM(amount) WHERE uncl5305_code = 'Z' |

### Jurisdiction Breakdown
\`\`\`mermaid
pie title VAT Collection by Jurisdiction (Q1 2024)
    "United Kingdom" : 35000
    "Germany" : 28000
    "France" : 22000
    "Netherlands" : 15000
    "Other EU" : 18000
    "Non-EU" : 12000
\`\`\`

---

## Compliance Features

### Automated Compliance Checks

\`\`\`mermaid
flowchart TD
    A[Tax Calculation] --> B{Compliance Validator}
    
    B --> C{VAT Number Valid?}
    C -->|No| D[Alert: Invalid VAT]
    C -->|Yes| E[Continue]
    
    E --> F{Threshold Exceeded?}
    F -->|Yes| G[Alert: Register in New Jurisdiction]
    F -->|No| H[Continue]
    
    H --> I{Rate Change Detected?}
    I -->|Yes| J[Alert: Update Configuration]
    I -->|No| K[Continue]
    
    K --> L{Exemption Justified?}
    L -->|No| M[Alert: Review Exemption]
    L -->|Yes| N[Compliant]
    
    D --> O[Compliance Dashboard]
    G --> O
    J --> O
    M --> O
    N --> P[Approved]
\`\`\`

### Audit Trail
Every tax calculation generates an immutable audit log:
- Transaction details
- Customer & merchant information
- Applied tax rules & rates
- Jurisdiction determination logic
- Timestamps & user actions
- ISO 20022 compliance metadata

---

## Best Practices

### For PSPs

1. **Configure All Active Jurisdictions**
   - Set up tax configurations for all countries where you operate
   - Update rates promptly when governments announce changes

2. **Validate Customer Data**
   - Always collect accurate customer location data
   - Verify VAT numbers for B2B transactions using VIES

3. **Use Service Categories**
   - Map your services to UNSPSC/UN CPC codes
   - Define UNCL5305 categories for each service type

4. **Monitor Thresholds**
   - Track revenue per jurisdiction
   - Register for VAT when thresholds are exceeded

5. **Regular Reconciliation**
   - Compare calculated VAT with collected amounts
   - Generate monthly/quarterly tax reports

### For Merchants

1. **Provide Accurate Business Information**
   - Keep VAT registration details current
   - Specify correct business type (B2C/B2B)

2. **Classify Your Services**
   - Choose appropriate service categories
   - Understand exemption eligibility

3. **Review Tax Calculations**
   - Check invoices for correct VAT application
   - Report discrepancies immediately

4. **Maintain Records**
   - Store VAT invoices for statutory periods (typically 6-10 years)
   - Keep evidence of cross-border supplies

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Wrong tax rate applied** | Jurisdiction misconfiguration | Verify jurisdiction tax rates in settings |
| **Reverse charge not applied** | Customer VAT number invalid | Validate VAT number via VIES API |
| **Exemption not recognized** | Service category not configured | Map service to correct UNSPSC/CPC code |
| **Double taxation** | Multiple jurisdiction rules triggered | Review supply location rules |
| **Missing tax on invoice** | Tax calculation not triggered | Ensure tax engine is enabled for merchant |

### Support Escalation

1. **Check Tax Calculation Logs** - Review detailed breakdown in system logs
2. **Verify Configuration** - Ensure jurisdiction and category settings are correct
3. **Contact Support** - Provide transaction ID and log reference
4. **Consult Tax Advisor** - For complex cross-border scenarios

---

## Future Enhancements

- 🔄 Real-time rate updates from government APIs
- 🌍 Expansion to 200+ jurisdictions
- 🤖 AI-powered service classification
- 📊 Advanced analytics and forecasting
- 🔗 Direct integration with accounting systems (Xero, QuickBooks)
- 📱 Mobile VAT reporting app

---

*Document Version: 2.0 | Last Updated: 2025-01-05*
`;

export default function VATTaxManagementDocComponent() {
    return (
        <div className="prose prose-slate max-w-none">
            <MermaidDiagram content={VATTaxManagementDoc} />
        </div>
    );
}

export { VATTaxManagementDoc };