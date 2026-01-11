const ArchitectureDoc = `# FTS.Money Platform Architecture
## Complete Technical Infrastructure & System Design

**Version:** 3.1  
**Classification:** Internal - Technical Teams  
**Last Updated:** January 11, 2026  
**Document Owner:** FTS.Money Platform Engineering

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Multi-Tenancy Model](#multi-tenancy-model)
4. [RBAC & Access Control](#rbac-access-control)
5. [Portal Architecture](#portal-architecture)
6. [Financial Operations Architecture](#financial-operations-architecture)
7. [Technology Stack](#technology-stack)
8. [Infrastructure Components](#infrastructure-components)
9. [Security Architecture](#security-architecture)
10. [Performance & Scalability](#performance--scalability)
11. [Disaster Recovery](#disaster-recovery)

---

## Executive Summary

### Platform Overview

FTS.Money represents a paradigm shift in payment infrastructure deployment. Traditional payment service providers take 12-36 months and $5M-$50M to build, requiring teams of 50+ engineers and extensive compliance work. Our platform changes this equation entirely.

We've built a **multi-tenant payment infrastructure platform** that enables businesses to launch fully-functional Payment Service Provider (PSP) instances in just 24-48 hours. Think of it as "AWS for payment processing" - we provide the underlying infrastructure, security, and compliance framework so you can focus on your business.

Our architecture is battle-tested and designed for:

- **High Performance:** 100,000+ TPS capacity
- **Global Scale:** Multi-region deployment
- **Enterprise Security:** PCI DSS Level 1 compliant
- **Rapid Provisioning:** 24-48 hour PSP deployment
- **Cost Efficiency:** Shared infrastructure, isolated data

### Architecture Philosophy

Our architectural decisions are driven by three core principles: efficiency, security, and scalability. Rather than building isolated systems for each customer, we've created a sophisticated multi-tenant architecture that shares infrastructure while maintaining strict data isolation.

This approach allows us to offer enterprise-grade payment processing at a fraction of the traditional cost, while maintaining the highest security standards. Every component is designed with multi-tenancy in mind, from the database layer to the API gateway.

**Multi-Tenant by Design:**
- Single codebase serves all PSPs
- Logical data isolation per tenant
- Shared infrastructure with security boundaries
- Independent scaling per PSP instance

**Standards-First:**
- ISO 8583 (card processing)
- ISO 20022 (banking messages)
- ISO 23257 (cryptocurrency/DLT)
- ISO 24165 (digital token identifiers)
- ISO 27001 (information security)
- PCI DSS Level 1 (payment card compliance)

---

## System Architecture

### High-Level Architecture

The FTS.Money platform consists of multiple layers, each serving a specific purpose in the payment processing flow. This layered architecture provides clear separation of concerns, makes the system easier to scale, and enhances security through segmentation.

At the edge, Cloudflare protects us from attacks and accelerates global delivery. Behind that, our portal layer provides different interfaces for different user types - platform administrators, community users, PSP operators, merchants, and service-specific customers. The API gateway handles authentication and rate limiting before requests reach our processing layer.

The application layer runs on AWS ECS, allowing us to scale horizontally based on demand. Our service layer contains specialized services for ISO message translation, payment orchestration, and crypto processing. Finally, our data layer uses PostgreSQL for transactions, Redis for caching, and SQS for async processing.

\`\`\`mermaid
graph TB
    subgraph "Edge Layer"
        CF[Cloudflare WAF/CDN<br/>DDoS Protection]
    end
    
    subgraph "Portal Layer"
        CP[Control Panel<br/>Platform Admin]
        COM[Community Portal<br/>Self-Service]
        PSP[PSP Portal<br/>Operations]
        MER[Merchant Portal<br/>Self-Service]
        ISOP[ISO Gateway Portal<br/>Customer Portal]
        ORCHP[Orchestration Portal<br/>Customer Portal]
    end
    
    subgraph "API Gateway"
        ALB[AWS Load Balancer<br/>SSL Termination]
        API[API Gateway<br/>Rate Limiting]
    end
    
    subgraph "Application Layer"
        ECS1[Payment Processor<br/>ECS Task 1]
        ECS2[Payment Processor<br/>ECS Task 2]
        ECS3[Payment Processor<br/>ECS Task N]
    end
    
    subgraph "Core Services"
        ISO[ISO Gateway<br/>Message Translation]
        ORCH[Orchestration<br/>Smart Routing]
        FRAUD[Fraud Detection<br/>ML-Powered]
        COMP[Compliance<br/>KYB/AML]
    end
    
    subgraph "Premium Services"
        CRYPTO[Crypto Gateway<br/>Digital Assets]
        AI[AI Automation<br/>Decision Engine]
        RECURR[Recurring<br/>Billing]
    end
    
    subgraph "Data Layer"
        RDS[(PostgreSQL<br/>Transaction DB)]
        REDIS[(Redis Cluster<br/>Cache)]
        SQS[SQS Queue<br/>Async Processing]
    end
    
    subgraph "External Integrations"
        PROC[Payment<br/>Processors]
        BANK[Banks &<br/>Acquirers]
        CRYPTO[Crypto<br/>Exchanges]
        KYC[KYC/AML<br/>Services]
    end
    
    CF --> ALB
    CP --> ALB
    COM --> ALB
    PSP --> ALB
    MER --> ALB
    ISOP --> ALB
    ORCHP --> ALB
    
    ALB --> API
    API --> ECS1
    API --> ECS2
    API --> ECS3
    
    ECS1 --> ISO
    ECS1 --> ORCH
    ECS1 --> FRAUD
    ECS1 --> COMP
    ECS1 --> CRYPTO
    ECS1 --> AI
    ECS1 --> RECURR
    
    ECS1 --> RDS
    ECS1 --> REDIS
    ECS1 --> SQS
    
    ORCH --> PROC
    ISO --> BANK
    FRAUD --> KYC
    CRYPTO --> CRYPTO[Exchanges]
    AI --> FRAUD
    RECURR --> ORCH
\`\`\`

### Request Flow

Understanding how a payment flows through our system is crucial for performance optimization. Every millisecond matters in payment processing - customers expect instant responses, and slower processing can lead to cart abandonment.

We've optimized our request flow to minimize latency at every step. From the initial request to the final response, we aim for sub-200ms processing time at the 99th percentile. This is achieved through strategic caching, efficient routing, and parallel processing where possible.

Here's how a typical transaction flows through the system:

| Step | Component | Action | Duration |
|------|-----------|--------|----------|
| **1** | Client | Initiates payment request | - |
| **2** | Cloudflare | DDoS protection, WAF checks | <10ms |
| **3** | ALB | SSL termination, load balancing | <5ms |
| **4** | API Gateway | Authentication, rate limiting | <10ms |
| **5** | ECS Task | Payment processor validation | <20ms |
| **6** | ISO Gateway | Message translation (if needed) | <10ms |
| **7** | Redis Cache | Check routing rules | <1ms |
| **8** | Orchestration | Select optimal processor | <15ms |
| **9** | External Processor | Authorize transaction | 50-150ms |
| **10** | PostgreSQL | Log transaction | <10ms |
| **11** | SQS Queue | Async webhook delivery | <5ms |
| **12** | Response | Return to client | - |
| **Total** | **End-to-end latency** | **P99 < 220ms** | **Target met** |

---

## Multi-Tenancy Model

### Tenant Isolation Strategy

Multi-tenancy is the foundation of our cost efficiency and scalability. By sharing infrastructure across multiple PSPs while maintaining strict data isolation, we achieve economies of scale that would be impossible with dedicated deployments.

However, multi-tenancy introduces unique challenges, particularly around security and data isolation. In the payments industry, where PCI DSS compliance is mandatory, we must ensure that one tenant can never access another tenant's data - even accidentally.

Our solution uses a combination of logical and physical isolation mechanisms. At the database level, each PSP gets its own schema with row-level security enforcement. This means even if application code has a bug, the database itself prevents cross-tenant data access.

Here's how our multi-tenant architecture works:

\`\`\`mermaid
graph TB
    subgraph "Shared Infrastructure"
        APP[Application Code<br/>Single Deployment]
        CACHE[Redis Cluster<br/>Shared Cache]
        QUEUE[SQS Queues<br/>Shared Queue]
    end
    
    subgraph "PSP Tenant A"
        SCHEMA_A[Database Schema A<br/>Logical Isolation]
        DATA_A[Transaction Data A]
        CONFIG_A[Configuration A]
    end
    
    subgraph "PSP Tenant B"
        SCHEMA_B[Database Schema B<br/>Logical Isolation]
        DATA_B[Transaction Data B]
        CONFIG_B[Configuration B]
    end
    
    subgraph "PSP Tenant C"
        SCHEMA_C[Database Schema C<br/>Logical Isolation]
        DATA_C[Transaction Data C]
        CONFIG_C[Configuration C]
    end
    
    APP --> SCHEMA_A
    APP --> SCHEMA_B
    APP --> SCHEMA_C
    
    APP --> CACHE
    APP --> QUEUE
\`\`\`

### Isolation Mechanisms

Every layer of our stack implements isolation in a way that's appropriate for that layer's characteristics. The database requires the strongest isolation (separate schemas), while the cache can use logical separation through key prefixing since it doesn't contain sensitive card data.

This defense-in-depth approach means that even if one isolation mechanism fails, others are in place to prevent cross-tenant access. It's not just about security - it's also about compliance. Auditors need to see multiple layers of protection to certify our PCI DSS compliance.

| Layer | Isolation Method | Security Boundary |
|-------|-----------------|-------------------|
| **Database** | Separate schema per PSP | Row-level security (RLS) enforced |
| **Cache** | Key prefixing (psp_code) | Logical separation |
| **Queue** | Message attributes | Filtered by consumer |
| **Storage** | Folder structure (S3) | IAM policies per PSP |
| **API Keys** | Unique per PSP | HMAC validation |
| **Domain** | Subdomain per PSP | SSL per domain |

### Benefits of Multi-Tenancy

The multi-tenant model delivers benefits that compound over time. As we add more PSPs to the platform, the per-PSP cost continues to decrease while reliability increases (more traffic means better anomaly detection and faster optimization).

This creates a virtuous cycle: lower costs allow us to serve smaller PSPs profitably, which increases our scale, which further reduces costs. Traditional PSPs can't compete at the low end of the market because their dedicated infrastructure model doesn't scale down cost-effectively.

**Cost Efficiency:**
- Shared infrastructure reduces cost by 70%
- Single codebase = faster feature delivery
- Centralized monitoring and maintenance

**Performance:**
- Resource pooling across tenants
- Efficient cache utilization
- Load balancing across instances

**Compliance:**
- PCI DSS Level 1 certified infrastructure
- GDPR-compliant data residency
- Audit trails per tenant

---

## RBAC & Access Control

### Multi-User Organization Architecture

The platform now supports **multiple users per organization** across all services with granular role-based permissions.

\`\`\`mermaid
graph TB
    subgraph "Organization Types"
        A[ISO Gateway Customer]
        B[Orchestration Customer]
        C[Crypto Gateway Customer]
        D[RWA Provider]
        E[PSP Instance]
    end
    
    subgraph "User Management System"
        F[User Entities]
        G[Authentication Service]
        H[Permission Engine]
        I[Session Management]
    end
    
    subgraph "Six-Tier Role Hierarchy"
        J[Owner - 100%]
        K[Administrator - 90%]
        L[Developer - 60%]
        M[Operations - 50%]
        N[Analyst - 40%]
        O[Viewer - 20%]
    end
    
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    
    F --> G
    G --> H
    H --> I
    
    H --> J
    H --> K
    H --> L
    H --> M
    H --> N
    H --> O
    
    style F fill:#dbeafe
    style H fill:#fef3c7
    style J fill:#fecaca
\`\`\`

### Role Permission System

**Supported User Types:**

| Service | User Entity | Management Page | Authentication |
|---------|-------------|-----------------|----------------|
| **ISO Gateway** | ISOGatewayUser | ISOGatewayUserManagement | functions/isoGatewayAuth |
| **Orchestration** | OrchestrationUser | OrchestrationUserManagement | functions/orchestrationAuth |
| **Crypto Banking** | CryptoGatewayUser | CryptoGatewayUserManagement | functions/cryptoGatewayAuth |
| **RWA Platform** | RWAProviderUser | RWAProviderUserManagement | functions/rwaProviderAuth |
| **PSP Staff** | AppUser (staff) | PSPUserManagement | functions/pspAuth |

### Permission Architecture

\`\`\`mermaid
sequenceDiagram
    actor User
    participant Portal
    participant Auth as Auth Service
    participant PermDB as Permission DB
    participant Resource
    
    User->>Portal: Request Action
    Portal->>Auth: Validate Session
    Auth->>PermDB: Get User Permissions
    PermDB-->>Auth: Role + Permissions List
    Auth->>Auth: Check Required Permission
    
    alt Has Permission
        Auth-->>Portal: Authorized
        Portal->>Resource: Execute Action
        Resource-->>Portal: Result
        Portal-->>User: Success
    else No Permission
        Auth-->>Portal: Denied
        Portal-->>User: Access Denied (403)
    end
\`\`\`

**Permission Components:**

- **components/auth/isoGatewayPermissions.js** - ISO Gateway RBAC
- **components/auth/orchestrationPermissions.js** - Orchestration RBAC
- **components/auth/cryptoGatewayPermissions.js** - Crypto Banking RBAC
- **components/auth/rwaPermissions.js** - RWA Platform RBAC
- **components/auth/usePermissions.js** - Permission checking hook
- **pages/RolePermissionManagement.js** - Editable permission matrix

### Security Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Password Hashing** | SHA-256 + salt | Secure credential storage |
| **Session Management** | JWT + localStorage | Stateless auth |
| **Permission Enforcement** | Server-side + client-side | Defense in depth |
| **Audit Logging** | All user actions logged | Compliance & forensics |
| **Role Hierarchy** | Numerical hierarchy | Prevent privilege escalation |

---

## Portal Architecture

### Portal Ecosystem

\`\`\`mermaid
graph TB
    subgraph "Platform Administration"
        A[FTS Platform Admin Portal]
        A1[Platform User Management]
        A2[PSP Provisioning]
        A3[System Health]
        A4[Revenue Dashboard]
    end
    
    subgraph "PSP Operations"
        B[PSP Portal]
        B1[Merchant Management]
        B2[Transaction Monitoring]
        B3[Settlement Processing]
        B4[Dispute Handling]
    end
    
    subgraph "Merchant Self-Service"
        C[Merchant Portal]
        C1[Dashboard & Analytics]
        C2[Transaction History]
        C3[API Key Management]
        C4[Webhook Configuration]
    end
    
    subgraph "Payment Processing"
        D[Virtual Terminal]
        D1[Card-Not-Present]
        D2[Recurring Payments]
        D3[Itemized Sales]
        D4[Split Tender]
    end
    
    subgraph "Service Portals"
        E[ISO Gateway Portal]
        F[Orchestration Portal]
        G[Crypto Gateway Portal]
        H[RWA Provider Portal]
    end
    
    A --> A1
    A --> A2
    A --> A3
    A --> A4
    
    B --> B1
    B --> B2
    B --> B3
    B --> B4
    
    C --> C1
    C --> C2
    C --> C3
    C --> C4
    
    D --> D1
    D --> D2
    D --> D3
    D --> D4
    
    style A fill:#e0f2fe
    style B fill:#dbeafe
    style C fill:#dcfce7
    style D fill:#fef3c7
\`\`\`

### Merchant Portal Features

**Core Capabilities:**

1. **Real-time Dashboard**
   - Live transaction monitoring
   - KPI cards (volume, count, success rate)
   - Volume trend charts
   - Payment method breakdown

2. **Transaction Management**
   - Advanced search & filtering
   - Export to CSV/Excel/PDF
   - Refund processing
   - Receipt generation

3. **Settlement & Payouts**
   - Automated settlement reports
   - Reconciliation tools
   - Payout scheduling
   - Bank account management

4. **Dispute Management**
   - Chargeback tracking
   - Evidence submission
   - Status monitoring
   - Representment handling

5. **API Integration**
   - Self-service API key creation
   - Webhook configuration
   - API documentation
   - Test console

### Virtual Terminal Architecture

\`\`\`mermaid
graph LR
    A[VT Operator] --> B[Virtual Terminal UI]
    B --> C{Transaction Type}
    
    C -->|Sale| D[Immediate Capture]
    C -->|Auth Only| E[Hold Funds]
    C -->|Capture| F[Complete Auth]
    C -->|Refund| G[Return Funds]
    C -->|Void| H[Cancel Tx]
    C -->|Recurring| I[Schedule Billing]
    
    D --> J[Payment Gateway]
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K{3DS Required?}
    K -->|Yes| L[Strong Auth]
    K -->|No| M[Process]
    
    L --> M
    M --> N[Transaction DB]
    M --> O[Send Receipt]
    
    style B fill:#dbeafe
    style J fill:#fef3c7
    style N fill:#dcfce7
\`\`\`

**VT Features:**

- Card-not-present (CNP) processing
- MOTO (Mail Order/Telephone Order) support
- Recurring payment scheduling
- Card-on-file tokenization
- Split tender (multiple payment methods)
- Itemized sales with line items
- Receipt/invoice generation
- 3D Secure integration
- Transaction limits (daily/per-transaction)
- Multi-currency support

---

## Core Services Architecture

### Platform Services Overview

FTS.Money provides **13 distinct services** that can be deployed independently or as integrated suites. Each service is architecturally isolated but shares common infrastructure for authentication, billing, and compliance.

\`\`\`mermaid
graph TB
    subgraph "Payment Services"
        PSP[PSP Platform<br/>Full payment processing]
        ISO[ISO Gateway<br/>Message translation]
        ORCH[Orchestration<br/>Smart routing]
    end
    
    subgraph "Digital Asset Services"
        CRYPTO[Crypto VASP<br/>Wallets, IBANs, Cards]
        RWA[RWA Platform<br/>Asset tokenization]
    end
    
    subgraph "Financial Compliance"
        TAX[Tax Management<br/>Global VAT/GST]
        EINV[E-Invoicing<br/>Multi-standard]
        PCI[PCI Compliance<br/>Level 1 suite]
    end
    
    subgraph "Platform Infrastructure"
        BILL[Unified Billing<br/>Multi-service invoices]
        MARKET[Service Marketplace<br/>150+ integrations]
        DID[Digital Identity<br/>W3C credentials]
    end
    
    subgraph "Sustainability & Scoring"
        NANO[NANO Platform<br/>Eco-rewards]
        FIX[FIX Score<br/>Merchant rating]
    end
    
    PSP --> ORCH
    PSP --> ISO
    PSP --> CRYPTO
    ORCH --> PSP
    
    CRYPTO --> RWA
    
    TAX --> EINV
    EINV --> TAX
    
    BILL --> PSP
    BILL --> CRYPTO
    BILL --> ISO
    BILL --> ORCH
    BILL --> RWA
    BILL --> TAX
    BILL --> EINV
    
    MARKET --> PSP
    MARKET --> CRYPTO
    
    FIX --> PSP
    FIX --> NANO
    
    style PSP fill:#3b82f6,color:#fff
    style CRYPTO fill:#8b5cf6,color:#fff
    style RWA fill:#ec4899,color:#fff
    style BILL fill:#10b981,color:#fff
\`\`\`

### Service Layer Components

Each service runs as an isolated microservice with its own customer portal, authentication system, and data storage.

\`\`\`mermaid
graph TB
    subgraph "ISO Gateway Service"
        ISO1[Message Parser]
        ISO2[Format Validator]
        ISO3[Protocol Translator]
        ISO4[Routing Engine]
    end
    
    subgraph "Orchestration Service"
        ORCH1[Smart Router]
        ORCH2[Health Monitor]
        ORCH3[Cost Optimizer]
        ORCH4[Failover Logic]
    end
    
    subgraph "Crypto Gateway (VASP)"
        CRYPTO1[Blockchain Connectors]
        CRYPTO2[Wallet Manager]
        CRYPTO3[Exchange APIs]
        CRYPTO4[Compliance Layer]
    end
    
    subgraph "RWA Platform"
        RWA1[Token Factory]
        RWA2[Investor KYC]
        RWA3[Dividend Engine]
        RWA4[Securities Compliance]
    end
    
    subgraph "Tax Management"
        TAX1[Rate Sync Engine]
        TAX2[Calculation API]
        TAX3[Multi-Jurisdiction]
        TAX4[Reporting Engine]
    end
    
    subgraph "E-Invoicing"
        EINV1[Standard Mapper]
        EINV2[Government APIs]
        EINV3[Validation Engine]
        EINV4[Submission Queue]
    end
    
    APP[Core Platform] --> ISO1
    ISO1 --> ISO2
    ISO2 --> ISO3
    ISO3 --> ISO4
    
    APP --> ORCH1
    ORCH1 --> ORCH2
    ORCH2 --> ORCH3
    ORCH3 --> ORCH4
    
    APP --> CRYPTO1
    CRYPTO1 --> CRYPTO2
    CRYPTO2 --> CRYPTO3
    CRYPTO3 --> CRYPTO4
    
    APP --> RWA1
    RWA1 --> RWA2
    RWA2 --> RWA3
    RWA3 --> RWA4
    
    APP --> TAX1
    TAX1 --> TAX2
    TAX2 --> TAX3
    TAX3 --> TAX4
    
    APP --> EINV1
    EINV1 --> EINV2
    EINV2 --> EINV3
    EINV3 --> EINV4
    
    ISO4 --> EXT1[Payment Networks]
    ORCH4 --> EXT2[Payment Processors]
    CRYPTO4 --> EXT3[Crypto Exchanges]
    RWA4 --> EXT4[Blockchain Networks]
    TAX4 --> EXT5[Tax Authorities]
    EINV4 --> EXT6[Government Portals]
\`\`\`

### Service Specifications

| Service | Purpose | Throughput | Latency | Availability | Customer Portal |
|---------|---------|------------|---------|--------------|----------------|
| **PSP Platform** | Full payment processing stack | 100K txn/sec | <100ms | 99.99% | PSP Portal |
| **ISO Gateway** | Message translation (8583, 20022, MT) | 10K msg/sec | <10ms | 99.99% | ISO Gateway Portal |
| **Orchestration** | Intelligent routing & failover | 50K txn/sec | <15ms | 99.99% | Orchestration Portal |
| **Crypto VASP** | Digital asset banking | 5K txn/sec | 30-60s | 99.95% | Crypto Gateway Portal |
| **RWA Platform** | Asset tokenization | 1K assets/day | 5-10min | 99.9% | RWA Provider/Issuer/Investor Portals |
| **Tax Management** | Global VAT/GST calculation | 50K calc/sec | <50ms | 99.99% | Tax Admin Portal |
| **E-Invoicing** | Multi-standard submission | 10K invoices/day | 5-30s | 99.9% | E-Invoice Portal |
| **PCI Compliance** | Continuous monitoring | N/A | Real-time | 99.99% | PCI Dashboard + QSA Portal |
| **Unified Billing** | Multi-service invoicing | 100K meters/day | <100ms | 99.99% | Billing Dashboard |
| **Service Marketplace** | Pre-integrated providers | 150+ services | <1s | 99.99% | Marketplace Portal |
| **Digital Identity** | W3C verifiable credentials | 10K verifications/sec | <200ms | 99.99% | Identity Wallet |
| **NANO Platform** | Gamified sustainability | 50K tasks/day | <500ms | 99.9% | NANO Hub |
| **FIX Score** | Merchant performance rating | Daily batch | N/A | 99.9% | FIX Dashboard |

### Service Authentication Architecture

Each service maintains its own authentication system with isolated user databases:

\`\`\`mermaid
graph TB
    subgraph "Platform Admin"
        PA[Platform Admin Portal]
        PAU[Platform User Entity]
        PAA[functions/platformAuthSimple]
    end
    
    subgraph "Community"
        COM[Community Portal]
        CU[Community User Entity]
        CA[functions/communityAuth]
    end
    
    subgraph "PSP Operations"
        PSP[PSP Portal]
        PU[AppUser (staff) Entity]
        PPA[functions/pspAuth]
    end
    
    subgraph "Merchant Self-Service"
        MER[Merchant Portal]
        MU[MerchantUser Entity]
        MA[functions/merchantAuth]
    end
    
    subgraph "ISO Gateway"
        ISOP[ISO Gateway Portal]
        IU[ISOGatewayUser Entity]
        IA[functions/isoGatewayAuth]
    end
    
    subgraph "Orchestration"
        ORCHP[Orchestration Portal]
        OU[OrchestrationUser Entity]
        OA[functions/orchestrationAuth]
    end
    
    subgraph "Crypto Banking"
        CRYPTOP[Crypto Gateway Portal]
        CRU[CryptoGatewayUser Entity]
        CRA[functions/cryptoGatewayAuth]
    end
    
    subgraph "RWA Platform"
        RWAP[RWA Provider Portal]
        RU[RWAProviderUser Entity]
        RA[functions/rwaProviderAuth]
        
        ISSP[Asset Issuer Portal]
        IU2[AssetIssuer Entity]
        IAA[functions/assetIssuerAuth]
        
        INVP[Investor Portal]
        INU[RWAInvestor Entity]
        INA[functions/investorAuth]
    end
    
    subgraph "PCI Compliance"
        QSAP[QSA Portal]
        QU[QSAUser Entity]
        QA[functions/qsaAuth]
    end
    
    PA --> PAU
    PAU --> PAA
    
    COM --> CU
    CU --> CA
    
    PSP --> PU
    PU --> PPA
    
    MER --> MU
    MU --> MA
    
    ISOP --> IU
    IU --> IA
    
    ORCHP --> OU
    OU --> OA
    
    CRYPTOP --> CRU
    CRU --> CRA
    
    RWAP --> RU
    RU --> RA
    
    ISSP --> IU2
    IU2 --> IAA
    
    INVP --> INU
    INU --> INA
    
    QSAP --> QU
    QU --> QA
    
    style PA fill:#e0f2fe
    style COM fill:#dbeafe
    style PSP fill:#bfdbfe
    style MER fill:#dcfce7
    style ISOP fill:#fef3c7
    style ORCHP fill:#fed7aa
    style CRYPTOP fill:#ddd6fe
    style RWAP fill:#fbcfe8
    style QSAP fill:#fecaca
\`\`\`

### Inter-Service Communication

Services communicate through:

1. **Direct API Calls** - Synchronous RESTful APIs for real-time operations
2. **Event Streaming** - Kafka for asynchronous event propagation
3. **Shared Database** - Common entities for cross-service data (Master Pricing, Service Catalog)
4. **Message Queues** - SQS for background processing and webhooks

\`\`\`mermaid
sequenceDiagram
    participant PSP as PSP Platform
    participant ORCH as Orchestration
    participant ISO as ISO Gateway
    participant BILL as Billing
    participant KAFKA as Event Bus
    
    PSP->>ORCH: Route payment request
    ORCH->>ISO: Translate message (if needed)
    ISO-->>ORCH: Translated message
    ORCH-->>PSP: Routed transaction
    
    PSP->>KAFKA: Publish transaction.completed
    
    KAFKA->>BILL: Consume event
    BILL->>BILL: Meter usage (PSP + Orchestration + ISO)
    BILL->>BILL: Update ConsolidatedInvoice
\`\`\`

---

## Financial Operations Architecture

### Unified Billing & Metering System

The platform now includes comprehensive billing infrastructure that consolidates all service usage into unified invoices with automated payment processing.

\`\`\`mermaid
graph TB
    subgraph "Usage Metering Layer"
        M1[Transaction Meters<br/>PSP payment processing]
        M2[ISO Gateway Meters<br/>Message translation]
        M3[Orchestration Meters<br/>Routing decisions]
        M4[Crypto Gateway Meters<br/>Wallet/IBAN operations]
        M5[RWA Platform Meters<br/>Asset tokenization]
    end
    
    subgraph "Billing Engine"
        METER[UsageMeter Entity<br/>Real-time counters]
        RULES[BillingRule Entity<br/>Pricing logic]
        INVOICE[ConsolidatedInvoice<br/>Multi-service invoices]
    end
    
    subgraph "Payment Processing"
        PAYMENT[PaymentStatus<br/>Collection tracking]
        STRIPE[Stripe Integration<br/>Auto-charge]
        XERO[Xero Integration<br/>Accounting sync]
    end
    
    M1 --> METER
    M2 --> METER
    M3 --> METER
    M4 --> METER
    M5 --> METER
    
    METER --> RULES
    RULES --> INVOICE
    
    INVOICE --> PAYMENT
    PAYMENT --> STRIPE
    PAYMENT --> XERO
    
    style METER fill:#3b82f6,color:#fff
    style INVOICE fill:#10b981,color:#fff
    style STRIPE fill:#8b5cf6,color:#fff
\`\`\`

**Key Components:**

| Component | Purpose | Update Frequency | Storage |
|-----------|---------|------------------|---------|
| **UsageMeter** | Track usage per customer/service | Real-time | PostgreSQL |
| **BillingRule** | Define pricing tiers & overage | Daily sync | PostgreSQL |
| **ConsolidatedInvoice** | Generate multi-service invoices | Monthly | PostgreSQL + S3 |
| **PaymentStatus** | Track payment attempts & status | On payment event | PostgreSQL |

### Service Publication Architecture

Phased rollout system enabling controlled service launches with soft launches, beta programs, and version management.

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Pending_Approval: Submit for review
    Pending_Approval --> Soft_Launch: Approve
    Pending_Approval --> Draft: Reject
    
    Soft_Launch --> Published: Go live
    Published --> Unpublished: Pause
    Unpublished --> Published: Resume
    Published --> Archived: Deprecate
    
    note right of Draft
        - Configure service
        - Set pricing
        - Define features
    end note
    
    note right of Soft_Launch
        - Beta customers only
        - Limited visibility
        - Feedback collection
    end note
    
    note right of Published
        - Public availability
        - Full marketing
        - New signups open
    end note
\`\`\`

**Service Publication Flow:**

\`\`\`mermaid
sequenceDiagram
    participant PM as Product Manager
    participant Portal as Publication Manager
    participant Review as Approval Workflow
    participant Billing as Billing System
    participant Catalog as Service Catalog
    
    PM->>Portal: Create service publication
    Portal->>Portal: Configure pricing & features
    Portal->>Review: Submit for approval
    
    Review->>Review: Check pricing configured
    Review->>Review: Verify compliance ready
    Review->>Review: Infrastructure provisioned
    
    alt Approved
        Review->>Portal: Approve publication
        Portal->>Billing: Enable billing rules
        Portal->>Catalog: Add to catalog (beta visibility)
        Portal->>PM: Soft launch ready
        
        PM->>Portal: Go live (publish)
        Portal->>Catalog: Public visibility
        Portal->>Catalog: Open new signups
    else Rejected
        Review->>Portal: Reject with notes
        Portal->>PM: Fix issues
    end
\`\`\`

### FIX Score Calculation Architecture

Real-time merchant scoring system running on scheduled tasks with automated tier assignment.

\`\`\`mermaid
graph TB
    subgraph "Score Calculation Engine"
        SCHED[Scheduled Task<br/>Daily at 2am UTC]
        FUNC[calculateFIXScore<br/>Backend function]
        ENTITY[FIXScore Entity<br/>Score storage]
    end
    
    subgraph "Data Sources"
        TXN[Transaction Volume<br/>Last 30 days]
        SVC[Service Adoption<br/>Active services count]
        ESG[ESG Performance<br/>Carbon offset, NANO]
        COMP[Compliance Score<br/>PCI, LEI, uptime]
    end
    
    subgraph "Score Components"
        S1[Transaction Score<br/>0-300 points]
        S2[Service Score<br/>0-250 points]
        S3[ESG Score<br/>0-250 points]
        S4[Compliance Score<br/>0-200 points]
    end
    
    subgraph "Tier Assignment"
        T1[Diamond: 900-1000]
        T2[Platinum: 750-899]
        T3[Gold: 600-749]
        T4[Silver: 400-599]
        T5[Bronze: 0-399]
    end
    
    SCHED --> FUNC
    
    TXN --> S1
    SVC --> S2
    ESG --> S3
    COMP --> S4
    
    FUNC --> S1
    FUNC --> S2
    FUNC --> S3
    FUNC --> S4
    
    S1 --> ENTITY
    S2 --> ENTITY
    S3 --> ENTITY
    S4 --> ENTITY
    
    ENTITY --> T1
    ENTITY --> T2
    ENTITY --> T3
    ENTITY --> T4
    ENTITY --> T5
    
    style FUNC fill:#8b5cf6,color:#fff
    style ENTITY fill:#10b981,color:#fff
\`\`\`

**Performance Specs:**
- **Calculation Frequency:** Daily at 2am UTC
- **Processing Time:** ~15 seconds per 1,000 merchants
- **Data Retention:** Complete history for trend analysis
- **Tier Benefits:** Auto-applied based on score

---

## Technology Stack

### Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| UI Framework | React | 18.x | Component-based UI |
| Type Safety | TypeScript | 5.x | Static typing |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Components | Shadcn/UI | Latest | Pre-built components |
| State Management | React Query | 5.x | Server state |
| Forms | React Hook Form | 7.x | Form validation |
| Charts | Recharts | 2.x | Data visualization |
| Animations | Framer Motion | 11.x | UI animations |

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Payment Engine | Go (Fiber) | 1.21+ | High-performance API |
| Portal Backend | Node.js | 20.x | Admin interfaces |
| Functions | Deno | 2.x | Serverless functions |
| API Protocol | REST + GraphQL | - | API interfaces |
| Real-time | WebSockets | - | Live updates |

### Data Storage

| Type | Technology | Specification | Purpose |
|------|-----------|---------------|---------|
| **Transaction DB** | PostgreSQL (RDS) | db.r6g.2xlarge, Multi-AZ | ACID transactions |
| **Operational DB** | PostgreSQL (RDS) | db.r6g.xlarge, Read replica | Analytics, reporting |
| **Cache** | Redis Cluster | 4-node, r6g.xlarge | Session, routing rules |
| **Time-Series** | TimescaleDB | Extension on PostgreSQL | Metrics, analytics |
| **Search** | Elasticsearch | 7.x | Transaction search |
| **Object Storage** | AWS S3 / R2 | - | Documents, backups |

### Message & Event Streaming

| Component | Technology | Use Case |
|-----------|-----------|----------|
| **Task Queue** | AWS SQS | Async transaction processing |
| **Event Stream** | Apache Kafka | Real-time event streaming |
| **Pub/Sub** | Redis Pub/Sub | Real-time updates |
| **Webhooks** | Custom (Go) | Merchant notifications |

---

## Infrastructure Components

### Cloudflare WAF/CDN

**Security Features:**

\`\`\`mermaid
graph LR
    A[Incoming Request] --> B{DDoS Check}
    B -->|Malicious| X[Block]
    B -->|Clean| C{WAF Rules}
    C -->|SQL Injection| X
    C -->|XSS Attack| X
    C -->|Rate Limit| X
    C -->|Clean| D{Geographic}
    D -->|Blocked Country| X
    D -->|Allowed| E[Forward to ALB]
\`\`\`

**Configuration:**
- **DDoS Protection:** Layer 3-7, automatic mitigation
- **WAF Rules:** OWASP Top 10 coverage
- **Rate Limiting:** 
  - Per IP: 1,000 req/min
  - Per merchant: 10,000 req/min
  - Per endpoint: Custom limits
- **SSL/TLS:** TLS 1.3, HSTS enabled
- **Caching:** Static assets only (no API responses)

**Performance:**
- **Global Network:** 310+ cities worldwide
- **Latency Reduction:** 30-50% faster load times
- **Always Online:** Serves cached content during outages

### AWS Application Load Balancer

**Features:**

| Feature | Configuration | Purpose |
|---------|--------------|---------|
| **SSL Certificates** | AWS Certificate Manager | Automatic renewal, free |
| **Health Checks** | /health every 30s | Unhealthy threshold: 3 failures |
| **Connection Draining** | 300-second timeout | Graceful shutdown |
| **Sticky Sessions** | Disabled | Stateless architecture |
| **Target Groups** | Payment API (8080), Webhooks (8081) | Service separation |

**Scaling:**
- Auto-scaling target groups
- Cross-zone load balancing
- Connection multiplexing
- HTTP/2 support

### Go Payment Processor (ECS)

**Service Architecture:**

\`\`\`mermaid
graph TB
    subgraph "Payment Processor"
        API[Payment API<br/>/api/v1/*]
        WH[Webhook Handler<br/>/webhooks/*]
        ORCH[Orchestrator<br/>Internal]
    end
    
    API --> AUTH[Authentication<br/>Middleware]
    API --> RATE[Rate Limiter]
    API --> VAL[Validator]
    API --> PROC[Transaction<br/>Processor]
    
    PROC --> ORCH
    ORCH --> ROUTE[Routing Engine]
    ROUTE --> P1[Processor 1]
    ROUTE --> P2[Processor 2]
    ROUTE --> P3[Processor 3]
    
    WH --> SIG[Signature<br/>Verification]
    WH --> QUEUE[Queue Handler]
\`\`\`

**Endpoints:**

| Endpoint | Method | Purpose | Latency Target |
|----------|--------|---------|----------------|
| /api/v1/authorize | POST | Card authorization | <100ms |
| /api/v1/capture | POST | Capture authorized funds | <80ms |
| /api/v1/sale | POST | Combined auth + capture | <120ms |
| /api/v1/refund | POST | Refund transaction | <150ms |
| /api/v1/void | POST | Void authorization | <80ms |
| /api/v1/3ds | POST | 3D Secure authentication | <200ms |
| /webhooks/:provider | POST | Provider callbacks | <50ms |

**Performance:**
- **Throughput:** 5,000 TPS per task
- **Latency:** P99 < 200ms
- **Error Rate:** < 0.1%
- **Memory:** 4GB per task
- **CPU:** 2 vCPU per task

### PostgreSQL Database (RDS)

**Transaction Database (PCI Scope):**

\`\`\`mermaid
graph LR
    subgraph "Multi-AZ Deployment"
        P[Primary Instance<br/>db.r6g.2xlarge<br/>Write Operations]
        S[Standby Instance<br/>Sync Replication<br/>Auto-Failover]
    end
    
    subgraph "Backup Strategy"
        SNAP[Daily Snapshots<br/>30-day Retention]
        PITR[Point-in-Time<br/>Recovery 5min RPO]
        XR[Cross-Region<br/>Backup us-west-2]
    end
    
    P -.->|Sync Replication| S
    P --> SNAP
    P --> PITR
    SNAP --> XR
\`\`\`

**Specifications:**
- **Instance:** db.r6g.2xlarge (8 vCPU, 64GB RAM)
- **Storage:** 1TB gp3 (16,000 IOPS, 1,000 MB/s)
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Connections:** Max 5,000 (pooled)
- **Replication:** Synchronous to standby (<1s lag)

**Tables:**
- transactions (partitioned by month)
- tokenized_cards (encrypted)
- transaction_signatures (ISO messages)
- authorization_logs

**Operational Database (Non-PCI):**
- **Instance:** db.r6g.xlarge (4 vCPU, 32GB RAM)
- **Read Replica:** For analytics queries
- **Purpose:** Merchant profiles, reports, aggregated data
- **No Card Data:** Outside PCI scope

### Redis Cluster (ElastiCache)

**Architecture:**

\`\`\`mermaid
graph TB
    subgraph "Redis Cluster"
        M1[Master Node 1<br/>Shard 1]
        M2[Master Node 2<br/>Shard 2]
        R1[Replica Node 1]
        R2[Replica Node 2]
    end
    
    M1 -.->|Replication| R1
    M2 -.->|Replication| R2
    
    APP[Application] --> M1
    APP --> M2
    
    M1 -.->|Failover| R1
    M2 -.->|Failover| R2
\`\`\`

**Use Cases:**

| Use Case | TTL | Purpose |
|----------|-----|---------|
| Rate Limiting | 1 minute | API throttling per merchant |
| Session Storage | 30 minutes | User sessions |
| Token Cache | 15 minutes | Reduce DB load |
| Routing Rules | 5 minutes | Fast routing decisions |
| Idempotency Keys | 24 hours | Duplicate prevention |

**Performance:**
- **Latency:** <1ms for cache hits
- **Throughput:** 100,000+ ops/sec per node
- **Hit Rate:** >90% target
- **Memory:** 26GB per node

---

## Security Architecture

### PCI DSS Compliance

**Scope Separation:**

\`\`\`mermaid
graph TB
    subgraph "PCI Scope - Cardholder Data Environment"
        ECS[ECS Payment<br/>Processor]
        RDS_T[Transaction<br/>Database]
        REDIS_T[Redis Cache<br/>Tokens]
        ALB_T[Load Balancer<br/>SSL Term]
        KMS[AWS KMS<br/>Key Management]
    end
    
    subgraph "Non-PCI Scope"
        BASE[Admin Portal<br/>No Card Data]
        MERP[Merchant Portal<br/>Tokens Only]
        RDS_O[Operational DB<br/>Aggregated Data]
        SQS_Q[SQS Queues<br/>Encrypted Messages]
    end
    
    style ECS fill:#ffcccc
    style RDS_T fill:#ffcccc
    style REDIS_T fill:#ffcccc
    style ALB_T fill:#ffcccc
    style KMS fill:#ffcccc
    
    style BASE fill:#ccffcc
    style MERP fill:#ccffcc
    style RDS_O fill:#ccffcc
    style SQS_Q fill:#ccffcc
\`\`\`

### Security Controls

**Network Security:**

| Control | Implementation | Benefit |
|---------|----------------|---------|
| **Private Subnets** | All PCI components | No direct internet access |
| **NAT Gateway** | Outbound only | Controlled external access |
| **Security Groups** | Whitelist ports only | Minimal attack surface |
| **VPC Flow Logs** | All network traffic | Forensic analysis |
| **Network ACLs** | Subnet-level rules | Defense in depth |

**Encryption:**

| Layer | Method | Key Management |
|-------|--------|----------------|
| **Data at Rest** | AES-256 | AWS KMS, 90-day rotation |
| **Data in Transit** | TLS 1.3 | Certificate Manager |
| **Card Tokenization** | PCI-compliant | Irreversible tokens |
| **Database** | Encrypted volumes | KMS-managed keys |
| **Backups** | Encrypted snapshots | Cross-region replication |

**Access Control:**

\`\`\`mermaid
graph LR
    A[User Request] --> B{IAM Role}
    B -->|Admin| C[MFA Required]
    B -->|Application| D[Service Role]
    
    C --> E{Session Valid?}
    E -->|Yes| F[Access Granted]
    E -->|No| G[Deny]
    
    D --> H{Least Privilege?}
    H -->|Yes| F
    H -->|No| G
    
    F --> I[CloudTrail Audit]
\`\`\`

**Monitoring & Compliance:**
- Real-time intrusion detection
- Quarterly vulnerability scans
- Annual penetration testing
- Continuous compliance monitoring
- Automated security patches

---

## Performance & Scalability

### Auto-Scaling Configuration

**ECS Auto-Scaling:**

\`\`\`yaml
scaling_policy:
  payment_processor:
    min_tasks: 4
    max_tasks: 100
    target_cpu: 70%
    target_memory: 80%
    scale_up:
      cooldown: 60s
      increment: 5
    scale_down:
      cooldown: 300s
      decrement: 2
\`\`\`

**Database Scaling:**

| Metric | Current | Scaling Trigger | Action |
|--------|---------|----------------|--------|
| Connections | 5,000 max | >4,000 sustained | Add read replica |
| CPU | <70% avg | >80% for 10min | Upgrade instance |
| IOPS | 16,000 | >12,000 sustained | Increase storage IOPS |
| Storage | 1TB | >800GB used | Auto-expand storage |

### Performance Targets

**Latency Benchmarks:**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| P50 Latency | <50ms | 45ms | ✅ Met |
| P95 Latency | <100ms | 92ms | ✅ Met |
| P99 Latency | <200ms | 185ms | ✅ Met |
| P99.9 Latency | <500ms | 420ms | ✅ Met |

**Throughput:**
- **Per Task:** 5,000 TPS
- **4 Tasks (Min):** 20,000 TPS
- **20 Tasks (Typical):** 100,000 TPS
- **100 Tasks (Max):** 500,000 TPS

**Error Rates:**
- **Target:** <0.1%
- **Critical Errors:** <0.01%
- **Fraud Blocks:** Not counted as errors
- **Validation Errors:** Client-side, not system

---

## Disaster Recovery

### Backup Strategy

**RDS Automated Backups:**

| Backup Type | Frequency | Retention | RPO |
|-------------|-----------|-----------|-----|
| Snapshot | Daily at 3:00 AM UTC | 30 days | 24 hours |
| PITR | Continuous WAL logs | 5 minutes | 5 minutes |
| Cross-Region | Daily | 90 days | 24 hours |
| Manual Snapshot | On-demand | Indefinite | - |

**Recovery Procedures:**

\`\`\`mermaid
sequenceDiagram
    participant M as Monitoring
    participant E as Engineer
    participant AWS as AWS RDS
    participant S as Standby
    participant B as Backup
    
    M->>M: Detect Primary Failure
    M->>E: Alert via PagerDuty
    
    alt Multi-AZ Failover (Automatic)
        AWS->>S: Promote Standby to Primary
        S->>S: Accept Write Traffic
        AWS->>M: Failover Complete
        Note over AWS,S: Downtime: <60 seconds
    else Region Failure (Manual)
        E->>B: Initiate Cross-Region Recovery
        B->>AWS: Restore Latest Snapshot
        AWS->>AWS: Restore PITR to Specific Time
        E->>AWS: Update DNS Records
        E->>M: Failover Complete
        Note over E,AWS: Downtime: <60 minutes
    end
\`\`\`

### Recovery Objectives

| Metric | Target | Strategy |
|--------|--------|----------|
| **RTO** | 1 hour | Multi-AZ automatic failover |
| **RPO** | 5 minutes | Continuous replication + PITR |
| **Availability** | 99.95% | Multi-AZ, cross-region backup |
| **Data Loss** | <5 minutes | Point-in-time recovery |

---

## Monitoring & Observability

### Metrics Dashboard

**Application Metrics:**

\`\`\`
Transaction Performance:
├─ transaction.count (by status: approved, declined, failed)
├─ transaction.latency (p50, p95, p99, p99.9)
├─ transaction.amount (volume tracking)
├─ transaction.errors (by error_code)
└─ transaction.success_rate (%)

Routing Metrics:
├─ routing.decision_time (ms)
├─ routing.provider_selected (distribution)
├─ routing.failover_count
└─ routing.cascade_events

API Metrics:
├─ api.requests_per_second
├─ api.response_time (by endpoint)
├─ api.error_rate (4xx, 5xx)
└─ api.active_connections
\`\`\`

**Infrastructure Metrics:**

\`\`\`
ECS Container Metrics:
├─ ecs.cpu_utilization (target: 60-70%)
├─ ecs.memory_utilization (target: 70-80%)
├─ ecs.task_count (scaling events)
└─ ecs.task_failures

RDS Database Metrics:
├─ rds.connections (alert if >4,000)
├─ rds.cpu_utilization (alert if >80%)
├─ rds.read_iops / rds.write_iops
├─ rds.replica_lag (Multi-AZ delay)
└─ rds.disk_queue_depth

Redis Cache Metrics:
├─ redis.cache_hits / redis.cache_misses
├─ redis.hit_rate (target >90%)
├─ redis.evictions (memory pressure)
└─ redis.connections
\`\`\`

### Alert Configuration

**Critical Alerts (PagerDuty - Immediate):**

\`\`\`yaml
critical_alerts:
  - name: "High Error Rate"
    condition: error_rate > 1% for 5 minutes
    action: page_on_call
    
  - name: "Latency Spike"
    condition: p99_latency > 500ms for 5 minutes
    action: page_on_call
    
  - name: "Database CPU Critical"
    condition: rds_cpu > 90% for 10 minutes
    action: page_on_call
    
  - name: "Failed Health Checks"
    condition: 3 consecutive failures
    action: page_on_call
    
  - name: "Payment Processor Down"
    condition: all tasks unhealthy
    action: page_on_call + escalate
\`\`\`

---

## Cost Breakdown

### Monthly Infrastructure Cost

| Component | Specification | Monthly Cost |
|-----------|---------------|--------------|
| **ECS Tasks** | 4x c6g.xlarge (24/7) | $400 |
| **RDS Transaction DB** | db.r6g.2xlarge + Multi-AZ | $600 |
| **RDS Operational DB** | db.r6g.xlarge + Replica | $350 |
| **ElastiCache Redis** | 4-node cluster | $200 |
| **SQS** | 10M requests/month | $50 |
| **ALB** | 2 load balancers | $50 |
| **Data Transfer** | 5TB outbound | $450 |
| **CloudWatch** | Logs + Metrics | $100 |
| **Cloudflare Pro** | WAF + DDoS | $200 |
| **Backups & Storage** | S3 snapshots | $100 |
| **Total** | **Per PSP instance** | **~$2,500/mo** |

**Scaling Costs:**
- **10K TPS:** ~$5,000/mo
- **50K TPS:** ~$12,000/mo
- **100K TPS:** ~$25,000/mo

---

## Conclusion

FTS.Money's architecture provides:

✅ **PCI DSS Level 1** compliance readiness  
✅ **100,000+ TPS** scalable capacity  
✅ **99.99%** uptime SLA  
✅ **Sub-200ms** P99 latency  
✅ **Multi-tenant** efficient infrastructure  
✅ **Global reach** with local compliance  

**Next Steps:**
- Review security controls
- Configure monitoring alerts
- Plan capacity for growth
- Schedule compliance audits

---

**Document Information**

- **Version:** 3.1
- **Last Updated:** January 11, 2026
- **Status:** Active
- **Classification:** Internal - Technical Teams
- **Owner:** Platform Engineering
- **Contact:** engineering@fts.money

© 2026 FTS.Money. Internal use only.`;

export default ArchitectureDoc;