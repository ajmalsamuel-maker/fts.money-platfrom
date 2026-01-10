const MigrationGuidesDoc = `# Migration Guides
## Migrate to FTS.Money from Other Payment Platforms

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Technical Documentation  

---

## Table of Contents

1. [Migrating from Stripe](#migrating-from-stripe)
2. [Migrating from PayPal](#migrating-from-paypal)
3. [Legacy System Migration](#legacy-system-migration)
4. [Data Migration](#data-migration)
5. [Zero-Downtime Migration](#zero-downtime-migration)

---

## Migrating from Stripe

### API Compatibility

FTS.Money API is designed to be similar to Stripe for easy migration.

**Stripe Code:**
\`\`\`javascript
const stripe = require('stripe')('sk_live_...');

const payment = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
  payment_method: 'pm_card_visa'
});
\`\`\`

**FTS.Money Equivalent:**
\`\`\`javascript
const fts = require('@fts-money/sdk')('sk_live_...');

const payment = await fts.payments.create({
  amount: 2000,
  currency: 'usd',
  payment_method: {
    type: 'card',
    card_id: 'card_visa_123'
  }
});
\`\`\`

### Migration Checklist

\`\`\`yaml
stripe_to_fts_migration:
  phase_1_preparation:
    - [ ] Audit current Stripe integration
    - [ ] List all Stripe features used
    - [ ] Review customer data
    - [ ] Export historical transactions
    
  phase_2_setup:
    - [ ] Create FTS.Money account
    - [ ] Provision PSP instance
    - [ ] Configure payment methods
    - [ ] Set up webhooks
    
  phase_3_integration:
    - [ ] Install FTS SDK
    - [ ] Update API calls
    - [ ] Migrate webhook handlers
    - [ ] Test in sandbox
    
  phase_4_data_migration:
    - [ ] Import customer data
    - [ ] Migrate saved cards (tokenization)
    - [ ] Transfer subscription data
    
  phase_5_cutover:
    - [ ] Enable parallel processing
    - [ ] Monitor both systems
    - [ ] Gradual traffic shift
    - [ ] Decommission Stripe
\`\`\`

---

## Zero-Downtime Migration

### Parallel Processing Strategy

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant App as Your Application
    participant Stripe
    participant FTS as FTS.Money
    participant DB as Database
    
    Note over App: Phase 1: Dual Write (Week 1-2)
    Customer->>App: New payment
    App->>FTS: Create payment
    App->>Stripe: Create payment (backup)
    FTS-->>App: Success
    App->>DB: Log both IDs
    App-->>Customer: Success
    
    Note over App: Phase 2: Gradual Shift (Week 3-4)
    Customer->>App: Payment request
    App->>App: Route 50% to FTS, 50% to Stripe
    App-->>Customer: Success
    
    Note over App: Phase 3: Full Cutover (Week 5)
    Customer->>App: Payment request
    App->>FTS: All traffic to FTS
    FTS-->>App: Success
    App-->>Customer: Success
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default MigrationGuidesDoc;