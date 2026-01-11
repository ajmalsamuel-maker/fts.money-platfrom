const MultiServiceCustomerSuccessSOPs = `# Multi-Service Customer Success Standard Operating Procedures
## FTS.Money Platform Customer Support & Growth

**Document Classification:** Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** Customer Success Team

---

## Table of Contents

1. [Overview](#overview)
2. [Tiered Support Model](#tiered-support-model)
3. [Technical Account Management](#technical-account-management)
4. [Quarterly Business Reviews](#quarterly-business-reviews)
5. [Upsell & Cross-Sell Strategy](#upsell-cross-sell-strategy)
6. [Customer Feedback Loop](#customer-feedback-loop)
7. [Churn Prevention](#churn-prevention)
8. [Service-Specific Support](#service-specific-support)

---

## Overview

### Purpose

Establish customer success procedures across FTS.Money's 11-service platform to drive:
- Customer retention (target: >92%)
- Net Revenue Retention (target: >125%)
- Customer satisfaction (NPS target: >50)
- Service adoption and expansion

### Multi-Service Support Model

**Challenge:** Customers may subscribe to 1-7 services simultaneously (PSP + Crypto + ISO + Tax + etc.)

**Solution:** Unified support with service-specific escalation paths

\`\`\`mermaid
graph TB
    A[Customer Support Request] --> B{Service Type?}
    
    B -->|PSP Platform| C[PSP Support Team]
    B -->|Crypto VASP| D[Crypto Support Team]
    B -->|ISO Gateway| E[ISO Support Team]
    B -->|RWA Platform| F[RWA Support Team]
    B -->|Tax/E-Invoice| G[Tax Support Team]
    B -->|Billing/General| H[General Support]
    
    C --> I[Tier 1: Support Agent]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J{Can Resolve?}
    J -->|Yes| K[Resolution <4h]
    J -->|No| L[Tier 2: Technical Support]
    
    L --> M{Can Resolve?}
    M -->|Yes| N[Resolution <24h]
    M -->|No| O[Tier 3: Engineering/Product]
    
    O --> P[Resolution <72h]
    
    style K fill:#10b981,color:#fff
    style N fill:#10b981,color:#fff
    style P fill:#f59e0b,color:#fff
\`\`\`

---

## SOP-CS-001: Tiered Support Ticket Handling & Escalation

### Purpose
Provide structured, timely support across all FTS.Money services with clear SLAs and escalation paths.

### Support Tier Structure

#### Tier 1: Front-Line Support (AI + Human)

**Coverage:**
- 24/7 via AI chatbot (handles 60% of inquiries)
- Business hours (8am-6pm local time) human agents
- Email, chat, phone support

**Handles:**
- Login/password issues
- Basic navigation questions
- Documentation/how-to requests
- Invoice/billing inquiries
- Status checks (transactions, settlements)

**SLA:**
- First response: <1 hour (business hours), <4 hours (after hours)
- Resolution target: 80% within 4 hours

#### Tier 2: Technical Support

**Coverage:**
- Business hours + on-call rotation
- Slack channel for Enterprise customers

**Handles:**
- API integration issues
- Webhook debugging
- Payment processor errors
- Transaction failures requiring investigation
- Configuration changes
- Performance issues

**SLA:**
- First response: <2 hours
- Resolution target: 70% within 24 hours

#### Tier 3: Engineering/Product

**Coverage:**
- On-call rotation for critical issues
- Planned for complex bugs, feature requests

**Handles:**
- Platform bugs
- Service outages
- Security incidents
- Data inconsistencies
- Custom development requests

**SLA:**
- First response: <4 hours (critical), <24 hours (non-critical)
- Resolution: Varies by complexity, committed timeline provided within 48 hours

### Ticket Classification System

**Priority Levels:**

| Priority | Definition | Examples | SLA |
|----------|-----------|----------|-----|
| **P1 - Critical** | Complete service outage, security breach, data loss | Platform down, payment processing halted, security incident | <1 hour response, <4 hour resolution target |
| **P2 - High** | Major feature broken, significant customer impact | Settlement delays, API errors affecting multiple merchants, incorrect reporting | <2 hour response, <24 hour resolution |
| **P3 - Medium** | Minor feature issue, workaround available | UI bug, slow dashboard, minor data discrepancy | <4 hour response, <72 hour resolution |
| **P4 - Low** | Enhancement request, general question | Feature request, documentation clarification | <24 hour response, no resolution SLA |

### Escalation Matrix

\`\`\`mermaid
graph TD
    A[Ticket Created] --> B{Priority Level}
    
    B -->|P1 Critical| C[Immediate: Page On-Call Engineer]
    B -->|P2 High| D[Tier 2 Assignment]
    B -->|P3/P4| E[Tier 1 Queue]
    
    C --> F[CTO Notified]
    C --> G[Customer Success Director Notified]
    C --> H[Incident Response Protocol]
    
    D --> I{Resolved in 4h?}
    E --> J{Resolved in 24h?}
    
    I -->|Yes| K[Close Ticket]
    I -->|No| L[Escalate to Tier 3 + Management]
    
    J -->|Yes| K
    J -->|No| M[Escalate to Tier 2]
    
    M --> I
    L --> H
    
    style C fill:#ef4444,color:#fff
    style K fill:#10b981,color:#fff
\`\`\`

### Service-Specific Support Routing

**Automatic routing based on ticket category:**

| Service | Routing Tag | Specialized Team | Common Issues |
|---------|-------------|------------------|---------------|
| **PSP Platform** | \`#psp\` | PSP Support | Transaction processing, merchant setup, routing rules |
| **Crypto VASP** | \`#crypto\` | Crypto Support + Striga escalation | Wallet creation, IBAN provisioning, card issuance, KYC delays |
| **ISO Gateway** | \`#iso\` | ISO Support | Message translation errors, connection issues, routing failures |
| **Orchestration** | \`#orchestration\` | Routing Support | Processor failover, cost optimization, routing logic |
| **RWA Platform** | \`#rwa\` | RWA Support | Asset tokenization, investor KYC, dividend distribution |
| **Tax/E-Invoicing** | \`#tax\` | Tax Support | Calculation errors, country-specific rules, government submission failures |
| **PCI Compliance** | \`#pci\` | Compliance Support | Evidence submission, requirement interpretation, QSA coordination |
| **Billing** | \`#billing\` | Finance Support | Invoice questions, usage discrepancies, payment issues |

### Communication Templates

**P1 Critical Incident:**
\`\`\`
Subject: [P1 CRITICAL] [Service] Issue - [Brief Description]

Hi [Customer Name],

We have detected a critical issue with [service]:
**Issue:** [Description]
**Impact:** [What's affected]
**Status:** Investigating / Fixing / Resolved
**ETA:** [Time to resolution or next update]

Our engineering team is actively working on this. Updates every 30 minutes.

Point of Contact: [Name] - [Phone] - [Email]

FTS.Money Support Team
\`\`\`

### Metrics

- First response time by priority (target: meet SLA 95% of time)
- Ticket resolution rate within SLA (target: >90%)
- Customer satisfaction (CSAT) per ticket (target: >4.5/5)
- Escalation rate (target: <10% of tickets)
- Repeat ticket rate (target: <15% - same issue within 30 days)

---

## SOP-CS-002: Technical Account Management (TAM) Engagement

### Purpose
Proactive technical partnership with customers to drive adoption, prevent issues, and identify growth opportunities.

### TAM Assignment Criteria

| Customer Segment | TAM Ratio | Engagement Frequency |
|------------------|-----------|---------------------|
| **Enterprise** ($500K+ ARR) | 1 TAM : 10 customers | Weekly touchpoints, monthly calls |
| **Professional** ($100K-$500K ARR) | 1 TAM : 25 customers | Bi-weekly touchpoints, monthly calls |
| **Growth** ($20K-$100K ARR) | 1 TAM : 50 customers | Monthly touchpoints, quarterly calls |
| **Starter** (<$20K ARR) | Pooled support | Automated check-ins, quarterly calls |

### TAM Monthly Cadence

\`\`\`mermaid
gantt
    title TAM Monthly Engagement Cycle
    dateFormat YYYY-MM-DD
    
    section Week 1
    Review Customer Health Score      :w1a, 2026-01-01, 2d
    Analyze Usage Metrics             :w1b, 2026-01-01, 2d
    Identify At-Risk Customers        :w1c, 2026-01-03, 1d
    
    section Week 2
    Proactive Outreach Calls          :w2a, 2026-01-06, 3d
    Platform Update Communications    :w2b, 2026-01-06, 2d
    Technical Issue Review            :w2c, 2026-01-08, 2d
    
    section Week 3
    Monthly Check-In Calls            :w3a, 2026-01-13, 5d
    Feature Adoption Coaching         :w3b, 2026-01-13, 3d
    Upsell Opportunity Identification :w3c, 2026-01-15, 3d
    
    section Week 4
    QBR Preparation (for due customers):w4a, 2026-01-20, 3d
    Documentation & Reporting         :w4b, 2026-01-23, 2d
    Internal Knowledge Sharing        :w4c, 2026-01-25, 1d
\`\`\`

### Customer Health Score Model

**Automated health scoring (0-100):**

| Component | Weight | Green (70-100) | Yellow (40-69) | Red (0-39) |
|-----------|--------|----------------|----------------|------------|
| **Product Usage** | 30% | >80% feature adoption | 40-79% adoption | <40% adoption |
| **Transaction Volume** | 25% | Growing or stable | Flat | Declining >20% |
| **Support Tickets** | 20% | <2/month | 2-5/month | >5/month |
| **Payment Status** | 15% | Current, auto-pay | Net 30, manual pay | Overdue >15 days |
| **Engagement** | 10% | Attends calls, responds quickly | Occasionally engaged | Rarely responsive |

**Health Score Actions:**

\`\`\`mermaid
graph LR
    A[Calculate Health Score] --> B{Score Range}
    
    B -->|70-100 Green| C[Standard Engagement]
    B -->|40-69 Yellow| D[Increase Touchpoints]
    B -->|0-39 Red| E[Executive Escalation]
    
    C --> F[Monthly Check-Ins]
    D --> G[Bi-Weekly Calls]
    D --> H[Feature Adoption Plan]
    E --> I[VP Customer Success Involved]
    E --> J[Save Plan Created]
    E --> K[Exec-to-Exec Call]
    
    style C fill:#10b981,color:#fff
    style D fill:#f59e0b,color:#fff
    style E fill:#ef4444,color:#fff
\`\`\`

### Proactive Support Activities

**Monthly Platform Updates:**
- Release notes summarized for each customer
- Highlight features relevant to their use case
- Migration guides for deprecated features
- Beta program invitations

**Quarterly Business Reviews:**
- Performance metrics review
- Usage optimization recommendations
- Roadmap preview
- Feedback session

### Metrics

- TAM engagement frequency (target: 100% customers contacted monthly)
- Customer health score trend (target: >70% green, <10% red)
- Proactive issue resolution (target: 40% of issues identified before customer reports)
- TAM customer satisfaction (target: >4.7/5)

---

## SOP-CS-003: Quarterly Business Review (QBR) Process

### Purpose
Structured quarterly reviews to assess customer performance, satisfaction, and strategic alignment.

### QBR Eligibility & Frequency

| Customer Segment | QBR Frequency | Format | Duration |
|------------------|---------------|--------|----------|
| **Enterprise** ($500K+ ARR) | Quarterly | Executive + Technical tracks | 90 min |
| **Professional** ($100K-$500K ARR) | Quarterly | Combined session | 60 min |
| **Growth** ($20K-$100K ARR) | Bi-annual | Virtual presentation | 45 min |
| **Starter** (<$20K ARR) | Annual or on-request | Virtual + self-service dashboard | 30 min |

### QBR Preparation Timeline

**T-14 days:**
- Schedule QBR with customer stakeholders
- Send calendar invitation with agenda
- Assign QBR owner (CSM or TAM)

**T-7 days:**
- Extract customer data (transactions, usage, support history)
- Generate performance reports
- Prepare presentation deck
- Identify discussion topics (wins, challenges, opportunities)

**T-3 days:**
- Internal rehearsal with Sales/Product participation
- Finalize slides and data
- Prepare demo of new features (if applicable)

**T=0 (QBR Day):**
- Conduct QBR meeting
- Record action items
- Capture customer feedback

**T+2 days:**
- Send QBR summary document
- Share action item tracker
- Schedule follow-ups

### QBR Agenda Template

**Executive QBR (90 minutes):**

| Section | Duration | Presenter | Content |
|---------|----------|-----------|---------|
| **Welcome & Intros** | 5 min | CSM | Attendees, agenda overview |
| **Business Performance** | 20 min | CSM | Revenue processed, transaction volumes, merchant growth |
| **Platform Performance** | 15 min | TAM | Uptime, latency, error rates, SLA compliance |
| **Service Adoption** | 15 min | TAM | Feature usage, underutilized services, optimization opportunities |
| **Support Review** | 10 min | CSM | Ticket trends, resolution times, satisfaction scores |
| **Roadmap Preview** | 15 min | Product Manager | Upcoming features, beta programs, deprecations |
| **Customer Feedback** | 10 min | CSM | Open discussion, pain points, feature requests |
| **Action Items & Next Steps** | 10 min | CSM | Assign actions, schedule next QBR |

### QBR Performance Dashboard

**Metrics to Present:**

\`\`\`mermaid
graph TB
    subgraph "Transaction Performance"
        A1[Total Volume: $XX.XM]
        A2[Transaction Count: XX,XXX]
        A3[Average Ticket: $XXX]
        A4[Growth vs Last Quarter: +X%]
    end
    
    subgraph "Platform Health"
        B1[Uptime: 99.XX%]
        B2[Avg API Latency: XXms]
        B3[Success Rate: XX.X%]
        B4[Incidents: X - All Resolved]
    end
    
    subgraph "Business Metrics"
        C1[Active Merchants: XXX]
        C2[New Merchants: +XX]
        C3[Revenue Processed: $XX.XM]
        C4[Settlement Accuracy: 100%]
    end
    
    subgraph "Support Quality"
        D1[Tickets: XX]
        D2[Avg Resolution: X.Xh]
        D3[CSAT Score: X.X/5]
        D4[Open Issues: X]
    end
\`\`\`

### Action Item Tracking

**Post-QBR Follow-Up:**

| Action Item | Owner | Due Date | Status | Priority |
|-------------|-------|----------|--------|----------|
| Enable multi-currency support | TAM + Engineering | Feb 15 | In Progress | High |
| Provide custom dashboard report | CSM | Jan 20 | Complete | Medium |
| Schedule PCI compliance training | Compliance + CSM | Feb 1 | Scheduled | High |
| Review pricing optimization | Sales + Finance | Jan 30 | Pending | Medium |

**Tracking System:** Shared Notion/ClickUp workspace accessible to customer

### Metrics

- QBR completion rate (target: >95% of eligible customers)
- Customer attendance rate (target: >85%)
- Action item completion rate (target: >90% within 30 days)
- Post-QBR satisfaction score (target: >4.5/5)
- Expansion opportunities identified per QBR (target: >2)

---

## SOP-CS-004: Upsell & Cross-Sell Strategy (Land & Expand)

### Purpose
Systematically identify and execute expansion revenue opportunities aligned with customer needs.

### Expansion Revenue Model

**FTS.Money Land & Expand Strategy:**

\`\`\`mermaid
graph LR
    A[Land: PSP Platform] --> B[Month 3: Add Service Marketplace]
    B --> C[Month 6: Add Orchestration]
    C --> D[Month 9: Add Tax Management]
    D --> E[Month 12: Add Crypto VASP]
    E --> F[Month 18: Add ISO Gateway]
    F --> G[Month 24: Add RWA Platform]
    
    A --> H[Year 1 ARR: $42K]
    E --> I[Year 2 ARR: $86K]
    G --> J[Year 3 ARR: $142K]
    
    style H fill:#3b82f6,color:#fff
    style I fill:#10b981,color:#fff
    style J fill:#f59e0b,color:#fff
\`\`\`

### Trigger-Based Upsell Opportunities

**Automated signals indicating expansion readiness:**

| Signal | Service Recommendation | Timing | Conversion Rate Target |
|--------|----------------------|--------|----------------------|
| **Transaction volume >10K/mo** | Payment Orchestration (cost savings) | Immediate | 40% |
| **>5 countries processing** | Tax Management (compliance) | Within 30 days | 60% |
| **Merchants asking about crypto** | Crypto VASP (customer demand) | Within 60 days | 35% |
| **Using ISO 8583 systems** | ISO Gateway (modernization) | Within 90 days | 25% |
| **High chargeback rate** | Fraud detection upgrade | Immediate | 50% |
| **Marketplace model** | Service Marketplace (150+ integrations) | Within 30 days | 45% |

### Cross-Sell Playbooks

#### Playbook 1: PSP → Orchestration Upsell

**Value Proposition:** "Save 15-30% on payment costs by routing across multiple processors"

**Qualification Criteria:**
- Processing >$500K/month
- Using 2+ payment processors
- Experiencing processor declines or outages

**Approach:**
1. **Data Analysis:** Show current routing performance, approval rates
2. **Cost Modeling:** Calculate potential savings with orchestration
3. **ROI Presentation:** "Save $6K/month = $72K annually for $299/mo investment"
4. **Pilot Offer:** 30-day free trial with savings guarantee

**Timeline:** 30-day sales cycle from identification to activation

**Expected Conversion:** 40% of qualified customers

#### Playbook 2: PSP → Crypto VASP Upsell

**Value Proposition:** "Your merchants want crypto payments - add it in 48 hours"

**Qualification Criteria:**
- Merchants requesting crypto capabilities
- Fintech/tech-savvy merchant base
- Geographic focus on crypto-friendly regions

**Approach:**
1. **Market Demand:** Share industry data on crypto adoption
2. **Competitive Angle:** "Competitors offering crypto - don't lose merchants"
3. **Technical Simplicity:** "Zero code changes - we handle KYC/compliance"
4. **Revenue Opportunity:** "Earn 1-2% on crypto volume vs 0.15% on cards"

**Timeline:** 45-day sales cycle

**Expected Conversion:** 25% of PSP customers within 24 months

### Expansion Pricing Strategy

**Bundle Discounts:**

| Services Combined | Discount | Example |
|-------------------|----------|---------|
| 2 services | 10% off each | PSP ($2,499) + Orchestration ($999) = $3,148/mo (vs $3,498) |
| 3 services | 15% off each | PSP + Orchestration + Tax = $3,272/mo (vs $3,847) |
| 4+ services | 20% off each | Full platform bundle = custom pricing |

**Annual Prepay Incentive:** Additional 12% discount for annual upfront payment

### Metrics

- Expansion revenue as % of total ARR (target: >25%)
- Average services per customer (target: 2.5 by Year 3)
- Upsell conversion rate (target: >30% of identified opportunities)
- Time from signal to upsell closed (target: <60 days)

---

## SOP-CS-005: Customer Feedback Loop to Product

### Purpose
Systematically capture, prioritize, and communicate customer feedback to product development.

### Feedback Collection Channels

\`\`\`mermaid
graph TB
    A[Customer Feedback Sources] --> B[Support Tickets]
    A --> C[TAM/CSM Calls]
    A --> D[QBR Sessions]
    A --> E[NPS Surveys]
    A --> F[Feature Request Portal]
    A --> G[Community Forum]
    
    B --> H[Feedback Aggregator]
    C --> H
    D --> H
    E --> H
    F --> H
    G --> H
    
    H --> I[Categorization & Tagging]
    I --> J[Priority Scoring]
    J --> K[Product Review]
    K --> L{Decision}
    
    L -->|Implement| M[Add to Roadmap]
    L -->|Consider| N[Backlog for Future]
    L -->|Decline| O[Communicate Rationale]
    
    M --> P[Communicate Timeline to Customer]
    N --> Q[Add to Future Consideration List]
    O --> R[Thank Customer, Explain Why Not]
    
    style M fill:#10b981,color:#fff
\`\`\`

### Feedback Prioritization Framework

**Scoring Model (0-100):**

| Factor | Weight | Scoring |
|--------|--------|---------|
| **Customer Impact** | 40% | # of customers requesting × ARR weight |
| **Strategic Alignment** | 25% | Aligns with product vision = 25 pts, neutral = 12 pts, off-strategy = 0 pts |
| **Development Effort** | 20% | Low effort = 20 pts, medium = 10 pts, high = 0 pts |
| **Competitive Pressure** | 15% | Competitor has it = 15 pts, parity feature = 7 pts, unique = 0 pts |

**Priority Tiers:**
- **P0 (Score 80-100):** Add to next sprint, implement within 30 days
- **P1 (Score 60-79):** Add to roadmap, implement within quarter
- **P2 (Score 40-59):** Backlog, consider for next year
- **P3 (Score 0-39):** Decline or defer indefinitely

### Monthly Feedback Report

**Delivered to Product Team:**

**Format:**
1. **Top 10 Feature Requests** (by priority score)
2. **Recurring Pain Points** (mentioned by >5 customers)
3. **Service-Specific Issues** (by service line)
4. **Competitive Intelligence** (features customers mention competitors have)
5. **Customer Verbatim** (quotes highlighting sentiment)

**Distribution:** Product Manager, CTO, CEO (monthly)

### Customer Communication Loop

**When feedback is implemented:**
1. Notify requesting customers BEFORE general release
2. Offer early access / beta participation
3. Request case study or testimonial
4. Send thank-you note acknowledging their input

**When feedback is declined:**
1. Personal email from Product Manager explaining reasoning
2. Offer alternative solution if available
3. Add to consideration list for future
4. Thank customer for input

### Metrics

- Feedback items logged (target: >50/month across all channels)
- Percentage implemented within 90 days (target: >30% of P0/P1)
- Customer satisfaction with feedback process (target: >4.0/5)
- Time from feedback to implementation (target: <60 days for P0)

---

## SOP-CS-006: Churn Prevention & Customer Retention

### Purpose
Identify at-risk customers early and execute save strategies to maintain >92% retention.

### Early Warning Signals

**Automated churn risk indicators:**

| Signal | Risk Level | Action Trigger |
|--------|-----------|----------------|
| Usage dropped >30% month-over-month | 🔴 HIGH | Immediate outreach by CSM |
| Payment overdue >15 days | 🔴 HIGH | Finance + CSM joint outreach |
| No logins in 14 days | 🟡 MEDIUM | Automated check-in email + TAM follow-up |
| Support tickets >10 in 30 days | 🟡 MEDIUM | CSM + Product review |
| Health score dropped below 40 | 🔴 HIGH | Executive escalation |
| Contract renewal <90 days, no engagement | 🟡 MEDIUM | Renewal campaign initiated |
| NPS score <6 (detractor) | 🔴 HIGH | VP Customer Success involved |

### Save Plan Execution

\`\`\`mermaid
flowchart TD
    A[At-Risk Customer Identified] --> B[CSM Creates Save Plan]
    B --> C[Understand Root Cause]
    
    C --> D{Issue Type?}
    
    D -->|Product Issue| E[Product Team Involvement]
    D -->|Support Quality| F[Escalate to Support Manager]
    D -->|Pricing/Value| G[Commercial Restructure]
    D -->|Technical Complexity| H[Solutions Engineering Support]
    D -->|Change in Business| I[Pause or Downgrade Options]
    
    E --> J[30-Day Action Plan]
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K[Weekly Check-Ins]
    K --> L{Improvement in 30 Days?}
    
    L -->|Yes| M[Continue Standard Engagement]
    L -->|Partial| N[Extend Save Plan 30 Days]
    L -->|No| O[Executive Escalation]
    
    O --> P[C-Level to C-Level Call]
    P --> Q{Can Save?}
    
    Q -->|Yes| R[Custom Retention Package]
    Q -->|No| S[Graceful Offboarding]
    
    style M fill:#10b981,color:#fff
    style R fill:#10b981,color:#fff
    style S fill:#ef4444,color:#fff
\`\`\`

### Retention Tactics by Churn Reason

| Churn Reason | Frequency | Tactic | Success Rate |
|--------------|-----------|--------|--------------|
| **Price** | 35% | Offer annual prepay discount (12% off), pause services, downgrade tier | 60% |
| **Technical Issues** | 25% | Assign dedicated SE, expedite fixes, offer compensation | 75% |
| **Underutilization** | 20% | Feature adoption training, pause without penalty, reduce pricing | 55% |
| **Competitive** | 15% | Match features, offer exclusive beta access, executive engagement | 40% |
| **Business Closure** | 5% | Graceful offboarding, alumni program for re-activation | 10% |

### Retention Incentives

**Approved retention offers (requires approval):**

| Incentive | Approval Level | Use Case | Cost to FTS |
|-----------|----------------|----------|-------------|
| 1 month free | CSM | Minor service issues, goodwill | $X,XXX |
| 3 months 50% off | VP CS | Major issues, high churn risk | $X,XXX |
| Custom feature development | CEO | Strategic account, >$250K ARR | $XX,XXX |
| Extended payment terms | CFO | Cash flow issues, good payment history | Low |
| Downgrade without penalty | CSM | Overprovisioned, budget cuts | Medium |

### Offboarding Process (When Churn is Inevitable)

**Goals:**
- Preserve relationship for future re-activation
- Gather candid feedback
- Ensure smooth data transition
- Protect brand reputation

**Process:**
1. **30-Day Notice Period:** Required per contract
2. **Exit Interview:** Conducted by VP Customer Success (not account team)
3. **Data Export:** Provide all customer data in portable format
4. **Knowledge Transfer:** Document specific configurations for reference
5. **Deactivation:** Scheduled, communicated, executed gracefully
6. **Alumni Program:** Add to re-engagement nurture sequence

### Metrics

- Gross churn rate (target: <10% annually)
- Net revenue retention (target: >120%)
- Save plan success rate (target: >60%)
- Churned customer re-activation rate (target: >15% within 12 months)

---

## Appendix: Support Tools & Systems

### Tech Stack
- **Ticketing:** Intercom + Zendesk hybrid
- **Customer Data:** Vitally (customer success platform)
- **Health Scoring:** Custom dashboard (FTS.Money internal)
- **QBR Automation:** Notion + Google Slides templates
- **Communication:** Slack (Enterprise customers), Email (all others)

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** VP Customer Success
- **Review Frequency:** Quarterly

© 2026 FTS.Money. Internal use only.
`;

export default MultiServiceCustomerSuccessSOPs;