export const VirtualTerminalDoc = `# Virtual Payment Terminal Documentation

**Last Updated:** December 2025  
**Status:** Production Ready  
**Version:** 2.5

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Authentication & Access](#authentication-access)
4. [Transaction Processing](#transaction-processing)
5. [Payment Types](#payment-types)
6. [Advanced Features](#advanced-features)
7. [Receipt & Invoice Generation](#receipt-invoice-generation)
8. [Security & Compliance](#security-compliance)
9. [Configuration & Settings](#configuration-settings)
10. [Reporting & Analytics](#reporting-analytics)

---

## Overview

The Virtual Payment Terminal (VT) is a web-based card-not-present (CNP) payment solution that enables merchants to manually process credit card transactions, phone orders, mail orders (MOTO), and recurring payments without requiring physical POS hardware.

### Key Features

- ✅ **Card-Not-Present Processing** - Manual card entry for phone/mail orders
- ✅ **Multiple Payment Types** - Sale, Auth-Only, Capture, Refund, Void
- ✅ **Recurring Payments** - Schedule automatic billing
- ✅ **Split Tender** - Accept multiple payment methods per transaction
- ✅ **Itemized Sales** - Line-item detail for products/services
- ✅ **Card-on-File** - Securely save customer payment methods
- ✅ **Receipt Generation** - Email/SMS receipts and invoices
- ✅ **3D Secure Support** - Strong customer authentication
- ✅ **Multi-currency** - Process in multiple currencies
- ✅ **Transaction Limits** - Daily and per-transaction controls

### Use Cases

| Scenario | Description | Example |
|----------|-------------|---------|
| **MOTO** | Mail Order / Telephone Order | Customer calls to place order over phone |
| **Invoice Payments** | Process payment for issued invoice | B2B invoice with net terms |
| **Recurring Billing** | Subscription or installment payments | Monthly membership fee |
| **Deposit Collection** | Partial payment for future service | Hotel reservation deposit |
| **Balance Settlement** | Pay outstanding account balance | Customer paying invoice balance |

---

## Architecture

### System Overview

\`\`\`mermaid
graph TB
    subgraph "Virtual Terminal"
        A[VT Login] --> B[VT Dashboard]
        B --> C[Process Sale]
        B --> D[Process Auth]
        B --> E[Capture Auth]
        B --> F[Process Refund]
        B --> G[Void Transaction]
        B --> H[Recurring Setup]
        B --> I[Card Vault]
    end
    
    subgraph "Payment Processing"
        J[Payment Gateway]
        K[3DS Authentication]
        L[Fraud Detection]
        M[Tokenization]
    end
    
    subgraph "Data Storage"
        N[(VT Users DB)]
        O[(Transactions DB)]
        P[(Token Vault)]
        Q[(Recurring DB)]
    end
    
    C --> J
    D --> J
    E --> J
    F --> J
    C --> K
    C --> L
    C --> M
    I --> P
    H --> Q
    
    J --> O
    A --> N
    
    style A fill:#e0f2fe
    style B fill:#dbeafe
    style J fill:#fef3c7
\`\`\`

### Component Architecture

\`\`\`javascript
// Virtual Terminal Components
components/terminal/
├── PaymentForm.jsx              // Main card entry form
├── CryptoPaymentForm.jsx        // Cryptocurrency payments
├── RecurringPaymentManager.jsx  // Subscription setup
├── InvoiceGenerator.jsx         // Create invoices
├── InvoicePreview.jsx          // Invoice preview/print
├── InvoiceTemplateManager.jsx  // Manage templates
├── PaymentLinkGenerator.jsx    // Create payment links
└── AIPaymentAgentManager.jsx   // AI-assisted processing
\`\`\`

---

## Authentication & Access

### VT User Management

\`\`\`mermaid
graph TB
    A[Merchant] --> B[VT Configuration]
    B --> C[Enable VT]
    B --> D[Set Limits]
    B --> E[Assign Users]
    
    E --> F[Admin]
    E --> G[Manager]
    E --> H[Operator]
    
    F --> I[All Permissions]
    G --> J[Process + View]
    H --> K[Process Only]
    
    D --> L[Daily Limit]
    D --> M[Per-Tx Limit]
    D --> N[Allowed Currencies]
    
    style A fill:#e0f2fe
    style C fill:#dcfce7
    style E fill:#fef3c7
\`\`\`

### Access Control

| Role | Permissions | Daily Limit | Features |
|------|-------------|-------------|----------|
| **Admin** | Full control, user management | Unlimited | All features + settings |
| **Manager** | Process, refund, void, view | $50,000 | All except user management |
| **Operator** | Process sales only | $10,000 | Basic processing |

### Authentication Flow

\`\`\`javascript
// VT authentication
const vtAuth = async (credentials) => {
  const response = await base44.functions.invoke('vtAuth', {
    merchant_id: credentials.merchant_id,
    email: credentials.email,
    password: credentials.password
  });
  
  if (response.data.success) {
    localStorage.setItem('vt_session', JSON.stringify({
      vt_user_id: response.data.user.id,
      merchant_id: response.data.user.merchant_id,
      role: response.data.user.role,
      permissions: response.data.user.permissions,
      daily_limit: response.data.user.daily_limit
    }));
  }
  
  return response.data;
};
\`\`\`

---

## Transaction Processing

### Sale Transaction Flow

\`\`\`mermaid
sequenceDiagram
    actor Operator as VT Operator
    participant VT as Virtual Terminal
    participant Gateway as Payment Gateway
    participant 3DS as 3D Secure
    participant Fraud as Fraud Engine
    participant Acquirer
    participant Issuer
    
    Operator->>VT: Enter card details
    Operator->>VT: Enter amount
    Operator->>VT: Click "Process"
    
    VT->>Fraud: Risk assessment
    Fraud-->>VT: Risk score
    
    alt High Risk
        VT->>Operator: Additional verification required
    end
    
    VT->>Gateway: Submit transaction
    
    alt 3DS Required
        Gateway->>3DS: Initiate authentication
        3DS->>Operator: Challenge (OTP)
        Operator->>3DS: Enter OTP
        3DS-->>Gateway: Authentication result
    end
    
    Gateway->>Acquirer: Authorization request
    Acquirer->>Issuer: Forward request
    Issuer-->>Acquirer: Approve/Decline
    Acquirer-->>Gateway: Auth response
    Gateway-->>VT: Transaction result
    VT->>Operator: Show confirmation
    VT->>Operator: Send receipt
\`\`\`

### Payment Form Component

\`\`\`javascript
// components/terminal/PaymentForm.jsx
const PaymentForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    card_number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    description: '',
    billing_address: {},
    enable_3ds: true,
    save_card: false
  });
  
  const processPayment = async () => {
    const result = await base44.functions.invoke('processPayment', {
      type: 'sale',
      amount: formData.amount,
      card: {
        number: formData.card_number,
        exp_month: formData.expiry_month,
        exp_year: formData.expiry_year,
        cvv: formData.cvv
      },
      customer: {
        name: formData.customer_name,
        email: formData.customer_email,
        phone: formData.customer_phone
      },
      billing_address: formData.billing_address,
      enable_3ds: formData.enable_3ds,
      save_card: formData.save_card,
      description: formData.description
    });
    
    if (result.data.status === 'approved') {
      await sendReceipt(result.data.transaction_id, formData.customer_email);
      onSuccess(result.data);
    }
  };
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); processPayment(); }}>
      <AmountInput value={formData.amount} onChange={(v) => setFormData({...formData, amount: v})} />
      <CardInput 
        cardNumber={formData.card_number}
        expiryMonth={formData.expiry_month}
        expiryYear={formData.expiry_year}
        cvv={formData.cvv}
        onChange={(field, value) => setFormData({...formData, [field]: value})}
      />
      <CustomerInfoInput 
        name={formData.customer_name}
        email={formData.customer_email}
        phone={formData.customer_phone}
        onChange={(field, value) => setFormData({...formData, [field]: value})}
      />
      <Checkbox 
        label="Enable 3D Secure" 
        checked={formData.enable_3ds}
        onChange={(v) => setFormData({...formData, enable_3ds: v})}
      />
      <Checkbox 
        label="Save card for future use" 
        checked={formData.save_card}
        onChange={(v) => setFormData({...formData, save_card: v})}
      />
      <Button type="submit">Process Payment</Button>
    </form>
  );
};
\`\`\`

---

## Payment Types

### Transaction Types Overview

\`\`\`mermaid
graph LR
    A[Virtual Terminal] --> B[Sale]
    A --> C[Auth Only]
    A --> D[Capture]
    A --> E[Refund]
    A --> F[Void]
    A --> G[Recurring]
    
    B --> B1[Immediate Settlement]
    C --> C1[Hold Funds]
    D --> D1[Complete Auth]
    E --> E1[Return Funds]
    F --> F1[Cancel Transaction]
    G --> G1[Automatic Billing]
    
    style A fill:#dbeafe
    style B fill:#dcfce7
    style C fill:#fef3c7
\`\`\`

### 1. Sale Transaction

Immediate authorization and capture in a single step.

\`\`\`javascript
const processSale = async (paymentData) => {
  return await base44.functions.invoke('processPayment', {
    type: 'sale',
    amount: paymentData.amount,
    card: paymentData.card,
    customer: paymentData.customer,
    description: paymentData.description
  });
};
\`\`\`

### 2. Auth-Only Transaction

Authorize funds without capturing (hold funds for later capture).

\`\`\`javascript
const processAuth = async (paymentData) => {
  return await base44.functions.invoke('processPayment', {
    type: 'auth',
    amount: paymentData.amount,
    card: paymentData.card,
    customer: paymentData.customer,
    hold_period: paymentData.hold_period || 7 // days
  });
};
\`\`\`

### 3. Capture Transaction

Capture previously authorized funds.

\`\`\`javascript
const captureAuth = async (authTransactionId, amount) => {
  return await base44.functions.invoke('processPayment', {
    type: 'capture',
    original_transaction_id: authTransactionId,
    amount: amount // Can be less than auth amount (partial capture)
  });
};
\`\`\`

### 4. Refund Transaction

Return funds to customer for a completed transaction.

\`\`\`javascript
const processRefund = async (originalTransactionId, amount, reason) => {
  return await base44.functions.invoke('processPayment', {
    type: 'refund',
    original_transaction_id: originalTransactionId,
    amount: amount, // Full or partial refund
    reason: reason
  });
};
\`\`\`

### 5. Void Transaction

Cancel a transaction before settlement (same day only).

\`\`\`javascript
const voidTransaction = async (transactionId) => {
  return await base44.functions.invoke('processPayment', {
    type: 'void',
    original_transaction_id: transactionId
  });
};
\`\`\`

---

## Advanced Features

### Recurring Payments

\`\`\`mermaid
graph TB
    A[Setup Recurring] --> B[Initial Transaction]
    B --> C[Save Token]
    C --> D[Create Schedule]
    
    D --> E[Daily]
    D --> F[Weekly]
    D --> G[Monthly]
    D --> H[Quarterly]
    D --> I[Annually]
    
    D --> J[Automated Processing]
    J --> K[Check Schedule]
    K --> L[Process Payment]
    L --> M{Success?}
    M -->|Yes| N[Send Receipt]
    M -->|No| O[Retry Logic]
    O --> P[Notify Merchant]
    
    style A fill:#dbeafe
    style D fill:#fef3c7
    style J fill:#dcfce7
\`\`\`

### Recurring Payment Setup

\`\`\`javascript
// Setup subscription
const setupRecurring = async (subscriptionData) => {
  // Process initial payment
  const initialTx = await base44.functions.invoke('processPayment', {
    type: 'sale',
    amount: subscriptionData.amount,
    card: subscriptionData.card,
    customer: subscriptionData.customer,
    save_card: true
  });
  
  if (initialTx.data.status === 'approved') {
    // Create recurring schedule
    const recurring = await base44.asServiceRole.entities.RecurringPayment.create({
      merchant_id: subscriptionData.merchant_id,
      customer_id: subscriptionData.customer_id,
      token_id: initialTx.data.token_id,
      amount: subscriptionData.amount,
      currency: subscriptionData.currency,
      frequency: subscriptionData.frequency, // 'daily', 'weekly', 'monthly', 'yearly'
      start_date: subscriptionData.start_date,
      end_date: subscriptionData.end_date,
      status: 'active',
      next_billing_date: calculateNextBillingDate(subscriptionData.start_date, subscriptionData.frequency)
    });
    
    return recurring;
  }
};
\`\`\`

### Split Tender

Accept multiple payment methods for a single transaction.

\`\`\`javascript
const processSplitTender = async (splitPayments) => {
  const transactions = [];
  
  for (const payment of splitPayments) {
    const result = await base44.functions.invoke('processPayment', {
      type: 'sale',
      amount: payment.amount,
      payment_method: payment.method, // 'card', 'cash', 'check'
      card: payment.card,
      parent_transaction_id: transactions[0]?.id // Link to first transaction
    });
    
    transactions.push(result.data);
  }
  
  return {
    total_amount: splitPayments.reduce((sum, p) => sum + p.amount, 0),
    transactions
  };
};
\`\`\`

### Itemized Sales

Process line-item detailed transactions.

\`\`\`javascript
const processItemizedSale = async (items, customer) => {
  const lineItems = items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.quantity * item.unit_price,
    tax: item.tax || 0
  }));
  
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = lineItems.reduce((sum, item) => sum + item.tax, 0);
  const total = subtotal + tax;
  
  const result = await base44.functions.invoke('processPayment', {
    type: 'sale',
    amount: total,
    line_items: lineItems,
    subtotal,
    tax,
    customer
  });
  
  return result;
};
\`\`\`

### Card-on-File Management

\`\`\`mermaid
graph TB
    A[Card Vault] --> B[Add Card]
    A --> C[List Cards]
    A --> D[Delete Card]
    A --> E[Update Card]
    
    B --> F[Tokenize Card]
    F --> G[Store Token]
    G --> H[PCI Compliance]
    
    C --> I[Display Masked]
    I --> J[Last 4 Digits]
    I --> K[Card Brand]
    I --> L[Expiry Date]
    
    style A fill:#dbeafe
    style F fill:#fef3c7
    style H fill:#dcfce7
\`\`\`

---

## Receipt & Invoice Generation

### Receipt Types

| Type | Description | Delivery Method | Use Case |
|------|-------------|----------------|----------|
| **Email Receipt** | Detailed transaction receipt | Email | Customer confirmation |
| **SMS Receipt** | Short transaction summary | SMS | Quick notification |
| **Printed Receipt** | Formatted for printing | PDF | In-person handout |
| **Invoice** | Itemized invoice with payment | Email/PDF | B2B transactions |

### Receipt Generation

\`\`\`javascript
// Generate and send receipt
const sendReceipt = async (transactionId, customerEmail) => {
  const receipt = await base44.functions.invoke('generateReceiptPDF', {
    transaction_id: transactionId,
    format: 'pdf',
    include_logo: true,
    include_terms: true
  });
  
  await base44.integrations.Core.SendEmail({
    to: customerEmail,
    subject: 'Payment Receipt',
    body: 'Thank you for your payment. Please find your receipt attached.',
    attachments: [receipt.data.pdf_url]
  });
};
\`\`\`

### Invoice Template

\`\`\`javascript
// Invoice generation with template
const generateInvoice = async (invoiceData) => {
  const template = await base44.asServiceRole.entities.InvoiceTemplate.filter({
    merchant_id: invoiceData.merchant_id,
    is_default: true
  });
  
  const invoice = await base44.asServiceRole.entities.Invoice.create({
    merchant_id: invoiceData.merchant_id,
    customer_id: invoiceData.customer_id,
    invoice_number: generateInvoiceNumber(),
    line_items: invoiceData.line_items,
    subtotal: calculateSubtotal(invoiceData.line_items),
    tax: calculateTax(invoiceData.line_items),
    total: calculateTotal(invoiceData.line_items),
    due_date: invoiceData.due_date,
    status: 'unpaid',
    template_id: template[0].id
  });
  
  return invoice;
};
\`\`\`

---

## Security & Compliance

### PCI DSS Compliance

\`\`\`mermaid
graph TB
    A[Card Entry] --> B[Client-side Encryption]
    B --> C[Secure Transmission]
    C --> D[Gateway Tokenization]
    D --> E[Token Storage]
    
    F[No Raw Card Storage]
    G[TLS 1.3 Encryption]
    H[Token-only References]
    I[Regular Security Audits]
    
    style B fill:#dcfce7
    style D fill:#dcfce7
    style E fill:#dcfce7
\`\`\`

### Security Features

| Feature | Description | Implementation |
|---------|-------------|----------------|
| **Tokenization** | Replace card data with tokens | Gateway-level tokenization |
| **TLS Encryption** | Secure data transmission | TLS 1.3 minimum |
| **CVV Requirements** | Mandatory CVV for CNP | Enforced in payment form |
| **3D Secure** | Strong customer authentication | Optional but recommended |
| **Fraud Detection** | AI-powered risk scoring | Real-time fraud engine |
| **IP Whitelisting** | Restrict VT access by IP | Optional security layer |
| **Session Timeout** | Auto-logout after inactivity | 15 minutes default |

### Transaction Limits

\`\`\`javascript
// Validate transaction against limits
const validateLimits = async (vtUser, amount) => {
  const vtConfig = await base44.asServiceRole.entities.VirtualTerminal.filter({
    merchant_id: vtUser.merchant_id
  });
  
  // Check per-transaction limit
  if (amount > vtConfig[0].per_transaction_limit) {
    throw new Error('Amount exceeds per-transaction limit');
  }
  
  // Check daily limit
  const todayTransactions = await getTodayTransactions(vtUser.id);
  const todayVolume = todayTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  if (todayVolume + amount > vtConfig[0].daily_limit) {
    throw new Error('Amount exceeds daily limit');
  }
  
  return true;
};
\`\`\`

---

## Configuration & Settings

### VT Configuration Entity

\`\`\`json
{
  "name": "VirtualTerminal",
  "properties": {
    "merchant_id": "string",
    "status": "enum[active, inactive]",
    "daily_limit": "number",
    "per_transaction_limit": "number",
    "allowed_currencies": "array",
    "requires_cvv": "boolean",
    "enable_3ds": "boolean",
    "enable_recurring": "boolean",
    "enable_split_tender": "boolean",
    "enable_itemized_sale": "boolean",
    "send_receipts_email": "boolean",
    "send_receipts_sms": "boolean",
    "allowed_roles": "array"
  }
}
\`\`\`

### Configuration Options

| Setting | Description | Default | Options |
|---------|-------------|---------|---------|
| **Daily Limit** | Maximum daily processing volume | $50,000 | Custom amount |
| **Per-Transaction Limit** | Maximum single transaction | $10,000 | Custom amount |
| **Allowed Currencies** | Currencies that can be processed | USD, EUR, GBP | Multi-select |
| **Require CVV** | Force CVV entry | Yes | Yes/No |
| **Enable 3DS** | Strong customer authentication | Yes | Yes/No |
| **Enable Recurring** | Allow subscription setup | Yes | Yes/No |
| **Email Receipts** | Send email receipts | Yes | Yes/No |
| **SMS Receipts** | Send SMS receipts | No | Yes/No |

---

## Reporting & Analytics

### VT Analytics Dashboard

\`\`\`mermaid
graph TB
    A[VT Analytics] --> B[Volume Metrics]
    A --> C[Transaction Stats]
    A --> D[Operator Performance]
    A --> E[Payment Methods]
    
    B --> B1[Daily Volume]
    B --> B2[Weekly Trends]
    B --> B3[Monthly Totals]
    
    C --> C1[Success Rate]
    C --> C2[Decline Rate]
    C --> C3[Average Ticket]
    
    D --> D1[Transactions per Operator]
    D --> D2[Volume per Operator]
    D --> D3[Error Rate]
    
    E --> E1[Card Brand Distribution]
    E --> E2[Card Type Split]
    
    style A fill:#dbeafe
    style B fill:#dcfce7
    style D fill:#fef3c7
\`\`\`

### Key Metrics

- **Total Volume**: Sum of all processed transactions
- **Transaction Count**: Number of transactions processed
- **Success Rate**: Percentage of approved transactions
- **Average Ticket**: Average transaction amount
- **Operator Activity**: Transactions per VT operator
- **Peak Hours**: Busiest times for VT usage

---

## Best Practices

### For Merchants

1. **Verify Customer Identity**: Always verify customer before processing
2. **Use 3D Secure**: Enable for high-value transactions
3. **Collect CVV**: Always require CVV for card-not-present
4. **Document Transactions**: Keep detailed notes for each transaction
5. **Monitor Limits**: Track daily volume to avoid hitting limits
6. **Train Staff**: Ensure VT operators understand fraud prevention

### For VT Operators

1. **Verify Card Details**: Double-check card number and expiry
2. **Collect Customer Info**: Get email/phone for receipts
3. **Use Descriptions**: Add clear transaction descriptions
4. **Send Receipts**: Always send customer confirmation
5. **Check Limits**: Verify transaction is within limits before processing
6. **Report Issues**: Escalate suspicious transactions immediately

---

## Support & Resources

### Help Resources

- **VT User Guide**: Step-by-step processing instructions
- **Video Tutorials**: Screen recordings of common tasks
- **FAQ**: Frequently asked questions
- **Live Support**: Chat/email support during business hours

### Contact

- **Technical Support**: vt-support@psp-domain.com
- **Sales Inquiries**: sales@psp-domain.com
- **Emergency Line**: +1-555-VT-HELP (24/7)

---

**End of Virtual Terminal Documentation**
`;

export default VirtualTerminalDoc;