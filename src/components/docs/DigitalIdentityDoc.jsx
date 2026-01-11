export const DigitalIdentityDoc = `
# Digital Identity & Verifiable Credentials System

**Version:** 2.0  
**Last Updated:** January 11, 2026  
**Classification:** Technical Documentation  
**Document Owner:** FTS.Money Identity Team

---

## Executive Summary

The FTS.Money Digital Identity System implements W3C Verifiable Credentials (VC) and Decentralized Identifiers (DID) standards to provide secure, privacy-preserving, and user-controlled digital identity management. This comprehensive platform enables passwordless authentication, credential verification, and selective disclosure for financial services and beyond.

---

## 1. Digital Identity Architecture

### 1.1 System Overview

\`\`\`mermaid
graph TB
    subgraph "User Layer"
        USER[End User]
        WALLET[Digital Wallet]
    end
    
    subgraph "Identity Layer"
        DID[DID Registry]
        VC[VC Storage]
        AUTH[Authentication Service]
    end
    
    subgraph "Issuer Layer"
        BANK[Bank Issuer]
        GOV[Government Issuer]
        EDU[Education Issuer]
        EMP[Employer Issuer]
        KYC[KYC Provider]
    end
    
    subgraph "Verifier Layer"
        MERCHANT[Merchant]
        SERVICE[Service Provider]
        REGULATOR[Regulator]
        AUDITOR[Auditor]
    end
    
    subgraph "Infrastructure"
        BLOCKCHAIN[Blockchain]
        IPFS[IPFS Storage]
        HSM[Hardware Security Module]
    end
    
    USER --> WALLET
    WALLET <--> DID
    WALLET <--> VC
    WALLET <--> AUTH
    
    BANK --> VC
    GOV --> VC
    EDU --> VC
    EMP --> VC
    KYC --> VC
    
    WALLET <--> MERCHANT
    WALLET <--> SERVICE
    WALLET <--> REGULATOR
    WALLET <--> AUDITOR
    
    DID --> BLOCKCHAIN
    VC --> IPFS
    AUTH --> HSM
\`\`\`

### 1.2 Technology Stack

| Component | Technology | Standard | Purpose |
|-----------|-----------|----------|---------|
| DID Method | did:web, did:key | W3C DID Core 1.0 | Decentralized identifiers |
| Verifiable Credentials | JSON-LD, JWT | W3C VC Data Model 1.1 | Credential format |
| Signatures | Ed25519, ES256K | IETF RFC 8032 | Cryptographic signatures |
| Key Management | WebAuthn, FIDO2 | W3C WebAuthn | Secure key storage |
| Presentation Exchange | DIF PE v2.0 | DIF Spec | Credential requests |
| Selective Disclosure | BBS+ Signatures | W3C CCG | Privacy-preserving disclosure |
| Schema Registry | JSON Schema | JSON Schema 2020-12 | Credential schemas |
| Storage | Encrypted IPFS | IPFS + AES-256 | Decentralized storage |

---

## 2. Credential Lifecycle

### 2.1 Credential Issuance Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Wallet
    participant Issuer
    participant Registry
    participant Blockchain
    
    User->>Wallet: Request Credential
    Wallet->>Issuer: Initiate Issuance
    
    Issuer->>User: Request Identity Proof
    User->>Issuer: Provide KYC Documents
    
    Issuer->>Issuer: Verify Identity
    Issuer->>Issuer: Generate VC
    
    Issuer->>Registry: Register VC Schema
    Registry-->>Issuer: Schema ID
    
    Issuer->>Issuer: Sign VC with Private Key
    Issuer->>Blockchain: Record VC Hash
    Blockchain-->>Issuer: Transaction ID
    
    Issuer->>Wallet: Issue Verifiable Credential
    Wallet->>Wallet: Encrypt & Store VC
    Wallet-->>User: Credential Stored
\`\`\`

### 2.2 Credential Verification Flow

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Wallet
    participant Verifier
    participant Registry
    participant Blockchain
    
    Verifier->>User: Request Credential Presentation
    User->>Wallet: Approve Sharing
    
    Wallet->>Wallet: Select Credentials
    Wallet->>Wallet: Apply Selective Disclosure
    Wallet->>Wallet: Create Verifiable Presentation
    Wallet->>Wallet: Sign with User DID
    
    Wallet->>Verifier: Send VP
    
    Verifier->>Registry: Resolve Issuer DID
    Registry-->>Verifier: Issuer Public Key
    
    Verifier->>Blockchain: Verify VC Hash
    Blockchain-->>Verifier: Valid/Invalid
    
    Verifier->>Verifier: Check Revocation Status
    Verifier->>Verifier: Verify Signatures
    Verifier->>Verifier: Validate Schema
    
    Verifier-->>User: Access Granted/Denied
\`\`\`

### 2.3 Credential Lifecycle States

\`\`\`mermaid
stateDiagram-v2
    [*] --> Requested
    Requested --> Pending_Verification: Submit Documents
    Pending_Verification --> Issued: Approved
    Pending_Verification --> Rejected: Denied
    
    Issued --> Active: Stored in Wallet
    Active --> Presented: Shared with Verifier
    Presented --> Active: Presentation Complete
    
    Active --> Expired: Expiry Date Reached
    Active --> Revoked: Issuer Revocation
    Active --> Suspended: Temporary Hold
    
    Suspended --> Active: Reactivated
    Expired --> Renewed: Renewal Process
    Renewed --> Active
    
    Rejected --> [*]
    Revoked --> [*]
    Expired --> [*]
\`\`\`

---

## 3. Credential Types

### 3.1 Supported Credential Schemas

| Credential Type | Issuer Type | Validity Period | Revocable | Selective Disclosure | Use Cases |
|----------------|-------------|-----------------|-----------|---------------------|-----------|
| Government ID | Government | 10 years | Yes | Yes | Identity verification, age proof |
| Bank Account | Financial Institution | Ongoing | Yes | Yes | Payment verification, credit checks |
| KYC/AML Certification | KYC Provider | 1 year | Yes | Yes | Compliance, onboarding |
| Employment | Employer | Ongoing | Yes | Yes | Income verification, background checks |
| Education | University | Permanent | No | Yes | Degree verification, qualifications |
| Professional License | Licensing Body | 1-5 years | Yes | Yes | Professional verification |
| Credit Score | Credit Bureau | 30 days | Yes | Yes | Creditworthiness proof |
| Insurance Policy | Insurance Company | Policy term | Yes | No | Coverage verification |
| LEI Certificate | GLEIF | 1 year | Yes | No | Entity identification |
| Vaccination Record | Healthcare Provider | Permanent | No | Yes | Health verification |

### 3.2 Credential Schema Example

\`\`\`json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://ftsmoney.com/credentials/v1"
  ],
  "type": ["VerifiableCredential", "BankAccountCredential"],
  "issuer": "did:web:ftsmoney.com",
  "issuanceDate": "2026-01-07T00:00:00Z",
  "expirationDate": "2027-01-07T00:00:00Z",
  "credentialSubject": {
    "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
    "accountHolder": {
      "name": "John Doe",
      "dateOfBirth": "1990-01-01",
      "nationality": "US"
    },
    "bankAccount": {
      "accountNumber": "****1234",
      "accountType": "checking",
      "bankName": "FTS Bank",
      "iban": "DE89****1234",
      "accountStatus": "active",
      "openedDate": "2020-05-15"
    },
    "kycLevel": "enhanced",
    "amlVerified": true,
    "pepScreening": "passed"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-01-07T00:00:00Z",
    "verificationMethod": "did:web:ftsmoney.com#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5VKqxB..."
  }
}
\`\`\`

---

## 4. Decentralized Identifiers (DIDs)

### 4.1 DID Methods Supported

| DID Method | Format | Resolution | Security | Use Case |
|------------|--------|------------|----------|----------|
| did:web | did:web:domain.com | HTTPS | Domain control | Organizations, services |
| did:key | did:key:z6Mk... | Local | Public key only | Simple authentication |
| did:ethr | did:ethr:0x123... | Ethereum blockchain | On-chain | Decentralized apps |
| did:ion | did:ion:EiD3... | Bitcoin + IPFS | Anchored | High security needs |
| did:pkh | did:pkh:eip155:1:0x... | Blockchain address | Wallet-based | Crypto wallets |

### 4.2 DID Document Structure

\`\`\`json
{
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/ed25519-2020/v1"
  ],
  "id": "did:web:ftsmoney.com",
  "controller": "did:web:ftsmoney.com",
  "verificationMethod": [
    {
      "id": "did:web:ftsmoney.com#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:web:ftsmoney.com",
      "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
    },
    {
      "id": "did:web:ftsmoney.com#key-2",
      "type": "EcdsaSecp256k1VerificationKey2019",
      "controller": "did:web:ftsmoney.com",
      "publicKeyJwk": {
        "kty": "EC",
        "crv": "secp256k1",
        "x": "...",
        "y": "..."
      }
    }
  ],
  "authentication": [
    "did:web:ftsmoney.com#key-1"
  ],
  "assertionMethod": [
    "did:web:ftsmoney.com#key-1",
    "did:web:ftsmoney.com#key-2"
  ],
  "keyAgreement": [
    {
      "id": "did:web:ftsmoney.com#key-3",
      "type": "X25519KeyAgreementKey2020",
      "controller": "did:web:ftsmoney.com",
      "publicKeyMultibase": "z6LSbysY2xFMRpGMhb7tFTLMpeuPRaqaWM1yECx2AtzE3KCc"
    }
  ],
  "service": [
    {
      "id": "did:web:ftsmoney.com#credentials",
      "type": "CredentialRegistry",
      "serviceEndpoint": "https://ftsmoney.com/credentials"
    }
  ]
}
\`\`\`

### 4.3 DID Resolution Process

\`\`\`mermaid
graph TD
    A[DID String] --> B{Parse DID}
    B --> C{Method?}
    
    C -->|did:web| D[HTTPS Resolution]
    C -->|did:key| E[Local Derivation]
    C -->|did:ethr| F[Ethereum Query]
    C -->|did:ion| G[ION Resolution]
    
    D --> H[Fetch .well-known/did.json]
    E --> I[Derive from Public Key]
    F --> J[Query Smart Contract]
    G --> K[Query ION Network]
    
    H --> L[Validate DID Document]
    I --> L
    J --> L
    K --> L
    
    L --> M{Valid?}
    M -->|Yes| N[Return DID Document]
    M -->|No| O[Return Error]
\`\`\`

---

## 5. Selective Disclosure

### 5.1 Privacy-Preserving Techniques

\`\`\`mermaid
graph TB
    A[Full Credential] --> B[Selective Disclosure Request]
    
    B --> C[BBS+ Signatures]
    B --> D[Zero-Knowledge Proofs]
    B --> E[Hash-Based Disclosure]
    
    C --> F[Reveal Subset of Claims]
    D --> G[Prove Property Without Revealing Value]
    E --> H[Reveal Hash of Claim]
    
    F --> I[Verifiable Presentation]
    G --> I
    H --> I
    
    I --> J[Verifier]
    J --> K{Verify Proof}
    K -->|Valid| L[Accept]
    K -->|Invalid| M[Reject]
\`\`\`

### 5.2 Disclosure Scenarios

| Scenario | Full Data | Disclosed Data | Technique | Privacy Level |
|----------|-----------|----------------|-----------|---------------|
| Age Verification | Date of Birth: 1990-05-15 | Over 18: Yes | ZK Proof | High |
| Income Verification | Salary: $85,000 | Salary Range: $50k-$100k | Range Proof | Medium |
| Address Verification | Full Address | City & Country Only | Selective Fields | Medium |
| Account Balance | Balance: $15,432.67 | Balance > $10k: Yes | Threshold Proof | High |
| Credit Score | Score: 750 | Score Category: Excellent | Categorical | Medium |
| Employment Status | Company & Role | Employed: Yes | Boolean Proof | High |
| Education Level | Degree: MBA, Stanford | Has Graduate Degree: Yes | Credential Type | High |

### 5.3 Selective Disclosure Implementation

\`\`\`json
{
  "@context": ["https://www.w3.org/2018/credentials/v1"],
  "type": ["VerifiablePresentation"],
  "holder": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
  "verifiableCredential": [
    {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiableCredential", "BankAccountCredential"],
      "issuer": "did:web:ftsmoney.com",
      "credentialSubject": {
        "id": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK",
        "accountHolder": {
          "name": "DISCLOSED",
          "dateOfBirth": "HIDDEN",
          "nationality": "DISCLOSED"
        },
        "bankAccount": {
          "accountNumber": "HIDDEN",
          "accountType": "DISCLOSED",
          "bankName": "DISCLOSED",
          "accountStatus": "DISCLOSED"
        },
        "kycLevel": "DISCLOSED",
        "amlVerified": "DISCLOSED"
      },
      "proof": {
        "type": "BbsBlsSignature2020",
        "proofValue": "...",
        "revealedAttributes": ["name", "nationality", "accountType", "bankName", "accountStatus", "kycLevel", "amlVerified"]
      }
    }
  ],
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-01-07T12:00:00Z",
    "verificationMethod": "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#key-1",
    "proofPurpose": "authentication",
    "challenge": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "proofValue": "..."
  }
}
\`\`\`

---

## 6. Passwordless Authentication

### 6.1 WebAuthn/FIDO2 Integration

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Authenticator
    participant Server
    participant DID_Registry
    
    User->>Browser: Click "Sign In"
    Browser->>Server: Request Challenge
    Server->>Server: Generate Challenge
    Server-->>Browser: Challenge + Options
    
    Browser->>Authenticator: Prompt for Authentication
    Authenticator->>User: Biometric/PIN Request
    User->>Authenticator: Provide Biometric/PIN
    
    Authenticator->>Authenticator: Sign Challenge
    Authenticator-->>Browser: Signed Assertion
    
    Browser->>Server: Send Assertion
    Server->>DID_Registry: Resolve User DID
    DID_Registry-->>Server: Public Key
    
    Server->>Server: Verify Signature
    Server->>Server: Validate Challenge
    
    Server-->>Browser: Authentication Success + Session Token
    Browser-->>User: Logged In
\`\`\`

### 6.2 Authentication Methods Comparison

| Method | Security Level | User Experience | Recovery | Device Binding | Standards |
|--------|---------------|-----------------|----------|----------------|-----------|
| Biometric (Face/Touch) | High | Excellent | Device-dependent | Yes | FIDO2, WebAuthn |
| Hardware Security Key | Very High | Good | Key-based | Yes | FIDO U2F, FIDO2 |
| Platform Authenticator | High | Excellent | Device-dependent | Yes | WebAuthn |
| PIN + Device | Medium-High | Good | PIN recovery | Yes | FIDO2 |
| Email Magic Link | Medium | Good | Email access | No | Custom |
| SMS OTP | Low-Medium | Fair | Phone access | No | Legacy |
| Password | Low | Fair | Password reset | No | Legacy |

### 6.3 Multi-Device Sync Architecture

\`\`\`mermaid
graph TB
    subgraph "Primary Device"
        D1[Device 1]
        K1[Private Key]
        W1[Wallet Data]
    end
    
    subgraph "Backup Device"
        D2[Device 2]
        K2[Private Key Copy]
        W2[Wallet Sync]
    end
    
    subgraph "Recovery Service"
        CLOUD[Encrypted Cloud Backup]
        SHARD[Shamir Secret Sharing]
        SOCIAL[Social Recovery]
    end
    
    K1 --> CLOUD
    W1 --> CLOUD
    
    CLOUD --> K2
    CLOUD --> W2
    
    K1 --> SHARD
    SHARD --> SOCIAL
    SOCIAL --> K2
\`\`\`

---

## 7. Revocation & Status Management

### 7.1 Revocation Methods

| Method | Check Frequency | Privacy | Performance | Standard |
|--------|----------------|---------|-------------|----------|
| Revocation List 2020 | On verification | Low | Good | W3C VC |
| Status List 2021 | On verification | Medium | Excellent | W3C CCG |
| Blockchain-based | On verification | High | Fair | Custom |
| OCSP-style | Real-time | Low | Good | RFC 6960 |
| Accumulator-based | On verification | High | Good | Research |

### 7.2 Status List Architecture

\`\`\`mermaid
graph TD
    A[Credential Issued] --> B[Assign Index in Status List]
    B --> C[Publish Status List]
    
    C --> D[Verifier Checks Credential]
    D --> E[Fetch Status List]
    E --> F[Check Index Bit]
    
    F --> G{Bit = 0?}
    G -->|Yes| H[Credential Valid]
    G -->|No| I[Credential Revoked]
    
    J[Issuer Revokes Credential] --> K[Set Bit to 1]
    K --> L[Update Status List]
    L --> M[Publish Updated List]
    
    M --> E
\`\`\`

### 7.3 Revocation Status Response

\`\`\`json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://w3id.org/vc/status-list/2021/v1"
  ],
  "id": "https://ftsmoney.com/credentials/status/1",
  "type": ["VerifiableCredential", "StatusList2021Credential"],
  "issuer": "did:web:ftsmoney.com",
  "issuanceDate": "2026-01-07T00:00:00Z",
  "credentialSubject": {
    "id": "https://ftsmoney.com/credentials/status/1#list",
    "type": "StatusList2021",
    "statusPurpose": "revocation",
    "encodedList": "H4sIAAAAAAAAA..."
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-01-07T00:00:00Z",
    "verificationMethod": "did:web:ftsmoney.com#key-1",
    "proofPurpose": "assertionMethod",
    "proofValue": "z5VKqxB..."
  }
}
\`\`\`

---

## 8. Use Cases

### 8.1 Financial Services Use Cases

| Use Case | Credentials Required | Benefits | Implementation Complexity |
|----------|---------------------|----------|---------------------------|
| Instant KYC Onboarding | Government ID, Address Proof | 95% time reduction | Medium |
| Cross-Border Payments | LEI, Bank Account, AML Cert | Instant verification | High |
| Credit Application | Income, Employment, Credit Score | Same-day approval | Medium |
| Account Opening | Identity, Address, Tax ID | Paperless process | Low |
| Loan Underwriting | Income, Assets, Credit History | Automated decisions | High |
| Compliance Reporting | KYC, AML, PEP Screening | Real-time compliance | Medium |
| Merchant Onboarding | Business License, Tax ID, Bank Account | 24-hour setup | Medium |
| Age Verification | Government ID (selective disclosure) | Privacy-preserving | Low |

### 8.2 KYC Onboarding Flow

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant Bank
    participant ID_Issuer
    participant KYC_Provider
    participant Wallet
    
    Customer->>Bank: Apply for Account
    Bank->>Customer: Request KYC Credentials
    
    Customer->>Wallet: Check Available Credentials
    
    alt Has Valid Credentials
        Wallet->>Wallet: Create Presentation
        Wallet->>Bank: Submit VP
        Bank->>ID_Issuer: Verify Signature
        Bank->>KYC_Provider: Check Revocation
        Bank->>Bank: Validate Data
        Bank->>Customer: Account Approved (Instant)
    else No Valid Credentials
        Customer->>ID_Issuer: Request ID Credential
        ID_Issuer->>Customer: Issue VC
        Customer->>Wallet: Store VC
        Wallet->>Bank: Submit VP
        Bank->>Customer: Account Approved
    end
\`\`\`

### 8.3 Enterprise Use Cases

| Use Case | Industry | Credentials | ROI |
|----------|----------|-------------|-----|
| Employee Onboarding | All | Employment History, Background Check | 70% time reduction |
| Supply Chain Verification | Manufacturing | Certifications, Quality Standards | 50% fraud reduction |
| Healthcare Records | Healthcare | Medical Records, Insurance | Instant access |
| Educational Credentials | Education | Degrees, Transcripts | 90% verification cost reduction |
| Professional Licensing | Government | Licenses, Certifications | Real-time verification |
| Travel Documents | Travel | Passport, Visa, Vaccination | Contactless verification |
| Digital Rights Management | Media | Ownership, Access Rights | Automated enforcement |

---

## 9. Security & Privacy

### 9.1 Security Layers

\`\`\`mermaid
graph TB
    A[Security Architecture] --> B[Cryptographic Layer]
    A --> C[Network Layer]
    A --> D[Application Layer]
    A --> E[Physical Layer]
    
    B --> B1[Ed25519 Signatures]
    B --> B2[AES-256 Encryption]
    B --> B3[BBS+ Selective Disclosure]
    B --> B4[Secure Key Derivation]
    
    C --> C1[TLS 1.3]
    C --> C2[Certificate Pinning]
    C --> C3[DDoS Protection]
    
    D --> D1[Input Validation]
    D --> D2[Access Control]
    D --> D3[Audit Logging]
    D --> D4[Rate Limiting]
    
    E --> E1[Hardware Security Module]
    E --> E2[Secure Enclave]
    E --> E3[Tamper Detection]
\`\`\`

### 9.2 Threat Model & Mitigations

| Threat | Impact | Probability | Mitigation | Residual Risk |
|--------|--------|-------------|------------|---------------|
| Private Key Theft | Critical | Low | HSM, Biometric Auth, Key Splitting | Low |
| Credential Forgery | Critical | Low | Cryptographic Signatures, Blockchain Anchoring | Very Low |
| Man-in-the-Middle | High | Medium | TLS 1.3, Certificate Pinning | Low |
| Phishing | High | High | Domain Verification, Challenge-Response | Medium |
| Replay Attacks | Medium | Medium | Nonce, Timestamp Validation | Low |
| Issuer Compromise | Critical | Very Low | Revocation, Multi-Sig | Low |
| Verifier Collusion | Medium | Low | Selective Disclosure, ZKP | Low |
| Device Loss | Medium | High | Biometric Lock, Remote Wipe | Low |

### 9.3 Privacy Principles

| Principle | Implementation | Compliance |
|-----------|---------------|------------|
| Data Minimization | Selective Disclosure, ZKP | GDPR Article 5 |
| Purpose Limitation | Credential-specific | GDPR Article 5 |
| Storage Limitation | User-controlled storage | GDPR Article 5 |
| Consent | Explicit approval for sharing | GDPR Article 7 |
| Right to Erasure | Revocation + Key Destruction | GDPR Article 17 |
| Transparency | Audit logs, Disclosure receipts | GDPR Article 12 |
| Security | Encryption, Access control | GDPR Article 32 |

---

## 10. Standards Compliance

### 10.1 W3C Standards

| Standard | Version | Status | Implementation |
|----------|---------|--------|----------------|
| Verifiable Credentials Data Model | 1.1 | Recommendation | Full |
| Decentralized Identifiers (DIDs) | 1.0 | Recommendation | Full |
| DID Specification Registries | - | Note | Full |
| Verifiable Credentials JSON Schema | - | Draft | Partial |
| VC Data Integrity | 1.0 | Draft | Full |

### 10.2 DIF Standards

| Standard | Purpose | Implementation |
|----------|---------|----------------|
| Presentation Exchange v2.0 | Credential request protocol | Full |
| Credential Manifest | Issuance protocol | Planned |
| DID Resolution | DID document retrieval | Full |
| Universal Resolver | Multi-method DID resolution | Integrated |
| Trust Establishment | Trust framework | Partial |

### 10.3 Compliance Mapping

\`\`\`mermaid
graph TD
    A[FTS Digital Identity] --> B[W3C VC 1.1]
    A --> C[W3C DID 1.0]
    A --> D[DIF PE 2.0]
    A --> E[FIDO2/WebAuthn]
    A --> F[GDPR]
    A --> G[eIDAS]
    A --> H[NIST 800-63-3]
    
    B --> I[Full Compliance]
    C --> I
    D --> I
    E --> I
    
    F --> J[Privacy by Design]
    G --> J
    
    H --> K[Identity Assurance Level 2]
\`\`\`

---

## 11. Integration Guide

### 11.1 Issuer Integration

**Step 1: Setup DID**
\`\`\`javascript
import { createDID } from '@fts/identity-sdk';

const issuerDID = await createDID({
  method: 'web',
  domain: 'yourcompany.com'
});
\`\`\`

**Step 2: Define Schema**
\`\`\`javascript
const credentialSchema = {
  type: 'EmployeeCredential',
  properties: {
    employeeId: { type: 'string' },
    department: { type: 'string' },
    position: { type: 'string' },
    hireDate: { type: 'string', format: 'date' }
  },
  required: ['employeeId', 'department']
};
\`\`\`

**Step 3: Issue Credential**
\`\`\`javascript
import { issueCredential } from '@fts/identity-sdk';

const credential = await issueCredential({
  issuer: issuerDID,
  holder: userDID,
  type: ['VerifiableCredential', 'EmployeeCredential'],
  credentialSubject: {
    employeeId: 'EMP12345',
    department: 'Engineering',
    position: 'Senior Developer',
    hireDate: '2025-01-15'
  },
  expirationDate: '2026-01-15T00:00:00Z'
});
\`\`\`

### 11.2 Verifier Integration

**Step 1: Create Presentation Request**
\`\`\`javascript
import { createPresentationRequest } from '@fts/identity-sdk';

const presentationRequest = createPresentationRequest({
  purpose: 'Employment Verification',
  credentials: [
    {
      type: 'EmployeeCredential',
      constraints: {
        fields: [
          { path: ['credentialSubject.department'] },
          { path: ['credentialSubject.position'] }
        ]
      }
    }
  ]
});
\`\`\`

**Step 2: Verify Presentation**
\`\`\`javascript
import { verifyPresentation } from '@fts/identity-sdk';

const verification = await verifyPresentation({
  presentation: receivedPresentation,
  challenge: originalChallenge,
  checkRevocation: true
});

if (verification.verified) {
  const department = verification.credentials[0].credentialSubject.department;
  // Grant access
}
\`\`\`

### 11.3 API Endpoints

| Endpoint | Method | Purpose | Authentication |
|----------|--------|---------|----------------|
| /api/v1/credentials/issue | POST | Issue new credential | OAuth 2.0 |
| /api/v1/credentials/verify | POST | Verify presentation | API Key |
| /api/v1/credentials/revoke | POST | Revoke credential | OAuth 2.0 |
| /api/v1/credentials/status | GET | Check credential status | None |
| /api/v1/dids/resolve | GET | Resolve DID document | None |
| /api/v1/schemas | GET | List credential schemas | None |
| /api/v1/presentations/request | POST | Request presentation | API Key |

---

## 12. Performance Metrics

### 12.1 System Performance

| Operation | Latency (p50) | Latency (p99) | Throughput | SLA |
|-----------|--------------|--------------|------------|-----|
| Credential Issuance | 150ms | 500ms | 1000/sec | 99.9% |
| Credential Verification | 80ms | 200ms | 5000/sec | 99.95% |
| DID Resolution | 50ms | 150ms | 10000/sec | 99.99% |
| Revocation Check | 30ms | 100ms | 20000/sec | 99.99% |
| Presentation Creation | 100ms | 300ms | 2000/sec | 99.9% |
| Signature Generation | 10ms | 30ms | 50000/sec | 99.99% |
| Signature Verification | 8ms | 25ms | 60000/sec | 99.99% |

### 12.2 Scalability Metrics

\`\`\`mermaid
graph LR
    A[Load] --> B[10 req/sec]
    A --> C[100 req/sec]
    A --> D[1000 req/sec]
    A --> E[10000 req/sec]
    
    B --> F[1 Instance]
    C --> F
    D --> G[3 Instances]
    E --> H[10 Instances]
    
    F --> I[Response Time: 50ms]
    G --> J[Response Time: 80ms]
    H --> K[Response Time: 120ms]
\`\`\`

---

## 13. Future Roadmap

### Planned Features (2026-2027)

| Feature | Timeline | Description | Standards |
|---------|----------|-------------|-----------|
| Biometric Templates | Q1 2026 | Store biometric data as VCs | ISO/IEC 24745 |
| Cross-Chain DIDs | Q2 2026 | Multi-blockchain DID support | DIF Sidetree |
| Verifiable Presentations 2.0 | Q2 2026 | Enhanced presentation features | W3C VP 2.0 |
| Credential Refresh Protocol | Q3 2026 | Automatic credential renewal | DIF Refresh |
| Delegated Credentials | Q3 2026 | Credential delegation | Custom |
| Mobile Driver's License | Q4 2026 | ISO 18013-5 mDL integration | ISO 18013-5 |
| Decentralized Key Management | Q1 2027 | Threshold signatures | MPC |
| Verifiable Organizations | Q2 2027 | Organization credentials | W3C VO |

---

## Conclusion

The FTS.Money Digital Identity System provides a standards-compliant, secure, and privacy-preserving platform for verifiable credentials and decentralized identity management. Through support for W3C VCs, DIDs, selective disclosure, and passwordless authentication, organizations can implement next-generation identity solutions that give users control while maintaining security and regulatory compliance.

**Key Benefits**:
- User-controlled identity and credentials
- Privacy-preserving selective disclosure
- Passwordless authentication with FIDO2/WebAuthn
- Cryptographic verification without central authority
- Instant credential verification
- Cross-industry interoperability
- Regulatory compliance (GDPR, eIDAS, NIST)
- Reduced onboarding time by 95%

For implementation support and integration guidance, contact the FTS.Money identity team.

---

**Document Information**
- **Version:** 2.0
- **Last Updated:** January 11, 2026
- **Owner:** Identity Team
- **Contact:** identity@fts.money

© 2026 FTS.Money. All rights reserved.
`;