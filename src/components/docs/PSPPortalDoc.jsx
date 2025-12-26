const PSPPortalDoc = `# PSP Portal Documentation
## Payment Service Provider Operations & Management Platform

**Version:** 1.0  
**Classification:** PSP Administrators & Operations Teams  
**Last Updated:** December 26, 2025  
**Document Owner:** FTS.Money PSP Success Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Getting Started](#getting-started)
3. [Dashboard Overview](#dashboard-overview)
4. [Merchant Management](#merchant-management)
5. [Transaction Operations](#transaction-operations)
6. [Payment Routing](#payment-routing)
7. [Risk & Fraud Management](#risk--fraud-management)
8. [Financial Operations](#financial-operations)
9. [Reporting & Analytics](#reporting--analytics)
10. [Compliance & Security](#compliance--security)

---

## Executive Summary

### What is the PSP Portal?

The **PSP Portal** is the operational command center for Payment Service Providers built on the FTS.Money platform. It provides comprehensive tools to manage merchants, process transactions, monitor risk, and ensure compliance.

### Key Capabilities

\`\`\`mermaid
mindmap
  root((PSP Portal))
    Merchant Lifecycle
      Onboarding
      KYB/KYC
      Underwriting
      Account Management
    Transaction Management
      Real-time Processing
      Refunds & Voids
      Chargebacks
      Settlement
    Payment Routing
      Smart Routing
      Failover
      Cost Optimization
      Performance Monitoring
    Risk Management
      Fraud Detection
      3D Secure
      Velocity Checks
      Manual Review Queue
    Financial Operations
      Settlement Reports
      Reconciliation
      Fee Management
      Payout Processing
    Analytics
      Transaction Metrics
      Merchant Performance
      Revenue Reports
      Custom Dashboards
\`\`\`

### Who Uses PSP Portal?

**Primary Users:**
- PSP Administrators
- Operations Managers
- Risk & Compliance Officers
- Finance Team
- Customer Support

**Access Levels:**
- Admin (full access)
- Manager (operations + reports)
- Operator (transaction processing)
- Viewer (read-only)

---

## Getting Started

### First Login

**Step 1: Access Your PSP**

After your PSP is provisioned, you'll receive:
\`\`\`
Portal URL: https://yourpsp.fts.money
Username: admin@yourcompany.com
Temporary Password: [sent via email]
\`\`\`

**Step 2: Set Up Your Account**

1. Log in with temporary credentials
2. Set permanent password (16+ characters)
3. Enable 2FA (Google Authenticator or SMS)
4. Complete profile information
5. Accept Terms of Service

**Step 3: Initial Configuration**

\`\`\`mermaid
flowchart LR
    A[Login] --> B[Set Password]
    B --> C[Enable 2FA]
    C --> D[Configure Branding]
    D --> E[Add Payment Methods]
    E --> F[Set Fee Structure]
    F --> G[Invite Team Members]
    G --> H[Ready to Onboard Merchants]
\`\`\`

### Portal Navigation

**Main Menu Structure:**

\`\`\`
Dashboard
├── Overview
├── Real-time Metrics
└── Quick Actions

Merchants
├── All Merchants
├── Onboarding
├── Pending Approvals
└── Risk Alerts

Transactions
├── All Transactions
├── Search & Filter
├── Batch Processing
└── Failed Transactions

Disputes
├── Chargebacks
├── Retrieval Requests
├── Pre-Arbitration
└── Evidence Management

Settlements
├── Pending Settlements
├── Settlement History
├── Reconciliation
└── Payout Schedule

Risk & Fraud
├── Fraud Alerts
├── Manual Review Queue
├── Risk Rules
└── Blacklist Management

Reports
├── Financial Reports
├── Transaction Reports
├── Merchant Analytics
└── Custom Reports

Settings
├── Company Profile
├── Payment Methods
├── Fee Configuration
├── Team Management
├── API Keys
└── Webhooks
\`\`\`

---

## Dashboard Overview

### Real-Time Metrics

**Primary KPIs:**

\`\`\`mermaid
graph TB
    subgraph "Transaction Metrics"
        A[Transaction Volume<br/>Today: $1.2M]
        B[Transaction Count<br/>Today: 4,523]
        C[Success Rate<br/>98.7%]
        D[Average Ticket<br/>$265]
    end
    
    subgraph "Merchant Metrics"
        E[Active Merchants<br/>327]
        F[Onboarding Pipeline<br/>23]
        G[At-Risk Merchants<br/>5]
        H[Churn This Month<br/>2]
    end
    
    subgraph "Financial Metrics"
        I[Revenue Today<br/>$8,450]
        J[Pending Settlement<br/>$342K]
        K[Chargebacks<br/>0.4%]
        L[Disputes Open<br/>12]
    end
    
    subgraph "System Health"
        M[API Uptime<br/>99.98%]
        N[Avg Response Time<br/>180ms]
        O[Fraud Blocks<br/>23 today]
        P[Manual Reviews<br/>8 pending]
    end
\`\`\`

### Live Transaction Feed

Real-time transaction stream showing:
- Transaction ID
- Merchant name
- Amount & currency
- Payment method
- Status (approved/declined)
- Processing time

**Color Coding:**
- 🟢 Green: Approved
- 🔴 Red: Declined
- 🟡 Yellow: Manual review required
- 🔵 Blue: Pending 3DS authentication

### Quick Actions

Most common operations accessible from dashboard:

\`\`\`
⚡ Quick Actions:
   • Process manual transaction
   • Onboard new merchant
   • Search transaction
   • Generate report
   • Review flagged transaction
   • Issue refund
   • View settlement schedule
\`\`\`

---

## Merchant Management

### Merchant Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [*] --> Application: Submit Application
    Application --> KYB: Verify Business
    KYB --> Underwriting: Risk Assessment
    Underwriting --> Rejected: High Risk
    Underwriting --> Approved: Low/Med Risk
    Approved --> Active: First Transaction
    Active --> Suspended: Policy Violation
    Active --> Closed: Voluntary Closure
    Suspended --> Active: Issue Resolved
    Suspended --> Closed: Termination
    Rejected --> [*]
    Closed --> [*]
    
    note right of Underwriting
        Automated rules +
        Manual review for
        edge cases
    end note
\`\`\`

### Merchant Onboarding

**Onboarding Workflow:**

\`\`\`mermaid
sequenceDiagram
    participant M as Merchant
    participant P as PSP Portal
    participant KYB as KYB Service
    participant Risk as Risk Engine
    participant Admin as PSP Admin
    
    M->>P: Submit Application
    P->>P: Validate Form Data
    P->>KYB: Verify Business Info
    KYB-->>P: Verification Result
    
    alt Verification Failed
        P-->>M: Request Additional Docs
        M->>P: Upload Documents
        P->>KYB: Reverify
    end
    
    P->>Risk: Assess Risk Profile
    Risk->>Risk: Check Industry
    Risk->>Risk: Check Volume
    Risk->>Risk: Check History
    Risk-->>P: Risk Score (0-100)
    
    alt Low Risk (0-30)
        P->>P: Auto-Approve
        P-->>M: Account Activated
    else Medium Risk (31-60)
        P->>Admin: Manual Review Required
        Admin->>P: Approve/Reject
        P-->>M: Decision Notification
    else High Risk (61-100)
        P->>P: Auto-Reject
        P-->>M: Rejection Notice
    end
\`\`\`

**Onboarding Form Fields:**

\`\`\`yaml
business_information:
  legal_business_name: required
  dba_name: optional
  business_type:
    - sole_proprietorship
    - partnership
    - llc
    - corporation
  tax_id: required
  business_registration_number: required
  incorporation_date: required
  website: required
  description: required
  
contact_information:
  primary_contact_name: required
  primary_contact_email: required
  primary_contact_phone: required
  business_address: required
  billing_address: optional
  
processing_details:
  monthly_volume_estimate: required
  average_transaction_size: required
  card_present_percentage: required
  card_not_present_percentage: required
  primary_sales_channel:
    - ecommerce
    - retail
    - moto
    - mobile
  
banking_information:
  bank_name: required
  account_holder_name: required
  account_number: required
  routing_number: required
  account_type:
    - checking
    - savings
    
beneficial_owners:
  - name: required
    title: required
    ownership_percentage: required
    ssn: required
    date_of_birth: required
    address: required
\`\`\`

### KYB Verification

**Verification Checks:**

| Check Type | Data Source | Pass Rate | Processing Time |
|------------|-------------|-----------|-----------------|
| Business Registration | State/Federal DB | 95% | 2-5 minutes |
| Tax ID Validation | IRS/CRA | 98% | Instant |
| Address Verification | USPS/CanPost | 92% | Instant |
| Beneficial Owner ID | ID verification service | 88% | 5-15 minutes |
| Sanctions Screening | OFAC/UN | 99.9% | Instant |
| Credit Check | Business credit bureaus | 90% | 1-2 minutes |

**KYB Workflow:**

\`\`\`mermaid
flowchart TD
    A[Start KYB] --> B{Business<br/>Registered?}
    B -->|Yes| C[Verify Tax ID]
    B -->|No| X[Reject]
    
    C -->|Valid| D[Screen Sanctions]
    C -->|Invalid| X
    
    D -->|Clear| E[Verify Owners]
    D -->|Match Found| X
    
    E -->|All Verified| F[Check Credit]
    E -->|Verification Failed| Y[Manual Review]
    
    F -->|Score > 600| G[Approved]
    F -->|Score < 600| Y
    
    Y -->|Approved| G
    Y -->|Rejected| X
    
    G --> Z[Activate Merchant]
\`\`\`

### Merchant Configuration

**Payment Settings:**

\`\`\`json
{
  "merchant_id": "mer_abc123",
  "payment_methods": {
    "cards": {
      "enabled": true,
      "brands": ["visa", "mastercard", "amex", "discover"],
      "3ds_required": false,
      "3ds_threshold": 100.00
    },
    "ach": {
      "enabled": true,
      "max_amount": 50000.00
    },
    "wallets": {
      "enabled": true,
      "providers": ["apple_pay", "google_pay"]
    }
  },
  "limits": {
    "daily_volume": 100000.00,
    "daily_transactions": 1000,
    "single_transaction_max": 10000.00,
    "single_transaction_min": 1.00
  },
  "risk_settings": {
    "velocity_checks": true,
    "device_fingerprinting": true,
    "fraud_score_threshold": 70
  },
  "settlement": {
    "schedule": "T+2",
    "minimum_balance": 10.00,
    "bank_account_id": "ba_xyz789"
  }
}
\`\`\`

**Fee Structure:**

\`\`\`
Fee Configuration for Merchant: ABC Store

Card Transactions:
  Visa/MC Debit:      2.2% + $0.10
  Visa/MC Credit:     2.5% + $0.15
  American Express:   3.0% + $0.20
  Discover:           2.5% + $0.15
  
ACH Transactions:
  Standard ACH:       0.8% + $0.50 (max $5.00)
  Same-day ACH:       1.2% + $0.75 (max $10.00)
  
Digital Wallets:
  Apple Pay:          2.5% + $0.15
  Google Pay:         2.5% + $0.15
  
Additional Fees:
  Chargeback fee:     $15.00 per chargeback
  Monthly minimum:    $25.00
  Refund fee:         $0.00 (free)
  Batch fee:          $0.00 (free)
\`\`\`

### Merchant Monitoring

**Health Indicators:**

\`\`\`mermaid
graph LR
    A[Merchant Health] --> B[Transaction Success]
    A --> C[Chargeback Rate]
    A --> D[Average Ticket]
    A --> E[Volume Trend]
    
    B --> B1{> 95%?}
    B1 -->|Yes| B2[🟢 Healthy]
    B1 -->|No| B3[🔴 At Risk]
    
    C --> C1{< 1%?}
    C1 -->|Yes| C2[🟢 Healthy]
    C1 -->|No| C3[🔴 At Risk]
    
    D --> D1{Growing?}
    D1 -->|Yes| D2[🟢 Healthy]
    D1 -->|No| D3[🟡 Watch]
    
    E --> E1{Increasing?}
    E1 -->|Yes| E2[🟢 Healthy]
    E1 -->|No| E3[🟡 Watch]
\`\`\`

---

## Transaction Operations

### Processing Flow

\`\`\`mermaid
sequenceDiagram
    participant C as Customer
    participant M as Merchant
    participant PSP as PSP Portal
    participant Proc as Payment Processor
    participant Bank as Issuing Bank
    
    C->>M: Initiate Purchase
    M->>PSP: POST /v1/payments
    PSP->>PSP: Validate Request
    PSP->>PSP: Check Merchant Limits
    PSP->>PSP: Run Fraud Checks
    
    alt Fraud Detected
        PSP-->>M: Declined (Fraud)
        M-->>C: Payment Failed
    else Clean Transaction
        PSP->>Proc: Forward to Processor
        Proc->>Bank: Authorization Request
        Bank->>Bank: Check Balance
        Bank->>Bank: Check Fraud Rules
        
        alt Insufficient Funds
            Bank-->>Proc: Declined
            Proc-->>PSP: Declined
            PSP-->>M: Payment Failed
            M-->>C: Payment Failed
        else Approved
            Bank-->>Proc: Approved + Auth Code
            Proc-->>PSP: Approved
            PSP->>PSP: Log Transaction
            PSP->>PSP: Queue for Settlement
            PSP-->>M: Success + Transaction ID
            M-->>C: Order Confirmed
        end
    end
\`\`\`

### Transaction States

\`\`\`mermaid
stateDiagram-v2
    [*] --> Initiated
    Initiated --> Processing: Submit
    Processing --> Approved: Success
    Processing --> Declined: Rejected
    Processing --> Failed: Error
    Approved --> Captured: Capture
    Approved --> Voided: Void
    Captured --> Settled: Settlement
    Captured --> Refunded: Refund (Full)
    Captured --> PartialRefund: Refund (Partial)
    PartialRefund --> Settled: Settlement
    Settled --> Chargeback: Dispute Filed
    Chargeback --> ChargebackWon: Won
    Chargeback --> ChargebackLost: Lost
    Declined --> [*]
    Failed --> [*]
    Voided --> [*]
    ChargebackWon --> [*]
    ChargebackLost --> [*]
\`\`\`

### Manual Transaction Entry

**Virtual Terminal:**

\`\`\`
┌─────────────────────────────────────────┐
│  Virtual Terminal - Manual Entry        │
├─────────────────────────────────────────┤
│                                         │
│  Merchant: [ABC Store ▼]               │
│                                         │
│  Transaction Type: [Sale ▼]            │
│    • Sale                               │
│    • Auth Only                          │
│    • Capture                            │
│    • Refund                             │
│                                         │
│  Amount: [$______.__]  Currency: [USD] │
│                                         │
│  Card Information:                      │
│    Card Number: [____-____-____-____]  │
│    Exp Date: [MM/YY]  CVV: [___]       │
│    Cardholder: [________________]      │
│                                         │
│  Billing Address:                       │
│    Street: [_____________________]     │
│    City: [_______________]             │
│    State: [__]  ZIP: [_____]           │
│                                         │
│  ☑ Send receipt to customer            │
│    Email: [_____________________]      │
│                                         │
│  [Cancel]          [Process Payment]    │
└─────────────────────────────────────────┘
\`\`\`

### Refund Processing

**Refund Types:**

| Type | Description | Processing Time | Fee |
|------|-------------|-----------------|-----|
| Full Refund | 100% of original amount | 5-10 business days | $0 |
| Partial Refund | Custom amount (< original) | 5-10 business days | $0 |
| Instant Refund | Push to debit (select processors) | Minutes | $1 |

**Refund Workflow:**

\`\`\`mermaid
flowchart LR
    A[Refund Request] --> B{Amount Valid?}
    B -->|No| X[Reject]
    B -->|Yes| C{Original Txn<br/>Settled?}
    C -->|No| D[Void Transaction]
    C -->|Yes| E[Process Refund]
    D --> F[Update Records]
    E --> F
    F --> G[Notify Merchant]
    G --> H[Notify Customer]
    H --> I[Complete]
\`\`\`

### Batch Processing

**Daily Settlement Batch:**

\`\`\`
Batch ID: BATCH-20250126-001
Status: Closed
Close Time: 2025-01-26 23:59:59 UTC

Summary:
  Total Transactions: 4,523
  Total Amount: $1,204,567.89
  
Breakdown:
  Sales:           4,234 txns   $1,187,234.56
  Refunds:           234 txns      $15,432.11
  Chargebacks:        12 txns       $1,901.22
  Fees:                            -$33,615.78
  
Net Settlement: $1,170,952.11

Settlement Date: 2025-01-28 (T+2)
Payout Method: ACH
Bank Account: ****6789
\`\`\`

---

## Payment Routing

### Smart Routing Engine

**Routing Logic:**

\`\`\`mermaid
flowchart TD
    A[Transaction Request] --> B{Amount > $1000?}
    B -->|Yes| C[High-Value Route]
    B -->|No| D{Customer Country}
    
    D -->|US| E{Card Type}
    D -->|EU| F[EU Processor]
    D -->|Other| G[Global Processor]
    
    E -->|Debit| H[Low-cost Processor A]
    E -->|Credit| I[Processor B]
    
    C --> J{3DS Required?}
    J -->|Yes| K[3DS-enabled Processor]
    J -->|No| L[Premium Processor]
    
    H --> M[Process]
    I --> M
    F --> M
    G --> M
    K --> M
    L --> M
    
    M --> N{Success?}
    N -->|Yes| O[Complete]
    N -->|No| P[Failover Logic]
    P --> Q[Secondary Processor]
    Q --> M
\`\`\`

**Routing Rules Configuration:**

\`\`\`json
{
  "routing_rules": [
    {
      "rule_id": "rule_001",
      "name": "High-value US transactions",
      "priority": 1,
      "conditions": {
        "amount": { "$gte": 1000 },
        "currency": "USD",
        "card_country": "US"
      },
      "routes": {
        "primary": "processor_premium",
        "fallback": ["processor_standard", "processor_backup"]
      },
      "retry_logic": {
        "max_attempts": 3,
        "delay_ms": 1000
      }
    },
    {
      "rule_id": "rule_002",
      "name": "EU debit cards",
      "priority": 2,
      "conditions": {
        "card_type": "debit",
        "card_country": ["DE", "FR", "IT", "ES", "NL"]
      },
      "routes": {
        "primary": "processor_eu_debit",
        "fallback": ["processor_eu_standard"]
      }
    },
    {
      "rule_id": "rule_003",
      "name": "Cost optimization",
      "priority": 10,
      "conditions": {
        "amount": { "$lt": 50 }
      },
      "routes": {
        "primary": "processor_low_cost",
        "fallback": ["processor_standard"]
      },
      "cost_savings_target": 0.15
    }
  ]
}
\`\`\`

### Processor Performance

**Performance Dashboard:**

| Processor | Success Rate | Avg Response Time | Daily Volume | Cost per Txn | Status |
|-----------|--------------|-------------------|--------------|--------------|--------|
| Stripe | 98.5% | 185ms | $234K | $0.08 | 🟢 Healthy |
| Adyen | 98.2% | 210ms | $178K | $0.09 | 🟢 Healthy |
| Checkout.com | 97.8% | 195ms | $145K | $0.07 | 🟡 Degraded |
| Worldpay | 99.1% | 230ms | $89K | $0.12 | 🟢 Healthy |
| Fiserv | 96.5% | 280ms | $56K | $0.11 | 🔴 Issues |

### Failover Configuration

**Automatic Failover:**

\`\`\`yaml
failover_policy:
  enabled: true
  
  triggers:
    - type: timeout
      threshold_ms: 5000
      action: switch_processor
      
    - type: error_rate
      threshold_percentage: 10
      window_minutes: 5
      action: switch_processor
      
    - type: processor_down
      action: immediate_switch
  
  processor_priority:
    - name: processor_primary
      weight: 70
      
    - name: processor_secondary
      weight: 20
      fallback_for: [processor_primary]
      
    - name: processor_tertiary
      weight: 10
      fallback_for: [processor_primary, processor_secondary]
  
  cooldown_period_minutes: 15
  max_switches_per_hour: 3
\`\`\`

---

## Risk & Fraud Management

### Fraud Detection System

\`\`\`mermaid
graph TB
    A[Transaction] --> B[Risk Engine]
    
    B --> C[Device Fingerprint]
    B --> D[Velocity Checks]
    B --> E[Geolocation]
    B --> F[Behavioral Analysis]
    B --> G[Machine Learning Model]
    
    C --> H[Risk Score<br/>0-100]
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I{Score < 30?}
    I -->|Yes| J[Auto-Approve]
    
    H --> K{Score 30-70?}
    K -->|Yes| L[3DS Challenge]
    L --> M{3DS Pass?}
    M -->|Yes| J
    M -->|No| N[Decline]
    
    H --> O{Score > 70?}
    O -->|Yes| P[Manual Review]
    P --> Q{Approve?}
    Q -->|Yes| J
    Q -->|No| N
\`\`\`

### Risk Rules

**Velocity Rules:**

\`\`\`javascript
// Example velocity rules
const velocityRules = [
  {
    rule_id: "vel_001",
    name: "Max cards per email (1 hour)",
    condition: {
      unique_cards: { $gt: 3 },
      timeframe: "1 hour",
      groupBy: "email"
    },
    action: "decline",
    reason: "Multiple cards same email"
  },
  {
    rule_id: "vel_002",
    name: "Max attempts per card (24 hours)",
    condition: {
      attempts: { $gt: 5 },
      timeframe: "24 hours",
      groupBy: "card_number"
    },
    action: "block_card",
    duration: "7 days"
  },
  {
    rule_id: "vel_003",
    name: "Max amount per IP (1 hour)",
    condition: {
      total_amount: { $gt: 5000 },
      timeframe: "1 hour",
      groupBy: "ip_address"
    },
    action: "manual_review"
  }
];
\`\`\`

### Manual Review Queue

**Review Interface:**

\`\`\`
┌────────────────────────────────────────────────────┐
│  Manual Review Queue               [ 8 Pending ]   │
├────────────────────────────────────────────────────┤
│                                                    │
│  Transaction: TXN-2025-0126-4523                  │
│  Amount: $2,450.00 USD                            │
│  Merchant: ABC Electronics                         │
│  Customer: john.doe@email.com                     │
│  Card: ****4242 (Visa)                            │
│                                                    │
│  Risk Score: 75 🔴 High                           │
│  Flagged Reasons:                                 │
│    • First transaction from this email            │
│    • High-value transaction                       │
│    • IP geolocation mismatch                      │
│    • Device fingerprint unknown                   │
│                                                    │
│  Customer Information:                            │
│    Name: John Doe                                 │
│    Email: john.doe@email.com                      │
│    Phone: +1-555-123-4567                         │
│    Billing: 123 Main St, New York, NY 10001      │
│    IP Address: 203.0.113.42 (New York, US)       │
│                                                    │
│  Transaction History:                             │
│    Previous transactions: 0                       │
│    Previous declines: 0                           │
│    Account age: < 1 hour                          │
│                                                    │
│  Reviewer Notes:                                  │
│  [_______________________________________]        │
│  [_______________________________________]        │
│                                                    │
│  Actions:                                         │
│  [Approve]  [Decline]  [Request More Info]       │
│                                                    │
└────────────────────────────────────────────────────┘
\`\`\`

### 3D Secure 2.0

**3DS Flow:**

\`\`\`mermaid
sequenceDiagram
    participant C as Customer
    participant M as Merchant
    participant PSP as PSP
    participant 3DS as 3DS Server
    participant Issuer as Issuer Bank
    
    C->>M: Submit Payment
    M->>PSP: Payment Request
    PSP->>3DS: Initiate 3DS
    3DS->>PSP: Request Device Info
    PSP->>C: Collect Device Data
    C->>PSP: Device Fingerprint
    PSP->>3DS: Send Fingerprint
    
    3DS->>Issuer: Risk Assessment
    Issuer->>Issuer: Analyze Risk
    
    alt Low Risk - Frictionless
        Issuer-->>3DS: Approved (No Challenge)
        3DS-->>PSP: 3DS Success
        PSP->>M: Process Payment
    else Medium Risk - Challenge
        Issuer-->>3DS: Challenge Required
        3DS-->>PSP: Challenge URL
        PSP->>C: Redirect to Challenge
        C->>Issuer: Complete Challenge (OTP/Biometric)
        Issuer->>Issuer: Verify
        alt Challenge Passed
            Issuer-->>3DS: Approved
            3DS-->>PSP: 3DS Success
            PSP->>M: Process Payment
        else Challenge Failed
            Issuer-->>3DS: Declined
            3DS-->>PSP: 3DS Failed
            PSP->>M: Decline Payment
        end
    else High Risk - Decline
        Issuer-->>3DS: Declined
        3DS-->>PSP: 3DS Failed
        PSP->>M: Decline Payment
    end
\`\`\`

---

## Financial Operations

### Settlement Schedule

\`\`\`mermaid
gantt
    title Settlement Timeline (T+2 Example)
    dateFormat YYYY-MM-DD
    
    section Day 1 (Transaction Date)
    Transactions Processed    :2025-01-24, 1d
    Batch Closed (11:59 PM)   :2025-01-24, 1d
    
    section Day 2 (T+1)
    Settlement Initiated      :2025-01-25, 1d
    Bank Processing           :2025-01-25, 1d
    
    section Day 3 (T+2)
    Funds Available           :2025-01-26, 1d
    Payout Processed          :2025-01-26, 1d
\`\`\`

### Settlement Reports

**Daily Settlement Summary:**

\`\`\`
Settlement Report - January 26, 2025
Merchant: ABC Store (mer_abc123)
Settlement Date: January 28, 2025 (T+2)
Report ID: SETTLE-20250126-ABC123

Transaction Summary:
┌─────────────────────┬──────────┬────────────────┐
│ Type                │ Count    │ Amount         │
├─────────────────────┼──────────┼────────────────┤
│ Sales               │ 1,234    │ $  123,456.78  │
│ Refunds             │    45    │ $   (4,567.89) │
│ Chargebacks         │     2    │ $     (345.00) │
├─────────────────────┼──────────┼────────────────┤
│ Gross Total         │ 1,281    │ $  118,543.89  │
└─────────────────────┴──────────┴────────────────┘

Fee Breakdown:
┌──────────────────────────────┬────────────────┐
│ Description                  │ Amount         │
├──────────────────────────────┼────────────────┤
│ Transaction Fees (2.5%)      │ $  (3,086.14)  │
│ Per-Transaction Fees         │ $    (185.10)  │
│ Chargeback Fees (2 × $15)    │ $     (30.00)  │
│ Monthly Service Fee          │ $     (25.00)  │
├──────────────────────────────┼────────────────┤
│ Total Fees                   │ $  (3,326.24)  │
└──────────────────────────────┴────────────────┘

Net Settlement:
┌──────────────────────────────┬────────────────┐
│ Gross Total                  │ $  118,543.89  │
│ Less: Fees                   │ $   (3,326.24) │
│ Less: Reserves (10%)         │ $  (11,521.76) │
├──────────────────────────────┼────────────────┤
│ Net Payout                   │ $  103,695.89  │
└──────────────────────────────┴────────────────┘

Payout Details:
  Bank: Wells Fargo ****6789
  Method: ACH
  Expected: January 28, 2025
  Status: Pending
\`\`\`

### Reconciliation

**Automated Reconciliation:**

\`\`\`sql
-- Reconciliation query example
WITH processor_data AS (
  SELECT 
    transaction_date,
    COUNT(*) AS txn_count,
    SUM(amount) AS total_amount
  FROM processor_settlements
  WHERE settlement_date = '2025-01-26'
  GROUP BY transaction_date
),
psp_data AS (
  SELECT 
    transaction_date,
    COUNT(*) AS txn_count,
    SUM(amount) AS total_amount
  FROM transactions
  WHERE settlement_date = '2025-01-26'
  GROUP BY transaction_date
)
SELECT 
  p.transaction_date,
  p.txn_count AS processor_count,
  psp.txn_count AS psp_count,
  p.txn_count - psp.txn_count AS count_diff,
  p.total_amount AS processor_amount,
  psp.total_amount AS psp_amount,
  p.total_amount - psp.total_amount AS amount_diff,
  CASE 
    WHEN ABS(p.total_amount - psp.total_amount) < 0.01 
    THEN '✓ Matched'
    ELSE '✗ Discrepancy'
  END AS status
FROM processor_data p
LEFT JOIN psp_data psp ON p.transaction_date = psp.transaction_date;
\`\`\`

---

## Reporting & Analytics

### Pre-Built Reports

**Financial Reports:**
- Daily/Weekly/Monthly transaction summary
- Revenue by payment method
- Fee analysis
- Settlement reconciliation
- Merchant profitability

**Transaction Reports:**
- Transaction detail export
- Declined transaction analysis
- Approval rate trends
- Average ticket size
- Peak transaction times

**Merchant Reports:**
- Merchant performance ranking
- Onboarding pipeline
- Churn analysis
- Risk score distribution
- Active vs inactive merchants

**Compliance Reports:**
- PCI DSS compliance status
- Failed transaction audit
- High-risk transaction log
- Refund/chargeback rates
- KYB verification status

### Custom Reports

**Report Builder Interface:**

\`\`\`
┌────────────────────────────────────────────┐
│  Custom Report Builder                     │
├────────────────────────────────────────────┤
│                                            │
│  Report Name: [____________________]      │
│  Description: [____________________]      │
│                                            │
│  Data Source: [Transactions ▼]            │
│                                            │
│  Date Range:                               │
│    From: [01/01/2025]  To: [01/31/2025]   │
│                                            │
│  Filters:                                  │
│    Merchant: [All Merchants ▼]           │
│    Status: [☑ Approved ☑ Declined]       │
│    Amount: Min: [$__] Max: [$____]        │
│                                            │
│  Columns:                                  │
│    ☑ Transaction Date                     │
│    ☑ Merchant Name                        │
│    ☑ Amount                               │
│    ☑ Payment Method                       │
│    ☑ Status                               │
│    ☑ Fee Amount                           │
│                                            │
│  Group By: [Merchant ▼]                   │
│  Sort By: [Amount Desc ▼]                 │
│                                            │
│  Output Format:                            │
│    ○ CSV  ○ Excel  ● PDF                  │
│                                            │
│  Schedule:                                 │
│    ○ One-time  ● Daily  ○ Weekly          │
│    Recipients: [___________________]      │
│                                            │
│  [Cancel]  [Preview]  [Save & Run]        │
└────────────────────────────────────────────┘
\`\`\`

---

## Compliance & Security

### PCI DSS Requirements

**Merchant Compliance:**

\`\`\`mermaid
graph TB
    A[PCI DSS Compliance] --> B[Level 4<br/>< 1M txns/year]
    A --> C[Level 3<br/>1M-6M txns/year]
    A --> D[Level 2<br/>> 6M txns/year]
    
    B --> B1[SAQ A<br/>Redirect to PSP]
    B --> B2[SAQ A-EP<br/>E-commerce]
    B --> B3[SAQ D<br/>All others]
    
    C --> C1[SAQ Required]
    C --> C2[Quarterly ASV Scan]
    
    D --> D1[Annual Onsite Audit]
    D --> D2[Quarterly ASV Scan]
    D --> D3[Attestation of Compliance]
\`\`\`

### Security Controls

**Access Control:**

\`\`\`yaml
security_controls:
  authentication:
    - password_complexity: 16_characters_min
    - multi_factor_auth: required
    - session_timeout: 30_minutes
    - failed_login_lockout: 5_attempts
    - password_rotation: 90_days
    
  authorization:
    - role_based_access_control: enabled
    - principle_of_least_privilege: enforced
    - segregation_of_duties: enabled
    
  encryption:
    - data_at_rest: AES_256
    - data_in_transit: TLS_1_3
    - card_tokenization: PCI_DSS_compliant
    - database_encryption: enabled
    
  monitoring:
    - security_information_event_management: splunk
    - intrusion_detection: enabled
    - vulnerability_scanning: weekly
    - penetration_testing: quarterly
\`\`\`

---

## Conclusion

The PSP Portal provides comprehensive tools for managing all aspects of payment service provider operations. From merchant onboarding to transaction processing, risk management, and financial operations—everything you need is in one place.

**Key Benefits:**

1. **Efficiency:** Automate routine tasks
2. **Control:** Fine-grained configuration
3. **Visibility:** Real-time monitoring
4. **Compliance:** Built-in adherence
5. **Growth:** Scale seamlessly

**Support Resources:**

- Documentation: https://docs.fts.money/psp-portal
- Support: support@fts.money
- Status: https://status.fts.money
- Community: https://community.fts.money

---

**Document Information**

- **Version:** 1.0
- **Last Updated:** December 26, 2025
- **Status:** Active
- **Classification:** PSP Administrators
- **Owner:** PSP Success Team
- **Contact:** psp-support@fts.money

© 2025 FTS.Money. All rights reserved.`;

export default PSPPortalDoc;