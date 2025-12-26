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
  monthly_fee: $99
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

## Service Catalog Administration

### Provider Management

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