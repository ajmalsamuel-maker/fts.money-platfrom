const ISOGatewayPortalGuide = `# ISO Gateway Customer Portal - Complete User Guide
## Message Translation Service Portal Documentation

**Version:** 1.0  
**Last Updated:** January 10, 2026  
**Classification:** Customer Documentation  
**Portal URL:** \`/ISOGatewayCustomerPortal\`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Portal Overview](#portal-overview)
3. [Access & Authentication](#access--authentication)
4. [Dashboard Walkthrough](#dashboard-walkthrough)
5. [Connection Management](#connection-management)
6. [Message Monitoring](#message-monitoring)
7. [Routing Configuration](#routing-configuration)
8. [Translation Rules](#translation-rules)
9. [Test Console](#test-console)
10. [API Integration](#api-integration)
11. [User Management](#user-management)
12. [Billing & Usage](#billing--usage)
13. [Troubleshooting](#troubleshooting)

---

## Executive Summary

### What is the ISO Gateway Portal?

The ISO Gateway Customer Portal is a self-service management interface for customers using FTS.Money's message translation service. It enables financial institutions to:

- **Connect legacy systems** (ISO 8583) to modern networks (ISO 20022)
- **Translate payment messages** between multiple standards in real-time
- **Monitor message flows** with detailed logging and analytics
- **Configure routing rules** for intelligent message distribution
- **Test integrations** with a comprehensive sandbox environment
- **Manage team access** with role-based permissions

### Who Uses This Portal?

| User Type | Use Cases | Typical Role |
|-----------|-----------|--------------|
| **Banks** | Modernize core banking systems, connect to SWIFT network | Technical Integration Manager |
| **Payment Processors** | Support multiple message standards, network interoperability | Solutions Architect |
| **Fintechs** | Rapid network connectivity without legacy tech debt | CTO, Engineering Lead |
| **Card Networks** | Multi-standard message processing, regional adaptations | Operations Director |
| **Corporate Treasuries** | SWIFT connectivity for payments, cash management | Treasury Systems Manager |

### Key Capabilities

\`\`\`mermaid
graph TB
    subgraph "ISO Gateway Portal Core Features"
        A[Connection Management<br/>TCP, HTTP, MQ protocols]
        B[Message Translation<br/>ISO 8583 ↔ ISO 20022 ↔ SWIFT MT]
        C[Routing Engine<br/>Intelligent message distribution]
        D[Real-Time Monitoring<br/>Message logs & analytics]
        E[Test Console<br/>Sandbox with sample messages]
        F[Multi-User RBAC<br/>6-tier role hierarchy]
    end
    
    subgraph "Integration Points"
        G[REST API]
        H[Webhooks]
        I[Batch Processing]
    end
    
    A --> G
    B --> G
    C --> G
    D --> H
    E --> G
    
    style A fill:#3b82f6,color:#fff
    style B fill:#8b5cf6,color:#fff
    style C fill:#10b981,color:#fff
\`\`\`

---

## Portal Overview

### Portal Architecture

\`\`\`mermaid
graph TB
    subgraph "Portal Pages"
        DASH[ISOGatewayCustomerPortal<br/>Main Dashboard]
        CONN[ISOGatewayConnections<br/>Connection Setup]
        MSG[ISOMessageMonitor<br/>Message Logs]
        ROUTE[ISOGatewayRouting<br/>Routing Rules]
        TEST[ISOGatewayTestConsole<br/>Testing & Sandbox]
        USER[ISOGatewayUserManagement<br/>Team Management]
        API[ISO API Keys<br/>API Management]
        DOCS[ISO Documentation<br/>API Reference]
    end
    
    subgraph "Backend Services"
        AUTH[isoGatewayAuth<br/>Authentication]
        TRANS[translateAndRoute<br/>Translation Engine]
        RECV[receiveISO8583<br/>Message Receiver]
        SEND[iso20022Handler<br/>Message Sender]
    end
    
    DASH --> CONN
    DASH --> MSG
    DASH --> ROUTE
    DASH --> TEST
    
    CONN --> TRANS
    MSG --> RECV
    ROUTE --> TRANS
    TEST --> SEND
    
    style DASH fill:#ef4444,color:#fff
    style TRANS fill:#10b981,color:#fff
\`\`\`

### Subscription Tiers

| Feature | Starter<br/>$499/mo | Professional<br/>$2,499/mo | Enterprise<br/>$9,999/mo |
|---------|---------------------|----------------------------|--------------------------|
| **Included Messages** | 10,000/month | 100,000/month | 1,000,000/month |
| **Overage Rate** | $0.05/message | $0.03/message | $0.01/message |
| **Connections** | 2 active | 10 active | Unlimited |
| **Message Standards** | 2 standards | All standards | All standards + custom |
| **Routing Rules** | 5 rules | 50 rules | Unlimited |
| **API Rate Limit** | 100 req/min | 500 req/min | 5,000 req/min |
| **Retention** | 30 days | 90 days | 1 year |
| **Support** | Email (24h) | Priority (4h) | Dedicated (1h) |
| **SLA** | 99.9% | 99.95% | 99.99% |
| **Team Users** | 3 users | 10 users | Unlimited |

---

## Access & Authentication

### Login Process

**Portal URL:** \`https://app.fts.money/ISOGatewayLogin\`

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal as Login Page
    participant Auth as isoGatewayAuth
    participant DB as ISOGatewayUser
    participant Session as Session Store
    
    User->>Portal: Navigate to login page
    Portal->>User: Display login form
    
    User->>Portal: Enter email + password
    Portal->>Auth: POST /isoGatewayAuth
    
    Auth->>DB: Query user by email
    DB-->>Auth: User record
    
    Auth->>Auth: Hash password (SHA-256)
    Auth->>Auth: Compare hash
    
    alt Valid Credentials
        Auth->>Auth: Check user status = active
        Auth->>Session: Create session token
        Session-->>Auth: Token created
        
        Auth-->>Portal: Success + user data
        Portal->>Session: Save to localStorage
        Portal->>User: Redirect to Dashboard
    else Invalid
        Auth-->>Portal: Error 401
        Portal->>User: Show error message
    end
\`\`\`

### User Roles & Access Levels

| Role | Access Level | Typical User | Key Permissions |
|------|-------------|--------------|-----------------|
| **Owner** | 100% | CTO, Director | All permissions, billing access, user management |
| **Administrator** | 90% | Senior Engineer | All except billing/owner management |
| **Developer** | 60% | Integration Engineer | Create/modify connections, test console, API keys |
| **Operations** | 50% | Support Team | Monitor messages, view connections, send test messages |
| **Analyst** | 40% | Business Analyst | View analytics, export reports |
| **Viewer** | 20% | Auditor, Compliance | Read-only access to dashboards and logs |

### Session Management

**Session Settings:**
- **Session Duration:** 8 hours absolute timeout
- **Idle Timeout:** 30 minutes
- **Storage:** localStorage key: \`iso_gateway_session\`
- **Auto-Logout:** On password change, role change, or manual logout

---

## Dashboard Walkthrough

### Main Dashboard Layout

\`\`\`mermaid
graph TB
    subgraph "Top Header"
        LOGO[Company Logo]
        SEARCH[Quick Search]
        USER[User Menu<br/>Profile, Logout]
    end
    
    subgraph "Key Metrics Row"
        M1[Messages Today<br/>45,234]
        M2[Success Rate<br/>99.87%]
        M3[Avg Latency<br/>42ms]
        M4[Active Connections<br/>8/10]
    end
    
    subgraph "Message Volume Chart"
        CHART[24h Message Volume<br/>Line chart by hour]
    end
    
    subgraph "Quick Actions"
        Q1[New Connection]
        Q2[Test Message]
        Q3[View Logs]
        Q4[API Keys]
    end
    
    subgraph "Recent Activity"
        ACT[Last 10 messages<br/>Status, timestamp, type]
    end
    
    subgraph "Connection Status"
        CONN[Active Connections<br/>Health, throughput]
    end
    
    style M1 fill:#3b82f6,color:#fff
    style M2 fill:#10b981,color:#fff
    style M3 fill:#8b5cf6,color:#fff
\`\`\`

### Dashboard Metrics Explained

**Messages Today:**
- Real-time count of messages processed since midnight (customer timezone)
- Breakdown by message type (financial, administrative, reversal)
- Click to filter message logs

**Success Rate:**
- Percentage of successfully translated and routed messages
- Excludes rejected messages due to validation errors
- Industry benchmark: >99.5% is excellent

**Average Latency:**
- Mean translation time (message received → translated → sent)
- Target: <50ms for ISO 8583, <100ms for ISO 20022
- P95 latency shown in tooltip

**Active Connections:**
- Current/maximum connections based on tier
- Health status: 🟢 Healthy, 🟡 Degraded, 🔴 Down
- Click to navigate to connection details

---

## Connection Management

### Connection Types

| Protocol | Use Case | Configuration Required | Typical Latency |
|----------|----------|------------------------|-----------------|
| **TCP/IP** | Direct network connectivity | IP, Port, SSL/TLS | 20-50ms |
| **HTTP/REST** | API-based integration | Endpoint URL, Auth headers | 50-100ms |
| **Message Queue** | Asynchronous processing | Queue name, credentials | 100-200ms |
| **WebSocket** | Bi-directional streaming | WS endpoint, heartbeat | 30-60ms |

### Creating a New Connection

\`\`\`mermaid
sequenceDiagram
    participant User
    participant Portal as Connections Page
    participant Wizard as Setup Wizard
    participant API as Backend
    participant Test as Connection Test
    
    User->>Portal: Click "New Connection"
    Portal->>Wizard: Show step 1: Basic Info
    
    User->>Wizard: Enter name, protocol
    Wizard->>Wizard: Step 2: Endpoint Config
    
    User->>Wizard: Enter IP/URL, port, credentials
    Wizard->>Wizard: Step 3: Message Format
    
    User->>Wizard: Select ISO standard (8583/20022/MT)
    Wizard->>Wizard: Step 4: Security
    
    User->>Wizard: Configure SSL/TLS, API keys
    Wizard->>Wizard: Step 5: Review
    
    User->>Wizard: Submit
    Wizard->>API: Create connection
    
    API->>API: Validate configuration
    API->>Test: Test connection
    
    alt Connection Successful
        Test-->>API: Success
        API-->>Wizard: Connection created
        Wizard->>User: Show success + connection ID
    else Connection Failed
        Test-->>API: Error details
        API-->>Wizard: Validation error
        Wizard->>User: Show error, suggest fixes
    end
\`\`\`

### Connection Configuration Fields

**Step 1: Basic Information**
\`\`\`yaml
connection_basic_info:
  connection_name: "Visa Production Gateway"
  description: "Primary connection to Visa network"
  protocol: "TCP"  # Options: TCP, HTTP, MQ, WebSocket
  direction: "bidirectional"  # Options: inbound, outbound, bidirectional
  environment: "production"  # Options: sandbox, staging, production
\`\`\`

**Step 2: Endpoint Configuration**
\`\`\`yaml
endpoint_config:
  tcp_settings:
    host: "visa.network.example.com"
    port: 8583
    timeout_seconds: 30
    keep_alive: true
    
  http_settings:
    base_url: "https://api.visa.com/iso20022"
    method: "POST"
    headers:
      Authorization: "Bearer {API_KEY}"
      Content-Type: "application/xml"
    
  mq_settings:
    queue_name: "visa.incoming.messages"
    exchange: "payment.messages"
    routing_key: "visa.*"
\`\`\`

**Step 3: Message Format**
\`\`\`yaml
message_format:
  incoming_standard: "ISO 8583"
  incoming_version: "1987"
  
  outgoing_standard: "ISO 20022"
  outgoing_message_type: "pain.001"
  
  translation_mode: "automatic"  # Options: automatic, manual_review, passthrough
\`\`\`

### Connection State Machine

\`\`\`mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Testing: Submit configuration
    Testing --> Active: Test successful
    Testing --> Failed: Test failed
    Failed --> Draft: Fix configuration
    
    Active --> Suspended: Connection issues
    Active --> Disabled: User action
    
    Suspended --> Active: Issue resolved
    Disabled --> Active: User re-enables
    
    Active --> Archived: Decommissioned
    Archived --> [*]
    
    note right of Active
        Messages flowing
        Monitoring active
        Alerts enabled
    end note
    
    note right of Suspended
        Auto-disabled due to:
        - High error rate (>5%)
        - Timeout threshold exceeded
        - Security alert
    end note
\`\`\`

---

## Message Monitoring

### Message Monitor Dashboard

**Access:** \`ISOMessageMonitor\` page

\`\`\`mermaid
graph TB
    subgraph "Message Monitor Interface"
        FILTER[Advanced Filters<br/>Status, Type, Time, Connection]
        TABLE[Message Table<br/>Timestamp, Type, Status, Latency]
        DETAIL[Message Details Panel<br/>Full payload, translation]
    end
    
    subgraph "Message Details View"
        ORIG[Original Message<br/>Raw ISO 8583/20022]
        TRANS[Translated Message<br/>Target format]
        META[Metadata<br/>Latency, route, timestamps]
        ERROR[Error Log<br/>If failed]
    end
    
    FILTER --> TABLE
    TABLE --> DETAIL
    DETAIL --> ORIG
    DETAIL --> TRANS
    DETAIL --> META
    DETAIL --> ERROR
    
    style DETAIL fill:#3b82f6,color:#fff
\`\`\`

### Message Log Entry

**Example Message Log:**

\`\`\`json
{
  "message_id": "msg_abc123xyz",
  "connection_id": "conn_visa_prod",
  "timestamp": "2026-01-10T14:23:45.123Z",
  "direction": "inbound",
  "original_standard": "ISO 8583",
  "original_mti": "0200",
  "original_payload": {
    "field_0": "0200",
    "field_2": "4532123456789012",
    "field_3": "000000",
    "field_4": "000000010000",
    "field_7": "0110142345"
  },
  "translated_standard": "ISO 20022",
  "translated_message_type": "pain.001.001.09",
  "translated_payload": {
    "GrpHdr": {
      "MsgId": "msg_abc123xyz",
      "CreDtTm": "2026-01-10T14:23:45Z"
    }
  },
  "routing_decision": {
    "rule_id": "rule_default_visa",
    "target_endpoint": "https://swift.network/messages"
  },
  "status": "success",
  "latency_ms": 42,
  "error": null
}
\`\`\`

### Message Filtering

**Available Filters:**

| Filter | Options | Use Case |
|--------|---------|----------|
| **Status** | Success, Failed, Pending, Rejected | Find errors quickly |
| **Connection** | All connections (dropdown) | Isolate connection issues |
| **Message Type** | ISO 8583 MTI, ISO 20022 types, SWIFT MT codes | Analyze specific flows |
| **Time Range** | Last hour, 24h, 7 days, 30 days, custom | Historical analysis |
| **Direction** | Inbound, Outbound, Both | Track message flow |
| **Latency** | <50ms, 50-100ms, 100-200ms, >200ms | Performance monitoring |

### Search Functionality

**Quick Search:**
- Search by message ID, transaction reference, card number (masked), amount
- Supports partial matching and wildcards
- Results update in real-time

---

## Routing Configuration

### Routing Rule Builder

\`\`\`mermaid
graph TB
    subgraph "Routing Rule Components"
        CONDITION[Condition Builder<br/>If message matches...]
        ACTION[Action Configuration<br/>Then route to...]
        PRIORITY[Priority Setting<br/>Rule evaluation order]
    end
    
    subgraph "Condition Types"
        C1[Message Type<br/>MTI, pain.001, MT103]
        C2[Source Connection<br/>Which connection received it]
        C3[Amount Range<br/>$0-$100, >$100K]
        C4[Currency<br/>USD, EUR, GBP]
        C5[Card BIN<br/>First 6 digits]
        C6[Time Window<br/>Business hours, weekends]
    end
    
    subgraph "Action Types"
        A1[Route to Endpoint<br/>Specific URL/IP]
        A2[Apply Translation<br/>Change message format]
        A3[Hold for Review<br/>Manual approval]
        A4[Reject<br/>Return error code]
    end
    
    CONDITION --> C1
    CONDITION --> C2
    CONDITION --> C3
    CONDITION --> C4
    
    ACTION --> A1
    ACTION --> A2
    ACTION --> A3
    
    style CONDITION fill:#8b5cf6,color:#fff
    style ACTION fill:#10b981,color:#fff
\`\`\`

### Example Routing Rules

**Rule 1: High-Value Transaction Routing**

\`\`\`javascript
{
  "rule_name": "High Value to SWIFT",
  "priority": 1,
  "conditions": [
    {
      "field": "amount",
      "operator": "greater_than",
      "value": 100000
    },
    {
      "field": "currency",
      "operator": "equals",
      "value": "USD"
    }
  ],
  "actions": [
    {
      "type": "translate",
      "from": "ISO 8583",
      "to": "SWIFT MT103"
    },
    {
      "type": "route",
      "target": "swift_network_endpoint",
      "endpoint": "https://swift.example.com/messages"
    }
  ],
  "enabled": true
}
\`\`\`

**Rule 2: European Payments**

\`\`\`javascript
{
  "rule_name": "EU Instant Payments",
  "priority": 2,
  "conditions": [
    {
      "field": "currency",
      "operator": "in",
      "value": ["EUR", "GBP", "SEK", "DKK"]
    },
    {
      "field": "amount",
      "operator": "less_than",
      "value": 100000
    }
  ],
  "actions": [
    {
      "type": "translate",
      "from": "ISO 8583",
      "to": "ISO 20022 pain.001"
    },
    {
      "type": "route",
      "target": "sepa_instant_endpoint"
    }
  ]
}
\`\`\`

---

## Translation Rules

### Supported Translation Paths

\`\`\`mermaid
graph LR
    subgraph "ISO 8583 Support"
        I8583_87[ISO 8583-1987]
        I8583_93[ISO 8583-1993]
        I8583_03[ISO 8583-2003]
    end
    
    subgraph "ISO 20022 Support"
        PAIN[pain.001 - Payment Initiation]
        PACS[pacs.008 - Customer Credit Transfer]
        CAMT[camt.053 - Bank Statement]
    end
    
    subgraph "SWIFT MT Support"
        MT103[MT103 - Single Customer Credit]
        MT202[MT202 - FI Transfer]
        MT940[MT940 - Customer Statement]
    end
    
    I8583_87 -.->|Translate| PAIN
    I8583_87 -.->|Translate| MT103
    
    PAIN -.->|Translate| I8583_03
    PAIN -.->|Translate| MT103
    
    MT103 -.->|Translate| PAIN
    MT103 -.->|Translate| I8583_03
    
    style PAIN fill:#3b82f6,color:#fff
    style I8583_87 fill:#10b981,color:#fff
    style MT103 fill:#f59e0b,color:#fff
\`\`\`

### Field Mapping Configuration

**Custom Field Mappings:**

You can define custom mappings for non-standard fields:

\`\`\`javascript
// Example: Map proprietary ISO 8583 field to ISO 20022
{
  "mapping_name": "Custom Field 48 to AddtlInf",
  "source_standard": "ISO 8583",
  "source_field": "field_48",
  "target_standard": "ISO 20022",
  "target_path": "CdtTrfTxInf.InstrForCdtrAgt.InstrInf",
  "transformation": "substring(0, 140)",
  "required": false
}
\`\`\`

---

## Test Console

### Test Console Interface

**Access:** \`ISOGatewayTestConsole\` page

\`\`\`mermaid
graph TB
    subgraph "Test Console Features"
        SAMPLE[Sample Message Library<br/>Pre-built test cases]
        EDITOR[Message Editor<br/>JSON/XML editor]
        SEND[Send Test Message<br/>Execute translation]
        RESULT[Response Viewer<br/>Translation result]
    end
    
    subgraph "Test Message Flow"
        INPUT[Input Message<br/>ISO 8583 example]
        VALIDATE[Validation<br/>Schema check]
        TRANSLATE[Translation<br/>To ISO 20022]
        OUTPUT[Output Message<br/>Translated result]
    end
    
    SAMPLE --> EDITOR
    EDITOR --> SEND
    SEND --> INPUT
    INPUT --> VALIDATE
    VALIDATE --> TRANSLATE
    TRANSLATE --> OUTPUT
    OUTPUT --> RESULT
    
    style EDITOR fill:#8b5cf6,color:#fff
    style TRANSLATE fill:#10b981,color:#fff
\`\`\`

### Sample Test Messages

**ISO 8583 Purchase (0200):**

\`\`\`json
{
  "mti": "0200",
  "field_2": "4532123456789012",
  "field_3": "000000",
  "field_4": "000000010000",
  "field_7": "0110142345",
  "field_11": "123456",
  "field_12": "142345",
  "field_13": "0110",
  "field_18": "5999",
  "field_22": "051",
  "field_32": "123456",
  "field_37": "000123456789",
  "field_41": "TERM0001",
  "field_42": "MERCHANT000001",
  "field_49": "840"
}
\`\`\`

**Expected ISO 20022 Output (pain.001):**

\`\`\`xml
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>msg_123456</MsgId>
      <CreDtTm>2026-01-10T14:23:45Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>pmt_123456</PmtInfId>
      <InstdAmt Ccy="USD">100.00</InstdAmt>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>
\`\`\`

---

## API Integration

### REST API Endpoints

**Base URL:** \`https://api.fts.money/iso-gateway\`

**Authentication:** Bearer token (API key)

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| \`/translate\` | POST | Translate single message | 100/min |
| \`/batch\` | POST | Batch translation (up to 1,000) | 10/min |
| \`/connections\` | GET | List connections | 60/min |
| \`/messages\` | GET | Query message logs | 60/min |
| \`/routing/simulate\` | POST | Test routing without sending | 30/min |

### API Request Example

\`\`\`javascript
// Translate ISO 8583 to ISO 20022
const response = await fetch('https://api.fts.money/iso-gateway/translate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_live_abc123...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    source_standard: 'ISO 8583',
    target_standard: 'ISO 20022',
    target_message_type: 'pain.001',
    message: {
      mti: '0200',
      field_2: '4532123456789012',
      field_4: '000000010000'
      // ... additional fields
    },
    connection_id: 'conn_visa_prod'  // Optional
  })
});

const result = await response.json();
// Returns translated message + metadata
\`\`\`

### Webhook Events

**Available Events:**

\`\`\`yaml
webhook_events:
  message.received:
    description: "New message received on connection"
    payload:
      - message_id
      - connection_id
      - timestamp
      - message_type
      
  message.translated:
    description: "Message successfully translated"
    payload:
      - message_id
      - source_standard
      - target_standard
      - latency_ms
      
  message.failed:
    description: "Translation or routing failed"
    payload:
      - message_id
      - error_code
      - error_message
      
  connection.down:
    description: "Connection health check failed"
    payload:
      - connection_id
      - last_success
      - error_details
\`\`\`

---

## User Management

### Inviting Team Members

**Access:** Owner and Administrator roles only

**Invitation Flow:**

1. Navigate to **ISOGatewayUserManagement**
2. Click **"Invite User"**
3. Enter email and select role
4. User receives email with invitation link
5. User sets password and logs in
6. Access granted based on role

### Permission Matrix

| Feature/Page | Owner | Admin | Developer | Operations | Analyst | Viewer |
|--------------|-------|-------|-----------|------------|---------|--------|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Connections** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create Connection** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Connection** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete Connection** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View Messages** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Send Test Message** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Configure Routing** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Manage API Keys** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Analytics** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Export Reports** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **View Billing** | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Manage Users** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## Billing & Usage

### Usage Dashboard

**Monthly Usage Breakdown:**

\`\`\`yaml
usage_summary:
  billing_period: "2026-01-01 to 2026-01-31"
  
  message_volume:
    included: 100000
    actual: 142350
    overage: 42350
    
  charges:
    base_subscription: 2499.00
    overage_charges: 1270.50  # 42,350 × $0.03
    total: 3769.50
    
  breakdown_by_connection:
    visa_production: 89234 messages
    mastercard_gateway: 35678 messages
    amex_connector: 17438 messages
\`\`\`

### Cost Optimization Tips

**Reduce Message Volume:**
- Enable message batching (combine multiple messages)
- Use compression for large payloads
- Configure idle timeout to prevent empty heartbeats

**Upgrade Tier:**
- If consistently exceeding included messages
- Professional tier overage: $0.03/msg → Enterprise: $0.01/msg
- Break-even: ~125K messages/month

---

## Troubleshooting

### Common Issues

#### Issue 1: Connection Test Fails

**Symptoms:**
- Red status indicator on connection
- Error: "Connection refused" or "Timeout"

**Solutions:**
1. **Check IP Whitelisting:** Ensure our IP (203.0.113.0/24) is allowed
2. **Verify Port:** Confirm firewall allows traffic on configured port
3. **SSL Certificate:** If using TLS, verify certificate is valid
4. **Credentials:** Re-enter username/password or API key

#### Issue 2: Message Translation Errors

**Symptoms:**
- Messages show status "failed"
- Error: "Invalid field mapping" or "Unsupported message type"

**Solutions:**
1. **Check Message Format:** Ensure source message is valid ISO 8583/20022
2. **Review Field Mappings:** Verify all required fields are present
3. **Validate MTI/Message Type:** Confirm message type is supported
4. **Test in Console:** Use test console to validate translation

#### Issue 3: High Latency

**Symptoms:**
- Latency >200ms consistently
- Dashboard shows orange/red latency alerts

**Solutions:**
1. **Geographic Routing:** Use endpoint closer to your location
2. **Connection Protocol:** Switch TCP to HTTP if network issues
3. **Message Size:** Reduce payload size, remove optional fields
4. **Contact Support:** May need dedicated infrastructure

### Error Codes Reference

| Code | Meaning | Action Required |
|------|---------|-----------------|
| **ISO_001** | Invalid message format | Check message structure |
| **ISO_002** | Unsupported MTI | Verify message type is supported |
| **ISO_003** | Missing required field | Add mandatory fields |
| **ISO_004** | Translation failed | Contact support with message ID |
| **ISO_005** | Routing rule not found | Configure default routing |
| **ISO_006** | Connection unavailable | Check connection status |
| **ISO_007** | Rate limit exceeded | Reduce request frequency |
| **ISO_008** | Authentication failed | Verify API key |

---

## Best Practices

### Connection Configuration

✅ **Do:**
- Use separate connections for sandbox vs production
- Enable SSL/TLS for all production connections
- Set appropriate timeout values (30-60 seconds)
- Configure health checks every 5 minutes

❌ **Don't:**
- Share connection credentials across teams
- Use production credentials in test console
- Disable error logging (needed for debugging)
- Set timeout <10 seconds (causes false failures)

### Message Translation

✅ **Do:**
- Test all translation paths in sandbox first
- Validate message format before sending
- Handle translation errors gracefully
- Log all translation failures for analysis

❌ **Don't:**
- Assume field mapping is always 1:1
- Skip mandatory fields
- Ignore translation warnings
- Use custom fields without documentation

### Security

✅ **Do:**
- Rotate API keys every 90 days
- Use IP whitelisting for production
- Enable audit logging for compliance
- Review user access quarterly

❌ **Don't:**
- Share API keys in code repositories
- Use same password for multiple users
- Grant Owner role to temporary staff
- Disable security alerts

---

## Analytics & Reporting

### Available Reports

| Report Type | Data Included | Export Formats | Schedule |
|-------------|---------------|----------------|----------|
| **Daily Summary** | Message volume, success rate, latency | PDF, Excel, CSV | Daily 9am |
| **Connection Health** | Uptime, error rate, throughput | PDF, JSON | Weekly |
| **Translation Analysis** | Popular paths, errors, performance | Excel, CSV | Monthly |
| **Billing Forecast** | Projected usage, cost estimate | PDF, Excel | Monthly |
| **Compliance Audit** | All messages, full payload | CSV, JSON | On-demand |

---

## Support & Resources

### Getting Help

| Issue Type | Support Channel | Response Time | Availability |
|------------|----------------|---------------|--------------|
| **Critical Outage** | Phone: 1-800-FTS-HELP | 15 minutes | 24/7 |
| **Technical Issue** | Email: iso-support@fts.money | 4 hours (Pro), 1 hour (Ent) | Business hours |
| **Feature Request** | Portal feedback form | 2 business days | M-F 9am-5pm |
| **Documentation** | Help center, docs.fts.money | Self-service | Always available |

### Additional Resources

- **API Documentation:** https://docs.fts.money/iso-gateway/api
- **Integration Examples:** https://github.com/fts-money/iso-examples
- **Status Page:** https://status.fts.money
- **Community Forum:** https://community.fts.money/iso-gateway

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 10, 2026
- **Owner:** Product Documentation Team
- **Contact:** docs@fts.money

© 2026 FTS.Money. All rights reserved.
`;

export default ISOGatewayPortalGuide;