const RWAIssuerPortalGuide = `# Asset Issuer Portal - Complete User Guide
## Tokenize and Manage Your Assets

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Customer Documentation  
**Portal URL:** \`/AssetIssuerDashboard\`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Getting Started](#getting-started)
3. [Asset Tokenization](#asset-tokenization)
4. [Investor Management](#investor-management)
5. [Dividend Distribution](#dividend-distribution)
6. [Compliance & Reporting](#compliance--reporting)
7. [Secondary Market](#secondary-market)

---

## Executive Summary

### Who Are You?

As an Asset Issuer, you use this portal to:
- **Tokenize real-world assets** (real estate, treasury bills, private equity, commodities)
- **Raise capital** through fractional ownership and blockchain-based securities
- **Manage investors** with automated KYC and compliance
- **Distribute dividends** automatically to token holders
- **Enable secondary trading** for investor liquidity

### Asset Types Supported

| Asset Class | Examples | Typical Token Price | Minimum Investment |
|-------------|----------|--------------------|--------------------|
| **Real Estate** | Office buildings, residential, hotels | $100-$10,000 | $1,000 |
| **Treasury Bills** | Government bonds, sovereign debt | $1,000 | $1,000 |
| **Private Credit** | Loan portfolios, receivables | $100-$1,000 | $5,000 |
| **Private Equity** | Fund shares, company equity | $10,000-$100,000 | $25,000 |
| **Commodities** | Gold, silver, oil reserves | $50-$500 | $500 |
| **Revenue Streams** | Royalties, licensing | $100-$1,000 | $1,000 |

---

## Getting Started

### Onboarding Checklist

\`\`\`mermaid
graph TB
    START[Start Onboarding] --> STEP1[Step 1: Business Info]
    STEP1 --> STEP2[Step 2: LEI Verification]
    STEP2 --> STEP3[Step 3: Securities License]
    STEP3 --> STEP4[Step 4: Asset Types]
    STEP4 --> STEP5[Step 5: Review & Submit]
    
    STEP5 --> REVIEW{Provider Review}
    REVIEW -->|Approved| DEPLOY[Deploy Smart Contracts]
    REVIEW -->|Rejected| STEP1
    
    DEPLOY --> ACTIVE[Portal Access Granted]
    
    style STEP2 fill:#f59e0b,color:#fff
    style DEPLOY fill:#10b981,color:#fff
    style ACTIVE fill:#10b981,color:#fff
\`\`\`

**Estimated Timeline:**
- Document preparation: 1-2 days
- LEI verification: Instant (if already have LEI) or 3-5 days (new LEI)
- Compliance review: 2-5 business days
- Contract deployment: 1-2 hours
- **Total: 3-10 days**

---

## Asset Tokenization

### Tokenization Wizard

\`\`\`mermaid
sequenceDiagram
    participant Issuer
    participant Portal as Tokenization Wizard
    participant Contract as Smart Contract Factory
    participant Registry as Identity Registry
    participant Oracle as Price Oracle
    
    Issuer->>Portal: Start tokenization
    Portal->>Issuer: Step 1: Asset Details
    
    Issuer->>Portal: Name, type, value, documents
    Portal->>Issuer: Step 2: Token Configuration
    
    Issuer->>Portal: Symbol, supply, price
    Portal->>Issuer: Step 3: Transfer Rules
    
    Issuer->>Portal: Jurisdictions, restrictions
    Portal->>Issuer: Step 4: Compliance Settings
    
    Issuer->>Portal: Accredited-only, lock-up period
    Portal->>Issuer: Review & Deploy
    
    Issuer->>Portal: Confirm deployment
    Portal->>Contract: Deploy token contract
    Contract-->>Portal: Token deployed
    
    Portal->>Registry: Register token
    Registry-->>Portal: Registered
    
    Portal->>Oracle: Configure price feed
    Oracle-->>Portal: Feed active
    
    Portal->>Issuer: Asset live, ready for fundraising
\`\`\`

### Token Configuration

\`\`\`javascript
{
  "asset_details": {
    "asset_name": "Brooklyn Residential Portfolio",
    "asset_type": "real_estate",
    "asset_value_usd": 25000000,
    "valuation_date": "2026-01-01",
    "valuation_method": "Independent appraisal"
  },
  
  "token_config": {
    "token_symbol": "BKLYN-RES",
    "token_name": "Brooklyn Residential Token",
    "total_supply": 25000,
    "token_price_usd": 1000,
    "minimum_investment": 1000,
    "token_standard": "ERC-1400"
  },
  
  "compliance_rules": {
    "accredited_only": false,
    "jurisdictions_allowed": ["US", "GB", "SG", "HK"],
    "jurisdictions_blocked": ["KP", "IR", "SY"],
    "lock_up_period_days": 90,
    "transfer_restrictions": true
  },
  
  "dividend_config": {
    "dividend_frequency": "quarterly",
    "distribution_method": "automatic",
    "reinvestment_option": true
  }
}
\`\`\`

---

## Investor Management

### Investor Dashboard

**View Investor List:**
- Filter by: KYC status, investment amount, country
- Search by: Name, email, wallet address
- Export: Investor list with holdings

**Investor Profile:**
\`\`\`yaml
investor_profile:
  personal_info:
    full_name: "John Smith"
    email: "john@example.com"
    country: "United States"
    
  kyc_status:
    level: "accredited"
    verified_date: "2026-01-05"
    accreditation_type: "income"
    accreditation_expires: "2027-01-05"
    
  holdings:
    - asset: "Brooklyn Residential Token"
      tokens: 50
      value: 50000
      purchase_date: "2026-01-08"
      
  investment_summary:
    total_invested: 50000
    current_value: 52500
    unrealized_gain: 2500
    dividends_received: 0
\`\`\`

---

## Dividend Distribution

### Automated Dividend Flow

\`\`\`mermaid
sequenceDiagram
    participant Issuer
    participant Portal as Dividend Manager
    participant Contract as Smart Contract
    participant Investors
    
    Issuer->>Portal: Schedule dividend payment
    Portal->>Issuer: Enter total amount
    
    Issuer->>Portal: $100,000 quarterly dividend
    Portal->>Contract: Calculate per-token amount
    Contract-->>Portal: $4 per token (100K / 25K tokens)
    
    Portal->>Contract: Get all token holders
    Contract-->>Portal: 234 investors, holdings
    
    Portal->>Portal: Calculate payments
    Portal->>Issuer: Review distribution (234 investors)
    
    Issuer->>Portal: Approve
    Portal->>Contract: Execute dividend distribution
    
    Contract->>Investors: Transfer payments
    Contract-->>Portal: Distribution complete
    
    Portal->>Investors: Email notifications
    Portal->>Issuer: Distribution report
\`\`\`

---

## Compliance & Reporting

### Regulatory Filings

**Automated Reports:**

| Report Type | Frequency | Regulator | Auto-Generated |
|-------------|-----------|-----------|----------------|
| **Transfer Report** | Monthly | SEC (US) | ✅ |
| **Investor Registry** | Quarterly | Various | ✅ |
| **Dividend Distribution** | Per event | Tax authorities | ✅ |
| **Valuation Update** | Annually | SEC/FCA | Manual |

### Transfer Restriction Compliance

\`\`\`yaml
compliance_checks:
  pre_transfer_validation:
    - recipient_kyc_verified: true
    - recipient_jurisdiction_allowed: true
    - lock_up_period_expired: true
    - accreditation_required: check_asset_settings
    - transfer_limit_check: true
    
  auto_block_conditions:
    - sanctioned_wallet: true
    - jurisdiction_restricted: true
    - kyc_expired: true
    - transfer_suspension: asset_specific
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default RWAIssuerPortalGuide;