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

## Travel Rule Implementation

### IVMS101 Data Standard

The InterVASP Messaging Standard (IVMS101) defines the structured data format for Travel Rule compliance.

**Originator Information:**
\`\`\`json
{
  "originator": {
    "originatorPersons": [{
      "naturalPerson": {
        "name": {
          "nameIdentifier": [{
            "primaryIdentifier": "Smith",
            "secondaryIdentifier": "John",
            "nameIdentifierType": "LEGL"
          }]
        },
        "geographicAddress": [{
          "addressType": "HOME",
          "streetName": "Main Street",
          "buildingNumber": "123",
          "postCode": "10001",
          "townName": "New York",
          "country": "US"
        }],
        "nationalIdentification": {
          "nationalIdentifier": "123-45-6789",
          "nationalIdentifierType": "SOCS",
          "countryOfIssue": "US"
        },
        "dateAndPlaceOfBirth": {
          "dateOfBirth": "1985-03-15",
          "placeOfBirth": "New York"
        }
      }
    }],
    "accountNumber": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"]
  },
  "originating_vasp": {
    "legalPerson": {
      "name": {
        "nameIdentifier": [{
          "legalPersonName": "FTS Crypto Gateway",
          "legalPersonNameIdentifierType": "LEGL"
        }]
      },
      "nationalIdentification": {
        "nationalIdentifier": "549300XQCIJYJR6IUE12",
        "nationalIdentifierType": "LEIX"
      }
    }
  }
}
\`\`\`

**Beneficiary Information:**
\`\`\`json
{
  "beneficiary": {
    "beneficiaryPersons": [{
      "naturalPerson": {
        "name": {
          "nameIdentifier": [{
            "primaryIdentifier": "Doe",
            "secondaryIdentifier": "Jane",
            "nameIdentifierType": "LEGL"
          }]
        },
        "geographicAddress": [{
          "addressType": "HOME",
          "streetName": "Oxford Street",
          "buildingNumber": "456",
          "postCode": "W1D 1BS",
          "townName": "London",
          "country": "GB"
        }]
      }
    }],
    "accountNumber": ["0x8Ba1f109551bD432803012645Ac136ddd64DBA72"]
  },
  "beneficiary_vasp": {
    "legalPerson": {
      "name": {
        "nameIdentifier": [{
          "legalPersonName": "UK Crypto Exchange Ltd",
          "legalPersonNameIdentifierType": "LEGL"
        }]
      },
      "nationalIdentification": {
        "nationalIdentifier": "213800WSGIIZCXF1P572",
        "nationalIdentifierType": "LEIX"
      }
    }
  }
}
\`\`\`

### Travel Rule Protocols

| Protocol | Description | Supported |
|----------|-------------|-----------|
| **TRP (Travel Rule Protocol)** | Open-source P2P protocol | ✅ Yes |
| **OpenVASP** | Decentralized protocol using smart contracts | ✅ Yes |
| **TRUST** | TransactID protocol by Notabene | ✅ Yes |
| **Sygna Bridge** | CoolBitX Travel Rule solution | ✅ Yes |
| **Shyft Network** | Attestation-based protocol | ✅ Yes |

### Threshold Configuration

\`\`\`json
{
  "travel_rule_config": {
    "enabled": true,
    "default_threshold": 1000,
    "currency": "USD",
    "jurisdiction_overrides": [
      {
        "jurisdiction": "US",
        "threshold": 3000,
        "currency": "USD"
      },
      {
        "jurisdiction": "EU",
        "threshold": 1000,
        "currency": "EUR"
      },
      {
        "jurisdiction": "SG",
        "threshold": 1500,
        "currency": "SGD"
      }
    ],
    "always_collect": false,
    "voluntary_exchange_below_threshold": true
  }
}
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

### Sanctions Lists Integration

| List | Source | Update Frequency | Coverage |
|------|--------|------------------|----------|
| **OFAC SDN** | US Treasury | Daily | Global sanctions |
| **EU Consolidated** | European Union | Weekly | EU sanctions |
| **UN Sanctions** | United Nations | Weekly | Global sanctions |
| **UK HMT** | HM Treasury | Weekly | UK sanctions |
| **AUSTRAC** | Australia | Monthly | AU sanctions |
| **MAS** | Singapore | Monthly | SG sanctions |

### PEP Database

- **Politically Exposed Persons** - Government officials, senior politicians
- **Relatives & Close Associates** - Family members and business partners
- **Former PEPs** - Individuals who were PEPs within last 12 months
- **Coverage** - 240+ countries, 10M+ profiles

---

## Blockchain Analytics

### On-Chain Risk Scoring
\`\`\`mermaid
graph TD
    A[Wallet Address] --> B[Blockchain Analytics]
    B --> C{Address History}
    
    C --> D[Transaction Volume]
    C --> E[Counterparty Analysis]
    C --> F[Source of Funds]
    
    D --> G{High Volume?}
    G -->|Yes| H[+Risk Score]
    G -->|No| I[Neutral]
    
    E --> J{Known Exchanges?}
    J -->|Regulated| K[-Risk Score]
    J -->|Unregulated| L[+Risk Score]
    J -->|Mixers/Tumblers| M[++Risk Score]
    
    F --> N{Funding Source}
    N -->|Legitimate Exchange| O[-Risk Score]
    N -->|Darknet Market| P[+++Risk Score]
    N -->|Ransomware| Q[Block Immediately]
    
    H --> R[Calculate Final Score]
    I --> R
    K --> R
    L --> R
    M --> R
    O --> R
    P --> R
    
    R --> S{Risk Level}
    S -->|0-30| T[Low Risk - Approve]
    S -->|31-70| U[Medium Risk - Review]
    S -->|71-100| V[High Risk - Reject]
    
    Q --> W[Automatic Block + SAR]
\`\`\`

### Risk Indicators

| Indicator | Weight | Description |
|-----------|--------|-------------|
| **Darknet Market** | 95 | Address linked to illicit marketplace |
| **Ransomware** | 100 | Known ransomware payment address |
| **Mixer/Tumbler** | 80 | Privacy-enhancing service usage |
| **Stolen Funds** | 100 | Address received stolen crypto |
| **Sanctioned Entity** | 100 | OFAC or EU sanctioned address |
| **Unregulated Exchange** | 40 | Non-compliant exchange |
| **High Volume** | 30 | Unusual transaction patterns |
| **Multiple Hops** | 20 | Complex transaction chains |

---

## Transaction Monitoring

### Suspicious Activity Detection
\`\`\`mermaid
stateDiagram-v2
    [*] --> Monitoring: Transaction Approved
    
    Monitoring --> Normal: Typical Pattern
    Monitoring --> Suspicious: Red Flag Detected
    
    Normal --> [*]: Complete
    
    Suspicious --> Investigation: Alert Generated
    Investigation --> FalsePositive: Explained Activity
    Investigation --> TruePositive: Confirmed Suspicious
    
    FalsePositive --> Normal: Clear Alert
    
    TruePositive --> SARFiling: Threshold Met
    SARFiling --> Reported: Filed with Authority
    
    Reported --> [*]: Case Closed
\`\`\`

### Red Flags

**Structuring (Smurfing):**
- Multiple transactions just below reporting threshold
- Consistent patterns of near-threshold amounts
- Coordinated activity across multiple accounts

**Unusual Patterns:**
- Sudden spike in transaction volume
- Rapid movement of funds between multiple wallets
- Off-hours or weekend activity spikes
- Geographic anomalies (VPN/Tor usage)

**High-Risk Jurisdictions:**
- Transactions to/from FATF grey/blacklist countries
- Jurisdictions with weak AML controls
- Known crypto fraud hotspots

---

## Compliance Reporting

### Suspicious Activity Report (SAR)
\`\`\`json
{
  "sar_id": "SAR-2024-001234",
  "filing_institution": {
    "name": "FTS Crypto Gateway",
    "lei": "549300XQCIJYJR6IUE12",
    "contact": "compliance@fts.money"
  },
  "subject": {
    "type": "individual",
    "name": "John Doe",
    "address": "123 Main St, New York, NY",
    "wallet_addresses": ["0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"],
    "relationship": "customer"
  },
  "suspicious_activity": {
    "type": "structuring",
    "date_range": {
      "start": "2024-01-01",
      "end": "2024-01-15"
    },
    "total_amount": 45000,
    "currency": "USD",
    "transactions": [
      {
        "date": "2024-01-05",
        "amount": 2950,
        "type": "withdrawal"
      },
      {
        "date": "2024-01-07",
        "amount": 2980,
        "type": "withdrawal"
      }
    ],
    "description": "Customer made 15 withdrawals over 2 weeks, each just below $3,000 threshold. Pattern consistent with structuring to avoid CTR reporting."
  },
  "red_flags": [
    "Multiple transactions just below threshold",
    "Consistent transaction amounts",
    "Short time period",
    "No business justification provided"
  ],
  "filed_with": "FinCEN",
  "filing_date": "2024-01-16"
}
\`\`\`

### Currency Transaction Report (CTR)
Filed automatically for transactions over $10,000 (US) or equivalent.

---

## API Integration

### Perform AML Screening

**Endpoint:** \`POST /functions/amlScreening\`

**Request:**
\`\`\`json
{
  "customer_id": "CUST_12345",
  "screening_type": "comprehensive",
  "data": {
    "full_name": "John Smith",
    "date_of_birth": "1985-03-15",
    "nationality": "US",
    "address": "123 Main St, New York, NY 10001",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "screening_id": "SCR_789012",
  "status": "clear",
  "sanctions_check": {
    "match_found": false,
    "lists_checked": ["OFAC_SDN", "EU_CONSOLIDATED", "UN_SANCTIONS"]
  },
  "pep_check": {
    "is_pep": false,
    "is_relative": false
  },
  "adverse_media": {
    "red_flags_found": false
  },
  "blockchain_analysis": {
    "risk_score": 15,
    "risk_level": "low",
    "flags": []
  },
  "recommendation": "approve"
}
\`\`\`

### Travel Rule Data Exchange

**Endpoint:** \`POST /functions/travelRuleExchange\`

**Request:**
\`\`\`json
{
  "transaction_id": "TXN_123456",
  "direction": "outgoing",
  "amount": 5000,
  "currency": "USD",
  "crypto_asset": "BTC",
  "beneficiary_vasp_lei": "213800WSGIIZCXF1P572",
  "ivms101_data": {
    "originator": { /* IVMS101 structure */ },
    "beneficiary": { /* IVMS101 structure */ }
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "travel_rule_id": "TR_345678",
  "status": "accepted",
  "beneficiary_vasp_response": {
    "accepted": true,
    "message": "Beneficiary verified and approved"
  },
  "transmitted_at": "2024-01-05T14:32:00Z"
}
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

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| **False positive screening** | Common name match | Add date of birth, nationality to screening |
| **Travel Rule timeout** | Counterparty VASP offline | Retry with exponential backoff |
| **IVMS101 validation error** | Incorrect data format | Review IVMS101 schema specification |
| **Blockchain risk score high** | Legitimate mixer usage | Manual review and document justification |
| **SAR filing error** | Missing required fields | Review FinCEN SAR form requirements |

---

## Regulatory Updates (2024-2025)

- 🇪🇺 **MiCA Implementation** - EU-wide VASP licensing (June 2024)
- 🇺🇸 **FinCEN Proposed Rule** - DeFi and unhosted wallets (2025)
- 🇬🇧 **UK VASP Regime** - FCA full supervision (2024)
- 🇸🇬 **MAS Revised Notice** - Enhanced Travel Rule enforcement
- 🌍 **FATF Updated Guidance** - DeFi and NFT coverage

---

*Document Version: 1.0 | Last Updated: 2025-01-05*
`;

export default function VASPComplianceDocComponent() {
    return (
        <div className="prose prose-slate max-w-none">
            <MermaidDiagram content={VASPComplianceDoc} />
        </div>
    );
}

export { VASPComplianceDoc };