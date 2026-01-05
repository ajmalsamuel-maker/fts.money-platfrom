
import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const EInvoicingSystemDoc = `# E-Invoicing System

## Executive Summary

The FTS.Money E-Invoicing System enables PSPs and merchants to generate, validate, and submit electronic invoices compliant with global standards including **Peppol BIS Billing 3.0**, **ZATCA (Saudi Arabia)**, **FatturaPA (Italy)**, **CFDI (Mexico)**, **UBL 2.1**, and **UN/CEFACT CII D16B**.

### Key Features
- ✅ **Multi-Standard Support** - 8+ international e-invoicing formats
- ✅ **Automated Generation** - Convert transactions to compliant e-invoices
- ✅ **Real-time Validation** - Schema validation before submission
- ✅ **Government Gateway Integration** - Direct submission to tax authorities
- ✅ **QR Code Generation** - Embedded payment/verification QR codes
- ✅ **Multi-Language** - Invoice generation in 20+ languages
- ✅ **Audit Trail** - Complete e-invoice lifecycle tracking

---

## Supported E-Invoicing Standards

### Standards Overview

| Standard | Region | Format | Mandate Status | Use Cases |
|----------|--------|--------|----------------|-----------|
| **Peppol BIS Billing 3.0** | EU, Global | UBL 2.1 XML | Mandatory (EU Public Sector) | Cross-border B2B, B2G |
| **ZATCA (Fatoora)** | Saudi Arabia | UBL 2.1 XML | Mandatory (All businesses) | KSA domestic invoicing |
| **FatturaPA** | Italy | XML (FatturaPA) | Mandatory (All B2B/B2G) | Italian domestic invoicing |
| **CFDI 4.0** | Mexico | XML (CFDI) | Mandatory (All businesses) | Mexican invoicing & tax |
| **UN/CEFACT CII D16B** | Global | XML | Voluntary | International trade |
| **UBL 2.1** | Global | XML | Voluntary | Generic B2B invoicing |
| **Factur-X** | France, Germany | PDF/A-3 + XML | Voluntary | Hybrid paper/digital |
| **PINT (A-NZ)** | Asia-Pacific | UBL 2.1/CII | Emerging | APAC cross-border |

---

## System Architecture

### E-Invoicing Engine Flow
\`\`\`mermaid
graph TB
    A[Transaction Completed] --> B{E-Invoice Enabled?}
    B -->|No| C[Standard Invoice]
    B -->|Yes| D[E-Invoice Generator]
    
    D --> E[Select Standard]
    E --> F{Standard Type}
    
    F -->|Peppol| G[Peppol BIS 3.0 Template]
    F -->|ZATCA| H[ZATCA Phase 2 Template]
    F -->|FatturaPA| I[FatturaPA 1.7 Template]
    F -->|CFDI| J[CFDI 4.0 Template]
    F -->|Other| K[Generic UBL/CII]
    
    G --> L[Populate Invoice Data]
    H --> L
    I --> L
    J --> L
    K --> L
    
    L --> M[Apply Tax Rules]
    M --> N[Generate QR Code]
    N --> O[XML Schema Validator]
    
    O --> P{Valid?}
    P -->|No| Q[Log Validation Errors]
    P -->|Yes| R[Sign Invoice Cryptographically]
    
    R --> S[Store in Database]
    S --> T{Auto-Submit?}
    
    T -->|Yes| U[Submit to Government Gateway]
    T -->|No| V[Ready for Manual Submission]
    
    U --> W{Submission Result}
    W -->|Success| X[Mark as Submitted]
    W -->|Failure| Y[Retry Queue]
    
    Q --> Z[Alert Merchant]
    X --> AA[Send Invoice to Customer]
    Y --> Z
\`\`\`

### Integration Points
\`\`\`mermaid
sequenceDiagram
    participant PSP as PSP Platform
    participant Engine as E-Invoice Engine
    participant Validator as Schema Validator
    participant Gateway as Government Gateway
    participant Storage as Document Storage
    participant Customer as Customer
    
    PSP->>Engine: Generate E-Invoice
    Engine->>Engine: Select Standard Template
    Engine->>Engine: Populate Data (ISO 20022)
    Engine->>Validator: Validate XML Schema
    
    alt Valid
        Validator-->>Engine: Validation Success
        Engine->>Engine: Cryptographic Signature
        Engine->>Storage: Store E-Invoice
        Engine->>Gateway: Submit to Tax Authority
        
        alt Submission Success
            Gateway-->>Engine: Approval + UUID
            Engine->>Storage: Update Status
            Engine->>Customer: Send E-Invoice (Email/API)
            Engine-->>PSP: Invoice Submitted Successfully
        else Submission Failed
            Gateway-->>Engine: Rejection + Errors
            Engine->>Storage: Log Errors
            Engine-->>PSP: Submission Failed (Retry)
        end
        
    else Invalid
        Validator-->>Engine: Validation Errors
        Engine->>Storage: Log Errors
        Engine-->>PSP: Validation Failed
    end
\`\`\`

---

## Invoice Generation Workflows

### Standard E-Invoice Generation
\`\`\`mermaid
flowchart TD
    A[Transaction Processed] --> B[Gather Invoice Data]
    B --> C{Customer Type}
    
    C -->|B2C| D[Consumer Invoice]
    C -->|B2B| E[Business Invoice]
    C -->|B2G| F[Government Invoice]
    
    D --> G[Select Language/Currency]
    E --> G
    F --> G
    
    G --> H{Destination Country}
    
    H -->|Saudi Arabia| I[ZATCA Template]
    H -->|Italy| J[FatturaPA Template]
    H -->|Mexico| K[CFDI Template]
    H -->|EU| L[Peppol BIS Template]
    H -->|Other| M[Generic UBL Template]
    
    I --> N[Apply VAT Rules]
    J --> N
    K --> N
    L --> N
    M --> N
    
    N --> O[Calculate Totals]
    O --> P[Generate Invoice Lines]
    P --> Q[Add Tax Breakdown]
    Q --> R[Generate QR Code]
    R --> S[Create XML Document]
    S --> T[Validate Schema]
    
    T --> U{Valid?}
    U -->|No| V[Fix Errors]
    U -->|Yes| W[Sign Document]
    
    V --> S
    W --> X[Store Invoice]
    X --> Y[Auto-Submit or Manual]
\`\`\`

---

## Compliance & Best Practices

### For PSPs
1. **Test in Sandbox** - Always test with government sandbox environments before production
2. **Maintain Certificates** - Keep cryptographic certificates valid and renewed
3. **Monitor Rejection Rates** - Investigate and fix common rejection reasons
4. **Backup Storage** - Store all e-invoices for statutory periods (7-10 years)
5. **Version Control** - Track standard versions and migrate when updated

### For Merchants
1. **Accurate Master Data** - Maintain up-to-date supplier/customer information
2. **Test Customer Endpoints** - Verify Peppol endpoints before sending invoices
3. **Review Before Submit** - Check invoices for accuracy before auto-submission
4. **Track Status** - Monitor submission status via dashboard
5. **Archive Properly** - Keep digital and physical copies as required by law

---

*Document Version: 1.0 | Last Updated: 2025-01-05*
`;

export default EInvoicingSystemDoc;
