const BillingRevenueOperationsSOPs = `# Billing & Revenue Operations Standard Operating Procedures
## FTS.Money Unified Billing, Usage Metering & Financial Operations

**Document Classification:** Confidential - Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** Chief Financial Officer (CFO) & Billing Operations Team

---

## Table of Contents

1. [Overview](#overview)
2. [Usage Metering Engine](#usage-metering)
3. [Invoice Generation & Distribution](#invoice-generation)
4. [Multi-Service Billing Consolidation](#multi-service-billing)
5. [Payment Processing & Collections](#payment-processing)
6. [Revenue Recognition (ASC 606)](#revenue-recognition)
7. [Accounting Integrations](#accounting-integrations)
8. [Dispute Resolution](#dispute-resolution)

---

## Overview

### FTS.Money Billing Model

**Hybrid Pricing:** Subscription (recurring) + Usage-Based (variable) + Transaction Share (volume-based)

\`\`\`mermaid
graph LR
    A[Customer Billing] --> B[Subscription Fees]
    A --> C[Usage Overages]
    A --> D[Transaction Revenue Share]
    A --> E[Professional Services]
    
    B --> F[Monthly/Annual Recurring]
    C --> G[Metered by Service]
    D --> H[% of Transaction Volume]
    E --> I[One-Time or Monthly Retainer]
    
    F --> J[Consolidated Invoice]
    G --> J
    H --> J
    I --> J
    
    J --> K[Customer Payment]
    K --> L[Revenue Recognition]
    
    style J fill:#3b82f6,color:#fff
    style L fill:#10b981,color:#fff
\`\`\`

### Billing Cycle Overview

| Service | Billing Frequency | Billing Date | Metered Components |
|---------|------------------|--------------|-------------------|
| **PSP Platform** | Monthly | 1st of month | Subscription + transaction fees |
| **Crypto VASP** | Monthly | 1st of month | Subscription + wallet fees + transaction fees |
| **ISO Gateway** | Monthly | 1st of month | Subscription + message overage |
| **Orchestration** | Monthly | 1st of month | Subscription + volume fees |
| **RWA Platform** | Monthly | 1st of month | Subscription + asset fees + transaction fees |
| **Tax Management** | Monthly | 1st of month | Subscription + calculation overage |
| **E-Invoicing** | Monthly | 1st of month | Subscription + submission overage |
| **Professional Services** | Upon delivery | Variable | Milestone-based or hourly |

### Key Billing Metrics

| Metric | Target | Current | Industry Benchmark |
|--------|--------|---------|-------------------|
| **Invoice Accuracy** | >99% | 99.4% | >95% |
| **Days Sales Outstanding (DSO)** | <30 days | 27 days | 30-45 days |
| **Collection Rate** | >98% | 97.8% | >95% |
| **Billing Dispute Rate** | <2% | 1.6% | <5% |
| **Automated Payment Rate** | >70% | 68% | >60% |

---

## SOP-FIN-001: Usage Metering Engine Operations

### Purpose
Accurately meter usage across all services to enable precise usage-based billing and overage calculations.

### Metering Architecture

\`\`\`mermaid
graph TB
    subgraph "Data Sources"
        S1[PSP Transaction Events]
        S2[Crypto VASP API Calls]
        S3[ISO Gateway Messages]
        S4[Orchestration Routes]
        S5[Tax Calculations]
        S6[E-Invoice Submissions]
        S7[RWA Transactions]
    end
    
    subgraph "Metering Engine"
        M1[Event Stream Kafka]
        M2[Aggregation Service]
        M3[Usage Database PostgreSQL]
        M4[Billing Rules Engine]
    end
    
    subgraph "Outputs"
        O1[Real-Time Usage Dashboard]
        O2[Usage Alerts Approaching Limits]
        O3[Monthly Usage Reports]
        O4[Invoice Line Items]
    end
    
    S1 --> M1
    S2 --> M1
    S3 --> M1
    S4 --> M1
    S5 --> M1
    S6 --> M1
    S7 --> M1
    
    M1 --> M2
    M2 --> M3
    M3 --> M4
    
    M4 --> O1
    M4 --> O2
    M4 --> O3
    M4 --> O4
    
    style M3 fill:#3b82f6,color:#fff
    style O4 fill:#10b981,color:#fff
\`\`\`

### Service-Specific Metering Logic

#### PSP Platform Metering

**What's Metered:**
- Transaction count
- Transaction volume (dollar value)
- Active merchants
- API calls
- Settlement operations

**Calculation Example (Growth Tier):**

\`\`\`yaml
psp_growth_tier:
  base_subscription: $2,499/month
  included:
    merchants: 100
    transaction_fee: 0.10% + $0.08
  
  overage:
    merchants_over_100:
      rate: $15 per merchant per month
      calculation: (actual_merchants - 100) × $15
    
  transaction_fee:
    percentage: 0.10%
    fixed: $0.08
    calculation: (volume × 0.001) + (count × 0.08)
  
  example_month:
    merchants: 120  # 20 over
    transactions: 15,000
    volume: $2,100,000
    
    charges:
      base: $2,499
      merchant_overage: (120 - 100) × $15 = $300
      transaction_fees: ($2,100,000 × 0.001) + (15,000 × 0.08) = $2,100 + $1,200 = $3,300
      total: $6,099
\`\`\`

#### Crypto VASP Metering

**What's Metered:**
- Wallet creations
- IBAN provisioning
- Card issuances (virtual + physical)
- KYC verifications
- Transaction volume (fiat ↔ crypto)

**Billing Example:**

| Component | Included (Professional Tier) | Overage Rate | Example Usage | Charges |
|-----------|------------------------------|--------------|---------------|---------|
| Base subscription | - | - | - | $4,999 |
| Wallets | 1,000 | $0.50/wallet | 1,200 wallets | (1,200-1,000) × $0.50 = $100 |
| IBANs | 200 | $5/IBAN | 180 IBANs | $0 (under limit) |
| Cards (virtual) | 100 | $3/card | 120 cards | (120-100) × $3 = $60 |
| Transaction fees | - | 1.0% | $50,000 crypto volume | $50,000 × 0.01 = $500 |
| **Total Monthly Bill** | | | | **$5,659** |

### Metering Data Quality Assurance

**Daily Reconciliation:**

1. **Event Count Validation:**
   - Compare event stream count to database records
   - Alert if discrepancy >0.1%
   
2. **Duplicate Detection:**
   - Check for duplicate event IDs
   - Auto-deduplicate and log occurrences

3. **Missing Events:**
   - Validate all services sending events
   - Alert if service silent for >1 hour

**Monthly Audit:**
- Randomly sample 100 customers
- Manual verification of usage calculations
- Compare to customer-reported usage (if available)
- Investigate any discrepancies >2%

### Customer Usage Visibility

**Real-Time Usage Dashboard (Customer Portal):**
- Current month usage by service
- Percentage of included units consumed
- Projected month-end charges
- Historical usage trends (12-month view)
- Usage alerts (e.g., "You've used 80% of included API calls")

### Metrics

- Metering accuracy (target: >99.9%)
- Billing disputes due to metering errors (target: <0.5%)
- Usage data latency (target: <5 minutes from event to dashboard)
- Customer usage dashboard utilization (target: >60% of customers check monthly)

---

## SOP-FIN-002: Consolidated Invoice Generation

### Purpose
Generate accurate, comprehensive invoices consolidating multiple services and usage types.

### Invoice Generation Timeline

\`\`\`mermaid
gantt
    title Monthly Invoice Generation Process
    dateFormat YYYY-MM-DD
    
    section Data Collection
    Usage data aggregation        :a1, 2026-02-01, 1d
    Transaction fee calculation   :a2, 2026-02-01, 1d
    Professional services billing :a3, 2026-02-01, 1d
    
    section Validation
    Data quality checks           :v1, 2026-02-02, 1d
    Billing rules application     :v2, 2026-02-02, 1d
    Finance review (spot checks)  :v3, 2026-02-03, 1d
    
    section Generation
    Invoice generation            :g1, 2026-02-04, 1d
    PDF rendering                 :g2, 2026-02-04, 1d
    Accounting system sync        :g3, 2026-02-04, 1d
    
    section Distribution
    Email distribution            :d1, 2026-02-05, 1d
    Portal publication            :d2, 2026-02-05, 1d
    Payment processing            :milestone, d3, 2026-02-05, 0d
\`\`\`

**Invoice Issuance:** 5th of each month (for previous month's usage)

### Multi-Service Invoice Structure

**Invoice Line Items (Example):**

\`\`\`markdown
INVOICE #FTS-2026-001234
Customer: ACME Payment Services Inc.
Billing Period: January 1-31, 2026
Due Date: March 7, 2026 (Net 30)

---

SERVICE: PSP Platform (Professional Tier)
  Base Subscription                           $9,999.00
  Active Merchants (1,200 - 1,000 included)
    200 × $10/merchant                        $2,000.00
  Transaction Fees
    Volume: $4.2M × 0.05%                     $2,100.00
    Count: 28,000 × $0.05                     $1,400.00
  --------------------------------------------------
  Subtotal PSP Platform                      $15,499.00

SERVICE: Payment Orchestration (Growth Tier)
  Base Subscription                             $999.00
  Volume Processed: $1.8M × 0.12%             $2,160.00
  --------------------------------------------------
  Subtotal Orchestration                      $3,159.00

SERVICE: Tax Management (Professional Tier)
  Base Subscription                           $1,999.00
  Calculations (120,000 - 100,000 included)
    20,000 × $0.02                              $400.00
  --------------------------------------------------
  Subtotal Tax Management                     $2,399.00

PROFESSIONAL SERVICES:
  Custom Integration Development
    40 hours × $200/hour                      $8,000.00
  --------------------------------------------------
  Subtotal Professional Services              $8,000.00

---
SUBTOTAL                                     $29,057.00
TAX (VAT 20% - UK)                            $5,811.40
---
TOTAL DUE                                    $34,868.40

Payment Method: ACH Auto-Pay (Feb 7, 2026)
\`\`\`

### Tax Calculation (Automated)

**FTS.Money Tax Engine Integration:**

1. Determine customer location (billing address)
2. Lookup applicable tax rate from TaxRate entity
3. Apply tax to relevant line items:
   - SaaS services: Taxable in most jurisdictions
   - Transaction fees: Varies by jurisdiction
   - Professional services: Usually taxable

**Tax Handling by Jurisdiction:**

| Jurisdiction | Tax Type | Rate | Applied To | Reverse Charge (B2B)? |
|--------------|----------|------|------------|---------------------|
| **EU** | VAT | 19-25% | All services | Yes (if valid VAT ID) |
| **UK** | VAT | 20% | All services | Yes (if valid VAT ID) |
| **US** | Sales Tax | 0-10% | SaaS only (varies by state) | N/A |
| **Singapore** | GST | 8% | All services | No |
| **UAE** | VAT | 5% | All services | Yes (if TRN provided) |

**Reverse Charge Mechanism (EU B2B):**
- If customer provides valid VAT ID → No VAT charged, customer self-assesses
- Invoice shows: "Reverse charge applies per Article 44 EU VAT Directive"
- VAT ID validated via VIES API monthly

### Invoice Distribution

**Delivery Methods:**

| Method | Use Case | Percentage | Automation |
|--------|----------|------------|------------|
| **Email (PDF)** | All customers | 100% | Fully automated |
| **Customer Portal** | Self-service download | 85% access | Automated publication |
| **Accounting Integration** | Xero/QuickBooks customers | 35% | API sync |
| **Postal Mail** | Enterprise customer request | <5% | Manual process |

### Metrics

- Invoice generation time (target: 100% issued by 5th of month)
- Invoice accuracy (target: >99%)
- Invoices delivered successfully (target: >99.5% email delivery)
- Customer portal access rate (target: >60% view invoices online)

---

## SOP-FIN-003: Payment Processing & Collections

### Purpose
Maximize on-time payment collection while maintaining positive customer relationships.

### Payment Methods Accepted

| Method | Processing Time | Fees to FTS | Preferred? | Availability |
|--------|----------------|-------------|------------|--------------|
| **ACH/Bank Transfer** | 3-5 business days | Free | ✅ PREFERRED | US, EU (SEPA) |
| **Credit Card (Stripe)** | Immediate | 2.9% + $0.30 | ❌ High cost | Global |
| **Wire Transfer** | 1-2 business days | Free | ✅ PREFERRED | Global |
| **Crypto (USDC/USDT)** | <1 hour | 0.1% | ⭐ MOST PREFERRED | Global |
| **Check** | 5-10 days | Free | ❌ Manual | US only |

**Incentives to Use Preferred Methods:**
- 2% discount for annual prepay via ACH/wire
- 1% discount for crypto payments
- No discount for credit card payments (high processing fees)

### Automated Payment Collection

**Auto-Pay Setup:**

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant Portal
    participant Stripe
    participant FTS_Billing
    participant Bank
    
    Customer->>Portal: Enable Auto-Pay
    Portal->>Customer: Choose payment method
    Customer->>Stripe: Enter bank details (ACH) or card
    Stripe->>Portal: Payment method validated
    Portal->>FTS_Billing: Store payment method token
    
    Note over FTS_Billing: Monthly billing cycle
    
    FTS_Billing->>FTS_Billing: Invoice generated (5th of month)
    FTS_Billing->>Stripe: Charge payment method (7th of month)
    Stripe->>Bank: Initiate payment
    Bank->>Stripe: Payment confirmed (3-5 days)
    Stripe->>FTS_Billing: Payment success webhook
    FTS_Billing->>Customer: Payment receipt email
    FTS_Billing->>Portal: Update invoice status to "Paid"
    
    alt Payment Failed
        Bank->>Stripe: Payment failed
        Stripe->>FTS_Billing: Failure webhook
        FTS_Billing->>Customer: Failed payment notification
        FTS_Billing->>FTS_Billing: Retry in 3 days (up to 3 attempts)
    end
\`\`\`

**Auto-Pay Adoption Target:** >70% of customers by Year 2

**Incentive:** 5% discount for enabling auto-pay (annual contracts only)

### Collections Workflow (Overdue Accounts)

**Aging Categories:**

| Days Overdue | Category | Action | Escalation |
|--------------|----------|--------|------------|
| **1-15 days** | Current | Automated reminder email (Day 5, Day 10) | None |
| **16-30 days** | Overdue | CSM outreach, offer payment plan | CSM |
| **31-60 days** | Delinquent | Service warning, suspend new features | Finance Manager |
| **61-90 days** | Collections | Legal demand letter, service suspension | CFO + Legal |
| **90+ days** | Write-Off | Terminate service, send to collections agency | CEO approval |

**Dunning Email Sequence:**

\`\`\`mermaid
gantt
    title Automated Collections Dunning Sequence
    dateFormat YYYY-MM-DD
    
    section Friendly Reminders
    Reminder 1 - Invoice due in 5 days  :r1, 2026-02-02, 1d
    Reminder 2 - Invoice due tomorrow   :r2, 2026-02-06, 1d
    
    section Past Due
    Day 1 overdue - Gentle reminder     :d1, 2026-02-08, 1d
    Day 5 overdue - Urgent notice       :d2, 2026-02-12, 1d
    Day 10 overdue - Final warning      :d3, 2026-02-17, 1d
    
    section Escalation
    Day 15 - CSM personal outreach      :e1, 2026-02-22, 1d
    Day 30 - Service suspension warning :e2, 2026-03-09, 1d
    Day 45 - Partial service suspension :milestone, e3, 2026-03-24, 0d
    Day 60 - Legal demand letter        :e4, 2026-04-08, 1d
    Day 90 - Collections agency         :milestone, e5, 2026-05-08, 0d
\`\`\`

### Payment Plans

**Offered to customers with temporary cash flow issues:**

**Eligibility:**
- Good payment history (no prior defaults)
- >6 months as customer
- Clear communication and engagement
- Amount <$50,000

**Terms:**
- Split outstanding balance into 3-6 monthly installments
- Must maintain current month payments
- 5% late payment fee waived if plan adhered to
- Payment plan agreement signed

### Failed Payment Recovery

**Automatic Retry Logic:**

| Attempt | Timing | Method | Success Rate |
|---------|--------|--------|--------------|
| **Initial** | Invoice date | Charge saved payment method | 82% |
| **Retry 1** | +3 days | Same method | 12% recovery |
| **Retry 2** | +7 days | Same method + email notification | 4% recovery |
| **Retry 3** | +14 days | Update payment method request | 1.5% recovery |
| **Manual** | +21 days | CSM phone call | 0.5% recovery |

**Total Recovery Rate Target:** >97%

### Metrics

- Payment on-time rate (target: >85% by due date)
- DSO (Days Sales Outstanding) - (target: <30 days)
- Bad debt write-offs (target: <1% of AR)
- Auto-pay enrollment (target: >70%)
- Payment retry success rate (target: >15% recovered via retries)

---

## SOP-FIN-004: Revenue Recognition (ASC 606 / IFRS 15)

### Purpose
Ensure revenue is recognized accurately per accounting standards for subscription and usage-based services.

### Revenue Recognition Framework

**5-Step Model:**

\`\`\`mermaid
graph LR
    A[1. Identify Contract] --> B[2. Identify Performance Obligations]
    B --> C[3. Determine Transaction Price]
    C --> D[4. Allocate Price to Obligations]
    D --> E[5. Recognize Revenue]
    
    E --> F{Revenue Type}
    
    F -->|Subscription| G[Recognize Ratably Over Contract Period]
    F -->|Usage-Based| H[Recognize as Services Consumed]
    F -->|Transaction %| I[Recognize as Transactions Processed]
    F -->|Professional Services| J[Recognize Based on Milestones]
    
    style E fill:#3b82f6,color:#fff
    style G fill:#10b981,color:#fff
\`\`\`

### Revenue Recognition by Service Type

| Service Type | Recognition Method | Timing | Example |
|--------------|-------------------|--------|---------|
| **Monthly Subscription** | Ratable over month | Day 1-31 | $2,499/mo recognized as $80.61/day |
| **Annual Subscription (Prepaid)** | Ratable over 12 months | Month 1-12 | $24,000/yr = $2,000/mo |
| **Usage Overages** | Recognize in month consumed | Month-end | 10K overage messages in Jan = recognize in Jan |
| **Transaction % Fees** | Recognize when transaction settles | Daily | $1M processed Jan 15 = recognize Jan 15 |
| **Setup Fees** | Recognize upon service activation | Go-live date | $2,500 setup fee = recognize on day 1 |
| **Professional Services (Fixed Price)** | Percentage of completion | Monthly based on milestones | $50K project, 40% complete = $20K recognized |
| **Professional Services (Time & Materials)** | Recognize as hours worked | Monthly | 100 hours × $200/hr = $20K recognized |

### Deferred Revenue Management

**When Revenue is Deferred:**
- Annual subscriptions paid upfront
- Multi-month contracts
- Setup fees paid before service activation
- Professional services prepaid

**Deferred Revenue Workflow:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Cash_Received: Customer prepayment
    Cash_Received --> Deferred_Revenue: Record liability
    Deferred_Revenue --> Revenue_Recognition: Monthly rateable
    Revenue_Recognition --> Deferred_Revenue: Continue until fully recognized
    Revenue_Recognition --> [*]: Fully recognized
    
    note right of Deferred_Revenue
        Balance Sheet: Liability
        Amortize to Income Statement monthly
    end note
\`\`\`

**Example:**
- Customer pays $24,000 for annual PSP subscription on Jan 1
- **Jan 1:** Debit Cash $24,000, Credit Deferred Revenue $24,000
- **Jan 31:** Debit Deferred Revenue $2,000, Credit Revenue $2,000
- **Feb 28:** Debit Deferred Revenue $2,000, Credit Revenue $2,000
- _Repeat monthly until Dec 31_

### Revenue Reconciliation

**Monthly Close Process:**

**Day 1-3 of Month (for prior month):**
1. Extract usage data from metering engine
2. Calculate all variable fees (usage, transactions)
3. Recognize subscription revenue (ratable)
4. Reconcile invoiced amounts to revenue recognized
5. Investigate discrepancies >$500
6. Adjust journal entries if necessary
7. Close revenue period

**Reconciliation Report:**

| Line Item | Billed Amount | Revenue Recognized | Deferred | Variance |
|-----------|--------------|-------------------|----------|----------|
| PSP Subscriptions | $180,000 | $180,000 | $0 | $0 |
| PSP Transaction Fees | $42,000 | $42,000 | $0 | $0 |
| Annual Subscriptions | $0 | $36,000 | ($36,000) | $0 |
| Professional Services | $15,000 | $9,000 | $6,000 | $0 |
| **TOTAL** | **$237,000** | **$267,000** | **($30,000)** | **$0** |

### Metrics

- Revenue recognition accuracy (target: 100% - zero audit findings)
- Deferred revenue balance reconciliation (target: 100% accuracy)
- Revenue close timeliness (target: by 3rd business day of month)
- ASC 606 compliance score (target: 100%)

---

## SOP-FIN-005: Accounting System Integrations (Xero/QuickBooks)

### Purpose
Automate synchronization of invoices, payments, and financial data to customer accounting systems.

### Integration Architecture

\`\`\`mermaid
graph LR
    A[FTS Billing System] --> B[Integration Hub]
    
    B --> C[Xero API]
    B --> D[QuickBooks API]
    B --> E[Sage API]
    B --> F[NetSuite API]
    
    C --> G[Customer Xero Account]
    D --> H[Customer QuickBooks]
    E --> I[Customer Sage]
    F --> J[Customer NetSuite]
    
    A --> K[Sync Events]
    K --> L[Invoice Created]
    K --> M[Payment Received]
    K --> N[Credit Note Issued]
    
    L --> B
    M --> B
    N --> B
    
    style B fill:#3b82f6,color:#fff
\`\`\`

### Data Mapping Standards

**Invoice Sync to Xero:**

| FTS Field | Xero Field | Mapping Logic |
|-----------|-----------|---------------|
| Invoice Number | Invoice Number | FTS-YYYY-NNNNNN → Direct copy |
| Customer | Contact | Map by email or customer_code |
| Line Items | LineItems Array | Map each service to Xero account code |
| Tax Amount | TaxAmount | Auto-calculate or use FTS calculated |
| Due Date | DueDate | Invoice date + payment terms |
| Status | Status | DRAFT, SUBMITTED, PAID mapping |

**Chart of Accounts Mapping:**

| FTS Revenue Line | Xero Account Code | QuickBooks Account |
|------------------|-------------------|-------------------|
| PSP Subscription Revenue | 4000 | Sales: SaaS Subscriptions |
| PSP Transaction Fees | 4010 | Sales: Transaction Revenue |
| Crypto VASP Revenue | 4020 | Sales: Crypto Services |
| Professional Services | 4030 | Sales: Consulting Revenue |
| Service Marketplace Commissions | 4040 | Sales: Marketplace Revenue |

### Sync Frequency & Error Handling

**Real-Time Events:**
- Invoice created → Sync immediately
- Payment received → Sync within 1 hour
- Invoice voided/credited → Sync immediately

**Batch Sync:**
- Daily reconciliation (11pm UTC)
- Re-sync failed transactions from last 7 days
- Generate sync error report

**Error Handling:**

\`\`\`mermaid
flowchart TD
    A[Sync Event Triggered] --> B[Call Accounting API]
    B --> C{API Response}
    
    C -->|200 Success| D[Mark Synced]
    C -->|4xx Client Error| E[Log Error - Manual Review Required]
    C -->|5xx Server Error| F[Retry Logic]
    C -->|Timeout| F
    
    F --> G{Retry Attempt}
    G -->|Attempt 1| H[Wait 5 min, Retry]
    G -->|Attempt 2| I[Wait 15 min, Retry]
    G -->|Attempt 3| J[Wait 1 hour, Retry]
    G -->|Failed 3x| K[Alert Finance Team]
    
    H --> B
    I --> B
    J --> B
    
    K --> L[Manual Sync Required]
    
    style D fill:#10b981,color:#fff
    style E fill:#f59e0b,color:#fff
    style K fill:#ef4444,color:#fff
\`\`\`

**Error Resolution SLA:**
- Client errors (4xx): Investigate within 4 hours, resolve within 24 hours
- Server errors (5xx): Automatic retry handles 95%, manual review for rest within 24 hours

### Customer Self-Service Accounting

**Features in Customer Portal:**

| Feature | Description | Availability |
|---------|-------------|--------------|
| **Invoice Download** | PDF and CSV export | All tiers |
| **Payment History** | All invoices, payments, credits | All tiers |
| **Usage Export** | Detailed usage data for accounting | Growth+ tiers |
| **Tax Certificates** | VAT/tax exemption certificate upload | All tiers |
| **Accounting Integration** | One-click Xero/QuickBooks connect | Professional+ tiers |

### Metrics

- Accounting sync success rate (target: >98%)
- Sync error resolution time (target: <24 hours)
- Customer adoption of accounting integrations (target: >40% of eligible customers)
- Manual accounting tasks eliminated (target: >80% via automation)

---

## SOP-FIN-006: Billing Dispute Resolution

### Purpose
Handle billing disputes promptly and fairly to maintain customer trust and accurate financial records.

### Dispute Categories & Resolution

| Dispute Type | Frequency | Avg Resolution Time | Customer Fault | FTS Fault |
|--------------|-----------|-------------------|----------------|-----------|
| **Metering Error** | 30% | 2 days | 15% | 85% |
| **Contract Terms Misunderstanding** | 25% | 3 days | 60% | 40% |
| **Service Quality Issues** | 20% | 5 days | 10% | 90% |
| **Tax Calculation Error** | 15% | 1 day | 5% | 95% |
| **Duplicate Billing** | 10% | 1 day | 0% | 100% |

### Dispute Handling Workflow

\`\`\`mermaid
flowchart TD
    A[Customer Disputes Invoice] --> B[Support Ticket Created]
    B --> C[Finance Team Review <24h]
    C --> D{Dispute Valid?}
    
    D -->|Clearly Invalid| E[Provide Explanation + Evidence]
    D -->|Clearly Valid| F[Issue Credit Note Immediately]
    D -->|Requires Investigation| G[Deep Dive Investigation]
    
    E --> H[Customer Accepts]
    E --> I[Customer Escalates]
    
    F --> J[Apply Credit to Next Invoice]
    F --> K[Refund if Requested]
    
    G --> L[Pull Transaction Logs]
    G --> M[Review Contract Terms]
    G --> N[Consult with Service Team]
    
    L --> O[Analysis Complete]
    M --> O
    N --> O
    
    O --> P{Outcome}
    
    P -->|FTS Error| Q[Issue Credit + Apology]
    P -->|Customer Error| R[Explain + Offer Discount Goodwill]
    P -->|Partial Error| S[Issue Partial Credit]
    
    I --> T[VP Finance Review]
    T --> U[Final Decision]
    
    Q --> V[Close Dispute]
    R --> W[Customer Agreement]
    S --> V
    U --> V
    
    W --> V
    
    style F fill:#10b981,color:#fff
    style Q fill:#10b981,color:#fff
    style M fill:#ef4444,color:#fff
\`\`\`

### Credit Note Issuance

**When to Issue Credits:**
- ✅ Metering error confirmed (100% credit)
- ✅ Service outage >2 hours (pro-rated credit)
- ✅ Billing error on FTS side (100% credit)
- ✅ Goodwill gesture for service issues (10-25% credit)

**Credit Note Process:**
1. Finance Manager approves credit (>$500 requires CFO approval)
2. Generate credit note in billing system
3. Sync to accounting system (Xero/QB)
4. Apply to customer account (next invoice or refund)
5. Email customer with credit note PDF
6. Document reason in customer record

**Credit Note Format:**
\`\`\`
CREDIT NOTE #CN-2026-001234
Original Invoice: #FTS-2026-001234
Reason: Metering Error - ISO Gateway overcounted messages
Credit Amount: $450.00
Applied To: Invoice #FTS-2026-001345 (February 2026)
\`\`\`

### Metrics

- Dispute resolution time (target: <3 days average)
- Dispute resolution rate (target: >95% closed within 7 days)
- Credit note issuance rate (target: <2% of invoices)
- Customer satisfaction with dispute handling (target: >4.2/5)
- Escalated disputes (target: <5% require VP/CFO involvement)

---

## SOP-FIN-007: Financial Reporting & Reconciliation

### Purpose
Ensure accurate financial reporting, reconciliation between systems, and audit readiness.

### Daily Reconciliation Checklist

**Performed by:** Treasury team (automated + manual verification)

**Time:** Completed by 10am daily

| Reconciliation | Systems | Tolerance | Action if Variance |
|----------------|---------|-----------|-------------------|
| **Bank Balance** | Bank statements vs FTS treasury module | $0 | Investigate immediately if any discrepancy |
| **Transaction Revenue** | Payment processor vs billing system | <$100 | Investigate within 24h |
| **Deferred Revenue** | Billing system vs general ledger | $0 | Investigate within 4h |
| **AR Balance** | Billing system vs general ledger | $0 | Investigate within 4h |
| **Crypto Holdings** | Striga balance vs ledger | 0.01% | Investigate within 1h (security) |

### Month-End Close Process

\`\`\`mermaid
gantt
    title Month-End Financial Close (Target: Day 3)
    dateFormat YYYY-MM-DD
    
    section Day 1
    Transaction cutoff (midnight)      :milestone, 2026-02-01, 0d
    Extract usage data                 :a1, 2026-02-01, 4h
    Calculate variable fees            :a2, 2026-02-01, 4h
    
    section Day 2
    Generate all invoices              :b1, 2026-02-02, 8h
    Revenue recognition calculation    :b2, 2026-02-02, 8h
    Reconcile to GL                    :b3, 2026-02-02, 4h
    
    section Day 3
    Management review                  :c1, 2026-02-03, 4h
    Finalize month-end entries         :c2, 2026-02-03, 4h
    Close period in accounting system  :milestone, c3, 2026-02-03, 0d
    
    section Day 4-5
    Financial statements               :d1, 2026-02-04, 2d
    Board reporting package            :d2, 2026-02-05, 1d
\`\`\`

**Month-End Checklist:**

- ✅ All transactions processed and settled
- ✅ Invoices generated for all customers
- ✅ Revenue recognized per ASC 606
- ✅ Deferred revenue balance reconciled
- ✅ AR aging report generated
- ✅ Expense accruals recorded
- ✅ Intercompany eliminations (if applicable)
- ✅ Bank reconciliations completed
- ✅ Financial statements reviewed by CFO

### Metrics

- Month-end close time (target: Day 3 of following month)
- Reconciliation accuracy (target: 100% - zero unreconciled variances >$100)
- Audit findings related to revenue (target: 0)
- Financial reporting timeliness (target: board package by Day 5)

---

## Appendix: Billing System Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Usage Metering** | Custom (Kafka + PostgreSQL) | Real-time event aggregation |
| **Billing Engine** | Custom (Node.js) | Invoice generation, revenue recognition |
| **Payment Processing** | Stripe | ACH, card payments, subscriptions |
| **Invoicing** | Custom + Stripe Invoicing | PDF generation, distribution |
| **Accounting Sync** | Custom middleware | Xero/QuickBooks API integration |
| **Tax Calculation** | FTS Tax Engine | 170-country tax automation |
| **Reporting** | Metabase | Financial dashboards, analytics |

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** CFO
- **Review Frequency:** Quarterly
- **Next Review:** April 11, 2026

© 2026 FTS.Money. Confidential - Internal use only.
`;

export default BillingRevenueOperationsSOPs;