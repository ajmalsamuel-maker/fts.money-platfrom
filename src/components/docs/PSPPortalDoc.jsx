export const PSPPortalDoc = `
# PSP Portal Documentation
## Payment Service Provider Operations & Management Platform

**Version:** 1.0  
**Last Updated:** December 26, 2025  
**Audience:** PSP Administrators, Operations Teams, Finance Managers, Compliance Officers

---

## Executive Summary

### Purpose
The **PSP Portal** is the operational command center for Payment Service Provider administrators to manage their payment processing business. This is where PSP staff:
- Onboard and manage merchants
- Monitor real-time transaction processing
- Configure payment routing and failover rules
- Manage terminals and virtual terminals
- Handle disputes and chargebacks
- Generate financial reports and reconciliation
- Configure pricing and fees
- Ensure regulatory compliance

### Key Capabilities
- **Merchant Lifecycle Management:** Complete onboarding, KYB/AML, pricing, and account management
- **Transaction Operations:** Real-time monitoring, processing, refunds, voids, settlements
- **Smart Payment Routing:** Configure routing rules, cascading, load balancing
- **Risk & Fraud Management:** Real-time fraud detection, risk scoring, alert management
- **Financial Operations:** Settlements, reconciliation, invoicing, fee collection
- **Compliance Dashboard:** KYB/AML status, LEI/vLEI tracking, audit logs
- **Multi-Channel Support:** POS, eCommerce, MOTO, virtual terminal, recurring billing
- **White-Label Customization:** Branding, merchant portal customization, email templates

### User Personas

\`\`\`mermaid
mindmap
  root((PSP Users))
    PSP Admin
      Full Access
      User Management
      System Config
      Pricing Setup
    Operations Manager
      Merchant Onboarding
      Transaction Monitoring
      Dispute Resolution
      Support Tickets
    Finance Manager
      Settlements
      Reconciliation
      Invoicing
      Fee Management
    Compliance Officer
      KYB AML Review
      Risk Monitoring
      Audit Reports
      License Tracking
    Support Agent
      Merchant Support
      Transaction Queries
      Refund Processing
      Documentation
\`\`\`

### Business Value
- **Revenue Growth:** Onboard merchants faster, process more transactions
- **Operational Efficiency:** Automated workflows reduce manual tasks by 70%
- **Risk Mitigation:** Real-time fraud detection prevents losses
- **Compliance Assurance:** Automated KYB/AML, audit-ready reports
- **Merchant Satisfaction:** Fast onboarding, self-service portals, quick support
- **Cost Control:** Optimize payment routing, track all fees and costs

---

## Architecture Overview

### Portal Structure

\`\`\`mermaid
graph TB
    A[PSP Portal] --> B[Dashboard]
    A --> C[Merchants]
    A --> D[Transactions]
    A --> E[Routing]
    A --> F[Risk & Compliance]
    A --> G[Financial]
    A --> H[Settings]
    
    B --> B1[KPI Summary]
    B --> B2[Real-Time Monitor]
    B --> B3[Alerts Center]
    
    C --> C1[Merchant List]
    C --> C2[Onboarding]
    C --> C3[Merchant Details]
    C --> C4[Pricing Config]
    
    D --> D1[Transaction Search]
    D --> D2[Virtual Terminal]
    D --> D3[Batch Processing]
    D --> D4[Disputes]
    
    E --> E1[Routing Rules]
    E --> E2[Payment Methods]
    E --> E3[Acquirer Setup]
    
    F --> F1[Risk Alerts]
    F --> F2[KYB Status]
    F --> F3[Audit Logs]
    
    G --> G1[Settlements]
    G --> G2[Reconciliation]
    G --> G3[Invoicing]
    
    H --> H1[Users & Roles]
    H --> H2[Branding]
    H --> H3[API Keys]
\`\`\`

### Multi-Tenancy Isolation

**Schema-Level Isolation:**
\`\`\`mermaid
graph LR
    A[PSP Portal] --> B[psp_acme Schema]
    A --> C[psp_globalpay Schema]
    A --> D[psp_fintech Schema]
    
    B --> B1[Merchants]
    B --> B2[Transactions]
    B --> B3[Users]
    
    C --> C1[Merchants]
    C --> C2[Transactions]
    C --> C3[Users]
    
    D --> D1[Merchants]
    D --> D2[Transactions]
    D --> D3[Users]
    
    style B fill:#e3f2fd
    style C fill:#fff3e0
    style D fill:#f1f8e9
\`\`\`

**Key Principle:** Each PSP operates in a completely isolated database schema (\`psp_{code}\`). No shared data, no cross-contamination.

### Authentication Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal as PSP Portal
    participant Auth as psp_staff_users
    participant Schema as PSP Schema
    participant Data
    
    User->>Portal: Enter PSP Code + Credentials
    Portal->>Auth: Query psp_{code}.psp_staff_users
    Auth-->>Portal: User Record + Role
    
    Portal->>Portal: Set Schema Context
    Note over Portal: SET search_path = psp_code
    
    Portal->>Schema: Query Merchants
    Schema->>Data: SELECT * FROM psp_code.merchants
    Data-->>Schema: Results (Isolated)
    Schema-->>Portal: Merchant Data
    Portal-->>User: Dashboard
\`\`\`

**Security Layers:**
1. **PSP Code Verification:** User must know correct PSP code to login
2. **Schema Isolation:** All queries scoped to \`psp_{code}\` schema
3. **Role-Based Access:** Permissions checked on every action
4. **Audit Logging:** All actions logged with user, timestamp, IP
5. **Session Management:** 24-hour timeout, IP validation

### Data Model - PSP Level

\`\`\`mermaid
erDiagram
    MERCHANT ||--o{ TRANSACTION : processes
    MERCHANT ||--o{ MERCHANT-USER : has
    MERCHANT ||--o{ MERCHANT-MID : assigned
    MERCHANT ||--o{ SETTLEMENT : receives
    MERCHANT ||--o{ DISPUTE : involved_in
    
    TRANSACTION ||--o{ REFUND : has
    TRANSACTION ||--|| CHARGEBACK : may_have
    
    MERCHANT-MID ||--o{ TRANSACTION : routes_through
    MERCHANT-MID ||--|| PAYMENT-PROVIDER : uses
    
    ROUTING-RULE ||--o{ TRANSACTION : applies_to
    ROUTING-RULE ||--o{ PAYMENT-PROCESSOR : routes_to
    
    TERMINAL ||--|| MERCHANT : belongs_to
    TERMINAL ||--o{ TRANSACTION : processes
    
    PSP-STAFF-USER ||--o{ AUDIT-LOG : creates
    
    MERCHANT {
        string merchant_id PK
        string psp_code FK
        string merchant_code
        string business_name
        string status
        string kyb_status
        string lei
        json compliance_docs
    }
    
    TRANSACTION {
        string transaction_id PK
        string psp_code FK
        string merchant_id FK
        string mid
        string type
        string status
        decimal amount
        string currency
        string payment_method
        json metadata
    }
    
    MERCHANT-MID {
        string mid PK
        string merchant_id FK
        string provider_id FK
        string account_type
        array transaction_types
        decimal daily_limit
        string status
    }
    
    ROUTING-RULE {
        string rule_id PK
        string name
        number priority
        string status
        array conditions
        string primary_processor
        array fallback_processors
    }
\`\`\`

---

## Feature Breakdown

### 1. Dashboard (Real-Time Overview)

**Purpose:** At-a-glance view of PSP operations and health

\`\`\`mermaid
graph TB
    A[Dashboard] --> B[KPI Cards]
    A --> C[Volume Charts]
    A --> D[Transaction Monitor]
    A --> E[Alert Center]
    A --> F[Top Performers]
    
    B --> B1[Today Volume]
    B --> B2[Transaction Count]
    B --> B3[Success Rate]
    B --> B4[Active Merchants]
    B --> B5[Pending Settlements]
    B --> B6[Risk Alerts]
    
    C --> C1[7-Day Volume Trend]
    C --> C2[Payment Methods]
    C --> C3[Success vs Decline]
    
    D --> D1[Live Transactions]
    D --> D2[TPS Counter]
    D --> D3[Latency Monitor]
\`\`\`

**Key Performance Indicators:**

| Metric | Today | Yesterday | 7-Day Avg | Status |
|--------|-------|-----------|-----------|--------|
| Transaction Volume | $2.4M | $2.1M | $2.2M | 🟢 +14% |
| Transaction Count | 8,234 | 7,892 | 7,956 | 🟢 +4% |
| Success Rate | 96.8% | 96.2% | 96.5% | 🟢 +0.6% |
| Avg Transaction | $291 | $266 | $276 | 🟢 +9% |
| Active Merchants | 45 | 45 | 44 | 🟢 Stable |
| Pending Disputes | 3 | 5 | 4 | 🟢 -40% |

**Real-Time Transaction Monitor:**
\`\`\`javascript
// Live feed of last 50 transactions
{
  "transaction_id": "txn_abc123",
  "merchant_name": "Coffee Shop #42",
  "amount": 45.67,
  "currency": "USD",
  "payment_method": "visa",
  "status": "approved",
  "timestamp": "2025-12-26T10:45:23Z",
  "processing_time_ms": 234
}
\`\`\`

**Alert Center:**
- High-value transaction alerts (>$10K)
- Fraud score threshold breaches
- Merchant KYB expiration warnings
- Settlement failures
- API rate limit warnings
- System health issues

**Quick Actions:**
- Process virtual terminal payment
- Onboard new merchant
- Review pending disputes
- Generate settlement report
- View audit logs

### 2. Merchant Management

**Merchant Lifecycle:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> Application
    Application --> UnderReview: Submit
    UnderReview --> KYBVerification: Initial Approval
    UnderReview --> Rejected: Incomplete
    
    KYBVerification --> AMLScreening: KYB Pass
    KYBVerification --> Rejected: KYB Fail
    
    AMLScreening --> PricingSetup: AML Clear
    AMLScreening --> ManualReview: AML Flag
    
    ManualReview --> PricingSetup: Cleared
    ManualReview --> Rejected: High Risk
    
    PricingSetup --> MIDProvisioning: Pricing Set
    MIDProvisioning --> TestingPhase: MID Active
    
    TestingPhase --> Active: Tests Pass
    TestingPhase --> MIDProvisioning: Tests Fail
    
    Active --> Suspended: Compliance Issue
    Active --> Suspended: Payment Default
    Active --> Inactive: Business Closed
    
    Suspended --> Active: Issue Resolved
    Suspended --> Terminated: Permanent Ban
    
    Rejected --> [*]
    Terminated --> [*]
    Inactive --> [*]
\`\`\`

**Merchant Onboarding Wizard:**

**Step 1: Business Information**
\`\`\`javascript
{
  "business_name": "Acme Coffee Roasters",
  "trading_name": "Acme Coffee",
  "business_type": "LLC",
  "incorporation_country": "US",
  "incorporation_date": "2020-03-15",
  "tax_id": "12-3456789",
  "lei": "ABCDEF1234567890WXYZ", // Optional, 6-month grace
  "mcc_code": "5812", // Eating Places/Restaurants
  "business_description": "Coffee roasting and retail",
  "website": "https://acmecoffee.com",
  "business_address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94102",
    "country": "US"
  }
}
\`\`\`

**Step 2: Contact & Ownership**
\`\`\```javascript
{
  "primary_contact": {
    "full_name": "John Smith",
    "title": "CEO",
    "email": "john@acmecoffee.com",
    "phone": "+1-415-555-0100"
  },
  "beneficial_owners": [
    {
      "full_name": "John Smith",
      "ownership_percentage": 60,
      "dob": "1980-05-20",
      "nationality": "US",
      "id_type": "passport",
      "id_number": "123456789"
    },
    {
      "full_name": "Jane Doe",
      "ownership_percentage": 40,
      "dob": "1982-08-15",
      "nationality": "US",
      "id_type": "drivers_license",
      "id_number": "D1234567"
    }
  ]
}
\`\`\`

**Step 3: Banking Information**
\`\`\`javascript
{
  "bank_name": "Wells Fargo",
  "account_holder_name": "Acme Coffee Roasters LLC",
  "account_number": "1234567890",
  "routing_number": "121000248",
  "account_type": "business_checking",
  "currency": "USD",
  "iban": null, // US accounts don't use IBAN
  "swift_bic": "WFBIUS6S"
}
\`\`\`

**Step 4: Processing Details**
\`\`\`javascript
{
  "expected_monthly_volume": 250000,
  "expected_avg_ticket": 45,
  "expected_high_ticket": 500,
  "processing_channels": [
    "card_present",
    "ecommerce",
    "virtual_terminal"
  ],
  "card_types": ["visa", "mastercard", "amex", "discover"],
  "accepted_currencies": ["USD"],
  "countries_served": ["US", "CA"],
  "settlement_schedule": "T+1", // Next business day
  "chargeback_experience": "low" // <1% ratio
}
\`\`\`

**Step 5: Compliance Documents**
- Articles of Incorporation
- EIN Letter (IRS)
- Bank Statement (last 3 months)
- Processing Statements (if existing merchant)
- Owner IDs (passport/driver's license)
- Business License
- PCI Compliance certificate (if Level 1)

**Step 6: KYB/AML Screening**
\`\`\`mermaid
sequenceDiagram
    participant PSP
    participant KYB as KYB Provider
    participant AML as AML Provider
    participant Sanctions
    participant PEP
    
    PSP->>KYB: Submit Business Info
    KYB->>KYB: Verify Business Registry
    KYB->>KYB: Check Licenses
    KYB-->>PSP: KYB Score + Report
    
    PSP->>AML: Submit Owner Info
    AML->>Sanctions: Check OFAC Lists
    Sanctions-->>AML: Clear/Flag
    AML->>PEP: Check PEP Lists
    PEP-->>AML: Clear/Flag
    AML-->>PSP: AML Score + Report
    
    alt All Clear
        PSP->>PSP: Auto-Approve
    else Flags Detected
        PSP->>PSP: Manual Review Queue
    end
\`\`\`

**Step 7: Pricing Configuration**

| Fee Type | Your Rate | Merchant Pays | Your Markup |
|----------|-----------|---------------|-------------|
| Card Present (Domestic) | 1.5% + $0.10 | 2.5% + $0.20 | 1.0% + $0.10 |
| Card Not Present | 2.5% + $0.20 | 3.5% + $0.30 | 1.0% + $0.10 |
| International | 3.5% + $0.20 | 4.5% + $0.30 | 1.0% + $0.10 |
| Amex | 3.0% + $0.20 | 3.8% + $0.25 | 0.8% + $0.05 |
| Chargeback Fee | $15.00 | $25.00 | $10.00 |
| Monthly Fee | $0.00 | $29.00 | $29.00 |

**Step 8: MID Assignment**
\`\`\`javascript
{
  "mid": "MID_ACME_001",
  "merchant_id": "merch_abc123",
  "provider_id": "stripe_connect",
  "account_type": "ecommerce",
  "transaction_types": ["sale", "refund", "auth", "capture"],
  "supported_card_brands": ["visa", "mastercard", "amex", "discover"],
  "daily_limit": 50000,
  "per_transaction_limit": 10000,
  "risk_settings": {
    "velocity_checks": true,
    "fraud_score_threshold": 70,
    "require_3ds": false,
    "max_attempts_per_card": 3
  },
  "status": "active"
}
\`\`\`

**Step 9: User Provisioning**
\`\`\`javascript
// Create first merchant user (admin)
{
  "merchant_id": "merch_abc123",
  "merchant_code": "ACMEPAY_ACMECOFFEE",
  "email": "john@acmecoffee.com",
  "full_name": "John Smith",
  "role": "admin",
  "permissions": ["*"], // Full access
  "temp_password": "Welcome123!", // Must change on first login
  "must_change_password": true,
  "two_factor_enabled": true
}
\`\`\`

**Step 10: Go Live**
- Send welcome email with credentials
- Provide API documentation
- Schedule training call (optional)
- Monitor first 100 transactions
- Collect feedback

**Onboarding Time:** 24-72 hours (automated) or 3-5 business days (manual review)

### 3. Transaction Management

**Transaction Search & Filtering:**
\`\`\`mermaid
graph LR
    A[Search Interface] --> B[Filters]
    B --> B1[Date Range]
    B --> B2[Merchant]
    B --> B3[Status]
    B --> B4[Amount Range]
    B --> B5[Payment Method]
    B --> B6[Card Brand]
    B --> B7[Transaction Type]
    
    A --> C[Quick Searches]
    C --> C1[By Transaction ID]
    C --> C2[By Order ID]
    C --> C3[By Card Last 4]
    C --> C4[By Customer Email]
    
    A --> D[Results]
    D --> D1[Table View]
    D --> D2[Export CSV]
    D --> D3[Export PDF]
\`\`\`

**Transaction Details View:**
\`\`\`javascript
{
  "transaction_id": "txn_abc123",
  "merchant_transaction_id": "ORDER-2025-1234",
  "merchant_name": "Acme Coffee #42",
  "merchant_id": "merch_abc123",
  "type": "sale",
  "status": "approved",
  
  "amount": 45.67,
  "currency": "USD",
  "fee": 1.37, // Your revenue
  "net_amount": 44.30, // To merchant
  
  "payment_method": "visa",
  "card_brand": "visa",
  "card_last_four": "4242",
  "card_prefix": "424242", // BIN
  "issuer_bank": "Chase Bank",
  "issuer_country": "US",
  
  "customer_email": "customer@example.com",
  "customer_name": "Jane Customer",
  "ip_address": "203.0.113.42",
  
  "auth_code": "12345A",
  "approval_code": "OK",
  "rrn": "123456789012", // Retrieval Reference Number
  "arn": "74537604221111111111111", // Acquirer Reference
  
  "is_3ds": true,
  "3ds_version": "2.2.0",
  "liability_shift": true,
  
  "risk_score": 23, // Low risk
  "fraud_checks": {
    "cvv_match": "Y",
    "avs_match": "Y",
    "velocity_check": "pass",
    "ip_reputation": "clean"
  },
  
  "mid": "MID_ACME_001",
  "processor": "stripe_connect",
  "processing_time_ms": 234,
  
  "created_date": "2025-12-26T10:45:23Z",
  "complete_time": "2025-12-26T10:45:24Z",
  
  "metadata": {
    "store_location": "SF Downtown",
    "employee_id": "EMP-042",
    "terminal_id": "TERM-001"
  },
  
  "timeline": [
    { "status": "pending", "timestamp": "2025-12-26T10:45:23.123Z" },
    { "status": "processing", "timestamp": "2025-12-26T10:45:23.456Z" },
    { "status": "approved", "timestamp": "2025-12-26T10:45:24.001Z" }
  ]
}
\`\`\`

**Transaction Actions:**
- **Refund:** Full or partial refund
- **Void:** Cancel before settlement (same day only)
- **Capture:** Complete pre-authorization
- **Void Auth:** Cancel authorization
- **Resend Receipt:** Email receipt to customer
- **Flag for Review:** Manual fraud review
- **Add Notes:** Internal comments

**Bulk Operations:**
- Export transactions (CSV, Excel, PDF)
- Bulk refund (upload CSV)
- Bulk void (select multiple)
- Bulk settlement assignment

### 4. Virtual Terminal

**Purpose:** Process card-not-present transactions manually

\`\`\`mermaid
graph TB
    A[Virtual Terminal] --> B[Simple Sale]
    A --> C[Auth Only]
    A --> D[Recurring Setup]
    A --> E[Split Tender]
    A --> F[Itemized Sale]
    
    B --> G[Enter Card Info]
    G --> H[Enter Amount]
    H --> I[Process]
    
    C --> J[Auth Amount]
    J --> K[Capture Later]
    
    D --> L[Setup Schedule]
    L --> M[First Payment]
    
    E --> N[Multiple Payments]
    N --> O[Process Each]
    
    F --> P[Add Items]
    P --> Q[Calculate Total]
    Q --> I
\`\`\`

**Simple Sale Interface:**
\`\`\`javascript
{
  "transaction_type": "sale",
  "amount": 150.00,
  "currency": "USD",
  "card_info": {
    "card_number": "4242424242424242",
    "exp_month": "12",
    "exp_year": "2027",
    "cvv": "123",
    "cardholder_name": "John Doe"
  },
  "billing_address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94102",
    "country": "US"
  },
  "customer_info": {
    "email": "john@example.com",
    "phone": "+1-415-555-0100"
  },
  "send_receipt": true,
  "description": "Payment for services",
  "invoice_number": "INV-2025-001"
}
\`\`\`

**Advanced Features:**
- **Card on File:** Save card for future use (tokenized)
- **Recurring Billing:** Setup automatic charges
- **Split Tender:** Accept multiple payment methods
- **Tip Adjustment:** Add tips after authorization
- **Custom Fields:** Store additional metadata
- **Receipt Customization:** Branded receipts

**Security Features:**
- No card data stored (PCI compliant)
- All card numbers tokenized immediately
- CVV never stored
- IP address logging
- User action audit trail
- 3D Secure optional

### 5. Payment Routing Configuration

**Purpose:** Intelligent routing of transactions to optimize success rates and costs

\`\`\`mermaid
graph TB
    A[Transaction Request] --> B[Routing Engine]
    B --> C{Evaluate Rules}
    
    C --> D[Rule 1: Currency]
    C --> E[Rule 2: Card Type]
    C --> F[Rule 3: Amount]
    C --> G[Rule 4: Geography]
    C --> H[Rule 5: Time]
    C --> I[Rule 6: Cost]
    
    D --> J[Route Selection]
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K{Primary Route}
    K -->|Success| L[Complete]
    K -->|Fail| M[Fallback Route 1]
    M -->|Fail| N[Fallback Route 2]
    M -->|Success| L
    N -->|Success| L
    N -->|Fail| O[Manual Review]
\`\`\`

**Routing Rule Configuration:**
\`\`\`javascript
{
  "rule_id": "rule_001",
  "name": "US Domestic Cards → Stripe",
  "priority": 100, // Higher = evaluated first
  "status": "active",
  
  "conditions": {
    "card_country": ["US"],
    "transaction_type": ["sale", "auth"],
    "amount_range": { "min": 0, "max": 10000 },
    "merchant_mcc": ["5812", "5814"], // Restaurants
    "time_based": false
  },
  
  "routing": {
    "primary_processor": "stripe_connect",
    "fallback_processors": ["adyen", "braintree"],
    "retry_attempts": 2,
    "retry_delay_seconds": 1
  },
  
  "optimization": {
    "strategy": "cost", // or "success_rate" or "speed"
    "max_cost_percentage": 2.5,
    "min_success_rate": 95.0
  }
}
\`\`\`

**Routing Strategies:**

1. **Cost Optimization:** Route to lowest-cost provider
   - Calculate: (base_fee% * amount) + fixed_fee
   - Choose cheapest route that meets quality threshold

2. **Success Rate Optimization:** Route to highest approval rate
   - Track historical success rates per route
   - Choose route with best performance for similar transactions

3. **Load Balancing:** Distribute evenly across providers
   - Round-robin distribution
   - Prevents over-reliance on single provider

4. **Geographic Routing:** Route based on card issuer country
   - Domestic cards → domestic acquirers (lower fees)
   - International cards → international acquirers

5. **Card Brand Routing:** Different routes per card brand
   - Amex → direct Amex integration
   - Visa/MC → lowest cost acquirer

**Cascading/Failover:**
\`\`\`mermaid
sequenceDiagram
    participant Merchant
    participant Router
    participant Primary as Primary Processor
    participant Fallback1 as Fallback 1
    participant Fallback2 as Fallback 2
    
    Merchant->>Router: Payment Request
    Router->>Primary: Route Transaction
    
    alt Primary Success
        Primary-->>Router: Approved
        Router-->>Merchant: Success
    else Primary Fail
        Primary-->>Router: Declined
        Router->>Fallback1: Retry Transaction
        
        alt Fallback 1 Success
            Fallback1-->>Router: Approved
            Router-->>Merchant: Success
        else Fallback 1 Fail
            Fallback1-->>Router: Declined
            Router->>Fallback2: Retry Transaction
            
            alt Fallback 2 Success
                Fallback2-->>Router: Approved
                Router-->>Merchant: Success
            else All Failed
                Fallback2-->>Router: Declined
                Router-->>Merchant: Failed (All Routes)
            end
        end
    end
\`\`\`

### 6. Disputes & Chargebacks

**Dispute Lifecycle:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> Received
    Received --> UnderReview: Assign to Agent
    UnderReview --> GatheringEvidence: Accept Challenge
    UnderReview --> Accepted: Not Disputing
    
    GatheringEvidence --> EvidenceSubmitted: Submit Docs
    EvidenceSubmitted --> AwaitingDecision: Sent to Issuer
    
    AwaitingDecision --> Won: Merchant Favor
    AwaitingDecision --> Lost: Issuer Favor
    AwaitingDecision --> PreArbitration: Issuer Appeals
    
    PreArbitration --> Arbitration: Escalate
    PreArbitration --> Lost: Accept Loss
    
    Arbitration --> Won: Final - Merchant
    Arbitration --> Lost: Final - Issuer
    
    Accepted --> Lost
    Won --> [*]
    Lost --> [*]
\`\`\`

**Chargeback Details:**
\`\`\`javascript
{
  "chargeback_id": "cb_abc123",
  "transaction_id": "txn_xyz789",
  "merchant_id": "merch_abc123",
  "merchant_name": "Acme Coffee #42",
  
  "amount": 125.00,
  "currency": "USD",
  "chargeback_amount": 125.00, // Can differ
  "chargeback_fee": 25.00, // Your fee to merchant
  
  "card_network": "visa",
  "reason_code": "10.4", // Fraud - Card Absent
  "reason_category": "fraud",
  "reason_description": "Customer claims unauthorized transaction",
  
  "status": "under_review",
  "lifecycle_stage": "first_chargeback",
  
  "original_transaction_date": "2025-11-15",
  "chargeback_date": "2025-12-20",
  "response_due_date": "2026-01-05",
  "days_remaining": 10,
  
  "cardholder_name": "John Customer",
  "card_last_four": "1234",
  
  "evidence_required": [
    "proof_of_delivery",
    "customer_communication",
    "terms_and_conditions",
    "customer_signature"
  ],
  
  "evidence_submitted": false,
  "merchant_response": null,
  "issuer_comments": "Customer states card was lost/stolen"
}
\`\`\`

**Evidence Submission:**
\`\`\`javascript
{
  "chargeback_id": "cb_abc123",
  "evidence": {
    "customer_email_address": "customer@example.com",
    "customer_name": "John Customer",
    "customer_signature": "data:image/png;base64,...",
    
    "billing_address": "123 Main St, San Francisco, CA 94102",
    "shipping_address": "123 Main St, San Francisco, CA 94102",
    "shipping_carrier": "FedEx",
    "shipping_tracking_number": "123456789",
    "shipping_date": "2025-11-16",
    "shipping_documentation": "https://cdn.acme.com/proof-delivery.pdf",
    
    "product_description": "Premium Coffee Beans - 5lb",
    "receipt": "https://cdn.acme.com/receipt.pdf",
    "customer_communication": "https://cdn.acme.com/emails.pdf",
    
    "service_date": "2025-11-15",
    "service_documentation": "https://cdn.acme.com/invoice.pdf",
    
    "duplicate_charge_documentation": null,
    "refund_policy": "https://acmecoffee.com/refund-policy",
    "refund_policy_disclosure": "Displayed at checkout",
    
    "uncategorized_file": "https://cdn.acme.com/additional-proof.pdf",
    "uncategorized_text": "Customer has been satisfied customer for 2 years, this is their 15th order."
  },
  "merchant_notes": "Customer signed for delivery, have proof of delivery from FedEx"
}
\`\`\`

**Chargeback Analytics:**
- Chargeback ratio (chargebacks / total transactions)
- Average resolution time
- Win/loss rate by reason code
- High-risk merchants (ratio >1%)
- Monthly chargeback trends

### 7. Settlements & Reconciliation

**Settlement Process:**
\`\`\`mermaid
sequenceDiagram
    participant Txn as Transactions
    participant System
    participant Batch as Settlement Batch
    participant Bank
    participant Merchant
    
    Note over Txn,System: End of Day (EOD)
    Txn->>System: All Approved Txns
    System->>System: Calculate Fees
    System->>System: Deduct Chargebacks
    System->>System: Deduct Refunds
    
    System->>Batch: Create Settlement Batch
    Batch->>Batch: Group by Merchant
    
    loop For Each Merchant
        Batch->>Bank: Initiate ACH Transfer
        Bank-->>Merchant: Deposit Funds
        Batch->>Merchant: Email Settlement Report
    end
    
    Batch->>System: Update Status: Settled
\`\`\`

**Settlement Configuration:**
\`\`\`javascript
{
  "merchant_id": "merch_abc123",
  "settlement_config": {
    "schedule": "T+1", // Next business day
    "frequency": "daily",
    "minimum_balance": 100.00, // Hold if below
    "reserve_percentage": 10, // Rolling reserve
    "reserve_days": 30, // Hold for 30 days
    "bank_account": {
      "account_number": "****7890",
      "routing_number": "121000248",
      "account_type": "business_checking"
    }
  }
}
\`\`\`

**Settlement Report:**
\`\`\`javascript
{
  "settlement_id": "settle_abc123",
  "merchant_id": "merch_abc123",
  "period_start": "2025-12-25T00:00:00Z",
  "period_end": "2025-12-25T23:59:59Z",
  
  "summary": {
    "gross_sales": 12450.00,
    "refunds": -340.00,
    "chargebacks": -125.00,
    "fees": -362.70,
    "reserve_held": -1198.50, // 10% rolling
    "net_settlement": 10423.80
  },
  
  "breakdown": {
    "transaction_count": 234,
    "avg_ticket": 53.21,
    "card_present": 8500.00,
    "card_not_present": 3950.00,
    "refund_count": 5,
    "chargeback_count": 1
  },
  
  "fees": {
    "transaction_fees": 337.70,
    "chargeback_fees": 25.00,
    "monthly_fee": 0.00
  },
  
  "payout_status": "completed",
  "payout_date": "2025-12-26",
  "payout_reference": "ACH-20251226-001",
  
  "next_settlement": "2025-12-27"
}
\`\`\`

**Reconciliation:**
- Match transactions to bank deposits
- Identify discrepancies
- Track reserve releases
- Monitor failed payouts
- Generate accounting reports (for QuickBooks, Xero integration)

### 8. Risk & Fraud Management

**Real-Time Fraud Detection:**
\`\`\`mermaid
graph TB
    A[Transaction] --> B[Fraud Engine]
    
    B --> C[Velocity Checks]
    B --> D[Device Fingerprint]
    B --> E[IP Reputation]
    B --> F[Email Validation]
    B --> G[BIN Analysis]
    B --> H[Behavioral Analysis]
    
    C --> I[Score Calculation]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J{Risk Score}
    
    J -->|0-30 Low| K[Auto-Approve]
    J -->|31-70 Medium| L[3D Secure]
    J -->|71-100 High| M[Block/Review]
\`\`\`

**Risk Rules:**
\`\`\`javascript
{
  "rule_id": "fraud_001",
  "name": "High Velocity - Multiple Cards",
  "description": "Block if >5 different cards used from same IP in 1 hour",
  "status": "active",
  
  "conditions": {
    "time_window_minutes": 60,
    "unique_cards": 5,
    "from_same_ip": true
  },
  
  "action": "block",
  "alert": true,
  "notify": ["fraud@acmepay.com"]
}
\`\`\`

**Risk Alert Types:**
- Velocity threshold breach (too many transactions)
- Geographic anomaly (card issued in US, transaction from Nigeria)
- High-risk BIN detected
- Email/IP on blacklist
- Card testing patterns
- Suspicious refund patterns

**Fraud Review Queue:**
- Flagged transactions pending review
- Assign to fraud analyst
- Approve, decline, or request more info
- Add to whitelist/blacklist
- Document decision rationale

### 9. Reporting & Analytics

**Standard Reports:**

1. **Transaction Summary Report**
   - Total volume, count, avg ticket
   - By date range, merchant, payment method
   - Success vs decline rate
   - Export: CSV, Excel, PDF

2. **Settlement Report**
   - Gross sales, fees, net settlement
   - By merchant, by period
   - Reserve schedule
   - Export: CSV, Excel, PDF, QuickBooks

3. **Chargeback Report**
   - Chargeback count, ratio, amount
   - By reason code, merchant
   - Win/loss analysis
   - Export: CSV, Excel, PDF

4. **Merchant Performance Report**
   - Top merchants by volume
   - Growth trends
   - Profitability analysis
   - Export: CSV, Excel, PDF

5. **Compliance Report**
   - KYB status summary
   - LEI expiration tracking
   - Document status
   - Export: PDF

**Custom Report Builder:**
- Drag-and-drop interface
- Select metrics, dimensions, filters
- Save custom reports
- Schedule automated delivery

**Analytics Dashboards:**
- Volume trends (daily, weekly, monthly)
- Payment method breakdown
- Geographic distribution
- Success rate analysis
- Cost analysis (processor comparison)

### 10. Settings & Configuration

**General Settings:**
- PSP name, logo, contact info
- Base currency, timezone
- Default language
- Operating countries

**Appearance (White-Label):**
- Primary color, secondary color
- Logo upload (dashboard, merchant portal)
- Favicon
- Email templates (branding)
- Merchant portal customization

**Users & Roles:**
\`\`\`javascript
// Role hierarchy
{
  "admin": {
    "permissions": ["*"], // Full access
    "can_manage_users": true
  },
  "operations_manager": {
    "permissions": [
      "merchants:*",
      "transactions:read",
      "transactions:refund",
      "disputes:*",
      "reports:read"
    ]
  },
  "finance_manager": {
    "permissions": [
      "merchants:read",
      "transactions:read",
      "settlements:*",
      "reports:*",
      "invoicing:*"
    ]
  },
  "support_agent": {
    "permissions": [
      "merchants:read",
      "transactions:read",
      "transactions:refund",
      "reports:read"
    ]
  },
  "compliance_officer": {
    "permissions": [
      "merchants:read",
      "merchants:kyb_review",
      "risk:*",
      "audit:read"
    ]
  }
}
\`\`\`

**API Keys:**
- Generate test/production keys
- Set permissions per key
- Rate limits
- IP whitelisting
- Key rotation schedule

**Webhooks:**
- Configure webhook endpoints
- Select events to subscribe to
- Verify webhook signatures
- Retry configuration

**Integrations:**
- Payment processors (Stripe, Adyen, etc.)
- Payout providers
- Fraud detection services
- Accounting software (QuickBooks, Xero)
- CRM systems

**Notifications:**
- Email alerts (high-value txn, chargebacks, etc.)
- SMS alerts (critical only)
- Slack integration
- Webhook notifications

---

## Technical Specifications

### Frontend Stack
- React 18.2 + Vite
- Tailwind CSS + shadcn/ui
- React Query (data fetching)
- Recharts (analytics)
- React Hook Form + Zod (forms)
- Date-fns (date handling)

### Authentication
\`\`\`javascript
POST /functions/pspAuth
{
  "action": "login",
  "psp_code": "ACMEPAY",
  "email": "admin@acmepay.com",
  "password": "***"
}

// Response
{
  "success": true,
  "user": {
    "email": "admin@acmepay.com",
    "full_name": "John Admin",
    "role": "admin",
    "permissions": ["*"]
  },
  "psp": {
    "psp_code": "ACMEPAY",
    "psp_name": "Acme Payments",
    "schema": "psp_acmepay"
  }
}
\`\`\`

### API Endpoints

**Query Merchants:**
\`\`\`javascript
GET /functions/pspData
{
  "action": "list_merchants",
  "psp_code": "ACMEPAY",
  "filters": {
    "status": "active",
    "kyb_status": "approved"
  },
  "sort": "-created_date",
  "limit": 50
}
\`\`\`

**Query Transactions:**
\`\`\`javascript
GET /functions/pspData
{
  "action": "list_transactions",
  "psp_code": "ACMEPAY",
  "filters": {
    "date_from": "2025-12-01",
    "date_to": "2025-12-31",
    "merchant_id": "merch_abc123",
    "status": "approved"
  },
  "sort": "-created_date",
  "limit": 100
}
\`\`\`

**Process Virtual Terminal Payment:**
\`\`\`javascript
POST /functions/processPayment
{
  "psp_code": "ACMEPAY",
  "merchant_id": "merch_abc123",
  "type": "sale",
  "amount": 150.00,
  "currency": "USD",
  "card": {
    "number": "4242424242424242",
    "exp_month": "12",
    "exp_year": "2027",
    "cvv": "123"
  },
  "billing_address": {...},
  "customer_email": "customer@example.com"
}
\`\`\`

### Database Queries

**Schema-Scoped Queries:**
\`\`\`javascript
// All queries automatically scoped to PSP schema
const base44 = createPSPClient(req, psp_code);

// This query only sees data in psp_acmepay schema
const merchants = await base44.entities.Merchant.filter({
  status: 'active'
});

// Under the hood:
// SET search_path = psp_acmepay;
// SELECT * FROM psp_acmepay.merchants WHERE status = 'active';
\`\`\`

### Performance Optimization

**Caching:**
- Dashboard metrics: 60 second cache
- Merchant list: 5 minute cache
- Transaction list: Real-time (no cache)
- Reports: 10 minute cache

**Pagination:**
- Default: 50 records per page
- Max: 500 records per page
- Cursor-based for large datasets

**Lazy Loading:**
- Transaction details loaded on demand
- Charts rendered only when visible
- Large reports generated asynchronously

---

## Security & Compliance

### PCI DSS Compliance
- No card data stored in PSP portal
- All card numbers tokenized immediately
- CVV never stored or logged
- Regular vulnerability scans
- Penetration testing annually

### Data Protection
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Database-level encryption
- Backups encrypted

### Access Control
- Role-based permissions (RBAC)
- Session timeout (24 hours)
- IP whitelist support
- 2FA available
- Audit logging

### Compliance Monitoring
- KYB/AML status tracking
- LEI expiration alerts
- Document expiration tracking
- Regulatory reporting
- Audit trail (7-year retention)

---

## Best Practices

### For PSP Administrators
1. **Onboarding:** Complete KYB/AML within 48 hours of application
2. **Pricing:** Use tiered pricing to incentivize volume growth
3. **Monitoring:** Review dashboard daily for anomalies
4. **Disputes:** Respond within 5 days to maximize win rate
5. **Settlements:** Reconcile daily to catch issues early

### For Operations Teams
1. **Merchant Support:** Respond within 4 business hours
2. **Dispute Management:** Gather evidence immediately
3. **Risk Monitoring:** Investigate all high-risk alerts within 2 hours
4. **Documentation:** Keep detailed notes on all merchant interactions

### For Finance Teams
1. **Reconciliation:** Daily reconciliation of all settlements
2. **Reserve Management:** Monitor reserve adequacy monthly
3. **Cost Analysis:** Review routing costs quarterly
4. **Reporting:** Generate financial reports weekly

---

## Troubleshooting

**Issue:** Merchant can't login to portal  
**Solution:** Reset password, verify merchant_code format (PSP_MERCHANT)

**Issue:** Transaction declined (generic error)  
**Solution:** Check routing rule, verify MID active, check processor status

**Issue:** Settlement delayed  
**Solution:** Verify bank details, check reserve balance, contact processor

**Issue:** High chargeback ratio  
**Solution:** Review fraud rules, enable 3D Secure, educate merchant

---

## Roadmap

### Q1 2026
- AI-powered fraud detection
- Advanced routing optimization
- Mobile app (iOS/Android)
- Real-time collaboration tools

### Q2 2026
- Cryptocurrency payment support
- Open Banking integrations
- Enhanced analytics (predictive)
- Merchant self-service improvements

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Owner:** FTS.Money Product Team
`;