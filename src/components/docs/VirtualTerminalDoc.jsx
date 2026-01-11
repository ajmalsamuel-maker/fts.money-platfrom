export const VirtualTerminalDoc = `# Virtual Payment Terminal - Complete User Guide
## Web-Based Card-Not-Present Payment Processing

**Version:** 3.0  
**Classification:** Public - Merchant Operators  
**Last Updated:** January 11, 2026  
**Document Owner:** FTS.Money Merchant Success Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture & Technology](#architecture-technology)
3. [Authentication & Access Control](#authentication-access-control)
4. [Payment Processing Modes](#payment-processing-modes)
5. [Card Payment Processing](#card-payment-processing)
6. [Crypto Payment Processing](#crypto-payment-processing)
7. [Itemized Sales](#itemized-sales)
8. [Recurring Payments](#recurring-payments)
9. [Card-on-File Management](#card-on-file-management)
10. [Transaction Limits & Controls](#transaction-limits-controls)
11. [Receipt & Email Delivery](#receipt-email-delivery)
12. [Multi-Currency Support](#multi-currency-support)
13. [Security & PCI Compliance](#security-pci-compliance)
14. [Configuration Options](#configuration-options)
15. [User Journey Examples](#user-journey-examples)

---

## Executive Summary

### What is the Virtual Terminal?

The **Virtual Payment Terminal (VT)** is a web-based payment processing interface that enables merchants to manually enter and process credit card transactions without physical POS hardware. It's designed for **card-not-present (CNP)** scenarios including:

- **MOTO (Mail Order/Telephone Order)** - Customer calls to place order over phone
- **Back-office Processing** - Invoice payments, manual billing adjustments
- **Event Payments** - In-person payments at events without mobile terminals
- **B2B Transactions** - Processing corporate payment authorizations
- **Recurring Billing Setup** - Subscription and installment payment configuration

Unlike physical terminals that swipe/chip/tap cards, the Virtual Terminal requires manual entry of card details, making it perfect for remote sales, phone orders, and situations where a physical card isn't present.

### Key Capabilities

\`\`\`mermaid
graph TB
    subgraph "Virtual Terminal Core"
        VT[Virtual Terminal Portal]
    end
    
    subgraph "Payment Modes"
        M1[Quick Charge<br/>Single amount entry]
        M2[Crypto Payment<br/>Digital asset acceptance]
        M3[Itemized Sale<br/>Line-item invoicing]
        M4[Recurring Setup<br/>Subscription billing]
    end
    
    subgraph "Card Features"
        C1[Sale Transaction<br/>Immediate capture]
        C2[Auth-Only<br/>Pre-authorization]
        C3[Capture Auth<br/>Complete pre-auth]
        C4[Refund<br/>Full or partial]
        C5[Void<br/>Cancel same-day]
    end
    
    subgraph "Advanced Features"
        A1[Card-on-File<br/>Tokenized storage]
        A2[Multi-Currency<br/>ISO 4217 compliant]
        A3[Email Receipts<br/>Automated delivery]
        A4[Transaction Limits<br/>Daily caps]
    end
    
    subgraph "Security & Compliance"
        S1[PCI DSS Level 1<br/>Compliant]
        S2[Tokenization<br/>No raw card storage]
        S3[3D Secure<br/>Strong authentication]
        S4[Fraud Detection<br/>Real-time scoring]
    end
    
    VT --> M1
    VT --> M2
    VT --> M3
    VT --> M4
    
    M1 --> C1
    M1 --> C2
    M1 --> C3
    M1 --> C4
    M1 --> C5
    
    M1 --> A1
    M1 --> A2
    M1 --> A3
    M1 --> A4
    
    C1 --> S1
    C1 --> S2
    C1 --> S3
    C1 --> S4
    
    style VT fill:#3b82f6,color:#fff
    style M1 fill:#10b981,color:#fff
    style A1 fill:#f59e0b,color:#fff
    style S1 fill:#ef4444,color:#fff
\`\`\`

### Who Uses Virtual Terminal?

| User Role | Primary Use Case | Daily Volume | Access Level |
|-----------|------------------|--------------|--------------|
| **Sales Agent** | Phone order processing | 50-200 transactions | Operator (limited) |
| **Finance Team** | Invoice payment collection | 20-50 transactions | Manager (full access) |
| **Customer Support** | Refund processing, adjustments | 10-30 transactions | Operator (refund only) |
| **Business Owner** | Ad-hoc payments, special cases | 5-20 transactions | Admin (unlimited) |
| **Event Staff** | On-site registration payments | 100-500 transactions | Operator (capped) |

---

## Architecture & Technology

### System Architecture

\`\`\`mermaid
graph TB
    subgraph "Frontend - Virtual Terminal UI"
        UI[React Application]
        AUTH[Authentication Layer]
        FORM[Payment Form Components]
        VALID[Client-Side Validation]
    end
    
    subgraph "Backend Services"
        VT_AUTH[vtAuth Function<br/>Login & Session]
        PROCESS[processTransaction<br/>Payment processing]
        RECEIPT[generateReceiptPDF<br/>Receipt generation]
        EMAIL[SendEmail Integration<br/>Customer notifications]
    end
    
    subgraph "Payment Gateway"
        GATEWAY[Payment Processor API]
        TDS[3D Secure Engine]
        FRAUD[Fraud Detection]
        TOKEN[Tokenization Service]
    end
    
    subgraph "Data Storage"
        VT_DB[(VirtualTerminal<br/>Config & limits)]
        TXN_DB[(Transaction<br/>Payment records)]
        CARD_DB[(SavedCard<br/>Tokenized cards)]
        AUDIT_DB[(AuditLog<br/>Activity tracking)]
    end
    
    UI --> AUTH
    AUTH --> VT_AUTH
    UI --> FORM
    FORM --> VALID
    VALID --> PROCESS
    
    PROCESS --> GATEWAY
    GATEWAY --> TDS
    GATEWAY --> FRAUD
    GATEWAY --> TOKEN
    
    PROCESS --> TXN_DB
    PROCESS --> RECEIPT
    RECEIPT --> EMAIL
    
    TOKEN --> CARD_DB
    VT_AUTH --> VT_DB
    PROCESS --> AUDIT_DB
    
    style UI fill:#3b82f6,color:#fff
    style GATEWAY fill:#10b981,color:#fff
    style TXN_DB fill:#f59e0b,color:#fff
\`\`\`

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Frontend** | React | 18.2 | UI framework |
| **Form Management** | React Hook Form | 7.x | Form validation & state |
| **Payment Components** | Custom components | - | Card input, crypto forms |
| **Currency Handling** | ISO 4217 Registry | - | Standard currency codes |
| **Validation** | isoValidator utils | - | ISO compliance checks |
| **Icons** | Lucide React | 0.475 | UI icons |
| **Styling** | Tailwind + shadcn/ui | 3.x | Responsive design |
| **Backend** | Deno Functions | 2.x | Serverless processing |
| **Card Tokenization** | Payment Gateway | - | PCI-compliant tokenization |
| **Email** | Core.SendEmail | - | Receipt delivery |

### Component Structure

\`\`\`yaml
virtual_terminal_components:
  pages:
    - VirtualTerminal.js: "Standalone VT (direct access)"
    - MerchantVirtualTerminal.js: "Merchant portal integrated VT"
    
  components:
    - PaymentForm.jsx: "Card payment form with validation"
    - CryptoPaymentForm.jsx: "Cryptocurrency payment processing"
    - RecurringPaymentManager.jsx: "Subscription billing setup"
    - InvoiceGenerator.jsx: "Create itemized invoices"
    - InvoicePreview.jsx: "Preview/print invoices"
    - InvoiceTemplateManager.jsx: "Manage invoice templates"
    - PaymentLinkGenerator.jsx: "Create shareable payment links"
    - AIPaymentAgentManager.jsx: "AI-assisted transaction processing"
    
  utils:
    - iso4217.js: "Currency code validation (180+ currencies)"
    - isoValidator.js: "ISO standard compliance checks"
    - detectCardBrand: "Card network identification (Visa, MC, Amex, etc.)"
    
  backend_functions:
    - vtAuth: "VT user authentication + transaction processing"
    - processPayment: "Payment gateway integration"
    - generateReceiptPDF: "PDF receipt generation"
\`\`\`

---

## Authentication & Access Control

### Virtual Terminal Access Methods

\`\`\`mermaid
graph TB
    subgraph "Access Points"
        A1[Merchant Portal VT<br/>/MerchantVirtualTerminal]
        A2[Standalone VT<br/>/VirtualTerminal]
        A3[Direct Link<br/>From PSP admin]
    end
    
    subgraph "Authentication Methods"
        AUTH1[Merchant Portal Session<br/>Already logged in]
        AUTH2[VT Direct Login<br/>Separate credentials]
    end
    
    subgraph "Permission Validation"
        P1[Check VT Config Exists]
        P2[Verify VT Status Active]
        P3[Check Role Permissions]
        P4[Validate Daily Limits]
    end
    
    A1 --> AUTH1
    A2 --> AUTH2
    A3 --> AUTH2
    
    AUTH1 --> P1
    AUTH2 --> P1
    
    P1 --> P2
    P2 --> P3
    P3 --> P4
    
    P4 --> GRANT[✅ Access Granted]
    
    P1 -.-> DENY1[❌ VT Not Configured]
    P2 -.-> DENY2[❌ VT Inactive]
    P3 -.-> DENY3[❌ Role Not Allowed]
    
    style GRANT fill:#10b981,color:#fff
    style DENY1 fill:#ef4444,color:#fff
    style DENY2 fill:#ef4444,color:#fff
    style DENY3 fill:#ef4444,color:#fff
\`\`\`

### Role-Based Permissions

**VT User Roles & Capabilities:**

| Permission | Admin | Manager | Operator | Viewer |
|------------|-------|---------|----------|--------|
| **Process Sale** | ✅ Unlimited | ✅ Up to daily limit | ✅ Up to daily limit | ❌ |
| **Process Refund** | ✅ Any amount | ✅ Up to $1,000 | ⚠️ Requires approval | ❌ |
| **Void Transaction** | ✅ | ✅ | ✅ Same-day only | ❌ |
| **Auth-Only** | ✅ | ✅ | ✅ | ❌ |
| **Capture Auth** | ✅ | ✅ | ❌ | ❌ |
| **Itemized Sales** | ✅ | ✅ | ✅ If enabled | ❌ |
| **Recurring Setup** | ✅ | ✅ | ❌ | ❌ |
| **Card-on-File** | ✅ Create/Delete | ✅ Create only | ✅ Use only | ❌ |
| **View Transactions** | ✅ All | ✅ Own transactions | ✅ Own transactions | ✅ Own transactions |
| **Daily Limit** | Unlimited | $50,000 | $10,000 | $0 |
| **Per-Txn Limit** | $25,000 | $10,000 | $5,000 | $0 |

### Progressive Access Control

**New vs Experienced Merchant UI:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> FirstTimeUser
    FirstTimeUser --> BasicVT: KYB Not Complete
    BasicVT --> FullVT: KYB Approved
    
    state BasicVT {
        [*] --> QuickChargeOnly
        note right of QuickChargeOnly
            Limited to:
            - Quick charge mode
            - Max $500/transaction
            - Email receipts only
            - No itemized sales
            - No recurring billing
        end note
    }
    
    state FullVT {
        [*] --> AllFeatures
        AllFeatures --> QuickCharge
        AllFeatures --> Itemized
        AllFeatures --> Recurring
        AllFeatures --> CryptoPayments
        
        note right of AllFeatures
            Full access to:
            - All payment modes
            - Higher limits
            - Card-on-file
            - Advanced features
        end note
    }
\`\`\`

---

## Payment Processing Modes

### Mode Selection Interface

The Virtual Terminal offers **4 distinct payment modes**, each optimized for different transaction types:

\`\`\`mermaid
graph LR
    VT[Virtual Terminal] --> M1[💵 Quick Charge<br/>Simple amount entry]
    VT --> M2[₿ Crypto Payment<br/>Digital assets]
    VT --> M3[🛒 Itemized Sale<br/>Line-item invoice]
    VT --> M4[🔄 Recurring<br/>Subscription billing]
    
    M1 --> U1[Phone orders<br/>Simple payments]
    M2 --> U2[Cryptocurrency<br/>BTC, ETH, USDC]
    M3 --> U3[Retail sales<br/>Multiple products]
    M4 --> U4[Subscriptions<br/>Memberships]
    
    style M1 fill:#10b981,color:#fff
    style M2 fill:#f59e0b,color:#fff
    style M3 fill:#3b82f6,color:#fff
    style M4 fill:#8b5cf6,color:#fff
\`\`\`

**Mode Comparison:**

| Feature | Quick Charge | Crypto Payment | Itemized Sale | Recurring |
|---------|-------------|----------------|---------------|-----------|
| **Use Case** | Simple phone orders | Crypto acceptance | Multi-item invoices | Subscriptions |
| **Complexity** | Low | Medium | Medium | High |
| **Fields Required** | 5 (amount, card, email) | 4 (amount, crypto, wallet) | 10+ (items, quantities) | 8+ (frequency, dates) |
| **Processing Time** | <30 seconds | 5-30 minutes | 1-2 minutes | Initial + scheduled |
| **Receipt Type** | Simple | Blockchain confirmation | Detailed invoice | Series receipts |
| **Typical Amount** | $10-$1,000 | $100-$50,000 | $50-$5,000 | $9.99-$999/month |

---

## Card Payment Processing

### Quick Charge Mode - Step-by-Step

**Most Common Use Case: Process a Phone Order**

\`\`\`mermaid
sequenceDiagram
    actor Customer
    participant Operator as VT Operator
    participant VT as Virtual Terminal
    participant Validator as Input Validation
    participant Gateway as Payment Gateway
    participant Email as Email Service
    participant DB as Transaction DB
    
    Customer->>Operator: Calls with order
    Note over Customer,Operator: "I'd like to order<br/>the $99 product"
    
    Operator->>VT: Open Quick Charge mode
    VT->>VT: Display payment form
    
    Operator->>VT: Enter amount: $99.00
    Operator->>VT: Select currency: USD
    
    Customer->>Operator: Provides card details
    Note over Customer: Card: 4111 1111 1111 1111<br/>Exp: 12/27<br/>CVV: 123
    
    Operator->>VT: Enter card number
    Operator->>VT: Enter expiry (MM/YY)
    Operator->>VT: Enter CVV
    Operator->>VT: Enter cardholder name
    Operator->>VT: Enter customer email
    
    Operator->>VT: Click "Process Payment"
    
    VT->>Validator: Validate all fields
    Validator->>Validator: Check card number (Luhn)
    Validator->>Validator: Validate expiry (future date)
    Validator->>Validator: Check CVV (3-4 digits)
    Validator->>Validator: Validate currency (ISO 4217)
    
    alt Validation Passed
        Validator-->>VT: All fields valid
        VT->>Gateway: Submit payment
        
        Gateway->>Gateway: Detect card brand (Visa)
        Gateway->>Gateway: Route to processor
        Gateway->>Gateway: Process authorization
        
        alt Payment Approved
            Gateway-->>VT: ✅ Approved (Auth: ABC123)
            VT->>DB: Log transaction
            VT->>Email: Send receipt to customer
            Email-->>Customer: Email receipt received
            VT->>Operator: Show success dialog
        else Payment Declined
            Gateway-->>VT: ❌ Declined (Insufficient funds)
            VT->>DB: Log declined transaction
            VT->>Operator: Show decline reason
            Operator->>Customer: Card declined
        end
    else Validation Failed
        Validator-->>VT: Invalid card number
        VT->>Operator: Show validation error
        Operator->>Customer: Request correct card details
    end
\`\`\`

### Card Input Form - Field-by-Field

**Required Fields & Validation:**

\`\`\`javascript
// Payment form field validation
const cardPaymentFields = {
  // Amount Section
  amount: {
    type: 'number',
    required: true,
    min: 0.01,
    max: (vtConfig?.per_transaction_limit || 10000),
    step: 0.01,
    validation: (val) => val > 0 && val <= maxLimit,
    error_messages: {
      required: "Amount is required",
      min: "Amount must be greater than $0.00",
      max: \`Amount exceeds limit of $\${maxLimit.toLocaleString()}\`
    }
  },
  
  currency: {
    type: 'select',
    required: true,
    options: vtConfig?.allowed_currencies || ['USD', 'EUR', 'GBP'],
    default: 'USD',
    validation: (code) => validateCurrency(code).valid,
    error_messages: {
      invalid: "Invalid ISO 4217 currency code"
    }
  },
  
  // Card Details Section
  cardholderName: {
    type: 'text',
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-Z\\s'-]+$/,
    validation: (name) => name.trim().length >= 3,
    error_messages: {
      required: "Cardholder name is required",
      invalid: "Name must contain only letters, spaces, hyphens, and apostrophes"
    }
  },
  
  cardNumber: {
    type: 'text',
    required: true,
    minLength: 13,
    maxLength: 19,
    validation: (number) => {
      const cleaned = number.replace(/\\s/g, '');
      return luhnCheck(cleaned) && cleaned.length >= 13;
    },
    formatting: (val) => val.replace(/\\s/g, '').replace(/(\\d{4})/g, '$1 ').trim(),
    error_messages: {
      required: "Card number is required",
      invalid: "Invalid card number (failed Luhn check)"
    }
  },
  
  expiryMonth: {
    type: 'text',
    required: true,
    minLength: 2,
    maxLength: 2,
    pattern: /^(0[1-9]|1[0-2])$/,
    validation: (month) => {
      const m = parseInt(month);
      return m >= 1 && m <= 12;
    },
    error_messages: {
      required: "Expiry month required (MM)",
      invalid: "Month must be 01-12"
    }
  },
  
  expiryYear: {
    type: 'text',
    required: true,
    minLength: 2,
    maxLength: 2,
    validation: (year, month) => {
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      const y = parseInt(year);
      const m = parseInt(month);
      
      // Card not expired
      if (y < currentYear) return false;
      if (y === currentYear && m < currentMonth) return false;
      
      // Not too far in future (10 years)
      if (y > currentYear + 10) return false;
      
      return true;
    },
    error_messages: {
      required: "Expiry year required (YY)",
      expired: "Card is expired",
      invalid: "Year must be within 10 years"
    }
  },
  
  cvv: {
    type: 'password',  // Masked input
    required: true,
    minLength: 3,
    maxLength: 4,
    pattern: /^[0-9]{3,4}$/,
    validation: (cvv, cardBrand) => {
      if (cardBrand === 'amex') return cvv.length === 4;
      return cvv.length === 3;
    },
    error_messages: {
      required: "CVV is required for card-not-present",
      invalid: "CVV must be 3 digits (4 for Amex)"
    }
  },
  
  // Customer Information Section
  customerEmail: {
    type: 'email',
    required: true,
    pattern: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
    validation: (email) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email),
    purpose: "Receipt delivery + card-on-file linking",
    error_messages: {
      required: "Customer email required",
      invalid: "Invalid email format"
    }
  },
  
  customerName: {
    type: 'text',
    required: false,
    purpose: "Receipt personalization",
    default: (formData) => formData.cardholderName  // Auto-fill from cardholder
  },
  
  phone: {
    type: 'tel',
    required: false,
    purpose: "SMS receipts (optional feature)"
  },
  
  // Optional Fields
  description: {
    type: 'text',
    required: false,
    maxLength: 255,
    purpose: "Transaction memo/note"
  },
  
  invoiceNumber: {
    type: 'text',
    required: false,
    purpose: "Link to external invoice"
  },
  
  // Billing Address (for AVS)
  billingAddress: {
    type: 'text',
    required: false,
    purpose: "Address Verification System (AVS)"
  },
  
  billingCity: {
    type: 'text',
    required: false
  },
  
  billingZip: {
    type: 'text',
    required: false,
    purpose: "Zip/postal code for AVS"
  }
};
\`\`\`

### Card Brand Detection

**Automatic Card Network Identification:**

\`\`\`javascript
/**
 * Card Brand Detection Algorithm
 * Identifies card network from BIN (first 6 digits)
 */
const detectCardBrand = (cardNumber) => {
  const cleaned = cardNumber.replace(/\\s/g, '');
  const firstDigit = cleaned[0];
  const firstTwo = cleaned.substring(0, 2);
  const firstThree = cleaned.substring(0, 3);
  const firstFour = cleaned.substring(0, 4);
  
  // Visa: Starts with 4
  if (firstDigit === '4') {
    return {
      brand: 'visa',
      name: 'Visa',
      cvvLength: 3,
      cardLength: [13, 16, 19],
      color: '#1A1F71'
    };
  }
  
  // Mastercard: 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleaned) || (parseInt(firstFour) >= 2221 && parseInt(firstFour) <= 2720)) {
    return {
      brand: 'mastercard',
      name: 'Mastercard',
      cvvLength: 3,
      cardLength: [16],
      color: '#EB001B'
    };
  }
  
  // American Express: 34 or 37
  if (firstTwo === '34' || firstTwo === '37') {
    return {
      brand: 'amex',
      name: 'American Express',
      cvvLength: 4,
      cardLength: [15],
      color: '#006FCF'
    };
  }
  
  // Discover: 6011, 622126-622925, 644-649, 65
  if (firstFour === '6011' || 
      (parseInt(firstFour) >= 6221 && parseInt(firstFour) <= 6229) ||
      (parseInt(firstThree) >= 644 && parseInt(firstThree) <= 649) ||
      firstTwo === '65') {
    return {
      brand: 'discover',
      name: 'Discover',
      cvvLength: 3,
      cardLength: [16],
      color: '#FF6000'
    };
  }
  
  // JCB: 3528-3589
  if (parseInt(firstFour) >= 3528 && parseInt(firstFour) <= 3589) {
    return {
      brand: 'jcb',
      name: 'JCB',
      cvvLength: 3,
      cardLength: [16],
      color: '#0E4C96'
    };
  }
  
  // UnionPay: 62
  if (firstTwo === '62') {
    return {
      brand: 'unionpay',
      name: 'UnionPay',
      cvvLength: 3,
      cardLength: [16, 17, 18, 19],
      color: '#E21836'
    };
  }
  
  // Diners Club: 36, 38, 300-305
  if (firstTwo === '36' || firstTwo === '38' || 
      (parseInt(firstThree) >= 300 && parseInt(firstThree) <= 305)) {
    return {
      brand: 'diners',
      name: 'Diners Club',
      cvvLength: 3,
      cardLength: [14, 16],
      color: '#0079BE'
    };
  }
  
  return {
    brand: 'unknown',
    name: 'Unknown',
    cvvLength: 3,
    cardLength: [16]
  };
};
\`\`\`

### Transaction Types

**Complete Transaction Type Matrix:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Sale: Immediate capture
    [*] --> AuthOnly: Pre-authorization
    
    Sale --> Approved: Card approved
    Sale --> Declined: Card declined
    
    AuthOnly --> Authorized: Funds held
    Authorized --> Captured: Capture within 7 days
    Authorized --> Voided: Cancel before capture
    Authorized --> Expired: Auto-void after 7 days
    
    Approved --> Settled: T+1 or T+2
    Captured --> Settled: T+1 or T+2
    
    Settled --> Refunded: Customer refund
    Approved --> Voided: Same-day void
    
    Declined --> [*]
    Voided --> [*]
    Expired --> [*]
    Refunded --> [*]
    
    note right of Sale
        Most common for VT
        Single-step processing
        Immediate fund movement
    end note
    
    note right of AuthOnly
        Hotels, car rentals
        Hold funds without capture
        Capture or void later
    end note
\`\`\`

**Transaction Type Details:**

| Type | When to Use | Funds Movement | Reversible | Time Limit |
|------|-------------|----------------|------------|------------|
| **Sale** | Standard purchases | Immediate capture | Refund only | 180 days |
| **Auth-Only** | Hotels, rentals, deposits | Held (not captured) | Void before capture | 7 days |
| **Capture** | Complete pre-authorization | Capture held funds | Refund after capture | Must capture within 7 days |
| **Refund** | Return, cancellation | Return to customer | No | 180 days from sale |
| **Void** | Same-day cancellation | Release hold | No | Same day only |

---

## Crypto Payment Processing

### Cryptocurrency Acceptance

The Virtual Terminal supports **cryptocurrency payments** for merchants with crypto gateway enabled:

\`\`\`mermaid
graph TB
    subgraph "Crypto Payment Flow"
        CP[Crypto Payment Mode]
    end
    
    subgraph "Supported Cryptocurrencies"
        BTC[Bitcoin<br/>BTC]
        ETH[Ethereum<br/>ETH]
        USDC[USDC<br/>Stablecoin]
        USDT[Tether<br/>USDT]
        LN[Lightning<br/>Network]
    end
    
    subgraph "Payment Process"
        P1[Customer provides wallet]
        P2[Generate payment request]
        P3[Display QR code]
        P4[Customer sends crypto]
        P5[Blockchain confirmation]
        P6[Convert to fiat]
    end
    
    subgraph "Settlement Options"
        S1[Receive in Crypto<br/>Keep as BTC/ETH]
        S2[Auto-Convert<br/>Instant fiat conversion]
        S3[Split Settlement<br/>50% crypto, 50% fiat]
    end
    
    CP --> BTC
    CP --> ETH
    CP --> USDC
    CP --> USDT
    CP --> LN
    
    BTC --> P1
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5
    P5 --> P6
    
    P6 --> S1
    P6 --> S2
    P6 --> S3
    
    style CP fill:#f59e0b,color:#fff
    style BTC fill:#FF9900,color:#fff
    style S2 fill:#10b981,color:#fff
\`\`\`

**Crypto Payment Workflow:**

\`\`\`yaml
crypto_payment_steps:
  step_1_mode_selection:
    operator_action: "Click 'Crypto Payment' tab"
    ui_change: "Shows crypto-specific form"
    
  step_2_amount_entry:
    operator_action: "Enter USD amount (e.g., $500)"
    system_action: "Real-time conversion to crypto"
    display: "$500 USD = 0.0095 BTC"
    
  step_3_crypto_selection:
    options: ["Bitcoin (BTC)", "Ethereum (ETH)", "USDC Stablecoin", "USDT"]
    operator_action: "Select cryptocurrency"
    
  step_4_wallet_address:
    customer_provides: "Crypto wallet address"
    validation: "Address format check (BTC, ETH, etc.)"
    
  step_5_payment_request:
    system_generates: "Payment request"
    displays:
      - amount_crypto: "0.0095 BTC"
      - amount_fiat: "$500 USD"
      - recipient_address: "Merchant's wallet"
      - qr_code: "Scannable payment QR"
      
  step_6_customer_sends:
    customer_action: "Sends crypto from wallet"
    wait_time: "10-60 minutes (blockchain confirmation)"
    
  step_7_confirmation:
    blockchain: "Transaction confirmed (3+ blocks)"
    system_updates: "Mark payment as complete"
    receipt_sent: "Email confirmation to customer"
\`\`\`

**Crypto-to-Fiat Conversion:**

| Conversion Option | Speed | Risk | Fees | Best For |
|-------------------|-------|------|------|----------|
| **Instant Convert** | <1 minute | None | 1.5% | Merchants wanting fiat only |
| **Hold & Convert** | Customer choice | Price volatility | 1.2% | Flexibility |
| **Keep as Crypto** | N/A | High volatility | 0.5% (custody) | Crypto-native businesses |

---

## Itemized Sales

### Multi-Item Invoice Processing

**Building Line-Item Invoices:**

\`\`\`mermaid
graph TB
    subgraph "Itemized Sale Interface"
        IS[Itemized Sale Mode]
    end
    
    subgraph "Item Entry Form"
        I1[Item Name<br/>Product/service]
        I2[Quantity<br/>Number of units]
        I3[Unit Price<br/>Price per item]
        I4[Add Button<br/>Add to cart]
    end
    
    subgraph "Shopping Cart"
        C1[Item List<br/>All added items]
        C2[Line Totals<br/>Qty × Price]
        C3[Remove Items<br/>Edit cart]
        C4[Subtotal<br/>Sum of items]
        C5[Tax<br/>Optional]
        C6[Grand Total<br/>Final amount]
    end
    
    subgraph "Payment Processing"
        P1[Card Entry<br/>Standard fields]
        P2[Process Payment<br/>For grand total]
        P3[Generate Invoice<br/>Detailed receipt]
    end
    
    IS --> I1
    I1 --> I2
    I2 --> I3
    I3 --> I4
    
    I4 --> C1
    C1 --> C2
    C2 --> C3
    C3 --> C4
    C4 --> C5
    C5 --> C6
    
    C6 --> P1
    P1 --> P2
    P2 --> P3
    
    style IS fill:#3b82f6,color:#fff
    style C4 fill:#10b981,color:#fff
    style P2 fill:#f59e0b,color:#fff
\`\`\`

### Itemized Sale Example

**Retail Sale with Multiple Products:**

\`\`\`javascript
// Example itemized sale
const itemizedSaleExample = {
  items: [
    { name: "Premium Widget", quantity: 2, unit_price: 49.99, total: 99.98 },
    { name: "Standard Widget", quantity: 5, unit_price: 19.99, total: 99.95 },
    { name: "Widget Pro Accessory", quantity: 1, unit_price: 29.99, total: 29.99 }
  ],
  
  calculation: {
    subtotal: 229.92,
    tax: 18.39,        // 8% sales tax
    total: 248.31
  },
  
  invoice_generation: {
    invoice_number: "INV-2026-001234",
    line_items_displayed: true,
    itemized_receipt: true,
    email_sent: true
  }
};
\`\`\`

**Item Entry Interface:**

\`\`\`
┌────────────────────────────────────────────────────────┐
│  Add Items                                             │
├────────────────────────────────────────────────────────┤
│  Item Name        Qty    Price      [Add Item]         │
│  [____________]   [2]    [49.99]    [   +   ]         │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│  Shopping Cart                                         │
├────────────────────────────────────────────────────────┤
│  ✓ Premium Widget                                      │
│    2 × $49.99                              $99.98  [×] │
│                                                         │
│  ✓ Standard Widget                                     │
│    5 × $19.99                              $99.95  [×] │
│                                                         │
│  ✓ Widget Pro Accessory                                │
│    1 × $29.99                              $29.99  [×] │
├────────────────────────────────────────────────────────┤
│  Subtotal                                    $229.92   │
│  Tax (8%)                                     $18.39   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  TOTAL                                       $248.31   │
└────────────────────────────────────────────────────────┘
\`\`\`

---

## Recurring Payments

### Subscription Billing Setup

**Create Recurring Payment Schedules:**

\`\`\`mermaid
sequenceDiagram
    actor Operator
    participant VT as Virtual Terminal
    participant Customer
    participant Card as Card Vault
    participant Schedule as Recurring Engine
    participant Billing as Auto-Billing
    
    Operator->>VT: Select "Recurring" mode
    VT->>VT: Show subscription form
    
    Operator->>VT: Enter subscription amount
    Operator->>VT: Select frequency (monthly)
    Operator->>VT: Set start date
    Operator->>VT: Set end condition
    
    Customer->>Operator: Provides card details
    Operator->>VT: Enter card information
    Operator->>VT: Enable "Save card"
    
    Operator->>VT: Click "Setup Recurring"
    
    VT->>VT: Process initial payment
    VT->>Card: Tokenize and save card
    Card-->>VT: Token created
    
    VT->>Schedule: Create billing schedule
    Schedule->>Schedule: Calculate next billing date
    Schedule-->>VT: Subscription active
    
    VT->>Customer: Send subscription confirmation
    VT->>Operator: Show success + schedule
    
    Note over Schedule: 30 days later...
    
    Schedule->>Billing: Billing date reached
    Billing->>Card: Retrieve token
    Card-->>Billing: Card token
    Billing->>Billing: Process automatic payment
    
    alt Payment Successful
        Billing->>Customer: Payment confirmation
        Billing->>Schedule: Update next billing date
    else Payment Failed
        Billing->>Operator: Payment failed alert
        Billing->>Customer: Update payment method notice
        Billing->>Schedule: Retry in 3 days
    end
\`\`\`

### Recurring Payment Configuration

**Subscription Settings:**

\`\`\`yaml
recurring_payment_options:
  frequency_options:
    - daily: "Every day (e.g., daily newspaper)"
    - weekly: "Every week (e.g., weekly meal plan)"
    - bi_weekly: "Every 2 weeks (e.g., payroll)"
    - monthly: "Every month (most common - SaaS, gym)"
    - quarterly: "Every 3 months (e.g., quarterly service)"
    - semi_annually: "Every 6 months"
    - annually: "Every year (e.g., annual membership)"
    
  start_date_options:
    - today: "Immediate first billing"
    - future_date: "Start on specific date"
    - after_trial: "After free trial period"
    
  end_conditions:
    never:
      description: "Continue indefinitely until cancelled"
      use_case: "Standard subscriptions"
      
    on_date:
      description: "End on specific date"
      use_case: "Limited-time subscriptions"
      example: "6-month gym membership"
      
    after_occurrences:
      description: "End after N billing cycles"
      use_case: "Installment plans"
      example: "12-month payment plan"
      
    on_total_amount:
      description: "End when total paid reaches amount"
      use_case: "Payment plans with balance"
      example: "Pay off $1,200 in monthly $100 installments"
  
  retry_logic:
    - attempt_1: "On scheduled date"
    - attempt_2: "3 days later if failed"
    - attempt_3: "5 days later if failed again"
    - final_action: "Cancel subscription, notify customer"
    
  dunning_management:
    - day_0: "Payment failed - auto retry in 3 days"
    - day_3: "Retry 1 - send 'Update payment method' email"
    - day_8: "Retry 2 - send 'Final notice' email"
    - day_15: "Cancel subscription - send cancellation notice"
\`\`\`

**Recurring Payment Example:**

\`\`\`javascript
// Setup monthly subscription
const recurringConfig = {
  amount: 29.99,
  currency: 'USD',
  frequency: 'monthly',
  start_date: '2026-02-01',
  end_type: 'never',
  
  customer: {
    email: 'subscriber@example.com',
    name: 'John Smith'
  },
  
  card: {
    number: '4111111111111111',
    expiry_month: '12',
    expiry_year: '27',
    cvv: '123',
    save_token: true  // Required for recurring
  },
  
  billing_descriptor: 'ACME Membership',
  
  notifications: {
    send_initial_confirmation: true,
    send_renewal_reminders: true,  // 3 days before each billing
    send_failure_alerts: true
  }
};

// Generated schedule
const billingSchedule = {
  subscription_id: 'sub_ABC123',
  initial_payment: '2026-02-01',
  upcoming_billings: [
    '2026-02-01',  // Initial
    '2026-03-01',  // Month 2
    '2026-04-01',  // Month 3
    '2026-05-01',  // Month 4
    // ... continues indefinitely
  ],
  status: 'active',
  total_billed_to_date: 0,
  successful_payments: 0,
  failed_attempts: 0
};
\`\`\`

---

## Card-on-File Management

### Tokenized Card Storage

**Securely Save Customer Payment Methods:**

\`\`\`mermaid
graph TB
    subgraph "Card-on-File Workflow"
        COF[Card-on-File Feature]
    end
    
    subgraph "Initial Tokenization"
        T1[Customer enters card]
        T2[Check 'Save card' option]
        T3[Process initial payment]
        T4[Gateway tokenizes card]
        T5[Store token + metadata]
    end
    
    subgraph "Stored Card Data (PCI Safe)"
        S1[Token ID<br/>tok_ABC123]
        S2[Card Brand<br/>Visa]
        S3[Last 4 Digits<br/>4242]
        S4[Expiry Date<br/>12/27]
        S5[Customer Email<br/>Link to customer]
    end
    
    subgraph "Future Transactions"
        F1[Operator selects customer]
        F2[System shows saved cards]
        F3[Select saved card]
        F4[Enter amount only]
        F5[Process with token]
    end
    
    COF --> T1
    T1 --> T2
    T2 --> T3
    T3 --> T4
    T4 --> T5
    
    T5 --> S1
    T5 --> S2
    T5 --> S3
    T5 --> S4
    T5 --> S5
    
    S1 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> F4
    F4 --> F5
    
    style T4 fill:#10b981,color:#fff
    style S1 fill:#3b82f6,color:#fff
    style F5 fill:#f59e0b,color:#fff
\`\`\`

### Card-on-File Benefits

**Why Use Card-on-File:**

\`\`\`yaml
benefits:
  for_merchants:
    faster_processing: "No re-entering card details"
    higher_conversion: "Reduce payment friction"
    recurring_ready: "Enable subscription billing"
    customer_loyalty: "Easier repeat purchases"
    
  for_customers:
    convenience: "One-click payments"
    security: "Tokenized storage (PCI compliant)"
    flexibility: "Manage saved cards"
    
  for_operators:
    efficiency: "Process repeat customers 5x faster"
    accuracy: "Eliminate card entry errors"
    workflow: "Select from dropdown vs manual entry"

security:
  no_raw_card_storage: "Only tokens stored"
  pci_compliant: "Meets PCI DSS requirements"
  customer_controlled: "Customers can delete anytime"
  expiry_monitoring: "Auto-notify on card expiration"
\`\`\`

**Saved Card Selection UI:**

\`\`\`javascript
// Saved card selector
const SavedCardSelector = ({ customerEmail, onSelect }) => {
  const { data: savedCards } = useQuery({
    queryKey: ['saved-cards', customerEmail],
    queryFn: () => base44.entities.SavedCard.filter({ customer_email: customerEmail })
  });
  
  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select saved card" />
      </SelectTrigger>
      <SelectContent>
        {savedCards.map(card => (
          <SelectItem key={card.id} value={card.id}>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>{card.card_brand} ****{card.card_last_four}</span>
              <span className="text-xs text-slate-500">
                Exp: {card.expiry_month}/{card.expiry_year}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
\`\`\`

---

## Transaction Limits & Controls

### Multi-Layer Limit System

**Comprehensive Transaction Controls:**

\`\`\`mermaid
graph TB
    subgraph "Transaction Limits"
        TL[Limit Validation Engine]
    end
    
    subgraph "Per-Transaction Limits"
        PT1[Admin: $25,000]
        PT2[Manager: $10,000]
        PT3[Operator: $5,000]
    end
    
    subgraph "Daily Volume Limits"
        DL1[Admin: Unlimited]
        DL2[Manager: $50,000]
        DL3[Operator: $10,000]
    end
    
    subgraph "Configuration Limits"
        CL1[VT Daily Limit<br/>Merchant-level cap]
        CL2[Currency Restrictions<br/>Allowed currencies only]
        CL3[MID Requirements<br/>Terminal selection]
    end
    
    subgraph "Enforcement"
        E1[Pre-Transaction Check<br/>Validate before processing]
        E2[Real-Time Tracking<br/>Update running totals]
        E3[Soft Limit Warning<br/>Alert at 80%]
        E4[Hard Limit Block<br/>Reject at 100%]
    end
    
    TL --> PT1
    TL --> DL1
    TL --> CL1
    
    PT1 --> E1
    DL1 --> E2
    CL1 --> E3
    
    E1 --> E4
    E2 --> E4
    E3 --> E4
    
    style TL fill:#ef4444,color:#fff
    style E4 fill:#dc2626,color:#fff
\`\`\`

### Limit Validation Logic

**Pre-Transaction Limit Check:**

\`\`\`javascript
/**
 * Validate transaction against all limits
 * Runs BEFORE payment processing
 */
const validateTransactionLimits = async (vtUser, amount, vtConfig) => {
  const errors = [];
  
  // Check 1: Per-transaction limit (role-based)
  const roleLimits = {
    admin: 25000,
    manager: 10000,
    operator: 5000,
    viewer: 0
  };
  
  const perTxLimit = roleLimits[vtUser.role] || 0;
  if (amount > perTxLimit) {
    errors.push({
      type: 'PER_TRANSACTION_LIMIT',
      message: \`Amount $\${amount} exceeds your per-transaction limit of $\${perTxLimit}\`,
      limit: perTxLimit,
      requested: amount
    });
  }
  
  // Check 2: VT configuration limit (merchant-level)
  if (vtConfig?.per_transaction_limit && amount > vtConfig.per_transaction_limit) {
    errors.push({
      type: 'VT_CONFIG_LIMIT',
      message: \`Amount exceeds Virtual Terminal limit of $\${vtConfig.per_transaction_limit}\`,
      limit: vtConfig.per_transaction_limit,
      requested: amount
    });
  }
  
  // Check 3: Daily volume limit
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayTransactions = await base44.entities.Transaction.filter({
    operator: vtUser.email,
    created_date: { $gte: new Date(todayStart).toISOString() }
  });
  
  const todayVolume = todayTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const dailyLimit = vtConfig?.daily_limit || 50000;
  
  if (todayVolume + amount > dailyLimit) {
    errors.push({
      type: 'DAILY_LIMIT',
      message: \`Daily limit exceeded. Used: $\${todayVolume.toFixed(2)}, Requested: $\${amount}, Limit: $\${dailyLimit}\`,
      limit: dailyLimit,
      used: todayVolume,
      requested: amount,
      remaining: dailyLimit - todayVolume
    });
  }
  
  // Check 4: Currency allowed
  const allowedCurrencies = vtConfig?.allowed_currencies || ['USD'];
  if (!allowedCurrencies.includes(currency)) {
    errors.push({
      type: 'CURRENCY_NOT_ALLOWED',
      message: \`Currency \${currency} not allowed. Allowed: \${allowedCurrencies.join(', ')}\`,
      allowed: allowedCurrencies,
      requested: currency
    });
  }
  
  // Check 5: Soft limit warning (80% of daily)
  const softLimitThreshold = dailyLimit * 0.8;
  if (todayVolume >= softLimitThreshold && todayVolume < dailyLimit) {
    errors.push({
      type: 'SOFT_LIMIT_WARNING',
      severity: 'warning',
      message: \`You've used \${((todayVolume / dailyLimit) * 100).toFixed(1)}% of your daily limit\`,
      limit: dailyLimit,
      used: todayVolume,
      remaining: dailyLimit - todayVolume
    });
  }
  
  return {
    valid: errors.filter(e => e.severity !== 'warning').length === 0,
    errors: errors,
    warnings: errors.filter(e => e.severity === 'warning'),
    hard_errors: errors.filter(e => e.severity !== 'warning')
  };
};
\`\`\`

**Limit Configuration Table:**

| Limit Type | Default | Configurable | Purpose |
|------------|---------|--------------|---------|
| **Per-Transaction (Admin)** | $25,000 | ✅ Yes | Prevent single large fraud |
| **Per-Transaction (Manager)** | $10,000 | ✅ Yes | Role-based control |
| **Per-Transaction (Operator)** | $5,000 | ✅ Yes | Limited staff access |
| **Daily Volume** | $50,000 | ✅ Yes | Overall fraud prevention |
| **Monthly Volume** | Unlimited | ✅ Yes | Enterprise control |
| **Currency Whitelist** | USD, EUR, GBP | ✅ Yes | Supported currencies |

---

## Receipt & Email Delivery

### Automated Receipt Generation

**Receipt Types & Delivery:**

\`\`\`mermaid
graph TB
    subgraph "Receipt Generation"
        R[Transaction Approved]
    end
    
    subgraph "Receipt Types"
        R1[Email Receipt<br/>HTML + PDF]
        R2[SMS Receipt<br/>Text message]
        R3[Print Receipt<br/>PDF download]
        R4[Invoice PDF<br/>Itemized]
    end
    
    subgraph "Email Receipt Content"
        E1[Transaction ID]
        E2[Amount & Currency]
        E3[Auth Code]
        E4[Payment Method]
        E5[Date & Time]
        E6[Merchant Info]
        E7[Customer Info]
        E8[Description]
        E9[PDF Attachment]
    end
    
    subgraph "Delivery Methods"
        D1[Immediate Send<br/>On approval]
        D2[Delayed Send<br/>Batch overnight]
        D3[Manual Send<br/>Operator triggered]
    end
    
    R --> R1
    R --> R2
    R --> R3
    R --> R4
    
    R1 --> E1
    R1 --> D1
    
    style R fill:#10b981,color:#fff
    style E1 fill:#3b82f6,color:#fff
    style D1 fill:#f59e0b,color:#fff
\`\`\`

### Email Receipt Template

**Standard Receipt Format:**

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
    .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f8fafc; }
    .amount { font-size: 36px; font-weight: bold; color: #1e293b; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .row { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✅ Payment Confirmation</h1>
    <p>Your payment has been successfully processed</p>
  </div>
  
  <div class="content">
    <div class="amount">$99.00 USD</div>
    <p style="color: #10b981; font-weight: bold;">APPROVED</p>
    
    <div class="details">
      <div class="row">
        <span>Transaction ID:</span>
        <span style="font-family: monospace;">TXN-20260111-ABC123</span>
      </div>
      <div class="row">
        <span>Authorization Code:</span>
        <span style="font-family: monospace;">AUTH-XYZ789</span>
      </div>
      <div class="row">
        <span>Date & Time:</span>
        <span>January 11, 2026 at 10:30 AM EST</span>
      </div>
      <div class="row">
        <span>Payment Method:</span>
        <span>Visa ending in 4242</span>
      </div>
      <div class="row">
        <span>Merchant:</span>
        <span>ACME Corporation</span>
      </div>
    </div>
    
    <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
      If you have any questions about this transaction, please contact:
      <br><strong>support@acmecorp.com</strong> or <strong>+1 (800) 123-4567</strong>
    </p>
  </div>
  
  <div class="footer">
    <p>This is an automated receipt. Please do not reply to this email.</p>
    <p>© 2026 ACME Corporation. All rights reserved.</p>
  </div>
</body>
</html>
\`\`\`

### Receipt Configuration

**Email Receipt Settings:**

\`\`\`yaml
receipt_configuration:
  email_settings:
    enabled: true
    from_name: "ACME Payments"
    from_email: "receipts@acmecorp.com"
    subject_template: "Payment Receipt - {transaction_id}"
    
  content_options:
    include_merchant_logo: true
    include_transaction_details: true
    include_itemized_breakdown: true  # For itemized sales
    include_customer_info: true
    include_billing_address: false
    include_terms_conditions: false
    
  attachment_options:
    attach_pdf_receipt: true
    attach_invoice: true  # For itemized sales
    pdf_format: "A4" or "Letter"
    
  delivery_options:
    send_immediately: true
    send_to_customer: true
    send_to_merchant: false  # Optional BCC to merchant
    retry_on_failure: 3  # Retry 3 times if email fails
\`\`\`

---

## Multi-Currency Support

### ISO 4217 Currency Compliance

**180+ Supported Currencies:**

\`\`\`mermaid
graph TB
    subgraph "Currency Selection"
        CS[Currency Selector]
    end
    
    subgraph "Major Currencies"
        M1[USD - US Dollar]
        M2[EUR - Euro]
        M3[GBP - British Pound]
        M4[JPY - Japanese Yen]
        M5[CHF - Swiss Franc]
        M6[CAD - Canadian Dollar]
        M7[AUD - Australian Dollar]
    end
    
    subgraph "ISO 4217 Validation"
        V1[Currency Code<br/>3-letter code]
        V2[Numeric Code<br/>3-digit number]
        V3[Decimal Places<br/>Minor units]
        V4[Symbol<br/>$ € £ ¥]
    end
    
    subgraph "Processing"
        P1[Real-Time FX Rates<br/>ECB + others]
        P2[Settlement Currency<br/>Convert if needed]
        P3[Customer Display<br/>Local currency]
        P4[Merchant Display<br/>Settlement currency]
    end
    
    CS --> M1
    CS --> M2
    CS --> M3
    CS --> M4
    
    M1 --> V1
    V1 --> P1
    P1 --> P2
    P2 --> P3
    P2 --> P4
    
    style CS fill:#3b82f6,color:#fff
    style V1 fill:#10b981,color:#fff
    style P1 fill:#f59e0b,color:#fff
\`\`\`

**Currency Validation Example:**

\`\`\`javascript
// ISO 4217 currency validation
import { ISO4217_CURRENCIES, validateCurrency } from '@/components/utils/iso4217';

// Validate currency code
const validation = validateCurrency('USD');
console.log(validation);
/* Output:
{
  valid: true,
  currency: {
    code: 'USD',
    numeric: '840',
    name: 'US Dollar',
    symbol: '$',
    decimal_places: 2,
    countries: ['US', 'EC', 'SV', 'GU', 'MH', ...]
  }
}
*/

// Invalid currency
const invalid = validateCurrency('XYZ');
/* Output:
{
  valid: false,
  error: "Currency code XYZ not found in ISO 4217 registry"
}
*/

// Currency dropdown options
const currencyOptions = ISO4217_CURRENCIES
  .filter(c => vtConfig.allowed_currencies.includes(c.code))
  .map(c => ({
    value: c.code,
    label: \`\${c.code} - \${c.name}\`,
    symbol: c.symbol
  }));
\`\`\`

**Multi-Currency Processing:**

| Currency | Code | Symbol | Decimal Places | Example Amount |
|----------|------|--------|----------------|----------------|
| US Dollar | USD | $ | 2 | $100.00 |
| Euro | EUR | € | 2 | €100.00 |
| British Pound | GBP | £ | 2 | £100.00 |
| Japanese Yen | JPY | ¥ | 0 | ¥10000 |
| Bitcoin | BTC | ₿ | 8 | ₿0.00250000 |
| Kuwaiti Dinar | KWD | KD | 3 | KD 100.000 |

---

## Security & PCI Compliance

### PCI DSS Level 1 Compliance

**Multi-Layer Security Architecture:**

\`\`\`mermaid
graph TB
    subgraph "Input Layer Security"
        I1[Client-Side Validation<br/>Prevent bad data]
        I2[Field Masking<br/>CVV always masked]
        I3[Auto-Clear<br/>Clear after submit]
    end
    
    subgraph "Transmission Security"
        T1[TLS 1.3 Encryption<br/>All data encrypted]
        T2[Certificate Pinning<br/>Prevent MITM]
        T3[Request Signing<br/>Prevent tampering]
    end
    
    subgraph "Processing Security"
        P1[Tokenization<br/>No raw card storage]
        P2[Gateway Encryption<br/>End-to-end encrypted]
        P3[3D Secure<br/>Strong authentication]
        P4[Fraud Scoring<br/>Real-time analysis]
    end
    
    subgraph "Storage Security"
        S1[No Card Data<br/>Tokens only]
        S2[Encrypted Tokens<br/>AES-256]
        S3[Access Logs<br/>Audit trail]
        S4[Regular Audits<br/>Quarterly scans]
    end
    
    I1 --> T1
    T1 --> P1
    P1 --> S1
    
    I2 --> T2
    T2 --> P2
    P2 --> S2
    
    I3 --> T3
    T3 --> P3
    P3 --> S3
    
    P4 --> S4
    
    style I1 fill:#10b981,color:#fff
    style P1 fill:#3b82f6,color:#fff
    style S1 fill:#ef4444,color:#fff
\`\`\`

### Security Features

**Complete Security Control Matrix:**

| Security Control | Implementation | PCI Requirement | Status |
|------------------|----------------|-----------------|--------|
| **Encryption in Transit** | TLS 1.3 | Req 4.1 | ✅ Enforced |
| **Encryption at Rest** | AES-256 | Req 3.4 | ✅ Enabled |
| **Tokenization** | Gateway-level | Req 3.2 | ✅ Active |
| **CVV Handling** | Never stored | Req 3.2.3 | ✅ Compliant |
| **Access Control** | Role-based | Req 7.1 | ✅ Implemented |
| **Audit Logging** | All actions logged | Req 10.1 | ✅ Active |
| **Session Timeout** | 30 minutes | Req 8.1.8 | ✅ Configured |
| **Strong Passwords** | Complexity enforced | Req 8.2 | ✅ Required |
| **3D Secure** | Optional (recommended) | Best practice | ⚠️ Optional |
| **Fraud Detection** | Real-time scoring | Best practice | ✅ Active |
| **IP Whitelisting** | Optional | Best practice | ⚠️ Optional |

### 3D Secure Integration

**Strong Customer Authentication (SCA):**

\`\`\`mermaid
sequenceDiagram
    participant VT as Virtual Terminal
    participant Gateway as Payment Gateway
    participant ACS as Access Control Server
    participant Customer
    participant Issuer as Card Issuer
    
    VT->>Gateway: Submit payment (3DS enabled)
    Gateway->>ACS: Request 3DS challenge
    ACS->>ACS: Assess transaction risk
    
    alt Low Risk - Frictionless
        ACS-->>Gateway: Approve without challenge
        Gateway->>Issuer: Authorize payment
        Issuer-->>Gateway: Approved
        Gateway-->>VT: Success
    else High Risk - Challenge Required
        ACS->>Customer: Send OTP via SMS/email
        ACS->>VT: Display 3DS iframe
        VT->>Customer: Show challenge screen
        Customer->>VT: Enter OTP code
        VT->>ACS: Submit OTP
        
        alt OTP Correct
            ACS-->>Gateway: Authentication successful
            Gateway->>Issuer: Authorize payment
            Issuer-->>Gateway: Approved
            Gateway-->>VT: Success
        else OTP Wrong
            ACS-->>Gateway: Authentication failed
            Gateway-->>VT: Decline (3DS failed)
            VT->>Customer: Authentication error
        end
    end
\`\`\`

**3DS Configuration:**

\`\`\`yaml
three_ds_settings:
  enforcement_rules:
    always:
      description: "All transactions require 3DS"
      use_case: "Maximum security"
      decline_rate_impact: "+5-15% (friction)"
      
    threshold_based:
      description: "3DS for amounts > $100"
      use_case: "Balance security vs UX"
      threshold: 100.00
      
    never:
      description: "No 3DS enforcement"
      use_case: "Low-risk merchants"
      liability: "Merchant assumes chargeback risk"
      
  exemptions:
    - transaction_risk_analysis: "Low-risk flagged by issuer"
    - corporate_cards: "Business card purchases"
    - recurring_payments: "After initial 3DS"
    - low_value_transactions: "<$30 (EU only)"
\`\`\`

---

## Configuration Options

### Virtual Terminal Settings

**Complete Configuration Schema:**

\`\`\`json
{
  "VirtualTerminal": {
    "properties": {
      "merchant_id": {
        "type": "string",
        "description": "Reference to merchant account"
      },
      "terminal_id": {
        "type": "string",
        "description": "Unique terminal identifier"
      },
      "name": {
        "type": "string",
        "description": "Terminal display name",
        "example": "Main Office VT"
      },
      "status": {
        "type": "string",
        "enum": ["active", "inactive", "suspended"],
        "default": "active",
        "description": "Terminal operational status"
      },
      "daily_limit": {
        "type": "number",
        "description": "Maximum daily processing volume (USD)",
        "default": 50000
      },
      "per_transaction_limit": {
        "type": "number",
        "description": "Maximum single transaction (USD)",
        "default": 10000
      },
      "allowed_currencies": {
        "type": "array",
        "items": { "type": "string" },
        "description": "ISO 4217 currency codes",
        "default": ["USD", "EUR", "GBP"]
      },
      "requires_cvv": {
        "type": "boolean",
        "description": "Force CVV entry (recommended for CNP)",
        "default": true
      },
      "enable_3ds": {
        "type": "boolean",
        "description": "Enable 3D Secure authentication",
        "default": true
      },
      "enable_recurring": {
        "type": "boolean",
        "description": "Allow recurring payment setup",
        "default": true
      },
      "enable_itemized_sale": {
        "type": "boolean",
        "description": "Allow line-item invoicing",
        "default": true
      },
      "enable_card_on_file": {
        "type": "boolean",
        "description": "Allow saving customer cards",
        "default": true
      },
      "send_receipts_email": {
        "type": "boolean",
        "description": "Auto-send email receipts",
        "default": true
      },
      "send_receipts_sms": {
        "type": "boolean",
        "description": "Send SMS receipts (requires SMS gateway)",
        "default": false
      },
      "allowed_roles": {
        "type": "array",
        "items": { "type": "string" },
        "description": "Roles permitted to use VT",
        "default": ["admin", "manager", "operator"]
      },
      "auto_settle": {
        "type": "boolean",
        "description": "Auto-settle transactions",
        "default": true
      },
      "settlement_delay_hours": {
        "type": "number",
        "description": "Hours to delay settlement",
        "default": 0
      }
    }
  }
}
\`\`\`

---

## User Journey Examples

### Journey 1: Phone Order Processing

**Real-World Scenario: Customer Calls to Order Product**

\`\`\`mermaid
journey
    title Phone Order - Customer Calls Sales Team
    section Customer Call
      Customer calls sales: 5: Customer
      Explains product needed: 5: Customer
      Asks for price: 5: Customer
    section Operator Action
      Opens Virtual Terminal: 4: Operator
      Selects Quick Charge mode: 5: Operator
      Enters amount $199.00: 5: Operator
    section Card Collection
      Asks for card details: 4: Operator
      Customer reads card number: 5: Customer
      Operator enters card info: 4: Operator
      Enters expiry and CVV: 4: Operator
    section Processing
      Clicks Process Payment: 5: Operator
      System processes (2 seconds): 3: System
      Payment approved: 5: System
    section Completion
      Confirms approval to customer: 5: Operator
      Email receipt sent: 5: System
      Customer receives email: 5: Customer
      Call ends successfully: 5: Customer, Operator
\`\`\`

### Journey 2: Multi-Item Retail Sale

**Scenario: Event Registration with Multiple Items**

\`\`\`mermaid
sequenceDiagram
    actor Customer
    participant Operator
    participant VT as Virtual Terminal
    participant Cart as Shopping Cart
    participant Payment
    
    Customer->>Operator: Register for conference
    Operator->>VT: Select Itemized Sale mode
    
    Note over Customer,Operator: Items to purchase
    
    Customer->>Operator: Conference ticket ($499)
    Operator->>VT: Add item: Conference Ticket, Qty: 1, Price: $499
    VT->>Cart: Item added
    
    Customer->>Operator: Workshop addon ($199)
    Operator->>VT: Add item: Workshop, Qty: 1, Price: $199
    VT->>Cart: Item added
    
    Customer->>Operator: T-shirt ($29 × 2)
    Operator->>VT: Add item: T-Shirt, Qty: 2, Price: $29
    VT->>Cart: Item added
    
    Cart->>Cart: Calculate total
    Note over Cart: Subtotal: $756.98<br/>Tax (8%): $60.56<br/>Total: $817.54
    
    VT->>Operator: Display cart + total
    Operator->>Customer: Total is $817.54
    
    Customer->>Operator: Provides card
    Operator->>VT: Enter card details
    Operator->>VT: Process payment
    
    VT->>Payment: Submit $817.54
    Payment-->>VT: Approved
    
    VT->>VT: Generate itemized invoice
    VT->>Customer: Email invoice + receipt
    VT->>Operator: Show success + print invoice
\`\`\`

### Journey 3: Recurring Subscription Setup

**Scenario: Monthly Membership Billing**

\`\`\`mermaid
gantt
    title Monthly Subscription Lifecycle
    dateFormat YYYY-MM-DD
    
    section Initial Setup
    Customer signs up          :done, 2026-01-11, 1d
    VT operator processes      :done, 2026-01-11, 1d
    Initial $29.99 charged     :done, 2026-01-11, 1d
    Card tokenized             :done, 2026-01-11, 1d
    
    section Month 2
    Billing reminder sent      :active, 2026-02-08, 1d
    Auto-charge $29.99         :2026-02-11, 1d
    Payment successful         :milestone, 2026-02-11, 0d
    
    section Month 3
    Billing reminder           :2026-03-08, 1d
    Auto-charge $29.99         :2026-03-11, 1d
    Payment failed             :crit, 2026-03-11, 1d
    Retry attempt 1            :2026-03-14, 1d
    Retry attempt 2            :2026-03-19, 1d
    Subscription cancelled     :milestone, 2026-03-19, 0d
\`\`\`

---

## MID Selection & Multi-Terminal Support

### MID Selector Interface

**Merchants with Multiple MIDs:**

\`\`\`mermaid
graph TB
    subgraph "MID Selection"
        MS[MID Selector Dropdown]
    end
    
    subgraph "Available MIDs"
        M1[MID-001<br/>Retail Location]
        M2[MID-002<br/>E-Commerce]
        M3[MID-003<br/>MOTO]
        M4[MID-004<br/>Recurring]
    end
    
    subgraph "MID Attributes"
        A1[Account Type<br/>Business classification]
        A2[Processing Limits<br/>Different caps]
        A3[Fee Structure<br/>Vary by MID]
        A4[Settlement Schedule<br/>T+1, T+2, etc.]
    end
    
    MS --> M1
    MS --> M2
    MS --> M3
    MS --> M4
    
    M1 --> A1
    M1 --> A2
    M1 --> A3
    M1 --> A4
    
    style MS fill:#3b82f6,color:#fff
    style M1 fill:#10b981,color:#fff
\`\`\`

**Why Multiple MIDs Matter:**

\`\`\`yaml
multiple_mid_use_cases:
  scenario_1_risk_segmentation:
    low_risk_mid: "MID-001 for in-person sales (lower fees)"
    high_risk_mid: "MID-002 for MOTO/CNP (higher fees)"
    benefit: "Optimize processing costs"
    
  scenario_2_location_based:
    location_a_mid: "Store #1 in New York"
    location_b_mid: "Store #2 in California"
    benefit: "Separate settlement by location"
    
  scenario_3_business_line:
    ecommerce_mid: "Online store transactions"
    subscription_mid: "Recurring membership billing"
    wholesale_mid: "B2B large orders"
    benefit: "Financial reporting clarity"
\`\`\`

---

## Transaction Result Handling

### Success & Failure Dialogs

**Transaction Result Interface:**

\`\`\`javascript
// Transaction result modal
const TransactionResultDialog = ({ result, open, onClose }) => {
  const isSuccess = result?.success;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSuccess ? (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Transaction Approved
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-600" />
                Transaction Declined
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Transaction ID:</span>
                  <span className="font-mono font-medium">{result.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Auth Code:</span>
                  <span className="font-mono font-medium">{result.authCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-semibold text-lg">
                    {result.currency} {result.amount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <Badge className="bg-green-100 text-green-700">APPROVED</Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>
                Print Receipt
              </Button>
              <Button onClick={onClose} className="flex-1">
                New Transaction
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <Badge className="bg-red-100 text-red-700">DECLINED</Badge>
                </div>
                <div className="mt-3">
                  <span className="text-sm font-medium text-slate-700">Decline Reason:</span>
                  <p className="mt-1 text-sm text-red-600">{result?.error}</p>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border border-red-200">
                  <p className="text-xs font-medium text-slate-700">Common Solutions:</p>
                  <ul className="text-xs text-slate-600 mt-2 space-y-1 list-disc list-inside">
                    <li>Verify card number and expiry date</li>
                    <li>Check with customer for correct CVV</li>
                    <li>Confirm sufficient funds available</li>
                    <li>Try alternative payment method</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button onClick={onClose} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
\`\`\`

---

## Complete Feature Matrix

### Virtual Terminal Features by Tier

| Feature | Starter VT | Professional VT | Enterprise VT |
|---------|-----------|-----------------|---------------|
| **Payment Modes** |
| Quick Charge | ✅ | ✅ | ✅ |
| Crypto Payments | ❌ | ✅ | ✅ |
| Itemized Sales | ❌ | ✅ | ✅ |
| Recurring Billing | ❌ | ✅ | ✅ |
| **Limits** |
| Daily Limit | $5,000 | $50,000 | Unlimited |
| Per-Transaction | $1,000 | $10,000 | $25,000 |
| Monthly Volume | $50,000 | $500,000 | Unlimited |
| **Features** |
| Card-on-File | ❌ | ✅ | ✅ |
| Multi-Currency | 3 currencies | 10 currencies | All currencies |
| 3D Secure | ✅ | ✅ | ✅ |
| Email Receipts | ✅ | ✅ | ✅ |
| SMS Receipts | ❌ | ❌ | ✅ |
| Custom Templates | ❌ | ✅ | ✅ |
| **Users** |
| VT Operators | 2 | 10 | Unlimited |
| Role-Based Access | ✅ | ✅ | ✅ |
| **Support** |
| Email Support | ✅ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| Phone Support | ❌ | ❌ | ✅ |

---

## Best Practices

### For Optimal VT Operations

**Merchant Best Practices:**

\`\`\`yaml
operational_excellence:
  fraud_prevention:
    - always_verify_customer_identity: "Phone number lookup, callback verification"
    - use_3ds_for_high_value: "Enable 3DS for transactions >$200"
    - monitor_decline_patterns: "Repeated declines may indicate testing"
    - verify_billing_address: "Use AVS for additional verification"
    - document_phone_orders: "Keep call recordings or notes"
    
  efficiency_tips:
    - use_card_on_file: "Repeat customers save 60% time"
    - setup_keyboard_shortcuts: "Ctrl+P for process, Ctrl+C for clear"
    - use_itemized_mode: "Professional invoices for B2B"
    - enable_auto_receipts: "Reduce manual email sending"
    - train_operators: "15-minute onboarding per operator"
    
  compliance_requirements:
    - pci_dss_training: "All operators must complete training"
    - password_security: "Rotate passwords every 90 days"
    - access_review: "Quarterly review of VT user access"
    - audit_logs: "Review transaction logs monthly"
    - incident_reporting: "Report suspicious activity immediately"
\`\`\`

### For VT Operators

**Daily Operating Procedures:**

\`\`\`markdown
Virtual Terminal Operator Checklist

□ Start of Shift:
  □ Login to Virtual Terminal
  □ Verify MID selection is correct
  □ Check daily limit remaining
  □ Review any pending authorizations
  
□ During Shift:
  □ Verify customer identity before processing
  □ Double-check card number entry
  □ Always collect CVV for CNP transactions
  □ Use description field for order references
  □ Send receipt confirmation to customer
  □ Document any declined transactions
  
□ End of Shift:
  □ Review transactions processed today
  □ Verify all receipts sent
  □ Report any issues to manager
  □ Log out of Virtual Terminal
  □ Clear browser cache (security)
\`\`\`

---

## Troubleshooting Guide

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **"VT Not Configured"** | No VT setup for merchant | Contact PSP admin to enable VT |
| **"Access Denied"** | Role not in allowed_roles | Admin must add your role to VT config |
| **"Daily Limit Exceeded"** | Processed >$50K today | Wait until tomorrow or request limit increase |
| **"Invalid Currency"** | Currency not in allowed list | Use allowed currency or request addition |
| **"Card Declined"** | Insufficient funds / fraud | Ask customer for alternative payment |
| **"3DS Failed"** | Customer didn't complete OTP | Retry with correct OTP or disable 3DS |
| **"CVV Required"** | CVV field empty | CVV mandatory for CNP transactions |

---

## Conclusion

The Virtual Payment Terminal provides enterprise-grade card-not-present payment processing with support for multiple payment modes (quick charge, crypto, itemized, recurring), advanced security (PCI DSS, 3DS, tokenization), comprehensive limits, multi-currency processing, and automated receipt delivery - enabling efficient phone order, MOTO, and subscription billing operations.

**Terminal Highlights:**

✅ **4 Payment Modes** - Quick, crypto, itemized, recurring  
✅ **Card-on-File** - Tokenized card storage for repeat customers  
✅ **Multi-Currency** - 180+ currencies (ISO 4217 compliant)  
✅ **PCI DSS Level 1** - No raw card data storage  
✅ **Role-Based Access** - Admin, manager, operator permissions  
✅ **Transaction Limits** - Daily and per-transaction controls  
✅ **Automated Receipts** - Email/SMS delivery  
✅ **3D Secure** - Strong customer authentication  

**Next Steps:**
- Access VT via Merchant Portal → Virtual Terminal
- Select MID for processing
- Choose payment mode (quick/itemized/recurring/crypto)
- Process first transaction
- Review transaction in dashboard

---

**Document Information:**
- **Version:** 3.0
- **Last Updated:** January 11, 2026
- **Classification:** Public - Merchant Operators
- **Contact:** vt-support@fts.money

© 2026 FTS.Money. All rights reserved.`;

export default VirtualTerminalDoc;