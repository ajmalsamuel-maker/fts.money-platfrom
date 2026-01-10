const APIReferenceGuide = `# FTS.Money API Reference Guide
## Complete REST API Documentation

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Developer Documentation  
**Base URL:** \`https://api.fts.money\`

---

## Table of Contents

1. [Authentication](#authentication)
2. [PSP Platform API](#psp-platform-api)
3. [Merchant Management API](#merchant-management-api)
4. [ISO Gateway API](#iso-gateway-api)
5. [Orchestration API](#orchestration-api)
6. [Crypto Gateway API](#crypto-gateway-api)
7. [RWA Platform API](#rwa-platform-api)
8. [Tax Calculation API](#tax-calculation-api)
9. [E-Invoicing API](#e-invoicing-api)
10. [Billing & Usage API](#billing--usage-api)
11. [Webhooks](#webhooks)
12. [Error Codes](#error-codes)
13. [Rate Limits](#rate-limits)
14. [Pagination](#pagination)
15. [Idempotency](#idempotency)

---

## Authentication

### API Key Authentication

All API requests require authentication via API key in the \`Authorization\` header.

\`\`\`bash
curl -X GET https://api.fts.money/v1/transactions \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json"
\`\`\`

**API Key Types:**

| Type | Prefix | Usage | Rate Limit |
|------|--------|-------|------------|
| **Live** | \`sk_live_\` | Production | 10,000/hour |
| **Test** | \`sk_test_\` | Sandbox | 1,000/hour |
| **Restricted** | \`sk_rest_\` | Limited scope | 5,000/hour |

---

## PSP Platform API

### Create Transaction

**POST** \`/v1/payments\`

Process a payment transaction.

**Request:**
\`\`\`json
{
  "amount": 9999,
  "currency": "USD",
  "payment_method": {
    "type": "card",
    "card": {
      "number": "4111111111111111",
      "exp_month": 12,
      "exp_year": 2027,
      "cvc": "123"
    }
  },
  "billing_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": {
      "line1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "US"
    }
  },
  "metadata": {
    "order_id": "order_12345",
    "customer_id": "cust_67890"
  }
}
\`\`\`

**Response (Success):**
\`\`\`json
{
  "id": "txn_abc123xyz",
  "status": "succeeded",
  "amount": 9999,
  "currency": "usd",
  "created": 1704931200,
  "payment_method": {
    "type": "card",
    "brand": "visa",
    "last4": "1111",
    "exp_month": 12,
    "exp_year": 2027
  },
  "receipt_url": "https://api.fts.money/receipts/txn_abc123xyz",
  "metadata": {
    "order_id": "order_12345",
    "customer_id": "cust_67890"
  }
}
\`\`\`

---

## ISO Gateway API

### Translate Message

**POST** \`/v1/iso-gateway/translate\`

Translate payment message between standards.

**Request:**
\`\`\`json
{
  "source_format": "ISO_8583",
  "target_format": "ISO_20022",
  "message": {
    "mti": "0100",
    "fields": {
      "2": "4111111111111111",
      "3": "000000",
      "4": "000000010000",
      "7": "0626101530",
      "11": "123456"
    }
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "translation_id": "trans_xyz789",
  "status": "success",
  "source_format": "ISO_8583",
  "target_format": "ISO_20022",
  "translated_message": {
    "Document": {
      "FIToFICstmrCdtTrf": {
        "GrpHdr": {
          "MsgId": "MSG123456",
          "CreDtTm": "2026-06-26T10:15:30Z"
        },
        "CdtTrfTxInf": {
          "Amt": {
            "InstdAmt": {
              "Ccy": "USD",
              "Value": 100.00
            }
          }
        }
      }
    }
  },
  "processing_time_ms": 45
}
\`\`\`

---

## Orchestration API

### Create Routing Rule

**POST** \`/v1/orchestration/rules\`

Define intelligent routing strategy.

**Request:**
\`\`\`json
{
  "name": "EU High-Value Route",
  "priority": 1,
  "enabled": true,
  "conditions": {
    "amount": { "gte": 1000 },
    "currency": "EUR",
    "customer_country": ["DE", "FR", "IT", "ES"]
  },
  "routes": {
    "primary": "processor_adyen",
    "fallback": ["processor_stripe", "processor_checkout"]
  },
  "retry_config": {
    "max_attempts": 3,
    "delay_ms": 1000
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "rule_id": "rule_abc123",
  "status": "active",
  "created_at": "2026-01-10T14:30:00Z"
}
\`\`\`

---

## Crypto Gateway API

### Create Wallet

**POST** \`/v1/crypto/wallets\`

Create multi-chain cryptocurrency wallet.

**Request:**
\`\`\`json
{
  "customer_id": "cust_12345",
  "currencies": ["BTC", "ETH", "USDC"],
  "wallet_type": "custodial",
  "metadata": {
    "customer_email": "john@example.com"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "wallet_id": "wallet_xyz789",
  "addresses": {
    "BTC": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    "ETH": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "USDC": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  },
  "created_at": "2026-01-10T14:30:00Z"
}
\`\`\`

---

## RWA Platform API

### Tokenize Asset

**POST** \`/v1/rwa/assets/tokenize\`

Deploy security token contract for real-world asset.

**Request:**
\`\`\`json
{
  "asset_name": "Manhattan Office Building",
  "asset_type": "real_estate",
  "asset_value_usd": 100000000,
  "token_config": {
    "symbol": "MHOB",
    "total_supply": 100000,
    "token_price": 1000
  },
  "blockchain": "polygon",
  "compliance": {
    "accredited_only": true,
    "jurisdictions": ["US", "GB", "SG"]
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "asset_id": "asset_abc123",
  "token_contract": "0xabc123...",
  "status": "deployed",
  "deployed_at": "2026-01-10T14:35:00Z"
}
\`\`\`

---

## Tax Calculation API

### Calculate Tax

**POST** \`/v1/tax/calculate\`

Real-time VAT/GST calculation for transaction.

**Request:**
\`\`\`json
{
  "transaction": {
    "amount": 99.99,
    "currency": "EUR",
    "service_type": "payment_processing"
  },
  "merchant": {
    "country": "IE",
    "vat_number": "IE1234567X",
    "business_type": "b2b"
  },
  "customer": {
    "country": "DE",
    "vat_number": "DE123456789"
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "tax_treatment": "reverse_charge",
  "tax_jurisdiction": "DE",
  "tax_type": "VAT",
  "tax_rate": 0.00,
  "tax_amount": 0.00,
  "net_amount": 99.99,
  "gross_amount": 99.99,
  "reverse_charge": true,
  "invoice_note": "Reverse charge - VAT to be accounted for by recipient"
}
\`\`\`

---

## Webhooks

### Webhook Events

\`\`\`yaml
webhook_events:
  payment_events:
    - payment.succeeded
    - payment.failed
    - payment.refunded
    - payment.disputed
    
  merchant_events:
    - merchant.created
    - merchant.updated
    - merchant.approved
    - merchant.suspended
    
  settlement_events:
    - settlement.initiated
    - settlement.completed
    - settlement.failed
\`\`\`

---

## Merchant Management API

### Create Merchant

**POST** \`/v1/merchants\`

Onboard a new merchant to your PSP platform.

**Request:**
\`\`\`json
{
  "business_name": "Acme Corporation",
  "email": "billing@acme.com",
  "website": "https://acme.com",
  "business_type": "corporation",
  "mcc": "5411",
  "tax_id": "12-3456789",
  "address": {
    "line1": "123 Main Street",
    "city": "San Francisco",
    "state": "CA",
    "postal_code": "94102",
    "country": "US"
  },
  "contact_person": {
    "name": "John Smith",
    "email": "john@acme.com",
    "phone": "+1-555-0123"
  },
  "processing_details": {
    "expected_monthly_volume": 100000,
    "average_transaction_size": 50,
    "currencies": ["USD", "EUR"]
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "merchant_id": "merch_abc123",
  "status": "pending_verification",
  "api_keys": {
    "publishable_key": "pk_test_xyz789",
    "secret_key": "sk_test_abc123"
  },
  "onboarding_url": "https://portal.fts.money/onboard/merch_abc123",
  "created_at": "2026-01-10T14:30:00Z"
}
\`\`\`

---

## Billing & Usage API

### Get Usage Metrics

**GET** \`/v1/usage/current\`

Retrieve current billing period usage.

**Query Parameters:**
- \`service_type\` - Filter by service (psp, iso_gateway, crypto, etc.)
- \`metric_type\` - Metric to query (transactions, messages, api_calls)

**Response:**
\`\`\`json
{
  "billing_period": {
    "start_date": "2026-01-01",
    "end_date": "2026-01-31",
    "days_remaining": 21
  },
  "usage": {
    "psp_payment_processing": {
      "transactions": {
        "included": 10000,
        "used": 7543,
        "remaining": 2457,
        "overage": 0
      },
      "estimated_charge": 499.00
    },
    "iso_gateway": {
      "messages": {
        "included": 100000,
        "used": 125433,
        "remaining": 0,
        "overage": 25433
      },
      "overage_rate": 0.05,
      "estimated_charge": 2499.00 + (25433 * 0.05)
    }
  },
  "total_estimated": 3770.65,
  "currency": "USD"
}
\`\`\`

---

## Error Codes

### HTTP Status Codes

| Code | Message | Description | Resolution |
|------|---------|-------------|------------|
| **200** | OK | Request succeeded | N/A |
| **201** | Created | Resource created | N/A |
| **400** | Bad Request | Invalid request format | Check JSON syntax, required fields |
| **401** | Unauthorized | Invalid/missing API key | Verify \`Authorization\` header |
| **403** | Forbidden | Insufficient permissions | Check API key scope |
| **404** | Not Found | Resource doesn't exist | Verify resource ID |
| **409** | Conflict | Resource already exists | Use PUT to update |
| **422** | Validation Error | Business logic validation failed | Check error details |
| **429** | Rate Limit | Too many requests | Wait before retrying |
| **500** | Server Error | Internal server error | Retry, contact support |
| **503** | Service Unavailable | Temporary outage | Check status.fts.money |

### API Error Response Format

\`\`\`json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid merchant data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "tax_id",
        "message": "Tax ID is required for US businesses"
      }
    ],
    "request_id": "req_xyz789",
    "documentation_url": "https://docs.fts.money/errors/validation_error"
  }
}
\`\`\`

---

## Rate Limits

### Rate Limit Tiers

| Tier | Requests/Hour | Burst | Overage |
|------|---------------|-------|---------|
| **Test** | 1,000 | 100/min | Hard limit |
| **Starter** | 5,000 | 200/min | Throttled |
| **Professional** | 10,000 | 500/min | Throttled |
| **Enterprise** | Custom | Custom | Never throttled |

### Rate Limit Headers

Every API response includes rate limit information:

\`\`\`http
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9847
X-RateLimit-Reset: 1704937400
X-RateLimit-Retry-After: 3600
\`\`\`

### Handling Rate Limits

\`\`\`javascript
async function apiCallWithRetry(endpoint, data, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk_live_...',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('X-RateLimit-Retry-After');
        await sleep(retryAfter * 1000);
        continue;
      }
      
      return await response.json();
      
    } catch (error) {
      if (attempt === maxRetries) throw error;
    }
  }
}
\`\`\`

---

## Pagination

### Cursor-Based Pagination

All list endpoints support cursor-based pagination for consistent results.

**Request:**
\`\`\`bash
GET /v1/transactions?limit=100&starting_after=txn_xyz789
\`\`\`

**Response:**
\`\`\`json
{
  "data": [...],
  "has_more": true,
  "next_cursor": "txn_abc456"
}
\`\`\`

### Pagination Best Practices

\`\`\`javascript
async function fetchAllTransactions() {
  const allTransactions = [];
  let cursor = null;
  
  do {
    const params = new URLSearchParams({
      limit: 100,
      ...(cursor && { starting_after: cursor })
    });
    
    const response = await fetch(
      \`/v1/transactions?\${params}\`,
      { headers: { 'Authorization': 'Bearer sk_live_...' } }
    );
    
    const { data, has_more, next_cursor } = await response.json();
    
    allTransactions.push(...data);
    cursor = has_more ? next_cursor : null;
    
  } while (cursor);
  
  return allTransactions;
}
\`\`\`

---

## Idempotency

### Idempotent Requests

Prevent duplicate operations by including an idempotency key.

\`\`\`bash
POST /v1/payments
Idempotency-Key: order_12345_payment_attempt_1

{
  "amount": 9999,
  "currency": "usd",
  "description": "Order #12345"
}
\`\`\`

**Behavior:**
- First request: Processes payment, returns 201 Created
- Duplicate request (same key): Returns original 201 response
- Key expires after 24 hours

\`\`\`javascript
// Generate idempotency key
import { randomUUID } from 'crypto';

function createPayment(orderData) {
  const idempotencyKey = \`order_\${orderData.id}_\${randomUUID()}\`;
  
  return fetch('/v1/payments', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_live_...',
      'Idempotency-Key': idempotencyKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });
}
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default APIReferenceGuide;