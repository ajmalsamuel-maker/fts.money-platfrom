import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const VASPPlatformDoc = `# FTS.Money VASP Platform - Complete White-Label Crypto Banking Infrastructure

## Executive Summary

The **FTS.Money VASP Platform** is a comprehensive, enterprise-grade white-labeled infrastructure that enables businesses to launch their own Virtual Asset Service Provider (VASP) operations with complete crypto banking capabilities. This is not just a compliance module—it's a full-stack crypto financial services platform including multi-chain wallets, virtual IBANs, card issuance, fiat on/off-ramps, and integrated regulatory compliance.

### What is a VASP?

A **Virtual Asset Service Provider (VASP)** is a business entity that offers services for storing, transferring, and/or exchanging virtual assets (cryptocurrencies) on behalf of customers. Under FATF (Financial Action Task Force) recommendations, VASPs are subject to the same Anti-Money Laundering (AML) and Counter-Financing of Terrorism (CFT) obligations as traditional financial institutions.

### FTS.Money VASP Platform Overview

**Core Value Proposition:**
Launch a complete licensed crypto banking business in days instead of building from scratch over 18-24 months with $10M+ investment.

**Key Features:**
- ✅ **Multi-Chain Custody** - Bitcoin, Ethereum, USDC, USDT, Lightning Network
- ✅ **Virtual IBANs** - Named SEPA accounts for fiat banking rails
- ✅ **Card Issuance** - Virtual and physical Visa/Mastercard crypto spending cards
- ✅ **On/Off-Ramps** - Instant crypto-fiat exchange with bank integration
- ✅ **Complete Compliance** - EU VASP licensed, MiCA ready, Travel Rule, AML/CFT
- ✅ **KYC/KYB Engine** - Automated identity verification with LEI/vLEI support
- ✅ **White-Label Portal** - Fully branded customer portal and mobile apps
- ✅ **API Integration** - RESTful APIs for embedding crypto services
- ✅ **Transaction Monitoring** - Real-time AML screening and suspicious activity detection
- ✅ **Regulatory Reporting** - Automated SAR generation and compliance filings

---

## Platform Architecture

### VASP Infrastructure Stack

\`\`\`mermaid
graph TB
    subgraph "Customer-Facing Layer"
        PORTAL[White-Label Portal<br/>Fully Branded]
        API[RESTful APIs<br/>SDK Integration]
        MOBILE[Mobile Apps<br/>iOS/Android]
    end
    
    subgraph "FTS.Money VASP Core"
        AUTH[Identity & Access<br/>Multi-User RBAC]
        WALLET[Wallet Management<br/>Multi-Chain]
        IBAN[Virtual IBANs<br/>SEPA Banking]
        CARDS[Card Issuance<br/>Virtual + Physical]
        EXCHANGE[Exchange Engine<br/>Crypto ↔ Fiat]
        COMPLIANCE[Compliance Engine<br/>AML/CFT/Travel Rule]
    end
    
    subgraph "Underlying Infrastructure"
        STRIGA[Striga Platform<br/>EU VASP Licensed]
        LIGHTSPARK[Lightspark<br/>Lightning Network]
        FIREBLOCKS[Fireblocks<br/>Institutional Custody]
    end
    
    subgraph "Compliance & Security"
        KYC[KYC/KYB Verification<br/>Identity Checks]
        LEI[LEI/vLEI Integration<br/>Legal Entity IDs]
        AML[AML Screening<br/>Sanctions/PEP/Adverse Media]
        TRAVEL[Travel Rule<br/>IVMS101 Protocol]
        CHAIN[Blockchain Analytics<br/>On-Chain Risk Scoring]
    end
    
    subgraph "Banking & Payment Rails"
        SEPA[SEPA Instant<br/>Euro Payments]
        SWIFT[SWIFT Network<br/>International Wire]
        PAYMENT[Payment Processing<br/>ISO 20022]
    end
    
    PORTAL --> AUTH
    API --> AUTH
    MOBILE --> AUTH
    
    AUTH --> WALLET
    AUTH --> IBAN
    AUTH --> CARDS
    AUTH --> EXCHANGE
    
    WALLET --> STRIGA
    IBAN --> STRIGA
    CARDS --> STRIGA
    EXCHANGE --> STRIGA
    
    STRIGA --> LIGHTSPARK
    STRIGA --> FIREBLOCKS
    
    COMPLIANCE --> KYC
    COMPLIANCE --> LEI
    COMPLIANCE --> AML
    COMPLIANCE --> TRAVEL
    COMPLIANCE --> CHAIN
    
    IBAN --> SEPA
    IBAN --> SWIFT
    EXCHANGE --> PAYMENT
    
    style PORTAL fill:#2563eb,color:#fff
    style STRIGA fill:#10b981,color:#fff
    style COMPLIANCE fill:#f59e0b,color:#fff
\`\`\`

### Distribution Model

**Two Primary Customer Segments:**

1. **PSPs via Service Marketplace (Embedded)**
   - PSPs enable VASP platform from their service catalog
   - Crypto capabilities embedded into existing payment offerings
   - White-labeled for PSP's merchant base
   - Revenue share model

2. **Direct Enterprise Customers (Standalone)**
   - Crypto exchanges launching fiat banking
   - DeFi platforms adding compliant on/off-ramps
   - Wallet providers expanding services
   - Neobanks adding crypto accounts
   - Direct subscription + usage fees

---

## Core VASP Capabilities

### 1. Multi-Chain Wallet Infrastructure

**Supported Blockchain Networks:**

\`\`\`mermaid
graph TB
    subgraph "Layer 1 Blockchains"
        BTC[Bitcoin<br/>BTC]
        ETH[Ethereum<br/>ETH]
        SOL[Solana<br/>SOL]
        AVAX[Avalanche<br/>AVAX]
    end
    
    subgraph "Layer 2 Networks"
        LN[Lightning Network<br/>Instant BTC]
        POLY[Polygon<br/>MATIC]
        ARB[Arbitrum<br/>ETH L2]
        BASE[Base<br/>Coinbase L2]
    end
    
    subgraph "Stablecoins"
        USDC[USD Coin<br/>USDC]
        USDT[Tether<br/>USDT]
        DAI[DAI<br/>Stablecoin]
    end
    
    subgraph "Wallet Features"
        HD[HD Wallets<br/>Deterministic]
        MPC[Multi-Party Compute<br/>Security]
        COLD[Cold Storage<br/>95% of funds]
        HOT[Hot Wallets<br/>5% operations]
    end
    
    BTC --> LN
    ETH --> POLY
    ETH --> ARB
    ETH --> BASE
    
    BTC --> HD
    ETH --> HD
    SOL --> HD
    
    HD --> MPC
    MPC --> COLD
    MPC --> HOT
    
    USDC -.->|Runs on| ETH
    USDT -.->|Runs on| ETH
    DAI -.->|Runs on| ETH
    
    style BTC fill:#f59e0b
    style ETH fill:#6366f1
    style USDC fill:#10b981
    style MPC fill:#ef4444
\`\`\`

**Wallet Management Features:**

| Feature | Description | Security Level | Use Case |
|---------|-------------|----------------|----------|
| **Custodial Wallets** | Platform controls private keys | Maximum | Regulatory compliance, beginners |
| **Non-Custodial** | User controls keys | High | Advanced users, self-sovereignty |
| **Multi-Sig** | Requires multiple signatures | Maximum | Institutional accounts |
| **HD Wallets** | Hierarchical deterministic | High | Account organization |
| **Watch-Only** | Monitor external addresses | N/A | Portfolio tracking |

**Wallet Creation Flow:**

\`\`\`mermaid
sequenceDiagram
    participant User as Customer
    participant Portal as VASP Portal
    participant API as FTS API Layer
    participant Striga as Striga Core
    participant Chain as Blockchain
    
    User->>Portal: Create Wallet (BTC)
    Portal->>API: POST /wallets/create
    API->>API: Validate User KYC
    API->>Striga: createWallet(userId, "BTC")
    
    Striga->>Striga: Generate HD Key Pair
    Striga->>Chain: Deploy Address
    Chain-->>Striga: Address: bc1q...
    
    Striga->>Striga: Store in MPC Vault
    Striga-->>API: Wallet Created
    
    API->>API: Log to Audit Trail
    API-->>Portal: Wallet Details
    Portal-->>User: BTC Wallet Ready
    
    Note over User,Chain: User can now receive BTC
    
    User->>Portal: Fund Wallet
    User->>Chain: Send BTC to bc1q...
    Chain->>Striga: Webhook: Incoming TX
    Striga->>API: Balance Update
    API->>Portal: Update UI
    Portal-->>User: Balance: 0.025 BTC
\`\`\`

---

### 2. Virtual IBAN Infrastructure

**SEPA Banking Integration:**

Virtual IBANs provide the critical bridge between traditional banking and cryptocurrency, enabling customers to:
- Receive fiat deposits via SEPA transfers (EUR)
- Withdraw crypto proceeds to bank accounts
- Pay bills and expenses from crypto holdings
- Comply with regulatory requirements for fiat reserves

\`\`\`mermaid
graph LR
    subgraph "Customer Banking"
        A[Customer Bank<br/>Traditional IBAN]
    end
    
    subgraph "FTS.Money VASP"
        B[Virtual IBAN<br/>Dedicated Account]
        C[Pooled Account<br/>Reference Number]
        D[Internal Ledger<br/>Balance Tracking]
    end
    
    subgraph "Partner Bank"
        E[Banking Partner<br/>Licensed Institution]
        F[Master Account<br/>Segregated Funds]
    end
    
    subgraph "Crypto Wallets"
        G[EUR Balance<br/>Fiat Account]
        H[Crypto Wallets<br/>BTC/ETH/USDC]
    end
    
    A -->|SEPA Transfer| B
    A -->|SEPA Transfer<br/>+ Reference| C
    
    B --> D
    C --> D
    D --> E
    E --> F
    
    D --> G
    G -->|Exchange| H
    
    style B fill:#2563eb,color:#fff
    style D fill:#10b981,color:#fff
    style G fill:#06b6d4,color:#fff
\`\`\`

**IBAN Allocation Types:**

| Type | Format | Speed | Cost | Use Case |
|------|--------|-------|------|----------|
| **Dedicated IBAN** | DE89 3704 0044 0532 0130 00 | Instant ID | €5/month | High-volume users |
| **Pooled IBAN + Reference** | Same IBAN + unique reference | Instant ID | €0/month | Standard users |
| **Named Account** | Customer name on IBAN | 1-2 days | €10/month | Business accounts |

**IBAN Transaction Flow:**

\`\`\`mermaid
sequenceDiagram
    participant Cust as Customer
    participant Bank as Customer's Bank
    participant SEPA as SEPA Network
    participant Partner as Partner Bank
    participant Striga as Striga Platform
    participant Portal as VASP Portal
    participant Wallet as Crypto Wallet
    
    Note over Cust,Wallet: Deposit Flow
    Cust->>Bank: Initiate SEPA Transfer (€1,000)
    Bank->>SEPA: Submit Payment
    SEPA->>Partner: Route to IBAN
    Partner->>Partner: Credit Account
    Partner->>Striga: Webhook: Deposit Received
    
    Striga->>Striga: Identify Customer (by IBAN)
    Striga->>Portal: Update Balance
    Portal->>Cust: Notification: €1,000 received
    
    Note over Cust,Wallet: Exchange to Crypto
    Cust->>Portal: Exchange €1,000 → BTC
    Portal->>Striga: Exchange Request
    Striga->>Striga: Get Real-Time Rate
    Note over Striga: €1,000 = 0.0234 BTC
    Striga->>Striga: Execute Exchange
    Striga->>Wallet: Credit BTC Balance
    Striga->>Portal: Update Complete
    Portal->>Cust: Now have 0.0234 BTC
    
    Note over Cust,Wallet: Withdrawal Flow
    Cust->>Portal: Withdraw 0.01 BTC → EUR
    Portal->>Striga: Exchange + Withdraw
    Striga->>Striga: BTC → EUR (€428.50)
    Striga->>Partner: Initiate SEPA Out
    Partner->>SEPA: Send Payment
    SEPA->>Bank: Route to Customer
    Bank->>Cust: €428.50 received
\`\`\`

**Supported Currencies:**
- EUR (Euro) - Primary, full SEPA integration
- GBP (British Pound) - Faster Payments
- USD (US Dollar) - Fedwire/ACH (coming Q2 2026)
- CHF (Swiss Franc) - SIC network (coming Q3 2026)

---

### 3. Crypto Card Issuance

**Card Types & Features:**

\`\`\`mermaid
graph TB
    subgraph "Card Types"
        VIRT[Virtual Cards<br/>Instant Issuance]
        PHYS[Physical Cards<br/>Shipped 5-7 days]
    end
    
    subgraph "Card Features"
        SPEND[Crypto-Backed Spend<br/>Real-Time Conversion]
        ATM[ATM Withdrawals<br/>Global Network]
        ONLINE[Online Payments<br/>E-commerce]
        POS[In-Store POS<br/>Contactless]
        LIMITS[Configurable Limits<br/>Daily/Monthly]
    end
    
    subgraph "Funding Source"
        CRYPTO[Crypto Wallets<br/>BTC/ETH/USDC]
        FIAT[IBAN Balance<br/>EUR/GBP/USD]
        AUTO[Auto-Convert<br/>On Purchase]
    end
    
    subgraph "Security"
        PIN[PIN Code<br/>Secure Transaction]
        FREEZE[Instant Freeze<br/>Fraud Protection]
        NOTIF[Real-Time Alerts<br/>Push/Email/SMS]
        BIOM[Biometric Auth<br/>Mobile App]
    end
    
    VIRT --> SPEND
    PHYS --> SPEND
    SPEND --> ONLINE
    SPEND --> POS
    SPEND --> ATM
    
    CRYPTO --> AUTO
    FIAT --> AUTO
    AUTO --> SPEND
    
    PIN --> SPEND
    FREEZE --> SPEND
    NOTIF --> SPEND
    BIOM --> SPEND
    
    style VIRT fill:#8b5cf6,color:#fff
    style PHYS fill:#3b82f6,color:#fff
    style CRYPTO fill:#f59e0b,color:#fff
    style AUTO fill:#10b981,color:#fff
\`\`\`

**Card Issuance Workflow:**

\`\`\`mermaid
sequenceDiagram
    participant User as Customer
    participant Portal as VASP Portal
    participant Verify as KYC Verification
    participant Cards as Card Issuer (Striga)
    participant Visa as Visa Network
    participant Wallet as Crypto Wallet
    
    User->>Portal: Request Virtual Card
    Portal->>Verify: Check KYC Level
    
    alt Enhanced KYC Not Complete
        Verify-->>Portal: KYC Insufficient
        Portal->>User: Complete Enhanced KYC
        User->>Portal: Upload Documents
        Portal->>Verify: Validate Documents
        Verify-->>Portal: KYC Approved
    end
    
    Portal->>Cards: Issue Virtual Card
    Cards->>Cards: Generate Card Number
    Cards->>Cards: Allocate CVV/Expiry
    Cards->>Visa: Register Card
    Visa-->>Cards: Card Active
    
    Cards-->>Portal: Card Details (encrypted)
    Portal-->>User: Virtual Card Ready
    
    Note over User,Wallet: Card Usage
    User->>User: Make Purchase (€50)
    User->>Visa: Authorize Transaction
    Visa->>Cards: Authorization Request
    Cards->>Wallet: Check Balance
    
    alt Crypto Balance Available
        Wallet->>Wallet: Convert 0.0012 BTC → €50
        Wallet-->>Cards: Funds Available
        Cards->>Visa: Approve Authorization
        Visa-->>User: Payment Successful
    else Insufficient Balance
        Wallet-->>Cards: Insufficient Funds
        Cards->>Visa: Decline Authorization
        Visa-->>User: Payment Declined
    end
\`\`\`

**Card Limits & Controls:**

\`\`\`yaml
virtual_card:
  issuance_fee: $8
  monthly_maintenance: $0
  limits:
    daily_spend: $5,000 (configurable)
    monthly_spend: $20,000 (configurable)
    single_transaction: $2,500
    atm_withdrawal: $500/day
  features:
    - instant_issuance
    - freeze_unfreeze
    - recurring_payments
    - online_only_option
    - merchant_category_blocking
    
physical_card:
  issuance_fee: $20
  monthly_maintenance: $2
  shipping_time: "5-7 business days"
  limits:
    daily_spend: $10,000 (configurable)
    monthly_spend: $50,000 (configurable)
    single_transaction: $5,000
    atm_withdrawal: $1,000/day
  features:
    - contactless_payments
    - chip_and_pin
    - magnetic_stripe
    - atm_withdrawals
    - worldwide_acceptance
\`\`\`

---

### 4. Fiat/Crypto Exchange Engine

**Real-Time Exchange Capabilities:**

The exchange engine is the heart of the crypto-fiat bridge, enabling instant conversion between traditional currencies and digital assets. It connects to multiple liquidity providers to ensure best execution and deep liquidity.

\`\`\`mermaid
graph TB
    subgraph "Exchange Request"
        A[User Initiates<br/>€1,000 → BTC]
    end
    
    subgraph "Liquidity Aggregation"
        B[Query Multiple Sources]
        B --> C[Binance API]
        B --> D[Kraken API]
        B --> E[Coinbase API]
        B --> F[Circle USDC]
    end
    
    subgraph "Best Execution"
        G[Compare Rates]
        G --> H[Select Best Rate]
        G --> I[Calculate Fees]
        G --> J[Estimate Slippage]
    end
    
    subgraph "Compliance Checks"
        K[AML Screening]
        K --> L[Transaction Limits]
        K --> M{Travel Rule?}
        M -->|> Threshold| N[Require Data]
        M -->|< Threshold| O[Proceed]
    end
    
    subgraph "Execution"
        P[Execute Trade]
        P --> Q[Debit Fiat Account]
        P --> R[Credit Crypto Wallet]
        P --> S[Record Transaction]
    end
    
    A --> B
    C --> G
    D --> G
    E --> G
    F --> G
    
    H --> K
    I --> K
    J --> K
    
    O --> P
    N --> P
    
    S --> T[Notify User]
    
    style A fill:#dbeafe
    style H fill:#10b981,color:#fff
    style K fill:#f59e0b,color:#fff
    style P fill:#8b5cf6,color:#fff
\`\`\`

**Exchange Fee Structure:**

\`\`\`
Fee Calculation Example:
User wants to exchange €1,000 → BTC

1. Get Market Rate:
   Binance: 1 BTC = €42,500
   Kraken: 1 BTC = €42,450
   Coinbase: 1 BTC = €42,525
   Best rate: Kraken (€42,450)

2. Calculate Exchange:
   €1,000 / €42,450 = 0.02356 BTC

3. Apply Fees:
   Exchange Fee (1.2%): €12.00
   Network Fee (flat): €3.00
   Total Fees: €15.00

4. Final Amount:
   Net: €985.00
   BTC Received: 0.02320 BTC
   Effective Rate: €42,456/BTC (includes fees)

User sees:
  "Exchange €1,000 for 0.02320 BTC"
  "Fee: €15.00 (1.5%)"
  "Confirm?"
\`\`\`

**Supported Exchange Pairs:**

| From | To | Fee | Min Amount | Max Amount | Settlement |
|------|-----|-----|------------|------------|------------|
| EUR | BTC | 1.2% | €50 | €50,000 | Instant |
| EUR | ETH | 1.2% | €50 | €50,000 | Instant |
| EUR | USDC | 0.5% | €10 | €100,000 | Instant |
| BTC | EUR | 1.5% | 0.001 BTC | 10 BTC | 10-60 min |
| ETH | EUR | 1.5% | 0.01 ETH | 100 ETH | 2-15 min |
| USDC | EUR | 0.5% | 10 USDC | 100,000 USDC | Instant |
| BTC | ETH | 0.8% | 0.001 BTC | 5 BTC | Instant |
| ETH | BTC | 0.8% | 0.01 ETH | 50 ETH | Instant |

---

### 5. Complete Compliance Infrastructure

**Regulatory Compliance Framework:**

The compliance infrastructure is what separates FTS.Money VASP Platform from basic crypto services. We handle the complex, expensive, and time-consuming regulatory requirements so customers can focus on their business.

\`\`\`mermaid
graph TB
    subgraph "Identity Verification"
        KYC[KYC - Individual<br/>Photo ID + Selfie]
        KYB[KYB - Business<br/>Company Docs]
        LEI[LEI Verification<br/>GLEIF Integration]
        VLEI[vLEI Credentials<br/>Digital Proof]
    end
    
    subgraph "Screening & Monitoring"
        SANC[Sanctions Screening<br/>OFAC/EU/UN]
        PEP[PEP Checks<br/>Politically Exposed]
        ADV[Adverse Media<br/>News Scanning]
        CHAIN[Blockchain Analytics<br/>Tainted Coins]
    end
    
    subgraph "Transaction Controls"
        TRAVEL[Travel Rule<br/>IVMS101]
        LIMIT[Transaction Limits<br/>AML Thresholds]
        MONITOR[Real-Time Monitoring<br/>Pattern Detection]
        SAR[SAR Generation<br/>Suspicious Activity]
    end
    
    subgraph "Regulatory Reporting"
        FATF[FATF Compliance<br/>Recommendations]
        MICA[MiCA Framework<br/>EU Regulation]
        FINCEN[FinCEN Reporting<br/>US Requirements]
        FCA[FCA Compliance<br/>UK Requirements]
    end
    
    KYC --> SANC
    KYB --> SANC
    LEI --> SANC
    VLEI --> SANC
    
    SANC --> TRAVEL
    PEP --> TRAVEL
    ADV --> TRAVEL
    CHAIN --> TRAVEL
    
    TRAVEL --> MONITOR
    LIMIT --> MONITOR
    MONITOR --> SAR
    
    SAR --> FATF
    SAR --> MICA
    SAR --> FINCEN
    SAR --> FCA
    
    style KYC fill:#2563eb,color:#fff
    style SANC fill:#ef4444,color:#fff
    style TRAVEL fill:#f59e0b,color:#fff
    style FATF fill:#10b981,color:#fff
\`\`\`

**AML/CFT Screening Process:**

\`\`\`mermaid
flowchart TD
    A[New Customer/Transaction] --> B[Extract Identity Data]
    B --> C[Sanctions Screening]
    
    C --> D{Check OFAC SDN}
    C --> E{Check EU Sanctions}
    C --> F{Check UN List}
    C --> G{Check UK HMT}
    
    D --> H{Any Match?}
    E --> H
    F --> H
    G --> H
    
    H -->|YES| I[BLOCK IMMEDIATELY]
    I --> J[File SAR]
    I --> K[Notify Compliance Officer]
    I --> L[Freeze Account]
    
    H -->|NO| M{PEP Screening}
    M -->|Match| N[Enhanced Due Diligence]
    N --> O[Senior Management Approval Required]
    O --> P{Approved?}
    P -->|Yes| Q[Monitor Closely]
    P -->|No| I
    
    M -->|No Match| R{Adverse Media Check}
    R -->|Red Flags| S[Manual Review Queue]
    R -->|Clear| T{Blockchain Analytics}
    
    T --> U{Source of Funds}
    U -->|High Risk Address| V[Enhanced Monitoring]
    U -->|Mixing Service| V
    U -->|Sanctioned Entity| I
    U -->|Clean| W[Approve]
    
    S --> X[Compliance Team Review]
    X --> Y{Decision}
    Y -->|Approve| Q
    Y -->|Reject| I
    
    Q --> Z[Transaction Monitoring]
    V --> Z
    W --> Z
    Z --> AA[Ongoing Compliance]
    
    style I fill:#ef4444,color:#fff
    style J fill:#f59e0b,color:#fff
    style W fill:#10b981,color:#fff
\`\`\`

---

### 6. Travel Rule Implementation

**FATF Travel Rule (Recommendation 16):**

VASPs must share originator and beneficiary information for transactions exceeding defined thresholds (typically $1,000 USD equivalent).

**Travel Rule Data Exchange:**

\`\`\`mermaid
sequenceDiagram
    participant O as Originator (Sender)
    participant VASP_A as Originating VASP
    participant TRP as Travel Rule Protocol
    participant VASP_B as Beneficiary VASP
    participant B as Beneficiary (Receiver)
    
    O->>VASP_A: Request Withdrawal (€5,000)
    VASP_A->>VASP_A: Check Threshold (€5,000 > €1,000)
    
    Note over VASP_A: Travel Rule Required
    
    VASP_A->>O: Request Beneficiary Info
    O-->>VASP_A: Beneficiary Details
    
    VASP_A->>VASP_A: Validate Originator KYC
    Note over VASP_A: Must have Enhanced KYC
    
    VASP_A->>TRP: Send IVMS101 Message
    Note over TRP: Originator Info:<br/>Full Name, Address,<br/>Date of Birth,<br/>Account ID,<br/>LEI (if applicable)
    
    TRP->>VASP_B: Forward Travel Rule Data
    
    VASP_B->>VASP_B: Validate Beneficiary Exists
    VASP_B->>VASP_B: Screen Originator Data
    
    alt Screening Pass
        VASP_B->>VASP_B: Validate Beneficiary KYC
        VASP_B->>VASP_B: Check Transaction Limits
        VASP_B-->>TRP: Accept Transfer
        TRP-->>VASP_A: Transfer Accepted
        
        VASP_A->>VASP_A: Execute Blockchain TX
        VASP_A->>O: Transaction Initiated
        
        Note over VASP_A,VASP_B: Blockchain Confirmations
        
        VASP_B->>B: Credit Account (€5,000)
        VASP_B->>B: Send Notification
        
    else Screening Fail
        VASP_B->>VASP_B: Sanctions/PEP Match
        VASP_B-->>TRP: Reject Transfer
        TRP-->>VASP_A: Rejection + Reason
        VASP_A->>VASP_A: Log Rejection
        VASP_A->>O: Transaction Declined
        VASP_A->>VASP_A: File Compliance Report
    end
\`\`\`

**IVMS101 Data Standard:**

\`\`\`json
{
  "originator": {
    "originatorPersons": [{
      "naturalPerson": {
        "name": {
          "nameIdentifier": [{
            "primaryIdentifier": "Smith",
            "secondaryIdentifier": "John Michael"
          }]
        },
        "geographicAddress": [{
          "addressLine": ["123 Main Street", "Apt 4B"],
          "town": "New York",
          "postCode": "10001",
          "country": "US"
        }],
        "nationalIdentification": {
          "nationalIdentifier": "123-45-6789",
          "nationalIdentifierType": "TXID",
          "countryOfIssue": "US"
        },
        "dateAndPlaceOfBirth": {
          "dateOfBirth": "1985-06-15",
          "placeOfBirth": "New York, US"
        }
      }
    }],
    "accountNumber": ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"]
  },
  "beneficiary": {
    "beneficiaryPersons": [{
      "naturalPerson": {
        "name": {
          "nameIdentifier": [{
            "primaryIdentifier": "Doe",
            "secondaryIdentifier": "Jane Elizabeth"
          }]
        },
        "geographicAddress": [{
          "addressLine": ["456 Oak Avenue"],
          "town": "London",
          "postCode": "SW1A 1AA",
          "country": "GB"
        }]
      }
    }],
    "accountNumber": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"]
  },
  "transaction": {
    "amount": 5000,
    "currency": "EUR",
    "originatorVASP": {
      "name": "FTS.Money VASP Platform",
      "lei": "213800ABCDEFG1234567",
      "country": "NL"
    },
    "beneficiaryVASP": {
      "name": "Beneficiary VASP Ltd",
      "lei": "213800XYZTUVW7654321",
      "country": "GB"
    }
  }
}
\`\`\`

---

## White-Label Configuration

### Portal Customization

**Branding Options:**

\`\`\`json
{
  "white_label_config": {
    "company_info": {
      "name": "CryptoBank Pro",
      "legal_name": "CryptoBank Pro Limited",
      "domain": "cryptobank.pro",
      "support_email": "support@cryptobank.pro",
      "support_phone": "+44 20 1234 5678"
    },
    
    "branding": {
      "logo_url": "https://cryptobank.pro/logo.svg",
      "logo_dark_url": "https://cryptobank.pro/logo-dark.svg",
      "favicon_url": "https://cryptobank.pro/favicon.ico",
      "primary_color": "#0066CC",
      "secondary_color": "#00BFFF",
      "accent_color": "#FF6B35",
      "background_gradient": "linear-gradient(135deg, #003EFF 0%, #54F0E4 100%)",
      "font_family": "Inter, sans-serif"
    },
    
    "portal_features": {
      "dashboard": {
        "enabled": true,
        "widgets": ["balance", "transactions", "cards", "analytics"]
      },
      "wallets": {
        "enabled_chains": ["BTC", "ETH", "USDC", "USDT"],
        "max_wallets_per_user": 10,
        "show_fiat_value": true
      },
      "ibans": {
        "enabled": true,
        "currencies": ["EUR", "GBP"],
        "max_per_user": 3
      },
      "cards": {
        "virtual_cards": true,
        "physical_cards": true,
        "card_design_url": "https://cryptobank.pro/card-design.png",
        "show_card_details": true
      },
      "exchange": {
        "enabled": true,
        "show_rates": true,
        "supported_pairs": ["EUR-BTC", "EUR-ETH", "EUR-USDC", "BTC-ETH"]
      },
      "transactions": {
        "show_blockchain_explorer": true,
        "export_csv": true,
        "export_pdf": true
      }
    },
    
    "compliance_config": {
      "kyc_provider": "striga",
      "require_enhanced_kyc_for_cards": true,
      "lei_verification": "optional",
      "tas_verification": "preferred",
      "grace_period_days": 90,
      "transaction_monitoring": "real-time",
      "travel_rule_threshold": 1000,
      "auto_sar_filing": true
    },
    
    "api_access": {
      "rest_api": true,
      "graphql_api": true,
      "webhooks": true,
      "sdk_languages": ["javascript", "python", "php", "ruby"],
      "rate_limit": "1000/minute",
      "sandbox_mode": true
    },
    
    "mobile_apps": {
      "ios_app": {
        "enabled": true,
        "bundle_id": "pro.cryptobank.app",
        "app_store_url": "https://apps.apple.com/app/cryptobank"
      },
      "android_app": {
        "enabled": true,
        "package_name": "pro.cryptobank.android",
        "play_store_url": "https://play.google.com/store/apps/cryptobank"
      }
    }
  }
}
\`\`\`

### Deployment Options

\`\`\`mermaid
graph TB
    subgraph "Deployment Models"
        CLOUD[Cloud Hosted<br/>FTS Infrastructure]
        HYBRID[Hybrid Model<br/>Partial Self-Hosted]
        ONPREM[On-Premise<br/>Full Control]
    end
    
    subgraph "Cloud Hosted Benefits"
        C1[Fastest Setup<br/>2-3 days]
        C2[Lowest Cost<br/>$2,500/month]
        C3[Automatic Updates<br/>Zero DevOps]
        C4[99.9% SLA<br/>Guaranteed]
    end
    
    subgraph "Hybrid Benefits"
        H1[Moderate Setup<br/>1-2 weeks]
        H2[Moderate Cost<br/>$5,000/month]
        H3[Data Sovereignty<br/>Sensitive Data Local]
        H4[Custom Integration<br/>Flexibility]
    end
    
    subgraph "On-Premise Benefits"
        O1[Longest Setup<br/>1-2 months]
        O2[Highest Cost<br/>$50,000+ setup]
        O3[Full Control<br/>All Infrastructure]
        O4[Maximum Security<br/>Air-Gapped Option]
    end
    
    CLOUD --> C1
    CLOUD --> C2
    CLOUD --> C3
    CLOUD --> C4
    
    HYBRID --> H1
    HYBRID --> H2
    HYBRID --> H3
    HYBRID --> H4
    
    ONPREM --> O1
    ONPREM --> O2
    ONPREM --> O3
    ONPREM --> O4
    
    style CLOUD fill:#10b981,color:#fff
    style HYBRID fill:#3b82f6,color:#fff
    style ONPREM fill:#8b5cf6,color:#fff
\`\`\`

---

## VASP Platform Pricing

### Subscription Tiers

\`\`\`
┌─────────────────────────────────────────────────────────────────────┐
│                         VASP PLATFORM PRICING                       │
├─────────────┬─────────────────┬─────────────────┬──────────────────┤
│ Feature     │ Starter         │ Professional    │ Enterprise       │
├─────────────┼─────────────────┼─────────────────┼──────────────────┤
│ Monthly Fee │ $2,500          │ $5,000          │ $15,000          │
│ Setup Fee   │ $500            │ $2,000          │ $10,000          │
│             │                 │                 │                  │
│ CUSTOMERS   │                 │                 │                  │
│ Max Users   │ 100             │ 1,000           │ Unlimited        │
│ KYC Included│ 50/month        │ 500/month       │ Unlimited        │
│             │                 │                 │                  │
│ WALLETS     │                 │                 │                  │
│ Chains      │ BTC, ETH, USDC  │ +SOL, AVAX, DOT │ All supported    │
│ Max/User    │ 5               │ 10              │ Unlimited        │
│ Lightning   │ ❌              │ ✅              │ ✅               │
│ Custody     │ Basic           │ Enhanced        │ Institutional    │
│             │                 │                 │                  │
│ BANKING     │                 │                 │                  │
│ Virtual IBAN│ ✅ (pooled)     │ ✅ (dedicated)  │ ✅ (named)       │
│ Currencies  │ EUR             │ EUR, GBP        │ EUR, GBP, USD+   │
│ SEPA Instant│ ✅              │ ✅              │ ✅               │
│ SWIFT       │ ❌              │ ✅              │ ✅               │
│             │                 │                 │                  │
│ CARDS       │                 │                 │                  │
│ Virtual     │ ✅              │ ✅              │ ✅               │
│ Physical    │ ❌              │ ✅              │ ✅               │
│ Custom Brand│ ❌              │ ❌              │ ✅               │
│ ATM Limit   │ $500/day        │ $1,000/day      │ Custom           │
│             │                 │                 │                  │
│ LIMITS      │                 │                 │                  │
│ Daily Volume│ $100,000        │ $1,000,000      │ Unlimited        │
│ Transaction │ $10,000         │ $50,000         │ Custom           │
│             │                 │                 │                  │
│ FEATURES    │                 │                 │                  │
│ White-Label │ Basic           │ Full            │ Full + Mobile    │
│ API Access  │ REST            │ REST + GraphQL  │ Full + Custom    │
│ Support     │ Email (24h)     │ Priority (4h)   │ Dedicated (1h)   │
│ SLA         │ 99.5%           │ 99.9%           │ 99.99%           │
└─────────────┴─────────────────┴─────────────────┴──────────────────┘
\`\`\`

### Usage-Based Fees

\`\`\`yaml
transaction_fees:
  on_ramp_fiat_to_crypto:
    fee_percentage: 1.5%
    minimum_fee: $5.00
    examples:
      - amount: €100 → fee: €5.00 (minimum)
      - amount: €1,000 → fee: €15.00
      - amount: €10,000 → fee: €150.00
      
  off_ramp_crypto_to_fiat:
    fee_percentage: 1.5%
    minimum_fee: $5.00
    includes:
      - crypto_to_fiat_conversion
      - sepa_transfer_out
      
  crypto_to_crypto_exchange:
    fee_percentage: 0.5%
    minimum_fee: $2.00
    examples:
      - BTC → ETH: 0.5%
      - ETH → USDC: 0.5%
      
  blockchain_transfers:
    fee_structure: "network_fee + markup"
    markup: $1.00
    examples:
      - BTC transfer: ~$3-15 network + $1 = $4-16
      - ETH transfer: ~$2-50 network + $1 = $3-51
      - USDC transfer: ~$1-20 network + $1 = $2-21
      - Lightning: <$0.01 network + $1 = $1.01

iban_fees:
  incoming_sepa_transfer:
    fee: €0.00
    notes: "Free incoming transfers"
    
  outgoing_sepa_transfer:
    fee: €0.50
    includes:
      - standard_sepa
      - sepa_instant_same_cost
      
  outgoing_swift_transfer:
    fee: $25.00
    notes: "International wire transfers"

card_fees:
  virtual_card_issuance:
    fee: $8.00
    monthly_maintenance: $0.00
    
  physical_card_issuance:
    fee: $20.00
    monthly_maintenance: $2.00
    shipping: "Included (5-7 days)"
    
  card_usage:
    purchase_fee: 0%
    atm_withdrawal_domestic: $2.50
    atm_withdrawal_international: $3.50 + 2%
    foreign_exchange_markup: 2.5%
    
  card_management:
    replacement_card: $15.00
    expedited_shipping: $25.00
    pin_change: $0.00

verification_fees:
  basic_kyc:
    fee: $5.00
    turnaround: "10 minutes (automated)"
    includes:
      - photo_id_verification
      - selfie_liveness_check
      - address_validation
      
  enhanced_kyc:
    fee: $15.00
    turnaround: "1-4 hours"
    includes:
      - basic_kyc_plus
      - proof_of_address_document
      - source_of_funds_check
      - manual_review
      
  business_kyb:
    fee: $50.00
    turnaround: "1-3 days"
    includes:
      - company_registration_verification
      - beneficial_ownership_check
      - director_kyc
      - aml_screening
      - sanctions_screening
      
  lei_verification:
    fee: $0.00
    turnaround: "Instant"
    notes: "Free via GLEIF API integration"
    
  vlei_verification:
    fee: $0.00
    turnaround: "Instant"
    notes: "Cryptographic verification, no cost"

compliance_fees:
  travel_rule_exchange:
    fee: $0.25
    notes: "Per travel rule message sent/received"
    
  enhanced_monitoring:
    fee: $10.00/month
    notes: "Per customer flagged for enhanced monitoring"
    
  sar_filing:
    fee: $100.00
    notes: "Per suspicious activity report filed"
    
  compliance_review:
    hourly_rate: $150.00
    notes: "Manual compliance review for complex cases"
\`\`\`

---

## Customer Identity Framework

### Trust-Based Identity Model

**Identity Credential Hierarchy:**

\`\`\`mermaid
graph TB
    A[Customer Registration] --> B{Credential Type}
    
    B -->|TAS ID| C[Trust Anchor Service<br/>Highest Trust]
    B -->|vLEI| D[Verifiable LEI<br/>High Trust]
    B -->|LEI| E[Legal Entity Identifier<br/>Moderate Trust]
    B -->|None| F[Grace Period<br/>90 Days Trial]
    
    C --> C1{TAS Verification}
    C1 -->|Valid| C2[✅ INSTANT ACCESS]
    C1 -->|Invalid| F
    
    D --> D1{vLEI Crypto Verify}
    D1 -->|Valid| D2[✅ INSTANT ACCESS]
    D1 -->|Invalid| F
    
    E --> E1{GLEIF API Verify}
    E1 -->|Valid| E2[⚠️ REQUIRES KYB]
    E2 --> E3[KYB Verification]
    E3 -->|Approved| E4[✅ FULL ACCESS]
    E3 -->|Rejected| E5[❌ SUSPENDED]
    E1 -->|Invalid| F
    
    F --> F1[Limited Services]
    F1 --> F2{90 Days Elapsed?}
    F2 -->|Credentials Provided| C1
    F2 -->|No Credentials| F3[❌ AUTO-SUSPEND]
    
    style C fill:#10b981,color:#fff
    style D fill:#10b981,color:#fff
    style E fill:#f59e0b,color:#fff
    style F fill:#ef4444,color:#fff
    style C2 fill:#10b981,color:#fff
    style D2 fill:#10b981,color:#fff
    style E4 fill:#10b981,color:#fff
    style E5 fill:#ef4444,color:#fff
    style F3 fill:#ef4444,color:#fff
\`\`\`

**Credential Details:**

**TAS ID (Trust Anchor Service Identifier):**
- Issued by accredited Trust Anchors in ToIP ecosystem
- Cryptographic proof of legal entity status
- Instant verification without manual KYB
- Automatically includes vLEI capabilities
- Format: Provider-specific (e.g., \`TAS-ACME-2024-001234\`)
- **Benefit:** Fastest onboarding, highest trust level

**vLEI (Verifiable Legal Entity Identifier):**
- Digital credential based on traditional LEI
- W3C Verifiable Credentials standard
- Cryptographic signatures for authenticity
- Decentralized verification (no central authority needed)
- Blockchain-agnostic (uses DID infrastructure)
- **Benefit:** Automated verification, instant trust

**LEI (Legal Entity Identifier):**
- 20-character alphanumeric code from GLEIF
- Global standard for legal entity identification (ISO 17442)
- Verified via GLEIF API
- **Requirement:** Triggers mandatory KYB verification
- Format: 20 characters (e.g., \`213800ABCDEFG1234567\`)
- **Benefit:** Regulatory compliance, but requires full KYB

**Grace Period (No Credentials):**
- 90-day trial for new/small businesses
- Limited service access
- Must upgrade to TAS/LEI before expiration
- **Restrictions:**
  - Max 1 wallet
  - Max €1,000 daily transactions
  - No card issuance
  - Virtual IBAN (view only, no withdrawals)

---

## AML/CFT Compliance

### Sanctions Screening

**Global Sanctions List Coverage:**

\`\`\`mermaid
graph TB
    subgraph "Sanctions Data Sources"
        OFAC[OFAC SDN<br/>US Treasury]
        EU[EU Consolidated<br/>European Union]
        UN[UN Security Council<br/>Global Sanctions]
        UK[UK HMT<br/>UK Treasury]
        OFSI[OFSI List<br/>UK Financial Sanctions]
    end
    
    subgraph "Screening Engine"
        IMPORT[Daily Import<br/>Automated Sync]
        INDEX[Search Index<br/>Fuzzy Matching]
        CHECK[Real-Time Check<br/>Every Transaction]
    end
    
    subgraph "Matching Algorithm"
        EXACT[Exact Name Match<br/>100% confidence]
        FUZZY[Fuzzy Match<br/>80-99% confidence]
        PARTIAL[Partial Match<br/>60-79% confidence]
    end
    
    subgraph "Actions"
        BLOCK[Auto-Block<br/>>90% match]
        REVIEW[Manual Review<br/>60-90% match]
        CLEAR[Auto-Clear<br/><60% match]
    end
    
    OFAC --> IMPORT
    EU --> IMPORT
    UN --> IMPORT
    UK --> IMPORT
    OFSI --> IMPORT
    
    IMPORT --> INDEX
    INDEX --> CHECK
    
    CHECK --> EXACT
    CHECK --> FUZZY
    CHECK --> PARTIAL
    
    EXACT --> BLOCK
    FUZZY --> REVIEW
    PARTIAL --> REVIEW
    
    style BLOCK fill:#ef4444,color:#fff
    style REVIEW fill:#f59e0b,color:#fff
    style CLEAR fill:#10b981,color:#fff
\`\`\`

**Sanctions Lists Updated:**
- **Frequency:** Every 24 hours
- **Sources:** OFAC, EU, UN, UK, OFSI
- **Total Entities:** 15,000+ sanctioned individuals/entities
- **Match Algorithm:** Levenshtein distance + phonetic matching
- **False Positive Rate:** <2%

### PEP (Politically Exposed Persons) Checks

**PEP Categories:**

| Category | Risk Level | Examples | Monitoring Frequency |
|----------|------------|----------|----------------------|
| **Foreign PEP** | High | Heads of state, ministers | Monthly re-screen |
| **Domestic PEP** | Medium | Local politicians, officials | Quarterly re-screen |
| **International Org PEP** | Medium | UN, IMF, World Bank officials | Quarterly re-screen |
| **Family Members** | Medium | Spouse, children of PEPs | Quarterly re-screen |
| **Close Associates** | Medium | Business partners of PEPs | Quarterly re-screen |

**PEP Enhanced Due Diligence:**

When customer matches PEP database:

\`\`\`yaml
edd_requirements:
  approval:
    level: "Senior Management"
    required_approvers: 2
    documentation: "Detailed risk assessment report"
    
  source_of_wealth:
    required: true
    documents:
      - employment_contract
      - tax_returns (last 3 years)
      - bank_statements (last 6 months)
      - asset_declarations
      
  monitoring:
    transaction_review: "Every transaction >€5,000"
    balance_monitoring: "Monthly threshold checks"
    news_monitoring: "Daily adverse media scan"
    relationship_review: "Annual full review"
    
  transaction_limits:
    daily: €10,000
    monthly: €50,000
    annual: €500,000
    
  reporting:
    internal: "Monthly PEP activity report"
    regulatory: "Annual VASP compliance filing"
\`\`\`

### Transaction Monitoring

**Pattern Detection Rules:**

\`\`\`mermaid
flowchart TD
    A[Monitor All Transactions] --> B{Velocity Check}
    
    B -->|Spike Detected| C[Flag: High Velocity]
    B -->|Normal| D{Structuring Pattern}
    
    D -->|Multiple Just Below Threshold| E[Flag: Possible Structuring]
    D -->|Normal| F{Geographic Risk}
    
    F -->|High Risk Country| G[Flag: Geographic Risk]
    F -->|Normal| H{Round Dollar Amounts}
    
    H -->|Frequent Round Amounts| I[Flag: Unusual Pattern]
    H -->|Normal| J{Rapid Movement}
    
    J -->|In/Out Same Day| K[Flag: Pass-Through Activity]
    J -->|Normal| L{Mixing Service}
    
    L -->|Funds from Mixer| M[Flag: High Risk Source]
    L -->|Clean| N[Clear Transaction]
    
    C --> O[Risk Score +30]
    E --> P[Risk Score +40]
    G --> Q[Risk Score +20]
    I --> R[Risk Score +15]
    K --> S[Risk Score +25]
    M --> T[Risk Score +50]
    
    O --> U{Total Risk Score}
    P --> U
    Q --> U
    R --> U
    S --> U
    T --> U
    
    U -->|Score > 70| V[BLOCK + SAR]
    U -->|Score 40-70| W[Manual Review]
    U -->|Score < 40| N
    
    N --> X[Process Normally]
    
    style V fill:#ef4444,color:#fff
    style W fill:#f59e0b,color:#fff
    style X fill:#10b981,color:#fff
\`\`\`

**Monitoring Thresholds:**

\`\`\`json
{
  "monitoring_rules": {
    "velocity_check": {
      "trigger": "5 transactions within 10 minutes",
      "action": "flag_for_review",
      "risk_score": 30
    },
    
    "structuring_detection": {
      "trigger": "3+ transactions between €900-€990 within 24 hours",
      "threshold": 1000,
      "action": "immediate_review",
      "risk_score": 40
    },
    
    "round_dollar_pattern": {
      "trigger": "5+ transactions at exact €1000, €5000, €10000",
      "timeframe": "7 days",
      "action": "flag_for_review",
      "risk_score": 15
    },
    
    "high_risk_country": {
      "countries": ["KP", "IR", "SY", "CU"],
      "action": "enhanced_screening",
      "risk_score": 50
    },
    
    "rapid_movement": {
      "trigger": "Deposit + withdrawal same day, >€5,000",
      "action": "manual_review",
      "risk_score": 25
    },
    
    "mixing_service": {
      "sources": ["tornado_cash", "samourai_whirlpool"],
      "action": "block_immediately",
      "risk_score": 100,
      "auto_sar": true
    }
  }
}
\`\`\`

---

## Blockchain Analytics Integration

### On-Chain Risk Scoring

**Blockchain Intelligence Integration:**

The VASP platform integrates with leading blockchain analytics providers to assess the risk of cryptocurrency addresses and transactions:

- **Chainalysis:** Primary provider for BTC, ETH, and ERC-20 tokens
- **Elliptic:** Secondary provider for cross-verification
- **CipherTrace:** Specialized DeFi protocol analysis

\`\`\`mermaid
sequenceDiagram
    participant User as Customer
    participant Portal as VASP Portal
    participant Chain as Blockchain Analytics
    participant Explorer as Blockchain
    participant Compliance as Compliance Engine
    
    User->>Portal: Initiate Withdrawal to Address
    Portal->>Chain: Analyze Destination Address
    
    Chain->>Explorer: Get Address History
    Explorer-->>Chain: Transaction History
    
    Chain->>Chain: Risk Assessment
    Note over Chain: Check for:<br/>- Sanctioned entities<br/>- Mixing services<br/>- Dark web markets<br/>- Ransomware<br/>- Scam addresses
    
    Chain-->>Portal: Risk Score & Details
    
    alt Risk Score > 80 (High Risk)
        Portal->>Compliance: Block Transaction
        Compliance->>Compliance: Generate SAR
        Compliance->>User: Transaction Blocked
        Note over User: "Withdrawal declined:<br/>High risk destination"
        
    else Risk Score 50-80 (Medium Risk)
        Portal->>Compliance: Flag for Review
        Compliance->>Compliance: Manual Review Queue
        Compliance->>User: Transaction Pending Review
        Note over Compliance: Compliance officer reviews<br/>within 4 hours
        
    else Risk Score < 50 (Low Risk)
        Portal->>Portal: Process Withdrawal
        Portal->>Explorer: Submit Transaction
        Explorer-->>Portal: TX Hash
        Portal->>User: Withdrawal Initiated
    end
\`\`\`

**Risk Scoring Criteria:**

| Risk Factor | Score Impact | Examples |
|-------------|--------------|----------|
| **Sanctioned Entity** | +100 (Auto-block) | OFAC SDN list match |
| **Mixing Service** | +90 | Tornado Cash, CoinJoin |
| **Dark Web Marketplace** | +85 | Silk Road, AlphaBay |
| **Ransomware** | +95 | Wannacry, Ryuk wallets |
| **Scam/Fraud** | +70 | Reported scam addresses |
| **Exchange (Known)** | +5 | Binance, Coinbase |
| **Gambling** | +30 | Online casino addresses |
| **High Risk Country** | +40 | Iran, North Korea |
| **New Address** | +10 | No transaction history |
| **Clean History** | 0 | Verified legitimate use |

---

## Regulatory Compliance

### Multi-Jurisdiction VASP Requirements

**Compliance Matrix by Jurisdiction:**

\`\`\`mermaid
graph TB
    subgraph "European Union - MiCA Regulation"
        EU1[VASP Registration<br/>Required]
        EU2[Capital Requirements<br/>€350K minimum]
        EU3[Governance<br/>Fit & Proper Test]
        EU4[Consumer Protection<br/>Disclosures]
        EU5[Market Abuse<br/>Surveillance]
    end
    
    subgraph "United States - FinCEN"
        US1[MSB Registration<br/>Money Services Business]
        US2[State Licensing<br/>Money Transmitter]
        US3[BSA Compliance<br/>Bank Secrecy Act]
        US4[CTR Filing<br/>>$10K cash transactions]
        US5[SAR Filing<br/>Suspicious Activity]
    end
    
    subgraph "United Kingdom - FCA"
        UK1[FCA Authorization<br/>Cryptoasset Registration]
        UK2[MLR 2017<br/>Money Laundering Regs]
        UK3[Travel Rule<br/>TRA 2021]
        UK4[Consumer Duty<br/>Fair Outcomes]
        UK5[Financial Promotion<br/>Marketing Rules]
    end
    
    subgraph "Singapore - MAS"
        SG1[PSA License<br/>Payment Services Act]
        SG2[MAS Notice 626<br/>AML/CFT Requirements]
        SG3[Technology Risk<br/>Management]
        SG4[Cybersecurity<br/>Controls]
    end
    
    subgraph "FTS.Money Implementation"
        IMP[Unified Compliance<br/>Multi-Jurisdiction]
    end
    
    EU1 --> IMP
    EU2 --> IMP
    EU3 --> IMP
    EU4 --> IMP
    EU5 --> IMP
    
    US1 --> IMP
    US2 --> IMP
    US3 --> IMP
    US4 --> IMP
    US5 --> IMP
    
    UK1 --> IMP
    UK2 --> IMP
    UK3 --> IMP
    UK4 --> IMP
    UK5 --> IMP
    
    SG1 --> IMP
    SG2 --> IMP
    SG3 --> IMP
    SG4 --> IMP
    
    IMP --> IMPL[Built-in Platform<br/>Compliance]
    
    style IMP fill:#10b981,color:#fff
    style IMPL fill:#2563eb,color:#fff
\`\`\`

### MiCA (Markets in Crypto-Assets Regulation)

**Implementation Timeline:**

- **June 2023:** MiCA Regulation Published
- **December 2024:** Stablecoin Rules Effective
- **June 2024:** Full MiCA Implementation
- **FTS.Money Status:** ✅ MiCA Ready (via Striga EU VASP license)

**MiCA Requirements Covered:**

1. **Authorization Requirements**
   - EU VASP license (via Striga)
   - Capital requirements (€350K minimum)
   - Governance and management standards

2. **Transparency Obligations**
   - White paper publication
   - Marketing disclosures
   - Fee transparency
   - Risk warnings

3. **Consumer Protection**
   - Custody safeguards
   - Complaints handling
   - Compensation schemes
   - Right to withdrawal

4. **Market Integrity**
   - Insider dealing prevention
   - Market manipulation detection
   - Transaction reporting

5. **Operational Requirements**
   - Cybersecurity measures
   - Business continuity plans
   - Outsourcing arrangements

---

## Platform Administration

### Managing VASP Customers

**Customer Lifecycle Management:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Registration
    Registration --> PendingVerification
    
    PendingVerification --> TASVerification: Has TAS ID
    PendingVerification --> LEIVerification: Has LEI
    PendingVerification --> GracePeriod: No Credentials
    
    TASVerification --> Active: Verified
    TASVerification --> Rejected: Invalid
    
    LEIVerification --> KYBRequired: Valid LEI
    LEIVerification --> Rejected: Invalid LEI
    
    KYBRequired --> KYBInProgress: Started KYB
    KYBInProgress --> Active: KYB Approved
    KYBInProgress --> Rejected: KYB Failed
    
    GracePeriod --> Limited: 0-90 Days
    Limited --> Active: Credentials Provided
    Limited --> Suspended: 90 Days Expired
    
    Active --> Monitoring: Ongoing Operations
    Monitoring --> Flagged: High Risk Activity
    Flagged --> Active: Resolved
    Flagged --> Suspended: Compliance Issue
    
    Suspended --> Active: Issue Resolved
    Suspended --> Terminated: Permanent Ban
    
    Rejected --> [*]
    Terminated --> [*]
    
    note right of Active
        Full VASP services
        Can trade, transfer, withdraw
        Cards issued
    end note
    
    note right of Limited
        Trial mode
        Max €1,000/day
        No cards
    end note
    
    note right of Suspended
        Services disabled
        Data retained
        Can appeal
    end note
\`\`\`

### Customer Dashboard Metrics

**Platform-Wide Statistics:**

\`\`\`
VASP Platform Dashboard - Real-Time Metrics

Customer Accounts:
  Total Customers:              1,247
  ├─ Active:                    1,089 (87.3%)
  ├─ Suspended:                 23 (1.8%)
  ├─ Grace Period:              98 (7.9%)
  └─ Pending Verification:      37 (3.0%)
  
Identity Verification:
  TAS ID Verified:              234 (18.8%)
  vLEI Verified:                156 (12.5%)
  LEI + KYB Verified:           543 (43.5%)
  Grace Period (No Creds):      314 (25.2%)
  
Compliance Status:
  Clean (No Flags):             1,143 (91.7%)
  Enhanced Monitoring:          67 (5.4%)
  Under Review:                 23 (1.8%)
  Blocked:                      14 (1.1%)
  
Transaction Volume (Last 30 Days):
  Total Transactions:           45,678
  Total Volume:                 €12.4M
  Avg Transaction:              €271.50
  On-Ramp (Fiat→Crypto):        €7.2M (58%)
  Off-Ramp (Crypto→Fiat):       €3.8M (31%)
  Crypto-Crypto Exchange:       €1.4M (11%)
  
Wallet Statistics:
  Total Wallets:                3,456
  ├─ BTC Wallets:               1,234 (€4.2M)
  ├─ ETH Wallets:               1,098 (€2.8M)
  ├─ USDC Wallets:              987 (€5.1M)
  └─ Other:                     137 (€0.3M)
  Total AUM:                    €12.4M
  
Banking Rails:
  Virtual IBANs Issued:         876
  Active Cards:                 543
  ├─ Virtual:                   423
  └─ Physical:                  120
  SEPA Transfers (Month):       2,341 (€6.8M)
  
Revenue (Last 30 Days):
  Subscription Fees:            €156,000 (62 customers)
  Transaction Fees:             €89,500
  KYC/KYB Fees:                 €12,300
  Card Fees:                    €8,900
  Total Revenue:                €266,700
  
Costs (Last 30 Days):
  Striga Base Fees:             €93,000 (62 × €1,500)
  Usage Pass-Through:           €54,200
  Total Costs:                  €147,200
  
Gross Profit:                   €119,500 (44.8% margin)
\`\`\`

---

## Integration & API

### Developer Integration Guide

**VASP Platform APIs:**

\`\`\`javascript
// Initialize FTS.Money VASP SDK
import { FTSMoneyVASP } from '@ftsmoney/vasp-sdk';

const vasp = new FTSMoneyVASP({
  apiKey: process.env.VASP_API_KEY,
  apiSecret: process.env.VASP_API_SECRET,
  environment: 'production'
});

// Create customer with LEI
const customer = await vasp.customers.create({
  email: 'customer@example.com',
  company_name: 'Example Corp',
  lei: '213800ABCDEFG1234567', // Triggers KYB
  country: 'DE',
  compliance: {
    require_kyb: true,
    kyb_provider: 'auto'
  }
});

// Check KYB status
const kybStatus = await vasp.customers.getKYBStatus(customer.id);
console.log(kybStatus);
// {
//   status: 'in_progress',
//   documents_required: ['certificate_of_incorporation', 'proof_of_address'],
//   estimated_completion: '2026-01-10T14:00:00Z'
// }

// Create wallet for verified customer
const wallet = await vasp.wallets.create({
  customer_id: customer.id,
  currency: 'BTC',
  type: 'custodial'
});

console.log(wallet);
// {
//   id: 'wallet_abc123',
//   address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
//   currency: 'BTC',
//   balance: 0,
//   status: 'active'
// }

// Create virtual IBAN
const iban = await vasp.ibans.create({
  customer_id: customer.id,
  currency: 'EUR',
  type: 'dedicated' // or 'pooled'
});

console.log(iban);
// {
//   iban: 'DE89370400440532013000',
//   bic: 'COBADEFFXXX',
//   account_name: 'Example Corp',
//   status: 'active'
// }

// Issue virtual card
const card = await vasp.cards.issue({
  customer_id: customer.id,
  type: 'virtual',
  funding_source: wallet.id,
  limits: {
    daily: 5000,
    monthly: 20000
  }
});

console.log(card);
// {
//   id: 'card_xyz789',
//   card_number: '4***********1234',
//   cvv: '***',
//   expiry: '12/28',
//   status: 'active'
// }

// Exchange crypto to fiat
const exchange = await vasp.exchange.execute({
  customer_id: customer.id,
  from_currency: 'BTC',
  to_currency: 'EUR',
  amount: 0.05,
  rate_lock_seconds: 30
});

console.log(exchange);
// {
//   from_amount: 0.05,
//   from_currency: 'BTC',
//   to_amount: 2125.50,
//   to_currency: 'EUR',
//   rate: 42510.00,
//   fee: 25.51,
//   net_amount: 2100.00,
//   status: 'completed'
// }

// Monitor compliance status
const compliance = await vasp.compliance.getCustomerStatus(customer.id);

console.log(compliance);
// {
//   kyc_level: 'enhanced',
//   kyb_status: 'approved',
//   lei_status: 'verified',
//   sanctions_clear: true,
//   pep_match: false,
//   risk_score: 15,
//   risk_level: 'low',
//   enhanced_monitoring: false,
//   last_screened: '2026-01-05T12:00:00Z'
// }
\`\`\`

### Webhook Events

**Available Webhook Events:**

\`\`\`yaml
webhooks:
  customer_events:
    - customer.created
    - customer.kyc_completed
    - customer.kyb_completed
    - customer.verified
    - customer.suspended
    - customer.reactivated
    
  wallet_events:
    - wallet.created
    - wallet.funded
    - wallet.withdrawal_initiated
    - wallet.withdrawal_completed
    - wallet.balance_low
    
  iban_events:
    - iban.created
    - iban.deposit_received
    - iban.transfer_sent
    - iban.transfer_failed
    
  card_events:
    - card.issued
    - card.activated
    - card.transaction_authorized
    - card.transaction_declined
    - card.frozen
    - card.unfrozen
    
  exchange_events:
    - exchange.initiated
    - exchange.completed
    - exchange.failed
    
  compliance_events:
    - compliance.sanctions_hit
    - compliance.pep_match
    - compliance.high_risk_transaction
    - compliance.sar_filed
    - compliance.lei_expired
    - compliance.kyb_required
\`\`\`

**Webhook Payload Example:**

\`\`\`json
{
  "event": "wallet.funded",
  "timestamp": "2026-01-05T14:23:45Z",
  "data": {
    "customer_id": "cust_abc123",
    "wallet_id": "wallet_xyz789",
    "currency": "BTC",
    "amount": 0.05,
    "tx_hash": "a1b2c3d4e5f6...",
    "confirmations": 3,
    "usd_value": 2125.50,
    "source_address": "bc1q...",
    "risk_score": 12,
    "compliance_cleared": true
  },
  "signature": "sha256_hmac_signature_here"
}
\`\`\`

---

## Operational Best Practices

### For VASP Operators

**1. Daily Operations Checklist:**

\`\`\`markdown
Daily VASP Operations Checklist

□ Morning Review (9:00 AM):
  □ Check overnight transactions for anomalies
  □ Review compliance alerts and flagged accounts
  □ Verify all blockchain nodes are synced
  □ Check Striga API status and uptime
  
□ Compliance Monitoring (Ongoing):
  □ Review manual review queue (target: <4h turnaround)
  □ Investigate high-risk transactions
  □ Update sanctions lists (automatic, verify completion)
  □ Monitor PEP screening results
  
□ Customer Support (Ongoing):
  □ Respond to KYC/KYB questions
  □ Assist with failed transactions
  □ Process card activation requests
  □ Handle withdrawal delays
  
□ Financial Reconciliation (Daily):
  □ Reconcile fiat balances (IBAN vs ledger)
  □ Reconcile crypto balances (on-chain vs ledger)
  □ Review pending settlements
  □ Check for discrepancies
  
□ End of Day (6:00 PM):
  □ Generate daily transaction report
  □ Review key metrics vs targets
  □ Plan next day priorities
  □ Log any incidents or issues
\`\`\`

**2. Weekly Compliance Tasks:**

- Full sanctions list refresh and re-screen all active customers
- Review enhanced monitoring accounts for continued risk
- Generate weekly SAR summary report for compliance officer
- Update blockchain analytics risk model
- Review and update transaction monitoring rules

**3. Monthly Operations:**

- PEP re-screening for all Enhanced Monitoring customers
- LEI status verification for all business customers
- Customer risk rating review and updates
- Compliance attestation report to regulators
- Staff training on new compliance requirements

### For Compliance Officers

**Suspicious Activity Indicators:**

\`\`\`yaml
red_flags:
  structuring_indicators:
    - "Multiple deposits just under €1,000 threshold"
    - "Frequent round-number transactions (€1,000, €5,000, €10,000)"
    - "Splitting large amounts across multiple days"
    
  rapid_movement:
    - "Deposit and immediate withdrawal (same day)"
    - "Funds in/out without holding period"
    - "Using VASP as pass-through"
    
  geographic_risk:
    - "Transactions involving sanctioned countries"
    - "IPs from high-risk jurisdictions"
    - "VPN usage from multiple countries rapidly"
    
  behavioral_anomalies:
    - "Sudden increase in transaction volume"
    - "Change in transaction pattern"
    - "Unusual hours (2-5 AM transactions)"
    - "Multiple failed KYC attempts"
    
  blockchain_red_flags:
    - "Deposits from mixing services"
    - "Withdrawals to dark web marketplaces"
    - "Connections to known scam addresses"
    - "Frequent use of new addresses"
\`\`\`

**SAR (Suspicious Activity Report) Filing:**

\`\`\`mermaid
flowchart TD
    A[Suspicious Activity Detected] --> B[Compliance Officer Review]
    B --> C{File SAR?}
    
    C -->|Yes| D[Generate SAR Report]
    C -->|No| E[Document Decision]
    
    D --> F[Complete SAR Form]
    F --> G[Include Supporting Evidence]
    G --> H[Internal Review]
    H --> I{Approved?}
    
    I -->|Yes| J[Submit to FIU]
    I -->|No| K[Request More Info]
    K --> F
    
    J --> L[FIU Acknowledgment]
    L --> M[Continue Monitoring]
    
    E --> M
    
    M --> N{Ongoing Suspicious Activity?}
    N -->|Yes| D
    N -->|No| O[Close Case]
    
    style D fill:#f59e0b,color:#fff
    style J fill:#ef4444,color:#fff
    style O fill:#10b981,color:#fff
\`\`\`

---

## Revenue & Business Model

### Pricing Strategy

**Cost Structure (Striga Pass-Through):**

\`\`\`
Monthly Costs per Customer:
  Striga Base Fee:              $1,500
  KYC Verification (avg):       $150 (30 users × $5)
  Card Issuance (avg):          $80 (10 cards × $8)
  Transaction Fees:             $350 (pass-through)
  Support & Compliance:         $200 (allocated overhead)
  
Total Monthly Cost:             $2,280 per customer

FTS.Money Pricing:
  Subscription Fee:             $2,500 - $15,000
  Usage Fees:                   1.2-1.5× cost
  
Gross Margin:                   40-65% depending on tier and usage
\`\`\`

**Revenue Projection Model:**

\`\`\`
Year 1 Targets:
  Q1: 10 customers  × $2,500 = $25,000/mo  → $300K ARR
  Q2: 25 customers  × $3,000 = $75,000/mo  → $900K ARR
  Q3: 50 customers  × $3,500 = $175,000/mo → $2.1M ARR
  Q4: 75 customers  × $4,000 = $300,000/mo → $3.6M ARR
  
  Year 1 Total: ~$1.8M ARR (average mid-year)
  
Year 2 Targets:
  Q1: 100 customers × $4,000 = $400,000/mo → $4.8M ARR
  Q2: 150 customers × $4,200 = $630,000/mo → $7.6M ARR
  Q3: 200 customers × $4,500 = $900,000/mo → $10.8M ARR
  Q4: 250 customers × $5,000 = $1.25M/mo   → $15M ARR
  
  Year 2 Total: ~$9.5M ARR (average mid-year)
  
Year 3 Targets:
  Customers: 500 (mature market penetration)
  Avg Revenue/Customer: $6,000/month
  Total ARR: $36M
  
  Add Usage Revenue:
    Transaction Fees: $12M/year
    KYC/Card Fees: $4M/year
    
  Total Revenue: $52M
  Gross Margin (50%): $26M gross profit
\`\`\`

---

## Competitive Positioning

### Market Comparison

\`\`\`mermaid
graph TB
    subgraph "Feature Comparison"
        F1[Multi-Chain Wallets]
        F2[Virtual IBANs]
        F3[Card Issuance]
        F4[White-Label]
        F5[EU VASP Licensed]
        F6[Travel Rule]
        F7[LEI Integration]
    end
    
    subgraph "FTS.Money VASP"
        FTS1[✅ BTC, ETH, USDC+]
        FTS2[✅ Dedicated IBANs]
        FTS3[✅ Virtual + Physical]
        FTS4[✅ Full Branding]
        FTS5[✅ Via Striga]
        FTS6[✅ IVMS101]
        FTS7[✅ GLEIF + vLEI]
    end
    
    subgraph "BitGo"
        BG1[✅ Multi-Chain]
        BG2[❌ No IBANs]
        BG3[❌ No Cards]
        BG4[❌ Limited]
        BG5[⚠️ Partial]
        BG6[⚠️ Basic]
        BG7[❌ No LEI]
    end
    
    subgraph "Fireblocks"
        FB1[✅ Multi-Chain]
        FB2[❌ No IBANs]
        FB3[❌ No Cards]
        FB4[❌ No]
        FB5[⚠️ Partial]
        FB6[⚠️ Basic]
        FB7[❌ No LEI]
    end
    
    subgraph "Circle"
        CR1[⚠️ USDC Only]
        CR2[⚠️ Limited]
        CR3[❌ No Cards]
        CR4[❌ No]
        CR5[✅ Full]
        CR6[✅ Complete]
        CR7[❌ No LEI]
    end
    
    F1 --> FTS1
    F2 --> FTS2
    F3 --> FTS3
    F4 --> FTS4
    F5 --> FTS5
    F6 --> FTS6
    F7 --> FTS7
    
    style FTS1 fill:#10b981,color:#fff
    style FTS2 fill:#10b981,color:#fff
    style FTS3 fill:#10b981,color:#fff
    style FTS4 fill:#10b981,color:#fff
    style FTS5 fill:#10b981,color:#fff
    style FTS6 fill:#10b981,color:#fff
    style FTS7 fill:#10b981,color:#fff
\`\`\`

**Competitive Advantages:**

| Capability | FTS.Money VASP | Traditional Approach | Advantage |
|------------|----------------|----------------------|-----------|
| **Time to Market** | 2-3 days | 18-24 months | 99% faster |
| **Setup Cost** | $500-$10,000 | $5M-$10M | 99.95% cheaper |
| **Compliance Cost** | Included | $2M-$5M/year | Fully absorbed |
| **Banking Integration** | Built-in (IBANs + cards) | 6-12 months negotiation | Instant |
| **White-Label** | Complete | Build from scratch | Turnkey |
| **Custody** | Institutional (Fireblocks) | Must contract separately | Integrated |
| **Licensing** | EU VASP via Striga | Acquire own license | No regulatory burden |

---

## Conclusion

The **FTS.Money VASP Platform** is not a compliance add-on—it's a complete, production-ready crypto banking infrastructure that enables any business to become a regulated Virtual Asset Service Provider in days instead of years.

**What You Get:**

1. **Complete Crypto Banking Stack** - Wallets, IBANs, cards, exchange, custody
2. **Built-In Compliance** - EU VASP licensed, AML/CFT, Travel Rule, sanctions screening
3. **White-Label Infrastructure** - Fully branded portal, APIs, and mobile apps
4. **Identity Integration** - LEI/vLEI support with 90-day grace period
5. **Revenue-Ready** - Launch commercial crypto services immediately

**Target Customers:**

- **Crypto Exchanges:** Add fiat on/off-ramps and compliant banking
- **DeFi Platforms:** Bridge to traditional finance while staying regulated
- **Wallet Providers:** Expand into full crypto banking services
- **Neobanks:** Add crypto accounts without building infrastructure
- **PSPs:** Offer crypto services via marketplace white-label

**Get Started:**

- **For PSPs:** Enable from Service Marketplace
- **For Direct Customers:** Contact sales@fts.money
- **Documentation:** https://docs.fts.money/vasp
- **API Reference:** https://api.fts.money/vasp/docs

---

*Document Version: 2.0 | Last Updated: 2026-01-05*  
*Classification: Public - Technical Documentation*  
*Owner: FTS.Money VASP Platform Team*

© 2026 FTS.Money. All rights reserved.
`;

export default VASPPlatformDoc;