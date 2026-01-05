const FTSOverviewDoc = `# FTS.Money Platform Overview
## Enterprise Payment Infrastructure Ecosystem

**Version:** 3.0  
**Classification:** Public - Business & Technical  
**Last Updated:** January 5, 2026  
**Document Owner:** FTS.Money Product Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Vision & Mission](#vision--mission)
3. [Platform Architecture](#platform-architecture)
4. [Authentication & Portal Ecosystem](#authentication--portal-ecosystem)
5. [White-Label Infrastructure Services](#white-label-infrastructure-services)
6. [Core Platform Services](#core-platform-services)
7. [Compliance & Standards](#compliance--standards)
8. [Technology Stack](#technology-stack)
9. [Getting Started](#getting-started)
10. [Integration Guide](#integration-guide)

---

## Executive Summary

### Who is FTS.Money?

FTS.Money is an **Enterprise Payment Infrastructure Provider** that delivers white-labeled, production-ready payment technology to businesses worldwide. We are not a PSP ourselves—we enable organizations to become payment infrastructure providers by offering them the complete technology stack, compliance framework, and operational infrastructure required to launch and scale payment services.

### What We Provide

**Complete White-Label Infrastructure:**
- ✅ **PSP Platform** - Launch payment service provider operations in 24-48 hours
- ✅ **VASP Platform** - Complete crypto banking infrastructure (wallets, IBANs, cards, compliance)
- ✅ **ISO Gateway** - Message translation between payment standards (ISO 8583, ISO 20022, SWIFT MT)
- ✅ **Orchestration Engine** - Intelligent multi-processor payment routing and optimization
- ✅ **RWA Platform** - Real-world asset tokenization infrastructure (treasury bills, real estate, credit)
- ✅ **VAT/Tax Management** - Global tax compliance with automated calculation and reporting
- ✅ **E-Invoicing System** - Multi-standard electronic invoicing (Peppol, ZATCA, FatturaPA, CFDI)
- ✅ **Service Marketplace** - 150+ pre-integrated payment providers and compliance services

### The Problem We Solve

**Traditional Infrastructure Development:**
- **Cost:** $10M-$50M capital investment over 2-3 years
- **Time:** 18-36 months minimum development timeline
- **Team:** 50-200 engineers, compliance officers, DevOps specialists
- **Risk:** Regulatory complexity, payment network access, security certification
- **Maintenance:** Ongoing $5M-$15M/year operational costs

**FTS.Money Solution:**
- **Cost:** $499-$50,000/month subscription (99% cost reduction)
- **Time:** 24 hours to 2 weeks depending on service (95% faster)
- **Team:** Use our infrastructure with your brand
- **Risk:** Compliance built-in, networks pre-connected
- **Maintenance:** Fully managed by FTS.Money team

### Core Value Propositions

#### 1. White-Label Infrastructure
Every service we provide can be completely branded as your own:
- Custom domains (yourcompany.com)
- Your logo, colors, and branding
- Your customer support
- Your pricing structure
- Your brand identity—our technology

#### 2. Multi-Service Platform
Combine any services to create unique offerings:
- PSP + VAT + E-Invoicing = Complete EU payment compliance
- VASP + RWA = Regulated asset tokenization with crypto
- ISO Gateway + Orchestration = Legacy system modernization
- Payment Processing + Crypto = Hybrid fiat/crypto acceptance

#### 3. Global Compliance
All services include regulatory compliance:
- PCI DSS Level 1 (Payment card security)
- ISO 20022/8583/23257 (Payment messaging standards)
- GDPR/CCPA (Data protection)
- FATF Travel Rule (Crypto compliance)
- MiCA/5AMLD/6AMLD (EU crypto regulation)
- Peppol/ZATCA/FatturaPA (E-invoicing standards)

#### 4. Institutional-Grade Technology
Bank-level infrastructure accessible to all:
- 99.99% uptime SLA
- Sub-200ms transaction processing
- Auto-scaling global infrastructure
- Enterprise security and encryption
- Real-time monitoring and alerts

---

## Vision & Mission

### Vision Statement

**"To democratize enterprise payment infrastructure, enabling any organization to launch world-class financial services under their own brand."**

### Mission

We empower businesses to:

1. **Launch Instantly** - Deploy production-ready infrastructure in hours/days
2. **Own Your Brand** - White-label everything as your own technology
3. **Scale Globally** - From startup to enterprise with the same platform
4. **Stay Compliant** - Built-in regulatory adherence across all jurisdictions
5. **Innovate Freely** - Combine services to create unique market offerings

### Strategic Positioning

FTS.Money is positioned as an **Infrastructure-as-a-Service (IaaS) provider** for the payments industry:

\`\`\`mermaid
graph TB
    subgraph "Traditional Market"
        TRAD1[Payment Processors<br/>Stripe, Adyen, Square]
        TRAD2[You are their customer<br/>Use their brand]
    end
    
    subgraph "FTS.Money Model"
        FTS1[Infrastructure Provider<br/>FTS.Money]
        FTS2[You are the provider<br/>Your brand, your customers]
    end
    
    subgraph "Market Comparison"
        AWS[Amazon Web Services<br/>vs Building Data Center]
        FTS[FTS.Money<br/>vs Building Payment Stack]
    end
    
    TRAD1 --> TRAD2
    FTS1 --> FTS2
    AWS -.->|Same Model| FTS
    
    style FTS1 fill:#2563eb,color:#fff
    style FTS2 fill:#10b981,color:#fff
\`\`\`

**Analogy:** AWS democratized cloud computing by providing enterprise infrastructure as a service. FTS.Money does the same for payment infrastructure.

---

## Platform Architecture

### Complete System Architecture

\`\`\`mermaid
graph TB
    subgraph "Portal Ecosystem - Multi-Tenant Authentication"
        AUTH[Unified Auth System<br/>Multi-Portal SSO]
        
        P1[FTS Control Panel<br/>Platform Administration]
        P2[Community Portal<br/>Self-Service Provisioning]
        P3[PSP Portal<br/>Payment Operations]
        P4[Merchant Portal<br/>Merchant Self-Service]
        P5[VASP Portal<br/>Crypto Banking]
        P6[ISO Gateway Portal<br/>Message Translation]
        P7[Orchestration Portal<br/>Routing Management]
        P8[RWA Portal<br/>Asset Tokenization]
        P9[Virtual Terminal<br/>Manual Payments]
    end
    
    subgraph "Core Infrastructure Services"
        S1[PSP Provisioning Engine<br/>Automated Deployment]
        S2[Payment Processing Core<br/>Transaction Engine]
        S3[VASP Infrastructure<br/>Crypto Banking Stack]
        S4[ISO Message Gateway<br/>Standards Translation]
        S5[Orchestration Engine<br/>Smart Routing]
        S6[RWA Tokenization<br/>Asset Platform]
    end
    
    subgraph "Financial & Compliance Services"
        C1[VAT/Tax Engine<br/>Global Compliance]
        C2[E-Invoicing System<br/>Multi-Standard]
        C3[KYC/KYB Verification<br/>Identity Services]
        C4[AML/CFT Screening<br/>Sanctions/PEP]
        C5[Travel Rule Engine<br/>IVMS101 Protocol]
        C6[LEI/vLEI Integration<br/>GLEIF Verification]
    end
    
    subgraph "Data & Analytics Layer"
        D1[Multi-Tenant Database<br/>Schema Isolation]
        D2[Transaction Ledger<br/>Immutable Log]
        D3[Analytics Engine<br/>Real-Time Metrics]
        D4[Audit Trail System<br/>Compliance Logs]
        D5[Reporting Engine<br/>Financial Reports]
    end
    
    subgraph "External Integration Layer"
        E1[150+ Payment Providers<br/>Cards/Wallets/Banks]
        E2[Card Networks<br/>Visa/Mastercard/Amex]
        E3[Blockchain Networks<br/>BTC/ETH/SOL]
        E4[Banking Partners<br/>SEPA/SWIFT]
        E5[Government Gateways<br/>Tax Authorities]
        E6[Compliance APIs<br/>GLEIF/Sanctions]
    end
    
    AUTH --> P1
    AUTH --> P2
    AUTH --> P3
    AUTH --> P4
    AUTH --> P5
    AUTH --> P6
    AUTH --> P7
    AUTH --> P8
    AUTH --> P9
    
    P1 --> S1
    P1 --> S2
    P1 --> S3
    P2 --> S1
    P3 --> S2
    P4 --> S2
    P5 --> S3
    P6 --> S4
    P7 --> S5
    P8 --> S6
    P9 --> S2
    
    S1 --> D1
    S2 --> D2
    S3 --> D2
    S4 --> D2
    S5 --> D2
    S6 --> D2
    
    S2 --> C1
    S2 --> C2
    S3 --> C3
    S3 --> C4
    S3 --> C5
    S3 --> C6
    S6 --> C3
    
    D2 --> D3
    D2 --> D4
    D3 --> D5
    
    S2 --> E1
    S2 --> E2
    S3 --> E3
    S4 --> E4
    C2 --> E5
    C6 --> E6
    
    style AUTH fill:#8b5cf6,color:#fff
    style S3 fill:#3b82f6,color:#fff
    style C1 fill:#06b6d4,color:#fff
    style D1 fill:#10b981,color:#fff
\`\`\`

### Service Interoperability Matrix

Every FTS.Money service is designed to work seamlessly with others:

| Service | Works With | Integration Point | Value Created |
|---------|------------|-------------------|---------------|
| **PSP Platform** | All services | Central hub | Foundation for all operations |
| **VASP Platform** | Payment Processing, KYC, AML, Travel Rule, RWA | Crypto-fiat bridge | Complete crypto banking |
| **ISO Gateway** | Payment Processing, Orchestration, Settlement | Message translation | Legacy modernization |
| **Orchestration** | Payment Processing, ISO Gateway, Multiple processors | Routing logic | Cost optimization, resilience |
| **RWA Platform** | VASP, KYC, Payment Rails, Compliance | Asset backing, settlements | Tokenized finance |
| **VAT/Tax** | Payment Processing, E-Invoicing, Reporting | Tax calculation | Automated compliance |
| **E-Invoicing** | VAT/Tax, Payment Processing, Government APIs | Invoice generation | Regulatory submission |

---

## Authentication & Portal Ecosystem

### Unified Authentication Architecture

FTS.Money implements a sophisticated multi-portal authentication system that enables users to access different services based on their roles and subscriptions while maintaining strong security and tenant isolation.

\`\`\`mermaid
graph TB
    subgraph "User Authentication Flows"
        U1[Platform Admin<br/>FTS Staff]
        U2[Community User<br/>Service Buyer]
        U3[PSP Staff<br/>Payment Operator]
        U4[Merchant User<br/>Payment Acceptor]
        U5[VASP Customer<br/>Crypto Banking]
        U6[ISO Gateway User<br/>Message Translation]
        U7[Orchestration User<br/>Routing Manager]
        U8[RWA Participant<br/>Asset Investor/Issuer]
    end
    
    subgraph "Authentication Service"
        AUTH[Central Auth Service]
        SESSION[Session Manager]
        MFA[2FA/MFA Engine]
        RBAC[Role-Based Access Control]
    end
    
    subgraph "Portal Routing"
        ROUTER[Portal Router]
        P1[platform.fts.money]
        P2[community.fts.money]
        P3[psp.yourcompany.com]
        P4[merchants.yourcompany.com]
        P5[crypto.fts.money]
        P6[iso.fts.money]
        P7[orchestration.fts.money]
        P8[rwa.fts.money]
    end
    
    subgraph "Session Storage"
        LOCAL[localStorage<br/>Client-Side]
        REDIS[Redis<br/>Server-Side]
        JWT[JWT Tokens<br/>Stateless Auth]
    end
    
    U1 --> AUTH
    U2 --> AUTH
    U3 --> AUTH
    U4 --> AUTH
    U5 --> AUTH
    U6 --> AUTH
    U7 --> AUTH
    U8 --> AUTH
    
    AUTH --> SESSION
    AUTH --> MFA
    AUTH --> RBAC
    
    SESSION --> LOCAL
    SESSION --> REDIS
    SESSION --> JWT
    
    RBAC --> ROUTER
    ROUTER --> P1
    ROUTER --> P2
    ROUTER --> P3
    ROUTER --> P4
    ROUTER --> P5
    ROUTER --> P6
    ROUTER --> P7
    ROUTER --> P8
    
    style AUTH fill:#8b5cf6,color:#fff
    style RBAC fill:#f59e0b,color:#fff
    style ROUTER fill:#2563eb,color:#fff
\`\`\`

### Portal-Specific Authentication Flows

#### Platform Admin Login Flow
\`\`\`mermaid
sequenceDiagram
    participant Admin as Platform Admin
    participant Login as PlatformAdminLogin Page
    participant Auth as Auth Service
    participant MFA as 2FA Service
    participant DB as User Database
    participant Portal as FTS Control Panel
    
    Admin->>Login: Enter Email + Password
    Login->>Auth: POST /auth/platform-admin
    Auth->>DB: Verify Credentials
    
    alt Invalid Credentials
        DB-->>Auth: Invalid
        Auth-->>Login: Login Failed
        Login->>Admin: Show Error
    else Valid Credentials
        DB-->>Auth: User Found
        Auth->>MFA: Generate 2FA Code
        MFA->>Admin: Send Code (Email/SMS)
        
        Admin->>Login: Enter 2FA Code
        Login->>MFA: Verify Code
        
        alt Code Invalid
            MFA-->>Login: Invalid Code
            Login->>Admin: Show Error
        else Code Valid
            MFA-->>Auth: Verified
            Auth->>Auth: Generate JWT Token
            Auth->>Auth: Create Session
            Auth-->>Login: Token + Session Data
            
            Login->>Login: Store in localStorage
            Login->>Portal: Redirect to Control Panel
            Portal->>Portal: Load Admin Dashboard
        end
    end
\`\`\`

#### PSP Staff Login Flow
\`\`\`mermaid
sequenceDiagram
    participant Staff as PSP Staff Member
    participant Login as PSPLogin Page
    participant Auth as Auth Service
    participant DB as PSP Database (Tenant Schema)
    participant Portal as PSP Portal
    
    Staff->>Login: Enter PSP Code
    Login->>Login: Validate PSP Code Format
    
    alt Invalid PSP Code
        Login->>Staff: "Invalid PSP Code"
    else Valid PSP Code
        Login->>Auth: POST /auth/psp/{psp_code}
        Auth->>DB: Switch to PSP Schema
        
        Staff->>Login: Enter Email + Password
        Login->>Auth: Verify in PSP Schema
        Auth->>DB: SELECT FROM psp_{code}.users
        
        alt User Not Found
            DB-->>Auth: No Match
            Auth-->>Login: Login Failed
            Login->>Staff: "Invalid Credentials"
        else User Found
            DB-->>Auth: User Data + Role
            Auth->>Auth: Generate Session
            Auth-->>Login: Session Token
            
            Login->>Login: Store psp_code + session
            Login->>Portal: Redirect to PSP Dashboard
            Portal->>Portal: Load PSP-Specific Data
        end
    end
\`\`\`

#### VASP Customer Login Flow
\`\`\`mermaid
sequenceDiagram
    participant Cust as VASP Customer
    participant Login as CryptoGatewayLogin
    participant Auth as Auth Service
    participant LEI as GLEIF LEI Verification
    participant TAS as Trust Anchor Service
    participant KYC as KYC Service
    participant Portal as VASP Portal
    
    Cust->>Login: Enter Email + Password
    Login->>Auth: POST /auth/vasp-customer
    Auth->>Auth: Verify Credentials
    
    alt First-Time Login
        Auth->>Auth: Check Identity Credentials
        
        alt Has TAS ID
            Auth->>TAS: Verify TAS Credential
            TAS-->>Auth: Verified + vLEI
            Auth->>Auth: Grant Full Access
            Auth-->>Login: Session (Full Access)
            
        else Has LEI Only
            Auth->>LEI: Verify via GLEIF API
            LEI-->>Auth: LEI Valid
            Auth->>KYC: Initiate KYB Process
            KYC-->>Auth: KYB Required
            Auth-->>Login: Session (KYB Pending)
            Login->>Portal: Show KYB Form
            
        else No Credentials
            Auth->>Auth: Grant Grace Period (90 days)
            Auth-->>Login: Session (Limited Access)
            Login->>Portal: Show Grace Period Banner
        end
        
    else Returning User
        Auth->>Auth: Load Customer Profile
        Auth-->>Login: Session Token
        Login->>Portal: Redirect to Dashboard
    end
\`\`\`

#### Merchant Portal Login Flow
\`\`\`mermaid
sequenceDiagram
    participant Merch as Merchant User
    participant Login as MerchantLogin Page
    participant Auth as Auth Service
    participant PSP as PSP Schema
    participant VT as Virtual Terminal Check
    participant Portal as Merchant Portal
    
    Merch->>Login: Enter Merchant Code
    Login->>Auth: Validate Merchant Code
    Auth->>PSP: Lookup Merchant
    
    alt Merchant Not Found
        PSP-->>Auth: Not Found
        Auth-->>Login: Invalid Code
    else Merchant Found
        PSP-->>Auth: Merchant Data
        
        Merch->>Login: Enter Email + Password
        Login->>Auth: Verify Credentials
        Auth->>PSP: SELECT FROM merchant_users
        
        alt Invalid Login
            PSP-->>Auth: No Match
            Auth-->>Login: Login Failed
        else Valid Login
            PSP-->>Auth: User + Role + Permissions
            Auth->>VT: Check VT Access
            
            alt Has VT Access
                VT-->>Auth: VT Enabled
                Auth->>Auth: Include VT Permissions
            end
            
            Auth-->>Login: Session + Permissions
            Login->>Portal: Redirect with Session
            Portal->>Portal: Load Merchant Dashboard
        end
    end
\`\`\`

### Portal Ecosystem Overview

\`\`\`mermaid
graph TB
    subgraph "Platform Level - FTS.Money Internal"
        CP[FTS Control Panel<br/>platform.fts.money<br/>Platform Administration]
    end
    
    subgraph "Customer Self-Service Level"
        COM[Community Portal<br/>community.fts.money<br/>Service Provisioning]
    end
    
    subgraph "White-Label Service Portals"
        PSP[PSP Portal<br/>psp-{code}.fts.money<br/>Payment Operations]
        VASP[VASP Portal<br/>crypto.fts.money<br/>Crypto Banking]
        ISO[ISO Gateway Portal<br/>iso-{customer}.fts.money<br/>Message Translation]
        ORCH[Orchestration Portal<br/>orch-{customer}.fts.money<br/>Routing Rules]
        RWA[RWA Platform Portal<br/>rwa-{provider}.fts.money<br/>Asset Management]
    end
    
    subgraph "End-User Portals"
        MERCH[Merchant Portal<br/>merchants.{psp}.com<br/>Merchant Self-Service]
        VT[Virtual Terminal<br/>vt.{psp}.com<br/>Manual Payment Processing]
        INV[Investor Portal<br/>invest.{rwa}.com<br/>Asset Investment]
        ISS[Issuer Portal<br/>issue.{rwa}.com<br/>Asset Tokenization]
    end
    
    CP -->|Provisions & Manages| PSP
    CP -->|Provisions & Manages| VASP
    CP -->|Provisions & Manages| ISO
    CP -->|Provisions & Manages| ORCH
    CP -->|Provisions & Manages| RWA
    
    COM -->|Subscribe to Services| PSP
    COM -->|Subscribe to Services| VASP
    COM -->|Subscribe to Services| ISO
    COM -->|Subscribe to Services| ORCH
    COM -->|Subscribe to Services| RWA
    
    PSP -->|Creates & Manages| MERCH
    PSP -->|Provisions| VT
    RWA -->|Onboards| INV
    RWA -->|Onboards| ISS
    
    MERCH -.->|Uses| VT
    
    style CP fill:#ef4444,color:#fff
    style COM fill:#8b5cf6,color:#fff
    style PSP fill:#2563eb,color:#fff
    style VASP fill:#0ea5e9,color:#fff
    style MERCH fill:#10b981,color:#fff
\`\`\`

### Cross-Portal Single Sign-On (SSO)

For enterprise customers with multiple FTS.Money services:

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal1 as PSP Portal
    participant SSO as SSO Service
    participant Portal2 as VASP Portal
    participant Portal3 as ISO Gateway Portal
    
    User->>Portal1: Login to PSP Portal
    Portal1->>SSO: Authenticate User
    SSO->>SSO: Generate Master Token
    SSO-->>Portal1: Session + Master Token
    
    Note over User,Portal3: User navigates to VASP Portal
    
    User->>Portal2: Access VASP Portal
    Portal2->>SSO: Check Master Token
    SSO->>SSO: Validate Token
    SSO->>SSO: Check VASP Subscription
    
    alt Has VASP Access
        SSO-->>Portal2: Authorized + Session
        Portal2->>User: Auto-Login to VASP
    else No VASP Access
        SSO-->>Portal2: Not Authorized
        Portal2->>User: "Subscribe to VASP Service"
    end
    
    Note over User,Portal3: User navigates to ISO Gateway
    
    User->>Portal3: Access ISO Gateway
    Portal3->>SSO: Check Master Token
    SSO-->>Portal3: Authorized + Session
    Portal3->>User: Auto-Login to ISO Gateway
\`\`\`

---

## White-Label Infrastructure Services

### 1. PSP Platform - Complete Payment Service Provider

**What It Is:**
A complete, production-ready payment service provider infrastructure that can be deployed and branded as your own PSP business in 24-48 hours.

**Full Feature Set:**

\`\`\`mermaid
mindmap
  root((PSP Platform))
    Payment Processing
      Card Payments
        Visa/Mastercard/Amex
        Debit/Credit/Prepaid
        Contactless/Chip/Swipe
      Alternative Methods
        Digital Wallets
        Bank Transfers
        Buy Now Pay Later
      Crypto Payments
        Bitcoin/Ethereum
        Stablecoins USDC/USDT
    Merchant Management
      Self-Service Onboarding
        KYB Verification
        Document Upload
        Pricing Configuration
      Account Management
        Multi-User Access
        Permission Control
        API Key Generation
      Settlement Control
        Automated Schedules
        Manual Payouts
        Fee Configuration
    Transaction Operations
      Real-Time Processing
        Authorization
        Capture/Void
        Refunds/Reversals
      Virtual Terminal
        Manual Entry
        Recurring Billing
        Invoice Payment
      Fraud Detection
        AI Risk Scoring
        Velocity Checks
        3D Secure 2.0
    Reporting & Analytics
      Financial Reports
        Daily/Monthly
        Settlement Reports
        Revenue Analytics
      Transaction Analytics
        Volume Trends
        Success Rates
        Customer Insights
      Compliance Reports
        PCI DSS
        Chargeback Ratios
        Audit Trails
    Developer Tools
      RESTful APIs
        Payment APIs
        Customer APIs
        Subscription APIs
      Webhooks
        Real-Time Events
        Retry Logic
        Signature Verification
      SDKs & Libraries
        Node.js/Python
        PHP/Ruby/Java
        Mobile SDKs
\`\`\`

**Deployment Timeline:**

\`\`\`mermaid
gantt
    title PSP Platform Provisioning Timeline
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Business Verification
    KYB Submission          :done, kyb1, 00:00, 10m
    Document Review         :done, kyb2, 00:10, 30m
    Sanctions Screening     :done, kyb3, 00:40, 10m
    Approval Decision       :done, kyb4, 00:50, 10m
    
    section Infrastructure Setup
    Create Tenant Schema    :done, inf1, 01:00, 2m
    Allocate Cloud Resources:done, inf2, 01:02, 5m
    Deploy Database Cluster :done, inf3, 01:07, 3m
    Configure Network       :done, inf4, 01:10, 2m
    
    section Application Deployment
    Deploy Core Services    :done, app1, 01:12, 10m
    Deploy Admin Portal     :done, app2, 01:22, 5m
    Deploy Merchant Portal  :done, app3, 01:27, 5m
    Deploy Virtual Terminal :done, app4, 01:32, 3m
    Deploy APIs             :done, app5, 01:35, 5m
    
    section Security Configuration
    Generate API Keys       :done, sec1, 01:40, 1m
    Configure SSL Certs     :done, sec2, 01:41, 2m
    Setup Firewall Rules    :done, sec3, 01:43, 2m
    Initialize Encryption   :done, sec4, 01:45, 1m
    
    section Validation
    Health Checks           :done, val1, 01:46, 4m
    API Testing             :done, val2, 01:50, 3m
    Integration Tests       :done, val3, 01:53, 5m
    
    section Finalization
    Generate Credentials    :done, fin1, 01:58, 1m
    Send Welcome Email      :done, fin2, 01:59, 1m
    
    section Total Time
    Complete Provisioning   :milestone, done, 02:00, 0m
\`\`\`

**Pricing Tiers:**

| Feature | Starter<br/>$499/mo | Professional<br/>$999/mo | Enterprise<br/>$4,999/mo |
|---------|---------------------|--------------------------|--------------------------|
| **Transactions/Month** | 1,000 | 50,000 | Unlimited |
| **Merchant Accounts** | 5 | Unlimited | Unlimited |
| **Geographic Regions** | 1 region | 2 regions | Global multi-region |
| **Payment Methods** | Cards only | Cards + APMs | Cards + APMs + Crypto |
| **Virtual Terminal** | ✅ Basic | ✅ Advanced | ✅ Enterprise |
| **Fraud Detection** | Rule-based | ML-powered | AI + manual review |
| **Settlement** | T+2 standard | T+1 priority | T+0 instant |
| **API Access** | REST | REST + GraphQL | REST + GraphQL + gRPC |
| **White-Label** | Basic branding | Full branding | Full + mobile apps |
| **Support** | Email (24h) | Priority 24/7 | Dedicated manager |
| **SLA** | 99.9% | 99.95% | 99.99% |

---

### 2. VASP Platform - Complete Crypto Banking Infrastructure

**What It Is:**
A fully-licensed, white-labeled Virtual Asset Service Provider (VASP) platform providing complete crypto banking services including multi-chain wallets, virtual IBANs, card issuance, and integrated AML/CFT compliance.

**This is NOT just a compliance module—it's a complete crypto banking stack.**

**Complete VASP Capabilities:**

\`\`\`mermaid
graph TB
    subgraph "Crypto Asset Management"
        W1[Multi-Chain Wallets<br/>BTC, ETH, SOL, AVAX]
        W2[Custodial & Non-Custodial<br/>User Choice]
        W3[HD Wallets<br/>Hierarchical Deterministic]
        W4[Multi-Sig Support<br/>Institutional Security]
        W5[Lightning Network<br/>Instant BTC Payments]
    end
    
    subgraph "Fiat Banking Rails"
        I1[Virtual IBANs<br/>Named SEPA Accounts]
        I2[SEPA Instant<br/>Real-Time Transfers]
        I3[SWIFT Integration<br/>International Wire]
        I4[Multi-Currency<br/>EUR/GBP/USD]
    end
    
    subgraph "Card Services"
        C1[Virtual Visa Cards<br/>Instant Issuance]
        C2[Physical Visa Cards<br/>5-7 Day Delivery]
        C3[Crypto-to-Fiat Spend<br/>Real-Time Conversion]
        C4[ATM Withdrawals<br/>Global Network]
        C5[Custom Card Design<br/>White-Label Branding]
    end
    
    subgraph "Exchange & Liquidity"
        X1[On-Ramp<br/>Fiat → Crypto]
        X2[Off-Ramp<br/>Crypto → Fiat]
        X3[Crypto-to-Crypto<br/>BTC/ETH/USDC/USDT]
        X4[Multi-Source Liquidity<br/>Best Rate Aggregation]
    end
    
    subgraph "Compliance & Security"
        K1[KYC/KYB Verification<br/>Automated + Manual]
        K2[AML/CFT Screening<br/>Sanctions/PEP/Adverse Media]
        K3[Travel Rule<br/>IVMS101 Protocol]
        K4[Transaction Monitoring<br/>Pattern Detection]
        K5[Blockchain Analytics<br/>On-Chain Risk Scoring]
        K6[LEI/vLEI Integration<br/>GLEIF Verification]
    end
    
    subgraph "Regulatory Licensing"
        L1[EU VASP License<br/>via Striga]
        L2[MiCA Compliant<br/>EU Crypto Regulation]
        L3[5AMLD/6AMLD<br/>Anti-Money Laundering]
        L4[GDPR Compliant<br/>Data Protection]
    end
    
    W1 --> X1
    I1 --> X1
    X1 --> C1
    C1 --> X2
    X2 --> I1
    
    K1 --> K2
    K2 --> K3
    K3 --> K4
    K4 --> K5
    K5 --> K6
    
    L1 --> L2
    L2 --> L3
    L3 --> L4
    
    style W1 fill:#f59e0b,color:#fff
    style I1 fill:#2563eb,color:#fff
    style C1 fill:#8b5cf6,color:#fff
    style K2 fill:#ef4444,color:#fff
    style L1 fill:#10b981,color:#fff
\`\`\`

**VASP Platform Pricing:**

| Tier | Monthly Fee | Setup Fee | Included Users | Max Daily Volume | White-Label | Support |
|------|-------------|-----------|----------------|------------------|-------------|---------|
| **Starter** | $2,500 | $500 | 100 | $100K | Basic | Email 24h |
| **Professional** | $5,000 | $2,000 | 1,000 | $1M | Full Portal | Priority 4h |
| **Enterprise** | $15,000 | $10,000 | Unlimited | Unlimited | Full + Mobile | Dedicated 1h |

**Usage Fees:**
- On/Off-Ramp: 1.5% per transaction (min $5)
- Crypto Exchange: 0.5%
- KYC Verification: $5 basic / $15 enhanced / $50 business
- Virtual Card Issuance: $8
- Physical Card Issuance: $20
- SEPA Transfer Out: €0.50
- SWIFT Transfer: $25

---

### 3. ISO Gateway - Payment Message Translation Service

**What It Is:**
Enterprise message translation gateway that converts between different payment messaging standards (ISO 8583, ISO 20022, SWIFT MT, proprietary formats) to enable interoperability between modern and legacy systems.

**Architecture & Message Flow:**

\`\`\`mermaid
graph LR
    subgraph "Input Sources"
        IN1[Legacy ATM/POS<br/>ISO 8583]
        IN2[Modern Banking<br/>ISO 20022]
        IN3[SWIFT Network<br/>MT Messages]
        IN4[Proprietary APIs<br/>Custom Formats]
    end
    
    subgraph "ISO Gateway Core"
        PARSE[Message Parser<br/>Multi-Format]
        VALID[Schema Validator<br/>Compliance Check]
        CANON[Canonical Format<br/>Internal Standard]
        TRANS[Protocol Translator<br/>Format Converter]
        ROUTE[Routing Engine<br/>Destination Logic]
        ENRICH[Data Enrichment<br/>Missing Fields]
        LOG[Message Logger<br/>Audit Trail]
    end
    
    subgraph "Output Destinations"
        OUT1[Card Network<br/>Visa/Mastercard]
        OUT2[Bank System<br/>Core Banking]
        OUT3[Payment Processor<br/>Modern PSP]
        OUT4[Clearing House<br/>Settlement]
    end
    
    IN1 --> PARSE
    IN2 --> PARSE
    IN3 --> PARSE
    IN4 --> PARSE
    
    PARSE --> VALID
    VALID --> CANON
    CANON --> TRANS
    TRANS --> ENRICH
    ENRICH --> ROUTE
    ROUTE --> LOG
    
    LOG --> OUT1
    LOG --> OUT2
    LOG --> OUT3
    LOG --> OUT4
    
    style PARSE fill:#2563eb,color:#fff
    style CANON fill:#10b981,color:#fff
    style TRANS fill:#f59e0b,color:#fff
\`\`\`

**Supported Message Formats:**

| Standard | Version | Use Case | Messages/Second | Latency |
|----------|---------|----------|-----------------|---------|
| **ISO 8583** | 1987/1993/2003 | Card transactions, ATM | 10,000 | <50ms |
| **ISO 20022** | Latest (2023+) | Bank transfers, SEPA, SWIFT | 5,000 | <100ms |
| **SWIFT MT** | MT103, MT940, MT202 | International wire transfers | 2,000 | <200ms |
| **SEPA** | SCT, SDD, Inst | Euro zone payments | 3,000 | <150ms |
| **Fedwire** | US Federal Reserve | US domestic wire | 1,000 | <300ms |

**ISO Gateway Pricing:**
- Setup Fee: $2,500
- Monthly Subscription: $499-$2,499 (based on volume)
- Per-Message Fee: $0.01-$0.10
- Volume Discounts: >100K messages/month
- Enterprise SLA: 99.99% uptime

---

### 4. Orchestration Engine - Intelligent Payment Routing

**What It Is:**
AI-powered payment orchestration platform that routes transactions across multiple processors to optimize success rates, minimize costs, and ensure business continuity through intelligent failover.

**Smart Routing Decision Engine:**

\`\`\`mermaid
flowchart TD
    A[Incoming Payment Request] --> B{Routing Strategy?}
    
    B -->|Cost Optimization| C[Calculate All Processor Costs]
    B -->|Success Rate| D[Check Historical Performance]
    B -->|Geographic| E[Analyze Card BIN + Customer Location]
    B -->|Load Balance| F[Check Processor Capacity]
    B -->|Custom Rules| G[Apply Business Rules]
    
    C --> C1{Compare Costs}
    C1 -->|Processor A: $2.80| H[Processor Rankings]
    C1 -->|Processor B: $2.55| H
    C1 -->|Processor C: $2.95| H
    
    D --> D1{Success Rates Last 24h}
    D1 -->|Processor A: 98.2%| H
    D1 -->|Processor B: 97.8%| H
    D1 -->|Processor C: 99.1%| H
    
    E --> E1{Determine Optimal Region}
    E1 -->|US Card → US Processor| H
    E1 -->|EU Card → EU Processor| H
    
    F --> F1{Check Queue Depth}
    F1 -->|Processor A: 120 pending| H
    F1 -->|Processor B: 45 pending| H
    
    G --> G1{Custom Conditions}
    G1 -->|High Value → Premium Processor| H
    G1 -->|Subscription → Optimized| H
    
    H --> I[Select Primary Processor]
    I --> J[Select 2 Backup Processors]
    J --> K[Attempt Primary]
    
    K --> L{Success?}
    L -->|Yes| M[Complete Transaction]
    L -->|No| N{Retry with Backup?}
    
    N -->|Yes| O[Attempt Backup 1]
    N -->|No| P[Transaction Failed]
    
    O --> Q{Success?}
    Q -->|Yes| M
    Q -->|No| R[Attempt Backup 2]
    
    R --> S{Success?}
    S -->|Yes| M
    S -->|No| P
    
    M --> T[Update Success Metrics]
    P --> U[Log Failure + Alert]
    
    style I fill:#10b981,color:#fff
    style M fill:#10b981,color:#fff
    style P fill:#ef4444,color:#fff
\`\`\`

**Cascading & Failover Logic:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> RouteDecision
    RouteDecision --> PrimaryProcessor: Selected
    
    PrimaryProcessor --> ProcessingPrimary: Send Request
    ProcessingPrimary --> PrimarySuccess: Response OK
    ProcessingPrimary --> PrimaryTimeout: Timeout >5s
    ProcessingPrimary --> PrimaryDeclined: Declined
    
    PrimarySuccess --> [*]: Complete
    
    PrimaryTimeout --> BackupProcessor1: Failover
    PrimaryDeclined --> BackupProcessor1: Cascade
    
    BackupProcessor1 --> ProcessingBackup1: Send Request
    ProcessingBackup1 --> Backup1Success: Response OK
    ProcessingBackup1 --> Backup1Failed: Failed
    
    Backup1Success --> [*]: Complete
    Backup1Failed --> BackupProcessor2: Final Attempt
    
    BackupProcessor2 --> ProcessingBackup2: Send Request
    ProcessingBackup2 --> Backup2Success: Response OK
    ProcessingBackup2 --> Backup2Failed: Failed
    
    Backup2Success --> [*]: Complete
    Backup2Failed --> [*]: All Attempts Failed
    
    note right of PrimaryProcessor
        Usually highest success rate
        or lowest cost processor
    end note
    
    note right of BackupProcessor1
        Secondary option
        Different network/region
    end note
    
    note right of BackupProcessor2
        Final fallback
        Maximum compatibility
    end note
\`\`\`

**Orchestration Pricing:**
- Setup Fee: $1,500
- Monthly Subscription: $299-$1,999
- Per-Transaction Fee: $0.005-$0.02
- Included in Enterprise PSP tier
- ROI: Typically 15-30% cost savings + 2-5% success rate improvement

---

### 5. RWA Platform - Real-World Asset Tokenization

**What It Is:**
Institutional-grade platform for tokenizing real-world assets (real estate, treasury bills, private credit, commodities) with ERC-3643 compliant smart contracts, regulated custody, oracle pricing, and automated compliance.

**Complete RWA Infrastructure:**

\`\`\`mermaid
graph TB
    subgraph "Asset Tokenization Layer"
        T1[Smart Contract Factory<br/>ERC-3643 Deployment]
        T2[Token Standards<br/>Security Token Compliant]
        T3[Asset Registry<br/>On-Chain + Off-Chain]
        T4[Metadata Management<br/>Legal Documents]
    end
    
    subgraph "Compliance & Verification"
        V1[Issuer Verification<br/>KYB + LEI Required]
        V2[Investor Accreditation<br/>Qualified Investor Check]
        V3[Transfer Restrictions<br/>Regulatory Rules]
        V4[Beneficial Ownership<br/>UBO Tracking]
        V5[Regulatory Reporting<br/>Automated Filings]
    end
    
    subgraph "Trading & Settlement"
        M1[Order Management<br/>Buy/Sell Orders]
        M2[Matching Engine<br/>Order Book]
        M3[DvP Settlement<br/>Delivery vs Payment]
        M4[Secondary Market<br/>Peer-to-Peer Trading]
        M5[Liquidity Pools<br/>Market Making]
    end
    
    subgraph "Corporate Actions"
        A1[Dividend Distribution<br/>Automated Payments]
        A2[Voting Rights<br/>Shareholder Governance]
        A3[Rights Issues<br/>Capital Raising]
        A4[Buybacks<br/>Token Redemption]
    end
    
    subgraph "Custody & Security"
        C1[Fireblocks Integration<br/>MPC Custody]
        C2[Cold Storage<br/>95% of Assets]
        C3[Hot Wallet<br/>5% Operations]
        C4[Multi-Sig Policies<br/>3-of-5 Approval]
        C5[Insurance Coverage<br/>Asset Protection]
    end
    
    subgraph "Oracle & Pricing"
        O1[Chainlink Oracle<br/>Price Feeds]
        O2[Band Protocol<br/>Backup Oracle]
        O3[Custom Valuations<br/>Real Estate Appraisals]
        O4[NAV Calculation<br/>Net Asset Value]
    end
    
    subgraph "Payment Integration"
        P1[FTS Payment Rails<br/>Fiat Settlement]
        P2[VASP Platform<br/>Crypto Settlement]
        P3[ISO 20022<br/>Bank Integration]
        P4[Multi-Currency<br/>Cross-Border]
    end
    
    T1 --> T2
    T2 --> T3
    T3 --> T4
    
    V1 --> V2
    V2 --> V3
    V3 --> V4
    V4 --> V5
    
    M1 --> M2
    M2 --> M3
    M3 --> M4
    M4 --> M5
    
    A1 --> A2
    A2 --> A3
    A3 --> A4
    
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> C5
    
    O1 --> O2
    O2 --> O3
    O3 --> O4
    
    T1 --> V1
    T3 --> M1
    M3 --> P1
    A1 --> P1
    P1 --> P2
    P1 --> P3
    
    V2 --> C1
    M2 --> O1
    
    style T1 fill:#2563eb,color:#fff
    style V1 fill:#f59e0b,color:#fff
    style C1 fill:#10b981,color:#fff
    style O1 fill:#8b5cf6,color:#fff
\`\`\`

**Supported Asset Classes:**

| Asset Type | Min Tokenization | Typical Size | Tokenization Fee | Annual Custody | Settlement |
|------------|------------------|--------------|------------------|----------------|------------|
| **Treasury Bills** | $100,000 | $1M-$50M | 0.5% | 0.15% | T+1 |
| **Real Estate** | $500,000 | $5M-$100M | 1.5% | 0.25% | T+7 |
| **Private Credit** | $250,000 | $2M-$25M | 1.0% | 0.20% | T+3 |
| **Commodities** | $50,000 | $500K-$10M | 0.75% | 0.15% | T+2 |
| **Corporate Bonds** | $100,000 | $1M-$20M | 0.5% | 0.15% | T+2 |
| **Equity Shares** | $1,000,000 | $10M-$500M | 1.0% | 0.20% | T+2 |

**RWA Platform Pricing:**
- Starter: $5,000/month (up to $10M AUM)
- Professional: $15,000/month (up to $100M AUM)
- Enterprise: $50,000/month (unlimited AUM)
- Tokenization: 0.5-1.5% of asset value
- Trading: 0.25% per transaction
- Custody: 0.15-0.25% annual AUM fee

---

### 6. VAT & Tax Management - Global Tax Compliance

**What It Is:**
Comprehensive automated tax compliance system supporting 100+ jurisdictions with real-time VAT/GST calculation, MOSS/OSS compliance, reverse charge mechanisms, and multi-standard tax reporting based on UN/CEFACT and ISO 20022 standards.

**Tax Determination Engine:**

\`\`\`mermaid
flowchart TD
    A[Transaction Initiated] --> B[Extract Context Data]
    B --> C{Identify Parties}
    
    C --> D[Supplier Location<br/>Merchant Country]
    C --> E[Customer Location<br/>Billing Country]
    C --> F[Service Location<br/>Performance Place]
    
    D --> G{Determine Jurisdiction}
    E --> G
    F --> G
    
    G -->|B2C Digital| H[Customer Location VAT]
    G -->|B2C Physical| I[Supplier Location VAT]
    G -->|B2B Intra-EU| J[Reverse Charge Logic]
    G -->|Export| K[Zero-Rated Export]
    
    J --> L{VAT Number Valid?}
    L -->|Yes + Registered| M[Reverse Charge: 0%<br/>UNCL5305: AE]
    L -->|No or Not Registered| H
    
    H --> N[Classify Service]
    I --> N
    M --> N
    K --> N
    
    N --> O{Service Category}
    O -->|UNSPSC: 81111500| P[Digital Services<br/>Software/SaaS]
    O -->|UNSPSC: 81161500| Q[Financial Services<br/>Payment Processing]
    O -->|UNSPSC: 84121500| R[Advisory Services<br/>Consulting]
    
    P --> S{Exemption Check}
    Q --> S
    R --> S
    
    S -->|Exempt Financial| T[0% VAT Exempt<br/>UNCL5305: E]
    S -->|Standard Taxable| U[Apply Standard Rate<br/>UNCL5305: S]
    S -->|Reduced Rate| V[Apply Reduced Rate<br/>UNCL5305: AA]
    S -->|Zero-Rated| W[0% Zero-Rated<br/>UNCL5305: Z]
    
    T --> X[Calculate Tax Amount]
    U --> X
    V --> X
    W --> X
    
    X --> Y[Update Transaction]
    Y --> Z[Generate Tax Log]
    Z --> AA[Compliance Record]
    
    style G fill:#f59e0b,color:#fff
    style M fill:#8b5cf6,color:#fff
    style T fill:#10b981,color:#fff
    style X fill:#2563eb,color:#fff
\`\`\`

**Pricing:**
- Included in PSP Platform subscriptions
- Standalone: $299/month + $0.10 per calculation
- Multi-jurisdiction support included
- Real-time rate updates
- Automated reporting

---

### 7. E-Invoicing System - Multi-Standard Electronic Invoicing

**What It Is:**
Automated electronic invoicing system supporting 8+ international e-invoicing standards with real-time validation, government gateway integration, and cryptographic signing for legal compliance.

**Supported E-Invoicing Standards:**

| Standard | Regions | Mandate Status | Format | Complexity |
|----------|---------|----------------|--------|------------|
| **Peppol BIS Billing 3.0** | EU + 30 countries | Mandatory (EU B2G) | UBL 2.1 XML | Medium |
| **ZATCA Phase 2 (Fatoora)** | Saudi Arabia | Mandatory (All) | UBL 2.1 + QR | High |
| **FatturaPA 1.7** | Italy | Mandatory (B2B/B2G) | Custom XML | High |
| **CFDI 4.0** | Mexico | Mandatory (All) | Custom XML | High |
| **UBL 2.1 Generic** | Global | Voluntary | UBL 2.1 XML | Low |
| **UN/CEFACT CII D16B** | Global | Voluntary | CII XML | Medium |
| **Factur-X** | France, Germany | Voluntary | PDF/A-3 + XML | Medium |
| **PINT (A-NZ)** | Asia-Pacific | Emerging | UBL/CII | Medium |

**E-Invoice Lifecycle:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft: Create Invoice
    Draft --> Validating: Submit for Validation
    
    Validating --> ValidationFailed: Schema Error
    Validating --> Validated: Schema OK
    
    ValidationFailed --> Draft: Fix Errors
    
    Validated --> Signing: Cryptographic Sign
    Signing --> Signed: Certificate Applied
    
    Signed --> Submitting: Send to Gov Gateway
    Submitting --> Rejected: Gov Rejection
    Submitting --> Accepted: Gov Acceptance
    
    Rejected --> Draft: Correct Issues
    Accepted --> Sent: Deliver to Customer
    
    Sent --> Paid: Payment Received
    Sent --> Overdue: Payment Late
    
    Overdue --> Paid: Payment Received
    Overdue --> Cancelled: Invoice Cancelled
    
    Paid --> Archived: Statutory Retention
    Cancelled --> Archived: Record Keeping
    
    Archived --> [*]: After Retention Period
    
    note right of Signed
        Cryptographic signature
        ensures legal validity
        and non-repudiation
    end note
    
    note right of Accepted
        Government UUID assigned
        Invoice legally valid
        for tax deduction
    end note
\`\`\`

**E-Invoicing Pricing:**
- Included in PSP Platform Professional/Enterprise
- Standalone: $199/month + $0.15 per invoice
- Government gateway integration included
- Multi-standard support
- Automated submissions

---

## Core Platform Services

### Service Marketplace - 150+ Pre-Integrated Services

**What It Is:**
One-click integration marketplace providing access to payment providers, compliance services, payout methods, and developer tools without custom integration work.

**Marketplace Categories:**

\`\`\`mermaid
mindmap
  root((Service Marketplace<br/>150+ Services))
    Payment Providers 60+
      Card Processing
        Stripe Connect
        Adyen for Platforms
        Checkout.com
        Worldpay
      Digital Wallets
        PayPal/Braintree
        Apple Pay
        Google Pay
        Alipay/WeChat
      Bank Transfers
        Plaid ACH
        TrueLayer Open Banking
        GoCardless Direct Debit
        Tink Banking
      Crypto Payments
        Coinbase Commerce
        BitPay
        Circle USDC
        Fireblocks
    Compliance Services 25+
      KYC/Identity
        Jumio
        Onfido
        Sumsub
        Trulioo
      AML/Sanctions
        ComplyAdvantage
        Chainalysis
        Elliptic
        Refinitiv World-Check
      Fraud Prevention
        Sift Science
        Ravelin
        Forter
        Kount
    Payout Methods 40+
      Bank Transfers
        SEPA 33 countries
        ACH US
        Faster Payments UK
        Wire Transfer Global
      Mobile Money
        M-Pesa Kenya
        GCash Philippines
        PayTM India
      Alternative
        Prepaid Cards
        Cash Pickup
        Cryptocurrency
    Developer Tools 25+
      Monitoring
        Datadog APM
        New Relic
        Sentry Errors
      Communication
        SendGrid Email
        Twilio SMS
        Slack Webhooks
      Analytics
        Segment
        Mixpanel
        Google Analytics
\`\`\`

**Marketplace Business Model:**

\`\`\`
Revenue Share Structure:

Service Provider → FTS.Money → PSP Customer

Example: Jumio KYC Service
  - Jumio charges: $3.00 per verification
  - FTS.Money markup: $2.00 (67% margin)
  - PSP pays: $5.00 per verification
  - PSP charges merchant: $7.00 (PSP earns $2)
  
  Revenue split:
    - Jumio receives: $3.00
    - FTS.Money receives: $2.00
    - PSP receives: $2.00
    - Merchant pays: $7.00

FTS.Money Commission Model:
  - Payment rails: 15-20% commission
  - Compliance services: 30-40% commission
  - Payout methods: 20-30% commission
  - Developer tools: 40-50% commission
\`\`\`

---

### Multi-User RBAC System

**Role-Based Access Control Across All Services:**

Every FTS.Money service includes comprehensive multi-user support with granular permission control:

\`\`\`mermaid
graph TB
    subgraph "Services with RBAC"
        SVC1[PSP Portal<br/>Payment Operations]
        SVC2[VASP Portal<br/>Crypto Banking]
        SVC3[ISO Gateway<br/>Message Translation]
        SVC4[Orchestration<br/>Routing Rules]
        SVC5[RWA Platform<br/>Asset Management]
        SVC6[Merchant Portal<br/>Self-Service]
        SVC7[Virtual Terminal<br/>Manual Payments]
    end
    
    subgraph "Standard Role Hierarchy"
        R1[Owner - 100%<br/>Full Control]
        R2[Administrator - 90%<br/>All Ops]
        R3[Developer - 60%<br/>API & Config]
        R4[Operations - 50%<br/>Daily Tasks]
        R5[Analyst - 40%<br/>Reporting Only]
        R6[Viewer - 20%<br/>Read-Only]
    end
    
    subgraph "Permission Categories"
        P1[User Management<br/>Invite/Edit/Delete]
        P2[Configuration<br/>Settings/Features]
        P3[Financial Ops<br/>Billing/Payouts]
        P4[Technical<br/>API Keys/Webhooks]
        P5[Compliance<br/>Reports/Audits]
        P6[Monitoring<br/>Dashboards/Alerts]
    end
    
    SVC1 --> R1
    SVC2 --> R1
    SVC3 --> R1
    SVC4 --> R1
    SVC5 --> R1
    SVC6 --> R1
    SVC7 --> R1
    
    R1 --> P1
    R1 --> P2
    R1 --> P3
    R1 --> P4
    R1 --> P5
    R1 --> P6
    
    R2 --> P1
    R2 --> P2
    R2 --> P3
    R2 --> P4
    R2 --> P5
    R2 --> P6
    
    R3 --> P2
    R3 --> P4
    R3 --> P6
    
    R4 --> P2
    R4 --> P6
    
    R5 --> P5
    R5 --> P6
    
    R6 --> P6
    
    style R1 fill:#ef4444,color:#fff
    style R2 fill:#f59e0b,color:#fff
    style P1 fill:#2563eb,color:#fff
\`\`\`

**Permission Management:**
- Customizable per service
- Editable permission matrices
- Audit trail for all access
- Session management with timeout
- IP whitelisting for sensitive roles
- 2FA/MFA enforcement options

---

## Compliance & Standards

### ISO Standards Compliance

FTS.Money is built on international standards ensuring global interoperability and regulatory compliance:

| ISO Standard | Name | FTS Implementation | Business Value |
|--------------|------|-------------------|----------------|
| **ISO 20022** | Universal Financial Messaging | Native support in all payment services | SWIFT compliance, global bank connectivity |
| **ISO 8583** | Card Transaction Messages | ISO Gateway translation engine | ATM/POS network compatibility |
| **ISO 17442** | Legal Entity Identifier (LEI) | GLEIF API integration | Entity verification, regulatory reporting |
| **ISO 23257** | Distributed Ledger Technology | Crypto Gateway implementation | Blockchain transaction standards |
| **ISO 24165** | Digital Token Identifier (DTI) | Crypto asset tracking | Crypto asset identification |
| **ISO 27001** | Information Security Management | ISMS certification | Enterprise security framework |
| **ISO 4217** | Currency Codes | Multi-currency support | 150+ currencies supported |
| **ISO 3166** | Country Codes | Geographic data validation | 249 countries/territories |
| **ISO 13616** | IBAN Standard | IBAN validation & generation | 70+ countries supported |
| **ISO 9362** | BIC/SWIFT Codes | Bank identification | Global bank routing |

### Payment Network Compliance

\`\`\`mermaid
graph TB
    subgraph "Card Network Compliance"
        PCI[PCI DSS Level 1<br/>Payment Card Industry]
        VISA[Visa Acceptance<br/>Device Compliance]
        MC[Mastercard Rules<br/>Transaction Standards]
        AMEX[Amex Requirements<br/>Merchant Rules]
    end
    
    subgraph "Banking Compliance"
        SEPA[SEPA Rulebook<br/>Euro Payments]
        SWIFT[SWIFT Standards<br/>International Wire]
        ACH[NACHA Rules<br/>US ACH]
        FPS[Faster Payments<br/>UK Instant]
    end
    
    subgraph "Crypto Compliance"
        FATF[FATF R.15/R.16<br/>Travel Rule]
        MICA[MiCA Regulation<br/>EU Crypto]
        FINCEN[FinCEN Guidance<br/>US VASP]
        AML5[5AMLD/6AMLD<br/>EU AML]
    end
    
    subgraph "Data Protection"
        GDPR[GDPR Compliance<br/>EU Privacy]
        CCPA[CCPA Compliance<br/>California Privacy]
        SOC2[SOC 2 Type II<br/>Security Controls]
    end
    
    PCI --> FTS[FTS.Money<br/>Compliance Framework]
    VISA --> FTS
    MC --> FTS
    AMEX --> FTS
    
    SEPA --> FTS
    SWIFT --> FTS
    ACH --> FTS
    FPS --> FTS
    
    FATF --> FTS
    MICA --> FTS
    FINCEN --> FTS
    AML5 --> FTS
    
    GDPR --> FTS
    CCPA --> FTS
    SOC2 --> FTS
    
    FTS --> CERT[Certified Compliant<br/>Annual Audits]
    
    style FTS fill:#10b981,color:#fff
    style CERT fill:#2563eb,color:#fff
\`\`\`

---

## Technology Stack

### Multi-Cloud Infrastructure

\`\`\`mermaid
graph TB
    subgraph "Cloud Provider Distribution"
        AWS[Amazon Web Services<br/>45% workload]
        GCP[Google Cloud Platform<br/>25% workload]
        AZURE[Microsoft Azure<br/>20% workload]
        ORACLE[Oracle Cloud<br/>5% workload]
        ALIBABA[Alibaba Cloud<br/>5% workload]
    end
    
    subgraph "Workload Distribution by Cloud"
        W1[Web Applications<br/>Primary: AWS]
        W2[ML/AI Processing<br/>Primary: GCP]
        W3[Enterprise Customers<br/>Primary: Azure]
        W4[Banking Integration<br/>Primary: Oracle]
        W5[China/Asia Traffic<br/>Primary: Alibaba]
    end
    
    subgraph "Database Strategy"
        POSTGRES[PostgreSQL 16<br/>Primary Database]
        REPLICA[Read Replicas<br/>Geographic Distribution]
        TIMESCALE[TimescaleDB<br/>Time-Series Data]
        REDIS[Redis Cluster<br/>Caching & Sessions]
        ELASTIC[Elasticsearch<br/>Search & Analytics]
    end
    
    subgraph "Message & Event Streaming"
        KAFKA[Apache Kafka<br/>Event Streaming]
        RABBITMQ[RabbitMQ<br/>Task Queues]
        SQS[AWS SQS<br/>Async Processing]
        PUBSUB[Redis Pub/Sub<br/>Real-Time Updates]
    end
    
    AWS --> W1
    GCP --> W2
    AZURE --> W3
    ORACLE --> W4
    ALIBABA --> W5
    
    W1 --> POSTGRES
    W2 --> POSTGRES
    W3 --> POSTGRES
    
    POSTGRES --> REPLICA
    POSTGRES --> TIMESCALE
    
    POSTGRES --> REDIS
    TIMESCALE --> ELASTIC
    
    W1 --> KAFKA
    W2 --> RABBITMQ
    W3 --> SQS
    REDIS --> PUBSUB
    
    style AWS fill:#f59e0b,color:#fff
    style POSTGRES fill:#2563eb,color:#fff
    style KAFKA fill:#10b981,color:#fff
\`\`\`

### Security Architecture

**Defense in Depth:**

\`\`\`mermaid
graph TB
    subgraph "Layer 1: Edge Security"
        L1A[Cloudflare WAF<br/>Web Application Firewall]
        L1B[DDoS Protection<br/>Up to 100 Gbps]
        L1C[SSL/TLS Termination<br/>TLS 1.3 Only]
        L1D[Bot Protection<br/>Challenge Detection]
    end
    
    subgraph "Layer 2: Application Security"
        L2A[API Gateway<br/>Rate Limiting]
        L2B[OAuth 2.0<br/>Token-Based Auth]
        L2C[Multi-Factor Auth<br/>TOTP/SMS/Biometric]
        L2D[Session Management<br/>Timeout & Rotation]
    end
    
    subgraph "Layer 3: Data Security"
        L3A[Encryption at Rest<br/>AES-256]
        L3B[Encryption in Transit<br/>TLS 1.3]
        L3C[Tokenization<br/>PCI-Compliant Tokens]
        L3D[Field-Level Encryption<br/>Sensitive Data]
        L3E[Key Management<br/>AWS KMS/Vault]
    end
    
    subgraph "Layer 4: Network Security"
        L4A[VPC Isolation<br/>Private Networks]
        L4B[Security Groups<br/>Firewall Rules]
        L4C[Network ACLs<br/>Subnet Protection]
        L4D[VPN Access<br/>Admin Operations]
    end
    
    subgraph "Layer 5: Monitoring & Response"
        L5A[SIEM Integration<br/>Splunk]
        L5B[Intrusion Detection<br/>IDS/IPS]
        L5C[Vulnerability Scanning<br/>Weekly Scans]
        L5D[Penetration Testing<br/>Quarterly]
        L5E[Incident Response<br/>24/7 SOC]
    end
    
    L1A --> L2A
    L1B --> L2A
    L1C --> L2A
    L1D --> L2A
    
    L2A --> L3A
    L2B --> L3B
    L2C --> L3C
    L2D --> L3D
    
    L3A --> L4A
    L3B --> L4B
    L3E --> L4C
    
    L4A --> L5A
    L4B --> L5B
    L4C --> L5C
    
    L5A --> L5E
    L5B --> L5E
    L5C --> L5E
    L5D --> L5E
    
    style L1A fill:#ef4444,color:#fff
    style L2C fill:#f59e0b,color:#fff
    style L3A fill:#8b5cf6,color:#fff
    style L5E fill:#10b981,color:#fff
\`\`\`

---

## Getting Started

### For Payment Service Providers (PSPs)

**Launch Your PSP in 5 Steps:**

\`\`\`mermaid
flowchart LR
    STEP1[Step 1<br/>Sign Up<br/>5 minutes] --> STEP2[Step 2<br/>Business Verification<br/>30min-24h]
    STEP2 --> STEP3[Step 3<br/>Configure PSP<br/>15 minutes]
    STEP3 --> STEP4[Step 4<br/>Automated Provisioning<br/>30-40 minutes]
    STEP4 --> STEP5[Step 5<br/>Go Live<br/>Instant]
    
    style STEP1 fill:#dbeafe
    style STEP2 fill:#fef3c7
    style STEP3 fill:#dcfce7
    style STEP4 fill:#e0e7ff
    style STEP5 fill:#d1fae5
\`\`\`

### For VASP Customers (Crypto Exchanges, DeFi, Wallets)

**Launch Crypto Banking in 3 Steps:**

\`\`\`mermaid
flowchart LR
    V1[Step 1<br/>Register & Verify<br/>TAS/LEI/Grace Period] --> V2[Step 2<br/>White-Label Configuration<br/>Branding & Features]
    V2 --> V3[Step 3<br/>Go Live<br/>2-3 Days]
    
    style V1 fill:#dbeafe
    style V2 fill:#fef3c7
    style V3 fill:#d1fae5
\`\`\`

### For ISO Gateway Customers (Banks, Legacy Systems)

**Modernize Legacy Systems:**

\`\`\`mermaid
flowchart LR
    I1[Step 1<br/>Map Current Systems<br/>Document formats] --> I2[Step 2<br/>Configure Connections<br/>API endpoints]
    I2 --> I3[Step 3<br/>Test Translation<br/>Sandbox environment]
    I3 --> I4[Step 4<br/>Production Cutover<br/>1-2 weeks]
    
    style I1 fill:#dbeafe
    style I2 fill:#fef3c7
    style I3 fill:#e0e7ff
    style I4 fill:#d1fae5
\`\`\`

### For Orchestration Customers (Multi-Processor Routing)

**Optimize Payment Routing:**

\`\`\`mermaid
flowchart LR
    O1[Step 1<br/>Connect Processors<br/>API integration] --> O2[Step 2<br/>Define Rules<br/>Routing logic]
    O2 --> O3[Step 3<br/>Test & Validate<br/>Shadow mode]
    O3 --> O4[Step 4<br/>Production<br/>Live routing]
    
    style O1 fill:#dbeafe
    style O2 fill:#fef3c7
    style O3 fill:#e0e7ff
    style O4 fill:#d1fae5
\`\`\`

### For RWA Customers (Asset Issuers, Fund Managers)

**Tokenize Real-World Assets:**

\`\`\`mermaid
flowchart LR
    R1[Step 1<br/>Asset Onboarding<br/>Legal & Valuation] --> R2[Step 2<br/>Smart Contract<br/>ERC-3643 Deploy]
    R2 --> R3[Step 3<br/>Investor KYC<br/>Accreditation]
    R3 --> R4[Step 4<br/>Token Distribution<br/>Primary Offering]
    R4 --> R5[Step 5<br/>Secondary Trading<br/>Ongoing Market]
    
    style R1 fill:#dbeafe
    style R2 fill:#e0e7ff
    style R3 fill:#fef3c7
    style R4 fill:#fce7f3
    style R5 fill:#d1fae5
\`\`\`

---

## Integration Guide

### API-First Architecture

All FTS.Money services expose RESTful APIs, GraphQL endpoints, and webhooks for seamless integration:

**Base API Structure:**

\`\`\`javascript
// Initialize FTS.Money SDK
import { FTSMoney } from '@ftsmoney/sdk';

const fts = new FTSMoney({
  apiKey: process.env.FTS_API_KEY,
  apiSecret: process.env.FTS_API_SECRET,
  environment: 'production', // or 'sandbox'
  services: {
    psp: true,
    vasp: true,
    iso_gateway: true,
    orchestration: true,
    rwa: true
  }
});

// PSP Service - Process Payment
const payment = await fts.psp.payments.create({
  amount: 10000, // $100.00 in cents
  currency: 'USD',
  payment_method: {
    type: 'card',
    card: {
      number: '4242424242424242',
      exp_month: 12,
      exp_year: 2026,
      cvc: '123'
    }
  },
  merchant_id: 'merch_abc123',
  calculate_vat: true, // Auto VAT calculation
  generate_einvoice: true // Auto e-invoice generation
});

// VASP Service - Create Crypto Wallet
const wallet = await fts.vasp.wallets.create({
  customer_id: 'cust_xyz789',
  currency: 'BTC',
  type: 'custodial'
});

// ISO Gateway - Translate Message
const translated = await fts.isoGateway.translate({
  input_format: 'iso8583',
  output_format: 'iso20022',
  message: iso8583Message
});

// Orchestration - Route Payment
const routed = await fts.orchestration.route({
  amount: 5000,
  currency: 'EUR',
  card_bin: '424242',
  strategy: 'cost_optimized' // or 'success_rate', 'geographic'
});

// RWA - Tokenize Asset
const token = await fts.rwa.assets.tokenize({
  asset_type: 'treasury_bill',
  asset_value: 1000000,
  currency: 'USD',
  issuer_lei: '213800ABCDEFG1234567'
});

// VAT Calculation
const vat = await fts.tax.calculate({
  amount: 1000,
  customer_country: 'DE',
  merchant_country: 'IE',
  service_type: 'digital_services',
  customer_type: 'B2C'
});

// E-Invoice Generation
const invoice = await fts.eInvoicing.generate({
  transaction_id: payment.id,
  standard: 'peppol_bis_3',
  language: 'de',
  auto_submit: true
});
\`\`\`

### Webhook Integration

**Real-Time Event Notifications:**

\`\`\`javascript
// Configure webhook endpoint
const webhook = await fts.webhooks.create({
  url: 'https://your-app.com/webhooks/fts',
  events: [
    'payment.succeeded',
    'payment.failed',
    'vasp.wallet.funded',
    'einvoice.submitted',
    'tax.calculated',
    'rwa.token.minted'
  ],
  secret: 'your_webhook_secret'
});

// Handle webhook in your application
app.post('/webhooks/fts', (req, res) => {
  const signature = req.headers['fts-signature'];
  const event = fts.webhooks.verify(req.body, signature);
  
  switch (event.type) {
    case 'payment.succeeded':
      handlePaymentSuccess(event.data);
      break;
    
    case 'vasp.wallet.funded':
      handleCryptoDeposit(event.data);
      break;
    
    case 'einvoice.submitted':
      handleInvoiceSubmission(event.data);
      break;
    
    case 'rwa.token.minted':
      handleTokenMinted(event.data);
      break;
  }
  
  res.json({ received: true });
});
\`\`\`

---

## Conclusion

FTS.Money is an **Enterprise Payment Infrastructure Provider** delivering white-labeled, production-ready financial technology to organizations worldwide. We enable businesses to launch payment services, crypto banking, asset tokenization, and financial infrastructure under their own brand without the traditional multi-million dollar investment and multi-year development timeline.

**Core Offerings:**
1. **PSP Platform** - Complete payment service provider infrastructure
2. **VASP Platform** - Full-stack crypto banking (wallets, IBANs, cards, compliance)
3. **ISO Gateway** - Message translation between payment standards
4. **Orchestration Engine** - Intelligent multi-processor routing
5. **RWA Platform** - Real-world asset tokenization infrastructure
6. **VAT/Tax Management** - Global tax compliance automation
7. **E-Invoicing System** - Multi-standard electronic invoicing

**Why Choose FTS.Money:**
- ✅ **Speed:** Launch in days, not years
- ✅ **Cost:** 99% less than building in-house
- ✅ **Compliance:** All regulatory requirements built-in
- ✅ **White-Label:** Your brand, our technology
- ✅ **Scalability:** Startup to enterprise on same platform
- ✅ **Interoperability:** Combine services for unique offerings

**Get Started:**
- Platform: https://fts.money
- Community Portal: https://community.fts.money
- Documentation: https://docs.fts.money
- Sales: sales@fts.money
- Support: support@fts.money

---

**Document Information**

- **Version:** 3.0
- **Date:** January 5, 2026
- **Status:** Active
- **Classification:** Public
- **Owner:** FTS.Money Product Team
- **Next Review:** April 5, 2026

© 2026 FTS.Money. All rights reserved.`;

export default FTSOverviewDoc;