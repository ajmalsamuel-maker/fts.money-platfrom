const QSAPortalGuide = `# QSA Portal - Complete User Guide
## PCI DSS Audit & Assessment Platform

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** External Documentation - QSA/Auditor Use  
**Portal URL:** \`/QSAPortalDashboard\`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Portal Access & Authentication](#portal-access--authentication)
3. [Dashboard Overview](#dashboard-overview)
4. [Audit Task Management](#audit-task-management)
5. [Evidence Review](#evidence-review)
6. [Report Generation](#report-generation)
7. [Communication Center](#communication-center)
8. [Compliance Scoring](#compliance-scoring)

---

## Executive Summary

### What is the QSA Portal?

The QSA (Qualified Security Assessor) Portal is a dedicated workspace for external auditors to conduct PCI DSS compliance assessments on FTS.Money PSP instances and merchants.

**Portal Capabilities:**
- ✅ **Read-only access** to compliance data, evidence, and audit logs
- ✅ **Task management** for audit engagement tracking
- ✅ **Evidence review** - Document verification, control testing results
- ✅ **Report upload** - Submit ROC (Report on Compliance) and AOC
- ✅ **Secure messaging** - Communicate with PSP/merchant compliance teams
- ✅ **Audit trail** - Complete access logging for regulatory transparency

### Who Uses This Portal?

| User Type | Access Level | Typical Activities |
|-----------|--------------|-------------------|
| **Lead QSA** | Full audit access | Evidence review, report finalization |
| **QSA Analyst** | Limited to assigned tasks | Control testing, evidence collection |
| **QSA Reviewer** | Review-only | Quality assurance, second review |
| **Certification Body** | Report viewing | Final AOC issuance |

---

## Portal Access & Authentication

### QSA Account Provisioning

\`\`\`mermaid
sequenceDiagram
    participant PSP as PSP Admin
    participant Platform as FTS Platform
    participant QSA
    participant Email as Email System
    
    PSP->>Platform: Request PCI audit
    Platform->>PSP: Select QSA firm
    
    PSP->>Platform: Enter QSA email + firm name
    Platform->>Platform: Create QSAUser record
    
    Platform->>Email: Send invitation
    Email->>QSA: Invitation email
    
    QSA->>Platform: Click activation link
    Platform->>QSA: Set password form
    
    QSA->>Platform: Submit password
    Platform->>Platform: Hash password, activate account
    
    Platform->>QSA: Redirect to QSA Portal
    QSA->>Platform: Access audit workspace
\`\`\`

### Security & Access Controls

\`\`\`yaml
qsa_access_policies:
  authentication:
    password_requirements:
      - minimum_length: 14
      - require_uppercase: true
      - require_lowercase: true
      - require_numbers: true
      - require_symbols: true
      - expiry_days: 90
      
  session_management:
    session_timeout: 30  # minutes
    require_reauth_for_sensitive: true
    max_concurrent_sessions: 2
    
  access_logging:
    log_all_actions: true
    log_retention: 7_years  # PCI requirement
    audit_trail_immutable: true
\`\`\`

---

## Dashboard Overview

### Main Dashboard KPIs

\`\`\`mermaid
graph TB
    subgraph "Current Engagement"
        E1[PSP: GlobalPay Solutions<br/>Audit Type: Full ROC]
        E2[Scope: Level 1<br/>300M+ txn/year]
        E3[Status: In Progress<br/>Day 12 of 45]
    end
    
    subgraph "Audit Progress"
        P1[Requirements Tested<br/>89 / 382 (23%)]
        P2[Evidence Reviewed<br/>156 / 450 (35%)]
        P3[Findings Identified<br/>12 open]
        P4[Completion: 28%]
    end
    
    subgraph "Quick Actions"
        A1[Review Evidence Queue<br/>23 pending]
        A2[Complete Audit Tasks<br/>8 assigned to you]
        A3[Upload Report Draft<br/>Section 3.2 ready]
    end
    
    style E1 fill:#3b82f6,color:#fff
    style P4 fill:#f59e0b,color:#fff
    style A1 fill:#ef4444,color:#fff
\`\`\`

---

## Audit Task Management

### Task Workflow

\`\`\`mermaid
stateDiagram-v2
    [*] --> Assigned
    Assigned --> In_Progress: QSA starts work
    
    In_Progress --> Evidence_Pending: Request documents
    Evidence_Pending --> In_Progress: Evidence submitted
    
    In_Progress --> Finding: Issue identified
    Finding --> Remediation_Plan: PSP responds
    Remediation_Plan --> Re_Test: PSP implements fix
    Re_Test --> In_Progress: Verify remediation
    
    In_Progress --> Completed: Pass control test
    Completed --> Reviewed: Lead QSA review
    Reviewed --> [*]
    
    note right of Finding
        Severity: Critical, High, Medium, Low
        Must document compensating controls
    end note
\`\`\`

### Task Types

| Task Type | Description | Typical Duration | Evidence Required |
|-----------|-------------|------------------|-------------------|
| **Control Review** | Verify control design | 2-4 hours | Policy documents, screenshots |
| **Control Testing** | Test control effectiveness | 4-8 hours | Test results, sample transactions |
| **Interview** | Interview key personnel | 1-2 hours | Interview notes, org chart |
| **Technical Scan** | Vulnerability scanning | 2-6 hours | Scan reports, remediation proof |
| **Configuration Review** | Review system configs | 3-5 hours | Config exports, change logs |

---

## Evidence Review

### Evidence Vault Access

\`\`\`yaml
evidence_categories:
  policies_procedures:
    - information_security_policy
    - access_control_policy
    - change_management_procedure
    - incident_response_plan
    - data_retention_policy
    
  technical_documentation:
    - network_diagrams
    - data_flow_diagrams
    - system_configuration_files
    - firewall_rules
    - encryption_certificates
    
  operational_evidence:
    - vulnerability_scan_reports
    - penetration_test_results
    - security_awareness_training_records
    - access_review_logs
    - backup_verification_logs
    
  compliance_artifacts:
    - risk_assessments
    - gap_analysis_reports
    - remediation_plans
    - attestations_of_compliance
    - third_party_audit_reports
\`\`\`

### Evidence Review Interface

**Evidence Card:**
\`\`\`yaml
evidence_item:
  document_name: "Q4 2025 Vulnerability Scan Report"
  uploaded_by: "security@globalpay.com"
  upload_date: "2026-01-05T14:23:00Z"
  file_size: "2.4 MB"
  file_type: "PDF"
  
  pci_requirement: "11.3.1 - External vulnerability scans"
  
  qsa_review:
    status: "pending_review"
    assigned_to: "john.doe@qsafirm.com"
    priority: "high"
    
  actions:
    - download_file
    - approve_evidence
    - request_clarification
    - reject_insufficient
\`\`\`

---

## Report Generation

### ROC (Report on Compliance) Structure

\`\`\`mermaid
graph TB
    START[Start Audit] --> SCOPE[1. Define Scope]
    SCOPE --> ASSESS[2. Assess Requirements]
    
    ASSESS --> R1[3. Test Controls]
    R1 --> R2[4. Document Findings]
    R2 --> R3[5. Review Compensating Controls]
    
    R3 --> DRAFT[6. Generate Report Draft]
    DRAFT --> REVIEW[7. Internal QA Review]
    
    REVIEW --> FINAL{All requirements<br/>satisfied?}
    
    FINAL -->|Yes| COMPLIANT[8. Issue AOC<br/>Compliant]
    FINAL -->|No| FINDINGS[8. Issue Findings Report<br/>Non-Compliant]
    
    COMPLIANT --> UPLOAD[Upload to Portal]
    FINDINGS --> UPLOAD
    
    UPLOAD --> NOTIFY[Notify PSP]
    
    style COMPLIANT fill:#10b981,color:#fff
    style FINDINGS fill:#ef4444,color:#fff
\`\`\`

---

## Communication Center

### Secure Messaging

**Message Thread Example:**
\`\`\`yaml
conversation:
  - timestamp: "2026-01-08 10:24"
    from: "QSA (John Doe)"
    to: "PSP Compliance Team"
    subject: "Clarification Needed - Requirement 8.2.4"
    message: |
      Please provide evidence of password history enforcement (minimum 4 previous passwords).
      Current policy document references "password reuse prevention" but doesn't specify count.
    attachments: []
    
  - timestamp: "2026-01-08 14:56"
    from: "PSP (security@globalpay.com)"
    to: "QSA (John Doe)"
    subject: "RE: Clarification Needed - Requirement 8.2.4"
    message: |
      Attached is the updated policy with specific 4-password history requirement.
      Also attached: Screenshot of auth system config showing enforcement.
    attachments:
      - "password_policy_v2.1.pdf"
      - "auth_system_config_screenshot.png"
\`\`\`

---

## Compliance Scoring

### PCI DSS Scorecard

| Requirement Category | Requirements | Tested | Passed | Failed | In Progress | Score |
|---------------------|--------------|--------|--------|--------|-------------|-------|
| **Build & Maintain Secure Network** | 8 | 8 | 7 | 1 | 0 | 87.5% |
| **Protect Cardholder Data** | 12 | 10 | 9 | 0 | 2 | 90% |
| **Maintain Vulnerability Management** | 6 | 6 | 5 | 1 | 0 | 83.3% |
| **Implement Access Control** | 11 | 9 | 8 | 0 | 1 | 88.9% |
| **Monitor & Test Networks** | 10 | 8 | 7 | 0 | 1 | 87.5% |
| **Maintain Info Security Policy** | 5 | 5 | 5 | 0 | 0 | 100% |
| **Overall** | **52** | **46** | **41** | **2** | **4** | **89.1%** |

**Compliance Status:** ⚠️ Non-Compliant (2 critical findings)

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default QSAPortalGuide;