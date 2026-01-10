const RWAInvestorPortalGuide = `# Investor Portal - Complete User Guide
## Invest in Tokenized Real-World Assets

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Customer Documentation  
**Portal URL:** \`/InvestorMarketplace\`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Getting Started](#getting-started)
3. [KYC & Accreditation](#kyc--accreditation)
4. [Asset Marketplace](#asset-marketplace)
5. [Investing in Assets](#investing-in-assets)
6. [Portfolio Management](#portfolio-management)
7. [Secondary Market Trading](#secondary-market-trading)
8. [Dividend Management](#dividend-management)

---

## Executive Summary

### What is the Investor Portal?

The Investor Portal enables you to invest in fractional ownership of real-world assets through blockchain-based security tokens.

**Available Assets:**
- 🏢 Commercial real estate
- 🏛️ Treasury bills & government bonds
- 💼 Private equity fund shares
- 🥇 Physical gold & commodities
- 📜 Revenue-sharing agreements

### Investment Benefits

| Benefit | Traditional | Tokenized (RWA) |
|---------|------------|-----------------|
| **Minimum Investment** | $100,000+ | $1,000-$10,000 |
| **Liquidity** | Years to exit | Trade on secondary market |
| **Transparency** | Quarterly reports | Real-time on blockchain |
| **Dividends** | Manual distribution | Automatic smart contract |
| **Fractional Ownership** | Rare | Standard |
| **Global Access** | Limited | 24/7 worldwide |

---

## Getting Started

### Registration & KYC

\`\`\`mermaid
graph TB
    START[Visit Portal] --> REG[Create Account]
    REG --> EMAIL[Verify Email]
    EMAIL --> KYC[Submit KYC Documents]
    
    KYC --> DOC{Documents}
    DOC --> ID[Government ID]
    DOC --> POA[Proof of Address]
    DOC --> SELF[Selfie Verification]
    
    ID --> REVIEW[Automated Review]
    POA --> REVIEW
    SELF --> REVIEW
    
    REVIEW --> VERIFY{Verification}
    VERIFY -->|Approved| TIER1[Tier 1: Verified<br/>Invest up to $10K]
    VERIFY -->|Rejected| RESUBMIT[Resubmit Documents]
    
    TIER1 --> BROWSE[Browse Assets]
    BROWSE --> INVEST[Start Investing]
    
    style TIER1 fill:#10b981,color:#fff
    style INVEST fill:#3b82f6,color:#fff
\`\`\`

---

## KYC & Accreditation

### Investor Tiers

**Tier 1: Verified Investor**
- Requirements: Photo ID + proof of address
- Investment limit: $10,000
- Access: Public offerings only
- Processing: 15 minutes - 24 hours

**Tier 2: Accredited Investor**
- Requirements: Tier 1 + accreditation proof
- Investment limit: $500,000
- Access: Private placements
- Processing: 2-5 business days

**Tier 3: Institutional**
- Requirements: LEI + KYB documents
- Investment limit: Unlimited
- Access: All assets + OTC trading
- Processing: 5-10 business days

### Accreditation Verification

\`\`\`yaml
accreditation_methods:
  income_based:
    requirement: "$200K individual or $300K joint income"
    proof: "Tax returns (last 2 years)"
    
  net_worth_based:
    requirement: "$1M net worth (excluding primary residence)"
    proof: "Bank statements, asset statements"
    
  professional_license:
    requirement: "Series 7, 65, or 82 license"
    proof: "FINRA verification"
    
  entity_based:
    requirement: "$5M+ in assets"
    proof: "Financial statements, audited"
\`\`\`

---

## Asset Marketplace

### Browsing Assets

\`\`\`mermaid
graph TB
    MARKET[Asset Marketplace] --> FILTER[Filters]
    MARKET --> SORT[Sort Options]
    MARKET --> SEARCH[Search]
    
    FILTER --> F1[Asset Type<br/>Real Estate, T-Bills, etc.]
    FILTER --> F2[Investment Range<br/>$1K-$10K, $10K-$100K]
    FILTER --> F3[Dividend Yield<br/>0-5%, 5-10%, 10%+]
    FILTER --> F4[Risk Level<br/>Low, Medium, High]
    
    SORT --> S1[Newest First]
    SORT --> S2[Highest Yield]
    SORT --> S3[Lowest Minimum]
    SORT --> S4[Most Popular]
    
    style MARKET fill:#3b82f6,color:#fff
\`\`\`

### Asset Details Page

\`\`\`yaml
asset_card:
  header:
    name: "Manhattan Office Building - Series A"
    type: "Commercial Real Estate"
    issuer: "RealToken Properties LLC"
    
  key_metrics:
    token_price: "$1,000 per token"
    minimum_investment: "$10,000 (10 tokens)"
    total_value: "$100M"
    tokens_available: "35,000 / 100,000"
    
  returns:
    target_yield: "8.5% annually"
    dividend_frequency: "Quarterly"
    last_dividend: "$21.25 per token (Q4 2025)"
    
  details:
    location: "555 Madison Ave, New York, NY"
    built: 1985
    square_feet: "450,000"
    occupancy_rate: "96%"
    tenant_quality: "Investment grade"
    
  documents:
    - offering_memorandum.pdf
    - property_appraisal.pdf
    - lease_abstracts.pdf
    - financial_statements.pdf
\`\`\`

---

## Investing in Assets

### Purchase Flow

\`\`\`mermaid
sequenceDiagram
    participant Investor
    participant Portal as Asset Page
    participant Wallet as Digital Wallet
    participant Contract as Smart Contract
    participant Issuer
    
    Investor->>Portal: Click "Invest Now"
    Portal->>Investor: Enter investment amount
    
    Investor->>Portal: $50,000 (50 tokens)
    Portal->>Portal: Check KYC tier limit
    Portal->>Portal: Check accreditation (if required)
    
    alt Eligible
        Portal->>Investor: Review investment summary
        Investor->>Portal: Confirm purchase
        
        Portal->>Wallet: Request payment
        Wallet->>Investor: Approve transaction
        
        Investor->>Wallet: Approve
        Wallet->>Contract: Transfer $50,000 USDC
        
        Contract->>Contract: Mint 50 tokens
        Contract->>Investor: Transfer tokens to wallet
        
        Contract->>Issuer: Notify of new investor
        Portal->>Investor: Investment complete
    else Not Eligible
        Portal->>Investor: Upgrade KYC tier or reduce amount
    end
\`\`\`

---

## Portfolio Management

### Portfolio Dashboard

\`\`\`yaml
portfolio_summary:
  total_invested: 150000
  current_value: 163250
  unrealized_gain: 13250
  gain_percentage: 8.83
  
  dividends:
    total_received: 4250
    ytd: 3100
    
  holdings:
    - asset: "Manhattan Office - Series A"
      tokens: 50
      cost_basis: 50000
      current_value: 52500
      gain: 2500
      dividends_ytd: 1063
      
    - asset: "US Treasury Bill 2027"
      tokens: 100
      cost_basis: 100000
      current_value: 110750
      gain: 10750
      dividends_ytd: 2037
\`\`\`

---

## Secondary Market Trading

### Placing Orders

**Order Types:**

| Order Type | Description | Use Case |
|------------|-------------|----------|
| **Market** | Buy/sell at current price | Immediate execution |
| **Limit** | Set your price | Wait for better price |
| **Stop-Loss** | Sell if price drops | Risk management |

\`\`\`mermaid
graph LR
    INVESTOR[Investor] --> ORDER[Place Order]
    
    ORDER --> BUY[Buy Order]
    ORDER --> SELL[Sell Order]
    
    BUY --> MATCH[Order Matching Engine]
    SELL --> MATCH
    
    MATCH --> FILL{Match Found?}
    
    FILL -->|Yes| SETTLE[Settlement]
    FILL -->|No| BOOK[Order Book]
    
    SETTLE --> BUYER[Transfer Tokens]
    SETTLE --> SELLER[Transfer Payment]
    
    style ORDER fill:#3b82f6,color:#fff
    style SETTLE fill:#10b981,color:#fff
\`\`\`

---

## Dividend Management

### Dividend History

\`\`\`yaml
dividend_payments:
  - date: "2026-01-15"
    asset: "Manhattan Office - Series A"
    tokens_held: 50
    payment_per_token: 21.25
    total_payment: 1062.50
    status: "paid"
    payment_method: "USDC to wallet"
    
  - date: "2025-10-15"
    asset: "Manhattan Office - Series A"
    tokens_held: 50
    payment_per_token: 21.25
    total_payment: 1062.50
    status: "paid"
    payment_method: "USDC to wallet"
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default RWAInvestorPortalGuide;