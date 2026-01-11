const PlatformInfrastructureSOPs = `# Platform Infrastructure & DevOps Standard Operating Procedures  
## FTS.Money Cloud Operations, Monitoring & Incident Management

**Document Classification:** Confidential - Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** Chief Technology Officer (CTO) & DevOps Team

---

## Table of Contents

1. [Overview](#overview)
2. [24/7 Platform Monitoring](#platform-monitoring)
3. [Deployment & Release Management](#deployment-release)
4. [Database Operations](#database-operations)
5. [Scaling & Capacity Planning](#scaling-capacity)
6. [Incident Management](#incident-management)
7. [Change Management](#change-management)
8. [Disaster Recovery](#disaster-recovery)

---

## Overview

### Infrastructure Stack

\`\`\`mermaid
graph TB
    subgraph "Edge Layer"
        CF[Cloudflare<br/>WAF, DDoS, CDN]
    end
    
    subgraph "Load Balancing"
        ALB[AWS ALB<br/>Application Load Balancer]
    end
    
    subgraph "Application Layer"
        API[Kong API Gateway<br/>Rate Limiting, Auth]
        APP[ECS Fargate<br/>Payment Processor Go]
        WEB[S3 + CloudFront<br/>React Portals]
    end
    
    subgraph "Data Layer"
        PG[(PostgreSQL RDS<br/>Multi-Tenant)]
        REDIS[ElastiCache Redis<br/>Sessions, Cache]
        ES[(Elasticsearch<br/>Logs, Analytics)]
    end
    
    subgraph "Messaging"
        SQS[AWS SQS<br/>Queue]
        KAFKA[Kafka<br/>Event Stream]
    end
    
    CF --> ALB
    ALB --> API
    API --> APP
    API --> WEB
    
    APP --> PG
    APP --> REDIS
    APP --> ES
    APP --> SQS
    APP --> KAFKA
    
    style CF fill:#f97316,color:#fff
    style PG fill:#3b82f6,color:#fff
    style APP fill:#10b981,color:#fff
\`\`\`

### Performance Targets

| Metric | Target | Current | Alert Threshold |
|--------|--------|---------|----------------|
| **API Latency (p95)** | <200ms | 145ms | >300ms |
| **Platform Uptime** | 99.95% | 99.97% | <99.9% |
| **Transaction Throughput** | 1,000 TPS | Peak: 850 TPS | >80% capacity |
| **Database Connections** | <500 | Avg: 280 | >400 |
| **Error Rate** | <0.1% | 0.04% | >0.5% |

---

## SOP-OPS-001: 24/7 Platform Health Monitoring

### Purpose
Continuous monitoring of all infrastructure and application components to detect and respond to issues before customer impact.

### Monitoring Architecture

\`\`\`mermaid
graph TB
    subgraph "Data Sources"
        S1[Application Logs]
        S2[Infrastructure Metrics]
        S3[Transaction Events]
        S4[Customer Actions]
        S5[External APIs]
    end
    
    subgraph "Monitoring Stack"
        M1[Datadog Agent]
        M2[CloudWatch]
        M3[Custom Metrics API]
        M4[Synthetic Monitors]
    end
    
    subgraph "Alerting"
        A1[PagerDuty]
        A2[Slack #alerts]
        A3[Email]
        A4[SMS]
    end
    
    subgraph "Response"
        R1[NOC Team 24/7]
        R2[On-Call Engineer]
        R3[Incident Commander]
    end
    
    S1 --> M1
    S2 --> M2
    S3 --> M3
    S4 --> M3
    S5 --> M4
    
    M1 --> A1
    M2 --> A1
    M3 --> A2
    M4 --> A2
    
    A1 --> R2
    A2 --> R1
    A3 --> R1
    
    R2 --> R3
    R1 --> R3
    
    style R3 fill:#ef4444,color:#fff
\`\`\`

### Critical Alerts Configuration

**P1 Alerts (Page On-Call Immediately):**

| Alert Name | Condition | Impact | Response |
|------------|-----------|--------|----------|
| **Platform Down** | >50% health check failures | All customers affected | Immediate investigation |
| **Database Connection Pool Exhausted** | >95% connections used | Transaction processing halted | Scale database |
| **Payment Processor Timeout** | >80% timeout rate | Transactions failing | Switch to backup processor |
| **Redis Cluster Down** | All nodes unreachable | Sessions lost, cache miss | Restart cluster |
| **Kafka Lag** | >10,000 messages behind | Billing delays, metering issues | Increase consumers |
| **Security Incident** | Intrusion detection triggered | Potential breach | Incident response protocol |

**P2 Alerts (Notify Slack #alerts, NOC Investigates):**
- API latency >500ms (p95)
- Error rate >1%
- CPU utilization >80%
- Disk space >85% full
- Unusual traffic patterns
- Backup job failed

**P3 Alerts (Email, Review Next Business Day):**
- API latency >300ms
- Error rate >0.5%
- Expired SSL certificate (warning 30 days before)
- Unutilized resources (cost optimization)

### Synthetic Monitoring

**Automated Tests (Every 60 seconds):**

1. **API Health Check:**
   - GET /health endpoint
   - Expected: 200 OK response in <100ms

2. **Transaction Flow Test:**
   - Submit test transaction
   - Verify authorization approval
   - Verify transaction logged correctly
   - Expected: <2 second end-to-end

3. **Portal Uptime:**
   - Load customer portal homepage
   - Verify rendering in <2 seconds
   - Expected: 200 OK, all assets loaded

4. **Database Query:**
   - Execute sample query
   - Expected: <50ms response

5. **External Dependency Check:**
   - Ping Stripe API
   - Ping Striga API
   - Ping Kong Gateway
   - Expected: All responding in <500ms

### Monitoring Dashboard (NOC View)

**Real-Time Dashboard Panels:**

| Panel | Metrics Displayed | Refresh Rate |
|-------|------------------|--------------|
| **Platform Status** | Overall health score (0-100), uptime %, active incidents | 10 seconds |
| **Transaction Metrics** | TPS, success rate, avg latency, error breakdown | 10 seconds |
| **Infrastructure Health** | CPU, memory, disk, network I/O per service | 30 seconds |
| **Database Performance** | Query time, connections, lock waits, replication lag | 30 seconds |
| **API Metrics** | Requests/sec, latency histogram, error rate by endpoint | 10 seconds |
| **Customer Impact** | Affected customers, transaction volume impact | 60 seconds |
| **External Services** | Stripe, Striga, Kong, AWS status | 60 seconds |

### Metrics

- Alert false positive rate (target: <15%)
- Mean time to detect (MTTD) - (target: <5 minutes)
- Mean time to acknowledge (MTTA) - (target: <3 minutes)
- Monitoring system uptime (target: >99.99%)

---

## SOP-OPS-002: Deployment & Release Management

### Purpose
Standardize code deployment to production with zero-downtime releases and quick rollback capability.

### Deployment Pipeline

\`\`\`mermaid
graph LR
    A[Code Commit] --> B[Automated Tests]
    B --> C{Tests Pass?}
    
    C -->|No| D[Block Deployment]
    C -->|Yes| E[Build Docker Image]
    
    E --> F[Push to Registry]
    F --> G[Deploy to Staging]
    G --> H[Automated Smoke Tests]
    H --> I{Smoke Tests Pass?}
    
    I -->|No| J[Rollback Staging]
    I -->|Yes| K[Manual QA Approval]
    
    K --> L{Approve?}
    L -->|No| M[Fix Issues]
    L -->|Yes| N[Deploy to Production]
    
    N --> O[Blue-Green Deployment]
    O --> P[Health Checks]
    P --> Q{Healthy?}
    
    Q -->|Yes| R[Switch Traffic to New Version]
    Q -->|No| S[Automatic Rollback]
    
    R --> T[Monitor for 1 Hour]
    T --> U{Issues Detected?}
    
    U -->|Yes| V[Manual Rollback]
    U -->|No| W[Deployment Complete]
    
    style W fill:#10b981,color:#fff
    style S fill:#ef4444,color:#fff
\`\`\`

### Deployment Windows

| Deployment Type | Window | Notification | Approval |
|----------------|--------|--------------|----------|
| **Hotfix (Critical Bug)** | Immediate, 24/7 | Post-deployment | CTO or on-call |
| **Security Patch** | Within 24h | 2-hour advance notice | Security Manager |
| **Standard Release** | Tuesday/Thursday 10am-2pm UTC | 48-hour advance notice | Product Manager |
| **Major Release** | Saturday 2am-6am UTC | 1-week advance notice | CEO + CTO |

**No Deployments:**
- Friday afternoon (avoid weekend incidents)
- Monday morning (high traffic period)
- Major holidays
- During customer go-live windows

### Blue-Green Deployment Strategy

**How It Works:**
- **Blue:** Current production version (serving traffic)
- **Green:** New version deployed parallel (not serving traffic)
- **Switch:** Traffic cutover to Green after validation
- **Rollback:** Instant switch back to Blue if issues

**Deployment Steps:**

\`\`\`yaml
blue_green_process:
  step_1_deploy_green:
    action: Deploy new version to Green environment
    validation: Health checks pass
    duration: 10 minutes
    
  step_2_warm_up:
    action: Send 10% traffic to Green
    validation: Error rate <0.1%, latency <200ms
    duration: 15 minutes
    
  step_3_ramp_up:
    action: Gradually increase to 50% traffic
    validation: Continued health checks
    duration: 15 minutes
    
  step_4_full_cutover:
    action: 100% traffic to Green
    validation: Monitor for 1 hour
    duration: 60 minutes
    
  step_5_decommission_blue:
    action: Keep Blue online for 24h as backup
    validation: No incidents on Green
    duration: 24 hours
    
  rollback_if_needed:
    trigger: Error rate >0.5% OR latency >500ms OR critical bug
    action: Instant cutover back to Blue
    duration: <60 seconds
\`\`\`

### Rollback Procedures

**Automatic Rollback Triggers:**
- Error rate >1% for >5 minutes
- API latency >1 second (p95)
- Health check failures >25%
- Database connection errors >10% of attempts

**Manual Rollback Decision:**
- Critical bug discovered (data corruption, security issue)
- Customer-reported major issue (>5 customers affected)
- Performance degradation confirmed

**Rollback Execution Time:** <60 seconds (instant traffic switch)

### Deployment Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Deployment frequency | 2-3x per week | 2.1x/week |
| Deployment success rate | >98% | 97.8% |
| Rollback rate | <5% of deployments | 3.2% |
| Time to deploy (code commit to production) | <30 minutes | 24 minutes |
| Deployment-related incidents | <1 per month | 0.6/month |

---

## SOP-OPS-003: Database Operations & Optimization

### Purpose
Maintain PostgreSQL database performance, reliability, and data integrity across multi-tenant architecture.

### Database Architecture

**Multi-Tenant Isolation Strategy:**

\`\`\`mermaid
graph TB
    subgraph "PostgreSQL RDS Cluster"
        MASTER[Primary Instance<br/>db.r6g.2xlarge]
        REPLICA1[Read Replica 1<br/>Reporting Queries]
        REPLICA2[Read Replica 2<br/>Analytics]
    end
    
    subgraph "Schema Separation"
        PUBLIC[public schema<br/>Platform data]
        PSP1[psp_acme<br/>ACME Payments]
        PSP2[psp_globalpay<br/>Global Pay]
        PSP3[psp_finco<br/>FinCo Ltd]
    end
    
    MASTER --> REPLICA1
    MASTER --> REPLICA2
    
    MASTER --> PUBLIC
    MASTER --> PSP1
    MASTER --> PSP2
    MASTER --> PSP3
    
    style MASTER fill:#3b82f6,color:#fff
    style PUBLIC fill:#10b981,color:#fff
\`\`\`

**Row-Level Security (RLS) Policies:**
- Every query automatically filtered by \`psp_code\`
- Prevents cross-tenant data leakage
- Enforced at database level (not application)

### Daily Database Maintenance

**Automated Tasks (Scheduled):**

| Task | Schedule | Duration | Purpose |
|------|----------|----------|---------|
| **VACUUM** | 2am UTC daily | 30-60 min | Reclaim storage, update statistics |
| **ANALYZE** | 3am UTC daily | 15-30 min | Update query planner statistics |
| **Index Rebuild** | Sunday 3am UTC | 1-2 hours | Optimize index performance |
| **Backup** | Every 6 hours | 10-20 min | Point-in-time recovery |
| **Replication Lag Check** | Every 5 minutes | <1 sec | Ensure replicas in sync |

### Database Performance Optimization

**Slow Query Detection:**

\`\`\`mermaid
flowchart TD
    A[Query Executed] --> B{Execution Time}
    
    B -->|<100ms| C[Fast - No Action]
    B -->|100-500ms| D[Moderate - Log Warning]
    B -->|>500ms| E[Slow - Alert DevOps]
    
    E --> F[Capture Query Plan]
    F --> G[Analyze Index Usage]
    G --> H{Missing Index?}
    
    H -->|Yes| I[Create Index]
    H -->|No| J[Query Optimization Needed]
    
    I --> K[Test Index Impact]
    J --> L[Refactor Query]
    
    K --> M{Performance Improved?}
    L --> M
    
    M -->|Yes| N[Deploy Optimization]
    M -->|No| O[Escalate to DBA Team]
    
    style N fill:#10b981,color:#fff
    style E fill:#ef4444,color:#fff
\`\`\`

**Query Optimization Checklist:**
- ✅ Add indexes on frequently filtered columns
- ✅ Use EXPLAIN ANALYZE to review query plans
- ✅ Avoid N+1 queries (use joins)
- ✅ Implement query result caching in Redis
- ✅ Partition large tables by date
- ✅ Archive old data (>2 years) to cold storage

### Database Scaling Procedures

**Vertical Scaling (Increase Instance Size):**

**When to Scale Up:**
- CPU >80% for >1 hour sustained
- Memory >85% for >30 minutes
- IOPS >80% of provisioned
- Connection pool >80% utilized

**Process:**
1. Schedule maintenance window (Saturday 2-6am UTC)
2. Notify customers 72 hours in advance
3. Create final backup before scaling
4. Initiate instance modification (AWS RDS)
5. Expect 10-20 minutes downtime
6. Validate performance post-scaling
7. Monitor for 24 hours

**Horizontal Scaling (Add Read Replicas):**

**When to Add Replicas:**
- Read query load >60% on replicas
- Reporting queries impacting primary
- New geographic region requiring low-latency reads

**Process:**
1. Provision new read replica (no downtime)
2. Wait for replication sync (<10 minutes)
3. Update application config to use new replica
4. Monitor replication lag (<1 second acceptable)

### Backup & Recovery

**Backup Strategy:**

| Backup Type | Frequency | Retention | Purpose |
|-------------|-----------|-----------|---------|
| **Automated Snapshots** | Every 6 hours | 7 days | Quick rollback for recent issues |
| **Daily Full Backup** | 2am UTC daily | 30 days | Disaster recovery |
| **Weekly Archive** | Sunday 3am UTC | 90 days | Compliance, audit |
| **Transaction Logs** | Continuous (WAL) | 7 days | Point-in-time recovery (PITR) |

**Point-in-Time Recovery (PITR):**
- Can restore database to any second within last 7 days
- Recovery Time Objective (RTO): <2 hours
- Recovery Point Objective (RPO): <15 minutes (max data loss)

**Recovery Testing:**
- Monthly: Restore backup to test environment
- Validate data integrity
- Measure recovery time
- Document results

### Metrics

- Database uptime (target: >99.95%)
- Query performance (target: p95 <100ms)
- Backup success rate (target: 100%)
- Replication lag (target: <1 second)
- Connection pool utilization (target: <70%)

---

## SOP-OPS-004: Auto-Scaling & Capacity Planning

### Purpose
Automatically scale infrastructure based on demand and plan capacity for growth.

### Auto-Scaling Configuration

**ECS Fargate Auto-Scaling:**

\`\`\`yaml
auto_scaling_policy:
  payment_processor_service:
    min_tasks: 4
    max_tasks: 50
    target_cpu: 70%
    target_memory: 80%
    
    scale_up:
      trigger: CPU >70% for 3 minutes OR Memory >80%
      action: Add 25% more tasks (round up)
      cooldown: 60 seconds
      
    scale_down:
      trigger: CPU <40% for 10 minutes AND Memory <50%
      action: Remove 25% tasks (round down, min 4)
      cooldown: 300 seconds
      
  api_gateway_kong:
    min_tasks: 3
    max_tasks: 20
    target_requests_per_task: 1000/min
    
  web_portal_cloudfront:
    auto_scaling: AWS managed
    cache_behavior: Cache static assets, bypass dynamic
\`\`\`

**Scaling Events Example:**

\`\`\`mermaid
graph LR
    A[Baseline: 4 Tasks] --> B[Traffic Spike: CPU 75%]
    B --> C[Scale Up: +1 Task = 5 Total]
    C --> D[Traffic Continues: CPU 72%]
    D --> E[Scale Up: +1 Task = 6 Total]
    E --> F[Traffic Stabilizes: CPU 65%]
    F --> G[No Further Action]
    
    G --> H[Traffic Decreases: CPU 35%]
    H --> I[Wait 10 Minutes]
    I --> J[Scale Down: -1 Task = 5 Total]
    J --> K[Further Decrease: CPU 30%]
    K --> L[Scale Down: -1 Task = 4 Total Min]
    
    style A fill:#3b82f6,color:#fff
    style L fill:#3b82f6,color:#fff
\`\`\`

### Capacity Planning

**Quarterly Capacity Review:**

1. **Analyze Growth Trends:**
   - Customer count growth rate
   - Transaction volume growth rate
   - Data storage growth rate
   - API request growth rate

2. **Project Next Quarter:**
   - Expected customer count
   - Expected peak TPS
   - Expected database size
   - Expected egress/bandwidth

3. **Plan Infrastructure:**
   - Upgrade database if needed
   - Add read replicas if needed
   - Increase ECS task limits
   - Expand Redis cluster

4. **Budget Impact:**
   - Calculate cost of planned capacity
   - Compare to revenue growth
   - Ensure margin targets met

**Capacity Planning Model:**

\`\`\`
Current Capacity:
- Max TPS: 1,000
- Max Concurrent Customers: 500 (2 TPS each avg)
- Max Database Size: 500GB

Projected (Q2 2026):
- Customer Count: 170 (+70)
- Avg TPS per Customer: 2.5 (+25% growth)
- Required Max TPS: 170 × 2.5 = 425 TPS

Buffer: 2x (for traffic spikes) = 850 TPS required

Action: Current capacity (1,000 TPS) sufficient, no scaling needed
\`\`\`

### Metrics

- Capacity utilization (target: 40-70% average, <85% peak)
- Auto-scaling events per day (target: <10 - indicates stable sizing)
- Over-provisioning cost (target: <15% wasted capacity)
- Under-provisioning incidents (target: 0 - no capacity-related outages)

---

## SOP-OPS-005: Incident Management (ITIL Framework)

### Purpose
Structured incident response to minimize customer impact and ensure rapid resolution.

### Incident Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [*] --> Detected: Alert triggered or customer report
    Detected --> Logged: Create incident ticket
    Logged --> Triaged: Assign priority and owner
    Triaged --> Investigating: On-call engineer engaged
    
    Investigating --> Identified: Root cause found
    Identified --> Resolving: Fix being implemented
    Resolving --> Resolved: Fix deployed
    
    Resolved --> Monitoring: Monitor for 1 hour
    Monitoring --> Closed: No recurrence
    Monitoring --> Investigating: Issue returns
    
    Closed --> Post_Incident_Review: RCA within 48h
    Post_Incident_Review --> [*]
    
    note right of Investigating
        P1: Page on-call immediately
        P2: Assign to team queue
        P3/P4: Next business day
    end note
\`\`\`

### Incident Severity Matrix

| Severity | Definition | Examples | Response Time | Resolution Target |
|----------|-----------|----------|---------------|-------------------|
| **P1 - Critical** | Complete platform outage or data breach | Database down, payment processing halted, security breach | <5 min | <4 hours |
| **P2 - High** | Major feature broken, significant degradation | API errors affecting >10% requests, processor timeout | <15 min | <24 hours |
| **P3 - Medium** | Minor feature issue, workaround available | Dashboard slowness, reporting delay, UI bug | <1 hour | <72 hours |
| **P4 - Low** | Cosmetic issue, no business impact | Typo, minor UI glitch | <1 business day | <7 days |

### Major Incident Communication Protocol

**P1 Critical Incident - Communication Timeline:**

\`\`\`mermaid
gantt
    title P1 Incident Communication Timeline
    dateFormat HH:mm
    
    section Detection & Response
    Incident Detected                 :milestone, 00:00, 0min
    On-Call Engineer Paged            :00:00, 3min
    Incident Commander Assigned       :00:03, 2min
    
    section Internal Communication
    Engineering Team Alerted Slack    :00:05, 1min
    CTO Notified                      :00:06, 1min
    Customer Success Team Alerted     :00:10, 1min
    
    section External Communication
    Status Page Updated               :00:15, 2min
    Affected Customers Emailed        :00:20, 5min
    
    section Updates
    Update 1 30 min                  :milestone, 00:30, 0min
    Update 2 60 min                  :milestone, 01:00, 0min
    Update 3 90 min                  :milestone, 01:30, 0min
    
    section Resolution
    Issue Resolved                    :milestone, 02:00, 0min
    Resolution Communication          :02:00, 10min
    Post-Incident Report 24h          :milestone, 24:00, 0min
\`\`\`

**Status Page Updates:**
- **Investigating:** "We are aware of an issue affecting [service]. Our team is investigating."
- **Identified:** "We have identified the cause: [brief description]. Working on a fix."
- **Monitoring:** "Fix has been deployed. Monitoring to ensure stability."
- **Resolved:** "Issue has been fully resolved. All services operating normally."

### Post-Incident Review (PIR)

**Required for:** All P1 and P2 incidents

**Timeline:** Within 48 hours of resolution

**PIR Template:**

\`\`\`markdown
# Post-Incident Review: [Incident Title]

**Incident ID:** INC-2026-0123  
**Severity:** P1  
**Duration:** 2 hours 15 minutes  
**Customer Impact:** 15% of customers unable to process transactions  
**Date:** January 15, 2026

## Timeline

| Time | Event |
|------|-------|
| 02:15 UTC | Alert: Database connection pool exhausted |
| 02:17 UTC | On-call engineer paged |
| 02:22 UTC | Root cause identified: Query leak in new deployment |
| 02:30 UTC | Rollback to previous version initiated |
| 02:33 UTC | Service restored |
| 04:30 UTC | All systems verified healthy |

## Root Cause

Deployment v2.34.0 introduced a database connection leak in the transaction reporting query. Connections were not being released, causing pool exhaustion.

## Impact

- 15% of customers (23 PSPs) unable to process transactions for 18 minutes
- $12,000 in transaction volume delayed
- 47 support tickets generated

## Resolution

- Immediate: Rolled back to v2.33.9 (3 minutes)
- Permanent: Fixed connection leak in code, added connection pool monitoring alert

## Preventive Actions

1. ✅ Add connection pool monitoring alert (trigger at 80% utilization) - **COMPLETE**
2. ✅ Enhance pre-deployment testing to include connection leak checks - **IN PROGRESS**
3. ✅ Implement automatic rollback if connections >90% - **COMPLETE**
4. ⏳ Code review: All DB queries must use connection.release() - **DUE: Jan 20**

## Lessons Learned

- Positive: Rollback process worked flawlessly (3 min to restore)
- Negative: Monitoring didn't alert until pool fully exhausted
- Improvement: Need earlier warning system
\`\`\`

### Metrics

- Incident response time (target: meet SLA 95% of time)
- Mean time to resolution (MTTR) - (target: <4h for P1, <24h for P2)
- Post-incident review completion (target: 100% within 48 hours)
- Preventive action completion (target: >90% within 30 days)
- Repeat incidents (target: <10% - same root cause recurs)

---

## SOP-OPS-006: Certificate Management (TLS/SSL/API Keys)

### Purpose
Maintain secure certificates for HTTPS, API authentication, and prevent expiration-related outages.

### Certificate Inventory

| Certificate Type | Count | Issuer | Renewal Frequency | Auto-Renewal |
|-----------------|-------|--------|-------------------|--------------|
| **Wildcard SSL** (*.ftsmoney.com) | 1 | Let's Encrypt | 90 days | ✅ Yes |
| **Custom Domain SSL** (customer domains) | 50+ | Let's Encrypt | 90 days | ✅ Yes |
| **API Gateway Certificates** | 5 | AWS Certificate Manager | Auto-renewed | ✅ Yes |
| **Code Signing Certificates** | 2 | DigiCert | Annually | ❌ Manual |
| **Striga API Certificates** | 1 | Striga | Auto-renewed | ✅ Yes (monitored) |

### Certificate Renewal Workflow

\`\`\`mermaid
gantt
    title SSL Certificate Renewal Timeline (90-Day Cycle)
    dateFormat YYYY-MM-DD
    
    section Monitoring
    Certificate Issued                :milestone, 2026-01-01, 0d
    
    section Alerts
    60-Day Expiry Warning             :milestone, 2026-03-02, 0d
    30-Day Expiry Warning             :milestone, 2026-04-01, 0d
    7-Day Expiry URGENT               :milestone, 2026-04-24, 0d
    
    section Renewal (Automated)
    Auto-Renewal Attempted            :2026-03-15, 1d
    New Certificate Issued            :milestone, 2026-03-16, 0d
    Deployed to Servers               :2026-03-16, 1d
    Old Certificate Retired           :2026-03-17, 1d
    
    section Validation
    Verify HTTPS Working              :2026-03-17, 1d
    Check All Domains                 :2026-03-17, 1d
    Close Renewal Task                :milestone, 2026-03-18, 0d
\`\`\`

**Manual Intervention Required If:**
- Auto-renewal fails (DNS validation issues)
- Certificate Authority rate limit hit
- Custom certificates requiring approval

### API Key Rotation (Internal & Customer)

**FTS.Money Internal API Keys (to external services):**
- Stripe API keys: Rotated every 90 days
- Striga API keys: Rotated every 90 days
- AWS access keys: Rotated every 60 days
- Database passwords: Rotated every 180 days

**Customer API Keys (to FTS.Money):**
- Recommended rotation: 90 days
- Forced rotation: 365 days (annual)
- Grace period: 7 days (old + new both work)

### Metrics

- Certificate expiry incidents (target: 0)
- Certificates renewed on time (target: 100% before 30-day warning)
- API key rotation compliance (target: 100%)
- Certificate-related customer support tickets (target: <1 per quarter)

---

## Appendix: Infrastructure Cost Optimization

### Cost Breakdown (Monthly)

| Component | Cost | % of Total | Optimization Opportunity |
|-----------|------|-----------|-------------------------|
| **ECS Fargate** | $12,000 | 35% | Right-size tasks, use Spot for dev/test |
| **RDS PostgreSQL** | $8,500 | 25% | Reserved instances (save 40%) |
| **Data Transfer** | $4,200 | 12% | Optimize egress, use CloudFront caching |
| **ElastiCache Redis** | $3,800 | 11% | Right-size nodes |
| **Elasticsearch** | $3,200 | 9% | Archive old logs to S3 |
| **Other (S3, Lambda, etc.)** | $2,800 | 8% | Lifecycle policies for S3 |
| **TOTAL** | **$34,500** | **100%** | Target: $30K with optimizations |

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** CTO & DevOps Lead
- **Review Frequency:** Monthly

© 2026 FTS.Money. Confidential - Internal use only.
`;

export default PlatformInfrastructureSOPs;