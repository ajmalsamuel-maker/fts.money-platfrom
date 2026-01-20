export const PAYMENT_SWITCH_BUSINESS_MODEL = `# Payment Switch Business Model & White-Labeling Strategy
**FTS.Money - Multi-Tier Payment Infrastructure Monetization**

**Version:** 1.0  
**Date:** January 20, 2026  
**Status:** Strategic Business Architecture

---

## Executive Summary

This document defines the commercial architecture for the FTS.Money Payment Switch, answering critical questions:
- **Who uses the Payment Switch?** (FTS Platform, PSPs, Service Customers)
- **Is it white-labeled?** (Yes, with tiering)
- **How is it packaged differently per customer type?**
- **What's the revenue model?**

**Key Insight:** The Payment Switch operates on **3 distinct tiers** with different use cases, capabilities, and pricing:

1. **Infrastructure Tier** (FTS Platform internal use)
2. **Enterprise Tier** (White-label for PSPs, RWA Providers, large customers)
3. **Managed Service Tier** (Smaller customers via FTS-operated switch)

---

## The Three-Tier Payment Switch Model

\`\`\`mermaid
graph TB
    subgraph "Tier 1: FTS Infrastructure Layer"
        FTS[FTS Platform] -->|Internal Use| Switch1[Payment Switch Core]
        Switch1 --> Stripe1[Master Stripe Account]
        Switch1 --> Adyen1[Master Adyen Account]
        Switch1 --> Circle1[Master Circle Account]
        
        Note1[Purpose: Platform operations<br/>Cost: Infrastructure overhead<br/>Revenue: None direct]
    end
    
    subgraph "Tier 2: White-Label Enterprise"
        PSP1[PSP Customer] -->|Own Instance| Switch2[Dedicated Switch Instance]
        RWA1[RWA Provider] -->|Own Instance| Switch3[Dedicated Switch Instance]
        ISO1[ISO Gateway] -->|Own Instance| Switch4[Dedicated Switch Instance]
        
        Switch2 --> |Own Keys| Provider2A[Provider A]
        Switch2 --> |Own Keys| Provider2B[Provider B]
        
        Note2[Purpose: White-label infrastructure<br/>Cost: License fee + usage<br/>Revenue: $2K-10K/mo + 0.05%]
    end
    
    subgraph "Tier 3: Managed Service"
        SmallPSP[Small PSP] -->|Shared Access| Switch5[FTS-Managed Switch]
        SmallRWA[Small RWA] -->|Shared Access| Switch5
        SmallISO[Small ISO] -->|Shared Access| Switch5
        
        Switch5 --> |FTS Master Keys| SharedProviders[Shared Provider Pool]
        
        Note3[Purpose: Turnkey payment routing<br/>Cost: Per-transaction markup<br/>Revenue: 0.2-0.5% per txn]
    end
\`\`\`

---

## Tier 1: FTS Platform Infrastructure Use

### Use Case
FTS.Money **internally** uses the Payment Switch for:
- PSP provisioning payments (customer pays to activate PSP instance)
- Service subscription billing (monthly SaaS fees)
- Loyalty program settlements (member payouts)
- Platform invoicing (collect from enterprise customers)
- Carbon credit purchases (NANO platform)

### Architecture
\`\`\`yaml
deployment:
  type: internal_only
  access: fts_platform_services_only
  providers: master_accounts
  keys: fts_owned_credentials
  
configuration:
  providers:
    - stripe: master_account (FTS owns)
    - adyen: master_account (FTS owns)
    - circle: master_account (FTS owns)
    - wise: master_account (FTS owns)
  
  routing_rules:
    - platform_operations: lowest_cost
    - invoicing: reliability_first
    - carbon_credits: crypto_preferred
\`\`\`

### Cost Structure
- **Infrastructure Cost:** $2,500/month (AWS + provider fees)
- **Revenue:** $0 (internal operations)
- **Purpose:** Enable platform functionality

### Example Transactions
\`\`\`
1. PSP Provisioning Payment:
   Customer → Stripe (FTS master) → FTS Revenue
   Amount: $5,000 setup fee
   Cost: $145 (2.9%)
   Net: $4,855

2. Monthly SaaS Subscription:
   PSP Customer → Stripe (FTS master) → FTS Revenue
   Amount: $2,000/month
   Cost: $58 (2.9%)
   Net: $1,942
\`\`\`

**Key Point:** FTS is a **user** of the Payment Switch but doesn't sell it at this tier - it's purely for internal operations.

---

## Tier 2: White-Label Enterprise (Self-Hosted Switch)

### Who Gets This?
- **Large PSPs** (processing >$10M/month)
- **RWA Providers** (managing >$5M AUM)
- **ISO Gateway Customers** (enterprise banks)
- **Orchestration Customers** (fintech platforms)
- **Crypto Banking Customers** (licensed VASPs)

### What They Get
- **Dedicated Switch Instance** (isolated infrastructure)
- **White-Labeled UI** (their branding)
- **Own Provider Accounts** (they bring their own Stripe/Adyen API keys)
- **Custom Routing Rules** (full control)
- **Advanced Features** (AI routing, split payments, failover)

### Architecture
\`\`\`yaml
deployment:
  type: dedicated_tenant
  infrastructure: customer_vpc OR fts_isolated_namespace
  database: dedicated_postgresql_schema
  redis: dedicated_cache_namespace
  
white_labeling:
  ui_branding:
    - logo: customer_logo_url
    - colors: customer_theme
    - domain: payments.customercompany.com
  
  api_endpoints:
    - base_url: api.customercompany.com/payments
    - webhooks: customercompany.com/webhooks
  
ownership:
  provider_accounts: customer_owned
  api_keys: customer_managed
  routing_control: full_control
  data_ownership: 100%_customer
\`\`\`

### Pricing Model
\`\`\`
License Fee (Monthly):
  - Starter: $2,000/month (up to $1M volume)
  - Professional: $5,000/month (up to $10M volume)
  - Enterprise: $10,000/month (unlimited)

Usage Fee:
  - 0.05% of transaction volume (on top of provider fees)
  - Minimum: $500/month
  - Maximum: $25,000/month (cap for enterprise)

Infrastructure:
  - Shared infrastructure: Included
  - Dedicated VPC: +$1,500/month
  - Multi-region: +$3,000/month

Example Revenue (PSP processing $5M/month):
  - License: $5,000
  - Usage: $2,500 (0.05% of $5M)
  - Total FTS Revenue: $7,500/month = $90K/year
\`\`\`

### Feature Matrix (What's Included)
\`\`\`
┌────────────────────────┬─────────┬──────────────┬────────────┐
│ Feature                │ Starter │ Professional │ Enterprise │
├────────────────────────┼─────────┼──────────────┼────────────┤
│ Provider Connections   │ 3       │ 10           │ Unlimited  │
│ Routing Rules          │ 5       │ 25           │ Unlimited  │
│ AI-Powered Routing     │ ❌      │ ✅           │ ✅         │
│ Multi-Provider Split   │ ❌      │ ❌           │ ✅         │
│ Custom Domain          │ ❌      │ ✅           │ ✅         │
│ White-Label UI         │ Basic   │ Full         │ Full       │
│ API Rate Limit         │ 100/min │ 1000/min     │ Unlimited  │
│ SLA Uptime             │ 99.9%   │ 99.95%       │ 99.99%     │
│ Support                │ Email   │ Priority     │ Dedicated  │
│ Dedicated Infra        │ ❌      │ Optional     │ Included   │
└────────────────────────┴─────────┴──────────────┴────────────┘
\`\`\`

### Customer Example: Large PSP
\`\`\`
Company: GlobalPay PSP
Volume: $50M/month
Merchants: 500

Payment Switch Setup:
  - Tier: Enterprise ($10,000/month license)
  - Usage Fee: $25,000/month (0.05% of $50M)
  - Infrastructure: Dedicated VPC (+$1,500)
  - Total FTS Cost: $36,500/month
  
Their Provider Accounts (they own):
  - Stripe Business Account (2.5% + $0.30)
  - Adyen Enterprise (1.8% + €0.10)
  - Circle USDC (free)
  - Local Brazil Acquirer (custom)

Their Merchants Pay Them:
  - 2.9% + $0.30 average
  - GlobalPay keeps spread (0.4-1.1% margin)
  - FTS.Money takes 0.05% for switch usage

ROI for GlobalPay:
  - Without Switch: Single provider, 2.5% fixed cost
  - With Switch: Optimized routing saves 0.3% average
  - Savings: $150,000/month on $50M volume
  - FTS Cost: $36,500/month
  - Net Benefit: $113,500/month profit increase
\`\`\`

---

## Tier 3: Managed Service (Shared Switch)

### Who Gets This?
- **Small PSPs** (<$1M/month volume)
- **Startup RWA Providers**
- **ISO Gateway Trials**
- **Loyalty Programs** (payment collection)
- **E-Invoicing Platforms** (invoice payments)

### What They Get
- **Shared Switch Access** (multi-tenant)
- **FTS Master Provider Accounts** (FTS owns the Stripe/Adyen keys)
- **Basic Routing** (pre-configured rules)
- **Limited Customization** (templates only)
- **Turnkey Solution** (no setup required)

### Architecture
\`\`\`yaml
deployment:
  type: multi_tenant_shared
  infrastructure: fts_managed_cluster
  database: shared_postgresql (row_level_security)
  redis: shared_cache (namespace_isolation)
  
provider_accounts:
  ownership: fts_owned
  credentials: fts_managed
  settlement: fts_receives_then_splits
  
customer_control:
  routing_rules: template_based
  provider_selection: limited_to_assigned
  white_labeling: none (FTS branding)
  data_access: own_transactions_only
\`\`\`

### Pricing Model
\`\`\`
No License Fee (Usage-Based Only):
  - Per-Transaction Markup: 0.3-0.5%
  - Minimum: $0
  - Maximum: $2,000/month (graduates to Tier 2)

Example Pricing:
  - Base Provider Fee (Stripe): 2.9% + $0.30
  - FTS Markup: +0.3%
  - Customer Pays: 3.2% + $0.30
  - FTS Revenue: 0.3% of volume

Revenue Calculation (Small PSP, $500K/month):
  - Customer Total Cost: $16,000 (3.2%)
  - Goes to Stripe: $14,500 (2.9%)
  - FTS Keeps: $1,500 (0.3%)
  - FTS Revenue: $1,500/month = $18K/year
\`\`\`

### Customer Example: Small PSP
\`\`\`
Company: StartupPay PSP
Volume: $500K/month
Merchants: 25

Managed Switch Setup:
  - Tier: Managed Service (no license fee)
  - Uses: FTS Master Stripe Account
  - Markup: 0.3% ($1,500/month)
  - Total Cost: $16,000/month (3.2% all-in)

Why They Use It:
  ✅ No Stripe account setup needed
  ✅ No PCI compliance burden (FTS handles)
  ✅ Instant activation
  ✅ Automatic failover to Adyen
  ✅ Pay-as-you-grow model

When They Upgrade to Tier 2:
  - At $1M/month volume → Markup becomes $3,000
  - Cheaper to get own Stripe account + license
  - Migrate to Enterprise tier for $7,000 total
  - Keep 100% control + save $24K/year
\`\`\`

---

## Payment Switch Packaging by Customer Type

### 1. PSP Customer Usage

\`\`\`mermaid
graph TB
    subgraph "PSP Use Case"
        PSP[PSP Instance] -->|Merchant Payments| Switch[Payment Switch]
        
        Switch --> Route1[Route 1: Cards<br/>Stripe/Adyen]
        Switch --> Route2[Route 2: ACH<br/>Plaid/Dwolla]
        Switch --> Route3[Route 3: Crypto<br/>Circle USDC]
        
        Route1 --> Merchant1[Merchant Settlement T+2]
        Route2 --> Merchant2[Merchant Settlement T+3]
        Route3 --> Merchant3[Merchant Settlement Instant]
    end
\`\`\`

**PSP-Specific Features:**
- ✅ Multi-merchant routing (route per merchant or globally)
- ✅ Merchant-specific provider preferences
- ✅ Chargeback handling integration
- ✅ Settlement reconciliation
- ✅ MID routing (Merchant MID → Bank MID → Provider)

**Package:** "Payment Processing Infrastructure"
**Usage:** Merchant payment acceptance + settlement
**Volume:** High (millions/month)
**Branding:** PSP's brand (white-labeled switch UI)

---

### 2. ISO Gateway Customer Usage

\`\`\`mermaid
graph TB
    subgraph "ISO Gateway Use Case"
        Bank[Bank/Acquirer] -->|ISO 8583 Message| ISOGateway[ISO Gateway]
        ISOGateway -->|Translate to JSON| Switch[Payment Switch]
        
        Switch --> Modern1[Modern Method 1<br/>Stripe for cards]
        Switch --> Modern2[Modern Method 2<br/>PayPal for wallets]
        
        ISOGateway -->|Also Provides| Switch2[Payment Switch]
        Switch2 -->|ISO 8583 Endpoint| BankNetwork[Bank Network]
    end
\`\`\`

**ISO-Specific Features:**
- ✅ **Bidirectional:** Use modern providers OR become a provider
- ✅ ISO 8583 message translation
- ✅ Bank-grade settlement reporting
- ✅ Limited payment methods (focus on core banking)
- ✅ High compliance requirements

**Package:** "Banking Modernization Kit"
**Usage:** Translate legacy protocols to modern APIs
**Volume:** Medium (thousands of txns/day)
**Branding:** Bank's brand (white-labeled for large banks, FTS for small)

---

### 3. Orchestration Customer Usage

\`\`\`mermaid
graph TB
    subgraph "Orchestration Use Case"
        Fintech[Fintech Platform] -->|Smart Routing Request| Orch[Orchestration Service]
        
        Orch -->|Cost Analysis| Switch[Payment Switch]
        Switch -->|Cheapest| ProviderA[Provider A 2.5%]
        Switch -->|Fastest| ProviderB[Provider B 2.9%]
        Switch -->|Highest Success| ProviderC[Provider C 3.2%]
        
        Orch -->|Selects Best| Winner[Optimal Provider]
    end
\`\`\`

**Orchestration-Specific Features:**
- ✅ AI-powered provider selection
- ✅ Real-time cost calculation
- ✅ Success rate optimization
- ✅ Geographic routing
- ✅ Multiple routing strategies

**Package:** "Payment Optimization Engine"
**Usage:** Intelligent routing across providers to maximize approval rates
**Volume:** High (complex routing logic)
**Branding:** Fintech's brand (white-labeled for pro/enterprise)

---

### 4. Crypto Banking Customer Usage

\`\`\`mermaid
sequenceDiagram
    participant User
    participant CryptoBank
    participant Switch
    participant Fiat[Stripe/Adyen]
    participant Circle
    participant Blockchain

    Note over User,Blockchain: Fiat On-Ramp
    User->>CryptoBank: Buy $1000 USDC
    CryptoBank->>Switch: Process Fiat Payment
    Switch->>Fiat: Charge Card $1000
    Fiat-->>Switch: Approved
    Switch-->>CryptoBank: Fiat Received
    CryptoBank->>Circle: Mint USDC
    Circle->>Blockchain: Issue Tokens
    Blockchain-->>User: USDC Credited
\`\`\`

**Crypto-Specific Features:**
- ✅ Fiat on-ramp (card/bank → crypto)
- ✅ Fiat off-ramp (crypto → card/bank)
- ✅ Stablecoin settlement (USDC as payment method)
- ✅ AML/KYC integration checkpoints
- ✅ Instant settlement preference

**Package:** "Crypto Fiat Bridge"
**Usage:** Convert fiat ↔ crypto seamlessly
**Volume:** Medium-High (crypto volatility drives volume)
**Branding:** Crypto platform's brand (white-labeled for VASP compliance)

---

### 5. RWA Platform Customer Usage

\`\`\`
Primary Issuance:
  Investor → Payment Switch → Fiat Collected → RWA Platform → Mint Tokens

Dividend Distribution:
  RWA Platform → Payment Switch → Select Cheapest Payout → Investor Bank

Secondary Trading:
  Buyer → Payment Switch → Escrow → Token Transfer → Release to Seller
\`\`\`

**RWA-Specific Features:**
- ✅ Escrow holding (hold payment until token transfer confirmed)
- ✅ Bulk payout (distribute dividends to 1000s of investors)
- ✅ Tax withholding integration
- ✅ High-value transaction optimization (>$10K)
- ✅ Investor accreditation verification

**Package:** "Asset Settlement Infrastructure"
**Usage:** Token purchases, dividend distribution, secondary trading
**Volume:** Low-Medium frequency, high value per transaction
**Branding:** RWA provider's brand (white-labeled)

---

### 6. E-Invoicing Customer Usage

\`\`\`
Invoice Created → Payment Link Generated → Customer Pays via Switch
                                          ↓
                              ISO 20022 Data Captured
                                          ↓
                            Auto-Reconcile Invoice (matched by reference)
\`\`\`

**E-Invoicing-Specific Features:**
- ✅ Payment link generation
- ✅ QR code payments
- ✅ ISO 20022 remittance data capture
- ✅ Auto-reconciliation based on invoice reference
- ✅ Multi-currency support (cross-border invoicing)

**Package:** "Invoice Payment Collection"
**Usage:** Collect payments on invoices automatically
**Volume:** Medium (B2B invoice frequency)
**Branding:** Business's brand (white-labeled for enterprise)

---

### 7. Loyalty Platform Customer Usage

\`\`\`
Earn: Purchase at Partner Merchant → Switch Routes Payment → Points Credited
Redeem: Member Redeems Points → Switch Routes Payout → Bank Transfer
Pay with Points: $150 checkout → 100 points ($100) + Card ($50) via Switch
\`\`\`

**Loyalty-Specific Features:**
- ✅ Split payment (points + card in single transaction)
- ✅ Points-to-cash conversion
- ✅ Micro-payouts (<$10 to members)
- ✅ Bulk disbursement (10,000+ members monthly)
- ✅ Partner merchant settlement

**Package:** "Loyalty Monetization Suite"
**Usage:** Enable earning and redemption via payments
**Volume:** High (every member transaction)
**Branding:** Loyalty program's brand (white-labeled)

---

## Pricing Strategy Matrix

### A. License-Based (Tier 2 - White-Label)

| Customer Type | Monthly License | Usage Fee | Typical Volume | FTS Revenue/Month |
|--------------|----------------|-----------|----------------|-------------------|
| Small PSP | $2,000 | 0.05% | $1M | $2,500 |
| Medium PSP | $5,000 | 0.05% | $5M | $7,500 |
| Large PSP | $10,000 | 0.05% (capped $25K) | $50M | $25,000 |
| ISO Gateway | $3,000 | 0.03% | $2M | $3,600 |
| Orchestration | $5,000 | 0.05% | $10M | $10,000 |
| Crypto Banking | $4,000 | 0.1% | $3M | $7,000 |
| RWA Provider | $3,000 | 0.08% | $1M | $3,800 |
| E-Invoicing | $1,500 | 0.1% | $500K | $2,000 |
| Loyalty Platform | $2,000 | 0.15% | $2M | $5,000 |

**Annual Revenue Potential (100 customers across tiers):**
- 20 Large PSPs: $25K × 20 = $500K/month
- 30 Medium PSPs: $7.5K × 30 = $225K/month
- 50 Others: Average $4K × 50 = $200K/month
- **Total: $925K/month = $11M/year**

---

### B. Markup-Based (Tier 3 - Managed Service)

| Customer Type | Transaction Markup | Typical Volume | FTS Revenue/Month |
|--------------|-------------------|----------------|-------------------|
| Micro PSP | 0.5% | $100K | $500 |
| Small RWA | 0.4% | $200K | $800 |
| Small E-Invoice | 0.3% | $300K | $900 |
| Small Loyalty | 0.3% | $150K | $450 |

**Graduation Path:**
\`\`\`
Small customer starts on Tier 3 (managed):
  - Month 1-6: $200K volume → Pays $600/month markup
  - Month 7-12: Grows to $800K → Pays $2,400/month
  - Month 13: Hits $1M → FTS offers Tier 2
  - Decision: Pay $2,500 license + $500 usage = $3,000 total
             vs Pay $3,000 markup (0.3% of $1M)
  - Benefit of upgrade: Own provider accounts, better rates, white-label
\`\`\`

**Annual Revenue Potential (200 managed service customers):**
- Average: $1,000/month each
- Total: $200K/month = $2.4M/year

---

## White-Labeling Implementation

### What Gets White-Labeled?

#### Full White-Label (Enterprise Tier)
\`\`\`yaml
ui_customization:
  - logo: customer_logo_url
  - primary_color: #CUSTOMER_HEX
  - secondary_color: #CUSTOMER_HEX
  - custom_domain: payments.customer.com
  - custom_css: optional
  - email_templates: customer_branded
  - receipts: customer_letterhead

api_branding:
  - base_url: api.customer.com
  - webhook_domain: webhooks.customer.com
  - documentation_url: docs.customer.com
  - sdk_package_name: @customer/payments

dashboard:
  - full_rebrand: true
  - remove_fts_references: true
  - custom_navigation: optional
  - customer_support_links: customer_urls
\`\`\`

#### Partial White-Label (Professional Tier)
\`\`\`yaml
ui_customization:
  - logo: customer_logo_url
  - colors: customer_theme
  - powered_by_fts: required (small footer)
  - custom_domain: optional (+$200/month)
  
api_branding:
  - subdomain: customer.fts.money
  - sdk: @fts/payments-customer
\`\`\`

#### No White-Label (Starter Tier / Managed Service)
\`\`\`yaml
branding:
  - fts_branded: true
  - customer_name_only: shown_in_dashboard
  - powered_by_fts: prominent
\`\`\`

---

## Multi-Tenancy Architecture

### Data Isolation Strategy

\`\`\`sql
-- Shared Infrastructure Model (Tier 3)
CREATE TABLE switch_transactions (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL,  -- FTS customer (PSP/RWA/ISO)
    tenant_id UUID NOT NULL,     -- Row-level isolation
    amount DECIMAL,
    provider_id UUID,
    routing_decision JSONB,
    created_at TIMESTAMP
);

-- Enable Row-Level Security
ALTER TABLE switch_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON switch_transactions
    FOR ALL
    TO app_user
    USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- Dedicated Infrastructure Model (Tier 2)
CREATE SCHEMA customer_acme_payments;
CREATE TABLE customer_acme_payments.transactions (...);
-- Fully isolated, own database namespace
\`\`\`

### Infrastructure Separation

| Tier | Infrastructure | Database | Redis | API | Cost |
|------|---------------|----------|-------|-----|------|
| **Tier 1 (FTS)** | Dedicated cluster | Dedicated DB | Dedicated cache | Internal only | $2,500/mo |
| **Tier 2 (Enterprise)** | Dedicated namespace | Dedicated schema | Dedicated namespace | Custom domain | $1,500-5,000/mo |
| **Tier 3 (Managed)** | Shared cluster | Shared DB (RLS) | Shared cache | Subdomain | $300/mo per customer |

---

## Revenue Model Comparison

### FTS.Money Revenue Streams from Payment Switch

\`\`\`
┌──────────────────────┬────────────────┬─────────────────┬─────────────────┐
│ Revenue Stream       │ Tier 1 (FTS)   │ Tier 2 (White)  │ Tier 3 (Managed)│
├──────────────────────┼────────────────┼─────────────────┼─────────────────┤
│ License Fees         │ $0             │ $2K-10K/month   │ $0              │
│ Usage Fees           │ $0 (internal)  │ 0.05% of volume │ 0.3-0.5% markup │
│ Setup Fees           │ $0             │ $5,000 one-time │ $0              │
│ Infrastructure Fee   │ Cost center    │ +$1.5-3K/month  │ Included        │
│ Professional Services│ N/A            │ $15K-50K/year   │ $0              │
└──────────────────────┴────────────────┴─────────────────┴─────────────────┘

Total Addressable Revenue (500 total customers):
- 100 Enterprise (Tier 2): $11M/year
- 400 Managed (Tier 3): $2.4M/year
- Platform Internal (Tier 1): $0 revenue (cost center)
- Total: $13.4M annual revenue from Payment Switch product
\`\`\`

---

## Competitive Positioning

### FTS Payment Switch vs Market

| Feature | FTS Payment Switch | Spreedly | Primer.io | Stripe Connect | Gr4vy |
|---------|-------------------|----------|-----------|----------------|-------|
| **White-Label** | ✅ Full | ❌ Partial | ✅ Full | ❌ No | ✅ Full |
| **Self-Hosted Option** | ✅ Yes | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Multi-Service** | ✅ 7 services | ❌ Payments only | ❌ Payments only | ❌ Payments only | ❌ Payments only |
| **ISO 8583 Support** | ✅ Native | ❌ No | ❌ No | ❌ No | ❌ No |
| **Crypto Integration** | ✅ Native | ❌ No | ⚠️ Limited | ⚠️ Limited | ❌ No |
| **RWA Settlement** | ✅ Native | ❌ No | ❌ No | ❌ No | ❌ No |
| **Pricing** | License+Usage | Usage only | License+Usage | % markup | License+Usage |
| **Starting Price** | $2K/month | $995/month | Custom | 0.5% markup | $5K/month |

**Unique Selling Points:**
1. **Only** payment switch with ISO 8583 gateway integration
2. **Only** switch supporting 7 different service types (not just PSPs)
3. **Only** switch with native crypto + RWA support
4. **Only** switch with e-invoicing auto-reconciliation
5. **Only** switch with loyalty tokenization integration

---

## Implementation: How Each Customer Uses It Differently

### Scenario A: Large PSP (White-Label Tier 2)

\`\`\`yaml
customer: GlobalPay PSP
tier: Enterprise ($10K/month)
infrastructure: Dedicated VPC
branding: Full white-label

their_setup:
  providers_they_own:
    - stripe_business_account
    - adyen_enterprise_account
    - local_brazil_acquirer
    - circle_usdc_account
  
  routing_strategy:
    - domestic_us_cards: stripe (2.5%)
    - international_cards: adyen (1.8%)
    - brazil_pix: local_acquirer (0.8%)
    - stablecoin: circle (0%)
  
  merchants: 500
  monthly_volume: $50M
  
fts_provides:
  - payment_switch_software: licensed
  - routing_engine: ai_powered
  - health_monitoring: real_time
  - support: dedicated_slack_channel
  
fts_does_not_touch:
  - provider_credentials: customer_owns
  - merchant_relationships: customer_owns
  - settlement_funds: direct_to_customer
  - compliance_liability: customer_responsible
\`\`\`

**Key:** Customer has **full control**, FTS just provides the **software + infrastructure**

---

### Scenario B: Small RWA Provider (Managed Tier 3)

\`\`\`yaml
customer: TokenEstate RWA
tier: Managed Service (0.4% markup)
infrastructure: Shared (multi-tenant)
branding: FTS-branded with customer name

their_setup:
  providers_they_use:
    - fts_master_stripe: shared_account
    - fts_master_circle: for_usdc_settlement
  
  use_case:
    - primary_issuance: investors_pay_via_stripe
    - dividend_payouts: fts_routes_bank_transfers
  
  investors: 150
  monthly_volume: $400K
  
fts_provides:
  - provider_accounts: fts_owned_stripe
  - compliance: pci_dss_handled_by_fts
  - settlement: t+2_auto_transfer_to_rwa
  - support: email_support
  
fts_controls:
  - provider_credentials: fts_owned
  - routing_logic: pre_configured_templates
  - compliance: fts_responsible
  
revenue_split:
  - investor_pays: 3.3% (2.9% stripe + 0.4% fts)
  - fts_receives: 2.9% → pays stripe
  - fts_keeps: 0.4% = $1,600/month
  - rwa_receives: net_amount_after_fees
\`\`\`

**Key:** FTS **operates the switch** on behalf of customer, takes **markup**, customer has **limited control**

---

## Business Model Decision Matrix

### When Should Customer Get White-Label (Tier 2)?

\`\`\`
Criteria for White-Label Eligibility:

✅ YES - Offer White-Label:
  - Volume: >$1M/month
  - Merchants/Users: >100
  - Revenue: Profitable, established business
  - Compliance: Already licensed (PSP/VASP/etc)
  - Technical: Can manage provider relationships
  - Budget: Can afford $5K+/month infrastructure

❌ NO - Keep on Managed (Tier 3):
  - Volume: <$1M/month
  - Merchants/Users: <100
  - Revenue: Pre-revenue or early stage
  - Compliance: Not yet licensed
  - Technical: Limited dev resources
  - Budget: <$2K/month total payment budget
\`\`\`

### Graduation Incentives

\`\`\`javascript
// Automatic upgrade suggestions
function suggestUpgrade(customer) {
  const tier3Cost = customer.volume * 0.003; // 0.3% markup
  const tier2Cost = LICENSE_FEE + (customer.volume * 0.0005); // $5K + 0.05%
  
  if (tier3Cost > tier2Cost * 1.2) {
    return {
      recommendation: "Upgrade to Enterprise Tier",
      currentCost: tier3Cost,
      proposedCost: tier2Cost,
      savings: tier3Cost - tier2Cost,
      benefits: [
        "Save $" + (tier3Cost - tier2Cost) + "/month",
        "Own provider accounts (better rates)",
        "Full white-label branding",
        "Unlimited routing rules",
        "Dedicated support"
      ]
    };
  }
}
```

---

## Cross-Service Usage Patterns

### Pattern 1: PSP Uses Multiple Services via Same Switch

\`\`\`
GlobalPay PSP has:
  - Payment Switch (for merchant processing)
  - ISO Gateway customer account (legacy bank integration)
  - Orchestration customer account (optimization)
  
All use the SAME Payment Switch instance:
  - Merchant payments → Switch routing
  - Legacy bank → ISO Gateway → Switch translation
  - Optimization → Orchestration analyzes Switch performance
  
Benefit: Single integration point, unified analytics
\`\`\`

### Pattern 2: Multi-Service Customer Bundle

\`\`\`
Enterprise Customer Package:
  - PSP Service: $10K/month
  - Payment Switch: $10K/month
  - ISO Gateway: $3K/month
  - Crypto Banking: $4K/month
  - Bundle Discount: 20% off
  - Total: $21,600/month (vs $27K individual)
  
Switch Usage:
  - PSP merchants → Switch for payments
  - Crypto on-ramp → Switch for fiat
  - ISO messages → Translated and routed via Switch
  
Revenue to FTS:
  - License: $21,600/month
  - Usage: ~$15K/month (0.05% of combined volume)
  - Total: $36,600/month = $439K/year per enterprise customer
\`\`\`

---

## Implementation Recommendations

### 1. Tiered Switch Deployment

\`\`\`yaml
fts_internal_switch:
  location: fts_aws_account
  purpose: platform_operations
  access: fts_services_only
  cost_center: infrastructure
  
enterprise_white_label:
  location: customer_vpc OR fts_isolated_namespace
  purpose: customer_payment_processing
  access: customer_controlled
  revenue_center: license_and_usage_fees
  
managed_service:
  location: fts_shared_cluster
  purpose: small_customer_processing
  access: multi_tenant_isolated
  revenue_center: transaction_markup
\`\`\`

### 2. Feature Gating by Tier

\`\`\`javascript
const FEATURE_GATES = {
  tier1_fts: {
    providers: UNLIMITED,
    routing_rules: UNLIMITED,
    ai_routing: true,
    split_payments: true,
    white_label: false,
    custom_domain: false,
    api_access: INTERNAL_ONLY
  },
  
  tier2_enterprise: {
    providers: UNLIMITED,
    routing_rules: UNLIMITED,
    ai_routing: true,
    split_payments: true,
    white_label: true,
    custom_domain: true,
    api_access: FULL
  },
  
  tier3_managed: {
    providers: 3, // Pre-assigned by FTS
    routing_rules: 5, // Template-based
    ai_routing: false,
    split_payments: false,
    white_label: false,
    custom_domain: false,
    api_access: LIMITED
  }
};
\`\`\`

---

## Conclusion

### Payment Switch is a **Three-Tier Product**:

1. **Infrastructure Tier (FTS Internal)**
   - Purpose: Power FTS platform operations
   - Revenue: $0 (cost center)
   - Users: FTS platform services only

2. **White-Label Enterprise Tier**
   - Purpose: Empower large customers with their own switch
   - Revenue: $2K-25K/month per customer
   - Users: PSPs, RWA Providers, Banks, Fintechs
   - Control: Customer owns providers, FTS licenses software

3. **Managed Service Tier**
   - Purpose: Turnkey payments for small customers
   - Revenue: 0.3-0.5% transaction markup
   - Users: Startups, small PSPs, trial customers
   - Control: FTS owns providers, customer uses shared pool

### Packaging Differs by Service Type:

- **PSP:** "Payment Processing Infrastructure" (all payment methods)
- **ISO Gateway:** "Banking Modernization Kit" (legacy translation)
- **Orchestration:** "Payment Optimization Engine" (smart routing)
- **Crypto Banking:** "Crypto Fiat Bridge" (on/off-ramp)
- **RWA Platform:** "Asset Settlement Infrastructure" (escrow + payouts)
- **E-Invoicing:** "Invoice Payment Collection" (auto-reconciliation)
- **Loyalty:** "Loyalty Monetization Suite" (earn/redeem)

### Next Steps:
1. Build tier selection logic (auto-recommend upgrade based on volume)
2. Implement white-label UI system (theme switching)
3. Create managed service markup calculation
4. Build provider account management (customer-owned vs FTS-owned)
5. Develop cross-service usage analytics

**Revenue Potential:** $13M+ annually from Payment Switch licensing + usage fees

Would you like me to create a detailed implementation spec for the tiered deployment architecture?

---

**Document Maintained By:** FTS Business Strategy Team  
**Last Updated:** January 20, 2026  
**Review Cycle:** Quarterly  
`;