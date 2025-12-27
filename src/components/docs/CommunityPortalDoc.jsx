const CommunityPortalDoc = `# Community Portal Documentation
## Self-Service Payment Infrastructure Marketplace

**Version:** 1.0  
**Classification:** Public - Community Users  
**Last Updated:** December 26, 2025  
**Document Owner:** FTS.Money Community Team

---

## Table of Contents

1. [Welcome to FTS.Money Community](#welcome)
2. [Getting Started](#getting-started)
3. [PSP Provisioning](#psp-provisioning)
4. [ISO Gateway Service](#iso-gateway-service)
5. [Orchestration Service](#orchestration-service)
6. [Service Marketplace](#service-marketplace)
7. [Billing & Subscriptions](#billing--subscriptions)
8. [Support & Resources](#support--resources)

---

## Welcome to FTS.Money Community

### What is the Community Portal?

Welcome to the future of payment infrastructure. The Community Portal is where you transform from a payment infrastructure consumer to a payment infrastructure provider. This is where fintech founders become PSP owners, where ISOs expand their capabilities, and where software companies add embedded finance.

The **FTS.Money Community Portal** is your gateway to launching and managing payment infrastructure services. It's designed to be incredibly simple for beginners (you can launch a basic PSP in under an hour) while providing the depth that sophisticated operators need for complex deployments.

Think of it as the "AWS Console" for payments. Just as AWS democratized cloud computing by making enterprise infrastructure accessible to startups, we're democratizing payment infrastructure. You get the same capabilities that power companies like Stripe and Adyen, without the $50M investment and 18-month development timeline.

Whether you're building a PSP, connecting legacy systems, or optimizing payment routing—everything starts here. Your journey to becoming a payment infrastructure provider begins with a single click.

### Platform Services

\`\`\`mermaid
mindmap
  root((Community<br/>Portal))
    PSP Launch
      Choose Tier
      Configure
      Deploy 24-48h
      Go Live
    Crypto Gateway
      Multi-Chain Wallets
      Virtual IBANs
      Card Issuing
      EU Compliant
    ISO Gateway
      Legacy Systems
      8583 & 20022
      SWIFT MT
      Message Translation
    Orchestration
      Smart Routing
      Multi-Processor
      Cost Optimization
      Failover
    Marketplace
      150+ Services
      Payment Providers
      Compliance Tools
      One-Click Integration
\`\`\`

### Who is This For?

**Perfect for:**
- 🚀 Fintech Startups
- 💼 Payment Service Providers
- 🏦 Independent Sales Organizations (ISOs)
- 🛍️ E-commerce Platforms
- 🌐 Marketplaces
- 🏢 Enterprise Payment Teams
- 💻 Software Companies (Embedded Finance)
- 🪙 Cryptocurrency Exchanges
- 🔗 DeFi Platforms

---

## Getting Started

### Create Your Account

Creating your account is deliberately simple - we don't ask for payment details or business verification upfront. We want you to explore the platform, understand the capabilities, and provision a test PSP before committing financially.

This approach differs from traditional payment companies that require extensive paperwork and business verification before you can even see their platform. We believe in transparency - try the product, understand the value, then buy. The entire signup process takes under 5 minutes.

After signup, you'll complete your profile with information that helps us provide better service and appropriate resources. Are you a solo founder or a 50-person team? That determines what onboarding support you need. Are you processing $10K or $10M monthly? That affects which tier makes sense.

**Step 1: Sign Up**

Visit [community.fts.money/signup](https://community.fts.money/signup)

\`\`\`
Required Information:
• Full Name
• Email Address
• Company Name (optional)
• Password (16+ characters)
• Country
\`\`\`

**Step 2: Verify Email**

Check your inbox for verification link:
\`\`\`
From: FTS.Money <welcome@fts.money>
Subject: Verify your email address

Welcome to FTS.Money!

Click here to verify your email:
[Verify Email Button]

This link expires in 24 hours.
\`\`\`

**Step 3: Complete Profile**

\`\`\`yaml
profile_information:
  personal:
    - full_name: required
    - phone_number: optional
    - timezone: required
  
  company:
    - company_name: required
    - website: optional
    - industry:
        - fintech
        - ecommerce
        - saas
        - marketplace
        - other
    - company_size:
        - "1-10"
        - "11-50"
        - "51-200"
        - "201-1000"
        - "1000+"
  
  use_case:
    - what_are_you_building:
        - launch_psp
        - integrate_legacy_systems
        - optimize_payment_routing
        - add_payment_methods
        - other
    - expected_volume: 
        - "< $100K/month"
        - "$100K - $1M/month"
        - "$1M - $10M/month"
        - "> $10M/month"
\`\`\`

### Dashboard Overview

\`\`\`mermaid
graph TB
    A[Community Dashboard] --> B[My Services]
    A --> C[Service Marketplace]
    A --> D[Billing]
    A --> E[Support]
    
    B --> B1[Active PSP Instances]
    B --> B2[ISO Gateway Customers]
    B --> B3[Orchestration Customers]
    B --> B4[Service Subscriptions]
    
    C --> C1[Browse Services]
    C --> C2[Payment Providers]
    C --> C3[Compliance Tools]
    C --> C4[Developer Tools]
    
    D --> D1[Current Usage]
    D --> D2[Invoices]
    D --> D3[Payment Methods]
    
    E --> E1[Documentation]
    E --> E2[Tickets]
    E --> E3[Community Forum]
\`\`\`

---

## PSP Provisioning

### Why Launch a PSP?

Launching a PSP has traditionally been the domain of well-funded companies with $10M+ in capital and teams of 50+ engineers. This high barrier to entry meant the payment processing market was dominated by a few large players, with limited competition and innovation.

But the market is changing. Embedded finance is exploding - software companies want to offer payments as part of their product. Regional players want to compete with global processors by focusing on local payment methods. Vertical SaaS companies want to own the payment experience in their industry.

All these businesses need PSP capabilities, but they don't want to build payment infrastructure - it's not their core competency. They want to focus on their unique value proposition (e.g., the best restaurant POS, the best education management system) and use a white-label PSP for payments.

That's the opportunity FTS.Money addresses. We've compressed the 18-36 month build timeline into 24-48 hours. We've reduced the $5M-$50M investment to $499-$4,999/month. We've abstracted the complexity so you can focus on your business while we handle the infrastructure.

**Traditional Approach:**
\`\`\`
Cost: $5M - $50M initial investment
Time: 12-36 months development
Team: 50+ engineers
Infrastructure: Build from scratch
Compliance: DIY (expensive)
Risk: High failure rate
\`\`\`

**FTS.Money Approach:**
\`\`\`
Cost: $499 - $4,999/month
Time: 24-48 hours
Team: Focus on business (not tech)
Infrastructure: Fully managed
Compliance: Built-in (PCI, ISO, GDPR)
Risk: Proven platform
\`\`\`

### Provisioning Flow

| Step | Task | Duration | Details |
|------|------|----------|---------|
| **1** | Initialize provisioning queue | 30 seconds | Request validation & priority assignment |
| **2** | Create tenant schema | 2 minutes | PostgreSQL schema with isolation |
| **3** | Allocate cloud resources | 5 minutes | Compute, storage, network (K8s cluster) |
| **4** | Deploy database cluster | 3 minutes | Primary + replica nodes with encryption |
| **5** | Deploy core services | 10 minutes | API gateway, auth, transaction processor |
| **6** | Deploy portals | 8 minutes | Admin portal, merchant portal, VT |
| **7** | Configure networking | 2 minutes | Load balancer, SSL certificates, DNS |
| **8** | Apply security policies | 3 minutes | Firewall rules, IAM roles, encryption keys |
| **9** | Initialize data | 2 minutes | Default settings, templates, fee structures |
| **10** | Run health checks | 4 minutes | API tests, database connectivity, service mesh |
| **11** | Generate credentials | 1 minute | API keys, admin passwords, webhook secrets |
| **12** | Send welcome email | 30 seconds | Access credentials & quickstart guide |
| **Total** | **End-to-end provisioning** | **~40 minutes** | Fully automated, zero manual steps |

### Service Tiers

\`\`\`mermaid
graph LR
    subgraph Starter
        S1[Monthly: $499]
        S2[1K txns included]
        S3[5 merchants]
        S4[1 region]
        S5[Email support]
    end
    
    subgraph Professional
        P1[Monthly: $999]
        P2[50K txns included]
        P3[Unlimited merchants]
        P4[Multi-region]
        P5[24/7 support]
    end
    
    subgraph Enterprise
        E1[Monthly: $4,999]
        E2[Unlimited txns]
        E3[Unlimited merchants]
        E4[Global deployment]
        E5[Dedicated team]
    end
    
    S5 -.->|Upgrade| P1
    P5 -.->|Upgrade| E1
\`\`\`

**Detailed Comparison:**

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| **Pricing** |
| Monthly Fee | $499 | $999 | $4,999 |
| Included Transactions | 1,000 | 50,000 | Unlimited |
| Overage Fee | $0.05/txn | $0.02/txn | Custom |
| **Limits** |
| Merchants | 5 | Unlimited | Unlimited |
| Regions | 1 | 2 | Global |
| API Calls | 10K/hour | 100K/hour | Unlimited |
| **Features** |
| Admin Portal | ✅ | ✅ | ✅ |
| Merchant Portal | ✅ | ✅ | ✅ + White-label |
| Virtual Terminal | ✅ | ✅ | ✅ |
| REST API | ✅ | ✅ | ✅ + GraphQL |
| Webhooks | ✅ | ✅ | ✅ |
| Card Processing | ✅ | ✅ | ✅ |
| ACH/SEPA | ❌ | ✅ | ✅ |
| Cryptocurrency | ❌ | ✅ | ✅ |
| Digital Wallets | ✅ | ✅ | ✅ |
| **Risk & Fraud** |
| Basic Fraud Detection | ✅ | ✅ | ✅ |
| Advanced ML Fraud | ❌ | ✅ | ✅ |
| 3D Secure | ✅ | ✅ | ✅ |
| Manual Review Queue | ❌ | ✅ | ✅ |
| **Reporting** |
| Standard Reports | ✅ | ✅ | ✅ |
| Custom Reports | ❌ | ✅ | ✅ |
| Real-time Analytics | ❌ | ✅ | ✅ |
| Data Export | CSV | CSV, Excel | CSV, Excel, API |
| **Support** |
| Support Channel | Email | Email + Chat | Dedicated Slack |
| Response Time | 24 hours | 4 hours | 1 hour |
| Availability | Business hours | 24/7 | 24/7 + Phone |
| Onboarding | Self-service | Guided | White-glove |
| **SLA** |
| Uptime Guarantee | 99.9% | 99.95% | 99.99% |
| Credits for Downtime | ❌ | ✅ | ✅ |

### Configuration Wizard

**Step 1: Basic Information**

\`\`\`yaml
psp_configuration:
  basic_info:
    psp_name: "Your Company Payments"
    psp_code: "yourcompany"  # Unique identifier
    domain: "yourcompany.fts.money"  # Can use custom domain
    contact_email: "admin@yourcompany.com"
    timezone: "America/New_York"
\`\`\`

**Step 2: Payment Methods**

\`\`\`
☑ Card Payments
  ☑ Visa
  ☑ Mastercard
  ☑ American Express
  ☑ Discover
  
☑ Digital Wallets
  ☑ Apple Pay
  ☑ Google Pay
  ☐ PayPal (Professional+ only)
  
☐ Bank Transfers (Professional+ only)
  ☐ ACH (US)
  ☐ SEPA (EU)
  ☐ Wire Transfer
  
☐ Cryptocurrency (Professional+ only)
  ☐ Bitcoin
  ☐ Ethereum
  ☐ USDC Stablecoin
\`\`\`

**Step 3: Geographic Setup**

\`\`\`mermaid
graph TB
    A[Select Regions] --> B{Starter Tier?}
    B -->|Yes| C[Single Region Only]
    B -->|No| D[Multi-Region Available]
    
    C --> E[Choose Primary]
    E --> E1[US East]
    E --> E2[US West]
    E --> E3[EU Ireland]
    E --> E4[EU Frankfurt]
    E --> E5[Singapore]
    
    D --> F[Choose Primary + Secondary]
    F --> F1[Auto-failover enabled]
    F --> F2[Load balancing]
\`\`\`

**Step 4: Features & Modules**

\`\`\`
Core Features (Included):
  ✓ Transaction processing
  ✓ Merchant management
  ✓ Basic reporting
  ✓ API access
  ✓ Webhook notifications

Optional Add-ons:
  ☐ Advanced Fraud Detection   +$199/month
  ☐ Subscription Billing        +$149/month
  ☐ Invoice Generator           +$99/month
  ☐ White-label Mobile Apps     +$299/month
  ☐ Custom Integrations         +$499/month
\`\`\`

**Step 5: Branding**

\`\`\`
Upload Logo:
  [Choose File] yourlogo.png
  
Color Scheme:
  Primary Color:   [#1E40AF] 
  Secondary Color: [#06B6D4] 
  Accent Color:    [#8B5CF6] 
  
Email Templates:
  ○ Use FTS.Money branding
  ● Customize with my branding
  
Domain:
  ○ yourcompany.fts.money (free)
  ● Custom domain: pay.yourcompany.com (+$20/month)
\`\`\`

**Step 6: Business Verification**

\`\`\`yaml
kyb_requirements:
  business_documents:
    - articles_of_incorporation
    - ein_letter  # or equivalent tax ID
    - business_license
    - utility_bill  # proof of address
    
  beneficial_owners:
    - full_name
    - date_of_birth
    - ssn_or_passport
    - ownership_percentage
    - residential_address
    
  bank_account:
    - bank_name
    - account_holder_name
    - account_number
    - routing_number
    - void_check  # or bank statement
\`\`\`

### Deployment Process

\`\`\`mermaid
gantt
    title PSP Provisioning Timeline
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Submission
    Application submitted           :done, submit, 00:00, 00:05
    
    section Verification
    KYB verification                :active, kyb, 00:05, 02:00
    Compliance checks               :comp, after kyb, 00:30
    
    section Infrastructure
    Database schema creation        :db, after comp, 00:15
    Cloud resources allocation      :cloud, after db, 00:20
    
    section Deployment
    Application deployment          :deploy, after cloud, 00:30
    Service configuration           :config, after deploy, 00:15
    
    section Testing
    Automated testing               :test, after config, 00:20
    Health checks                   :health, after test, 00:10
    
    section Completion
    Credentials generated           :creds, after health, 00:05
    Welcome email sent              :email, after creds, 00:02
\`\`\`

**Total Time: 24-48 hours** (most time is KYB verification)

### Post-Launch Checklist

\`\`\`
☐ Access admin portal
☐ Review dashboard
☐ Configure payment settings
☐ Set up fee structures
☐ Add team members
☐ Generate API keys
☐ Test in sandbox mode
☐ Integrate webhooks
☐ Onboard first test merchant
☐ Process test transaction
☐ Review reports
☐ Switch to production mode
☐ Onboard real merchants
☐ Go live!
\`\`\`

---

## ISO Gateway Service

### What is ISO Gateway?

Here's a problem most people outside the payment industry don't realize exists: financial systems speak different languages. A bank's core system from 1985 speaks ISO 8583. Modern payment networks speak ISO 20022. International wire transfers speak SWIFT MT. They literally cannot communicate directly.

This creates a massive integration bottleneck. Banks want to offer modern payment capabilities but their 30-year-old core systems can't connect to new payment networks without expensive translation layers. Building these translators costs millions and takes 12-18 months. Most banks simply don't bother, which stifles innovation.

The ISO Gateway Service solves this elegantly. We've built enterprise-grade translators that convert between any payment message format in real-time - ISO 8583 to ISO 20022, SWIFT MT to ISO 20022, proprietary formats to standard formats, you name it.

For a regional bank, this means they can connect their legacy core banking system to modern instant payment networks (FedNow, RTP) without a multi-year, multi-million dollar rewrite. They just plug into our gateway, we handle the translation, and they're instantly modern. For us, it's a high-margin SaaS product with strong lock-in because switching translation layers is risky and expensive.

The ISO Gateway Service enables seamless translation between payment messaging standards, allowing you to connect legacy systems to modern payment networks.

### Supported Standards

\`\`\`mermaid
graph LR
    A[Legacy Systems] --> B[ISO Gateway]
    C[Modern Systems] --> B
    
    B --> D[ISO 8583<br/>Card Networks]
    B --> E[ISO 20022<br/>Banking]
    B --> F[SWIFT MT<br/>Wire Transfers]
    
    D --> G[Visa]
    D --> H[Mastercard]
    D --> I[Amex]
    
    E --> J[SEPA]
    E --> K[FedNow]
    E --> L[RTP]
    
    F --> M[MT103]
    F --> N[MT202]
    F --> O[MT940]
\`\`\`

### Use Cases

**1. Legacy System Modernization**

\`\`\`
Before:
┌──────────────┐      ┌─────────────┐
│ 20-Year-Old  │──────│  Card       │
│ Banking Core │ ✗    │  Networks   │
└──────────────┘      └─────────────┘
     (Can't communicate directly)

After:
┌──────────────┐      ┌──────────────┐      ┌─────────────┐
│ Banking Core │──────│ ISO Gateway  │──────│  Card       │
│ (ISO 8583)   │  ✓   │ Translation  │  ✓   │  Networks   │
└──────────────┘      └──────────────┘      └─────────────┘
\`\`\`

**2. Multi-Standard Support**

Accept transactions in any format, translate automatically:

\`\`\`
Input:  ISO 8583 message from ATM
Output: ISO 20022 payment instruction

Input:  SWIFT MT103 wire transfer
Output: ISO 20022 pacs.008 message

Input:  Proprietary format
Output: Standard ISO 8583
\`\`\`

**3. Network Connectivity**

\`\`\`mermaid
graph TB
    A[Your Application] --> B[ISO Gateway]
    
    B --> C[Visa Network]
    B --> D[Mastercard Network]
    B --> E[SEPA Network]
    B --> F[SWIFT Network]
    B --> G[ACH Network]
    
    C --> H[Card Authorization]
    D --> H
    E --> I[Account Transfers]
    F --> J[International Wires]
    G --> K[Domestic ACH]
\`\`\`

### Getting Started with ISO Gateway

**Step 1: Subscribe**

\`\`\`yaml
iso_gateway_subscription:
  setup_fee: $2,500  # One-time
  monthly_fee: $499 - $2,499  # Based on volume
  per_message_fee: $0.01 - $0.10
  
  included_messages:
    starter: 5,000/month
    professional: 50,000/month
    enterprise: unlimited
\`\`\`

**Step 2: Configure Connection**

\`\`\`json
{
  "customer_id": "iso_customer_abc123",
  "connection_name": "Production ATM Network",
  "source_format": "ISO_8583",
  "target_format": "ISO_20022",
  "endpoints": {
    "inbound": {
      "protocol": "TCP/IP",
      "host": "gateway.fts.money",
      "port": 8583,
      "tls": true
    },
    "outbound": {
      "protocol": "HTTPS",
      "url": "https://api.yourprocessor.com/v1",
      "auth": "API_KEY"
    }
  },
  "message_types": [
    "0100",  // Authorization request
    "0110",  // Authorization response
    "0200",  // Financial transaction
    "0210"   // Financial response
  ]
}
\`\`\`

**Step 3: Test in Sandbox**

\`\`\`bash
# Example: Send test ISO 8583 message
curl -X POST https://gateway-sandbox.fts.money/iso8583 \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mti": "0100",
    "fields": {
      "2": "4111111111111111",
      "3": "000000",
      "4": "000000010000",
      "7": "0626101530",
      "11": "123456",
      "41": "TERMINAL1",
      "42": "MERCHANT001"
    }
  }'

# Response: Translated ISO 20022 message
{
  "status": "success",
  "translated_message": {
    "Document": {
      "FIToFICstmrCdtTrf": {
        "GrpHdr": {
          "MsgId": "MSG123456",
          "CreDtTm": "2025-06-26T10:15:30Z"
        }
      }
    }
  }
}
\`\`\`

### Pricing Example

\`\`\`
ISO Gateway Pricing Calculator

Monthly Volume: 25,000 messages

Setup Fee:              $2,500 (one-time)
Monthly Subscription:     $999
Message Fees:
  - First 10,000:    $0.05 × 10,000 = $500
  - Next 15,000:     $0.03 × 15,000 = $450
                                     ─────
Total First Month:                  $4,449
Monthly Recurring:                  $1,949

Annual Cost (after setup): $23,388
Cost per Message: $0.078
\`\`\`

---

## Orchestration Service

### What is Payment Orchestration?

Imagine you're running a PSP and relying entirely on Stripe for payment processing. One day, Stripe has an outage (they all do eventually). Your entire business stops. Merchants can't process transactions. You're losing thousands in revenue per minute. Customer support is overwhelmed. Your reputation takes a hit.

Or consider a different scenario: you're paying Stripe 2.9% + $0.30 per transaction. Then you discover that for European transactions, Adyen charges only 2.5% + $0.25. For small transactions under $25, Checkout.com is even cheaper. You're overpaying on every transaction because you're locked into a single processor.

Payment orchestration solves both problems. It connects you to multiple processors and intelligently routes each transaction to the optimal one based on your goals - minimize cost, maximize success rate, reduce latency, ensure redundancy, or any combination.

The system monitors processor performance in real-time. When a processor's success rate drops or their API times out, traffic automatically shifts to alternatives. When a processor goes down completely, failover happens in seconds with zero manual intervention. This isn't just a nice-to-have feature - it's business continuity insurance.

Payment orchestration intelligently routes transactions across multiple payment processors to optimize success rates, reduce costs, and ensure high availability.

### Key Benefits

\`\`\`mermaid
graph TB
    A[Payment Orchestration] --> B[Higher Success Rates]
    A --> C[Lower Costs]
    A --> D[Better Performance]
    A --> E[Business Continuity]
    
    B --> B1[Smart routing<br/>to best processor]
    B --> B2[Automatic failover<br/>when processor down]
    B --> B3[Retry logic<br/>for soft declines]
    
    C --> C1[Route to lowest<br/>cost processor]
    C --> C2[Volume discounts<br/>optimization]
    C --> C3[Currency conversion<br/>optimization]
    
    D --> D1[Fastest processor<br/>for region]
    D --> D2[Load balancing<br/>across processors]
    D --> D3[Peak handling<br/>auto-scale]
    
    E --> E1[Multiple backup<br/>processors]
    E --> E2[Automatic health<br/>monitoring]
    E --> E3[Zero-downtime<br/>failover]
\`\`\`

### How It Works

\`\`\`mermaid
sequenceDiagram
    participant M as Merchant
    participant O as Orchestrator
    participant P1 as Processor A
    participant P2 as Processor B
    participant P3 as Processor C
    
    M->>O: Payment Request
    O->>O: Analyze Request
    O->>O: Apply Routing Rules
    O->>O: Select Best Processor
    
    Note over O,P1: Primary: Processor A
    O->>P1: Forward Request
    
    alt Success
        P1-->>O: Approved
        O-->>M: Payment Success
    else Timeout
        O->>P2: Failover to B
        alt Success
            P2-->>O: Approved
            O-->>M: Payment Success
        else Declined
            O->>P3: Try Processor C
            P3-->>O: Approved
            O-->>M: Payment Success
        end
    end
\`\`\`

### Routing Strategies

**1. Cost Optimization**

\`\`\`
Transaction: $100.00

Processor A: 2.9% + $0.30 = $3.20
Processor B: 2.5% + $0.25 = $2.75
Processor C: 2.2% + $0.35 = $2.55  ← Selected

Monthly savings (10,000 txns):
  A: $32,000
  C: $25,500
  Savings: $6,500/month = $78,000/year
\`\`\`

**2. Success Rate Optimization**

\`\`\`
Processor Success Rates:
  Processor A: 98.5% (US Cards)
  Processor B: 97.2% (EU Cards) 
  Processor C: 99.1% (Asia Cards)

Route by Card Origin:
  US Card    → Processor A
  EU Card    → Processor B
  Asia Card  → Processor C

Result: Average success rate 98.9%
  vs 98.3% with single processor
\`\`\`

**3. Performance Optimization**

\`\`\`
Processor Response Times:
  Processor A: 150ms (US)
  Processor B: 450ms (US), 180ms (EU)
  Processor C: 200ms (Global)

Route by Customer Location:
  US Customer    → Processor A (fastest)
  EU Customer    → Processor B (regional)
  Other          → Processor C (global)
\`\`\`

### Configuration

**Step 1: Connect Processors**

\`\`\`yaml
processors:
  - name: "Stripe"
    credentials:
      api_key: "sk_live_xxxxx"
    enabled: true
    priority: 1
    
  - name: "Adyen"
    credentials:
      api_key: "xxxxx"
      merchant_account: "YourCompanyECOM"
    enabled: true
    priority: 2
    
  - name: "Checkout.com"
    credentials:
      secret_key: "sk_xxxxx"
    enabled: true
    priority: 3
\`\`\`

**Step 2: Define Routing Rules**

\`\`\`json
{
  "rules": [
    {
      "name": "High-value transactions",
      "priority": 1,
      "conditions": {
        "amount": { "$gte": 1000 }
      },
      "route_to": "Stripe",
      "fallback": ["Adyen", "Checkout.com"]
    },
    {
      "name": "EU transactions",
      "priority": 2,
      "conditions": {
        "customer_country": ["DE", "FR", "IT", "ES", "NL"]
      },
      "route_to": "Adyen",
      "fallback": ["Checkout.com", "Stripe"]
    },
    {
      "name": "Cost optimization",
      "priority": 10,
      "conditions": {
        "amount": { "$lt": 50 }
      },
      "route_to": "Checkout.com",
      "reason": "Lowest fees for small transactions"
    }
  ]
}
\`\`\`

**Step 3: Set Failover Logic**

\`\`\`yaml
failover_configuration:
  enabled: true
  
  retry_logic:
    max_attempts: 3
    delay_between_attempts: 1000ms
    exponential_backoff: true
    
  processor_rotation:
    - on_timeout: switch_to_next
    - on_error_rate_high: switch_to_next
    - on_processor_down: immediate_switch
    
  health_checks:
    interval: 30s
    timeout: 5s
    failure_threshold: 3
\`\`\`

### Pricing

\`\`\`
Orchestration Service Pricing

Setup Fee: $1,500 (one-time)
Monthly Subscription:
  - Starter:       $299 (10K txns/month)
  - Professional:  $999 (100K txns/month)
  - Enterprise:  $1,999 (Unlimited)

Per-Transaction Fee: $0.005 - $0.02

Example (50K txns/month):
  Monthly Fee:           $999
  Transaction Fees:  50K × $0.01 = $500
  Total:               $1,499/month

ROI Calculation:
  Cost Savings (6% improvement): $2,500/month
  Orchestration Cost:           -$1,499/month
  Net Benefit:                  +$1,001/month
\`\`\`

---

## Crypto Gateway Service

### What is Crypto Gateway?

The **FTS.Money Crypto Gateway** is your enterprise crypto banking infrastructure, offering everything needed to launch crypto services without the $10M+ investment typically required.

**Available in Two Ways:**

1. **Embedded in PSP** - Enable from Service Marketplace, white-label for your customers
2. **Standalone Portal** - Direct access for exchanges and DeFi platforms

### Crypto Gateway Architecture

\`\`\`mermaid
graph TB
    subgraph "Customer Access"
        A[PSP Marketplace<br/>Embedded]
        B[Standalone Portal<br/>Direct]
    end
    
    subgraph "FTS.Money Crypto Gateway"
        C[Wallet Engine]
        D[Banking Rails]
        E[Card Issuance]
        F[Compliance]
    end
    
    subgraph "Features"
        G[BTC/ETH/USDC<br/>Lightning]
        H[Virtual IBANs<br/>SEPA Instant]
        I[Visa Cards<br/>Physical + Virtual]
        J[KYC/AML<br/>VASP/MiCA]
    end
    
    A --> C
    B --> C
    C --> G
    D --> H
    E --> I
    F --> J
    
    style C fill:#2563eb,color:#fff
    style D fill:#06b6d4,color:#fff
    style E fill:#8b5cf6,color:#fff
    style F fill:#10b981,color:#fff
\`\`\`

### Key Features

**Multi-Chain Wallets:**
- Bitcoin, Ethereum, USDC, USDT
- Lightning Network integration
- Non-custodial and custodial options
- Enterprise-grade security

**Virtual IBANs:**
- Named SEPA accounts
- SEPA Instant support
- Direct bank integration
- Multi-currency balances

**Card Issuance:**
- Virtual Visa cards (instant)
- Physical Visa cards
- Spend crypto as fiat
- Real-time conversion

**Full Compliance:**
- VASP licensed (EU)
- MiCA ready
- KYC/AML built-in
- Travel Rule compliant

### Pricing

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Monthly Fee | $2,500 | $2,500 | Custom |
| KYC per user | $5.00 | $5.00 | $3.00 |
| Virtual card | $8.00 | $8.00 | $5.00 |
| Physical card | $20.00 | $20.00 | $15.00 |
| Crypto transaction | 1.5% | 1.5% | 1.0% |
| Exchange fee | 1.2% | 1.2% | 0.8% |
| White-label setup | $500 | Included | Included |

### Use Cases

**Cryptocurrency Exchanges:**
\`\`\`
Challenge: Need fiat on/off-ramps and banking rails
Solution: Virtual IBANs for deposits, cards for withdrawals
Benefit: Seamless crypto-to-fiat experience for traders
\`\`\`

**DeFi Platforms:**
\`\`\`
Challenge: Bridge DeFi to traditional finance
Solution: SEPA accounts + KYC/AML compliance
Benefit: Regulatory compliant fiat gateway
\`\`\`

**Payment Service Providers:**
\`\`\`
Challenge: Customers want crypto acceptance
Solution: Embed crypto gateway in marketplace
Benefit: White-labeled crypto without building infrastructure
\`\`\`

### Getting Started

**Option 1: PSP Marketplace (Embedded)**

1. Browse Service Marketplace in PSP Portal
2. Enable "FTS.Money Crypto Gateway"
3. Configure white-label branding
4. Activate for your customers

**Option 2: Standalone Portal (Direct)**

1. Visit https://cryptogateway.fts.money
2. Contact sales: crypto@fts.money
3. Provision your account (48 hours)
4. Access dedicated Crypto Gateway Portal

---

## Service Marketplace

### Browse Services

Running a PSP requires dozens of supporting services beyond core payment processing. You need KYC verification to onboard merchants compliantly. AML screening to prevent money laundering. Fraud detection to block bad actors. Email delivery for receipts. SMS for 2FA. Monitoring to track performance. The list goes on.

Traditionally, integrating each service takes weeks of engineering time. You need to study their API, write connector code, handle authentication, manage errors, monitor performance, and maintain the integration as their API evolves. For a typical PSP, this represents 6-12 months of engineering effort.

The Service Marketplace changes this equation entirely. We've pre-integrated 150+ services so you can activate them with literally one click. Need KYC verification? Click "Enable" on Jumio. Need fraud detection? Click "Enable" on Sift. Need email delivery? Click "Enable" on SendGrid.

Behind the scenes, we've done the integration work - authentication, API calls, error handling, monitoring, billing consolidation. You get instant access to best-in-class services without writing a single line of code. We handle the technical complexity; you focus on business decisions (which services to use and when).

This is our "app store" moment for payment infrastructure - taking complex B2B integrations and making them as simple as installing a mobile app.

\`\`\`mermaid
graph TB
    A[Service Marketplace<br/>150+ Services] --> B[Payment Rails]
    A --> C[Compliance & KYC]
    A --> D[Payout Methods]
    A --> E[Developer Tools]
    
    B --> B1[Stripe<br/>$0/month + txn fees]
    B --> B2[Adyen<br/>Custom pricing]
    B --> B3[PayPal<br/>$0/month + fees]
    
    C --> C1[Jumio KYC<br/>$149/month]
    C --> C2[Sumsub AML<br/>$299/month]
    C --> C3[ComplyAdvantage<br/>$499/month]
    
    D --> D1[Wise<br/>$0/month + fees]
    D --> D2[Payoneer<br/>Custom]
    D --> D3[Circle USDC<br/>$99/month]
    
    E --> E1[Postman<br/>Free]
    E --> E2[Datadog<br/>$199/month]
    E --> E3[SendGrid<br/>$49/month]
\`\`\`

### Service Categories

**Payment Providers (60+)**

| Provider | Type | Integration | Cost |
|----------|------|-------------|------|
| Stripe | Cards, Wallets | One-click | Free + 2.9% + $0.30 |
| Adyen | Cards, Local methods | API | Contact sales |
| PayPal | Wallets | One-click | Free + 2.9% + $0.30 |
| Square | Cards, POS | API | Free + 2.6% + $0.10 |
| Checkout.com | Cards | API | Free + 2.5% + $0.20 |

**KYC/AML Services (20+)**

| Service | Features | Pricing |
|---------|----------|---------|
| Jumio | ID verification, Liveness | $149/month + $1/check |
| Onfido | Document + Biometric | $199/month + $2/check |
| Sumsub | Full KYC/AML suite | $299/month + $1.50/check |
| Trulioo | Global identity | $249/month + $1/check |

**Payout Methods (40+)**

| Method | Coverage | Speed | Cost |
|--------|----------|-------|------|
| Bank Transfer | 150 countries | 1-5 days | $0.50 - $15 |
| PayPal | 200 countries | Instant | 2% |
| Wise | 80 countries | Hours - 2 days | 0.5% - 1% |
| Mobile Money | 40 countries | Minutes | 1% - 3% |
| Cryptocurrency | Global | 10-60 min | $0.10 - $1 |

### One-Click Integration

**Example: Adding Stripe**

\`\`\`
1. Browse Marketplace
   ↓
2. Select "Stripe Connect"
   ↓
3. Click "Add to My PSP"
   ↓
4. Authorize with Stripe
   ↓
5. Configure Settings
   ↓
6. Test in Sandbox
   ↓
7. Enable in Production

Total Time: 15 minutes
\`\`\`

### Subscription Management

\`\`\`
My Active Services (8):

Payment Providers:
  • Stripe Connect          $0/month (+ txn fees)
  • Checkout.com           $0/month (+ txn fees)
  
Compliance:
  • Jumio KYC              $149/month
  • Sumsub AML             $299/month
  
Developer Tools:
  • SendGrid Email         $49/month
  • Postman API Testing    Free
  • Datadog Monitoring     $199/month
  
Analytics:
  • Segment                $120/month
  
Total Monthly Cost: $816/month
\`\`\`

---

## Billing & Subscriptions

### Understanding Your Bill

Transparent, predictable billing is core to our philosophy. We've seen too many payment companies hide fees in complex pricing structures or surprise customers with unexpected charges. Our approach: clear pricing, itemized invoices, no surprises.

Your monthly bill has four main components: base subscription (the tier you selected), usage overages (transactions beyond included amount), add-on features (optional modules you've enabled), and marketplace services (third-party services you use).

Everything is metered and displayed clearly. If you process 52,000 transactions on a Professional plan that includes 50,000, you pay for exactly 2,000 overages at the published rate. If you use Jumio for 247 KYC checks, you see exactly what that costs. No hidden multipliers or surprise adjustments.

We also aggregate all your service marketplace charges into a single FTS.Money invoice. Instead of managing 8 separate vendor invoices and payment methods, you pay one bill and we handle the distribution to service providers. This simplifies accounting and gives you visibility into total payment infrastructure costs.

\`\`\`
FTS.Money Invoice - January 2025
Account: community_user_abc123

PSP Services:
  Professional Tier                      $999.00
  Transactions (52K, 50K included)
    - Overage: 2K × $0.02                 $40.00
  
ISO Gateway:
  Monthly Subscription                   $999.00
  Messages (28K, 20K included)
    - Overage: 8K × $0.02                $160.00
  
Orchestration:
  Monthly Subscription                   $999.00
  Transactions (45K included)              $0.00
  
Service Marketplace:
  Jumio KYC Service                      $149.00
  Sumsub AML Service                     $299.00
  SendGrid Email                          $49.00
  Datadog Monitoring                     $199.00
  
                             Subtotal: $3,893.00
                     Sales Tax (8.5%):   $331.91
                                Total: $4,224.91

Payment Method: •••• 4242 (Visa)
Due Date: February 1, 2025
\`\`\`

### Payment Methods

\`\`\`yaml
accepted_payment_methods:
  credit_cards:
    - visa
    - mastercard
    - american_express
  
  debit_cards:
    - visa_debit
    - mastercard_debit
  
  bank_transfer:
    - ach  # US only
    - wire_transfer
  
  digital_wallets:
    - paypal  # Coming soon
\`\`\`

### Billing Cycle

\`\`\`mermaid
gantt
    title Monthly Billing Cycle
    dateFormat YYYY-MM-DD
    
    section Usage Period
    Service usage tracked    :2025-01-01, 31d
    
    section Invoice
    Invoice generated        :milestone, 2025-02-01, 0d
    Email sent               :2025-02-01, 1d
    
    section Payment
    Payment due              :milestone, 2025-02-08, 0d
    Late fee if unpaid       :2025-02-15, 1d
    
    section Suspension
    Service suspension       :crit, 2025-02-22, 1d
\`\`\`

---

## Support & Resources

### Getting Help

We believe great products need great support. Building payment infrastructure is complex, and even experienced teams hit roadblocks. Our support philosophy: make it easy to get help, respond quickly, and solve problems thoroughly.

Support channels are tiered based on subscription level, but everyone gets access to comprehensive documentation and community resources. Documentation covers common scenarios and is continuously updated based on support tickets. The community forum lets you learn from other PSPs facing similar challenges.

For paid support, response times scale with your tier - Starter customers get 24-hour email response, Professional customers get 4-hour priority support with chat access, Enterprise customers get dedicated Slack channels with 1-hour response and phone support for emergencies.

The key is knowing where to go for different types of help. Check documentation for "how-to" questions. Use the forum for strategic advice from peers. Contact support for technical issues or bugs. For Enterprise customers, your dedicated success manager is your first point of contact for anything.

**Documentation:**
- Platform guides: [docs.fts.money](https://docs.fts.money)
- API reference: [api.fts.money/docs](https://api.fts.money/docs)
- Video tutorials: [youtube.com/ftsmoney](https://youtube.com/ftsmoney)

**Community:**
- Forum: [community.fts.money/forum](https://community.fts.money/forum)
- Discord: [discord.gg/ftsmoney](https://discord.gg/ftsmoney)
- GitHub: [github.com/ftsmoney](https://github.com/ftsmoney)

**Support Channels:**

| Channel | Availability | Response Time |
|---------|--------------|---------------|
| Email | 24/7 | 24 hours |
| Chat | Mon-Fri 9am-6pm ET | 15 minutes |
| Phone | Enterprise only | 1 hour |
| Slack | Enterprise only | 30 minutes |

**Support Tiers:**

\`\`\`
Starter:
  • Email support
  • 24-hour response time
  • Community forum access
  
Professional:
  • Email + chat support
  • 4-hour response time
  • Priority in forum
  • Monthly office hours
  
Enterprise:
  • Dedicated Slack channel
  • 1-hour response time
  • Phone support
  • Dedicated success manager
  • Quarterly business reviews
\`\`\`

### Status & Uptime

Check system status: [status.fts.money](https://status.fts.money)

\`\`\`
System Status - All Systems Operational ✅

Services:
  ✅ API Gateway          99.99% uptime
  ✅ PSP Portals          99.98% uptime
  ✅ ISO Gateway          100% uptime
  ✅ Orchestration        99.97% uptime
  ✅ Database             100% uptime

Last Incident: 15 days ago (Resolved)
Next Maintenance: Feb 15, 2025 (2am-4am ET)
\`\`\`

---

## Conclusion

The Community Portal is your launchpad for building payment infrastructure. Whether launching a PSP, connecting legacy systems, or optimizing payment flows—FTS.Money provides the tools you need to succeed.

**Next Steps:**

1. ✅ Create your account
2. 🚀 Choose your service (PSP, ISO Gateway, Orchestration)
3. ⚙️ Configure and deploy
4. 📈 Scale your business

**Welcome to the FTS.Money community!**

---

**Document Information**

- **Version:** 1.0
- **Last Updated:** December 26, 2025
- **Status:** Active
- **Classification:** Public
- **Owner:** Community Team
- **Contact:** community@fts.money

© 2025 FTS.Money. All rights reserved.`;

export default CommunityPortalDoc;