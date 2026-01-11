const ISOGatewayDoc = `# ISO Gateway Service Documentation
## Enterprise Message Translation & Routing Platform

**Version:** 2.0  
**Classification:** Technical - ISO Gateway Customers  
**Last Updated:** January 11, 2026  
**Document Owner:** FTS.Money ISO Gateway Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [ISO 8583 Implementation](#iso-8583-implementation)
4. [ISO 20022 Implementation](#iso-20022-implementation)
5. [SWIFT MT Messages](#swift-mt-messages)
6. [Message Translation Engine](#message-translation-engine)
7. [Routing & Orchestration](#routing--orchestration)
8. [Security & Compliance](#security--compliance)
9. [Integration Guide](#integration-guide)
10. [Operations & Monitoring](#operations--monitoring)

---

## Executive Summary

### What is ISO Gateway?

The **ISO Gateway Service** is an enterprise-grade message translation and routing platform that enables seamless communication between payment systems using different messaging standards (ISO 8583, ISO 20022, SWIFT MT).

### The Problem

\`\`\`mermaid
graph LR
    A[Legacy Banking System<br/>ISO 8583] -.X.-> B[Modern Payment Network<br/>ISO 20022]
    C[Card Network<br/>Proprietary] -.X.-> D[Banking API<br/>REST/JSON]
    E[SWIFT Network<br/>MT Messages] -.X.-> F[Real-Time Payments<br/>ISO 20022]
    
    style A fill:#f99,stroke:#333
    style B fill:#f99,stroke:#333
    style C fill:#f99,stroke:#333
    style D fill:#f99,stroke:#333
    style E fill:#f99,stroke:#333
    style F fill:#f99,stroke:#333
\`\`\`

**Challenges:**
- Incompatible message formats
- Decades-old core banking systems
- Expensive system replacements ($50M+)
- Long migration timelines (3-5 years)
- Risk of data loss during translation
- Lack of standardization

### The Solution

\`\`\`mermaid
graph LR
    A[Legacy System<br/>ISO 8583] --> G[ISO Gateway]
    B[Card Network<br/>Proprietary] --> G
    C[SWIFT<br/>MT Messages] --> G
    
    G --> D[Modern Network<br/>ISO 20022]
    G --> E[Banking API<br/>REST/JSON]
    G --> F[Real-Time Payments<br/>ISO 20022]
    
    style G fill:#9f9,stroke:#333,stroke-width:3px
    style A fill:#9cf,stroke:#333
    style B fill:#9cf,stroke:#333
    style C fill:#9cf,stroke:#333
    style D fill:#cf9,stroke:#333
    style E fill:#cf9,stroke:#333
    style F fill:#cf9,stroke:#333
\`\`\`

**Benefits:**
- ✅ Connect any system to any network
- ✅ No need to replace legacy systems
- ✅ Deploy in weeks, not years
- ✅ 99.99% message accuracy
- ✅ Real-time translation (<50ms)
- ✅ Full audit trail

### Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Multi-Standard Support** | ISO 8583, ISO 20022, SWIFT MT, Proprietary | Universal connectivity |
| **Real-Time Translation** | <50ms latency | No performance impact |
| **Bidirectional** | Any format to any format | Complete flexibility |
| **Field Mapping** | Intelligent data mapping | Lossless translation |
| **Message Validation** | Schema & business rules | Error prevention |
| **Routing Engine** | Smart message routing | Optimal delivery |
| **Monitoring** | Real-time analytics | Operational visibility |
| **High Availability** | 99.99% uptime SLA | Business continuity |

---

## Architecture Overview

### System Architecture

\`\`\`mermaid
graph TB
    subgraph "Client Systems"
        A[ATM Network]
        B[POS Terminals]
        C[Core Banking]
        D[Payment Gateway]
    end
    
    subgraph "ISO Gateway"
        E[Input Adapters]
        F[Message Parser]
        G[Validation Engine]
        H[Translation Engine]
        I[Routing Engine]
        J[Output Adapters]
        K[Message Logger]
    end
    
    subgraph "Target Systems"
        L[Card Networks<br/>Visa/MC]
        M[Payment Networks<br/>SEPA/FedNow]
        N[SWIFT Network]
        O[Settlement Systems]
    end
    
    subgraph "Support Services"
        P[(Message Database)]
        Q[Analytics Engine]
        R[Monitoring]
        S[Admin Portal]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    
    J --> L
    J --> M
    J --> N
    J --> O
    
    F --> K
    H --> K
    I --> K
    K --> P
    
    P --> Q
    Q --> R
    R --> S
\`\`\`

### Component Details

**1. Input Adapters**

\`\`\`yaml
supported_protocols:
  tcp_ip:
    - raw_socket
    - ssl_tls
    - mutual_tls
  
  http:
    - rest_api
    - soap
    - websocket
  
  message_queues:
    - rabbitmq
    - kafka
    - ibm_mq
    - amazon_sqs
  
  file_based:
    - sftp
    - ftps
    - local_file_drop
\`\`\`

**2. Message Parser**

\`\`\`mermaid
flowchart LR
    A[Raw Message] --> B{Detect Format}
    
    B -->|ISO 8583| C[8583 Parser]
    B -->|ISO 20022| D[20022 Parser]
    B -->|SWIFT MT| E[MT Parser]
    B -->|Custom| F[Custom Parser]
    
    C --> G[Field Extraction]
    D --> G
    E --> G
    F --> G
    
    G --> H[Structured Data]
\`\`\`

**3. Validation Engine**

Validates messages against:
- Schema definitions (XSD for ISO 20022)
- Business rules (amount limits, currency codes)
- Network-specific rules (Visa, Mastercard)
- Regulatory requirements (AML, sanctions)

**4. Translation Engine**

\`\`\`mermaid
graph LR
    A[Source Message] --> B[Field Mapping]
    B --> C[Data Transformation]
    C --> D[Enrichment]
    D --> E[Target Message]
    
    F[Mapping Rules] --> B
    G[Transform Rules] --> C
    H[Reference Data] --> D
\`\`\`

**5. Routing Engine**

Routes messages based on:
- Message type
- Source/destination
- Business rules
- Load balancing
- Failover logic

### Deployment Architecture

\`\`\`mermaid
graph TB
    subgraph "Region 1 - Primary"
        A1[Load Balancer 1]
        B1[Gateway Node 1]
        C1[Gateway Node 2]
        D1[Database Primary]
        
        A1 --> B1
        A1 --> C1
        B1 --> D1
        C1 --> D1
    end
    
    subgraph "Region 2 - Secondary"
        A2[Load Balancer 2]
        B2[Gateway Node 3]
        C2[Gateway Node 4]
        D2[Database Replica]
        
        A2 --> B2
        A2 --> C2
        B2 --> D2
        C2 --> D2
    end
    
    E[Traffic Manager] --> A1
    E --> A2
    
    D1 -.Replication.-> D2
\`\`\`

---

## ISO 8583 Implementation

### Standard Overview

ISO 8583 is the international standard for card-originated financial transaction messages. Originally published in 1987, it remains the dominant standard for ATM, POS, and card network communications.

### Message Structure

\`\`\`
┌────────────────────────────────────────────┐
│         ISO 8583 Message Structure         │
├────────────────────────────────────────────┤
│                                            │
│  [MTI] - Message Type Indicator (4 bytes) │
│  [Primary Bitmap] (8 bytes)               │
│  [Secondary Bitmap] (8 bytes, optional)   │
│  [Data Elements] (variable length)        │
│                                            │
└────────────────────────────────────────────┘

Example Authorization Request:
┌──────┬─────────────────────────────────────┐
│ MTI  │ 0100 (Authorization request)        │
├──────┼─────────────────────────────────────┤
│ DE 2 │ 4111111111111111 (PAN)             │
│ DE 3 │ 000000 (Processing code)           │
│ DE 4 │ 000000010000 ($100.00)             │
│ DE 7 │ 0626101530 (Transmission date/time)│
│ DE 11│ 123456 (STAN)                      │
│ DE 12│ 101530 (Local time)                │
│ DE 13│ 0626 (Local date)                  │
│ DE 22│ 051 (POS entry mode)               │
│ DE 25│ 00 (POS condition code)            │
│ DE 41│ TERMINAL1 (Terminal ID)            │
│ DE 42│ MERCHANT001 (Merchant ID)          │
│ DE 49│ 840 (Currency: USD)                │
└──────┴─────────────────────────────────────┘
\`\`\`

### Message Type Indicator (MTI)

\`\`\`
MTI Format: VVTT

VV = Version (ISO 8583:1987 = 01, 1993 = 02, 2003 = 03)
TT = Message Class + Function

Message Classes:
  0 = Authorization
  1 = Financial
  2 = File Actions
  3 = Reversal/Chargeback
  4 = Reconciliation
  5 = Batch Upload
  6 = Administrative
  7 = Fee Collection
  8 = Network Management
  9 = Reserved

Functions:
  0 = Request
  1 = Request Response
  2 = Advice
  3 = Advice Response
  4 = Notification
  5-9 = Reserved

Common MTIs:
  0100 = Authorization request
  0110 = Authorization response
  0200 = Financial transaction request
  0210 = Financial transaction response
  0400 = Reversal request
  0410 = Reversal response
  0800 = Network management request
  0810 = Network management response
\`\`\`

### Data Elements

\`\`\`yaml
critical_data_elements:
  DE_2:
    name: "Primary Account Number (PAN)"
    format: "LLVAR (up to 19 digits)"
    example: "4111111111111111"
    
  DE_3:
    name: "Processing Code"
    format: "n6"
    structure:
      position_1_2: "Transaction type (00=purchase, 01=withdrawal)"
      position_3_4: "From account (00=default, 10=savings)"
      position_5_6: "To account"
    example: "000000"
    
  DE_4:
    name: "Amount, Transaction"
    format: "n12"
    example: "000000010000"  # $100.00
    note: "Amount in minor units (cents)"
    
  DE_7:
    name: "Transmission Date and Time"
    format: "n10 (MMDDhhmmss)"
    example: "0626101530"
    
  DE_11:
    name: "Systems Trace Audit Number (STAN)"
    format: "n6"
    example: "123456"
    usage: "Unique transaction identifier"
    
  DE_22:
    name: "Point of Service Entry Mode"
    format: "n3"
    values:
      "000": "Unknown"
      "010": "Manual key entry"
      "021": "Magnetic stripe"
      "051": "Chip card"
      "071": "Contactless chip"
      "081": "Contactless magnetic stripe"
      "091": "E-commerce"
    
  DE_38:
    name: "Authorization Code"
    format: "an6"
    example: "AUTH01"
    
  DE_39:
    name: "Response Code"
    format: "an2"
    values:
      "00": "Approved"
      "01": "Refer to issuer"
      "05": "Do not honor"
      "14": "Invalid card"
      "51": "Insufficient funds"
      "54": "Expired card"
      "91": "Issuer unavailable"
\`\`\`

### Transaction Flow

\`\`\`mermaid
sequenceDiagram
    participant ATM as ATM Terminal
    participant ACQ as Acquirer
    participant GW as ISO Gateway
    participant NET as Card Network
    participant ISS as Issuer
    
    Note over ATM,ISS: Authorization Request
    
    ATM->>ACQ: 0100 (Auth Request)
    Note right of ATM: DE 2: PAN<br/>DE 4: $100.00<br/>DE 22: Chip
    
    ACQ->>GW: Forward 0100
    GW->>GW: Parse & Validate
    GW->>GW: Translate (if needed)
    GW->>NET: Route to Network
    
    NET->>ISS: Forward to Issuer
    ISS->>ISS: Check Balance
    ISS->>ISS: Check Fraud Rules
    
    alt Approved
        ISS->>NET: 0110 (Approved)
        Note right of ISS: DE 38: AUTH01<br/>DE 39: 00
        NET->>GW: Forward 0110
        GW->>ACQ: Forward 0110
        ACQ->>ATM: Dispense Cash
    else Declined
        ISS->>NET: 0110 (Declined)
        Note right of ISS: DE 39: 51<br/>(Insufficient Funds)
        NET->>GW: Forward 0110
        GW->>ACQ: Forward 0110
        ACQ->>ATM: Display Decline
    end
\`\`\`

### Implementation Example

\`\`\`javascript
// ISO 8583 Message Builder
class ISO8583Message {
  constructor(mti) {
    this.mti = mti;
    this.dataElements = new Map();
  }
  
  setField(fieldNum, value) {
    this.dataElements.set(fieldNum, value);
  }
  
  build() {
    // Build primary bitmap
    const bitmap = this.buildBitmap();
    
    // Construct message
    let message = this.mti + bitmap;
    
    // Add data elements in order
    for (let [field, value] of this.dataElements) {
      message += this.formatField(field, value);
    }
    
    return message;
  }
  
  buildBitmap() {
    let bitmap = BigInt(0);
    for (let field of this.dataElements.keys()) {
      bitmap |= BigInt(1) << BigInt(64 - field);
    }
    return bitmap.toString(16).padStart(16, '0');
  }
}

// Usage
const authRequest = new ISO8583Message('0100');
authRequest.setField(2, '4111111111111111');  // PAN
authRequest.setField(3, '000000');            // Processing code
authRequest.setField(4, '000000010000');      // Amount: $100.00
authRequest.setField(7, '0626101530');        // Date/time
authRequest.setField(11, '123456');           // STAN
authRequest.setField(22, '051');              // POS entry: chip
authRequest.setField(41, 'TERM001');          // Terminal ID
authRequest.setField(42, 'MERCH001');         // Merchant ID
authRequest.setField(49, '840');              // Currency: USD

const message = authRequest.build();
console.log(message);
\`\`\`

---

## ISO 20022 Implementation

### Standard Overview

ISO 20022 is the global standard for financial messaging. Unlike ISO 8583's binary/ASCII format, ISO 20022 uses structured XML with rich data content.

**Key Benefits:**
- Enhanced data richness (more fields)
- Better remittance information
- Improved straight-through processing
- Easier auditing and compliance
- Human-readable format

### Message Categories

\`\`\`mermaid
graph TB
    A[ISO 20022] --> B[pacs - Payments]
    A --> C[camt - Cash Management]
    A --> D[pain - Payment Initiation]
    A --> E[acmt - Account Management]
    A --> F[reda - Reference Data]
    
    B --> B1[pacs.008<br/>Customer Credit Transfer]
    B --> B2[pacs.002<br/>Payment Status Report]
    B --> B3[pacs.004<br/>Payment Return]
    
    C --> C1[camt.053<br/>Bank Statement]
    C --> C2[camt.054<br/>Debit/Credit Notification]
    C --> C3[camt.029<br/>Resolution of Investigation]
    
    D --> D1[pain.001<br/>Customer Credit Transfer]
    D --> D2[pain.002<br/>Payment Status Report]
    D --> D3[pain.008<br/>Direct Debit]
\`\`\`

### Message Structure

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- ISO 20022 pacs.008.001.08 - Customer Credit Transfer -->
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    
    <!-- Group Header -->
    <GrpHdr>
      <MsgId>MSGID-2025-0626-001</MsgId>
      <CreDtTm>2025-06-26T10:15:30Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="USD">100.00</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>2025-06-26</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
      <InstgAgt>
        <FinInstnId>
          <BICFI>BANKUS33XXX</BICFI>
        </FinInstnId>
      </InstgAgt>
      <InstdAgt>
        <FinInstnId>
          <BICFI>BANKGB22XXX</BICFI>
        </FinInstnId>
      </InstdAgt>
    </GrpHdr>
    
    <!-- Credit Transfer Transaction Information -->
    <CdtTrfTxInf>
      <PmtId>
        <InstrId>INSTR-001</InstrId>
        <EndToEndId>E2E-2025-0626-001</EndToEndId>
        <TxId>TXN-2025-0626-001</TxId>
        <UETR>00000000-0000-4000-8000-000000000000</UETR>
      </PmtId>
      
      <IntrBkSttlmAmt Ccy="USD">100.00</IntrBkSttlmAmt>
      
      <ChrgBr>SLEV</ChrgBr>
      
      <!-- Debtor -->
      <Dbtr>
        <Nm>John Doe</Nm>
        <PstlAdr>
          <StrtNm>Main Street</StrtNm>
          <BldgNb>123</BldgNb>
          <PstCd>10001</PstCd>
          <TwnNm>New York</TwnNm>
          <Ctry>US</Ctry>
        </PstlAdr>
      </Dbtr>
      
      <DbtrAcct>
        <Id>
          <Othr>
            <Id>1234567890</Id>
          </Othr>
        </Id>
      </DbtrAcct>
      
      <DbtrAgt>
        <FinInstnId>
          <BICFI>BANKUS33XXX</BICFI>
        </FinInstnId>
      </DbtrAgt>
      
      <!-- Creditor -->
      <Cdtr>
        <Nm>ABC Company Ltd</Nm>
        <PstlAdr>
          <StrtNm>High Street</StrtNm>
          <BldgNb>456</BldgNb>
          <PstCd>EC1A 1BB</PstCd>
          <TwnNm>London</TwnNm>
          <Ctry>GB</Ctry>
        </PstlAdr>
      </Cdtr>
      
      <CdtrAcct>
        <Id>
          <IBAN>GB29NWBK60161331926819</IBAN>
        </Id>
      </CdtrAcct>
      
      <CdtrAgt>
        <FinInstnId>
          <BICFI>BANKGB22XXX</BICFI>
        </FinInstnId>
      </CdtrAgt>
      
      <!-- Remittance Information -->
      <RmtInf>
        <Ustrd>Invoice INV-2025-001</Ustrd>
      </RmtInf>
      
    </CdtTrfTxInf>
    
  </FIToFICstmrCdtTrf>
</Document>
\`\`\`

### Key Components

**1. Group Header (GrpHdr)**

\`\`\`yaml
group_header:
  message_id: "Unique message identifier"
  creation_date_time: "When message was created"
  number_of_transactions: "Count of transactions in batch"
  settlement_amount: "Total amount"
  settlement_date: "Value date"
  settlement_method: "CLRG (clearing), INDA (account), INGA (agent)"
  instructing_agent: "Sender's bank"
  instructed_agent: "Receiver's bank"
\`\`\`

**2. Payment Identification (PmtId)**

\`\`\`yaml
payment_identification:
  instruction_id: "Transaction instruction ID"
  end_to_end_id: "End-to-end reference (client to client)"
  transaction_id: "Transaction ID assigned by debtor agent"
  uetr: "Unique End-to-End Transaction Reference (UUID)"
\`\`\`

**3. Charge Bearer (ChrgBr)**

\`\`\`
SLEV = Service Level (follow scheme rules)
DEBT = Debtor pays all charges
CRED = Creditor pays all charges
SHAR = Shared (each pays their bank)
\`\`\`

### Transaction Flow

\`\`\`mermaid
sequenceDiagram
    participant D as Debtor
    participant DB as Debtor Bank
    participant GW as ISO Gateway
    participant CB as Creditor Bank
    participant C as Creditor
    
    D->>DB: pain.001<br/>Payment Initiation
    Note right of D: Customer initiates<br/>credit transfer
    
    DB->>DB: Validate & Accept
    
    DB->>GW: pacs.008<br/>Customer Credit Transfer
    Note right of DB: FI-to-FI message
    
    GW->>GW: Route via<br/>Clearing System
    
    GW->>CB: pacs.008<br/>Forward Payment
    
    CB->>CB: Credit Account
    
    CB->>C: camt.054<br/>Credit Notification
    Note right of CB: Funds credited
    
    CB->>GW: pacs.002<br/>Payment Status (Accepted)
    
    GW->>DB: pacs.002<br/>Status Report
    
    DB->>D: pain.002<br/>Payment Status
\`\`\`

### Real-World Example: SEPA Instant Payment

\`\`\`xml
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>SEPA-INST-2025-0626-001</MsgId>
      <CreDtTm>2025-06-26T10:15:30.123Z</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <TtlIntrBkSttlmAmt Ccy="EUR">50.00</TtlIntrBkSttlmAmt>
      <IntrBkSttlmDt>2025-06-26</IntrBkSttlmDt>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys>
          <Prtry>INST</Prtry>
        </ClrSys>
      </SttlmInf>
      <PmtTpInf>
        <InstrPrty>HIGH</InstrPrty>
        <SvcLvl>
          <Cd>SEPA</Cd>
        </SvcLvl>
        <LclInstrm>
          <Cd>INST</Cd>
        </LclInstrm>
        <CtgyPurp>
          <Cd>CASH</Cd>
        </CtgyPurp>
      </PmtTpInf>
    </GrpHdr>
    
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>COFFEE-ORDER-12345</EndToEndId>
        <TxId>TXN-2025-0626-54321</TxId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="EUR">50.00</IntrBkSttlmAmt>
      <ChrgBr>SLEV</ChrgBr>
      <Dbtr>
        <Nm>Maria Schmidt</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <IBAN>DE89370400440532013000</IBAN>
        </Id>
      </DbtrAcct>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>COBADEFFXXX</BICFI>
        </FinInstnId>
      </DbtrAgt>
      <Cdtr>
        <Nm>CoffeeTech GmbH</Nm>
      </Cdtr>
      <CdtrAcct>
        <Id>
          <IBAN>FR1420041010050500013M02606</IBAN>
        </Id>
      </CdtrAcct>
      <CdtrAgt>
        <FinInstnId>
          <BICFI>BNPAFRPPXXX</BICFI>
        </FinInstnId>
      </CdtrAgt>
      <RmtInf>
        <Ustrd>Coffee order #12345</Ustrd>
      </RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>
\`\`\`

---

## SWIFT MT Messages

### Overview

SWIFT (Society for Worldwide Interbank Financial Telecommunication) MT (Message Type) messages have been the standard for international wire transfers for decades.

### Common Message Types

\`\`\`yaml
customer_transfers:
  MT103:
    name: "Single Customer Credit Transfer"
    usage: "Wire transfers between banks"
    fields: 30+
    
  MT103+:
    name: "Single Customer Credit Transfer (STP)"
    usage: "Straight-through processing"
    additional: "Structured remittance info"

financial_institution_transfers:
  MT202:
    name: "General Financial Institution Transfer"
    usage: "Bank-to-bank transfers"
    
  MT202COV:
    name: "Cover Payment"
    usage: "Cover for MT103"

account_management:
  MT940:
    name: "Customer Statement Message"
    usage: "End-of-day account statement"
    
  MT950:
    name: "Statement Message"
    usage: "Intraday statement"

notifications:
  MT900:
    name: "Confirmation of Debit"
    usage: "Notify account debit"
    
  MT910:
    name: "Confirmation of Credit"
    usage: "Notify account credit"
\`\`\`

### MT103 Structure

\`\`\`
{1:F01BANKUS33AXXX0000000000}          Basic Header
{2:I103BANKGB22XXXXN}                  Application Header
{3:{108:MT103 001 OF 001}}             User Header
{4:                                    Text Block (mandatory fields)
:20:REFERENCE-2025-0626-001            Transaction Reference
:23B:CRED                              Bank Operation Code
:32A:250626USD100000,                  Value Date, Currency, Amount
:50K:/1234567890                       Ordering Customer
JOHN DOE
123 MAIN STREET
NEW YORK NY 10001 US
:52A:BANKUS33XXX                       Ordering Institution
:57A:BANKGB22XXX                       Beneficiary Institution
:59:/GB29NWBK60161331926819           Beneficiary Customer
ABC COMPANY LTD
456 HIGH STREET
LONDON EC1A 1BB GB
:70:INVOICE INV-2025-001               Remittance Information
:71A:OUR                               Details of Charges
-}                                     End of Text Block
{5:{MAC:12345678}}                    Trailer (optional)
\`\`\`

### Field Definitions

\`\`\`yaml
MT103_fields:
  mandatory:
    ":20:":
      name: "Transaction Reference"
      format: "16x"
      example: "REFERENCE-2025-001"
      
    ":23B:":
      name: "Bank Operation Code"
      format: "4!c"
      values: ["CRED", "CRTS", "SPAY", "SPRI", "SSTD"]
      
    ":32A:":
      name: "Value Date, Currency, Amount"
      format: "6!n3!a15d"
      example: "250626USD100000,"
      components:
        - "250626 (YYMMDD)"
        - "USD (currency)"
        - "100000, ($1,000.00)"
    
    ":50K:":
      name: "Ordering Customer"
      format: "4*35x"
      lines: 4
      example: |
        /1234567890
        JOHN DOE
        123 MAIN STREET
        NEW YORK NY 10001 US
    
    ":59:":
      name: "Beneficiary Customer"
      format: "4*35x"
      lines: 4
      
  optional:
    ":51A:":
      name: "Sending Institution"
      
    ":52A:":
      name: "Ordering Institution (BIC)"
      
    ":56A:":
      name: "Intermediary Institution"
      
    ":57A:":
      name: "Account With Institution (BIC)"
      
    ":70:":
      name: "Remittance Information"
      format: "4*35x"
      max_lines: 4
      
    ":71A:":
      name: "Details of Charges"
      values:
        OUR: "All charges for ordering customer"
        BEN: "All charges for beneficiary"
        SHA: "Shared (each pays their bank)"
\`\`\`

### MT to ISO 20022 Migration

\`\`\`mermaid
graph LR
    A[SWIFT MT Messages] --> B[Migration Period<br/>2022-2025]
    B --> C[ISO 20022 Messages]
    
    D[MT103] -.Maps to.-> E[pacs.008]
    F[MT202] -.Maps to.-> G[pacs.009]
    H[MT940] -.Maps to.-> I[camt.053]
    J[MT900/910] -.Maps to.-> K[camt.054]
    
    style B fill:#ff9,stroke:#333
    style C fill:#9f9,stroke:#333
\`\`\`

**Migration Timeline:**
- November 2022: SWIFT begins ISO 20022 support
- November 2025: SWIFT ends MT message support
- All participants must be ready for ISO 20022

---

## Message Translation Engine

### Translation Architecture

\`\`\`mermaid
graph TB
    A[Source Message] --> B[Parser]
    B --> C[Canonical Format]
    C --> D[Field Mapper]
    D --> E[Data Transformer]
    E --> F[Enrichment]
    F --> G[Target Builder]
    G --> H[Target Message]
    
    I[Mapping Rules] --> D
    J[Transform Rules] --> E
    K[Reference Data] --> F
    L[Templates] --> G
\`\`\`

### Mapping Rules

**Example: ISO 8583 → ISO 20022**

\`\`\`yaml
mapping_rules:
  - source:
      standard: ISO_8583
      field: DE_2
      description: "Primary Account Number"
    target:
      standard: ISO_20022
      path: "Document.FIToFICstmrCdtTrf.CdtTrfTxInf.DbtrAcct.Id.Othr.Id"
      transform: "last_4_digits"
      
  - source:
      standard: ISO_8583
      field: DE_4
      description: "Amount"
    target:
      standard: ISO_20022
      path: "Document.FIToFICstmrCdtTrf.CdtTrfTxInf.IntrBkSttlmAmt"
      transform: "divide_by_100"  # Convert cents to dollars
      
  - source:
      standard: ISO_8583
      field: DE_49
      description: "Currency Code"
    target:
      standard: ISO_20022
      path: "Document.FIToFICstmrCdtTrf.CdtTrfTxInf.IntrBkSttlmAmt@Ccy"
      transform: "numeric_to_alpha"  # 840 → USD
\`\`\`

### Data Transformations

\`\`\`javascript
// Transformation functions
const transforms = {
  // Amount conversions
  divide_by_100: (value) => (parseInt(value) / 100).toFixed(2),
  multiply_by_100: (value) => (parseFloat(value) * 100).toString(),
  
  // Currency conversions
  numeric_to_alpha: (code) => {
    const map = { '840': 'USD', '978': 'EUR', '826': 'GBP' };
    return map[code] || code;
  },
  alpha_to_numeric: (code) => {
    const map = { 'USD': '840', 'EUR': '978', 'GBP': '826' };
    return map[code] || code;
  },
  
  // Date/time conversions
  mti_datetime_to_iso: (value) => {
    // MMDDhhmmss → ISO 8601
    const month = value.substr(0, 2);
    const day = value.substr(2, 2);
    const hour = value.substr(4, 2);
    const minute = value.substr(6, 2);
    const second = value.substr(8, 2);
    const year = new Date().getFullYear();
    return \`\${year}-\${month}-\${day}T\${hour}:\${minute}:\${second}Z\`;
  },
  
  // Account number masking
  last_4_digits: (value) => {
    return '*'.repeat(value.length - 4) + value.substr(-4);
  },
  
  // Format conversions
  remove_spaces: (value) => value.replace(/\s+/g, ''),
  trim: (value) => value.trim(),
  uppercase: (value) => value.toUpperCase()
};
\`\`\`

### Enrichment

\`\`\`yaml
enrichment_sources:
  bic_directory:
    description: "BIC code lookup"
    example:
      input: "BANKUS33"
      output:
        bic: "BANKUS33XXX"
        bank_name: "Bank of America"
        country: "US"
        city: "New York"
        
  currency_reference:
    description: "Currency code validation"
    example:
      input: "USD"
      output:
        numeric_code: "840"
        minor_units: 2
        name: "US Dollar"
        
  country_codes:
    description: "ISO 3166 country codes"
    example:
      input: "US"
      output:
        alpha_2: "US"
        alpha_3: "USA"
        numeric: "840"
        name: "United States"
\`\`\`

---

## Routing & Orchestration

### Routing Engine

\`\`\`mermaid
graph TB
    A[Incoming Message] --> B{Message Type}
    
    B -->|Authorization| C{Amount Check}
    B -->|Financial| D{Currency Check}
    B -->|Reversal| E[Reversal Queue]
    
    C -->|< $1000| F[Fast Auth Network]
    C -->|>= $1000| G[Premium Network]
    
    D -->|USD| H[US Domestic]
    D -->|EUR| I[SEPA Network]
    D -->|Other| J[SWIFT Network]
    
    F --> K[Route & Send]
    G --> K
    H --> K
    I --> K
    J --> K
    E --> K
\`\`\`

### Routing Rules Configuration

\`\`\`json
{
  "routing_rules": [
    {
      "rule_id": "R001",
      "name": "High-value domestic USD",
      "priority": 1,
      "conditions": {
        "message_type": "pacs.008",
        "currency": "USD",
        "amount": { "$gte": 10000 },
        "country_same": true
      },
      "target": {
        "network": "FedWire",
        "priority": "urgent",
        "sla_minutes": 15
      }
    },
    {
      "rule_id": "R002",
      "name": "SEPA instant payments",
      "priority": 2,
      "conditions": {
        "message_type": "pacs.008",
        "currency": "EUR",
        "service_level": "INST",
        "amount": { "$lte": 100000 }
      },
      "target": {
        "network": "SEPA_INST",
        "settlement": "instant",
        "sla_seconds": 10
      }
    },
    {
      "rule_id": "R003",
      "name": "Cross-border high-value",
      "priority": 3,
      "conditions": {
        "message_type": ["pacs.008", "MT103"],
        "amount": { "$gte": 50000 },
        "country_same": false
      },
      "target": {
        "network": "SWIFT",
        "message_priority": "urgent",
        "compliance_check": true
      }
    }
  ]
}
\`\`\`

---

## Security & Compliance

### Security Layers

\`\`\`mermaid
graph TB
    A[Security Layers] --> B[Network Security]
    A --> C[Application Security]
    A --> D[Data Security]
    A --> E[Operational Security]
    
    B --> B1[Firewall]
    B --> B2[DDoS Protection]
    B --> B3[VPN/Private Link]
    B --> B4[IP Whitelisting]
    
    C --> C1[mTLS Authentication]
    C --> C2[API Key Management]
    C --> C3[OAuth 2.0]
    C --> C4[Rate Limiting]
    
    D --> D1[Encryption at Rest<br/>AES-256]
    D --> D2[Encryption in Transit<br/>TLS 1.3]
    D --> D3[Message Signing]
    D --> D4[Key Rotation]
    
    E --> E1[Audit Logging]
    E --> E2[Monitoring]
    E --> E3[Incident Response]
    E --> E4[Compliance Scanning]
\`\`\`

### Compliance Standards

\`\`\`yaml
compliance:
  pci_dss:
    level: "Level 1"
    scope: "Card data handling"
    certification: "Annual QSA audit"
    
  iso_27001:
    scope: "Information security management"
    certification: "External audit"
    review: "Annual"
    
  soc_2_type_ii:
    controls:
      - security
      - availability
      - confidentiality
    audit: "Annual"
    
  gdpr:
    scope: "Personal data processing"
    dpo: "Designated"
    dpia: "Required for high-risk"
    
  aml_cft:
    sanctions_screening: "Real-time"
    transaction_monitoring: "Enabled"
    reporting: "SAR/STR as required"
\`\`\`

---

## Integration Guide

### Getting Started

**Step 1: Provision Gateway**

\`\`\`bash
curl -X POST https://api.fts.money/v1/iso-gateway/provision \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Your Company",
    "source_format": "ISO_8583",
    "target_format": "ISO_20022",
    "connection_type": "TCP",
    "monthly_volume": 50000
  }'
\`\`\`

**Step 2: Configure Connection**

\`\`\`json
{
  "connection_id": "conn_abc123",
  "endpoints": {
    "inbound": {
      "protocol": "TCP",
      "host": "gateway.fts.money",
      "port": 8583,
      "tls": true,
      "client_cert_required": true
    },
    "outbound": {
      "protocol": "HTTPS",
      "url": "https://api.yourbank.com/messages",
      "auth_type": "MUTUAL_TLS"
    }
  },
  "message_types": ["0100", "0110", "0200", "0210", "0400", "0410"]
}
\`\`\`

**Step 3: Test Connection**

\`\`\`bash
# Send test message
curl -X POST https://gateway.fts.money/test \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mti": "0100",
    "fields": {
      "2": "4111111111111111",
      "3": "000000",
      "4": "000000010000"
    }
  }'

# Response
{
  "status": "success",
  "message_id": "msg_xyz789",
  "translated": true,
  "target_format": "ISO_20022",
  "latency_ms": 42
}
\`\`\`

---

## Operations & Monitoring

### Dashboard Metrics

\`\`\`
ISO Gateway Dashboard

Real-Time Metrics:
  Messages/Second:           1,247
  Success Rate:              99.97%
  Avg Latency:              45ms
  Error Rate:               0.03%

Today's Summary:
  Total Messages:           4,234,567
  ISO 8583:                 2,145,890 (50.7%)
  ISO 20022:                1,876,543 (44.3%)
  SWIFT MT:                   212,134 (5.0%)
  
  Translations:             4,234,567
  Successful:               4,233,298 (99.97%)
  Failed:                       1,269 (0.03%)
  
Network Distribution:
  Visa Network:             1,234,567 (29.1%)
  Mastercard:                 987,654 (23.3%)
  SEPA:                       765,432 (18.1%)
  SWIFT:                      654,321 (15.5%)
  Other:                      592,593 (14.0%)
\`\`\`

### Monitoring & Alerts

\`\`\`yaml
monitoring:
  metrics:
    - name: "message_throughput"
      type: "gauge"
      unit: "messages/second"
      alert_threshold: 10000
      
    - name: "translation_latency"
      type: "histogram"
      unit: "milliseconds"
      alert_threshold: 100
      
    - name: "error_rate"
      type: "counter"
      unit: "percentage"
      alert_threshold: 1.0
      
  alerts:
    - name: "High Error Rate"
      condition: "error_rate > 1%"
      duration: "5 minutes"
      severity: "critical"
      notification: ["email", "pagerduty"]
      
    - name: "Slow Translation"
      condition: "p95_latency > 100ms"
      duration: "10 minutes"
      severity: "warning"
      notification: ["email"]
\`\`\`

---

## Conclusion

The ISO Gateway Service bridges the gap between legacy and modern payment systems, enabling seamless communication across all major standards (ISO 8583, ISO 20022, SWIFT MT).

**Key Benefits:**

1. **Universal Connectivity:** Connect any system to any network
2. **Fast Deployment:** Weeks, not years
3. **High Performance:** <50ms translation latency
4. **Reliability:** 99.99% uptime SLA
5. **Compliance:** Built-in regulatory adherence

**Support:**

- Documentation: https://docs.fts.money/iso-gateway
- Support: iso-gateway@fts.money
- Status: https://status.fts.money/iso-gateway

---

**Document Information**

- **Version:** 2.0
- **Last Updated:** January 11, 2026
- **Status:** Active
- **Classification:** Technical
- **Owner:** ISO Gateway Team
- **Contact:** iso-gateway@fts.money

© 2026 FTS.Money. All rights reserved.`;

export default ISOGatewayDoc;