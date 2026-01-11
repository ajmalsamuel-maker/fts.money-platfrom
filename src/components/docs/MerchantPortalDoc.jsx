export const MerchantPortalDoc = `# Merchant Portal - Complete User Guide
## Self-Service Payment Management Platform

**Version:** 4.0  
**Classification:** Public - Merchants  
**Last Updated:** January 11, 2026  
**Document Owner:** FTS.Money Merchant Success Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Portal Architecture](#portal-architecture)
3. [Authentication & Access](#authentication-access)
4. [Dashboard Overview](#dashboard-overview)
5. [Transaction Management](#transaction-management)
6. [Settlement & Payouts](#settlement-payouts)
7. [Invoice Management](#invoice-management)
8. [FIX Score Dashboard](#fix-score-dashboard)
9. [Customer Management](#customer-management)
10. [Products & Billing](#products-billing)
11. [Payment Links](#payment-links)
12. [Virtual Terminal](#virtual-terminal)
13. [Analytics & Insights](#analytics-insights)
14. [API Integration](#api-integration)
15. [Team & User Management](#team-user-management)
16. [Settings & Configuration](#settings-configuration)
17. [Security & Compliance](#security-compliance)
18. [Mobile Experience](#mobile-experience)

---

## Executive Summary

### What is the Merchant Portal?

The **Merchant Portal** is your self-service command center for managing all payment operations. Whether you're processing your first transaction or scaling to thousands per day, this portal gives you complete visibility and control over your payment infrastructure.

Unlike traditional payment dashboards that only show transaction history, our Merchant Portal is a **complete business operations platform** - transaction processing, settlement tracking, dispute management, customer analytics, invoice reconciliation, FIX score monitoring, API integration, and multi-user team collaboration - all in one place.

### Key Capabilities

\`\`\`mermaid
graph TB
    subgraph "Core Operations"
        A[Dashboard & Analytics]
        B[Transaction Management]
        C[Settlement Tracking]
        D[Dispute Handling]
    end
    
    subgraph "Customer Operations"
        E[Customer Management]
        F[Invoice Portal]
        G[Payment Links]
        H[Products & Subscriptions]
    end
    
    subgraph "Platform Features"
        I[FIX Score Dashboard]
        J[Virtual Terminal]
        K[API Integration]
        L[Multi-User Teams]
    end
    
    subgraph "Settings & Security"
        M[Account Settings]
        N[Team Management]
        O[Pricing Configuration]
        P[Security & Compliance]
    end
    
    A --> B
    A --> C
    A --> D
    
    E --> F
    E --> G
    E --> H
    
    I --> A
    J --> B
    K --> B
    L --> M
    
    M --> N
    M --> O
    M --> P
    
    style A fill:#3b82f6,color:#fff
    style I fill:#f59e0b,color:#fff
    style K fill:#8b5cf6,color:#fff
\`\`\`

### Who Uses the Merchant Portal?

| User Type | Primary Use Case | Key Features |
|-----------|------------------|--------------|
| **Business Owner** | Monitor revenue, approve refunds, review performance | Dashboard, analytics, settlements |
| **Finance Manager** | Reconciliation, invoice matching, settlement tracking | Invoice portal, settlements, reports |
| **Operations Manager** | Daily transaction monitoring, dispute handling | Transactions, disputes, refunds |
| **Customer Support** | Process refunds, view transaction details, issue receipts | Transaction search, refund processing |
| **Developer** | API integration, webhook configuration, testing | API keys, documentation, logs |

### Access Points

| Portal Type | URL Pattern | Authentication Method |
|-------------|-------------|----------------------|
| **Standard Login** | \`/MerchantLogin\` | Merchant Code + Email + Password |
| **White-Label Portal** | Custom domain (e.g., \`merchants.yourpsp.com\`) | Branded login with PSP logo |
| **Direct Access** | From PSP admin invitation email | One-time link → set password |

---

## Portal Architecture

### System Architecture Overview

\`\`\`mermaid
graph TB
    subgraph "Frontend - Merchant Portal"
        UI[React 18 Application]
        AUTH[Authentication Layer]
        STATE[State Management]
        CHARTS[Analytics & Charts]
    end
    
    subgraph "Backend Services"
        API1[merchantAuth<br/>Login & Session]
        API2[Transaction API<br/>Read/Write Txns]
        API3[Settlement API<br/>Payout Tracking]
        API4[Dispute API<br/>Chargeback Management]
        API5[Invoice API<br/>Invoice Processing]
    end
    
    subgraph "Data Layer"
        DB1[(Merchant DB<br/>User Accounts)]
        DB2[(Transaction DB<br/>Payment Records)]
        DB3[(Settlement DB<br/>Payout Data)]
        DB4[(Invoice DB<br/>Invoice Records)]
    end
    
    subgraph "External Integrations"
        EXT1[Payment Processors<br/>Stripe, Adyen]
        EXT2[FIX Score Engine<br/>Performance Rating]
        EXT3[KYC/AML Services<br/>Compliance]
    end
    
    UI --> AUTH
    AUTH --> API1
    UI --> STATE
    STATE --> API2
    STATE --> API3
    STATE --> API4
    STATE --> API5
    
    API1 --> DB1
    API2 --> DB2
    API3 --> DB3
    API4 --> DB2
    API5 --> DB4
    
    API2 --> EXT1
    STATE --> EXT2
    API1 --> EXT3
    
    style UI fill:#3b82f6,color:#fff
    style DB2 fill:#10b981,color:#fff
    style EXT2 fill:#f59e0b,color:#fff
\`\`\`

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend Framework** | React | 18.2 | Component-based UI |
| **State Management** | TanStack Query | 5.x | Server state caching |
| **Styling** | Tailwind CSS + shadcn/ui | 3.x | Responsive design system |
| **Charts & Visualization** | Recharts | 2.x | Transaction analytics |
| **Forms** | React Hook Form | 7.x | Form validation |
| **Routing** | React Router | 6.x | Client-side navigation |
| **Date Handling** | date-fns | 3.x | Date formatting |
| **Icons** | Lucide React | 0.475 | Icon library |
| **Backend Functions** | Deno | 2.x | Serverless API endpoints |
| **Database** | PostgreSQL | 15+ | Multi-tenant data storage |
| **Authentication** | Custom JWT + Session | - | Secure merchant authentication |

### Progressive Disclosure Design

The portal adapts its interface based on merchant status and experience level:

\`\`\`mermaid
stateDiagram-v2
    [*] --> NewMerchant: First Login
    NewMerchant --> GettingStarted: KYB Not Complete
    GettingStarted --> FullAccess: KYB Approved
    
    state GettingStarted {
        [*] --> CompleteSetup
        CompleteSetup --> DocumentUpload
        DocumentUpload --> KYBVerification
        KYBVerification --> Approved
    }
    
    state FullAccess {
        [*] --> AllFeatures
        AllFeatures --> Transactions
        AllFeatures --> Settlements
        AllFeatures --> Invoices
        AllFeatures --> FIXScore
        AllFeatures --> Analytics
        AllFeatures --> VirtualTerminal
    }
    
    note right of GettingStarted
        Sidebar shows:
        - Complete Setup (highlighted)
        - Quick Tour
        - Basic dashboard
    end note
    
    note right of FullAccess
        Sidebar shows:
        - All operational features
        - Advanced analytics
        - Full transaction control
    end note
\`\`\`

---

## Authentication & Access

### Multi-Factor Authentication Flow

\`\`\`mermaid
sequenceDiagram
    actor Merchant
    participant Login as Login Page
    participant Auth as merchantAuth Function
    participant DB as Merchant Database
    participant Hash as Password Verification
    participant Session as Session Manager
    
    Merchant->>Login: Enter credentials
    Note over Login: merchant_code + email + password
    
    Login->>Auth: POST /merchantAuth
    Auth->>DB: Query merchant user
    DB-->>Auth: User record with password_hash
    
    Auth->>Hash: Verify password
    Hash->>Hash: SHA-256 comparison
    
    alt Valid Password
        Hash-->>Auth: Password valid
        Auth->>Auth: Check account status
        
        alt Account Active
            Auth->>Session: Create session token
            Session-->>Auth: JWT token (30min expiry)
            Auth->>DB: Update last_login timestamp
            Auth-->>Login: {success, token, user}
            Login->>Merchant: Redirect to dashboard
            Login->>Session: Store in localStorage
            Note over Session: merchantSession = {<br/>  merchant_code,<br/>  merchant_id,<br/>  email,<br/>  role,<br/>  expires_at<br/>}
        else Account Suspended
            Auth-->>Login: Error: Account suspended
            Login->>Merchant: Contact support message
        end
    else Invalid Password
        Auth-->>Login: Error: Invalid credentials
        Login->>Merchant: Show error + retry
    end
\`\`\`

### Merchant Code System

Each merchant receives a unique **merchant_code** that serves as a tenant identifier and login parameter:

\`\`\`yaml
merchant_code_structure:
  generation_method: "Auto-generated or custom"
  format_examples:
    - auto_generated: "ACME2024"
    - auto_generated: "TECHSTORE42"
    - custom_requested: "YOURCOMPANY"
    
  usage:
    login: "Required first field in login form"
    api_calls: "Identifies merchant in API requests"
    white_label: "Custom subdomain prefix"
    
  security:
    uniqueness: "Globally unique across all PSPs"
    immutability: "Cannot be changed after creation"
    case_insensitive: "ACME2024 = acme2024"
\`\`\`

**Login Form Example:**

\`\`\`javascript
// Merchant login credentials
const loginCredentials = {
  merchant_code: "ACME2024",      // Unique merchant identifier
  email: "admin@acme.com",         // User email
  password: "SecurePass123!"       // Hashed password (SHA-256)
};

// Session storage after successful login
localStorage.setItem('merchantSession', JSON.stringify({
  merchant_code: "ACME2024",
  merchant_id: "uuid-merchant-id",
  email: "admin@acme.com",
  role: "admin",
  created_at: "2026-01-11T10:00:00Z",
  expires_at: "2026-01-11T10:30:00Z"  // 30 minutes
}));
\`\`\`

### Role-Based Access Control (RBAC)

\`\`\`mermaid
graph TB
    subgraph "Role Hierarchy"
        R1[Admin<br/>100% Access]
        R2[Manager<br/>80% Access]
        R3[Operator<br/>60% Access]
        R4[Viewer<br/>40% Access]
    end
    
    subgraph "Admin Permissions"
        A1[All Features]
        A2[User Management]
        A3[Settings Changes]
        A4[Refund Approval]
        A5[API Key Creation]
    end
    
    subgraph "Manager Permissions"
        M1[View Transactions]
        M2[Process Refunds]
        M3[Handle Disputes]
        M4[View Reports]
        M5[Manage Customers]
    end
    
    subgraph "Operator Permissions"
        O1[View Transactions]
        O2[Request Refunds]
        O3[View Settlements]
        O4[Basic Reports]
    end
    
    subgraph "Viewer Permissions"
        V1[View Dashboard]
        V2[View Transactions]
        V3[View Reports]
    end
    
    R1 --> A1
    R1 --> A2
    R1 --> A3
    R1 --> A4
    R1 --> A5
    
    R2 --> M1
    R2 --> M2
    R2 --> M3
    R2 --> M4
    R2 --> M5
    
    R3 --> O1
    R3 --> O2
    R3 --> O3
    R3 --> O4
    
    R4 --> V1
    R4 --> V2
    R4 --> V3
    
    style R1 fill:#ef4444,color:#fff
    style R2 fill:#f59e0b,color:#fff
    style R3 fill:#3b82f6,color:#fff
    style R4 fill:#64748b,color:#fff
\`\`\`

**Permission Matrix:**

| Feature | Admin | Manager | Operator | Viewer |
|---------|-------|---------|----------|--------|
| **Dashboard** | ✅ Full | ✅ Full | ✅ Full | ✅ Read-only |
| **View Transactions** | ✅ | ✅ | ✅ | ✅ |
| **Process Refunds** | ✅ Auto-approve | ✅ Requires approval | ⚠️ Request only | ❌ |
| **Void Transactions** | ✅ | ✅ | ❌ | ❌ |
| **Settlements** | ✅ Full control | ✅ View + export | ✅ View only | ✅ View only |
| **Disputes** | ✅ Submit evidence | ✅ Submit evidence | ✅ View only | ✅ View only |
| **Invoices** | ✅ Upload + reconcile | ✅ Upload + reconcile | ✅ View only | ✅ View only |
| **Customers** | ✅ Full CRUD | ✅ Full CRUD | ✅ View + edit | ✅ View only |
| **Products** | ✅ Full CRUD | ✅ Full CRUD | ✅ View only | ✅ View only |
| **Payment Links** | ✅ Create + manage | ✅ Create + manage | ✅ View only | ❌ |
| **Analytics** | ✅ All reports | ✅ All reports | ✅ Basic reports | ✅ Basic reports |
| **API Keys** | ✅ Create + revoke | ✅ View only | ❌ | ❌ |
| **Webhooks** | ✅ Configure | ✅ View only | ❌ | ❌ |
| **Team Management** | ✅ Invite + remove | ❌ | ❌ | ❌ |
| **Settings** | ✅ All settings | ✅ View settings | ❌ | ❌ |
| **FIX Score** | ✅ View + recalculate | ✅ View only | ✅ View only | ✅ View only |
| **Virtual Terminal** | ✅ Full access | ✅ Full access | ✅ Limited access | ❌ |

---

## Dashboard Overview

### Main Dashboard - At-a-Glance Intelligence

The dashboard is designed to provide **instant business intelligence** - critical metrics, transaction trends, alerts, and actionable insights within 3 seconds of page load.

\`\`\`mermaid
graph TB
    subgraph "Top KPI Cards (Always Visible)"
        K1[Today's Volume<br/>Revenue & Count]
        K2[Success Rate<br/>Approval %]
        K3[Monthly Revenue<br/>MTD Performance]
        K4[Live TPS<br/>Real-Time Activity]
    end
    
    subgraph "Transaction Intelligence"
        T1[Transaction Volume Chart<br/>7-day area chart]
        T2[Transaction Status Pie<br/>Approved/Declined/Pending]
        T3[Recent Transactions<br/>Last 5 with quick actions]
    end
    
    subgraph "Operational Widgets"
        O1[Quick Actions Panel<br/>Refund, VT, Reports]
        O2[Alert Center<br/>Issues & Notifications]
        O3[Performance Comparison<br/>vs Industry Avg]
    end
    
    subgraph "Business Metrics"
        M1[Chargeback Ratio<br/>Target: <1%]
        M2[Decline Rate<br/>Target: <5%]
        M3[Fraud Rate<br/>Target: <0.5%]
        M4[Avg Settlement Time<br/>T+1 or T+2]
        M5[Network Status<br/>Visa, MC, Amex, Discover]
    end
    
    subgraph "Customer & Compliance"
        C1[Payment Methods Breakdown<br/>Card brands distribution]
        C2[Customer Insights<br/>Repeat rate, geography]
        C3[Compliance Dashboard<br/>PCI, KYC status]
    end
    
    subgraph "Advanced Features"
        A1[Settlement Calendar<br/>Upcoming payouts]
        A2[Transaction Velocity<br/>Hourly, daily trends]
        A3[Risk & Fraud Monitor<br/>Real-time alerts]
    end
    
    K1 --> T1
    K2 --> T2
    K3 --> T3
    K4 --> T3
    
    O1 --> T1
    O2 --> M1
    O3 --> M1
    
    M1 --> C1
    M2 --> C2
    M3 --> C3
    M4 --> C3
    M5 --> C3
    
    C1 --> A1
    C2 --> A2
    C3 --> A3
    
    style K1 fill:#3b82f6,color:#fff
    style M1 fill:#f59e0b,color:#fff
    style A1 fill:#10b981,color:#fff
\`\`\`

### KPI Cards - Real-Time Metrics

**Card 1: Today's Volume**

\`\`\`javascript
// Calculation logic
const todaysVolume = {
  amount: transactions
    .filter(t => isToday(t.created_date))
    .reduce((sum, t) => sum + t.amount, 0),
  count: transactions.filter(t => isToday(t.created_date)).length,
  trend: calculateTrend(todaysVolume, yesterdaysVolume), // +12.5%
  comparison: "vs yesterday"
};
\`\`\`

| Metric | Description | Update Frequency |
|--------|-------------|------------------|
| **Amount** | Total revenue today | Real-time |
| **Count** | Number of transactions | Real-time |
| **Trend** | Percentage change vs yesterday | Calculated on load |
| **Visual** | Green ↑ (growth) or Red ↓ (decline) | Dynamic |

**Card 2: Success Rate**

\`\`\`javascript
// Success rate calculation
const successRate = {
  percentage: (approvedCount / totalCount) * 100,
  approvedCount: transactions.filter(t => t.status === 'approved').length,
  totalCount: transactions.length,
  trend: "+0.5%",  // vs last period
  target: 98.5     // Industry benchmark
};
\`\`\`

**Card 3: Monthly Revenue**

\`\`\`javascript
// Month-to-date calculation
const monthlyRevenue = {
  mtd: transactions
    .filter(t => isCurrentMonth(t.created_date))
    .reduce((sum, t) => sum + t.amount, 0),
  lastMonth: getLastMonthTotal(),
  growth: calculateGrowth(mtd, lastMonth),  // +20%
  projected: projectEndOfMonth(mtd, currentDayOfMonth)
};
\`\`\`

**Card 4: Live TPS (Transactions Per Second)**

\`\`\`javascript
// Real-time TPS calculation
const liveTPS = {
  current: recentTransactionsCount / 60,  // Last 60 seconds
  average: totalTransactionsToday / 86400,
  peak: maxTPSToday,
  status: current > average * 2 ? 'spike' : 'normal'
};
\`\`\`

### Transaction Volume Chart

**7-Day Area Chart with Trend Analysis:**

\`\`\`javascript
// Chart data structure
const volumeChartData = last7Days.map(day => ({
  date: format(day, 'MMM dd'),
  amount: getDayTotal(day) / 1000,  // Display in thousands
  count: getDayTransactionCount(day),
  approved: getDayApprovedCount(day),
  declined: getDayDeclinedCount(day)
}));

// Recharts configuration
<AreaChart data={volumeChartData} height={250}>
  <defs>
    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis label={{ value: 'Amount ($K)', angle: -90 }} />
  <Tooltip 
    formatter={(value) => \`$\${value}K\`}
    labelStyle={{ color: '#1e293b' }}
  />
  <Area 
    type="monotone" 
    dataKey="amount" 
    stroke="#3b82f6" 
    strokeWidth={2}
    fill="url(#colorAmount)" 
  />
</AreaChart>
\`\`\`

### Quick Actions Panel

**One-Click Access to Common Tasks:**

\`\`\`mermaid
graph LR
    QA[Quick Actions Panel] --> A1[Process Refund<br/>Select transaction & refund]
    QA --> A2[Open Virtual Terminal<br/>Manual card entry]
    QA --> A3[Create Payment Link<br/>Share with customer]
    QA --> A4[Download Report<br/>Export CSV/Excel/PDF]
    QA --> A5[View Settlements<br/>Payout schedule]
    
    style QA fill:#3b82f6,color:#fff
    style A1 fill:#10b981,color:#fff
\`\`\`

### Alert Center - Proactive Notifications

**Real-Time Alerts & Notifications:**

| Alert Type | Trigger | Action Required | Priority |
|------------|---------|-----------------|----------|
| **High Decline Rate** | >10% last hour | Review payment settings | High |
| **Unusual Transaction** | Amount >10x average | Fraud review | Critical |
| **Settlement Delay** | Payout missed schedule | Contact PSP support | Medium |
| **Chargeback Received** | New dispute filed | Submit evidence (7 days) | High |
| **API Rate Limit** | 80% of quota used | Upgrade plan or optimize | Medium |
| **Low Balance** | Payout account <$1,000 | Add funds | Low |
| **KYC Expiring** | Document expires in 30 days | Upload new documents | Medium |

### Performance Comparison Widget

**Industry Benchmarking:**

\`\`\`yaml
performance_benchmarks:
  your_performance:
    success_rate: 98.7%
    avg_ticket: $45.32
    chargeback_rate: 0.3%
    
  industry_average:
    success_rate: 95.2%
    avg_ticket: $52.10
    chargeback_rate: 0.8%
    
  comparison:
    success_rate: "+3.5% better"
    avg_ticket: "-13% lower"
    chargeback_rate: "62.5% better"
\`\`\`

### Network Status Monitor

**Real-Time Payment Network Health:**

| Network | Latency | Status | Last Checked |
|---------|---------|--------|--------------|
| **Visa** | 45ms | ✅ Healthy | 5 sec ago |
| **Mastercard** | 52ms | ✅ Healthy | 5 sec ago |
| **Amex** | 68ms | ✅ Healthy | 5 sec ago |
| **Discover** | 124ms | ⚠️ Degraded | 5 sec ago |

---

## Transaction Management

### Transaction List - Complete Features

\`\`\`mermaid
graph TB
    subgraph "Search & Filter Layer"
        S1[Search Bar<br/>ID, email, card]
        S2[Status Filter<br/>All/Approved/Declined]
        S3[MID Selector<br/>Multi-terminal support]
        S4[Date Range Picker]
        S5[Amount Range Filter]
    end
    
    subgraph "Transaction Table"
        T1[Transaction ID<br/>Unique identifier]
        T2[Date & Time<br/>ISO 8601 format]
        T3[Amount<br/>Currency + value]
        T4[Card Details<br/>Brand + last 4]
        T5[Customer Info<br/>Name + email]
        T6[Status Badge<br/>Visual indicator]
        T7[Actions Menu<br/>Context actions]
    end
    
    subgraph "Quick Actions (Per Transaction)"
        A1[View Details<br/>Full transaction info]
        A2[Process Refund<br/>Full or partial]
        A3[Void Authorization<br/>Cancel auth-only]
        A4[Download Receipt<br/>PDF generation]
        A5[View Timeline<br/>Transaction history]
    end
    
    subgraph "Bulk Operations"
        B1[Export CSV<br/>Filtered results]
        B2[Export Excel<br/>Formatted spreadsheet]
        B3[Export PDF<br/>Print-ready report]
        B4[Email Report<br/>Schedule delivery]
    end
    
    S1 --> T1
    S2 --> T6
    S3 --> T1
    
    T7 --> A1
    T7 --> A2
    T7 --> A3
    T7 --> A4
    T7 --> A5
    
    T1 --> B1
    T1 --> B2
    T1 --> B3
    T1 --> B4
    
    style T1 fill:#3b82f6,color:#fff
    style A2 fill:#10b981,color:#fff
    style B1 fill:#f59e0b,color:#fff
\`\`\`

### Transaction Search & Filtering

**Advanced Search Capabilities:**

\`\`\`javascript
// Search implementation
const searchTransactions = (query) => {
  const lowerQuery = query.toLowerCase();
  
  return transactions.filter(txn => {
    // Search across multiple fields
    const matchFields = [
      txn.transaction_id,
      txn.customer_email,
      txn.customer_name,
      txn.card_last_four,
      txn.amount?.toString(),
      txn.description
    ];
    
    return matchFields.some(field => 
      field?.toLowerCase().includes(lowerQuery)
    );
  });
};

// Filter by status
const filterByStatus = (transactions, status) => {
  if (status === 'all') return transactions;
  return transactions.filter(t => t.status === status);
};

// Filter by MID (multi-terminal support)
const filterByMID = (transactions, mid) => {
  if (mid === 'all') return transactions;
  return transactions.filter(t => 
    t.terminal_id === mid || t.mid === mid
  );
};
\`\`\`

**Supported Filters:**

| Filter Type | Options | Use Case |
|-------------|---------|----------|
| **Status** | All, Approved, Settled, Pending, Declined, Failed | Find specific transaction states |
| **MID** | All terminals or specific MID | Multi-location businesses |
| **Date Range** | Today, 7 days, 30 days, custom | Time-based analysis |
| **Amount Range** | Min-max filter | Find large/small transactions |
| **Payment Method** | Visa, MC, Amex, etc. | Card brand analysis |
| **Customer** | Email or name search | Customer transaction history |

### Transaction Details Dialog

**Comprehensive Transaction Information:**

\`\`\`mermaid
graph TB
    subgraph "Transaction Details Modal"
        TD[Transaction Details]
    end
    
    subgraph "Tab 1: Overview"
        O1[Transaction ID & Status]
        O2[Amount & Currency]
        O3[Date & Time]
        O4[Authorization Code]
    end
    
    subgraph "Tab 2: Payment Details"
        P1[Card Brand & Type]
        P2[Last 4 Digits]
        P3[Expiry Date]
        P4[Cardholder Name]
        P5[3DS Status]
        P6[AVS Response]
        P7[CVV Response]
    end
    
    subgraph "Tab 3: Customer Info"
        C1[Customer Name]
        C2[Email Address]
        C3[Phone Number]
        C4[Billing Address]
        C5[IP Address]
        C6[Device Info]
    end
    
    subgraph "Tab 4: Technical Data"
        T1[RRN - Retrieval Ref]
        T2[ARN - Acquirer Ref]
        T3[Gateway Response]
        T4[ISO 8583 Fields]
        T5[Processor Details]
    end
    
    subgraph "Tab 5: Timeline"
        TL1[Created]
        TL2[Authorized]
        TL3[Captured]
        TL4[Settled]
        TL5[Refunded/Voided]
    end
    
    TD --> O1
    TD --> P1
    TD --> C1
    TD --> T1
    TD --> TL1
    
    style TD fill:#3b82f6,color:#fff
    style P1 fill:#10b981,color:#fff
    style T1 fill:#8b5cf6,color:#fff
\`\`\`

**Transaction Timeline Example:**

\`\`\`yaml
transaction_lifecycle:
  step_1_created:
    timestamp: "2026-01-11T10:15:32Z"
    event: "Transaction created"
    user: "API request"
    
  step_2_authorized:
    timestamp: "2026-01-11T10:15:34Z"
    event: "Card authorized"
    processor: "Stripe"
    auth_code: "123456"
    
  step_3_captured:
    timestamp: "2026-01-11T10:15:35Z"
    event: "Funds captured"
    amount: "$100.00"
    
  step_4_settled:
    timestamp: "2026-01-12T08:00:00Z"
    event: "Settled to merchant account"
    settlement_id: "STL-20260112-001"
    net_amount: "$97.10"  # After fees
    
  step_5_refunded:
    timestamp: "2026-01-13T14:30:00Z"
    event: "Partial refund processed"
    refund_amount: "$50.00"
    reason: "Customer request"
    processed_by: "admin@merchant.com"
\`\`\`

### Refund Processing

**Full & Partial Refund Workflow:**

\`\`\`mermaid
sequenceDiagram
    actor Merchant
    participant Portal
    participant RefundAPI as Refund API
    participant Processor as Payment Processor
    participant Customer
    participant Settlement as Settlement Engine
    
    Merchant->>Portal: Click "Refund" on transaction
    Portal->>Portal: Open refund dialog
    Portal->>Portal: Pre-fill original amount
    
    Merchant->>Portal: Enter refund amount
    Note over Portal: Can be full ($100) or partial ($50)
    
    Merchant->>Portal: Optional: Add refund reason
    Merchant->>Portal: Click "Confirm Refund"
    
    Portal->>RefundAPI: POST /refund {txn_id, amount, reason}
    RefundAPI->>RefundAPI: Validate eligibility
    
    alt Refund Allowed
        RefundAPI->>Processor: Submit refund request
        Processor-->>RefundAPI: Refund approved
        
        RefundAPI->>Settlement: Create refund record
        Settlement->>Settlement: Deduct from next payout
        
        RefundAPI->>Customer: Send refund confirmation email
        RefundAPI-->>Portal: {success: true, refund_id}
        Portal->>Merchant: Show success message
        Portal->>Portal: Update transaction status
    else Refund Not Allowed
        RefundAPI-->>Portal: Error: Already refunded / Too old
        Portal->>Merchant: Show error + reason
    end
\`\`\`

**Refund Eligibility Rules:**

| Condition | Allowed | Notes |
|-----------|---------|-------|
| **Transaction Status** | Approved or Settled | Cannot refund declined transactions |
| **Transaction Age** | <180 days | Card network limit |
| **Already Refunded** | No | Cannot refund twice |
| **Partial Refunds** | Yes | Up to original amount |
| **Multiple Partials** | Yes | Total cannot exceed original |
| **Voided Transactions** | No | Void instead of refund |

**Refund Impact on Settlement:**

\`\`\`javascript
// Settlement calculation with refunds
const calculateNetSettlement = (period) => {
  const sales = getApprovedSales(period);
  const refunds = getRefunds(period);
  const fees = calculateFees(sales);
  
  const grossAmount = sales.reduce((sum, s) => sum + s.amount, 0);
  const refundAmount = refunds.reduce((sum, r) => sum + r.amount, 0);
  const feeAmount = fees;
  
  const netAmount = grossAmount - refundAmount - feeAmount;
  
  return {
    gross: grossAmount,          // $10,000
    refunds: -refundAmount,      // -$500
    fees: -feeAmount,            // -$250
    net: netAmount,              // $9,250
    refundCount: refunds.length
  };
};
\`\`\`

### Void Authorization

**Cancel Pre-Authorization Before Capture:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Authorized: Card auth-only
    Authorized --> Captured: Capture within 7 days
    Authorized --> Voided: Void before capture
    Captured --> Refunded: Refund after capture
    Voided --> [*]
    Refunded --> [*]
    
    note right of Voided
        No funds transferred
        Auth released immediately
        No refund needed
    end note
    
    note right of Refunded
        Funds already captured
        Refund takes 3-5 days
        Settlement adjusted
    end note
\`\`\`

**Void vs Refund Comparison:**

| Feature | Void | Refund |
|---------|------|--------|
| **Timing** | Before capture | After capture |
| **Funds** | Never transferred | Already transferred |
| **Customer Impact** | Auth hold released | Refund issued (3-5 days) |
| **Fees** | No fees charged | Refund fee may apply |
| **Settlement** | Not included | Deducted from payout |
| **Use Case** | Cancel order before shipment | Return after delivery |

---

## Settlement & Payouts

### Settlement Dashboard

**Complete Settlement Visibility:**

\`\`\`mermaid
graph TB
    subgraph "Settlement Overview"
        SO[Settlement Dashboard]
    end
    
    subgraph "Pending Settlements"
        P1[Today's Batch<br/>Processing now]
        P2[Tomorrow's Batch<br/>Queued]
        P3[Awaiting Approval<br/>Manual review]
    end
    
    subgraph "Completed Settlements"
        C1[Last 30 Days<br/>Payment history]
        C2[Download Reports<br/>CSV/PDF export]
        C3[Reconciliation<br/>Bank statement match]
    end
    
    subgraph "Settlement Details"
        D1[Gross Amount<br/>Total approved txns]
        D2[Processing Fees<br/>PSP charges]
        D3[Refunds<br/>Refund adjustments]
        D4[Chargebacks<br/>Dispute deductions]
        D5[Net Amount<br/>Actual payout]
    end
    
    SO --> P1
    SO --> C1
    
    P1 --> D1
    P2 --> D2
    P3 --> D3
    C1 --> D4
    C2 --> D5
    
    style SO fill:#3b82f6,color:#fff
    style D5 fill:#10b981,color:#fff
\`\`\`

### Settlement Calculation Formula

**How Your Payout is Calculated:**

\`\`\`javascript
/**
 * Settlement Calculation Engine
 * Calculates net payout amount for a settlement period
 */
const calculateSettlement = (periodStart, periodEnd) => {
  // Step 1: Get approved transactions
  const approvedTransactions = getTransactions({
    status: 'approved',
    dateRange: [periodStart, periodEnd]
  });
  
  const grossAmount = approvedTransactions.reduce(
    (sum, txn) => sum + txn.amount, 
    0
  );
  
  // Step 2: Calculate processing fees
  const processingFees = approvedTransactions.reduce(
    (sum, txn) => sum + txn.fee, 
    0
  );
  
  // Step 3: Subtract refunds
  const refunds = getRefunds({
    dateRange: [periodStart, periodEnd]
  });
  
  const refundAmount = refunds.reduce(
    (sum, ref) => sum + ref.amount, 
    0
  );
  
  // Step 4: Subtract chargebacks
  const chargebacks = getChargebacks({
    dateRange: [periodStart, periodEnd]
  });
  
  const chargebackAmount = chargebacks.reduce(
    (sum, cb) => sum + cb.amount, 
    0
  );
  
  // Step 5: Calculate reserves (if applicable)
  const reserveAmount = grossAmount * (merchant.reserve_percentage / 100);
  
  // Step 6: Calculate net settlement
  const netSettlement = grossAmount 
    - processingFees 
    - refundAmount 
    - chargebackAmount 
    - reserveAmount;
  
  return {
    period: { start: periodStart, end: periodEnd },
    breakdown: {
      grossAmount: grossAmount,              // $125,430.50
      processingFees: -processingFees,       // -$3,135.76
      refunds: -refundAmount,                // -$2,450.00
      chargebacks: -chargebackAmount,        // -$850.00
      reserves: -reserveAmount,              // -$0 (if 0%)
      netSettlement: netSettlement           // $118,994.74
    },
    transactionCount: approvedTransactions.length,
    payoutDate: calculatePayoutDate(periodEnd, merchant.settlement_schedule),
    payoutMethod: merchant.payout_method,  // ACH or Wire
    bankAccount: merchant.bank_account_last4
  };
};
\`\`\`

**Settlement Report Example:**

\`\`\`
════════════════════════════════════════════════════════
                  SETTLEMENT REPORT
════════════════════════════════════════════════════════
Settlement ID:        STL-2026-001234
Merchant:             ACME Corporation (ACME2024)
Period:               January 1-7, 2026
Status:               Completed

────────────────────────────────────────────────────────
TRANSACTION SUMMARY
────────────────────────────────────────────────────────
Approved Transactions:              1,247 transactions
Total Gross Volume:                      $125,430.50

────────────────────────────────────────────────────────
DEDUCTIONS
────────────────────────────────────────────────────────
Processing Fees (2.5% + $0.30):           -$3,135.76
Refunds:                  23 refunds       -$2,450.00
Chargebacks:               2 disputes        -$850.00
Rolling Reserve (0%):                            $0.00
                                        ─────────────────
Total Deductions:                         -$6,435.76

────────────────────────────────────────────────────────
NET SETTLEMENT
────────────────────────────────────────────────────────
Amount to be Paid:                       $118,994.74

────────────────────────────────────────────────────────
PAYOUT DETAILS
────────────────────────────────────────────────────────
Payout Method:            ACH (Bank Transfer)
Bank Account:             ••••1234 (Chase Business)
Expected Date:            January 10, 2026
Reference:                WIRE20260110-A1B2C3

════════════════════════════════════════════════════════
\`\`\`

### Settlement Calendar

**Visual Payout Schedule:**

\`\`\`mermaid
gantt
    title Monthly Settlement Schedule (T+2 Rolling)
    dateFormat YYYY-MM-DD
    
    section Week 1
    Txns Jan 1-7         :done, 2026-01-01, 7d
    Settlement Processing:active, 2026-01-08, 1d
    Payout Jan 1-7       :milestone, 2026-01-09, 0d
    
    section Week 2
    Txns Jan 8-14        :done, 2026-01-08, 7d
    Settlement Processing:2026-01-15, 1d
    Payout Jan 8-14      :milestone, 2026-01-16, 0d
    
    section Week 3
    Txns Jan 15-21       :2026-01-15, 7d
    Settlement Processing:2026-01-22, 1d
    Payout Jan 15-21     :milestone, 2026-01-23, 0d
    
    section Week 4
    Txns Jan 22-28       :2026-01-22, 7d
    Settlement Processing:2026-01-29, 1d
    Payout Jan 22-28     :milestone, 2026-01-30, 0d
\`\`\`

**Settlement Schedules Explained:**

| Schedule | Frequency | Payout Timing | Best For |
|----------|-----------|---------------|----------|
| **T+0 (Same Day)** | Daily | Same business day | High-volume, premium tier |
| **T+1 (Next Day)** | Daily | Next business day | Standard tier |
| **T+2 (Two Days)** | Daily | 2 business days | Starter tier, default |
| **Weekly** | Weekly | Every Friday | Low-volume merchants |
| **Bi-weekly** | Every 2 weeks | 1st & 15th | Flexible scheduling |
| **Monthly** | Monthly | Last business day | Predictable cash flow |

---

## Invoice Management

### Invoice Portal - Complete Overview

The **Invoice Management Portal** solves a critical merchant pain point: **reconciling payments to invoices**. Many merchants issue invoices separately (QuickBooks, Xero, etc.) and then receive payments through their payment processor. Matching which payment corresponds to which invoice is tedious and error-prone.

Our Invoice Portal automates this process through intelligent matching, manual reconciliation tools, and visual dashboards that immediately highlight unmatched payments.

\`\`\`mermaid
graph TB
    subgraph "Invoice Upload & Processing"
        U1[Upload Invoice<br/>PDF, CSV, XML]
        U2[AI Extraction<br/>Parse invoice data]
        U3[Data Validation<br/>Check required fields]
        U4[Invoice Created<br/>Stored in database]
    end
    
    subgraph "Payment Matching"
        M1[Auto-Match Engine<br/>Algorithm matching]
        M2[Manual Match<br/>User selection]
        M3[Partial Match<br/>Split payments]
    end
    
    subgraph "Reconciliation Dashboard"
        R1[Matched Invoices<br/>✅ Reconciled]
        R2[Unmatched Payments<br/>⚠️ Needs attention]
        R3[Pending Invoices<br/>⏳ Awaiting payment]
    end
    
    subgraph "Reports & Export"
        E1[Reconciliation Report<br/>Matched vs Unmatched]
        E2[Aging Report<br/>Overdue invoices]
        E3[Export to Accounting<br/>QuickBooks, Xero]
    end
    
    U1 --> U2
    U2 --> U3
    U3 --> U4
    
    U4 --> M1
    M1 --> R1
    M1 --> R2
    M1 --> R3
    
    M2 --> R1
    M3 --> R1
    
    R1 --> E1
    R2 --> E1
    R3 --> E2
    
    E1 --> E3
    E2 --> E3
    
    style U2 fill:#8b5cf6,color:#fff
    style M1 fill:#3b82f6,color:#fff
    style R2 fill:#f59e0b,color:#fff
\`\`\`

### Invoice Upload Workflow

**Step-by-Step Upload Process:**

\`\`\`mermaid
sequenceDiagram
    actor Merchant
    participant Portal as Invoice Portal
    participant Upload as Upload Service
    participant AI as AI Extraction
    participant DB as Invoice Database
    participant Matcher as Auto-Match Engine
    
    Merchant->>Portal: Navigate to Upload Invoice
    Portal->>Portal: Show upload zone
    
    Merchant->>Portal: Drag & drop invoice PDF
    Portal->>Upload: Upload file
    Upload->>Upload: Validate file type & size
    
    Upload->>AI: Extract invoice data
    AI->>AI: OCR scan document
    AI->>AI: Parse structured data
    
    AI-->>Upload: Extracted data
    Note over AI: {<br/>  invoice_number,<br/>  amount,<br/>  date,<br/>  customer,<br/>  line_items<br/>}
    
    Upload->>Portal: Show extracted data
    Portal->>Merchant: Confirm or edit data
    
    Merchant->>Portal: Confirm invoice details
    Portal->>DB: Create invoice record
    DB-->>Portal: Invoice created
    
    Portal->>Matcher: Run auto-match
    Matcher->>Matcher: Compare to transactions
    
    alt Match Found
        Matcher-->>Portal: Matched to txn #12345
        Portal->>Merchant: ✅ Invoice matched automatically
    else No Match
        Matcher-->>Portal: No matching payment
        Portal->>Merchant: ⚠️ Unmatched - review later
    end
\`\`\`

### Auto-Matching Algorithm

**How Invoices are Automatically Matched to Payments:**

\`\`\`javascript
/**
 * Invoice Auto-Matching Engine
 * Matches uploaded invoices to payment transactions
 */
const autoMatchInvoiceToTransaction = (invoice, transactions) => {
  const potentialMatches = [];
  
  // Strategy 1: Exact amount match within ±$0.50
  const amountMatches = transactions.filter(txn => 
    Math.abs(txn.amount - invoice.total_amount) <= 0.50 &&
    isSameDay(txn.created_date, invoice.invoice_date)
  );
  
  if (amountMatches.length === 1) {
    return { 
      confidence: 'high', 
      match: amountMatches[0],
      method: 'exact_amount_and_date'
    };
  }
  
  // Strategy 2: Invoice number in transaction description
  const descriptionMatches = transactions.filter(txn =>
    txn.description?.includes(invoice.invoice_number) ||
    txn.reference?.includes(invoice.invoice_number)
  );
  
  if (descriptionMatches.length === 1) {
    return { 
      confidence: 'high', 
      match: descriptionMatches[0],
      method: 'invoice_number_reference'
    };
  }
  
  // Strategy 3: Customer email match + amount match
  const customerMatches = transactions.filter(txn =>
    txn.customer_email === invoice.customer_email &&
    Math.abs(txn.amount - invoice.total_amount) <= 1.00
  );
  
  if (customerMatches.length === 1) {
    return { 
      confidence: 'medium', 
      match: customerMatches[0],
      method: 'customer_email_and_amount'
    };
  }
  
  // Strategy 4: Fuzzy matching (ML-based)
  const fuzzyMatches = runFuzzyMatchingML(invoice, transactions);
  
  if (fuzzyMatches.length > 0 && fuzzyMatches[0].confidence > 0.85) {
    return {
      confidence: 'medium',
      match: fuzzyMatches[0].transaction,
      method: 'ml_fuzzy_match',
      score: fuzzyMatches[0].confidence
    };
  }
  
  // No confident match found
  return {
    confidence: 'none',
    match: null,
    suggestions: amountMatches.slice(0, 3)  // Show top 3 possibilities
  };
};
\`\`\`

### Reconciliation Interface

**Unmatched Payments - Manual Matching:**

\`\`\`yaml
reconciliation_screen:
  unmatched_payments_list:
    - transaction_id: "TXN-20260111-12345"
      amount: "$500.00"
      date: "2026-01-11"
      customer: "john@example.com"
      suggested_invoices:
        - invoice: "INV-2026-001" (90% match)
        - invoice: "INV-2026-005" (65% match)
      actions:
        - match_to_invoice: "Click to link"
        - mark_as_miscellaneous: "No invoice needed"
        - create_invoice: "Generate new invoice"
        
  manual_match_workflow:
    step_1: "Click unmatched payment"
    step_2: "Review suggested invoices (AI-ranked)"
    step_3: "Select correct invoice or search manually"
    step_4: "Confirm match"
    step_5: "System updates both records"
    step_6: "Reconciliation report updated"
\`\`\`

**Statistics Dashboard:**

| Metric | Value | Visual |
|--------|-------|--------|
| **Total Invoices** | 1,247 | Count |
| **Paid Invoices** | 1,189 (95.3%) | Green badge |
| **Total Invoice Value** | $284,320.50 | Dollar amount |
| **Unmatched Payments** | 12 | Yellow badge (action needed) |
| **Overdue Invoices** | 8 | Red badge |
| **Reconciliation Rate** | 98.2% | Progress bar |

---

## FIX Score Dashboard

### FTS Index - Merchant Performance Rating

The **FIX Score** (FTS Index) is a proprietary merchant scoring system (0-1000 points) that evaluates your business across four dimensions: transaction performance, service adoption, ESG impact, and compliance. Your FIX Score unlocks benefits like fee discounts, priority support, and featured marketplace listings.

\`\`\`mermaid
graph TB
    subgraph "FIX Score Components"
        FIX[FIX Score<br/>0-1000 Total Points]
    end
    
    subgraph "Transaction Score (300 pts)"
        T1[Volume<br/>150 points]
        T2[Count<br/>100 points]
        T3[Growth<br/>50 points]
    end
    
    subgraph "Service Adoption (250 pts)"
        S1[Services Active<br/>150 points]
        S2[Integration Depth<br/>100 points]
    end
    
    subgraph "ESG Performance (250 pts)"
        E1[Carbon Offset<br/>100 points]
        E2[NANO Tasks<br/>100 points]
        E3[Green Investments<br/>50 points]
    end
    
    subgraph "Compliance (200 pts)"
        C1[PCI DSS<br/>100 points]
        C2[LEI Verified<br/>50 points]
        C3[Service Uptime<br/>50 points]
    end
    
    FIX --> T1
    FIX --> T2
    FIX --> T3
    
    FIX --> S1
    FIX --> S2
    
    FIX --> E1
    FIX --> E2
    FIX --> E3
    
    FIX --> C1
    FIX --> C2
    FIX --> C3
    
    T1 --> TOTAL[Total Score Calculation]
    S1 --> TOTAL
    E1 --> TOTAL
    C1 --> TOTAL
    
    TOTAL --> TIER{Score Tier}
    
    TIER -->|900-1000| DIAMOND[💎 Diamond<br/>25% discount]
    TIER -->|750-899| PLATINUM[🏆 Platinum<br/>15% discount]
    TIER -->|600-749| GOLD[🥇 Gold<br/>10% discount]
    TIER -->|400-599| SILVER[🥈 Silver<br/>5% discount]
    TIER -->|0-399| BRONZE[🥉 Bronze<br/>0% discount]
    
    style FIX fill:#f59e0b,color:#fff
    style TOTAL fill:#3b82f6,color:#fff
    style DIAMOND fill:#06b6d4,color:#fff
\`\`\`

### FIX Score Calculation Details

**Component 1: Transaction Score (300 points)**

\`\`\`javascript
// Transaction score calculation
const calculateTransactionScore = (merchant) => {
  const last30Days = getLast30DaysTransactions(merchant.merchant_id);
  const volume = last30Days.reduce((sum, t) => sum + t.amount, 0);
  const count = last30Days.length;
  
  // Volume scoring (0-150 points)
  let volumePoints = 0;
  if (volume >= 10000000) volumePoints = 150;      // $10M+
  else if (volume >= 5000000) volumePoints = 125;  // $5M-$10M
  else if (volume >= 1000000) volumePoints = 100;  // $1M-$5M
  else if (volume >= 500000) volumePoints = 75;    // $500K-$1M
  else if (volume >= 100000) volumePoints = 50;    // $100K-$500K
  else volumePoints = (volume / 100000) * 50;      // Linear below $100K
  
  // Count scoring (0-100 points)
  let countPoints = 0;
  if (count >= 50000) countPoints = 100;           // 50K+ txns
  else if (count >= 10000) countPoints = 80;       // 10K-50K
  else if (count >= 5000) countPoints = 60;        // 5K-10K
  else if (count >= 1000) countPoints = 40;        // 1K-5K
  else countPoints = (count / 1000) * 40;          // Linear below 1K
  
  // Growth scoring (0-50 points)
  const previousMonth = getPrevious30DaysTransactions();
  const growthRate = ((volume - previousMonth.volume) / previousMonth.volume) * 100;
  let growthPoints = 0;
  if (growthRate >= 50) growthPoints = 50;         // 50%+ growth
  else if (growthRate >= 25) growthPoints = 40;    // 25-50% growth
  else if (growthRate >= 10) growthPoints = 30;    // 10-25% growth
  else if (growthRate >= 0) growthPoints = 20;     // Positive growth
  else growthPoints = 10;                          // Declining
  
  return {
    volume_points: volumePoints,
    count_points: countPoints,
    growth_points: growthPoints,
    total: volumePoints + countPoints + growthPoints,
    max: 300
  };
};
\`\`\`

**Component 2: Service Adoption Score (250 points)**

\`\`\`yaml
service_adoption_scoring:
  base_scoring:
    each_service_active: 50  # Up to 5 services × 50 = 250 points
    
  recognized_services:
    - PSP Platform: 50 points
    - Crypto Gateway: 50 points (digital asset acceptance)
    - RWA Platform: 50 points (tokenized securities)
    - E-Invoicing: 50 points (automated invoicing)
    - Tax Management: 50 points (global VAT compliance)
    
  integration_depth_bonus:
    api_integrated: +20 points
    webhook_configured: +15 points
    recurring_billing: +15 points
    multi_currency: +10 points
    
  maximum_possible: 250 points
\`\`\`

**Component 3: ESG Performance Score (250 points)**

\`\`\`javascript
// ESG score calculation
const calculateESGScore = (merchant) => {
  let esgPoints = 0;
  
  // Carbon offset (0-100 points)
  const carbonKg = merchant.carbon_offset_kg || 0;
  if (carbonKg >= 10000) esgPoints += 100;
  else if (carbonKg >= 5000) esgPoints += 75;
  else if (carbonKg >= 1000) esgPoints += 50;
  else esgPoints += (carbonKg / 1000) * 50;
  
  // NANO tasks sponsored (0-100 points)
  const nanoTasks = merchant.nano_tasks_sponsored || 0;
  if (nanoTasks >= 1000) esgPoints += 100;
  else if (nanoTasks >= 500) esgPoints += 75;
  else if (nanoTasks >= 100) esgPoints += 50;
  else esgPoints += (nanoTasks / 100) * 50;
  
  // Green bonds / investments (0-50 points)
  const greenInvest = merchant.green_bonds_invested || 0;
  if (greenInvest >= 100000) esgPoints += 50;
  else if (greenInvest >= 50000) esgPoints += 40;
  else if (greenInvest >= 10000) esgPoints += 25;
  else esgPoints += (greenInvest / 10000) * 25;
  
  return {
    carbon_points: Math.min((carbonKg / 100) * 1, 100),
    nano_points: Math.min((nanoTasks / 10) * 1, 100),
    invest_points: Math.min((greenInvest / 2000) * 1, 50),
    total: Math.min(esgPoints, 250)
  };
};
\`\`\`

**Component 4: Compliance & Security Score (200 points)**

| Compliance Item | Points | Verification Method |
|----------------|--------|---------------------|
| **PCI DSS Compliant** | 100 | Validated quarterly |
| **LEI Verified** | 50 | GLEIF API check |
| **Service Uptime >99.5%** | 30 | Automated monitoring |
| **No Chargebacks >1%** | 20 | Monthly calculation |

### FIX Score Benefits by Tier

\`\`\`mermaid
graph TB
    subgraph "Diamond Tier (900-1000)"
        D1[25% Processing Fee Discount]
        D2[Featured Marketplace Listing]
        D3[Priority 24/7 Support]
        D4[Exclusive Partner Events]
        D5[Advanced Analytics Access]
        D6[Dedicated Account Manager]
    end
    
    subgraph "Platinum Tier (750-899)"
        P1[15% Processing Fee Discount]
        P2[Featured Listing]
        P3[Priority Support]
        P4[Partner Events Access]
        P5[Advanced Analytics]
    end
    
    subgraph "Gold Tier (600-749)"
        G1[10% Processing Fee Discount]
        G2[Featured Listing]
        G3[Extended Support Hours]
        G4[Custom Reports]
    end
    
    subgraph "Silver Tier (400-599)"
        S1[5% Processing Fee Discount]
        S2[Standard Support]
        S3[Basic Reports]
    end
    
    subgraph "Bronze Tier (0-399)"
        B1[Standard Pricing]
        B2[Email Support]
        B3[Basic Dashboard]
    end
    
    style D1 fill:#06b6d4,color:#fff
    style P1 fill:#a855f7,color:#fff
    style G1 fill:#eab308,color:#fff
\`\`\`

### FIX Score Improvement Strategies

**Short-Term Actions (0-30 days):**

\`\`\`yaml
quick_wins:
  sponsor_nano_task:
    action: "Sponsor 10 tree planting tasks"
    cost: "$50"
    fix_points: "+15 points"
    
  enable_service:
    action: "Activate E-Invoicing service"
    cost: "$299/month"
    fix_points: "+50 points"
    
  achieve_pci:
    action: "Complete PCI DSS self-assessment"
    cost: "Free (self-assessment)"
    fix_points: "+100 points"
\`\`\`

**Medium-Term Actions (30-90 days):**

\`\`\`yaml
strategic_improvements:
  grow_volume:
    action: "Increase monthly volume to $500K"
    strategy: "Marketing campaigns, new channels"
    fix_points: "+25-75 points"
    
  adopt_multiple_services:
    action: "Enable Crypto Gateway + Tax Management"
    cost: "$2,500/month + $499/month"
    fix_points: "+100 points (2 services)"
    
  carbon_offset_program:
    action: "Offset 1,000 kg CO₂"
    cost: "$15 per tonne (1000kg)"
    fix_points: "+50 points"
\`\`\`

---

## Customer Management

### Customer Database

**Comprehensive Customer Profiles:**

\`\`\`mermaid
graph TB
    subgraph "Customer Profile"
        CP[Customer Record]
    end
    
    subgraph "Basic Information"
        B1[Full Name]
        B2[Email Address]
        B3[Phone Number]
        B4[Billing Address]
        B5[Shipping Address]
    end
    
    subgraph "Transaction History"
        T1[Total Spent]
        T2[Transaction Count]
        T3[Average Order Value]
        T4[Last Purchase Date]
        T5[Payment Methods Used]
    end
    
    subgraph "Behavioral Analytics"
        A1[Repeat Purchase Rate]
        A2[Customer Lifetime Value]
        A3[Churn Risk Score]
        A4[Preferred Categories]
    end
    
    subgraph "Risk Profile"
        R1[Fraud Score]
        R2[Chargeback History]
        R3[Payment Success Rate]
        R4[Geographic Risk]
    end
    
    CP --> B1
    CP --> T1
    CP --> A1
    CP --> R1
    
    style CP fill:#3b82f6,color:#fff
    style T1 fill:#10b981,color:#fff
    style A1 fill:#f59e0b,color:#fff
    style R1 fill:#ef4444,color:#fff
\`\`\`

**Customer Insights Widget:**

\`\`\`javascript
// Customer analytics
const customerInsights = {
  totalCustomers: 1247,
  newCustomers30Days: 89,
  repeatCustomerRate: 42.5,  // % of customers with 2+ purchases
  avgLifetimeValue: 450.32,
  topCustomers: getTop10ByVolume(),
  geographic_distribution: {
    'US': 650,
    'UK': 234,
    'DE': 156,
    'Other': 207
  },
  riskDistribution: {
    'low': 1156,    // 92.7%
    'medium': 78,   // 6.3%
    'high': 13      // 1.0%
  }
};
\`\`\`

---

## Products & Billing

### Product Catalog Management

**Create & Manage Products:**

\`\`\`yaml
product_management:
  product_types:
    - one_time_payment: "Single purchase (e.g., $99 course)"
    - subscription: "Recurring billing (e.g., $29/month SaaS)"
    - usage_based: "Metered billing (e.g., $0.10/API call)"
    
  product_fields:
    name: "Product name"
    description: "Detailed description"
    price: "Amount in cents (e.g., 9900 = $99.00)"
    currency: "USD, EUR, GBP, etc."
    billing_interval: "month, year, week (subscriptions only)"
    trial_days: "Free trial period (optional)"
    
  inventory_tracking:
    enabled: true/false
    stock_quantity: "Current inventory count"
    low_stock_alert: "Alert when <10 units"
\`\`\`

### Subscription Billing

**Recurring Payment Management:**

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant Portal as Merchant Portal
    participant Sub as Subscription Engine
    participant Processor as Payment Processor
    participant Dunning as Dunning System
    
    Customer->>Portal: Sign up for subscription
    Portal->>Sub: Create subscription
    Sub->>Sub: Schedule first billing (immediate)
    Sub->>Processor: Charge initial payment
    Processor-->>Sub: Payment successful
    Sub-->>Customer: Confirmation email
    
    Note over Sub: 30 days later...
    
    Sub->>Sub: Billing date reached
    Sub->>Processor: Attempt renewal charge
    
    alt Payment Successful
        Processor-->>Sub: Charge approved
        Sub->>Customer: Renewal confirmation
        Sub->>Sub: Schedule next billing
    else Payment Failed
        Processor-->>Sub: Decline (expired card)
        Sub->>Dunning: Initiate dunning workflow
        Dunning->>Customer: Payment failed email (retry in 3 days)
        
        Note over Dunning: Retry 1 (Day 3)
        Dunning->>Processor: Retry charge
        
        alt Retry Successful
            Processor-->>Dunning: Success
            Dunning->>Customer: Payment successful
        else Retry Failed
            Processor-->>Dunning: Failed again
            Dunning->>Customer: Update payment method (retry in 5 days)
            
            Note over Dunning: Retry 2 (Day 8)
            Dunning->>Processor: Final retry
            
            alt Final Success
                Processor-->>Dunning: Success
            else Final Failure
                Dunning->>Sub: Cancel subscription
                Sub->>Customer: Subscription cancelled notice
            end
        end
    end
\`\`\`

---

## Payment Links

### One-Click Payment Link Generator

**Create Shareable Payment Links:**

\`\`\`yaml
payment_link_features:
  creation:
    - product_selection: "Choose from product catalog or custom amount"
    - link_customization: "Custom URL slug"
    - expiration: "Set expiry date/time"
    - quantity_limits: "Max purchases allowed"
    
  sharing:
    - copy_url: "One-click copy"
    - email: "Send directly to customer"
    - qr_code: "Generate QR for in-person"
    - embed: "Iframe or button on website"
    
  analytics:
    - view_count: "Track link views"
    - conversion_rate: "Views → payments"
    - revenue_per_link: "Total revenue generated"
    - geographic_data: "Where customers are"
\`\`\`

**Payment Link Structure:**

\`\`\`
https://pay.yourpsp.com/l/acme-winter-sale-2026

Components:
  - Domain: pay.yourpsp.com (white-labeled)
  - Path: /l/ (payment link route)
  - Slug: acme-winter-sale-2026 (custom)
  
Payment Page Includes:
  ✓ Product image and description
  ✓ Price and currency
  ✓ Secure card form
  ✓ Apple Pay / Google Pay
  ✓ Merchant branding
  ✓ SSL security badge
  ✓ Privacy policy link
\`\`\`

---

## Virtual Terminal

### Manual Payment Entry Interface

The **Virtual Terminal** enables card-not-present (CNP) transaction processing for phone orders (MOTO), in-person sales without a physical terminal, or any scenario where manual card entry is needed.

\`\`\`mermaid
graph TB
    subgraph "Virtual Terminal Features"
        VT[Virtual Terminal]
    end
    
    subgraph "Payment Types"
        PT1[Sale<br/>Immediate capture]
        PT2[Auth Only<br/>Authorize without capture]
        PT3[Capture<br/>Complete auth]
        PT4[Refund<br/>Return funds]
        PT5[Void<br/>Cancel auth]
    end
    
    subgraph "Advanced Features"
        AF1[Recurring Setup<br/>Schedule billing]
        AF2[Tokenization<br/>Save card-on-file]
        AF3[Split Tender<br/>Multiple payments]
        AF4[Item Line Entry<br/>Detailed invoices]
    end
    
    subgraph "Receipt & Delivery"
        RD1[Auto-Generate Receipt]
        RD2[Email to Customer]
        RD3[Print Receipt]
        RD4[SMS Confirmation]
    end
    
    VT --> PT1
    VT --> PT2
    VT --> PT3
    VT --> PT4
    VT --> PT5
    
    PT1 --> AF1
    PT1 --> AF2
    PT1 --> AF3
    PT1 --> AF4
    
    AF4 --> RD1
    RD1 --> RD2
    RD1 --> RD3
    RD1 --> RD4
    
    style VT fill:#3b82f6,color:#fff
    style PT1 fill:#10b981,color:#fff
    style AF2 fill:#f59e0b,color:#fff
\`\`\`

**Virtual Terminal Access:**

| Access Method | Use Case | Who Can Access |
|---------------|----------|----------------|
| **Dashboard Button** | Quick access from main dashboard | Admin, Manager, Operator |
| **Direct Page** | \`/MerchantVirtualTerminal\` | Admin, Manager, Operator |
| **Keyboard Shortcut** | Ctrl+V (or Cmd+V) via Command Palette | Power users |

---

## Analytics & Insights

### Analytics Dashboard

**Multi-Dimensional Business Intelligence:**

\`\`\`mermaid
graph TB
    subgraph "Analytics Categories"
        A[Analytics Dashboard]
    end
    
    subgraph "Transaction Analytics"
        T1[Volume Trends<br/>Daily, weekly, monthly]
        T2[Success Rate Analysis<br/>By method, card, country]
        T3[Peak Hours<br/>Time-of-day heatmap]
        T4[Average Ticket<br/>Trend over time]
    end
    
    subgraph "Customer Analytics"
        C1[Repeat Customer Rate<br/>Loyalty metrics]
        C2[Customer Lifetime Value<br/>CLV calculation]
        C3[Geographic Distribution<br/>Map visualization]
        C4[Acquisition Channels<br/>Source tracking]
    end
    
    subgraph "Payment Method Analytics"
        P1[Card Brand Distribution<br/>Visa, MC, Amex %]
        P2[Payment Type Mix<br/>Card, wallet, bank]
        P3[Success by Method<br/>Which performs best]
        P4[Cost Analysis<br/>Fees by method]
    end
    
    subgraph "Business Health"
        B1[Chargeback Trends<br/>Weekly ratio]
        B2[Decline Analysis<br/>Reasons breakdown]
        B3[Fraud Detection<br/>Blocked transactions]
        B4[Settlement Timing<br/>Days to payout]
    end
    
    A --> T1
    A --> C1
    A --> P1
    A --> B1
    
    style A fill:#3b82f6,color:#fff
    style T1 fill:#10b981,color:#fff
    style C1 fill:#f59e0b,color:#fff
    style P1 fill:#8b5cf6,color:#fff
    style B1 fill:#ef4444,color:#fff
\`\`\`

### Customer Insights Widget

**Detailed Customer Behavior Analysis:**

\`\`\`javascript
// Customer insights calculation
const customerInsights = {
  segmentation: {
    new: { count: 89, percent: 7.1 },
    active: { count: 654, percent: 52.4 },
    dormant: { count: 423, percent: 33.9 },
    churned: { count: 81, percent: 6.5 }
  },
  
  cohortAnalysis: {
    january_2026: { customers: 89, retention_30d: 78, retention_90d: 45 },
    december_2025: { customers: 112, retention_30d: 94, retention_90d: 67 },
    november_2025: { customers: 98, retention_30d: 89, retention_90d: 71 }
  },
  
  topCustomers: [
    { name: "John Smith", email: "john@example.com", lifetime_value: 2450.50, txn_count: 24 },
    { name: "Sarah Johnson", email: "sarah@example.com", lifetime_value: 1890.25, txn_count: 18 }
  ],
  
  geographicInsights: {
    top_countries: [
      { country: "US", customers: 650, revenue: 125430 },
      { country: "UK", customers: 234, revenue: 45210 },
      { country: "DE", customers: 156, revenue: 28900 }
    ]
  }
};
\`\`\`

### Payment Methods Breakdown

**Card Brand & Payment Type Distribution:**

\`\`\`javascript
// Payment method analysis
const paymentMethodBreakdown = transactions.reduce((acc, txn) => {
  const method = txn.card_brand || 'Other';
  if (!acc[method]) {
    acc[method] = { count: 0, volume: 0, color: getCardColor(method) };
  }
  acc[method].count += 1;
  acc[method].volume += txn.amount;
  return acc;
}, {});

// Pie chart data
const pieData = Object.entries(paymentMethodBreakdown).map(([name, data]) => ({
  name: name,
  value: data.count,
  volume: data.volume,
  color: data.color
}));

// Results example:
// Visa: 870 transactions (70%), $87,340
// Mastercard: 280 transactions (22%), $28,120
// Amex: 60 transactions (5%), $12,450
// Discover: 37 transactions (3%), $3,650
\`\`\`

---

## API Integration

### API Credentials Management

**Self-Service API Key Portal:**

\`\`\`mermaid
graph TB
    subgraph "API Keys Page"
        AK[API Credentials]
    end
    
    subgraph "Key Information Display"
        K1[Key Name<br/>Descriptive label]
        K2[Environment<br/>Test or Production]
        K3[API Key<br/>Public identifier]
        K4[API Secret<br/>Private key]
        K5[Rate Limit<br/>Requests/minute]
        K6[Usage Count<br/>Total API calls]
        K7[Status<br/>Active/Revoked]
        K8[Created Date<br/>Generation timestamp]
    end
    
    subgraph "Key Actions"
        A1[Copy API Key<br/>One-click copy]
        A2[Show/Hide Secret<br/>Toggle visibility]
        A3[Rotate Secret<br/>Generate new]
        A4[Revoke Key<br/>Deactivate permanently]
    end
    
    subgraph "Integration Guide"
        IG1[Authentication Example<br/>Bearer token]
        IG2[Payment Creation<br/>cURL, JS, Python]
        IG3[Webhook Setup<br/>Event subscription]
        IG4[Error Handling<br/>Common errors]
    end
    
    AK --> K1
    K3 --> A1
    K4 --> A2
    K4 --> A3
    K7 --> A4
    
    AK --> IG1
    
    style AK fill:#3b82f6,color:#fff
    style K4 fill:#ef4444,color:#fff
    style IG1 fill:#10b981,color:#fff
\`\`\`

### API Key Structure

**Key Format & Security:**

\`\`\`yaml
api_key_format:
  live_keys:
    prefix: "pk_live_"
    example: "pk_live_4a7b2c9d1e6f8g3h5i4j"
    usage: "Production transactions"
    
  test_keys:
    prefix: "pk_test_"
    example: "pk_test_9z8y7x6w5v4u3t2s1r0q"
    usage: "Sandbox testing"
    
  secret_keys:
    prefix: "sk_live_" or "sk_test_"
    example: "sk_live_AbCdEfGhIjKlMnOpQrStUvWxYz123456"
    security: "NEVER expose client-side"
    storage: "Server environment variables only"
    
  security_features:
    - hashed_storage: "SHA-256 hash in database"
    - prefix_display: "Show only first 12 chars in UI"
    - revocation: "Instant deactivation"
    - rotation: "Generate new secret without changing key"
    - ip_whitelist: "Optional IP restriction"
    - rate_limiting: "Per-key throttling"
\`\`\`

### API Integration Examples

**Quick Start - Create Payment:**

\`\`\`javascript
// JavaScript/Node.js example
const axios = require('axios');

const createPayment = async () => {
  const response = await axios.post('https://api.yourpsp.com/v1/payments', {
    amount: 10000,  // $100.00 in cents
    currency: 'USD',
    payment_method: {
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2027,
        cvc: '123'
      }
    },
    description: 'Order #12345',
    customer_email: 'customer@example.com'
  }, {
    headers: {
      'Authorization': \`Bearer \${process.env.API_SECRET_KEY}\`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
};

// Response:
{
  "id": "txn_1A2B3C4D5E6F",
  "status": "approved",
  "amount": 10000,
  "currency": "USD",
  "auth_code": "123456",
  "created_at": "2026-01-11T10:30:00Z"
}
\`\`\`

**Python Example:**

\`\`\`python
import requests

def create_payment(api_key, amount, currency='USD'):
    url = 'https://api.yourpsp.com/v1/payments'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    payload = {
        'amount': amount,
        'currency': currency,
        'payment_method': {
            'type': 'card',
            'card': {
                'number': '4242424242424242',
                'exp_month': 12,
                'exp_year': 2027,
                'cvc': '123'
            }
        }
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()
\`\`\`

### Webhook Configuration

**Event-Driven Notifications:**

\`\`\`yaml
webhook_system:
  supported_events:
    - transaction.approved
    - transaction.declined
    - transaction.refunded
    - transaction.voided
    - settlement.completed
    - chargeback.received
    - customer.created
    - subscription.created
    - subscription.renewed
    - subscription.cancelled
    
  webhook_configuration:
    url: "https://your-server.com/webhooks/payment"
    secret: "whsec_AbCdEfGhIjKlMnOp"  # For HMAC verification
    events: ["transaction.approved", "transaction.declined"]
    active: true
    
  payload_structure:
    event_type: "transaction.approved"
    event_id: "evt_1A2B3C4D"
    created_at: "2026-01-11T10:30:00Z"
    data:
      transaction_id: "txn_XYZ123"
      amount: 10000
      currency: "USD"
      status: "approved"
\`\`\`

**Webhook Security - HMAC Verification:**

\`\`\`javascript
// Verify webhook authenticity (prevent spoofing)
const crypto = require('crypto');

const verifyWebhookSignature = (payload, signature, secret) => {
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Usage in your webhook endpoint
app.post('/webhooks/payment', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = verifyWebhookSignature(req.body, signature, WEBHOOK_SECRET);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  const { event_type, data } = req.body;
  
  switch(event_type) {
    case 'transaction.approved':
      handleTransactionApproved(data);
      break;
    case 'transaction.declined':
      handleTransactionDeclined(data);
      break;
    // ... other events
  }
  
  res.status(200).json({ received: true });
});
\`\`\`

---

## Team & User Management

### Multi-User Collaboration

**Invite Team Members:**

\`\`\`mermaid
sequenceDiagram
    actor Admin
    participant Portal as Merchant Portal
    participant Invite as Invitation System
    participant Email as Email Service
    participant NewUser as Team Member
    participant Auth as Authentication
    
    Admin->>Portal: Navigate to Team Management
    Portal->>Portal: Show current team members
    
    Admin->>Portal: Click "Invite Team Member"
    Portal->>Portal: Show invitation form
    
    Admin->>Portal: Enter email + role
    Note over Portal: email: dev@company.com<br/>role: Operator
    
    Portal->>Invite: Create invitation
    Invite->>Invite: Generate invite token
    Invite->>Email: Send invitation email
    
    Email->>NewUser: Invitation email received
    Note over Email: Subject: Join ACME Payments Team<br/>Link: /accept-invite?token=...
    
    NewUser->>Portal: Click invitation link
    Portal->>Auth: Verify invite token
    
    alt Token Valid
        Auth-->>Portal: Token valid
        Portal->>NewUser: Show set password page
        NewUser->>Portal: Set password
        Portal->>Auth: Create user account
        Auth-->>Portal: Account created
        Portal->>NewUser: Redirect to dashboard
    else Token Invalid/Expired
        Auth-->>Portal: Invalid token
        Portal->>NewUser: Error: Invitation expired
    end
\`\`\`

**Team Dashboard Features:**

| Feature | Admin | Manager | Operator |
|---------|-------|---------|----------|
| **View team members** | ✅ | ✅ | ✅ |
| **Invite new users** | ✅ | ❌ | ❌ |
| **Change user roles** | ✅ | ❌ | ❌ |
| **Revoke access** | ✅ | ❌ | ❌ |
| **View activity logs** | ✅ | ✅ | ❌ |
| **Reset passwords** | ✅ (any user) | ✅ (self only) | ✅ (self only) |

---

## Settings & Configuration

### Merchant Settings

**Account Configuration Options:**

\`\`\`yaml
merchant_settings:
  business_information:
    - legal_business_name: "Editable (requires re-verification)"
    - trading_name: "DBA name"
    - tax_id: "EIN or equivalent"
    - business_category: "MCC code"
    - website: "Primary website URL"
    
  contact_information:
    - primary_email: "Business email"
    - support_email: "Customer support contact"
    - phone_number: "Business phone"
    - address: "Registered business address"
    
  localization:
    - timezone: "UTC, America/New_York, Europe/London, etc."
    - default_currency: "USD, EUR, GBP, etc."
    - date_format: "MM/DD/YYYY or DD/MM/YYYY"
    - number_format: "1,000.00 or 1.000,00"
    
  payment_settings:
    - accepted_cards: "Visa, MC, Amex, Discover"
    - 3ds_enforcement: "Always, threshold-based, never"
    - cvv_required: "true/false"
    - avs_check: "Address verification on/off"
    
  settlement_preferences:
    - settlement_schedule: "T+0, T+1, T+2, weekly, monthly"
    - minimum_payout: "$25 threshold"
    - payout_currency: "USD, EUR, GBP"
    - bank_account: "Account for payouts"
    
  security_settings:
    - two_factor_auth: "Enable 2FA for all users"
    - session_timeout: "15, 30, 60 minutes"
    - ip_whitelist: "Restrict access by IP"
    - password_policy: "Complexity requirements"
    
  notification_preferences:
    - transaction_alerts: "Email on high-value txns"
    - settlement_notifications: "Payout reminders"
    - chargeback_alerts: "Immediate notification"
    - daily_summary: "End-of-day report email"
\`\`\`

### Timezone Settings

**Atomic Time Synchronization:**

\`\`\`mermaid
graph LR
    A[Merchant Settings] --> B[Timezone Configuration]
    B --> C{Select Country}
    C --> D[Auto-Detect Timezone]
    D --> E[Atomic Time Display]
    
    E --> F[Dashboard Timestamps]
    E --> G[Transaction Records]
    E --> H[Settlement Schedule]
    E --> I[Report Generation]
    
    style B fill:#3b82f6,color:#fff
    style E fill:#10b981,color:#fff
\`\`\`

**Benefits of Atomic Time:**
- **Precision**: Synchronized to NIST atomic clocks (±0.001 seconds)
- **Compliance**: Accurate audit trails for disputes
- **Multi-Region**: Consistent timestamps across geographies
- **Settlement**: Accurate cutoff time enforcement

---

## Security & Compliance

### Security Features

**Multi-Layer Security Architecture:**

\`\`\`mermaid
graph TB
    subgraph "Authentication Layer"
        A1[Strong Passwords<br/>16+ chars recommended]
        A2[Password Hashing<br/>SHA-256 + salt]
        A3[Session Management<br/>30-minute expiry]
        A4[Automatic Logout<br/>Inactivity timeout]
    end
    
    subgraph "Authorization Layer"
        B1[Role-Based Access<br/>Admin/Manager/Operator/Viewer]
        B2[Permission Enforcement<br/>Server-side validation]
        B3[Audit Logging<br/>All actions logged]
    end
    
    subgraph "Data Protection"
        C1[PCI DSS Compliance<br/>No raw card data]
        C2[Tokenization<br/>Secure card storage]
        C3[TLS 1.3 Encryption<br/>All data in transit]
        C4[Database Encryption<br/>AES-256 at rest]
    end
    
    subgraph "Network Security"
        D1[IP Whitelisting<br/>Optional restriction]
        D2[Rate Limiting<br/>DDoS protection]
        D3[WAF Protection<br/>Cloudflare security]
        D4[Intrusion Detection<br/>Automated monitoring]
    end
    
    A1 --> B1
    B1 --> C1
    C1 --> D1
    
    style A2 fill:#ef4444,color:#fff
    style C2 fill:#10b981,color:#fff
    style D3 fill:#3b82f6,color:#fff
\`\`\`

### Compliance Dashboard Widget

**Real-Time Compliance Monitoring:**

| Compliance Check | Status | Last Verified | Action Required |
|------------------|--------|---------------|-----------------|
| **PCI DSS** | ✅ Compliant | Jan 5, 2026 | Next review: Q2 2026 |
| **KYC Documentation** | ✅ Current | Jan 1, 2026 | Valid until Jan 2027 |
| **LEI Verification** | ✅ Verified | Dec 2025 | Renewal: Dec 2026 |
| **AML Screening** | ✅ Clear | Jan 11, 2026 | Auto-checked daily |
| **Chargeback Ratio** | ✅ 0.3% | Real-time | Target: <1% |
| **Transaction Limits** | ⚠️ 85% of monthly | Real-time | Upgrade plan |

### Audit Trail

**Complete Activity Logging:**

\`\`\`javascript
// Audit log structure
const auditLog = {
  id: "audit_1A2B3C4D",
  timestamp: "2026-01-11T10:30:45Z",
  user_email: "admin@merchant.com",
  user_role: "admin",
  action: "refund_processed",
  resource_type: "transaction",
  resource_id: "txn_XYZ123",
  details: {
    transaction_id: "TXN-20260111-12345",
    original_amount: 100.00,
    refund_amount: 50.00,
    reason: "Customer request",
    partial: true
  },
  ip_address: "203.0.113.42",
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  status: "success"
};

// Audit log retention
const retentionPolicy = {
  financial_records: "7 years",  // PCI/regulatory requirement
  access_logs: "1 year",
  activity_logs: "2 years"
};
\`\`\`

---

## Mobile Experience

### Responsive Design

**Mobile-Optimized Interface:**

\`\`\`yaml
mobile_features:
  responsive_breakpoints:
    mobile: "< 768px"
    tablet: "768px - 1024px"
    desktop: "> 1024px"
    
  mobile_optimizations:
    layout:
      - single_column_cards: "Stacked vertically"
      - collapsible_sidebar: "Hamburger menu"
      - touch_targets: "44×44px minimum (WCAG)"
      - swipe_gestures: "Quick actions on transactions"
      
    performance:
      - lazy_loading: "Charts load on scroll"
      - pagination: "10 items mobile vs 20 desktop"
      - image_compression: "Optimized for 3G/4G"
      - offline_support: "View cached transactions"
      
    navigation:
      - bottom_tab_bar: "Quick access to key pages"
      - search_first: "Prominent search bar"
      - quick_actions_fab: "Floating action button"
\`\`\`

**Mobile Dashboard Layout:**

\`\`\`
┌─────────────────────────────────────┐
│  ☰  Merchant Dashboard          🔔  │ ← Header (sticky)
├─────────────────────────────────────┤
│                                     │
│  Today's Volume          📈         │ ← KPI Card (full width)
│  $12,450                            │
│  +12.5% vs yesterday                │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Success Rate            ✅         │
│  98.7%                              │
│  +0.5%                              │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  📊 Transaction Volume (7d)         │ ← Chart (scrollable)
│  [Area Chart - Touch Interactive]  │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Recent Transactions                │ ← Transaction List
│  ┌─────────────────────────────┐   │
│  │ TXN-12345    $100  ✅       │←  │ (Swipeable cards)
│  │ 10:30 AM     Visa           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ TXN-12344    $250  ✅       │   │
│  │ 09:15 AM     Mastercard     │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  [🏠] [💳] [📊] [⚙️]              │ ← Bottom Tab Bar
└─────────────────────────────────────┘
\`\`\`

**Swipe Actions (Mobile):**

\`\`\`
Transaction Card:
  ← Swipe Left:  Show refund button
  → Swipe Right: View details
  Long Press:    Open action menu
  Tap:           View transaction details
\`\`\`

---

## Performance & Optimization

### Data Loading Strategy

**Optimized for Speed:**

\`\`\`javascript
// React Query configuration for optimal performance
import { useQuery } from '@tanstack/react-query';

const useMerchantTransactions = (filters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => fetchTransactions(filters),
    
    // Caching strategy
    staleTime: 30000,        // Consider fresh for 30 seconds
    cacheTime: 300000,       // Keep in cache for 5 minutes
    
    // Refetch strategy
    refetchOnWindowFocus: true,   // Refresh when tab becomes active
    refetchInterval: 60000,        // Auto-refresh every minute
    
    // Performance
    keepPreviousData: true,        // Smooth pagination transitions
    
    // Prefetch next page
    onSuccess: (data) => {
      if (filters.page < data.totalPages) {
        queryClient.prefetchQuery({
          queryKey: ['transactions', { ...filters, page: filters.page + 1 }],
          queryFn: () => fetchTransactions({ ...filters, page: filters.page + 1 })
        });
      }
    }
  });
};
\`\`\`

**Performance Metrics:**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Initial Page Load** | <2 seconds | 1.8s | ✅ |
| **Dashboard Render** | <1 second | 0.9s | ✅ |
| **Transaction Search** | <500ms | 350ms | ✅ |
| **Chart Rendering** | <1 second | 0.7s | ✅ |
| **API Response Time** | <200ms | 150ms | ✅ |

---

## Complete Menu Structure

### Merchant Portal Navigation

\`\`\`yaml
merchant_portal_menu:
  overview_section:
    - Dashboard (MerchantDashboard)
    
  getting_started:  # Only for new merchants
    - Complete Setup (MerchantInfo)
    - Quick Tour (MerchantHelpCenter)
    
  operations:
    - Transactions (MerchantTransactionList)
    - Virtual Terminal (MerchantVirtualTerminal)
    - Settlements (MerchantSettlements)
    - Disputes (MerchantDisputeManagement)
    
  customers_billing:
    - Customers (MerchantCustomers)
    - Invoices (MerchantInvoicing)
    - Invoice Portal (MerchantInvoicePortal)  # Upload & reconcile
    - Products (MerchantProducts)
    - Subscriptions (MerchantSubscriptions)
    - Payment Links (MerchantPaymentLinks)
    
  analytics_reports:
    - Analytics (MerchantAnalytics)
    - Customer Insights (MerchantCustomerAnalytics)
    - FIX Score (MerchantFIXDashboard)
    - Batch Reports (MerchantBatchReports)
    - Settlement Reports (MerchantSettlementReports)
    - Chargeback Report (MerchantChargebackReport)
    - Statement Report (MerchantStatementReport)
    
  developer_tools:
    - API Keys (MerchantAPIKeys)
    - API Documentation (MerchantAPIDoc)
    - Webhooks (MerchantWebhooks)
    
  settings:
    - Account Settings (MerchantSettings)
    - Team Management (MerchantOperators)
    - Pricing View (MerchantPricingView)
    - Bank Info (MerchantBankInfo)
    - Email Templates (MerchantEmailTemplates)
    - Appearance (MerchantAppearance)
    - Change Password (MerchantChangePassword)
    
  help_support:
    - Help Center (MerchantHelpCenter)
    - Documentation (MerchantAPIDocumentation)
\`\`\`

---

## Conclusion

The Merchant Portal provides comprehensive self-service payment management with real-time analytics, automated reconciliation, FIX score tracking, multi-user collaboration, and enterprise-grade security - empowering merchants to operate payment infrastructure efficiently.

**Portal Highlights:**

✅ **Real-Time Intelligence** - Live dashboards with <1s refresh  
✅ **Complete Transaction Control** - Search, filter, refund, void, export  
✅ **Automated Reconciliation** - AI-powered invoice matching  
✅ **FIX Score System** - Performance rating with tier benefits  
✅ **Multi-User Teams** - Role-based collaboration  
✅ **API Integration** - Self-service credentials  
✅ **Mobile Optimized** - Responsive design for any device  
✅ **Security First** - PCI DSS compliant, encrypted, audited  

**Next Steps:**
- Access your portal at \`/MerchantLogin\`
- Complete account setup and KYC verification
- Connect your first payment method
- Process your first transaction
- Explore FIX Score to unlock benefits

---

**Document Information:**
- **Version:** 4.0
- **Last Updated:** January 11, 2026
- **Classification:** Public - Merchants
- **Contact:** merchant-support@fts.money

© 2026 FTS.Money. All rights reserved.`;

export default MerchantPortalDoc;