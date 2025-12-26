const FTSControlPanelDoc = `
# FTS Control Panel Documentation
## Platform Administration & Global Infrastructure Management

**Version:** 1.0  
**Last Updated:** December 26, 2025  
**Audience:** Platform Administrators, System Architects, Infrastructure Teams

---

## Executive Summary

### Purpose
The **FTS Control Panel** (Platform Admin Portal) is the nerve center of the entire FTS.Money ecosystem. It provides super-admin level control over:
- All PSP instances across the platform
- Global service catalog and marketplace
- Payment provider pool and integrations
- Infrastructure orchestration (multi-cloud)
- Platform-wide compliance and auditing
- Revenue tracking and financial reconciliation
- User management across all portals
- System health monitoring and alerting

### Key Capabilities
- **Centralized Governance:** Single source of truth for all platform operations
- **PSP Lifecycle Management:** Provision, configure, suspend, terminate PSP instances
- **Service Orchestration:** Manage 150+ payment services, providers, and routes
- **Multi-Cloud Management:** Orchestrate resources across AWS, GCP, Azure, Alibaba, Oracle
- **Compliance Oversight:** Monitor PCI DSS, GDPR, LEI/vLEI compliance across all tenants
- **Financial Intelligence:** Track revenue, costs, margins across all services
- **Security Command Center:** Audit logs, access control, incident management

### User Personas

\`\`\`mermaid
mindmap
  root((Platform Admins))
    Super Admin
      Full Access
      PSP Provisioning
      Service Management
      Infrastructure Control
    Operations Manager
      PSP Operations
      Service Health
      Support Tickets
      User Management
    Finance Controller
      Revenue Tracking
      Billing Management
      Cost Analysis
      Reconciliation
    Compliance Officer
      Audit Logs
      KYB/AML Review
      License Validation
      Regulatory Reports
    DevOps Engineer
      System Health
      Performance Tuning
      Infrastructure
      API Management
\`\`\`

### Business Value
- **Operational Efficiency:** Manage 1000+ PSPs from single interface
- **Revenue Visibility:** Real-time tracking of all revenue streams
- **Risk Management:** Proactive compliance and security monitoring
- **Scalability:** Add new services, providers, features without code changes
- **Cost Optimization:** Track cloud costs, optimize resource allocation

---

## Architecture Overview

### Platform Hierarchy

\`\`\`mermaid
graph TB
    A[FTS Platform Control Plane] --> B[PSP Layer]
    A --> C[Service Layer]
    A --> D[Infrastructure Layer]
    A --> E[Compliance Layer]
    
    B --> F[PSP Instance 1]
    B --> G[PSP Instance 2]
    B --> H[PSP Instance N]
    
    F --> I[Merchant 1]
    F --> J[Merchant 2]
    G --> K[Merchant 3]
    
    I --> L[Transactions]
    J --> L
    K --> L
    
    C --> M[Payment Providers]
    C --> N[Payout Routes]
    C --> O[Compliance Services]
    C --> P[Value-Added Services]
    
    D --> Q[AWS Resources]
    D --> R[GCP Resources]
    D --> S[Azure Resources]
    D --> T[Oracle Cloud]
    
    E --> U[KYB/AML]
    E --> V[LEI/vLEI]
    E --> W[PCI DSS]
    E --> X[Audit Logs]
\`\`\`

### Data Model - Platform Level

\`\`\`mermaid
erDiagram
    PLATFORM-CONFIG ||--o{ PROVISIONED-PSP : manages
    PLATFORM-CONFIG ||--o{ SERVICE-CATALOG : owns
    PLATFORM-CONFIG ||--o{ PAYMENT-PROVIDER : integrates
    PLATFORM-CONFIG ||--o{ CLOUD-CONNECTOR : orchestrates
    
    PROVISIONED-PSP ||--o{ MERCHANT : contains
    PROVISIONED-PSP ||--o{ PSP-SERVICE-SUBSCRIPTION : subscribes
    PROVISIONED-PSP ||--o{ PSP-AUDIT-TRAIL : generates
    
    SERVICE-CATALOG ||--o{ PSP-SERVICE-SUBSCRIPTION : used_by
    SERVICE-PROVIDER ||--o{ SERVICE-CATALOG : provides
    
    PAYMENT-PROVIDER ||--o{ BUY-RATE : has_rates
    PAYMENT-PROVIDER ||--o{ PAYOUT-ROUTE : provides_routes
    
    AUTH-USER ||--o{ AUDIT-LOG : creates
    AUTH-USER ||--|| PROVISIONED-PSP : owns
    
    PLATFORM-CONFIG {
        string platform_id PK
        string platform_lei
        string platform_vlei
        json configuration
        json compliance_settings
        json fee_structure
    }
    
    PROVISIONED-PSP {
        string psp_code PK
        string owner_email FK
        string status
        string schema_name
        string tier
        json enabled_components
        number monthly_revenue
        number transaction_count
    }
    
    SERVICE-CATALOG {
        string service_id PK
        string service_name
        string category
        string provider_id FK
        json pricing_model
        boolean is_active
    }
    
    PAYMENT-PROVIDER {
        string provider_id PK
        string provider_name
        string type
        string[] supported_currencies
        string[] supported_countries
        string status
    }
\`\`\`

### Authentication & Authorization

\`\`\`mermaid
sequenceDiagram
    participant Admin
    participant Portal as Control Panel
    participant Auth as AuthUser
    participant RBAC as Permission System
    participant Resource
    
    Admin->>Portal: Login (email/password)
    Portal->>Auth: Verify Credentials
    Auth-->>Portal: User Record + platform_role
    
    Portal->>RBAC: Check Permissions
    RBAC-->>Portal: Allowed Actions
    
    Admin->>Portal: Request Action (e.g., Create PSP)
    Portal->>RBAC: Verify Permission
    RBAC-->>Portal: Permission Granted
    
    Portal->>Resource: Execute Action
    Resource-->>Portal: Success
    
    Portal->>Auth: Log Audit Trail
    Portal-->>Admin: Action Complete
\`\`\`

**Platform Roles:**
- **super_admin:** Full platform access, can do anything
- **operations_manager:** PSP operations, service management, user support
- **finance_controller:** Financial data, billing, revenue tracking
- **compliance_officer:** Audit logs, compliance reports, regulatory
- **developer:** Read-only access to technical specs, APIs
- **support_agent:** User management, ticket resolution (read-only on sensitive data)

### Multi-Cloud Infrastructure

\`\`\`mermaid
graph TB
    A[FTS Control Panel] --> B[Cloud Orchestrator]
    
    B --> C[AWS Connector]
    B --> D[GCP Connector]
    B --> E[Azure Connector]
    B --> F[Alibaba Connector]
    B --> G[Oracle Connector]
    B --> H[DigitalOcean Connector]
    
    C --> I[EC2 Instances]
    C --> J[RDS Databases]
    C --> K[S3 Storage]
    
    D --> L[Compute Engine]
    D --> M[Cloud SQL]
    D --> N[Cloud Storage]
    
    E --> O[Virtual Machines]
    E --> P[SQL Database]
    E --> Q[Blob Storage]
    
    F --> R[ECS Instances]
    F --> S[RDS]
    
    G --> T[Compute VMs]
    G --> U[Autonomous DB]
\`\`\`

---

## Feature Breakdown

### 1. Dashboard (System Overview)

**Purpose:** Real-time visibility into platform health and performance

\`\`\`mermaid
graph LR
    A[Dashboard] --> B[KPI Cards]
    A --> C[PSP Overview]
    A --> D[System Health]
    A --> E[Revenue Summary]
    
    B --> B1[Total Volume]
    B --> B2[Platform Revenue]
    B --> B3[Active PSPs]
    B --> B4[Total Merchants]
    B --> B5[TPS Current]
    B --> B6[Cloud Resources]
    
    C --> C1[PSP Cards]
    C --> C2[Status Badges]
    C --> C3[Quick Actions]
    
    D --> D1[Service Health]
    D --> D2[API Latency]
    D --> D3[Database Load]
    D --> D4[Alert Count]
\`\`\`

**Key Performance Indicators:**

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Total Transaction Volume | $125M | - | ✅ |
| Platform Revenue (Monthly) | $2.3M | $2M | ✅ |
| Active PSPs | 243 | 250 | 🟡 |
| Total Merchants | 12,847 | 15K | 🟡 |
| Current TPS | 1,247 | <5K | ✅ |
| System Uptime | 99.98% | 99.95% | ✅ |
| API Latency (p95) | 87ms | <100ms | ✅ |
| Cloud Resource Usage | 73% | <80% | ✅ |

**PSP Instance Cards:**
\`\`\`javascript
{
  "psp_code": "ACMEPAY",
  "psp_name": "Acme Payments",
  "status": "active",
  "tier": "professional",
  "merchants": 45,
  "monthly_volume": 2847000,
  "monthly_revenue": 8541,
  "enabled_components": ["transactions", "smart_routing", "crypto"],
  "last_activity": "2025-12-26T10:34:22Z",
  "health_status": "healthy"
}
\`\`\`

**Quick Actions:**
- Create new PSP instance
- Add service to catalog
- Provision cloud resources
- View audit logs
- Generate platform report

**Real-Time Monitoring:**
- WebSocket updates for TPS, volume, alerts
- Live transaction feed (last 100 transactions)
- Health check status (all services)
- Active user sessions

### 2. PSP Provisioning & Lifecycle Management

**PSP Lifecycle States:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> Requested
    Requested --> UnderReview: Submit Application
    UnderReview --> ComplianceCheck: Initial Approval
    UnderReview --> Rejected: Compliance Fail
    
    ComplianceCheck --> Provisioning: Pass KYB/AML
    ComplianceCheck --> Rejected: Fail Checks
    
    Provisioning --> SchemaCreation
    SchemaCreation --> UserSetup
    UserSetup --> DomainConfig
    DomainConfig --> Testing
    
    Testing --> Active: Tests Pass
    Testing --> Provisioning: Tests Fail (Retry)
    
    Active --> Suspended: Payment Issue
    Active --> Suspended: Compliance Violation
    Active --> Terminated: Owner Request
    
    Suspended --> Active: Issue Resolved
    Suspended --> Terminated: Grace Period Expired
    
    Rejected --> [*]
    Terminated --> [*]
\`\`\`

**Provisioning Workflow (Detailed):**
\`\`\`mermaid
flowchart TD
    A[Start Provisioning] --> B{Validate Request}
    B -->|Invalid| C[Return Error]
    B -->|Valid| D[Allocate PSP Code]
    
    D --> E[Create ProvisionedPSP Record]
    E --> F[Run KYB/AML Screening]
    
    F --> G{Compliance Pass?}
    G -->|No| H[Flag for Review]
    G -->|Yes| I[Allocate Cloud Resources]
    
    I --> J[Provision Database Schema]
    J --> K[Create Tables & Indexes]
    K --> L[Set Row-Level Security]
    
    L --> M[Generate Admin Credentials]
    M --> N[Create PSP Staff User]
    
    N --> O[Setup Default Services]
    O --> P[Configure Branding]
    P --> Q[Setup Webhooks]
    
    Q --> R[Run Validation Tests]
    R --> S{Tests Pass?}
    
    S -->|No| T[Rollback & Report]
    S -->|Yes| U[Update Status: Active]
    
    U --> V[Send Welcome Email]
    V --> W[Log Audit Trail]
    W --> X[End]
\`\`\`

**Provisioning Configuration:**
\`\`\`javascript
POST /api/platform/provision-psp
{
  "psp_code": "NEWPSP",
  "psp_name": "New Payment Services",
  "owner_email": "owner@newpsp.com",
  "tier": "professional",
  "deployment_region": "us-east-1",
  "cloud_provider": "aws",
  "enabled_components": [
    "core_transactions",
    "merchant_management",
    "virtual_terminal",
    "smart_routing",
    "crypto_payments",
    "subscription_billing"
  ],
  "compliance": {
    "lei": "ABCDEF1234567890WXYZ",
    "kyb_provider": "thekyb",
    "aml_provider": "amlwatcher"
  },
  "branding": {
    "primary_color": "#3b82f6",
    "secondary_color": "#06b6d4",
    "logo_url": "https://cdn.newpsp.com/logo.png"
  },
  "initial_services": [
    "stripe_integration",
    "paypal_integration",
    "bank_transfer_us"
  ]
}
\`\`\`

**Schema Provisioning Details:**
\`\`\`sql
-- Create isolated schema
CREATE SCHEMA IF NOT EXISTS psp_newpsp;

-- Grant permissions
GRANT USAGE ON SCHEMA psp_newpsp TO psp_newpsp_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA psp_newpsp TO psp_newpsp_admin;

-- Enable Row Level Security
ALTER TABLE psp_newpsp.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY tenant_isolation ON psp_newpsp.transactions
  USING (psp_code = current_setting('app.current_psp_code'));

-- Create audit trigger
CREATE TRIGGER audit_log_trigger
  AFTER INSERT OR UPDATE OR DELETE ON psp_newpsp.transactions
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
\`\`\`

**Management Actions:**

| Action | Permission Required | Audit Logged | Reversible |
|--------|---------------------|--------------|------------|
| Create PSP | super_admin | Yes | Yes (within 24h) |
| Activate PSP | operations_manager | Yes | No |
| Suspend PSP | super_admin | Yes | Yes |
| Terminate PSP | super_admin | Yes | No (permanent) |
| Update Config | operations_manager | Yes | Yes |
| Reset Credentials | operations_manager | Yes | No |

### 3. Service Catalog Management

**Purpose:** Centralized registry of all payment services offered to PSPs

\`\`\`mermaid
graph TB
    A[Service Catalog] --> B[Payment Rails]
    A --> C[Compliance Services]
    A --> D[Payout Routes]
    A --> E[Value-Added]
    A --> F[Developer Tools]
    
    B --> B1[Card Networks]
    B --> B2[Bank Transfers]
    B --> B3[Digital Wallets]
    B --> B4[BNPL]
    B --> B5[Crypto]
    
    C --> C1[KYB]
    C --> C2[AML]
    C --> C3[Fraud Detection]
    C --> C4[3D Secure]
    
    D --> D1[Bank Payout]
    D --> D2[Instant Payout]
    D --> D3[Card Disburse]
    D --> D4[Crypto Payout]
\`\`\`

**Service Attributes:**
\`\`\`javascript
{
  "service_id": "stripe_connect",
  "service_name": "Stripe Connect",
  "category": "payment_rail",
  "sub_category": "card_network",
  "provider_id": "stripe_inc",
  "description": "Accept card payments globally with Stripe",
  "features": [
    "Visa, Mastercard, Amex support",
    "3D Secure 2.0",
    "Recurring billing",
    "Multi-currency"
  ],
  "pricing_model": {
    "type": "per_transaction",
    "base_fee": 0.029,
    "fixed_fee": 0.30,
    "currency": "USD"
  },
  "platform_commission": 0.15,
  "supported_regions": ["US", "EU", "UK", "CA", "AU"],
  "supported_currencies": ["USD", "EUR", "GBP", "CAD", "AUD"],
  "api_specification": "https://stripe.com/docs/api",
  "webhook_support": true,
  "trial_available": true,
  "trial_duration_days": 30,
  "setup_time_minutes": 15,
  "requires_credentials": ["api_key", "webhook_secret"],
  "status": "active",
  "subscribers_count": 847,
  "rating": 4.8,
  "is_featured": true
}
\`\`\`

**Service Management Actions:**
- Add new service to catalog
- Update service pricing/features
- Enable/disable service globally
- Feature service in marketplace
- View subscription analytics
- Manage service provider relationships

**Service Provider Onboarding:**
\`\`\```mermaid
sequenceDiagram
    participant Provider
    participant Platform as FTS Platform
    participant Review as Review Team
    participant Catalog
    
    Provider->>Platform: Apply as Provider
    Platform->>Platform: Verify Company (KYB)
    Platform->>Review: Submit Application
    
    Review->>Review: Technical Review
    Review->>Review: Business Review
    Review->>Review: Compliance Review
    
    Review-->>Platform: Approval Decision
    
    alt Approved
        Platform->>Catalog: Create Provider Record
        Platform->>Provider: Approval + Credentials
        Provider->>Catalog: Submit Service
        Catalog->>Review: Service Review
        Review-->>Catalog: Approve Service
        Catalog->>Platform: Service Live
    else Rejected
        Platform->>Provider: Rejection + Reason
    end
\`\`\`

### 4. Payment Provider Pool

**Purpose:** Manage direct integrations with payment processors, acquirers, banks

**Provider Categories:**
1. **Card Schemes** (Visa, Mastercard, Amex, Discover)
2. **Acquirers** (Chase Paymentech, First Data, Worldpay)
3. **Gateways** (Stripe, Adyen, Braintree, Authorize.net)
4. **Banks** (Wells Fargo, HSBC, Deutsche Bank)
5. **Alternative Payment Methods** (PayPal, Apple Pay, Google Pay, Alipay)
6. **Crypto Exchanges** (Coinbase, Kraken, Binance)

**Provider Management:**
\`\`\`mermaid
classDiagram
    class PaymentProvider {
        +string provider_id
        +string name
        +string type
        +string[] supported_networks
        +string[] supported_currencies
        +string[] supported_countries
        +number base_fee_percentage
        +number fixed_fee
        +number success_rate
        +number avg_response_time_ms
        +string status
        +activateProvider()
        +suspendProvider()
        +updateRates()
    }
    
    class BuyRate {
        +string provider_id
        +string transaction_type
        +string card_type
        +string region
        +number percentage_rate
        +number fixed_fee
        +date effective_from
        +updateRate()
    }
    
    class PayoutRoute {
        +string route_id
        +string provider_id
        +string method
        +string[] countries
        +number fee_percentage
        +number fixed_fee
        +string settlement_time
        +enableRoute()
        +disableRoute()
    }
    
    PaymentProvider "1" --> "*" BuyRate : has
    PaymentProvider "1" --> "*" PayoutRoute : provides
\`\`\`

**Buy Rate Management:**

| Provider | Transaction Type | Card Type | Region | % Rate | Fixed Fee | Effective Date |
|----------|-----------------|-----------|--------|--------|-----------|----------------|
| Stripe | card_not_present | all | domestic | 2.9% | $0.30 | 2025-01-01 |
| Stripe | card_not_present | all | international | 3.9% | $0.30 | 2025-01-01 |
| Adyen | card_present | debit | domestic | 1.5% | $0.10 | 2025-01-01 |
| PayPal | e_wallet | n/a | all | 3.5% | $0.00 | 2025-01-01 |

**Provider Health Monitoring:**
\`\`\`javascript
{
  "provider_id": "stripe_connect",
  "health_status": "healthy",
  "metrics": {
    "success_rate": 98.7,
    "avg_latency_ms": 245,
    "error_rate": 0.013,
    "uptime_percentage": 99.99,
    "daily_volume": 12500000,
    "daily_transactions": 45230
  },
  "alerts": [],
  "last_check": "2025-12-26T10:45:00Z"
}
\`\`\`

### 5. User Management (All Portals)

**Purpose:** Centralized user administration across Community, PSP, Merchant portals

\`\`\`mermaid
graph TB
    A[Platform User Management] --> B[Community Users]
    A --> C[PSP Staff Users]
    A --> D[Merchant Users]
    A --> E[Platform Admins]
    
    B --> B1[AuthUser Table]
    B --> B2[community_role]
    
    C --> C1[psp_staff_users]
    C --> C2[Schema Isolated]
    
    D --> D1[MerchantUser Table]
    D --> D2[psp_code Filtered]
    
    E --> E1[AuthUser Table]
    E --> E2[platform_role]
\`\`\`

**User Lifecycle:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> Invited
    Invited --> PendingVerification: Click Email Link
    PendingVerification --> Active: Set Password
    
    Active --> Suspended: Policy Violation
    Active --> Locked: Too Many Failed Logins
    Active --> Inactive: No Activity 90 Days
    
    Suspended --> Active: Review Complete
    Locked --> Active: Admin Unlock
    Inactive --> Active: User Re-activates
    
    Active --> Deleted: User Requests Delete
    Suspended --> Deleted: Termination
    Deleted --> [*]
\`\`\`

**Bulk Operations:**
- Import users (CSV upload)
- Export users (CSV download)
- Bulk invite (multiple emails)
- Bulk role assignment
- Bulk suspension/activation

**Security Features:**
- Password complexity requirements
- Multi-factor authentication (2FA)
- Session timeout (configurable)
- IP whitelist/blacklist
- Login attempt monitoring
- Suspicious activity alerts

### 6. Financial Intelligence & Revenue Tracking

**Purpose:** Comprehensive visibility into all revenue streams and costs

\`\`\```mermaid
graph LR
    A[Revenue Streams] --> B[PSP Licensing]
    A --> C[Transaction Fees]
    A --> D[Service Commissions]
    A --> E[ISO Gateway]
    A --> F[Orchestration]
    
    B --> G[Starter Tier]
    B --> H[Professional Tier]
    B --> I[Enterprise Tier]
    
    C --> J[Per-Transaction Fee]
    C --> K[Revenue Share]
    
    D --> L[Marketplace Commission]
    D --> M[Provider Fees]
\`\`\`

**Revenue Dashboard Metrics:**

| Metric | This Month | Last Month | YoY Growth |
|--------|-----------|------------|------------|
| Total Revenue | $2,347,829 | $2,198,443 | +34% |
| PSP Licensing | $487,200 | $476,800 | +28% |
| Transaction Fees | $1,247,839 | $1,178,293 | +31% |
| Service Commissions | $423,890 | $387,450 | +42% |
| ISO Gateway | $98,900 | $82,300 | +67% |
| Orchestration | $90,000 | $73,600 | +55% |

**Cost Tracking:**
- Cloud infrastructure costs (AWS, GCP, Azure)
- Payment provider costs (buy rates)
- Compliance service costs (KYB, AML)
- Support & operations costs
- Development & maintenance costs

**Profit Margin Analysis:**
\`\`\`javascript
{
  "psp_instance": "ACMEPAY",
  "monthly_metrics": {
    "gross_revenue": 8541.20,
    "costs": {
      "infrastructure": 234.50,
      "payment_processing": 5247.80,
      "services": 450.00,
      "support": 120.00
    },
    "total_costs": 6052.30,
    "net_profit": 2488.90,
    "profit_margin": 29.14
  }
}
\`\`\`

### 7. Compliance & Audit Management

**Purpose:** Ensure platform-wide compliance with regulations and standards

\`\`\`mermaid
mindmap
  root((Compliance))
    PCI DSS
      Level 1 Certified
      Quarterly Scans
      Annual Audits
      AOC Reports
    GDPR
      Data Mapping
      Privacy Policies
      Right to Delete
      Breach Reporting
    LEI vLEI
      Platform LEI
      PSP vLEI Issuance
      Credential Chains
      GLEIF Integration
    KYB AML
      Merchant Screening
      PSP Screening
      Sanctions Lists
      PEP Checks
    Regional
      FinCEN BSA
      MiFID II
      PSD2
      Local Licenses
\`\`\`

**Audit Log System:**
\`\`\`javascript
{
  "audit_id": "aud_abc123",
  "timestamp": "2025-12-26T10:45:23.847Z",
  "actor": {
    "email": "admin@fts.money",
    "role": "super_admin",
    "ip_address": "203.0.113.42"
  },
  "action": "psp.create",
  "resource": {
    "type": "ProvisionedPSP",
    "id": "NEWPSP",
    "name": "New Payment Services"
  },
  "changes": {
    "before": null,
    "after": { "status": "provisioning", "tier": "professional" }
  },
  "result": "success",
  "metadata": {
    "request_id": "req_xyz789",
    "session_id": "sess_abc456"
  }
}
\`\`\`

**Compliance Reports:**
- PCI DSS AOC (quarterly)
- GDPR compliance summary (monthly)
- LEI/vLEI status report (monthly)
- Transaction anomaly report (weekly)
- Failed compliance checks (daily)

**Automated Compliance Checks:**
- Daily sanctions list updates
- Real-time AML screening
- Automated LEI validation
- PCI DSS vulnerability scans
- GDPR data retention enforcement

### 8. System Health & Monitoring

**Purpose:** Real-time monitoring of platform infrastructure and services

\`\`\`mermaid
graph TB
    A[Monitoring Dashboard] --> B[Service Health]
    A --> C[Infrastructure]
    A --> D[Database]
    A --> E[API Performance]
    
    B --> B1[Payment Gateway Status]
    B --> B2[ISO Gateway Uptime]
    B --> B3[Orchestration Health]
    
    C --> C1[CPU Usage]
    C --> C2[Memory Usage]
    C --> C3[Disk I/O]
    C --> C4[Network Bandwidth]
    
    D --> D1[Query Performance]
    D --> D2[Connection Pool]
    D --> D3[Replication Lag]
    D --> D4[Storage Usage]
    
    E --> E1[Response Times]
    E --> E2[Error Rates]
    E --> E3[Request Volume]
    E --> E4[Rate Limits]
\`\`\`

**Health Check Matrix:**

| Component | Status | Uptime | Latency | Last Check |
|-----------|--------|--------|---------|------------|
| API Gateway | 🟢 Healthy | 99.98% | 45ms | 30s ago |
| Database Cluster | 🟢 Healthy | 99.99% | 12ms | 30s ago |
| ISO Gateway | 🟢 Healthy | 99.97% | 67ms | 1m ago |
| Orchestration | 🟡 Degraded | 99.85% | 234ms | 1m ago |
| Stripe Integration | 🟢 Healthy | 99.99% | 187ms | 2m ago |
| Payment Networks | 🟢 Healthy | 99.96% | 342ms | 2m ago |

**Alert System:**
\`\`\`mermaid
sequenceDiagram
    participant Monitor as Health Monitor
    participant Alert as Alert System
    participant PagerDuty
    participant Slack
    participant Email
    participant Admin
    
    Monitor->>Monitor: Check Service Health
    Monitor->>Monitor: Detect Anomaly
    
    alt Critical Alert
        Monitor->>Alert: Trigger Critical Alert
        Alert->>PagerDuty: Page On-Call Engineer
        Alert->>Slack: Post to #incidents
        Alert->>Email: Send to Admins
    else Warning
        Monitor->>Alert: Trigger Warning
        Alert->>Slack: Post to #monitoring
        Alert->>Email: Send Daily Digest
    else Info
        Monitor->>Alert: Log Event
        Alert->>Alert: Store for Analytics
    end
    
    Admin->>Alert: Acknowledge Alert
    Alert->>Monitor: Update Status
\`\`\`

**Performance Metrics:**
- **Throughput:** Current TPS, peak TPS, average TPS
- **Latency:** p50, p95, p99 response times
- **Error Rate:** 4xx errors, 5xx errors, timeout rate
- **Availability:** Uptime %, downtime events, MTTR

### 9. API Management & Developer Tools

**Purpose:** Manage platform APIs, keys, rate limits, documentation

**API Catalog:**
\`\`\`mermaid
graph LR
    A[Platform APIs] --> B[Public APIs]
    A --> C[Partner APIs]
    A --> D[Internal APIs]
    
    B --> B1[Payment Processing]
    B --> B2[Merchant Onboarding]
    B --> B3[Transaction Query]
    
    C --> C1[PSP Management]
    C --> C2[Service Integration]
    C --> C3[Reporting]
    
    D --> D1[Infrastructure]
    D --> D2[Admin Operations]
    D --> D3[Monitoring]
\`\`\`

**API Key Management:**
\`\`\`javascript
{
  "api_key_id": "key_abc123",
  "key_prefix": "pk_live_",
  "created_by": "admin@fts.money",
  "created_at": "2025-12-01T00:00:00Z",
  "name": "Production API Key - ACMEPAY",
  "permissions": [
    "transactions:read",
    "transactions:create",
    "merchants:read",
    "settlements:read"
  ],
  "rate_limits": {
    "requests_per_second": 100,
    "requests_per_hour": 10000,
    "requests_per_day": 100000
  },
  "ip_whitelist": ["203.0.113.0/24"],
  "expires_at": "2026-12-01T00:00:00Z",
  "last_used": "2025-12-26T10:30:00Z",
  "status": "active"
}
\`\`\`

**Rate Limiting:**
- Per API key limits
- Per IP address limits
- Global platform limits
- Burst allowance
- Backoff policies

**API Analytics:**
- Requests per endpoint
- Response time distribution
- Error rate by endpoint
- Top consumers
- Geographic distribution

### 10. Cloud Resource Orchestration

**Purpose:** Manage multi-cloud infrastructure for PSP instances

\`\`\`mermaid
graph TB
    A[Cloud Orchestrator] --> B[AWS]
    A --> C[GCP]
    A --> D[Azure]
    A --> E[Alibaba]
    A --> F[Oracle]
    
    B --> B1[EC2 Instances]
    B --> B2[RDS Databases]
    B --> B3[S3 Storage]
    B --> B4[CloudFront CDN]
    
    C --> C1[Compute Engine]
    C --> C2[Cloud SQL]
    C --> C3[Cloud Storage]
    C --> C4[Cloud CDN]
    
    D --> D1[Virtual Machines]
    D --> D2[SQL Database]
    D --> D3[Blob Storage]
    D --> D4[Azure CDN]
\`\`\`

**Resource Allocation:**
\`\`\`javascript
{
  "psp_code": "ACMEPAY",
  "cloud_resources": {
    "provider": "aws",
    "region": "us-east-1",
    "compute": {
      "instance_type": "t3.large",
      "vcpus": 2,
      "memory_gb": 8,
      "monthly_cost": 73.00
    },
    "database": {
      "instance_type": "db.t3.medium",
      "storage_gb": 100,
      "backups": "automated",
      "monthly_cost": 145.00
    },
    "storage": {
      "type": "s3_standard",
      "size_gb": 500,
      "monthly_cost": 11.50
    },
    "bandwidth": {
      "monthly_gb": 2000,
      "monthly_cost": 180.00
    },
    "total_monthly_cost": 409.50
  }
}
\`\`\`

**Auto-Scaling Configuration:**
- CPU threshold triggers
- Memory threshold triggers
- Request volume triggers
- Scheduled scaling (business hours)
- Cool-down periods

**Disaster Recovery:**
- Automated daily backups
- Point-in-time recovery (7 days)
- Cross-region replication
- Failover automation
- RTO: 1 hour, RPO: 15 minutes

---

## Technical Specifications

### Frontend Architecture

**Stack:**
- React 18.2 + Vite
- Tailwind CSS + shadcn/ui
- React Query (TanStack)
- React Router v6
- Recharts + D3.js
- Framer Motion

**State Management:**
\`\`\`javascript
// Global state with React Query
const { data: psps } = useQuery({
  queryKey: ['provisioned-psps'],
  queryFn: () => base44.entities.ProvisionedPSP.list('-created_date'),
  refetchInterval: 30000 // Refresh every 30s
});

// Local state with useState
const [filters, setFilters] = useState({
  status: 'all',
  tier: 'all',
  search: ''
});
\`\`\`

**Component Architecture:**
\`\`\`
components/
├── platform/
│   ├── FTSPlatformSidebarRestructured.js
│   ├── PSPManagementTable.js
│   ├── ServiceCatalogManager.js
│   ├── RevenueAnalytics.js
│   └── SystemHealthDashboard.js
├── auth/
│   ├── usePlatformAuth.js
│   ├── PermissionGate.js
│   └── RoleSelector.js
└── system/
    ├── UnifiedCommandPalette.js
    ├── StatusConfig.js
    └── LoadingState.js
\`\`\`

### Backend API Specifications

**Authentication Endpoint:**
\`\`\`javascript
POST /functions/platformAuth
{
  "action": "login",
  "email": "admin@fts.money",
  "password": "***"
}

// Response
{
  "success": true,
  "user": {
    "email": "admin@fts.money",
    "full_name": "John Admin",
    "platform_role": "super_admin",
    "permissions": ["*"]
  }
}
\`\`\`

**PSP Provisioning Endpoint:**
\`\`\`javascript
POST /api/platform/provision-psp
Authorization: Bearer {token}

{
  "psp_code": "NEWPSP",
  "psp_name": "New PSP",
  "owner_email": "owner@newpsp.com",
  "tier": "professional",
  // ... configuration
}

// Response
{
  "success": true,
  "psp_id": "NEWPSP",
  "status": "provisioning",
  "estimated_completion": "2025-12-27T10:00:00Z"
}
\`\`\`

**Query Endpoints:**
\`\`\`javascript
// List all PSPs
GET /entities/ProvisionedPSP
Filter: { is_template: false }
Sort: -created_date

// Get PSP details
GET /entities/ProvisionedPSP/{psp_code}

// Get platform metrics
GET /api/platform/metrics
Response: {
  "total_volume": 125000000,
  "total_revenue": 2347829,
  "active_psps": 243,
  "total_merchants": 12847
}

// Get system health
GET /api/platform/health
Response: {
  "status": "healthy",
  "services": [...],
  "infrastructure": {...}
}
\`\`\`

### Database Schema

**Key Tables:**
\`\`\`sql
-- Platform configuration
CREATE TABLE platform_config (
  platform_id VARCHAR PRIMARY KEY,
  platform_lei VARCHAR(20),
  platform_vlei TEXT,
  configuration JSONB,
  created_date TIMESTAMP DEFAULT NOW()
);

-- Provisioned PSPs
CREATE TABLE provisioned_psp (
  psp_code VARCHAR PRIMARY KEY,
  psp_name VARCHAR NOT NULL,
  owner_email VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'provisioning',
  tier VARCHAR,
  schema_name VARCHAR,
  enabled_components JSONB,
  branding JSONB,
  monthly_revenue DECIMAL,
  created_date TIMESTAMP DEFAULT NOW()
);

-- Service catalog
CREATE TABLE service_catalog (
  service_id VARCHAR PRIMARY KEY,
  service_name VARCHAR NOT NULL,
  category VARCHAR,
  provider_id VARCHAR,
  pricing_model JSONB,
  status VARCHAR DEFAULT 'active',
  created_date TIMESTAMP DEFAULT NOW()
);

-- Audit logs (immutable)
CREATE TABLE audit_log (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),
  actor_email VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  resource_type VARCHAR,
  resource_id VARCHAR,
  changes JSONB,
  result VARCHAR
) WITH (fillfactor = 100);

CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_actor ON audit_log(actor_email);
\`\`\`

### Security Architecture

**Multi-Layer Security:**
\`\`\`mermaid
graph TB
    A[External Request] --> B[WAF]
    B --> C[DDoS Protection]
    C --> D[Rate Limiter]
    D --> E[Load Balancer]
    
    E --> F[API Gateway]
    F --> G[Auth Middleware]
    G --> H[RBAC Check]
    H --> I[Audit Logger]
    
    I --> J{Permission Check}
    J -->|Granted| K[Execute Action]
    J -->|Denied| L[Return 403]
    
    K --> M[Database]
    M --> N[RLS Policy]
    N --> O[Return Data]
\`\`\`

**Role-Based Access Control:**
\`\`\`javascript
const PLATFORM_PERMISSIONS = {
  super_admin: ['*'], // All permissions
  
  operations_manager: [
    'psp:read',
    'psp:create',
    'psp:update',
    'psp:suspend',
    'user:read',
    'user:create',
    'user:update',
    'service:read',
    'service:update'
  ],
  
  finance_controller: [
    'psp:read',
    'revenue:read',
    'billing:read',
    'billing:update',
    'reports:read',
    'reports:create'
  ],
  
  compliance_officer: [
    'psp:read',
    'audit:read',
    'compliance:read',
    'compliance:update',
    'reports:read'
  ]
};
\`\`\`

**Audit Requirements:**
- Every action logged with actor, timestamp, result
- Immutable audit trail (no deletions)
- Cryptographic signatures on critical actions
- Retention: 7 years (regulatory requirement)

---

## User Workflows

### Workflow 1: Provision New PSP Instance

\`\`\`mermaid
journey
    title PSP Provisioning Journey
    section Receive Request
      Review Application: 3: Admin
      Verify Compliance: 4: Admin, System
      Allocate Resources: 4: System
    section Provision Infrastructure
      Create Schema: 5: System
      Configure Services: 4: Admin
      Setup Branding: 4: Admin
    section Testing & Validation
      Run Tests: 5: System
      Review Results: 4: Admin
      Approve Go-Live: 5: Admin
    section Activation
      Activate PSP: 5: System
      Notify Owner: 5: System
      Monitor Health: 5: Admin
\`\`\`

**Detailed Steps:**
1. Platform admin receives PSP provisioning request
2. Review application details (company info, LEI, etc.)
3. Run KYB/AML screening (automated)
4. Approve or reject application
5. If approved:
   - Allocate PSP code
   - Select cloud provider & region
   - Provision database schema
   - Create tables with RLS policies
   - Generate admin credentials
   - Configure default services
   - Setup branding assets
6. Run validation tests
7. Review test results
8. Activate PSP (change status to 'active')
9. Send welcome email to PSP owner
10. Monitor health for first 48 hours

**Time Required:** 4-6 hours (automated) or 1-2 business days (with manual review)

### Workflow 2: Add Service to Marketplace

**Steps:**
1. Navigate to Service Catalog Management
2. Click "Add New Service"
3. Enter service details:
   - Name, description, category
   - Service provider (existing or new)
   - Features & capabilities
   - Documentation links
4. Configure pricing model:
   - Subscription tiers
   - Per-transaction fees
   - Platform commission rate
5. Set technical requirements:
   - API endpoints
   - Webhook configuration
   - Required credentials
   - Setup instructions
6. Upload assets:
   - Service logo
   - Screenshots
   - Marketing materials
7. Set availability:
   - Supported regions
   - Supported currencies
   - Eligibility criteria
8. Review & submit
9. Service goes live in marketplace
10. Monitor adoption & performance

**Time Required:** 30-60 minutes

### Workflow 3: Investigate Compliance Alert

**Scenario:** AML screening flags a merchant for review

\`\`\`mermaid
sequenceDiagram
    participant System
    participant Admin
    participant Compliance
    participant PSP
    participant Merchant
    
    System->>Admin: Alert: AML Flag
    Admin->>Compliance: Review Case
    Compliance->>Compliance: Check Sanctions Lists
    Compliance->>Compliance: Review Transaction Patterns
    
    alt High Risk
        Compliance->>Admin: Recommend Suspension
        Admin->>PSP: Suspend Merchant
        PSP->>Merchant: Notification
        Admin->>System: Log Decision
    else Medium Risk
        Compliance->>PSP: Request Documents
        PSP->>Merchant: Document Request
        Merchant->>PSP: Submit Documents
        PSP->>Compliance: Forward Documents
        Compliance->>Admin: Clear or Escalate
    else False Positive
        Compliance->>Admin: Clear Alert
        Admin->>System: Close Case
    end
\`\`\`

**Resolution Time:** 24-72 hours depending on risk level

---

## Best Practices

### For Platform Administrators

**Provisioning:**
- Always run KYB/AML before approving PSPs
- Verify LEI within 6-month grace period
- Use staging environment for testing new features
- Document all manual configuration changes

**Monitoring:**
- Review system health dashboard daily
- Set up alerts for critical metrics
- Monitor resource usage trends
- Investigate anomalies immediately

**Security:**
- Rotate admin credentials quarterly
- Enable 2FA for all admin accounts
- Review audit logs weekly
- Conduct security reviews monthly

**Compliance:**
- Run PCI DSS scans quarterly
- Update compliance documentation
- Archive audit logs per retention policy
- Respond to data subject requests within 30 days

### For Operations Managers

**PSP Support:**
- Respond to PSP owner requests within 24 hours
- Escalate technical issues to engineering
- Document recurring issues for product team
- Provide proactive guidance on features

**Service Management:**
- Monitor service health proactively
- Coordinate with service providers on issues
- Update service catalog regularly
- Gather feedback from PSPs

**User Management:**
- Verify user identities before granting access
- Use principle of least privilege
- Conduct quarterly access reviews
- Deactivate inactive accounts

---

## Troubleshooting

### Common Issues

**Issue:** PSP provisioning fails at schema creation  
**Cause:** Insufficient database permissions or schema already exists  
**Solution:**
\`\`\`sql
-- Check if schema exists
SELECT schema_name FROM information_schema.schemata 
WHERE schema_name = 'psp_code';

-- If exists, drop and recreate
DROP SCHEMA IF EXISTS psp_code CASCADE;

-- Re-run provisioning
\`\`\`

**Issue:** Service subscription shows as "pending" indefinitely  
**Cause:** Payment method verification failed or webhook not received  
**Solution:**
- Check payment method on file
- Verify webhook endpoint is accessible
- Manually trigger webhook retry
- Contact service provider if issue persists

**Issue:** High API error rate (5xx errors)  
**Cause:** Database connection pool exhausted or service degradation  
**Solution:**
1. Check database connection pool metrics
2. Scale up database instance if needed
3. Review slow queries and optimize
4. Enable read replicas for heavy read workloads

**Issue:** Revenue numbers not matching across reports  
**Cause:** Time zone differences or delayed transaction sync  
**Solution:**
- Ensure all reports use same timezone (UTC)
- Check transaction sync status
- Run reconciliation report
- Verify data pipeline health

### Emergency Procedures

**Data Breach Response:**
1. Isolate affected systems immediately
2. Notify security team and compliance officer
3. Preserve evidence (logs, audit trails)
4. Assess scope of breach
5. Notify affected parties within 72 hours (GDPR)
6. File reports with regulators
7. Conduct post-incident review

**System Outage Response:**
1. Check health dashboard for component status
2. Review recent deployments (rollback if needed)
3. Check cloud provider status pages
4. Scale resources if capacity issue
5. Communicate status to affected PSPs
6. Document incident timeline
7. Conduct post-mortem analysis

---

## Performance Optimization

### Database Optimization

**Query Performance:**
\`\`\`sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_psp_owner 
  ON provisioned_psp(owner_email) 
  WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_service_category 
  ON service_catalog(category, status);

-- Partition large tables
CREATE TABLE audit_log_2025_12 PARTITION OF audit_log
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Use materialized views for analytics
CREATE MATERIALIZED VIEW platform_metrics AS
SELECT 
  COUNT(*) as total_psps,
  SUM(monthly_revenue) as total_revenue,
  AVG(transaction_count) as avg_transactions
FROM provisioned_psp
WHERE status = 'active';

REFRESH MATERIALIZED VIEW CONCURRENTLY platform_metrics;
\`\`\`

**Connection Pooling:**
\`\`\```javascript
// Configure connection pool
const pool = {
  min: 10,
  max: 100,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
};
\`\`\`

### API Performance

**Caching Strategy:**
\`\`\`javascript
// Cache service catalog (1 hour TTL)
const services = await cache.get('service_catalog', async () => {
  return await base44.entities.ServiceCatalog.list();
}, { ttl: 3600 });

// Cache PSP list (5 minutes TTL)
const psps = await cache.get('psp_list', async () => {
  return await base44.entities.ProvisionedPSP.list();
}, { ttl: 300 });
\`\`\`

**Rate Limiting:**
\`\`\`javascript
// Per-user rate limit
const rateLimiter = {
  windowMs: 60000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later'
};
\`\`\`

### Frontend Optimization

**Code Splitting:**
\`\`\`javascript
// Lazy load heavy components
const PSPManagement = lazy(() => import('./components/PSPManagement'));
const RevenueAnalytics = lazy(() => import('./components/RevenueAnalytics'));

<Suspense fallback={<LoadingState />}>
  <PSPManagement />
</Suspense>
\`\`\`

**Data Prefetching:**
\`\`\```javascript
// Prefetch commonly accessed data
useEffect(() => {
  queryClient.prefetchQuery({
    queryKey: ['service-catalog'],
    queryFn: () => base44.entities.ServiceCatalog.list()
  });
}, []);
\`\`\`

---

## Roadmap

### Q1 2026
- [ ] AI-powered anomaly detection
- [ ] Predictive scaling recommendations
- [ ] Advanced RBAC (custom roles)
- [ ] Multi-language support

### Q2 2026
- [ ] Real-time collaboration features
- [ ] Advanced workflow automation
- [ ] Mobile admin app (iOS/Android)
- [ ] GraphQL API (in addition to REST)

### Q3 2026
- [ ] Machine learning fraud detection
- [ ] Automated compliance reporting
- [ ] Advanced analytics (predictive insights)
- [ ] White-label control panel option

### Q4 2026
- [ ] Blockchain integration dashboard
- [ ] CBDC support & monitoring
- [ ] Quantum-safe encryption
- [ ] Global expansion tools (Asia-Pacific focus)

---

## Appendix

### API Reference

**Complete endpoint list:** https://docs.fts.money/api/platform

### Database Schema

**Complete schema documentation:** https://docs.fts.money/database

### Compliance Certifications

- PCI DSS Level 1 (expires 2026-06-30)
- SOC 2 Type II (annual audit)
- ISO 27001 (certified 2024-12-01)
- GDPR compliant (2025-12-26 review)

### Support Contacts

**Technical Support:** tech-support@fts.money  
**Platform Operations:** ops@fts.money  
**Security Incidents:** security@fts.money  
**Compliance:** compliance@fts.money

### Change Log

- **v1.0 (2025-12-26):** Initial comprehensive documentation release
- Future updates will be tracked here

---

**Document Version:** 1.0  
**Last Updated:** December 26, 2025  
**Next Review:** March 2026  
**Owner:** FTS.Money Platform Team
`;

export default FTSControlPanelDoc;