const ISOGatewayOperationsSOPs = `# ISO Gateway Operations Standard Operating Procedures
## Message Translation, Routing & Legacy Integration

**Document Classification:** Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** ISO Gateway Operations Manager

---

## Table of Contents

1. [Overview](#overview)
2. [Customer Connection Setup](#customer-connection-setup)
3. [Message Translation Configuration](#message-translation)
4. [Real-Time Message Monitoring](#message-monitoring)
5. [Routing Rules Management](#routing-rules)
6. [Error Handling & Retries](#error-handling)
7. [Performance Optimization](#performance-optimization)

---

## Overview

### ISO Gateway Service Model

FTS.Money ISO Gateway provides **real-time bidirectional translation** between:
- ISO 8583 (ATM, POS, legacy core banking)
- ISO 20022 (modern payment messaging)
- SWIFT MT (international messaging)
- Custom formats (proprietary systems)

### Supported Message Types

| Standard | Message Count | Use Cases | Complexity |
|----------|--------------|-----------|------------|
| **ISO 8583** | 200+ message types | ATM, POS, card authorization, settlement | High |
| **ISO 20022** | 400+ message types | SEPA, instant payments, account statements | Very High |
| **SWIFT MT** | 300+ message types | International wire transfers, trade finance | High |
| **Custom/Proprietary** | Varies | Legacy core banking, regional switches | Variable |

---

## SOP-ISO-001: Customer Connection Setup & Onboarding

### Purpose
Establish secure, reliable connections between customer systems and FTS ISO Gateway.

### Connection Types

\`\`\`mermaid
graph TB
    A[Customer System] --> B{Connection Type}
    
    B -->|TCP/IP Socket| C[Direct Socket Connection]
    B -->|HTTPS REST API| D[REST API Integration]
    B -->|Message Queue| E[RabbitMQ / IBM MQ]
    B -->|SFTP Batch| F[File-Based Exchange]
    
    C --> G[FTS ISO Gateway]
    D --> G
    E --> G
    F --> G
    
    G --> H[Translation Engine]
    H --> I[Routing Logic]
    I --> J[Destination System]
    
    style G fill:#3b82f6,color:#fff
\`\`\`

### Connection Setup Workflow

**Phase 1: Discovery & Requirements (Days 1-3)**

| Information to Collect | Purpose | Format |
|----------------------|---------|--------|
| Source message format | Understand what we're translating FROM | ISO 8583 v1987/1993/2003, ISO 20022 pain.001, SWIFT MT103, custom spec |
| Target message format | Understand what we're translating TO | Same options |
| Message volume | Capacity planning | Messages per hour (avg and peak) |
| Connection method | Technical integration approach | TCP, HTTPS, MQ, SFTP |
| Security requirements | Encryption, authentication | TLS version, certificate auth, IP whitelist |
| Retry/timeout requirements | Resilience design | Max retries, timeout values |
| Test scenarios | Validation planning | Sample messages, edge cases |

**Phase 2: Technical Configuration (Days 4-7)**

\`\`\`mermaid
sequenceDiagram
    participant Customer as Customer Tech Team
    participant FTS as FTS Solutions Engineer
    participant Gateway as ISO Gateway
    participant Test as Test Environment
    
    Customer->>FTS: Provide connection details
    FTS->>Gateway: Configure connection profile
    Gateway->>Gateway: Create translation rules
    
    FTS->>Test: Deploy to test environment
    FTS->>Customer: Provide test endpoint details
    
    Customer->>Test: Send test message #1
    Test->>Test: Translate message
    Test->>Customer: Return translated message
    
    Customer->>Customer: Validate translation accuracy
    Customer->>FTS: Confirm or request adjustments
    
    FTS->>Gateway: Refine translation rules
    
    loop Test Cycles (typically 3-5 iterations)
        Customer->>Test: Send test scenarios
        Test->>Customer: Return results
        Customer->>FTS: Feedback
    end
    
    Customer->>FTS: Approve for production
    FTS->>Gateway: Deploy to production
    Gateway->>Customer: Production endpoint active
\`\`\`

### Translation Rule Configuration

**Example: ISO 8583 (ATM) → ISO 20022 (Bank Core Banking)**

**Mapping Table:**

| ISO 8583 Field | Field Name | ISO 20022 Element | Transformation |
|----------------|-----------|-------------------|----------------|
| Field 2 | Primary Account Number (PAN) | DbtrAcct.Id.Othr.Id | Mask last 12 digits (PCI compliance) |
| Field 3 | Processing Code | Purp.Prtry | Map 00XXXX codes to ISO 20022 purpose codes |
| Field 4 | Amount, Transaction | IntrBkSttlmAmt | Divide by 100 (cents to dollars) |
| Field 7 | Transmission Date & Time | CreDtTm | Convert MMDDhhmmss to ISO 8601 |
| Field 11 | Systems Trace Audit Number | EndToEndId | Prefix with FTS-ISO- |
| Field 32 | Acquiring Institution ID | InstgAgt.FinInstnId.BICFI | Lookup BIC from institution ID table |
| Field 49 | Currency Code, Transaction | IntrBkSttlmAmt.Ccy | Map numeric to alpha (840 → USD) |

**Complex Transformation Logic:**

\`\`\`javascript
// Example: Processing Code Translation
function translateProcessingCode(iso8583ProcessCode) {
  const transactionType = processingCode.substring(0, 2);
  const fromAccount = processingCode.substring(2, 4);
  const toAccount = processingCode.substring(4, 6);
  
  const mapping = {
    "00": "PURCHASE",        // Goods/Services
    "01": "CASH_WITHDRAWAL", // ATM
    "20": "REFUND",          // Credit
    "40": "INQUIRY",         // Balance Inquiry
  };
  
  return {
    purpose: mapping[transactionType] || "OTHER",
    fromAccountType: fromAccount,
    toAccountType: toAccount
  };
}
\`\`\`

### Metrics

- Connection setup time (target: <7 days from requirements to production)
- Translation accuracy (target: >99.9% - no message corruption)
- Message throughput (target: >10,000 messages/second)
- Connection uptime (target: >99.95%)

---

## SOP-ISO-002: Real-Time Message Monitoring & Logging

### Purpose
Monitor all messages flowing through ISO Gateway for performance, errors, and compliance.

### Message Flow Monitoring Dashboard

**Real-Time Metrics:**

| Metric | Update Frequency | Alert Threshold |
|--------|-----------------|----------------|
| Messages per second | 1 second | <10/sec (capacity issue) OR >1000/sec (unusual spike) |
| Translation success rate | 10 seconds | <99% |
| Average translation time | 10 seconds | >100ms |
| Error rate by customer | 1 minute | >1% |
| Queue depth | 10 seconds | >1,000 messages waiting |

**Message Lifecycle Tracking:**

\`\`\`mermaid
stateDiagram-v2
    [*] --> Received: Inbound from customer
    Received --> Validated: Schema validation
    Validated --> Queued: Add to processing queue
    Queued --> Translating: Translation engine
    Translating --> Translated: Conversion complete
    Translated --> Routing: Apply routing rules
    Routing --> Sent: Forward to destination
    Sent --> Acknowledged: Destination confirms
    Acknowledged --> [*]
    
    Validated --> Error: Validation failed
    Translating --> Error: Translation failed
    Routing --> Error: Routing failed
    Sent --> Error: Destination unreachable
    
    Error --> Retry: Retry logic
    Retry --> Queued: Retry attempt
    Retry --> DLQ: Max retries exceeded
    DLQ --> Manual_Review: Operations team investigation
\`\`\`

**Message Status Definitions:**

- **Received:** Message accepted by gateway
- **Validated:** Schema validation passed
- **Translating:** In translation engine
- **Translated:** Successfully converted to target format
- **Sent:** Delivered to destination
- **Acknowledged:** Destination confirmed receipt
- **Error:** Failed at any stage
- **Retrying:** Automated retry in progress
- **DLQ (Dead Letter Queue):** Failed after max retries, needs manual intervention

### Message Logging & Retention

**What's Logged:**

\`\`\`yaml
message_log_entry:
  metadata:
    message_id: "ISO-2026-001234567"
    timestamp: "2026-01-15T14:32:15.234Z"
    customer_code: "psp_acmepay"
    source_format: "ISO8583_1987"
    target_format: "ISO20022_pain.001"
    
  performance:
    received_at: "14:32:15.234"
    validated_at: "14:32:15.236"  # 2ms
    translated_at: "14:32:15.289"  # 53ms
    sent_at: "14:32:15.312"        # 23ms
    acknowledged_at: "14:32:15.401" # 89ms
    total_duration_ms: 167
    
  content:
    source_message: "[REDACTED - PCI SCOPE]"  # Stored encrypted
    translated_message: "[REDACTED - PCI SCOPE]"
    
  status:
    final_status: "SUCCESS"
    error_code: null
    retry_count: 0
\`\`\`

**Retention Policy:**
- Message logs: 90 days in hot storage (Elasticsearch)
- Archive: 7 years in cold storage (S3 Glacier) - compliance requirement
- PCI cardholder data: Encrypted, never logged in plain text
- Full message content: Accessible only to authorized personnel (RBAC)

### Metrics

- Message processing latency (target: p95 <100ms)
- Message logging completeness (target: 100%)
- Log query response time (target: <2 seconds for typical search)
- Compliance with retention policy (target: 100%)

---

## Appendix: ISO Message Format Examples

### ISO 8583 Sample

\`\`\`
MTI: 0200 (Authorization Request)
2: 4532123456789012 (PAN)
3: 000000 (Processing Code: Purchase)
4: 000000005000 (Amount: $50.00)
7: 0115143215 (Date/Time)
11: 123456 (STAN)
32: 123456 (Acquiring Institution)
49: 840 (USD)
\`\`\`

### ISO 20022 Sample (Equivalent)

\`\`\`xml
<pain.001.001.03>
  <CdtTrfTxInf>
    <PmtId><EndToEndId>FTS-ISO-123456</EndToEndId></PmtId>
    <Amt><InstdAmt Ccy="USD">50.00</InstdAmt></Amt>
    <DbtrAcct><Id><Othr><Id>4532****9012</Id></Othr></Id></DbtrAcct>
    <CdtrAgt><FinInstnId><BICFI>CHASUS33</BICFI></FinInstnId></CdtrAgt>
    <Purp><Prtry>PURCHASE</Prtry></Purp>
  </CdtTrfTxInf>
</pain.001.001.03>
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** ISO Gateway Operations Manager

© 2026 FTS.Money. Internal use only.
`;

export default ISOGatewayOperationsSOPs;