const InvoicingSystemDoc = `# FTS.Money Invoicing & Tax Management System
## Global VAT Compliance & Multi-Standard E-Invoicing

**Version:** 1.0  
**Last Updated:** January 8, 2026  
**Classification:** Public Documentation

---

## Executive Summary

The **FTS.Money Invoicing System** provides comprehensive global tax compliance and multi-standard electronic invoicing for payment platforms. The system automatically calculates VAT/sales tax based on transaction details, generates compliant invoices in regional formats (Peppol, ZATCA, FatturaPA, CFDI, etc.), and handles cross-border tax rules.

**Key Capabilities**:
- ✅ **Automatic VAT calculation** - 150+ countries and 500+ tax jurisdictions
- ✅ **Multi-standard e-invoicing** - Peppol, ZATCA, FatturaPA, CFDI, XRechnung, FacturaE
- ✅ **Real-time tax rate updates** - Synchronized with government databases
- ✅ **CSRD compliance reporting** - ESG and sustainability tax reporting
- ✅ **Multi-currency support** - 180+ currencies with exchange rates
- ✅ **Blockchain verification** - Invoice hashes stored on-chain for audit trail

---

## System Architecture

### Tax Calculation Engine

\`\`\`mermaid
graph TB
    subgraph "Transaction Processing"
        TXN[Payment Transaction] --> PARSE[Parse Transaction Data]
        PARSE --> SELLER[Identify Seller<br/>Country, VAT registration]
        PARSE --> BUYER[Identify Buyer<br/>Country, customer type]
        PARSE --> PRODUCT[Product Category<br/>Goods vs services]
        PARSE --> AMOUNT[Transaction Amount<br/>Base currency]
    end
    
    subgraph "Tax Determination"
        SELLER --> RULES[Tax Rule Engine]
        BUYER --> RULES
        PRODUCT --> RULES
        
        RULES --> CHECK1{Cross-Border?}
        CHECK1 -->|Yes| INTL[International Tax Rules<br/>Reverse charge, OSS, etc.]
        CHECK1 -->|No| DOMESTIC[Domestic Tax Rules<br/>Local VAT/sales tax]
        
        INTL --> RATE_LOOKUP[Tax Rate Lookup<br/>TaxJurisdiction entity]
        DOMESTIC --> RATE_LOOKUP
        
        RATE_LOOKUP --> RATE[Applicable Tax Rate<br/>Standard/Reduced/Zero]
    end
    
    subgraph "Tax Calculation"
        AMOUNT --> CALC[Calculate Tax]
        RATE --> CALC
        CALC --> NET[Net Amount<br/>Excluding tax]
        CALC --> TAX[Tax Amount<br/>Calculated]
        CALC --> GROSS[Gross Amount<br/>Including tax]
    end
    
    subgraph "Invoice Generation"
        NET --> INV[Generate Invoice]
        TAX --> INV
        GROSS --> INV
        
        INV --> FORMAT{E-Invoice<br/>Standard?}
        
        FORMAT -->|Peppol| PEPPOL[UBL 2.1 XML]
        FORMAT -->|ZATCA| ZATCA[XML + QR]
        FORMAT -->|FatturaPA| FATTURA[Italian XML]
        FORMAT -->|CFDI| CFDI[Mexican XML]
        FORMAT -->|Standard| PDF[PDF Invoice]
        
        PEPPOL --> VALIDATE[Schema Validation]
        ZATCA --> VALIDATE
        FATTURA --> VALIDATE
        CFDI --> VALIDATE
        PDF --> VALIDATE
        
        VALIDATE --> SEND[Send to Customer<br/>Email + Portal]
        VALIDATE --> ARCHIVE[Archive Invoice<br/>7-year retention]
        VALIDATE --> BLOCKCHAIN[Store Hash<br/>Audit trail]
    end
    
    style RULES fill:#3b82f6,color:#fff
    style CALC fill:#10b981,color:#fff
    style INV fill:#f59e0b,color:#fff
    style BLOCKCHAIN fill:#8b5cf6,color:#fff
\`\`\`

---

## Tax Jurisdictions & Rules

### Global Tax Coverage

**Supported Tax Systems**:

| Region | Tax Type | Standard Rate | Reduced Rates | Special Rules |
|--------|----------|---------------|---------------|---------------|
| **European Union** | VAT | 17-27% | 5-13% (food, books, etc.) | Reverse charge, OSS, IOSS |
| **United Kingdom** | VAT | 20% | 5% (energy), 0% (food, books) | Brexit rules, NI protocol |
| **United States** | Sales Tax | 0% (no federal) | State: 0-10%, Local: 0-5% | Nexus rules, origin vs destination |
| **Canada** | GST/HST/PST | 5% GST | Provincial: 0-10% | Combined federal+provincial |
| **Australia** | GST | 10% | 0% (basic food, health) | GST-free supplies |
| **India** | GST | 18% | 5%, 12% (various categories) | IGST for interstate |
| **Saudi Arabia** | VAT | 15% | 0% (exports, healthcare) | ZATCA e-invoicing mandatory |
| **UAE** | VAT | 5% | 0% (exports, education) | Excise tax on specific goods |
| **Singapore** | GST | 9% | 0% (exports, financial services) | Overseas vendor registration |
| **Mexico** | IVA | 16% | 0% (food, medicine) | CFDI mandatory |
| **Pakistan** | Sales Tax | 18% | 10% (retail), 0% (exports) | PRAL/FBR real-time API |

### Tax Rule Engine Logic

\`\`\`mermaid
flowchart TD
    START[Transaction] --> SELLER_LOC{Seller<br/>Location?}
    
    SELLER_LOC -->|EU| EU_RULES[EU VAT Rules]
    SELLER_LOC -->|US| US_RULES[US Sales Tax]
    SELLER_LOC -->|Other| OTHER_RULES[Regional Rules]
    
    EU_RULES --> BUYER_LOC{Buyer<br/>Location?}
    
    BUYER_LOC -->|Same EU Country| DOMESTIC_VAT[Apply Domestic VAT<br/>Standard/Reduced rate]
    BUYER_LOC -->|Different EU Country| EU_CROSS{Business<br/>or Consumer?}
    BUYER_LOC -->|Outside EU| EXPORT_ZERO[0% Export VAT]
    
    EU_CROSS -->|Business with VAT ID| REVERSE[Reverse Charge<br/>0% seller VAT<br/>Buyer self-assesses]
    EU_CROSS -->|Consumer| DEST_VAT[Destination VAT<br/>Apply buyer country rate]
    EU_CROSS -->|OSS Registered| OSS[One-Stop Shop<br/>Seller charges & remits]
    
    US_RULES --> NEXUS{Economic<br/>Nexus?}
    NEXUS -->|Yes| STATE_TAX[Apply State+Local Tax<br/>Origin or destination]
    NEXUS -->|No| NO_TAX[No Sales Tax]
    
    DOMESTIC_VAT --> CATEGORY{Product<br/>Category?}
    CATEGORY -->|Goods| STANDARD[Standard Rate]
    CATEGORY -->|Digital Services| DIGITAL[Digital Services VAT]
    CATEGORY -->|Food| REDUCED[Reduced Rate]
    CATEGORY -->|Books/Education| EXEMPT[Exempt or 0%]
    
    style REVERSE fill:#f59e0b,color:#fff
    style DEST_VAT fill:#3b82f6,color:#fff
    style STATE_TAX fill:#10b981,color:#fff
\`\`\`

---

## E-Invoicing Standards

### Multi-Standard Support

**URL**: https://platform.fts.money/EInvoicingDashboard

\`\`\`mermaid
graph TB
    subgraph "E-Invoicing Standards"
        direction TB
        
        PEPPOL[🇪🇺 Peppol<br/>Pan-European<br/>UBL 2.1 XML<br/>SchematronFER validation]
        
        ZATCA[🇸🇦 ZATCA<br/>Saudi Arabia<br/>XML + QR code<br/>Mandatory 2022+]
        
        FATTURA[🇮🇹 FatturaPA<br/>Italy<br/>XML via SDI<br/>Mandatory B2G+B2B]
        
        CFDI[🇲🇽 CFDI<br/>Mexico<br/>SAT XML format<br/>PAC certification]
        
        XRECH[🇩🇪 XRechnung<br/>Germany<br/>UBL/CII XML<br/>Public sector]
        
        FACTURAE[🇪🇸 FacturaE<br/>Spain<br/>Facturae XML<br/>Tax agency format]
        
        EHF[🇳🇴 EHF<br/>Norway<br/>UBL 2.1<br/>Peppol network]
        
        FINVOICE[🇫🇮 Finvoice<br/>Finland<br/>XML format<br/>Banking integration]
        
        PRAL[🇵🇰 PRAL/FBR<br/>Pakistan<br/>JSON format<br/>Real-time API<br/>Sandbox required]
    end
    
    subgraph "Universal Invoice Engine"
        TEMPLATE[Invoice Template] --> GENERATOR[Invoice Generator]
        GENERATOR --> VALIDATOR[Standard Validator]
        VALIDATOR --> SIGNER[Digital Signature]
        SIGNER --> TRANSMIT[Transmission]
    end
    
    subgraph "Transmission Methods"
        EMAIL[Email PDF]
        API[API Webhook]
        NETWORK[Peppol Network<br/>AP to AP direct]
        PORTAL[Tax Authority Portal<br/>Upload/API]
    end
    
    PEPPOL --> GENERATOR
    ZATCA --> GENERATOR
    FATTURA --> GENERATOR
    CFDI --> GENERATOR
    XRECH --> GENERATOR
    FACTURAE --> GENERATOR
    EHF --> GENERATOR
    FINVOICE --> GENERATOR
    PRAL --> GENERATOR
    
    TRANSMIT --> EMAIL
    TRANSMIT --> API
    TRANSMIT --> NETWORK
    TRANSMIT --> PORTAL
    
    style GENERATOR fill:#10b981,color:#fff
    style VALIDATOR fill:#f59e0b,color:#fff
    style SIGNER fill:#8b5cf6,color:#fff
\`\`\`

---

## Peppol Network Integration

### Pan-European E-Invoicing

**What is Peppol?**
- Pan-European Public Procurement Online
- Standardized network for electronic document exchange
- Used by governments and businesses across 40+ countries
- Based on UBL 2.1 (Universal Business Language) XML format

**FTS.Money as Peppol Access Point**:

\`\`\`mermaid
sequenceDiagram
    participant Seller as Seller<br/>(FTS.Money Merchant)
    participant FTS_AP as FTS.Money<br/>Peppol Access Point
    participant Network as Peppol Network<br/>SMP/SML Lookup
    participant Buyer_AP as Buyer's<br/>Access Point
    participant Buyer
    
    Seller->>FTS_AP: Create Invoice
    FTS_AP->>FTS_AP: Convert to UBL 2.1 XML
    FTS_AP->>FTS_AP: Validate against Schematron Rules
    FTS_AP->>FTS_AP: Add Digital Signature
    
    FTS_AP->>Network: Lookup Buyer's Access Point
    Network->>Network: Query SML (Service Metadata Locator)
    Network->>Network: Query SMP (Service Metadata Publisher)
    Network-->>FTS_AP: Buyer AP Endpoint
    
    FTS_AP->>Buyer_AP: Transmit Invoice (AS4 protocol)
    Buyer_AP->>Buyer_AP: Validate Signature
    Buyer_AP->>Buyer_AP: Schema Validation
    Buyer_AP-->>FTS_AP: Receipt Acknowledgement
    
    Buyer_AP->>Buyer: Deliver Invoice
    Buyer-->>Buyer_AP: Payment Initiated
    Buyer_AP-->>FTS_AP: Payment Notification
    FTS_AP-->>Seller: Invoice Paid Notification
\`\`\`

**Peppol Participant Identifiers**:
- ISO 6523 ICD format
- Examples:
  - EU VAT: 0088:GB123456789 (VAT number)
  - GLN: 0088:1234567890123 (Global Location Number)
  - DUNS: 0060:123456789 (Dun & Bradstreet)

**Document Types Supported**:
- Invoice (BIS Billing 3.0)
- Credit Note
- Order
- Order Response
- Despatch Advice
- Catalogue

---

## ZATCA (Saudi Arabia) Integration

### Fatoorah E-Invoicing

**Mandatory for KSA since December 2021**

\`\`\`mermaid
graph TB
    subgraph "ZATCA Phase 1 - Generation"
        GEN[Generate E-Invoice<br/>XML format per ZATCA spec]
        QR[Generate QR Code<br/>Base64 encoded data]
        HASH[Calculate Cryptographic Hash<br/>SHA-256]
        SIGN[Digital Signature<br/>Seller certificate]
        PDF[Generate PDF<br/>With QR code visible]
    end
    
    subgraph "ZATCA Phase 2 - Integration"
        API[ZATCA API Integration<br/>Fatoorah portal]
        SUBMIT[Submit Invoice<br/>Real-time transmission]
        VALIDATE[ZATCA Validation<br/>Business rules check]
        UUID[Receive UUID<br/>Unique invoice identifier]
        STORE[Store UUID on Invoice<br/>Required for compliance]
    end
    
    subgraph "QR Code Data"
        Q1[Seller Name]
        Q2[VAT Registration<br/>15-digit number]
        Q3[Invoice Timestamp<br/>ISO 8601 format]
        Q4[Invoice Total]
        Q5[VAT Amount]
        Q6[Invoice Hash]
    end
    
    GEN --> QR
    QR --> HASH
    HASH --> SIGN
    SIGN --> PDF
    
    PDF --> API
    API --> SUBMIT
    SUBMIT --> VALIDATE
    VALIDATE --> UUID
    UUID --> STORE
    
    Q1 --> QR
    Q2 --> QR
    Q3 --> QR
    Q4 --> QR
    Q5 --> QR
    Q6 --> QR
    
    style SUBMIT fill:#10b981,color:#fff
    style VALIDATE fill:#f59e0b,color:#fff
    style UUID fill:#8b5cf6,color:#fff
\`\`\`

**ZATCA Requirements**:
- **Seller Information**: VAT number, CR number, name, address
- **Invoice Number**: Sequential, no gaps
- **QR Code**: Mandatory on all invoices
- **Digital Signature**: Required for simplified invoices
- **Submission**: Real-time to ZATCA within 24 hours
- **Archival**: 6 years minimum retention
- **Penalties**: SAR 5,000-50,000 for non-compliance

---

## PRAL/FBR Integration (Pakistan)

### Digital Invoicing via IRIS System

**Mandatory for Pakistan since 2024**

\`\`\`mermaid
graph TB
    subgraph "PRAL Integration Process"
        REGISTER[Register with FBR<br/>IRIS portal login]
        
        subgraph "Choose Integration Path"
            PRAL_PATH[PRAL as Integrator<br/>Free service]
            OTHER_PATH[Licensed Integrator<br/>Third-party service]
        end
        
        subgraph "Technical Setup"
            TECH_DETAILS[Provide Technical Details<br/>ERP system, software version]
            BUSINESS_TYPE[Select Business Nature<br/>Sector classification]
            IP_WHITELIST[IP Whitelisting<br/>Register hosting IPs]
        end
        
        subgraph "Sandbox Testing"
            SANDBOX[Sandbox Environment<br/>Test API endpoint]
            TEST_SCENARIOS[Submit Test Invoices<br/>Scenario-based validation]
            VALIDATION[FBR Validation<br/>Success required]
        end
        
        subgraph "Production"
            PROD_TOKEN[Production Token<br/>Auto-generated after tests]
            REAL_TIME[Real-Time Transmission<br/>Every invoice to FBR]
            DASHBOARD[Invoice Dashboard<br/>Daily/monthly/quarterly view]
        end
    end
    
    REGISTER --> PRAL_PATH
    REGISTER --> OTHER_PATH
    
    PRAL_PATH --> TECH_DETAILS
    OTHER_PATH --> TECH_DETAILS
    
    TECH_DETAILS --> BUSINESS_TYPE
    BUSINESS_TYPE --> IP_WHITELIST
    
    IP_WHITELIST --> SANDBOX
    SANDBOX --> TEST_SCENARIOS
    TEST_SCENARIOS --> VALIDATION
    
    VALIDATION --> PROD_TOKEN
    PROD_TOKEN --> REAL_TIME
    REAL_TIME --> DASHBOARD
    
    style SANDBOX fill:#f59e0b,color:#fff
    style PROD_TOKEN fill:#10b981,color:#fff
    style REAL_TIME fill:#3b82f6,color:#fff
\`\`\`

**PRAL Requirements**:
- **Format**: JSON (primary) or XML
- **Transmission**: Real-time API (immediate upon invoice creation)
- **Authentication**: IP whitelisting + Bearer token
- **Testing**: Mandatory sandbox scenario testing
- **Invoice Types**: Sales invoice, debit note, credit note
- **Dashboard**: Real-time monitoring in IRIS portal
- **CRM Integration**: Support ticket system for issues

**Integration Flow**:

\`\`\`mermaid
sequenceDiagram
    participant Merchant as Pakistani Merchant
    participant FTS as FTS.Money Platform
    participant PRAL as PRAL API
    participant FBR as FBR IRIS System
    participant Dashboard as Invoice Dashboard
    
    Note over Merchant,FBR: One-Time Setup
    Merchant->>FTS: Register for PRAL integration
    FTS->>PRAL: Submit technical details
    FTS->>PRAL: Register IP addresses
    PRAL-->>FTS: Sandbox credentials
    
    Note over FTS,PRAL: Sandbox Testing (Mandatory)
    FTS->>PRAL: Submit test invoices (scenarios)
    PRAL->>PRAL: Validate scenarios
    PRAL-->>FTS: Production token (after success)
    
    Note over Merchant,Dashboard: Production - Real-Time Invoicing
    Merchant->>FTS: Create invoice
    FTS->>FTS: Generate JSON format
    FTS->>FTS: Calculate Pakistan sales tax
    
    FTS->>PRAL: POST invoice (real-time)
    Note right of PRAL: Authorization: Bearer token<br/>Content-Type: application/json
    
    PRAL->>PRAL: Validate invoice format
    PRAL->>FBR: Store in IRIS database
    FBR-->>Dashboard: Update dashboard
    PRAL-->>FTS: Response (invoice ID, status)
    
    FTS-->>Merchant: Invoice created + FBR submitted
    
    alt Invoice Rejected
        PRAL-->>FTS: Error response (validation failure)
        FTS-->>Merchant: Show error, fix required
    end
\`\`\`

**PRAL Invoice JSON Format**:
\`\`\`json
{
  "InvoiceNumber": "INV-2026-0001",
  "InvoiceDate": "2026-01-08",
  "InvoiceType": "Sales",
  "BuyerNTN": "1234567-8",
  "BuyerName": "ABC Corporation",
  "BuyerAddress": "Karachi, Pakistan",
  "Items": [
    {
      "ItemDescription": "Professional Services",
      "Quantity": 10,
      "UnitPrice": 15000.00,
      "TotalValue": 150000.00,
      "SalesTaxRate": 18,
      "SalesTaxAmount": 27000.00
    }
  ],
  "TotalInvoiceValue": 150000.00,
  "TotalSalesTax": 27000.00,
  "InvoiceValueInclusiveTax": 177000.00,
  "PaymentMode": "Credit",
  "SupplierNTN": "9876543-2",
  "SupplierName": "XYZ Services Ltd",
  "InvoiceCategory": "B2B"
}
\`\`\`

**Technical Specifications**:

| Specification | Details |
|---------------|---------|
| **API Endpoint** | https://iris.fbr.gov.pk/api/di/submit |
| **Authentication** | Bearer token (from production environment) |
| **Content-Type** | application/json |
| **Method** | POST |
| **Timeout** | 30 seconds |
| **Retry Policy** | 3 attempts with exponential backoff |
| **Response Format** | JSON with invoice_id and status |
| **IP Restriction** | Only whitelisted IPs allowed |
| **Rate Limit** | 100 invoices/minute |

**Sandbox vs Production**:

| Environment | URL | Purpose | Token Validity |
|-------------|-----|---------|----------------|
| **Sandbox** | https://sandbox-iris.fbr.gov.pk/api | Testing with scenarios | 90 days |
| **Production** | https://iris.fbr.gov.pk/api | Live invoice submission | Annual renewal |

**Required Sandbox Test Scenarios**:
Based on business nature and sector selected during registration:
1. Standard B2B invoice (18% sales tax)
2. Export invoice (0% sales tax)
3. Debit note (adjustment)
4. Credit note (return)
5. Mixed items (different tax rates)
6. Withholding tax scenario (if applicable)

**Business Nature Options**:
- Manufacturer
- Distributor
- Retailer
- Service Provider
- Exporter
- E-commerce

**Sector Options**:
- Manufacturing
- Wholesale & Retail Trade
- Services
- Construction
- Information Technology
- Others

**Error Codes**:

| Code | Error | Resolution |
|------|-------|------------|
| 400 | Invalid JSON format | Check schema compliance |
| 401 | Invalid token | Regenerate production token |
| 403 | IP not whitelisted | Add IP in IRIS portal |
| 422 | Validation error | Fix invoice data (NTN, amounts) |
| 500 | FBR system error | Retry after 5 minutes |
| 503 | Service unavailable | Check FBR status page |

**Dashboard Features**:
- Real-time invoice count (daily/monthly/quarterly/yearly)
- Invoice value graphs
- Search by date range and invoice type
- Export to PDF
- Sales tax summary by period
- Debit/credit note tracking

**Compliance Requirements**:
- Real-time submission (within 1 hour of invoice generation)
- All sales tax registered persons must integrate
- Sequential invoice numbering required
- Retention: 7 years minimum
- Monthly reconciliation with sales tax returns
- Penalties: PKR 10,000-500,000 for non-compliance

---

**Sample ZATCA Invoice Data**:
\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:ID>INV-2026-0001</cbc:ID>
  <cbc:IssueDate>2026-01-08</cbc:IssueDate>
  <cbc:IssueTime>14:30:00</cbc:IssueTime>
  <cac:AccountingSupplierParty>
    <cac:PartyTaxScheme>
      <cbc:CompanyID>300123456789003</cbc:CompanyID>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:PartyTaxScheme>
  </cac:AccountingSupplierParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">15.00</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:TaxInclusiveAmount currencyID="SAR">115.00</cbc:TaxInclusiveAmount>
  </cac:LegalMonetaryTotal>
</Invoice>
\`\`\`

---

## Platform Invoicing Features

### Three-Tier Invoicing System

\`\`\`mermaid
graph TB
    subgraph "FTS.Money Invoicing Hierarchy"
        direction TB
        
        subgraph "Platform → PSP Invoicing"
            PLAT_INV[Platform Billing Portal<br/>Generate invoices for PSPs]
            PLAT_DATA[Data Sources:<br/>Service subscriptions<br/>Transaction volume<br/>API usage<br/>Overage charges]
            PLAT_VAT[Apply VAT<br/>B2B cross-border rules]
            PLAT_GEN[Generate Invoice<br/>Multi-currency support]
        end
        
        subgraph "PSP → Merchant Invoicing"
            PSP_INV[PSP Billing System<br/>Invoice merchant customers]
            PSP_DATA[Data Sources:<br/>Payment processing fees<br/>Monthly subscriptions<br/>Chargeback fees<br/>Service charges]
            PSP_VAT[Apply VAT<br/>Based on merchant location]
            PSP_GEN[Generate Invoice<br/>White-labeled per PSP]
        end
        
        subgraph "Merchant → End Customer Invoicing"
            MERCH_INV[Merchant Invoice Portal<br/>Customer-facing invoices]
            MERCH_DATA[Data Sources:<br/>Product sales<br/>Service delivery<br/>Subscription charges]
            MERCH_VAT[Apply VAT<br/>Consumer location-based]
            MERCH_GEN[Generate E-Invoice<br/>Regional standard compliance]
        end
    end
    
    PLAT_DATA --> PLAT_VAT
    PLAT_VAT --> PLAT_GEN
    PLAT_GEN -.Example Invoice.-> PSP_INV
    
    PSP_DATA --> PSP_VAT
    PSP_VAT --> PSP_GEN
    PSP_GEN -.Example Invoice.-> MERCH_INV
    
    MERCH_DATA --> MERCH_VAT
    MERCH_VAT --> MERCH_GEN
    
    style PLAT_GEN fill:#3b82f6,color:#fff
    style PSP_GEN fill:#8b5cf6,color:#fff
    style MERCH_GEN fill:#10b981,color:#fff
\`\`\`

---

## Invoice Templates

### Customizable Templates

**URL**: https://platform.fts.money/TaxManagement (Tax Categories & Templates)

\`\`\`mermaid
graph TB
    subgraph "Invoice Template Builder"
        BASE[Base Template<br/>Standard fields]
        
        subgraph "Customization Options"
            LOGO[Company Logo<br/>Upload image]
            COLORS[Brand Colors<br/>Primary, secondary]
            FONT[Typography<br/>Font selection]
            LAYOUT[Layout Style<br/>Modern, classic, minimal]
            FIELDS[Custom Fields<br/>PO number, project code]
            FOOTER[Footer Content<br/>Terms, bank details]
        end
        
        subgraph "Compliance Elements"
            VAT_NUM[VAT Registration<br/>Auto-populated]
            TAX_BREAK[Tax Breakdown<br/>Line-item + summary]
            LEGAL[Legal Requirements<br/>Per jurisdiction]
            SIGNATURE[Digital Signature<br/>Optional]
            QR_CODE[QR Code<br/>Required for some regions]
        end
    end
    
    BASE --> LOGO
    BASE --> COLORS
    BASE --> FONT
    BASE --> LAYOUT
    BASE --> FIELDS
    BASE --> FOOTER
    
    BASE --> VAT_NUM
    BASE --> TAX_BREAK
    BASE --> LEGAL
    BASE --> SIGNATURE
    BASE --> QR_CODE
    
    LOGO --> PREVIEW[Template Preview]
    COLORS --> PREVIEW
    FONT --> PREVIEW
    LAYOUT --> PREVIEW
    
    VAT_NUM --> COMPLIANCE[Compliance Check]
    LEGAL --> COMPLIANCE
    QR_CODE --> COMPLIANCE
    
    PREVIEW --> SAVE[Save Template]
    COMPLIANCE --> SAVE
    
    style BASE fill:#3b82f6,color:#fff
    style PREVIEW fill:#10b981,color:#fff
    style COMPLIANCE fill:#ef4444,color:#fff
\`\`\`

**Template Variables**:
\`\`\`javascript
{
  // Seller Information
  seller_name: "{{merchant.business_name}}",
  seller_address: "{{merchant.address}}",
  seller_vat: "{{merchant.vat_registration}}",
  seller_logo: "{{merchant.logo_url}}",
  
  // Buyer Information
  buyer_name: "{{customer.name}}",
  buyer_address: "{{customer.address}}",
  buyer_vat: "{{customer.vat_number}}",
  buyer_email: "{{customer.email}}",
  
  // Invoice Details
  invoice_number: "{{invoice.sequential_number}}",
  invoice_date: "{{invoice.issue_date}}",
  due_date: "{{invoice.due_date}}",
  payment_terms: "{{invoice.payment_terms}}",
  
  // Line Items (array)
  line_items: [
    {
      description: "{{item.description}}",
      quantity: "{{item.quantity}}",
      unit_price: "{{item.unit_price}}",
      tax_rate: "{{item.tax_rate}}",
      line_total: "{{item.total}}"
    }
  ],
  
  // Totals
  subtotal: "{{totals.net_amount}}",
  tax_amount: "{{totals.tax_amount}}",
  total: "{{totals.gross_amount}}",
  
  // Payment
  payment_method: "{{payment.method}}",
  bank_iban: "{{merchant.iban}}",
  bank_bic: "{{merchant.bic}}"
}
\`\`\`

---

## Tax Compliance Features

### EU VAT OSS (One-Stop Shop)

**URL**: https://platform.fts.money/TaxManagement

**What is OSS?**
EU scheme allowing businesses to declare and pay VAT from all EU member states in one place, rather than registering in each country.

\`\`\`mermaid
graph LR
    subgraph "Without OSS - Old System"
        SELLER1[EU Seller] --> REG1[Register VAT in 27 Countries]
        REG1 --> FILE1[File 27 Separate Returns]
        FILE1 --> PAY1[Pay VAT to 27 Authorities]
    end
    
    subgraph "With OSS - Simplified"
        SELLER2[EU Seller] --> REG2[Register OSS in Home Country]
        REG2 --> FILE2[File ONE Quarterly Return]
        FILE2 --> PAY2[Pay to Home Tax Authority]
        PAY2 --> DISTRIBUTE[Automatic Distribution<br/>To destination countries]
    end
    
    style REG1 fill:#ef4444,color:#fff
    style REG2 fill:#10b981,color:#fff
    style DISTRIBUTE fill:#3b82f6,color:#fff
\`\`\`

**OSS Configuration in FTS.Money**:
1. Enable OSS mode in Tax Management
2. Enter OSS registration number
3. System automatically:
   - Charges destination country VAT rate
   - Tracks sales by member state
   - Generates quarterly OSS report
   - Exports for submission to tax authority

**OSS Reporting**:
- Quarterly returns (due by end of month following quarter)
- Reports sales by destination country
- Includes VAT rate and amount per country
- Export as CSV for tax portal upload

---

## Invoice Automation

### Automated Invoice Generation

**URL**: Platform admins use /PlatformBillingPortal, Merchants use /MerchantInvoicePortal

\`\`\`mermaid
sequenceDiagram
    participant Trigger as Billing Trigger<br/>End of month
    participant System as Invoicing System
    participant Usage as Usage Tracker
    participant Tax as Tax Calculator
    participant Generator as Invoice Generator
    participant Customer
    participant Accounting as Xero Integration
    
    Trigger->>System: Monthly Billing Cycle Started
    System->>Usage: Fetch Usage Data
    Usage-->>System: Transactions, API calls, subscriptions
    
    System->>Tax: Calculate Tax
    Tax->>Tax: Determine Jurisdiction
    Tax->>Tax: Lookup Tax Rate
    Tax->>Tax: Apply to Line Items
    Tax-->>System: Tax Breakdown
    
    System->>Generator: Generate Invoice
    Generator->>Generator: Apply Template
    Generator->>Generator: Insert Data
    Generator->>Generator: Calculate Totals
    Generator->>Generator: Create PDF
    Generator->>Generator: Generate XML (if e-invoice)
    Generator-->>System: Invoice Created
    
    System->>Customer: Email Invoice PDF
    System->>Accounting: Sync to Xero
    Accounting-->>System: Invoice Synced
    
    alt Payment Due
        Note over System: Wait for payment
        Customer->>System: Pay Invoice
        System->>Accounting: Mark as Paid
    else Payment Overdue
        System->>Customer: Send Reminder (7 days)
        System->>Customer: Send Final Notice (14 days)
        System->>System: Suspend Service (30 days)
    end
\`\`\`

**Automated Triggers**:
- Monthly subscription invoices (1st of month)
- Transaction volume invoices (configurable)
- Overage charges (when limits exceeded)
- Setup fees (upon provisioning)
- Custom invoices (on-demand)

---

## VAT Calculation Examples

### Cross-Border Scenarios

**Scenario 1: EU B2B (Reverse Charge)**

\`\`\`
Seller: DE Company (Germany, VAT: DE123456789)
Buyer: FR Company (France, VAT: FR987654321)
Product: Software subscription
Amount: €1,000

Tax Treatment:
  ✓ Reverse Charge applies (both have valid VAT IDs)
  ✓ Seller charges 0% VAT
  ✓ Buyer self-assesses FR VAT (20%)
  ✓ Invoice states: "Reverse charge - Article 44 VAT Directive"

Invoice Line Items:
  Subtotal: €1,000.00
  VAT (0% - reverse charge): €0.00
  Total: €1,000.00
\`\`\`

**Scenario 2: EU B2C (Destination Principle)**

\`\`\`
Seller: ES Company (Spain)
Buyer: IT Consumer (Italy, no VAT ID)
Product: Digital service
Amount: €100

Tax Treatment:
  ✓ Destination principle applies (B2C)
  ✓ Charge Italian VAT (22%)
  ✓ Seller must be OSS registered or IT VAT registered

Invoice Line Items:
  Subtotal: €100.00
  Italian VAT (22%): €22.00
  Total: €122.00
  
Seller Obligation:
  - Report sale to Italy in OSS return
  - Remit €22 to Spanish tax authority (via OSS)
  - Spain distributes to Italy
\`\`\`

**Scenario 3: US Sales Tax (Economic Nexus)**

\`\`\`
Seller: US Company in California
Buyer: Customer in Texas
Product: Physical goods
Amount: $1,000

Tax Treatment:
  ✓ Economic nexus in Texas (>$500K sales or 200 transactions)
  ✓ Destination-based sales tax
  ✓ Apply Texas state tax (6.25%) + local tax (varies)
  
Calculation:
  Product Amount: $1,000.00
  Texas State Tax (6.25%): $62.50
  Local Tax (Dallas 2%): $20.00
  Total Tax: $82.50
  Invoice Total: $1,082.50
  
Note: Seller must:
  - Be registered for Texas sales tax permit
  - File monthly/quarterly Texas sales tax return
  - Remit collected tax to Texas Comptroller
\`\`\`

---

## Merchant Invoice Portal

### Customer-Facing Invoicing

**URL**: https://platform.fts.money/MerchantInvoicePortal

**Features**:

\`\`\`mermaid
graph TB
    subgraph "Merchant Invoice Generation"
        CREATE[Create New Invoice]
        
        subgraph "Invoice Builder"
            CUSTOMER[Select/Add Customer<br/>Auto-complete from CRM]
            ITEMS[Add Line Items<br/>Products or services]
            TAX[Tax Auto-Calculated<br/>Based on customer location]
            TERMS[Payment Terms<br/>Net 15, 30, 60, etc.]
            NOTES[Notes & Instructions<br/>Custom message]
        end
        
        subgraph "Smart Features"
            RECURRING[Make Recurring<br/>Auto-generate monthly]
            TEMPLATE[Save as Template<br/>Reuse for similar invoices]
            MULTI_CURR[Multi-Currency<br/>180+ currencies]
            PAYMENT_LINK[Add Payment Link<br/>Pay invoice online]
        end
        
        subgraph "Delivery Options"
            EMAIL_INV[Email to Customer<br/>PDF attachment]
            PORTAL_INV[Customer Portal<br/>Online viewing]
            API_HOOK[Webhook Notification<br/>API integration]
            E_INVOICE[E-Invoice Transmission<br/>Peppol, ZATCA, etc.]
        end
    end
    
    CREATE --> CUSTOMER
    CUSTOMER --> ITEMS
    ITEMS --> TAX
    TAX --> TERMS
    TERMS --> NOTES
    
    NOTES --> RECURRING
    NOTES --> TEMPLATE
    NOTES --> MULTI_CURR
    NOTES --> PAYMENT_LINK
    
    PAYMENT_LINK --> EMAIL_INV
    PAYMENT_LINK --> PORTAL_INV
    PAYMENT_LINK --> API_HOOK
    PAYMENT_LINK --> E_INVOICE
    
    style TAX fill:#f59e0b,color:#fff
    style E_INVOICE fill:#10b981,color:#fff
    style PAYMENT_LINK fill:#8b5cf6,color:#fff
\`\`\`

**Invoice Status Tracking**:
- **Draft**: Invoice created but not sent
- **Sent**: Emailed to customer
- **Viewed**: Customer opened invoice
- **Partially Paid**: Payment received (less than total)
- **Paid**: Fully paid
- **Overdue**: Past due date, unpaid
- **Cancelled**: Voided by merchant
- **Refunded**: Payment returned

**Payment Link Integration**:
- Unique URL generated per invoice
- Supports card payments (Stripe, Adyen)
- Supports bank transfer (display IBAN)
- Supports crypto payments (if enabled)
- Automatic invoice marking as paid
- Receipt email sent on payment

---

## Tax Reporting & Analytics

### Tax Analytics Dashboard

**URL**: https://platform.fts.money/TaxManagement

\`\`\`mermaid
graph TB
    subgraph "Tax Reporting Features"
        DASHBOARD[Tax Dashboard<br/>Overview]
        
        subgraph "Reports"
            VAT_RETURN[VAT Return Report<br/>By country & period]
            SALES_TAX[Sales Tax Report<br/>By state & period]
            SUMMARY[Tax Summary<br/>Total collected by type]
            TRANSACTIONS[Transaction-Level<br/>Tax breakdown]
            EXEMPTIONS[Tax Exemptions<br/>Zero-rated sales]
        end
        
        subgraph "Analytics"
            BY_COUNTRY[Tax by Country<br/>Geographic breakdown]
            BY_RATE[Tax by Rate<br/>Standard vs reduced]
            TRENDS[Tax Trends<br/>Over time]
            FORECAST[Tax Forecast<br/>Projected liability]
        end
        
        subgraph "Exports"
            CSV[Export to CSV<br/>For accountant]
            XERO[Sync to Xero<br/>Automatic]
            QUICKBOOKS[Sync to QuickBooks<br/>API integration]
            PDF_REPORT[PDF Report<br/>For filing]
        end
    end
    
    DASHBOARD --> VAT_RETURN
    DASHBOARD --> SALES_TAX
    DASHBOARD --> SUMMARY
    
    VAT_RETURN --> BY_COUNTRY
    SALES_TAX --> BY_RATE
    SUMMARY --> TRENDS
    TRANSACTIONS --> FORECAST
    
    BY_COUNTRY --> CSV
    BY_RATE --> XERO
    TRENDS --> QUICKBOOKS
    FORECAST --> PDF_REPORT
    
    style DASHBOARD fill:#3b82f6,color:#fff
    style BY_COUNTRY fill:#10b981,color:#fff
    style CSV fill:#f59e0b,color:#fff
\`\`\`

**Available Reports**:

| Report Name | Period | Format | Purpose |
|-------------|--------|--------|---------|
| **VAT Return** | Monthly/Quarterly | CSV, PDF | Submit to tax authority |
| **Sales Tax Summary** | Monthly | CSV | Multi-state filing |
| **OSS Report** | Quarterly | CSV | EU One-Stop Shop filing |
| **Transaction Tax Log** | Daily/Monthly | CSV, Excel | Audit trail |
| **Tax Exemption Report** | Monthly | PDF | Document zero-rated sales |
| **Reverse Charge Report** | Quarterly | CSV | B2B EU transactions |
| **Digital Services VAT** | Quarterly | CSV | Cross-border digital sales |

---

## Blockchain Invoice Verification

### Immutable Audit Trail

\`\`\`mermaid
graph TB
    subgraph "Invoice Blockchain Integration"
        INVOICE[Invoice Generated] --> HASH[Calculate Invoice Hash<br/>SHA-256 of invoice data]
        
        HASH --> DATA{Include in Hash}
        DATA --> D1[Invoice Number]
        DATA --> D2[Issue Date]
        DATA --> D3[Seller VAT]
        DATA --> D4[Buyer VAT]
        DATA --> D5[Total Amount]
        DATA --> D6[Tax Amount]
        DATA --> D7[Line Items JSON]
        
        HASH --> BLOCKCHAIN[Store Hash on Blockchain<br/>Polygon network]
        BLOCKCHAIN --> TX[Blockchain Transaction<br/>Permanent record]
        TX --> VERIFY[Verification Available<br/>Anyone can verify]
        
        VERIFY --> AUDIT[QSA Auditor Verification]
        VERIFY --> TAX_AUTH[Tax Authority Check]
        VERIFY --> CUSTOMER[Customer Verification]
    end
    
    subgraph "Verification Process"
        DOWNLOAD[Download Invoice PDF]
        EXTRACT[Extract Invoice Data]
        RECALC[Recalculate Hash]
        COMPARE{Hash Matches<br/>Blockchain?}
        COMPARE -->|Yes| VALID[✓ Invoice Authentic<br/>Unmodified]
        COMPARE -->|No| INVALID[✗ Invoice Tampered<br/>Modified after issuance]
    end
    
    CUSTOMER --> DOWNLOAD
    DOWNLOAD --> EXTRACT
    EXTRACT --> RECALC
    RECALC --> COMPARE
    
    style BLOCKCHAIN fill:#8b5cf6,color:#fff
    style VALID fill:#10b981,color:#fff
    style INVALID fill:#ef4444,color:#fff
\`\`\`

**Benefits**:
- **Audit-proof**: Invoices cannot be altered after issuance
- **Tax compliance**: Satisfies "unalterable" requirements
- **Dispute resolution**: Cryptographic proof of invoice terms
- **Timestamp**: Blockchain provides immutable timestamp
- **Cost**: ~$0.01 per invoice (Polygon gas fees)

---

## Integration APIs

### Developer Documentation

**Invoice API Endpoints**:

\`\`\`javascript
// Create invoice
const invoice = await base44.entities.Invoice.create({
  merchant_id: "merchant_abc123",
  customer_email: "customer@example.com",
  line_items: [
    {
      description: "Professional Services",
      quantity: 10,
      unit_price: 150.00,
      tax_category: "services"
    }
  ],
  currency: "EUR",
  payment_terms: "net_30",
  auto_calculate_tax: true, // Automatic VAT calculation
  e_invoice_standard: "peppol" // Generate Peppol e-invoice
});

// Tax is automatically calculated
console.log(invoice.tax_amount); // €270.00 (18% Spanish VAT)
console.log(invoice.total_amount); // €1,770.00

// E-invoice XML generated automatically
console.log(invoice.e_invoice_xml); // UBL 2.1 XML
console.log(invoice.blockchain_hash); // 0x1a2b3c4d...
\`\`\`

**Tax Calculation API**:

\`\`\`javascript
// Calculate tax before creating invoice (preview)
const taxPreview = await base44.functions.invoke('taxCalculationEngine', {
  seller_country: "DE",
  seller_vat_number: "DE123456789",
  buyer_country: "FR",
  buyer_vat_number: "FR987654321", // Business customer
  product_category: "digital_services",
  amount: 1000.00,
  currency: "EUR"
});

// Pakistan sales tax example
const pakistanTax = await base44.functions.invoke('taxCalculationEngine', {
  seller_country: "PK",
  seller_ntn: "9876543-2",
  buyer_country: "PK",
  buyer_ntn: "1234567-8",
  product_category: "services",
  amount: 100000.00,
  currency: "PKR"
});

console.log(taxPreview.data);
/*
{
  "tax_applicable": true,
  "tax_type": "reverse_charge",
  "tax_rate": 0,
  "tax_amount": 0,
  "net_amount": 1000.00,
  "gross_amount": 1000.00,
  "tax_note": "Reverse charge - Article 44 VAT Directive",
  "buyer_self_assess": true,
  "buyer_self_assess_rate": 20 // FR VAT rate for buyer's records
}
*/
\`\`\`

---

## Compliance & Retention

### Legal Requirements

**Invoice Archival**:

| Jurisdiction | Retention Period | Format | Requirements |
|--------------|------------------|--------|--------------|
| **EU** | 10 years | Original format (XML + PDF) | Unalterable, searchable |
| **UK** | 6 years | Original format | HMRC approved storage |
| **US** | 7 years (IRS), varies by state | PDF acceptable | Readable, accessible |
| **Saudi Arabia** | 6 years | XML + PDF with QR | ZATCA portal submission |
| **Mexico** | 5 years | XML (CFDI) | SAT certification |
| **Australia** | 5 years | PDF acceptable | ATO guidelines |
| **Pakistan** | 7 years | JSON + PDF | PRAL/FBR IRIS portal submission |

**FTS.Money Archive System**:
- All invoices stored in AWS S3 (encrypted)
- Indexed in PostgreSQL for search
- Blockchain hash for verification
- Automated retention policy (delete after legal period + 1 year)
- Export functionality for customer data requests (GDPR)

---

## Conclusion

The FTS.Money Invoicing & Tax Management System provides:

✅ **Global tax compliance** - 150+ countries supported  
✅ **Multi-standard e-invoicing** - Peppol, ZATCA, FatturaPA, CFDI, XRechnung  
✅ **Automated VAT calculation** - Handles complex cross-border rules  
✅ **Blockchain verification** - Immutable invoice audit trail  
✅ **Three-tier invoicing** - Platform → PSP → Merchant → Customer  
✅ **Accounting integration** - Xero, QuickBooks sync  

**Future Enhancements (2026)**:
- Real-time tax reporting to authorities
- MTD (Making Tax Digital) UK integration
- SII (Suministro Inmediato de Información) Spain
- Automated tax return filing
- AI-powered tax optimization

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 8, 2026
- **Owner:** FTS.Money Finance Team
- **Contact:** finance@fts.money

© 2026 FTS.Money. All rights reserved.
`;

export default InvoicingSystemDoc;