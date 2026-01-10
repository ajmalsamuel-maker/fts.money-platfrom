const IntegrationPatternsDoc = `# Integration Patterns Guide
## Best Practices for FTS.Money Integration

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Developer Documentation  

---

## Table of Contents

1. [Integration Overview](#integration-overview)
2. [Common Patterns](#common-patterns)
3. [E-commerce Integration](#e-commerce-integration)
4. [Subscription Billing](#subscription-billing)
5. [Marketplace Split Payments](#marketplace-split-payments)
6. [Mobile App Integration](#mobile-app-integration)
7. [Point-of-Sale Integration](#point-of-sale-integration)
8. [Webhook Integration](#webhook-integration)
9. [Error Handling](#error-handling)
10. [Testing Strategies](#testing-strategies)
11. [Performance Optimization](#performance-optimization)

---

## Integration Overview

### Integration Architecture

\`\`\`mermaid
graph TB
    subgraph "Your Application"
        APP[Application Backend]
        UI[Frontend/Mobile]
    end
    
    subgraph "FTS.Money API"
        API[API Gateway]
        PROC[Payment Processor]
        FRAUD[Fraud Detection]
        SETTLE[Settlement Engine]
    end
    
    subgraph "External Services"
        CARD[Card Networks]
        BANK[Banks]
        CRYPTO[Crypto Networks]
    end
    
    UI --> APP
    APP --> API
    
    API --> PROC
    API --> FRAUD
    API --> SETTLE
    
    PROC --> CARD
    PROC --> BANK
    PROC --> CRYPTO
    
    style API fill:#3b82f6,color:#fff
    style PROC fill:#10b981,color:#fff
\`\`\`

---

## Common Patterns

### Pattern 1: Simple Checkout

**Use Case:** E-commerce product checkout

\`\`\`javascript
// Frontend: Collect card details
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const response = await fetch('/api/create-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 9999,
      currency: 'usd',
      card: {
        number: document.getElementById('card-number').value,
        exp_month: document.getElementById('exp-month').value,
        exp_year: document.getElementById('exp-year').value,
        cvc: document.getElementById('cvc').value
      }
    })
  });
  
  const result = await response.json();
  
  if (result.status === 'succeeded') {
    window.location.href = '/success?payment_id=' + result.id;
  } else {
    alert('Payment failed: ' + result.error);
  }
});
\`\`\`

---

## E-commerce Integration

### Checkout Flow

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant Storefront
    participant Backend
    participant FTS as FTS.Money API
    participant DB as Database
    
    Customer->>Storefront: Add items to cart
    Customer->>Storefront: Click checkout
    
    Storefront->>Backend: POST /create-order
    Backend->>DB: Create order record
    DB-->>Backend: Order ID
    
    Backend->>FTS: POST /v1/payments
    FTS-->>Backend: Payment intent
    
    Backend->>Storefront: Return intent
    Storefront->>Customer: Display payment form
    
    Customer->>Storefront: Submit card details
    Storefront->>FTS: Confirm payment
    
    alt Payment Success
        FTS-->>Storefront: Payment succeeded
        Storefront->>Backend: Update order status
        Backend->>DB: Mark order paid
        Storefront->>Customer: Order confirmation
    else Payment Failed
        FTS-->>Storefront: Payment failed
        Storefront->>Customer: Error message
    end
\`\`\`

---

## Subscription Billing

### Recurring Payment Pattern

\`\`\`javascript
// Create subscription
const subscription = await fts.subscriptions.create({
  customer_id: 'cust_12345',
  plan_id: 'plan_pro_monthly',
  billing_cycle: 'monthly',
  billing_day: 1,
  payment_method: {
    type: 'card',
    card_id: 'card_saved_xyz'
  },
  metadata: {
    plan_name: 'Pro Plan',
    features: ['feature_1', 'feature_2']
  }
});

// Handle subscription webhook
app.post('/webhooks/fts', (req, res) => {
  const event = req.body;
  
  switch(event.type) {
    case 'subscription.payment_succeeded':
      // Extend service access
      await extendAccess(event.data.customer_id);
      break;
      
    case 'subscription.payment_failed':
      // Retry or suspend
      await handleFailedPayment(event.data);
      break;
      
    case 'subscription.cancelled':
      // Revoke access
      await revokeAccess(event.data.customer_id);
      break;
  }
  
  res.json({ received: true });
});
\`\`\`

---

## Error Handling

### Retry Strategy

\`\`\`javascript
async function processPaymentWithRetry(paymentData, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const payment = await fts.payments.create(paymentData);
      return payment;
      
    } catch (error) {
      if (error.code === 'network_error' && attempt < maxRetries) {
        // Retry on network errors
        await sleep(1000 * attempt);
        continue;
      }
      
      if (error.code === 'card_declined') {
        // Don't retry card declines
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
}
\`\`\`

---

## Marketplace Split Payments

### Multi-Party Transaction Pattern

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant Marketplace
    participant FTS as FTS.Money
    participant Seller1 as Seller A
    participant Seller2 as Seller B
    
    Customer->>Marketplace: Purchase from 2 sellers
    Marketplace->>FTS: Create payment $100
    
    FTS->>FTS: Charge customer $100
    FTS->>FTS: Calculate splits
    
    FTS->>Marketplace: Platform fee $5
    FTS->>Seller1: $45 (minus 3% fee)
    FTS->>Seller2: $47 (minus 3% fee)
    
    FTS-->>Marketplace: Payment complete
    Marketplace-->>Customer: Order confirmed
\`\`\`

### Split Payment Implementation

\`\`\`javascript
// Create split payment
const payment = await fts.payments.create({
  amount: 10000, // $100.00
  currency: 'usd',
  splits: [
    {
      destination: 'acct_seller_a',
      amount: 4500,
      description: 'Product A sale'
    },
    {
      destination: 'acct_seller_b',
      amount: 4700,
      description: 'Product B sale'
    },
    {
      destination: 'acct_platform',
      amount: 800,
      description: 'Platform fee'
    }
  ],
  metadata: {
    order_id: 'order_12345',
    cart_items: ['item_a', 'item_b']
  }
});
\`\`\`

---

## Point-of-Sale Integration

### Terminal Payment Flow

\`\`\`mermaid
flowchart TD
    START[Cashier Enters Amount] --> TERM[Send to Terminal]
    TERM --> DISPLAY[Display on Terminal]
    DISPLAY --> INSERT[Customer Inserts Card]
    
    INSERT --> READ[Read Chip/Contactless]
    READ --> PIN{PIN Required?}
    
    PIN -->|Yes| ENTER[Enter PIN]
    PIN -->|No| PROCESS
    ENTER --> PROCESS[Process Payment]
    
    PROCESS --> AUTH{Approved?}
    
    AUTH -->|Yes| PRINT[Print Receipt]
    AUTH -->|No| DECLINE[Show Decline]
    
    PRINT --> DONE[Transaction Complete]
    DECLINE --> RETRY{Retry?}
    
    RETRY -->|Yes| INSERT
    RETRY -->|No| CANCEL[Cancel Transaction]
    
    style AUTH fill:#3b82f6,color:#fff
    style DONE fill:#10b981,color:#fff
    style DECLINE fill:#ef4444,color:#fff
\`\`\`

### Terminal SDK Integration

\`\`\`javascript
import { TerminalSDK } from '@fts-money/terminal-sdk';

// Initialize terminal connection
const terminal = new TerminalSDK({
  apiKey: 'sk_live_...',
  terminalId: 'term_abc123'
});

// Process card present transaction
async function processTerminalPayment(amount) {
  try {
    // Display amount on terminal
    await terminal.display({
      amount,
      currency: 'usd',
      message: 'Insert or tap card'
    });
    
    // Wait for card
    const payment = await terminal.collectPayment({
      amount,
      currency: 'usd',
      capture_method: 'automatic'
    });
    
    if (payment.status === 'succeeded') {
      // Print receipt
      await terminal.print({
        template: 'receipt',
        data: {
          amount: payment.amount,
          last4: payment.card.last4,
          auth_code: payment.authorization_code
        }
      });
    }
    
    return payment;
    
  } catch (error) {
    await terminal.display({
      message: 'Payment failed',
      duration: 3000
    });
    throw error;
  }
}
\`\`\`

---

## Webhook Integration

### Webhook Security

\`\`\`javascript
import crypto from 'crypto';

// Verify webhook signature
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express webhook handler
app.post('/webhooks/fts', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['fts-signature'];
  const payload = req.body.toString();
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  // Process event asynchronously
  processWebhook(event).catch(console.error);
  
  // Respond quickly (< 3 seconds)
  res.json({ received: true });
});
\`\`\`

### Webhook Retry Logic

\`\`\`yaml
webhook_delivery:
  initial_attempt:
    timeout: 5 seconds
    
  retry_schedule:
    - delay: 5 minutes
    - delay: 30 minutes
    - delay: 2 hours
    - delay: 6 hours
    - delay: 24 hours
    
  max_attempts: 5
  
  failure_handling:
    - Log failed delivery
    - Email notification after 3 failures
    - Disable endpoint after 5 failures
\`\`\`

---

## Performance Optimization

### Connection Pooling

\`\`\`javascript
// Reuse HTTP connections
import { Agent } from 'https';

const httpsAgent = new Agent({
  keepAlive: true,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 30000
});

// Configure FTS SDK
const fts = new FTS({
  apiKey: 'sk_live_...',
  httpAgent: httpsAgent
});
\`\`\`

### Batch Processing

\`\`\`javascript
// Process payments in batches
async function batchProcessPayments(payments, batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < payments.length; i += batchSize) {
    const batch = payments.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchResults = await Promise.allSettled(
      batch.map(payment => fts.payments.create(payment))
    );
    
    results.push(...batchResults);
    
    // Rate limit protection
    if (i + batchSize < payments.length) {
      await sleep(1000);
    }
  }
  
  return results;
}
\`\`\`

### Caching Strategies

\`\`\`javascript
// Cache merchant data
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 min TTL

async function getMerchantWithCache(merchantId) {
  const cacheKey = \`merchant_\${merchantId}\`;
  
  // Try cache first
  let merchant = cache.get(cacheKey);
  
  if (!merchant) {
    // Fetch from API
    merchant = await fts.merchants.retrieve(merchantId);
    cache.set(cacheKey, merchant);
  }
  
  return merchant;
}
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default IntegrationPatternsDoc;