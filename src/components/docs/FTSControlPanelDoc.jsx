const FTSControlPanelDoc = `# FTS Control Panel Documentation
## Platform Administration & Global Infrastructure Management

**Version:** 1.0  
**Classification:** Internal - Platform Administrators  
**Last Updated:** December 26, 2025  
**Document Owner:** FTS.Money Platform Engineering Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Platform Architecture](#platform-architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [PSP Lifecycle Management](#psp-lifecycle-management)
5. [Crypto Banking Administration](#crypto-banking-administration)
6. [Service Catalog Administration](#service-catalog-administration)
7. [Financial Operations](#financial-operations)
8. [Compliance & Monitoring](#compliance--monitoring)
9. [Infrastructure Management](#infrastructure-management)
10. [Security & Access Control](#security--access-control)
11. [Troubleshooting & Support](#troubleshooting--support)

---

## Executive Summary

### Purpose

The Control Panel is where we run the FTS.Money platform itself. This is the administrative interface used by our internal team and trusted partners to manage the global payment infrastructure that powers thousands of PSPs.

If individual PSP Portals are cockpits for payment businesses, the Control Panel is mission control. From here, we provision new PSPs in minutes, monitor the health of the entire platform, manage our service catalog, track financial operations, ensure compliance across all tenants, and orchestrate multi-cloud infrastructure.

This isn't customer-facing documentation - it's an operational manual for platform administrators. The people using this interface need deep technical knowledge and carry significant responsibility. A misconfigured provisioning setting could break new PSP deployments. An incorrect pricing change could cost millions in revenue. A security oversight could expose sensitive data.

Access to the Control Panel is therefore highly restricted. Multi-factor authentication is mandatory. All actions are logged. Sensitive operations require approval workflows. We take the principle of least privilege seriously - even our own team members only get access to what they need for their role.

The **FTS Control Panel** is the centralized platform administration interface that provides super-admin level control over the entire FTS.Money ecosystem. It enables platform operators to:

- Provision and manage PSP instances
- Configure global service catalog
- Monitor financial operations
- Ensure regulatory compliance
- Orchestrate multi-cloud infrastructure
- Manage user access across all portals
- Monitor system health and performance

### Key Capabilities

\`\`\`mermaid
mindmap
  root((FTS Control Panel))
    PSP Management
      Provisioning
      Configuration
      Monitoring
      Lifecycle
    Financial Ops
      Revenue Tracking
      Billing
      Settlement
      Reconciliation
    Service Catalog
      Provider Pool
      Marketplace
      Integrations
      API Gateway
    Compliance
      PCI DSS
      ISO Standards
      GDPR
      Audit Logs
    Infrastructure
      Multi-Cloud
      Auto-Scaling
      Monitoring
      Disaster Recovery
    User Management
      Platform Admins
      PSP Staff
      Community Users
      RBAC
\`\`\`

### Access Requirements

**Who Can Access:**
- Platform Super Administrators
- Platform Administrators
- Operations Team
- Finance Team (limited)
- Compliance Team (limited)

**Authentication:**
- Multi-factor authentication (MFA) required
- IP whitelisting enforced
- Session timeout: 30 minutes
- Password complexity: 16+ characters

---

## Platform Architecture

### System Overview

Understanding the platform architecture is essential for effective administration. The Control Panel doesn't exist in isolation - it's the administrative layer on top of a complex distributed system with multiple services, databases, queues, and external integrations.

The architecture follows a clear layered model. At the top is the Control Plane (the portal you're using). Below that are Management Services that handle specific domains - PSP provisioning, service catalog, financial operations, monitoring. The Data Layer stores platform configuration and tenant data. External Systems provide cloud infrastructure, payment processing, and compliance services.

This separation allows us to scale different parts independently. If PSP provisioning demand increases, we scale just that service. If financial operations need more compute, we add capacity there. If monitoring traffic spikes, its resources scale independently.

The key architectural decision is multi-tenancy at the data layer. Every PSP gets its own database schema, providing strong isolation while sharing infrastructure. This allows us to offer enterprise-grade capabilities at startup-friendly prices - the first customer pays for development, customer 100 costs us almost nothing to add.

\`\`\`mermaid
graph TB
    subgraph "Control Plane"
        CP[Control Panel<br/>Admin Interface]
        API[Platform API<br/>Gateway]
        AUTH[Authentication<br/>Service]
    end
    
    subgraph "Management Services"
        PSP[PSP Provisioning<br/>Service]
        CAT[Service Catalog<br/>Manager]
        FIN[Financial<br/>Operations]
        MON[Monitoring<br/>& Alerts]
    end
    
    subgraph "Data Layer"
        MASTER[Master Database<br/>Platform Data]
        TENANT[Tenant Databases<br/>Per-PSP Schema]
        CACHE[Redis Cache<br/>Session & Config]
        QUEUE[Message Queue<br/>Async Tasks]
    end
    
    subgraph "External Systems"
        CLOUD[Multi-Cloud<br/>Providers]
        PAY[Payment<br/>Providers]
        COMP[Compliance<br/>Services]
    end
    
    CP --> API
    API --> AUTH
    API --> PSP
    API --> CAT
    API --> FIN
    API --> MON
    
    PSP --> MASTER
    PSP --> TENANT
    CAT --> MASTER
    FIN --> MASTER
    MON --> CACHE
    
    PSP --> CLOUD
    CAT --> PAY
    FIN --> COMP
    
    MASTER --> QUEUE
    QUEUE --> PSP
\`\`\`

### Infrastructure Components

**1. Control Panel Frontend**
- React 18 with TypeScript
- Real-time dashboards
- Responsive design
- WebSocket connections for live updates

**2. Platform API Gateway**
- RESTful API
- GraphQL endpoint
- Rate limiting: 10,000 req/min
- API versioning (v1, v2)

**3. Management Services**
- Microservices architecture
- Independent scaling
- Service mesh (Istio)
- Circuit breakers

**4. Data Storage**
- Master PostgreSQL cluster (3 nodes)
- Read replicas for reporting
- Automated backups (hourly)
- Point-in-time recovery

---

## User Roles & Permissions

### Role Hierarchy

Access control is critical in a platform that manages sensitive financial data and powerful administrative functions. We implement strict role-based access control (RBAC) where every user has exactly the permissions they need - nothing more, nothing less.

The role hierarchy reflects how we organize our team. Super Admins (founders and CTO) have unrestricted access for emergency situations. Platform Admins handle day-to-day operations. Specialized roles (Finance, Compliance, Operations) have permissions relevant to their function.

This granular permission model serves multiple purposes. It reduces security risk by limiting the blast radius of any single compromised account. It satisfies compliance requirements by implementing segregation of duties. It prevents accidental mistakes by restricting dangerous operations to senior staff.

For example, Finance Manager can view revenue and modify pricing but can't provision new PSPs or access source code. Compliance Officer can run audits and view logs but can't change system configuration. Operations team can manage PSPs but can't access financial data. This separation is intentional and auditable.

\`\`\`mermaid
graph TD
    A[Super Admin] --> B[Platform Admin]
    B --> C[Operations]
    B --> D[Finance Manager]
    B --> E[Compliance Officer]
    C --> F[Support Agent]
    D --> G[Finance Analyst]
    E --> H[Compliance Analyst]
\`\`\`

### Permission Matrix

| Action | Super Admin | Platform Admin | Operations | Finance | Compliance | Support |
|--------|-------------|----------------|------------|---------|------------|---------|
| **PSP Management** |
| Create PSP | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete PSP | ✅ | ⚠️ Requires approval | ❌ | ❌ | ❌ | ❌ |
| Suspend PSP | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Configure PSP | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View PSP | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Financial** |
| View Revenue | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit Pricing | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Run Reconciliation | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| View Transactions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Service Catalog** |
| Add Provider | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Service | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Remove Provider | ✅ | ⚠️ Requires approval | ❌ | ❌ | ❌ | ❌ |
| **Compliance** |
| View Audit Logs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Run Compliance Scan | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| **User Management** |
| Create Admin User | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit User Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Deactivate User | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Creating Admin Users

**Step 1: Navigate to User Management**
1. Click "Settings" in sidebar
2. Select "Platform Users"
3. Click "Add New User"

**Step 2: Enter User Details**
\`\`\`json
{
  "email": "admin@example.com",
  "full_name": "John Doe",
  "platform_role": "platform_admin",
  "department": "Operations",
  "permissions": [
    "psp:read",
    "psp:update",
    "analytics:view"
  ]
}
\`\`\`

**Step 3: Send Invitation**
- Automated email sent to user
- Temporary password generated
- MFA setup required on first login

**Step 4: Monitor First Login**
- User sets permanent password
- Configures 2FA (Google Authenticator/SMS)
- Accepts platform terms of service

---

## PSP Lifecycle Management

### Provisioning Flow

PSP provisioning is our core value proposition - taking something that normally requires 18 months and automating it to 40 minutes of infrastructure work plus 24-48 hours of business verification. The technical provisioning is fully automated; the time variance comes from KYB (Know Your Business) verification.

Every provisioning request goes through multiple phases: validation (is the request complete and valid?), verification (is this a legitimate business?), infrastructure setup (create compute, storage, and network resources), deployment (install and configure software), and validation (ensure everything works).

The sequence diagram shows the happy path, but provisioning can fail at multiple points. Database schema creation might fail if the PSP code is already taken. Cloud resource allocation might fail if we hit quota limits. Deployment might fail if health checks don't pass. The system handles these failures gracefully with automatic retries and detailed error logging for manual intervention if needed.

As a platform administrator, you'll monitor the provisioning queue for stuck jobs, investigate failures, and occasionally retry failed provisions after fixing underlying issues. Most provisions complete automatically, but about 5-10% require some manual attention - usually to clarify business verification questions or resolve resource allocation issues.

\`\`\`mermaid
sequenceDiagram
    participant Admin as Platform Admin
    participant CP as Control Panel
    participant Prov as Provisioning Service
    participant DB as Master Database
    participant Cloud as Cloud Provider
    participant PSP as PSP Instance
    
    Admin->>CP: Create New PSP
    CP->>CP: Validate Request
    CP->>Prov: Initiate Provisioning
    
    Prov->>DB: Create PSP Record
    DB-->>Prov: PSP ID Generated
    
    Prov->>DB: Create Tenant Schema
    DB-->>Prov: Schema Ready
    
    Prov->>Cloud: Allocate Resources
    Cloud-->>Prov: Resources Provisioned
    
    Prov->>PSP: Deploy Application Stack
    PSP->>PSP: Initialize Services
    PSP->>PSP: Run Health Checks
    PSP-->>Prov: Deployment Success
    
    Prov->>DB: Update PSP Status (Active)
    Prov-->>CP: PSP Ready
    CP-->>Admin: Display Access Credentials
\`\`\`

### PSP States & Transitions

\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending: Create PSP
    Pending --> Provisioning: Start Provisioning
    Provisioning --> Failed: Error Occurred
    Provisioning --> Active: Deployment Success
    Active --> Suspended: Suspend
    Suspended --> Active: Reactivate
    Active --> Terminated: Terminate
    Failed --> Pending: Retry
    Suspended --> Terminated: Force Delete
    Terminated --> [*]
    
    note right of Active
        Normal operation
        Processing transactions
    end note
    
    note right of Suspended
        Cannot process transactions
        Data retained
        Can be reactivated
    end note
    
    note right of Terminated
        Scheduled for deletion
        90-day retention period
        Cannot be reactivated
    end note
\`\`\`

### PSP Configuration Options

**1. Geographic Deployment**

| Region | Data Center | Latency (Target) | Compliance |
|--------|-------------|------------------|------------|
| US East | AWS us-east-1 | <50ms (US) | PCI DSS, SOC 2 |
| US West | AWS us-west-2 | <50ms (US West Coast) | PCI DSS, SOC 2 |
| EU West | AWS eu-west-1 (Ireland) | <30ms (EU) | PCI DSS, GDPR |
| EU Central | AWS eu-central-1 (Frankfurt) | <30ms (Central EU) | PCI DSS, GDPR |
| Asia Pacific | AWS ap-southeast-1 (Singapore) | <50ms (APAC) | PCI DSS, Local regs |
| Asia Pacific | GCP asia-east1 (Taiwan) | <50ms (East Asia) | PCI DSS, Local regs |

**2. Service Tier Configuration**

\`\`\`yaml
starter:
  monthly_fee: $499
  transactions_included: 1000
  merchant_limit: 5
  regions: 1
  support: "Email only"
  sla: "99.9%"
  features:
    - basic_dashboard
    - merchant_portal
    - virtual_terminal
    - api_access
    
professional:
  monthly_fee: $999
  transactions_included: 50000
  merchant_limit: unlimited
  regions: 2
  support: "24/7 Priority"
  sla: "99.95%"
  features:
    - advanced_analytics
    - fraud_detection
    - recurring_billing
    - webhooks
    - custom_branding
    
enterprise:
  monthly_fee: $4999
  transactions_included: unlimited
  merchant_limit: unlimited
  regions: "multi-region"
  support: "Dedicated team"
  sla: "99.99%"
  features:
    - ai_routing
    - custom_integrations
    - white_label_mobile
    - dedicated_infrastructure
    - compliance_tools
\`\`\`

**3. Feature Modules**

Available modules to enable per PSP:

- **Payment Methods**
  - Credit/Debit Cards (Visa, Mastercard, Amex, Discover)
  - Alternative Payment Methods (PayPal, Apple Pay, Google Pay)
  - Bank Transfers (ACH, SEPA, Wire)
  - Cryptocurrency (Bitcoin, Ethereum, Stablecoins)

- **Risk & Fraud**
  - 3D Secure 2.0
  - Velocity checks
  - Device fingerprinting
  - Machine learning fraud scoring
  - Manual review queue

- **Merchant Features**
  - Self-service onboarding
  - KYB/KYC verification
  - Document upload & management
  - Subscription billing
  - Invoice generation
  - Payment links

- **Developer Tools**
  - REST API
  - GraphQL API
  - Webhooks
  - SDKs (Node.js, Python, PHP, Ruby, Java)
  - Sandbox environment
  - API documentation portal

### Monitoring PSP Health

**Health Check Dashboard:**

\`\`\`mermaid
graph LR
    A[PSP Health Monitor] --> B[API Status]
    A --> C[Database Status]
    A --> D[Payment Processing]
    A --> E[External Integrations]
    
    B --> B1[Response Time]
    B --> B2[Error Rate]
    B --> B3[Request Volume]
    
    C --> C1[Connection Pool]
    C --> C2[Query Performance]
    C --> C3[Replication Lag]
    
    D --> D1[Success Rate]
    D --> D2[Avg Processing Time]
    D --> D3[Failed Transactions]
    
    E --> E1[Provider Uptime]
    E --> E2[Network Latency]
    E --> E3[API Failures]
\`\`\`

**Key Metrics:**

| Metric | Target | Warning | Critical | Action |
|--------|--------|---------|----------|--------|
| API Response Time | <200ms | >500ms | >1000ms | Scale up compute |
| Error Rate | <0.1% | >1% | >5% | Investigate logs |
| Transaction Success | >99% | <98% | <95% | Check providers |
| Database CPU | <70% | >80% | >90% | Scale database |
| Disk Usage | <75% | >85% | >95% | Add storage |

### Suspending PSPs

**Reasons for Suspension:**

1. **Non-Payment**
   - Invoice overdue >30 days
   - Failed payment method
   - Automatic suspension after 45 days

2. **Compliance Violation**
   - Failed PCI DSS scan
   - KYB verification expired
   - Suspicious activity detected

3. **Terms of Service Violation**
   - Prohibited merchant categories
   - Excessive chargebacks (>2%)
   - Fraudulent activity

4. **Technical Issues**
   - Security vulnerability detected
   - System integrity compromised
   - DDoS attack mitigation

**Suspension Process:**

\`\`\`mermaid
sequenceDiagram
    participant Admin as Admin
    participant System as Control Panel
    participant PSP as PSP Instance
    participant Notif as Notification Service
    participant Customer as PSP Owner
    
    Admin->>System: Initiate Suspension
    System->>System: Log Suspension Reason
    System->>PSP: Set Status to Suspended
    PSP->>PSP: Disable Transaction Processing
    PSP->>PSP: Maintain Data Access
    System->>Notif: Send Suspension Notice
    Notif->>Customer: Email + SMS Alert
    Customer->>System: View Suspension Details
    Customer->>System: Submit Appeal / Take Action
    System->>Admin: Review Appeal
    Admin->>System: Approve/Deny
    alt Approved
        System->>PSP: Reactivate
        PSP->>PSP: Enable Transaction Processing
        Notif->>Customer: Reactivation Confirmed
    else Denied
        System->>Notif: Send Denial Reason
        Notif->>Customer: Appeal Denied
    end
\`\`\`

### Terminating PSPs

**Termination Policy:**

- **Data Retention:** 90 days after termination
- **Backup Availability:** 30 days for download
- **Refund Policy:** Pro-rated for annual plans
- **Notice Period:** 30 days (except ToS violation)

**Termination Steps:**

1. **Pre-Termination (Days 1-30)**
   - Send termination notice
   - Offer data export
   - Process final settlement
   - Disable new transactions

2. **Termination (Day 31)**
   - Archive PSP data
   - Disable all services
   - Revoke API keys
   - Cancel billing

3. **Post-Termination (Days 32-120)**
   - Data in cold storage
   - Available for recovery ($500 fee)
   - Final audit reports available

4. **Permanent Deletion (Day 121)**
   - Data securely erased
   - All backups destroyed
   - Audit log entry created

---

## Crypto Banking Administration

### Overview

The FTS.Money Crypto Banking Service is a comprehensive white-labeled enterprise crypto banking infrastructure built on Striga/Lightspark technology. It provides a full suite of crypto financial services including multi-chain wallets, virtual IBANs, card issuance, on/off-ramps, and integrated compliance with LEI/vLEI verification and KYB/KYC workflows.

This service represents a strategic opportunity where FTS.Money aggregates and resells crypto banking infrastructure as a proprietary platform solution to both PSPs (via marketplace) and direct enterprise customers (crypto exchanges, DeFi platforms, wallet providers).

**Access Points:**
- Platform Admin → Overview: `/StrigaServiceManagement`
- Customer Management: `/CryptoGatewayCustomers`
- KYC/KYB Verification: `/CryptoKYCManagement`
- Transaction Monitoring: `/CryptoGatewayTransactions`
- Portal Management: `/CryptoPortalManagement`

**Core Infrastructure:**
- Backend: Striga API (VASP-licensed, EU-regulated)
- Network Layer: Lightspark (Lightning Network)
- Frontend: FTS.Money branded portal
- Compliance: Built-in AML/CFT, Travel Rule, GLEIF LEI integration

### Architecture & Distribution Model

\`\`\`mermaid
graph TB
    subgraph "FTS.Money Crypto Banking Platform"
        CORE[Crypto Banking Core<br/>White-labeled Infrastructure]
        API[Striga API Layer<br/>VASP-Licensed]
        LN[Lightspark Network<br/>Lightning Protocol]
        COMP[Compliance Engine<br/>LEI/vLEI + KYB/KYC]
    end
    
    subgraph "Distribution Channel 1: PSP Marketplace"
        PSP[PSP Marketplace]
        PSPCAT[Service Catalog]
        PSPCUST[PSP Customer<br/>White-label Config]
    end
    
    subgraph "Distribution Channel 2: Direct Enterprise"
        PORTAL[Standalone Portal<br/>CryptoGatewayLogin]
        DIRECT[Direct Customers]
        EXCHANGE[Crypto Exchanges]
        DEFI[DeFi Platforms]
        WALLET[Wallet Providers]
    end
    
    subgraph "Customer Identity & Compliance"
        TAS[Trust Anchor Service<br/>TAS ID]
        LEI[Legal Entity Identifier<br/>GLEIF]
        VLEI[Verifiable LEI<br/>Cryptographic Proof]
        GRACE[3-Month Grace Period<br/>Compliance Buffer]
    end
    
    subgraph "Services Provided"
        WALLETS[Multi-Chain Wallets<br/>BTC, ETH, USDC]
        IBAN[Virtual IBANs<br/>SEPA Accounts]
        CARDS[Card Issuance<br/>Virtual + Physical]
        RAMP[On/Off-Ramps<br/>Crypto ↔ Fiat]
        KYC[KYC/KYB Verification<br/>Automated + Manual]
    end
    
    subgraph "Revenue Streams"
        SUB[Monthly Subscriptions<br/>$2,500/customer]
        USAGE[Usage Fees<br/>Per Transaction]
        KYCFEE[KYC Checks<br/>$5 per verification]
        CARDFEE[Card Fees<br/>$8 virtual / $20 physical]
    end
    
    CORE --> API
    CORE --> LN
    CORE --> COMP
    API --> WALLETS
    API --> IBAN
    API --> CARDS
    API --> RAMP
    COMP --> TAS
    COMP --> LEI
    COMP --> VLEI
    COMP --> KYC
    
    CORE --> PSP
    CORE --> PORTAL
    PSP --> PSPCAT
    PSPCAT --> PSPCUST
    PORTAL --> DIRECT
    DIRECT --> EXCHANGE
    DIRECT --> DEFI
    DIRECT --> WALLET
    
    PSPCUST --> SUB
    DIRECT --> SUB
    WALLETS --> USAGE
    IBAN --> USAGE
    CARDS --> CARDFEE
    KYC --> KYCFEE
    
    TAS -.->|Preferred| DIRECT
    LEI -.->|Alternative| DIRECT
    LEI -->|No TAS| GRACE
    GRACE -->|Requires| KYC
    
    style CORE fill:#2563eb,color:#fff
    style COMP fill:#f59e0b,color:#fff
    style SUB fill:#10b981,color:#fff
    style USAGE fill:#10b981,color:#fff
    style TAS fill:#8b5cf6,color:#fff
    style LEI fill:#0ea5e9,color:#fff
\`\`\`

**Distribution Philosophy:**

The platform operates on a dual-channel model:

1. **PSP Marketplace Channel**: PSPs purchase and white-label the crypto banking service for their merchant base
2. **Direct Enterprise Channel**: Large crypto businesses (exchanges, DeFi platforms) access services directly

This strategy maximizes reach while maintaining quality control and compliance standards.

### Managing PSP Subscriptions

**View Active Subscriptions:**

\`\`\`sql
-- Query PSP marketplace subscriptions
SELECT 
  psp_id,
  psp_name,
  service_name,
  subscription_status,
  monthly_fee,
  activated_date
FROM psp_service_subscriptions
WHERE service_name LIKE '%Crypto Gateway%'
  AND subscription_status = 'active'
ORDER BY activated_date DESC;
\`\`\`

**Subscription Lifecycle:**

1. **Activation** - PSP enables from marketplace
2. **Configuration** - White-label settings, API keys
3. **Usage Tracking** - Monitor transactions, KYC checks
4. **Billing** - Monthly fee + usage charges
5. **Support** - Technical assistance, compliance guidance

### Managing Direct Customers (Exchanges/DeFi)

**Customer Portal:** CryptoGatewayLogin page

**Customer Entity:** CryptoGatewayCustomer

\`\`\`javascript
// Create new direct customer
const customer = await base44.asServiceRole.entities.CryptoGatewayCustomer.create({
  company_name: "BitExchange Pro",
  company_type: "exchange",
  email: "admin@bitexchange.com",
  subscription_tier: "professional",
  monthly_fee: 2500,
  supported_assets: ["BTC", "ETH", "USDC"],
  kyc_enabled: true,
  status: "active"
});

// Generate API credentials
const apiKey = generateSecureKey();
await base44.asServiceRole.entities.CryptoGatewayCustomer.update(customer.id, {
  api_key: apiKey,
  striga_user_id: await createStrigaUser(customer)
});
\`\`\`

### Revenue Tracking

**Dashboard Metrics:**

\`\`\`
Crypto Gateway Revenue Dashboard

Active Subscriptions:        47
  - PSP Marketplace:         32 × $2,500 = $80,000/mo
  - Direct Customers:        15 × $2,500 = $37,500/mo
  
Monthly Recurring Revenue:   $117,500
Annual Run Rate:             $1,410,000

Usage Revenue (Last 30 Days):
  - KYC Checks:             $12,450 (2,490 @ $5)
  - Virtual Cards:          $8,960 (1,120 @ $8)
  - Physical Cards:         $4,200 (210 @ $20)
  - Transaction Fees:       $18,750 (1.5% on $1.25M)
  
Total Monthly Revenue:       $161,860

Costs:
  - Striga Base Fees:       $70,500 (47 × $1,500)
  - Usage Pass-through:     $28,407
  Total Costs:              $98,907
  
Gross Margin:               $62,953 (39%)
\`\`\`

### White-Label Configuration

**For PSP Customers:**

\`\`\`json
{
  "psp_id": "psp_abc123",
  "white_label_config": {
    "branding": {
      "company_name": "ABC Payments Crypto",
      "logo_url": "https://abc.com/crypto-logo.png",
      "primary_color": "#2563eb",
      "custom_domain": "crypto.abcpayments.com"
    },
    "features": {
      "wallets": ["BTC", "ETH", "USDC"],
      "cards": {
        "virtual": true,
        "physical": true,
        "card_design_url": "https://abc.com/card-design.png"
      },
      "kyc": {
        "provider": "internal",
        "verification_levels": ["basic", "enhanced"]
      }
    },
    "notifications": {
      "email_from": "crypto@abcpayments.com",
      "webhook_url": "https://api.abcpayments.com/crypto-webhooks"
    }
  }
}
\`\`\`

### Compliance Monitoring

**VASP Compliance Dashboard:**

\`\`\`
Regulatory Compliance Status

VASP License (EU):           ✅ Active (Striga)
MiCA Readiness:              ✅ Compliant
AML/CFT Monitoring:          ✅ Real-time
Travel Rule:                 ✅ Implemented

Customer Screening:
  - Total Users:             12,453
  - High Risk:               127 (1.0%)
  - PEP Matches:             43 (0.3%)
  - Sanctions Hits:          0

Transaction Monitoring:
  - Flagged Transactions:    89 (0.7%)
  - Under Review:            12
  - Blocked:                 3
  - Reported to FIU:         0
\`\`\`

### Striga API Management

**API Connector:** functions/strigaConnector.js

**Available Operations:**

\`\`\`javascript
// User Management
await strigaConnector.createUser({ email, mobile, KYC data });
await strigaConnector.getUser(userId);

// Wallet Operations
await strigaConnector.createWallet(userId, currency);
await strigaConnector.getWallets(userId);
await strigaConnector.getWalletBalance(walletId);

// IBAN Management
await strigaConnector.createIBAN(userId);
await strigaConnector.getIBANs(userId);

// Card Issuance
await strigaConnector.issueCard(userId, type: 'VIRTUAL' | 'PHYSICAL');
await strigaConnector.getCards(userId);

// Transactions
await strigaConnector.initiateWithdrawal(walletId, amount, destination);
await strigaConnector.exchangeCrypto(fromCurrency, toCurrency, amount);
await strigaConnector.getTransactionHistory(userId, filters);
\`\`\`

### Customer Identity & Compliance Framework

**Trust-Based Identity Hierarchy:**

The crypto banking service implements a sophisticated identity and compliance framework based on verifiable credentials and legal entity identifiers:

\`\`\`mermaid
graph TD
    A[New Customer Registration] --> B{Identity Type?}
    
    B -->|Has TAS ID| C[Trust Anchor Service]
    B -->|Has LEI Only| D[Legal Entity Identifier]
    B -->|Neither| E[Grace Period]
    
    C --> C1[TAS Verification]
    C1 -->|Verified| C2[✅ Full Access<br/>No Additional KYB]
    C1 -->|Failed| E
    
    D --> D1[LEI Verification via GLEIF]
    D1 -->|Verified| D2[⚠️ Requires Full KYB]
    D2 --> D3[KYB Process]
    D3 -->|Approved| D4[✅ Full Access]
    D3 -->|Rejected| D5[❌ Account Suspended]
    D1 -->|Failed| E
    
    E --> E1[3-Month Grace Period]
    E1 --> E2[Limited Services]
    E2 --> E3{Credentials Provided?}
    E3 -->|Yes| C1
    E3 -->|No - 90 Days| E4[❌ Account Suspended]
    
    style C fill:#10b981,color:#fff
    style D fill:#f59e0b,color:#fff
    style E fill:#ef4444,color:#fff
    style C2 fill:#10b981,color:#fff
    style D4 fill:#10b981,color:#fff
    style D5 fill:#ef4444,color:#fff
    style E4 fill:#ef4444,color:#fff
\`\`\`

**Identity Verification Matrix:**

| Credential Type | Verification Source | KYB Required | Grace Period | Access Level | Recommended For |
|----------------|-------------------|--------------|--------------|--------------|----------------|
| **TAS ID** (Preferred) | Trust Anchor Service | No | N/A | Full immediate access | Established entities with vLEI |
| **LEI** (Alternative) | GLEIF API | Yes (Full) | N/A | Full after KYB approval | Traditional enterprises |
| **vLEI** (Advanced) | Cryptographic verification | No | N/A | Full + enhanced features | Digital-first organizations |
| **Neither** | N/A | Yes (after 90 days) | 3 months | Limited trial access | New/small businesses |

**TAS ID (Trust Anchor Service Identifier):**

Trust Anchor Service credentials represent the highest tier of verifiable organizational identity:

- Issued by accredited Trust Anchors in the ToIP (Trust over IP) ecosystem
- Provides cryptographic proof of legal entity status
- Enables instant verification without manual KYB
- Automatically includes vLEI (Verifiable LEI) capabilities
- Format: \`TAS-XXXX-XXXX-XXXX\` (provider-specific)

**LEI (Legal Entity Identifier):**

20-character alphanumeric code issued by GLEIF (Global Legal Entity Identifier Foundation):

- Global standard for legal entity identification (ISO 17442)
- Verified against GLEIF database via API integration
- Provides company registration and ownership information
- **Triggers mandatory KYB** when used without TAS ID
- Format: \`XXXXXXXXXXXXXXXXXXXXXX\` (20 characters)

**vLEI (Verifiable LEI):**

Cryptographically signed digital credential built on LEI:

- Combines traditional LEI with W3C Verifiable Credentials
- Enables automated verification without central authorities
- Includes digital signatures for non-repudiation
- Blockchain-agnostic (typically uses DID infrastructure)
- Part of GLEIF's digitization initiative

**Grace Period Policy:**

Customers without TAS or LEI receive a 3-month compliance grace period:

\`\`\`typescript
interface GracePeriodPolicy {
  duration: "90 days from registration",
  services_allowed: [
    "Limited wallet creation (1 wallet)",
    "Small transactions (<$1,000/day)",
    "Virtual IBAN (view only)",
    "No card issuance"
  ],
  warnings: [
    "Day 60: First reminder email",
    "Day 75: Second reminder + portal notification",
    "Day 85: Final warning + service restriction notice",
    "Day 90: Account suspension + data retention (30 days)"
  ],
  reinstatement: "Provide TAS or LEI + complete KYB"
}
\`\`\`

### KYB/KYC Verification Workflows

**Customer Onboarding Flow:**

\`\`\`mermaid
sequenceDiagram
    participant C as Customer
    participant P as Portal
    participant DB as Database
    participant GLEIF as GLEIF API
    participant TAS as Trust Anchor Service
    participant KYB as KYB Provider
    participant Admin as Platform Admin
    
    C->>P: Register Account
    P->>C: Request Credentials
    
    alt Has TAS ID
        C->>P: Provide TAS ID
        P->>TAS: Verify TAS Credential
        TAS-->>P: ✅ Verified + vLEI
        P->>DB: Create Customer (Full Access)
        P->>C: ✅ Account Activated
    else Has LEI Only
        C->>P: Provide LEI
        P->>GLEIF: Verify LEI
        GLEIF-->>P: ✅ LEI Valid
        P->>DB: Create Customer (KYB Required)
        P->>KYB: Initiate KYB Process
        KYB->>C: Request Documents
        C->>KYB: Submit Documents
        KYB->>Admin: Manual Review Required
        Admin->>KYB: Approve/Reject
        alt Approved
            KYB-->>P: ✅ KYB Approved
            P->>DB: Update Status (Full Access)
            P->>C: ✅ Account Activated
        else Rejected
            KYB-->>P: ❌ KYB Rejected
            P->>DB: Suspend Account
            P->>C: ❌ Access Denied
        end
    else No Credentials
        P->>DB: Create Customer (Grace Period)
        P->>C: ⚠️ 90-Day Trial - Provide Credentials
        Note over P,C: Limited services for 90 days
    end
\`\`\`

**KYB Verification Requirements (LEI-only customers):**

\`\`\`yaml
kyb_requirements:
  company_information:
    - legal_name
    - registration_number
    - incorporation_date
    - jurisdiction
    - business_type
    - operational_address
    
  ownership_structure:
    - ultimate_beneficial_owners (>25% ownership)
    - directors_and_officers
    - ownership_chart
    - related_entities
    
  financial_information:
    - bank_account_details
    - financial_statements (last 2 years)
    - funding_sources
    - expected_transaction_volume
    
  documentation:
    required:
      - certificate_of_incorporation
      - proof_of_address (utility bill <3 months)
      - directors_id_verification
      - banking_reference_letter
    
    optional:
      - audited_financial_statements
      - licenses_permits
      - aml_compliance_certificate
      - existing_vasp_license
      
  verification_timeline:
    submission: "Day 0"
    initial_review: "Day 1-3"
    document_requests: "Day 4-7"
    compliance_checks: "Day 8-10"
    final_decision: "Day 11-14"
    
  approval_criteria:
    - clean_aml_screening
    - valid_lei_in_gleif
    - verified_business_operations
    - acceptable_risk_profile
    - complete_documentation
\`\`\`

**KYC/KYB Verification Dashboard:**

| Status | Description | Customer Count | Action Required | Average Time |
|--------|-------------|----------------|-----------------|--------------|
| **Pending Review** | Awaiting initial assessment | 23 | Platform Admin review | 24-48 hours |
| **Document Request** | Additional documents needed | 12 | Customer submission | 3-5 days |
| **AML Screening** | Sanctions/PEP checks | 8 | Automated | 10 minutes |
| **Manual Review** | Complex cases | 5 | Compliance Officer | 2-3 days |
| **Approved** | Full compliance verified | 847 | None | N/A |
| **Rejected** | Failed verification | 7 | Appeal process | N/A |
| **Grace Period** | No credentials yet | 34 | Reminder emails | 90 days max |

### LEI/vLEI Integration

**GLEIF API Integration:**

\`\`\`javascript
// LEI Verification via GLEIF API
async function verifyLEI(lei) {
  const response = await fetch(\`https://api.gleif.org/api/v1/lei-records/\${lei}\`);
  const data = await response.json();
  
  return {
    valid: data.attributes.entity.status === "ACTIVE",
    legalName: data.attributes.entity.legalName.name,
    jurisdiction: data.attributes.entity.legalAddress.country,
    registrationDate: data.attributes.registration.initialRegistrationDate,
    nextRenewalDate: data.attributes.registration.nextRenewalDate,
    status: data.attributes.entity.status,
    category: data.attributes.entity.category
  };
}

// vLEI Verification (Cryptographic)
async function verifyVLEI(vlei, signature) {
  const publicKey = await fetchTrustAnchorPublicKey(vlei.issuerId);
  const isValid = await crypto.subtle.verify(
    { name: "ECDSA", hash: "SHA-256" },
    publicKey,
    signature,
    vlei.credential
  );
  
  return {
    valid: isValid,
    lei: vlei.lei,
    issuer: vlei.issuerId,
    issueDate: vlei.validFrom,
    expiryDate: vlei.validUntil,
    trustLevel: isValid ? "HIGH" : "INVALID"
  };
}
\`\`\`

**LEI Status Monitoring:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Pending: LEI Provided
    Pending --> Verifying: Query GLEIF
    Verifying --> Verified: Active in GLEIF
    Verifying --> Expired: Expired in GLEIF
    Verifying --> NotFound: Invalid LEI
    
    Verified --> Expired: Annual Check
    Verified --> [*]: Full Access
    
    Expired --> Pending: LEI Renewed
    Expired --> Suspended: 30 Days Grace
    
    NotFound --> Suspended: Invalid
    Suspended --> [*]: Account Closed
    
    note right of Verified
        Annual renewal check
        GLEIF API validation
        Auto-notification before expiry
    end note
    
    note right of Suspended
        Grace period: 30 days
        Service restrictions apply
        Manual reactivation possible
    end note
\`\`\`

### Portal Management

**Standalone Portal Configuration:**

Platform administrators can customize the customer-facing crypto gateway portal:

\`\`\`json
{
  "portal_config": {
    "branding": {
      "company_name": "FTS.Money Crypto Banking",
      "tagline": "Fluid global payments",
      "logo_url": "https://fts.money/crypto-logo.png",
      "favicon_url": "https://fts.money/favicon.ico",
      "primary_color": "#0066CC",
      "accent_color": "#00BFFF",
      "background_gradient": "linear-gradient(135deg, #003EFF 0%, #54F0E4 100%)"
    },
    
    "features": {
      "wallets": {
        "enabled": true,
        "supported_assets": ["BTC", "ETH", "USDC", "USDT", "SOL"],
        "max_wallets_per_user": 10,
        "default_currency": "USDC"
      },
      "virtual_ibans": {
        "enabled": true,
        "currency": "EUR",
        "instant_creation": true,
        "max_per_customer": 5
      },
      "cards": {
        "virtual_enabled": true,
        "physical_enabled": true,
        "card_design_url": "https://fts.money/card-design.png",
        "daily_limit": 10000,
        "monthly_limit": 100000
      },
      "kyc": {
        "provider": "striga",
        "verification_levels": ["basic", "enhanced"],
        "auto_approve_threshold": 1000
      }
    },
    
    "compliance": {
      "require_lei_or_tas": true,
      "grace_period_days": 90,
      "auto_kyb_for_lei_only": true,
      "aml_screening": "real-time",
      "transaction_monitoring": true,
      "travel_rule_threshold": 1000
    },
    
    "api": {
      "striga_app_id": "{{STRIGA_APPLICATION_ID}}",
      "webhook_url": "https://api.fts.money/crypto/webhooks",
      "rate_limit": "1000/minute",
      "sandbox_mode": false
    }
  }
}
\`\`\`

**Portal Access Management:**

\`\`\`
Portal URL: https://fts.money/CryptoGatewayLogin
Subdomain: crypto.fts.money (optional)
SSL Certificate: Wildcard *.fts.money
CDN: CloudFlare (global distribution)

Authentication:
  - Email/password (bcrypt hashed)
  - 2FA optional (TOTP)
  - Session timeout: 30 minutes
  - Failed login lockout: 5 attempts

Customer Portal Features:
  ✅ Dashboard (balances, transactions)
  ✅ Wallet Management (create, fund, withdraw)
  ✅ IBAN Management (view, transactions)
  ✅ Card Management (order, activate, freeze)
  ✅ Transaction History (filter, export)
  ✅ KYC Verification (upload docs, status)
  ✅ API Keys (generate, revoke)
  ✅ Settings (profile, security)
  ✅ Support (tickets, chat)
\`\`\`

### Service Feature Matrix

**Crypto Banking Service Tiers:**

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| **Monthly Fee** | $2,500 | $5,000 | $15,000 |
| **Included Users** | 100 | 1,000 | Unlimited |
| **Wallet Types** | 3 assets | 10 assets | All supported |
| **Virtual IBANs** | 50 | 500 | Unlimited |
| **Virtual Cards** | 100 | 1,000 | Unlimited |
| **Physical Cards** | ❌ | ✅ | ✅ |
| **Daily Volume Limit** | $100K | $1M | $10M+ |
| **KYC Checks/month** | 50 included | 500 included | Unlimited |
| **Lightning Network** | ❌ | ✅ | ✅ |
| **White-label Portal** | ❌ | ❌ | ✅ |
| **Custom Integration** | ❌ | ❌ | ✅ |
| **Dedicated Support** | Email | Priority | 24/7 Phone |
| **SLA** | 99.5% | 99.9% | 99.99% |

**Usage-Based Pricing:**

\`\`\`
Per-Transaction Fees:
  On-Ramp (Fiat → Crypto):     1.5% (min $5)
  Off-Ramp (Crypto → Fiat):    1.5% (min $5)
  Crypto-to-Crypto Exchange:   0.5%
  IBAN Transfer In:            Free
  IBAN Transfer Out:           €0.50
  Blockchain Transfer Out:     Network fee + $1

KYC/Verification:
  Basic KYC:                   $5 per user
  Enhanced KYC:                $15 per user
  Business KYB:                $50 per entity
  LEI Verification:            Free (GLEIF API)
  TAS Verification:            Free (automated)

Card Fees:
  Virtual Card Issuance:       $8 per card
  Physical Card Issuance:      $20 per card
  Card Replacement:            $15
  ATM Withdrawal:              $2.50 + 2%
  Foreign Exchange:            2.5%

Other Fees:
  Failed Transaction:          $0.25
  Chargeback:                  $50
  Compliance Review:           $100/hour
  Custom Integration:          $10,000 setup
\`\`\`

### Support & Operations

**Common Issues:**

**1. KYC/KYB Failure**

*Symptoms:* Customer stuck in verification

*Diagnosis:*
\`\`\`sql
SELECT 
  customer_id,
  company_name,
  compliance_status,
  kyb_status,
  lei_status,
  tas_status,
  compliance_grace_period_end
FROM crypto_gateway_customers
WHERE kyb_status IN ('failed', 'in_progress')
ORDER BY created_date;
\`\`\`

*Resolution:*
- Check document quality/completeness
- Verify LEI in GLEIF database
- Validate TAS credentials with issuer
- Manual review by compliance team
- Contact customer for additional docs

**2. LEI Verification Failed**

*Symptoms:* LEI shows as "expired" or "not_found"

*Resolution:*
\`\`\`javascript
// Re-verify LEI via GLEIF API
const leiData = await verifyLEI(customer.lei);
if (leiData.status === "EXPIRED") {
  // Notify customer to renew
  await sendRenewalNotification(customer);
  // 30-day grace period
  await updateCustomerGracePeriod(customer.id, 30);
} else if (!leiData.valid) {
  // Invalid LEI - suspend account
  await suspendCustomerAccount(customer.id, "Invalid LEI");
}
\`\`\`

**3. Transaction Delays**

*Causes:*
- Blockchain confirmations (BTC: 10-60 min, ETH: 1-5 min)
- SEPA processing times (1-2 business days)
- Striga API rate limits
- Compliance holds (AML screening)

*Resolution:*
- Check blockchain explorers for confirmation status
- Verify SEPA batch processing schedules
- Review Striga API status page
- Check AML screening results

**4. Card Activation Issues**

*Requirements:*
- Enhanced KYC level required for cards
- LEI or TAS must be verified
- Address verification completed
- Sufficient balance in linked wallet

*Resolution:*
\`\`\`javascript
// Check card eligibility
const customer = await getCustomer(customerId);
const canIssueCard = 
  customer.kyb_status === 'completed' &&
  (customer.lei_status === 'verified' || customer.tas_status === 'verified') &&
  customer.address_verified === true;

if (!canIssueCard) {
  return {
    error: "Card issuance requirements not met",
    missing: checkMissingRequirements(customer)
  };
}
\`\`\`

**5. Grace Period Expiration**

*Process:*
\`\`\`mermaid
flowchart LR
    A[Day 60] --> B[First Email Reminder]
    B --> C[Day 75: Second Reminder]
    C --> D[Day 85: Final Warning]
    D --> E[Day 90: Suspension]
    E --> F{Credentials Provided?}
    F -->|Yes| G[Reinstate Account]
    F -->|No| H[Data Retention 30 Days]
    H --> I[Permanent Deletion]
\`\`\`

**Escalation Contacts:**

\`\`\`
Level 1 - Technical Issues:
  Email: crypto-support@fts.money
  Response: 4 hours (business hours)
  
Level 2 - Striga Infrastructure:
  Email: support@striga.com
  Response: 1 hour (24/7)
  
Level 3 - Compliance/LEI Issues:
  Email: compliance@fts.money
  Response: Next business day
  
Level 4 - Platform Emergency:
  Phone: +1-800-FTS-CRYPTO
  Response: Immediate (24/7)
  
GLEIF Support:
  Website: www.gleif.org/en/contact
  For LEI renewal/validation issues
\`\`\`

---

## Service Catalog Administration

### Provider Management

The service catalog is one of our key competitive advantages - 150+ pre-integrated services that PSPs can activate with one click. But maintaining this catalog requires constant work: onboarding new providers, updating existing integrations when APIs change, monitoring performance, and removing services that don't meet quality standards.

Adding a new payment provider is a multi-week process involving technical assessment, legal negotiations, integration development, testing, and documentation. We don't add every provider that requests inclusion - we're selective because every integration creates ongoing maintenance burden and our reputation depends on every service working reliably.

The technical assessment evaluates their API quality, stability, and documentation. Do they have proper authentication? Is their API well-designed? Do they version properly? Can they handle our expected volume? Poor API quality means constant integration maintenance issues.

Legal review examines their terms of service, data handling practices, and financial stability. We're betting our platform's reliability on their service remaining available. If a critical provider goes out of business, we need contingency plans.

**Adding New Payment Provider:**

\`\`\`mermaid
flowchart TD
    A[Request to Add Provider] --> B{Technical Assessment}
    B -->|Pass| C[Legal Review]
    B -->|Fail| X[Reject]
    C -->|Approved| D[Contract Negotiation]
    C -->|Issues| Y[Request Changes]
    Y --> C
    D --> E[Technical Integration]
    E --> F[Build API Connector]
    F --> G[Sandbox Testing]
    G -->|Success| H[Production Testing]
    G -->|Fail| F
    H -->|Success| I[Documentation]
    H -->|Fail| F
    I --> J[Add to Catalog]
    J --> K[Notify PSPs]
    K --> L[Monitor Performance]
\`\`\`

**Provider Integration Checklist:**

- [ ] API documentation reviewed
- [ ] Connector code implemented
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passed
- [ ] Security audit completed
- [ ] Rate limits configured
- [ ] Error handling implemented
- [ ] Monitoring alerts configured
- [ ] Documentation written
- [ ] Pricing structure defined
- [ ] Legal agreement signed

**Provider Categories:**

\`\`\`yaml
categories:
  card_processing:
    providers:
      - stripe
      - adyen
      - checkout_com
      - worldpay
      - fiserv
    avg_processing_time: "2-3 seconds"
    success_rate_target: ">98%"
    
  alternative_payment_methods:
    providers:
      - paypal
      - apple_pay
      - google_pay
      - klarna
      - afterpay
    avg_processing_time: "3-5 seconds"
    success_rate_target: ">95%"
    
  bank_transfers:
    providers:
      - plaid
      - truelayer
      - tink
      - gocardless
    avg_processing_time: "1-3 days"
    success_rate_target: ">99%"
    
  cryptocurrency:
    providers:
      - coinbase
      - bitpay
      - circle
      - fireblocks
    avg_processing_time: "10-60 minutes"
    success_rate_target: ">99.5%"
\`\`\`

### Buy Rate Management

**Master Pricing Table:**

\`\`\`sql
-- Example: Master buy rates from providers
SELECT 
    provider_name,
    transaction_type,
    card_brand,
    region,
    percentage_rate,
    fixed_fee,
    effective_from
FROM master_pricing
WHERE status = 'active'
ORDER BY provider_name, transaction_type;
\`\`\`

**Pricing Waterfall:**

\`\`\`
Gross Transaction Amount:           $100.00

Provider Buy Rate:
  - Percentage (2.5%)                 -$2.50
  - Fixed fee                         -$0.30
  Provider Cost:                      -$2.80

PSP Sell Rate (Platform Markup):
  - Percentage (0.3%)                 +$0.30
  - Fixed fee markup                  +$0.10
  Platform Revenue:                   +$0.40

Net to PSP:                           $97.20
Merchant Fee (PSP Markup):
  - Percentage (0.2%)                 -$0.20
  - Fixed fee                         -$0.05
  PSP Revenue:                        +$0.25

Net to Merchant:                      $96.95

Revenue Split:
  - Payment Provider:    $2.80 (2.80%)
  - FTS.Money Platform:  $0.40 (0.40%)
  - PSP:                 $0.25 (0.25%)
  - Merchant receives:   $96.95 (96.95%)
\`\`\`

### Payout Routes Configuration

**Available Payout Methods:**

| Method | Countries | Settlement Time | Cost | Use Case |
|--------|-----------|-----------------|------|----------|
| Bank Transfer (ACH) | US | 2-3 business days | $0.50 | Domestic US |
| Bank Transfer (SEPA) | EU | 1-2 business days | €0.30 | EU merchants |
| Bank Wire | Global | 1-5 business days | $15-$30 | International |
| PayPal | 200+ | Instant - 1 day | 2% | Small merchants |
| Crypto (USDC) | Global | 10-30 minutes | $0.10 | Crypto-native |
| Mobile Money | Africa, Asia | Minutes - hours | 1-3% | Emerging markets |

**Configuring New Payout Route:**

\`\`\`javascript
// Add payout route via Control Panel API
await platform.payoutRoutes.create({
  method: "bank_transfer",
  provider: "stripe_connect",
  regions: ["US", "CA"],
  currencies: ["USD", "CAD"],
  settlement_schedule: "T+2",
  fees: {
    percentage: 0,
    fixed: 0.50,
    currency: "USD"
  },
  limits: {
    min_amount: 1.00,
    max_amount: 1000000.00,
    daily_limit: 5000000.00
  },
  status: "active"
});
\`\`\`

---

## Financial Operations

### Revenue Tracking

Financial operations at the platform level require tracking revenue and costs across hundreds or thousands of PSPs, each with different pricing tiers, usage patterns, and service subscriptions. This complexity demands sophisticated systems for accurate tracking, billing, and reconciliation.

We track five distinct revenue streams: platform subscriptions (recurring tier fees), FTS-owned services (ISO Gateway, Orchestration, etc.), marketplace commissions (our cut of third-party services), transaction revenue share (percentage of payment processing fees), and professional services (custom work).

Each stream has different characteristics. Subscriptions are predictable and high-margin. Services are usage-based with moderate margins. Marketplace commissions are high-margin but depend on provider adoption. Transaction revenue share is high-volume but low-margin. Professional services are lumpy but lucrative.

The revenue dashboard provides real-time visibility into all these streams, helping leadership make informed decisions about pricing, capacity planning, and strategic priorities. If marketplace revenue is growing faster than expected, maybe we invest more in provider onboarding. If transaction revenue is below projections, maybe we need to help PSPs increase their volume.

**Revenue Dashboard Metrics:**

\`\`\`mermaid
graph TB
    subgraph "Revenue Streams"
        A[Total Platform Revenue]
        A --> B[Subscription Revenue]
        A --> C[Transaction Revenue]
        A --> D[Marketplace Commission]
        A --> E[Professional Services]
    end
    
    subgraph "Subscription Details"
        B --> B1[Starter Tier]
        B --> B2[Professional Tier]
        B --> B3[Enterprise Tier]
    end
    
    subgraph "Transaction Details"
        C --> C1[Payment Processing]
        C --> C2[ISO Gateway]
        C --> C3[Orchestration]
    end
    
    subgraph "Costs"
        F[Total Platform Costs]
        F --> G[Infrastructure]
        F --> H[Provider Costs]
        F --> I[Personnel]
        F --> J[Compliance & Legal]
    end
    
    A --> K[Gross Profit]
    F --> K
    K --> L[Net Profit Margin]
\`\`\`

**Monthly Recurring Revenue (MRR) Calculation:**

\`\`\`sql
WITH subscription_revenue AS (
  SELECT 
    DATE_TRUNC('month', subscription_date) AS month,
    SUM(monthly_fee) AS mrr
  FROM provisioned_psps
  WHERE status = 'active'
  GROUP BY month
),
transaction_revenue AS (
  SELECT 
    DATE_TRUNC('month', transaction_date) AS month,
    SUM(platform_fee) AS txn_revenue
  FROM transactions
  GROUP BY month
),
marketplace_revenue AS (
  SELECT 
    DATE_TRUNC('month', subscription_date) AS month,
    SUM(commission) AS marketplace_revenue
  FROM service_subscriptions
  GROUP BY month
)
SELECT 
  s.month,
  COALESCE(s.mrr, 0) AS subscription_mrr,
  COALESCE(t.txn_revenue, 0) AS transaction_revenue,
  COALESCE(m.marketplace_revenue, 0) AS marketplace_revenue,
  COALESCE(s.mrr, 0) + COALESCE(t.txn_revenue, 0) + COALESCE(m.marketplace_revenue, 0) AS total_revenue
FROM subscription_revenue s
LEFT JOIN transaction_revenue t ON s.month = t.month
LEFT JOIN marketplace_revenue m ON s.month = m.month
ORDER BY s.month DESC;
\`\`\`

### Billing & Invoicing

**Invoice Generation Flow:**

\`\`\`mermaid
sequenceDiagram
    participant System as Billing System
    participant PSP as PSP Record
    participant Invoice as Invoice Service
    participant Payment as Payment Processor
    participant Customer as PSP Owner
    
    Note over System: Day 1 of Month
    System->>System: Identify Active PSPs
    System->>PSP: Retrieve Usage Data
    PSP-->>System: Transactions, Features, Overages
    
    System->>System: Calculate Charges
    System->>Invoice: Generate Invoice
    Invoice->>Invoice: Apply Discounts
    Invoice->>Invoice: Calculate Tax
    Invoice-->>System: Invoice Created
    
    System->>Payment: Charge Payment Method
    alt Payment Success
        Payment-->>System: Payment Confirmed
        System->>Invoice: Mark as Paid
        System->>Customer: Send Receipt
    else Payment Failed
        Payment-->>System: Payment Failed
        System->>Customer: Send Payment Failure Notice
        System->>System: Schedule Retry (Day 3)
        Note over System: Retry up to 3 times
    end
\`\`\`

**Invoice Line Items:**

\`\`\`
Invoice #INV-2025-001234
PSP: ExamplePSP (psp_abc123)
Period: January 1-31, 2025

Subscription Fees:
  Professional Tier                $999.00
  
Usage Charges:
  Transactions (52,341)
    - Included: 50,000               $0.00
    - Overage: 2,341 × $0.05       $117.05
  
Additional Features:
  - Advanced Fraud Detection       $199.00
  - White-label Mobile App         $299.00
  
Service Marketplace:
  - Stripe Connect Integration      $49.00
  - Jumio KYC Service              $149.00
  
                        Subtotal: $1,812.05
                   Sales Tax (8%):  $144.96
                           Total: $1,957.01
\`\`\`

### Settlement & Reconciliation

**Settlement Process:**

\`\`\`mermaid
flowchart LR
    A[Transaction Completed] --> B[Hold Period<br/>T+0 to T+7]
    B --> C[Reconciliation]
    C --> D{Discrepancies?}
    D -->|No| E[Release Funds]
    D -->|Yes| F[Investigation]
    F --> G{Resolved?}
    G -->|Yes| E
    G -->|No| H[Manual Review]
    H --> E
    E --> I[Initiate Payout]
    I --> J[Payout Completed]
    J --> K[Update Ledger]
\`\`\`

**Daily Reconciliation Report:**

\`\`\`sql
-- Daily reconciliation query
SELECT 
  settlement_date,
  psp_id,
  COUNT(*) AS transaction_count,
  SUM(gross_amount) AS gross_volume,
  SUM(fee_amount) AS total_fees,
  SUM(net_amount) AS net_settlement,
  SUM(CASE WHEN status = 'settled' THEN 1 ELSE 0 END) AS settled_count,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_count
FROM transactions
WHERE settlement_date = CURRENT_DATE
GROUP BY settlement_date, psp_id
ORDER BY psp_id;
\`\`\`

---

## Compliance & Monitoring

### PCI DSS Compliance

Platform-level compliance is non-negotiable. We maintain PCI DSS Level 1 certification not because any single PSP requires it, but because it's the foundation of trust for the entire platform. Lose this certification and every PSP we host is immediately non-compliant - a catastrophic scenario.

PCI DSS Level 1 is the highest certification level, required for companies processing over 6 million card transactions annually. It requires annual on-site audits by a Qualified Security Assessor (QSA), quarterly vulnerability scans by an Approved Scanning Vendor (ASV), and continuous compliance with 12 major requirements.

Achieving Level 1 certification cost us over $500K and 12 months of dedicated security engineering. Maintaining it requires constant vigilance - quarterly scans, continuous monitoring, immediate remediation of any findings, and annual re-certification. But it's the price of entry for running a payment platform.

The compliance timeline is carefully orchestrated because missing any deadline means losing certification. We start preparing for the annual audit in Q4, complete the on-site assessment in Q1, remediate any findings in Q2, and receive our Attestation of Compliance (AOC) in Q2. This AOC is then submitted to all card networks and acquiring banks.

**Quarterly ASV Scans:**

Automated vulnerability scanning schedule:
- Week 1 of quarter: Initiate scan
- Week 2: Remediate findings
- Week 3: Rescan verification
- Week 4: Submit reports to acquirer

**Annual AOC (Attestation of Compliance):**

\`\`\`mermaid
gantt
    title PCI DSS Annual Compliance Timeline
    dateFormat YYYY-MM-DD
    section Q4 Previous Year
    Engage QSA                :2024-10-01, 30d
    section Q1
    On-site Assessment       :2025-01-15, 45d
    Remediation              :2025-03-01, 30d
    section Q2
    Final Validation         :2025-04-01, 15d
    AOC Issued              :2025-04-15, 1d
    Submit to Acquirers     :2025-04-16, 7d
    section Ongoing
    Quarterly ASV Scans     :2025-04-23, 365d
\`\`\`

### ISO 20022 Compliance

**Message Validation:**

\`\`\`xml
<!-- Example ISO 20022 Payment Message (pacs.008) -->
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>FTSPLATFORM20250126001</MsgId>
      <CreDtTm>2025-01-26T10:30:00Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>PSP123-TXN456789</EndToEndId>
        <TxId>TXN456789</TxId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="USD">100.00</IntrBkSttlmAmt>
      <Dbtr>
        <Nm>Customer Name</Nm>
        <PstlAdr>
          <Ctry>US</Ctry>
        </PstlAdr>
      </Dbtr>
      <Cdtr>
        <Nm>Merchant Name</Nm>
        <PstlAdr>
          <Ctry>US</Ctry>
        </PstlAdr>
      </Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
\`\`\`

**Validation Rules:**

- Schema validation (XSD)
- Business rule validation
- Duplicate detection
- Beneficiary screening (sanctions)
- Amount limits validation

### Audit Logging

**Logged Events:**

\`\`\`typescript
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  event_type: 'psp_created' | 'psp_suspended' | 'user_login' | 
              'config_changed' | 'transaction_processed' | 'payout_initiated';
  actor: {
    user_id: string;
    email: string;
    role: string;
    ip_address: string;
  };
  resource: {
    resource_type: 'psp' | 'transaction' | 'user' | 'config';
    resource_id: string;
  };
  action: string;
  before_state?: object;
  after_state?: object;
  metadata?: object;
  severity: 'info' | 'warning' | 'error' | 'critical';
}
\`\`\`

**Retention Policy:**
- Security events: 3 years
- Financial transactions: 7 years
- User actions: 2 years
- System events: 1 year

---

## Infrastructure Management

### Multi-Cloud Orchestration

Multi-cloud isn't just a buzzword for us - it's a strategic imperative. Payment processing requires global reach, high availability, and resilience to provider-specific outages. Relying on a single cloud provider creates unacceptable risk.

Our multi-cloud strategy distributes workloads across AWS, Google Cloud, Azure, Oracle Cloud, and Alibaba Cloud based on each provider's strengths. AWS handles most web application traffic due to maturity and global reach. Google Cloud runs ML/AI workloads because their tools are superior. Azure serves enterprise customers that prefer Microsoft ecosystems. Alibaba Cloud handles China traffic for regulatory compliance.

This distribution also provides leverage in negotiations. Cloud providers compete aggressively for large customers, and our multi-cloud architecture means we're never locked into one vendor's pricing. If AWS raises prices, we can shift more workload to GCP. If GCP has an outage, traffic fails over to AWS automatically.

The cost of this flexibility is operational complexity. We need expertise in multiple cloud platforms, tooling to manage resources across providers, and monitoring to track costs and performance. But the benefits - reliability, cost optimization, regulatory flexibility - far outweigh the complexity.

**Cloud Provider Distribution:**

\`\`\`mermaid
pie title Infrastructure Distribution by Cloud Provider
    "AWS" : 45
    "Google Cloud" : 25
    "Azure" : 20
    "Oracle Cloud" : 5
    "Alibaba Cloud" : 5
\`\`\`

**Resource Allocation Strategy:**

| Workload Type | Primary Cloud | Backup Cloud | Reason |
|---------------|---------------|--------------|--------|
| Web Application | AWS | GCP | Mature services, global reach |
| Database | AWS RDS | Azure SQL | Managed PostgreSQL |
| ML/AI Processing | GCP | AWS | Superior ML/AI tools |
| Object Storage | CloudFlare R2 | AWS S3 | Cost efficiency |
| CDN | CloudFlare | AWS CloudFront | Performance |
| Asia Traffic | Alibaba Cloud | GCP | China compliance |

### Auto-Scaling Configuration

**Scaling Policies:**

\`\`\`yaml
autoscaling:
  web_tier:
    min_instances: 10
    max_instances: 100
    target_cpu: 70%
    scale_up:
      threshold: 80%
      cooldown: 60 # seconds
      increment: 5 # instances
    scale_down:
      threshold: 40%
      cooldown: 300 # seconds
      decrement: 2 # instances
  
  api_tier:
    min_instances: 20
    max_instances: 200
    metrics:
      - type: cpu
        target: 65%
      - type: request_rate
        target: 10000 # req/min per instance
    scale_up:
      threshold: 75%
      cooldown: 30
      increment: 10
    scale_down:
      threshold: 30%
      cooldown: 600
      decrement: 5
  
  payment_processor:
    min_instances: 50
    max_instances: 500
    metrics:
      - type: queue_depth
        target: 100 # messages
      - type: cpu
        target: 80%
    scale_up:
      threshold: 200 # queue depth
      cooldown: 15
      increment: 20
    scale_down:
      threshold: 20
      cooldown: 300
      decrement: 10
\`\`\`

### Disaster Recovery

**RTO & RPO Targets:**

| Service Tier | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Backup Frequency |
|--------------|-------------------------------|--------------------------------|------------------|
| Critical (Payment Processing) | 15 minutes | 0 minutes (sync replication) | Continuous |
| High (PSP Portals) | 1 hour | 5 minutes | Every 5 minutes |
| Medium (Analytics) | 4 hours | 1 hour | Hourly |
| Low (Archived Data) | 24 hours | 24 hours | Daily |

**DR Failover Process:**

\`\`\`mermaid
sequenceDiagram
    participant Mon as Monitoring
    participant Inc as Incident Manager
    participant DR as DR Coordinator
    participant Primary as Primary Region
    participant Secondary as Secondary Region
    participant DNS as DNS/Load Balancer
    
    Mon->>Mon: Detect Primary Failure
    Mon->>Inc: Alert: Primary Down
    Inc->>Inc: Assess Severity
    Inc->>DR: Initiate DR Protocol
    
    DR->>Secondary: Health Check
    Secondary-->>DR: Status: Ready
    
    DR->>Secondary: Promote to Primary
    Secondary->>Secondary: Enable Write Access
    Secondary->>Secondary: Start Services
    
    DR->>DNS: Update DNS Records
    DNS->>DNS: Route Traffic to Secondary
    
    DR->>Inc: Failover Complete
    Inc->>Mon: Update Monitoring
    
    Note over Primary: Recovery begins
    Primary->>Primary: Restore Services
    Primary->>DR: Ready for Failback
    DR->>Primary: Sync Latest Data
    Primary->>Secondary: Replication Restored
    
    DR->>DNS: Restore Original Routing
    DR->>Inc: Failback Complete
\`\`\`

---

## Security & Access Control

### Identity & Access Management

Security at the platform level requires defense in depth - multiple layers of protection so that if one layer fails, others prevent breaches. We implement security controls at the network layer (firewalls, DDoS protection), application layer (authentication, authorization), data layer (encryption, tokenization), and operational layer (monitoring, audit logs).

Authentication is the first line of defense. We require strong passwords (16+ characters), multi-factor authentication (TOTP or SMS), and IP whitelisting for platform admins. Sessions timeout after 30 minutes of inactivity. Failed login attempts trigger account lockout after 5 attempts.

Different types of users authenticate differently. Platform administrators use username/password + 2FA with IP restrictions. API clients use API keys with secret tokens. Services authenticate to each other using mutual TLS (mTLS) where both sides verify identity. This layered approach ensures that compromising one authentication mechanism doesn't grant access to everything.

We also rotate credentials regularly - API keys every 90 days, service certificates every 180 days, database passwords annually. This limits the window of exposure if credentials are somehow compromised.

**Authentication Methods:**

1. **Platform Admin Login**
   - Username/password (16+ characters)
   - 2FA required (TOTP or SMS)
   - IP whitelist (office + VPN)
   - Session timeout: 30 minutes
   - Failed login lockout: 5 attempts

2. **API Authentication**
   - API key + secret
   - JWT tokens (1 hour expiry)
   - OAuth 2.0 (for integrations)
   - mTLS (for sensitive operations)

3. **Service-to-Service**
   - Mutual TLS (mTLS)
   - Service mesh (Istio) auth
   - Rotating credentials (every 90 days)

**Access Control Matrix:**

\`\`\`json
{
  "roles": {
    "super_admin": {
      "permissions": ["*"],
      "description": "Full platform access"
    },
    "platform_admin": {
      "permissions": [
        "psp:*",
        "service_catalog:read",
        "service_catalog:write",
        "analytics:read",
        "users:manage"
      ],
      "description": "Manage PSPs and services"
    },
    "finance_manager": {
      "permissions": [
        "psp:read",
        "analytics:read",
        "revenue:read",
        "revenue:write",
        "pricing:*",
        "reconciliation:*"
      ],
      "description": "Financial operations"
    },
    "compliance_officer": {
      "permissions": [
        "psp:read",
        "audit_logs:read",
        "compliance:*",
        "security:read"
      ],
      "description": "Compliance monitoring"
    }
  }
}
\`\`\`

### Security Monitoring

**SIEM Integration:**

\`\`\`mermaid
graph LR
    A[Application Logs] --> D[Splunk SIEM]
    B[Infrastructure Logs] --> D
    C[Security Events] --> D
    
    D --> E[Correlation Engine]
    E --> F{Threat Detected?}
    F -->|Yes| G[Alert SOC]
    F -->|Yes| H[Auto-Block IP]
    F -->|No| I[Store for Analysis]
    
    G --> J[Security Team]
    J --> K[Investigate]
    K --> L{Confirmed Threat?}
    L -->|Yes| M[Incident Response]
    L -->|No| N[Update Rules]
\`\`\`

**Security Alerts:**

| Alert Type | Severity | Auto-Response | Escalation |
|------------|----------|---------------|------------|
| Brute force login | High | Block IP after 5 attempts | Security team (15 min) |
| SQL injection attempt | Critical | Block IP immediately | Security team + Manager (immediate) |
| Unusual API usage | Medium | Rate limit | Log for review |
| Failed 2FA (5x) | High | Lock account | Security team (30 min) |
| Data exfiltration | Critical | Block + alert | Security team + CTO (immediate) |
| Privilege escalation | Critical | Lock + alert | Security team + CTO (immediate) |

---

## Troubleshooting & Support

### Common Issues & Resolutions

Even with robust automation, things occasionally go wrong. Database connections fail. Cloud providers hit quota limits. Network issues cause timeouts. Configuration bugs surface in edge cases. The key is diagnosing issues quickly and resolving them systematically.

This section documents the most common issues platform administrators encounter, their symptoms, diagnostic procedures, and resolution steps. These runbooks are living documents - we update them every time we encounter a new issue or discover a better resolution approach.

The troubleshooting philosophy: gather data first (logs, metrics, error messages), form hypotheses about root cause, test hypotheses systematically, implement fix, verify resolution, and document for future reference. Avoid the temptation to blindly retry operations without understanding why they failed - you'll just hit the same failure repeatedly.

For each issue, we provide the typical symptoms (what the user reports), diagnostic commands (how to investigate), and resolution steps (how to fix). Start with the diagnostics to confirm the root cause, then proceed with the appropriate resolution.

**Issue 1: PSP Provisioning Failed**

**Symptoms:**
- PSP stuck in "Provisioning" state
- Error: "Database schema creation failed"

**Resolution:**
\`\`\`bash
# Check provisioning logs
kubectl logs -n fts-platform deployment/provisioning-service

# Verify database connectivity
psql -h db.fts.money -U admin -d platform -c "SELECT 1;"

# Retry provisioning
curl -X POST https://api.fts.money/admin/psp/{psp_id}/retry-provision \\
  -H "Authorization: Bearer {admin_token}"
\`\`\`

**Issue 2: Transaction Processing Delays**

**Symptoms:**
- Transactions taking >10 seconds
- Timeout errors

**Diagnosis:**
\`\`\`sql
-- Check transaction queue depth
SELECT 
  queue_name,
  COUNT(*) AS pending_count,
  AVG(wait_time_seconds) AS avg_wait_time
FROM transaction_queue
WHERE status = 'pending'
GROUP BY queue_name;

-- Check processor status
SELECT 
  processor_name,
  status,
  last_heartbeat,
  active_transactions
FROM payment_processors
ORDER BY last_heartbeat DESC;
\`\`\`

**Resolution:**
- Scale up payment processor instances
- Check payment provider API status
- Review rate limit configurations

**Issue 3: High Error Rate**

**Symptoms:**
- Error rate >5% (normal: <0.1%)
- Specific error: "Provider timeout"

**Resolution Steps:**
1. Check provider status page
2. Review recent config changes
3. Examine error logs
4. Test with alternative provider
5. Adjust timeout settings if needed

### Support Escalation

**L1 Support (Email):**
- Response time: 24 hours
- Handles: General questions, basic issues
- Available to: All tiers

**L2 Support (Priority):**
- Response time: 4 hours
- Handles: Technical issues, integrations
- Available to: Professional, Enterprise

**L3 Support (Dedicated):**
- Response time: 1 hour
- Handles: Critical issues, custom work
- Available to: Enterprise only

**Emergency Hotline:**
- Phone: +1-800-FTS-HELP
- Available 24/7 for Enterprise customers
- Production-down issues only

---

## Conclusion

The FTS Control Panel is the central nervous system of the FTS.Money platform, providing comprehensive tools for managing PSPs, services, financials, compliance, and infrastructure at scale.

**Key Takeaways:**

1. **Centralized Management:** Single interface for all platform operations
2. **Automation:** Reduce manual tasks through intelligent automation
3. **Scalability:** Handle growth from 10 to 10,000 PSPs
4. **Security:** Bank-grade security and compliance built-in
5. **Observability:** Real-time monitoring and alerting

**Next Steps:**

- Review user role assignments
- Configure monitoring alerts
- Set up automated reports
- Schedule compliance reviews
- Plan capacity for growth

---

**Document Information**

- **Version:** 1.0
- **Last Updated:** December 26, 2025
- **Status:** Active
- **Classification:** Internal - Platform Administrators
- **Owner:** Platform Engineering Team
- **Contact:** platform-admin@fts.money

© 2025 FTS.Money. Internal use only.`;

export default FTSControlPanelDoc;