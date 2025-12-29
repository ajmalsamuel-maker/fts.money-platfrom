export const MerchantPortalDoc = `# PSP Merchant Portal Documentation

**Last Updated:** December 2025  
**Status:** Production Ready  
**Version:** 3.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication System](#authentication-system)
4. [Core Features](#core-features)
5. [Dashboard & Analytics](#dashboard-analytics)
6. [Transaction Management](#transaction-management)
7. [Settlement & Payouts](#settlement-payouts)
8. [Dispute Management](#dispute-management)
9. [API Integration](#api-integration)
10. [Customization & White-labeling](#customization-white-labeling)
11. [Security & Compliance](#security-compliance)

---

## Overview

The PSP Merchant Portal is a self-service web application that enables merchants to manage their payment operations, view transactions, handle disputes, configure settings, and access real-time analytics.

### Key Features

- ✅ **Real-time Dashboard** - Live transaction monitoring and KPIs
- ✅ **Transaction Search** - Advanced filtering and export capabilities
- ✅ **Settlement Reports** - Automated reconciliation and payout tracking
- ✅ **Dispute Management** - Chargeback handling with evidence submission
- ✅ **Multi-user Access** - Role-based permissions for merchant staff
- ✅ **API Credentials** - Self-service API key management
- ✅ **White-label Ready** - Fully customizable branding
- ✅ **Mobile Responsive** - Works on all devices

### Access Points

| Portal Type | URL Pattern | Authentication |
|------------|-------------|----------------|
| **Standard Portal** | \`https://merchants.{psp-domain}.com\` | Merchant Code + Email + Password |
| **Direct Login** | \`/MerchantLogin\` | Email + Password |
| **White-label** | Custom domain per PSP | Branded login experience |

---

## Architecture

### System Overview

\`\`\`mermaid
graph TB
    subgraph "Merchant Portal"
        A[Login Page] --> B[Authentication]
        B --> C[Dashboard]
        C --> D[Transactions]
        C --> E[Settlements]
        C --> F[Disputes]
        C --> G[Settings]
        C --> H[API Keys]
        C --> I[Reports]
    end
    
    subgraph "Backend Services"
        J[Merchant Auth API]
        K[Transaction API]
        L[Settlement API]
        M[Dispute API]
        N[Webhook API]
    end
    
    subgraph "Data Layer"
        O[(Merchant DB)]
        P[(Transaction DB)]
        Q[(Settlement DB)]
    end
    
    B --> J
    D --> K
    E --> L
    F --> M
    H --> N
    
    J --> O
    K --> P
    L --> Q
    M --> P
    
    style A fill:#e0f2fe
    style C fill:#dbeafe
    style O fill:#fef3c7
\`\`\`

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI components and state management |
| **Styling** | Tailwind CSS + shadcn/ui | Responsive design system |
| **Charts** | Recharts | Analytics visualization |
| **State** | React Query (TanStack) | Server state and caching |
| **Routing** | React Router v6 | Client-side navigation |
| **Auth** | Custom JWT + Session | Secure authentication |
| **Backend** | Deno Functions | Serverless API endpoints |
| **Database** | PostgreSQL | Transactional data storage |

---

## Authentication System

### Multi-factor Authentication Flow

\`\`\`mermaid
sequenceDiagram
    actor Merchant
    participant Login as Login Page
    participant Auth as merchantAuth Function
    participant DB as Database
    participant Email as Email Service
    
    Merchant->>Login: Enter merchant_code, email, password
    Login->>Auth: POST /merchantAuth
    Auth->>DB: Query merchant user
    DB-->>Auth: User record
    Auth->>Auth: Verify password hash
    
    alt Valid Credentials
        Auth->>Auth: Check 2FA status
        alt 2FA Enabled
            Auth->>Email: Send 2FA code
            Email-->>Merchant: Email with code
            Auth-->>Login: Require 2FA
            Merchant->>Login: Enter 2FA code
            Login->>Auth: Verify 2FA code
            Auth->>Auth: Create session
            Auth-->>Login: Session token
            Login->>Merchant: Redirect to dashboard
        else 2FA Disabled
            Auth->>Auth: Create session
            Auth-->>Login: Session token
            Login->>Merchant: Redirect to dashboard
        end
    else Invalid
        Auth-->>Login: Error
        Login->>Merchant: Show error
    end
\`\`\`

### Merchant Code System

Each merchant has a unique **merchant_code** used for login isolation:

\`\`\`javascript
// Login format
{
  merchant_code: "ACME2024",
  email: "admin@acme.com",
  password: "secure_password"
}

// Session storage
localStorage.setItem('merchantSession', JSON.stringify({
  merchant_code: "ACME2024",
  merchant_id: "uuid",
  email: "admin@acme.com",
  role: "admin"
}));
\`\`\`

### Role-Based Access Control

| Role | Description | Permissions |
|------|-------------|-------------|
| **Admin** | Full control | All features + user management |
| **Manager** | Operational management | Transactions, settlements, disputes |
| **Operator** | Day-to-day operations | View transactions, initiate refunds |
| **Viewer** | Read-only access | View transactions and reports |

---

## Core Features

### Dashboard Components

\`\`\`mermaid
graph LR
    A[Merchant Dashboard] --> B[KPI Cards]
    A --> C[Volume Chart]
    A --> D[Recent Transactions]
    A --> E[Success Rate]
    A --> F[Settlement Status]
    
    B --> B1[Total Volume]
    B --> B2[Transaction Count]
    B --> B3[Success Rate]
    B --> B4[Pending Settlements]
    
    C --> C1[Daily Trends]
    C --> C2[Weekly Comparison]
    C --> C3[Monthly Aggregates]
    
    style A fill:#dbeafe
    style B fill:#dcfce7
    style C fill:#fef3c7
\`\`\`

### Real-time KPIs

\`\`\`javascript
// Dashboard metrics calculation
const calculateKPIs = (transactions, settlements) => {
  return {
    totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
    transactionCount: transactions.length,
    successRate: (transactions.filter(tx => tx.status === 'approved').length / transactions.length) * 100,
    avgTicket: totalVolume / transactionCount,
    pendingSettlements: settlements.filter(s => s.status === 'pending').length,
    todayVolume: transactions.filter(tx => isToday(tx.created_date)).reduce((sum, tx) => sum + tx.amount, 0)
  };
};
\`\`\`

---

## Dashboard & Analytics

### Analytics Features

1. **Transaction Volume Trends**
   - Daily, weekly, monthly aggregates
   - Year-over-year comparison
   - Payment method breakdown

2. **Success Rate Analysis**
   - By payment method
   - By card brand
   - By country
   - By time of day

3. **Customer Insights**
   - Repeat customer rate
   - Average transaction value
   - Geographic distribution
   - Peak transaction hours

### Visual Components

\`\`\`javascript
// Volume chart configuration
<AreaChart data={volumeData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Area 
    type="monotone" 
    dataKey="volume" 
    stroke="#3b82f6" 
    fill="#3b82f6" 
    fillOpacity={0.3}
  />
</AreaChart>

// Payment method breakdown
<PieChart>
  <Pie
    data={paymentMethodData}
    cx="50%"
    cy="50%"
    labelLine={false}
    label={renderCustomLabel}
    outerRadius={80}
    fill="#8884d8"
    dataKey="value"
  >
    {paymentMethodData.map((entry, idx) => (
      <Cell key={\`cell-\${idx}\`} fill={COLORS[idx % COLORS.length]} />
    ))}
  </Pie>
</PieChart>
\`\`\`

---

## Transaction Management

### Transaction List Features

\`\`\`mermaid
graph TB
    A[Transaction Page] --> B[Advanced Search]
    A --> C[Transaction Table]
    A --> D[Export Options]
    A --> E[Quick Actions]
    
    B --> B1[Date Range]
    B --> B2[Status Filter]
    B --> B3[Amount Range]
    B --> B4[Payment Method]
    B --> B5[Card Brand]
    B --> B6[Customer Email]
    
    C --> C1[Transaction ID]
    C --> C2[Amount]
    C --> C3[Status]
    C --> C4[Customer]
    C --> C5[Payment Method]
    C --> C6[Date/Time]
    
    E --> E1[View Details]
    E --> E2[Refund]
    E --> E3[Download Receipt]
    
    D --> D1[Export CSV]
    D --> D2[Export Excel]
    D --> D3[Export PDF]
    
    style A fill:#dbeafe
    style B fill:#fef3c7
    style E fill:#dcfce7
\`\`\`

### Transaction Detail View

\`\`\`javascript
// Transaction details modal
const TransactionDetails = ({ transaction }) => (
  <Dialog>
    <DialogContent className="max-w-3xl">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Payment Details</TabsTrigger>
          <TabsTrigger value="customer">Customer Info</TabsTrigger>
          <TabsTrigger value="technical">Technical Data</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <TransactionOverview tx={transaction} />
        </TabsContent>
        
        <TabsContent value="payment">
          <PaymentDetails 
            cardBrand={transaction.card_brand}
            lastFour={transaction.card_last_four}
            authCode={transaction.auth_code}
          />
        </TabsContent>
        
        <TabsContent value="customer">
          <CustomerInfo 
            name={transaction.customer_name}
            email={transaction.customer_email}
            country={transaction.customer_country}
          />
        </TabsContent>
        
        <TabsContent value="technical">
          <TechnicalData 
            rrn={transaction.rrn}
            arn={transaction.arn}
            ipAddress={transaction.ip_address}
          />
        </TabsContent>
        
        <TabsContent value="timeline">
          <TransactionTimeline history={transaction.history} />
        </TabsContent>
      </Tabs>
    </DialogContent>
  </Dialog>
);
\`\`\`

### Refund Workflow

\`\`\`mermaid
sequenceDiagram
    actor Merchant
    participant Portal
    participant API
    participant PSP
    participant Acquirer
    participant Customer
    
    Merchant->>Portal: Click "Refund"
    Portal->>Portal: Show refund dialog
    Merchant->>Portal: Enter amount & reason
    Portal->>API: POST /refund
    API->>API: Validate refund eligibility
    
    alt Full Refund
        API->>PSP: Process full refund
        PSP->>Acquirer: Submit refund request
        Acquirer-->>PSP: Refund approved
        PSP-->>API: Success
        API->>Customer: Send refund confirmation
    else Partial Refund
        API->>PSP: Process partial refund
        PSP->>Acquirer: Submit partial refund
        Acquirer-->>PSP: Refund approved
        PSP-->>API: Success
        API->>Customer: Send refund confirmation
    end
    
    API-->>Portal: Update transaction status
    Portal->>Merchant: Show success message
\`\`\`

---

## Settlement & Payouts

### Settlement Dashboard

\`\`\`mermaid
graph TB
    A[Settlements] --> B[Pending Settlements]
    A --> C[Completed Settlements]
    A --> D[Settlement History]
    
    B --> B1[Today's Batch]
    B --> B2[Processing]
    B --> B3[Awaiting Approval]
    
    C --> C1[Last 30 Days]
    C --> C2[Download Reports]
    C --> C3[Reconciliation]
    
    D --> D1[Search by Date]
    D --> D2[Export History]
    D --> D3[View Details]
    
    style A fill:#dbeafe
    style B fill:#fef3c7
    style C fill:#dcfce7
\`\`\`

### Settlement Calculation

\`\`\`javascript
// Settlement calculation logic
const calculateSettlement = (transactions, period) => {
  const approved = transactions.filter(tx => 
    tx.status === 'approved' && 
    isInPeriod(tx.created_date, period)
  );
  
  const grossAmount = approved.reduce((sum, tx) => sum + tx.amount, 0);
  const fees = approved.reduce((sum, tx) => sum + tx.fee, 0);
  const refunds = transactions
    .filter(tx => tx.type === 'refund' && isInPeriod(tx.created_date, period))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const chargebacks = getChargebacksForPeriod(period).reduce((sum, cb) => sum + cb.amount, 0);
  
  const netAmount = grossAmount - fees - refunds - chargebacks;
  
  return {
    period,
    grossAmount,
    fees,
    refunds,
    chargebacks,
    netAmount,
    transactionCount: approved.length,
    expectedPayoutDate: calculatePayoutDate(period)
  };
};
\`\`\`

### Settlement Report Format

| Field | Description | Example |
|-------|-------------|---------|
| Settlement ID | Unique identifier | STL-2025-001234 |
| Period Start | Start of settlement period | 2025-01-01 |
| Period End | End of settlement period | 2025-01-07 |
| Gross Volume | Total approved transactions | $125,430.50 |
| Processing Fees | Total fees charged | $3,135.76 |
| Refunds | Total refunded amount | $2,450.00 |
| Chargebacks | Total chargeback amount | $850.00 |
| Net Settlement | Amount to be paid out | $118,994.74 |
| Payout Date | Expected deposit date | 2025-01-10 |
| Bank Reference | Bank transfer reference | WIRE20250110-A1B2C3 |

---

## Dispute Management

### Chargeback Workflow

\`\`\`mermaid
stateDiagram-v2
    [*] --> Received: Chargeback Notification
    Received --> UnderReview: Merchant Views
    UnderReview --> EvidenceSubmitted: Merchant Submits Evidence
    EvidenceSubmitted --> Representment: Evidence Accepted
    Representment --> Won: Issuer Accepts Evidence
    Representment --> Lost: Issuer Rejects Evidence
    Representment --> PreArbitration: Issuer Disputes
    PreArbitration --> Arbitration: Escalation
    Arbitration --> Won: Merchant Wins
    Arbitration --> Lost: Merchant Loses
    UnderReview --> Accepted: Merchant Accepts
    Won --> [*]
    Lost --> [*]
    Accepted --> [*]
\`\`\`

### Evidence Submission

\`\`\`javascript
// Chargeback evidence form
const ChargebackEvidenceForm = ({ chargeback }) => {
  const [evidence, setEvidence] = useState({
    customerSignature: null,
    proofOfDelivery: null,
    productDescription: '',
    customerCommunication: [],
    refundPolicy: '',
    merchantResponse: ''
  });
  
  const submitEvidence = async () => {
    const formData = new FormData();
    formData.append('chargeback_id', chargeback.id);
    
    // Upload documents
    if (evidence.customerSignature) {
      const signatureUrl = await uploadDocument(evidence.customerSignature);
      formData.append('customer_signature', signatureUrl);
    }
    
    if (evidence.proofOfDelivery) {
      const deliveryUrl = await uploadDocument(evidence.proofOfDelivery);
      formData.append('proof_of_delivery', deliveryUrl);
    }
    
    // Upload communication logs
    for (const comm of evidence.customerCommunication) {
      const commUrl = await uploadDocument(comm);
      formData.append('communication[]', commUrl);
    }
    
    formData.append('merchant_response', evidence.merchantResponse);
    formData.append('product_description', evidence.productDescription);
    
    await base44.functions.invoke('submitChargebackEvidence', formData);
  };
  
  return (
    <form onSubmit={submitEvidence}>
      <FileUpload label="Customer Signature" onChange={(f) => setEvidence({...evidence, customerSignature: f})} />
      <FileUpload label="Proof of Delivery" onChange={(f) => setEvidence({...evidence, proofOfDelivery: f})} />
      <Textarea label="Product Description" value={evidence.productDescription} onChange={(v) => setEvidence({...evidence, productDescription: v})} />
      <MultiFileUpload label="Customer Communication" onChange={(f) => setEvidence({...evidence, customerCommunication: f})} />
      <Textarea label="Merchant Response" value={evidence.merchantResponse} onChange={(v) => setEvidence({...evidence, merchantResponse: v})} />
      <Button type="submit">Submit Evidence</Button>
    </form>
  );
};
\`\`\`

---

## API Integration

### API Key Management

\`\`\`mermaid
graph TB
    A[API Keys Page] --> B[Active Keys]
    A --> C[Create New Key]
    A --> D[Key Permissions]
    
    C --> C1[Key Name]
    C --> C2[Permissions]
    C --> C3[IP Whitelist]
    C --> C4[Expiration]
    
    B --> B1[Key Details]
    B --> B2[Usage Stats]
    B --> B3[Revoke Key]
    
    D --> D1[Read Transactions]
    D --> D2[Create Transactions]
    D --> D3[Refund Transactions]
    D --> D4[Read Settlements]
    
    style A fill:#dbeafe
    style C fill:#fef3c7
    style D fill:#dcfce7
\`\`\`

### Webhook Configuration

\`\`\`javascript
// Webhook setup
const WebhookConfig = () => {
  const [webhooks, setWebhooks] = useState([]);
  
  const createWebhook = async (config) => {
    const webhook = await base44.functions.invoke('createMerchantWebhook', {
      url: config.url,
      events: config.events, // ['transaction.approved', 'transaction.declined', 'refund.processed']
      secret: config.secret,
      active: true
    });
    
    setWebhooks([...webhooks, webhook]);
  };
  
  return (
    <div>
      <WebhookList webhooks={webhooks} />
      <WebhookForm onSubmit={createWebhook} />
      <WebhookTestPanel /> {/* Send test events */}
    </div>
  );
};
\`\`\`

### API Documentation Access

Merchants can access embedded API documentation directly from the portal:

- **Endpoints Reference**: Complete list of available API endpoints
- **Authentication Guide**: How to use API keys
- **Request Examples**: Sample requests in multiple languages (cURL, JavaScript, Python, PHP)
- **Response Schemas**: Expected response formats
- **Webhook Events**: List of all webhook event types
- **Rate Limits**: API usage quotas and throttling

---

## Customization & White-labeling

### Brand Customization

\`\`\`javascript
// Portal branding configuration
const PortalTheme = {
  branding: {
    logo_url: 'https://cdn.merchant.com/logo.png',
    favicon_url: 'https://cdn.merchant.com/favicon.ico',
    company_name: 'Acme Payments',
    primary_color: '#3b82f6',
    secondary_color: '#06b6d4',
    accent_color: '#8b5cf6'
  },
  customization: {
    hide_fts_branding: true,
    custom_domain: 'portal.acmepay.com',
    custom_login_background: 'https://cdn.merchant.com/bg.jpg',
    custom_email_templates: true
  },
  features: {
    enable_disputes: true,
    enable_settlements: true,
    enable_api_docs: true,
    enable_invoicing: true,
    enable_subscriptions: true
  }
};
\`\`\`

### Custom Domain Setup

\`\`\`mermaid
sequenceDiagram
    actor Merchant
    participant Portal as Merchant Portal
    participant PSP as PSP Admin
    participant DNS as DNS Provider
    participant SSL as SSL Certificate
    
    Merchant->>PSP: Request custom domain
    PSP->>Portal: Configure domain settings
    Portal-->>PSP: Provide DNS records
    PSP->>Merchant: Send DNS configuration
    Merchant->>DNS: Add CNAME record
    DNS-->>Portal: Domain verified
    Portal->>SSL: Request certificate
    SSL-->>Portal: Issue SSL cert
    Portal->>Merchant: Domain active
\`\`\`

---

## Security & Compliance

### Security Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Password Policy** | Strong password requirements | Min 8 chars, uppercase, lowercase, number, special |
| **2FA** | Two-factor authentication | Email or SMS-based OTP |
| **Session Management** | Automatic timeout | 30 minutes of inactivity |
| **IP Whitelisting** | Restrict access by IP | Optional per merchant |
| **Audit Logging** | Complete activity log | All actions tracked with timestamp |
| **PCI Compliance** | No card data storage | Tokenization only |
| **Role-based Access** | Granular permissions | Admin, Manager, Operator, Viewer |

### Compliance Features

1. **GDPR Compliance**
   - Data export functionality
   - Right to be forgotten
   - Consent management
   - Data retention policies

2. **PCI DSS**
   - No raw card data displayed
   - Tokenized card references only
   - Secure transmission (TLS 1.3)
   - Regular security audits

3. **Financial Reporting**
   - Audit-ready transaction logs
   - Settlement reconciliation
   - Tax reporting support
   - Financial statement exports

---

## Mobile Responsiveness

### Responsive Design

\`\`\`javascript
// Mobile-optimized views
const ResponsiveDashboard = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className={cn(
      isMobile ? 'p-4 space-y-4' : 'p-8 grid grid-cols-3 gap-6'
    )}>
      {isMobile ? (
        <>
          <MobileKPICards />
          <MobileTransactionList />
        </>
      ) : (
        <>
          <DesktopDashboard />
        </>
      )}
    </div>
  );
};
\`\`\`

### Mobile Features

- **Swipe Actions**: Quick refund/view on transaction list
- **Touch-optimized**: Large tap targets for mobile
- **Offline Support**: View cached transactions
- **Push Notifications**: Real-time transaction alerts (optional)
- **Biometric Login**: Fingerprint/Face ID support

---

## Performance Optimization

### Data Loading Strategy

\`\`\`javascript
// Optimized data fetching with React Query
const useMerchantTransactions = (filters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    refetchOnWindowFocus: true,
    keepPreviousData: true // For pagination
  });
};

// Prefetch next page
const prefetchNextPage = (currentPage) => {
  queryClient.prefetchQuery({
    queryKey: ['transactions', { page: currentPage + 1 }],
    queryFn: () => fetchTransactions({ page: currentPage + 1 })
  });
};
\`\`\`

---

## Support & Resources

### In-Portal Help

- **Help Center**: Searchable knowledge base
- **Video Tutorials**: Step-by-step guides
- **Live Chat**: Direct support access
- **Email Support**: Ticketing system
- **Status Page**: Service health monitoring

### Contact

- **Merchant Support**: support@psp-domain.com
- **Technical Integration**: dev@psp-domain.com
- **Billing Inquiries**: billing@psp-domain.com

---

**End of Merchant Portal Documentation**
`;

export default MerchantPortalDoc;