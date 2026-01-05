
import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const VASPComplianceDoc = `# VASP Compliance & Travel Rule

## Executive Summary

The FTS.Money VASP (Virtual Asset Service Provider) Compliance System provides comprehensive AML/CFT compliance for cryptocurrency businesses, including **Travel Rule** implementation, **sanctions screening**, **PEP checks**, and **transaction monitoring** in accordance with FATF recommendations and global regulatory requirements.

### Key Features
- ✅ **Travel Rule Compliance** - FATF R.16 compliant originator/beneficiary data exchange
- ✅ **AML/CFT Screening** - Real-time sanctions, PEP, and adverse media checks
- ✅ **Transaction Monitoring** - Suspicious activity detection and SAR filing
- ✅ **KYC/KYB Integration** - Identity verification with LEI/vLEI support
- ✅ **Multi-Jurisdiction** - Support for 50+ regulatory frameworks
- ✅ **Blockchain Analytics** - On-chain transaction risk scoring
- ✅ **Audit Trail** - Complete compliance audit logs

---

## Regulatory Framework

### FATF Recommendations

| Recommendation | Description | FTS Implementation |
|----------------|-------------|-------------------|
| **R.15** | New Technologies | Risk-based approach to crypto assets |
| **R.16** | Travel Rule | Originator/beneficiary info exchange |
| **R.10** | Customer Due Diligence | Enhanced KYC with LEI verification |
| **R.11** | Record Keeping | 7-year retention of transaction data |
| **R.20** | Suspicious Transactions | Automated SAR generation |
| **R.21** | Tipping Off | Secure SAR submission without disclosure |

### Global VASP Regulations

| Jurisdiction | Regulator | Key Requirements | Threshold |
|--------------|-----------|------------------|-----------|
| **European Union** | EBA | MiCA, 5AMLD, 6AMLD | €1,000 |
| **United States** | FinCEN | BSA, AML Act 2020 | $3,000 |
| **United Kingdom** | FCA | MLR 2017, TRA 2021 | £1,000 |
| **Singapore** | MAS | PSA, AML/CFT Notice | SGD 1,500 |
| **UAE** | VARA | VASP Regulations | AED 3,500 |
| **Switzerland** | FINMA | AML Act, DLT Act | CHF 1,000 |
| **Japan** | FSA | PASA, AML/CFT Guidelines | ¥100,000 |

---

## System Architecture

### VASP Compliance Engine
\`\`\`mermaid
graph TB
    A[Crypto Transaction] --> B{Transaction Type}
    B -->|Deposit| C[Incoming Transfer]
    B -->|Withdrawal| D[Outgoing Transfer]
    B -->|Trade| E[Internal Transfer]
    
    C --> F[Extract Blockchain Data]
    D --> F
    E --> G[Skip Travel Rule]
    
    F --> H[Blockchain Analytics]
    H --> I{Risk Score}
    
    I -->|High| J[Enhanced Due Diligence]
    I -->|Medium| K[Standard Screening]
    I -->|Low| K
    
    K --> L[AML Screening Engine]
    L --> M{Sanctions Match?}
    
    M -->|Yes| N[Block Transaction]
    M -->|No| O{PEP Match?}
    
    O -->|Yes| P[Enhanced Monitoring]
    O -->|No| Q{Travel Rule Applies?}
    
    Q -->|Yes| R[Travel Rule Exchange]
    Q -->|No| S[Process Transaction]
    
    R --> T{Threshold Exceeded?}
    T -->|Yes| U[Mandatory Data Exchange]
    T -->|No| V[Optional Exchange]
    
    U --> W[Send to Counterparty VASP]
    W --> X{Data Received?}
    
    X -->|Yes| Y[Validate Beneficiary]
    X -->|No| Z[Reject Transaction]
    
    Y --> AA{Validated?}
    AA -->|Yes| S
    AA -->|No| Z
    
    P --> S
    S --> AB[Transaction Monitoring]
    AB --> AC[Compliance Report]
    
    N --> AD[SAR Filing]
    Z --> AD
\`\`\`

### Travel Rule Data Exchange Flow
\`\`\`mermaid
sequenceDiagram
    participant Originator as Customer (Originator)
    participant VASP_A as Originating VASP
    participant TRP as Travel Rule Protocol
    participant VASP_B as Beneficiary VASP
    participant Beneficiary as Recipient
    
    Originator->>VASP_A: Request Withdrawal
    VASP_A->>VASP_A: Check Amount Threshold
    
    alt Amount > Threshold
        VASP_A->>Originator: Request Beneficiary Info
        Originator-->>VASP_A: Beneficiary Details
        
        VASP_A->>VASP_A: Validate Originator KYC
        VASP_A->>TRP: Send Travel Rule Message
        
        Note over TRP: IVMS101 Format:<br/>Originator Name, Address,<br/>Account ID, LEI
        
        TRP->>VASP_B: Forward Travel Rule Data
        VASP_B->>VASP_B: Validate Beneficiary KYC
        VASP_B->>VASP_B: Screen Against Sanctions
        
        alt Screening Pass
            VASP_B-->>TRP: Accept
            TRP-->>VASP_A: Acceptance
            VASP_A->>Originator: Approve Transaction
            VASP_A->>VASP_A: Execute Blockchain Transfer
            VASP_B->>Beneficiary: Credit Account
        else Screening Fail
            VASP_B-->>TRP: Reject
            TRP-->>VASP_A: Rejection Reason
            VASP_A->>Originator: Transaction Declined
        end
        
    else Amount <= Threshold
        VASP_A->>Originator: Approve (No Travel Rule)
        VASP_A->>VASP_A: Execute Transfer
    end
\`\`\`

---

## AML/CFT Screening

### Screening Workflow
\`\`\`mermaid
flowchart TD
    A[New Transaction] --> B[Extract Customer Data]
    B --> C[AML Screening Engine]
    
    C --> D{Sanctions Lists}
    D -->|OFAC SDN| E[US Sanctions]
    D -->|EU Sanctions| F[EU Consolidated]
    D -->|UN Sanctions| G[UN Security Council]
    D -->|UK HMT| H[UK Sanctions]
    
    E --> I{Match Found?}
    F --> I
    G --> I
    H --> I
    
    I -->|Yes| J[BLOCK Transaction]
    I -->|No| K{PEP Check}
    
    K -->|Match| L[Enhanced Due Diligence]
    K -->|No Match| M{Adverse Media}
    
    M -->|Red Flags| N[Manual Review]
    M -->|Clear| O{Blockchain Analysis}
    
    O --> P{Risk Score}
    P -->|High Risk| Q[Enhanced Monitoring]
    P -->|Medium| R[Standard Monitoring]
    P -->|Low| S[Approve Transaction]
    
    L --> T[Senior Management Approval]
    T --> R
    
    J --> U[File SAR]
    N --> V[Compliance Team]
    
    Q --> W[Transaction Monitoring]
    R --> W
    S --> W
\`\`\`

---

## Best Practices

### For VASPs

1. **Know Your Customer** - Implement robust KYC with identity verification
2. **Screen Continuously** - Re-screen customers regularly, not just at onboarding
3. **Monitor Transactions** - Use automated tools for pattern detection
4. **Train Staff** - Ensure compliance team understands crypto risks
5. **Document Everything** - Maintain detailed audit trails
6. **Update Sanctions Lists** - Daily updates from all relevant sources
7. **Test Travel Rule** - Regular testing with counterparty VASPs

### For Compliance Officers

1. **Risk-Based Approach** - Focus resources on high-risk customers
2. **Regular Audits** - Internal reviews of AML procedures
3. **Reporting Culture** - Encourage SAR filing when in doubt
4. **Regulatory Monitoring** - Stay updated on changing regulations
5. **Technology Investment** - Use automated screening and monitoring tools

---

*Document Version: 1.0 | Last Updated: 2025-01-05*
`;

export default VASPComplianceDoc;
