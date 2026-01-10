const OrchestrationPortalGuide = `# Orchestration Customer Portal - Complete User Guide
## Payment Routing & Optimization Service Portal Documentation

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Customer Documentation  
**Portal URL:** \`/OrchestrationPortal\`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Portal Overview](#portal-overview)
3. [Access & Authentication](#access--authentication)
4. [Dashboard Features](#dashboard-features)
5. [Processor Management](#processor-management)
6. [Routing Strategy Configuration](#routing-strategy-configuration)
7. [Failover & Redundancy](#failover--redundancy)
8. [Performance Analytics](#performance-analytics)
9. [Cost Optimization](#cost-optimization)
10. [User Management](#user-management)
11. [API Integration](#api-integration)
12. [Troubleshooting](#troubleshooting)

---

## Executive Summary

### What is Payment Orchestration?

Payment Orchestration intelligently routes transactions across multiple payment processors to optimize for:
- **Success Rate** - Retry failed transactions through alternative processors
- **Cost** - Route to lowest-cost processor for each transaction type
- **Performance** - Minimize latency by selecting fastest processor
- **Geography** - Route to local processors for better authorization rates
- **Business Continuity** - Automatic failover if primary processor is down

### Value Proposition

**Without Orchestration:**
- Single processor = single point of failure
- 85% average authorization rate (industry standard)
- No cost optimization
- Manual processor switching during outages

**With FTS Orchestration:**
- Multi-processor redundancy
- **92-96% authorization rate** (7-11% improvement)
- **15-30% cost savings** through intelligent routing
- **Zero downtime** with automatic failover

### Who Uses This Portal?

| User Type | Primary Use Cases | Typical Role |
|-----------|-------------------|--------------|
| **E-commerce Platforms** | Optimize checkout conversion, reduce costs | CTO, VP Engineering |
| **Payment Service Providers** | Offer routing to merchant customers | Product Manager |
| **Marketplaces** | Multi-vendor routing, split payments | Platform Operations |
| **SaaS Companies** | Subscription payment optimization | Finance/RevOps |
| **High-Risk Merchants** | Backup processors for account stability | CEO, Risk Manager |

---

## Portal Overview

### Portal Architecture

\`\`\`mermaid
graph TB
    subgraph "Portal Pages"
        DASH[OrchestrationPortal<br/>Main Dashboard]
        PROC[Processor Management<br/>Add/configure processors]
        RULES[Routing Rules<br/>Strategy builder]
        ROUTE[Routing Visualization<br/>Flow diagrams]
        ANALYTICS[Performance Analytics<br/>Metrics & reports]
        USERS[User Management<br/>Team access]
        API[API Keys<br/>Integration credentials]
    end
    
    subgraph "Backend Orchestration Engine"
        ENGINE[orchestrationEngine<br/>Core routing logic]
        EXEC[OrchestrationExecution<br/>Execution logs]
        RULES_DB[OrchestrationRule<br/>Routing rules]
    end
    
    DASH --> PROC
    DASH --> RULES
    DASH --> ANALYTICS
    
    RULES --> ENGINE
    PROC --> ENGINE
    ENGINE --> EXEC
    
    style DASH fill:#ef4444,color:#fff
    style ENGINE fill:#10b981,color:#fff
\`\`\`

### Subscription Tiers

| Feature | Growth<br/>$999/mo | Professional<br/>$2,999/mo | Enterprise<br/>$9,999/mo |
|---------|-------------------|----------------------------|--------------------------|
| **Included Transactions** | 50,000/month | 200,000/month | 1,000,000/month |
| **Overage Rate** | $0.02/txn | $0.015/txn | $0.01/txn |
| **Processors** | 3 active | 10 active | Unlimited |
| **Routing Rules** | 10 rules | 50 rules | Unlimited |
| **Failover Levels** | 2 levels | 4 levels | Unlimited |
| **Geographic Routing** | ❌ | ✅ | ✅ |
| **Cost Optimization** | ✅ Basic | ✅ Advanced | ✅ AI-powered |
| **Support** | Email (12h) | Priority (2h) | Dedicated (30min) |
| **SLA** | 99.9% | 99.95% | 99.99% |
| **Team Users** | 5 users | 15 users | Unlimited |

---

## Access & Authentication

### Login Process

**Portal URL:** \`https://app.fts.money/OrchestrationLogin\`

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal as Login Page
    participant Auth as orchestrationAuth
    participant DB as OrchestrationUser
    participant Session as Session Store
    
    User->>Portal: Enter email + password
    Portal->>Auth: Authenticate request
    
    Auth->>DB: Find user by email
    DB-->>Auth: User record + customer_id
    
    Auth->>Auth: Verify password hash
    Auth->>Auth: Check status = active
    
    alt Valid
        Auth->>Session: Create session
        Auth-->>Portal: Success + permissions
        Portal->>User: Redirect to dashboard
    else Invalid
        Auth-->>Portal: Error 401
        Portal->>User: Invalid credentials
    end
\`\`\`

### User Roles

| Role | Access | Permissions | Typical User |
|------|--------|-------------|--------------|
| **Owner** | 100% | All features, billing, user management | CEO, CTO |
| **Administrator** | 90% | All except billing | Engineering Manager |
| **Developer** | 60% | Configure rules, test, API keys | Integration Engineer |
| **Operations** | 50% | Monitor, view analytics, send test txns | Support Team |
| **Analyst** | 40% | View analytics, export reports | Business Analyst |
| **Viewer** | 20% | Read-only dashboard access | Auditor |

---

## Dashboard Features

### Main Dashboard Layout

\`\`\`mermaid
graph TB
    subgraph "Key Performance Indicators"
        KPI1[Transactions Today<br/>125,432]
        KPI2[Success Rate<br/>94.2%]
        KPI3[Avg Cost per Txn<br/>$0.18]
        KPI4[Active Processors<br/>7/10]
    end
    
    subgraph "Success Rate by Processor"
        CHART1[Bar Chart<br/>Stripe: 96%, Adyen: 93%, PayPal: 91%]
    end
    
    subgraph "Cost Analysis"
        CHART2[Pie Chart<br/>Processor cost distribution]
    end
    
    subgraph "Recent Executions"
        TABLE[Last 20 transactions<br/>Status, processor, cost, latency]
    end
    
    subgraph "Quick Actions"
        Q1[Test Route]
        Q2[Add Processor]
        Q3[Create Rule]
        Q4[View Analytics]
    end
    
    style KPI2 fill:#10b981,color:#fff
    style KPI3 fill:#3b82f6,color:#fff
\`\`\`

### Real-Time Metrics

**Success Rate Calculation:**
- **Formula:** (Approved + Captured) / Total Attempts × 100
- **Industry Baseline:** 85% (single processor)
- **Orchestration Target:** 92-96%
- **Updates:** Real-time (every transaction)

**Cost per Transaction:**
- **Includes:** Processor fee + FTS orchestration fee
- **Excludes:** Gateway fees, network fees (shown separately)
- **Benchmark:** Against your historical average

---

## Processor Management

### Adding a Payment Processor

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal as Processor Page
    participant Form as Configuration Form
    participant API as Backend
    participant Test as Processor Test
    
    User->>Portal: Click "Add Processor"
    Portal->>Form: Show processor selection
    
    User->>Form: Select processor (Stripe, Adyen, etc.)
    Form->>Form: Load processor-specific fields
    
    User->>Form: Enter API credentials
    User->>Form: Configure settings
    
    Form->>API: Submit configuration
    API->>Test: Test API connection
    
    alt Test Successful
        Test-->>API: Credentials valid
        API->>API: Store encrypted credentials
        API-->>Portal: Processor added
        Portal->>User: Success message
    else Test Failed
        Test-->>API: Invalid credentials
        API-->>Portal: Error details
        Portal->>User: Show error + troubleshooting
    end
\`\`\`

### Supported Processors

| Processor | Supported Methods | Setup Time | Cost Structure |
|-----------|------------------|------------|----------------|
| **Stripe** | Cards, ACH, Wallets | 5 minutes | 2.9% + $0.30 |
| **Adyen** | Cards, Local Methods | 10 minutes | 2.5% + $0.10 (negotiable) |
| **PayPal** | PayPal, Cards | 5 minutes | 3.49% + $0.49 |
| **Checkout.com** | Cards, APMs | 15 minutes | Custom pricing |
| **Braintree** | Cards, PayPal, Venmo | 10 minutes | 2.9% + $0.30 |
| **Worldpay** | Cards, Global Methods | 20 minutes | Enterprise pricing |
| **Square** | Cards, Cash App | 5 minutes | 2.9% + $0.30 |

### Processor Configuration

**Example: Stripe Configuration**

\`\`\`yaml
processor_config:
  processor_name: "Stripe Production"
  provider: "stripe"
  environment: "live"
  
  credentials:
    api_key: "sk_live_..."  # Encrypted at rest
    webhook_secret: "whsec_..."
    
  capabilities:
    - card_payments
    - ach_payments
    - apple_pay
    - google_pay
    
  geographic_priority:
    - US
    - CA
    - GB
    
  cost_structure:
    percentage: 2.9
    fixed_fee: 0.30
    currency: "USD"
    
  limits:
    min_amount: 0.50
    max_amount: 999999.99
    daily_limit: 1000000.00
    
  features:
    3ds_enabled: true
    network_tokens: true
    auto_capture: true
\`\`\`

---

## Routing Strategy Configuration

### Strategy Types

\`\`\`mermaid
graph TB
    subgraph "Routing Strategies"
        S1[Cost Optimization<br/>Route to cheapest processor]
        S2[Success Rate Optimization<br/>Route to highest success rate]
        S3[Performance Optimization<br/>Route to fastest processor]
        S4[Geographic Routing<br/>Route to local processor]
        S5[Custom Rules<br/>Complex logic builder]
    end
    
    subgraph "Decision Factors"
        F1[Transaction Amount]
        F2[Card Type/BIN]
        F3[Currency]
        F4[Customer Location]
        F5[Time of Day]
        F6[Historical Success]
    end
    
    S1 --> F1
    S2 --> F6
    S3 --> F4
    S4 --> F4
    S5 --> F1
    S5 --> F2
    S5 --> F3
    
    style S1 fill:#10b981,color:#fff
    style S2 fill:#3b82f6,color:#fff
    style S3 fill:#8b5cf6,color:#fff
\`\`\`

### Example Routing Rules

**Rule 1: Cost-Optimized for Small Transactions**

\`\`\`javascript
{
  "rule_name": "Small Transaction Cost Optimization",
  "priority": 1,
  "enabled": true,
  "conditions": {
    "amount": {
      "operator": "less_than",
      "value": 50,
      "currency": "USD"
    }
  },
  "routing_strategy": "cost_optimization",
  "processors": [
    {
      "processor_id": "proc_stripe_1",
      "priority": 1,
      "weight": 70
    },
    {
      "processor_id": "proc_square_1",
      "priority": 2,
      "weight": 30
    }
  ]
}
\`\`\`

**Rule 2: High-Value Success Rate Priority**

\`\`\`javascript
{
  "rule_name": "High Value - Optimize Success",
  "priority": 2,
  "conditions": {
    "amount": {
      "operator": "greater_than",
      "value": 1000
    }
  },
  "routing_strategy": "success_rate_optimization",
  "processors": [
    {
      "processor_id": "proc_adyen_1",
      "priority": 1,
      "historical_success_rate": 96.8
    },
    {
      "processor_id": "proc_stripe_1",
      "priority": 2,
      "historical_success_rate": 95.2
    }
  ]
}
\`\`\`

### Routing Decision Flow

\`\`\`mermaid
flowchart TD
    START[Transaction Received] --> EVAL[Evaluate Routing Rules]
    EVAL --> MATCH{Rule Match?}
    
    MATCH -->|Yes| STRATEGY[Apply Routing Strategy]
    MATCH -->|No| DEFAULT[Use Default Processor]
    
    STRATEGY --> COST{Strategy Type}
    
    COST -->|Cost| SELECT_CHEAP[Select Cheapest Processor]
    COST -->|Success| SELECT_BEST[Select Highest Success Rate]
    COST -->|Performance| SELECT_FAST[Select Lowest Latency]
    COST -->|Geographic| SELECT_LOCAL[Select Local Processor]
    
    SELECT_CHEAP --> PROCESS[Process Transaction]
    SELECT_BEST --> PROCESS
    SELECT_FAST --> PROCESS
    SELECT_LOCAL --> PROCESS
    DEFAULT --> PROCESS
    
    PROCESS --> RESULT{Success?}
    
    RESULT -->|Yes| DONE[Transaction Complete]
    RESULT -->|No| RETRY{Retry Available?}
    
    RETRY -->|Yes| FAILOVER[Failover to Next Processor]
    RETRY -->|No| FAILED[Transaction Failed]
    
    FAILOVER --> PROCESS
    
    style STRATEGY fill:#3b82f6,color:#fff
    style PROCESS fill:#10b981,color:#fff
    style DONE fill:#10b981,color:#fff
    style FAILED fill:#ef4444,color:#fff
\`\`\`

---

## Failover & Redundancy

### Cascading Failover Configuration

\`\`\`mermaid
graph LR
    TXN[Transaction] --> P1[Primary Processor<br/>Stripe]
    
    P1 -->|Success| DONE[Complete]
    P1 -->|Decline/Error| P2[Secondary Processor<br/>Adyen]
    
    P2 -->|Success| DONE
    P2 -->|Decline/Error| P3[Tertiary Processor<br/>Checkout.com]
    
    P3 -->|Success| DONE
    P3 -->|Decline/Error| FAIL[Final Decline]
    
    style P1 fill:#3b82f6,color:#fff
    style P2 fill:#8b5cf6,color:#fff
    style P3 fill:#f59e0b,color:#fff
    style DONE fill:#10b981,color:#fff
    style FAIL fill:#ef4444,color:#fff
\`\`\`

### Failover Configuration

\`\`\`javascript
{
  "failover_chain": [
    {
      "level": 1,
      "processor_id": "proc_stripe_1",
      "retry_conditions": [
        "processor_error",
        "timeout",
        "rate_limit"
      ],
      "skip_conditions": [
        "insufficient_funds",
        "card_declined",
        "fraud_suspected"
      ]
    },
    {
      "level": 2,
      "processor_id": "proc_adyen_1",
      "retry_conditions": [
        "processor_error",
        "timeout"
      ],
      "max_attempts": 2
    },
    {
      "level": 3,
      "processor_id": "proc_checkout_1",
      "final_attempt": true
    }
  ],
  "max_total_attempts": 3,
  "abort_on": [
    "fraud_confirmed",
    "invalid_card",
    "expired_card"
  ]
}
\`\`\`

---

## Performance Analytics

### Analytics Dashboard

\`\`\`mermaid
graph TB
    subgraph "Performance Metrics"
        M1[Overall Success Rate<br/>94.2%]
        M2[Average Latency<br/>387ms]
        M3[Cost per Transaction<br/>$0.21]
        M4[Failover Rate<br/>8.3%]
    end
    
    subgraph "Processor Comparison"
        CHART1[Success Rate by Processor<br/>Bar chart]
        CHART2[Cost by Processor<br/>Pie chart]
        CHART3[Latency Distribution<br/>Histogram]
    end
    
    subgraph "Routing Effectiveness"
        CHART4[Rule Utilization<br/>Which rules are used]
        CHART5[Failover Success<br/>How often failover works]
        CHART6[Time Series<br/>Success rate over time]
    end
    
    style M1 fill:#10b981,color:#fff
    style M3 fill:#3b82f6,color:#fff
\`\`\`

### Key Metrics Explained

**Success Rate by Processor:**
- Shows authorization rate per processor
- Helps identify underperforming processors
- Auto-disables processors with <80% success rate

**Cost Analysis:**
- Breaks down cost by processor
- Shows savings vs single-processor approach
- Includes FTS orchestration fee

**Failover Success:**
- What % of failed transactions succeed on retry
- Typical: 60-70% of failed attempts succeed on 2nd try
- Validates value of multi-processor setup

### Performance Reports

| Report | Data Included | Frequency | Export |
|--------|---------------|-----------|--------|
| **Daily Summary** | Volume, success rate, cost | Daily 9am | PDF, Excel |
| **Processor Scorecard** | Per-processor metrics, rankings | Weekly | Excel, CSV |
| **Cost Optimization** | Potential savings, recommendations | Monthly | PDF |
| **Routing Effectiveness** | Rule performance, utilization | Monthly | Excel |
| **Custom Reports** | User-defined metrics | On-demand | CSV, JSON |

---

## Cost Optimization

### Cost Optimization Strategies

\`\`\`mermaid
graph TB
    TXN[Incoming Transaction] --> ANALYZE[Analyze Transaction]
    
    ANALYZE --> AMOUNT{Amount?}
    
    AMOUNT -->|< $10| SMALL[Small Transaction<br/>Minimize fixed fee]
    AMOUNT -->|$10-$100| MEDIUM[Medium Transaction<br/>Balance rate + fee]
    AMOUNT -->|> $100| LARGE[Large Transaction<br/>Minimize percentage]
    
    SMALL --> PROC_SMALL[Route to Square<br/>2.9% + $0.30]
    MEDIUM --> PROC_MED[Route to Stripe<br/>2.9% + $0.30]
    LARGE --> PROC_LARGE[Route to Adyen<br/>2.5% + $0.10]
    
    PROC_SMALL --> COST_SMALL[$0.59 for $10 txn]
    PROC_MED --> COST_MED[$3.20 for $100 txn]
    PROC_LARGE --> COST_LARGE[$25.10 for $1,000 txn]
    
    style ANALYZE fill:#8b5cf6,color:#fff
    style COST_SMALL fill:#10b981,color:#fff
    style COST_MED fill:#10b981,color:#fff
    style COST_LARGE fill:#10b981,color:#fff
\`\`\`

### Savings Calculator

**Example Scenario:**

| Metric | Single Processor | With Orchestration | Savings |
|--------|------------------|-------------------|---------|
| **Monthly Volume** | 100,000 txns | 100,000 txns | - |
| **Avg Transaction** | $75 | $75 | - |
| **Processor Fee** | 2.9% + $0.30 | 2.6% avg + $0.25 avg | 0.3% + $0.05 |
| **Cost per Txn** | $2.48 | $2.20 | **$0.28 (11.3%)** |
| **Monthly Cost** | $248,000 | $220,000 | **$28,000** |
| **Annual Savings** | - | - | **$336,000** |

---

## User Management

### Multi-User Setup

**Invitation Process:**

1. Owner/Admin navigates to **User Management**
2. Click **"Invite User"**
3. Enter email, name, select role
4. User receives invitation email
5. User sets password, logs in
6. Access granted based on role

### Permission Matrix

| Action | Owner | Admin | Developer | Operations | Analyst | Viewer |
|--------|-------|-------|-----------|------------|---------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Processors | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Add Processor | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Processor | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete Processor | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Routing Rule | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit Routing Rule | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Executions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Test Routing | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage API Keys | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Billing | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## API Integration

### REST API

**Base URL:** \`https://api.fts.money/orchestration\`

**Endpoints:**

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|--------------|
| \`/route\` | POST | Route single transaction | API Key |
| \`/simulate\` | POST | Simulate routing (no actual charge) | API Key |
| \`/executions\` | GET | Query routing history | API Key |
| \`/processors\` | GET | List active processors | API Key |

### API Request Example

\`\`\`javascript
// Route a payment transaction
const response = await fetch('https://api.fts.money/orchestration/route', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_orch_abc123...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 99.99,
    currency: 'USD',
    payment_method: {
      type: 'card',
      card_number: '4532123456789012',
      exp_month: 12,
      exp_year: 2028,
      cvc: '123'
    },
    customer: {
      email: 'customer@example.com',
      billing_address: {
        country: 'US',
        postal_code: '10001'
      }
    },
    metadata: {
      order_id: 'order_12345'
    }
  })
});

const result = await response.json();

// Response structure
{
  "execution_id": "exec_xyz789",
  "status": "approved",
  "selected_processor": "stripe",
  "processor_response": {
    "charge_id": "ch_abc123",
    "status": "succeeded"
  },
  "latency_ms": 342,
  "cost": {
    "processor_fee": 3.20,
    "orchestration_fee": 0.02,
    "total": 3.22
  }
}
\`\`\`

### Webhooks

**Event Types:**

\`\`\`yaml
webhook_events:
  route.completed:
    description: "Transaction successfully routed"
    payload:
      - execution_id
      - processor_used
      - status
      - cost
      
  route.failed:
    description: "All processors failed"
    payload:
      - execution_id
      - attempts
      - final_error
      
  processor.down:
    description: "Processor health check failed"
    payload:
      - processor_id
      - last_success
      - downtime_duration
\`\`\`

---

## Billing & Usage

### Usage Tracking

\`\`\`yaml
monthly_usage:
  billing_period: "2026-01-01 to 2026-01-31"
  
  tier: "Professional"
  included_transactions: 200000
  actual_transactions: 287543
  overage_transactions: 87543
  
  charges:
    base_subscription: 2999.00
    overage_charges: 1313.15  # 87,543 × $0.015
    total: 4312.15
    
  breakdown_by_processor:
    stripe: 145234 txns, $4,234.56 processor fees
    adyen: 98765 txns, $2,789.23 processor fees
    paypal: 43544 txns, $1,567.89 processor fees
    
  savings:
    single_processor_cost: 8591.62
    orchestration_cost: 4312.15
    total_savings: 4279.47
    savings_percentage: 49.8%
\`\`\`

---

## Troubleshooting

### Common Issues

**Issue: Low Success Rate (<90%)**

**Possible Causes:**
- Processor credentials expired
- Geographic mismatch (US cards to EU processor)
- 3DS not enabled for European cards
- Insufficient processor capacity

**Solutions:**
1. Check processor connection status
2. Review geographic routing rules
3. Enable 3DS for all processors
4. Add additional processors for load balancing

**Issue: High Latency (>500ms)**

**Solutions:**
- Enable geographic routing
- Use processors with local presence
- Check network latency to processors
- Reduce failover chain depth

**Issue: Unexpected Costs**

**Solutions:**
- Review routing rules (may be using expensive processor)
- Check for failed transactions (retry costs add up)
- Consider tier upgrade if consistently over limit

---

## Best Practices

### Routing Configuration

✅ **Do:**
- Start with 3-5 processors for redundancy
- Test all routing rules in sandbox first
- Monitor processor success rates weekly
- Configure smart failover chains
- Use geographic routing for international customers

❌ **Don't:**
- Route all transactions to cheapest processor (may have low success rate)
- Create overlapping routing rules
- Exceed 10 levels of failover (adds latency)
- Ignore processor downtime alerts

### Cost Optimization

✅ **Do:**
- Analyze cost by transaction amount range
- Negotiate volume discounts with processors
- Use cost optimization strategy for <$50 transactions
- Review monthly cost reports

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026
- **Owner:** Product Documentation Team
- **Contact:** docs@fts.money

© 2026 FTS.Money. All rights reserved.
`;

export default OrchestrationPortalGuide;