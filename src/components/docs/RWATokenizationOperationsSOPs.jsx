const RWATokenizationOperationsSOPs = `# RWA Tokenization Platform Operations SOPs
## Asset Onboarding, Compliance & Investor Management

**Document Classification:** Confidential  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** RWA Operations Manager & Compliance

---

## Table of Contents

1. [Overview](#overview)
2. [White-Label Provider Provisioning](#provider-provisioning)
3. [Asset Issuer Onboarding](#asset-issuer-onboarding)
4. [Asset Tokenization Workflow](#asset-tokenization)
5. [Investor KYC & Accreditation](#investor-kyc)
6. [Smart Contract Deployment](#smart-contract-deployment)
7. [Secondary Market Operations](#secondary-market)
8. [Dividend Distribution](#dividend-distribution)
9. [Regulatory Compliance](#regulatory-compliance)

---

## Overview

### RWA Platform Business Model

**Three-Tier Structure:**

\`\`\`mermaid
graph TB
    A[FTS.Money<br/>Platform Provider] --> B[White-Label RWA Provider<br/>Fund Manager, Broker-Dealer]
    B --> C[Asset Issuer<br/>Real Estate Co, Corp, Fund]
    C --> D[Investors<br/>Accredited & Retail]
    
    A -->|Technology + Compliance Tools| B
    B -->|White-Label Platform| C
    C -->|Tokenized Assets| D
    
    style A fill:#3b82f6,color:#fff
    style B fill:#10b981,color:#fff
    style C fill:#f59e0b,color:#fff
\`\`\`

**Revenue Model:**
- FTS.Money charges white-label providers (monthly + per-asset + transaction %)
- White-label providers charge asset issuers
- Asset issuers sell to investors

### Supported Asset Classes

| Asset Class | Tokenization Complexity | Regulatory Requirements | Avg Token Deployment Time |
|-------------|------------------------|------------------------|---------------------------|
| **US Treasury Bills** | Low | SEC exempt, accredited investors only | 2-3 days |
| **Real Estate** | High | Securities registration or Reg D/A/CF exemption | 10-30 days |
| **Private Credit** | Medium | Accredited investors, fair value appraisal | 5-10 days |
| **Corporate Bonds** | Medium | SEC registration or exemption | 7-14 days |
| **Private Equity** | Very High | Reg D, complex valuations | 15-45 days |
| **Commodities** (gold, art) | Medium | Custody verification, insurance | 7-14 days |

---

## SOP-RWA-001: White-Label Provider Provisioning

### Purpose
Onboard RWA platform providers (fund managers, broker-dealers) who will use FTS.Money infrastructure.

### Provider Onboarding Requirements

**Enhanced KYB for RWA Providers:**

| Requirement | Documentation | Verification | Timeline |
|-------------|--------------|--------------|----------|
| **Financial License** | SEC registered, FINRA member, or equivalent | Verify with regulator | 3-5 days |
| **LEI (Legal Entity Identifier)** | GLEIF-issued LEI | Verify via GLEIF API | 24 hours |
| **AUM (Assets Under Management)** | Financial statements, fund reports | Third-party verification | 5-7 days |
| **Custody Arrangement** | Agreement with qualified custodian | Review contract | 2-3 days |
| **Insurance** | E&O insurance, cyber insurance | Review policy | 2-3 days |
| **Compliance Program** | AML policy, KYC procedures, reg compliance | Review documentation | 5-7 days |

### Provisioning Workflow

\`\`\`mermaid
gantt
    title RWA White-Label Provider Provisioning (30-Day Process)
    dateFormat YYYY-MM-DD
    
    section Week 1: Due Diligence
    Contract Signed                    :milestone, 2026-01-01, 0d
    KYB Documentation Collection       :dd1, 2026-01-01, 3d
    License Verification               :dd2, 2026-01-04, 2d
    LEI Verification                   :dd3, 2026-01-04, 1d
    Compliance Review                  :dd4, 2026-01-06, 2d
    
    section Week 2: Infrastructure Setup
    Blockchain Wallet Creation         :infra1, 2026-01-08, 1d
    Smart Contract Factory Deployment  :infra2, 2026-01-09, 2d
    White-Label Portal Deployment      :infra3, 2026-01-11, 3d
    Custom Branding Applied            :infra4, 2026-01-14, 1d
    
    section Week 3: Integration & Testing
    Fireblocks Custody Setup           :test1, 2026-01-15, 2d
    Test Asset Deployment              :test2, 2026-01-17, 2d
    End-to-End Testing                 :test3, 2026-01-19, 3d
    
    section Week 4: Training & Go-Live
    Provider Team Training             :train1, 2026-01-22, 2d
    Compliance Documentation Review    :train2, 2026-01-24, 2d
    Production Certification           :train3, 2026-01-26, 2d
    Go-Live Approval                   :milestone, 2026-01-28, 0d
    First Asset Issuer Onboarded       :milestone, 2026-02-05, 0d
\`\`\`

**Deliverables to Provider:**
- ✅ Deployed smart contracts (token factory, identity registry, compliance engine)
- ✅ White-label portal (branded with provider's logo/colors)
- ✅ Custom domain setup (e.g., tokenize.fundmanager.com)
- ✅ Fireblocks custody vault (multi-sig configuration)
- ✅ Admin access (Owner role for provider team)
- ✅ Documentation (technical integration, compliance guide)
- ✅ Training sessions (2-day intensive)

### Metrics

- Provider provisioning time (target: <30 days)
- Provider provisioning success rate (target: >90% - some fail due diligence)
- Providers going live with first asset (target: >80% within 60 days of provisioning)
- Provider churn rate (target: <5% annually)

---

## SOP-RWA-002: Asset Issuer Onboarding (KYB + Securities Compliance)

### Purpose
Onboard asset issuers with rigorous compliance checks per securities regulations.

### Asset Issuer KYB Checklist

**Required for ALL Issuers:**
- ✅ Company registration certificate
- ✅ LEI (Legal Entity Identifier) - MANDATORY, no exceptions
- ✅ Ultimate beneficial owners (UBO) declaration (>10% ownership)
- ✅ Board resolution authorizing tokenization
- ✅ Financial statements (last 2 years)
- ✅ Proof of asset ownership / legal title
- ✅ Valuation report (independent appraiser)
- ✅ Securities legal opinion (if securities token)
- ✅ Custody agreement (for physical assets)
- ✅ Insurance policy (if applicable)

**Additional for High-Value Assets (>$10M):**
- ✅ Enhanced due diligence questionnaire
- ✅ Site visit / asset verification (physical inspection)
- ✅ Third-party audit report
- ✅ Legal opinion on asset transferability

### Compliance Review Process

\`\`\`mermaid
flowchart TD
    A[Issuer Submits Application] --> B[Completeness Check]
    B --> C{All Docs Provided?}
    
    C -->|No| D[Request Missing Docs]
    C -->|Yes| E[KYB Verification]
    
    D --> B
    
    E --> F[LEI Validation via GLEIF]
    E --> G[UBO Sanctions Screening]
    E --> H[Financial Stability Check]
    
    F --> I{LEI Valid?}
    G --> J{Sanctions Clear?}
    H --> K{Financially Stable?}
    
    I -->|No| L[Reject - LEI Required]
    J -->|No| M[Reject - Sanctions Hit]
    K -->|No| N[Reject - Financial Risk]
    
    I -->|Yes| O[Asset Legal Review]
    J -->|Yes| O
    K -->|Yes| O
    
    O --> P[Securities Counsel Reviews]
    P --> Q{Securities Compliant?}
    
    Q -->|No| R[Reject - Securities Issue]
    Q -->|Yes with Exemption| S[Approve - Accredited Investors Only]
    Q -->|Yes Fully Registered| T[Approve - Retail Allowed]
    
    S --> U[Issue Approval Letter]
    T --> U
    
    U --> V[Issuer Can Proceed to Tokenization]
    
    style L fill:#ef4444,color:#fff
    style M fill:#ef4444,color:#fff
    style V fill:#10b981,color:#fff
\`\`\`

**Review SLA:**
- Standard application: 10 business days
- Expedited (additional $5K fee): 5 business days
- High-value (>$50M): 15-20 business days (additional due diligence)

**Approval Rate:** ~60% (40% rejected or require significant revisions)

### Metrics

- Issuer onboarding time (target: <15 business days)
- KYB approval rate (target: 50-70% - appropriate for quality control)
- LEI verification rate (target: 100% - no exceptions)
- Compliance review thoroughness (target: 0 regulatory violations post-approval)

---

## SOP-RWA-003: Asset Tokenization & Smart Contract Deployment

### Purpose
Deploy security tokens representing real-world assets with regulatory compliance and investor protections.

### Tokenization Workflow

\`\`\`mermaid
sequenceDiagram
    participant Issuer
    participant RWA_Portal as RWA Platform
    participant Compliance as Compliance Officer
    participant Legal as Legal Review
    participant Blockchain as Blockchain (Polygon)
    participant Fireblocks
    participant Investor
    
    Issuer->>RWA_Portal: Submit Asset Details
    RWA_Portal->>Issuer: Request Legal Documents
    Issuer->>RWA_Portal: Upload Asset Docs
    
    RWA_Portal->>Compliance: Trigger Compliance Review
    Compliance->>Compliance: Verify Asset Ownership
    Compliance->>Compliance: Valuation Review
    Compliance->>Legal: Request Legal Opinion
    
    Legal->>Legal: Review Securities Classification
    Legal->>Compliance: Approve or Reject
    
    Compliance->>RWA_Portal: Approval Granted
    
    RWA_Portal->>Blockchain: Deploy Token Contract
    Note over Blockchain: ERC-3643 (T-REX) Security Token
    Blockchain->>RWA_Portal: Contract Address
    
    RWA_Portal->>Fireblocks: Create Custody Wallet
    Fireblocks->>RWA_Portal: Wallet Address
    
    RWA_Portal->>Blockchain: Mint Initial Token Supply
    Blockchain->>Fireblocks: Tokens Minted to Custody
    
    RWA_Portal->>Issuer: Tokenization Complete
    Issuer->>RWA_Portal: List Asset for Sale
    
    RWA_Portal->>Investor: Asset Available in Marketplace
\`\`\`

### Smart Contract Template (ERC-3643 T-REX)

**Deployed Contracts per Asset:**

1. **Token Contract:**
   - Standard: ERC-3643 (security token standard)
   - Features: Transfer restrictions, forced transfers (court orders), freeze capability
   - Compliance: Built-in compliance rules (accreditation, jurisdiction, limits)

2. **Identity Registry:**
   - Stores investor identities and compliance status
   - Verifies investor eligibility before transfer
   - Integrated with KYC provider

3. **Compliance Smart Contract:**
   - Rules engine (e.g., "US accredited investors only", "Max 10% per investor")
   - Transfer validation
   - Automated restriction enforcement

4. **Claim Topics Registry:**
   - Investor claims (accreditation status, jurisdiction, AML clearance)
   - Issued by trusted claim issuers (KYC provider, FTS.Money compliance)

**Deployment Checklist:**
- ✅ Legal documents uploaded (prospectus, subscription agreement)
- ✅ Compliance rules defined (investor restrictions, transfer limits)
- ✅ Token economics set (total supply, price, vesting)
- ✅ Smart contracts audited (if custom modifications)
- ✅ Custody wallet secured (multi-sig)
- ✅ Test deployment on testnet successful
- ✅ Compliance officer approval
- ✅ Legal counsel approval

**Deployment Time:** 2-5 days after approval

### Asset Valuation & Updates

**Initial Valuation:**
- Independent appraiser required (for real estate, commodities, art)
- Financial statements (for equity, bonds)
- Fair market value determination (GAAP/IFRS compliant)

**Ongoing Valuations:**
- Real estate: Annual revaluation
- Private equity: Quarterly NAV calculation
- Bonds: Mark-to-market (if traded) or hold-to-maturity
- Commodities: Daily spot price updates

**Valuation Update Process:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Valuation_Due
    Valuation_Due --> Appraiser_Engaged
    Appraiser_Engaged --> Valuation_Report
    Valuation_Report --> Compliance_Review
    Compliance_Review --> Approved
    Approved --> Update_Token_Metadata
    Update_Token_Metadata --> Notify_Investors
    Notify_Investors --> [*]
    
    Compliance_Review --> Rejected: If appraisal questionable
    Rejected --> Appraiser_Engaged: Request new appraisal
\`\`\`

### Metrics

- Asset tokenization time (target: <5 days post-approval)
- Smart contract deployment success (target: 100%)
- Asset valuation update timeliness (target: 100% on schedule)
- Compliance violation (target: 0 - no non-compliant tokens deployed)

---

## SOP-RWA-004: Investor KYC & Accreditation Verification

### Purpose
Verify investor identity and accreditation status per securities regulations.

### Investor Onboarding Tiers

| Investor Type | KYC Level | Accreditation Required? | Eligible Assets | Onboarding Time |
|--------------|-----------|------------------------|-----------------|-----------------|
| **Retail** | Enhanced KYC | No | Public offerings, Reg A+ | 2-3 days |
| **Accredited Investor** (US) | Enhanced KYC + Accreditation | Yes | Reg D, most private placements | 5-7 days |
| **Qualified Purchaser** | Enhanced KYC + Financial verification | Yes | Hedge funds, large private funds | 7-10 days |
| **Institutional** | Entity KYB | Varies | Most offerings | 10-15 days |

### Accreditation Verification Methods

**US Accredited Investor (Reg D Rule 501):**

**Income Test:**
- Individual income >$200K (or $300K joint) for last 2 years
- **Proof:** Tax returns (2 years) OR CPA letter

**Net Worth Test:**
- Net worth >$1M (excluding primary residence)
- **Proof:** Bank statements + brokerage statements + property valuations

**Professional Credentials:**
- Series 7, 65, or 82 license
- **Proof:** FINRA verification

**Third-Party Verification:**
- Use services like VerifyInvestor, Parallel Markets
- Cost: $50-$100 per verification
- Accuracy: >99%

### Investor Onboarding Workflow

\`\`\`mermaid
sequenceDiagram
    participant Investor
    participant Portal as RWA Investor Portal
    participant KYC as KYC Provider
    participant Accred as Accreditation Verifier
    participant Compliance
    participant Blockchain
    
    Investor->>Portal: Create Account
    Portal->>KYC: Initiate KYC
    KYC->>Investor: Request ID + Selfie
    Investor->>KYC: Upload Documents
    KYC->>Portal: KYC Approved
    
    Portal->>Investor: Request Accreditation Proof
    Investor->>Portal: Upload Tax Returns / Financial Docs
    Portal->>Accred: Verify Accreditation
    Accred->>Accred: Review Documents
    Accred->>Portal: Accreditation Confirmed
    
    Portal->>Compliance: Request Final Approval
    Compliance->>Compliance: Review for Sanctions, PEP
    Compliance->>Portal: Approve Investor
    
    Portal->>Blockchain: Issue Identity Claim Token
    Blockchain->>Blockchain: Store "Accredited Investor" Claim
    
    Portal->>Investor: Account Approved - Can Invest
\`\`\`

**Average Onboarding Time:** 5-7 days (accredited), 2-3 days (retail in Reg A+)

### On-Chain Identity Claims

**Verifiable Credentials (W3C VC Standard):**

Issued to investor's wallet:
- ✅ KYC Verified (claim issuer: FTS.Money KYC)
- ✅ Accredited Investor Status (claim issuer: VerifyInvestor)
- ✅ Jurisdiction (claim issuer: FTS.Money)
- ✅ AML Cleared (claim issuer: FTS.Money Compliance)

**Smart Contract Verification:**
- Before allowing token purchase, smart contract checks investor claims
- Transfer blocked if required claims missing or expired
- Automated compliance enforcement

### Metrics

- Investor KYC completion rate (target: >85% of started applications)
- Investor onboarding time (target: <7 days)
- Accreditation verification accuracy (target: 100% - no unaccredited allowed in Reg D)
- Investor compliance violations (target: 0)

---

## SOP-RWA-005: Secondary Market Operations & Trading

### Purpose
Facilitate compliant secondary trading of tokenized assets between investors.

### Trading Restrictions

**Built-In Compliance Rules (Smart Contract Enforced):**

| Rule | Example | Enforcement |
|------|---------|-------------|
| **Accreditation** | Reg D tokens require accredited buyer | Buyer must have "Accredited" claim on-chain |
| **Holding Period** | 12-month lock-up for Reg D | Transfer blocked by smart contract until date |
| **Max Ownership** | Single investor cannot own >10% | Smart contract checks total balance before transfer |
| **Jurisdiction** | Only US investors allowed | Buyer must have "Jurisdiction: US" claim |
| **Volume Limits** | Max 1% of supply traded per day | Smart contract tracks 24h trading volume |

### Secondary Trading Workflow

\`\`\`mermaid
sequenceDiagram
    participant Seller
    participant Marketplace as RWA Marketplace
    participant Buyer
    participant Smart_Contract as Compliance Smart Contract
    participant Custody as Fireblocks
    participant Settlement
    
    Seller->>Marketplace: List tokens for sale (Price: $X)
    Marketplace->>Marketplace: Create listing
    
    Buyer->>Marketplace: Browse available assets
    Buyer->>Marketplace: Place buy order
    
    Marketplace->>Smart_Contract: Check if transfer allowed
    Smart_Contract->>Smart_Contract: Verify buyer compliance
    Smart_Contract->>Smart_Contract: Check holding periods
    Smart_Contract->>Smart_Contract: Check concentration limits
    
    alt Transfer Allowed
        Smart_Contract->>Marketplace: Approve
        Marketplace->>Buyer: Request payment (USDC or fiat)
        Buyer->>Marketplace: Pay $X
        
        Marketplace->>Custody: Execute token transfer
        Custody->>Custody: Transfer from Seller to Buyer wallet
        
        Custody->>Settlement: Transfer complete
        Settlement->>Seller: Release payment (minus fee)
        Settlement->>Marketplace: Take 1% trading fee
        
        Marketplace->>Seller: Trade confirmed + payment
        Marketplace->>Buyer: Trade confirmed + tokens
    else Transfer Blocked
        Smart_Contract->>Marketplace: Rejection reason
        Marketplace->>Buyer: Cannot purchase - [Reason]
    end
\`\`\`

**Trading Fees:**
- Marketplace fee: 1% (0.5% from buyer, 0.5% from seller)
- Blockchain gas fees: Paid by buyer
- Settlement: T+0 (instant for crypto, T+2 for fiat)

### Metrics

- Secondary market trade volume (target: 10% of tokens trade annually)
- Trade execution success rate (target: >98%)
- Compliance rejection rate (target: 5-10% - indicates rules working)
- Trade settlement time (target: <1 hour for crypto, <3 days for fiat)

---

## Appendix: Regulatory Compliance Matrix

### Securities Exemptions (US)

| Exemption | Requirements | Max Raise | Investor Type | Reporting |
|-----------|--------------|-----------|---------------|-----------|
| **Reg D 506(b)** | No general solicitation | Unlimited | Accredited only (35 non-accredited allowed) | Form D |
| **Reg D 506(c)** | General solicitation allowed | Unlimited | Accredited only (verified) | Form D |
| **Reg A (Tier 2)** | SEC qualification | $75M/year | Retail allowed | Annual reports |
| **Reg CF** | Crowdfunding portal | $5M/year | All investors (investment limits apply) | Annual reports |

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** RWA Operations Manager

© 2026 FTS.Money. Confidential.
`;

export default RWATokenizationOperationsSOPs;