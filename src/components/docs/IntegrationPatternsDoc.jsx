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
7. [Error Handling](#error-handling)
8. [Testing Strategies](#testing-strategies)

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

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default IntegrationPatternsDoc;