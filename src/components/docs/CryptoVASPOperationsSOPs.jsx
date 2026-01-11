const CryptoVASPOperationsSOPs = `# Crypto VASP Operations Standard Operating Procedures
## FTS.Money Crypto Banking Platform - Striga Integration & Compliance

**Document Classification:** Confidential - Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** Crypto Operations Manager & Compliance Officer

---

## Table of Contents

1. [Overview](#overview)
2. [VASP Customer Onboarding](#vasp-customer-onboarding)
3. [Striga Integration Management](#striga-integration)
4. [Wallet & IBAN Provisioning](#wallet-iban-provisioning)
5. [Card Issuance Operations](#card-issuance)
6. [Crypto KYC/AML Compliance](#crypto-kyc-aml)
7. [Transaction Monitoring](#transaction-monitoring)
8. [Travel Rule Compliance](#travel-rule)
9. [Regulatory Reporting](#regulatory-reporting)

---

## Overview

### Crypto VASP Service Model

FTS.Money provides **white-label crypto banking infrastructure** via Striga partnership, enabling customers to offer:
- Multi-currency crypto wallets (BTC, ETH, USDC, USDT, 50+ coins)
- EUR/GBP IBAN accounts (crypto ↔ fiat)
- Virtual and physical debit cards
- KYC/AML compliance automation
- Regulatory reporting (MiCA, Travel Rule, FATF)

### Compliance Framework

**Regulatory Coverage:**

| Jurisdiction | Regulations | FTS Compliance Status | License Required |
|--------------|------------|---------------------|------------------|
| **EU (MiCA)** | Markets in Crypto Assets Regulation | ✅ Compliant via Striga | Striga licensed |
| **US** | FinCEN MSB, State money transmitter | ⚠️ Customer-specific | Customer must obtain |
| **UK** | FCA Crypto Asset Registration | ✅ Compliant via Striga | Striga registered |
| **Singapore** | MAS PSA (Payment Services Act) | ✅ Compliant via Striga | Striga licensed |
| **UAE** | VARA (Dubai), FSR (Abu Dhabi) | ⚠️ Customer-specific | Customer must obtain |

**FTS.Money Role:** Technology provider, **not** the regulated entity. Customers are responsible for obtaining local VASP licenses.

\`\`\`mermaid
graph TB
    subgraph "Regulatory Model"
        A[FTS.Money] -->|Technology Provider| B[White-Label Customer]
        B -->|Applies for VASP License| C[Local Regulator]
        C -->|License Granted| B
        B -->|Uses Infrastructure| D[Striga Licensed VASP]
        D -->|Provides Banking Rails| B
        
        A -->|Compliance Tools| E[KYC/AML Automation]
        A -->|Compliance Tools| F[Travel Rule Engine]
        A -->|Compliance Tools| G[Transaction Monitoring]
        
        E --> B
        F --> B
        G --> B
    end
    
    style D fill:#10b981,color:#fff
    style B fill:#3b82f6,color:#fff
\`\`\`

---

## SOP-CRYPTO-001: VASP Customer Onboarding & Licensing Assessment

### Purpose
Onboard crypto VASP customers while ensuring they understand regulatory obligations and licensing requirements.

### Enhanced Due Diligence (Crypto-Specific)

**Standard KYB + Additional Crypto Checks:**

| Check | Purpose | Process | Pass Criteria |
|-------|---------|---------|---------------|
| **Crypto Business Model** | Understand service offering | Review business plan | Permitted use case (not darknet, mixing, gambling) |
| **Regulatory Awareness** | Ensure customer knows obligations | Questionnaire + interview | Demonstrates understanding of local VASP licensing |
| **AML Program** | Verify customer has AML controls | Request AML policy document | Documented AML program aligned with FATF |
| **Wallet Security** | Assess customer's crypto security posture | Technical interview | Multi-sig, hardware wallets, insurance plan |
| **License Status** | Confirm regulatory compliance | Request license certificate or application proof | Licensed OR application in progress OR legal opinion stating exempt |

### Onboarding Workflow

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant Sales as FTS Sales
    participant Compliance as FTS Compliance
    participant Striga
    participant Regulator
    
    Customer->>Sales: Interest in Crypto VASP
    Sales->>Customer: Regulatory Education Session
    Note over Sales,Customer: "You must obtain VASP license in your jurisdiction"
    
    Customer->>Sales: Submits Application
    Sales->>Compliance: Enhanced Due Diligence
    
    Compliance->>Customer: Request Documents
    Customer->>Compliance: Provide KYB + Crypto-Specific Docs
    
    Compliance->>Compliance: Verify License or Application
    Compliance->>Compliance: AML Program Review
    
    Compliance->>Regulator: Verify License (if claimed)
    Regulator->>Compliance: Confirmation
    
    Compliance->>Sales: Approval or Rejection
    
    alt Approved
        Sales->>Customer: Contract Execution
        Sales->>Striga: Provision Customer Account
        Striga->>Compliance: Customer KYB Review (Striga side)
        Compliance->>Striga: Approve
        Striga->>Sales: Account Active
        Sales->>Customer: Access Granted
    else Rejected
        Sales->>Customer: Rejection Notice + Reasoning
    end
\`\`\`

### Licensing Requirement Assessment

**By Jurisdiction (Examples):**

\`\`\`yaml
vasp_licensing_matrix:
  european_union:
    regulation: MiCA (2024)
    license_requirement: CASP (Crypto Asset Service Provider)
    obtained_via: National regulator (e.g., BaFin Germany, AMF France)
    fts_support: Provide compliance tools, customer obtains license
    
  united_states:
    regulation: FinCEN MSB + State MTL
    license_requirement: Federal MSB registration + state licenses (can be 40+ states)
    obtained_via: FinCEN + each state regulator
    fts_support: Provide license application templates, compliance automation
    alternative: Partner with licensed entity (e.g., Striga covers via partnership)
    
  singapore:
    regulation: PSA (Payment Services Act)
    license_requirement: Standard or Major Payment Institution
    obtained_via: MAS (Monetary Authority of Singapore)
    fts_support: Regulatory advisory, compliance tools
    timeline: 6-12 months
\`\`\`

### Grace Period for Licensing

**For jurisdictions requiring license:**
- Customer can launch in **sandbox mode** immediately
- **Production mode** requires:
  - EITHER: Valid VASP license
  - OR: License application submitted + legal opinion confirming lawful operation pending approval
  - OR: Jurisdictional exemption (e.g., <$X volume, B2B only)

### Metrics

- Crypto customer onboarding time (target: <7 days for KYB + compliance review)
- License verification rate (target: 100% of customers claiming license)
- Compliance rejection rate (target: <20% - higher than PSP due to regulatory complexity)
- Regulatory violations (target: 0)

---

## SOP-CRYPTO-002: Striga Integration & Account Provisioning

### Purpose
Manage Striga API integration and provision customer accounts through Striga's infrastructure.

### Striga API Integration Flow

\`\`\`mermaid
sequenceDiagram
    participant FTS as FTS Platform
    participant Striga_API as Striga API
    participant Fireblocks as Fireblocks (Custody)
    participant Banking as Banking Partner
    participant Customer as VASP Customer
    
    Note over FTS: Contract signed, compliance approved
    
    FTS->>Striga_API: POST /users - Create customer account
    Striga_API->>Striga_API: Validate request
    Striga_API->>FTS: Return user_id + access_token
    
    FTS->>FTS: Store mapping (fts_customer_id ↔ striga_user_id)
    
    FTS->>Striga_API: POST /wallets/create - Provision BTC wallet
    Striga_API->>Fireblocks: Create segregated wallet
    Fireblocks->>Striga_API: Wallet address
    Striga_API->>FTS: Wallet details
    
    FTS->>Striga_API: POST /accounts/fiat - Request EUR IBAN
    Striga_API->>Banking: Provision IBAN account
    Banking->>Striga_API: IBAN details
    Striga_API->>FTS: IBAN account number
    
    FTS->>Customer: Credentials + Dashboard Access
    
    Customer->>FTS: End-user onboards (KYC)
    FTS->>Striga_API: POST /kyc - Submit KYC data
    Striga_API->>Striga_API: Automated + manual KYC review
    Striga_API->>FTS: KYC status (approved/rejected)
    FTS->>Customer: KYC result
\`\`\`

### Striga API Endpoints Used

| Endpoint | Purpose | Frequency | Error Handling |
|----------|---------|-----------|----------------|
| **POST /users** | Create customer account | Once per customer | Retry 3x, then manual intervention |
| **POST /wallets/create** | Create crypto wallet | Per customer request | Retry 3x, alert if fails |
| **POST /accounts/fiat** | Provision IBAN | Per customer request | Manual review if rejected |
| **POST /kyc/init** | Start KYC process | Per end-user | Retry 3x, customer support if fails |
| **GET /balances** | Fetch wallet balances | Real-time (webhook) + hourly poll | Cached data if API down |
| **POST /transactions/send** | Execute crypto transfer | Per customer request | No retry (financial risk), alert on failure |
| **POST /cards/issue** | Issue debit card | Per customer request | Retry 3x, manual if fails |

### Striga Service SLA Monitoring

**Uptime Monitoring:**
- Ping Striga API health endpoint every 60 seconds
- Alert if response time >2 seconds
- Alert if uptime <99.9% in rolling 24-hour window

**Incident Response:**
- If Striga API down: Display status banner to customers
- If extended outage (>1 hour): Activate contingency (read-only mode, queue transactions)
- If persistent issues: Escalate to Striga support + FTS management

### Backup & Contingency

**Fireblocks Backup Integration (Ready, Not Active):**
- All Striga wallet private keys escrowed with Fireblocks
- In case of Striga failure: Can activate Fireblocks direct integration within 72 hours
- Customer data portability guaranteed

### Metrics

- Striga API uptime (target: >99.9% observed)
- Striga API response time (target: <500ms p95)
- Provisioning success rate (target: >98%)
- Striga-related customer support tickets (target: <5% of crypto tickets)

---

## SOP-CRYPTO-003: Wallet Provisioning & Multi-Chain Support

### Purpose
Provision secure, segregated crypto wallets across multiple blockchains per customer and end-user requests.

### Supported Blockchains

| Blockchain | Coins Supported | Wallet Type | Custody | Transaction Fees |
|------------|----------------|-------------|---------|------------------|
| **Bitcoin** | BTC | SegWit (bc1...) | Fireblocks | Network fees (variable) |
| **Ethereum** | ETH, USDC, USDT, 100+ ERC-20 | HD Wallet | Fireblocks | Gas fees (variable, optimized) |
| **Polygon** | MATIC, USDC, USDT | HD Wallet | Fireblocks | Low gas fees (<$0.01) |
| **Base** | ETH, USDC | HD Wallet | Fireblocks | Low gas fees (~$0.01) |
| **Solana** | SOL, USDC | Native | Fireblocks | Low fees (<$0.01) |

### Wallet Provisioning Workflow

\`\`\`mermaid
flowchart TD
    A[Customer Requests Wallet] --> B{Wallet Type}
    
    B -->|Individual User| C[Create User-Specific Wallet]
    B -->|Pooled/Omnibus| D[Create Pooled Wallet + Internal Ledger]
    
    C --> E[Generate Seed Phrase]
    E --> F[Derive HD Wallet Addresses]
    F --> G[Store in Fireblocks Vault]
    
    D --> H[Generate Master Wallet]
    H --> I[Setup Internal Accounting]
    I --> J[Assign Virtual Balances]
    
    G --> K[Return Wallet Details to Customer]
    J --> K
    
    K --> L[Enable Wallet in Customer Portal]
    L --> M[Test Deposit Address]
    M --> N{Test Successful?}
    
    N -->|Yes| O[Mark Wallet Active]
    N -->|No| P[Investigate Issue]
    
    P --> Q[Retry Provisioning]
    Q --> M
    
    O --> R[Customer Can Use Wallet]
    
    style O fill:#10b981,color:#fff
    style P fill:#ef4444,color:#fff
\`\`\`

### Wallet Security Controls

**Multi-Sig Configuration:**
- All wallets require 2-of-3 signatures for large transactions (>$10,000)
- Signers: Customer, Striga, FTS.Money (escrow)
- Automated approval for small transactions (<$10,000)

**Cold Storage Policy:**
- >80% of customer assets in cold storage (offline)
- Hot wallet limits: Max $500K per customer
- Daily sweeps from hot to cold wallets

**Insurance Coverage:**
- Striga provides up to $100M custody insurance
- Covers theft, hacking, internal fraud
- Does not cover: market volatility, customer key loss, smart contract bugs

### Metrics

- Wallet provisioning time (target: <5 minutes)
- Wallet provisioning success rate (target: >99%)
- Security incidents (wallet compromise) - (target: 0)
- Insurance claims filed (target: 0)

---

## SOP-CRYPTO-004: IBAN Account Provisioning (Fiat On/Off Ramp)

### Purpose
Provision EUR/GBP IBAN accounts enabling crypto-fiat conversion.

### IBAN Provisioning Process

**Requirements:**
- Customer KYC completed (individual) OR KYB completed (business)
- Passed AML screening
- Acceptable use case (no sanctioned activities)

**Provisioning Timeline:**

\`\`\`mermaid
gantt
    title IBAN Account Provisioning Timeline
    dateFormat YYYY-MM-DD
    
    section Customer Action
    Submit IBAN Request           :c1, 2026-01-01, 1d
    Upload Required Documents     :c2, 2026-01-01, 1d
    
    section FTS Review
    KYC Verification              :f1, 2026-01-02, 1d
    AML Screening                 :f2, 2026-01-02, 1d
    Compliance Approval           :f3, 2026-01-03, 1d
    
    section Striga Provisioning
    Submit to Striga              :s1, 2026-01-04, 1d
    Banking Partner Review        :s2, 2026-01-05, 2d
    IBAN Issued                   :milestone, s3, 2026-01-07, 0d
    
    section Activation
    IBAN Details to Customer      :a1, 2026-01-07, 1d
    First Deposit Test            :a2, 2026-01-08, 1d
    Account Active                :milestone, a3, 2026-01-09, 0d
\`\`\`

**Average Time:** 7-9 business days (depends on banking partner)

### IBAN Account Features

**Supported Operations:**

| Operation | Processing Time | Fees | Limits |
|-----------|----------------|------|--------|
| **SEPA Deposit** (EUR) | 1-2 business days | Free | €1M per transaction |
| **SEPA Withdrawal** (EUR) | 1-2 business days | €1 | €100K per day |
| **SWIFT Deposit** (international) | 2-5 business days | €15 | $500K per transaction |
| **SWIFT Withdrawal** | 2-5 business days | €25 | $100K per day |
| **GBP Faster Payments** | <2 hours | £0.50 | £250K per day |
| **Crypto Conversion** (IBAN ↔ Wallet) | Instant | 0.5% spread | Unlimited |

### IBAN Account Monitoring

**Daily Checks:**
- Balance reconciliation (Striga balance vs FTS ledger)
- Unusual deposit/withdrawal patterns
- Velocity checks (>$100K in 24h = alert)
- Sanctions screening on SWIFT messages

### Metrics

- IBAN provisioning success rate (target: >95% - some rejected by banking partner)
- IBAN provisioning time (target: <10 business days)
- IBAN account errors (target: <1% - balance discrepancies, failed transactions)
- Regulatory holds on IBANs (target: <2% - frozen due to AML concerns)

---

## SOP-CRYPTO-005: Crypto KYC Orchestration (10-Step Framework)

### Purpose
Execute comprehensive KYC for crypto users per FATF guidelines and MiCA requirements.

### 10-Step KYC Framework

\`\`\`mermaid
graph TB
    A[User Initiates KYC] --> B[Step 1: Email Verification]
    B --> C[Step 2: Phone Verification SMS OTP]
    C --> D[Step 3: Identity Document Scan]
    D --> E[Step 4: Liveness Check Selfie Video]
    E --> F[Step 5: Address Verification]
    F --> G[Step 6: Source of Funds Declaration]
    G --> H[Step 7: Sanctions Screening]
    H --> I[Step 8: PEP Screening]
    I --> J[Step 9: Adverse Media Check]
    J --> K[Step 10: Manual Review if Flagged]
    
    K --> L{Approval Decision}
    
    L -->|Approved| M[KYC Status: Verified]
    L -->|Rejected| N[KYC Status: Rejected]
    L -->|Needs More Info| O[Request Additional Documents]
    
    O --> F
    
    M --> P[Enable Full Account Features]
    N --> Q[Account Restricted]
    
    style M fill:#10b981,color:#fff
    style N fill:#ef4444,color:#fff
\`\`\`

### KYC Tier System (Risk-Based)

| KYC Level | Requirements | Transaction Limits | Processing Time | Use Case |
|-----------|--------------|-------------------|-----------------|----------|
| **KYC Light** | Email + Phone | €1,000/month | <5 minutes (automated) | Low-value users |
| **KYC Standard** | + ID document + selfie | €15,000/month | <24 hours | Most users |
| **KYC Enhanced** | + Address proof + SOF | Unlimited | 2-5 business days | High-value users, businesses |

### Automated Identity Verification

**Provider:** Striga's integrated KYC (powered by Onfido/Jumio)

**Process:**
1. User uploads ID document (passport, driver license, national ID)
2. AI extracts data (name, DOB, nationality, document number)
3. Verify document authenticity (holograms, microprint, security features)
4. Liveness check: User records 2-second video moving head
5. Face match: Compare selfie to ID photo (>95% confidence)
6. Data validation: Check against database of stolen IDs

**Pass Rate:** ~85% on first attempt, ~95% with retry

**Common Rejection Reasons:**
- Blurry photo
- ID expired
- Name mismatch
- Liveness check failed (photo instead of video)
- Document not supported

### Manual KYC Review Queue

**Trigger Conditions:**
- Automated KYC soft fail (80-94% confidence score)
- High-risk jurisdiction
- Politically Exposed Person (PEP) detected
- Large transaction intent declared (>€50,000)
- Document verification inconclusive

**Review SLA:**
- Standard queue: <24 hours
- Priority queue (high-value customer): <4 hours
- Weekend/holiday: <48 hours

**Reviewer Actions:**
- Approve (if satisfied)
- Reject (if suspicious)
- Request additional documents
- Escalate to senior compliance officer

### Metrics

- Automated KYC pass rate (target: >85% first attempt)
- KYC completion time (target: <24 hours for 90% of applications)
- KYC rejection rate (target: 10-15% - appropriate for risk mitigation)
- False rejection rate (target: <3% - legitimate users rejected)
- KYC-related support tickets (target: <8% of crypto support volume)

---

## SOP-CRYPTO-006: Travel Rule Compliance (FATF Recommendation 16)

### Purpose
Comply with Travel Rule requiring exchange of beneficiary/originator information for crypto transactions >$1,000.

### Travel Rule Requirements

**Scope:**
- Crypto-to-crypto transfers >$1,000 (or equivalent)
- Fiat-to-crypto >$1,000
- Between VASPs (exchanges, platforms)

**Required Information:**

| Direction | Information to Collect | Information to Share |
|-----------|----------------------|---------------------|
| **Originator (Sender)** | Full name, wallet address, account number | Share with beneficiary VASP |
| **Beneficiary (Receiver)** | Full name, wallet address | Receive from originator VASP |

### Travel Rule Implementation

\`\`\`mermaid
sequenceDiagram
    participant User_A as Sender (Our Customer)
    participant FTS as FTS Platform
    participant TRP as Travel Rule Provider
    participant VASP_B as Receiving VASP
    participant User_B as Recipient
    
    User_A->>FTS: Initiate transfer to external wallet (>$1,000)
    FTS->>FTS: Detect Travel Rule threshold
    FTS->>User_A: Request beneficiary information
    User_A->>FTS: Provide recipient name + VASP
    
    FTS->>TRP: Lookup VASP_B endpoint
    TRP->>FTS: VASP_B Travel Rule endpoint
    
    FTS->>VASP_B: Send originator info (encrypted)
    VASP_B->>VASP_B: Screen originator against sanctions
    VASP_B->>FTS: Acknowledgment + beneficiary info
    
    FTS->>FTS: Screen beneficiary
    FTS->>FTS: Approve or reject transaction
    
    alt Approved
        FTS->>Fireblocks: Execute transfer
        Fireblocks->>User_B: Crypto sent
    else Rejected
        FTS->>User_A: Transaction blocked - sanctions hit
    end
\`\`\`

### Travel Rule Protocol

**Supported Protocols:**
- OpenVASP (primary)
- TRUST (TRP) - Trisa, CipherTrace
- Direct VASP-to-VASP API (for major partners)

**Fallback for Unhosted Wallets:**
- If receiving address is personal wallet (not VASP):
  - Collect beneficiary name via customer attestation
  - Document self-custody transfer
  - Enhanced monitoring for sanctions screening

### Sanctions Screening on Travel Rule

**Real-Time Checks:**
- Beneficiary name against OFAC, EU, UN sanctions lists
- Wallet address against known darknet markets, mixers, sanctioned entities
- VASP reputation check (is receiving VASP licensed/legitimate?)

**If Sanctions Hit:**
- Block transaction immediately
- Freeze customer account pending investigation
- File Suspicious Activity Report (SAR)
- Report to regulator if confirmed sanctions violation

### Metrics

- Travel Rule compliance rate (target: 100% of eligible transactions)
- Travel Rule message exchange success (target: >95% - some VASPs don't respond)
- Sanctions hits via Travel Rule (target: >0 detected, 100% blocked)
- Customer friction (target: <10% of customers complain about Travel Rule delays)

---

## SOP-CRYPTO-007: Card Issuance Operations (Virtual & Physical)

### Purpose
Issue Visa/Mastercard debit cards funded by crypto wallets or IBAN accounts.

### Card Types

| Card Type | Use Case | Issuance Time | Cost | Limits |
|-----------|----------|--------------|------|--------|
| **Virtual Card** | Online purchases, subscriptions | Instant | $5/card | €10K/month |
| **Physical Card** | POS purchases, ATM withdrawals | 5-10 business days | $15/card | €20K/month |
| **Premium Card** (Metal) | High-value customers | 10-15 business days | $50/card | €100K/month |

### Card Issuance Workflow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant FTS
    participant Striga
    participant CardIssuer as Card Issuer (Visa/MC Partner)
    participant Delivery as Delivery Service
    
    User->>FTS: Request Card
    FTS->>FTS: Verify KYC Status (must be Enhanced KYC)
    FTS->>FTS: Check funding source (wallet balance >€50)
    
    FTS->>Striga: POST /cards/issue
    Striga->>CardIssuer: Create card account
    CardIssuer->>Striga: Card details (PAN, CVV, expiry)
    
    alt Virtual Card
        Striga->>FTS: Card details (encrypted)
        FTS->>User: Display in portal (full PAN visible)
    else Physical Card
        CardIssuer->>Delivery: Print and ship card
        Delivery->>User: Card delivered (5-10 days)
        Striga->>FTS: Card dispatched notification
        FTS->>User: "Card on its way" email
    end
    
    User->>FTS: Activate card (physical only)
    FTS->>Striga: POST /cards/activate
    Striga->>CardIssuer: Activate card
    CardIssuer->>Striga: Activated
    Striga->>FTS: Confirmation
    FTS->>User: "Card active, ready to use"
\`\`\`

### Card Transaction Processing

**Real-Time Authorization Flow:**

\`\`\`mermaid
sequenceDiagram
    participant Merchant as Merchant Terminal
    participant Network as Visa/MC Network
    participant Issuer as Card Issuer
    participant Striga
    participant FTS
    participant Wallet as User Crypto Wallet
    
    Merchant->>Network: Authorization Request ($100)
    Network->>Issuer: Route to issuer
    Issuer->>Striga: Check balance
    Striga->>FTS: Check user wallet balance
    FTS->>Wallet: Query USDC balance
    
    Wallet->>FTS: Balance: 150 USDC
    FTS->>FTS: Convert: $100 USD = ~100 USDC
    FTS->>FTS: Check sufficient balance (150 > 100 ✓)
    
    FTS->>Striga: Approve with balance hold
    Striga->>Issuer: Approve
    Issuer->>Network: Authorization Approved
    Network->>Merchant: Approved (transaction proceeds)
    
    Note over FTS,Wallet: Settlement occurs at end of day
    
    Striga->>FTS: Settlement file (EOD)
    FTS->>Wallet: Deduct 100 USDC
    FTS->>FTS: Record transaction
    FTS->>Issuer: Confirm settlement
\`\`\`

**Authorization Response Time:** <300ms (target)

### Card Limits & Controls

**Default Limits (Adjustable by Customer):**

| Limit Type | Virtual Card | Physical Card | Premium Card |
|------------|--------------|---------------|--------------|
| Per Transaction | €5,000 | €10,000 | €50,000 |
| Per Day | €10,000 | €20,000 | €100,000 |
| Per Month | €30,000 | €50,000 | €500,000 |
| ATM Withdrawal/Day | N/A | €500 | €2,000 |

**Control Features:**
- Geographic restrictions (e.g., disable in high-risk countries)
- MCC restrictions (e.g., block gambling, adult content)
- Velocity controls (max X transactions per hour)
- Real-time spend notifications (push notification per transaction)

### Card Fraud Monitoring

**Real-Time Fraud Checks:**
- Geographic velocity (card used in 2 countries within 1 hour)
- Unusual merchant category for user profile
- Sudden large transaction (>3x typical spend)
- Multiple declined transactions (card testing)

**If Fraud Suspected:**
1. Block card immediately
2. Send push notification + SMS to user
3. User can unblock if legitimate (in-app)
4. If no response in 24h: Card remains blocked, CSM outreach

### Metrics

- Virtual card issuance time (target: <60 seconds)
- Physical card delivery time (target: <7 business days)
- Card activation rate (target: >80% of issued cards)
- Card fraud rate (target: <0.1% of card transactions)
- Card authorization success rate (target: >95%)

---

## SOP-CRYPTO-008: Crypto Transaction Monitoring & AML

### Purpose
Monitor crypto transactions for money laundering, terrorist financing, and sanctions evasion.

### Crypto-Specific Risk Indicators

**High-Risk Transaction Patterns:**

| Pattern | Risk Level | Action |
|---------|-----------|--------|
| **Mixer/Tumbler Usage** | 🔴 CRITICAL | Block transaction, freeze account, investigate |
| **Darknet Market Address** | 🔴 CRITICAL | Block, file SAR, report to authorities |
| **High-Risk Exchange** (no KYC) | 🟡 MEDIUM | Enhanced monitoring, request explanation |
| **Rapid Conversion** (deposit → convert → withdraw <1h) | 🟡 MEDIUM | Flag for review, possible layering |
| **Round-Number Transactions** (exactly $10K) | 🟡 MEDIUM | Possible structuring, monitor pattern |
| **Large Transaction** (>$50K) | 🟡 MEDIUM | Request source of funds, enhanced review |

### Blockchain Analytics Integration

**Tool:** Chainalysis or Elliptic (integrated via API)

**Real-Time Checks:**
1. **Deposit Address Screening:**
   - Check if address is linked to sanctioned entity
   - Check if address appears in darknet market database
   - Check risk score (0-100) based on transaction history

2. **Withdrawal Address Screening:**
   - Screen destination address before allowing transaction
   - Block if high-risk (score >70)
   - Flag for manual review if medium-risk (score 40-70)

**Screening Decision Matrix:**

\`\`\`mermaid
graph TD
    A[Screen Wallet Address] --> B{Risk Score}
    
    B -->|0-39 Low| C[Approve Automatically]
    B -->|40-70 Medium| D[Manual Review Required]
    B -->|71-100 High| E[Block Transaction]
    
    D --> F{Compliance Officer Review}
    F -->|Legitimate Explanation| G[Approve with Enhanced Monitoring]
    F -->|Suspicious| H[Reject + SAR Filing]
    
    E --> I[Notify Customer - Cannot Process]
    I --> J[Freeze Account if Repeated]
    
    style C fill:#10b981,color:#fff
    style E fill:#ef4444,color:#fff
\`\`\`

### Enhanced Due Diligence Triggers

**When to Request Additional Information:**
- Cumulative deposits >$25,000 in 30 days (first time)
- Transaction to/from privacy coin (Monero, Zcash)
- Sudden change in transaction pattern
- Geographic risk increase (transaction from high-risk country)

**Information Requested:**
- Source of funds explanation
- Business purpose of transactions
- Relationship to counterparties
- Tax documentation (for large amounts)

**Decision Timeline:**
- Request sent within 24h of trigger
- Customer has 7 days to respond
- If no response: Account restricted (withdrawals allowed, deposits blocked)
- If satisfactory response: Account unrestricted

### Metrics

- Transactions screened (target: 100%)
- High-risk transactions blocked (target: >99% of score >70)
- SAR filings (target: >0 detected, 100% filed within 30 days)
- False positive rate (target: <10%)
- Customer friction from screening (target: <5% experience delays)

---

## Appendix: Striga API Reference

### Key Endpoints

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| /users | POST | Create user | 100/hour |
| /wallets/create | POST | Create wallet | 500/hour |
| /accounts/fiat | POST | Create IBAN | 50/hour |
| /kyc/init | POST | Start KYC | 200/hour |
| /cards/issue | POST | Issue card | 100/hour |
| /transactions/send | POST | Send crypto | 1000/hour |
| /balances | GET | Fetch balances | 5000/hour |

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** Crypto Operations Manager
- **Review Frequency:** Monthly (high regulatory change frequency)

© 2026 FTS.Money. Confidential - Internal use only.
`;

export default CryptoVASPOperationsSOPs;