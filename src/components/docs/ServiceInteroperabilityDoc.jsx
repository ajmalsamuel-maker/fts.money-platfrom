import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const ServiceInteroperabilityDoc = `# FTS Service Interoperability & Composite Solutions
## Advanced Multi-Service Integration Architecture

**Version:** 2.0  
**Last Updated:** January 5, 2026  
**Classification:** Public - Technical Architecture

---

## Executive Summary

The FTS.Money platform is architected from the ground up for **service interoperability**—enabling customers to combine individual services into powerful composite solutions that solve complex business problems. Unlike traditional siloed payment platforms, FTS.Money services share common data models, authentication systems, and integration points, allowing seamless data flow and coordinated operations across the entire stack.

### Why Service Interoperability Matters

**Traditional Payment Infrastructure Problem:**
- Separate vendors for payment processing, crypto, invoicing, tax compliance
- Manual data entry between systems (error-prone, time-consuming)
- Inconsistent data formats requiring custom mapping
- Multiple admin portals with different logins
- Fragmented customer experience
- High integration costs ($50K-$500K per integration)

**FTS.Money Interoperability Solution:**
- All services on one platform with unified data model
- Automatic data sharing between services (zero manual entry)
- Consistent ISO 20022/ISO 8583 standards across services
- Single sign-on (SSO) across all portals
- Unified customer experience
- Zero integration cost (services designed to work together)

### Core Interoperability Principles

\`\`\`mermaid
graph TB
    subgraph "Interoperability Pillars"
        P1[Shared Data Model<br/>Common Schemas]
        P2[Unified Authentication<br/>Cross-Service SSO]
        P3[Event-Driven Architecture<br/>Real-Time Integration]
        P4[ISO Standards Compliance<br/>Global Interoperability]
        P5[API-First Design<br/>Composable Services]
    end
    
    subgraph "Benefits"
        B1[Zero Integration Effort<br/>Pre-Connected]
        B2[Real-Time Data Flow<br/>No Batch Delays]
        B3[Consistent UX<br/>Single Portal]
        B4[Operational Efficiency<br/>Automated Workflows]
        B5[Revenue Stacking<br/>Multiple Service Fees]
    end
    
    P1 --> B1
    P2 --> B3
    P3 --> B2
    P4 --> B1
    P5 --> B1
    
    B1 --> B4
    B2 --> B4
    B3 --> B4
    B4 --> B5
    
    style P1 fill:#2563eb,color:#fff
    style P3 fill:#10b981,color:#fff
    style B5 fill:#f59e0b,color:#fff
\`\`\`

---

## Service Compatibility Matrix

### Complete Service Integration Map

| Service | PSP Platform | VASP | ISO Gateway | Orchestration | RWA | VAT/Tax | E-Invoicing | Marketplace |
|---------|--------------|------|-------------|---------------|-----|---------|-------------|-------------|
| **PSP Platform** | — | ✅ Crypto rails | ✅ Settlement | ✅ Routing | ✅ Payments | ✅ Auto tax | ✅ Auto invoice | ✅ All services |
| **VASP** | ✅ Fiat on/off | — | ✅ Bank transfers | ✅ Liquidity | ✅ Asset backing | ✅ Crypto tax | ✅ Invoicing | ✅ Compliance |
| **ISO Gateway** | ✅ Legacy systems | ✅ SWIFT | — | ✅ Message routing | ✅ Settlement | ✅ Tax data | ✅ ISO 20022 | ❌ N/A |
| **Orchestration** | ✅ Multi-processor | ✅ Best rates | ✅ Protocol translation | — | ✅ Payment rails | ✅ Cost optimization | ❌ N/A | ✅ Provider selection |
| **RWA** | ✅ Fiat settlement | ✅ Crypto settlement | ✅ Bank integration | ✅ Dividend payments | — | ✅ Income tax | ✅ Capital events | ✅ Custody |
| **VAT/Tax** | ✅ Real-time calc | ✅ Crypto tax | ✅ ISO integration | ✅ Fee optimization | ✅ Dividend tax | — | ✅ Tax invoice | ❌ N/A |
| **E-Invoicing** | ✅ Payment invoices | ✅ Crypto invoices | ✅ Bank statements | ❌ N/A | ✅ Asset reports | ✅ VAT breakdown | — | ❌ N/A |
| **Marketplace** | ✅ KYC/AML/Fraud | ✅ Custody/Exchange | ❌ N/A | ✅ Processors | ✅ Custody/Oracle | ❌ N/A | ❌ N/A | — |

**Legend:**
- ✅ = Native integration with data sharing
- ❌ = Not applicable or no integration point

---

## Composite Solution Patterns

### Pattern 1: Complete EU E-Commerce Payment Platform

**Services Combined:**
- PSP Platform (payment processing)
- Payment Orchestration (multi-processor routing)
- VAT/Tax Management (automated EU compliance)
- E-Invoicing (Peppol BIS 3.0)
- ISO Gateway (bank settlement via SEPA)
- Service Marketplace (fraud prevention, KYC)

**Architecture:**

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant Merchant
    participant PSP as PSP Platform
    participant Orch as Orchestration
    participant Processor as Payment Processor
    participant Tax as VAT Engine
    participant Invoice as E-Invoice Engine
    participant Peppol as Peppol Network
    participant ISO as ISO Gateway
    participant Bank as Acquiring Bank
    participant KYC as KYC Service (Marketplace)
    
    Customer->>Merchant: Purchase €1,000 Product
    Merchant->>PSP: Process Payment Request
    
    PSP->>KYC: Verify Customer (if high-risk)
    KYC-->>PSP: Customer Clear
    
    PSP->>Tax: Calculate VAT
    Note over Tax: Customer in DE (19% VAT)<br/>Merchant in IE (23% VAT)<br/>B2C Digital Service<br/>Apply Destination Principle
    Tax-->>PSP: VAT €190 (DE rate)<br/>UNCL5305: S (Standard)
    
    PSP->>Orch: Route Payment €1,190
    Orch->>Orch: Analyze: DE card, €1,190, success priority
    Orch->>Orch: Select: Processor A (98.5% success DE)
    Orch->>Processor: Authorize €1,190
    Processor-->>Orch: Approved - Auth Code ABC123
    Orch-->>PSP: Payment Success
    
    PSP->>Invoice: Generate E-Invoice
    Note over Invoice: Peppol BIS 3.0 Format<br/>UBL 2.1 XML<br/>VAT Breakdown Included
    Invoice->>Invoice: Validate Schema
    Invoice->>Invoice: Sign with X.509 Cert
    Invoice->>Peppol: Submit via Access Point
    Peppol-->>Invoice: Delivered to Customer
    Invoice-->>PSP: Invoice INV-2024-001234
    
    PSP->>ISO: Generate ISO 20022 Settlement
    Note over ISO: pacs.008 (Credit Transfer)<br/>SEPA Instant Payment
    ISO->>Bank: SEPA SCT Inst Message
    Bank-->>ISO: Settlement Confirmed
    ISO-->>PSP: Funds Settled
    
    PSP-->>Merchant: Payment Complete
    PSP->>Customer: Send E-Invoice + Receipt
    
    Note over Customer,Bank: End-to-End Time: 4.2 seconds
\`\`\`

**Data Flow & Revenue Stack:**

\`\`\`yaml
transaction_data_flow:
  step_1_payment_request:
    input:
      amount: 1000.00
      currency: EUR
      customer_country: DE
      merchant_country: IE
      service_type: digital_services
      
  step_2_vat_calculation:
    determination:
      jurisdiction: Germany
      reason: "B2C digital services - destination principle (Article 58)"
    calculation:
      taxable_amount: 1000.00
      vat_rate: 19.0
      vat_amount: 190.00
      total: 1190.00
    output_to: payment_processing, e_invoicing
    
  step_3_orchestration:
    routing_decision:
      analyzed_factors:
        - card_bin: German bank
        - amount: 1190 EUR
        - time: Peak hours
        - success_rates: [A: 98.5%, B: 97.2%, C: 96.8%]
      selected_processor: Processor A
      estimated_cost: 2.3% (€27.37)
      backup_processors: [B, C]
    output_to: payment_processing
    
  step_4_payment_authorization:
    processor: Processor A
    auth_code: ABC123
    processing_fee: 27.37
    settlement_date: T+1
    output_to: e_invoicing, iso_gateway
    
  step_5_e_invoice_generation:
    standard: peppol_bis_3
    vat_breakdown:
      - rate: 19%, amount: 1000.00, vat: 190.00
    invoice_number: INV-2024-001234
    peppol_endpoint: 9914:de12345678
    status: delivered
    output_to: merchant, customer
    
  step_6_settlement:
    iso_message: pacs.008
    amount: 1190.00
    settlement_rail: SEPA Instant
    bank_reference: SI2024010500123456
    status: settled
    
revenue_stack:
  payment_processing_fee:
    rate: 2.5%
    amount: 29.75
    
  orchestration_fee:
    per_transaction: 0.01
    
  vat_compliance_fee:
    per_calculation: 0.10
    
  e_invoicing_fee:
    per_invoice: 0.15
    
  iso_gateway_fee:
    per_message: 0.05
    
  total_merchant_fee: 30.06
  merchant_pays: 1220.06
  gross_margin: 30.06 / 1220.06 = 2.46%
  
  breakdown:
    - processor_cost: 27.37 (passed through)
    - fts_revenue: 2.69
    - fts_margin: 2.69 / 30.06 = 8.95%
\`\`\`

**Business Outcomes:**
- **Merchant:** One-click payment acceptance with automatic tax compliance and invoicing
- **Customer:** Receives compliant e-invoice via Peppol network
- **Tax Authority:** Real-time visibility into transaction and VAT
- **PSP:** Revenue from 5 services on a single transaction
- **FTS.Money:** €2.69 revenue per transaction from platform fees

---

### Pattern 2: Crypto-to-Fiat Payment Bridge with Full Compliance

**Services Combined:**
- VASP Platform (crypto acceptance)
- KYC/KYB Verification (Marketplace - Sumsub/Jumio)
- AML/CFT Screening (Marketplace - Chainalysis)
- Travel Rule Engine (IVMS101 compliance)
- Payment Processing (fiat settlement)
- Multi-Currency FX (crypto→fiat conversion)
- VAT/Tax Management (crypto tax treatment)
- E-Invoicing (transaction invoice)

**Use Case:** Customer pays merchant in Bitcoin, merchant receives EUR with full regulatory compliance.

\`\`\`mermaid
sequenceDiagram
    participant Customer as Crypto Customer
    participant VASP as VASP Platform
    participant KYC as KYC Service
    participant AML as AML Screening
    participant Travel as Travel Rule Engine
    participant FX as FX Engine
    participant Tax as Tax Engine
    participant Payment as Payment Processing
    participant Invoice as E-Invoice Engine
    participant Merchant
    
    Customer->>VASP: Pay 0.05 BTC
    VASP->>KYC: Verify Customer Identity
    
    alt First-Time Customer
        KYC->>KYC: Document Verification
        KYC->>KYC: Liveness Check
        KYC->>KYC: LEI Verification (if corporate)
        KYC-->>VASP: Verified (Risk: Low)
    else Returning Customer
        KYC-->>VASP: Cached Verification
    end
    
    VASP->>AML: Screen Transaction
    AML->>AML: Sanctions List Check (OFAC, UN, EU)
    AML->>AML: PEP Database Check
    AML->>AML: Adverse Media Scan
    AML->>AML: Blockchain Analysis (tainted coins)
    AML-->>VASP: Risk Score: 12 (Low)
    
    VASP->>VASP: Check Amount = $2,150
    
    alt Amount >= $1,000 (Travel Rule Threshold)
        VASP->>Travel: Exchange IVMS101 Data
        Travel->>Travel: Originator: Customer Wallet
        Travel->>Travel: Beneficiary: Merchant VASP
        Travel->>Travel: Transmit via TRISA Protocol
        Travel-->>VASP: Travel Rule Compliant
    else Amount < $1,000
        Note over VASP: Skip Travel Rule
    end
    
    VASP->>VASP: Confirm BTC Receipt (3 confirmations)
    VASP->>FX: Convert BTC to USD
    FX->>FX: BTC Price: $43,000
    FX->>FX: 0.05 BTC = $2,150
    FX->>FX: Apply Spread: 1.5%
    FX-->>VASP: $2,117.75 USD
    
    VASP->>FX: Convert USD to EUR
    FX->>FX: EUR/USD Rate: 1.08
    FX->>FX: $2,117.75 = €1,961
    FX->>FX: Apply Spread: 0.5%
    FX-->>VASP: €1,951 EUR
    
    VASP->>Tax: Calculate VAT on Crypto Payment
    Tax->>Tax: Crypto Service Fee: €30
    Tax->>Tax: Customer DE, Merchant IE
    Tax->>Tax: Financial Service (Often Exempt)
    Tax->>Tax: Check Exemption Rules
    Tax-->>VASP: Service Fee VAT: €5.40 @ 18% DE
    
    VASP->>Payment: Settle to Merchant Account
    Payment->>Payment: Net Amount: €1,951
    Payment->>Payment: Service Fee: €30 + €5.40 VAT
    Payment->>Payment: Total to Merchant: €1,915.60
    Payment-->>Merchant: Funds Settled
    
    Payment->>Invoice: Generate Transaction Invoice
    Invoice->>Invoice: Line 1: Crypto payment received €1,951
    Invoice->>Invoice: Line 2: Service fee €30 + €5.40 VAT
    Invoice->>Invoice: Format: Peppol BIS 3.0
    Invoice->>Invoice: Sign with Certificate
    Invoice->>Invoice: Submit to Peppol Network
    Invoice-->>Merchant: Invoice Delivered
    
    Merchant->>Customer: Order Confirmed + Invoice
    
    Note over Customer,Merchant: Total Processing Time: 18 minutes<br/>(3 BTC confirmations + processing)
\`\`\`

**Revenue Model Analysis:**

\`\`\`yaml
crypto_fiat_bridge_revenue:
  transaction_value: 0.05 BTC = $2,150 = €1,951
  
  revenue_sources:
    crypto_exchange_spread:
      btc_to_usd: 1.5%
      revenue: $32.25
      
    fx_conversion_spread:
      usd_to_eur: 0.5%
      revenue: $10.59
      
    vasp_service_fee:
      flat_fee: €30.00
      percentage: 1.54%
      
    aml_screening:
      per_transaction: €0.50
      
    kyc_verification:
      per_new_customer: €5.00
      amortized_per_tx: €0.25
      
    travel_rule:
      per_ivms101_exchange: €0.50
      
    vat_calculation:
      per_calculation: €0.10
      
    e_invoicing:
      per_invoice: €0.15
      
  total_fts_revenue:
    gross: €75.34
    margin: 3.86%
    
  cost_breakdown:
    chainalysis_aml: €0.30
    sumsub_kyc: €3.50
    peppol_transmission: €0.05
    infrastructure: €1.20
    total_costs: €5.05
    
  net_profit:
    amount: €70.29
    net_margin: 3.60%
    
  annual_projection:
    avg_transactions_per_month: 10000
    monthly_revenue: €753,400
    annual_revenue: €9,040,800
\`\`\`

---

### Pattern 3: Tokenized Asset Platform with Fiat Settlement

**Services Combined:**
- RWA Platform (asset tokenization)
- KYC/KYB Verification (investor accreditation)
- LEI/vLEI Integration (entity verification)
- Payment Processing (subscription payments, dividend distribution)
- ISO Gateway (ISO 20022 bank integration)
- VAT/Tax (capital gains, dividend withholding)
- E-Invoicing (investor statements)
- VASP (optional crypto settlement)

**Use Case:** Tokenize commercial real estate with automated dividend distribution to 500 investors.

\`\`\`mermaid
flowchart TB
    subgraph "Asset Issuance Phase"
        A1[Asset Issuer] --> A2[Submit Property Details]
        A2 --> A3[KYB Verification]
        A3 --> A4[LEI Verification via GLEIF]
        A4 --> A5[Asset Valuation via Oracle]
        A5 --> A6[Deploy ERC-3643 Token]
        A6 --> A7[Custody with Fireblocks]
    end
    
    subgraph "Investor Onboarding Phase"
        I1[500 Investors] --> I2[KYC Verification]
        I2 --> I3[Accreditation Check]
        I3 --> I4[vLEI Credential Check]
        I4 --> I5[Investor Wallet Created]
        I5 --> I6[Compliance Approved]
    end
    
    subgraph "Token Purchase Phase"
        P1[Investor Payment] --> P2{Payment Method}
        P2 -->|Fiat| P3[Bank Transfer via ISO 20022]
        P2 -->|Crypto| P4[VASP Platform]
        
        P3 --> P5[ISO Gateway Receives pacs.008]
        P4 --> P5
        P5 --> P6[Payment Processing Confirms]
        
        P6 --> P7[Calculate Purchase Tax]
        P7 --> P8[Token Transfer to Investor]
        P8 --> P9[Generate Purchase Invoice]
        P9 --> P10[E-Invoice via Peppol]
    end
    
    subgraph "Dividend Distribution Phase (Quarterly)"
        D1[Rental Income Received] --> D2[Calculate NAV]
        D2 --> D3[Determine Dividend per Token]
        D3 --> D4[Query 500 Token Holders]
        D4 --> D5[Calculate Withholding Tax per Investor]
        
        D5 --> D6{Investor Preference}
        D6 -->|Fiat EUR| D7[ISO 20022 pacs.008 Payment]
        D6 -->|Fiat USD| D8[SWIFT MT103 Payment]
        D6 -->|Crypto USDC| D9[VASP Crypto Transfer]
        
        D7 --> D10[Batch 500 Payments]
        D8 --> D10
        D9 --> D10
        
        D10 --> D11[Generate Dividend Statements]
        D11 --> D12[E-Invoice per Investor]
        D12 --> D13[Tax Reporting to Authorities]
    end
    
    A7 --> I1
    I6 --> P1
    P10 --> D1
    
    style A6 fill:#2563eb,color:#fff
    style I6 fill:#10b981,color:#fff
    style D10 fill:#8b5cf6,color:#fff
    style D13 fill:#f59e0b,color:#fff
\`\`\`

**Interoperability Value Creation:**

| Integration Point | Service A | Service B | Value Created | Revenue Impact |
|-------------------|-----------|-----------|---------------|----------------|
| **RWA + LEI/vLEI** | Asset tokenization | Entity verification | Instant issuer verification, credential chain provenance | Faster onboarding, lower fraud risk |
| **RWA + KYC** | Investor onboarding | Identity verification | Automated accreditation, regulatory compliance | Reduced manual review cost |
| **RWA + Payment** | Dividend distribution | Fiat settlement | Automated quarterly payouts to 500 investors | No manual payment processing |
| **Payment + ISO Gateway** | Fiat transfer | Bank integration | ISO 20022 SEPA/SWIFT settlement | Connect to any bank globally |
| **Payment + VAT/Tax** | Dividend payment | Withholding tax | Auto-calculate tax per investor jurisdiction | Tax compliance included |
| **Tax + E-Invoicing** | Tax calculation | Investor statement | Compliant dividend statements with tax breakdown | Regulatory reporting automated |
| **RWA + VASP** | Token sales | Crypto payment | Accept crypto for token purchases | Crypto investor market access |

**Financial Model:**

\`\`\`
Commercial Property Tokenization Example:

Asset: €10M commercial building (Dublin, Ireland)
Token Supply: 10,000 tokens × €1,000 each
Investors: 500 qualified investors
Annual Rental Income: €600,000 (6% yield)
Quarterly Dividend: €150,000

Service Fees (Annual):

1. RWA Platform:
   - Tokenization fee: 1.0% × €10M = €100,000 (one-time)
   - Custody fee: 0.20% × €10M = €20,000/year
   - Trading fee: 0.25% × €2M secondary = €5,000/year
   
2. KYC/KYB (Marketplace):
   - Issuer verification: €500
   - 500 investors × €15 enhanced KYC = €7,500
   
3. LEI/vLEI:
   - Issuer LEI annual: €200
   - Investor LEI (optional): 100 × €65 = €6,500
   
4. Payment Processing (Dividend Distribution):
   - 4 quarters × 500 investors = 2,000 payments
   - Bank transfer fee: €0.50 × 2,000 = €1,000
   
5. ISO Gateway (Bank Settlement):
   - pacs.008 messages: €0.05 × 2,000 = €100
   
6. VAT/Tax:
   - Withholding tax calculation: €0.10 × 2,000 = €200
   
7. E-Invoicing:
   - Dividend statements: €0.15 × 2,000 = €300
   
Total Annual FTS Revenue: €141,300
Total Asset Value: €10,000,000
Platform Fee as % of AUM: 1.41%

Comparison to Traditional:
  - Law firm: €50K-€100K
  - Custody: 0.50% AUM = €50K
  - Transfer agent: €25K
  - Compliance: €30K
  - Traditional Total: €155K-€205K
  
FTS Savings: €13.7K - €63.7K (7-31% cheaper)
Additional Value: Automated, real-time, blockchain-secured
\`\`\`

---

### Pattern 4: Cross-Border B2B Payment Platform

**Services Combined:**
- PSP Platform
- ISO Gateway (SWIFT MT → ISO 20022 translation)
- Payment Orchestration (multi-bank routing)
- VAT/Tax (reverse charge automation)
- E-Invoicing (Peppol cross-border)
- LEI/vLEI (entity verification)

**Use Case:** UK software company invoicing German enterprise customer with ISO 20022 bank settlement.

\`\`\`mermaid
sequenceDiagram
    participant UK_Supplier as UK Software Co
    participant PSP as PSP Platform
    participant LEI as LEI Verification
    participant Tax as VAT Engine
    participant Invoice as E-Invoice Engine
    participant Peppol as Peppol Network
    participant ISO as ISO Gateway
    participant SWIFT as SWIFT Network
    participant Bank as DE Bank
    participant DE_Customer as German Enterprise
    
    UK_Supplier->>PSP: Create Invoice €50,000
    PSP->>LEI: Verify UK Supplier LEI
    LEI-->>PSP: LEI Valid: 213800ABCDEF123456
    
    PSP->>LEI: Verify DE Customer LEI
    LEI-->>PSP: LEI Valid: 529900XYZABC789012
    
    PSP->>Tax: Calculate VAT (B2B Cross-Border)
    Tax->>Tax: UK Supplier, DE Customer
    Tax->>Tax: B2B Service (Software)
    Tax->>Tax: Both EU VAT Registered
    Tax->>Tax: Apply Reverse Charge (Article 196)
    Tax-->>PSP: VAT: €0 (Reverse Charge - UNCL5305: AE)
    
    PSP->>Invoice: Generate Peppol Invoice
    Invoice->>Invoice: UBL 2.1 XML
    Invoice->>Invoice: Add Reverse Charge Note
    Invoice->>Invoice: Add LEI References
    Invoice->>Invoice: Sign with Certificate
    Invoice->>Peppol: Submit to Peppol Network
    
    Peppol->>Peppol: Lookup DE Customer SMP
    Peppol->>Peppol: Route to Access Point
    Peppol-->>DE_Customer: Deliver Invoice
    
    DE_Customer->>DE_Customer: Review Invoice
    DE_Customer->>Bank: Initiate Payment €50,000
    Bank->>ISO: ISO 20022 pacs.008 (Credit Transfer)
    
    ISO->>ISO: Validate ISO 20022 Message
    ISO->>ISO: Extract Payment Details
    ISO->>SWIFT: Convert to MT103 (if needed)
    SWIFT->>SWIFT: Route via SWIFT Network
    SWIFT-->>ISO: Payment Confirmed
    
    ISO->>PSP: Receive ISO 20022 pacs.002 (Status)
    PSP->>PSP: Match Payment to Invoice
    PSP->>UK_Supplier: Funds Received
    
    PSP->>Tax: Generate VAT Report
    Tax->>Tax: Log Reverse Charge Transaction
    Tax->>Tax: EC Sales List Entry
    Tax-->>UK_Supplier: VAT Return Data Ready
    
    Note over UK_Supplier,DE_Customer: Settlement Time: T+1 to T+3<br/>Customer Self-Assesses VAT in Germany
\`\`\`

**Reverse Charge Tax Treatment:**

\`\`\`yaml
reverse_charge_scenario:
  supplier: UK (post-Brexit, but example applies to intra-EU)
  customer: Germany
  service: Software licensing (B2B)
  amount: €50,000
  
  vat_treatment:
    supplier_charges_vat: false
    supplier_vat_output: €0
    customer_self_assesses: true
    customer_vat_input: €9,500 (19%)
    customer_vat_output: €9,500 (19%)
    customer_net_vat: €0 (input = output)
    
  invoice_requirements:
    - "State 'Reverse charge' on invoice"
    - "Include customer VAT number"
    - "UNCL5305 code: AE"
    - "Invoice total: €50,000 (no VAT added)"
    
  supplier_reporting:
    - "Include in EC Sales List (if intra-EU)"
    - "Report €50,000 to HMRC"
    - "No VAT collected, so no VAT payment"
    
  customer_reporting:
    - "Self-assess €9,500 VAT on German VAT return"
    - "Claim €9,500 input VAT on same return"
    - "Net effect: €0 VAT payment (if fully deductible)"
    
  compliance_documentation:
    - "Valid customer VAT number verified via VIES"
    - "Reverse charge noted on Peppol invoice"
    - "LEI credentials for both parties (optional but recommended)"
    - "Payment trace via ISO 20022 message"
\`\`\`

---

## Advanced Interoperability: 10-Step KYB/KYC & AML Framework

### Universal 10-Step Verification Process

All FTS.Money services requiring customer onboarding (VASP, RWA, PSP merchant onboarding) utilize a standardized **10-step KYB/KYC and AML verification framework** with **LEI/vLEI provenance tracking** for complete regulatory compliance and audit trails.

\`\`\`mermaid
flowchart TD
    A[Customer Onboarding Request] --> B[Step 1: Initial Screening]
    
    B --> C{Entity Type}
    C -->|Individual| D[KYC Process]
    C -->|Business| E[KYB Process]
    
    subgraph "10-Step KYB Process (Business)"
        E --> E1[1. Business Information Collection]
        E1 --> E2[2. LEI Verification via GLEIF]
        E2 --> E3[3. vLEI Credential Check]
        E3 --> E4[4. Document Verification]
        E4 --> E5[5. UBO Identification]
        E5 --> E6[6. Sanctions & PEP Screening]
        E6 --> E7[7. Adverse Media Check]
        E7 --> E8[8. Business Activity Verification]
        E8 --> E9[9. Source of Funds Verification]
        E9 --> E10[10. Risk Scoring & Decision]
    end
    
    subgraph "10-Step KYC Process (Individual)"
        D --> D1[1. Personal Information Collection]
        D1 --> D2[2. Document Verification - ID/Passport]
        D2 --> D3[3. Liveness Detection - Selfie]
        D3 --> D4[4. Address Verification - Utility Bill]
        D4 --> D5[5. PEP Screening]
        D5 --> D6[6. Sanctions List Screening]
        D6 --> D7[7. Adverse Media Check]
        D7 --> D8[8. Source of Wealth Verification]
        D8 --> D9[9. Employment/Income Verification]
        D9 --> D10[10. Risk Scoring & Decision]
    end
    
    E10 --> F{Risk Decision}
    D10 --> F
    
    F -->|Low Risk| G[Auto-Approve]
    F -->|Medium Risk| H[Manual Review Required]
    F -->|High Risk| I[Enhanced Due Diligence]
    F -->|Prohibited| J[Auto-Reject]
    
    G --> K[Onboarding Complete]
    H --> L[Compliance Officer Review]
    L --> K
    I --> M[Senior Compliance Review]
    M --> K
    J --> N[Rejection Notice]
    
    K --> O[Create Customer Account]
    O --> P[Ongoing Monitoring Enabled]
    
    style E2 fill:#2563eb,color:#fff
    style E3 fill:#8b5cf6,color:#fff
    style F fill:#f59e0b,color:#fff
    style G fill:#10b981,color:#fff
    style J fill:#ef4444,color:#fff
\`\`\`

### Step-by-Step KYB Breakdown with LEI/vLEI Provenance

**Step 1: Business Information Collection**

\`\`\`yaml
step_1_business_information:
  required_fields:
    legal_entity:
      - legal_name: "Official registered business name"
      - trading_name: "DBA (Doing Business As) if different"
      - registration_number: "Company registration number"
      - registration_country: "ISO 3166-1 alpha-2 code"
      - registration_date: "Date of incorporation"
      - legal_form: "LLC, Corporation, Partnership, etc."
      - tax_id: "VAT number, EIN, or local tax ID"
      
    business_address:
      - registered_address: "Legal headquarters"
      - operational_address: "Main business location"
      - mailing_address: "Correspondence address"
      
    business_activity:
      - industry: "Industry sector"
      - mcc_code: "Merchant Category Code (ISO 18245)"
      - business_description: "What the business does"
      - website: "Company website URL"
      - expected_monthly_volume: "Transaction volume estimate"
      
    contact_information:
      - primary_contact_name: "Main contact person"
      - primary_contact_email: "Email address"
      - primary_contact_phone: "Phone number with country code"
      - authorized_signatory: "Person authorized to sign agreements"
      
  data_sources:
    - "Business registration certificate"
    - "Articles of incorporation"
    - "Operating agreement"
    - "EIN/VAT registration document"
\`\`\`

**Step 2: LEI Verification via GLEIF API**

\`\`\`javascript
/**
 * Verify Legal Entity Identifier via GLEIF API
 * Implements ISO 17442-1 (LEI) and ISO 17442-3 (vLEI)
 */
async function verifyLEI(businessData) {
  let leiVerification = {
    has_lei: false,
    lei_status: 'not_provided',
    lei_number: null,
    verified: false,
    entity_legal_name: null,
    gleif_data: null,
    credential_chain: [],
    provenance_score: 0
  };
  
  // Check if LEI was provided
  if (businessData.lei) {
    // Query GLEIF API
    const gleifResponse = await fetch(
      \`https://api.gleif.org/api/v1/lei-records/\${businessData.lei}\`
    );
    
    if (gleifResponse.ok) {
      const leiData = await gleifResponse.json();
      const entity = leiData.data.attributes.entity;
      const registration = leiData.data.attributes.registration;
      
      leiVerification = {
        has_lei: true,
        lei_number: businessData.lei,
        lei_status: registration.status, // ISSUED, LAPSED, etc.
        verified: registration.status === 'ISSUED',
        entity_legal_name: entity.legalName.name,
        entity_legal_address: entity.legalAddress,
        registration_authority: registration.registrationAuthority,
        registration_date: entity.creationDate,
        gleif_data: leiData,
        provenance_score: 80 // High trust - verified by GLEIF
      };
      
      // Check for parent LEI (ownership chain)
      if (leiData.data.relationships?.['direct-parent']?.data) {
        leiVerification.parent_lei = leiData.data.relationships['direct-parent'].data.id;
        leiVerification.credential_chain.push(leiVerification.parent_lei);
        leiVerification.provenance_score += 10; // +10 for credential chain
      }
      
      // Verify legal name matches provided data
      const nameMatch = fuzzyMatch(
        entity.legalName.name.toLowerCase(),
        businessData.legal_name.toLowerCase()
      );
      
      if (nameMatch < 0.8) {
        leiVerification.warnings = [
          \`Legal name mismatch: GLEIF="\${entity.legalName.name}" vs Provided="\${businessData.legal_name}"\`
        ];
        leiVerification.provenance_score -= 20;
      }
    } else {
      leiVerification.lei_status = 'not_found';
      leiVerification.errors = ['LEI not found in GLEIF database'];
    }
  } else {
    // No LEI provided - initiate grace period
    leiVerification.lei_status = 'not_provided';
    leiVerification.grace_period_start = new Date();
    leiVerification.grace_period_end = addDays(new Date(), 90);
    leiVerification.provenance_score = 20; // Low trust without LEI
  }
  
  return leiVerification;
}
\`\`\`

**Step 3: vLEI Credential Verification**

\`\`\`javascript
/**
 * Verify vLEI (Verifiable LEI) credential if provided
 * Implements W3C Verifiable Credentials + ISO 17442-3
 */
async function verifyVLEI(businessData, leiVerification) {
  let vleiStatus = {
    has_vlei: false,
    credential_type: null,
    issuer: null,
    verified: false,
    trust_score: 0,
    credential_chain: [],
    oor_role: null, // Organizational Role
    ecr_context: null // Engagement Context Record
  };
  
  if (!businessData.vlei_credential) {
    return { ...vleiStatus, status: 'not_provided' };
  }
  
  try {
    // Parse W3C Verifiable Credential
    const credential = JSON.parse(businessData.vlei_credential);
    
    // Verify credential structure
    if (!credential['@context'] || !credential.type || !credential.credentialSubject) {
      throw new Error('Invalid vLEI credential structure');
    }
    
    // Verify credential type
    const isValidType = credential.type.includes('VerifiableCredential') &&
                       credential.type.includes('LegalEntityvLEICredential');
    
    if (!isValidType) {
      throw new Error('Not a valid LEI vLEI credential');
    }
    
    // Verify credential subject matches LEI
    if (credential.credentialSubject.LEI !== leiVerification.lei_number) {
      throw new Error('vLEI credential LEI does not match provided LEI');
    }
    
    // Verify issuer is a Qualified vLEI Issuer (QVI)
    const qviList = await fetchQVIList(); // From GLEIF
    const issuerIsQVI = qviList.some(qvi => qvi.id === credential.issuer);
    
    if (!issuerIsQVI) {
      throw new Error('Credential issuer is not a Qualified vLEI Issuer');
    }
    
    // Verify cryptographic proof
    const proofValid = await verifyCredentialProof(credential);
    
    if (!proofValid) {
      throw new Error('Credential cryptographic proof invalid');
    }
    
    // Check expiration
    if (credential.expirationDate) {
      const expiry = new Date(credential.expirationDate);
      if (expiry < new Date()) {
        throw new Error('vLEI credential has expired');
      }
    }
    
    // Extract Organizational Role (OOR) if present
    let oorRole = null;
    if (credential.credentialSubject.organizationalRole) {
      oorRole = {
        role: credential.credentialSubject.organizationalRole.role,
        person_lei: credential.credentialSubject.organizationalRole.personLEI,
        person_name: credential.credentialSubject.organizationalRole.personName,
        authorized_actions: credential.credentialSubject.organizationalRole.permissions
      };
    }
    
    // Build credential chain
    const chain = [];
    let currentCred = credential;
    while (currentCred.proof?.parentCredential) {
      chain.push(currentCred.proof.parentCredential);
      currentCred = await fetchCredential(currentCred.proof.parentCredential);
    }
    
    vleiStatus = {
      has_vlei: true,
      credential_type: 'LegalEntityvLEICredential',
      issuer: credential.issuer,
      issuer_name: qviList.find(q => q.id === credential.issuer)?.name,
      verified: true,
      trust_score: 100, // Maximum trust with valid vLEI
      credential_chain: chain,
      oor_role: oorRole,
      issued_date: credential.issuanceDate,
      expiry_date: credential.expirationDate,
      status: 'verified'
    };
    
    // Provenance tracking
    vleiStatus.provenance = {
      root_issuer: chain.length > 0 ? chain[chain.length - 1] : credential.issuer,
      chain_length: chain.length,
      chain_verified: true,
      trust_anchor: 'GLEIF',
      verification_timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    vleiStatus.status = 'verification_failed';
    vleiStatus.error = error.message;
    vleiStatus.trust_score = 0;
  }
  
  return vleiStatus;
}
\`\`\`

**vLEI Credential Chain Provenance:**

\`\`\`mermaid
graph TB
    subgraph "vLEI Trust Chain"
        ROOT[GLEIF Root<br/>Trust Anchor]
        QVI[Qualified vLEI Issuer<br/>e.g., DigiCert, Entrust]
        LEI[Legal Entity vLEI<br/>Business/Organization]
        OOR[Official Organizational Role<br/>Authorized Person]
        ECR[Engagement Context Role<br/>Transaction Authority]
    end
    
    ROOT -->|Issues & Authorizes| QVI
    QVI -->|Issues to| LEI
    LEI -->|Issues to| OOR
    OOR -->|Issues for| ECR
    
    ROOT -->|Level 0<br/>Trust Anchor| PROV[Provenance Chain]
    QVI -->|Level 1<br/>QVI Credential| PROV
    LEI -->|Level 2<br/>Entity Credential| PROV
    OOR -->|Level 3<br/>Person Credential| PROV
    ECR -->|Level 4<br/>Context Credential| PROV
    
    PROV --> VERIFY[Cryptographic Verification]
    VERIFY --> TRUST[Trust Score Calculation]
    
    TRUST -->|All Verified| SCORE100[Score: 100<br/>Highest Trust]
    TRUST -->|LEI Only Verified| SCORE80[Score: 80<br/>High Trust]
    TRUST -->|No LEI/vLEI| SCORE20[Score: 20<br/>Low Trust]
    
    style ROOT fill:#10b981,color:#fff
    style QVI fill:#3b82f6,color:#fff
    style LEI fill:#8b5cf6,color:#fff
    style SCORE100 fill:#10b981,color:#fff
    style SCORE20 fill:#ef4444,color:#fff
\`\`\`

**Steps 4-10: Complete KYB Verification:**

\`\`\`yaml
step_4_document_verification:
  required_documents:
    incorporation:
      - "Certificate of incorporation"
      - "Articles of association/bylaws"
      - "Operating agreement (LLC)"
    
    registration:
      - "Business license"
      - "VAT/tax registration certificate"
      - "Trade registry extract (if applicable)"
    
    financial:
      - "Bank account verification letter"
      - "Recent bank statement (last 3 months)"
      - "Financial statements (if required for volume)"
    
    compliance:
      - "AML policy document"
      - "Data protection policy (GDPR)"
      - "Business insurance (if required)"
      
  verification_process:
    - "Extract text via OCR"
    - "Cross-reference with business registry APIs"
    - "Validate document authenticity (watermarks, seals)"
    - "Check document expiry dates"
    - "Flag inconsistencies for manual review"
    
step_5_ubo_identification:
  definition: "Ultimate Beneficial Owner - person owning 25%+ equity"
  requirements:
    - "Full name, date of birth, nationality"
    - "Residential address"
    - "Ownership percentage"
    - "Government-issued ID"
    - "Proof of address"
    
  verification:
    - "KYC checks on each UBO (individual verification)"
    - "Ownership structure diagram"
    - "Cross-check with corporate registry"
    - "PEP screening on each UBO"
    - "Sanctions screening on each UBO"
    
  complex_structures:
    - "Multi-tier ownership: trace to natural persons"
    - "Trust structures: identify trustees and beneficiaries"
    - "Foundations: identify board members"
    
step_6_sanctions_pep_screening:
  sanctions_lists:
    - "OFAC (US Office of Foreign Assets Control)"
    - "UN Security Council Consolidated List"
    - "EU Consolidated List"
    - "UK HM Treasury Sanctions"
    - "AUSTRAC (Australia)"
    - "Country-specific lists (100+ countries)"
    
  screening_process:
    - "Fuzzy name matching (account for typos)"
    - "Date of birth matching (if available)"
    - "Address matching"
    - "Associated entities check"
    - "Indirect ownership screening"
    
  pep_categories:
    - "Heads of state and government"
    - "Senior politicians and officials"
    - "Judicial and military leaders"
    - "State-owned enterprise executives"
    - "Family members of PEPs"
    - "Close associates of PEPs"
    
  pep_treatment:
    - "Automatic enhanced due diligence"
    - "Source of wealth verification mandatory"
    - "Senior management approval required"
    - "Ongoing monitoring increased frequency"
    
step_7_adverse_media_check:
  search_scope:
    - "Global news articles (last 5 years)"
    - "Legal proceedings and court records"
    - "Regulatory actions and fines"
    - "Fraud and financial crime reports"
    - "Bankruptcy and insolvency filings"
    - "Negative business reputation"
    
  risk_categories:
    high_risk:
      - "Financial crime convictions"
      - "Active regulatory investigations"
      - "Recent sanctions violations"
      
    medium_risk:
      - "Civil lawsuits (non-criminal)"
      - "Customer complaints"
      - "Business disputes"
      
    low_risk:
      - "General business news"
      - "Standard corporate announcements"
      
step_8_business_activity_verification:
  verification_methods:
    - "Website audit (content, functionality)"
    - "Social media presence check"
    - "Customer reviews and ratings"
    - "Business registry confirmation"
    - "Trade association membership"
    - "Licensing verification (if regulated)"
    
  red_flags:
    - "No functional website"
    - "Recent incorporation + high volume"
    - "Business activity doesn't match stated purpose"
    - "Shell company indicators"
    - "High-risk jurisdiction"
    
step_9_source_of_funds_verification:
  requirements:
    low_volume:
      threshold: "< €100K/month"
      documentation: "Basic - business bank statements"
      
    medium_volume:
      threshold: "€100K - €1M/month"
      documentation: "Enhanced - financial statements, tax returns"
      
    high_volume:
      threshold: "> €1M/month"
      documentation: "Comprehensive - audited financials, proof of business activity"
      
  verification_steps:
    - "Bank account ownership verification"
    - "Transaction history review (6 months)"
    - "Source of initial capital"
    - "Revenue sources and customer base"
    - "Consistency check with business model"
    
step_10_risk_scoring_decision:
  risk_factors:
    jurisdiction_risk:
      high: ["High-risk FATF countries", "20 points"]
      medium: ["Medium-risk countries", "10 points"]
      low: ["Low-risk OECD countries", "0 points"]
      
    business_type_risk:
      high: ["Crypto exchange, money transmitter", "15 points"]
      medium: ["E-commerce, digital goods", "8 points"]
      low: ["SaaS, professional services", "3 points"]
      
    volume_risk:
      high: ["> €1M/month", "10 points"]
      medium: ["€100K - €1M/month", "5 points"]
      low: ["< €100K/month", "2 points"]
      
    lei_vlei_status:
      verified_vlei: ["-30 points (reduces risk)"]
      verified_lei: ["-20 points"]
      grace_period: ["0 points"]
      no_lei: ["+15 points (increases risk)"]
      
    document_quality:
      complete_certified: ["-10 points"]
      complete_standard: ["0 points"]
      incomplete: ["+10 points"]
      
    adverse_findings:
      none: ["0 points"]
      minor: ["+5 points"]
      major: ["+20 points"]
      critical: ["+50 points (auto-reject)"]
      
  decision_matrix:
    score_0_to_20: "Low Risk → Auto-Approve"
    score_21_to_40: "Medium Risk → Manual Review"
    score_41_to_60: "High Risk → Enhanced Due Diligence"
    score_61_plus: "Prohibited Risk → Auto-Reject"
    
  output:
    - risk_score: "Numerical score 0-100"
    - risk_level: "Low, Medium, High, Prohibited"
    - decision: "Approve, Review, EDD, Reject"
    - reasoning: "Factors contributing to score"
    - recommended_actions: "Next steps"
    - ongoing_monitoring_level: "Standard, Enhanced, Intensive"
\`\`\`

---

## vLEI Authentication Roadmap (Future Enhancement)

### Vision: Password-Free Authentication with vLEI Credentials

**Current State (2026 Q1):**
- Username + password authentication
- 2FA/MFA via email/SMS/TOTP
- Session-based authorization
- API keys for programmatic access

**Future State (2027 Q1 Target):**
- vLEI credential-based authentication
- Cryptographic proof instead of passwords
- W3C Verifiable Presentations
- Zero-knowledge proof for privacy
- Biometric + vLEI for individuals

\`\`\`mermaid
graph TB
    subgraph "Current Authentication (2026)"
        C1[Username + Password]
        C2[2FA Code]
        C3[Session Token]
        C4[API Key]
    end
    
    subgraph "Future vLEI Authentication (2027)"
        F1[vLEI Credential]
        F2[Cryptographic Challenge]
        F3[Digital Signature Response]
        F4[Verifiable Presentation]
        F5[Zero-Knowledge Proof]
    end
    
    subgraph "Benefits of vLEI Auth"
        B1[No Password Storage<br/>Zero Breach Risk]
        B2[Instant Verification<br/>Sub-Second Auth]
        B3[Regulatory Compliant<br/>Audit Trail Built-In]
        B4[Phishing Impossible<br/>Cryptographic Proof]
        B5[Single Credential<br/>All FTS Services]
    end
    
    C1 --> C2
    C2 --> C3
    
    F1 --> F2
    F2 --> F3
    F3 --> F4
    F4 --> F5
    
    F1 -.->|Replaces| C1
    F3 -.->|Replaces| C2
    F4 -.->|Replaces| C3
    
    F5 --> B1
    F5 --> B2
    F5 --> B3
    F5 --> B4
    F5 --> B5
    
    style C1 fill:#ef4444,color:#fff
    style F1 fill:#10b981,color:#fff
    style B1 fill:#2563eb,color:#fff
\`\`\`

### Implementation Roadmap

**Phase 1 (Q2 2026): Foundation**
- \`\`\`yaml
  deliverables:
    - "vLEI credential storage system"
    - "W3C Verifiable Credentials parser"
    - "Digital signature validation service"
    - "HSM integration for key management"
    - "Credential revocation check (GLEIF API)"
    
  infrastructure:
    - "Secure credential vault (encrypted at rest)"
    - "HSM cluster (Thales Luna or AWS CloudHSM)"
    - "Public key infrastructure (PKI) setup"
    - "Credential lifecycle management"
    
  cost: "$50K development + $10K/month HSM"
  timeline: "12 weeks"
  \`\`\`

**Phase 2 (Q3 2026): Pilot Program**
- \`\`\`yaml
  deliverables:
    - "vLEI authentication API endpoints"
    - "Challenge-response protocol implementation"
    - "Verifiable Presentation validation"
    - "Dual authentication support (vLEI + password fallback)"
    - "Admin portal for credential management"
    
  pilot_scope:
    - "10-20 enterprise customers"
    - "Platform admin portal first"
    - "PSP portal second"
    - "Gather feedback and iterate"
    
  success_criteria:
    - "< 2 second authentication time"
    - "100% cryptographic verification success"
    - "Zero password-related security incidents"
    - "90%+ user satisfaction"
    
  cost: "$75K development"
  timeline: "16 weeks"
  \`\`\`

**Phase 3 (Q4 2026): Full Deployment**
- \`\`\`yaml
  deliverables:
    - "All portals support vLEI auth"
    - "Mobile app integration (iOS/Android)"
    - "API authentication via vLEI tokens"
    - "Webhook signature with vLEI"
    - "Migration tools (password → vLEI)"
    
  rollout_strategy:
    - "Opt-in for existing customers"
    - "Mandatory for new enterprise customers"
    - "Grace period: 6 months for migration"
    - "Password auth deprecated Q2 2027"
    
  cost: "$100K development + training"
  timeline: "20 weeks"
  \`\`\`

**Phase 4 (Q1-Q2 2027): Password Deprecation**
- \`\`\`yaml
  deliverables:
    - "All customers migrated to vLEI"
    - "Password authentication removed from codebase"
    - "Security audit and penetration testing"
    - "Compliance certification (SOC 2, ISO 27001 update)"
    
  transition_plan:
    - "90-day notice to customers"
    - "Free vLEI credential provisioning"
    - "Onboarding support and training"
    - "Gradual rollout by customer tier"
    
  cost: "$50K audit + certification"
  timeline: "12 weeks"
  \`\`\`

### Technical Architecture for vLEI Authentication

\`\`\`mermaid
sequenceDiagram
    participant User as User/Entity
    participant App as FTS Application
    participant Auth as Auth Service
    participant Vault as Credential Vault
    participant HSM as Hardware Security Module
    participant GLEIF as GLEIF API
    
    Note over User,GLEIF: Initial vLEI Registration
    User->>App: Register with vLEI
    App->>User: Request vLEI Credential (W3C VC)
    User->>App: Provide vLEI Credential JSON
    
    App->>Auth: Store Credential
    Auth->>Auth: Parse W3C VC Structure
    Auth->>GLEIF: Verify Issuer is QVI
    GLEIF-->>Auth: QVI Verified
    
    Auth->>HSM: Verify Credential Signature
    HSM-->>Auth: Signature Valid
    
    Auth->>Vault: Store Credential (Encrypted)
    Vault-->>Auth: Stored
    Auth-->>App: Registration Complete
    
    Note over User,GLEIF: Subsequent Login (vLEI Auth)
    User->>App: Login Request
    App->>Auth: Initiate vLEI Challenge
    Auth->>Auth: Generate Random Nonce
    Auth-->>App: Challenge Nonce
    
    App->>User: Display Challenge
    User->>User: Sign Challenge with Private Key
    Note over User: User's private key on device/HSM
    User->>App: Submit Signed Challenge
    
    App->>Auth: Verify Signature
    Auth->>Vault: Retrieve User's Public Key (from vLEI)
    Vault-->>Auth: Public Key
    
    Auth->>HSM: Verify Signature(Challenge, Signature, PublicKey)
    HSM-->>Auth: Signature Valid
    
    Auth->>GLEIF: Check vLEI Status (not revoked)
    GLEIF-->>Auth: Active
    
    Auth->>Auth: Verify Credential Not Expired
    Auth->>Auth: Check Credential Chain
    Auth->>Auth: Calculate Trust Score
    
    Auth->>Auth: Generate Session Token (JWT)
    Auth-->>App: Authenticated + JWT
    App-->>User: Login Success
    
    Note over User: No password transmitted or stored
    Note over Auth: Cryptographic proof = authentication
\`\`\`

---

## Deep Integration Scenarios

### Scenario 1: Instant Cross-Border Payment with Multi-Service Coordination

**Journey:** US company pays EU supplier in real-time with crypto option, automated VAT, and e-invoice.

\`\`\`mermaid
flowchart TD
    A[US Company] -->|Chooses Payment Method| B{Payment Type}
    
    B -->|Bank Wire USD| C[ISO Gateway]
    B -->|Crypto USDC| D[VASP Platform]
    B -->|Card Payment| E[PSP Direct]
    
    C --> F[Convert SWIFT MT103<br/>to ISO 20022]
    D --> G[USDC on Ethereum<br/>Stablecoin Transfer]
    E --> H[Card Authorization]
    
    F --> I[Orchestration Engine]
    G --> I
    H --> I
    
    I --> J[Select Optimal Route]
    J --> K{Destination}
    K -->|SEPA Zone| L[SEPA Instant Payment]
    K -->|SWIFT Network| M[ISO 20022 pacs.008]
    
    L --> N[Receive EUR in 10 seconds]
    M --> N[Receive EUR in 2 hours]
    
    N --> O[Trigger VAT Calculation]
    O --> P{Supplier VAT Registered?}
    
    P -->|Yes B2B| Q[Reverse Charge €0 VAT]
    P -->|No B2C| R[Standard Rate VAT]
    
    Q --> S[Generate E-Invoice]
    R --> S
    
    S --> T{E-Invoice Standard}
    T -->|Peppol EU| U[Peppol BIS 3.0]
    T -->|Country-Specific| V[Local Standard]
    
    U --> W[Sign & Submit to Peppol]
    V --> W
    
    W --> X[Deliver Invoice to Supplier]
    X --> Y[Update Payment Status: Complete]
    
    Y --> Z[All Services Notified via Webhooks]
    Z --> AA[Audit Trail Recorded]
    
    style I fill:#8b5cf6,color:#fff
    style N fill:#10b981,color:#fff
    style W fill:#2563eb,color:#fff
\`\`\`

**Service Coordination Benefits:**

| Without Interoperability | With FTS Interoperability | Improvement |
|--------------------------|---------------------------|-------------|
| Manual payment initiation | Automated via API | 95% faster |
| Separate tax calculation | Real-time integrated | Zero manual work |
| Invoice created separately | Auto-generated from payment | 100% accuracy |
| 3-5 business days settlement | 10 seconds - 2 hours | 95%+ faster |
| Multiple system logins | Single portal | 1 UX vs 5 |
| 3-4 staff to process | Fully automated | 75% cost reduction |

---

### Scenario 2: Decentralized Finance (DeFi) Integration

**Journey:** DeFi protocol integrates FTS services for fiat on/off-ramps and compliance.

\`\`\`mermaid
graph TB
    subgraph "DeFi Protocol"
        DEFI[DeFi Application<br/>Yield Farming Protocol]
        SMART[Smart Contracts<br/>Ethereum/Polygon]
        POOL[Liquidity Pools<br/>USDC/DAI/ETH]
    end
    
    subgraph "FTS Integration Layer"
        VASP[VASP Platform]
        KYC[KYC Service]
        AML[AML Screening]
        TRAVEL[Travel Rule]
        CHAIN[Blockchain Analytics]
    end
    
    subgraph "Fiat Rails"
        BANK[Bank Accounts<br/>Virtual IBANs]
        CARD[Card Issuance<br/>Visa Cards]
        ISO[ISO Gateway<br/>SEPA/SWIFT]
        PAY[Payment Processing<br/>Fiat Settlement]
    end
    
    subgraph "Compliance Layer"
        TAX[Tax Calculation<br/>Crypto Gains]
        INVOICE[E-Invoicing<br/>Statements]
        LEI[LEI Verification<br/>Entity Trust]
        REPORT[Regulatory Reporting<br/>FATF/MiCA]
    end
    
    DEFI --> VASP
    SMART --> VASP
    POOL --> VASP
    
    VASP --> KYC
    VASP --> AML
    VASP --> TRAVEL
    VASP --> CHAIN
    
    KYC --> BANK
    AML --> BANK
    BANK --> CARD
    BANK --> ISO
    ISO --> PAY
    
    VASP --> TAX
    PAY --> TAX
    TAX --> INVOICE
    
    KYC --> LEI
    AML --> REPORT
    TRAVEL --> REPORT
    
    style VASP fill:#8b5cf6,color:#fff
    style KYC fill:#f59e0b,color:#fff
    style BANK fill:#2563eb,color:#fff
    style TAX fill:#06b6d4,color:#fff
\`\`\`

**DeFi On-Ramp User Journey:**

\`\`\`yaml
defi_onramp_journey:
  step_1_user_registration:
    - user_visits: "DeFi protocol website"
    - clicks: "Connect Wallet"
    - connects: "MetaMask/WalletConnect"
    - redirects_to: "FTS VASP KYC flow"
    
  step_2_kyc_verification:
    - upload: "Government ID"
    - selfie: "Liveness detection"
    - address: "Proof of address"
    - processing: "AI verification (30 seconds)"
    - result: "Approved for up to €10,000/month"
    
  step_3_virtual_iban_creation:
    - generates: "Personal IBAN (DE89...)"
    - user_can: "Receive SEPA transfers"
    - automatically: "Converts EUR → USDC"
    - deposits_to: "User's wallet address"
    
  step_4_deposit_flow:
    user_action: "Bank transfer to IBAN"
    fts_receives: "€5,000 EUR via SEPA"
    aml_screening: "Automatic (sanctions, source of funds)"
    fx_conversion: "EUR → USDC (0.5% fee)"
    result: "4,975 USDC"
    blockchain_deposit: "USDC sent to user wallet (Ethereum)"
    confirmation_time: "2-3 minutes"
    
  step_5_defi_interaction:
    - user_connects: "Wallet to DeFi protocol"
    - user_deposits: "4,975 USDC into liquidity pool"
    - earns_yield: "8% APY"
    - fully_decentralized: true
    
  step_6_offramp_withdrawal:
    user_action: "Withdraw from DeFi pool"
    blockchain_transfer: "Send USDC to FTS VASP address"
    fx_conversion: "USDC → EUR (0.5% fee)"
    result: "€4,950 EUR"
    settlement: "SEPA transfer to user's bank (1-2 hours)"
    tax_calculation: "Capital gains calculated automatically"
    tax_invoice: "Annual statement generated"
\`\`\`

**Revenue Model for DeFi Integration:**

\`\`\`
Monthly DeFi Protocol Stats:
- 5,000 active users
- Average deposit: €3,000
- Total monthly volume: €15,000,000
- Churn: 20% monthly

FTS Revenue Per User Per Month:
  On-Ramp:
    - KYC verification: €5 (one-time, amortized €0.50/month)
    - Bank deposit: 1 × €5,000 × 0.5% FX = €25
    - AML screening: €0.30
  
  Ongoing:
    - Virtual IBAN maintenance: €2/month
    - Monthly monitoring: €0.50
  
  Off-Ramp:
    - Withdrawal: 1 × €5,000 × 0.5% FX = €25
    - Tax calculation: €0.10
    
  Total per user/month: €53.40
  
Annual Revenue from DeFi Partnership:
  Stable users: 4,000 (accounting for churn)
  Monthly revenue: 4,000 × €53.40 = €213,600
  Annual revenue: €2,563,200

Cost Structure:
  KYC (Sumsub): €3 per verification
  AML (Chainalysis): €0.20 per screening
  SEPA fees: €0.50 per transfer
  Infrastructure: €10K/month
  Total cost: ~€180K/year
  
Net Profit: €2,383,200 (93% margin)
\`\`\`

---

## ISO 20022 as Universal Integration Layer

### ISO 20022 Message Interoperability

FTS.Money uses **ISO 20022** as the common data language across all services, enabling seamless integration:

\`\`\`mermaid
graph TB
    subgraph "FTS Services as ISO 20022 Producers/Consumers"
        PSP[PSP Platform]
        VASP[VASP Platform]
        ISO_GW[ISO Gateway]
        ORCH[Orchestration]
        RWA[RWA Platform]
        TAX[VAT/Tax]
        INVOICE[E-Invoicing]
    end
    
    subgraph "ISO 20022 Message Types"
        PACS[pacs.* - Payments Clearing/Settlement]
        PAIN[pain.* - Payment Initiation]
        CAMT[camt.* - Cash Management]
        ACMT[acmt.* - Account Management]
        AUTH[auth.* - Authorities]
    end
    
    PSP -->|Produces| PAIN
    PSP -->|Consumes| CAMT
    
    VASP -->|Produces| PAIN
    VASP -->|Consumes| CAMT
    VASP -->|Produces| ACMT
    
    ISO_GW -->|Translates All| PACS
    ISO_GW -->|Translates All| PAIN
    ISO_GW -->|Translates All| CAMT
    
    ORCH -->|Routes| PACS
    ORCH -->|Routes| PAIN
    
    RWA -->|Dividend Payments| PAIN
    RWA -->|Settlementacknowledgments| PACS
    
    TAX -->|Tax Reporting| AUTH
    INVOICE -->|Payment Data| PAIN
    
    style ISO_GW fill:#2563eb,color:#fff
    style PACS fill:#10b981,color:#fff
\`\`\`

**ISO 20022 Message Mapping Example:**

\`\`\`xml
<!-- Payment transaction in FTS.Money -->
<!-- Automatically mapped to ISO 20022 pain.001 -->

<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.11">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>FTS-2026010500123456</MsgId>
      <CreDtTm>2026-01-05T14:30:00Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>50000.00</CtrlSum>
      <InitgPty>
        <Nm>Example Payments Ltd</Nm>
        <Id>
          <OrgId>
            <LEI>213800ABCDEFG1234567</LEI>
          </OrgId>
        </Id>
      </InitgPty>
    </GrpHdr>
    
    <PmtInf>
      <PmtInfId>PMT-2026-001</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>
        <Dt>2026-01-06</Dt>
      </ReqdExctnDt>
      <Dbtr>
        <Nm>Example Payments Ltd</Nm>
        <PstlAdr>
          <Ctry>IE</Ctry>
        </PstlAdr>
        <Id>
          <OrgId>
            <LEI>213800ABCDEFG1234567</LEI>
          </OrgId>
        </Id>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>IE29AIBK93115212345678</IBAN>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>AIBKIE2D</BICFI>
        </FinInstnId>
      </DbtrAgt>
      
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>FTS-TXN-20260105-00123456</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="EUR">50000.00</InstdAmt>
        </Amt>
        <CdtrAgt>
          <FinInstnId>
            <BICFI>COBADEFF</BICFI>
          </FinInstnId>
        </CdtrAgt>
        <Cdtr>
          <Nm>German Customer GmbH</Nm>
          <PstlAdr>
            <Ctry>DE</Ctry>
          </PstlAdr>
          <Id>
            <OrgId>
              <LEI>529900XYZABC789012</LEI>
            </OrgId>
          </Id>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <IBAN>DE89370400440532013000</IBAN>
          </Id>
        </CdtrAcct>
        <Purp>
          <Cd>SUPP</Cd>
        </Purp>
        <RmtInf>
          <Ustrd>Invoice INV-2026-001234</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>
\`\`\`

**Cross-Service Data Propagation:**

\`\`\`javascript
// How data flows between services automatically

// Transaction initiated in PSP Platform
const payment = await fts.psp.payments.create({
  amount: 50000,
  currency: 'EUR',
  merchant_id: 'merch_abc123',
  customer: {
    name: 'German Customer GmbH',
    lei: '529900XYZABC789012',
    country: 'DE',
    vat_number: 'DE123456789'
  }
});

// Automatically triggers:

// 1. LEI verification
const leiCheck = await fts.compliance.lei.verify(payment.customer.lei);
// Result: Entity name verified, ownership chain retrieved

// 2. VAT calculation
const tax = await fts.tax.calculate({
  payment_id: payment.id,
  // Customer/merchant data auto-populated from payment
});
// Result: Reverse charge determined, €0 VAT

// 3. E-invoice generation
const invoice = await fts.eInvoicing.generate({
  payment_id: payment.id,
  // Tax data auto-populated from tax calculation
  // LEI data auto-populated from verification
});
// Result: Peppol invoice with reverse charge notation

// 4. ISO 20022 settlement message
const isoMessage = await fts.isoGateway.generateSettlement({
  payment_id: payment.id,
  // All data auto-populated from payment + lei + tax
  message_type: 'pain.001',
  settlement_rail: 'sepa_instant'
});
// Result: ISO 20022 message ready for bank submission

// All connected via event-driven architecture:
payment.on('succeeded', () => {
  emit('tax.calculate', payment);
  emit('invoice.generate', payment);
  emit('iso.settle', payment);
});
\`\`\`

---

## Marketplace Service Integration

### Pre-Integrated Services Enable Rapid Innovation

**Example: Adding Fraud Detection to Payment Flow**

\`\`\`mermaid
sequenceDiagram
    participant Merchant
    participant PSP as PSP Platform
    participant Marketplace as Service Marketplace
    participant Sift as Sift Science (Fraud)
    participant Payment as Payment Processor
    
    Note over Merchant: Step 1: Enable Service (1-click)
    Merchant->>Marketplace: Browse Fraud Prevention
    Marketplace->>Merchant: Show: Sift Science, Ravelin, Forter
    Merchant->>Marketplace: Enable "Sift Science"
    Marketplace->>PSP: Configure Integration
    PSP->>Sift: Test API Connection
    Sift-->>PSP: Connection OK
    PSP-->>Merchant: Sift Science Active
    
    Note over Merchant: Step 2: Automatic Integration
    Merchant->>PSP: Process Payment €1,000
    PSP->>Sift: Send Transaction Data
    Sift->>Sift: Analyze Patterns
    Sift->>Sift: Device Fingerprinting
    Sift->>Sift: Behavioral Analytics
    Sift-->>PSP: Risk Score: 0.15 (Low)
    
    alt Low Risk (< 0.3)
        PSP->>Payment: Proceed with Authorization
        Payment-->>PSP: Approved
        PSP-->>Merchant: Payment Success
    else Medium Risk (0.3 - 0.7)
        PSP->>PSP: Flag for Manual Review
        PSP->>Merchant: Review Required
    else High Risk (> 0.7)
        PSP->>PSP: Auto-Decline
        PSP-->>Merchant: Transaction Blocked
    end
    
    Note over PSP,Sift: Billing: $0.01 per check charged to merchant
    Note over Merchant: Zero development time, instant activation
\`\`\`

---

## Conclusion & Strategic Value

### Interoperability as Competitive Advantage

**Why FTS.Money's Interoperability is Unique:**

1. **Shared Data Model:** All services use common schemas (ISO 20022, ISO 8583, W3C VC)
2. **Event-Driven:** Real-time propagation via webhooks and message queues
3. **Zero Integration Cost:** Services pre-connected, not custom integrations
4. **Composable:** Mix and match services to create unique offerings
5. **Standards-First:** Built on ISO standards ensuring global compatibility
6. **LEI/vLEI Native:** Provenance and trust built into every transaction
7. **Single Portal:** Unified UX across all services
8. **Revenue Stacking:** Earn fees from multiple services per transaction

**Market Differentiation:**

\`\`\`mermaid
graph LR
    subgraph "Competitor Model"
        C1[Single-Purpose Solutions]
        C2[Stripe: Payments Only]
        C3[Circle: Crypto Only]
        C4[Avalara: Tax Only]
        C5[Custom Integration Required<br/>6-12 months, $100K-$500K]
    end
    
    subgraph "FTS.Money Model"
        F1[Multi-Service Platform]
        F2[Payment + Crypto + Tax + Invoicing]
        F3[Pre-Integrated]
        F4[Zero Integration Effort<br/>1-click activation]
    end
    
    C2 --> C5
    C3 --> C5
    C4 --> C5
    
    F2 --> F4
    
    style C5 fill:#ef4444,color:#fff
    style F4 fill:#10b981,color:#fff
\`\`\`

### Future Interoperability Enhancements (Roadmap)

**2026 Q2-Q4:**
- AI-powered service recommendations based on usage patterns
- Automated workflow builder (visual service orchestration)
- Cross-service analytics (unified reporting across all services)
- Multi-service discounting (bundle pricing optimization)

**2027:**
- vLEI authentication across all services (password-free)
- Blockchain-anchored audit trails for all service interactions
- Self-sovereign identity (SSI) integration for end customers
- Quantum-safe cryptography for future-proofing

---

**Document Information:**
- **Version:** 2.0
- **Last Updated:** January 5, 2026
- **Classification:** Public - Technical Architecture

© 2026 FTS.Money. All rights reserved.
`;

export default ServiceInteroperabilityDoc;