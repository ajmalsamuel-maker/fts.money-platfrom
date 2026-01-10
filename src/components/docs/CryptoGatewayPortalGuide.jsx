const CryptoGatewayPortalGuide = `# Crypto Gateway Customer Portal - Complete User Guide
## Enterprise Crypto Banking Infrastructure Portal Documentation

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Customer Documentation  
**Portal URL:** \`/CryptoGatewayDashboard\`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Portal Overview](#portal-overview)
3. [Access & Authentication](#access--authentication)
4. [Dashboard Walkthrough](#dashboard-walkthrough)
5. [Wallet Management](#wallet-management)
6. [IBAN Account Operations](#iban-account-operations)
7. [Card Issuance](#card-issuance)
8. [KYC/KYB Workflows](#kyckyb-workflows)
9. [Transaction Monitoring](#transaction-monitoring)
10. [Compliance Dashboard](#compliance-dashboard)
11. [User Management](#user-management)
12. [API Integration](#api-integration)
13. [Billing & Usage](#billing--usage)
14. [Troubleshooting](#troubleshooting)

---

## Executive Summary

### What is the Crypto Gateway Portal?

The Crypto Gateway Customer Portal provides enterprise-grade crypto banking infrastructure with:

- **Multi-Chain Wallets** - BTC, ETH, USDT, USDC across 10+ blockchains
- **Virtual IBANs** - EUR/GBP bank accounts for fiat on/off-ramps
- **Card Issuance** - Virtual and physical debit cards (Visa/Mastercard)
- **KYC/AML Compliance** - Built-in identity verification and sanctions screening
- **LEI/vLEI Authentication** - Institutional-grade identity via Legal Entity Identifier
- **White-Label Ready** - Fully customizable for your brand

### Powered by Striga

FTS.Money's Crypto Gateway is built on **Striga's** enterprise VASP infrastructure, providing:
- Licensed e-money institution (EMI) in EU
- Full crypto custody and settlement
- PCI DSS certified card program
- Banking-grade security and compliance

### Who Uses This Portal?

| Customer Type | Use Cases | Typical User |
|---------------|-----------|--------------|
| **Cryptocurrency Exchanges** | User wallets, fiat on/off-ramps | CTO, Operations Director |
| **DeFi Platforms** | Custody, wallet creation, card issuance | Product Manager |
| **PSPs with Crypto** | Add crypto payment acceptance | Business Development |
| **Neobanks** | Crypto accounts for retail customers | Head of Product |
| **Corporate Treasuries** | Crypto treasury management | CFO, Treasurer |

---

## Portal Overview

### Portal Architecture

\`\`\`mermaid
graph TB
    subgraph "Portal Pages"
        DASH[CryptoGatewayDashboard<br/>Main Dashboard]
        WALLET[CryptoWallets<br/>Wallet Management]
        IBAN[CryptoBankingWallets<br/>IBAN Accounts]
        CARD[CryptoCards<br/>Card Issuance]
        TXN[CryptoTransactions<br/>Transaction History]
        KYC[CryptoKYCManagement<br/>Identity Verification]
        COMP[CryptoBankingCompliance<br/>Compliance Monitoring]
        USER[CryptoGatewayUserManagement<br/>Team Access]
        API[CryptoAPIKeys<br/>API Management]
    end
    
    subgraph "Striga Integration"
        STRIGA[Striga API]
        CUSTODY[Custody Service]
        CARDS[Card Program]
        BANKING[Banking Rails]
    end
    
    WALLET --> STRIGA
    IBAN --> BANKING
    CARD --> CARDS
    TXN --> STRIGA
    KYC --> STRIGA
    
    style DASH fill:#ef4444,color:#fff
    style STRIGA fill:#10b981,color:#fff
\`\`\`

### Subscription Tiers

| Feature | Startup<br/>$1,499/mo | Growth<br/>$4,999/mo | Enterprise<br/>$14,999/mo |
|---------|----------------------|----------------------|---------------------------|
| **Included Wallets** | 1,000 | 10,000 | 100,000 |
| **Wallet Creation Fee** | $2/wallet | $1.50/wallet | $0.50/wallet |
| **Supported Chains** | 5 chains | 10 chains | All chains + custom |
| **IBAN Accounts** | 500 | 5,000 | 50,000 |
| **Card Issuance** | 100 cards/mo | 1,000 cards/mo | Unlimited |
| **KYC Checks** | 500/month | 5,000/month | Unlimited |
| **Transaction Fee** | 0.5% | 0.3% | 0.1% |
| **White-Label Portal** | ❌ | ✅ | ✅ Fully branded |
| **Dedicated Support** | Email | Priority | 24/7 Dedicated |
| **SLA** | 99.5% | 99.9% | 99.95% |

---

## Access & Authentication

### Authentication Methods

\`\`\`mermaid
graph TB
    subgraph "Authentication Options"
        AUTH1[Email + Password<br/>Standard login]
        AUTH2[LEI Authentication<br/>Legal Entity Identifier]
        AUTH3[vLEI Authentication<br/>Verifiable LEI]
        AUTH4[TAS Number<br/>Trust Anchor Service instant verification]
    end
    
    subgraph "Identity Verification Levels"
        L1[Level 1: Email<br/>Basic access]
        L2[Level 2: KYC<br/>Individual verification]
        L3[Level 3: KYB<br/>Business verification]
        L4[Level 4: LEI<br/>Institutional verification]
        L5[Level 5: vLEI<br/>Digital credential]
    end
    
    AUTH1 --> L1
    AUTH1 --> L2
    AUTH2 --> L4
    AUTH3 --> L5
    AUTH4 --> L4
    
    L1 -.Unlock.-> LIMIT1[Read-only access]
    L2 -.Unlock.-> LIMIT2[Personal wallets, €1K/day]
    L3 -.Unlock.-> LIMIT3[Business wallets, €50K/day]
    L4 -.Unlock.-> LIMIT4[Institutional, €5M/day]
    L5 -.Unlock.-> LIMIT5[Full access, unlimited]
    
    style AUTH3 fill:#8b5cf6,color:#fff
    style L5 fill:#10b981,color:#fff
\`\`\`

### LEI Authentication Flow

\`\`\`mermaid
sequenceDiagram
    participant User as Institution
    participant Portal as Login Page
    participant Auth as cryptoGatewayAuth
    participant LEI as GLEIF API
    participant DB as CryptoGatewayUser
    
    User->>Portal: Enter LEI number
    Portal->>Auth: Verify LEI
    
    Auth->>LEI: Query LEI record
    LEI-->>Auth: LEI data + status
    
    alt LEI Valid & Active
        Auth->>DB: Find/create user by LEI
        DB-->>Auth: User record
        
        Auth->>Portal: LEI verified
        Portal->>User: Request password/2FA
        User->>Portal: Complete authentication
        Portal->>User: Access granted
    else LEI Invalid/Expired
        Auth-->>Portal: LEI verification failed
        Portal->>User: Show error + renewal instructions
    end
\`\`\`

### Session Security

**Security Features:**
- **2FA Mandatory:** SMS or authenticator app required
- **Session Timeout:** 15 minutes idle, 4 hours absolute
- **IP Whitelisting:** Optional for institutional customers
- **Withdrawal Confirmation:** Email + 2FA for crypto withdrawals
- **Device Fingerprinting:** Detect suspicious login attempts

---

## Dashboard Walkthrough

### Main Dashboard KPIs

\`\`\`mermaid
graph TB
    subgraph "Key Metrics"
        M1[Total AUM<br/>$12.5M across all wallets]
        M2[Active Wallets<br/>4,523 wallets]
        M3[Transactions 24h<br/>1,234 txns]
        M4[Cards Issued<br/>856 active cards]
    end
    
    subgraph "Asset Distribution"
        PIE[Pie Chart<br/>BTC: 45%, ETH: 30%, Stablecoins: 20%, Other: 5%]
    end
    
    subgraph "Transaction Volume"
        LINE[Line Chart<br/>30-day transaction volume]
    end
    
    subgraph "Recent Activity"
        TABLE[Recent Transactions<br/>Type, amount, status]
    end
    
    subgraph "Alerts & Notifications"
        ALERT1[KYC Pending: 12]
        ALERT2[Large Withdrawals: 3]
        ALERT3[Compliance Flags: 0]
    end
    
    style M1 fill:#10b981,color:#fff
    style M2 fill:#3b82f6,color:#fff
    style ALERT3 fill:#10b981,color:#fff
\`\`\`

---

## Wallet Management

### Wallet Creation Flow

\`\`\`mermaid
sequenceDiagram
    participant User as Portal User
    participant Portal as Wallet Page
    participant API as Backend
    participant Striga as Striga API
    participant Blockchain
    
    User->>Portal: Click "Create Wallet"
    Portal->>User: Select blockchain
    
    User->>Portal: Choose: BTC, ETH, USDT, etc.
    Portal->>API: Create wallet request
    
    API->>Striga: POST /wallets/create
    Striga->>Blockchain: Generate address
    Blockchain-->>Striga: Address created
    
    Striga-->>API: Wallet details
    API->>API: Store wallet metadata
    
    API-->>Portal: Wallet created
    Portal->>User: Show address + QR code
\`\`\`

### Supported Blockchain Networks

| Network | Assets | Confirmation Time | Withdrawal Fee | Notes |
|---------|--------|-------------------|----------------|-------|
| **Bitcoin** | BTC | 10-60 min (1-6 blocks) | Network fee + 0.5% | SegWit supported |
| **Ethereum** | ETH, ERC-20 tokens | 1-5 min (5-25 blocks) | Gas + 0.3% | Layer 2 available |
| **Polygon** | MATIC, ERC-20 tokens | 2-10 sec | <$0.01 + 0.3% | Fastest, cheapest |
| **Binance Smart Chain** | BNB, BEP-20 tokens | 3-15 sec | ~$0.20 + 0.3% | High throughput |
| **Tron** | TRX, TRC-20 tokens | 3-5 sec | ~$1 + 0.3% | Popular for USDT |
| **Stellar** | XLM | 3-5 sec | ~$0.01 + 0.3% | Fast settlements |
| **Ripple** | XRP | 3-5 sec | ~$0.01 + 0.3% | Enterprise payments |

### Wallet Operations

**Deposit:**
- Provide deposit address to sender
- Monitor incoming transactions in real-time
- Confirmations required: BTC (3), ETH (12), USDT (12)

**Withdrawal:**
- Requires 2FA confirmation
- Whitelisted addresses recommended
- Daily withdrawal limits based on KYC level

**Internal Transfer:**
- Free between wallets in same account
- Instant settlement
- No blockchain fees

---

## IBAN Account Operations

### Virtual IBAN Features

\`\`\`mermaid
graph TB
    subgraph "IBAN Account Capabilities"
        CREATE[Create Virtual IBAN<br/>EUR or GBP]
        SEPA[SEPA Transfers<br/>Send/receive EUR]
        SWIFT[SWIFT Transfers<br/>International]
        CARD[Link to Card<br/>Fund cards via IBAN]
        CRYPTO[Crypto On/Off-Ramp<br/>Buy/sell crypto]
    end
    
    subgraph "Use Cases"
        UC1[Accept Fiat Payments]
        UC2[Pay Suppliers in EUR/GBP]
        UC3[Fund Crypto Wallets]
        UC4[Card Top-Up]
        UC5[Salary Payments]
    end
    
    CREATE --> SEPA
    CREATE --> SWIFT
    CREATE --> CARD
    CREATE --> CRYPTO
    
    SEPA --> UC1
    SWIFT --> UC2
    CRYPTO --> UC3
    CARD --> UC4
    SEPA --> UC5
    
    style CREATE fill:#3b82f6,color:#fff
    style CRYPTO fill:#10b981,color:#fff
\`\`\`

### IBAN Account Configuration

\`\`\`yaml
iban_account:
  account_holder: "ABC Crypto Exchange Ltd"
  iban: "LT123456789012345678"
  bic: "STRGLT22XXX"
  currency: "EUR"
  
  capabilities:
    - sepa_incoming
    - sepa_outgoing
    - swift_incoming
    - swift_outgoing
    - card_funding
    - crypto_purchase
    
  limits:
    daily_incoming: 100000  # EUR
    daily_outgoing: 50000
    single_transaction_max: 25000
    
  fees:
    sepa_incoming: 0.00  # Free
    sepa_outgoing: 1.00  # €1 per transfer
    swift_incoming: 15.00
    swift_outgoing: 25.00
\`\`\`

### Fiat-to-Crypto On-Ramp

**Buy Crypto with IBAN Balance:**

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal as IBAN Page
    participant Striga
    participant Exchange as Liquidity Provider
    participant Wallet
    
    User->>Portal: Click "Buy Crypto"
    Portal->>User: Select amount + crypto
    
    User->>Portal: Buy €10,000 USDT
    Portal->>Striga: POST /fiat-to-crypto
    
    Striga->>Striga: Check IBAN balance
    Striga->>Exchange: Get USDT price
    Exchange-->>Striga: €1 = 1.08 USDT
    
    Striga->>User: Quote: 10,800 USDT - 0.5% fee
    User->>Striga: Confirm
    
    Striga->>Striga: Debit IBAN: €10,000
    Striga->>Exchange: Execute trade
    Exchange-->>Striga: 10,746 USDT (after 0.5% fee)
    
    Striga->>Wallet: Credit wallet
    Wallet-->>Portal: Balance updated
    Portal->>User: Purchase complete
\`\`\`

---

## Card Issuance

### Card Types

| Card Type | Use Case | Issuance Time | Limits | Cost |
|-----------|----------|---------------|--------|------|
| **Virtual Card** | Online purchases, subscriptions | Instant | €5K/day | Free |
| **Physical Card** | In-person purchases, ATM | 5-7 business days | €10K/day | €10 issuance |
| **Corporate Card** | Employee expenses, travel | 5-7 business days | Custom | €25 issuance |

### Card Issuance Flow

\`\`\`mermaid
graph TB
    START[Request Card] --> KYC{KYC Status}
    
    KYC -->|Verified| SELECT[Select Card Type]
    KYC -->|Not Verified| VERIFY[Complete KYC First]
    
    SELECT --> VIRTUAL[Virtual Card]
    SELECT --> PHYSICAL[Physical Card]
    
    VIRTUAL --> FUND[Link Funding Source]
    PHYSICAL --> SHIPPING[Enter Shipping Address]
    
    FUND --> WALLET[Select Wallet or IBAN]
    SHIPPING --> WALLET
    
    WALLET --> LIMITS[Set Daily Limits]
    LIMITS --> REVIEW[Review & Confirm]
    
    REVIEW --> CREATE[Card Created]
    CREATE --> VIRTUAL_READY[Card Active Immediately]
    CREATE --> PHYSICAL_SHIP[Card Shipped]
    
    PHYSICAL_SHIP --> ACTIVATE[Activate on Delivery]
    ACTIVATE --> READY[Card Ready to Use]
    
    style CREATE fill:#10b981,color:#fff
    style VIRTUAL_READY fill:#10b981,color:#fff
\`\`\`

### Card Management

**Card Configuration:**

\`\`\`yaml
card_settings:
  card_id: "card_abc123"
  card_type: "virtual"
  card_network: "Visa"
  status: "active"
  
  cardholder:
    name: "John Doe"
    kyc_status: "verified"
    
  funding_source:
    type: "iban"
    iban: "LT123456789012345678"
    auto_topup: true
    auto_topup_threshold: 100.00
    auto_topup_amount: 500.00
    
  limits:
    daily_spend: 5000.00
    single_transaction: 2000.00
    atm_daily: 1000.00
    online_only: false
    
  restrictions:
    blocked_categories: ["gambling", "crypto_exchanges"]
    allowed_countries: ["US", "GB", "EU"]
\`\`\`

---

## KYC/KYB Workflows

### KYC Verification Levels

\`\`\`mermaid
stateDiagram-v2
    [*] --> Email_Only
    Email_Only --> Basic_KYC: Submit ID document
    Basic_KYC --> Enhanced_KYC: Submit proof of address
    Enhanced_KYC --> KYB: Submit business docs
    KYB --> LEI_Verified: Submit LEI
    LEI_Verified --> vLEI_Verified: Issue vLEI credential
    
    note right of Email_Only
        Limits:
        - €500/day
        - View-only
    end note
    
    note right of Basic_KYC
        Limits:
        - €10,000/day
        - Basic wallets
    end note
    
    note right of Enhanced_KYC
        Limits:
        - €50,000/day
        - IBANs, cards
    end note
    
    note right of KYB
        Limits:
        - €500,000/day
        - Corporate features
    end note
    
    note right of LEI_Verified
        Limits:
        - Unlimited
        - Institutional access
    end note
\`\`\`

### KYC Document Requirements

**Individual KYC (Basic):**
- Government-issued photo ID (passport, driver's license, national ID)
- Selfie with ID (liveness check)
- Expected processing: 15 minutes - 24 hours

**Individual KYC (Enhanced):**
- Everything from Basic, plus:
- Proof of address (utility bill, bank statement <3 months)
- Source of funds declaration
- Expected processing: 24-48 hours

**Business KYB:**
- Certificate of incorporation
- Business registration documents
- Beneficial ownership declaration (UBO >25%)
- Director/officer IDs
- LEI (optional but recommended)
- Expected processing: 3-5 business days

### LEI Verification

**LEI Instant Verification:**

\`\`\`javascript
// User enters LEI: 123456ABCDEFGHIJK789
// System queries GLEIF API

{
  "lei": "123456ABCDEFGHIJK789",
  "legal_name": "ABC Crypto Exchange Ltd",
  "status": "ISSUED",
  "registration_status": "REGISTERED",
  "next_renewal_date": "2027-03-15",
  "jurisdiction": "GB",
  "verification_status": "verified",
  "instant_approval": true  // No manual review needed
}
\`\`\`

**Benefits of LEI:**
- ✅ Instant account approval (no 3-5 day wait)
- ✅ Unlimited transaction limits
- ✅ Reduced compliance overhead
- ✅ Lower transaction fees (institutional pricing)
- ✅ Priority support

---

## Transaction Monitoring

### Transaction Dashboard

\`\`\`mermaid
graph TB
    subgraph "Transaction Filters"
        F1[Status: All, Pending, Complete, Failed]
        F2[Type: Deposit, Withdrawal, Transfer, Card]
        F3[Asset: BTC, ETH, USDT, EUR, GBP]
        F4[Amount Range]
        F5[Time Period]
    end
    
    subgraph "Transaction Table"
        COL1[Timestamp]
        COL2[Type]
        COL3[Asset + Amount]
        COL4[From/To]
        COL5[Status]
        COL6[Fee]
        COL7[Actions]
    end
    
    subgraph "Transaction Details"
        DETAIL[Full Transaction View<br/>Blockchain explorer link<br/>Confirmations<br/>Network fee]
    end
    
    F1 --> COL5
    F2 --> COL2
    F3 --> COL3
    
    COL7 --> DETAIL
    
    style COL5 fill:#10b981,color:#fff
\`\`\`

### Transaction Types

**Crypto Deposit:**
\`\`\`yaml
transaction:
  id: "txn_abc123"
  type: "crypto_deposit"
  asset: "BTC"
  amount: 0.5
  from_address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
  to_address: "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5"  # Customer wallet
  blockchain_txid: "a1b2c3d4e5f6..."
  confirmations: 3
  required_confirmations: 3
  status: "confirmed"
  network_fee: 0.00002 BTC
  credited_at: "2026-01-10T14:23:45Z"
\`\`\`

**Fiat-to-Crypto Purchase:**
\`\`\`yaml
transaction:
  type: "fiat_to_crypto"
  source: "IBAN LT123456789012345678"
  destination: "ETH wallet"
  fiat_amount: 10000
  fiat_currency: "EUR"
  crypto_amount: 5.234
  crypto_asset: "ETH"
  exchange_rate: 1910.50  # EUR per ETH
  fee: 50.00  # 0.5%
  status: "completed"
\`\`\`

---

## Compliance Dashboard

### Compliance Monitoring

\`\`\`mermaid
graph TB
    subgraph "Compliance Checks"
        C1[Sanctions Screening<br/>OFAC, EU, UN lists]
        C2[Transaction Monitoring<br/>Suspicious patterns]
        C3[Travel Rule<br/>FATF compliance]
        C4[Large Transaction Reporting<br/>€10K+ reporting]
        C5[Customer Due Diligence<br/>Enhanced DD triggers]
    end
    
    subgraph "Automated Actions"
        A1[Auto-Flag for Review]
        A2[Auto-Block High Risk]
        A3[Generate SAR<br/>Suspicious Activity Report]
        A4[Notify Compliance Team]
    end
    
    C1 --> A2
    C2 --> A1
    C3 --> A4
    C4 --> A3
    C5 --> A1
    
    style C1 fill:#ef4444,color:#fff
    style A2 fill:#ef4444,color:#fff
\`\`\`

### Compliance Alerts

| Alert Type | Trigger | Action Required | Severity |
|------------|---------|-----------------|----------|
| **Sanctions Match** | Customer on OFAC/EU list | Immediate block + escalate | 🔴 Critical |
| **Large Transaction** | Single txn >€10,000 | Review + report to authorities | 🟡 Medium |
| **Suspicious Pattern** | Rapid deposits + withdrawals | Enhanced due diligence | 🟡 Medium |
| **Travel Rule** | Crypto transfer >$1,000 | Collect beneficiary info | 🟡 Medium |
| **High-Risk Country** | Transaction from sanctioned country | Review + potential block | 🟠 High |
| **Velocity Alert** | >€50K in 24 hours | Enhanced monitoring | 🟡 Medium |

### Travel Rule Compliance

**FATF Travel Rule Requirements:**

\`\`\`yaml
travel_rule_threshold: 1000  # USD equivalent

required_information:
  originator:
    - full_name
    - wallet_address
    - geographic_location
    
  beneficiary:
    - full_name
    - wallet_address
    - geographic_location
    
automatic_collection: true
manual_override: "compliance_officer_only"
\`\`\`

---

## User Management

### Role-Based Access Control

| Feature | Owner | Admin | Developer | Operations | Analyst | Viewer |
|---------|-------|-------|-----------|------------|---------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Wallet | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Wallets | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Initiate Withdrawal | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Approve KYC | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Issue Cards | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Compliance | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Manage API Keys | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export Data | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## API Integration

### Striga API via FTS Gateway

**Base URL:** \`https://api.fts.money/crypto-gateway\`

**Authentication:** Bearer token (your FTS API key)

**Key Endpoints:**

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| \`/wallets/create\` | POST | Create blockchain wallet | 100/min |
| \`/wallets/{id}/balance\` | GET | Get wallet balance | 300/min |
| \`/wallets/{id}/withdraw\` | POST | Withdraw crypto | 10/min |
| \`/ibans/create\` | POST | Create virtual IBAN | 50/min |
| \`/cards/issue\` | POST | Issue new card | 20/min |
| \`/kyc/submit\` | POST | Submit KYC documents | 100/min |
| \`/kyc/{id}/status\` | GET | Check KYC status | 300/min |
| \`/transactions\` | GET | Query transaction history | 200/min |

### API Request Examples

**Create Wallet:**

\`\`\`javascript
const response = await fetch('https://api.fts.money/crypto-gateway/wallets/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_crypto_abc123...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_xyz789',
    blockchain: 'ETHEREUM',
    asset: 'USDT'
  })
});

const wallet = await response.json();
// Returns: { wallet_id, address, blockchain, asset }
\`\`\`

**Submit KYC:**

\`\`\`javascript
const formData = new FormData();
formData.append('user_id', 'user_xyz789');
formData.append('kyc_level', 'enhanced');
formData.append('id_document', idDocumentFile);
formData.append('proof_of_address', proofFile);
formData.append('selfie', selfieFile);

const response = await fetch('https://api.fts.money/crypto-gateway/kyc/submit', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_crypto_abc123...'
  },
  body: formData
});

const result = await response.json();
// Returns: { kyc_id, status: "pending", estimated_completion: "2026-01-11T10:00:00Z" }
\`\`\`

### Webhooks

\`\`\`yaml
webhook_events:
  wallet.deposit:
    description: "Crypto deposited to wallet"
    payload:
      - wallet_id
      - asset
      - amount
      - blockchain_txid
      - confirmations
      
  wallet.withdrawal:
    description: "Crypto withdrawn"
    payload:
      - wallet_id
      - asset
      - amount
      - to_address
      - status
      
  kyc.completed:
    description: "KYC verification completed"
    payload:
      - user_id
      - kyc_level
      - status: "approved" | "rejected"
      - rejection_reason
      
  card.issued:
    description: "Card successfully issued"
    payload:
      - card_id
      - card_type
      - last_4_digits
      
  compliance.alert:
    description: "Compliance flag raised"
    payload:
      - alert_type
      - severity
      - user_id
      - transaction_id
\`\`\`

---

## Billing & Usage

### Usage Tracking

\`\`\`yaml
monthly_usage:
  billing_period: "2026-01-01 to 2026-01-31"
  tier: "Growth"
  
  wallets:
    included: 10000
    actual: 12453
    overage: 2453
    overage_fee: 3679.50  # 2,453 × $1.50
    
  transactions:
    total_volume: 234567
    transaction_fees: 703.70  # 0.3% avg
    
  iban_accounts:
    active: 456
    sepa_transfers: 234
    transfer_fees: 234.00
    
  cards:
    issued: 123
    issuance_fees: 1230.00
    transaction_volume: 45678
    interchange_revenue: -137.03  # Credit
    
  kyc_checks:
    basic: 234
    enhanced: 56
    kyc_fees: 1450.00
    
  total_charges:
    base_subscription: 4999.00
    usage_fees: 6297.17
    net_total: 11296.17
\`\`\`

---

## Troubleshooting

### Common Issues

**Issue: Wallet Creation Fails**

**Solutions:**
1. Check KYC status - must be at least Basic KYC
2. Verify wallet limit not exceeded for tier
3. Ensure blockchain network is supported
4. Contact support if persistent

**Issue: IBAN Transfer Delayed**

**Solutions:**
1. SEPA transfers: 1-2 business days (standard)
2. SWIFT transfers: 2-5 business days
3. Check beneficiary bank accepts crypto-related transfers
4. Verify compliance holds cleared

**Issue: Card Declined**

**Solutions:**
1. Check card funding source has balance
2. Verify daily limit not exceeded
3. Confirm merchant category not blocked
4. Check card status is "active"

**Issue: KYC Rejected**

**Common Reasons:**
- Blurry document photos
- Expired ID document
- Address mismatch
- Sanctions list match (false positive)

**Solutions:**
1. Re-upload clear, high-resolution documents
2. Ensure all documents are current (<6 months)
3. Contact compliance team for manual review

---

## Security Best Practices

### Wallet Security

✅ **Do:**
- Enable withdrawal whitelisting
- Set daily withdrawal limits
- Use separate wallets for hot/cold storage
- Enable 2FA for all withdrawals
- Monitor wallet activity daily

❌ **Don't:**
- Share wallet private keys
- Disable withdrawal confirmations
- Use same wallet for customer deposits and operational funds
- Ignore compliance alerts

### API Security

✅ **Do:**
- Rotate API keys every 90 days
- Use separate keys for sandbox and production
- Implement IP whitelisting
- Monitor API usage for anomalies
- Store keys in secure vault (not code)

❌ **Don't:**
- Commit API keys to Git repositories
- Share API keys across team members
- Use production keys in development
- Disable rate limiting

---

## Regulatory Compliance

### Geographic Regulations

| Region | Regulatory Body | Key Requirements | FTS Compliance |
|--------|----------------|------------------|----------------|
| **European Union** | MiCA (Markets in Crypto-Assets) | VASP licensing, AML, consumer protection | ✅ Striga EMI license |
| **United Kingdom** | FCA | FCA registration, AML compliance | ✅ FCA registered |
| **United States** | FinCEN | MSB registration, state licenses | ⚠️ Customer responsibility |
| **Singapore** | MAS | PSA license, AML/CFT | ✅ Supported |
| **Hong Kong** | SFC | VASP license | ✅ Supported |

**Important:** Customers are responsible for obtaining necessary licenses in their operating jurisdictions. FTS provides infrastructure, not regulatory licensing.

---

## Support & Resources

### Getting Help

| Issue | Channel | Response Time | Availability |
|-------|---------|---------------|--------------|
| **Wallet/Transaction Issues** | Email: crypto-support@fts.money | 4 hours | 24/7 |
| **KYC/Compliance** | Email: compliance@fts.money | 12 hours | M-F 9am-6pm |
| **Technical/API** | Slack channel (Enterprise) | 1 hour | 24/7 |
| **Emergency (Outage)** | Phone: +44-20-XXXX-XXXX | 15 minutes | 24/7 |

### Additional Resources

- **API Documentation:** https://docs.fts.money/crypto-gateway
- **Striga Documentation:** https://docs.striga.com
- **Blockchain Explorers:** Linked in transaction details
- **Compliance Guides:** https://docs.fts.money/compliance

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026
- **Owner:** Product Documentation Team
- **Contact:** docs@fts.money

© 2026 FTS.Money. All rights reserved.
`;

export default CryptoGatewayPortalGuide;