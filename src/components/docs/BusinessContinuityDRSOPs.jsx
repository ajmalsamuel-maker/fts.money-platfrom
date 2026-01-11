const BusinessContinuityDRSOPs = `# Business Continuity & Disaster Recovery SOPs
## FTS.Money Resilience, Failover & Recovery Procedures

**Document Classification:** Confidential  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** CTO & COO

---

## Table of Contents

1. [Overview](#overview)
2. [BCP Activation Criteria](#bcp-activation)
3. [Disaster Recovery Procedures](#disaster-recovery)
4. [Data Center Failover](#data-center-failover)
5. [BCP/DR Testing](#bcp-dr-testing)
6. [Crisis Communication](#crisis-communication)

---

## Overview

### Recovery Objectives

| Service | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) | Priority |
|---------|------------------------------|-------------------------------|----------|
| **PSP Platform** | <2 hours | <15 minutes | CRITICAL |
| **Crypto VASP** | <4 hours | <30 minutes | CRITICAL |
| **ISO Gateway** | <2 hours | <5 minutes | CRITICAL |
| **Billing System** | <24 hours | <1 hour | HIGH |
| **Reporting** | <48 hours | <24 hours | MEDIUM |

### BCP/DR Architecture

\`\`\`mermaid
graph TB
    subgraph "Primary Region: US-East-1"
        P1[Production DB<br/>Primary]
        P2[Application Servers<br/>ECS]
        P3[Redis Cache]
    end
    
    subgraph "Secondary Region: US-West-2"
        S1[Production DB<br/>Read Replica + Standby]
        S2[Application Servers<br/>ECS Warm Standby]
        S3[Redis Cache]
    end
    
    subgraph "Backup & Archive"
        B1[S3 Backups<br/>Cross-Region]
        B2[Glacier Archive<br/>Long-term]
    end
    
    P1 -.->|Continuous Replication| S1
    P2 -.->|Config Sync| S2
    P3 -.->|Backup| S3
    
    P1 -->|Automated Backups Every 6h| B1
    B1 -->|Monthly Archive| B2
    
    S1 -.->|Failover Trigger| Promote[Promote to Primary]
    Promote -->|<15 minutes| S1_Primary[New Primary in US-West-2]
    
    style P1 fill:#3b82f6,color:#fff
    style S1 fill:#10b981,color:#fff
    style Promote fill:#ef4444,color:#fff
\`\`\`

---

## SOP-BCP-001: Business Continuity Plan Activation

### Activation Criteria

**When to Activate BCP:**

| Trigger Event | Activation Decision | Response |
|--------------|-------------------|----------|
| **Complete AWS region outage** | Automatic | Immediate DR failover |
| **Major security breach** | CTO + CISO decision | Containment + selective service shutdown |
| **Extended database failure** (>1 hour) | CTO decision | Failover to secondary region |
| **Critical vendor failure** (Striga, Kong, Stripe) | COO decision | Activate vendor contingency plans |
| **Natural disaster** affecting staff | CEO decision | Remote operations, alternate communication |
| **Regulatory shutdown order** | CEO + Legal decision | Compliance mode, limited operations |

### BCP Activation Workflow

\`\`\`mermaid
stateDiagram-v2
    [*] --> Event_Detected
    Event_Detected --> Assessment
    Assessment --> Severity_Evaluation
    
    Severity_Evaluation --> Minor: Handled by normal incident response
    Severity_Evaluation --> Major: BCP activation considered
    Severity_Evaluation --> Critical: BCP activation mandatory
    
    Minor --> [*]
    
    Major --> CTO_Review
    CTO_Review --> BCP_Activated: Approve
    CTO_Review --> Standard_Incident: Decline
    
    Critical --> BCP_Activated: Auto-trigger
    
    BCP_Activated --> Notify_Stakeholders
    Notify_Stakeholders --> Execute_Contingency_Plans
    Execute_Contingency_Plans --> Monitor_Situation
    Monitor_Situation --> Resolution
    Resolution --> Post_Event_Review
    Post_Event_Review --> [*]
    
    Standard_Incident --> [*]
\`\`\`

### Metrics

- BCP activation time (target: <15 minutes from decision)
- Stakeholder notification time (target: <30 minutes)
- Service restoration time (target: per RTO)

---

## SOP-DR-001: Disaster Recovery Failover Procedures

### Database Failover (PostgreSQL RDS)

**Automatic Failover (AWS RDS Multi-AZ):**
- Primary fails → Automatic failover to standby in different AZ
- Downtime: 60-120 seconds
- No data loss (synchronous replication)

**Manual Failover to Secondary Region:**

\`\`\`yaml
disaster_recovery_runbook:
  step_1_decision:
    trigger: Primary region completely unavailable >30 min
    decision_maker: CTO
    communication: Alert all teams via Slack + PagerDuty
    
  step_2_promote_read_replica:
    action: Promote US-West-2 read replica to primary
    command: "aws rds promote-read-replica --db-instance-identifier fts-db-west"
    duration: 5-10 minutes
    validation: Check replication lag <1 second before promotion
    
  step_3_update_application:
    action: Update application database endpoint
    method: Update environment variable DATABASE_URL
    duration: 2 minutes
    validation: Application health check passes
    
  step_4_restart_services:
    action: Restart ECS tasks to pick up new DB endpoint
    method: ECS rolling restart
    duration: 3-5 minutes
    validation: All tasks healthy, processing transactions
    
  step_5_redirect_traffic:
    action: Update Route53 DNS to point to US-West-2
    duration: 1-2 minutes (TTL=60 seconds)
    validation: Traffic flowing to secondary region
    
  step_6_validate:
    action: Test transaction end-to-end
    duration: 5 minutes
    validation: Successful auth, capture, settlement
    
  total_rto: <15 minutes
  total_rpo: <15 minutes (last backup interval)
\`\`\`

### Failover Testing

**Quarterly DR Drill:**
- Simulated regional outage
- Execute failover procedures
- Validate all services operational in secondary region
- Measure RTO/RPO achieved
- Failback to primary region
- Document lessons learned

### Metrics

- DR failover success rate (target: 100% of tests)
- RTO achievement (target: <2 hours actual vs target)
- RPO achievement (target: <15 min data loss)
- DR test frequency (target: 4x per year minimum)

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026

© 2026 FTS.Money. Confidential.
`;

export default BusinessContinuityDRSOPs;