const RWAProviderPortalGuide = `# RWA Provider Portal - Complete User Guide
## White-Label Tokenization Platform Management

**Version:** 2.0  
**Last Updated:** January 11, 2026  
**Classification:** Customer Documentation  
**Portal URL:** \`/RWAProviderDashboard\`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Portal Overview](#portal-overview)
3. [Access & Authentication](#access--authentication)
4. [Dashboard Features](#dashboard-features)
5. [Issuer Management](#issuer-management)
6. [Asset Portfolio](#asset-portfolio)
7. [Investor Administration](#investor-administration)
8. [Platform Configuration](#platform-configuration)
9. [White-Label Customization](#white-label-customization)
10. [Analytics & Reporting](#analytics--reporting)
11. [User Management](#user-management)
12. [API Integration](#api-integration)

---

## Executive Summary

### What is the RWA Provider Portal?

The RWA Provider Portal is your command center for operating a white-label tokenization platform. As an RWA provider, you receive a fully-branded, regulatory-compliant infrastructure to enable asset issuers to tokenize real-world assets and manage investor lifecycles.

**Your Platform Includes:**
- ✅ **White-Label Portal** - Fully branded for your company (logo, colors, domain)
- ✅ **Issuer Onboarding** - KYB workflows, LEI verification, compliance automation
- ✅ **Asset Tokenization** - Smart contract deployment, ERC-1400 security tokens
- ✅ **Investor Management** - KYC, accreditation verification, portfolio tracking
- ✅ **Secondary Market** - Order matching, peer-to-peer trading, settlement
- ✅ **Dividend Distribution** - Automated payments, tax reporting
- ✅ **Compliance Engine** - Transfer restrictions, jurisdiction rules, regulatory reporting

### Who Are You?

| Provider Type | Business Model | Typical Customer |
|---------------|----------------|------------------|
| **Asset Management Firm** | Tokenize fund shares, fractional real estate | Family offices, HNWIs |
| **Investment Bank** | Capital markets tokenization | Institutional investors |
| **Broker-Dealer** | Digital securities platform | Retail + accredited investors |
| **Real Estate Company** | Property fractional ownership | International investors |
| **Fund Administrator** | Back-office for tokenized funds | Fund managers |

### Platform Economics

\`\`\`yaml
your_revenue_streams:
  platform_fees:
    - issuer_onboarding: $5,000-$50,000 per issuer
    - asset_tokenization: $10,000-$100,000 per asset
    - investor_kyc: $50-$500 per investor
    
  ongoing_revenue:
    - platform_subscription: $500-$5,000/month per issuer
    - transaction_fees: 0.5-2% of secondary trades
    - custody_fees: 0.1-0.5% annual AUM
    - management_fees: 0.5-2% annual AUM
    
fts_costs:
  monthly_platform_fee: $9,999-$24,999 (tier dependent)
  per_asset_deployment: $2,500
  transaction_processing: 0.1% of trades
  
your_margins:
  platform_fees: 60-80% gross margin
  ongoing_revenue: 70-90% gross margin
  net_margin: 40-60% after FTS costs
\`\`\`

---

## Portal Overview

### Portal Architecture

\`\`\`mermaid
graph TB
    subgraph "Provider Dashboard"
        DASH[Main Dashboard<br/>Platform overview]
        ISSUERS[Issuer Management<br/>Onboard & manage issuers]
        ASSETS[Asset Portfolio<br/>All tokenized assets]
        INVESTORS[Investor Admin<br/>KYC & portfolios]
        ANALYTICS[Analytics<br/>Platform performance]
    end
    
    subgraph "Issuer Portal (White-Label)"
        I_DASH[Issuer Dashboard]
        I_ASSETS[My Assets]
        I_TOKEN[Tokenization Wizard]
        I_INVESTORS[My Investors]
        I_DIVS[Dividend Manager]
    end
    
    subgraph "Investor Portal (White-Label)"
        INV_MARKET[Asset Marketplace]
        INV_PORT[My Portfolio]
        INV_ORDERS[Order History]
        INV_DIVS[Dividend History]
    end
    
    DASH --> ISSUERS
    DASH --> ASSETS
    DASH --> INVESTORS
    
    ISSUERS --> I_DASH
    ASSETS --> I_ASSETS
    INVESTORS --> INV_MARKET
    
    style DASH fill:#ef4444,color:#fff
    style I_DASH fill:#3b82f6,color:#fff
    style INV_MARKET fill:#10b981,color:#fff
\`\`\`

### Subscription Tiers

| Feature | Professional<br/>$9,999/mo | Enterprise<br/>$24,999/mo | Custom<br/>Contact Sales |
|---------|---------------------------|---------------------------|--------------------------|
| **Asset Issuers** | 10 active | 50 active | Unlimited |
| **Tokenized Assets** | 50 assets | 500 assets | Unlimited |
| **Investors** | 1,000 | 10,000 | Unlimited |
| **Blockchain Networks** | Polygon, Ethereum | All networks | Custom chains |
| **White-Label Portal** | ✅ Full branding | ✅ Full branding | ✅ Full branding |
| **Custom Domain** | 1 domain | 5 domains | Unlimited |
| **API Rate Limits** | 1,000 req/min | 10,000 req/min | Custom |
| **Support** | Priority (4h) | Dedicated (1h) | 24/7 + Account Manager |
| **SLA** | 99.9% | 99.95% | 99.99% |

---

## Access & Authentication

### Provider Login Flow

\`\`\`mermaid
sequenceDiagram
    participant Provider
    participant Portal as RWA Provider Portal
    participant Auth as rwaProviderAuth
    participant DB as RWAWhiteLabelCustomer
    
    Provider->>Portal: Navigate to login
    Portal->>Provider: Display login form
    
    Provider->>Portal: Enter email + password
    Portal->>Auth: Authenticate
    
    Auth->>DB: Find by email
    DB-->>Auth: Provider record
    
    Auth->>Auth: Verify password hash
    Auth->>Auth: Check status = active
    
    alt Valid
        Auth->>Auth: Check LEI status
        Auth-->>Portal: Success + provider data
        Portal->>Provider: Redirect to dashboard
    else Invalid
        Auth-->>Portal: Error
        Portal->>Provider: Show error message
    end
\`\`\`

### LEI Requirements

**LEI (Legal Entity Identifier) is MANDATORY for all RWA providers:**

- ✅ Verified LEI required for platform activation
- ✅ 6-month grace period for new providers
- ⚠️ Platform limited during grace period
- ❌ Platform suspended if LEI expires

**Grace Period Limitations:**
- Maximum 10 asset issuers
- Maximum $10M total value locked
- Cannot enable institutional investor features

---

## Dashboard Features

### Main Dashboard KPIs

\`\`\`mermaid
graph TB
    subgraph "Platform Metrics"
        M1[Active Issuers<br/>23 issuers]
        M2[Total Assets<br/>145 tokenized assets]
        M3[Total Value Locked<br/>$234.5M]
        M4[Active Investors<br/>4,523 investors]
    end
    
    subgraph "Performance"
        P1[Secondary Market Volume<br/>$12.3M this month]
        P2[Dividends Distributed<br/>$456K this month]
        P3[Average Asset Size<br/>$1.62M]
    end
    
    subgraph "Compliance Status"
        C1[KYC Pending: 45]
        C2[Transfer Restrictions: 12]
        C3[Regulatory Filings: 0 overdue]
    end
    
    style M3 fill:#10b981,color:#fff
    style P1 fill:#3b82f6,color:#fff
    style C3 fill:#10b981,color:#fff
\`\`\`

---

## Issuer Management

### Issuer Onboarding Flow

\`\`\`mermaid
sequenceDiagram
    participant Issuer
    participant Portal as Provider Portal
    participant Wizard as Onboarding Wizard
    participant LEI as GLEIF API
    participant Blockchain
    
    Issuer->>Portal: Request platform access
    Portal->>Wizard: Start onboarding
    
    Wizard->>Issuer: Step 1: Business Information
    Issuer->>Wizard: Company name, registration
    
    Wizard->>Issuer: Step 2: LEI Verification
    Issuer->>Wizard: Enter LEI number
    Wizard->>LEI: Verify LEI
    
    alt LEI Valid
        LEI-->>Wizard: Verified
        Wizard->>Issuer: Step 3: Compliance Documents
        Issuer->>Wizard: Upload licenses, certifications
        
        Wizard->>Issuer: Step 4: Asset Types
        Issuer->>Wizard: Select asset classes
        
        Wizard->>Portal: Submit for review
        Portal->>Portal: Manual compliance review
        
        Portal->>Blockchain: Deploy identity registry
        Blockchain-->>Portal: Contract address
        
        Portal->>Issuer: Approval + credentials
        Issuer->>Portal: Access granted
    else LEI Invalid
        LEI-->>Wizard: Error
        Wizard->>Issuer: 6-month grace period offered
    end
\`\`\`

### Issuer KYB Requirements

| Document Type | Required | Purpose | Verification |
|---------------|----------|---------|--------------|
| **Certificate of Incorporation** | ✅ | Legal entity proof | Manual review |
| **Business License** | ✅ | Operating authority | Government API |
| **LEI Certificate** | ✅ | Global identifier | GLEIF API |
| **Securities License** | ⚠️ Asset dependent | Regulatory compliance | Manual review |
| **Director IDs** | ✅ | UBO verification | KYC provider |
| **Financial Statements** | ⚠️ Large issuers | Credit assessment | Manual review |

---

## Asset Portfolio

### Asset Lifecycle Management

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Pending_Review: Submit for tokenization
    Pending_Review --> Deploying: Approve
    Pending_Review --> Draft: Request changes
    
    Deploying --> Active: Contracts deployed
    Deploying --> Failed: Deployment error
    Failed --> Deploying: Retry
    
    Active --> Fundraising: Open to investors
    Fundraising --> Fully_Subscribed: Target reached
    Fundraising --> Partially_Funded: Deadline passed
    
    Fully_Subscribed --> Trading: Enable secondary market
    Partially_Funded --> Trading: Enable trading
    
    Trading --> Matured: Asset maturity/exit
    Matured --> Archived: Settled
    
    note right of Active
        Smart contracts live
        Transfer restrictions enabled
        Compliance rules active
    end note
    
    note right of Trading
        Secondary market open
        P2P trading enabled
        Automated settlements
    end note
\`\`\`

### Asset Tokenization Dashboard

**View All Assets:**
- Filter by: Status, asset type, issuer, value range
- Sort by: Created date, total value, investor count
- Export: Excel, PDF reports

**Asset Details View:**
\`\`\`yaml
asset_overview:
  asset_name: "Manhattan Office Building - Series A"
  asset_type: "commercial_real_estate"
  issuer: "RealToken Properties LLC"
  
  tokenization:
    token_symbol: "MHOB-A"
    token_standard: "ERC-1400"
    total_tokens: 100000
    token_price: 1000  # USD per token
    total_value: 100000000
    
  blockchain:
    network: "Polygon"
    contract_address: "0xabc123..."
    identity_registry: "0xdef456..."
    
  status:
    current_status: "trading"
    tokens_sold: 65000
    remaining_tokens: 35000
    investor_count: 234
    
  compliance:
    accredited_only: true
    jurisdictions_allowed: ["US", "GB", "SG"]
    transfer_restrictions: true
    lock_up_period: 90  # days
\`\`\`

---

## Investor Administration

### Investor KYC Workflow

\`\`\`mermaid
graph TB
    INV[New Investor] --> REG[Registration]
    REG --> KYC1[Basic KYC]
    
    KYC1 --> CHECK1{Documents Valid?}
    CHECK1 -->|Yes| TIER1[Tier 1: Verified<br/>Max $10K investment]
    CHECK1 -->|No| REJECT[Rejected]
    
    TIER1 --> ACC{Accreditation?}
    ACC -->|Yes| SUBMIT[Submit Proof]
    ACC -->|No| TIER1
    
    SUBMIT --> CHECK2{Verify Accreditation}
    CHECK2 -->|Verified| TIER2[Tier 2: Accredited<br/>Max $500K investment]
    CHECK2 -->|Failed| TIER1
    
    TIER2 --> INST{Institutional?}
    INST -->|Yes| LEI_CHECK[LEI Verification]
    INST -->|No| TIER2
    
    LEI_CHECK --> TIER3[Tier 3: Institutional<br/>Unlimited investment]
    
    style TIER1 fill:#3b82f6,color:#fff
    style TIER2 fill:#8b5cf6,color:#fff
    style TIER3 fill:#10b981,color:#fff
\`\`\`

### Investor Tiers & Limits

| Tier | Requirements | Investment Limit | Enabled Features |
|------|-------------|------------------|------------------|
| **Retail** | Basic KYC only | $10,000 | Public assets only |
| **Accredited** | Accreditation proof | $500,000 | Private placements |
| **Institutional** | LEI + KYB | Unlimited | All assets, OTC trading |

---

## Platform Configuration

### Blockchain Network Settings

\`\`\`yaml
blockchain_configuration:
  primary_network: "polygon"
  supported_networks:
    - ethereum
    - polygon
    - avalanche
    - base
    
  gas_settings:
    auto_gas_management: true
    max_gas_price: 500  # Gwei
    gas_sponsor: "provider"  # or "issuer"
    
  custody:
    provider: "fireblocks"
    vault_account_id: "vault_123"
    api_key: "encrypted"
    
  oracle_feeds:
    provider: "chainlink"
    price_feeds: true
    randomness: true
\`\`\`

---

## White-Label Customization

### Branding Configuration

\`\`\`javascript
{
  "company_name": "GoldVault Tokenization",
  "branding": {
    "logo_url": "https://cdn.goldvault.com/logo.png",
    "primary_color": "#D4AF37",
    "secondary_color": "#1F2937",
    "font_family": "Inter"
  },
  "custom_domain": "tokenize.goldvault.com",
  "portal_url": "https://tokenize.goldvault.com",
  
  "email_branding": {
    "from_name": "GoldVault Tokenization",
    "from_email": "platform@goldvault.com",
    "support_email": "support@goldvault.com"
  }
}
\`\`\`

**Customization Options:**
- Company logo (SVG recommended)
- Color scheme (primary, secondary, accent)
- Custom domain with SSL
- Email templates with branding
- Terms of service
- Privacy policy

---

## Analytics & Reporting

### Performance Dashboard

| Metric | Current Month | Last Month | Growth |
|--------|---------------|------------|--------|
| **New Issuers** | 5 | 3 | +67% |
| **Assets Tokenized** | 12 | 8 | +50% |
| **New Investors** | 234 | 189 | +24% |
| **TVL** | $45.6M | $38.2M | +19% |
| **Trade Volume** | $3.2M | $2.8M | +14% |
| **Dividends Paid** | $456K | $412K | +11% |

### Revenue Reporting

\`\`\`yaml
monthly_revenue_breakdown:
  onboarding_fees:
    new_issuers: 5 × $25,000 = $125,000
    new_investors: 234 × $200 = $46,800
    
  subscription_fees:
    active_issuers: 23 × $2,500 = $57,500
    
  transaction_fees:
    secondary_trades: $3.2M × 1.5% = $48,000
    
  total_revenue: $277,300
  fts_platform_cost: $14,999
  net_revenue: $262,301
  margin: 94.6%
\`\`\`

---

## User Management

### Multi-User RBAC

| Role | Access Level | Permissions | Use Case |
|------|-------------|-------------|----------|
| **Owner** | 100% | All features, billing, configuration | CEO, Founder |
| **Administrator** | 90% | All except billing | COO, Head of Operations |
| **Compliance Officer** | 70% | KYC/KYB approval, audit logs | Chief Compliance Officer |
| **Operations** | 50% | Asset management, investor support | Operations team |
| **Analyst** | 40% | View analytics, export reports | Business analyst |
| **Viewer** | 20% | Read-only dashboard | Auditor, board member |

---

## API Integration

### REST API Endpoints

**Base URL:** \`https://api.fts.money/rwa-platform\`

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| \`/issuers\` | GET | List all issuers | 300/min |
| \`/issuers/{id}/assets\` | GET | Issuer's assets | 300/min |
| \`/assets/{id}\` | GET | Asset details | 500/min |
| \`/investors\` | GET | List investors | 300/min |
| \`/orders\` | GET | Secondary market orders | 500/min |
| \`/analytics/summary\` | GET | Platform stats | 100/min |

---

**Portal Features Summary:**

✅ **White-Label Platform** - Fully branded tokenization infrastructure  
✅ **Issuer Onboarding** - 10-step KYB + LEI verification  
✅ **Asset Portfolio** - Multi-asset class support (real estate, T-bills, credit)  
✅ **Investor Administration** - 3-tier KYC (Retail, Accredited, Institutional)  
✅ **Smart Contract Deployment** - ERC-1400 security tokens on Polygon/Ethereum  
✅ **Secondary Market** - P2P trading with automated settlement  
✅ **Dividend Automation** - Scheduled distributions with tax reporting  
✅ **Multi-User RBAC** - 6-tier role hierarchy  

**Navigation Menu:**
- Dashboard (platform metrics, AUM, issuers)
- Issuers (manage asset issuers)
- Assets (tokenized asset portfolio)
- Investors (investor KYC and portfolios)
- Analytics (performance, revenue, growth trends)
- Settings (white-label branding, blockchain config, team management)

**Revenue Model:** 60-80% gross margins on platform fees, 70-90% on ongoing revenue.

---

**Document Information**
- **Version:** 2.0
- **Last Updated:** January 11, 2026
- **Owner:** Product Documentation Team

© 2026 FTS.Money. All rights reserved.
`;

export default RWAProviderPortalGuide;