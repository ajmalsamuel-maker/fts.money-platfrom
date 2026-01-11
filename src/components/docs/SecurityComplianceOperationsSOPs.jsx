const SecurityComplianceOperationsSOPs = `# Security & Compliance Operations Standard Operating Procedures
## FTS.Money Platform Security, Fraud Detection & Incident Response

**Document Classification:** Confidential - Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** Chief Information Security Officer (CISO) & Chief Compliance Officer (CCO)

---

## Table of Contents

1. [Overview](#overview)
2. [Transaction Monitoring & Fraud Detection](#transaction-monitoring)
3. [Security Incident Response](#security-incident-response)
4. [Access Control & API Security](#access-control)
5. [Vulnerability Management](#vulnerability-management)
6. [PCI DSS Compliance Operations](#pci-dss-compliance)
7. [AML/KYC Monitoring](#aml-kyc-monitoring)
8. [Data Privacy & GDPR](#data-privacy)
9. [Penetration Testing](#penetration-testing)

---

## Overview

### Security Posture

FTS.Money maintains **PCI DSS Level 1**, **SOC 2 Type 2**, and **ISO 27001** compliance across all services.

### Security Framework

\`\`\`mermaid
graph TB
    subgraph "Defense in Depth"
        L1[Layer 1: Perimeter<br/>Cloudflare WAF, DDoS Protection]
        L2[Layer 2: Network<br/>AWS Security Groups, VPC Isolation]
        L3[Layer 3: Application<br/>Kong API Gateway, Rate Limiting]
        L4[Layer 4: Data<br/>Encryption at Rest AES-256, TLS 1.3]
        L5[Layer 5: Identity<br/>MFA, RBAC, API Key Rotation]
        L6[Layer 6: Monitoring<br/>24/7 SOC, SIEM, Threat Intelligence]
    end
    
    L1 --> L2
    L2 --> L3
    L3 --> L4
    L4 --> L5
    L5 --> L6
    
    style L1 fill:#ef4444,color:#fff
    style L6 fill:#10b981,color:#fff
\`\`\`

### Key Security Metrics (SLA Commitments)

| Metric | Target | Current (Actual) | Industry Benchmark |
|--------|--------|------------------|-------------------|
| **Platform Uptime** | 99.95% | 99.97% | 99.9% |
| **Mean Time to Detect (MTTD)** | <5 minutes | 3.2 minutes | <15 minutes |
| **Mean Time to Respond (MTTR)** | <15 minutes | 11 minutes | <1 hour |
| **False Positive Rate (Fraud)** | <5% | 3.8% | <10% |
| **Vulnerability Remediation (Critical)** | <7 days | 4.2 days | <30 days |
| **API Key Rotation Compliance** | 100% | 100% | 90% |

---

## SOP-SEC-001: Real-Time Transaction Monitoring & Fraud Detection

### Purpose
Detect and prevent fraudulent transactions using AI-powered monitoring across all payment channels.

### Fraud Detection Architecture

\`\`\`mermaid
sequenceDiagram
    participant Merchant
    participant API as FTS API
    participant Fraud as Fraud Engine
    participant ML as ML Model
    participant Review as Manual Review Queue
    participant Action as Action Engine
    
    Merchant->>API: Submit Transaction
    API->>Fraud: Screen Transaction
    
    Fraud->>Fraud: Rule-Based Checks
    Fraud->>ML: AI Risk Scoring
    
    ML->>ML: Analyze 200+ signals
    ML->>Fraud: Risk Score (0-100)
    
    Fraud->>Fraud: Combine Rule + ML Score
    
    alt Score 0-30 (Low Risk)
        Fraud->>API: Approve
        API->>Merchant: Success
    else Score 31-70 (Medium Risk)
        Fraud->>Review: Flag for Review
        Review->>Review: Analyst Decision (<5 min)
        Review->>API: Approve/Decline
        API->>Merchant: Response
    else Score 71-100 (High Risk)
        Fraud->>Action: Auto-Decline
        Action->>Merchant: Decline (Fraud Suspected)
        Action->>Review: Log for Investigation
    end
    
    Fraud->>Fraud: Update ML Model
\`\`\`

### Fraud Detection Rules

**Rule-Based Checks (Real-Time):**

| Rule Category | Examples | Action | Adjustable |
|---------------|----------|--------|------------|
| **Velocity Rules** | >5 transactions in 10 min from same card | Block | ✅ Per merchant |
| **Amount Thresholds** | Transaction >$10,000 | Manual review | ✅ Per merchant |
| **Geographic Mismatch** | Card issued in US, transaction from Nigeria | Flag | ✅ Per merchant |
| **Time-Based** | Transaction at 3am (unusual for merchant) | Flag | ✅ Per merchant |
| **Blacklist** | IP, email, BIN on known fraud list | Block | ❌ Platform-wide |
| **Patterns** | Card testing (multiple $1 transactions) | Block | ❌ Platform-wide |

**ML Model Signals (200+ features):**

| Signal Category | Examples | Model Weighting |
|-----------------|----------|-----------------|
| **Transaction Attributes** | Amount, currency, payment method, merchant category | 25% |
| **Behavioral Patterns** | Purchase frequency, time since last transaction, device fingerprint | 30% |
| **Identity Signals** | Email domain age, phone validation, address verification | 20% |
| **Network Signals** | IP reputation, proxy/VPN detection, geolocation | 15% |
| **Historical Data** | Chargeback rate, refund rate, dispute history | 10% |

### Manual Review Queue

**Review Process (<5 minute SLA):**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Queue: Transaction Flagged
    Queue --> Analyst_Review: Assigned
    Analyst_Review --> Check_Details: View full transaction data
    
    Check_Details --> Decision
    
    Decision --> Approve: Legitimate
    Decision --> Decline: Suspicious
    Decision --> Escalate: Unclear
    
    Approve --> Notify_Merchant: Transaction Proceeds
    Decline --> Notify_Merchant: Transaction Blocked
    Escalate --> Senior_Analyst: Complex Case
    
    Senior_Analyst --> Final_Decision
    Final_Decision --> Notify_Merchant
    
    Notify_Merchant --> Update_Model: Feedback Loop
    Update_Model --> [*]
\`\`\`

**Information Available to Reviewers:**
- Full transaction details
- Customer purchase history (last 90 days)
- Device fingerprint and IP geolocation
- Email/phone verification status
- Merchant risk profile
- Similar transaction patterns
- External threat intelligence data

**Decision Guidelines:**

| Approve If | Decline If |
|------------|-----------|
| ✅ Consistent with customer history | ❌ High-risk jurisdiction with no explanation |
| ✅ Device/IP recognized | ❌ Multiple cards from same device/IP |
| ✅ Merchant confirmed legitimacy | ❌ Card testing pattern detected |
| ✅ Low fraud indicators despite high score | ❌ Blacklisted email/phone/IP |

### Dispute & Chargeback Handling

**When customer disputes flagged transaction:**

1. **Immediate Review:** Within 1 hour of dispute
2. **Evidence Collection:** Transaction logs, fraud score, IP data, device fingerprint
3. **Management Decision:** Approve if evidence suggests false positive
4. **Customer Communication:** Explain reasoning, apologize if error
5. **Model Update:** Feed false positive back to ML model
6. **Compensation:** Offer fee waiver if significant customer impact

### Metrics

- Fraud detection rate (target: >94%)
- False positive rate (target: <5%)
- Manual review time (target: <5 minutes)
- Chargeback rate (target: <0.6%)
- Customer disputes of fraud blocks (target: <2%)

---

## SOP-SEC-002: Security Incident Response Plan (SIRP)

### Purpose
Provide structured, rapid response to security incidents to minimize impact and ensure compliance with breach notification laws.

### Incident Classification

| Severity | Definition | Examples | Response Time |
|----------|-----------|----------|---------------|
| **P1 - Critical** | Active data breach, complete service outage, ransomware | Cardholder data exposed, database compromised, platform unavailable | Immediate - page on-call |
| **P2 - High** | Potential breach, major vulnerability, partial outage | Suspicious access detected, critical CVE, API errors affecting multiple PSPs | <15 minutes |
| **P3 - Medium** | Security policy violation, minor vulnerability | Failed login attempts, phishing email sent to staff, outdated certificate | <1 hour |
| **P4 - Low** | Security inquiry, false alarm | Suspicious but legitimate activity, security audit finding | <4 hours |

### Incident Response Team (IRT)

**Core Team:**
- **Incident Commander:** CISO or Security Director
- **Technical Lead:** Principal Engineer or DevOps Lead  
- **Communications Lead:** VP Customer Success or PR Manager
- **Legal/Compliance Lead:** General Counsel or CCO
- **Executive Sponsor:** CTO (P1/P2), CEO (P1 only)

**Extended Team (as needed):**
- Forensics specialist (external)
- Law enforcement liaison
- Cyber insurance representative
- External legal counsel

### Incident Response Workflow

\`\`\`mermaid
graph TD
    A[Incident Detected] --> B[Classification]
    B --> C{Severity}
    
    C -->|P1 Critical| D[Page IRT Immediately]
    C -->|P2 High| E[Alert IRT via Slack]
    C -->|P3/P4| F[Standard Queue]
    
    D --> G[Incident Commander Takes Control]
    E --> G
    
    G --> H[Containment Actions]
    H --> I[Evidence Preservation]
    I --> J[Eradication]
    J --> K[Recovery]
    K --> L[Post-Incident Review]
    
    H --> M[Communication Protocol]
    M --> N{Customer Impact?}
    
    N -->|Yes| O[Notify Affected Customers <4h]
    N -->|No| P[Internal Communication Only]
    
    O --> Q[Regulator Notification if Required]
    P --> L
    Q --> L
    
    L --> R[Update Security Controls]
    R --> S[Close Incident]
    
    style D fill:#ef4444,color:#fff
    style O fill:#f59e0b,color:#fff
    style S fill:#10b981,color:#fff
\`\`\`

### Containment Playbooks

#### Playbook 1: Suspected Data Breach

**Immediate Actions (0-15 minutes):**
1. Isolate affected systems (network segmentation)
2. Preserve logs and forensic evidence
3. Reset credentials for affected accounts
4. Enable enhanced monitoring
5. Page incident response team

**Investigation (15 minutes - 4 hours):**
6. Identify scope: What data? How many records? When?
7. Determine attack vector: How did breach occur?
8. Assess ongoing threat: Is attacker still active?
9. Collect forensic evidence
10. Engage external forensics firm if needed

**Communication (Within 4 hours):**
11. Notify executive team
12. Prepare customer communication (legal review)
13. Notify affected customers (per GDPR: within 72 hours)
14. File regulatory reports (varies by jurisdiction)
15. Prepare public statement (if required)

**Recovery (4-48 hours):**
16. Patch vulnerability
17. Restore systems from clean backups
18. Implement additional controls
19. Continuous monitoring for 30 days

**Post-Incident (48 hours - 30 days):**
20. Root cause analysis report
21. Corrective action plan
22. Update security policies
23. Staff training on lessons learned
24. Cyber insurance claim (if applicable)

#### Playbook 2: DDoS Attack

**Immediate Actions:**
1. Confirm attack vs legitimate traffic spike
2. Activate Cloudflare DDoS mitigation (auto-scales)
3. Enable rate limiting on API gateway
4. Monitor service health and customer impact

**Communication:**
5. Internal: Alert operations team
6. External: Update status page if customer-facing impact

**Mitigation:**
7. Analyze attack patterns
8. Blocklist attacker IPs/ASNs
9. Coordinate with Cloudflare for enhanced filtering

**Recovery:**
10. Validate service restoration
11. Document attack characteristics
12. Review and strengthen DDoS defenses

### Breach Notification Requirements

**Regulatory Timelines:**

| Jurisdiction | Notification Deadline | Authority | Customer Notice |
|--------------|---------------------|-----------|-----------------|
| **EU (GDPR)** | 72 hours | Local DPA | Without undue delay |
| **US (State Laws)** | 30-90 days varies | State AG | Varies by state |
| **UK (GDPR)** | 72 hours | ICO | Without undue delay |
| **APAC (Various)** | Varies | Local authority | Varies |

**Notification Content Requirements:**
- Nature of the breach
- Categories and approximate number of records
- Likely consequences
- Measures taken to address the breach
- Contact point for more information

### Metrics

- Incident detection time (target: MTTD <5 minutes)
- Incident response time (target: MTTR <15 minutes)
- Breach notification compliance (target: 100% within legal deadlines)
- Post-incident action completion (target: 100% within 30 days)
- Repeat incidents (target: 0% - same root cause)

---

## SOP-SEC-003: API Security & Credential Management

### Purpose
Secure API access through key rotation, rate limiting, and continuous monitoring.

### API Key Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [*] --> Generated: Customer request
    Generated --> Active: Activated by customer
    Active --> Rotated: 90-day auto-rotation
    Rotated --> Active: New key issued
    Active --> Suspended: Security concern
    Suspended --> Active: Investigation cleared
    Suspended --> Revoked: Confirmed compromise
    Active --> Revoked: Customer request
    Revoked --> [*]
    
    note right of Rotated
        Automated rotation every 90 days
        7-day grace period (both keys valid)
    end note
\`\`\`

### API Key Rotation Protocol

**Automated 90-Day Rotation:**

**T-14 days:**
- Email notification to customer: "API key rotation in 14 days"
- Provide rotation guide and new key preview

**T-7 days:**
- Generate new API key (not yet active)
- Email new key (encrypted) to customer
- Both old and new keys valid for next 7 days (grace period)

**T=0 (Rotation Day):**
- New key becomes primary
- Old key continues working (grace period)
- Monitor for customers still using old key

**T+7 days (Grace Period End):**
- Old key deactivated
- Alert customers still using old key (if any)
- Provide emergency support for transition issues

**Emergency Rotation (Suspected Compromise):**
- Immediate: Revoke compromised key
- Generate new key and deliver via secure channel
- No grace period for security incidents
- Investigation to determine scope of compromise

### Rate Limiting & Abuse Prevention

**API Rate Limits by Customer Tier:**

| Tier | Requests/Second | Requests/Day | Burst Allowance | Overage Handling |
|------|-----------------|--------------|-----------------|------------------|
| **Starter** | 10 req/sec | 100,000 | 2x for 10 seconds | 429 error, contact CS for upgrade |
| **Growth** | 50 req/sec | 500,000 | 3x for 30 seconds | Soft limit, overage fees |
| **Professional** | 200 req/sec | 2,000,000 | 5x for 60 seconds | Soft limit, monitored |
| **Enterprise** | Custom | Custom | Custom | Negotiated SLA |

**Rate Limit Response:**
\`\`\`http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1609459200
Retry-After: 60

{"error": "Rate limit exceeded", "retry_after": 60}
\`\`\`

### Suspicious Activity Indicators

**Automated Alerts Triggered By:**

| Indicator | Threshold | Action |
|-----------|-----------|--------|
| Failed API authentication | >10 in 5 minutes | Temporarily block IP, alert security team |
| Unusual request patterns | API calls outside normal hours/volume | Flag for review |
| Sensitive endpoint access | Repeated access to PII/financial data endpoints | Enhanced logging, alert |
| Geographical anomaly | API calls from new country/IP | Challenge with additional auth |
| Scraping behavior | Rapid sequential requests | Rate limit, CAPTCHA |

### Metrics

- API key rotation compliance (target: 100%)
- Unauthorized API access attempts (target: blocked 100%)
- Rate limit violations (target: <1% of customers)
- API security incidents (target: 0 per quarter)

---

## SOP-SEC-004: Vulnerability Management & Patch Deployment

### Purpose
Systematically identify, prioritize, and remediate security vulnerabilities to maintain secure infrastructure.

### Vulnerability Scanning Schedule

| Scan Type | Frequency | Scope | Tool | Owner |
|-----------|-----------|-------|------|-------|
| **Automated Infrastructure Scan** | Daily | AWS resources, servers, databases | AWS Inspector, Tenable | DevOps |
| **Application Security Scan** | Weekly | Web applications, APIs | OWASP ZAP, Burp Suite | Security Team |
| **Dependency Scan** | Every commit | NPM packages, libraries | Snyk, Dependabot | Engineering |
| **Container Scan** | Every build | Docker images | Trivy, Anchore | DevOps |
| **Manual Penetration Test** | Quarterly | Full platform | External firm (e.g., Bishop Fox) | CISO |

### Vulnerability Severity Classification

**CVSS Scoring to FTS Risk Mapping:**

| CVSS Score | Severity | FTS Priority | Remediation SLA | Approval Required |
|------------|----------|--------------|-----------------|-------------------|
| **9.0-10.0** | Critical | P0 | 24 hours | CTO (emergency change) |
| **7.0-8.9** | High | P1 | 7 days | Security Manager |
| **4.0-6.9** | Medium | P2 | 30 days | Planned maintenance |
| **0.1-3.9** | Low | P3 | 90 days | Planned maintenance |

### Patch Deployment Workflow

\`\`\`mermaid
flowchart TD
    A[Vulnerability Identified] --> B[Severity Assessment]
    B --> C{Severity Level}
    
    C -->|Critical P0| D[Emergency Patch Process]
    C -->|High P1| E[Expedited Patch Process]
    C -->|Medium/Low P2/P3| F[Standard Change Process]
    
    D --> G[Immediate Testing in Staging]
    E --> H[QA Testing]
    F --> I[Scheduled Testing]
    
    G --> J{Test Pass?}
    H --> J
    I --> J
    
    J -->|Yes| K[Deploy to Production]
    J -->|No| L[Fix Issues / Find Alternative]
    
    L --> J
    
    K --> M[Monitor for 24h]
    M --> N{Issues?}
    
    N -->|No| O[Mark Complete]
    N -->|Yes| P[Rollback]
    
    P --> Q[Investigate & Retry]
    Q --> G
    
    style D fill:#ef4444,color:#fff
    style O fill:#10b981,color:#fff
\`\`\`

### Emergency Patch Protocol (Critical Vulnerabilities)

**Timeline:**

| Phase | Timeline | Activities |
|-------|----------|------------|
| **Detection** | T+0 | Vulnerability disclosed or detected by scan |
| **Assessment** | T+1h | CISO review, confirm criticality, assess exploitability |
| **Approval** | T+2h | CTO approves emergency change, CAB notified post-facto |
| **Testing** | T+4h | Rapid testing in staging environment |
| **Deployment** | T+8h | Deploy to production during low-traffic window if possible |
| **Verification** | T+12h | Confirm vulnerability closed, monitor for exploitation attempts |
| **Post-Incident** | T+48h | RCA report, update vulnerability management process |

**Customer Notification:**
- If requires downtime: 2-hour advance notice (best effort)
- If no impact: Notification in weekly update
- If customer action required (e.g., API changes): 48-hour advance notice + migration guide

### Metrics

- Critical vulnerability remediation time (target: <24 hours)
- High vulnerability remediation time (target: <7 days)
- Percentage of systems fully patched (target: >95%)
- Vulnerabilities identified via scanning vs external disclosure (target: >80% internal)
- Patch deployment success rate (target: >98%)

---

## SOP-SEC-005: Access Control & Privileged Access Management (PAM)

### Purpose
Enforce least privilege access and monitor privileged account usage to prevent unauthorized access.

### Role-Based Access Control (RBAC) Framework

**Internal Staff Access Levels:**

\`\`\`mermaid
graph TB
    subgraph "Production Access"
        A[No Access]
        B[Read-Only]
        C[Application Access]
        D[Infrastructure Access]
        E[Database Access]
        F[Root/Admin Access]
    end
    
    subgraph "Role Mapping"
        R1[Customer Support] --> B
        R2[Product Manager] --> C
        R3[Developer] --> C
        R4[DevOps Engineer] --> D
        R5[DBA] --> E
        R6[CISO + CTO] --> F
    end
    
    subgraph "Access Controls"
        F --> G[Requires MFA + Hardware Token]
        F --> H[Session Recording]
        F --> I[Approval Workflow]
        F --> J[Time-Limited 4h]
    end
    
    style F fill:#ef4444,color:#fff
    style A fill:#10b981,color:#fff
\`\`\`

### Privileged Access Request Workflow

**For Database/Production Access:**

1. **Request Submission:**
   - Engineer submits access request via ticketing system
   - Specify: System, reason, duration (max 4 hours), urgency
   
2. **Approval Routing:**
   - **Standard Request:** Manager approval required (auto-approved if pre-authorized tasks)
   - **Emergency Request:** CISO or on-call security lead

3. **Access Provisioning:**
   - Generate time-limited credentials (auto-expire after duration)
   - Enable session recording
   - Log all commands/queries executed
   - Notify security team of active privileged session

4. **Session Monitoring:**
   - Real-time alerts for dangerous commands (DROP, DELETE, GRANT)
   - Automatic termination if suspicious activity
   - Full audit trail maintained

5. **Access Revocation:**
   - Auto-revoke after time limit expires
   - Manual revoke if task completed early
   - Require new request for additional access

### Multi-Factor Authentication (MFA) Requirements

**MFA Policy by Role:**

| Role | MFA Required | Allowed Methods | Enforcement |
|------|--------------|-----------------|-------------|
| **All Staff** | ✅ Login to FTS systems | SMS, Authenticator App, Hardware Token | Mandatory |
| **Engineers** | ✅ Code commits, deployments | Authenticator App, Hardware Token | Mandatory |
| **Privileged Access** | ✅ Database, production servers | Hardware Token (YubiKey) ONLY | Mandatory |
| **Admin Portals** | ✅ Platform admin panel | Authenticator App, Hardware Token | Mandatory |
| **Customers** | Optional (encouraged) | SMS, Authenticator App, Email | Optional (required for Enterprise tier) |

### Access Review Process

**Quarterly Access Audits:**

1. **Week 1:** Extract access reports for all systems
2. **Week 2:** Department heads review their team's access
3. **Week 3:** Revoke unnecessary access, document exceptions
4. **Week 4:** Security team validates compliance

**Audit Checklist:**
- ✅ All users have appropriate roles
- ✅ No orphaned accounts (ex-employees)
- ✅ Privileged access limited to authorized personnel
- ✅ MFA enabled for 100% of required accounts
- ✅ API keys rotated on schedule

### Metrics

- Privileged access requests processed within SLA (target: 100%)
- Unauthorized access attempts (target: 0)
- MFA enrollment rate (target: 100% for staff)
- Access review completion (target: 100% quarterly)
- Orphaned account discovery (target: 0)

---

## SOP-SEC-006: PCI DSS Continuous Compliance Operations

### Purpose
Maintain PCI DSS Level 1 compliance through automated monitoring, evidence collection, and annual certification.

### PCI DSS Compliance Architecture

\`\`\`mermaid
graph TB
    subgraph "PCI Scope - Cardholder Data Environment"
        CDE1[Payment Gateway Connections]
        CDE2[Transaction Processing Engine]
        CDE3[Encrypted Card Storage Vault]
        CDE4[Settlement Processing]
    end
    
    subgraph "PCI Controls"
        C1[Firewall Rules]
        C2[Encryption AES-256]
        C3[Access Logs]
        C4[Vulnerability Scans]
        C5[Penetration Tests]
        C6[File Integrity Monitoring]
    end
    
    CDE1 --> C1
    CDE2 --> C2
    CDE3 --> C2
    CDE4 --> C3
    
    C1 --> Monitor[24/7 Monitoring]
    C2 --> Monitor
    C3 --> Monitor
    C4 --> Monitor
    C5 --> Review[Quarterly QSA Review]
    C6 --> Monitor
    
    Monitor --> Alert[Security Alerts]
    Review --> Cert[Annual Certification]
\`\`\`

### 12 PCI Requirements - Operational Procedures

| Requirement | Procedure | Frequency | Owner | Evidence |
|-------------|-----------|-----------|-------|----------|
| **1. Firewall Configuration** | Review and audit firewall rules | Monthly | DevOps | Change logs, rule exports |
| **2. Default Passwords** | Scan for default credentials | Weekly | Security | Scan reports |
| **3. Protect Stored Data** | Verify encryption, key rotation | Daily | DBA | Encryption validation logs |
| **4. Encryption in Transit** | Monitor TLS certificates, validate configs | Daily | DevOps | Certificate registry |
| **5. Antivirus** | Update signatures, run scans | Daily | Security | Scan results |
| **6. Secure Systems** | Patch vulnerabilities, harden configs | Per SLA | DevOps | Patch logs |
| **7. Access Restriction** | Review access logs, validate need-to-know | Weekly | Security | Access reports |
| **8. Unique IDs** | Audit user accounts, no shared credentials | Monthly | IT | User account audit |
| **9. Physical Access** | Badge logs, visitor logs (data centers) | Continuous | Facilities | Access logs |
| **10. Activity Logs** | Collect, monitor, retain logs | Continuous | Security | SIEM alerts |
| **11. Security Testing** | Vulnerability scans, pentests | Weekly/Quarterly | Security | Test reports |
| **12. Information Security Policy** | Review and update policy | Annually | CISO | Policy documents |

### Automated Compliance Monitoring

**Continuous Monitoring Checks:**

\`\`\`yaml
automated_checks:
  encryption_verification:
    frequency: Every 15 minutes
    check: All databases encrypted, keys rotated on schedule
    alert_if: Encryption disabled, key age >365 days
    
  access_log_review:
    frequency: Real-time
    check: All privileged access logged, no unauthorized access
    alert_if: Failed login >5 attempts, access outside business hours
    
  network_segmentation:
    frequency: Hourly
    check: CDE isolated, firewall rules enforced
    alert_if: New connection to CDE without approval
    
  patch_compliance:
    frequency: Daily
    check: All systems patched per SLA
    alert_if: Critical CVE unpatched >7 days
\`\`\`

### Evidence Collection for QSA Audits

**Automated Evidence Gathering:**

| Evidence Type | Collection Method | Retention | Storage |
|--------------|-------------------|-----------|---------|
| **Firewall Configs** | Daily exports via API | 12 months | S3 encrypted bucket |
| **Access Logs** | Real-time streaming to SIEM | 12 months | Elasticsearch |
| **Vulnerability Scans** | Automated reports post-scan | 12 months | Evidence Vault |
| **Penetration Test Reports** | Manual upload quarterly | 36 months | Evidence Vault |
| **Change Logs** | Captured from deployment pipeline | 12 months | Git + SIEM |
| **Training Records** | LMS export monthly | 24 months | HRIS system |

### Annual PCI Certification Process

**Timeline:**

\`\`\`mermaid
gantt
    title Annual PCI DSS Certification Timeline
    dateFormat YYYY-MM-DD
    
    section Preparation (Q3)
    Internal readiness assessment    :p1, 2026-07-01, 30d
    Evidence package compilation     :p2, 2026-08-01, 30d
    Gap remediation                  :p3, 2026-08-15, 30d
    
    section QSA Engagement (Q4)
    QSA onboarding & scope agreement :q1, 2026-10-01, 14d
    Documentation review             :q2, 2026-10-15, 21d
    On-site assessment (if required) :q3, 2026-11-05, 7d
    Penetration testing              :q4, 2026-11-12, 14d
    
    section Certification (Q4/Q1)
    Draft ROC review                 :r1, 2026-11-26, 14d
    Remediation (if findings)        :r2, 2026-12-10, 21d
    Final ROC submission             :milestone, r3, 2026-12-31, 0d
    AOC issuance                     :milestone, r4, 2027-01-15, 0d
\`\`\`

### Metrics

- PCI compliance score (target: 100% of requirements met)
- QSA audit findings (target: <5 minor findings, 0 major findings)
- Evidence completeness (target: 100% of required evidence available)
- Continuous monitoring uptime (target: >99.9%)

---

## SOP-SEC-007: AML Transaction Monitoring & Suspicious Activity Reporting

### Purpose
Detect, investigate, and report suspicious transactions to comply with AML regulations and prevent financial crime.

### AML Monitoring Scope

**Transactions Monitored:**
- All PSP platform card transactions
- Crypto VASP transactions (fiat ↔ crypto)
- Cross-border payments
- High-value transactions (>$10,000)
- Merchant settlements

**Exclusions:**
- Internal test transactions
- Processor-to-processor settlements (already monitored by processors)

### Real-Time AML Screening

\`\`\`mermaid
sequenceDiagram
    participant TX as Transaction
    participant AML as AML Engine
    participant Sanctions as Sanctions Lists
    participant PEP as PEP Database
    participant Risk as Risk Scoring
    participant Analyst as Compliance Analyst
    
    TX->>AML: Transaction submitted
    AML->>Sanctions: Screen parties (OFAC, UN, EU)
    Sanctions->>AML: Match result
    
    AML->>PEP: Check beneficial owners
    PEP->>AML: PEP status
    
    AML->>Risk: Calculate risk score
    Risk->>AML: Score (0-100)
    
    AML->>AML: Apply AML rules
    
    alt Low Risk (Score 0-30)
        AML->>TX: Approve
    else Medium Risk (31-70)
        AML->>Analyst: Flag for review
        Analyst->>Analyst: Investigate (<15 min)
        Analyst->>TX: Decision
    else High Risk (71-100) or Sanctions Hit
        AML->>TX: Block
        AML->>Analyst: Investigation required
        Analyst->>Analyst: Detailed investigation
        Analyst->>Analyst: File SAR if warranted
    end
\`\`\`

### Suspicious Activity Indicators

**Red Flags Requiring Investigation:**

| Category | Indicators | Automated Action |
|----------|-----------|------------------|
| **Structuring** | Multiple transactions just below $10K reporting threshold | Flag for SAR review |
| **Unusual Patterns** | Dormant account suddenly active with large transactions | Enhanced monitoring for 30 days |
| **Geographic** | Transactions from high-risk jurisdictions | Automatic review |
| **Rapid Movement** | Funds in and out within hours (layering) | Flag + possible block |
| **Shell Companies** | No clear business purpose, complex ownership | Enhanced due diligence |
| **PEP Involvement** | Politically exposed person detected | Automatic escalation |

### SAR Filing Process

**Threshold for Filing:**
- Transactions >$5,000 involving known or suspected criminal activity
- Pattern of suspicious activity (even if individual transactions <$5,000)
- Any transaction involving terrorism financing (any amount)

**Filing Timeline:**

\`\`\`mermaid
gantt
    title SAR Filing Timeline (30-Day Deadline from Detection)
    dateFormat YYYY-MM-DD
    
    section Investigation
    Suspicious Activity Detected     :milestone, 2026-01-01, 0d
    Initial Investigation            :i1, 2026-01-01, 3d
    Gather Evidence                  :i2, 2026-01-04, 5d
    
    section Review
    AML Officer Review               :r1, 2026-01-09, 3d
    Legal Review (if needed)         :r2, 2026-01-12, 2d
    Management Approval              :r3, 2026-01-14, 1d
    
    section Filing
    Complete SAR Form                :f1, 2026-01-15, 3d
    Internal Compliance Check        :f2, 2026-01-18, 2d
    Submit to FinCEN (US) or FIU     :milestone, f3, 2026-01-20, 0d
    
    section Post-Filing
    Document Filing in Case Management:p1, 2026-01-20, 2d
    Update Customer Risk Profile     :p2, 2026-01-20, 1d
    Ongoing Monitoring (Enhanced)    :p3, 2026-01-21, 90d
\`\`\`

**SAR Confidentiality:**
- ⚠️ **NEVER** inform customer that SAR was filed (federal crime in most jurisdictions)
- Maintain strict access controls (AML Officer + CEO only)
- Separate SAR database (not in main CRM)

### Customer Risk Rating System

| Risk Tier | Criteria | Monitoring Level | Review Frequency |
|-----------|----------|------------------|------------------|
| **Low Risk** | Standard business, stable patterns, no red flags | Standard automated | Annual |
| **Medium Risk** | High-value customer, international, complex structure | Enhanced automated + quarterly review | Quarterly |
| **High Risk** | High-risk jurisdiction, PEP involved, prior SAR filed, crypto-heavy | Continuous manual review | Monthly |
| **Prohibited** | Sanctioned party, illegal business, extreme risk | Account suspended | N/A |

### Metrics

- AML alerts investigated (target: 100%)
- SAR filing timeliness (target: 100% within 30 days)
- False positive rate (target: <8%)
- Customer risk rating accuracy (target: reviewed and updated 100% on schedule)
- Sanctions screening coverage (target: 100% of transactions)

---

## SOP-SEC-008: Data Privacy & GDPR Compliance

### Purpose
Handle data subject rights requests (DSAR) in compliance with GDPR, CCPA, and other privacy regulations.

### Data Subject Rights

| Right | Request Type | SLA | Complexity |
|-------|-------------|-----|------------|
| **Right to Access** | "Give me all my data" | 30 days | Medium - data export from multiple systems |
| **Right to Rectification** | "Correct my information" | 30 days | Low - update records |
| **Right to Erasure** | "Delete my data" | 30 days | High - cascading deletes, retention conflicts |
| **Right to Restrict Processing** | "Stop using my data" | 30 days | Medium - flag accounts |
| **Right to Data Portability** | "Give me data in machine-readable format" | 30 days | Medium - JSON/CSV export |
| **Right to Object** | "Stop processing for marketing" | Immediate | Low - unsubscribe |

### DSAR Handling Workflow

\`\`\`mermaid
flowchart TD
    A[DSAR Received] --> B[Verify Identity]
    B --> C{Identity Confirmed?}
    
    C -->|No| D[Request Additional Verification]
    C -->|Yes| E[Log Request in Privacy System]
    
    D --> B
    
    E --> F[Categorize Request Type]
    F --> G{Request Type}
    
    G -->|Access| H[Extract Data from All Systems]
    G -->|Rectification| I[Update Records]
    G -->|Erasure| J[Assess Legal Basis to Retain]
    G -->|Portability| K[Generate Structured Export]
    
    H --> L[Redact Third-Party PII]
    I --> M[Confirm Changes]
    J --> N{Can Delete?}
    K --> O[Format Data CSV/JSON]
    
    N -->|Yes| P[Execute Deletion Script]
    N -->|No| Q[Document Reason for Retention]
    
    L --> R[Deliver Data Package]
    M --> S[Confirm to Requester]
    P --> S
    Q --> T[Explain Retention to Requester]
    O --> R
    
    R --> U[Close Request]
    S --> U
    T --> U
    
    U --> V[30-Day Follow-Up]
    
    style U fill:#10b981,color:#fff
\`\`\`

### Data Retention & Deletion Policy

**Retention Periods by Data Type:**

| Data Type | Retention Period | Legal Basis | Deletion Method |
|-----------|-----------------|-------------|-----------------|
| **Transaction Records** | 7 years | Financial regulations, tax law | Crypto-shredding (encryption key destruction) |
| **PCI Cardholder Data** | 90 days (if stored) | PCI DSS requirement | Secure wipe (3-pass overwrite) |
| **Customer Contracts** | 7 years post-termination | Contract law | Secure archive then delete |
| **Support Tickets** | 3 years | Business need | Soft delete (anonymize PII) |
| **Audit Logs** | 7 years | Regulatory compliance | Append-only, no deletion |
| **Marketing Data** | Until consent withdrawn | GDPR consent | Immediate deletion upon request |

### Consent Management

**Lawful Bases for Processing (GDPR):**

| Purpose | Legal Basis | Opt-In Required? |
|---------|-------------|------------------|
| **Service Delivery** (PSP operations) | Contractual necessity | No (required to fulfill contract) |
| **Fraud Detection** | Legitimate interest | No (critical for security) |
| **Marketing Communications** | Consent | Yes - explicit opt-in required |
| **Analytics** (anonymized) | Legitimate interest | No (if truly anonymized) |
| **Third-Party Sharing** | Consent | Yes - explicit opt-in required |

### Metrics

- DSAR response time (target: <20 days, legally <30 days)
- DSAR accuracy (target: 100% - all data provided)
- Consent opt-in rate (target: >35% for marketing)
- Data breach incidents (target: 0)
- Privacy audit findings (target: 0 violations)

---

## Appendix: Security Tools & Systems

### Security Stack

| Layer | Tool/Service | Purpose |
|-------|--------------|---------|
| **WAF** | Cloudflare Enterprise | DDoS protection, bot mitigation |
| **SIEM** | Datadog Security Monitoring | Log aggregation, threat detection |
| **Vulnerability Scanning** | Tenable.io | Infrastructure and application scanning |
| **Secrets Management** | AWS Secrets Manager | API keys, database credentials |
| **Encryption** | AWS KMS | Encryption key management |
| **Identity** | Auth0 Enterprise | SSO, MFA, session management |
| **Fraud Detection** | Custom ML + Sift Science | Transaction risk scoring |
| **AML Screening** | ComplyAdvantage | Sanctions and PEP screening |

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** CISO & CCO
- **Review Frequency:** Quarterly
- **Next Review:** April 11, 2026

© 2026 FTS.Money. Confidential - Internal use only.
`;

export default SecurityComplianceOperationsSOPs;