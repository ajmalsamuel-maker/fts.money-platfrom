const CryptoBankingDoc = `# FTS.Money Crypto Banking Service
## Enterprise Crypto Banking Infrastructure

**Version:** 2.0  
**Classification:** Internal - Platform & Service Documentation  
**Last Updated:** January 11, 2026  
**Document Owner:** FTS.Money Platform Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Service Overview](#service-overview)
3. [Architecture & Distribution](#architecture--distribution)
4. [Core Features](#core-features)
5. [Customer Identity & Compliance](#customer-identity--compliance)
6. [Platform Administration](#platform-administration)
7. [Revenue Model](#revenue-model)
8. [White-Label Configuration](#white-label-configuration)
9. [Integration Guide](#integration-guide)
10. [Operations & Support](#operations--support)

---

## Executive Summary

The **FTS.Money Crypto Banking Service** is a comprehensive white-labeled enterprise crypto banking infrastructure built on Striga/Lightspark technology. It provides a full suite of crypto financial services including multi-chain wallets, virtual IBANs, card issuance, on/off-ramps, and integrated compliance with LEI/vLEI verification and KYB/KYC workflows.

### Key Value Propositions

- **Turnkey Infrastructure:** Launch crypto banking in weeks, not years
- **Regulatory Compliant:** VASP-licensed (EU), MiCA-ready
- **White-Label Ready:** Full branding customization
- **Dual Distribution:** PSP marketplace + direct enterprise

### Market Opportunity

\`\`\`mermaid
graph LR
    A[Traditional Banking] --> B[Crypto Banking Gap]
    B --> C[FTS.Money Solution]
    C --> D[Crypto Exchanges]
    C --> E[DeFi Platforms]
    C --> F[Wallet Providers]
    C --> G[PSP Marketplace]
    
    style C fill:#2563eb,color:#fff
\`\`\`

**Target Market Size:**
- Global crypto users: 580M (2024)
- Businesses needing crypto banking: 50K+
- Addressable market: $2B+ annually

---

## Service Overview

### Core Capabilities

\`\`\`mermaid
mindmap
  root((Crypto Banking))
    Multi-Chain Wallets
      BTC
      ETH
      USDC/USDT
      SOL
      Lightning Network
    Virtual IBANs
      SEPA Integration
      EUR Accounts
      Instant Creation
    Card Issuance
      Virtual Cards
      Physical Cards
      Apple/Google Pay
    On/Off Ramps
      Fiat to Crypto
      Crypto to Fiat
      Low Fees
    Compliance
      KYC/KYB
      AML Screening
      Travel Rule
      LEI/vLEI
\`\`\`

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **VASP Core** | Striga API | Licensed crypto infrastructure |
| **Lightning Network** | Lightspark | Fast Bitcoin payments |
| **Frontend** | FTS.Money Portal | Customer interface |
| **Compliance** | GLEIF, Chainalysis | Identity & AML |
| **Custody** | MPC Technology | Secure asset storage |

---

## Architecture & Distribution

### System Architecture

\`\`\`mermaid
graph TB
    subgraph "FTS.Money Crypto Banking Platform"
        CORE[Crypto Banking Core<br/>White-labeled Infrastructure]
        API[Striga API Layer<br/>VASP-Licensed]
        LN[Lightspark Network<br/>Lightning Protocol]
        COMP[Compliance Engine<br/>LEI/vLEI + KYB/KYC]
    end
    
    subgraph "Distribution Channel 1: PSP Marketplace"
        PSP[PSP Marketplace]
        PSPCAT[Service Catalog]
        PSPCUST[PSP Customer<br/>White-label Config]
    end
    
    subgraph "Distribution Channel 2: Direct Enterprise"
        PORTAL[Standalone Portal<br/>CryptoGatewayLogin]
        DIRECT[Direct Customers]
        EXCHANGE[Crypto Exchanges]
        DEFI[DeFi Platforms]
        WALLET[Wallet Providers]
    end
    
    subgraph "Services Provided"
        WALLETS[Multi-Chain Wallets<br/>BTC, ETH, USDC]
        IBAN[Virtual IBANs<br/>SEPA Accounts]
        CARDS[Card Issuance<br/>Virtual + Physical]
        RAMP[On/Off-Ramps<br/>Crypto ↔ Fiat]
        KYC[KYC/KYB Verification<br/>Automated + Manual]
    end
    
    CORE --> API
    CORE --> LN
    CORE --> COMP
    API --> WALLETS
    API --> IBAN
    API --> CARDS
    API --> RAMP
    COMP --> KYC
    
    CORE --> PSP
    CORE --> PORTAL
    PSP --> PSPCAT
    PSPCAT --> PSPCUST
    PORTAL --> DIRECT
    DIRECT --> EXCHANGE
    DIRECT --> DEFI
    DIRECT --> WALLET
    
    style CORE fill:#2563eb,color:#fff
    style COMP fill:#f59e0b,color:#fff
\`\`\`

### Distribution Channels

**Channel 1: PSP Marketplace**
- PSPs activate crypto banking for merchants
- White-label under PSP brand
- Revenue share model
- Managed via service catalog

**Channel 2: Direct Enterprise**
- Large crypto businesses
- Standalone branded portal
- Direct support & SLA
- Custom integration options

---

## Core Features

### Multi-Chain Wallets

**Supported Assets:**
- Bitcoin (BTC)
- Ethereum (ETH)
- USDC (Stablecoin)
- USDT (Tether)
- Solana (SOL)
- Lightning Network (instant BTC)

**Features:**
\`\`\`yaml
wallet_capabilities:
  creation: "Instant, on-demand"
  max_per_user: 10
  transaction_types:
    - deposit
    - withdrawal
    - internal_transfer
    - exchange
  security:
    - mpc_custody
    - multi_sig_options
    - cold_storage
  monitoring:
    - real_time_balance
    - transaction_history
    - price_alerts
\`\`\`

### Virtual IBANs

**SEPA Integration:**
\`\`\`
Account Type:        Virtual IBAN
Currency:            EUR
Network:             SEPA
Creation Time:       Instant
Max per Customer:    5 accounts
Incoming Transfers:  Free
Outgoing Transfers:  €0.50
Daily Limit:         €100,000
Monthly Limit:       €1,000,000
\`\`\`

**Use Cases:**
- Receive fiat payments
- Pay suppliers in EUR
- Multi-currency business operations
- Automated crypto-fiat conversion

### Card Issuance

\`\`\`mermaid
graph LR
    A[Customer Request] --> B{Card Type}
    B -->|Virtual| C[Instant Issuance]
    B -->|Physical| D[3-5 Day Delivery]
    C --> E[Apple/Google Pay]
    D --> F[PIN Activation]
    E --> G[Spending Ready]
    F --> G
    G --> H[Linked to Crypto Wallet]
\`\`\`

**Card Features:**
| Feature | Virtual Card | Physical Card |
|---------|-------------|---------------|
| Issuance Fee | $8 | $20 |
| Delivery Time | Instant | 3-5 days |
| Daily Limit | $10,000 | $10,000 |
| Monthly Limit | $100,000 | $100,000 |
| Apple/Google Pay | ✅ | ✅ |
| ATM Withdrawal | ❌ | ✅ ($2.50 + 2%) |
| Replacement | Free | $15 |

### On/Off Ramps

**Fiat → Crypto (On-Ramp):**
\`\`\`
Methods:
  - Bank Transfer (SEPA)
  - Card Payment (Visa/MC)
  - Wire Transfer
  
Processing Time:  Instant - 2 hours
Fee:             1.5% (min $5)
Limits:
  Daily:         $50,000
  Monthly:       $500,000
\`\`\`

**Crypto → Fiat (Off-Ramp):**
\`\`\`
Methods:
  - SEPA Transfer
  - Wire Transfer
  
Processing Time:  1-2 business days
Fee:             1.5% (min $5)
Limits:
  Daily:         $50,000
  Monthly:       $500,000
\`\`\`

---

## Customer Identity & Compliance

### Trust-Based Identity Framework

\`\`\`mermaid
graph TD
    A[New Customer] --> B{Credentials?}
    
    B -->|TAS ID| C[Trust Anchor Service]
    C --> C1[Instant Verification]
    C1 --> C2[✅ Full Access]
    
    B -->|LEI Only| D[Legal Entity Identifier]
    D --> D1[GLEIF Verification]
    D1 --> D2[KYB Required]
    D2 --> D3{KYB Result}
    D3 -->|Approved| D4[✅ Full Access]
    D3 -->|Rejected| D5[❌ Denied]
    
    B -->|Neither| E[Grace Period]
    E --> E1[3 Months Trial]
    E1 --> E2[Limited Services]
    E2 --> E3{Provided?}
    E3 -->|Yes| C1
    E3 -->|No - Day 90| E4[❌ Suspended]
    
    style C fill:#10b981,color:#fff
    style D fill:#f59e0b,color:#fff
    style E fill:#ef4444,color:#fff
\`\`\`

### Credential Types

**1. TAS ID (Trust Anchor Service) - Preferred**
- Highest trust level
- Instant verification
- No additional KYB required
- Format: \`TAS-XXXX-XXXX-XXXX\`

**2. LEI (Legal Entity Identifier) - Alternative**
- 20-character GLEIF code
- Requires full KYB verification
- GLEIF API integration
- Format: 20 alphanumeric characters

**3. vLEI (Verifiable LEI) - Advanced**
- Cryptographically signed credential
- Blockchain-agnostic
- W3C Verifiable Credentials standard
- Enhanced trust level

**4. Grace Period (90 Days)**
- For customers without credentials
- Limited service access
- Reminder notifications
- Must provide credentials before expiry

### Compliance Matrix

| Credential | KYB Required | Verification Time | Access Level | Best For |
|-----------|--------------|-------------------|--------------|----------|
| TAS ID | No | Instant | Full | Digital-native orgs |
| vLEI | No | Minutes | Full + Enhanced | Tech companies |
| LEI | Yes | 7-14 days | Full (post-KYB) | Traditional enterprises |
| None | After 90 days | N/A | Limited trial | Startups/testing |

### KYB/KYC Verification

**For LEI-Only Customers:**

\`\`\`yaml
kyb_requirements:
  company_documents:
    - certificate_of_incorporation
    - proof_of_address (<3 months)
    - bank_reference_letter
    - financial_statements (2 years)
    
  ownership_structure:
    - beneficial_owners (>25%)
    - directors_officers
    - ownership_chart
    
  compliance_checks:
    - aml_screening
    - sanctions_check
    - pep_verification
    - lei_validation_gleif
    
  timeline:
    submission: "Day 0"
    initial_review: "Day 1-3"
    compliance_checks: "Day 4-10"
    final_decision: "Day 11-14"
\`\`\`

---

## Platform Administration

### Customer Management

**Access:** Platform Admin → Crypto Banking → Customers

**Key Metrics:**
\`\`\`
Active Customers:        47
Pending KYB:            12
Total Volume (30d):     $18.4M
Average Balance:        $391K
\`\`\`

**Customer States:**
| Status | Description | Actions Available |
|--------|-------------|-------------------|
| Active | Full service access | View, Edit, Suspend |
| Pending | Awaiting verification | Review KYB, Approve/Reject |
| Suspended | Access restricted | Reinstate, Terminate |
| Grace Period | Trial mode (90 days) | Remind, Extend, Convert |

### Transaction Monitoring

**Real-Time Dashboard:**
\`\`\`
Last 24 Hours:
  Transactions:           1,247
  Volume:                 $847,392
  Avg Transaction:        $679
  
Compliance Flags:
  High Risk:              3 (0.24%)
  Manual Review:          8 (0.64%)
  Blocked:                1 (0.08%)
\`\`\`

**AML/CFT Monitoring:**
- Real-time transaction screening
- Sanctions list matching (OFAC, EU, UN)
- PEP (Politically Exposed Person) checks
- Travel Rule compliance (>$1000)
- Suspicious activity reporting

### Portal Configuration

**Branding:**
\`\`\`json
{
  "company_name": "FTS.Money Crypto Banking",
  "logo_url": "https://fts.money/crypto-logo.png",
  "primary_color": "#0066CC",
  "gradient": "linear-gradient(135deg, #003EFF 0%, #54F0E4 100%)"
}
\`\`\`

**Features Toggle:**
\`\`\`yaml
feature_flags:
  wallets:
    enabled: true
    supported_assets: ["BTC", "ETH", "USDC", "USDT", "SOL"]
  virtual_ibans:
    enabled: true
    max_per_customer: 5
  cards:
    virtual: true
    physical: true
  lightning_network:
    enabled: true
  api_access:
    enabled: true
    rate_limit: 1000 # requests/minute
\`\`\`

---

## Revenue Model

### Subscription Tiers

\`\`\`mermaid
graph LR
    A[Starter<br/>$2,500/mo] --> B[Professional<br/>$5,000/mo]
    B --> C[Enterprise<br/>$15,000/mo]
    
    A --> A1[100 users<br/>3 assets<br/>Email support]
    B --> B1[1,000 users<br/>10 assets<br/>Priority support]
    C --> C1[Unlimited<br/>All assets<br/>24/7 support]
\`\`\`

| Feature | Starter | Professional | Enterprise |
|---------|---------|--------------|------------|
| Monthly Fee | $2,500 | $5,000 | $15,000 |
| Included Users | 100 | 1,000 | Unlimited |
| Wallet Types | 3 assets | 10 assets | All supported |
| Virtual IBANs | 50 | 500 | Unlimited |
| Virtual Cards | 100 | 1,000 | Unlimited |
| Physical Cards | ❌ | ✅ | ✅ |
| Lightning Network | ❌ | ✅ | ✅ |
| White-Label Portal | ❌ | ❌ | ✅ |
| SLA | 99.5% | 99.9% | 99.99% |

### Usage-Based Fees

\`\`\`
Transactions:
  On-Ramp:               1.5% (min $5)
  Off-Ramp:              1.5% (min $5)
  Crypto Exchange:       0.5%
  IBAN Transfer Out:     €0.50
  Blockchain Transfer:   Network fee + $1
  
Verification:
  Basic KYC:             $5/user
  Enhanced KYC:          $15/user
  Business KYB:          $50/entity
  LEI Verification:      Free (GLEIF API)
  
Cards:
  Virtual Issuance:      $8
  Physical Issuance:     $20
  Replacement:           $15
  ATM Withdrawal:        $2.50 + 2%
  
Other:
  Failed Transaction:    $0.25
  Chargeback:            $50
  Custom Integration:    $10,000 setup
\`\`\`

### Revenue Breakdown Example

**Monthly Revenue (47 active customers):**
\`\`\`
Subscriptions:
  PSP Marketplace (32):    $80,000
  Direct Enterprise (15):  $37,500
  Total MRR:              $117,500
  
Usage Revenue (30 days):
  KYC Checks:             $12,450
  Card Fees:              $13,160
  Transaction Fees:       $18,750
  Other Services:         $4,200
  Total Usage:            $48,560
  
Total Monthly Revenue:    $166,060
Annual Run Rate:          $1,992,720
\`\`\`

**Cost Structure:**
\`\`\`
Striga Base Fees:         $70,500
Usage Pass-through:       $28,407
Infrastructure:           $8,000
Compliance:               $5,000
Support:                  $12,000
Total Costs:              $123,907

Gross Profit:             $42,153 (25% margin)
\`\`\`

---

## White-Label Configuration

### For PSP Customers

\`\`\`json
{
  "psp_id": "psp_abc123",
  "white_label_config": {
    "branding": {
      "company_name": "ABC Payments Crypto",
      "logo_url": "https://abc.com/crypto-logo.png",
      "primary_color": "#2563eb",
      "secondary_color": "#00bfff",
      "custom_domain": "crypto.abcpayments.com",
      "email_from": "crypto@abcpayments.com"
    },
    "features": {
      "wallets": ["BTC", "ETH", "USDC"],
      "cards": {
        "virtual": true,
        "physical": true,
        "card_design_url": "https://abc.com/card.png"
      },
      "kyc_provider": "internal",
      "compliance_level": "enhanced"
    },
    "pricing_passthrough": {
      "markup_percentage": 0.5,
      "hide_fts_branding": true
    },
    "webhooks": {
      "transaction_complete": "https://api.abc.com/webhooks/crypto",
      "kyc_verified": "https://api.abc.com/webhooks/kyc"
    }
  }
}
\`\`\`

### Deployment Options

**Option 1: Embedded in PSP Portal**
- Seamless integration
- Single sign-on
- Unified reporting
- Shared customer base

**Option 2: Standalone Portal**
- Separate subdomain
- Independent branding
- Dedicated support
- Custom features

---

## Integration Guide

### Striga API Integration

**Authentication:**
\`\`\`javascript
const strigaClient = require('@striga/sdk');

const client = new strigaClient({
  apiKey: process.env.STRIGA_API_KEY,
  apiSecret: process.env.STRIGA_API_SECRET,
  environment: 'production'
});
\`\`\`

**User Management:**
\`\`\`javascript
// Create user
const user = await client.users.create({
  email: 'customer@example.com',
  mobile: {
    countryCode: '+1',
    number: '5551234567'
  },
  KYC: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01'
  }
});

// Get user details
const userData = await client.users.get(userId);
\`\`\`

**Wallet Operations:**
\`\`\`javascript
// Create wallet
const wallet = await client.wallets.create({
  userId: userId,
  currency: 'BTC'
});

// Get balance
const balance = await client.wallets.getBalance(walletId);

// Initiate withdrawal
const withdrawal = await client.wallets.withdraw({
  walletId: walletId,
  amount: 0.01,
  destination: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
});
\`\`\`

**IBAN Management:**
\`\`\`javascript
// Create IBAN
const iban = await client.ibans.create({
  userId: userId
});

// Get IBAN details
const ibanData = await client.ibans.get(ibanId);
\`\`\`

**Card Issuance:**
\`\`\`javascript
// Issue virtual card
const card = await client.cards.issue({
  userId: userId,
  type: 'VIRTUAL',
  linkedWalletId: walletId
});

// Issue physical card
const physicalCard = await client.cards.issue({
  userId: userId,
  type: 'PHYSICAL',
  linkedWalletId: walletId,
  shippingAddress: {
    street: '123 Main St',
    city: 'San Francisco',
    country: 'US',
    postalCode: '94102'
  }
});
\`\`\`

### FTS.Money SDK Integration

\`\`\`javascript
import { base44 } from '@/api/base44Client';

// Create crypto customer
const customer = await base44.asServiceRole.entities.CryptoGatewayCustomer.create({
  company_name: 'BitExchange Pro',
  company_type: 'exchange',
  email: 'admin@bitexchange.com',
  subscription_tier: 'professional',
  monthly_fee: 5000,
  supported_assets: ['BTC', 'ETH', 'USDC'],
  status: 'active'
});

// Verify LEI
const leiResult = await base44.functions.invoke('verifyLEI', {
  lei: customer.lei
});
\`\`\`

---

## Operations & Support

### Common Issues

**Issue 1: KYC/KYB Failure**

*Symptoms:* Customer stuck in verification

*Diagnosis:*
\`\`\`sql
SELECT 
  customer_id,
  company_name,
  kyb_status,
  lei_status,
  tas_status
FROM crypto_gateway_customers
WHERE kyb_status IN ('failed', 'in_progress')
ORDER BY created_date DESC;
\`\`\`

*Resolution:*
- Verify document quality
- Check LEI in GLEIF database
- Manual compliance review
- Request additional information

**Issue 2: Transaction Delays**

*Causes:*
- Blockchain confirmations (BTC: 10-60 min)
- SEPA processing (1-2 business days)
- AML screening holds
- Striga API rate limits

*Resolution:*
- Check blockchain explorer
- Verify SEPA batch times
- Review AML screening results
- Monitor API status page

**Issue 3: Card Activation**

*Requirements:*
- Enhanced KYC completed
- LEI or TAS verified
- Address verified
- Sufficient wallet balance

*Resolution:*
\`\`\`javascript
const canIssueCard = 
  customer.kyb_status === 'completed' &&
  (customer.lei_status === 'verified' || 
   customer.tas_status === 'verified') &&
  customer.address_verified === true;
\`\`\`

### Support Escalation

\`\`\`
Level 1 - Technical Support:
  Email: crypto-support@fts.money
  Response: 4 hours (business hours)
  
Level 2 - Striga Infrastructure:
  Email: support@striga.com
  Response: 1 hour (24/7)
  
Level 3 - Compliance Issues:
  Email: compliance@fts.money
  Response: Next business day
  
Emergency Hotline:
  Phone: +1-800-FTS-CRYPTO
  Available: 24/7
\`\`\`

---

## Conclusion

The FTS.Money Crypto Banking Service provides enterprise-grade crypto financial infrastructure with:

✅ Full regulatory compliance (VASP, MiCA)  
✅ White-label customization  
✅ Dual distribution (PSP + Direct)  
✅ Trust-based identity (LEI/vLEI/TAS)  
✅ Institutional custody & security  

**For More Information:**
- Technical Integration: docs.fts.money/crypto
- Admin Dashboard: platform.fts.money/crypto
- Support: crypto-support@fts.money

---

**Document Information**

- **Version:** 2.0
- **Last Updated:** January 11, 2026
- **Owner:** Platform Team
- **Contact:** platform-admin@fts.money

© 2026 FTS.Money. All rights reserved.`;

export default CryptoBankingDoc;