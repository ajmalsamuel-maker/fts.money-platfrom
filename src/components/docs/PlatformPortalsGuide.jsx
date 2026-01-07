export const PlatformPortalsGuide = `
# FTS.Money Platform Portals - Complete Guide

## Overview

The FTS.Money ecosystem consists of multiple specialized portals, each serving distinct user roles and business functions. All portals are accessible via **https://platform.fts.money/** followed by the specific page name.

---

## Portal Architecture

\`\`\`mermaid
graph TB
    subgraph "Control Layer"
        CONTROL[FTS Control Panel]
    end
    
    subgraph "Provider Layer"
        PSP[PSP Portal]
        ISO[ISO Gateway Portal]
        ORCH[Orchestration Portal]
        CRYPTO[Crypto Gateway Portal]
        RWA[RWA Provider Portal]
    end
    
    subgraph "Community Layer"
        COMM[Community Portal]
    end
    
    subgraph "Customer Layer"
        MERCHANT[Merchant Portal]
        VT[Virtual Terminal]
    end
    
    subgraph "Compliance Layer"
        QSA[QSA Portal]
        PCI[PCI Compliance Portal]
    end
    
    subgraph "Investment Layer"
        ISSUER[Asset Issuer Portal]
        INVESTOR[Investor Portal]
    end
    
    CONTROL --> PSP
    CONTROL --> ISO
    CONTROL --> ORCH
    CONTROL --> CRYPTO
    CONTROL --> RWA
    
    COMM --> PSP
    
    PSP --> MERCHANT
    PSP --> VT
    
    style CONTROL fill:#2563eb,color:#fff
    style COMM fill:#10b981,color:#fff
    style PSP fill:#8b5cf6,color:#fff
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
| FTSMoneyPlatform | /FTSMoneyPlatform | Main dashboard with KPIs and quick actions | All |
| FTSSystemHealth | /FTSSystemHealth | System status and service health monitoring | All |
| FTSRevenue | /FTSRevenue | Revenue analytics and financial metrics | Platform Admin+ |
| FTSAnalytics | /FTSAnalytics | Platform-wide analytics and insights | All |
| FTSSetupGuide | /FTSSetupGuide | Setup instructions for all services | All |
| PSPProvisioning | /PSPProvisioning | Provision new PSP instances | Platform Admin+ |
| FTSProvisioningQueue | /FTSProvisioningQueue | Monitor provisioning progress | Platform Admin+ |
| PlatformUserManagement | /PlatformUserManagement | Manage platform administrators | Super Admin |
| ResourceOrchestration | /ResourceOrchestration | Cloud resource management | Platform Admin+ |
| CryptoBankingVASPManagement | /CryptoBankingVASPManagement | VASP provisioning and management | Platform Admin+ |
| CryptoGatewayCustomers | /CryptoGatewayCustomers | Crypto customer overview | Platform Admin+ |
| CryptoGatewayTransactions | /CryptoGatewayTransactions | Crypto transaction monitoring | Platform Admin+ |
| CryptoCompliance | /CryptoCompliance | Crypto KYC/AML compliance | Platform Admin+ |
| StrigaServiceManagement | /StrigaServiceManagement | Striga integration settings | Platform Admin+ |
| RWAPlatform | /RWAPlatform | RWA smart contracts and deployment | Platform Admin+ |
| RWAWhiteLabelProvisioning | /RWAWhiteLabelProvisioning | Provision RWA white-label instances | Platform Admin+ |
| FTSServiceManager | /FTSServiceManager | Service catalog management | Platform Admin+ |
| PaymentProviderManagement | /PaymentProviderManagement | Payment provider pool | Platform Admin+ |
| GlobalStandardsRegistry | /GlobalStandardsRegistry | ISO standards and currency registry | All |
| ISOGatewayCustomers | /ISOGatewayCustomers | ISO Gateway customer management | Platform Admin+ |
| ISOGatewayConnections | /ISOGatewayConnections | ISO connection monitoring | Platform Admin+ |
| ISOGatewayTestConsole | /ISOGatewayTestConsole | Test ISO message translation | Operations+ |
| ISOMessageMonitor | /ISOMessageMonitor | Real-time ISO message logs | Operations+ |
| OrchestrationCustomers | /OrchestrationCustomers | Orchestration customer management | Platform Admin+ |
| FTSPayoutRoutes | /FTSPayoutRoutes | Payout routing configuration | Platform Admin+ |
| FTSServiceProviders | /FTSServiceProviders | Service provider registry | Platform Admin+ |
| PSPWholesaleMarketplace | /PSPWholesaleMarketplace | Wholesale PSP marketplace | All |

### 1.2 Main Dashboard (FTSMoneyPlatform)

**URL**: https://platform.fts.money/FTSMoneyPlatform

**Purpose**: Central command center for platform administrators to monitor all services, metrics, and system health.

**Key Features**:
- Real-time service status overview
- Quick action buttons for common tasks
- Platform-wide KPIs and metrics
- Recent activity feed
- System alerts and notifications

**Dashboard Sections**:

\`\`\`mermaid
graph TB
    DASH[Main Dashboard] --> STATS[Statistics Cards]
    DASH --> QUICK[Quick Actions]
    DASH --> SERVICES[Service Status]
    DASH --> ACTIVITY[Recent Activity]
    
    STATS --> S1[Active PSPs]
    STATS --> S2[Total Transactions]
    STATS --> S3[Platform Revenue]
    STATS --> S4[Active Users]
    
    QUICK --> Q1[Provision PSP]
    QUICK --> Q2[Add Provider]
    QUICK --> Q3[View Reports]
    QUICK --> Q4[System Settings]
    
    SERVICES --> SV1[PSP Status]
    SERVICES --> SV2[ISO Gateway]
    SERVICES --> SV3[Crypto Banking]
    SERVICES --> SV4[RWA Platform]
\`\`\`

**Metrics Displayed**:

| Metric | Description | Update Frequency | Data Source |
|--------|-------------|------------------|-------------|
| Active PSP Instances | Total provisioned PSPs | Real-time | ProvisionedPSP entity |
| Total Merchants | Merchants across all PSPs | Real-time | Merchant entity |
| Platform Revenue | Total revenue generated | Hourly | Transaction aggregation |
| Transaction Volume | 24h transaction count | Real-time | Transaction entity |
| Service Health | Overall system status | Every 30 seconds | Health check API |
| ISO Gateway Customers | Active ISO customers | Real-time | ISOGatewayCustomer entity |
| Crypto Gateway Users | Active crypto users | Real-time | CryptoGatewayCustomer entity |
| RWA Providers | Provisioned RWA instances | Real-time | RWAWhiteLabelCustomer entity |

### 1.3 PSP Provisioning (PSPProvisioning)

**URL**: https://platform.fts.money/PSPProvisioning

**Purpose**: Provision new Payment Service Provider instances with complete infrastructure setup.

**Provisioning Flow**:

\`\`\`mermaid
sequenceDiagram
    participant Admin
    participant UI
    participant API
    participant Cloud
    participant DB
    participant DNS
    
    Admin->>UI: Click "Provision PSP"
    UI->>Admin: Show Configuration Form
    Admin->>UI: Enter PSP Details
    
    UI->>API: Submit Provisioning Request
    API->>DB: Create PSP Record
    
    API->>Cloud: Provision Resources
    Cloud-->>API: Resources Created
    
    API->>DB: Create Schema
    DB-->>API: Schema Ready
    
    API->>DNS: Setup Domain (Optional)
    DNS-->>API: Domain Configured
    
    API->>DB: Update Status: Active
    API-->>UI: Provisioning Complete
    UI-->>Admin: Show Success + Access Details
\`\`\`

**Provisioning Configuration Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| PSP Name | Text | Yes | Business name | 3-100 characters |
| PSP Code | Text | Yes | Unique identifier | 2-20 alphanumeric |
| Admin Email | Email | Yes | Primary admin contact | Valid email format |
| Admin Name | Text | Yes | Administrator full name | 2-100 characters |
| Country | Select | Yes | Operating country | ISO 3166-1 |
| Currency | Select | Yes | Primary currency | ISO 4217 |
| Cloud Provider | Select | Yes | AWS/Azure/GCP/Local | Predefined options |
| Module Selection | Multi-select | Yes | Enabled features | Predefined modules |
| Domain Name | Text | No | Custom domain | Valid domain format |
| Branding | File Upload | No | Logo and colors | Image files only |

**Module Options**:

| Module | Description | Dependencies | Additional Cost |
|--------|-------------|--------------|-----------------|
| Core Payment Processing | Basic transaction processing | None | Included |
| Multi-Currency | Foreign exchange support | Core | Included |
| Crypto Integration | Cryptocurrency payments | Striga service | Usage-based |
| ISO Gateway | Message translation | None | Per transaction |
| Orchestration | Smart routing | Core | Monthly fee |
| Virtual Terminal | Web-based terminal | Core | Included |
| Merchant Portal | Self-service portal | Core | Included |
| Analytics Dashboard | Advanced reporting | Core | Included |
| White Label | Custom branding | Core | Setup fee |
| E-Invoicing | Invoice generation | Core | Included |
| Recurring Payments | Subscription billing | Core | Included |

### 1.4 System Health (FTSSystemHealth)

**URL**: https://platform.fts.money/FTSSystemHealth

**Purpose**: Monitor overall platform health and service availability.

**Health Monitoring Architecture**:

\`\`\`mermaid
graph TB
    MONITOR[Health Monitor] --> PSP_CHECK[PSP Services]
    MONITOR --> ISO_CHECK[ISO Gateway]
    MONITOR --> CRYPTO_CHECK[Crypto Banking]
    MONITOR --> RWA_CHECK[RWA Platform]
    MONITOR --> ORCH_CHECK[Orchestration]
    MONITOR --> DB_CHECK[Database]
    MONITOR --> CLOUD_CHECK[Cloud Resources]
    
    PSP_CHECK --> PSP_STATUS{Status}
    ISO_CHECK --> ISO_STATUS{Status}
    CRYPTO_CHECK --> CRYPTO_STATUS{Status}
    RWA_CHECK --> RWA_STATUS{Status}
    
    PSP_STATUS -->|Healthy| GREEN[✓ Operational]
    PSP_STATUS -->|Degraded| YELLOW[⚠ Warning]
    PSP_STATUS -->|Down| RED[✗ Critical]
    
    ISO_STATUS -->|Healthy| GREEN
    ISO_STATUS -->|Degraded| YELLOW
    ISO_STATUS -->|Down| RED
    
    CRYPTO_STATUS -->|Healthy| GREEN
    CRYPTO_STATUS -->|Degraded| YELLOW
    CRYPTO_STATUS -->|Down| RED
    
    RWA_STATUS -->|Healthy| GREEN
    RWA_STATUS -->|Degraded| YELLOW
    RWA_STATUS -->|Down| RED
\`\`\`

**Health Check Categories**:

| Service Category | Check Frequency | Response Time SLA | Uptime SLA | Escalation |
|-----------------|-----------------|-------------------|------------|------------|
| PSP Services | 30 seconds | <100ms | 99.9% | Immediate |
| ISO Gateway | 30 seconds | <200ms | 99.95% | Immediate |
| Orchestration | 1 minute | <150ms | 99.9% | 5 minutes |
| Crypto Banking | 30 seconds | <300ms | 99.5% | Immediate |
| RWA Platform | 1 minute | <500ms | 99.5% | 5 minutes |
| Database | 10 seconds | <50ms | 99.99% | Immediate |
| Cloud Resources | 1 minute | <1000ms | 99.9% | 5 minutes |

---

## 2. PSP Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/PSPLogin  
**Authentication**: PSP-specific credentials  
**User Roles**: PSP Owner, PSP Admin, Operations, Finance, Support, Viewer

### 2.1 PSP Portal Pages

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
| UserManagement | /UserManagement | Legacy user management | Admin+ |

### 2.2 PSP Dashboard

**URL**: https://platform.fts.money/Dashboard

**Dashboard Layout**:

\`\`\`mermaid
graph TB
    subgraph "Top Row - KPIs"
        K1[Today's Revenue]
        K2[Transaction Count]
        K3[Success Rate]
        K4[Active Merchants]
    end
    
    subgraph "Middle Row - Charts"
        C1[Transaction Volume Chart]
        C2[Revenue Trend]
        C3[Payment Methods]
    end
    
    subgraph "Bottom Row - Lists"
        L1[Recent Transactions]
        L2[Top Merchants]
        L3[Risk Alerts]
    end
    
    K1 --> C1
    K2 --> C1
    C1 --> L1
    C2 --> L2
\`\`\`

**Dashboard Widgets**:

| Widget | Data Source | Update Frequency | Interactions |
|--------|-------------|------------------|--------------|
| Today's Revenue | Transaction aggregation | Real-time | Click to view breakdown |
| Transaction Count | Transaction entity | Real-time | Click to view list |
| Success Rate % | Transaction status calculation | Every minute | Click for details |
| Active Merchants | Merchant entity | Every 5 minutes | Click to view merchants |
| Volume Chart | Transaction time series | Every minute | Hover for exact values |
| Payment Methods Pie | Transaction payment method | Every 5 minutes | Click slice to filter |
| Recent Transactions | Transaction entity | Real-time | Click row for details |
| Top Merchants | Merchant volume ranking | Every 5 minutes | Click to view merchant |
| Risk Alerts | Risk alert entity | Real-time | Click to investigate |

### 2.3 Merchant Management (Merchants)

**URL**: https://platform.fts.money/Merchants

**Merchant List Features**:
- Search and filter merchants
- View merchant details
- Edit merchant information
- Manage merchant status
- View merchant transactions
- Configure merchant pricing

**Merchant Details Dialog**:

\`\`\`mermaid
graph LR
    LIST[Merchant List] --> CLICK[Click Merchant]
    CLICK --> DIALOG[Details Dialog]
    
    DIALOG --> TAB1[Basic Info]
    DIALOG --> TAB2[Contact]
    DIALOG --> TAB3[Bank Details]
    DIALOG --> TAB4[Pricing]
    DIALOG --> TAB5[Documents]
    DIALOG --> TAB6[Transactions]
    
    TAB1 --> INFO[Name, Status, MCC, Type]
    TAB2 --> CONTACT[Email, Phone, Address]
    TAB3 --> BANK[Account, IBAN, BIC]
    TAB4 --> PRICE[Fees, Interchange, Rates]
    TAB5 --> DOCS[KYC, Licenses, Contracts]
    TAB6 --> TXN[Transaction History]
\`\`\`

**Merchant Status Workflow**:

| Status | Meaning | Available Actions | Next Status |
|--------|---------|-------------------|-------------|
| Pending | Awaiting approval | Approve, Reject | Active, Rejected |
| Active | Operating normally | Suspend, Edit | Suspended, Active |
| Suspended | Temporarily disabled | Reactivate, Terminate | Active, Terminated |
| Terminated | Permanently closed | Reopen (admin only) | Active |
| Rejected | Application denied | Delete | N/A |

---

## 3. Community Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/CommunityPortalLogin  
**Authentication**: Community credentials  
**User Roles**: PSP Owner, PSP Admin, Viewer

### 3.1 Community Portal Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| CommunityPortalDashboard | /CommunityPortalDashboard | Main dashboard | All |
| MyPSPInstances | /MyPSPInstances | Manage PSP instances | All |
| CommunityMarketplace | /CommunityMarketplace | Browse services | All |
| CommunityPSPProvisioning | /CommunityPSPProvisioning | Self-provision PSP | PSP Owner |
| LaunchServices | /LaunchServices | Service catalog | All |
| MySubscriptions | /MySubscriptions | Active subscriptions | All |
| MyServiceRequests | /MyServiceRequests | Support tickets | All |
| CommunityAccountSettings | /CommunityAccountSettings | Account settings | All |
| CommunityUserManagement | /CommunityUserManagement | User management | PSP Owner |

### 3.2 Community Dashboard

**URL**: https://platform.fts.money/CommunityPortalDashboard

**Purpose**: Self-service portal for PSP owners to manage their payment infrastructure.

**Dashboard Layout**:

\`\`\`mermaid
graph TB
    subgraph "My PSP Instances"
        PSP1[Instance 1: Active]
        PSP2[Instance 2: Active]
        PSP3[Instance 3: Setup]
    end
    
    subgraph "Quick Actions"
        A1[Launch New PSP]
        A2[Browse Services]
        A3[View Billing]
        A4[Support Request]
    end
    
    subgraph "Active Services"
        S1[ISO Gateway: Active]
        S2[Orchestration: Active]
        S3[Crypto Banking: Trial]
    end
    
    PSP1 --> MANAGE1[Manage]
    PSP2 --> MANAGE2[Manage]
    PSP3 --> SETUP[Complete Setup]
    
    A1 --> PROVISION[Provisioning Wizard]
    A2 --> MARKET[Marketplace]
\`\`\`

### 3.3 Self-Service PSP Provisioning

**URL**: https://platform.fts.money/CommunityPSPProvisioning

**Provisioning Wizard Steps**:

\`\`\`mermaid
stateDiagram-v2
    [*] --> BusinessInfo
    BusinessInfo --> TechnicalSetup
    TechnicalSetup --> ModuleSelection
    ModuleSelection --> BillingSetup
    BillingSetup --> ReviewConfirm
    ReviewConfirm --> Processing
    Processing --> Complete
    Complete --> [*]
    
    note right of BusinessInfo
        Company details
        Contact information
        Country & currency
    end note
    
    note right of TechnicalSetup
        Domain selection
        Cloud provider
        Branding options
    end note
    
    note right of ModuleSelection
        Core modules
        Add-on services
        Integration options
    end note
\`\`\`

**Provisioning Pricing Tiers**:

| Tier | Setup Fee | Monthly Fee | Included Transactions | Support Level |
|------|-----------|-------------|----------------------|---------------|
| Starter | $500 | $199 | 1,000 | Email |
| Professional | $1,000 | $499 | 10,000 | Email + Phone |
| Business | $2,500 | $999 | 50,000 | Priority Support |
| Enterprise | Custom | Custom | Unlimited | Dedicated Manager |

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

### 4.2 ISO Gateway Dashboard

**URL**: https://platform.fts.money/ISOGatewayCustomerPortal

**Message Translation Flow**:

\`\`\`mermaid
sequenceDiagram
    participant Source
    participant Gateway
    participant Translator
    participant Target
    participant Monitor
    
    Source->>Gateway: ISO 8583 Message
    Gateway->>Translator: Parse Message
    Translator->>Translator: Validate Fields
    Translator->>Translator: Apply Routing Rules
    Translator->>Translator: Convert to ISO 20022
    Translator->>Target: Send Translated Message
    Target-->>Translator: Response
    Translator->>Translator: Convert Response
    Translator-->>Gateway: ISO 8583 Response
    Gateway-->>Source: Return Response
    
    Gateway->>Monitor: Log Transaction
    Monitor->>Monitor: Store for Analysis
\`\`\`

**Supported Message Standards**:

| Standard | Version | Direction | Use Case | Performance |
|----------|---------|-----------|----------|-------------|
| ISO 8583 | 1987/1993/2003 | Inbound/Outbound | ATM, POS transactions | <50ms |
| ISO 20022 | pain.001, pacs.008 | Inbound/Outbound | Bank transfers, SEPA | <100ms |
| SWIFT MT | MT103, MT202 | Inbound/Outbound | International transfers | <150ms |
| Custom XML | Various | Inbound/Outbound | Partner integrations | <80ms |

### 4.3 Connection Management

**URL**: https://platform.fts.money/ISOGatewayConnections

**Connection Types**:

| Connection Type | Protocol | Security | Latency | Reliability |
|----------------|----------|----------|---------|-------------|
| Direct TCP/IP | TCP | TLS 1.3 | <20ms | 99.99% |
| HTTPS REST | HTTPS | OAuth 2.0 | <50ms | 99.95% |
| WebSocket | WSS | Token auth | <10ms | 99.9% |
| SFTP | SFTP | SSH keys | <500ms | 99.5% |
| MQ Series | IBM MQ | Certificate | <30ms | 99.99% |

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

### 5.2 Smart Routing Architecture

**URL**: https://platform.fts.money/SmartOrchestration

\`\`\`mermaid
graph TB
    TXN[Incoming Transaction] --> ROUTER[Smart Router]
    
    ROUTER --> RULE1{Rule Engine}
    RULE1 --> CHECK1[Check Amount]
    RULE1 --> CHECK2[Check Currency]
    RULE1 --> CHECK3[Check Card Type]
    RULE1 --> CHECK4[Check Country]
    RULE1 --> CHECK5[Check Time]
    
    CHECK1 --> SCORE[Score Routes]
    CHECK2 --> SCORE
    CHECK3 --> SCORE
    CHECK4 --> SCORE
    CHECK5 --> SCORE
    
    SCORE --> RANK[Rank by Success Rate]
    RANK --> COST[Factor in Cost]
    COST --> SELECT[Select Best Route]
    
    SELECT --> P1[Provider 1: 85%]
    SELECT --> P2[Provider 2: 10%]
    SELECT --> P3[Provider 3: 5%]
    
    P1 --> SUCCESS{Success?}
    SUCCESS -->|Yes| DONE[Complete]
    SUCCESS -->|No| FALLBACK[Try P2]
    FALLBACK --> P2
\`\`\`

**Routing Criteria**:

| Criterion | Weight | Data Source | Update Frequency | Impact |
|-----------|--------|-------------|------------------|--------|
| Success Rate | 40% | Historical transactions | Real-time | High |
| Cost | 25% | Provider pricing | Daily | High |
| Speed | 15% | Provider response time | Real-time | Medium |
| Availability | 10% | Provider uptime | Real-time | High |
| Card Type Match | 5% | Provider capabilities | Static | Medium |
| Country Match | 3% | Provider coverage | Static | Low |
| Currency Match | 2% | Provider currencies | Static | Low |

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
| CryptoAnalytics | /CryptoAnalytics | Analytics dashboard | All |
| CryptoAPIKeys | /CryptoAPIKeys | API management | Admin |
| CryptoSettings | /CryptoSettings | Configuration | Admin |

### 6.2 Crypto Banking Architecture

**URL**: https://platform.fts.money/CryptoGatewayDashboard

\`\`\`mermaid
graph TB
    subgraph "Wallet Layer"
        HOT[Hot Wallet]
        COLD[Cold Storage]
        CUSTODY[Custody Service]
    end
    
    subgraph "Banking Layer"
        IBAN[IBAN Accounts]
        CARDS[Debit Cards]
        FIAT[Fiat Gateway]
    end
    
    subgraph "Compliance Layer"
        KYC[KYC Verification]
        AML[AML Monitoring]
        TRM[Transaction Monitoring]
    end
    
    subgraph "Integration Layer"
        STRIGA[Striga API]
        EXCHANGE[Exchange APIs]
        BLOCKCHAIN[Blockchain Nodes]
    end
    
    HOT --> STRIGA
    COLD --> CUSTODY
    IBAN --> STRIGA
    CARDS --> STRIGA
    
    KYC --> STRIGA
    AML --> TRM
    
    STRIGA --> BLOCKCHAIN
    EXCHANGE --> BLOCKCHAIN
\`\`\`

**Supported Cryptocurrencies**:

| Asset | Network | Custody Type | Deposit Time | Withdrawal Time |
|-------|---------|--------------|--------------|-----------------|
| Bitcoin (BTC) | Bitcoin | Cold + Hot | 3 confirmations (~30 min) | 1 confirmation (~10 min) |
| Ethereum (ETH) | Ethereum | Cold + Hot | 12 confirmations (~3 min) | 1 confirmation (~15 sec) |
| USDT | Ethereum, Tron | Hot | 12/20 confirmations | Instant |
| USDC | Ethereum, Solana | Hot | 12/32 confirmations | Instant |
| EUR Stablecoin | Ethereum | Hot | 12 confirmations | Instant |

---

## 7. RWA Provider Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/RWAProviderLogin  
**Authentication**: RWA Provider credentials  
**User Roles**: Admin, Operations, Viewer

### 7.1 RWA Provider Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| RWAProviderDashboard | /RWAProviderDashboard | Main dashboard | All |
| RWAProviderAssets | /RWAProviderAssets | Asset management | All |
| RWAProviderIssuers | /RWAProviderIssuers | Issuer management | Admin+ |
| RWAProviderInvestors | /RWAProviderInvestors | Investor management | All |
| RWAProviderAnalytics | /RWAProviderAnalytics | Analytics | All |
| RWAProviderSettings | /RWAProviderSettings | Configuration | Admin |

### 7.2 Asset Tokenization Flow

**URL**: https://platform.fts.money/RWAProviderAssets

\`\`\`mermaid
sequenceDiagram
    participant Issuer
    participant Platform
    participant SmartContract
    participant Blockchain
    participant Investor
    
    Issuer->>Platform: Submit Asset Details
    Platform->>Platform: Verify Compliance
    Platform->>SmartContract: Deploy Token Contract
    SmartContract->>Blockchain: Deploy on Chain
    Blockchain-->>SmartContract: Contract Address
    SmartContract-->>Platform: Token Created
    
    Platform->>Issuer: Token Ready
    Issuer->>Platform: Set Token Price
    Platform->>Platform: List for Sale
    
    Investor->>Platform: Browse Assets
    Investor->>Platform: Purchase Tokens
    Platform->>SmartContract: Transfer Tokens
    SmartContract->>Blockchain: Execute Transfer
    Blockchain-->>Investor: Tokens Received
\`\`\`

**Supported Asset Classes**:

| Asset Class | Minimum Value | Token Standard | Regulatory Compliance | Liquidity |
|-------------|---------------|----------------|----------------------|-----------|
| Real Estate | $100,000 | ERC-3643 | SEC Reg D, Reg S | Secondary market |
| Private Equity | $50,000 | ERC-3643 | Qualified investors | Limited |
| Commodities | $10,000 | ERC-20 | Accredited only | High |
| Art & Collectibles | $25,000 | ERC-721 | Regional laws | Auction-based |
| Debt Instruments | $50,000 | ERC-3643 | Bond regulations | Exchange-traded |

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
| MerchantTransactionList | /MerchantTransactionList | Transaction list | All |
| MerchantSettlementReports | /MerchantSettlementReports | Settlement reports | Finance+ |
| MerchantInvoices | /MerchantInvoices | Invoice management | Finance+ |
| MerchantAnalytics | /MerchantAnalytics | Business analytics | All |
| MerchantAPIKeys | /MerchantAPIKeys | API key management | Admin+ |
| MerchantSettings | /MerchantSettings | Merchant settings | Admin+ |
| MerchantUsers | /MerchantUsers | User management | Owner/Admin |

### 8.2 Merchant Dashboard

**URL**: https://platform.fts.money/MerchantPortal

**Dashboard Widgets**:

| Widget | Metric | Time Range | Visualization |
|--------|--------|------------|---------------|
| Today's Revenue | Transaction sum | Last 24 hours | Large number + trend |
| Transaction Count | Transaction count | Last 24 hours | Number + comparison |
| Success Rate | Approved/Total % | Last 24 hours | Percentage + gauge |
| Average Ticket | Transaction average | Last 24 hours | Currency + trend |
| Volume Chart | Hourly transactions | Last 7 days | Line chart |
| Payment Methods | Method breakdown | Last 30 days | Pie chart |
| Recent Transactions | Latest 10 | Real-time | Data table |
| Top Products | Product sales | Last 30 days | Bar chart |

---

## 9. QSA Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/QSAPortalLogin  
**Authentication**: QSA access token  
**User Roles**: QSA Auditor (Read-only with report upload)

### 9.1 QSA Portal Pages

| Page Name | URL Path | Purpose | Permissions |
|-----------|----------|---------|-------------|
| QSAPortalDashboard | /QSAPortalDashboard | Main dashboard | Read |
| PCIRequirementsTracker | /PCIRequirementsTracker | View requirements | Read |
| PCIEvidenceVault | /PCIEvidenceVault | Evidence browser | Read + Download |
| PCIControlTesting | /PCIControlTesting | View control tests | Read |
| QSAUserManagement | /QSAUserManagement | QSA user management | Platform Admin only |

### 9.2 QSA Evidence Access Flow

**URL**: https://platform.fts.money/QSAPortalDashboard

\`\`\`mermaid
sequenceDiagram
    participant QSA
    participant Portal
    participant Auth
    participant Evidence
    participant Blockchain
    
    QSA->>Portal: Enter Access Token
    Portal->>Auth: Validate Token
    Auth-->>Portal: Token Valid
    
    QSA->>Portal: Browse Evidence
    Portal->>Evidence: Query Evidence Vault
    Evidence-->>Portal: Evidence List
    Portal-->>QSA: Display Evidence
    
    QSA->>Portal: Download Evidence
    Portal->>Blockchain: Verify Evidence Hash
    Blockchain-->>Portal: Hash Valid
    Portal->>Evidence: Generate Package
    Evidence-->>Portal: Signed Package
    Portal-->>QSA: Download Package
    
    Portal->>Blockchain: Log Access
    Blockchain-->>Portal: Access Logged
\`\`\`

**QSA Permissions Matrix**:

| Resource | View | Download | Upload | Edit | Delete | Comment |
|----------|------|----------|--------|------|--------|---------|
| Requirements | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Evidence Files | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Control Tests | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Findings | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Audit Reports | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Messages | ✓ | ✗ | ✓ | ✗ | ✗ | ✓ |
| Blockchain Logs | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## 10. PCI Compliance Portal

**Base URL**: https://platform.fts.money/  
**Login Page**: Same as platform admin  
**Authentication**: Platform admin credentials  
**User Roles**: Compliance Manager, Security Engineer, Auditor, Executive

### 10.1 PCI Compliance Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| PCIComplianceDashboard | /PCIComplianceDashboard | Main compliance dashboard | All |
| PCIRequirementsTracker | /PCIRequirementsTracker | Track 12 requirements | All |
| PCIEvidenceVault | /PCIEvidenceVault | Evidence repository | Compliance Manager+ |
| PCIControlTesting | /PCIControlTesting | Security control testing | Security Engineer+ |
| PCIPolicyLibrary | /PCIPolicyLibrary | Policy management | Compliance Manager+ |
| PCIGapAnalysis | /PCIGapAnalysis | Gap identification | All |
| PCIAuditReports | /PCIAuditReports | Audit report management | Auditor+ |
| PCIContinuousMonitoring | /PCIContinuousMonitoring | Real-time monitoring | All |
| PCIPredictiveAnalytics | /PCIPredictiveAnalytics | AI-powered predictions | Compliance Manager+ |
| PCIWorkflowManager | /PCIWorkflowManager | Workflow automation | Compliance Manager+ |
| PCIReportingDashboard | /PCIReportingDashboard | Advanced reporting | All |
| PCIDocumentManager | /PCIDocumentManager | Document management | Compliance Manager+ |

### 10.2 Compliance Status Overview

**URL**: https://platform.fts.money/PCIComplianceDashboard

**12 Requirements Status**:

| Requirement | Title | Status | Evidence | Last Test | Next Test |
|-------------|-------|--------|----------|-----------|-----------|
| Req 1 | Firewall Configuration | ✓ Compliant | 12 files | 2026-01-05 | 2026-04-05 |
| Req 2 | Vendor Defaults | ✓ Compliant | 8 files | 2026-01-05 | 2026-04-05 |
| Req 3 | Protect Stored Data | ✓ Compliant | 15 files | 2026-01-06 | Continuous |
| Req 4 | Encrypt Transmission | ✓ Compliant | 10 files | 2026-01-06 | Continuous |
| Req 5 | Anti-virus | ✓ Compliant | 6 files | 2026-01-07 | Daily |
| Req 6 | Secure Systems | ⚠ In Progress | 18 files | 2026-01-05 | Continuous |
| Req 7 | Restrict Access | ✓ Compliant | 14 files | 2026-01-06 | Daily |
| Req 8 | Unique IDs | ✓ Compliant | 9 files | 2026-01-06 | Continuous |
| Req 9 | Physical Access | ✓ Compliant | 7 files | 2025-12-15 | 2026-01-15 |
| Req 10 | Track Access | ✓ Compliant | 20 files | 2026-01-07 | Continuous |
| Req 11 | Test Security | ✓ Compliant | 11 files | 2025-12-20 | 2026-01-20 |
| Req 12 | Security Policy | ✓ Compliant | 16 files | 2025-12-01 | 2026-12-01 |

---

## 11. Digital Identity Wallet

**Base URL**: https://platform.fts.money/  
**Login Page**: WebAuthn/Passwordless  
**Authentication**: Biometric/Hardware key  
**User Roles**: Individual users

### 11.1 Digital Identity Pages

| Page Name | URL Path | Purpose | Authentication |
|-----------|----------|---------|----------------|
| DigitalIdentityWallet | /DigitalIdentityWallet | Main wallet interface | WebAuthn |
| CredentialPresentation | /CredentialPresentation | Share credentials | WebAuthn |
| PSPDigitalIdentityWallet | /PSPDigitalIdentityWallet | PSP-specific wallet | WebAuthn |

### 11.2 Credential Management Flow

**URL**: https://platform.fts.money/DigitalIdentityWallet

\`\`\`mermaid
stateDiagram-v2
    [*] --> WalletEmpty
    WalletEmpty --> RequestCredential: Request from Issuer
    RequestCredential --> PendingVerification: Submit Documents
    PendingVerification --> CredentialIssued: Approved
    CredentialIssued --> WalletActive: Store in Wallet
    
    WalletActive --> SelectCredential: Verifier Request
    SelectCredential --> CreatePresentation: User Approves
    CreatePresentation --> SharePresentation: Sign with DID
    SharePresentation --> VerificationComplete: Verified
    VerificationComplete --> WalletActive
    
    WalletActive --> CredentialExpired: Time Passes
    CredentialExpired --> RenewCredential: Renewal Process
    RenewCredential --> WalletActive
\`\`\`

**Supported Credential Types**:

| Credential | Issuer | Validity | Use Cases | Selective Disclosure |
|------------|--------|----------|-----------|---------------------|
| Government ID | Government | 10 years | Identity verification | Yes |
| Bank Account | Bank | Ongoing | Payment setup | Yes |
| KYC Certificate | KYC Provider | 1 year | Onboarding | Yes |
| Employment | Employer | Ongoing | Income proof | Yes |
| LEI Certificate | GLEIF | 1 year | Entity ID | No |

---

## 12. Virtual Terminal

**Base URL**: https://platform.fts.money/  
**Login Page**: https://platform.fts.money/VirtualTerminalLogin  
**Authentication**: VT user credentials  
**User Roles**: Operator, Manager, Admin

### 12.1 Virtual Terminal Pages

| Page Name | URL Path | Purpose | Required Role |
|-----------|----------|---------|---------------|
| VirtualTerminal | /VirtualTerminal | Main terminal | All |
| MerchantVirtualTerminal | /MerchantVirtualTerminal | Merchant VT | All |

### 12.2 Payment Processing Flow

**URL**: https://platform.fts.money/VirtualTerminal

\`\`\`mermaid
sequenceDiagram
    participant Operator
    participant Terminal
    participant Gateway
    participant Processor
    participant Bank
    
    Operator->>Terminal: Enter Card Details
    Terminal->>Terminal: Validate Input
    Terminal->>Terminal: Tokenize Card
    
    Operator->>Terminal: Enter Amount
    Terminal->>Terminal: Add Metadata
    Terminal->>Gateway: Submit Transaction
    
    Gateway->>Processor: Route to Processor
    Processor->>Bank: Authorization Request
    Bank-->>Processor: Approved/Declined
    Processor-->>Gateway: Response
    Gateway-->>Terminal: Display Result
    Terminal-->>Operator: Show Receipt
    
    Terminal->>Terminal: Generate Receipt
    Operator->>Operator: Print/Email Receipt
\`\`\`

**Transaction Types**:

| Type | Description | Requires CVV | Requires Address | Settlement Time |
|------|-------------|--------------|------------------|-----------------|
| Sale | Immediate charge | Yes | Recommended | T+1 |
| Auth Only | Authorization hold | Yes | Yes | Hold 7 days |
| Capture | Complete auth | No | No | T+1 |
| Void | Cancel same-day | No | No | Immediate |
| Refund | Return funds | No | No | T+3 to T+5 |
| MOTO | Mail/Phone order | Optional | Yes | T+1 |

---

## URL Summary Table

### All Portal URLs

| Portal | Login URL | Main Dashboard URL |
|--------|-----------|-------------------|
| FTS Control Panel | /PlatformAdminLogin | /FTSMoneyPlatform |
| PSP Portal | /PSPLogin | /Dashboard |
| Community Portal | /CommunityPortalLogin | /CommunityPortalDashboard |
| ISO Gateway | /ISOGatewayLogin | /ISOGatewayCustomerPortal |
| Orchestration | /OrchestrationLogin | /OrchestrationPortal |
| Crypto Gateway | /CryptoGatewayLogin | /CryptoGatewayDashboard |
| RWA Provider | /RWAProviderLogin | /RWAProviderDashboard |
| Merchant | /MerchantLogin | /MerchantPortal |
| QSA | /QSAPortalLogin | /QSAPortalDashboard |
| Asset Issuer | /AssetIssuerLogin | /AssetIssuerDashboard |
| Investor | /InvestorLogin | /InvestorPortfolio |
| Virtual Terminal | /VirtualTerminalLogin | /VirtualTerminal |

---

## Conclusion

The FTS.Money platform consists of 12 specialized portals, 200+ pages, serving distinct user roles across the payment ecosystem. All portals are accessible via **https://platform.fts.money/** with role-based access control ensuring secure, segregated access to appropriate functionality.

**Key Benefits**:
- Single platform, multiple portals
- Role-based access control
- Consistent user experience
- Real-time data synchronization
- Comprehensive audit trails
- Enterprise-grade security

For access to any portal, contact your FTS.Money account manager or platform administrator.
`;