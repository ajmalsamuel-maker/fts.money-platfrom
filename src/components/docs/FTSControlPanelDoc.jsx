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
5. [Service Catalog Administration](#service-catalog-administration)
6. [Financial Operations](#financial-operations)
7. [Compliance & Monitoring](#compliance--monitoring)
8. [Infrastructure Management](#infrastructure-management)
9. [Security & Access Control](#security--access-control)
10. [Troubleshooting & Support](#troubleshooting--support)

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

## Crypto Gateway Management

### Overview

The Crypto Gateway Service represents a strategic white-label opportunity where FTS.Money resells Striga/Lightspark infrastructure as proprietary technology. This section covers administration, customer management, and revenue tracking.

**Access:** Platform Admin → Striga Service Management (`/StrigaServiceManagement`)

### Dual Distribution Model

\`\`\`mermaid
graph TB
    subgraph "FTS.Money Platform"
        A[Crypto Gateway Service<br/>White-labeled]
    end
    
    subgraph "Distribution Channel 1"
        B[PSP Marketplace]
        C[PSP Customers]
    end
    
    subgraph "Distribution Channel 2"
        D[Standalone Portal]
        E[Direct Customers<br/>Exchanges/DeFi]
    end
    
    subgraph "Revenue"
        F[Monthly Subscriptions<br/>$2,500/customer]
        G[Usage Fees<br/>KYC, Cards, Txns]
    end
    
    A --> B
    A --> D
    B --> C
    C --> F
    D --> E
    E --> F
    F --> G
    
    style A fill:#2563eb,color:#fff
    style F fill:#10b981,color:#fff
    style G fill:#10b981,color:#fff
\`\`\`

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

**Customer Portal:** /CryptoGatewayLogin

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

### Support & Operations

**Common Issues:**

1. **KYC Failure**
   - Check document quality
   - Verify Striga KYC status
   - Manual review if needed

2. **Transaction Delays**
   - Check blockchain confirmations
   - Verify SEPA processing times
   - Review Striga API status

3. **Card Activation Issues**
   - Confirm user KYC level
   - Check card limit settings
   - Verify Striga card inventory

**Escalation:**
- Technical Issues: crypto-support@fts.money
- Striga Infrastructure: support@striga.com
- Compliance Questions: compliance@fts.money

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