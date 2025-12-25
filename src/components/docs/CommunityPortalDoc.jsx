export const CommunityPortalDoc = `
# Community Portal Documentation
## FTS.Money Service Hub & PSP Marketplace

**Version:** 1.0  
**Last Updated:** December 2025  
**Audience:** PSP Owners, Service Providers, Business Users

---

## Executive Summary

### Purpose
The **Community Portal** is the central hub for PSP owners and service providers to:
- Launch and manage payment service provider instances
- Subscribe to payment services from the marketplace
- Monitor performance across all services
- Manage billing and subscriptions
- Become service providers (offer services to other PSPs)

### Key Benefits
- **Self-Service PSP Provisioning:** Launch a PSP in 24-48 hours
- **One-Click Service Integration:** Add payment providers, compliance tools instantly
- **Unified Dashboard:** Manage all services from one interface
- **Marketplace Access:** 150+ pre-integrated payment services
- **Revenue Opportunity:** Become a service provider and earn from other PSPs

### User Personas

\`\`\`mermaid
mindmap
  root((Community Users))
    PSP Owner
      Launch PSP
      Manage Merchants
      Monitor Revenue
      Subscribe Services
    Service Provider
      List Services
      Manage Offerings
      Track Subscriptions
      Earn Commission
    Developer
      API Integration
      Test Services
      Build Custom
    Finance Manager
      View Billing
      Manage Budget
      Analyze Spend
\`\`\`

---

## Architecture Overview

### Portal Structure

\`\`\`mermaid
graph TB
    A[Community Portal Login] --> B{User Type}
    
    B -->|PSP Owner| C[My Services Dashboard]
    B -->|Service Provider| D[Provider Hub]
    B -->|New User| E[Get Started Wizard]
    
    C --> F[PSP Instances]
    C --> G[ISO Gateway]
    C --> H[Orchestration]
    C --> I[Subscriptions]
    
    F --> J[Manage PSP]
    F --> K[View Analytics]
    F --> L[Configure Services]
    
    D --> M[My Offerings]
    D --> N[Create Service]
    D --> O[View Earnings]
    
    E --> P[Launch PSP]
    E --> Q[Browse Services]
    E --> R[Subscribe Service]
\`\`\`

### Authentication & Access Control

**Authentication Flow:**
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal as Community Portal
    participant Auth as AuthUser Entity
    participant PSP as ProvisionedPSP
    
    User->>Portal: Enter Email/Password
    Portal->>Auth: Verify Credentials
    Auth-->>Portal: User Record
    Portal->>PSP: Query Owned PSPs
    PSP-->>Portal: PSP List
    Portal-->>User: Dashboard (Personalized)
\`\`\`

**Access Levels:**
- **Community User:** Basic access, can view marketplace
- **PSP Owner:** Full access to owned PSP instances
- **Service Provider:** Access to provider hub, manage offerings
- **Admin:** Full portal access (internal FTS staff only)

### Data Model

\`\`\`mermaid
erDiagram
    AuthUser ||--o{ ProvisionedPSP : owns
    ProvisionedPSP ||--o{ PSPServiceSubscription : subscribes
    ServiceCatalog ||--o{ PSPServiceSubscription : used_by
    ServiceProvider ||--o{ ServiceCatalog : provides
    AuthUser ||--o{ PSPWholesaleOffering : creates
    PSPWholesaleOffering ||--o{ PSPResellerRelationship : generates
    
    AuthUser {
        string email PK
        string full_name
        string community_role
        string account_type
    }
    
    ProvisionedPSP {
        string psp_code PK
        string owner_email FK
        string status
        json branding
        boolean can_wholesale
    }
    
    ServiceCatalog {
        string service_id PK
        string service_name
        string provider_id FK
        string pricing_model
    }
    
    PSPServiceSubscription {
        string psp_id FK
        string service_id FK
        string status
        number monthly_spent
    }
\`\`\`

---

## Feature Breakdown

### 1. Dashboard (Home)

**Purpose:** Overview of all services and quick actions

**Components:**
- Service summary cards (PSP count, ISO Gateway, Orchestration)
- Recent activity feed
- Quick action buttons (Launch Services, Browse Marketplace)
- Performance metrics (volume, revenue, merchants)

**Progressive Disclosure:**
\`\`\`mermaid
stateDiagram-v2
    [*] --> NewUser
    NewUser --> FirstService: Launch Service
    FirstService --> ActiveUser: Service Active
    ActiveUser --> PowerUser: 3+ Services
    
    state NewUser {
        [*] --> ShowGetStarted
        ShowGetStarted --> HideBusinessOps
    }
    
    state ActiveUser {
        [*] --> ShowMyServices
        ShowMyServices --> ShowAnalytics
    }
    
    state PowerUser {
        [*] --> ShowAllFeatures
        ShowAllFeatures --> ShowProviderHub
    }
\`\`\`

**New User View:**
- Prominent "Launch Services" button
- Onboarding wizard
- Service comparison cards
- "What You Can Do" section

**Active User View:**
- "My Services" section with counts
- Recent activity log
- Performance graphs
- Quick access to each service

**API Endpoints:**
\`\`\`javascript
// Fetch user's PSP instances
GET /api/psp-instances?owner_email={email}

// Fetch ISO Gateway customers
GET /api/iso-gateway-customers?contact_email={email}

// Fetch Orchestration customers
GET /api/orchestration-customers?contact_email={email}

// Fetch service subscriptions
GET /api/subscriptions?psp_id={id}
\`\`\`

### 2. Launch Services Page

**Purpose:** Unified service selection and provisioning

**Available Services:**

| Service | Description | Setup Time | Starting Price |
|---------|-------------|------------|----------------|
| **PSP Instance** | Full payment platform | 24-48h | $499/mo |
| **ISO Gateway** | Message translation | <1h | $99/mo |
| **Orchestration** | Smart routing | <1h | $199/mo |
| **Marketplace** | Browse 150+ services | Instant | Free |

**Provisioning Flow:**
\`\`\`mermaid
flowchart TD
    A[Select Service] --> B{Service Type}
    
    B -->|PSP| C[PSP Wizard]
    B -->|ISO Gateway| D[Quick Setup]
    B -->|Orchestration| E[Quick Setup]
    
    C --> F[Choose Template]
    C --> G[Configure Components]
    C --> H[Set Pricing]
    C --> I[Business Details]
    C --> J[Review & Deploy]
    
    D --> K[Select Tier]
    D --> L[Provide Credentials]
    
    E --> K
    E --> L
    
    J --> M{Compliance Check}
    M -->|Pass| N[Provision]
    M -->|Fail| O[Request Documents]
    
    N --> P[Email Confirmation]
    P --> Q[Service Active]
\`\`\`

**PSP Provisioning Steps:**
1. **Select Template** (Starter, Business, Enterprise)
2. **Choose Components:**
   - Core: Transactions, Merchants, Settlements
   - Advanced: Smart Routing, AI Fraud, Crypto, Subscriptions
3. **Pricing Model:**
   - Transaction fees (%, fixed, hybrid)
   - Monthly fees
   - Markup on services
4. **Business Details:**
   - Company name, country, currency
   - LEI (optional, 6-month grace period)
   - Contact information
5. **Review & Submit:**
   - Configuration summary
   - Estimated costs
   - SLA agreement

**Technical Implementation:**
\`\`\`javascript
// PSP Provisioning API
POST /api/provision-psp
{
  "psp_code": "ACMEPAY",
  "psp_name": "Acme Payments",
  "owner_email": "owner@acme.com",
  "tier": "professional",
  "enabled_components": [
    "transactions",
    "merchants", 
    "smart_routing",
    "crypto_payments"
  ],
  "pricing_model": {
    "transaction_fee": 2.9,
    "fixed_fee": 0.30,
    "monthly_fee": 1999
  },
  "branding": {
    "primary_color": "#3b82f6",
    "logo_url": "..."
  }
}
\`\`\`

### 3. My Services Overview

**Purpose:** Centralized management of all subscribed services

**Service Cards:**
\`\`\`mermaid
graph LR
    A[My Services] --> B[PSP Instances]
    A --> C[ISO Gateway]
    A --> D[Orchestration]
    A --> E[Subscriptions]
    
    B --> B1[Status Badge]
    B --> B2[Merchant Count]
    B --> B3[Manage Button]
    
    C --> C1[Messages Processed]
    C --> C2[Active Connections]
    C --> C3[Access Button]
    
    D --> D1[Routing Executions]
    D --> D2[Success Rate]
    D --> D3[Configure Button]
    
    E --> E1[Active Services]
    E --> E2[Monthly Spend]
    E --> E3[Manage Button]
\`\`\`

**Status System:**
- **Active** (green) - Fully operational
- **Provisioning** (blue) - Being deployed
- **Suspended** (red) - Payment issue or violation
- **Trial** (yellow) - Free trial period

**Filtering & Sorting:**
- Filter by service type, status, date created
- Sort by name, volume, revenue
- Search by PSP code or name

### 4. PSP Instance Configuration

**Access:** My Services → PSP Instance → Manage

**Configuration Tabs:**

#### Tab 1: Services
\`\`\`mermaid
graph TB
    A[Available Services] --> B[Payment Providers]
    A --> C[Payout Routes]
    A --> D[Compliance Tools]
    A --> E[Fraud Detection]
    A --> F[Analytics]
    
    B --> G[Stripe]
    B --> H[Adyen]
    B --> I[PayPal]
    
    G --> J{Enabled?}
    J -->|Yes| K[Active Badge]
    J -->|No| L[Enable Button]
\`\`\`

**Enable Service Flow:**
1. Click "Enable" on service card
2. Review pricing & features
3. Configure credentials/settings
4. Test connection (sandbox)
5. Activate in production

#### Tab 2: Appearance
- Logo upload (PNG, SVG, max 2MB)
- Primary color picker
- Secondary color picker
- Favicon upload
- Preview live changes

#### Tab 3: Transaction Fees
| Fee Type | Default | Your Setting |
|----------|---------|--------------|
| Card % | 2.9% | ___ % |
| Fixed Fee | $0.30 | $___ |
| International % | +1.5% | +___ % |
| Crypto % | 1% | ___ % |

#### Tab 4: Payment Methods
- Enable/disable specific card brands
- Enable/disable payment types (card, ACH, crypto)
- Set limits per method

#### Tab 5: Payout Methods
- Bank transfer settings
- Instant payout configuration
- Payout schedules (daily, weekly, monthly)

#### Tab 6: Regional Settings
- Operating countries (multi-select)
- Base currency
- Supported currencies
- Timezone

### 5. Service Marketplace

**Purpose:** Browse and subscribe to 150+ payment services

**Categories:**
\`\`\`mermaid
mindmap
  root((Marketplace))
    Payment Rails
      Card Networks
      Bank Transfers
      Digital Wallets
      BNPL
      Crypto
    Compliance
      KYB Verification
      AML Screening
      Fraud Detection
      3D Secure
    Payouts
      Bank Transfer
      Instant Payout
      Card Disburse
      Crypto Payout
    Developer Tools
      API Management
      Webhook Monitor
      Analytics
      Custom Reports
    Value-Added
      Currency Convert
      Tax Calculation
      Invoicing
      Subscription
\`\`\`

**Service Listing:**
\`\`\`mermaid
classDiagram
    class ServiceCard {
        +string name
        +string provider
        +string category
        +string[] features
        +object pricing
        +number rating
        +number subscribers
        +string documentation_url
    }
    
    class ServiceDetails {
        +string description
        +string[] features
        +object pricing_tiers
        +boolean trial_available
        +number trial_duration
        +string setup_time
        +string api_spec_url
    }
    
    ServiceCard --> ServiceDetails : click
\`\`\`

**Subscription Flow:**
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal
    participant Service
    participant Billing
    
    User->>Portal: Browse Marketplace
    Portal-->>User: Display Services
    User->>Portal: Click Service
    Portal-->>User: Service Details
    User->>Portal: Subscribe (Select PSP)
    Portal->>Service: Check Availability
    Service-->>Portal: Available
    Portal->>Billing: Create Subscription
    Billing-->>Portal: Subscription Created
    Portal->>Service: Activate Service
    Service-->>Portal: Activated
    Portal-->>User: Success + Credentials
\`\`\`

**Filtering & Search:**
- Full-text search (name, description, features)
- Filter by category, provider, pricing model
- Sort by rating, popularity, price
- Filter by trial availability

### 6. Analytics & Reporting

**Purpose:** Monitor performance across all services

**Metrics Tracked:**
\`\`\`mermaid
graph TB
    A[Analytics Dashboard] --> B[PSP Metrics]
    A --> C[ISO Gateway Metrics]
    A --> D[Orchestration Metrics]
    A --> E[Financial Metrics]
    
    B --> B1[Total Volume]
    B --> B2[Transaction Count]
    B --> B3[Merchant Count]
    B --> B4[Success Rate]
    
    C --> C1[Messages Processed]
    C --> C2[Translation Latency]
    C --> C3[Error Rate]
    
    D --> D1[Routing Executions]
    D --> D2[Cost Savings]
    D --> D3[Failover Events]
    
    E --> E1[Total Revenue]
    E --> E2[Monthly Spend]
    E --> E3[Profit Margin]
\`\`\`

**Visualization Components:**
- Line charts (volume over time)
- Bar charts (service comparison)
- Pie charts (revenue by service)
- KPI cards (summary metrics)

**Export Options:**
- CSV export (raw data)
- PDF report (formatted)
- Scheduled emails (daily, weekly, monthly)

### 7. Billing & Subscriptions

**Purpose:** Manage costs and payments

**Billing Dashboard:**
| Service | Plan | Monthly Cost | Usage | Overage | Total |
|---------|------|--------------|-------|---------|-------|
| PSP - ACMEPAY | Pro | $1,999 | 45K txns | $0 | $1,999 |
| ISO Gateway | Business | $499 | 30K msgs | $150 | $649 |
| Orchestration | Starter | $199 | 5K routes | $0 | $199 |
| **Total** | | | | | **$2,847** |

**Payment Methods:**
- Credit card (Visa, MC, Amex)
- ACH/Bank transfer
- Wire transfer (Enterprise)
- Crypto (Bitcoin, USDC)

**Invoicing:**
- Automatic monthly invoices (email)
- Detailed line items
- Usage breakdown
- Download PDF

**Cost Optimization Tips:**
- Volume discount recommendations
- Unused service alerts
- Plan upgrade/downgrade suggestions

### 8. Provider Hub

**Purpose:** Become a service provider and offer services to other PSPs

**Eligibility:**
- Active PSP instance (operational for 3+ months)
- Minimum transaction volume (10K+ per month)
- Compliance clearance (KYB, AML)
- Platform approval

**Create Service Offering:**
\`\`\`mermaid
flowchart TD
    A[Provider Hub] --> B[Create Offering]
    B --> C[Service Details]
    C --> D[Name, Description, Category]
    D --> E[Features & Benefits]
    E --> F[Pricing Model]
    F --> G{Model Type}
    
    G -->|Fixed Monthly| H[Set Monthly Fee]
    G -->|Per Transaction| I[Set Per-Txn Fee]
    G -->|Tiered| J[Define Tiers]
    G -->|Revenue Share| K[Set % Share]
    
    H --> L[Platform Commission]
    I --> L
    J --> L
    K --> L
    
    L --> M[Documentation]
    M --> N[API Specs, Guides]
    N --> O[Submit for Review]
    O --> P{FTS Approval}
    
    P -->|Approved| Q[Live in Marketplace]
    P -->|Rejected| R[Feedback & Resubmit]
\`\`\`

**Wholesale Offerings:**
- Payment provider integration
- Payout route access
- Compliance tool resale
- Custom API services

**Commission Structure:**
- FTS takes 15% platform commission
- Provider receives 85% of revenue
- Monthly payouts (NET-30 terms)

**Provider Analytics:**
- Total subscribers
- Monthly revenue
- Churn rate
- Support tickets

### 9. Account Settings

**Profile Management:**
- Full name, email (verified)
- Phone number (optional)
- Company information
- Timezone preferences

**Security:**
- Change password
- Two-factor authentication (2FA)
- Active sessions (view & revoke)
- API keys management

**Notifications:**
- Email preferences (marketing, updates, alerts)
- Webhook notifications
- Slack integration
- SMS alerts (critical only)

**Team Management:**
- Invite collaborators (coming soon)
- Role-based permissions (coming soon)

---

## User Workflows

### Workflow 1: New PSP Owner Onboarding

\`\`\`mermaid
journey
    title New PSP Owner Journey
    section Registration
      Register Account: 5: User
      Verify Email: 5: User, System
      Complete Profile: 4: User
    section First PSP
      Browse Templates: 4: User
      Select Components: 3: User
      Configure Pricing: 3: User
      Submit for Review: 4: User, System
    section Go Live
      Receive Credentials: 5: System
      Configure Branding: 4: User
      Add First Merchant: 5: User
      Process Test Payment: 5: User, System
    section Growth
      Subscribe Services: 4: User
      Monitor Analytics: 5: User
      Scale Operations: 5: User
\`\`\`

**Timeline:** 2-5 days from registration to first live transaction

### Workflow 2: Subscribe to Marketplace Service

**Steps:**
1. Navigate to Marketplace
2. Browse or search for service
3. Click on service card → View details
4. Review pricing, features, documentation
5. Click "Subscribe"
6. Select which PSP instance to add service to
7. Choose plan (if multiple tiers)
8. Start trial (if available) or confirm subscription
9. Receive credentials & setup instructions
10. Configure in PSP settings
11. Test in sandbox
12. Activate in production

**Time:** 15-30 minutes (varies by service complexity)

### Workflow 3: Become a Service Provider

**Steps:**
1. Meet eligibility requirements
2. Navigate to Provider Hub
3. Click "Register as Provider"
4. Complete provider application:
   - Company verification
   - Service description
   - Technical capabilities
   - Support commitment
5. Submit for FTS review (2-5 business days)
6. Receive approval notification
7. Create first service offering:
   - Service details
   - Pricing model
   - API documentation
   - Integration guide
8. Submit offering for review
9. Service goes live in marketplace
10. Start receiving subscribers & revenue

**Timeline:** 1-2 weeks from application to first subscriber

---

## Technical Specifications

### Frontend Stack
- **Framework:** React 18.2
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query (TanStack)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React

### API Integration

**Base URL:** \`https://api.fts.money/v1\`

**Authentication:**
\`\`\`javascript
// Session-based (stored in localStorage)
const session = {
  email: "user@example.com",
  full_name: "John Doe",
  community_role: "psp_owner",
  login_time: "2025-12-25T10:00:00Z"
};
localStorage.setItem('community_portal_session', JSON.stringify(session));
\`\`\`

**Key Endpoints:**

\`\`\`javascript
// Authentication
POST /functions/communityAuth
{
  "action": "login",
  "email": "user@example.com",
  "password": "***"
}

// List PSP Instances
GET /entities/ProvisionedPSP
Filter: { owner_email: "user@example.com", is_template: false }

// Provision New PSP
POST /entities/ProvisionedPSP
{
  "psp_code": "NEWPSP",
  "psp_name": "New PSP",
  "owner_email": "user@example.com",
  "tier": "professional",
  ...
}

// Subscribe to Service
POST /entities/PSPServiceSubscription
{
  "psp_id": "psp_id",
  "service_id": "service_id",
  "status": "trial"
}

// Query Services
GET /entities/ServiceCatalog
Filter: { status: "active", category: "payment_rail" }
\`\`\`

### Performance Targets
- **Page Load:** <2 seconds (first paint)
- **API Response:** <500ms (p95)
- **Search Results:** <200ms
- **Real-time Updates:** WebSocket or 5-second polling

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS 14+, Android 10+)

---

## Security & Compliance

### Authentication Security
- Passwords hashed with SHA-256 + salt
- Session tokens expire after 24 hours
- Failed login lockout (5 attempts, 15 min cooldown)
- Email verification required

### Data Protection
- All API calls over HTTPS (TLS 1.3)
- Sensitive data encrypted at rest (AES-256)
- No PCI data stored in Community Portal
- GDPR compliant (data export, right to delete)

### Access Control
- Role-based permissions (RBAC)
- PSP owners can only access their own instances
- Service providers can only manage their offerings
- Audit logging for all sensitive actions

---

## Troubleshooting

### Common Issues

**Issue:** Cannot login after password reset  
**Solution:** Clear browser cache and cookies, ensure email verification complete

**Issue:** PSP provisioning stuck at "Provisioning" status  
**Solution:** Check compliance verification status, contact support if >48 hours

**Issue:** Service subscription shows "Pending"  
**Solution:** Verify payment method on file, check email for verification link

**Issue:** Analytics showing $0 revenue  
**Solution:** Data syncs every 30 minutes, ensure transactions are in "completed" status

### Support Channels
- **Email:** community@fts.money
- **Live Chat:** Available 9am-6pm PT Mon-Fri
- **Documentation:** https://docs.fts.money/community
- **Status Page:** https://status.fts.money

---

## Best Practices

### For PSP Owners
1. **Start Small:** Use Starter tier, add features as you grow
2. **Enable Trial Services:** Test before committing to paid plans
3. **Monitor Costs:** Set up billing alerts to avoid surprises
4. **Leverage Analytics:** Use data to optimize operations
5. **Keep Compliance Current:** Update LEI/vLEI within grace period

### For Service Providers
1. **Clear Documentation:** Detailed integration guides reduce support burden
2. **Competitive Pricing:** Research market rates before setting prices
3. **Responsive Support:** Fast support = higher retention
4. **Regular Updates:** Keep service features current
5. **Marketing Assets:** Provide logos, case studies for FTS to promote

---

## Roadmap

### Q1 2026
- [ ] Team collaboration (invite users to PSP)
- [ ] Advanced RBAC (custom roles & permissions)
- [ ] White-label Community Portal (PSPs can offer to sub-PSPs)

### Q2 2026
- [ ] Mobile app (iOS & Android)
- [ ] AI recommendations (service suggestions based on usage)
- [ ] Automated compliance reporting

### Q3 2026
- [ ] Multi-language support (ES, FR, DE, ZH, JA)
- [ ] Advanced analytics (predictive insights)
- [ ] Service bundling (create custom packages)

---

**Document Version:** 1.0  
**Last Updated:** December 25, 2025  
**Owner:** FTS.Money Community Team
`;