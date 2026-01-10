const AuthenticationArchitectureDoc = `# Authentication Architecture - Complete Technical Guide
## Multi-Portal Identity & Access Management

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Internal - Technical Documentation  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Authentication Systems Overview](#authentication-systems-overview)
3. [Session Management](#session-management)
4. [Password Security](#password-security)
5. [Future: vLEI Authentication](#future-vlei-authentication)
6. [Security Best Practices](#security-best-practices)

---

## Executive Summary

### Multi-Portal Authentication Challenge

FTS.Money operates **10+ distinct portals**, each serving different user types with unique authentication requirements:

\`\`\`mermaid
graph TB
    subgraph "Platform Administration"
        AUTH1[Platform Admin Auth<br/>platformAuthSimple]
    end
    
    subgraph "Community & Services"
        AUTH2[Community Portal Auth<br/>communityAuth]
        AUTH3[PSP Staff Auth<br/>pspAuth]
        AUTH4[Merchant Auth<br/>merchantAuth]
        AUTH5[Virtual Terminal Auth<br/>vtAuth]
    end
    
    subgraph "Service Portals"
        AUTH6[ISO Gateway Auth<br/>isoGatewayAuth]
        AUTH7[Orchestration Auth<br/>orchestrationAuth]
        AUTH8[Crypto Gateway Auth<br/>cryptoGatewayAuth]
    end
    
    subgraph "RWA Platform"
        AUTH9[RWA Provider Auth<br/>rwaProviderAuth]
        AUTH10[Asset Issuer Auth<br/>assetIssuerAuth]
        AUTH11[Investor Auth<br/>Custom]
    end
    
    subgraph "Compliance"
        AUTH12[QSA Portal Auth<br/>qsaAuth]
    end
    
    style AUTH1 fill:#ef4444,color:#fff
    style AUTH2 fill:#3b82f6,color:#fff
    style AUTH6 fill:#10b981,color:#fff
    style AUTH9 fill:#8b5cf6,color:#fff
\`\`\`

---

## Authentication Systems Overview

### 1. Platform Admin Authentication

**Purpose:** FTS.Money internal staff access to platform control panel

\`\`\`javascript
// Backend: functions/platformAuthSimple.js
{
  entity: "AuthUser",
  session_key: "platform_admin_session",
  user_roles: ["super_admin", "platform_admin", "operations", "finance", "support", "viewer"],
  pages: ["FTSMoneyPlatform", "PSPProvisioning", "FTSRevenue", ...]
}
\`\`\`

**Login Flow:**
\`\`\`mermaid
sequenceDiagram
    participant Admin
    participant Login as PlatformAdminLogin
    participant Auth as platformAuthSimple
    participant DB as AuthUser Entity
    
    Admin->>Login: Enter email + password
    Login->>Auth: POST /platformAuthSimple
    
    Auth->>DB: Find AuthUser by email
    DB-->>Auth: User record
    
    Auth->>Auth: Verify bcrypt hash
    Auth->>Auth: Check is_active = true
    
    alt Valid Credentials
        Auth-->>Login: {success, user, role}
        Login->>Login: Store in localStorage
        Login->>Admin: Redirect to FTSMoneyPlatform
    else Invalid
        Auth-->>Login: {error: "Invalid credentials"}
        Login->>Admin: Show error message
    end
\`\`\`

---

### 2. Community Portal Authentication

**Purpose:** Community users (PSP operators, businesses) accessing self-service portal

\`\`\`javascript
{
  entity: "AppUser",
  session_key: "community_session",
  registration: "Self-service registration enabled",
  pages: ["CommunityPortalDashboard", "CommunityMarketplace", ...]
}
\`\`\`

---

### 3. PSP Staff Multi-User Authentication

**Purpose:** PSP employees accessing PSP operations portal

\`\`\`javascript
{
  entity: "AppUser (with psp_code + role)",
  session_key: "staff_session",
  multi_tenancy: "Isolated by psp_code",
  rbac: "6-tier role hierarchy",
  pages: ["Dashboard", "Merchants", "Transactions", ...]
}
\`\`\`

---

### 4. Merchant Portal Authentication

**Purpose:** Merchants accessing self-service portal

\`\`\`javascript
{
  entity: "Merchant",
  session_key: "merchantSession",
  auth_field: "merchant_code (not email)",
  pages: ["MerchantPortal", "MerchantTransactionList", ...]
}
\`\`\`

---

### 5. ISO Gateway User Authentication

**Purpose:** ISO Gateway customer users (multi-user per customer)

\`\`\`javascript
{
  entity: "ISOGatewayUser",
  session_key: "iso_gateway_session",
  multi_tenancy: "Isolated by customer_code",
  rbac: "6-tier permissions",
  pages: ["ISOGatewayCustomerPortal", "ISOMessageMonitor", ...]
}
\`\`\`

---

### 6. Orchestration User Authentication

**Purpose:** Orchestration customer users

\`\`\`javascript
{
  entity: "OrchestrationUser",
  session_key: "orchestration_session",
  multi_tenancy: "Isolated by customer_code",
  pages: ["OrchestrationPortal", ...]
}
\`\`\`

---

### 7. Crypto Gateway Authentication

**Purpose:** Crypto banking service customers

\`\`\`javascript
{
  entity: "CryptoGatewayCustomer",
  session_key: "crypto_gateway_session",
  special_auth: "Supports LEI/vLEI/TAS verification",
  identity_tiers: ["TAS ID", "LEI verified", "vLEI verified"],
  pages: ["CryptoGatewayDashboard", "CryptoWallets", ...]
}
\`\`\`

**Trust-Based Authentication:**
\`\`\`mermaid
graph LR
    BASIC[Basic Auth<br/>Email + Password] --> TAS[TAS ID<br/>Trust Anchor Service]
    TAS --> LEI[LEI Verified<br/>GLEIF API]
    LEI --> VLEI[vLEI Verified<br/>Digital Credential]
    
    BASIC -.->|Grace Period<br/>6 months| TAS
    TAS -.->|Recommended| LEI
    LEI -.->|Future| VLEI
    
    style BASIC fill:#ef4444,color:#fff
    style TAS fill:#f59e0b,color:#fff
    style LEI fill:#3b82f6,color:#fff
    style VLEI fill:#10b981,color:#fff
\`\`\`

---

### 8-11. RWA Platform Authentication

**Three Separate Portals:**

| Portal | Entity | Session Key | Auth Method |
|--------|--------|-------------|-------------|
| **RWA Provider** | RWAWhiteLabelCustomer | rwa_provider_session | Email + password + LEI |
| **Asset Issuer** | AssetIssuer | asset_issuer_session | Email + password + LEI |
| **Investor** | RWAInvestor | rwa_investor_session | Email + password + KYC tier |

---

### 12. QSA Portal Authentication

**Purpose:** External auditors conducting PCI assessments

\`\`\`javascript
{
  entity: "QSAUser",
  session_key: "qsa_session",
  access_scope: "Read-only to assigned PSP/merchant",
  audit_logging: "All actions logged immutably",
  pages: ["QSAPortalDashboard", ...]
}
\`\`\`

---

## Session Management

### Session Storage Strategy

\`\`\`javascript
// Session data structure (localStorage)
{
  "session_key": "platform_admin_session",
  "user_data": {
    "email": "admin@fts.money",
    "platform_role": "platform_admin",
    "full_name": "John Smith",
    "permissions": ["psp:create", "psp:read", ...]
  },
  "expires_at": "2026-01-10T18:30:00Z",
  "created_at": "2026-01-10T14:30:00Z"
}
\`\`\`

### Session Expiry Rules

| Portal | Idle Timeout | Absolute Timeout | Extend on Activity |
|--------|--------------|------------------|-------------------|
| Platform Admin | 30 min | 8 hours | ✅ |
| Community | 60 min | 24 hours | ✅ |
| PSP Staff | 30 min | 12 hours | ✅ |
| Merchant | 30 min | 12 hours | ✅ |
| ISO Gateway | 20 min | 8 hours | ✅ |
| Orchestration | 20 min | 8 hours | ✅ |
| Crypto Gateway | 15 min | 4 hours | ✅ |
| QSA Portal | 30 min | 8 hours | ❌ (security) |

---

## Password Security

### Password Policies

\`\`\`yaml
password_requirements:
  platform_admin:
    minimum_length: 14
    require_complexity: true
    expiry_days: 90
    history_count: 8
    
  psp_staff:
    minimum_length: 12
    require_complexity: true
    expiry_days: 90
    history_count: 4
    
  merchants:
    minimum_length: 10
    require_complexity: true
    expiry_days: 180
    history_count: 4
    
  qsa_users:
    minimum_length: 14
    require_complexity: true
    expiry_days: 60
    history_count: 12
\`\`\`

### Password Hashing

**Algorithm:** bcrypt with cost factor 12

\`\`\`javascript
import bcrypt from 'npm:bcryptjs';

// Hash password on registration
const salt = await bcrypt.genSalt(12);
const hash = await bcrypt.hash(password, salt);

// Verify on login
const isValid = await bcrypt.compare(password, storedHash);
\`\`\`

---

## Future: vLEI Authentication

### Passwordless vLEI Login (2026 Roadmap)

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal
    participant Wallet as Digital Identity Wallet
    participant GLEIF as GLEIF vLEI Registry
    participant Auth as Auth Backend
    
    User->>Portal: Click "Login with vLEI"
    Portal->>User: Display QR code
    
    User->>Wallet: Scan QR code
    Wallet->>Portal: Request challenge
    Portal->>Auth: Generate challenge
    Auth-->>Portal: Challenge nonce
    Portal-->>Wallet: Challenge
    
    Wallet->>Wallet: Sign challenge with vLEI private key
    Wallet->>Portal: Submit signed credential
    
    Portal->>GLEIF: Verify vLEI credential
    GLEIF-->>Portal: Credential valid
    
    Portal->>Auth: Verify signature
    Auth-->>Portal: Signature valid
    
    Portal->>Auth: Create session
    Auth-->>Portal: Session token
    
    Portal->>User: Logged in
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default AuthenticationArchitectureDoc;