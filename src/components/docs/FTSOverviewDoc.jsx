
const FTSOverviewDoc = `
# FTS.Money Payments Infrastructure
## Complete System Overview & Vision

**Version:** 1.0  
**Last Updated:** December 2025  
**Classification:** Public - Business & Technical

---

## Executive Summary

### Vision Statement
FTS.Money is revolutionizing global payments infrastructure by democratizing access to enterprise-grade payment processing capabilities. Our vision is to create a fluid, borderless payment ecosystem where any business—from startups to enterprises—can launch a fully compliant Payment Service Provider (PSP) in 24-48 hours.

### Mission
To provide **white-label payment infrastructure as a service**, enabling businesses to:
- Launch branded PSPs without multi-million dollar investments
- Access 150+ payment services through a unified marketplace
- Ensure ISO 20022/ISO 8583 compliance out-of-the-box
- Scale from 10 to 10 million transactions seamlessly

### Market Positioning

#### The Problem We Solve
Traditional payment infrastructure requires:
- **$5-50M** initial capital investment
- **18-36 months** build time
- **50+ full-time engineers**
- Complex compliance (PCI DSS Level 1, GDPR, LEI/vLEI)
- Multiple vendor integrations
- Regulatory licenses per region

**FTS.Money reduces this to:**
- **$0-$50K** initial investment (SaaS model)
- **24-48 hours** deployment
- **Zero engineering team** required
- **Built-in compliance** (PCI DSS, ISO 20022, GDPR, LEI)
- **150+ pre-integrated** payment services
- **Global operations** from day one

#### Competitive Landscape

\`\`\`mermaid
quadrantChart
    title Payment Infrastructure Market Positioning
    x-axis Low Customization --> High Customization
    y-axis Low Cost --> High Cost
    quadrant-1 Enterprise Solutions
    quadrant-2 FTS.Money (Ideal)
    quadrant-3 Basic Payment Gateways
    quadrant-4 DIY Solutions
    Stripe: [0.3, 0.4]
    PayPal: [0.2, 0.3]
    Adyen: [0.7, 0.8]
    Custom Build: [0.9, 0.9]
    FTS.Money: [0.8, 0.3]
    Braintree: [0.4, 0.5]
\`\`\`

**vs. Stripe/PayPal:** FTS offers white-label + ownership vs. being a reseller  
**vs. Adyen:** 90% cost reduction, faster deployment, more flexibility  
**vs. Custom Build:** Eliminate engineering costs, instant compliance  
**vs. Payment Orchestrators:** We provide full PSP infrastructure, not just routing

### Core Value Propositions

#### 1. **Platform-as-a-Service Model**
- Multi-tenant architecture (PCI DSS Level 1 isolated)
- Full white-label customization
- Own your brand, data, and customer relationships

#### 2. **Service Marketplace**
- 150+ payment providers, fraud detection, compliance tools
- One-click integration
- PSP-to-PSP wholesale marketplace

#### 3. **ISO Standards Compliance**
- **ISO 20022** - Modern payment messaging
- **ISO 8583** - Card network compatibility  
- **ISO 23257** - Cryptocurrency integration
- **ISO 24165** - Digital token identifiers
- LEI/vLEI credential chains

#### 4. **Multi-Service Architecture**
\`\`\`mermaid
graph TB
    A[FTS.Money Platform] --> B[PSP Instances]
    A --> C[ISO Gateway Service]
    A --> D[Orchestration Service]
    A --> E[Marketplace Services]
    
    B --> F[Merchant Portals]
    B --> G[Virtual Terminals]
    B --> H[Payment APIs]
    
    C --> I[Message Translation]
    C --> J[Standards Enrichment]
    
    D --> K[Smart Routing]
    D --> L[Failover Management]
    
    E --> M[Payment Providers]
    E --> N[Payout Routes]
    E --> O[Compliance Tools]
\`\`\`

---

## System Architecture

### High-Level Platform Design

\`\`\`mermaid
C4Context
    title FTS.Money - System Context Diagram
    
    Person(customer, "End Customer", "Makes payments")
    Person(merchant, "Merchant", "Accepts payments")
    Person(pspOwner, "PSP Owner", "Manages PSP instance")
    Person(platformAdmin, "Platform Admin", "Manages infrastructure")
    
    System(ftsPlatform, "FTS.Money Platform", "Multi-tenant payment infrastructure")
    
    System_Ext(paymentNetworks, "Payment Networks", "Visa, Mastercard, etc")
    System_Ext(banks, "Banking Rails", "ACH, SWIFT, SEPA")
    System_Ext(crypto, "Crypto Networks", "Bitcoin, Ethereum")
    System_Ext(compliance, "Compliance Services", "KYB, AML, LEI")
    
    Rel(customer, ftsPlatform, "Makes payment")
    Rel(merchant, ftsPlatform, "Manages business")
    Rel(pspOwner, ftsPlatform, "Provisions & operates")
    Rel(platformAdmin, ftsPlatform, "Administers")
    
    Rel(ftsPlatform, paymentNetworks, "Routes transactions")
    Rel(ftsPlatform, banks, "Settlement")
    Rel(ftsPlatform, crypto, "Crypto payments")
    Rel(ftsPlatform, compliance, "Verification")
\`\`\`

### Multi-Tenancy Architecture

**Isolation Strategy:**
- **PSP Level:** Schema-isolated PostgreSQL (\`psp_{code}\` schemas)
- **Merchant Level:** Row-level security with \`psp_code\` filtering
- **Data Sovereignty:** Regional deployment options (US, EU, APAC)

\`\`\`mermaid
erDiagram
    FTS-PLATFORM ||--o{ PSP-INSTANCE : provisions
    PSP-INSTANCE ||--o{ MERCHANT : manages
    MERCHANT ||--o{ TRANSACTION : processes
    PSP-INSTANCE ||--o{ PSP-STAFF : employs
    MERCHANT ||--o{ MERCHANT-USER : has
    
    FTS-PLATFORM {
        string platform_id
        json configuration
        array services
    }
    
    PSP-INSTANCE {
        string psp_code PK
        string schema_name
        string owner_email
        string status
        json branding
    }
    
    MERCHANT {
        string merchant_id PK
        string psp_code FK
        string status
        json compliance
    }
    
    TRANSACTION {
        string transaction_id PK
        string psp_code FK
        string merchant_id FK
        decimal amount
        string status
    }
\`\`\`

### Technology Stack

#### Frontend Layer
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query (TanStack)
- **Routing:** React Router v6
- **Charts:** Recharts + Framer Motion

#### Backend Layer
- **Runtime:** Deno 2.0 (secure TypeScript/JavaScript)
- **API:** RESTful functions (serverless)
- **Database:** PostgreSQL 15+ (multi-schema)
- **Caching:** In-memory + CDN edge caching
- **Queue:** Event-driven webhooks

#### Infrastructure
- **Cloud:** Multi-cloud (AWS, GCP, Azure, Alibaba, Oracle)
- **CDN:** Global edge network
- **Security:** PCI DSS Level 1, SOC 2 Type II
- **Monitoring:** Real-time health checks
- **Backup:** Automated daily + point-in-time recovery

#### Integration Layer
- **Payment Networks:** Direct acquirer integrations
- **Standards:** ISO 20022, ISO 8583, SWIFT MT
- **Crypto:** Bitcoin, Ethereum, stablecoin support
- **Compliance:** GLEIF (LEI), KYB/AML providers

---

## Platform Services

### 1. PSP Provisioning Service

**Deployment Model:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> CommunityRegistration
    CommunityRegistration --> ServiceSelection
    ServiceSelection --> ConfigurationWizard
    ConfigurationWizard --> ComplianceCheck
    ComplianceCheck --> SchemaProvisioning
    SchemaProvisioning --> CloudDeployment
    CloudDeployment --> AdminUserSetup
    AdminUserSetup --> DomainConfiguration
    DomainConfiguration --> TestingValidation
    TestingValidation --> GoLive
    GoLive --> [*]
    
    note right of ComplianceCheck
        LEI/vLEI verification
        KYB screening
        License validation
    end note
    
    note right of SchemaProvisioning
        Create isolated schema
        Provision tables
        Set RLS policies
    end note
\`\`\`

**Provisioned Components:**
- Isolated database schema
- Admin portal (white-labeled)
- Merchant portal (customizable)
- Virtual terminal
- Payment APIs (REST + GraphQL)
- Webhook infrastructure
- Reporting dashboard
- Compliance toolkit

**Deployment Time:** 24-48 hours  
**Customization Level:** 80% white-label capability

### 2. ISO Gateway Service

**Purpose:** Enterprise-grade message translation between payment standards

**Supported Standards:**
- ISO 8583 (card networks)
- ISO 20022 (modern banking)
- SWIFT MT (103, 202, 940)
- Proprietary formats

**Key Features:**
\`\`\`mermaid
flowchart LR
    A[Incoming Message] --> B{Detect Format}
    B -->|ISO 8583| C[Parse 8583]
    B -->|ISO 20022| D[Parse XML]
    B -->|SWIFT MT| E[Parse MT]
    
    C --> F[Enrichment Engine]
    D --> F
    E --> F
    
    F --> G[LEI Lookup]
    F --> H[BIC Validation]
    F --> I[Purpose Codes]
    
    G --> J{Target Format}
    H --> J
    I --> J
    
    J -->|ISO 20022| K[Generate XML]
    J -->|ISO 8583| L[Generate Binary]
    J -->|SWIFT MT| M[Generate MT]
    
    K --> N[Validate & Route]
    L --> N
    M --> N
\`\`\`

**Performance:**
- Latency: <50ms (p99)
- Throughput: 10K messages/sec per instance
- Availability: 99.99% SLA

**Pricing Model:**
- **Developer:** $99/mo (1K messages)
- **Business:** $499/mo (50K messages)
- **Enterprise:** Custom (unlimited)

### 3. Orchestration Service

**Purpose:** Intelligent payment routing and failover management

\`\`\`mermaid
graph TB
    A[Payment Request] --> B[Rule Engine]
    B --> C{Evaluate Rules}
    
    C -->|Currency| D[Currency Filter]
    C -->|Amount| E[Amount Filter]
    C -->|Geography| F[Country Filter]
    C -->|Time| G[Business Hours]
    C -->|Cost| H[Cost Optimizer]
    C -->|Success Rate| I[Performance Filter]
    
    D --> J[Route Scoring]
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

**Routing Strategies:**
- **Cost Optimization:** Route to lowest-cost provider
- **Performance:** Route to highest success rate
- **Load Balance:** Distribute across providers
- **Failover:** Automatic retry on failure
- **Custom Rules:** Business logic routing

**Integration Points:**
- Payment providers (150+)
- Payout routes (global)
- Fraud detection
- Currency conversion

### 4. Service Marketplace

**Categories:**
1. **Payment Rails** (60+ providers)
   - Card networks (Visa, Mastercard, Amex)
   - Bank transfers (ACH, SEPA, SWIFT)
   - Digital wallets (PayPal, Apple Pay, Google Pay)
   - Buy Now Pay Later (Klarna, Affirm)
   - Crypto (Bitcoin, Ethereum, stablecoins)

2. **Compliance & Security** (20+ services)
   - KYB verification (TheKYB, Onfido)
   - AML screening (ComplyAdvantage, Refinitiv)
   - Fraud detection (Sift, Kount)
   - 3D Secure (Visa, Mastercard)

3. **Payout Routes** (40+ methods)
   - Bank transfers (global)
   - Instant payouts
   - Card disbursements
   - Crypto payouts

4. **Developer Tools** (30+ services)
   - API management
   - Webhook monitoring
   - Transaction analytics
   - Custom reporting

---

## Compliance & Security

### Certifications & Standards

\`\`\`mermaid
mindmap
  root((FTS Compliance))
    PCI DSS
      Level 1 Certified
      Annual Audits
      Quarterly Scans
      256-bit Encryption
    ISO Standards
      ISO 20022 Compliant
      ISO 8583 Support
      ISO 23257 Crypto
      ISO 27001 InfoSec
    Data Protection
      GDPR Compliant
      CCPA Ready
      Data Residency
      Right to Delete
    Financial
      LEI Registered
      vLEI Enabled
      SOC 2 Type II
      Annual Audits
    Regional
      EU MiFID II
      UK FCA Guidelines
      US FinCEN
      APAC Regulations
\`\`\`

### Security Architecture

**Layer 1: Network Security**
- DDoS protection (Cloudflare Enterprise)
- WAF rules (OWASP Top 10)
- Rate limiting per IP/user
- Geo-blocking for restricted regions

**Layer 2: Application Security**
- Role-Based Access Control (RBAC)
- Multi-Factor Authentication (MFA)
- Session management (JWT tokens)
- API key rotation

**Layer 3: Data Security**
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Tokenization for card data
- Key management (HSM)

**Layer 4: Database Security**
- Schema isolation (multi-tenancy)
- Row-Level Security (RLS)
- Audit logging (immutable)
- Automated backups (point-in-time)

### LEI/vLEI Integration

**Why LEI Matters:**
- Global entity identification
- MiFID II/EMIR compliance
- Cross-border transaction trust
- Reduced settlement risk

**FTS Implementation:**
\`\`\`mermaid
sequenceDiagram
    participant PSP as PSP Instance
    participant FTS as FTS Platform
    participant GLEIF as GLEIF Registry
    participant Customer as End Customer
    
    PSP->>FTS: Request LEI
    FTS->>GLEIF: Verify Organization
    GLEIF-->>FTS: LEI + Credentials
    FTS->>FTS: Issue vLEI
    FTS-->>PSP: vLEI Certificate
    
    PSP->>Customer: Present vLEI
    Customer->>GLEIF: Verify Chain
    GLEIF-->>Customer: Validated
    Customer->>PSP: Trust Established
\`\`\`

**Grace Period:** 6 months from provisioning to obtain LEI/vLEI

---

## Business Model & Pricing

### Revenue Streams

#### 1. PSP Licensing (SaaS)
| Tier | Monthly Fee | Merchants | Transactions | Features |
|------|------------|-----------|--------------|----------|
| **Starter** | $499 | 25 | 5K/mo | Basic features |
| **Professional** | $1,999 | 100 | 50K/mo | Advanced routing |
| **Enterprise** | Custom | Unlimited | Unlimited | Full customization |

#### 2. Transaction Fees
- **Revenue Share:** 10-15% of PSP's transaction fees
- **Per-Transaction:** $0.01-0.05 per transaction
- **Volume Discounts:** Tiered pricing at scale

#### 3. Service Marketplace
- **Commission:** 15-30% on third-party services
- **Listing Fee:** $0 (free marketplace)
- **Premium Placement:** $500-2K/month

#### 4. ISO Gateway Service
- **Subscription:** $99-$2,999/month
- **Message Fees:** $0.001-0.01 per message
- **Enrichment Add-ons:** $0.0001-0.0003 per enrichment

#### 5. Orchestration Service
- **Subscription:** $199-$4,999/month
- **Routing Fees:** $0.001 per execution
- **Smart Features:** Premium tier

#### 6. Professional Services
- **Custom Integration:** $10K-100K
- **White-Label Branding:** $5K-25K
- **Training & Support:** $2K-10K/month

### Target Market Segments

\`\`\`mermaid
pie title Revenue by Customer Segment
    "FinTech Startups" : 35
    "Banks & FIs" : 25
    "Enterprise SaaS" : 20
    "Marketplaces" : 15
    "Other" : 5
\`\`\`

#### 1. FinTech Startups (35% of revenue)
- **Pain Point:** Cannot afford to build PSP infrastructure
- **FTS Solution:** Launch-ready PSP in 48 hours
- **Typical Deal:** $2K-10K/month

#### 2. Traditional Banks (25% of revenue)
- **Pain Point:** Legacy systems incompatible with modern standards
- **FTS Solution:** ISO Gateway for message translation
- **Typical Deal:** $50K-500K/year

#### 3. Enterprise SaaS (20% of revenue)
- **Pain Point:** Need payment infrastructure without becoming a PSP
- **FTS Solution:** White-label payment acceptance
- **Typical Deal:** $10K-100K/month

#### 4. Marketplaces (15% of revenue)
- **Pain Point:** Complex multi-party payments (split payments, escrow)
- **FTS Solution:** Orchestration + sub-merchant management
- **Typical Deal:** $5K-50K/month

#### 5. Crypto Exchanges (5% of revenue)
- **Pain Point:** Fiat on/off ramps compliance
- **FTS Solution:** ISO 23257 crypto payments + compliance
- **Typical Deal:** $20K-200K/month

---

## Roadmap & Future Vision

### 2025 Q1-Q2: Foundation Solidification
- ✅ Multi-tenant PSP provisioning
- ✅ ISO Gateway Service (GA)
- ✅ Orchestration Service (GA)
- ✅ Community Portal
- ✅ Service Marketplace (150+ services)
- 🔄 LEI/vLEI integration (in progress)
- 🔄 Advanced compliance dashboard

### 2025 Q3-Q4: Scale & Intelligence
- 🚀 AI-powered fraud detection
- 🚀 Predictive routing optimization
- 🚀 Automated compliance reporting
- 🚀 Real-time analytics dashboard
- 🚀 Mobile SDKs (iOS, Android)
- 🚀 Crypto DeFi integrations

### 2026: Global Expansion
- 🌍 APAC market entry (Singapore, Japan, Australia)
- 🌍 MENA region expansion (UAE, Saudi Arabia)
- 🌍 LatAm partnerships (Brazil, Mexico)
- 🌍 Local currency support (50+ currencies)
- 🌍 Regional compliance automation

### 2026-2027: Platform Evolution
- 🔮 **FTS OS** - Open-source payment SDK
- 🔮 **Embedded Finance** - Payment infrastructure for any app
- 🔮 **Central Bank Digital Currency (CBDC)** integration
- 🔮 **Cross-border instant settlements** (<1 second)
- 🔮 **AI Agent Payments** - Autonomous payment routing
- 🔮 **Quantum-safe cryptography** implementation

### Long-Term Vision (2028+)

**"The Universal Payment Operating System"**

\`\`\`mermaid
timeline
    title FTS.Money Evolution
    2024 : PSP Infrastructure Launch
         : 10 customers
         : $500K ARR
    2025 : Service Marketplace
         : 100 customers
         : $5M ARR
    2026 : Global Expansion
         : 500 customers
         : $25M ARR
    2027 : Platform Dominance
         : 2000 customers
         : $100M ARR
    2028+ : Payment OS Standard
          : 10000+ customers
          : $500M+ ARR
\`\`\`

**Ultimate Goal:** Become the **AWS of Payments** - where any business can deploy payment infrastructure in minutes, scale globally without friction, and maintain full ownership and control.

---

## Key Differentiators

### 1. True White-Label Ownership
- **Not a reseller:** You own your brand, data, customers
- **Full customization:** Branding, features, pricing
- **No hidden fees:** Transparent pricing model

### 2. ISO Standards Native
- **Built on standards:** ISO 20022, 8583, 23257, 24165
- **Future-proof:** Automatic updates to new standards
- **Interoperability:** Connect to any financial institution

### 3. Multi-Service Architecture
- **One platform, multiple services:**
  - PSP infrastructure
  - ISO message gateway
  - Smart orchestration
  - Service marketplace
- **Modular adoption:** Use what you need, when you need it

### 4. Enterprise-Grade Security
- **PCI DSS Level 1** from day one
- **Multi-tenant isolation** (schema-level)
- **Compliance automation** (KYB, AML, LEI)
- **Audit trail** (immutable logs)

### 5. Developer-First Approach
- **Modern APIs** (REST, GraphQL, Webhooks)
- **Comprehensive documentation**
- **SDKs** (JavaScript, Python, Ruby, Go)
- **Sandbox environment** (unlimited testing)

### 6. Intelligent Routing
- **Cost optimization:** Save 10-30% on fees
- **Success rate optimization:** 2-5% approval lift
- **Automatic failover:** 99.99% uptime
- **Custom rules:** Business logic routing

---

## Success Metrics

### Platform Performance
- **Uptime:** 99.99% (4 nines)
- **Latency:** <100ms (p95), <500ms (p99)
- **Throughput:** 100K TPS (transactions per second)
- **Data Durability:** 99.999999999% (11 nines)

### Customer Success
- **Time to Go-Live:** 24-48 hours (vs. 18-36 months)
- **Cost Reduction:** 90% vs. custom build
- **Approval Rate Lift:** 2-5% vs. single provider
- **Support Response:** <2 hours (business hours)

### Business Growth
- **Customer Acquisition Cost (CAC):** $5K-15K
- **Lifetime Value (LTV):** $100K-500K
- **Churn Rate:** <5% annually
- **Net Revenue Retention:** 120%+

---

## Getting Started

### For PSP Owners
1. Register on Community Portal
2. Select PSP tier (Starter/Pro/Enterprise)
3. Complete compliance verification
4. Provision instance (24-48 hours)
5. Configure branding & features
6. Launch & onboard first merchant

### For Developers
1. Access API documentation
2. Create sandbox account
3. Generate API keys
4. Integrate payment flows
5. Test in sandbox environment
6. Go live with production keys

### For Enterprises
1. Schedule architecture review call
2. Define requirements & SLAs
3. Custom deployment plan
4. Dedicated onboarding team
5. Training & knowledge transfer
6. Go-live with support

---

## Contact & Support

**Sales:** sales@fts.money  
**Support:** support@fts.money  
**Documentation:** docs.fts.money  
**Status Page:** status.fts.money  

**Headquarters:** San Francisco, CA  
**Regional Offices:** London, Singapore, Sydney  

**24/7 Emergency Support:** Available for Enterprise tier

---

## Appendix: Technical Glossary

- **PSP:** Payment Service Provider
- **ISO 20022:** Modern XML-based payment messaging standard
- **ISO 8583:** Binary message standard for card transactions
- **LEI:** Legal Entity Identifier (20-character code)
- **vLEI:** Verifiable LEI (digital certificate)
- **PCI DSS:** Payment Card Industry Data Security Standard
- **Multi-Tenancy:** Single platform serving multiple isolated customers
- **Schema Isolation:** Database-level data separation
- **Orchestration:** Intelligent routing of payment requests
- **Failover:** Automatic retry on payment failure

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Next Review:** March 2026  
**Owner:** FTS.Money Product Team
`;

export default FTSOverviewDoc;
