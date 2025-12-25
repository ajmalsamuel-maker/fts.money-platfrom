export const FTSControlPanelDoc = `
# FTS Control Panel Documentation
## Platform Administration & Governance

**Version:** 1.0  
**Last Updated:** December 2025  
**Audience:** Platform Administrators, Operations Team, Super Admins

---

## Executive Summary

### Purpose
The **FTS Control Panel** is the nerve center of the entire FTS.Money platform. It provides centralized governance, monitoring, and management capabilities for all provisioned PSPs, services, customers, and infrastructure resources.

### Key Responsibilities
- **PSP Lifecycle Management:** Provision, configure, monitor, suspend PSPs
- **Resource Orchestration:** Allocate cloud resources across providers
- **Financial Operations:** Revenue tracking, billing, reconciliation
- **Compliance Oversight:** LEI/vLEI verification, audit logs, security
- **Service Catalog:** Manage marketplace offerings and providers
- **Customer Support:** Handle escalations, provisioning issues

### Access Control
\`\`\`mermaid
graph TB
    A[Platform Roles] --> B[Super Admin]
    A --> C[Platform Admin]
    A --> D[Operations]
    A --> E[Finance Manager]
    A --> F[Support]
    A --> G[Viewer]
    
    B --> B1[Full System Access]
    B --> B2[Delete PSPs]
    B --> B3[Modify Pricing]
    
    C --> C1[Provision PSPs]
    C --> C2[Manage Services]
    C --> C3[View Revenue]
    
    D --> D1[Monitor Operations]
    D --> D2[Configure Resources]
    
    E --> E1[Manage Pricing]
    E --> E2[Reconcile Finances]
    E --> E3[Generate Reports]
    
    F --> F1[View Data]
    F --> F2[Support Tickets]
    
    G --> G1[Read-Only Access]
\`\`\`

---

## Architecture

### Platform Control Layer

\`\`\`mermaid
C4Container
    title FTS Control Panel - Container Diagram
    
    Container(portal, "Admin Portal", "React", "Web interface")
    Container(api, "Platform API", "Deno", "Backend functions")
    Container(db, "Master Database", "PostgreSQL", "Shared entities")
    
    ContainerDb(pspSchemas, "PSP Schemas", "PostgreSQL", "Isolated per PSP")
    
    Container(provisioner, "Provisioning Engine", "Deno", "Auto-deploy PSPs")
    Container(billing, "Billing Engine", "Deno", "Revenue calculation")
    Container(compliance, "Compliance Monitor", "Deno", "LEI/KYB/AML")
    
    Rel(portal, api, "API calls", "HTTPS")
    Rel(api, db, "Query entities", "SQL")
    Rel(api, pspSchemas, "Access PSP data", "SQL")
    Rel(provisioner, pspSchemas, "Create schemas", "DDL")
    Rel(billing, db, "Calculate revenue", "SQL")
    Rel(compliance, db, "Verify credentials", "API")
\`\`\`

### Multi-Level Governance

**Hierarchy:**
\`\`\`
FTS Platform (Super Admin)
    ├── Global Configuration
    │   ├── Platform Settings
    │   ├── Master Pricing
    │   └── Compliance Rules
    │
    ├── Customer Management
    │   ├── PSP Instances (1000s)
    │   ├── Community Users (10,000s)
    │   ├── ISO Gateway Customers (100s)
    │   └── Orchestration Customers (100s)
    │
    ├── Service Ecosystem
    │   ├── Service Catalog (150+ services)
    │   ├── Payment Providers (60+)
    │   ├── Payout Routes (40+)
    │   └── Compliance Tools (20+)
    │
    ├── Financial Operations
    │   ├── Revenue Tracking
    │   ├── Billing Management
    │   ├── Xero Integration
    │   └── Cost Analytics
    │
    └── Infrastructure
        ├── Cloud Resources (Multi-cloud)
        ├── Database Management
        ├── API Gateway
        └── Monitoring & Alerts
\`\`\`

### Database Schema Design

\`\`\`mermaid
erDiagram
    PLATFORM-CONFIG ||--o{ PROVISIONED-PSP : governs
    PROVISIONED-PSP ||--o{ PSP-SERVICE-SUBSCRIPTION : has
    SERVICE-CATALOG ||--o{ PSP-SERVICE-SUBSCRIPTION : used_in
    SERVICE-PROVIDER ||--o{ SERVICE-CATALOG : offers
    
    PROVISIONED-PSP ||--o{ ISO-GATEWAY-CUSTOMER : may_use
    PROVISIONED-PSP ||--o{ ORCHESTRATION-CUSTOMER : may_use
    
    MASTER-PRICING ||--o{ SERVICE-CATALOG : prices
    CLOUD-CONNECTOR ||--o{ RESOURCE-ALLOCATION : provides
    RESOURCE-ALLOCATION ||--o{ PROVISIONED-PSP : allocated_to
    
    PLATFORM-CONFIG {
        string platform_id PK
        json global_settings
        json compliance_rules
        json rate_limits
    }
    
    PROVISIONED-PSP {
        string psp_code PK
        string owner_email FK
        string status
        string tier
        number total_merchants
        number monthly_volume
    }
    
    SERVICE-CATALOG {
        string service_id PK
        string provider_id FK
        string category
        string pricing_model
        number total_subscribers
    }
\`\`\`

---

## Core Features

### 1. PSP Operations Dashboard

**Purpose:** Monitor all provisioned PSP instances

\`\`\`mermaid
graph TB
    A[PSP Operations] --> B[View All PSPs]
    A --> C[Provisioning Queue]
    A --> D[Performance Metrics]
    
    B --> E[Filter by Status]
    B --> F[Search by Code]
    B --> G[Sort by Volume]
    
    C --> H[Pending Deployments]
    C --> I[In Progress]
    C --> J[Completed]
    C --> K[Failed]
    
    D --> L[Total Volume]
    D --> M[Total Merchants]
    D --> N[Revenue]
    D --> O[TPS]
\`\`\`

**Key Metrics Displayed:**
- Total PSP instances (active, suspended, provisioning)
- Aggregate transaction volume (24h, 7d, 30d)
- Total merchants across all PSPs
- Platform revenue (hourly, daily, monthly)
- Transactions per second (TPS) - real-time
- Success rate (weighted average)
- Cloud resource utilization (%)

**PSP Management Actions:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> Active
    Active --> Suspended: Suspend PSP
    Suspended --> Active: Reactivate
    Active --> Terminated: Terminate
    Provisioning --> Active: Deployment Complete
    Provisioning --> Failed: Deployment Error
    Failed --> Provisioning: Retry
    Terminated --> [*]
    
    note right of Suspended
        Reasons: Non-payment,
        Compliance violation,
        Security incident
    end note
\`\`\`

**Suspension Workflow:**
1. Admin clicks "Suspend PSP"
2. Confirmation dialog (reason required)
3. System blocks new transactions
4. Email sent to PSP owner
5. Existing transactions settle normally
6. Dashboard shows "Suspended" badge
7. Reactivation requires admin approval

### 2. Provisioning Queue

**Purpose:** Track PSP deployment status in real-time

**Deployment Pipeline:**
\`\`\`mermaid
flowchart LR
    A[Request Received] --> B[Validate Input]
    B --> C[Compliance Check]
    C --> D{KYB Pass?}
    
    D -->|Yes| E[Allocate Resources]
    D -->|No| F[Request Documents]
    
    E --> G[Create Schema]
    G --> H[Provision Tables]
    H --> I[Set RLS Policies]
    I --> J[Create Admin User]
    J --> K[Configure Domain]
    K --> L[Deploy SSL]
    L --> M[Initialize Settings]
    M --> N{Health Check}
    
    N -->|Pass| O[Mark Active]
    N -->|Fail| P[Retry]
    
    P -->|3x Fail| Q[Manual Review]
    P -->|Success| O
    
    O --> R[Send Credentials]
    R --> S[Complete]
\`\`\`

**Progress Tracking:**
| Step | Status | Duration | Details |
|------|--------|----------|---------|
| Validation | ✅ Complete | 2s | Input validated |
| Compliance | 🔄 Running | 30s | KYB in progress |
| Schema Creation | ⏸ Pending | - | Waiting |
| SSL Provisioning | ⏸ Pending | - | Waiting |
| Health Check | ⏸ Pending | - | Waiting |

**Estimated Time Remaining:** 24 hours

**Error Handling:**
- Automatic retries (3 attempts)
- Manual intervention alert (after 3 failures)
- Detailed error logs with resolution steps
- Support ticket auto-creation

### 3. Financial Operations

**Revenue Dashboard:**

\`\`\`mermaid
pie title Revenue by Source (Monthly)
    "PSP Subscriptions" : 45
    "Transaction Fees" : 30
    "Service Marketplace" : 15
    "ISO Gateway" : 7
    "Orchestration" : 3
\`\`\`

**Revenue Streams Tracked:**
1. **PSP Licensing Revenue**
   - Monthly SaaS fees (Starter, Pro, Enterprise)
   - Setup fees (one-time)
   - Custom integration fees

2. **Transaction Revenue Share**
   - 10-15% of each PSP's transaction fees
   - Calculated automatically per transaction
   - Reconciled monthly

3. **Service Marketplace Commissions**
   - 15-30% commission on subscriptions
   - Tracked per service per PSP
   - Paid by service providers

4. **ISO Gateway Service Revenue**
   - Subscription fees ($99-$2,999/mo)
   - Per-message fees ($0.001-0.01)
   - Enrichment add-ons

5. **Orchestration Service Revenue**
   - Subscription fees ($199-$4,999/mo)
   - Per-routing-execution fees

**Financial Reports Available:**
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Churn rate & retention
- Revenue by customer segment
- Cost of Goods Sold (COGS)
- Gross margin analysis
- Customer Lifetime Value (LTV)
- Customer Acquisition Cost (CAC)

**Xero Integration:**
\`\`\`mermaid
sequenceDiagram
    participant FTS as FTS Platform
    participant Xero as Xero Accounting
    
    FTS->>FTS: Calculate Daily Revenue
    FTS->>Xero: Create Invoice
    Xero-->>FTS: Invoice ID
    
    FTS->>FTS: Record Transaction Fees
    FTS->>Xero: Create Sales Entries
    Xero-->>FTS: Entry IDs
    
    FTS->>FTS: Calculate Provider Costs
    FTS->>Xero: Create Bill Entries
    Xero-->>FTS: Bill IDs
    
    Note over FTS,Xero: Daily sync at 2AM UTC
\`\`\`

**Automated Sync:**
- Daily revenue reconciliation
- Automatic invoice generation
- Expense tracking (provider costs)
- Tax calculation

### 4. Service Catalog Management

**Purpose:** Manage the service marketplace

**Service Lifecycle:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> UnderReview: Submit
    UnderReview --> Certified: Approve
    UnderReview --> Draft: Reject
    Certified --> Active: Publish
    Active --> Deprecated: Deprecate
    Deprecated --> Sunset: End of Life
    Sunset --> [*]
    
    note right of Certified
        FTS team validates:
        - Technical specs
        - Security review
        - SLA commitments
        - Documentation
    end note
\`\`\`

**Service Attributes:**
\`\`\`javascript
{
  "service_id": "stripe_payments_v1",
  "service_name": "Stripe Payment Processing",
  "provider_id": "stripe_inc",
  "category": "payment_rail",
  "version": "1.2.0",
  "lifecycle_state": "GA",
  "pricing_model": "per_transaction",
  "base_price": 0,
  "variable_price": 0.029,
  "trial_available": true,
  "trial_duration_days": 30,
  "uptime_sla": 99.9,
  "avg_latency_ms": 250,
  "rating": 4.8,
  "total_subscribers": 347,
  "features": [
    "Card payments (Visa, MC, Amex)",
    "ACH/Bank transfers",
    "Apple Pay, Google Pay",
    "Subscription billing",
    "Fraud detection (Radar)"
  ],
  "documentation_url": "https://docs.stripe.com",
  "api_spec_url": "https://stripe.com/docs/api"
}
\`\`\`

**Admin Actions:**
- Create new service listings
- Edit service details
- Update pricing
- Certify services (quality check)
- Deprecate/sunset services
- Monitor health & uptime

**Health Monitoring:**
\`\`\`mermaid
flowchart TD
    A[Scheduled Job] --> B{Every 5 Minutes}
    B --> C[Ping Health Endpoint]
    C --> D{Response?}
    
    D -->|200 OK| E[Update: Healthy]
    D -->|5xx Error| F[Update: Degraded]
    D -->|Timeout| G[Update: Down]
    
    F --> H{3 Consecutive Fails?}
    G --> H
    
    H -->|Yes| I[Alert Platform Team]
    H -->|No| J[Log Incident]
    
    I --> K[Notify Subscribers]
    I --> L[Create Incident]
\`\`\`

### 5. Payment Provider Pool

**Purpose:** Manage global payment provider integrations

**Provider Types:**
- **Direct Acquirers:** Bank partnerships (Chase, Wells Fargo)
- **Payment Gateways:** Stripe, Adyen, PayPal
- **Alternative Methods:** Klarna, Afterpay, Cash App
- **Crypto:** Coinbase, Circle, BitPay
- **Open Banking:** Plaid, Tink, TrueLayer

**Provider Configuration:**
\`\`\`mermaid
classDiagram
    class PaymentProvider {
        +string provider_id
        +string provider_name
        +string provider_type
        +array supported_countries
        +array supported_currencies
        +object fee_structure
        +number success_rate
        +number avg_latency_ms
        +string status
    }
    
    class BuyRate {
        +string provider_id
        +string payment_method
        +number percentage_fee
        +number fixed_fee
        +array volume_tiers
    }
    
    class MasterPricing {
        +string item_id
        +string category
        +number buy_rate
        +number sell_rate
        +number margin
    }
    
    PaymentProvider "1" --> "*" BuyRate
    PaymentProvider "1" --> "*" MasterPricing
\`\`\`

**Admin Capabilities:**
- Add new payment providers
- Configure buy rates (what FTS pays)
- Set sell rates (what PSPs pay)
- Monitor provider performance
- Enable/disable providers globally
- Manage provider credentials (secure vault)

**Performance Monitoring:**
| Provider | Success Rate | Avg Latency | 24h Volume | Status |
|----------|-------------|-------------|------------|--------|
| Stripe | 98.7% | 245ms | $2.4M | ✅ Healthy |
| Adyen | 97.9% | 380ms | $1.8M | ✅ Healthy |
| PayPal | 96.2% | 520ms | $980K | ⚠️ Degraded |

### 6. Payout Routes Management

**Purpose:** Configure global payout methods

**Payout Methods:**
\`\`\`mermaid
mindmap
  root((Payout Routes))
    Bank Transfers
      ACH US
      SEPA EU
      SWIFT Global
      FPS UK
      NPP Australia
    Instant Payouts
      RTP US
      Faster Payments UK
      PayID Australia
    Card Disbursements
      Visa Direct
      Mastercard Send
    Digital Wallets
      PayPal
      Venmo
      Cash App
    Crypto
      Bitcoin
      Ethereum
      USDC Stablecoin
\`\`\`

**Configuration Parameters:**
- Route name & identifier
- Supported countries/currencies
- Processing time (instant, same-day, 1-3 days)
- Fees (%, fixed, tiered)
- Limits (min/max amounts)
- Provider credentials
- Health check endpoint

**Payout Routing Logic:**
\`\`\`mermaid
flowchart TD
    A[Payout Request] --> B{Country?}
    
    B -->|US| C{Amount?}
    B -->|EU| D{SEPA Available?}
    B -->|UK| E[Faster Payments]
    
    C -->|< $10K| F[ACH Standard]
    C -->|>= $10K| G[Wire Transfer]
    
    D -->|Yes| H[SEPA Transfer]
    D -->|No| I[SWIFT]
    
    F --> J[Calculate Fees]
    G --> J
    H --> J
    I --> J
    E --> J
    
    J --> K[Execute Payout]
\`\`\`

### 7. Master Pricing Management

**Purpose:** Control pricing across the entire platform

**Pricing Hierarchy:**
\`\`\`
Master Pricing (Platform Level)
    ↓
PSP Tier Pricing (Starter, Pro, Enterprise)
    ↓
Merchant Pricing (per PSP)
    ↓
Transaction Pricing (per merchant)
\`\`\`

**Master Pricing Records:**
\`\`\`javascript
{
  "item_id": "visa_credit_card_processing",
  "category": "payment_rail",
  "provider_name": "Stripe",
  
  // What FTS pays Stripe
  "buy_rate_type": "hybrid",
  "buy_rate_percentage": 2.5,
  "buy_rate_fixed": 0.25,
  
  // What FTS charges PSPs
  "sell_rate_type": "hybrid",
  "sell_rate_percentage": 2.7,
  "sell_rate_fixed": 0.28,
  
  // FTS Margin
  "margin_percentage": 8.0,
  "margin_amount": 0.03,
  
  "status": "active",
  "effective_date": "2025-01-01",
  "approved_by": "finance@fts.money"
}
\`\`\`

**Pricing Features:**
- Version control (track pricing history)
- A/B testing (test pricing models)
- Campaign pricing (promotional rates)
- Volume-based tiers
- Currency-specific fees
- Automatic margin calculation

**Approval Workflow:**
\`\`\`mermaid
sequenceDiagram
    participant Ops as Operations Team
    participant Finance as Finance Manager
    participant System
    participant PSP
    
    Ops->>System: Create Pricing Change
    System->>Finance: Request Approval
    Finance->>System: Review & Approve
    System->>System: Version Increment
    System->>PSP: Apply New Pricing
    System->>Ops: Notify Complete
\`\`\`

### 8. Compliance & Security Oversight

**LEI/vLEI Management:**

\`\`\`mermaid
graph TB
    A[Compliance Dashboard] --> B[LEI Registry]
    A --> C[vLEI Credentials]
    A --> D[Grace Period Tracking]
    
    B --> E[Platform LEI]
    B --> F[PSP LEIs]
    B --> G[Merchant LEIs]
    
    C --> H[Issue vLEI]
    C --> I[Verify Chain]
    C --> J[Revoke vLEI]
    
    D --> K[6-Month Countdown]
    D --> L[Email Alerts]
    D --> M[Suspension Warning]
\`\`\`

**Compliance Monitoring:**
- PSPs without LEI (grace period tracker)
- Merchants requiring KYB verification
- AML screening results
- PCI DSS certification status
- GDPR data requests
- Security incident reports

**Audit Trail:**
All admin actions logged:
\`\`\`javascript
{
  "audit_id": "...",
  "action": "suspend_psp",
  "user_email": "admin@fts.money",
  "platform_role": "platform_admin",
  "target_entity": "ProvisionedPSP",
  "target_id": "ACMEPAY",
  "changes": {
    "status": { "from": "active", "to": "suspended" }
  },
  "reason": "Non-payment",
  "ip_address": "203.0.113.42",
  "timestamp": "2025-12-25T10:30:00Z",
  "signature": "..." // Cryptographic signature for tamper-proof
}
\`\`\`

### 9. Resource Orchestration

**Purpose:** Allocate cloud infrastructure efficiently

**Multi-Cloud Strategy:**
\`\`\`mermaid
graph TB
    A[Resource Orchestrator] --> B[AWS]
    A --> C[Google Cloud]
    A --> D[Azure]
    A --> E[Alibaba Cloud]
    A --> F[Oracle Cloud]
    A --> G[Local Providers]
    
    B --> H[us-east-1]
    B --> I[eu-west-1]
    
    C --> J[us-central1]
    C --> K[asia-southeast1]
    
    D --> L[eastus]
    D --> M[westeurope]
    
    E --> N[cn-beijing]
    F --> O[us-phoenix]
    G --> P[regional-dc]
\`\`\`

**Allocation Algorithm:**
\`\`\`mermaid
flowchart TD
    A[PSP Provision Request] --> B{Data Residency?}
    
    B -->|EU| C[Select EU Cloud]
    B -->|US| D[Select US Cloud]
    B -->|APAC| E[Select APAC Cloud]
    B -->|None| F[Cost Optimize]
    
    C --> G{Current Capacity}
    D --> G
    E --> G
    F --> G
    
    G -->|< 70%| H[Allocate to Existing]
    G -->|>= 70%| I[Provision New Instance]
    
    H --> J[Update Capacity]
    I --> K[Deploy Infrastructure]
    
    J --> L[Assign to PSP]
    K --> L
\`\`\`

**Resource Types:**
- **Compute:** Database instances, API servers
- **Storage:** File uploads, backups
- **Network:** Load balancers, CDN
- **Services:** Queue, cache, search

**Cost Tracking:**
| Cloud Provider | Resources | Monthly Cost | PSPs Hosted | Cost per PSP |
|----------------|-----------|--------------|-------------|--------------|
| AWS | 45 instances | $12,450 | 180 | $69 |
| GCP | 23 instances | $6,890 | 92 | $75 |
| Azure | 12 instances | $4,230 | 48 | $88 |

### 10. Customer Management

**Multi-Tenant Customer Types:**

\`\`\`mermaid
classDiagram
    class CommunityUser {
        +string email
        +string full_name
        +string community_role
        +array owned_psps
    }
    
    class PSPStaffUser {
        +string email
        +string psp_code
        +string role
        +array permissions
    }
    
    class MerchantUser {
        +string email
        +string merchant_code
        +string psp_code
        +string role
    }
    
    class ISOGatewayCustomer {
        +string company_name
        +string contact_email
        +string subscription_tier
        +number total_messages
    }
    
    class OrchestrationCustomer {
        +string company_name
        +string contact_email
        +string subscription_tier
        +number total_executions
    }
    
    CommunityUser "1" --> "*" PSPStaffUser : provisions
    PSPStaffUser "1" --> "*" MerchantUser : manages
\`\`\`

**User Management Functions:**
- View all users (filtered by type)
- Search by email, PSP code
- Reset passwords (admin override)
- Suspend/reactivate accounts
- Merge duplicate accounts
- Export user data (GDPR)

### 11. API Gateway Configuration

**Purpose:** Manage platform API access and rate limits

**Rate Limit Tiers:**
| Tier | Requests/min | Burst Limit | Monthly Quota |
|------|--------------|-------------|---------------|
| Developer | 60 | 100 | 100K |
| Business | 300 | 500 | 1M |
| Enterprise | 1000 | 2000 | Unlimited |

**API Versioning:**
\`\`\`mermaid
gitGraph
    commit id: "v1.0 - Initial"
    commit id: "v1.1 - Bug fixes"
    branch v2-dev
    commit id: "v2.0-beta"
    commit id: "v2.0-rc1"
    checkout main
    merge v2-dev tag: "v2.0-GA"
    commit id: "v2.1 - New features"
\`\`\`

**Deprecation Policy:**
- Major versions supported for 2 years
- 6-month deprecation notice
- Migration guides provided
- Automatic version headers

### 12. ISO Gateway Administration

**Purpose:** Manage ISO Gateway service customers and connections

**Customer Dashboard:**
\`\`\`mermaid
graph TB
    A[ISO Gateway Admin] --> B[All Customers]
    A --> C[Active Connections]
    A --> D[Message Logs]
    A --> E[Pricing Config]
    
    B --> F[Customer Details]
    F --> G[Subscription Tier]
    F --> H[Usage Stats]
    F --> I[Billing Info]
    
    C --> J[Connection Status]
    C --> K[Performance Metrics]
    C --> L[Error Logs]
    
    D --> M[Real-time Monitor]
    D --> N[Search/Filter]
    D --> O[Export Logs]
\`\`\`

**Message Translation Monitoring:**
- Messages processed (total, daily, hourly)
- Translation latency (p50, p95, p99)
- Error rates by message type
- Enrichment usage (LEI, BIC, purpose codes)
- Top customers by volume

**Pricing Tiers (Admin View):**
\`\`\`javascript
{
  "service_type": "iso_gateway",
  "tier_name": "enterprise",
  "monthly_fee": 2999,
  "included_units": 100000,
  "overage_rate": 0.01,
  "enrichment_fees": {
    "lei_enrichment": 0.0001,
    "structured_remittance": 0.00005,
    "purpose_codes": 0.00002,
    "mt_translation": 0.0003
  },
  "features_included": [
    "iso8583_translation",
    "iso20022_translation",
    "mt_translation",
    "lei_enrichment",
    "structured_remittance"
  ]
}
\`\`\`

### 13. Orchestration Administration

**Purpose:** Manage orchestration service customers and routing rules

**Global Routing Rules:**
\`\`\`mermaid
flowchart TD
    A[Routing Request] --> B[Platform Rules]
    B --> C{Geography}
    
    C -->|US| D[US Providers]
    C -->|EU| E[EU Providers]
    C -->|APAC| F[APAC Providers]
    
    D --> G{Amount}
    E --> G
    F --> G
    
    G -->|< $100| H[Low-Cost Route]
    G -->|$100-$10K| I[Balanced Route]
    G -->|> $10K| J[Premium Route]
    
    H --> K[Execute]
    I --> K
    J --> K
    
    K --> L{Success?}
    L -->|Yes| M[Complete]
    L -->|No| N[Failover]
    
    N --> O[Retry Route 2]
\`\`\`

**Customer Orchestration Dashboard:**
- Total routing executions
- Success rate by customer
- Cost savings achieved
- Failover events
- Route performance comparison

---

## User Workflows

### Workflow 1: Provision New PSP

\`\`\`mermaid
journey
    title Platform Admin Provisions PSP
    section Receive Request
      Community User Submits: 5: User
      Review Application: 4: Admin
      Verify Compliance: 3: Admin, System
    section Deployment
      Approve Request: 5: Admin
      Allocate Resources: 4: System
      Create Schema: 4: System
      Configure Domain: 3: System
    section Activation
      Health Check: 4: System
      Send Credentials: 5: Admin, System
      Monitor First Transactions: 5: Admin
    section Support
      Answer Questions: 4: Admin
      Troubleshoot Issues: 3: Admin
\`\`\`

### Workflow 2: Handle Compliance Violation

\`\`\`mermaid
sequenceDiagram
    participant System
    participant Admin
    participant PSP
    participant Legal
    
    System->>Admin: Alert: Compliance Violation
    Admin->>System: Review Incident
    Admin->>PSP: Request Explanation
    PSP-->>Admin: Provide Response
    Admin->>Legal: Escalate if Severe
    Legal-->>Admin: Recommendation
    Admin->>System: Suspend PSP (if required)
    System->>PSP: Suspension Notice
    Admin->>PSP: Remediation Steps
    PSP->>Admin: Compliance Restored
    Admin->>System: Reactivate PSP
\`\`\`

### Workflow 3: Monthly Revenue Reconciliation

**Steps:**
1. System generates revenue report (1st of month)
2. Finance Manager reviews discrepancies
3. Reconcile with Xero accounting
4. Verify payment provider invoices match platform data
5. Identify missing revenue (failed webhooks, etc.)
6. Adjust for refunds, chargebacks
7. Approve final revenue figure
8. Distribute to executive team
9. Archive report

---

## Technical Specifications

### Platform Stack
- **Frontend:** React 18 + Tailwind CSS
- **Backend:** Deno 2.0 (serverless functions)
- **Database:** PostgreSQL 15+ (master + isolated schemas)
- **Caching:** Redis (optional)
- **Queue:** Webhook-based events
- **Monitoring:** Custom health checks + alerts

### API Architecture

**Function-Based Backend:**
\`\`\`javascript
// Platform Auth
POST /functions/platformAuth
{
  "action": "login" | "register" | "listPlatformUsers",
  "email": "admin@fts.money",
  "password": "***",
  "role": "platform_admin"
}

// PSP Data Access (cross-PSP queries)
POST /functions/pspData
{
  "action": "listTransactions" | "listMerchants" | "getStats",
  "psp_code": "ACMEPAY",
  "limit": 100
}

// Resource Provisioning
POST /functions/resourceProvisioner
{
  "action": "allocate" | "deallocate" | "scale",
  "psp_code": "NEWPSP",
  "region": "us-east-1",
  "tier": "professional"
}
\`\`\`

### Database Access Patterns

**Service Role Queries:**
\`\`\`javascript
// Platform admins use service role to query ALL data
import { base44 } from '@/api/base44Client';

// Cross-PSP queries
const allPSPs = await base44.asServiceRole.entities.ProvisionedPSP.list();
const allTransactions = await base44.asServiceRole.entities.Transaction.list();

// Financial aggregations
const revenue = allPSPs.reduce((sum, psp) => sum + psp.monthly_revenue, 0);
\`\`\`

### Performance Requirements
- Dashboard load: <3 seconds
- Search results: <500ms
- Real-time metrics: 5-second refresh
- Bulk operations: <10 seconds (100 records)
- Report generation: <30 seconds

---

## Operational Procedures

### Daily Operations Checklist
- [ ] Review provisioning queue (morning)
- [ ] Check system health dashboard
- [ ] Review overnight alerts/incidents
- [ ] Verify revenue sync with Xero
- [ ] Monitor high-volume PSPs
- [ ] Review support ticket queue

### Weekly Operations
- [ ] PSP performance review (top 10 by volume)
- [ ] Service catalog health check
- [ ] Cost optimization analysis
- [ ] Compliance report review
- [ ] Team sync meeting

### Monthly Operations
- [ ] Revenue reconciliation
- [ ] Invoice generation
- [ ] Churn analysis
- [ ] Product roadmap review
- [ ] Executive summary report

### Incident Response

**Severity Levels:**
- **P0 (Critical):** Platform down, data breach - Response: <15 min
- **P1 (High):** PSP service disruption - Response: <1 hour
- **P2 (Medium):** Performance degradation - Response: <4 hours
- **P3 (Low):** Minor bugs, feature requests - Response: <24 hours

**Escalation Path:**
\`\`\`
Incident Detected
    ↓
Operations Team (immediate)
    ↓
Platform Admin (15 min)
    ↓
Engineering Lead (1 hour)
    ↓
CTO (2 hours)
    ↓
CEO (Critical only)
\`\`\`

---

## Reporting & Analytics

### Executive Dashboard
- Platform-wide KPIs
- Revenue trends
- Customer growth
- Churn metrics
- Cost structure

### Operational Reports
- PSP performance ranking
- Service usage statistics
- Provisioning success rate
- Incident reports
- SLA compliance

### Financial Reports
- Monthly revenue breakdown
- Cost of goods sold (COGS)
- Gross margin by service
- Customer profitability
- Forecasting models

---

## Security & Access Control

### Role Permissions Matrix

| Action | Super Admin | Platform Admin | Operations | Finance | Support | Viewer |
|--------|-------------|----------------|------------|---------|---------|--------|
| Provision PSP | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Suspend PSP | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete PSP | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Revenue | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Modify Pricing | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve Pricing | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View All Data | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Audit Requirements
- All data access logged
- Sensitive actions require justification
- Monthly audit report to compliance team
- Annual external security audit

---

## Troubleshooting

### PSP Provisioning Failures

**Issue:** Schema creation fails  
**Diagnosis:** Check database connection, verify naming conventions  
**Resolution:** Retry with sanitized PSP code (alphanumeric only)

**Issue:** Domain provisioning timeout  
**Diagnosis:** GoDaddy API rate limit or DNS propagation delay  
**Resolution:** Wait 24h for DNS propagation, retry SSL provisioning

**Issue:** Admin user creation fails  
**Diagnosis:** Duplicate email or invalid password  
**Resolution:** Generate unique temp password, force password change on first login

### Revenue Discrepancies

**Issue:** Xero sync shows different revenue  
**Diagnosis:** Timing difference (transactions settled vs. invoiced)  
**Resolution:** Run manual reconciliation, adjust for settlement delays

**Issue:** Service marketplace commission missing  
**Diagnosis:** Webhook delivery failure from provider  
**Resolution:** Query provider API directly, backfill missing data

---

## Best Practices

### For Platform Admins
1. **Monitor Provisioning Queue:** Check hourly during business hours
2. **Review Compliance Weekly:** Ensure no PSPs exceed grace periods
3. **Optimize Cloud Costs:** Review resource allocation monthly
4. **Maintain Audit Trail:** Never delete audit logs
5. **Test Changes in Staging:** All config changes tested before production

### For Finance Team
1. **Daily Revenue Verification:** Reconcile with Xero daily
2. **Monthly Margin Analysis:** Review profitability by service
3. **Price Testing:** Run A/B tests before major pricing changes
4. **Refund Tracking:** Monitor refund rates for abuse patterns

---

## Roadmap

### Q1 2026
- [ ] Automated capacity planning (AI-driven)
- [ ] Multi-region failover (active-active)
- [ ] Advanced fraud detection (platform-wide)

### Q2 2026
- [ ] Self-service resource scaling (PSPs can upgrade)
- [ ] Real-time revenue dashboard (WebSocket updates)
- [ ] Compliance automation (auto-generate reports)

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Owner:** FTS.Money Platform Team
`;