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
3. [ISO Gateway API](#iso-gateway-api)
4. [Orchestration API](#orchestration-api)
5. [Crypto Gateway API](#crypto-gateway-api)
6. [RWA Platform API](#rwa-platform-api)
7. [Tax Calculation API](#tax-calculation-api)
8. [E-Invoicing API](#e-invoicing-api)
9. [Webhooks](#webhooks)
10. [Error Codes](#error-codes)
11. [Rate Limits](#rate-limits)

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

## Error Codes

| Code | Message | Resolution |
|------|---------|------------|
| **400** | Bad Request | Check request format |
| **401** | Unauthorized | Verify API key |
| **403** | Forbidden | Check permissions |
| **404** | Not Found | Verify resource ID |
| **429** | Rate Limit | Reduce request rate |
| **500** | Server Error | Contact support |

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026

© 2026 FTS.Money. All rights reserved.
`;

export default APIReferenceGuide;