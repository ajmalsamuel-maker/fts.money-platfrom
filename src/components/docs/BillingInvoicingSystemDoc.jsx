const BillingInvoicingSystemDoc = `# Unified Billing & Invoicing System
## Multi-Service Revenue Operations Platform

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Internal - Finance & Operations Teams

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Usage Metering Engine](#usage-metering-engine)
4. [Invoice Generation Center](#invoice-generation-center)
5. [Unified Billing Dashboard](#unified-billing-dashboard)
6. [Master Pricing Management](#master-pricing-management)
7. [Service Pricing Configuration](#service-pricing-configuration)
8. [Payment Processing & Dunning](#payment-processing--dunning)
9. [Accounting Integrations](#accounting-integrations)
10. [Tax Calculation Integration](#tax-calculation-integration)

---

## Executive Summary

### The Multi-Service Billing Challenge

FTS.Money operates 10+ distinct service platforms (PSP, VASP, ISO Gateway, Orchestration, RWA, Tax Management, E-Invoicing, etc.), each with unique pricing models:
- **Subscription-based**: Monthly/annual recurring fees
- **Usage-based**: Per-transaction, per-message, per-asset fees
- **Hybrid**: Base subscription + usage overages
- **Tiered**: Starter, Professional, Enterprise with different limits

**Traditional Approach Problems:**
- ❌ Separate billing system per service (10+ invoices per customer)
- ❌ Manual usage aggregation (error-prone, time-consuming)
- ❌ Disconnected pricing configurations (inconsistent margins)
- ❌ Complex reconciliation across services
- ❌ Poor customer experience (multiple bills, confusing)

### The Unified Billing Solution

\`\`\`mermaid
graph TB
    subgraph "Multi-Service Usage"
        S1[PSP Service<br/>$999/mo + txns]
        S2[ISO Gateway<br/>$499/mo + messages]
        S3[Orchestration<br/>$299/mo + routing]
        S4[Crypto VASP<br/>$2,500/mo + KYC]
        S5[RWA Platform<br/>$5,000/mo + assets]
    end
    
    subgraph "Unified Billing Engine"
        METER[Usage Metering<br/>Real-time tracking]
        AGGR[Aggregation Engine<br/>Consolidate by customer]
        CALC[Calculation Engine<br/>Subscription + Usage]
        GEN[Invoice Generator<br/>Multi-service consolidation]
    end
    
    subgraph "Single Output"
        INV[One Consolidated Invoice<br/>All services itemized<br/>One payment]
    end
    
    S1 --> METER
    S2 --> METER
    S3 --> METER
    S4 --> METER
    S5 --> METER
    
    METER --> AGGR
    AGGR --> CALC
    CALC --> GEN
    GEN --> INV
    
    style METER fill:#3b82f6,color:#fff
    style INV fill:#10b981,color:#fff
\`\`\`

**Key Benefits:**
- ✅ **Single Invoice**: One bill for all services
- ✅ **Real-Time Metering**: Accurate usage tracking
- ✅ **Automated Calculation**: No manual billing work
- ✅ **Transparent Breakdowns**: Line items per service
- ✅ **Integrated Tax**: VAT/GST calculated automatically
- ✅ **Accounting Sync**: Export to Xero/QuickBooks
- ✅ **Customer Self-Service**: View usage and invoices anytime

---

## System Architecture

### Complete Billing Stack

\`\`\`mermaid
graph TB
    subgraph "Data Collection Layer"
        T1[Transactions]
        M1[Messages]
        R1[Routing Events]
        A1[Asset Operations]
        K1[KYC Verifications]
        C1[Card Issuances]
    end
    
    subgraph "Metering Layer"
        METER1[PSP Usage Meter<br/>Txn count/volume]
        METER2[ISO Usage Meter<br/>Message count]
        METER3[Orch Usage Meter<br/>Route count]
        METER4[RWA Usage Meter<br/>Asset/trade fees]
        METER5[Crypto Usage Meter<br/>KYC/cards/exchanges]
    end
    
    subgraph "Aggregation Layer"
        AGG[Customer Aggregator<br/>Group by email/ID]
        PERIOD[Billing Period Manager<br/>Monthly/quarterly cycles]
        QUOTA[Quota Monitor<br/>Included vs overage]
    end
    
    subgraph "Pricing Layer"
        CONFIG[Service Billing Config<br/>Per-service settings]
        MASTER[Master Pricing<br/>Buy/sell rates]
        TIERS[Platform Pricing<br/>Tier definitions]
        RULES[Billing Rules<br/>Custom pricing logic]
    end
    
    subgraph "Calculation Layer"
        SUB[Subscription Calculator<br/>Base fees]
        USAGE[Usage Calculator<br/>Overages + per-unit]
        TAX[Tax Calculator<br/>VAT/GST integration]
        TOTAL[Total Calculator<br/>Subtotal + tax]
    end
    
    subgraph "Invoice Layer"
        TEMPLATE[Invoice Templates<br/>Multi-service layout]
        GEN[Invoice Generator<br/>Line item builder]
        SIGN[Digital Signature<br/>E-invoice compliant]
        PDF[PDF Generator<br/>Visual invoice]
    end
    
    subgraph "Delivery Layer"
        EMAIL[Email Delivery<br/>PDF attachment]
        PORTAL[Customer Portal<br/>Self-service view]
        API[API Webhook<br/>ERP integration]
        ACCOUNT[Accounting Sync<br/>Xero/QB export]
    end
    
    subgraph "Payment Layer"
        CHARGE[Auto-Charge<br/>Card on file]
        RETRY[Retry Logic<br/>Failed payments]
        DUNNING[Dunning System<br/>Payment reminders]
        STATUS[Payment Status<br/>Tracking]
    end
    
    T1 --> METER1
    M1 --> METER2
    R1 --> METER3
    A1 --> METER4
    K1 --> METER5
    C1 --> METER5
    
    METER1 --> AGG
    METER2 --> AGG
    METER3 --> AGG
    METER4 --> AGG
    METER5 --> AGG
    
    AGG --> PERIOD
    PERIOD --> QUOTA
    
    QUOTA --> CONFIG
    CONFIG --> MASTER
    CONFIG --> TIERS
    CONFIG --> RULES
    
    MASTER --> SUB
    TIERS --> SUB
    RULES --> USAGE
    
    SUB --> TAX
    USAGE --> TAX
    TAX --> TOTAL
    
    TOTAL --> TEMPLATE
    TEMPLATE --> GEN
    GEN --> SIGN
    SIGN --> PDF
    
    PDF --> EMAIL
    PDF --> PORTAL
    GEN --> API
    GEN --> ACCOUNT
    
    TOTAL --> CHARGE
    CHARGE --> RETRY
    RETRY --> DUNNING
    DUNNING --> STATUS
    
    style METER1 fill:#3b82f6,color:#fff
    style AGG fill:#8b5cf6,color:#fff
    style TOTAL fill:#f59e0b,color:#fff
    style GEN fill:#10b981,color:#fff
\`\`\`

### Data Flow - Transaction to Invoice

\`\`\`mermaid
sequenceDiagram
    participant Txn as Transaction Event
    participant Meter as Usage Meter
    participant Agg as Aggregator
    participant Calc as Calculator
    participant Invoice as Invoice Gen
    participant Customer
    
    Note over Txn,Customer: Real-Time Usage Tracking
    
    Txn->>Meter: Transaction completed
    Meter->>Meter: Increment counter
    Meter->>Meter: Add to volume
    Meter->>Meter: Check quota
    
    alt Over Included Quota
        Meter->>Meter: Calculate overage units
        Meter->>Meter: Update estimated charge
    end
    
    Note over Txn,Customer: End of Billing Period
    
    Meter->>Agg: Period end trigger
    Agg->>Agg: Group meters by customer
    Agg->>Agg: Sum usage across services
    
    Agg->>Calc: Calculate charges
    Calc->>Calc: Base subscription fees
    Calc->>Calc: Usage overage fees
    Calc->>Calc: Apply discounts (FIX score)
    Calc->>Calc: Calculate tax
    
    Calc->>Invoice: Generate invoice
    Invoice->>Invoice: Create line items per service
    Invoice->>Invoice: Apply invoice template
    Invoice->>Invoice: Generate PDF
    
    Invoice->>Customer: Email invoice + PDF
    Invoice->>Customer: Post to portal
    
    Customer->>Invoice: View invoice
    Customer->>Invoice: Download PDF
    Customer->>Invoice: Pay invoice
\`\`\`

---

## Usage Metering Engine

### Purpose & Architecture

**URL:** https://platform.fts.money/UsageMeteringEngine

The Usage Metering Engine tracks real-time consumption of metered services, calculating usage against included quotas and determining overage charges.

### Metering Data Model

**Entity:** UsageMeter

\`\`\`yaml
usage_meter_schema:
  customer_identification:
    customer_email: "customer@example.com"
    customer_type: "psp, merchant, iso_customer, orchestration_customer, crypto_customer, rwa_provider"
    service_type: "psp_payment_processing, iso_gateway, orchestration, crypto_vasp, rwa_tokenization"
    metric_type: "transaction, iso_message, orchestration_route, wallet_creation, kyc_verification, token_deployment"
    
  billing_period:
    current_period_start: "2026-01-01"
    current_period_end: "2026-01-31"
    reset_frequency: "monthly"
    last_reset_date: "2026-01-01T00:00:00Z"
    next_reset_date: "2026-02-01T00:00:00Z"
    
  usage_tracking:
    current_usage_count: 52347 # Number of units used
    current_usage_volume: 5234567.89 # Dollar volume (if applicable)
    included_units: 50000 # Included in subscription
    overage_units: 2347 # Usage beyond included
    
  pricing:
    unit_price: 0.02 # Price per overage unit
    estimated_charge: 46.94 # Overage units × unit price
    
  history:
    usage_history: [
      {date: "2026-01-01", count: 1234, volume: 123456},
      {date: "2026-01-02", count: 1456, volume: 145678},
      ...
    ]
\`\`\`

### Metering Logic by Service

**PSP Payment Processing:**
\`\`\`javascript
// Meter PSP transactions
async function meterPSPTransaction(transaction) {
  const meter = await getMeter({
    customer_email: transaction.psp_email,
    service_type: 'psp_payment_processing',
    metric_type: 'transaction'
  });
  
  // Increment counters
  meter.current_usage_count += 1;
  meter.current_usage_volume += transaction.amount;
  
  // Calculate overage
  if (meter.current_usage_count > meter.included_units) {
    meter.overage_units = meter.current_usage_count - meter.included_units;
    meter.estimated_charge = meter.overage_units * meter.unit_price;
  }
  
  // Update history (daily aggregation)
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = meter.usage_history.find(h => h.date === today) || 
    { date: today, count: 0, volume: 0 };
  todayEntry.count += 1;
  todayEntry.volume += transaction.amount;
  
  await saveMeter(meter);
}
\`\`\`

**ISO Gateway Messages:**
\`\`\`javascript
// Meter ISO Gateway messages
async function meterISOMessage(message) {
  const meter = await getMeter({
    customer_email: message.customer_email,
    service_type: 'iso_gateway',
    metric_type: 'iso_message'
  });
  
  meter.current_usage_count += 1;
  
  if (meter.current_usage_count > meter.included_units) {
    meter.overage_units = meter.current_usage_count - meter.included_units;
    meter.estimated_charge = meter.overage_units * meter.unit_price;
  }
  
  await saveMeter(meter);
}
\`\`\`

**Crypto VASP Services:**
\`\`\`javascript
// Meter crypto services (multiple types)
async function meterCryptoService(event) {
  const meters = {
    kyc: 'kyc_verification',
    card: 'card_issuance',
    wallet: 'wallet_creation',
    exchange: 'crypto_exchange'
  };
  
  const meter = await getMeter({
    customer_email: event.customer_email,
    service_type: 'crypto_vasp',
    metric_type: meters[event.type]
  });
  
  if (event.type === 'exchange') {
    // Volume-based metering for exchanges
    const feePercentage = 0.015; // 1.5%
    meter.current_usage_volume += event.amount;
    meter.estimated_charge = meter.current_usage_volume * feePercentage;
  } else {
    // Count-based metering for KYC, cards, wallets
    meter.current_usage_count += 1;
    meter.estimated_charge = meter.current_usage_count * meter.unit_price;
  }
  
  await saveMeter(meter);
}
\`\`\`

### Meter Reset Logic

\`\`\`mermaid
flowchart TD
    A[Daily Scheduler<br/>02:00 UTC] --> B{Check Meters}
    
    B --> C{Reset Due?}
    C -->|No| D[Skip]
    C -->|Yes| E[Reset Meter]
    
    E --> F[Archive Current Period]
    F --> G[Create History Record]
    G --> H[Reset Counters to 0]
    H --> I[Set New Period Dates]
    
    I --> J{Generate Invoice?}
    J -->|Yes| K[Trigger Invoice Generation]
    J -->|No| L[Continue Metering]
    
    K --> M[Invoice Created]
    M --> N[Email Customer]
    
    style E fill:#f59e0b,color:#fff
    style K fill:#10b981,color:#fff
\`\`\`

**Reset Schedule:**

| Service | Reset Frequency | Included Units | Overage Calculation | Invoice Timing |
|---------|----------------|----------------|---------------------|----------------|
| PSP Platform | Monthly | 1K-50K txns | $0.02-$0.05 per txn | End of month |
| ISO Gateway | Monthly | 10K-100K msgs | $0.01-$0.05 per msg | End of month |
| Orchestration | Monthly | 10K-100K routes | $0.005-$0.02 per route | End of month |
| Crypto VASP | Monthly | Varies by feature | Per-feature pricing | End of month |
| RWA Platform | Monthly | Varies | Per-asset, per-trade | End of month |

---

## Invoice Generation Center

### Purpose & Features

**URL:** https://platform.fts.money/InvoiceGenerationCenter

The Invoice Generation Center consolidates usage data from all services into unified, professional invoices ready for customer delivery and accounting system export.

### Multi-Service Consolidation Logic

\`\`\`mermaid
graph TB
    subgraph "Input: Customer's Active Services"
        M1[PSP Meter<br/>52K txns, 50K included<br/>2K overage]
        M2[ISO Gateway Meter<br/>28K messages, 20K included<br/>8K overage]
        M3[Orchestration Meter<br/>45K routes, 45K included<br/>0 overage]
        M4[Crypto VASP<br/>247 KYC checks<br/>15 cards issued]
    end
    
    subgraph "Pricing Lookup"
        P1[Get PSP Pricing<br/>$999 base + $0.02/txn overage]
        P2[Get ISO Pricing<br/>$999 base + $0.02/msg overage]
        P3[Get Orch Pricing<br/>$999 base, no overage]
        P4[Get Crypto Pricing<br/>$2,500 base + per-unit fees]
    end
    
    subgraph "Line Item Calculation"
        L1[PSP Line Item<br/>$999 + $40 overage = $1,039]
        L2[ISO Line Item<br/>$999 + $160 overage = $1,159]
        L3[Orch Line Item<br/>$999 base = $999]
        L4[Crypto Line Items<br/>$2,500 + $1,235 + $120 = $3,855]
    end
    
    subgraph "Invoice Assembly"
        SUBTOTAL[Subtotal: $7,052]
        TAX[Tax: $564.16<br/>8% sales tax]
        TOTAL[Total: $7,616.16]
    end
    
    subgraph "Output"
        INV[Consolidated Invoice<br/>INV-2026-001234<br/>Due: Feb 15, 2026]
    end
    
    M1 --> P1
    M2 --> P2
    M3 --> P3
    M4 --> P4
    
    P1 --> L1
    P2 --> L2
    P3 --> L3
    P4 --> L4
    
    L1 --> SUBTOTAL
    L2 --> SUBTOTAL
    L3 --> SUBTOTAL
    L4 --> SUBTOTAL
    
    SUBTOTAL --> TAX
    TAX --> TOTAL
    TOTAL --> INV
    
    style SUBTOTAL fill:#3b82f6,color:#fff
    style INV fill:#10b981,color:#fff
\`\`\`

### Invoice Line Items Structure

**Entity:** ConsolidatedInvoice

\`\`\`json
{
  "invoice_number": "INV-2026-001234",
  "customer_email": "customer@example.com",
  "customer_type": "psp",
  "billing_period_start": "2026-01-01",
  "billing_period_end": "2026-01-31",
  
  "line_items": [
    {
      "service_type": "psp_payment_processing",
      "description": "PSP Professional - Monthly Subscription",
      "quantity": 1,
      "unit_price": 999.00,
      "amount": 999.00
    },
    {
      "service_type": "psp_payment_processing",
      "description": "Transaction Overage (2,000 × $0.02)",
      "quantity": 2000,
      "unit_price": 0.02,
      "amount": 40.00,
      "usage_details": {
        "included": 50000,
        "used": 52000,
        "overage": 2000
      }
    },
    {
      "service_type": "iso_gateway",
      "description": "ISO Gateway Professional - Monthly Subscription",
      "quantity": 1,
      "unit_price": 999.00,
      "amount": 999.00
    },
    {
      "service_type": "iso_gateway",
      "description": "Message Overage (8,000 × $0.02)",
      "quantity": 8000,
      "unit_price": 0.02,
      "amount": 160.00
    },
    {
      "service_type": "orchestration",
      "description": "Orchestration Professional - Monthly Subscription",
      "quantity": 1,
      "unit_price": 999.00,
      "amount": 999.00
    },
    {
      "service_type": "crypto_vasp",
      "description": "Crypto VASP Starter - Monthly Subscription",
      "quantity": 1,
      "unit_price": 2500.00,
      "amount": 2500.00
    },
    {
      "service_type": "crypto_vasp",
      "description": "KYC Verifications (247 × $5.00)",
      "quantity": 247,
      "unit_price": 5.00,
      "amount": 1235.00
    },
    {
      "service_type": "crypto_vasp",
      "description": "Card Issuance (15 × $8.00)",
      "quantity": 15,
      "unit_price": 8.00,
      "amount": 120.00
    }
  ],
  
  "subtotal": 7052.00,
  "tax_amount": 564.16,
  "total_amount": 7616.16,
  "currency": "USD",
  "status": "sent",
  "due_date": "2026-02-15",
  "services_included": [
    "psp_payment_processing",
    "iso_gateway",
    "orchestration",
    "crypto_vasp"
  ]
}
\`\`\`

### Invoice Template System

\`\`\`mermaid
graph LR
    A[Invoice Data] --> B{Select Template}
    
    B --> C[Standard Template<br/>Default layout]
    B --> D[Custom Template<br/>Company branded]
    B --> E[Tax Invoice Template<br/>VAT compliant]
    B --> F[E-Invoice Template<br/>XML + PDF]
    
    C --> G[Populate Data]
    D --> G
    E --> G
    F --> G
    
    G --> H[Company Logo]
    G --> I[Invoice Header]
    G --> J[Line Items Table]
    G --> K[Tax Breakdown]
    G --> L[Payment Terms]
    G --> M[Footer]
    
    H --> N[Generate PDF]
    I --> N
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Digital Signature<br/>For e-invoices]
    O --> P[Final Invoice]
    
    style B fill:#8b5cf6,color:#fff
    style N fill:#10b981,color:#fff
\`\`\`

---

## Unified Billing Dashboard

### Purpose & Features

**URL:** https://platform.fts.money/UnifiedBillingDashboard

Real-time view of billing operations across all services with filtering, analytics, and action capabilities.

### Dashboard Sections

\`\`\`mermaid
graph TB
    subgraph "Overview Tab"
        KPI1[Total Revenue<br/>$4.2M MTD]
        KPI2[Pending Revenue<br/>$890K outstanding]
        KPI3[Collection Rate<br/>94.2%]
        KPI4[Overdue Amount<br/>$245K]
        
        CHART1[Revenue Trend<br/>Line chart]
        CHART2[Revenue by Service<br/>Pie chart]
        CHART3[Revenue by Customer Type<br/>Bar chart]
    end
    
    subgraph "Invoices Tab"
        SEARCH[Search & Filter<br/>By customer, status, date]
        TABLE[Invoice List<br/>Sortable table]
        ACTIONS[Quick Actions<br/>Mark paid, resend, void]
        EXPORT[Export<br/>CSV, Excel, PDF]
    end
    
    subgraph "Analytics Tab"
        METRICS[Billing Metrics<br/>ARPU, churn, LTV]
        COHORT[Cohort Analysis<br/>Retention by signup month]
        FORECAST[Revenue Forecast<br/>Predictive analytics]
    end
    
    subgraph "AR Aging Tab"
        AGING[Accounts Receivable Aging<br/>Current, 30, 60, 90+ days]
        DUNNING_Q[Dunning Queue<br/>Payment reminders needed]
        COLLECTIONS[Collections Dashboard<br/>Recovery strategies]
    end
    
    KPI1 --> CHART1
    KPI2 --> CHART2
    KPI3 --> CHART3
    
    SEARCH --> TABLE
    TABLE --> ACTIONS
    TABLE --> EXPORT
    
    style KPI1 fill:#10b981,color:#fff
    style TABLE fill:#3b82f6,color:#fff
\`\`\`

### Key Metrics Calculations

**Revenue Metrics:**

| Metric | Calculation | Purpose | Target |
|--------|-------------|---------|--------|
| **Total Revenue** | SUM(invoice.total_amount WHERE status IN ('sent', 'paid')) | Current month revenue | - |
| **Pending Revenue** | SUM(invoice.total_amount WHERE status = 'sent') | Outstanding AR | - |
| **Collection Rate** | (Paid / Total Due) × 100 | Payment effectiveness | >95% |
| **Overdue Amount** | SUM(invoice.total_amount WHERE due_date < today AND status != 'paid') | Collections priority | <5% |
| **Days Sales Outstanding (DSO)** | (AR / Revenue) × Days | Cash flow health | <30 days |
| **Monthly Recurring Revenue (MRR)** | SUM(subscriptions.monthly_fee) | Predictable revenue | Growing |
| **Annual Contract Value (ACV)** | MRR × 12 | Customer lifetime value | - |

**AR Aging Calculation:**

\`\`\`javascript
function calculateARAgingBuckets(invoices) {
  const today = new Date();
  
  const aging = {
    current: 0,      // 0-30 days
    days_30: 0,      // 31-60 days
    days_60: 0,      // 61-90 days
    days_90_plus: 0  // 90+ days
  };
  
  invoices.filter(inv => inv.status !== 'paid').forEach(invoice => {
    const daysOld = Math.floor((today - new Date(invoice.due_date)) / (1000 * 60 * 60 * 24));
    const amount = invoice.total_amount;
    
    if (daysOld <= 30) aging.current += amount;
    else if (daysOld <= 60) aging.days_30 += amount;
    else if (daysOld <= 90) aging.days_60 += amount;
    else aging.days_90_plus += amount;
  });
  
  return aging;
}
\`\`\`

---

## Master Pricing Management

### Purpose & Architecture

**URL:** https://platform.fts.money/MasterPricingManagement

Master Pricing defines buy rates (what FTS pays providers) and sell rates (what FTS charges customers) for all revenue-generating items across the platform.

### Pricing Item Categories

\`\`\`mermaid
graph TB
    subgraph "Payment Infrastructure"
        PAY1[Card Processing<br/>Visa/MC/Amex]
        PAY2[ACH/SEPA<br/>Bank transfers]
        PAY3[Digital Wallets<br/>Apple/Google Pay]
        PAY4[Crypto Processing<br/>BTC/ETH/USDC]
    end
    
    subgraph "Message Services"
        MSG1[ISO 8583 Translation<br/>Card messages]
        MSG2[ISO 20022 Translation<br/>Banking messages]
        MSG3[SWIFT MT Translation<br/>Wire messages]
    end
    
    subgraph "Compliance Services"
        COMP1[KYC Individual<br/>Identity verification]
        COMP2[KYB Business<br/>Company verification]
        COMP3[AML Screening<br/>Sanctions/PEP]
        COMP4[LEI Verification<br/>GLEIF lookup]
    end
    
    subgraph "Platform Fees"
        PLAT1[Setup Fees<br/>Onboarding]
        PLAT2[Monthly Hosting<br/>Infrastructure]
        PLAT3[Storage Fees<br/>Data retention]
        PLAT4[Support Fees<br/>Premium support]
    end
    
    subgraph "Master Pricing Entry"
        MASTER[Master Pricing Item<br/>Buy: $X<br/>Sell: $Y<br/>Margin: Z%]
    end
    
    PAY1 --> MASTER
    MSG1 --> MASTER
    COMP1 --> MASTER
    PLAT1 --> MASTER
    
    style MASTER fill:#f59e0b,color:#fff
\`\`\`

### Pricing Entry Example

**Entity:** MasterPricing

\`\`\`yaml
master_pricing_example:
  item_id: "kyc_individual_basic"
  service_type: "compliance_service"
  category: "kyc_verification"
  item_name: "Individual KYC - Basic Level"
  
  provider_information:
    provider_name: "Jumio"
    provider_contract_ref: "JUMIO-2024-001"
    
  buy_rate:
    buy_rate_type: "per_unit"
    buy_rate_fixed: 3.00
    currency: "USD"
    notes: "Per verification, volume discount at 1K+/month"
    
  sell_rate:
    sell_rate_type: "per_unit"
    sell_rate_fixed: 5.00
    currency: "USD"
    
  margin:
    margin_amount: 2.00
    margin_percentage: 66.67
    
  status: "active"
  effective_date: "2026-01-01"
  
  usage_tracking:
    total_volume: 15234 # Units processed
    total_revenue: 76170 # $5 × 15,234
    total_cost: 45702 # $3 × 15,234
    gross_profit: 30468
\`\`\`

### Buy/Sell Rate Models

| Rate Model | Description | Example Use Case | Margin Calculation |
|------------|-------------|------------------|-------------------|
| **Per Unit** | Fixed price per item | KYC checks, card issuance | Sell - Buy |
| **Percentage** | % of transaction value | Payment processing, crypto exchange | (Sell % - Buy %) × Amount |
| **Hybrid** | Fixed + Percentage | Card transactions (2.9% + $0.30) | Complex formula |
| **Tiered** | Volume-based pricing | High-volume discounts | Per-tier calculation |
| **Monthly Flat** | Fixed monthly fee | SaaS subscriptions | Monthly sell - costs |

---

## Service Pricing Configuration

### Purpose & Scope

**URL:** https://platform.fts.money/ServicePricingConfiguration

Service Pricing Configuration defines tier-specific pricing and feature limits for each FTS.Money service, controlling what customers get at each subscription level.

### Service Configuration Dashboard

\`\`\`mermaid
graph TB
    subgraph "Service Selection"
        S1[PSP Payment Processing]
        S2[ISO Gateway]
        S3[Orchestration]
        S4[Crypto VASP]
        S5[RWA Platform]
        S6[Tax Management]
        S7[E-Invoicing]
    end
    
    subgraph "Tier Configuration"
        T1[Starter Tier<br/>Entry level]
        T2[Growth Tier<br/>Scaling businesses]
        T3[Professional Tier<br/>Established companies]
        T4[Enterprise Tier<br/>Large organizations]
    end
    
    subgraph "Configuration Fields"
        F1[Setup Fee]
        F2[Monthly Hosting Fee]
        F3[Included Units]
        F4[Overage Pricing]
        F5[Feature Limits]
        F6[SLA Uptime]
        F7[Support Level]
    end
    
    S1 --> T1
    S1 --> T2
    S1 --> T3
    S1 --> T4
    
    T1 --> F1
    T1 --> F2
    T1 --> F3
    T1 --> F4
    T1 --> F5
    T1 --> F6
    T1 --> F7
    
    style S1 fill:#3b82f6,color:#fff
    style T3 fill:#10b981,color:#fff
\`\`\`

### Platform Tier Comparison Matrix

**Entity:** PlatformPricingConfig

| Feature | Starter | Growth | Professional | Enterprise |
|---------|---------|--------|--------------|------------|
| **Setup Fee** | $2,500 | $2,500 | $2,500 | Waived |
| **Monthly Hosting** | $499 | $999 | $2,499 | $9,999 |
| **Included Txns (PSP)** | 1,000 | 10,000 | 50,000 | Unlimited |
| **Overage Rate** | $0.05 | $0.03 | $0.02 | $0.01 |
| **Max Merchants** | 5 | 50 | Unlimited | Unlimited |
| **Max Txn Amount** | $10,000 | $50,000 | Unlimited | Unlimited |
| **Enabled Modules** | Basic | Standard | Advanced | All |
| **Support Level** | Email | Priority | Dedicated | 24/7 + Phone |
| **SLA Uptime** | 99.9% | 99.95% | 99.95% | 99.99% |
| **API Rate Limit** | 100/min | 1,000/min | 10,000/min | Custom |

---

## Payment Processing & Dunning

### Automated Payment Flow

\`\`\`mermaid
stateDiagram-v2
    [*] --> Invoice_Generated
    Invoice_Generated --> Payment_Pending
    
    Payment_Pending --> Auto_Charge_Attempt: Due date reached
    
    Auto_Charge_Attempt --> Payment_Success: Charge succeeded
    Auto_Charge_Attempt --> Payment_Failed: Charge failed
    
    Payment_Failed --> Retry_1: Wait 3 days
    Retry_1 --> Payment_Success: Succeeded
    Retry_1 --> Retry_2: Failed
    
    Retry_2 --> Payment_Success: Succeeded
    Retry_2 --> Retry_3: Wait 5 days
    
    Retry_3 --> Payment_Success: Succeeded
    Retry_3 --> Dunning_Level_1: Failed
    
    Dunning_Level_1 --> Dunning_Level_2: 7 days
    Dunning_Level_2 --> Dunning_Level_3: 7 days
    Dunning_Level_3 --> Collections: 7 days
    
    Payment_Success --> Reconciled
    Collections --> Suspended: Account suspended
    
    Reconciled --> [*]
    Suspended --> [*]
    
    note right of Auto_Charge_Attempt
        Card on file charged automatically
        Stripe/payment processor
    end note
    
    note right of Dunning_Level_1
        Email: "Payment failed, please update card"
        Urgency: Low
    end note
    
    note right of Dunning_Level_2
        Email: "Urgent: Payment overdue"
        Urgency: Medium
        Warning: Service may be suspended
    end note
    
    note right of Dunning_Level_3
        Email: "Final notice before suspension"
        Urgency: High
        Action: Update payment or account suspends
    end note
\`\`\`

### Dunning Configuration

**Entity:** PaymentStatus

\`\`\`yaml
dunning_workflow:
  retry_schedule:
    attempt_1:
      delay_days: 3
      email_template: "payment_failed_gentle_reminder"
      urgency: "low"
      
    attempt_2:
      delay_days: 5
      email_template: "payment_failed_second_notice"
      urgency: "medium"
      
    attempt_3:
      delay_days: 7
      email_template: "payment_failed_final_notice"
      urgency: "high"
      warning: "Account will suspend in 7 days"
      
  dunning_levels:
    level_1:
      days_overdue: 7
      action: "Send friendly reminder email"
      tone: "Helpful, assume oversight"
      
    level_2:
      days_overdue: 14
      action: "Send urgent payment request"
      tone: "Firm but professional"
      include: "Payment options and update card link"
      
    level_3:
      days_overdue: 21
      action: "Final notice before suspension"
      tone: "Serious, action required"
      warning: "Services suspend in 7 days"
      escalation: "Account manager notified"
      
    collections:
      days_overdue: 28
      action: "Suspend services"
      effect: "Account access restricted, data retained"
      recovery: "Pay outstanding balance to restore"
\`\`\`

---

## Accounting Integrations

### Supported Systems

**URL:** https://platform.fts.money/AccountingIntegrations

\`\`\`mermaid
graph TB
    subgraph "FTS Billing System"
        INV[Invoices]
        METER[Usage Data]
        PRICING[Pricing Data]
    end
    
    subgraph "Accounting Packages"
        XERO[Xero<br/>Cloud accounting]
        QB[QuickBooks Online<br/>SMB accounting]
        SAGE[Sage Intacct<br/>Enterprise]
        NETSUITE[NetSuite<br/>ERP]
        CUSTOM[Custom ERP<br/>CSV export]
    end
    
    subgraph "Sync Capabilities"
        SYNC1[Invoices<br/>Auto-create]
        SYNC2[Payments<br/>Match & reconcile]
        SYNC3[Customers<br/>Sync profiles]
        SYNC4[Products<br/>Service catalog]
        SYNC5[Tax Codes<br/>VAT mapping]
    end
    
    INV --> XERO
    INV --> QB
    INV --> SAGE
    INV --> NETSUITE
    INV --> CUSTOM
    
    XERO --> SYNC1
    QB --> SYNC1
    SAGE --> SYNC1
    
    SYNC1 --> SYNC2
    SYNC2 --> SYNC3
    SYNC3 --> SYNC4
    SYNC4 --> SYNC5
    
    style XERO fill:#13b5ea,color:#fff
    style QB fill:#2ca01c,color:#fff
    style SAGE fill:#00a652,color:#fff
\`\`\`

### Xero Integration Details

**Sync Workflow:**

\`\`\`mermaid
sequenceDiagram
    participant FTS as FTS Billing System
    participant Xero as Xero API
    participant Match as Reconciliation
    participant Report as Financial Reports
    
    Note over FTS,Report: Invoice Created in FTS
    
    FTS->>FTS: Generate invoice INV-2026-001
    FTS->>Xero: POST /Invoices
    
    Xero->>Xero: Create invoice in Xero
    Xero->>Xero: Assign Xero invoice ID
    Xero-->>FTS: Return invoice ID
    
    FTS->>FTS: Store xero_invoice_id
    
    Note over FTS,Report: Customer Pays Invoice
    
    FTS->>FTS: Record payment in FTS
    FTS->>Xero: POST /Payments
    
    Xero->>Xero: Match payment to invoice
    Xero->>Xero: Mark invoice as PAID
    Xero-->>FTS: Payment confirmed
    
    Note over FTS,Report: Reconciliation
    
    Match->>FTS: Fetch FTS invoices (month)
    Match->>Xero: Fetch Xero invoices (month)
    Match->>Match: Compare invoice numbers
    Match->>Match: Compare amounts
    Match->>Match: Check payment status
    
    alt All Matched
        Match->>Report: ✅ Reconciled
    else Discrepancies Found
        Match->>Report: ⚠️ Review needed
    end
\`\`\`

**Xero Account Code Mapping:**

| FTS Service | Xero Account Code | Account Name | Tax Type |
|-------------|------------------|--------------|----------|
| PSP Subscriptions | 4000 | PSP Recurring Revenue | Tax on Income |
| PSP Usage Fees | 4010 | PSP Usage Revenue | Tax on Income |
| ISO Gateway Subscriptions | 4100 | ISO Gateway Revenue | Tax on Income |
| Orchestration Fees | 4200 | Orchestration Revenue | Tax on Income |
| Crypto VASP Subscriptions | 4300 | Crypto VASP Revenue | Tax on Income |
| Crypto Transaction Fees | 4310 | Crypto Transaction Revenue | Tax on Income |
| RWA Platform Fees | 4400 | RWA Revenue | Tax on Income |
| Marketplace Commissions | 4500 | Service Marketplace Revenue | Tax on Income |

---

## Tax Calculation Integration

### Automatic Tax on Invoices

\`\`\`mermaid
sequenceDiagram
    participant Invoice as Invoice Generator
    participant Tax as Tax Engine
    participant Rate as Tax Rate DB
    participant Calc as Calculator
    participant Output as Final Invoice
    
    Invoice->>Invoice: Calculate subtotal
    Invoice->>Tax: Request tax calculation
    
    Tax->>Tax: Determine jurisdiction
    Note over Tax: Based on customer location<br/>and service type
    
    Tax->>Rate: Get applicable tax rate
    Rate-->>Tax: 8% sales tax (CA, US)
    
    Tax->>Calc: Calculate tax amount
    Calc->>Calc: $7,052 × 8% = $564.16
    
    Calc-->>Tax: Tax amount
    Tax-->>Invoice: Tax details
    
    Invoice->>Invoice: Add tax line item
    Invoice->>Invoice: Calculate total
    Invoice->>Output: Generate invoice
    
    Output->>Output: Subtotal: $7,052.00
    Output->>Output: Tax (8%): $564.16
    Output->>Output: Total: $7,616.16
\`\`\`

**Tax Treatment by Service:**

| Service | Tax Treatment (US) | Tax Treatment (EU) | Reasoning |
|---------|-------------------|-------------------|-----------|
| PSP Hosting | Sales tax (if applicable state) | 20-27% VAT | SaaS subject to tax |
| ISO Gateway | Sales tax | Standard VAT | B2B service |
| Orchestration | Sales tax | Reverse charge (B2B) | B2B service, EU rules |
| Crypto VASP | Varies by state | Varies by country | Complex, often exempt |
| RWA Platform | Sales tax | Standard VAT | Financial service |
| Transaction Fees | Exempt (payment processing) | Often exempt | Financial intermediation |

---

## Invoice Lifecycle Management

### States & Transitions

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Pending: Finalize
    Pending --> Sent: Send to customer
    
    Sent --> Viewed: Customer opened
    Sent --> Paid: Payment received
    Sent --> Overdue: Due date passed
    
    Overdue --> Paid: Late payment
    Overdue --> Dunning_1: 7 days overdue
    
    Dunning_1 --> Paid: Payment
    Dunning_1 --> Dunning_2: 14 days overdue
    
    Dunning_2 --> Paid: Payment
    Dunning_2 --> Dunning_3: 21 days overdue
    
    Dunning_3 --> Paid: Payment
    Dunning_3 --> Collections: 28 days overdue
    
    Collections --> Paid: Recovered
    Collections --> Written_Off: Uncollectible
    
    Sent --> Voided: Customer dispute
    Overdue --> Voided: Error correction
    
    Paid --> Reconciled: Matched in accounting
    Reconciled --> Archived: After retention period
    
    Written_Off --> [*]
    Archived --> [*]
    
    note right of Sent
        Customer has 30 days to pay
        Automatic reminders enabled
    end note
    
    note right of Collections
        Account suspended
        Services restricted
        Payment required to restore
    end note
\`\`\`

---

## Best Practices & Workflows

### Monthly Close Process

\`\`\`markdown
Month-End Close Checklist - Finance Team

□ Day -3 (3 days before month-end):
  □ Review all active usage meters for anomalies
  □ Verify pricing configurations are current
  □ Check for upcoming service changes
  □ Notify customers of end-of-period

□ Day 0 (Month-end at 23:59 UTC):
  □ Automated meter freeze
  □ Usage calculations finalized
  □ Invoice generation queue triggered

□ Day +1 (First day of new month):
  □ Review generated invoices (automated)
  □ Spot-check 10% of invoices for accuracy
  □ Investigate any zero-value invoices
  □ Verify tax calculations
  □ Approve invoice batch for sending

□ Day +2:
  □ Send invoices to customers (automated)
  □ Sync invoices to accounting system
  □ Update revenue dashboard
  □ Generate AR aging report

□ Day +5:
  □ Monitor invoice open rates
  □ Follow up on bounced emails
  □ Answer billing questions

□ Day +15 (Due date):
  □ Process automatic payments
  □ Monitor payment success rate
  □ Start dunning for failed payments

□ Day +30:
  □ Generate month-end reports
  □ Calculate collection rate
  □ Review DSO trend
  □ Plan collections strategy for overdue
\`\`\`

---

## Reporting & Analytics

### Available Reports

| Report Name | Frequency | Format | Recipients | Purpose |
|-------------|-----------|--------|------------|---------|
| **Revenue Summary** | Daily | Email | Finance team | Daily revenue tracking |
| **Invoice Status** | Daily | Dashboard | Operations | Monitor pending/paid |
| **AR Aging** | Weekly | PDF | CFO, Collections | Overdue management |
| **Collection Report** | Weekly | Excel | Collections team | Recovery tracking |
| **Revenue by Service** | Monthly | Dashboard | Executives | Service performance |
| **Customer Lifetime Value** | Monthly | Dashboard | Product team | Customer segmentation |
| **Churn Analysis** | Monthly | Excel | Finance, Product | Retention insights |
| **Gross Margin Analysis** | Monthly | Excel | Finance | Profitability by service |

---

## Conclusion

The Unified Billing & Invoicing System consolidates all FTS.Money service billing into a cohesive, automated platform providing:

✅ **Single consolidated invoice** per customer across all services  
✅ **Real-time usage metering** with automatic overage calculation  
✅ **Automated invoice generation** on monthly/quarterly cycles  
✅ **Integrated tax calculation** with global VAT/sales tax support  
✅ **Payment processing** with retry and dunning workflows  
✅ **Accounting system sync** (Xero, QuickBooks, Sage)  
✅ **Comprehensive reporting** for financial operations  

**Key Metrics:**
- Processes $4.2M+ monthly revenue across 400+ customers
- Generates 500+ consolidated invoices per month
- 94.2% collection rate
- <30 day DSO (Days Sales Outstanding)
- Automated 95% of billing operations

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026
- **Owner:** Finance Operations Team
- **Contact:** finance@fts.money

© 2026 FTS.Money. All rights reserved.
`;

export default BillingInvoicingSystemDoc;