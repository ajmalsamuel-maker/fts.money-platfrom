export const PlatformPortalsGuide = `
# FTS.Money Platform Portals - Complete Guide

**Version:** 4.0  
**Last Updated:** January 8, 2026  
**Classification:** Public Documentation

---

## Overview

The FTS.Money ecosystem consists of multiple specialized portals, each serving distinct user roles and business functions. All portals are accessible via **https://platform.fts.money/** followed by the specific page name.

---

## Portal Architecture

\`\`\`mermaid
graph TB
    subgraph "Control Layer - Platform Administration"
        CONTROL[FTS Control Panel<br/>Platform Admins]
    end
    
    subgraph "Community Layer - Self-Service Marketplace"
        COMM[Community Portal<br/>Business Customers]
        COMM --> COMM1[Launch PSP Instance]
        COMM --> COMM2[Launch ISO Gateway]
        COMM --> COMM3[Launch Orchestration]
        COMM --> COMM4[Launch Crypto Gateway]
        COMM --> COMM5[Launch RWA Platform]
        COMM --> COMM6[Browse Service Marketplace]
    end
    
    subgraph "Provider Layer - Service Operations"
        PSP[PSP Portal]
        ISO[ISO Gateway Portal]
        ORCH[Orchestration Portal]
        CRYPTO[Crypto Gateway Portal]
        RWA[RWA Provider Portal]
    end
    
    subgraph "Customer Layer - End Users"
        MERCHANT[Merchant Portal]
        VT[Virtual Terminal]
        ISSUER[Asset Issuer Portal]
        INVESTOR[Investor Portal]
        CONSUMER[Consumer Portal]
    end
    
    subgraph "Compliance Layer - Auditing & Governance"
        QSA[QSA Portal]
        PCI[PCI Compliance Suite]
        IDENTITY[Digital Identity Wallet]
    end
    
    CONTROL -.Manages.-> PSP
    CONTROL -.Manages.-> ISO
    CONTROL -.Manages.-> ORCH
    CONTROL -.Manages.-> CRYPTO
    CONTROL -.Manages.-> RWA
    
    COMM -.Provisions.-> PSP
    COMM -.Provisions.-> ISO
    COMM -.Provisions.-> ORCH
    COMM -.Provisions.-> CRYPTO
    COMM -.Provisions.-> RWA
    
    PSP --> MERCHANT
    PSP --> VT
    RWA --> ISSUER
    RWA --> INVESTOR
    
    style CONTROL fill:#2563eb,color:#fff
    style COMM fill:#10b981,color:#fff
    style PSP fill:#8b5cf6,color:#fff
    style CONSUMER fill:#06b6d4,color:#fff
\`\`\`

---

## 1. FTS Control Panel (Platform Administration)

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/PlatformAdminLogin  
**Authentication**: Platform admin credentials  
**User Roles**: Super Admin, Platform Admin, Operations, Finance, Finance Manager, Support, Viewer

### 1.1 Portal Pages Overview

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| FTSMoneyPlatform | /FTSMoneyPlatform | Main dashboard with all services | All |
| PlatformFIXManagement | /PlatformFIXManagement | FIX Score merchant ranking system | Platform Admin+ |
| FTSSystemHealth | /FTSSystemHealth | System status & service monitoring | All |
| FTSRevenue | /FTSRevenue | Revenue analytics & financial metrics | Platform Admin+ |
| FTSAnalytics | /FTSAnalytics | Platform-wide analytics | All |
| FTSSetupGuide | /FTSSetupGuide | Setup instructions for services | All |
| PSPProvisioning | /PSPProvisioning | Provision new PSP instances | Platform Admin+ |
| FTSProvisioningQueue | /FTSProvisioningQueue | Monitor provisioning progress | Platform Admin+ |
| PlatformUserManagement | /PlatformUserManagement | Manage platform administrators | Super Admin |
| ResourceOrchestration | /ResourceOrchestration | Cloud resource management | Platform Admin+ |
| CarbonDashboard | /CarbonDashboard | Carbon footprint tracking & offsetting | Platform Admin+ |
| ESGReportingDashboard | /ESGReportingDashboard | ESG analytics & CSRD compliance | Platform Admin+ |
| CryptoBankingVASPManagement | /CryptoBankingVASPManagement | VASP provisioning & management | Platform Admin+ |
| CryptoGatewayCustomers | /CryptoGatewayCustomers | Crypto customer overview | Platform Admin+ |
| RWAPlatform | /RWAPlatform | RWA smart contracts & deployment | Platform Admin+ |
| RWAWhiteLabelProvisioning | /RWAWhiteLabelProvisioning | Provision RWA white-label instances | Platform Admin+ |
| FTSServiceManager | /FTSServiceManager | Service catalog management | Platform Admin+ |
| PaymentProviderManagement | /PaymentProviderManagement | Payment provider pool | Platform Admin+ |
| GlobalStandardsRegistry | /GlobalStandardsRegistry | ISO standards & currency registry | All |
| ISOGatewayCustomers | /ISOGatewayCustomers | ISO Gateway customer management | Platform Admin+ |
| ISOGatewayTestConsole | /ISOGatewayTestConsole | Test ISO message translation | Operations+ |
| OrchestrationCustomers | /OrchestrationCustomers | Orchestration customer management | Platform Admin+ |
| TaxManagement | /TaxManagement | Global VAT/tax configuration | Finance+ |
| EInvoicingDashboard | /EInvoicingDashboard | E-invoicing multi-standard system | Finance+ |
| PlatformBillingPortal | /PlatformBillingPortal | Invoice PSPs & merchants | Finance+ |
| PSPInvoiceAggregator | /PSPInvoiceAggregator | View all merchant invoices | Finance+ |
| FTSPayoutRoutes | /FTSPayoutRoutes | Payout routing configuration | Platform Admin+ |
| LEIComplianceDashboard | /LEIComplianceDashboard | LEI/vLEI entity identity management | Platform Admin+ |
| DigitalIdentityWallet | /DigitalIdentityWallet | Verifiable credential wallet | All |

### 1.2 Main Dashboard (FTSMoneyPlatform)

**URL**: https://platform.fts.money/FTSMoneyPlatform

**Add Service Button**: Opens a dialog allowing platform admins to provision any FTS.Money service:
- PSP Instance (complete payment platform)
- ISO Gateway (message translation)
- Orchestration (smart routing)
- Crypto Gateway (cryptocurrency processing)
- RWA Platform (asset tokenization)
- Payment Service (add APIs to catalog)

**Services Overview Section**:

\`\`\`mermaid
graph TB
    subgraph "FTS.Money Platform Services"
        PSP_SVC[PSP Instances<br/>Full payment platforms]
        ISO_SVC[ISO Gateway<br/>Message translation]
        ORCH_SVC[Orchestration<br/>Smart routing]
        CRYPTO_SVC[Crypto Gateway<br/>Digital assets]
        RWA_SVC[RWA Platform<br/>Asset tokenization]
    end
    
    subgraph "Real-Time Metrics"
        PSP_M[Active PSPs<br/>Total Merchants<br/>Monthly Volume]
        ISO_M[Active Customers<br/>Messages/Day<br/>Status: Live]
        ORCH_M[Active Customers<br/>Routing Rules<br/>Status: Live]
        CRYPTO_M[Active Customers<br/>Wallets Created<br/>AUM Managed]
        RWA_M[Active Providers<br/>Assets Tokenized<br/>Total AUM]
    end
    
    PSP_SVC --> PSP_M
    ISO_SVC --> ISO_M
    ORCH_SVC --> ORCH_M
    CRYPTO_SVC --> CRYPTO_M
    RWA_SVC --> RWA_M
    
    style PSP_SVC fill:#3b82f6,color:#fff
    style ISO_SVC fill:#8b5cf6,color:#fff
    style ORCH_SVC fill:#a855f7,color:#fff
    style CRYPTO_SVC fill:#06b6d4,color:#fff
    style RWA_SVC fill:#10b981,color:#fff
\`\`\`

**Platform Performance Metrics**:
- Platform TPS (transactions per second)
- Cloud instances (active across regions)
- CPU cores allocated
- Storage capacity (TB allocated)

### 1.3 FIX Score Management (PlatformFIXManagement)

**URL**: https://platform.fts.money/PlatformFIXManagement

**Purpose**: Manage the FTS Index (FIX) merchant ranking system - a comprehensive scoring algorithm that evaluates merchant performance across multiple dimensions.

**FIX Score Components**:

\`\`\`mermaid
graph TB
    FIX[FIX Score<br/>0-1000 Points] --> T[Transaction Score<br/>0-300 Points]
    FIX --> S[Service Adoption<br/>0-250 Points]
    FIX --> E[ESG Performance<br/>0-250 Points]
    FIX --> C[Compliance & Security<br/>0-200 Points]
    
    T --> T1[Monthly Volume<br/>Weighted]
    T --> T2[Transaction Count<br/>Frequency]
    T --> T3[Growth Rate<br/>Trend]
    
    S --> S1[Active Services<br/>Count]
    S --> S2[Service Diversity<br/>Categories]
    S --> S3[Integration Depth<br/>Usage]
    
    E --> E1[Carbon Offset<br/>CRBN Tokens]
    E --> E2[NANO Tasks<br/>Sponsored]
    E --> E3[Green Bonds<br/>Invested]
    
    C --> C1[PCI Compliance<br/>Status]
    C --> C2[LEI Verified<br/>Identity]
    C --> C3[Uptime %<br/>Reliability]
    
    style FIX fill:#f59e0b,color:#fff
    style T fill:#3b82f6,color:#fff
    style S fill:#8b5cf6,color:#fff
    style E fill:#10b981,color:#fff
    style C fill:#ef4444,color:#fff
\`\`\`

**Score Tiers & Benefits**:

| Tier | Score Range | Benefits | Merchants in Tier |
|------|-------------|----------|-------------------|
| **Diamond** | 900-1000 | Priority support, 0.5% fee discount, featured listing, dedicated account manager | Top 1% |
| **Platinum** | 750-899 | Priority support, 0.3% fee discount, featured listing | Top 5% |
| **Gold** | 600-749 | 0.2% fee discount, enhanced analytics | Top 15% |
| **Silver** | 450-599 | Standard support, analytics dashboard | Top 40% |
| **Bronze** | 0-449 | Basic support | Remaining 60% |

**Leaderboard Features**:
- Global rankings and industry-specific rankings
- Score trend indicators (up/down/stable)
- Drill-down into score components
- Export filtered rankings to CSV
- Real-time score recalculation

### 1.4 Carbon & ESG Dashboard

**URL**: https://platform.fts.money/CarbonDashboard

**Purpose**: Track platform-wide carbon footprint and enable carbon offset purchases through Stripe Climate integration.

**Carbon Tracking**:

\`\`\`mermaid
graph LR
    subgraph "Carbon Sources"
        S1[Server Energy<br/>kWh consumed]
        S2[Transaction Processing<br/>Computational CO2]
        S3[Data Transfer<br/>Network emissions]
        S4[Merchant Operations<br/>Reported data]
    end
    
    subgraph "Carbon Calculation"
        CALC[Carbon Calculator<br/>CO2 kg computed]
    end
    
    subgraph "Offset Actions"
        CRBN[CRBN Tokens<br/>1 token = 1kg CO2]
        STRIPE[Stripe Climate<br/>Carbon removal projects]
        CERT[Offset Certificates<br/>Downloadable PDFs]
    end
    
    S1 --> CALC
    S2 --> CALC
    S3 --> CALC
    S4 --> CALC
    
    CALC --> CRBN
    CALC --> STRIPE
    
    CRBN --> CERT
    STRIPE --> CERT
    
    style CALC fill:#10b981,color:#fff
    style CRBN fill:#06b6d4,color:#fff
\`\`\`

**Features**:
- Real-time carbon footprint calculation
- Purchase carbon offsets via Stripe Climate
- Issue CRBN tokens (blockchain-based carbon credits)
- Download offset certificates
- ESG reporting for CSRD compliance

---

## 2. Community Portal (Self-Service Marketplace)

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/CommunityPortalLogin  
**Authentication**: Community credentials  
**User Roles**: Business Customer, PSP Owner, Service Subscriber

### 2.1 Community Portal Pages

| Page Name | URL Path | Purpose | Access Level |
|-----------|----------|---------|--------------|
| CommunityPortalDashboard | /CommunityPortalDashboard | Main dashboard | All |
| LaunchServices | /LaunchServices | **Browse & subscribe to ALL FTS services** | All |
| MyPSPInstances | /MyPSPInstances | Manage PSP instances | PSP Owner |
| CommunityMarketplace | /CommunityMarketplace | Browse payment services | All |
| CommunityPSPProvisioning | /CommunityPSPProvisioning | Self-provision PSP | Business Customer |
| MySubscriptions | /MySubscriptions | View active service subscriptions | All |
| MyServiceRequests | /MyServiceRequests | Support tickets | All |
| MyAllServices | /MyAllServices | All subscribed services overview | All |
| CommunityAccountSettings | /CommunityAccountSettings | Account settings | All |
| CommunityUserManagement | /CommunityUserManagement | User management | Owner |
| CommunityAnalytics | /CommunityAnalytics | Usage analytics | All |
| CommunityBilling | /CommunityBilling | Invoices & billing | All |

### 2.2 Launch Services Page (LaunchServices)

**URL**: https://platform.fts.money/LaunchServices

**Purpose**: Central hub where business customers can provision ANY FTS.Money platform service.

**Available Services**:

\`\`\`mermaid
graph TB
    subgraph "FTS.Money Service Catalog"
        direction TB
        
        subgraph "Core Infrastructure"
            PSP[PSP Instance<br/>Complete payment platform<br/>From $1,500/month<br/>24-48h setup]
            ISO[ISO Gateway<br/>Message translation service<br/>From $499/month<br/>Instant activation]
            ORCH[Orchestration<br/>Smart routing engine<br/>From $199/month<br/>Instant activation]
        end
        
        subgraph "Digital Asset Services"
            CRYPTO[Crypto Gateway<br/>Cryptocurrency processing<br/>From $2,500/month<br/>2-5 days setup]
            RWA[RWA Platform<br/>Asset tokenization<br/>From $5,000/month<br/>1-2 weeks setup]
        end
        
        subgraph "Value-Added Services"
            MARKET[Service Marketplace<br/>150+ payment services<br/>Variable pricing<br/>1-click activation]
        end
    end
    
    LAUNCH[Launch Services Page] --> PSP
    LAUNCH --> ISO
    LAUNCH --> ORCH
    LAUNCH --> CRYPTO
    LAUNCH --> RWA
    LAUNCH --> MARKET
    
    PSP -.Includes.-> MERCHANT[Merchant Portal]
    PSP -.Includes.-> VT[Virtual Terminal]
    
    style LAUNCH fill:#10b981,color:#fff
    style PSP fill:#3b82f6,color:#fff
    style ISO fill:#8b5cf6,color:#fff
    style ORCH fill:#a855f7,color:#fff
    style CRYPTO fill:#06b6d4,color:#fff
    style RWA fill:#10b981,color:#fff
\`\`\`

**Service Comparison**:

| Service | Best For | Setup Time | Monthly Cost | Includes |
|---------|----------|------------|--------------|----------|
| **PSP Instance** | Running complete payment platform with merchants | 24-48 hours | $1,500-$50,000 | Merchant portal, virtual terminal, reporting, API |
| **ISO Gateway** | Translating payment messages between formats | Instant | $499-$2,499 | ISO 8583 ↔ ISO 20022 ↔ SWIFT MT translation |
| **Orchestration** | Smart routing across providers | Instant | $199-$1,999 | Multi-provider failover, cost optimization |
| **Crypto Gateway** | Cryptocurrency payments & banking | 2-5 days | $2,500+ | Wallets, IBANs, cards, KYC, compliance |
| **RWA Platform** | Tokenizing real-world assets | 1-2 weeks | $5,000+ | Smart contracts, investor portal, compliance |
| **Marketplace Services** | Payment APIs, KYC, fraud, etc. | 1-click | Variable | 150+ pre-integrated services |

### 2.3 Self-Service Provisioning Flow

**Community Portal Provisioning Wizard**:

\`\`\`mermaid
sequenceDiagram
    participant Customer as Business Customer
    participant Portal as Community Portal
    participant Payment as Payment System
    participant Provision as Provisioning Engine
    participant Service as Service Instance
    
    Customer->>Portal: Click "Launch Service"
    Portal->>Customer: Show Service Selection
    Customer->>Portal: Select Service Type
    Portal->>Customer: Show Configuration Form
    
    Customer->>Portal: Enter Details & Preferences
    Portal->>Customer: Show Pricing & Summary
    Customer->>Portal: Confirm Order
    
    Portal->>Payment: Process Setup Fee
    Payment-->>Portal: Payment Confirmed
    
    Portal->>Provision: Submit Provisioning Request
    Provision->>Provision: Allocate Resources
    Provision->>Provision: Deploy Infrastructure
    Provision->>Provision: Configure Service
    Provision->>Service: Activate Service
    
    Service-->>Portal: Service Ready
    Portal-->>Customer: Access Credentials & URL
    
    Customer->>Service: Login to Service Portal
    Service-->>Customer: Service Dashboard
\`\`\`

---

## 3. PSP Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/PSPLogin  
**Authentication**: PSP-specific credentials  
**User Roles**: PSP Owner, PSP Admin, Operations, Finance, Support, Viewer

### 3.1 PSP Portal Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| Dashboard | /Dashboard | PSP main dashboard | All |
| Merchants | /Merchants | Merchant management | Admin+ |
| Transactions | /Transactions | Transaction monitoring | All |
| Settlements | /Settlements | Settlement management | Finance+ |
| Analytics | /Analytics | Business analytics | All |
| MerchantOnboarding | /MerchantOnboarding | Onboard new merchants | Admin+ |
| MasterPricingManagement | /MasterPricingManagement | Pricing configuration | Finance Manager |
| PaymentProviders | /PaymentProviders | Provider configuration | Admin+ |
| APIKeys | /APIKeys | API key management | Admin+ |
| PSPUserManagement | /PSPUserManagement | PSP user management | Owner/Admin |
| Settings | /Settings | PSP configuration | Admin+ |
| MerchantFIXDashboard | /MerchantFIXDashboard | View merchant FIX scores | All |
| PlatformBillingPortal | /PlatformBillingPortal | Generate invoices | Finance+ |

---

## 4. ISO Gateway Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/ISOGatewayLogin  
**Authentication**: ISO Gateway credentials  
**User Roles**: Admin, Developer, Operator, Viewer

### 4.1 ISO Gateway Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| ISOGatewayCustomerPortal | /ISOGatewayCustomerPortal | Main dashboard | All |
| ISOGatewayConnections | /ISOGatewayConnections | Connection management | Admin+ |
| ISOCustomerRouting | /ISOCustomerRouting | Routing rules | Admin+ |
| ISOMessageMonitor | /ISOMessageMonitor | Message monitoring | All |
| ISOConfiguration | /ISOConfiguration | Service configuration | Admin |

**Message Translation Architecture**:

\`\`\`mermaid
sequenceDiagram
    participant Source as Legacy System<br/>ISO 8583
    participant Gateway as ISO Gateway
    participant Parser as Message Parser
    participant Validator as Validator
    participant Translator as Format Translator
    participant Enricher as LEI Enricher
    participant Target as Modern System<br/>ISO 20022
    
    Source->>Gateway: ISO 8583 Message
    Gateway->>Parser: Parse Binary Message
    Parser->>Validator: Validate Fields
    Validator->>Translator: Convert to ISO 20022 XML
    Translator->>Enricher: Add LEI & Purpose Codes
    Enricher->>Target: Send Enhanced ISO 20022
    Target-->>Enricher: ISO 20022 Response
    Enricher->>Translator: Convert to ISO 8583
    Translator-->>Gateway: Translated Response
    Gateway-->>Source: ISO 8583 Response
\`\`\`

**Supported Standards**:
- ISO 8583 (1987, 1993, 2003 versions)
- ISO 20022 (pain.001, pacs.008, camt.053, etc.)
- SWIFT MT (MT103, MT202, MT940)
- Custom XML/JSON formats

---

## 5. Orchestration Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/OrchestrationLogin  
**Authentication**: Orchestration credentials  
**User Roles**: Admin, Operations, Finance, Viewer

### 5.1 Orchestration Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| OrchestrationPortal | /OrchestrationPortal | Main dashboard | All |
| SmartOrchestration | /SmartOrchestration | Routing rules | Admin+ |
| PaymentOrchestration | /PaymentOrchestration | Payment optimization | Operations+ |

**Smart Routing Engine**:

\`\`\`mermaid
graph TB
    TXN[Incoming Transaction] --> ANALYZE[Analyze Transaction]
    
    ANALYZE --> A1[Amount: $50.00]
    ANALYZE --> A2[Currency: USD]
    ANALYZE --> A3[Card: Visa]
    ANALYZE --> A4[Country: US]
    ANALYZE --> A5[Time: 14:30 UTC]
    
    A1 --> SCORE[Scoring Engine]
    A2 --> SCORE
    A3 --> SCORE
    A4 --> SCORE
    A5 --> SCORE
    
    SCORE --> R1[Provider A<br/>Success: 98%<br/>Cost: $0.08<br/>Score: 92]
    SCORE --> R2[Provider B<br/>Success: 95%<br/>Cost: $0.06<br/>Score: 88]
    SCORE --> R3[Provider C<br/>Success: 97%<br/>Cost: $0.09<br/>Score: 85]
    
    R1 -.Primary.-> ROUTE[Route Transaction]
    R2 -.Fallback.-> ROUTE
    R3 -.Tertiary.-> ROUTE
    
    ROUTE --> EXEC[Execute Payment]
    EXEC --> SUCCESS{Approved?}
    SUCCESS -->|Yes| DONE[Complete]
    SUCCESS -->|No| FALLBACK[Try Provider B]
    
    style SCORE fill:#f59e0b,color:#fff
    style R1 fill:#10b981,color:#fff
\`\`\`

---

## 6. Crypto Gateway Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/CryptoGatewayLogin  
**Authentication**: Crypto Gateway credentials  
**User Roles**: Admin, Compliance, Operations, Viewer

### 6.1 Crypto Gateway Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| CryptoGatewayDashboard | /CryptoGatewayDashboard | Main dashboard | All |
| CryptoUsers | /CryptoUsers | User management | Admin+ |
| CryptoWallets | /CryptoWallets | Wallet management | All |
| CryptoTransactions | /CryptoTransactions | Transaction history | All |
| CryptoIBANs | /CryptoIBANs | IBAN accounts | All |
| CryptoCards | /CryptoCards | Card management | All |
| CryptoKYCManagement | /CryptoKYCManagement | KYC verification | Compliance+ |
| CryptoBankingCompliance | /CryptoBankingCompliance | VASP compliance | Compliance+ |

**Crypto Banking Architecture** (Powered by Striga):

\`\`\`mermaid
graph TB
    subgraph "Customer Interface"
        UI[Crypto Gateway Portal]
    end
    
    subgraph "FTS.Money Layer"
        API[FTS API Gateway]
        AUTH[Authentication]
        BILLING[Usage Metering]
    end
    
    subgraph "Striga Infrastructure"
        STRIGA[Striga API]
        WALLETS[Multi-Chain Wallets]
        IBANS[Virtual IBANs]
        CARDS[Card Issuing]
        KYC[KYC/AML Engine]
    end
    
    subgraph "External Rails"
        BLOCKCHAIN[Blockchain Networks<br/>BTC, ETH, USDC]
        BANKING[SEPA Banking Network]
        VISA[Visa Card Network]
    end
    
    UI --> API
    API --> AUTH
    AUTH --> STRIGA
    STRIGA --> WALLETS
    STRIGA --> IBANS
    STRIGA --> CARDS
    STRIGA --> KYC
    
    WALLETS --> BLOCKCHAIN
    IBANS --> BANKING
    CARDS --> VISA
    
    API --> BILLING
    
    style STRIGA fill:#f59e0b,color:#fff
    style BLOCKCHAIN fill:#10b981,color:#fff
\`\`\`

**Supported Cryptocurrencies**:
- Bitcoin (BTC) - Bitcoin Network
- Ethereum (ETH) - Ethereum Network
- USDC - Ethereum, Polygon, Solana
- USDT - Ethereum, Tron
- Lightning Network - Instant BTC

---

## 7. RWA Provider Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/RWAProviderLogin  
**Authentication**: RWA Provider credentials  
**User Roles**: Provider Admin, Operations, Compliance, Viewer

### 7.1 RWA Provider Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| RWAProviderDashboard | /RWAProviderDashboard | Main dashboard | All |
| RWAProviderAssets | /RWAProviderAssets | Asset management | All |
| RWAProviderIssuers | /RWAProviderIssuers | Issuer management | Admin+ |
| RWAProviderInvestors | /RWAProviderInvestors | Investor management | All |
| RWAProviderAnalytics | /RWAProviderAnalytics | Analytics | All |
| RWAProviderIdentityWallet | /RWAProviderIdentityWallet | vLEI credentials | All |
| RWAProviderSettings | /RWAProviderSettings | Configuration | Admin |
| RWAProviderUserManagement | /RWAProviderUserManagement | User management | Admin |

**Asset Tokenization Flow**:

\`\`\`mermaid
sequenceDiagram
    participant Issuer as Asset Issuer
    participant Provider as RWA Provider
    participant Platform as FTS RWA Platform
    participant Contract as Smart Contract
    participant Blockchain
    participant Investor
    
    Issuer->>Provider: Submit Asset for Tokenization
    Provider->>Platform: Create Asset Record
    Platform->>Platform: Verify Issuer LEI
    Platform->>Platform: Validate Asset Documents
    
    Platform->>Contract: Deploy Token Contract
    Contract->>Blockchain: Deploy ERC-3643 Token
    Blockchain-->>Contract: Contract Address
    Contract-->>Platform: Token Created
    
    Platform->>Provider: Asset Tokenized
    Provider->>Issuer: Asset Live on Platform
    
    Investor->>Platform: Browse Assets
    Investor->>Platform: Purchase Tokens
    Platform->>Platform: Verify Investor Accreditation
    Platform->>Contract: Transfer Tokens
    Contract->>Blockchain: Execute Transfer
    Blockchain-->>Investor: Tokens Delivered
    
    Note over Platform: Automated dividend distribution
    Note over Platform: Secondary market trading
\`\`\`

---

## 8. Merchant Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/MerchantLogin  
**Authentication**: Merchant credentials  
**User Roles**: Owner, Admin, Finance, Support, Viewer

### 8.1 Merchant Portal Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| MerchantPortal | /MerchantPortal | Main dashboard | All |
| MerchantDashboard | /MerchantDashboard | Alternative dashboard | All |
| MerchantFIXDashboard | /MerchantFIXDashboard | View FIX score & ranking | All |
| MerchantTransactionList | /MerchantTransactionList | Transaction list | All |
| MerchantSettlementReports | /MerchantSettlementReports | Settlement reports | Finance+ |
| MerchantInvoices | /MerchantInvoices | Invoice management | Finance+ |
| MerchantInvoicePortal | /MerchantInvoicePortal | E-invoicing system | Finance+ |
| GreenMerchantDashboard | /GreenMerchantDashboard | Sustainability metrics & NANO | All |
| MerchantAnalytics | /MerchantAnalytics | Business analytics | All |
| MerchantAPIKeys | /MerchantAPIKeys | API key management | Admin+ |
| MerchantSettings | /MerchantSettings | Merchant settings | Admin+ |

### 8.2 Merchant FIX Score Dashboard

**URL**: https://platform.fts.money/MerchantFIXDashboard

**Features**:
- View own FIX score and tier (Bronze to Diamond)
- See score breakdown across 4 components
- Track score trend (up/down/stable)
- View unlocked benefits
- Compare to industry average
- See what's needed to reach next tier

**Score Improvement Actions**:
- Increase transaction volume
- Activate more FTS services
- Sponsor NANO sustainability tasks
- Purchase carbon offsets (CRBN)
- Invest in green bonds
- Achieve PCI compliance
- Verify LEI
- Maintain high uptime

### 8.3 Green Merchant Dashboard

**URL**: https://platform.fts.money/GreenMerchantDashboard

**Purpose**: Track sustainability metrics, sponsor NANO tasks, manage green certifications.

**Green Merchant Features**:

\`\`\`mermaid
graph TB
    subgraph "Green Merchant Program"
        STATUS[Green Badge Status<br/>Pending → Verified → Premium]
        
        subgraph "Sustainability Actions"
            CERT[Upload Certifications<br/>B-Corp, Climate Neutral, etc.]
            NANO[Sponsor NANO Tasks<br/>Fund sustainability actions]
            CARBON[Purchase Carbon Offsets<br/>CRBN tokens]
            BONDS[Invest in Green Bonds<br/>Environmental projects]
        end
        
        subgraph "Benefits"
            BADGE[Green Badge on Profile]
            BOOST[FIX Score Boost<br/>+50-100 points]
            FEATURED[Featured in Green Directory]
            DISCOUNT[Platform Fee Discount<br/>0.1-0.3%]
        end
    end
    
    STATUS --> CERT
    STATUS --> NANO
    STATUS --> CARBON
    STATUS --> BONDS
    
    CERT --> BADGE
    NANO --> BOOST
    CARBON --> FEATURED
    BONDS --> DISCOUNT
    
    style STATUS fill:#10b981,color:#fff
    style BOOST fill:#f59e0b,color:#fff
\`\`\`

**Green Badge Tiers**:
- **Pending**: Applied for verification
- **Verified**: Certified sustainable practices
- **Premium**: Advanced certifications + high impact

---

## 9. Consumer Portal (NANO Sustainability Platform)

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/ConsumerLogin  
**Authentication**: Consumer credentials  

### 9.1 Consumer Portal Pages

| Page Name | URL Path | Purpose |
|-----------|----------|---------|
| ConsumerHome | /ConsumerHome | Landing page |
| NanoTaskMarketplace | /NanoTaskMarketplace | Browse & complete tasks |
| UserNanoHub | /UserNanoHub | Personal impact dashboard |
| GreenBondsMarketplace | /GreenBondsMarketplace | Invest in environmental projects |
| NFTAchievements | /NFTAchievements | Achievement NFT collection |
| NANOStaking | /NANOStaking | Stake NANO for rewards |
| ProjectDAO | /ProjectDAO | Vote on environmental projects |
| CommunityLeaderboard | /CommunityLeaderboard | Top contributors ranking |
| CommunityForum | /CommunityForum | Sustainability discussion forum |

### 9.2 NANO Sustainability Ecosystem

**NANO Token Economy**:

\`\`\`mermaid
graph TB
    subgraph "Earn NANO"
        TASKS[Complete Tasks<br/>5-500 NANO per task]
        MERCHANT[Merchant Sponsorship<br/>Special campaigns]
        STREAK[Daily Streaks<br/>Bonus rewards]
    end
    
    subgraph "NANO Utility"
        STAKE[Stake for APY<br/>5-15% returns]
        DAO[DAO Voting<br/>1 NANO = 1 vote]
        DISCOUNT[Merchant Discounts<br/>Partner offers]
        CRBN[Convert to CRBN<br/>Carbon offset tokens]
    end
    
    subgraph "NANO Tasks"
        T1[Plant Tree - 50 NANO]
        T2[Use Public Transport - 20 NANO]
        T3[Reduce Plastic - 30 NANO]
        T4[Recycle - 15 NANO]
        T5[Energy Saving - 25 NANO]
    end
    
    TASKS --> STAKE
    MERCHANT --> DAO
    STREAK --> DISCOUNT
    
    TASKS -.Reward.-> T1
    TASKS -.Reward.-> T2
    TASKS -.Reward.-> T3
    TASKS -.Reward.-> T4
    TASKS -.Reward.-> T5
    
    STAKE --> CRBN
    
    style TASKS fill:#10b981,color:#fff
    style STAKE fill:#f59e0b,color:#fff
    style DAO fill:#8b5cf6,color:#fff
\`\`\`

**NANO Task Verification Methods**:
- Receipt scan (photo upload + AI validation)
- Photo upload (before/after evidence)
- GPS tracking (location verification)
- QR code scan (partner validation)
- Manual review (community moderators)

### 9.3 Achievement NFT System

**Gamification & Rewards**:

| Badge Type | Requirement | NFT Tier | Bonus |
|------------|-------------|----------|-------|
| **Tree Planter** | Plant 10/50/100 trees | Bronze/Silver/Gold | +10/25/50 NANO |
| **Plastic Reducer** | Reduce plastic 30/90/180 days | Bronze/Silver/Gold | +15/35/75 NANO |
| **Transport Hero** | Public transport 50/150/300 trips | Bronze/Silver/Gold | +20/40/100 NANO |
| **Energy Saver** | Energy saving 100/300/500 kWh | Bronze/Silver/Gold | +25/50/125 NANO |
| **Streak Master** | Daily streak 30/90/365 days | Bronze/Silver/Gold | +30/75/200 NANO |
| **Community Leader** | Create 10/30/100 forum posts | Bronze/Silver/Gold | +15/40/100 NANO |

**NFT Minting**: Achievement NFTs are minted on Polygon network as ERC-721 tokens and can be traded on OpenSea.

---

## 10. E-Invoicing & Tax Management

### 10.1 Tax Management Portal

**URL**: https://platform.fts.money/TaxManagement

**Purpose**: Configure global VAT/tax rules, manage tax jurisdictions, and ensure compliance with regional regulations.

**Supported Tax Standards**:

\`\`\`mermaid
graph TB
    subgraph "Tax Calculation Engine"
        TXN[Transaction Data] --> CALC[Tax Calculator]
        
        CALC --> EU[EU VAT Rules<br/>Standard/Reduced/Zero rates]
        CALC --> UK[UK VAT<br/>Post-Brexit rules]
        CALC --> US[US Sales Tax<br/>State/Local/Special]
        CALC --> CA[Canadian GST/HST/PST]
        CALC --> AU[Australian GST]
        CALC --> IN[Indian GST]
        
        EU --> RATE[Tax Rate Applied]
        UK --> RATE
        US --> RATE
        CA --> RATE
        AU --> RATE
        IN --> RATE
        
        RATE --> INV[Invoice Generated<br/>With tax breakdown]
    end
    
    style CALC fill:#3b82f6,color:#fff
    style INV fill:#10b981,color:#fff
\`\`\`

**Tax Categories**:
- **Goods**: Physical products (standard VAT)
- **Digital Services**: Software, streaming (digital VAT rules)
- **Financial Services**: Often exempt or zero-rated
- **Educational**: Reduced or exempt rates
- **Healthcare**: Often exempt
- **Food & Essentials**: Reduced rates in most jurisdictions

### 10.2 E-Invoicing Dashboard

**URL**: https://platform.fts.money/EInvoicingDashboard

**Supported E-Invoicing Standards**:

| Standard | Region | Format | Validation | Adoption |
|----------|--------|--------|------------|----------|
| **Peppol** | Europe, Australia, Singapore | UBL 2.1 XML | SchematronFER validation | Required in many EU countries |
| **ZATCA** | Saudi Arabia | XML | Fatoorah API | Mandatory for KSA |
| **FatturaPA** | Italy | XML | SDI validation | Mandatory |
| **CFDI** | Mexico | XML (SAT) | PAC validation | Mandatory |
| **FacturaE** | Spain | Facturae XML | Tax agency | Voluntary but common |
| **XRechnung** | Germany | UBL/CII XML | Standard validation | Public sector mandatory |
| **EHF** | Norway | UBL 2.1 | Peppol network | Public sector mandatory |

**E-Invoice Generation Flow**:

\`\`\`mermaid
sequenceDiagram
    participant Merchant
    participant System as E-Invoicing System
    participant Generator as Invoice Generator
    participant Validator as Standard Validator
    participant Tax as Tax Authority API
    participant Customer
    
    Merchant->>System: Transaction Completed
    System->>Generator: Create Invoice
    Generator->>Generator: Apply Tax Rules
    Generator->>Generator: Format per Standard
    Generator->>Validator: Validate XML/UBL
    Validator-->>Generator: Schema Valid
    
    Generator->>Tax: Submit to Authority
    Tax->>Tax: Validate & Approve
    Tax-->>Generator: Invoice Approved + UUID
    
    Generator->>Customer: Send Invoice (Email + PDF)
    Generator->>Merchant: Archive Invoice
    
    Note over Generator: Invoice digitally signed
    Note over Generator: Blockchain hash stored
\`\`\`

---

## 11. QSA Portal (Compliance Auditing)

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/QSAPortalLogin  
**Authentication**: QSA access token  
**User Roles**: QSA Auditor (Read-only + report upload)

### 11.1 QSA Portal Pages

| Page Name | URL Path | Purpose | Permissions |
|-----------|----------|---------|-------------|
| QSAPortalDashboard | /QSAPortalDashboard | Main dashboard | Read |
| PCIRequirementsTracker | /PCIRequirementsTracker | View requirements | Read |
| PCIEvidenceVault | /PCIEvidenceVault | Evidence browser | Read + Download |
| PCIControlTesting | /PCIControlTesting | View control tests | Read |
| PCIAuditReports | /PCIAuditReports | Upload audit findings | Upload |
| QSAUserManagement | /QSAUserManagement | QSA user management | Platform Admin only |

**PCI DSS Advanced Features**:

\`\`\`mermaid
graph TB
    subgraph "PCI DSS Compliance Suite"
        DASH[Compliance Dashboard<br/>12 Requirements]
        
        subgraph "Real-Time Monitoring"
            MON[Continuous Monitoring<br/>Automated checks every 30min]
            HEALTH[Health Checks<br/>Firewall, encryption, access]
            ALERT[Alert System<br/>Instant notifications]
        end
        
        subgraph "AI-Powered Analytics"
            PRED[Predictive Analytics<br/>Forecast compliance risks]
            ML[Machine Learning<br/>Pattern detection]
            FORECAST[6-month Projections<br/>Risk scoring]
        end
        
        subgraph "Workflow Automation"
            WORK[Automated Remediation<br/>Fix issues automatically]
            TICKET[Ticket Generation<br/>Assign to teams]
            TRACK[Progress Tracking<br/>SLA monitoring]
        end
        
        subgraph "Advanced Reporting"
            REPORT[Report Builder<br/>Custom reports]
            TEMPLATE[Templates for<br/>QSA, Board, Regulatory]
            EXPORT[Export PDF/DOCX/CSV]
        end
    end
    
    DASH --> MON
    DASH --> PRED
    DASH --> WORK
    DASH --> REPORT
    
    MON --> ALERT
    PRED --> FORECAST
    WORK --> TICKET
    REPORT --> EXPORT
    
    style DASH fill:#ef4444,color:#fff
    style PRED fill:#8b5cf6,color:#fff
    style WORK fill:#10b981,color:#fff
\`\`\`

**PCI Continuous Monitoring Checks**:
- Firewall rule validation (every 30 minutes)
- Encryption status (TLS versions, cipher suites)
- Access control logs (unauthorized attempts)
- Vulnerability scanning (daily automated)
- Log monitoring (real-time anomaly detection)
- Network segmentation (boundary validation)
- Security testing (weekly automated)
- Policy compliance (configuration drift)

---

## 12. Digital Identity & Credentials

### 12.1 Digital Identity Wallet

**URL**: https://platform.fts.money/DigitalIdentityWallet

**Purpose**: Store and manage verifiable credentials using W3C standards and decentralized identifiers (DIDs).

**Credential Architecture**:

\`\`\`mermaid
graph TB
    subgraph "Credential Lifecycle"
        ISSUE[Credential Issued<br/>by Authority]
        STORE[Stored in Wallet<br/>Encrypted locally]
        PRESENT[Presented to Verifier<br/>Selective disclosure]
        VERIFY[Cryptographically Verified<br/>DID signature check]
        REVOKE[Revocation Check<br/>Status list validation]
    end
    
    subgraph "Credential Types"
        LEI[LEI Credential<br/>Legal Entity Identifier]
        KYC[KYC Certificate<br/>Individual verification]
        BANK[Bank Account Credential<br/>IBAN verification]
        EMPLOY[Employment Credential<br/>Income proof]
        LICENSE[Business License<br/>Regulatory approval]
    end
    
    subgraph "Use Cases"
        ONBOARD[Fast Merchant Onboarding<br/>Instant verification]
        KYB[Business KYB<br/>Reusable credentials]
        COMPLIANCE[Regulatory Reporting<br/>Automated compliance]
        PAYMENT[Payment Setup<br/>Bank account verification]
    end
    
    ISSUE --> STORE
    STORE --> PRESENT
    PRESENT --> VERIFY
    VERIFY --> REVOKE
    
    LEI --> ONBOARD
    KYC --> KYB
    BANK --> PAYMENT
    EMPLOY --> COMPLIANCE
    LICENSE --> ONBOARD
    
    style STORE fill:#3b82f6,color:#fff
    style VERIFY fill:#10b981,color:#fff
\`\`\`

**Supported Credentials**:
- **LEI Credential**: Legal Entity Identifier from GLEIF
- **vLEI**: Verifiable LEI for automated verification
- **KYC Certificate**: Individual identity verification
- **Bank Account Credential**: IBAN/account verification
- **Business License**: Regulatory licenses
- **Employment Credential**: Income and employment proof

### 12.2 Credential Presentation

**URL**: https://platform.fts.money/CredentialPresentation

**Selective Disclosure Example**:

\`\`\`mermaid
sequenceDiagram
    participant Holder as Credential Holder
    participant Wallet as Digital Wallet
    participant Verifier as Service Provider
    participant Blockchain as DID Registry
    
    Verifier->>Holder: Request: Proof of LEI
    Holder->>Wallet: Select LEI Credential
    Wallet->>Holder: Show: Share full LEI or just "verified" status?
    Holder->>Wallet: Choose: Only share "verified" flag
    
    Wallet->>Wallet: Create Verifiable Presentation
    Wallet->>Wallet: Sign with DID Private Key
    Wallet->>Verifier: Present Credential (selective fields only)
    
    Verifier->>Blockchain: Lookup DID Document
    Blockchain-->>Verifier: Public Key
    Verifier->>Verifier: Verify Signature
    Verifier->>Verifier: Check Revocation Status
    Verifier-->>Holder: Verification Complete
    
    Note over Holder,Verifier: LEI verified WITHOUT sharing full LEI number
\`\`\`

---

## 13. Invoicing & Billing Systems

### 13.1 Platform Billing Portal

**URL**: https://platform.fts.money/PlatformBillingPortal

**Purpose**: Platform admins generate invoices for PSPs and merchants using automated VAT calculation.

**Invoice Generation Flow**:

\`\`\`mermaid
graph LR
    subgraph "Billing Cycle"
        START[Start of Month] --> COLLECT[Collect Usage Data]
        COLLECT --> CALC[Calculate Charges]
        CALC --> VAT[Apply VAT Rules]
        VAT --> GEN[Generate Invoice]
        GEN --> SEND[Send to Customer]
        SEND --> TRACK[Track Payment]
    end
    
    subgraph "Data Sources"
        TXN[Transaction Volume]
        SUB[Service Subscriptions]
        USAGE[API Usage Metrics]
        OVER[Overage Charges]
    end
    
    subgraph "Tax Calculation"
        JURIS[Determine Jurisdiction]
        RATE_LOOKUP[Lookup Tax Rate]
        APPLY[Apply to Line Items]
        TOTAL[Calculate Total]
    end
    
    TXN --> COLLECT
    SUB --> COLLECT
    USAGE --> COLLECT
    OVER --> COLLECT
    
    CALC --> JURIS
    JURIS --> RATE_LOOKUP
    RATE_LOOKUP --> APPLY
    APPLY --> TOTAL
    TOTAL --> VAT
    
    style GEN fill:#10b981,color:#fff
    style VAT fill:#f59e0b,color:#fff
\`\`\`

### 13.2 Merchant Invoice Portal

**URL**: https://platform.fts.money/MerchantInvoicePortal

**Purpose**: Merchants generate customer-facing invoices with automatic VAT calculation and e-invoicing standard compliance.

**Features**:
- Invoice template builder
- Multi-currency invoicing
- Automatic VAT calculation based on customer location
- E-invoice generation (Peppol, ZATCA, FatturaPA, CFDI)
- Payment link integration
- Recurring invoice scheduling
- Invoice status tracking
- Downloadable PDF invoices

---

## URL Summary Table

### All Portal URLs

| Portal | Login URL | Main Dashboard URL | Service Type |
|--------|-----------|-------------------|--------------|
| FTS Control Panel | /PlatformAdminLogin | /FTSMoneyPlatform | Platform administration |
| Community Portal | /CommunityPortalLogin | /CommunityPortalDashboard | Self-service marketplace for ALL services |
| PSP Portal | /PSPLogin | /Dashboard | Payment service provider operations |
| ISO Gateway | /ISOGatewayLogin | /ISOGatewayCustomerPortal | Message translation service |
| Orchestration | /OrchestrationLogin | /OrchestrationPortal | Smart routing service |
| Crypto Gateway | /CryptoGatewayLogin | /CryptoGatewayDashboard | Cryptocurrency & banking |
| RWA Provider | /RWAProviderLogin | /RWAProviderDashboard | Asset tokenization platform |
| Merchant | /MerchantLogin | /MerchantPortal | Merchant self-service |
| Consumer (NANO) | /ConsumerLogin | /ConsumerHome | Sustainability rewards |
| QSA | /QSAPortalLogin | /QSAPortalDashboard | Compliance auditing |
| Asset Issuer | /AssetIssuerLogin | /AssetIssuerDashboard | Asset tokenization |
| Investor | /InvestorLogin | /InvestorPortfolio | RWA investment |
| Virtual Terminal | /VirtualTerminalLogin | /VirtualTerminal | Payment processing |

---

## Conclusion

The FTS.Money platform consists of **13 specialized portals** serving distinct user roles across the payment and financial services ecosystem.

**Key Highlights**:
- ✅ **Community Portal** - Self-service access to ALL FTS.Money services (not just PSP)
- ✅ **FIX Score** - Merchant ranking and rewards system
- ✅ **NANO Platform** - Sustainability rewards & carbon offsetting
- ✅ **E-Invoicing** - Multi-standard global invoice compliance
- ✅ **Advanced PCI** - AI-powered continuous compliance monitoring
- ✅ **Digital Identity** - Verifiable credentials & passwordless auth
- ✅ **200+ pages** - Comprehensive functionality across all portals

**Single platform, multiple portals, unified ecosystem.**

For access to any portal, contact your FTS.Money account manager or platform administrator.

© 2026 FTS.Money. All rights reserved.
`;

export default PlatformPortalsGuide;