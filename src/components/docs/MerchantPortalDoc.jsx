export const MerchantPortalDoc = `
# Merchant Portal Documentation
## Payment Acceptance & Business Management

**Version:** 1.0  
**Last Updated:** December 2025  
**Audience:** Merchants, Business Owners, Finance Teams

---

## Executive Summary

### Purpose
The **Merchant Portal** empowers merchants to accept payments, manage their business finances, view analytics, and access tools for growth—all provided by their PSP (Payment Service Provider) through FTS.Money's infrastructure.

### Key Benefits
- **Accept Payments:** Cards, bank transfers, digital wallets, crypto
- **Real-Time Analytics:** Transaction monitoring, revenue tracking
- **Customer Management:** Database of customers and payment methods
- **Invoicing:** Create and send professional invoices
- **Virtual Terminal:** Process phone/mail orders
- **Subscriptions:** Recurring billing management (if enabled)
- **API Access:** Integrate payments into your website/app (if enabled)

### Merchant Journey

\`\`\`mermaid
journey
    title Merchant Lifecycle with FTS.Money PSP
    section Onboarding
      Apply to PSP: 3: Merchant
      KYB Verification: 2: Merchant, PSP
      Receive Credentials: 5: Merchant
    section Setup
      Login to Portal: 5: Merchant
      Configure Profile: 4: Merchant
      Test Payment: 4: Merchant
    section Operations
      Process Payments: 5: Merchant
      Monitor Transactions: 5: Merchant
      Manage Customers: 4: Merchant
    section Growth
      View Analytics: 5: Merchant
      Optimize Performance: 4: Merchant
      Expand Services: 5: Merchant
\`\`\`

---

## Architecture

### Merchant Portal Structure

\`\`\`mermaid
graph TB
    A[Merchant Portal] --> B[Authentication]
    A --> C[Dashboard]
    A --> D[Modules]
    
    B --> B1[Merchant Code]
    B --> B2[Email/Password]
    B --> B3[2FA Optional]
    
    C --> C1[Today's Stats]
    C --> C2[Recent Transactions]
    C --> C3[Quick Actions]
    
    D --> D1[Transactions]
    D --> D2[Customers]
    D --> D3[Virtual Terminal]
    D --> D4[Invoicing]
    D --> D5[Analytics]
    D --> D6[Settings]
    D --> D7[API/Webhooks]
    D --> D8[Subscriptions]
\`\`\`

### Authentication Model

\`\`\`mermaid
sequenceDiagram
    participant M as Merchant
    participant Portal
    participant Auth as merchantAuth
    participant DB as MerchantUser Entity
    
    M->>Portal: Enter Merchant Code + Email + Password
    Portal->>Auth: Authenticate
    Auth->>DB: Query MerchantUser
    DB-->>Auth: User Record (with psp_code)
    Auth->>Auth: Verify Password
    Auth-->>Portal: Session Token
    Portal->>Portal: Store Session
    Portal-->>M: Redirect to Dashboard
    
    Note over Portal: All subsequent requests<br/>include psp_code for<br/>multi-tenant isolation
\`\`\`

**Session Data:**
\`\`\`javascript
{
  "user_id": "mu_123",
  "merchant_id": "merch_456",
  "merchant_code": "ACME_COFFEE",
  "merchant_name": "Acme Coffee Co.",
  "psp_code": "ACMEPAY",  // Critical: Ensures data isolation
  "email": "owner@acmecoffee.com",
  "role": "admin",
  "permissions": ["view_transactions", "process_refunds", "manage_customers"],
  "timestamp": 1735128000000,
  "expires": 1735214400000  // 24 hours
}
\`\`\`

### Data Access Pattern

**All queries filtered by psp_code:**
\`\`\`javascript
// SECURE: Automatic filtering by PSP
const transactions = await base44.entities.Transaction.filter({
  psp_code: session.psp_code,
  merchant_id: session.merchant_id,
  status: "approved"
});

// RESULT: Only sees own PSP's transactions for own merchant
// Cannot access other PSPs' or other merchants' data
\`\`\`

---

## Core Features

### 1. Dashboard

**At-a-Glance Metrics:**
\`\`\`mermaid
graph TB
    A[Merchant Dashboard] --> B[Today's Volume]
    A --> C[Transaction Count]
    A --> D[Success Rate]
    A --> E[Pending Settlements]
    
    B --> F[$2,458]
    C --> G[47 transactions]
    D --> H[98.7%]
    E --> I[$2,340 settling tomorrow]
    
    style B fill:#e3f2fd
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fff3e0
\`\`\`

**Widgets:**
- **Volume Chart:** 7-day trend line
- **Payment Methods Breakdown:** Visa 65%, Mastercard 25%, Amex 10%
- **Recent Transactions:** Last 10 with status
- **Settlement Calendar:** Upcoming payouts
- **Customer Insights:** Top customers, new vs returning
- **Performance Comparison:** This month vs last month

**Quick Actions:**
- Create invoice
- Process virtual terminal payment
- View latest settlement
- Generate report
- Contact support

### 2. Transactions

**Transaction List:**

**Columns:**
| Date | Transaction ID | Customer | Amount | Method | Status | Actions |
|------|----------------|----------|--------|--------|--------|---------|
| Dec 25, 10:30 | txn_001 | John Doe | $45.99 | Visa ••42 | ✅ Approved | View, Refund |
| Dec 25, 10:28 | txn_002 | Jane Smith | $120.00 | MC ••88 | ✅ Approved | View, Refund |
| Dec 25, 10:25 | txn_003 | Bob Johnson | $30.00 | ACH | ⏳ Processing | View |

**Advanced Search:**
\`\`\`mermaid
graph LR
    A[Search Bar] --> B[Transaction ID]
    A --> C[Customer Name/Email]
    A --> D[Amount Range]
    A --> E[Date Range]
    A --> F[Status]
    A --> G[Payment Method]
    
    B --> H[Results]
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
\`\`\`

**Transaction Details:**
\`\`\`
═══════════════════════════════════════
Transaction Details
═══════════════════════════════════════

ID: txn_acme_20251225_001234
Status: ✅ Approved
Date: December 25, 2025 10:30:45 AM

Amount: $45.99 USD
Fees: -$1.63
Net: $44.36

Payment Method: Visa ending in 4242
Auth Code: 123456
RRN: 123456789012

Customer Information:
- Name: John Doe
- Email: john@example.com
- Phone: +1 (555) 123-4567
- IP Address: 203.0.113.42
- Location: San Francisco, CA, USA

Settlement:
Batch #2025-12-26
Estimated Payout: Dec 26, 2025 (Tomorrow)

Actions:
[Refund Full Amount] [Refund Partial] [Email Receipt]
═══════════════════════════════════════
\`\`\`

**Bulk Operations:**
- Export selected (CSV, Excel, PDF)
- Bulk refund (with confirmation)
- Tag transactions (internal notes)
- Generate batch report

### 3. Virtual Terminal

**Purpose:** Accept payments over phone, email, mail order

**Payment Form:**
\`\`\`mermaid
flowchart TD
    A[Virtual Terminal] --> B[Payment Details]
    A --> C[Customer Lookup]
    
    B --> D[Amount Entry]
    B --> E[Payment Method]
    
    E --> F{Method Type}
    F -->|Card| G[Card Number, CVV, Exp]
    F -->|ACH| H[Routing, Account]
    F -->|Crypto| I[Wallet Address]
    
    C --> J[Search Customer DB]
    J --> K{Found?}
    K -->|Yes| L[Load Saved Cards]
    K -->|No| M[Create New Customer]
    
    L --> N[Select Card]
    M --> G
    
    D --> O[Validate]
    G --> O
    H --> O
    I --> O
    
    O --> P{Valid?}
    P -->|Yes| Q[Process Payment]
    P -->|No| R[Show Errors]
    
    Q --> S{Result}
    S -->|Approved| T[Print/Email Receipt]
    S -->|Declined| U[Retry or Cancel]
\`\`\`

**Features:**
- Saved customer database
- Card tokenization (save for future use)
- Receipt generation (PDF + email)
- Recurring payment setup
- Batch processing (multiple payments)

**Use Cases:**
- Phone order payments (MOTO - Mail Order/Telephone Order)
- In-person payments (if no physical terminal)
- Manual subscription billing
- Payment plan collection

### 4. Customer Management

**Customer Database:**
\`\`\`javascript
{
  "customer_id": "cust_123",
  "merchant_id": "merch_456",
  "psp_code": "ACMEPAY",
  "email": "john@example.com",
  "name": "John Doe",
  "phone": "+1-555-123-4567",
  "country": "US",
  "lifetime_value": 450.99,
  "total_transactions": 12,
  "first_purchase": "2025-01-15",
  "last_purchase": "2025-12-25",
  "saved_cards": [
    {
      "token": "card_...4242",
      "brand": "visa",
      "last_four": "4242",
      "exp_month": 12,
      "exp_year": 2026
    }
  ],
  "tags": ["VIP", "Recurring"],
  "notes": "Prefers email receipts"
}
\`\`\`

**Customer Actions:**
- View customer profile
- Transaction history
- Saved payment methods
- Send marketing emails (with consent)
- Add internal notes
- Tag customers (segment)
- Export customer list

### 5. Invoicing

**Invoice Creation:**
\`\`\`mermaid
flowchart TD
    A[Create Invoice] --> B[Customer Selection]
    B --> C{Existing Customer?}
    C -->|Yes| D[Load Customer Data]
    C -->|No| E[Enter New Customer]
    
    D --> F[Add Line Items]
    E --> F
    
    F --> G[Product/Service]
    G --> H[Quantity × Price]
    H --> I[Calculate Total]
    
    I --> J[Add Tax/Discount]
    J --> K[Set Due Date]
    K --> L[Payment Instructions]
    
    L --> M[Preview Invoice]
    M --> N{Approve?}
    N -->|Yes| O[Generate PDF]
    N -->|No| F
    
    O --> P[Send Email]
    O --> Q[Download PDF]
    O --> R[Create Payment Link]
\`\`\`

**Invoice Template:**
\`\`\`
════════════════════════════════════════════════
                  INVOICE

Acme Coffee Co.
123 Main Street, San Francisco, CA 94102
support@acmecoffee.com | (555) 123-4567
════════════════════════════════════════════════

Invoice #: INV-2025-001234
Date: December 25, 2025
Due: January 25, 2026

Bill To:
John Doe
john@example.com

────────────────────────────────────────────────
Item                    Qty    Price     Amount
────────────────────────────────────────────────
Premium Subscription     1    $29.99    $29.99
Setup Fee                1    $50.00    $50.00
────────────────────────────────────────────────
                              Subtotal:  $79.99
                              Tax (8%):   $6.40
                              TOTAL:     $86.39
════════════════════════════════════════════════

Payment Link: https://pay.acmecoffee.com/inv/001234

Thank you for your business!
\`\`\`

**Invoice Status Tracking:**
- Draft → Sent → Viewed → Paid → Overdue
- Automatic reminders (1 day before, on due date, 3 days after)
- Partial payment support
- Write-off for uncollectible

### 6. Analytics & Reports

**Key Metrics:**
\`\`\`mermaid
graph TB
    A[Analytics Dashboard] --> B[Revenue Metrics]
    A --> C[Customer Metrics]
    A --> D[Operational Metrics]
    
    B --> B1[Gross Revenue]
    B --> B2[Net Revenue after Fees]
    B --> B3[Revenue by Period]
    B --> B4[Revenue by Product]
    
    C --> C1[Total Customers]
    C --> C2[New vs Returning]
    C --> C3[Customer LTV]
    C --> C4[Churn Rate]
    
    D --> D1[Success Rate]
    D --> D2[Decline Reasons]
    D --> D3[Avg Transaction Size]
    D --> D4[Payment Method Mix]
\`\`\`

**Visualization Types:**
- Line charts (revenue trends)
- Bar charts (monthly comparison)
- Pie charts (payment method breakdown)
- Heatmaps (transaction time patterns)
- Cohort analysis (customer retention)

**Report Types:**
- Daily transaction summary
- Weekly revenue report
- Monthly statement
- Tax report (sales tax collected)
- Custom reports (date range, filters)

**Export Formats:**
- CSV (import to Excel, accounting software)
- Excel (formatted with charts)
- PDF (printable statements)

### 7. Settlement & Payouts

**Settlement Schedule:**
\`\`\`mermaid
gantt
    title Merchant Settlement Timeline
    dateFormat YYYY-MM-DD
    
    section Transactions
    Dec 25 Transactions    :a1, 2025-12-25, 1d
    
    section Processing
    Batch Settlement       :a2, 2025-12-26, 1d
    
    section Payout
    Bank Transfer (T+1)    :milestone, 2025-12-26, 0d
    Funds Available        :milestone, 2025-12-27, 0d
\`\`\`

**Settlement Options:**
- **T+1 (Standard):** Funds in 1 business day (free)
- **T+0 (Instant):** Funds in hours (premium fee: 1%)
- **Weekly:** Batch payouts every Friday (volume merchants)
- **Monthly:** Consolidated payout (lower transaction volume)

**Payout Details:**
\`\`\`
Settlement Batch #2025-12-26
Status: Processing
Expected Arrival: December 27, 2025

Transactions: 47
Gross Amount: $2,458.32
Fees: -$87.45
Refunds: -$30.00
Chargebacks: $0.00
Reserves: $0.00
───────────────────
Net Payout: $2,340.87

Destination:
Bank of America
Account: •••• 5678
Routing: 026009593
\`\`\`

**Hold & Reserve Management:**
- New merchant reserve (10% for 90 days)
- Chargeback reserve (calculated by risk level)
- Rolling reserve (released after 180 days)
- Manual holds (fraud investigation)

### 8. Payment Methods

**Accepted Methods (Configurable by PSP):**

\`\`\`mermaid
mindmap
  root((Payment Methods))
    Credit Cards
      Visa
      Mastercard
      American Express
      Discover
    Debit Cards
      Visa Debit
      Mastercard Debit
    Bank Transfers
      ACH US
      SEPA EU
      SWIFT International
    Digital Wallets
      Apple Pay
      Google Pay
      PayPal
    Buy Now Pay Later
      Klarna
      Afterpay
      Affirm
    Cryptocurrency
      Bitcoin
      Ethereum
      USDC Stablecoin
\`\`\`

**Method-Specific Settings:**
- Minimum/maximum amounts
- Enable/disable per method
- Custom fees (if allowed by PSP)
- Preferred routing

### 9. Customer Insights

**Customer Analytics:**

**Segmentation:**
\`\`\`mermaid
pie title Customer Segments
    "VIP (>$1000)" : 15
    "Regular ($100-$1000)" : 45
    "Occasional (<$100)" : 30
    "One-Time" : 10
\`\`\`

**Metrics Tracked:**
- Customer Lifetime Value (LTV)
- Average Order Value (AOV)
- Purchase frequency
- Days since last purchase
- Preferred payment method
- Geographic distribution

**Customer Journey Mapping:**
\`\`\`
Acquisition → First Purchase → Repeat Purchase → VIP → Churn
     ↓             ↓                ↓              ↓       ↓
  Marketing    Welcome Email   Loyalty Reward   Special  Win-back
   Spend         Sent            Program        Offers   Campaign
\`\`\`

### 10. Subscriptions & Recurring Billing

**Subscription Management:**

\`\`\`mermaid
graph TB
    A[Subscriptions] --> B[Create Plan]
    A --> C[Manage Subscribers]
    A --> D[Track Revenue]
    
    B --> E[Plan Details]
    E --> F[Billing Cycle]
    E --> G[Amount]
    E --> H[Trial Period]
    
    C --> I[Active Subs]
    C --> J[Past Due]
    C --> K[Cancelled]
    
    D --> L[MRR Monthly Recurring]
    D --> M[ARR Annual Recurring]
    D --> N[Churn Rate]
\`\`\`

**Plan Configuration:**
\`\`\`javascript
{
  "plan_id": "plan_premium",
  "name": "Premium Monthly",
  "amount": 29.99,
  "currency": "USD",
  "interval": "month",
  "interval_count": 1,
  "trial_period_days": 14,
  "features": [
    "Unlimited access",
    "Priority support",
    "Advanced analytics"
  ],
  "total_subscribers": 247,
  "monthly_recurring_revenue": 7407.53
}
\`\`\`

**Subscriber Management:**
- View all subscriptions (active, trial, cancelled)
- Pause subscription (retain customer)
- Change plan (upgrade/downgrade)
- Apply discount/coupon
- Manual billing (charge immediately)
- Cancel subscription

**Dunning Management:**
- Failed payment retry schedule
- Customer email notifications
- Card expiration alerts
- Automatic card updater

### 11. Invoicing System

**Invoice Workflow:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Sent: Send to Customer
    Sent --> Viewed: Customer Opens Email
    Viewed --> Paid: Payment Received
    Sent --> Overdue: Due Date Passed
    Overdue --> Paid: Late Payment
    Overdue --> WrittenOff: Uncollectible
    Paid --> [*]
    WrittenOff --> [*]
    
    Draft --> Voided: Cancel
    Sent --> Voided: Cancel
    Voided --> [*]
\`\`\`

**Features:**
- Professional PDF invoices
- Hosted payment page (unique link per invoice)
- Email delivery with tracking
- Automatic reminders
- Partial payment support
- Multi-currency
- Custom branding (logo, colors)

**Payment Page:**
\`\`\`
═══════════════════════════════════════════
         Pay Invoice INV-2025-001234
═══════════════════════════════════════════

From: Acme Coffee Co.
Amount Due: $86.39
Due Date: January 25, 2026

[Pay with Card] [Pay with Bank] [Pay with Crypto]

- Or -

[Setup Payment Plan] (Pay in 3 installments)

Powered by ACMEPAY | Secure Payment
\`\`\`

### 12. API & Developer Tools

**API Credentials:**
\`\`\`mermaid
graph TB
    A[API Keys] --> B[Test Keys]
    A --> C[Production Keys]
    
    B --> D[sk_test_...]
    B --> E[Sandbox Mode]
    
    C --> F[sk_live_...]
    C --> G[Live Mode]
    
    D --> H[Unlimited Testing]
    F --> I[Real Transactions]
    
    style B fill:#fff3cd
    style C fill:#d1ecf1
\`\`\`

**API Documentation (Merchant View):**

**Create Payment:**
\`\`\`bash
curl -X POST https://api.acmepay.com/v1/payments \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 4599,
    "currency": "USD",
    "payment_method": {
      "type": "card",
      "card": {
        "number": "4242424242424242",
        "exp_month": 12,
        "exp_year": 2026,
        "cvv": "123"
      }
    },
    "customer": {
      "email": "customer@example.com"
    }
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "id": "txn_123",
  "status": "approved",
  "amount": 4599,
  "currency": "USD",
  "auth_code": "123456",
  "created": "2025-12-25T10:30:00Z"
}
\`\`\`

**Webhook Configuration:**
- Webhook URL entry
- Secret key generation
- Event selection (payment.approved, payment.declined, etc.)
- Delivery monitoring (success rate, retry count)
- Test webhook functionality

### 13. Dispute & Chargeback Management

**Chargeback Notification:**
\`\`\`
🚨 CHARGEBACK ALERT

Transaction: txn_acme_20251125_005432
Amount: $149.99
Card: Visa ••5678
Date: November 25, 2025
Customer: Sarah Johnson

Reason: "Unauthorized transaction"
Reason Code: 10.4 - Fraudulent Transaction

Due Date: January 10, 2026 (15 days)
Action Required: Upload evidence

[View Details] [Upload Evidence] [Accept Chargeback]
\`\`\`

**Evidence Upload:**
\`\`\`mermaid
flowchart LR
    A[Chargeback Details] --> B[Upload Evidence]
    
    B --> C[Proof of Delivery]
    B --> D[Customer Communication]
    B --> E[Terms of Service]
    B --> F[3DS Authentication]
    B --> G[AVS Match Result]
    
    C --> H[Submit to Card Network]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Await Decision]
    I --> J{Result}
    
    J -->|Won| K[Funds Returned]
    J -->|Lost| L[Deduction Confirmed]
\`\`\`

**Chargeback Analytics:**
- Total chargebacks (count, amount)
- Chargeback rate (% of transactions)
- Win rate (% of disputes won)
- Reason code breakdown
- Trend analysis

### 14. Reporting Dashboard

**Report Library:**

**Transaction Reports:**
- Daily transaction summary
- Hourly transaction breakdown
- Declined transaction report (with reasons)
- Refund report
- Void report

**Financial Reports:**
- Revenue summary (gross, net, fees)
- Settlement report
- Payout history
- Fee breakdown
- Tax report (sales tax collected by state)

**Compliance Reports:**
- High-value transaction report (>$10K)
- International transaction report
- Suspicious activity report (SAR)
- Customer due diligence report

**Custom Report Builder:**
- Drag-and-drop interface
- Filter by any field
- Group by merchant, payment method, etc.
- Chart visualization
- Schedule automated delivery

### 15. Settings & Configuration

**Merchant Profile:**
- Business name, logo
- Contact information
- Bank account (for settlements)
- Tax settings
- Timezone & currency

**User Management:**
- Invite staff users
- Assign roles (admin, manager, operator, viewer)
- Set permissions
- Deactivate users

**Notifications:**
- Email preferences (transaction receipts, settlement notices)
- SMS alerts (high-value transactions, fraud alerts)
- Webhook notifications
- Slack integration

**Appearance:**
- Upload logo
- Set brand colors
- Customize email templates
- Payment page branding

**Security:**
- Change password
- Enable 2FA (authenticator app)
- View active sessions
- Revoke API keys

---

## User Workflows

### Workflow 1: Accept First Payment

\`\`\`mermaid
journey
    title First Payment Journey
    section Login
      Navigate to Portal: 5: Merchant
      Enter Credentials: 5: Merchant
      View Dashboard: 5: Merchant
    section Payment
      Click Virtual Terminal: 5: Merchant
      Enter Amount: 5: Merchant
      Enter Card Details: 4: Merchant
      Process Payment: 3: Merchant, System
    section Confirmation
      Payment Approved: 5: System
      Receipt Generated: 5: System
      Email Receipt: 5: Merchant
    section Next Steps
      View in Transactions: 5: Merchant
      Wait for Settlement: 4: Merchant
      Receive Payout: 5: Merchant, Bank
\`\`\`

### Workflow 2: Issue Refund

**Steps:**
1. Navigate to Transactions
2. Search for transaction (by customer email or transaction ID)
3. Click transaction row → Details
4. Click "Refund" button
5. Choose refund type:
   - Full refund
   - Partial refund (enter amount)
6. Select reason (dropdown)
7. Click "Process Refund"
8. Confirm in dialog
9. Refund processed
10. Customer receives email notification
11. Amount deducted from next settlement

### Workflow 3: Create and Send Invoice

**Steps:**
1. Navigate to Invoicing → Click "Create Invoice"
2. Search for customer or create new
3. Add line items (products/services)
4. Enter quantity and prices
5. Add tax (automatic based on location if configured)
6. Set due date
7. Add notes/payment instructions
8. Preview invoice
9. Click "Send Invoice"
10. Customer receives email with payment link
11. Track invoice status (sent → viewed → paid)
12. Payment automatically recorded as transaction

---

## Technical Specifications

### Frontend Technologies
- React 18 (component-based UI)
- Tailwind CSS (responsive design)
- React Query (data fetching)
- Recharts (analytics visualizations)
- React Hook Form (form validation)

### Backend Integration

**Merchant Data API:**
\`\`\`javascript
// All queries automatically scoped to merchant's PSP
import { base44 } from '@/api/base44Client';

// Get merchant session
const session = JSON.parse(localStorage.getItem('merchantSession'));
// session.psp_code ensures data isolation

// Fetch transactions (only this merchant's)
const transactions = await base44.entities.Transaction.filter({
  psp_code: session.psp_code,
  merchant_id: session.merchant_id,
  created_date: { $gte: '2025-12-01' }
});

// Fetch customers
const customers = await base44.entities.Customer.filter({
  psp_code: session.psp_code,
  merchant_id: session.merchant_id
});
\`\`\`

### Performance Metrics
- Page load: <2 seconds
- Transaction list (100 records): <500ms
- Payment processing: <3 seconds
- Report generation: <10 seconds

### Browser Requirements
- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile responsive (iOS Safari, Chrome Mobile)

---

## Security & Compliance

### PCI Compliance (Merchant Responsibility)
- **SAQ A:** If using hosted payment page only
- **SAQ A-EP:** If embedding payment form
- **SAQ D:** If storing card data (not recommended)

**FTS Handles:**
- Card data encryption
- Tokenization
- Secure transmission
- Audit logging

**Merchant Handles:**
- Secure login credentials
- Staff access control
- Physical security (if using virtual terminal)

### Data Protection
- All payment data encrypted
- Limited data retention (configurable by PSP)
- GDPR data export (customer can request)
- Right to deletion (customer can request removal)

---

## Troubleshooting

### Common Issues

**Issue:** Cannot login  
**Solution:** Verify merchant code (provided by PSP), check email is correct, reset password if needed

**Issue:** Payment declined  
**Solution:** Check decline reason (insufficient funds, incorrect CVV, etc.), retry with different card

**Issue:** Missing settlement  
**Solution:** Check settlement schedule (T+1 means next business day), verify bank details correct, contact PSP if delayed

**Issue:** Invoice not received by customer  
**Solution:** Check spam folder, verify email address, resend invoice from portal

---

## Best Practices

### For Merchants
1. **Check Dashboard Daily:** Monitor for unusual activity
2. **Reconcile Weekly:** Match settlements with accounting records
3. **Respond to Chargebacks Quickly:** Upload evidence ASAP
4. **Keep Customer Data Updated:** Improve payment success rate
5. **Use Analytics:** Identify best-performing products/services

### For Finance Teams
1. **Automate Reconciliation:** Export transactions to accounting software
2. **Monitor Churn:** Track subscription cancellations
3. **Optimize Pricing:** Use analytics to test price points
4. **Plan Cash Flow:** Review settlement calendar

---

## Support & Resources

**Help Center:**
- Knowledge base (100+ articles)
- Video tutorials
- FAQ

**Support Channels:**
- Email: support@{psp-domain}.com
- Live chat (Mon-Fri 9am-6pm)
- Phone support (Enterprise merchants only)

**Developer Resources:**
- API documentation
- Code samples (JavaScript, Python, PHP)
- Postman collection
- Webhook testing tools

---

## Roadmap

### Q1 2026
- [ ] Mobile app (iOS & Android)
- [ ] Advanced fraud detection (merchant-level rules)
- [ ] Automated tax calculation (TaxJar integration)

### Q2 2026
- [ ] Multi-location support (chain stores)
- [ ] Employee management (role-based access expansion)
- [ ] Marketplace integrations (WooCommerce, Shopify)

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Owner:** FTS.Money Merchant Success Team
`;