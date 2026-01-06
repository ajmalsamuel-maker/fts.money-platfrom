const PlatformOverviewComplete = `# FTS.Money - Complete Platform Overview & Technical Architecture
## Enterprise Payment Infrastructure Ecosystem

**Version:** 4.0 - Complete Specification  
**Classification:** Public - Comprehensive Reference  
**Last Updated:** January 5, 2026  
**Document Owner:** FTS.Money Product Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Strategic Positioning & Market](#strategic-positioning--market)
3. [Complete Platform Architecture](#complete-platform-architecture)
4. [Authentication & Identity Framework](#authentication--identity-framework)
5. [Complete Service Portfolio](#complete-service-portfolio)
6. [10-Step KYB/KYC & AML Framework](#10-step-kybkyc--aml-framework)
7. [LEI/vLEI Provenance System](#leivlei-provenance-system)
8. [Future: vLEI Passwordless Authentication](#future-vlei-passwordless-authentication)
9. [Service Interoperability](#service-interoperability)
10. [Technology Stack & Infrastructure](#technology-stack--infrastructure)
11. [Compliance & Standards](#compliance--standards)
12. [Getting Started Guides](#getting-started-guides)

---

## Executive Summary

### What is FTS.Money?

FTS.Money is an **Enterprise Payment Infrastructure Provider** delivering white-labeled, production-ready payment technology to organizations worldwide. We provide the complete technology stack, compliance framework, and operational infrastructure required to launch and scale payment services—all under your brand.

**We are NOT:**
- ❌ A payment processor where you use our brand (like Stripe/Adyen)
- ❌ A software vendor selling you code to build yourself
- ❌ A consulting firm advising on payments
- ❌ A PSP competing with our customers

**We ARE:**
- ✅ Infrastructure provider - you become the payment provider
- ✅ White-label platform - your brand, our technology
- ✅ Turnkey solution - fully managed infrastructure
- ✅ Multi-service ecosystem - combine services for unique offerings
- ✅ Compliance-first - all regulatory requirements built-in

### The AWS Analogy

\`\`\`mermaid
graph LR
    subgraph "Before AWS (Pre-2006)"
        OLD1[Build Own Data Center<br/>$10M-$100M investment]
        OLD2[18-24 Month Timeline<br/>Large IT Team]
        OLD3[Ongoing Maintenance<br/>$5M-$20M/year]
    end
    
    subgraph "With AWS (2006+)"
        NEW1[Launch in Minutes<br/>$100-$10K/month]
        NEW2[Zero Infrastructure Team<br/>Fully Managed]
        NEW3[Pay for Usage<br/>Scale Up/Down]
    end
    
    subgraph "Before FTS.Money"
        PAY_OLD1[Build Payment Stack<br/>$10M-$50M investment]
        PAY_OLD2[18-36 Month Timeline<br/>50-200 Person Team]
        PAY_OLD3[Ongoing Maintenance<br/>$5M-$15M/year]
    end
    
    subgraph "With FTS.Money"
        PAY_NEW1[Launch in 24h-2 Weeks<br/>$499-$50K/month]
        PAY_NEW2[Zero Dev Team Needed<br/>Fully Managed]
        PAY_NEW3[Pay for Usage<br/>Scale Instantly]
    end
    
    OLD1 -.->|AWS Revolutionized| NEW1
    PAY_OLD1 -.->|FTS.Money Revolutionizes| PAY_NEW1
    
    style NEW1 fill:#10b981,color:#fff
    style PAY_NEW1 fill:#10b981,color:#fff
\`\`\`

**Market Impact:**
- **AWS:** Democratized cloud infrastructure ($90B annual revenue)
- **FTS.Money:** Democratizing payment infrastructure ($24-33B addressable market growing to $300B+)

---

## Complete Service Portfolio

### All FTS.Money Services Overview

\`\`\`mermaid
mindmap
  root((FTS.Money<br/>Platform))
    Payment Infrastructure
      PSP Platform
        Merchant Management
        Transaction Processing
        Settlement Engine
        Fraud Detection
        Virtual Terminal
        Merchant Portal
      Payment Orchestration
        Multi-Processor Routing
        Failover & Cascading
        Cost Optimization
        Success Rate Maximization
    Crypto Banking Infrastructure
      VASP Platform Complete Stack
        Multi-Chain Wallets BTC ETH SOL
        Virtual IBANs SEPA Accounts
        Visa Card Issuance Virtual Physical
        On Off Ramps Crypto Fiat
        Lightning Network Integration
      VASP Compliance Engine
        KYC KYB Automated
        AML CFT Real-Time Screening
        Travel Rule IVMS101 Protocol
        Blockchain Analytics On-Chain Risk
        LEI vLEI GLEIF Integration
    Message Translation Services
      ISO Gateway
        ISO 8583 Card Messages
        ISO 20022 Banking Messages
        SWIFT MT Translation
        Custom Format Mapping
      Protocol Support
        SEPA Instant Payments
        Fedwire US Domestic
        CHAPS UK Payments
        TARGET2 EU Settlement
    Asset Tokenization
      RWA Platform
        ERC 3643 Smart Contracts
        Asset Custody Fireblocks
        Oracle Pricing Chainlink Band
        Regulatory Compliance
      Secondary Market
        Order Matching Engine
        DvP Settlement
        Liquidity Pools
        Corporate Actions Automation
    Financial Compliance
      VAT Tax Management
        100 Jurisdictions
        Real Time Calculation
        MOSS OSS Compliance
        Reverse Charge Automation
      E Invoicing System
        Peppol BIS 3 0
        ZATCA Saudi Arabia
        FatturaPA Italy
        CFDI 4 0 Mexico
        UBL 2 1 UN CEFACT
    Identity Provenance
      LEI Integration
        GLEIF API Verification
        Entity Ownership Chains
        Annual Renewal Tracking
      vLEI Credentials
        W3C Verifiable Credentials
        Cryptographic Proof
        Credential Chain Validation
        QVI Registry Integration
      10 Step KYB KYC
        Automated Screening
        Document AI Verification
        Risk Scoring Algorithm
        Ongoing Monitoring
\`\`\`

---

## Complete Platform Architecture

### System-Wide Architecture (All Services)

\`\`\`mermaid
graph TB
    subgraph "Portal Ecosystem - Unified Authentication"
        AUTH[Unified Auth Service<br/>Multi-Portal SSO<br/>vLEI Support Roadmap]
        
        PORT1[Platform Control Panel<br/>Internal Admin]
        PORT2[Community Portal<br/>Self-Service]
        PORT3[PSP Portal<br/>Payment Ops]
        PORT4[VASP Portal<br/>Crypto Banking]
        PORT5[ISO Gateway Portal<br/>Message Translation]
        PORT6[Orchestration Portal<br/>Routing Management]
        PORT7[RWA Portal<br/>Asset Platform]
        PORT8[Merchant Portal<br/>Self-Service]
        PORT9[Virtual Terminal<br/>Manual Payments]
    end
    
    subgraph "Core Infrastructure Services"
        SVC1[PSP Provisioning<br/>Automated Deployment]
        SVC2[Payment Processing<br/>Transaction Engine]
        SVC3[VASP Infrastructure<br/>Crypto Banking Stack]
        SVC4[ISO Message Gateway<br/>Format Translation]
        SVC5[Orchestration Engine<br/>Smart Routing]
        SVC6[RWA Tokenization<br/>Asset Platform]
        SVC7[Settlement Engine<br/>Multi-Rail Settlement]
        SVC8[Fraud Detection<br/>AI ML Risk Scoring]
    end
    
    subgraph "Financial & Tax Services"
        FIN1[VAT Tax Engine<br/>Global Compliance]
        FIN2[E-Invoicing System<br/>Multi-Standard]
        FIN3[Multi-Currency FX<br/>150+ Currencies]
        FIN4[Pricing Engine<br/>Dynamic Calculation]
        FIN5[Billing Invoicing<br/>Subscription Mgmt]
    end
    
    subgraph "Identity & Compliance Services"
        ID1[KYC KYB Engine<br/>10-Step Framework]
        ID2[AML CFT Screening<br/>Sanctions PEP]
        ID3[Travel Rule Engine<br/>IVMS101 Protocol]
        ID4[LEI vLEI Integration<br/>GLEIF Verification]
        ID5[Blockchain Analytics<br/>On-Chain Risk]
        ID6[Regulatory Reporting<br/>Automated Filings]
        ID7[Credential Vault<br/>vLEI Storage HSM]
    end
    
    subgraph "Data & Analytics Layer"
        DATA1[Multi-Tenant PostgreSQL<br/>Schema Isolation]
        DATA2[Transaction Ledger<br/>Immutable Audit Trail]
        DATA3[Analytics Engine<br/>Real-Time Metrics]
        DATA4[Audit Log System<br/>Compliance Logs]
        DATA5[Reporting Engine<br/>Financial Reports]
        DATA6[Data Warehouse<br/>Historical Analytics]
    end
    
    subgraph "Integration & API Layer"
        API1[API Gateway<br/>REST + GraphQL]
        API2[Webhook Platform<br/>Event Streaming]
        API3[SDK Libraries<br/>Multi-Language]
        API4[Message Queues<br/>Kafka + RabbitMQ]
        API5[Cache Layer<br/>Redis Cluster]
    end
    
    subgraph "External Connectivity"
        EXT1[150+ Payment Providers<br/>Cards Wallets Banks]
        EXT2[Card Networks<br/>Visa MC Amex]
        EXT3[Blockchain Networks<br/>BTC ETH SOL AVAX]
        EXT4[Banking Partners<br/>SEPA SWIFT ACH]
        EXT5[Government Gateways<br/>Tax Authorities]
        EXT6[Compliance APIs<br/>GLEIF Sanctions]
        EXT7[Custody Partners<br/>Fireblocks Striga]
        EXT8[Oracle Networks<br/>Chainlink Band]
    end
    
    AUTH --> PORT1
    AUTH --> PORT2
    AUTH --> PORT3
    AUTH --> PORT4
    AUTH --> PORT5
    AUTH --> PORT6
    AUTH --> PORT7
    AUTH --> PORT8
    AUTH --> PORT9
    
    PORT1 --> SVC1
    PORT2 --> SVC1
    PORT3 --> SVC2
    PORT4 --> SVC3
    PORT5 --> SVC4
    PORT6 --> SVC5
    PORT7 --> SVC6
    PORT8 --> SVC2
    PORT9 --> SVC2
    
    SVC2 --> SVC7
    SVC2 --> SVC8
    SVC1 --> DATA1
    SVC2 --> DATA2
    SVC3 --> DATA2
    SVC4 --> DATA2
    SVC5 --> DATA2
    SVC6 --> DATA2
    
    SVC2 --> FIN1
    SVC2 --> FIN2
    SVC7 --> FIN3
    FIN2 --> FIN5
    
    SVC3 --> ID1
    SVC3 --> ID2
    SVC3 --> ID3
    SVC6 --> ID1
    ID1 --> ID4
    ID2 --> ID4
    ID4 --> ID7
    
    DATA2 --> DATA3
    DATA2 --> DATA4
    DATA3 --> DATA5
    DATA3 --> DATA6
    
    SVC2 --> API1
    API1 --> API2
    API1 --> API3
    API1 --> API4
    DATA3 --> API5
    
    SVC2 --> EXT1
    SVC2 --> EXT2
    SVC3 --> EXT3
    SVC4 --> EXT4
    SVC7 --> EXT4
    FIN2 --> EXT5
    ID4 --> EXT6
    SVC3 --> EXT7
    SVC6 --> EXT7
    SVC6 --> EXT8
    
    style AUTH fill:#8b5cf6,color:#fff
    style SVC2 fill:#2563eb,color:#fff
    style SVC3 fill:#0ea5e9,color:#fff
    style ID4 fill:#f59e0b,color:#fff
    style DATA1 fill:#10b981,color:#fff
    style ID7 fill:#ef4444,color:#fff
\`\`\`

---

## Authentication & Identity Framework

### Complete Authentication Flows (All Portals)

#### 1. Platform Admin Authentication (FTS Control Panel)

\`\`\`mermaid
sequenceDiagram
    participant Admin as Platform Admin
    participant Login as PlatformAdminLogin
    participant Auth as Central Auth Service
    participant MFA as 2FA Service
    participant DB as Platform Users DB
    participant HSM as Hardware Security Module
    participant Portal as Control Panel
    
    Admin->>Login: Enter Email + Password
    Login->>Auth: POST /auth/platform-admin
    Auth->>DB: Query Platform User
    
    alt User Not Found
        DB-->>Auth: No Match
        Auth-->>Login: Invalid Credentials
        Login->>Admin: Login Failed
    else User Found
        DB-->>Auth: User Record + Password Hash
        Auth->>Auth: Verify Password (bcrypt)
        
        alt Password Invalid
            Auth-->>Login: Invalid Password
            Auth->>DB: Log Failed Attempt (5 max)
            Login->>Admin: Login Failed
        else Password Valid
            Auth->>MFA: Generate 2FA Code
            MFA->>Admin: Send Code via Email/SMS
            
            Admin->>Login: Enter 2FA Code
            Login->>MFA: Verify Code
            
            alt 2FA Invalid
                MFA-->>Login: Code Incorrect
                Login->>Admin: 2FA Failed
            else 2FA Valid
                MFA-->>Auth: Verified
                Auth->>HSM: Generate Session Token
                Note over HSM: JWT signed with HSM-stored key
                HSM-->>Auth: Signed JWT
                
                Auth->>DB: Create Session Record
                Auth->>DB: Update Last Login
                Auth-->>Login: Session Token + User Data
                
                Login->>Login: localStorage.setItem('platform_admin_session')
                Login->>Portal: Redirect to Dashboard
                Portal->>Portal: Load Admin Interface
            end
        end
    end
\`\`\`

#### 2. PSP Staff Authentication

\`\`\`mermaid
sequenceDiagram
    participant Staff as PSP Staff User
    participant Login as PSPLogin Page
    participant Auth as Auth Service
    participant Master as Master DB
    participant Tenant as PSP Tenant Schema
    participant Portal as PSP Portal
    
    Staff->>Login: Enter PSP Code
    Login->>Login: Validate Format (3-20 chars alphanumeric)
    
    alt Invalid Format
        Login->>Staff: "Invalid PSP Code Format"
    else Valid Format
        Login->>Auth: POST /auth/psp/{psp_code}/verify
        Auth->>Master: SELECT FROM provisioned_psps WHERE psp_code = ?
        
        alt PSP Not Found
            Master-->>Auth: No Match
            Auth-->>Login: Invalid PSP Code
            Login->>Staff: "PSP Not Found"
        else PSP Found
            Master-->>Auth: PSP Data (id, status, schema_name)
            
            alt PSP Suspended
                Auth-->>Login: PSP Suspended
                Login->>Staff: "PSP Account Suspended - Contact Support"
            else PSP Active
                Auth->>Auth: Switch Connection to Tenant Schema
                Auth-->>Login: PSP Code Valid - Request Login
                
                Staff->>Login: Enter Email + Password
                Login->>Auth: Authenticate in Tenant Schema
                Auth->>Tenant: SELECT FROM psp_{code}.staff_users WHERE email = ?
                
                alt User Not Found
                    Tenant-->>Auth: No Match
                    Auth-->>Login: Invalid Credentials
                    Login->>Staff: "Email or Password Incorrect"
                else User Found
                    Tenant-->>Auth: User + Role + Permissions
                    Auth->>Auth: Verify Password
                    
                    alt Password Correct
                        Auth->>Auth: Check 2FA Requirement
                        
                        alt 2FA Required
                            Auth->>Staff: Send 2FA Code
                            Staff->>Login: Enter Code
                            Login->>Auth: Verify 2FA
                        end
                        
                        Auth->>Auth: Generate Session Token
                        Auth->>Tenant: Log Login Event
                        Auth-->>Login: Session + PSP Context
                        
                        Login->>Login: localStorage.setItem('staff_session', session)
                        Login->>Login: localStorage.setItem('psp_code', psp_code)
                        Login->>Portal: Redirect to PSP Dashboard
                        Portal->>Portal: Load PSP-Specific Data
                    else Password Incorrect
                        Auth->>Tenant: Log Failed Attempt
                        Auth-->>Login: Authentication Failed
                        Login->>Staff: "Invalid Credentials"
                    end
                end
            end
        end
    end
\`\`\`

#### 3. VASP Customer Authentication with LEI/vLEI Verification

\`\`\`mermaid
sequenceDiagram
    participant Cust as VASP Customer
    participant Login as CryptoGatewayLogin
    participant Auth as Auth Service
    participant DB as VASP Customer DB
    participant GLEIF as GLEIF API
    participant QVI as QVI Registry
    participant HSM as HSM Signature Verify
    participant KYB as KYB Engine
    participant Portal as VASP Portal
    
    Cust->>Login: Enter Email + Password
    Login->>Auth: POST /auth/vasp-customer
    Auth->>DB: Query Customer Record
    
    alt Customer Not Found
        DB-->>Auth: No Match
        Auth-->>Login: Create Account or Login Failed
        Login->>Cust: Sign Up or Retry
    else Customer Exists
        DB-->>Auth: Customer Data + Credential Status
        Auth->>Auth: Verify Password
        
        alt First-Time Login (Onboarding)
            Auth->>Auth: Check Identity Credentials
            
            alt Has TAS ID
                Auth->>Auth: Verify TAS Credential (Trust Anchor Service)
                Note over Auth: TAS verification protocol (future)
                Auth-->>Auth: TAS Verified
                Auth->>DB: Update: trust_score = 100, access = full
                Auth-->>Login: Session (Full Access, No KYB Required)
                Login->>Portal: Dashboard
                Portal->>Cust: ✅ Full Service Access
                
            else Has vLEI Credential
                Auth->>Auth: Parse W3C Verifiable Credential
                Auth->>QVI: Verify Issuer is Qualified vLEI Issuer
                QVI-->>Auth: QVI Verified
                
                Auth->>HSM: Verify vLEI Signature
                Note over HSM: Extract public key from credential<br/>Verify cryptographic signature
                HSM-->>Auth: Signature Valid
                
                Auth->>GLEIF: Verify LEI in Credential
                GLEIF-->>Auth: LEI Active
                
                Auth->>Auth: Build Credential Chain to Root
                Auth->>Auth: Verify Entire Chain
                
                alt vLEI Fully Verified
                    Auth->>DB: Update: trust_score = 100, vlei_verified = true
                    Auth-->>Login: Session (Full Access, No KYB Required)
                    Login->>Portal: Dashboard
                    Portal->>Cust: ✅ Full Service Access (vLEI Verified)
                else vLEI Verification Failed
                    Auth->>Auth: Fallback to LEI-Only Path
                end
                
            else Has LEI Only (No vLEI)
                Auth->>GLEIF: Verify LEI via GLEIF API
                GLEIF->>GLEIF: Query LEI Database
                GLEIF-->>Auth: LEI Data (Status, Entity Name, Address)
                
                alt LEI Active
                    Auth->>Auth: LEI Valid - Requires Full KYB
                    Auth->>DB: Update: lei_verified = true, trust_score = 80
                    Auth->>KYB: Initiate 10-Step KYB Process
                    
                    KYB->>Portal: Show KYB Form
                    Portal->>Cust: Complete KYB Steps
                    Cust->>KYB: Submit Documents
                    
                    KYB->>KYB: AI Document Verification
                    KYB->>KYB: UBO Identification
                    KYB->>KYB: Sanctions + PEP Screening
                    KYB->>KYB: Adverse Media Check
                    KYB->>KYB: Risk Scoring
                    
                    KYB->>Auth: KYB Result (Approved/Rejected/Review)
                    
                    alt KYB Approved
                        Auth->>DB: Update: kyb_status = approved, access = full
                        Auth-->>Login: Session (Full Access After KYB)
                        Login->>Portal: Dashboard
                        Portal->>Cust: ✅ Full Access Granted
                    else KYB Review Required
                        Auth-->>Login: Session (Pending Review)
                        Login->>Portal: Pending Status Page
                        Portal->>Cust: ⚠️ Manual Review (2-3 Days)
                    else KYB Rejected
                        Auth->>DB: Update: kyb_status = rejected
                        Auth-->>Login: Rejected
                        Login->>Cust: ❌ Account Denied
                    end
                    
                else LEI Expired
                    Auth->>DB: Update: lei_status = expired, grace_period = 30 days
                    Auth-->>Login: Session (30-Day Renewal Grace)
                    Login->>Portal: Grace Period Banner
                    Portal->>Cust: ⚠️ Renew LEI Within 30 Days
                    
                else LEI Not Found
                    Auth->>Auth: LEI Invalid - Initiate Grace Period
                    Auth->>DB: Create with grace_period = 90 days
                    Auth-->>Login: Session (90-Day Grace, Limited Access)
                    Login->>Portal: Limited Dashboard
                    Portal->>Cust: ⚠️ Provide LEI/vLEI for Full Access
                end
                
            else No Credentials (LEI, vLEI, TAS)
                Auth->>DB: Create: grace_period_start = NOW(), grace_period_end = NOW() + 90 days
                Auth->>DB: Update: trust_score = 20, access = limited
                Auth-->>Login: Session (90-Day Trial, Limited)
                Login->>Portal: Limited Trial Dashboard
                Portal->>Cust: ⚠️ Limited Access - 90 Days to Provide Credentials
            end
            
        else Returning User
            Auth->>DB: Load Customer Profile + Credential Status
            Auth->>Auth: Check Credential Expiry
            
            alt Credentials Valid
                Auth-->>Login: Session Token
                Login->>Portal: Dashboard
            else LEI Expired
                Auth->>Portal: Show Renewal Banner
                Portal->>Cust: ⚠️ LEI Renewal Required
            else Grace Period Expired
                Auth-->>Login: Account Suspended
                Login->>Cust: ❌ Please Provide Credentials
            end
        end
    end
\`\`\`

---

## 10-Step KYB/KYC & AML Framework (Universal)

### Complete 10-Step Framework Applied Across All Services

*See full details in Service Interoperability document. Summary:*

\`\`\`yaml
10_step_universal_verification:
  step_1: "Initial Data Collection (Business info, contacts)"
  step_2: "LEI Verification via GLEIF API (ISO 17442)"
  step_3: "vLEI Credential Check (W3C VC + ISO 17442-3)"
  step_4: "Document Verification (Incorporation, tax, financial)"
  step_5: "UBO Identification (25%+ ownership, natural persons)"
  step_6: "Sanctions & PEP Screening (OFAC, UN, EU + global PEP databases)"
  step_7: "Adverse Media Check (News, court records, regulatory actions)"
  step_8: "Business Activity Verification (Website, social, public records)"
  step_9: "Source of Funds Verification (Bank statements, financials)"
  step_10: "Comprehensive Risk Scoring & Decision (0-100 score)"
  
  risk_scoring:
    0_to_20: "Low Risk → Auto-Approve"
    21_to_40: "Medium Risk → Manual Review (2-3 days)"
    41_to_60: "High Risk → Enhanced Due Diligence (5-7 days)"
    61_plus: "Prohibited → Auto-Reject"
    
  lei_vlei_impact_on_score:
    verified_vlei_with_chain: "-45 points (massive trust boost)"
    verified_lei_only: "-20 points (strong positive)"
    no_credentials: "+15 points (increases risk)"
\`\`\`

---

## LEI/vLEI Provenance System

### Credential Chain & Trust Propagation

\`\`\`mermaid
graph TB
    subgraph "Level 0: Root Trust"
        ROOT[GLEIF Root Authority<br/>Global LEI Foundation]
    end
    
    subgraph "Level 1: Qualified vLEI Issuers QVI"
        QVI1[DigiCert QVI]
        QVI2[Entrust QVI]
        QVI3[GlobalSign QVI]
    end
    
    subgraph "Level 2: Legal Entities"
        LEI1[Corporation A<br/>LEI: 213800ABC...]
        LEI2[Bank B<br/>LEI: 549300XYZ...]
        LEI3[Fund C<br/>LEI: 635400DEF...]
    end
    
    subgraph "Level 3: Organizational Roles OOR"
        OOR1[CFO of Corp A<br/>Authorized Signatory]
        OOR2[Trader at Bank B<br/>Trading Authority]
        OOR3[Fund Manager C<br/>Investment Authority]
    end
    
    subgraph "Level 4: Engagement Context ECR"
        ECR1[Specific Transaction Auth<br/>Transfer $10M]
        ECR2[Trading Session Auth<br/>FX Trading 9-5]
        ECR3[Investment Decision<br/>Asset Purchase]
    end
    
    subgraph "FTS.Money Provenance Tracking"
        PROV[Credential Chain Database]
        VERIFY[Cryptographic Verification Engine]
        TRUST[Trust Score Calculator]
    end
    
    ROOT -->|Issues QVI Credentials| QVI1
    ROOT -->|Issues QVI Credentials| QVI2
    ROOT -->|Issues QVI Credentials| QVI3
    
    QVI1 -->|Issues vLEI to| LEI1
    QVI2 -->|Issues vLEI to| LEI2
    QVI3 -->|Issues vLEI to| LEI3
    
    LEI1 -->|Issues OOR to| OOR1
    LEI2 -->|Issues OOR to| OOR2
    LEI3 -->|Issues OOR to| OOR3
    
    OOR1 -->|Issues ECR for| ECR1
    OOR2 -->|Issues ECR for| ECR2
    OOR3 -->|Issues ECR for| ECR3
    
    ROOT -.->|Chain Level 0| PROV
    QVI1 -.->|Chain Level 1| PROV
    QVI2 -.->|Chain Level 1| PROV
    LEI1 -.->|Chain Level 2| PROV
    LEI2 -.->|Chain Level 2| PROV
    OOR1 -.->|Chain Level 3| PROV
    ECR1 -.->|Chain Level 4| PROV
    
    PROV --> VERIFY
    VERIFY --> TRUST
    
    TRUST -->|Complete Chain| SCORE100[Trust Score: 100<br/>Highest Confidence]
    TRUST -->|Partial Chain| SCORE80[Trust Score: 80<br/>High Confidence]
    TRUST -->|LEI Only| SCORE60[Trust Score: 60<br/>Medium Confidence]
    TRUST -->|No Credentials| SCORE20[Trust Score: 20<br/>Low Confidence]
    
    style ROOT fill:#10b981,color:#fff
    style QVI1 fill:#3b82f6,color:#fff
    style LEI1 fill:#8b5cf6,color:#fff
    style OOR1 fill:#f59e0b,color:#fff
    style SCORE100 fill:#10b981,color:#fff
    style SCORE20 fill:#ef4444,color:#fff
\`\`\`

**Provenance Use Cases:**

| Scenario | Credential Chain | Trust Score | KYB Required | Approval Time |
|----------|------------------|-------------|--------------|---------------|
| **Enterprise with full vLEI** | GLEIF → QVI → Entity vLEI → OOR | 100 | ❌ No | Instant |
| **Corporation with LEI** | GLEIF → Entity LEI (no vLEI) | 80 | ✅ Yes | 2-14 days |
| **Startup in grace period** | None provided | 20 | ✅ Yes (after 90d) | 90 days trial |
| **Individual (KYC)** | N/A (personal ID) | 60 | ✅ Yes | 24-48 hours |

---

## Future: vLEI Passwordless Authentication

### Vision (2027 Target)

**Replace ALL password-based authentication with cryptographic vLEI proof:**

\`\`\`mermaid
graph TB
    subgraph "Current State (2026)"
        C1[Username Password<br/>Security Risk: Phishing, Breach]
        C2[2FA Codes<br/>UX Friction]
        C3[Session Tokens<br/>Theft Risk]
        C4[Password Databases<br/>Breach Target]
    end
    
    subgraph "Future State (2027)"
        F1[vLEI Credential<br/>Cryptographic Proof]
        F2[Challenge-Response<br/>Zero-Knowledge]
        F3[Digital Signature<br/>Non-Repudiation]
        F4[No Secrets Stored<br/>Zero Breach Risk]
    end
    
    subgraph "Implementation Architecture"
        I1[HSM Cluster<br/>Key Management]
        I2[Credential Vault<br/>vLEI Storage]
        I3[Verification Service<br/>Signature Validation]
        I4[GLEIF Integration<br/>Real-Time Status]
        I5[Revocation Checker<br/>Credential Validity]
    end
    
    subgraph "Benefits"
        B1[🔒 Unphishable<br/>No Password to Steal]
        B2[⚡ Instant Auth<br/>< 500ms verification]
        B3[📋 Audit Trail<br/>Cryptographic Proof]
        B4[🌐 Universal<br/>All FTS Services]
        B5[🔗 Interoperable<br/>Other vLEI Systems]
    end
    
    C1 -.->|Replaced By| F1
    C2 -.->|Replaced By| F2
    C3 -.->|Replaced By| F3
    C4 -.->|Eliminated| F4
    
    F1 --> I1
    F2 --> I2
    F3 --> I3
    F4 --> I4
    I1 --> I5
    
    F4 --> B1
    F3 --> B2
    I5 --> B3
    F1 --> B4
    I4 --> B5
    
    style C4 fill:#ef4444,color:#fff
    style F4 fill:#10b981,color:#fff
    style B1 fill:#2563eb,color:#fff
\`\`\`

### Implementation Roadmap

**Q2 2026: Foundation ($50K + $10K/mo HSM)**
- vLEI credential storage system (encrypted vault)
- HSM cluster deployment (Thales Luna / AWS CloudHSM)
- W3C Verifiable Credentials parser library
- Digital signature validation service
- GLEIF API integration for credential status checks

**Q3 2026: Pilot ($75K)**
- vLEI authentication API endpoints
- Challenge-response protocol implementation
- Verifiable Presentation validation
- Dual authentication support (vLEI + password fallback)
- Pilot with 10-20 enterprise customers on Platform Portal

**Q4 2026: Full Deployment ($100K)**
- All 9 portals support vLEI authentication
- Mobile app integration (iOS/Android wallet support)
- API authentication via vLEI bearer tokens
- Webhook signatures with vLEI credentials
- Customer migration tools

**Q1-Q2 2027: Password Deprecation ($50K audit)**
- 90-day customer migration notice
- Free vLEI credential provisioning support
- Gradual password auth removal
- Security audit & penetration testing
- **April 1, 2027:** Password authentication fully deprecated

---

*Full document continues with detailed specifications for all services—see dedicated service documentation for exhaustive technical details.*

---

**For Complete Details:**
- PSP Platform → "PSP Portal" doc (5,000+ words)
- VASP Platform → "VASP Platform" doc (6,000+ words)
- ISO Gateway → "ISO Gateway Service" doc (8,500+ words)
- Orchestration → "Orchestration Service" doc (7,200+ words)
- RWA Platform → "RWA Platform" doc (9,800+ words)
- VAT/Tax → "VAT & Tax Management" doc (8,500+ words)
- E-Invoicing → "E-Invoicing System" doc (5,200+ words)
- Service Interoperability → "Service Interoperability" doc (6,500+ words)
- Platform Architecture → "Platform Architecture" doc (4,500+ words)
- Control Panel → "FTS Control Panel" doc (9,500+ words)

**Total Documentation:** ~70,700 words across 10 comprehensive technical documents

---

© 2026 FTS.Money. All rights reserved.
`;

export default PlatformOverviewComplete;