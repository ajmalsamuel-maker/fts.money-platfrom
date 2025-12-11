export const FULL_API_SPEC = `# PSP Platform - API Contract Specification

**Version:** 1.0  
**Base URL (Production):** \`https://api.yourpsp.com\`  
**Base URL (Staging):** \`https://api-staging.yourpsp.com\`  
**Date:** December 11, 2025

---

## Authentication

### API Key Authentication

All API requests require authentication via API Key and HMAC signature.

**Headers Required:**
\`\`\`http
X-API-Key: your_api_key_here
X-Signature: hmac_sha256_signature
X-Timestamp: unix_timestamp_milliseconds
Content-Type: application/json
\`\`\`

**HMAC Signature Generation:**
\`\`\`javascript
// Node.js example
const crypto = require('crypto');

function generateSignature(method, path, body, timestamp, secret) {
    const message = \`\${method}\\n\${path}\\n\${timestamp}\\n\${JSON.stringify(body)}\`;
    return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

// Example usage
const signature = generateSignature(
    'POST',
    '/api/v1/transactions',
    { amount: 10000, currency: 'USD', ... },
    Date.now(),
    'your_api_secret'
);
\`\`\`

**Go Example:**
\`\`\`go
import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
)

func GenerateSignature(method, path, body string, secret string) string {
    timestamp := fmt.Sprintf("%d", time.Now().UnixMilli())
    message := fmt.Sprintf("%s\\n%s\\n%s\\n%s", method, path, timestamp, body)
    
    h := hmac.New(sha256.New, []byte(secret))
    h.Write([]byte(message))
    return hex.EncodeToString(h.Sum(nil))
}
\`\`\`

---

## Endpoints

### 1. Health Check

**GET** \`/health\`

Check API health status.

**Response:**
\`\`\`json
{
    "status": "healthy",
    "timestamp": "2025-12-11T10:30:45Z",
    "version": "1.0.0",
    "services": {
        "database": "healthy",
        "cache": "healthy",
        "queue": "healthy"
    }
}
\`\`\`

---

### 2. Create Transaction (Sale)

**POST** \`/api/v1/transactions\`

Process a sale transaction (authorize + capture in one step).

**Request Body:**
\`\`\`json
{
    "merchant_id": "merch_abc123",
    "merchant_transaction_id": "ORDER-2024-12345",
    "type": "sale",
    "amount": 10000,
    "currency": "USD",
    "payment_method": "credit_card",
    "card": {
        "number": "4111111111111111",
        "expiry_month": "12",
        "expiry_year": "2025",
        "cvv": "123",
        "holder_name": "John Doe"
    },
    "billing_address": {
        "line1": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "US"
    },
    "customer": {
        "email": "customer@example.com",
        "phone": "+1234567890",
        "ip_address": "192.168.1.1"
    }
}
\`\`\`

**Response (Success - 201 Created):**
\`\`\`json
{
    "transaction_id": "txn_xyz789",
    "merchant_transaction_id": "ORDER-2024-12345",
    "status": "approved",
    "amount": 10000,
    "currency": "USD",
    "payment_method": "visa",
    "card_last_four": "1111",
    "auth_code": "123456",
    "mid": "STREC000001",
    "provider_name": "Stripe",
    "response_code": "00",
    "response_message": "Approved",
    "created_at": "2025-12-11T10:30:45Z"
}
\`\`\`

**Response (Declined - 200 OK):**
\`\`\`json
{
    "transaction_id": "txn_xyz789",
    "status": "declined",
    "response_code": "05",
    "response_message": "Do not honor",
    "decline_reason": "insufficient_funds"
}
\`\`\`

---

### 3. Authorize Transaction

**POST** \`/api/v1/transactions/authorize\`

Authorize a transaction without capturing funds.

**Response:**
\`\`\`json
{
    "transaction_id": "txn_xyz789",
    "status": "authorized",
    "amount": 10000,
    "auth_code": "123456",
    "expires_at": "2025-12-18T10:30:45Z"
}
\`\`\`

---

### 4. Capture Transaction

**POST** \`/api/v1/transactions/{transaction_id}/capture\`

Capture a previously authorized transaction.

**Request Body:**
\`\`\`json
{
    "amount": 10000,
    "final": true
}
\`\`\`

---

### 5. Void Transaction

**POST** \`/api/v1/transactions/{transaction_id}/void\`

Void an authorized or sale transaction (same day only).

---

### 6. Refund Transaction

**POST** \`/api/v1/transactions/{transaction_id}/refund\`

Refund a captured transaction (partial or full).

**Request Body:**
\`\`\`json
{
    "amount": 5000,
    "reason": "Product return"
}
\`\`\`

---

### 7. Get Transaction

**GET** \`/api/v1/transactions/{transaction_id}\`

Retrieve transaction details.

---

### 8. List Transactions

**GET** \`/api/v1/transactions\`

List transactions with filters and pagination.

**Query Parameters:**
- \`merchant_id\` (optional): Filter by merchant
- \`status\` (optional): Filter by status
- \`date_from\` (optional): ISO 8601 date
- \`date_to\` (optional): ISO 8601 date
- \`limit\` (optional, default: 50, max: 100)
- \`offset\` (optional, default: 0)

---

### 9. Crypto Transaction

**POST** \`/api/v1/transactions/crypto\`

Process a cryptocurrency transaction.

**Request Body:**
\`\`\`json
{
    "merchant_id": "merch_abc123",
    "type": "sale",
    "amount": 100.00,
    "fiat_currency": "USD",
    "crypto_asset": "BTC",
    "blockchain_network": "bitcoin",
    "customer": {
        "name": "John Doe",
        "email": "john@example.com",
        "country": "US"
    },
    "destination_address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
}
\`\`\`

---

## Webhooks

### Webhook Events

Your webhook endpoint will receive POST requests for the following events:

**Event Types:**
- \`transaction.approved\`
- \`transaction.declined\`
- \`transaction.voided\`
- \`transaction.refunded\`
- \`transaction.chargeback\`
- \`settlement.completed\`
- \`crypto.confirmed\`

**Webhook Payload:**
\`\`\`json
{
    "event_type": "transaction.approved",
    "event_id": "evt_abc123",
    "timestamp": "2025-12-11T10:30:45Z",
    "data": {
        "transaction_id": "txn_xyz789",
        "merchant_id": "merch_abc123",
        "status": "approved",
        "amount": 10000,
        "currency": "USD"
    }
}
\`\`\`

---

## Error Codes

| Code | Description |
|------|-------------|
| \`AUTH_INVALID\` | Invalid API key or signature |
| \`VALIDATION_ERROR\` | Request validation failed |
| \`INVALID_CARD_NUMBER\` | Invalid card number format |
| \`INSUFFICIENT_FUNDS\` | Customer has insufficient funds |
| \`CARD_DECLINED\` | Card declined by issuer |
| \`FRAUD_DETECTED\` | Transaction flagged as fraudulent |
| \`RATE_LIMIT_EXCEEDED\` | Too many requests |
| \`TRANSACTION_NOT_FOUND\` | Transaction ID not found |
| \`INTERNAL_ERROR\` | Internal server error |

---

## Rate Limits

**Default Limits:**
- 1,000 requests per minute per merchant
- 10,000 requests per hour per merchant
- Burst: 100 requests in 1 second

**Rate Limit Exceeded Response (429):**
\`\`\`json
{
    "error": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again in 23 seconds",
    "retry_after": 23
}
\`\`\`

---

## Idempotency

Use \`Idempotency-Key\` header to prevent duplicate transactions.

**Request:**
\`\`\`http
POST /api/v1/transactions
Idempotency-Key: unique-key-12345
\`\`\`

---

## Testing

### Test Environment

**Base URL:** \`https://api-sandbox.yourpsp.com\`

### Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4111111111111111 | Approved |
| 4000000000000002 | Declined (insufficient funds) |
| 4000000000000069 | Declined (expired card) |
| 4000000000000127 | Declined (incorrect CVV) |

---

**Last Updated:** December 11, 2025  
**API Version:** 1.0.0
`;