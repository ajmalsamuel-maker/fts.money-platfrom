const PSPProvisioningSOPs = `# PSP Provisioning & Onboarding Standard Operating Procedures
## FTS.Money Multi-Tenant Platform Operations

**Document Classification:** Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** Operations & Sales Teams

---

## Table of Contents

1. [Overview](#overview)
2. [Sales & Lead Qualification](#sales-lead-qualification)
3. [Pre-Contractual Due Diligence](#pre-contractual-due-diligence)
4. [Solution Scoping & Proposal](#solution-scoping-proposal)
5. [Contract Negotiation & Approval](#contract-negotiation-approval)
6. [PSP Provisioning Workflow](#psp-provisioning-workflow)
7. [Technical Integration & Sandbox](#technical-integration-sandbox)
8. [Certification & Go-Live](#certification-go-live)
9. [Multi-User Setup](#multi-user-setup)
10. [Metrics & KPIs](#metrics-kpis)

---

## Overview

### Purpose

This SOP establishes standardized procedures for onboarding Payment Service Provider (PSP) customers on the FTS.Money platform, ensuring **24-hour deployment**, compliance with regulatory requirements, and seamless customer experience.

### Scope

- All new PSP customers (Starter, Growth, Professional, Enterprise tiers)
- Sales process from lead to contract
- Technical provisioning and go-live
- Multi-tenant isolation and security setup

### Key Performance Targets

| Metric | Target | Industry Benchmark |
|--------|--------|-------------------|
| **Lead Response Time** | <4 hours | <24 hours |
| **Sales Cycle** | 60-90 days | 90-180 days |
| **Provisioning Time** | <24 hours | 18-36 months (traditional) |
| **Go-Live Success Rate** | >95% | >85% |
| **First Transaction Time** | <48 hours post-provisioning | <7 days |

---

## SOP-PSP-001: Initial Prospect Engagement & Needs Assessment

### Purpose
Guide sales team on engaging PSP prospects, understanding requirements, and qualifying leads for FTS.Money platform.

### Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Sales Development Rep (SDR)** | Initial outreach, qualification, discovery |
| **Account Executive (AE)** | Deep discovery, solution alignment, demo coordination |
| **Solutions Engineer (SE)** | Technical discovery, architecture discussion |
| **Sales Manager** | Review qualification accuracy, approve resource allocation |

### Workflow

\`\`\`mermaid
sequenceDiagram
    participant Lead
    participant SDR
    participant AE
    participant SE
    participant CRM
    
    Lead->>SDR: Inbound inquiry / Outbound contact
    SDR->>Lead: Initial response (<4 hours)
    SDR->>Lead: Qualification call (BANT)
    SDR->>CRM: Log lead details
    
    alt Qualified Lead
        SDR->>AE: Hand-off with notes
        AE->>Lead: Discovery call (45-60 min)
        AE->>SE: Request technical deep-dive
        SE->>Lead: Architecture discussion
        AE->>CRM: Update opportunity stage
    else Unqualified
        SDR->>Lead: Nurture sequence
        SDR->>CRM: Mark as nurture
    end
\`\`\`

### Detailed Procedures

#### Step 1: Lead Reception & Initial Contact (0-4 hours)

**SDR Actions:**
1. Receive lead notification from:
   - Inbound form submission (website, Community Portal)
   - Marketing campaign response
   - Partner referral
   - Event/conference capture
   - Outbound prospecting list

2. **Initial Research (15 minutes):**
   - Company website review
   - LinkedIn company profile
   - Recent news/funding announcements
   - Identify decision makers (CTO, CEO, CFO)

3. **First Contact (via email or phone):**
   - Introduce FTS.Money value proposition
   - Request 15-minute discovery call
   - Share relevant case study or one-pager

**Template:** "Hi [Name], saw your interest in payment infrastructure. We help companies like [similar company] launch PSPs in 24 hours vs 18 months. Open to a quick 15-min call?"

#### Step 2: BANT Qualification (Discovery Call)

**BANT Framework:**

| Criteria | Questions to Ask | Qualification Threshold |
|----------|-----------------|------------------------|
| **Budget** | "What budget is allocated for payment infrastructure?" | >$50K annual budget |
| **Authority** | "Who else is involved in this decision?" | Access to C-level/VP |
| **Need** | "What's driving the need for PSP infrastructure now?" | Clear pain point (regulatory, growth, cost) |
| **Timeline** | "When do you need to be live?" | <12 months timeline |

**Qualification Scoring:**

\`\`\`mermaid
graph TD
    A[Lead Received] --> B{Budget >$50K?}
    B -->|Yes| C{Decision Maker Access?}
    B -->|No| Z[Nurture - SMB Sequence]
    C -->|Yes| D{Clear Use Case?}
    C -->|No| Y[Nurture - Authority Building]
    D -->|Yes| E{Timeline <12 months?}
    D -->|No| X[Educate - Solution Fit]
    E -->|Yes| F[QUALIFIED - Hand to AE]
    E -->|No| W[Nurture - Long-term]
    
    style F fill:#10b981,color:#fff
    style Z fill:#ef4444,color:#fff
\`\`\`

#### Step 3: Discovery & Documentation (AE-Led)

**AE conducts 45-60 minute discovery call covering:**

**Business Requirements:**
- Current payment infrastructure (if any)
- Transaction volumes (current and projected)
- Geographic coverage needed
- Merchant/customer count
- Compliance requirements (PCI level, jurisdictions)
- Integration requirements (existing systems)

**Technical Requirements:**
- Payment methods needed (cards, ACH, crypto, etc.)
- Settlement preferences (daily, weekly, real-time)
- Reporting needs
- API vs hosted checkout
- Multi-user requirements (staff count)

**Commercial Requirements:**
- Pricing tier preference
- Contract length preference
- Professional services needs
- Timeline constraints

**CRM Documentation:**
- Create detailed opportunity record
- Tag with industry vertical, tier, services interested
- Set expected close date
- Assign probability score

### Metrics & KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Lead response time (SDR) | <4 hours | Time from lead creation to first contact |
| Qualification call completion | >80% | Scheduled calls / total qualified leads |
| Lead-to-MQL conversion | >40% | Marketing Qualified Leads / Total Leads |
| MQL-to-SQL conversion | >30% | Sales Qualified Leads / MQLs |
| Discovery call completion | >70% | Calls held / Calls scheduled |

---

## SOP-PSP-002: Pre-Contractual Risk Assessment & Due Diligence

### Purpose
Ensure thorough KYC/KYB verification and risk assessment before contract execution, maintaining regulatory compliance and mitigating fraud/AML risks.

### Risk-Based Approach

\`\`\`mermaid
graph TB
    A[Prospect Qualified] --> B[Collect KYB Documents]
    B --> C{Risk Scoring Algorithm}
    
    C -->|Score 0-30| D[LOW RISK]
    C -->|Score 31-70| E[MEDIUM RISK]
    C -->|Score 71-100| F[HIGH RISK]
    
    D --> G[Auto-Approve - Compliance Officer]
    E --> H[Head of Sales Approval Required]
    F --> I[Risk Committee Review]
    
    G --> J[Proceed to Contract]
    H --> K{Approved?}
    I --> L{Approved?}
    
    K -->|Yes| J
    K -->|No| M[Reject - Document Rationale]
    L -->|Yes with Conditions| N[Enhanced Monitoring]
    L -->|No| M
    
    N --> J
    
    style D fill:#10b981,color:#fff
    style E fill:#f59e0b,color:#fff
    style F fill:#ef4444,color:#fff
\`\`\`

### Risk Scoring Matrix

**Automated Risk Score Calculation:**

| Risk Factor | Weight | Scoring Criteria |
|-------------|--------|------------------|
| **Geographic Risk** | 25% | Low risk (US, EU, Singapore) = 0 pts<br/>Medium risk (UAE, Brazil, Mexico) = 15 pts<br/>High risk (sanctioned countries) = 25 pts |
| **Business Model Risk** | 20% | Regulated PSP/Bank = 0 pts<br/>Fintech startup = 10 pts<br/>Crypto exchange = 20 pts<br/>High-risk MCC = 20 pts |
| **Volume Risk** | 15% | <$1M/mo = 0 pts<br/>$1M-$10M/mo = 5 pts<br/>$10M-$50M/mo = 10 pts<br/>$50M+/mo = 15 pts |
| **Entity Structure** | 15% | Public company = 0 pts<br/>Private (>5yr history) = 5 pts<br/>Startup (<2yr) = 10 pts<br/>Offshore entity = 15 pts |
| **Ownership Transparency** | 15% | All UBOs disclosed, verified = 0 pts<br/>Some complexity = 8 pts<br/>Opaque structure = 15 pts |
| **Compliance History** | 10% | No incidents = 0 pts<br/>Minor violations = 5 pts<br/>Major penalties = 10 pts |

**Total Score:** 0-100 (LOW: 0-30, MEDIUM: 31-70, HIGH: 71-100)

### Required Documentation

#### For ALL Prospects:

- ✅ Company registration certificate
- ✅ Articles of incorporation
- ✅ Beneficial ownership declaration (>25% ownership)
- ✅ Business model description (2-page max)
- ✅ Projected transaction volumes
- ✅ Director/officer identification (passport/ID)

#### For MEDIUM Risk:

- ✅ Financial statements (last 2 years)
- ✅ Banking references
- ✅ Regulatory licenses (if applicable)
- ✅ Proof of address (utility bills)

#### For HIGH Risk:

- ✅ Source of funds documentation
- ✅ Enhanced due diligence questionnaire
- ✅ Third-party background checks
- ✅ Legal opinion on business legality
- ✅ Site visit or video verification

### KYC/KYB Verification Process

**Automated Checks (via integrations):**

1. **Company Verification:**
   - LEI lookup (if available)
   - Company registry verification (local/GLEIF)
   - Sanctions screening (OFAC, EU, UN lists)
   - Adverse media screening

2. **Beneficial Owner Verification:**
   - Identity document verification (IDV)
   - Sanctions screening (individual level)
   - PEP (Politically Exposed Person) screening
   - Adverse media check

3. **Address Verification:**
   - Registered office validation
   - Operating address confirmation
   - Director address verification

### Approval Workflow

\`\`\`mermaid
stateDiagram-v2
    [*] --> Documents_Collected
    Documents_Collected --> Auto_Verification
    Auto_Verification --> Risk_Scoring
    
    Risk_Scoring --> Low_Risk
    Risk_Scoring --> Medium_Risk
    Risk_Scoring --> High_Risk
    
    Low_Risk --> Compliance_Approval
    Medium_Risk --> Sales_Head_Review
    High_Risk --> Risk_Committee
    
    Compliance_Approval --> Approved
    Sales_Head_Review --> Approved
    Sales_Head_Review --> Rejected
    Risk_Committee --> Approved_Conditions
    Risk_Committee --> Rejected
    
    Approved --> Proceed_to_Contract
    Approved_Conditions --> Enhanced_Monitoring
    Enhanced_Monitoring --> Proceed_to_Contract
    Rejected --> [*]
    
    Proceed_to_Contract --> [*]
\`\`\`

### SLA Requirements

| Risk Level | KYB Completion SLA | Approval SLA | Total Time |
|------------|-------------------|--------------|------------|
| **Low Risk** | 24 hours | 4 hours | 28 hours |
| **Medium Risk** | 48 hours | 24 hours | 72 hours |
| **High Risk** | 5 business days | 3 business days | 8 business days |

### Metrics

- KYB completion time (by risk tier)
- Percentage of prospects rejected (target: <15%)
- False positive rate on sanctions screening (target: <5%)
- Time to complete risk assessment (target: <48 hours for medium risk)

---

## SOP-PSP-003: Solution Scoping & Proposal Generation

### Purpose
Define how sales teams customize FTS.Money solutions and generate proposals aligned with prospect requirements.

### Solution Configuration Matrix

| Tier | Setup Fee | Monthly Fee | Merchants | Services Included | Target Customer |
|------|-----------|-------------|-----------|-------------------|-----------------|
| **Starter** | $2,500 | $499 | 10 | PSP Core, Basic reporting, Email support | Solo entrepreneurs, startups |
| **Growth** | $2,500 | $2,499 | 100 | PSP Core, Advanced analytics, Priority support, Service marketplace | Growing PSPs, neo-banks |
| **Professional** | Waived | $9,999 | 1,000 | Full platform, Custom reporting, Dedicated support, White-label | Established PSPs, regional processors |
| **Enterprise** | Waived | Custom | Unlimited | All services, Custom development, White-glove support, SLA guarantees | Banks, large institutions |

### Service Add-Ons Catalog

**Available for all tiers:**

| Service | Monthly Fee | Setup | Description |
|---------|-------------|-------|-------------|
| **Crypto VASP** | +$999 - $19,999 | $5,000 | Crypto wallets, IBANs, cards via Striga |
| **ISO Gateway** | +$499 - $9,999 | $2,500 | Message translation (8583, 20022, SWIFT MT) |
| **Orchestration** | +$299 - $2,999 | $1,000 | Multi-processor routing optimization |
| **Tax Management** | +$199 - $1,999 | $500 | 170-country automated tax compliance |
| **E-Invoicing** | +$149 - $1,499 | $500 | 60-country government submission |
| **PCI Compliance Suite** | +$999 - $9,999 | $2,500 | Automated compliance monitoring |
| **RWA Tokenization** | +$2,999 - $29,999 | $10,000 | White-label asset tokenization platform |

### Proposal Generation Process

\`\`\`mermaid
flowchart TD
    A[Discovery Complete] --> B[Solutions Engineer Review]
    B --> C[Select Base Tier]
    C --> D[Configure Add-On Services]
    D --> E[Calculate Pricing]
    E --> F{Custom Pricing Needed?}
    
    F -->|No| G[Use Standard Pricing]
    F -->|Yes| H[Finance Approval Required]
    
    G --> I[Generate Proposal Doc]
    H --> I
    
    I --> J[Legal Review - Compliance Check]
    J --> K[Sales Manager Approval]
    K --> L[Send to Prospect]
    
    L --> M[Schedule Proposal Review Call]
    M --> N{Objections?}
    
    N -->|Yes| O[Address Concerns / Revise]
    N -->|No| P[Move to Contract]
    
    O --> L
    
    style P fill:#10b981,color:#fff
\`\`\`

### Proposal Content Template

**Section 1: Executive Summary**
- Prospect's business challenges (customized)
- FTS.Money solution overview
- Key benefits quantified (e.g., "Launch in 24 hours vs 18 months, save $4.8M in development costs")

**Section 2: Solution Architecture**
- Platform tier recommended
- Add-on services configured
- Technical architecture diagram
- Integration approach (API, hosted, hybrid)

**Section 3: Implementation Plan**
- Timeline (provisioning, integration, go-live)
- Milestones and deliverables
- Resource requirements (from prospect)
- Training and support plan

**Section 4: Pricing & Commercial Terms**
- Detailed pricing breakdown
- Payment terms (monthly, annual prepay discount)
- Contract length options
- Service level commitments

**Section 5: Success Metrics**
- Expected time-to-market
- Cost savings vs alternatives
- Performance benchmarks (uptime, latency)
- Support SLAs

### Pricing Approval Matrix

| Deal Size | Discount Authority | Approval Required |
|-----------|-------------------|-------------------|
| **Standard Pricing** | AE | Sales Manager (notification only) |
| **Up to 10% discount** | AE | Sales Manager approval |
| **10-20% discount** | Sales Manager | VP Sales approval |
| **20-30% discount** | VP Sales | CFO + CEO approval |
| **>30% discount** | CEO | Board approval |

### Metrics

- Proposal generation time (target: <3 business days)
- Proposal win rate (target: >25%)
- Average discount given (target: <12%)
- Proposal-to-contract cycle time (target: <21 days)

---

## SOP-PSP-004: Contract Negotiation & Approval Workflow

### Purpose
Standardize contract negotiation process and obtain necessary approvals before customer signature.

### Contract Types

| Contract Type | Use Case | Template | Approval Level |
|---------------|----------|----------|----------------|
| **Standard MSA** | Starter/Growth tiers, standard terms | MSA-STD-v2.3 | Sales Manager |
| **Professional MSA** | Professional tier, minor customizations | MSA-PRO-v2.1 | VP Sales + Legal |
| **Enterprise Agreement** | Custom terms, SLAs, volume commitments | MSA-ENT-v2.0 | CFO + CEO + Legal |
| **Pilot/POC Agreement** | 30-60 day trials | PILOT-v1.2 | Sales Manager |

### Negotiation Process

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant AE as Account Executive
    participant Legal
    participant Finance
    participant Management
    participant DocuSign
    
    Customer->>AE: Request contract changes
    AE->>AE: Document requested changes
    AE->>Legal: Submit for review
    
    Legal->>Legal: Assess legal/compliance risk
    Legal->>AE: Provide redline + comments
    
    AE->>Finance: Review pricing/payment terms
    Finance->>AE: Approve or request changes
    
    AE->>Management: Route for approval (if >$50K ARR)
    Management->>AE: Approve with signature authority
    
    AE->>Customer: Share final contract
    Customer->>DocuSign: Execute electronically
    DocuSign->>AE: Countersigned contract
    
    AE->>AE: Update CRM to "Closed Won"
    AE->>Implementation: Trigger handoff workflow
\`\`\`

### Common Negotiation Points & Guidelines

| Customer Request | Standard Position | Negotiation Flexibility | Approval Required |
|-----------------|-------------------|------------------------|-------------------|
| **Extended payment terms** | Net 30 | Can extend to Net 60 for Enterprise | CFO |
| **Custom SLA** | 99.9% uptime | Can commit 99.95% for Enterprise | CTO + Legal |
| **Data residency** | AWS US/EU | Can provision specific region | CTO (cost impact) |
| **Liability cap** | 12 months fees | Can increase to 24 months | CEO + Legal |
| **Termination rights** | 90-day notice | Can reduce to 60-day for Enterprise | Legal |
| **IP ownership** | FTS owns platform IP | Non-negotiable | N/A |
| **Volume discounts** | Tiered pricing | Can offer 5-15% at high volumes | VP Sales |

### Approval Routing Rules

**Contract Value Thresholds:**

\`\`\`yaml
approval_routing:
  tier_1_under_50k_arr:
    approvers:
      - Sales Manager
    sla: 24 hours
    
  tier_2_50k_to_200k_arr:
    approvers:
      - Sales Manager
      - VP Sales
      - Legal (if non-standard terms)
    sla: 48 hours
    
  tier_3_200k_to_500k_arr:
    approvers:
      - VP Sales
      - CFO
      - Legal
    sla: 5 business days
    
  tier_4_above_500k_arr:
    approvers:
      - CEO
      - CFO
      - General Counsel
      - CTO (if technical commitments)
    sla: 10 business days
\`\`\`

### Legal Review Checklist

Legal team validates:
- ✅ Compliance with data protection laws (GDPR, CCPA)
- ✅ PCI DSS obligations and liability allocation
- ✅ Intellectual property clauses
- ✅ Indemnification and limitation of liability
- ✅ Termination and suspension rights
- ✅ Dispute resolution and governing law
- ✅ Service level commitments are achievable
- ✅ No prohibited industries/activities

### Metrics

- Contract approval cycle time (target: <5 business days for standard)
- Percentage requiring legal amendments (target: <30%)
- Contract execution rate (target: >90% of sent contracts)

---

## SOP-PSP-005: Sales to Implementation Handoff

### Purpose
Ensure zero information loss during transition from sales to implementation teams.

### Handoff Package Contents

**Required Documentation:**

1. **Customer Dossier:**
   - Signed contract (PDF + metadata)
   - KYC/KYB documentation
   - Risk assessment report
   - Solution architecture diagram
   - Pricing and billing setup
   - Technical requirements document

2. **Implementation Specifications:**
   - Chosen tier and add-on services
   - Payment methods to enable
   - Geographic regions to support
   - Multi-user setup requirements (roles, count)
   - Custom branding requirements
   - Integration approach (API keys, hosted checkout, etc.)

3. **Timeline Commitments:**
   - Contractual go-live date
   - Key milestones and dependencies
   - Customer availability for calls/testing
   - Training session schedules

### Handoff Meeting Agenda

**Duration:** 30 minutes

**Attendees:**
- Account Executive (AE)
- Solutions Engineer (SE)
- Implementation Manager (IM)
- Customer Success Manager (CSM) - assigned
- Technical Account Manager (TAM) - assigned

**Agenda:**
1. Customer background and business model (5 min)
2. Solution walkthrough and technical requirements (10 min)
3. Special requests or customizations (5 min)
4. Timeline and milestones review (5 min)
5. Q&A and clarifications (5 min)

**Handoff Workflow:**

\`\`\`mermaid
gantt
    title PSP Customer Handoff Timeline
    dateFormat YYYY-MM-DD
    
    section Sales
    Contract Signed                :milestone, m1, 2026-01-01, 0d
    Prepare Handoff Package        :a1, 2026-01-01, 1d
    
    section Handoff
    Schedule Handoff Meeting       :a2, 2026-01-02, 1d
    Conduct Handoff Meeting        :a3, 2026-01-03, 1d
    Implementation Acknowledge     :milestone, m2, 2026-01-03, 0d
    
    section Implementation
    Provision PSP Instance         :a4, 2026-01-04, 1d
    Technical Onboarding           :a5, 2026-01-05, 3d
    Go-Live                        :milestone, m3, 2026-01-08, 0d
\`\`\`

### CRM Updates

**Status Changes:**
- Opportunity Status: "Closed Won"
- Customer Status: "Onboarding"
- Assigned CSM and TAM
- Implementation start date
- Expected go-live date

### Metrics

- Handoff delay from contract signing (target: <24 hours)
- Handoff meeting completion rate (target: 100%)
- Implementation team satisfaction with handoff quality (target: >4.5/5)
- Number of follow-up clarifications post-handoff (target: <3 per customer)

---

## SOP-PSP-006: Automated PSP Provisioning (24-Hour Deployment)

### Purpose
Execute rapid, reliable PSP instance provisioning using automation while maintaining security and compliance.

### Provisioning Architecture

\`\`\`mermaid
graph TB
    subgraph "Provisioning Workflow"
        A[Contract Signed] --> B[Trigger Provisioning Function]
        B --> C{Multi-Tenant Database}
        C --> D[Create PSP Schema]
        C --> E[Provision Entities]
        C --> F[Configure Permissions]
        
        D --> G[Setup Payment Gateways]
        E --> H[Create Admin User]
        F --> I[Deploy Portal Instance]
        
        G --> J[Configure Routing Rules]
        H --> K[Send Credentials Email]
        I --> L[Custom Branding Applied]
        
        J --> M[Provision Monitoring]
        K --> M
        L --> M
        
        M --> N[Health Check Validation]
        N --> O{All Systems Green?}
        
        O -->|Yes| P[Mark as Active]
        O -->|No| Q[Alert DevOps Team]
        
        P --> R[Customer Success Notification]
        Q --> S[Manual Intervention]
        S --> N
    end
    
    style P fill:#10b981,color:#fff
    style Q fill:#ef4444,color:#fff
\`\`\`

### Detailed Provisioning Steps

#### Phase 1: Infrastructure Setup (0-4 hours)

**Step 1: Database Provisioning**
- Create isolated schema: \`psp_[customer_code]\`
- Apply entity migrations (Merchant, Transaction, Settlement, etc.)
- Set up RLS (Row-Level Security) policies
- Create database backups schedule

**Step 2: Multi-Tenant Isolation**
- Assign unique PSP code (8-char alphanumeric)
- Configure tenant-scoped queries
- Setup data encryption keys
- Establish audit logging

**Step 3: Portal Deployment**
- Clone white-label portal template
- Apply custom branding (logo, colors from contract)
- Configure custom domain (if provided)
- Deploy SSL certificate

#### Phase 2: Configuration & Integration (4-12 hours)

**Step 4: Payment Gateway Integration**
- Configure enabled payment methods per contract
- Setup processor connections (Stripe, Adyen, PayPal, etc.)
- Configure interchange rates and pricing
- Test connectivity to each processor

**Step 5: Business Rules Configuration**
- Set transaction limits per tier
- Configure settlement schedules (daily, weekly, etc.)
- Setup fraud rules and velocity checks
- Configure reporting templates

**Step 6: User & Access Setup**
- Create admin user account (from contract)
- Assign Owner role
- Generate API keys (sandbox + production)
- Setup MFA requirements

#### Phase 3: Validation & Go-Live (12-24 hours)

**Step 7: Automated Testing**
- Run provisioning validation suite (200+ checks)
- Test transaction flow end-to-end
- Validate reporting and dashboard
- Confirm all integrations responding

**Step 8: Customer Notification**
- Send welcome email with credentials
- Provide onboarding checklist
- Schedule technical onboarding call (within 48 hours)
- Assign Customer Success Manager

### Provisioning Checklist

**Pre-Provisioning Checklist:**
- ✅ Contract fully executed
- ✅ KYC/KYB approved
- ✅ Payment received (setup fee + first month) OR payment method on file
- ✅ Implementation team acknowledged handoff
- ✅ Customer contact details confirmed

**Post-Provisioning Validation:**

| Check | Automated | Manual | Pass Criteria |
|-------|-----------|--------|---------------|
| Database schema created | ✅ | | All tables exist, indexes created |
| Admin user can login | ✅ | | Successful authentication |
| Dashboard loads | ✅ | | <2 second load time |
| API keys functional | ✅ | | Test transaction succeeds |
| Email notifications working | ✅ | | Welcome email delivered |
| Payment processors connected | | ✅ | At least 1 processor returns auth |
| Reporting queries functional | ✅ | | Sample reports generate |
| Custom branding applied | | ✅ | Logo displays, colors correct |
| Multi-user RBAC working | ✅ | | Test user roles enforce correctly |
| Audit logging active | ✅ | | Events logged to audit trail |

### Error Handling & Rollback

**If Provisioning Fails:**

\`\`\`mermaid
graph LR
    A[Provisioning Error Detected] --> B{Error Type?}
    
    B -->|Database| C[Rollback Schema]
    B -->|Gateway| D[Retry Connection]
    B -->|Portal| E[Redeploy Instance]
    B -->|Configuration| F[Reset to Defaults]
    
    C --> G[Alert DevOps]
    D --> H{Retry Successful?}
    E --> G
    F --> I[Manual Configuration Required]
    
    H -->|Yes| J[Continue Provisioning]
    H -->|No| G
    
    G --> K[Manual Investigation]
    K --> L[Fix Issue]
    L --> M[Resume Provisioning]
    M --> N[Complete Successfully]
    
    I --> G
    
    style N fill:#10b981,color:#fff
    style G fill:#f59e0b,color:#fff
\`\`\`

**Escalation Procedure:**
- Minor issues (<10% of checks failed): DevOps investigates within 2 hours
- Major issues (>10% failed): Immediate escalation to CTO
- Customer notified if delay >4 hours beyond committed timeline

### Metrics

- Provisioning success rate (target: >95%)
- Average provisioning time (target: <18 hours)
- Zero-touch provisioning rate (target: >80% - no manual intervention)
- Post-provisioning issues within 7 days (target: <5% of deployments)

---

## SOP-PSP-007: Technical Integration & Sandbox Testing

### Purpose
Enable PSP customers to integrate with FTS.Money platform via sandbox environment before production deployment.

### Integration Approaches

| Approach | Use Case | Complexity | Time to Integrate |
|----------|----------|------------|-------------------|
| **Hosted Checkout** | Merchants using web checkout | Low | <1 day |
| **API Integration** | PSPs building custom UI | Medium | 5-10 days |
| **ISO Gateway** | Legacy systems integration | High | 10-20 days |
| **White-Label Portal** | Full platform customization | Medium | 3-7 days |

### Sandbox Environment Specifications

**What's Included:**
- Isolated test environment (no real money)
- Test card numbers and bank accounts
- Sample transaction data (100 pre-loaded transactions)
- Full API access (same as production)
- Test merchant accounts (10 pre-configured)
- All payment methods enabled
- Real-time support via Slack channel

**Limitations:**
- Max 1,000 test transactions per day
- 30-day sandbox access (extendable)
- No real payment processor connections
- Simulated settlement cycles

### Technical Onboarding Call Agenda

**Duration:** 60-90 minutes  
**Attendees:** Technical Account Manager (TAM), customer's engineering team

**Agenda:**

1. **Platform Architecture Overview (15 min)**
   - Multi-tenant model explanation
   - API structure and authentication
   - Webhook event system
   - Rate limits and quotas

2. **API Walkthrough (30 min)**
   - Authentication (API keys, OAuth)
   - Transaction processing endpoints
   - Merchant management APIs
   - Settlement and reporting APIs
   - Webhook configuration

3. **Integration Patterns (20 min)**
   - Hosted checkout integration
   - Server-to-server API calls
   - Client-side JavaScript SDK
   - Mobile SDK (iOS, Android)

4. **Testing & Certification (15 min)**
   - Sandbox testing requirements
   - Certification checklist
   - Common integration issues
   - Support escalation process

5. **Q&A and Next Steps (10 min)**

### Integration Testing Checklist

Customer must successfully complete:

**Core Transaction Flows:**
- ✅ Create merchant account
- ✅ Process authorization (test card)
- ✅ Capture authorized transaction
- ✅ Process full sale (auth + capture)
- ✅ Void transaction
- ✅ Refund transaction (partial and full)
- ✅ Handle declined transactions gracefully

**Advanced Flows:**
- ✅ 3D Secure authentication
- ✅ Tokenization (save card)
- ✅ Recurring/subscription payment
- ✅ Multi-currency transaction
- ✅ Payout processing

**Webhooks & Events:**
- ✅ Configure webhook endpoint
- ✅ Receive transaction events
- ✅ Handle webhook retries
- ✅ Validate webhook signatures

**Error Handling:**
- ✅ Handle API errors gracefully
- ✅ Implement retry logic
- ✅ Display user-friendly error messages

### Certification Requirements

**Automated Certification Tests (run by FTS.Money):**

| Test Category | Tests | Pass Criteria |
|--------------|-------|---------------|
| **Transaction Processing** | 25 tests | 100% pass |
| **Error Handling** | 15 tests | 100% pass |
| **Security** | 20 tests | 100% pass (HTTPS, API key handling) |
| **Webhook Reliability** | 10 tests | 100% pass |
| **Performance** | 5 tests | <500ms avg response time |

**Manual Review:**
- Code review of integration (if white-label portal customization)
- Security assessment (API key storage, PCI scope)
- Compliance review (data handling, privacy)

### Go-Live Approval

**Criteria:**
- All automated tests passed
- Manual review completed
- Customer confirms readiness
- Production configuration verified
- Support team briefed on customer

**Production Cutover Process:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Sandbox_Testing
    Sandbox_Testing --> Certification_Tests
    Certification_Tests --> Manual_Review
    Manual_Review --> Customer_Confirmation
    Customer_Confirmation --> Production_Config
    Production_Config --> Go_Live_Approval
    Go_Live_Approval --> Production_Active
    Production_Active --> [*]
    
    Certification_Tests --> Sandbox_Testing: Failed Tests
    Manual_Review --> Sandbox_Testing: Issues Found
\`\`\`

### Metrics

- Average integration time (target: <10 days for API)
- Certification pass rate on first attempt (target: >75%)
- Sandbox-to-production time (target: <48 hours after certification)
- Post-integration support tickets (target: <10 in first 30 days)

---

## SOP-PSP-008: Multi-User Account Setup (RBAC)

### Purpose
Configure multi-user access with role-based permissions for PSP staff teams.

### Six-Tier Role Hierarchy

| Role | Permission Level | Typical User | Use Cases |
|------|-----------------|--------------|-----------|
| **Owner** | 100% (all permissions) | PSP CEO, Founder | Full platform control, billing, user management |
| **Administrator** | 90% | CTO, COO | Operations, configuration, user management (can't delete Owner) |
| **Developer** | 70% | Integration engineers | API access, testing, sandbox management |
| **Operations** | 60% | Payment ops team | Transaction management, settlements, disputes |
| **Analyst** | 40% | BI, finance analysts | Reporting, analytics, read-only data access |
| **Viewer** | 20% | External auditors, consultants | Read-only access, no PII visibility |

### User Provisioning Workflow

\`\`\`mermaid
sequenceDiagram
    participant Owner as PSP Owner
    participant Portal as FTS Portal
    participant System as FTS Backend
    participant NewUser as New User
    participant Email as Email Service
    
    Owner->>Portal: Navigate to User Management
    Owner->>Portal: Click "Invite User"
    Owner->>Portal: Enter email + role + permissions
    Portal->>System: Validate invite (email unique, role valid)
    
    System->>System: Generate invite token (24h expiry)
    System->>Email: Send invitation email
    Email->>NewUser: Invitation with magic link
    
    NewUser->>Portal: Click magic link
    Portal->>System: Validate token
    System->>Portal: Show password setup page
    NewUser->>Portal: Set password + MFA
    
    Portal->>System: Create user account
    System->>System: Assign role + permissions
    System->>Email: Send welcome email
    System->>Owner: Notify user activated
    
    NewUser->>Portal: Login with credentials
    Portal->>NewUser: Dashboard (role-scoped)
\`\`\`

### Permission Matrix

**Detailed permissions by role:**

| Resource/Action | Owner | Admin | Developer | Operations | Analyst | Viewer |
|-----------------|-------|-------|-----------|-----------|---------|--------|
| **Merchants** | | | | | | |
| - Create | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| - Read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| - Update | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| - Delete | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Transactions** | | | | | | |
| - Process | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| - View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| - Refund | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| - Export | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Settings** | | | | | | |
| - View | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| - Update Pricing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| - API Keys | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| - Webhooks | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Users** | | | | | | |
| - Invite | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| - Modify Roles | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| - Deactivate | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Billing** | | | | | | |
| - View Invoices | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| - Update Payment Method | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| - Download Statements | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |

### Metrics

- User provisioning time (target: <10 minutes)
- User activation rate (target: >90% within 48 hours)
- Role misconfiguration incidents (target: 0)

---

## SOP-PSP-009: Production Go-Live & Monitoring

### Purpose
Ensure smooth production cutover with comprehensive monitoring and support.

### Go-Live Checklist

**Pre-Go-Live (T-24 hours):**
- ✅ All certification tests passed
- ✅ Production configuration verified
- ✅ Payment processors tested (live credentials)
- ✅ Customer team trained on portal
- ✅ Support team briefed on customer
- ✅ Monitoring alerts configured
- ✅ Customer confirms go-live date/time

**Go-Live (T=0):**
- ✅ Enable production mode
- ✅ Customer processes first live transaction
- ✅ Verify transaction successful end-to-end
- ✅ Confirm settlement initiated
- ✅ Check all webhooks firing
- ✅ Monitor for 4 hours post-first-transaction

**Post-Go-Live (T+24 to T+30 days):**
- ✅ Daily monitoring by TAM (first week)
- ✅ Weekly check-in calls (first month)
- ✅ Performance optimization review
- ✅ 30-day health check report

### First 30 Days Support Protocol

**Enhanced Support Period:**

| Timeframe | Support Level | Response Time | Monitoring Frequency |
|-----------|---------------|---------------|---------------------|
| **Days 1-7** | White-glove | <1 hour | Continuous (NOC alerts) |
| **Days 8-14** | Priority | <2 hours | 4x daily health checks |
| **Days 15-30** | Standard+ | <4 hours | Daily health checks |
| **Days 31+** | Standard | Per SLA | Automated alerts only |

### Success Metrics

- Go-live success rate (target: >95%)
- First transaction processing success (target: >98%)
- Critical issues in first 30 days (target: 0)
- Customer satisfaction post-go-live (target: >4.5/5)

---

## Appendix: Forms & Templates

### A. Customer Intake Form
### B. Risk Assessment Scorecard
### C. Proposal Template
### D. Handoff Checklist
### E. Provisioning Runbook

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** VP Sales & VP Operations
- **Review Frequency:** Quarterly
- **Next Review:** April 11, 2026

© 2026 FTS.Money. Internal use only.
`;

export default PSPProvisioningSOPs;