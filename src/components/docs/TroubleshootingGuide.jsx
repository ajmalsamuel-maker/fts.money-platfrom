const TroubleshootingGuide = `# Troubleshooting Guide
## Common Issues & Solutions Across FTS.Money Services

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Support Documentation  

---

## Table of Contents

1. [Payment Processing Issues](#payment-processing-issues)
2. [API Integration Problems](#api-integration-problems)
3. [Authentication Failures](#authentication-failures)
4. [Settlement Issues](#settlement-issues)
5. [ISO Gateway Errors](#iso-gateway-errors)
6. [Crypto Gateway Issues](#crypto-gateway-issues)
7. [Billing & Invoicing Problems](#billing--invoicing-problems)

---

## Payment Processing Issues

### Issue: Card Declined

**Symptoms:**
- Transaction returns \`card_declined\` error
- Customer claims card works elsewhere

**Common Causes & Solutions:**

| Cause | Solution | Prevention |
|-------|----------|------------|
| **Insufficient funds** | Customer contact bank | N/A - legitimate decline |
| **Wrong CVV** | Re-enter card details | Implement better UI validation |
| **Expired card** | Request updated card | Auto-detect expiry date in past |
| **Fraud block** | Review fraud score, whitelist if legitimate | Adjust fraud thresholds |
| **3DS required** | Enable 3DS authentication | Always use 3DS for >$100 |

**Diagnostic Steps:**
\`\`\`bash
# Check transaction details
curl -X GET https://api.fts.money/v1/transactions/{txn_id} \\
  -H "Authorization: Bearer sk_live_..."

# Review decline reason
{
  "id": "txn_abc123",
  "status": "declined",
  "decline_code": "insufficient_funds",
  "decline_message": "Your card has insufficient funds."
}
\`\`\`

---

## API Integration Problems

### Issue: 401 Unauthorized

**Error Message:** \`Invalid API key provided\`

**Solutions:**
1. Verify API key starts with \`sk_live_\` (production) or \`sk_test_\` (sandbox)
2. Check key hasn't been revoked in portal
3. Ensure key is in \`Authorization: Bearer\` header
4. Verify environment (test key won't work in production)

**Example:**
\`\`\`javascript
// ❌ Wrong
fetch('https://api.fts.money/v1/payments', {
  headers: { 'API-Key': 'sk_live_abc...' }  // Wrong header name
});

// ✅ Correct
fetch('https://api.fts.money/v1/payments', {
  headers: { 'Authorization': 'Bearer sk_live_abc...' }
});
\`\`\`

---

## Authentication Failures

### Issue: Session Expired

**Symptoms:**
- Redirected to login unexpectedly
- "Session expired" error message

**Solutions:**
1. Sessions expire after 30 minutes idle
2. Extend session by making any API call
3. Implement auto-refresh token logic
4. Store session with expiry timestamp

**Prevention:**
\`\`\`javascript
// Auto-refresh session every 20 minutes
setInterval(async () => {
  await fetch('/api/refresh-session', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + sessionToken
    }
  });
}, 20 * 60 * 1000);
\`\`\`

---

## Settlement Issues

### Issue: Settlement Delayed

**Common Reasons:**

\`\`\`mermaid
flowchart TD
    DELAY[Settlement Delayed] --> CHECK1{Bank holiday?}
    CHECK1 -->|Yes| SOL1[Settles next business day]
    CHECK1 -->|No| CHECK2{High chargeback rate?}
    
    CHECK2 -->|Yes| SOL2[Rolling reserve applied<br/>Contact support]
    CHECK2 -->|No| CHECK3{New merchant?}
    
    CHECK3 -->|Yes| SOL3[Extended hold period<br/>Review merchant status]
    CHECK3 -->|No| CHECK4{Reconciliation error?}
    
    CHECK4 -->|Yes| SOL4[Contact finance team<br/>Manual reconciliation]
    CHECK4 -->|No| SOL5[Escalate to support]
\`\`\`

---

## ISO Gateway Errors

### Issue: Message Translation Failed

**Error Codes:**

| Code | Meaning | Solution |
|------|---------|----------|
| \`ISO001\` | Invalid message format | Verify MTI and required fields |
| \`ISO002\` | Unsupported field | Check field compatibility matrix |
| \`ISO003\` | Translation timeout | Retry or contact support |
| \`ISO004\` | Connection refused | Verify endpoint configuration |

**Debugging:**
\`\`\`bash
# Test message translation
curl -X POST https://api.fts.money/v1/iso-gateway/translate \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "source_format": "ISO_8583",
    "target_format": "ISO_20022",
    "message": {...}
  }'
\`\`\`

---

## Crypto Gateway Issues

### Issue: Wallet Creation Failed

**Symptoms:**
- \`wallet_creation_failed\` error
- Customer cannot deposit crypto

**Diagnostic Checklist:**
\`\`\`yaml
troubleshooting_steps:
  1_check_kyc:
    - KYC must be approved
    - Solution: Complete KYC verification first
    
  2_check_limits:
    - Daily wallet creation limit: 100
    - Solution: Wait 24 hours or upgrade tier
    
  3_check_blockchain:
    - Verify blockchain network status
    - Solution: Check status.fts.money
    
  4_check_balance:
    - Ensure sufficient gas for deployment
    - Solution: Top up platform gas balance
\`\`\`

---

## Billing & Invoicing Problems

### Issue: Invoice Not Generated

**Common Causes:**

\`\`\`mermaid
flowchart TD
    NO_INV[Invoice Missing] --> PERIOD{Billing period ended?}
    PERIOD -->|No| WAIT[Wait until month-end]
    PERIOD -->|Yes| USAGE{Any usage recorded?}
    
    USAGE -->|No| ZERO[No usage = no invoice]
    USAGE -->|Yes| STATUS{Payment method valid?}
    
    STATUS -->|No| UPDATE[Update payment method]
    STATUS -->|Yes| SYSTEM[System error<br/>Contact support]
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default UserJourneyMapsDoc;