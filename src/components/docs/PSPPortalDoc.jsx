export const PSPPortalDoc = `
# PSP Portal Documentation
## Payment Service Provider Operations & Management

**Version:** 1.0  
**Last Updated:** December 2025  
**Audience:** PSP Administrators, Operations Staff, Compliance Officers

---

## Executive Summary

### Purpose
The **PSP Portal** is the operational hub for Payment Service Providers to manage their entire payment processing business. It provides comprehensive tools for merchant onboarding, transaction monitoring, settlement management, fraud prevention, and compliance.

### Key Capabilities
- **Merchant Management:** Onboard, configure, monitor merchant accounts
- **Transaction Processing:** Real-time transaction monitoring and management
- **Settlement & Payouts:** Automated settlement cycles and payout management
- **Risk & Fraud:** AI-powered fraud detection and risk alerts
- **Compliance:** KYB, AML, PCI DSS, LEI verification
- **Reporting:** Comprehensive analytics and custom reports
- **Virtual Terminal:** Staff-operated payment acceptance
- **API Management:** Developer portal for merchant integrations

### User Roles

\`\`\`mermaid
graph TB
    A[PSP Staff Roles] --> B[Owner/Super Admin]
    A --> C[Admin]
    A --> D[Finance Manager]
    A --> E[Operations]
    A --> F[Support]
    A --> G[Viewer]
    
    B --> B1[Full Access]
    B --> B2[Manage Staff]
    B --> B3[Configure PSP]
    
    C --> C1[Merchant Management]
    C --> C2[Transaction Control]
    C --> C3[Settings]
    
    D --> D1[Financial Reports]
    D --> D2[Settlement Config]
    D --> D3[Pricing Management]
    
    E --> E1[Monitor Transactions]
    E --> E2[Virtual Terminal]
    E --> E3[Support Tickets]
    
    F --> F1[View Data]
    F --> F2[Customer Service]
    
    G --> G1[Read-Only Dashboards]
\`\`\`

---

## Architecture

### PSP Instance Isolation

**Schema-Level Multi-Tenancy:**
\`\`\`mermaid
graph TB
    A[FTS Platform Database] --> B[Master Schema]
    A --> C[PSP_ACMEPAY Schema]
    A --> D[PSP_GLOBALPAY Schema]
    A --> E[PSP_FASTPAY Schema]
    
    B --> B1[ProvisionedPSP]
    B --> B2[ServiceCatalog]
    B --> B3[MasterPricing]
    
    C --> C1[merchants]
    C --> C2[transactions]
    C --> C3[settlements]
    C --> C4[psp_staff_users]
    
    D --> D1[merchants]
    D --> D2[transactions]
    D --> D3[settlements]
    
    E --> E1[merchants]
    E --> E2[transactions]
    E --> E3[settlements]
    
    style C fill:#e3f2fd
    style D fill:#f3e5f5
    style E fill:#e8f5e9
\`\`\`

**Isolation Benefits:**
- PCI DSS Level 1 compliant
- GDPR data residency
- Performance optimization (per PSP)
- Independent scaling
- Disaster recovery isolation

### Authentication Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal
    participant Auth as pspAuth Function
    participant Schema as PSP Schema
    participant Session
    
    User->>Portal: Enter PSP Code + Email + Password
    Portal->>Auth: Verify PSP Exists
    Auth->>Schema: Check psp_staff_users
    Schema-->>Auth: User Record
    Auth->>Auth: Verify Password (SHA-256)
    Auth-->>Portal: Session Token
    Portal->>Session: Store in localStorage
    Session-->>User: Redirect to Dashboard
    
    Note over Session: Session contains:<br/>- email<br/>- psp_code<br/>- role<br/>- schema_name
\`\`\`

### Data Model

\`\`\`mermaid
erDiagram
    PSP-STAFF-USERS ||--o{ MERCHANTS : manages
    MERCHANTS ||--o{ TRANSACTIONS : processes
    MERCHANTS ||--o{ MERCHANT-USERS : has
    MERCHANTS ||--o{ SAVED-CARDS : stores
    
    TRANSACTIONS ||--o{ REFUNDS : generates
    TRANSACTIONS ||--o{ CHARGEBACKS : may_have
    TRANSACTIONS ||--o{ SETTLEMENTS : settles_into
    
    MERCHANTS ||--o{ MERCHANT-MIDS : assigned
    MERCHANT-MIDS }o--|| BANK-MIDS : uses
    
    TRANSACTIONS {
        string transaction_id PK
        string psp_code
        string merchant_id FK
        decimal amount
        string currency
        string status
        timestamp created_date
    }
    
    MERCHANTS {
        string merchant_id PK
        string psp_code
        string merchant_code
        string status
        string lei
        json compliance
    }
\`\`\`

---

## Core Features

### 1. Dashboard

**Real-Time Metrics:**
\`\`\`mermaid
graph TB
    A[PSP Dashboard] --> B[Today's Volume]
    A --> C[Total Transactions]
    A --> D[Success Rate]
    A --> E[Active Merchants]
    A --> F[Crypto Volume]
    
    B --> G[Live Updates]
    C --> G
    D --> G
    E --> G
    F --> G
    
    G --> H[5-Second Refresh]
\`\`\`

**Dashboard Widgets:**
- **Volume Chart:** 7-day trend with hour-by-hour breakdown
- **Success Rate:** Line chart with approval/decline rates
- **Top Merchants:** Leaderboard by volume
- **Payment Methods:** Pie chart distribution
- **Recent Transactions:** Last 10 transactions with status
- **Risk Alerts:** Flagged transactions requiring review
- **TPS Counter:** Real-time transactions per second
- **Exchange Rates:** Live currency rates

**Customization:**
- Drag-and-drop widget positioning
- Show/hide widgets
- Custom date ranges
- Export dashboard as PDF

### 2. Merchant Management

**Merchant Onboarding Flow:**

\`\`\`mermaid
flowchart TD
    A[New Merchant Request] --> B{Onboarding Method}
    
    B -->|Self-Service| C[Generate Onboarding Link]
    B -->|Staff-Assisted| D[Manual Entry]
    
    C --> E[Send Email Invite]
    E --> F[Merchant Completes Form]
    
    D --> G[Business Details]
    G --> H[Contact Information]
    H --> I[Bank Details]
    
    F --> J[KYB Verification]
    I --> J
    
    J --> K{KYB Result}
    K -->|Pass| L[AML Screening]
    K -->|Fail| M[Request Additional Docs]
    
    M --> J
    
    L --> N{AML Result}
    N -->|Clear| O[Assign MID]
    N -->|Flagged| P[Manual Review]
    
    P -->|Approve| O
    P -->|Reject| Q[Decline Application]
    
    O --> R[Generate Credentials]
    R --> S[Send Welcome Email]
    S --> T[Merchant Active]
\`\`\`

**KYB Integration:**
- **Provider:** TheKYB.com
- **Verification:** Business registration, directors, UBO
- **Turnaround:** 24-48 hours (automated), 3-5 days (manual review)
- **Pass Rate:** 85%+

**Merchant Details:**
\`\`\`javascript
{
  "merchant_id": "merch_123",
  "psp_code": "ACMEPAY",
  "merchant_code": "ACME_COFFEE",
  "business_name": "Acme Coffee Co.",
  "trading_name": "Acme Café",
  "status": "active",
  "category": "hospitality",
  "mcc_code": "5814",
  "country": "US",
  "currency": "USD",
  "contact_email": "payments@acmecoffee.com",
  "fee_rate": 2.9,
  "settlement_period": "T+1",
  "risk_level": "medium",
  "lei": "549300...",
  "kyb_status": "approved",
  "aml_status": "clear",
  "total_volume": 125400.50,
  "total_transactions": 1247
}
\`\`\`

**Merchant Actions:**
- View merchant details
- Edit business information
- Update pricing (fees)
- Configure settlement schedule
- Manage merchant users (sub-accounts)
- View transaction history
- Generate reports
- Suspend/terminate merchant
- Export merchant data

### 3. Transaction Processing

**Transaction Lifecycle:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing: Route to Provider
    Processing --> Approved: Authorization Success
    Processing --> Declined: Card Declined
    Processing --> Failed: Provider Error
    
    Approved --> Settled: Settlement Batch
    Settled --> [*]
    
    Approved --> Refunded: Refund Issued
    Refunded --> [*]
    
    Approved --> Chargeback: Dispute Filed
    Chargeback --> [*]
    
    Declined --> [*]
    Failed --> [*]
\`\`\`

**Transaction Details View:**
\`\`\`
Transaction ID: txn_acme_20251225_001234
Merchant: Acme Coffee Co. (ACME_COFFEE)
Type: Sale
Amount: $45.99 USD
Payment Method: Visa •••• 4242
Status: Approved ✅
Auth Code: 123456

Timeline:
├─ 10:30:15 - Created
├─ 10:30:16 - Routed to Stripe
├─ 10:30:17 - Approved (auth: 123456)
├─ 10:30:18 - Fraud check: Pass
└─ 10:30:19 - Complete

Customer: John Doe
Email: john@example.com
IP: 203.0.113.42
Country: United States

Fees:
- Transaction Fee (2.9%): $1.33
- Fixed Fee: $0.30
- Total Fees: $1.63
- Net Amount: $44.36

Settlement: Batch #2025-12-26 (Tomorrow)
\`\`\`

**Transaction Search & Filtering:**
- Full-text search (transaction ID, customer name, email)
- Filter by: status, date range, amount range, payment method, merchant
- Sort by: date, amount, merchant
- Export: CSV, Excel, PDF

**Bulk Operations:**
- Refund multiple transactions
- Mark as reviewed (fraud)
- Export selected transactions
- Generate batch report

### 4. Virtual Terminal

**Purpose:** Staff-operated payment acceptance (phone orders, mail orders)

**Terminal Interface:**
\`\`\`mermaid
flowchart LR
    A[Virtual Terminal] --> B[Payment Form]
    A --> C[Customer Lookup]
    A --> D[Saved Cards]
    
    B --> E[Card Details]
    B --> F[Amount Entry]
    B --> G[Customer Info]
    
    E --> H{Validate}
    F --> H
    G --> H
    
    H -->|Valid| I[Process Payment]
    H -->|Invalid| J[Show Errors]
    
    I --> K{Result}
    K -->|Approved| L[Print Receipt]
    K -->|Declined| M[Retry or Cancel]
    
    C --> N[Search by Email/Phone]
    N --> O[Load Customer Data]
    O --> D
    
    D --> P[Select Saved Card]
    P --> I
\`\`\`

**Features:**
- Quick payment processing
- Customer database
- Saved card vault (PCI compliant tokenization)
- Receipt generation (PDF download, email)
- Recurring payment setup
- Invoice creation

**Use Cases:**
- Phone order payments
- Manual subscription charges
- Payment plan collection
- Deposit/pre-authorization
- Refund processing

### 5. Merchant Pricing Configuration

**Pricing Models:**

**1. Interchange Plus:**
\`\`\`
Customer Pays = Interchange + Markup + Fixed Fee

Example:
Card: Visa Rewards (2.1% interchange)
PSP Markup: 0.8%
Fixed Fee: $0.30
---
Total: 2.9% + $0.30
\`\`\`

**2. Tiered Pricing:**
\`\`\`
Tier 1: < $10K/mo → 3.2% + $0.30
Tier 2: $10K-$100K/mo → 2.7% + $0.25
Tier 3: > $100K/mo → 2.4% + $0.20
\`\`\`

**3. Flat Rate:**
\`\`\`
All Transactions: 2.9% + $0.30
(Simple, predictable)
\`\`\`

**Configuration UI:**
| Merchant | Pricing Model | Card % | Fixed Fee | Special Rates |
|----------|---------------|--------|-----------|---------------|
| Acme Coffee | Flat Rate | 2.9% | $0.30 | - |
| Global Retail | Tiered | 2.4-3.2% | $0.20-0.30 | Amex: 3.5% |
| Tech Startup | IC+ | Interchange + 0.5% | $0.25 | Volume discount |

### 6. Settlement Management

**Settlement Cycles:**
\`\`\`mermaid
gantt
    title Settlement Processing Timeline
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Daily Batch
    Collect Transactions    :a1, 00:00, 23:59
    Calculate Fees          :a2, 23:59, 01:00
    Generate Settlement     :a3, 01:00, 02:00
    
    section T+1 Payout
    Bank Processing         :b1, 02:00, 08:00
    Merchant Receives       :milestone, 08:00, 0m
\`\`\`

**Settlement Dashboard:**
- Pending settlements (amount, merchant count)
- Today's settlements (in progress)
- Historical settlements (searchable)
- Failed payouts (retry queue)
- Settlement reports (downloadable)

**Payout Methods:**
- ACH (2-3 business days)
- Wire transfer (same-day, higher fee)
- Instant payout (real-time, premium fee)
- Crypto payout (Bitcoin, USDC)

### 7. Fraud & Risk Management

**Multi-Layer Fraud Detection:**

\`\`\`mermaid
flowchart TD
    A[Transaction Submitted] --> B[Velocity Check]
    B --> C{Multiple Attempts?}
    C -->|Yes| D[Flag: Velocity]
    C -->|No| E[BIN Lookup]
    
    E --> F{High-Risk Country?}
    F -->|Yes| G[Flag: Geography]
    F -->|No| H[Amount Pattern]
    
    H --> I{Unusual Amount?}
    I -->|Yes| J[Flag: Amount]
    I -->|No| K[Device Fingerprint]
    
    K --> L{Known Device?}
    L -->|No| M[Flag: New Device]
    L -->|Yes| N[IP Analysis]
    
    N --> O{Proxy/VPN?}
    O -->|Yes| P[Flag: IP Risk]
    O -->|No| Q[AI Risk Score]
    
    Q --> R{Score > Threshold?}
    R -->|Yes| S[Manual Review Queue]
    R -->|No| T[Approve]
    
    D --> S
    G --> S
    J --> S
    M --> S
    P --> S
\`\`\`

**Risk Scoring:**
\`\`\`javascript
{
  "transaction_id": "txn_123",
  "risk_score": 67,  // 0-100
  "risk_level": "medium",
  "flags": [
    {
      "type": "velocity",
      "severity": "high",
      "details": "5 transactions in 2 minutes from same card"
    },
    {
      "type": "new_device",
      "severity": "medium",
      "details": "First transaction from this device fingerprint"
    }
  ],
  "recommendation": "manual_review",
  "ai_confidence": 0.82
}
\`\`\`

**Manual Review Queue:**
- Flagged transactions sorted by risk score
- One-click approve/decline
- Add to whitelist/blacklist
- Notes and documentation
- Automatic timeout (approve after 24h if not reviewed)

**Fraud Rules Engine:**
- Velocity limits (transactions per hour/day)
- Amount limits (per transaction, daily total)
- Geographic restrictions (block countries)
- BIN restrictions (block prepaid cards, gift cards)
- Custom rules (based on merchant category)

### 8. Compliance Management

**KYB Verification:**
\`\`\`mermaid
sequenceDiagram
    participant Merchant
    participant PSP
    participant KYB as TheKYB API
    participant DB
    
    Merchant->>PSP: Submit Business Docs
    PSP->>KYB: Request Verification
    KYB->>KYB: Verify Registration
    KYB->>KYB: Screen Directors
    KYB->>KYB: Check UBO
    KYB-->>PSP: Verification Result
    PSP->>DB: Update kyb_status
    PSP-->>Merchant: Approval/Rejection
\`\`\`

**AML Screening:**
- Real-time screening on merchant onboarding
- Ongoing monitoring (monthly re-screen)
- Sanctions list checks (OFAC, UN, EU)
- PEP (Politically Exposed Person) detection
- Adverse media screening

**LEI Verification:**
- GLEIF API integration
- Automatic LEI validation
- vLEI credential issuance
- Grace period tracking (6 months)
- Automated renewal reminders

**Compliance Dashboard:**
| Merchant | KYB Status | AML Status | LEI | Last Screened | Risk |
|----------|------------|------------|-----|---------------|------|
| Acme Coffee | ✅ Approved | ✅ Clear | ✅ Valid | 2 days ago | Low |
| Global Tech | ⏳ Pending | - | ❌ None | - | Medium |
| Fast Foods | ✅ Approved | ⚠️ Monitoring | ✅ Valid | 1 day ago | Medium |

### 9. Reporting & Analytics

**Pre-Built Reports:**

**Daily:**
- Transaction summary (count, volume, fees)
- Settlement report
- Declined transaction report
- Chargeback report

**Weekly:**
- Merchant performance ranking
- Payment method analysis
- Geographic breakdown
- Risk & fraud summary

**Monthly:**
- Revenue & profit analysis
- Merchant growth report
- Compliance status report
- Executive summary

**Custom Report Builder:**
\`\`\`mermaid
graph LR
    A[Report Builder] --> B[Select Data Source]
    B --> C[Transactions]
    B --> D[Merchants]
    B --> E[Settlements]
    
    C --> F[Add Filters]
    D --> F
    E --> F
    
    F --> G[Date Range]
    F --> H[Merchant]
    F --> I[Amount]
    F --> J[Status]
    
    G --> K[Select Columns]
    H --> K
    I --> K
    J --> K
    
    K --> L[Preview Data]
    L --> M[Export]
    
    M --> N[CSV]
    M --> O[Excel]
    M --> P[PDF]
\`\`\`

**Scheduled Reports:**
- Email delivery (daily, weekly, monthly)
- Automatic generation
- Distribution lists
- Custom templates

### 10. Payment Methods Configuration

**Enable/Disable Payment Methods:**
- ✅ Visa
- ✅ Mastercard
- ✅ American Express
- ✅ Discover
- ⬜ JCB (disabled)
- ⬜ Diners Club (disabled)
- ✅ Debit Cards
- ✅ ACH/Bank Transfer
- ✅ Apple Pay
- ✅ Google Pay
- ✅ Bitcoin
- ✅ USDC (stablecoin)

**Method-Specific Configuration:**
\`\`\`javascript
{
  "visa": {
    "enabled": true,
    "min_amount": 1.00,
    "max_amount": 10000.00,
    "fee_percentage": 2.9,
    "fee_fixed": 0.30,
    "3ds_required": false,
    "cvv_required": true
  },
  "bitcoin": {
    "enabled": true,
    "min_amount": 10.00,
    "max_amount": 50000.00,
    "fee_percentage": 1.0,
    "confirmations_required": 3,
    "supported_networks": ["mainnet"]
  }
}
\`\`\`

### 11. API & Webhook Management

**API Key Management:**
\`\`\`mermaid
graph TB
    A[API Keys] --> B[Create Key]
    A --> C[List Keys]
    A --> D[Revoke Key]
    
    B --> E[Set Environment]
    E --> F[Test]
    E --> G[Production]
    
    B --> H[Set Permissions]
    H --> I[process_payments]
    H --> J[refund_payments]
    H --> K[read_merchants]
    
    B --> L[Generate Key]
    L --> M[Display Once]
    M --> N[Store Securely]
\`\`\`

**API Endpoints (Merchant Integration):**
\`\`\`javascript
// Create Payment
POST /api/v1/payments
Authorization: Bearer sk_live_...
{
  "amount": 4599,
  "currency": "USD",
  "payment_method": "card",
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2026,
    "cvv": "123"
  },
  "customer": {
    "email": "customer@example.com",
    "name": "John Doe"
  },
  "metadata": {
    "order_id": "ORD-123"
  }
}

Response:
{
  "id": "txn_123",
  "status": "approved",
  "amount": 4599,
  "auth_code": "123456",
  "fee": 163,
  "net_amount": 4436
}
\`\`\`

**Webhook Configuration:**
\`\`\`javascript
{
  "webhook_id": "wh_123",
  "url": "https://merchant.com/webhooks/payments",
  "secret": "whsec_...",
  "events": [
    "payment.approved",
    "payment.declined",
    "payment.refunded",
    "settlement.completed",
    "chargeback.created"
  ],
  "status": "active",
  "last_delivery": "2025-12-25T10:29:00Z",
  "delivery_success_rate": 99.2
}
\`\`\`

**Webhook Events:**
- \`payment.created\`
- \`payment.approved\`
- \`payment.declined\`
- \`payment.refunded\`
- \`settlement.pending\`
- \`settlement.completed\`
- \`chargeback.created\`
- \`merchant.updated\`

### 12. Merchant Portal Builder

**Purpose:** White-label portal for merchants

**Customization Options:**
- Logo upload
- Color scheme (primary, secondary)
- Favicon
- Custom domain (merchant.acmepay.com)
- Enable/disable modules:
  - ✅ Transactions
  - ✅ Analytics
  - ✅ Virtual Terminal
  - ✅ Invoicing
  - ⬜ Subscriptions (premium)
  - ⬜ API Access (premium)

**Module Configuration:**
\`\`\`mermaid
graph TB
    A[Merchant Portal] --> B[Core Modules]
    A --> C[Premium Modules]
    A --> D[Custom Modules]
    
    B --> B1[Transaction List]
    B --> B2[Basic Analytics]
    B --> B3[Profile Settings]
    
    C --> C1[Advanced Analytics]
    C --> C2[API Access]
    C --> C3[Subscription Management]
    C --> C4[Multi-User Access]
    
    D --> D1[Custom Reports]
    D --> D2[Third-Party Integrations]
\`\`\`

---

## Advanced Features

### 13. Smart Routing

**Purpose:** Optimize payment routing for cost and success rate

\`\`\`mermaid
flowchart TD
    A[Payment Request] --> B[Routing Engine]
    B --> C{Analyze}
    
    C --> D[Card Type]
    C --> E[Amount]
    C --> F[Geography]
    C --> G[Historical Data]
    
    D --> H[Route Scoring]
    E --> H
    F --> H
    G --> H
    
    H --> I{Score Routes}
    
    I --> J[Route 1: Stripe<br/>Score: 95<br/>Cost: $1.33<br/>Success: 98%]
    I --> K[Route 2: Adyen<br/>Score: 88<br/>Cost: $1.45<br/>Success: 97%]
    I --> L[Route 3: PayPal<br/>Score: 72<br/>Cost: $1.60<br/>Success: 94%]
    
    J --> M[Select Route 1]
    M --> N{Process}
    
    N -->|Success| O[Complete]
    N -->|Fail| K
\`\`\`

**Routing Strategies:**
- **Cost Optimize:** Choose lowest-fee provider
- **Success Optimize:** Choose highest approval rate
- **Balanced:** Weighted score (50% cost, 50% success)
- **Round Robin:** Distribute evenly
- **Custom Rules:** Business logic based

### 14. Subscription & Recurring Billing

**Purpose:** Manage recurring payments for SaaS, subscriptions

**Subscription Lifecycle:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> Active
    Active --> PastDue: Payment Failed
    PastDue --> Active: Retry Success
    PastDue --> Cancelled: 3 Failed Attempts
    Active --> Cancelled: Customer Cancels
    Cancelled --> [*]
    
    note right of PastDue
        Dunning: Retry after
        1 day, 3 days, 7 days
    end note
\`\`\`

**Subscription Configuration:**
\`\`\`javascript
{
  "subscription_id": "sub_123",
  "merchant_id": "merch_456",
  "customer_email": "customer@example.com",
  "plan": "monthly_premium",
  "amount": 29.99,
  "currency": "USD",
  "billing_cycle": "monthly",
  "trial_end": "2026-01-25",
  "current_period_start": "2025-12-25",
  "current_period_end": "2026-01-25",
  "status": "active",
  "payment_method": "card_...4242",
  "auto_renew": true
}
\`\`\`

**Dunning Management:**
- Automatic retry schedule (configurable)
- Customer notification emails
- Card updater integration (auto-update expired cards)
- Pause subscription (retain customer)

### 15. Chargeback & Dispute Handling

**Chargeback Workflow:**
\`\`\`mermaid
sequenceDiagram
    participant Card as Card Network
    participant PSP
    participant Merchant
    
    Card->>PSP: Chargeback Notification
    PSP->>PSP: Deduct from Settlement
    PSP->>Merchant: Email Alert
    Merchant->>PSP: Upload Evidence
    PSP->>Card: Submit Representment
    Card->>Card: Review (30-45 days)
    Card-->>PSP: Decision
    PSP-->>Merchant: Notify Result
    
    alt Won
        PSP->>Merchant: Credit Amount
    else Lost
        PSP->>Merchant: Confirm Deduction
    end
\`\`\`

**Evidence Collection:**
- Transaction receipt
- Proof of delivery
- Customer communication
- Terms of service
- IP address & device info
- 3D Secure authentication data

**Chargeback Analytics:**
- Chargeback rate (total, by merchant)
- Win rate (representment success)
- Reason code breakdown
- High-risk merchants

### 16. Multi-Currency Support

**Currency Management:**
\`\`\`mermaid
graph TB
    A[Multi-Currency Engine] --> B[Supported: 50+ Currencies]
    
    B --> C[FX Rate Provider]
    C --> D[Update Every 5 Min]
    
    B --> E[Settlement Currency]
    E --> F[Auto-Convert]
    
    B --> G[Display Currency]
    G --> H[Customer Preference]
    
    A --> I[Crypto Support]
    I --> J[BTC, ETH, USDC]
    I --> K[Real-time Rates]
\`\`\`

**Exchange Rate Markup:**
- Base rate from provider (e.g., 1.00 EUR = 1.08 USD)
- PSP markup (e.g., 2%)
- Final rate (1.00 EUR = 1.10 USD)

**Configuration:**
\`\`\`javascript
{
  "base_currency": "USD",
  "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", ...],
  "fx_provider": "exchangerates-api",
  "fx_markup_percentage": 2.0,
  "auto_settlement_conversion": true
}
\`\`\`

---

## User Workflows

### Workflow 1: Onboard New Merchant

\`\`\`mermaid
journey
    title Merchant Onboarding Journey
    section Application
      Generate Invite Link: 5: PSP Staff
      Send to Merchant: 5: System
      Merchant Completes Form: 4: Merchant
    section Verification
      KYB Auto-Verify: 3: System
      AML Screening: 3: System
      Manual Review (if needed): 4: PSP Staff
    section Setup
      Assign MID: 5: System
      Configure Pricing: 4: PSP Staff
      Generate API Keys: 5: System
    section Activation
      Send Credentials: 5: System
      Merchant Tests: 4: Merchant
      Go Live: 5: PSP Staff, Merchant
\`\`\`

### Workflow 2: Process Refund

**Steps:**
1. Navigate to Transactions → Find transaction
2. Click transaction → View details
3. Click "Refund" button
4. Select refund type (full or partial)
5. Enter amount (if partial)
6. Enter reason (dropdown: customer request, duplicate, fraud, etc.)
7. Click "Process Refund"
8. Confirmation dialog
9. Refund processed
10. Customer notification sent
11. Settlement adjustment made

**Refund Constraints:**
- Full refund: Within 180 days of original transaction
- Partial refund: Allowed multiple times up to original amount
- Already refunded: Cannot refund twice

### Workflow 3: Investigate Fraud Alert

**Steps:**
1. Dashboard shows "Risk Alerts" widget → Click
2. List of flagged transactions (sorted by risk score)
3. Click highest risk transaction → View details
4. Review fraud indicators:
   - Velocity flags
   - Geographic mismatches
   - Device fingerprint analysis
   - BIN information
5. Check customer history (previous transactions)
6. Decision:
   - **Approve:** Click "Approve" → Process normally
   - **Decline:** Click "Decline" → Void transaction, refund customer
   - **Whitelist:** Add customer to trusted list
   - **Blacklist:** Block customer/card permanently
7. Add notes for audit trail
8. Notification sent to merchant (if required)

---

## Technical Specifications

### Frontend
- **Framework:** React 18 with TypeScript patterns
- **State Management:** React Query (server state), useState (UI state)
- **Routing:** React Router v6 (createPageUrl for navigation)
- **Forms:** React Hook Form + Zod validation
- **Real-time Updates:** Polling (5-second interval) or WebSocket

### Backend Functions

**pspAuth.js:**
\`\`\`javascript
// Authentication
POST /functions/pspAuth
{
  "action": "login",
  "psp_code": "ACMEPAY",
  "email": "admin@acme.com",
  "password": "***"
}

Response:
{
  "success": true,
  "session": {
    "email": "admin@acme.com",
    "psp_code": "ACMEPAY",
    "schema": "psp_acmepay",
    "role": "admin",
    "expires": 1735209600000
  }
}
\`\`\`

**pspData.js:**
\`\`\`javascript
// Query isolated PSP data
POST /functions/pspData
{
  "action": "listTransactions",
  "psp_code": "ACMEPAY",
  "limit": 50
}

Response:
{
  "success": true,
  "data": [...]  // Transactions from psp_acmepay.transactions table only
}
\`\`\`

### Database Schema (Per PSP)

**Tables Created:**
- \`psp_staff_users\` - Portal users
- \`merchants\` - Merchant accounts
- \`merchant_users\` - Merchant portal users
- \`transactions\` - All payments
- \`refunds\` - Refund records
- \`chargebacks\` - Dispute records
- \`settlements\` - Settlement batches
- \`saved_cards\` - Tokenized cards (PCI vault)
- \`merchant_mids\` - MID assignments
- \`audit_logs\` - Action logging

### Performance Benchmarks
- Dashboard load: <2 seconds
- Transaction list (100 records): <500ms
- Search results: <300ms
- Payment processing: <2 seconds end-to-end
- Refund processing: <3 seconds

---

## Security & Compliance

### PCI DSS Compliance
- **Level:** PCI DSS Level 1 (highest)
- **Scope:** Full card data environment
- **Validation:** Annual on-site audit + quarterly network scans
- **Tokenization:** Mandatory for card storage
- **Encryption:** AES-256 at rest, TLS 1.3 in transit

### Data Isolation
- Schema-level separation (PostgreSQL)
- Row-level security (RLS) as backup
- No cross-PSP data leakage
- Independent backups per PSP

### Access Logging
All sensitive actions logged:
- Login attempts (success/failure)
- Merchant onboarding
- Transaction refunds
- Configuration changes
- User management actions
- Report exports

---

## Troubleshooting

### Common Issues

**Issue:** Cannot login to PSP portal  
**Solution:** Verify PSP code is correct (case-sensitive), check email/password, ensure account is active

**Issue:** Transactions showing $0 volume on dashboard  
**Solution:** Check transaction status filter (only "completed" count toward volume), verify date range

**Issue:** Merchant onboarding stuck at "KYB Pending"  
**Solution:** Check KYB provider status, retry verification, or manual override if documents verified offline

**Issue:** Settlement not processing  
**Solution:** Verify merchant bank details, check for holds/reserves, ensure positive balance

---

## Best Practices

### For PSP Administrators
1. **Monitor Daily:** Check dashboard every morning for alerts
2. **Review Fraud Weekly:** Prevent chargeback accumulation
3. **Update Pricing Quarterly:** Stay competitive
4. **Backup Configurations:** Export settings before major changes
5. **Train Staff:** Ensure all users understand their permissions

### For Compliance Officers
1. **Track Grace Periods:** LEI/vLEI deadlines
2. **Audit Regularly:** Monthly compliance reports
3. **Document Everything:** Justifications for manual overrides
4. **Stay Updated:** Monitor regulatory changes

---

## Roadmap

### Q1 2026
- [ ] AI-powered fraud detection (v2)
- [ ] Automated merchant onboarding (no manual review)
- [ ] Multi-language support

### Q2 2026
- [ ] Mobile app (iOS/Android)
- [ ] Advanced analytics (predictive insights)
- [ ] Instant payouts (real-time settlement)

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Owner:** FTS.Money PSP Operations Team
`;