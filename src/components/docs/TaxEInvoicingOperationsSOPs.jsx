const TaxEInvoicingOperationsSOPs = `# Tax Management & E-Invoicing Operations SOPs
## Automated Tax Compliance & Government Submission

**Document Classification:** Internal Use Only  
**Version:** 1.0  
**Last Updated:** January 11, 2026  
**Owner:** Tax Operations Manager

---

## Table of Contents

1. [Overview](#overview)
2. [Tax Rate Management](#tax-rate-management)
3. [Real-Time Tax Calculation](#tax-calculation)
4. [E-Invoice Generation](#einvoice-generation)
5. [Government Submission](#government-submission)
6. [Compliance Monitoring](#compliance-monitoring)
7. [Multi-Country Operations](#multi-country-operations)

---

## Overview

### Tax Service Coverage

**170+ Countries Supported:**
- VAT/GST calculation and reporting
- Sales tax (US, Canada)
- Withholding tax (global)
- E-invoicing submission (60+ countries)

### Tax Automation Architecture

\`\`\`mermaid
graph TB
    A[Transaction Event] --> B[Tax Calculation Engine]
    B --> C{Jurisdiction Rules}
    
    C --> D[Lookup Tax Rate<br/>TaxRate Entity]
    C --> E[Apply Tax Categories<br/>UNCL5305]
    C --> F[Check Reverse Charge<br/>B2B Rules]
    
    D --> G[Calculate Tax]
    E --> G
    F --> G
    
    G --> H[Apply to Invoice]
    H --> I{E-Invoice Required?}
    
    I -->|Yes| J[Generate E-Invoice XML]
    I -->|No| K[Standard Invoice]
    
    J --> L[Submit to Government]
    K --> M[Store Invoice]
    L --> M
    
    M --> N[Update Tax Records]
    
    style G fill:#3b82f6,color:#fff
    style L fill:#10b981,color:#fff
\`\`\`

---

## SOP-TAX-001: Tax Rate Database Management & Updates

### Purpose
Maintain accurate, up-to-date tax rates for 170+ countries through automated updates and manual verification.

### Tax Rate Update Sources

| Source | Coverage | Update Frequency | Reliability | Cost |
|--------|----------|-----------------|-------------|------|
| **Avalara API** | 100+ countries | Real-time | High | $500/mo |
| **TaxJar API** | US sales tax | Real-time | High | Included (if customer) |
| **OECD Database** | 180+ countries | Monthly | Medium | Free |
| **EU VIES** | 27 EU countries | Real-time | High | Free |
| **Government APIs** | Varies (20+ countries) | Varies | High | Free |
| **Manual Research** | All | As needed | Varies | Staff time |

### Automated Tax Rate Update Process

**Daily Sync (2am UTC):**

\`\`\`mermaid
flowchart TD
    A[Scheduled Task Triggers] --> B[Query Avalara API]
    B --> C[Query TaxJar API]
    C --> D[Query OECD Database]
    
    D --> E[Compare to Current Rates in Database]
    E --> F{Changes Detected?}
    
    F -->|No Changes| G[Log: No Updates]
    F -->|Changes Found| H[Create TaxUpdateLog Entry]
    
    H --> I{Change Type}
    
    I -->|Rate Increase/Decrease| J[Auto-Apply if <2% Change]
    I -->|New Tax Type| K[Manual Review Required]
    I -->|Rate Removed| K
    
    J --> L[Update TaxRate Entity]
    L --> M[Notify Tax Operations Team]
    M --> N[Log Applied Update]
    
    K --> O[Create Approval Task]
    O --> P[Tax Manager Reviews]
    P --> Q{Approve?}
    
    Q -->|Yes| L
    Q -->|No| R[Reject + Document Reason]
    
    style J fill:#10b981,color:#fff
    style K fill:#f59e0b,color:#fff
\`\`\`

**Auto-Apply Criteria:**
- Rate change <2% (e.g., 20% VAT → 20.5% VAT)
- Same tax type (no new taxes)
- Source: Avalara or government API (high trust)
- Effective date >7 days in future (time to verify)

**Manual Review Required:**
- Rate change >2%
- New tax introduced
- Tax type removed
- Conflicting sources (Avalara says 20%, OECD says 19%)
- Effective immediately (<7 days)

### Tax Rate Verification Process

**Weekly Manual Verification (Spot Checks):**
- Randomly select 10 countries
- Cross-reference rates against government websites
- Document findings
- Adjust if discrepancies found

**Quarterly Full Audit:**
- Review all 170+ countries
- Verify against official government sources
- Update notes and effective dates
- Flag outdated rates for research

### Tax Rate Communication

**Customer Notifications:**
- **Major Changes (>5% rate change):** Email 30 days before effective date
- **Minor Changes (<5%):** Included in monthly platform update
- **New Tax Introduction:** Email immediately + update docs

### Metrics

- Tax rate accuracy (target: >99.5% - verified via audit)
- Tax update lag time (target: <24 hours from official government announcement)
- Auto-update rate (target: >80% of updates applied automatically)
- Customer tax calculation disputes (target: <1% of transactions)

---

## SOP-TAX-002: Real-Time Tax Calculation Engine

### Purpose
Calculate correct tax amounts for transactions in real-time across 170+ jurisdictions.

### Tax Calculation Logic Flow

\`\`\`mermaid
flowchart TD
    A[Transaction Initiated] --> B[Determine Jurisdiction]
    
    B --> C{Transaction Type}
    C -->|B2C Goods| D[Destination Taxation]
    C -->|B2C Digital Services| E[Customer Location]
    C -->|B2B| F[Reverse Charge Assessment]
    
    D --> G[Lookup Tax Rate by Country]
    E --> G
    F --> H{Valid VAT ID?}
    
    H -->|Yes| I[0% Tax - Reverse Charge]
    H -->|No| G
    
    G --> J[Determine Tax Categories]
    J --> K[Apply Rates]
    K --> L[Calculate Tax Amount]
    L --> M[Apply to Transaction]
    
    I --> M
    
    M --> N[Return Tax Details to Customer]
    
    style L fill:#3b82f6,color:#fff
    style M fill:#10b981,color:#fff
\`\`\`

### Jurisdiction Determination Rules

**For Digital Services (SaaS, APIs):**

| Customer Location | Supplier Location | Tax Jurisdiction | Tax Rate Source |
|------------------|------------------|------------------|-----------------|
| EU | EU (same country) | Supplier country VAT | Domestic rate |
| EU | EU (different country) | Customer country VAT (B2C) | Destination rate |
| EU (B2B with VAT ID) | EU | Reverse charge (0%) | N/A |
| EU | Non-EU | Customer country VAT | Import VAT rate |
| US | US (same state) | State + local sales tax | TaxJar API |
| US | US (different state) | Nexus determination | Complex (state laws vary) |
| International | Any | Customer country | OECD guidance |

**Nexus Determination (US):**
- Economic nexus thresholds vary by state ($100K-$500K annual sales)
- FTS.Money monitors revenue by state
- Alerts when approaching nexus threshold
- Registers for sales tax collection when exceeded

### Tax Category Classification

**UN/CEFACT UNCL5305 Standard:**

| Category Code | Description | Typical Rate | Use Cases |
|--------------|-------------|--------------|-----------|
| **S** | Standard Rate | 15-27% | Most services |
| **Z** | Zero-Rated | 0% | Exports, essential goods |
| **E** | Exempt | 0% | Financial services (some jurisdictions) |
| **AE** | Reverse Charge | 0% (customer self-assesses) | B2B intra-EU |
| **G** | Free Export | 0% | Services to non-EU customers |
| **O** | Outside Scope | N/A | Not subject to VAT |

**FTS.Money Service Classification:**

| FTS Service | Category | Typical VAT Treatment |
|-------------|----------|---------------------|
| PSP Platform Subscription | S (Standard) | 20% VAT (if EU B2C) |
| Transaction Fees | S (Standard) OR E (Exempt) | Varies - some jurisdictions exempt payment processing |
| Crypto VASP | E (Exempt) | Crypto services often VAT-exempt |
| Professional Services | S (Standard) | 20% VAT |
| Software Licenses | S (Standard) | 20% VAT |

### Metrics

- Tax calculation accuracy (target: >99.9%)
- Tax calculation latency (target: <50ms)
- Tax disputes (target: <0.5% of invoices)
- Jurisdiction determination accuracy (target: 100%)

---

## SOP-TAX-003: E-Invoice Generation & Government Submission

### Purpose
Generate compliant e-invoices and submit to government portals per country mandates.

### E-Invoice Country Coverage

**Supported Countries & Formats:**

| Country | Standard | Mandate Status | Submission Method | Go-Live Date |
|---------|----------|---------------|------------------|--------------|
| **Saudi Arabia** | ZATCA (Fatoora) | Mandatory (Phase 2) | API to ZATCA portal | Dec 2023 |
| **Italy** | FatturaPA | Mandatory | SDI (Sistema di Interscambio) | Jan 2019 |
| **Mexico** | CFDI 4.0 | Mandatory | SAT portal | Jan 2022 |
| **France** | Chorus Pro (Factur-X) | Mandatory (B2G), voluntary (B2B) | Chorus Pro platform | Jan 2020 |
| **Germany** | XRechnung / ZUGFeRD | Mandatory (B2G) | PEPPOL or email | Nov 2020 |
| **Poland** | KSeF | Mandatory (July 2024) | KSeF API | July 2024 |
| **India** | GST E-Invoice | Mandatory (>50M INR turnover) | IRP (Invoice Registration Portal) | Oct 2020 |
| **EU (General)** | PEPPOL | Voluntary (cross-border B2B) | PEPPOL network | Ongoing |

### E-Invoice Generation Workflow

\`\`\`mermaid
sequenceDiagram
    participant Customer as Business Customer
    participant Portal as E-Invoice Portal
    participant Engine as Invoice Generator
    participant Validator as XML Validator
    participant Signature as Digital Signature
    participant Govt as Government Portal
    
    Customer->>Portal: Upload Invoice Data (CSV/JSON)
    Portal->>Engine: Trigger generation
    
    Engine->>Engine: Map data to country format
    Engine->>Engine: Generate XML (ZATCA/FatturaPA/etc)
    
    Engine->>Validator: Validate against XSD schema
    Validator->>Validator: Check all required fields
    Validator->>Engine: Validation result
    
    alt Validation Failed
        Engine->>Portal: Return errors to customer
        Portal->>Customer: Fix and resubmit
    else Validation Passed
        Engine->>Signature: Sign invoice digitally
        Signature->>Signature: Apply certificate (country-specific)
        Signature->>Engine: Signed XML
        
        Engine->>Portal: Preview for customer
        Portal->>Customer: Review invoice
        Customer->>Portal: Approve
        
        Portal->>Govt: Submit invoice
        Govt->>Govt: Validate and process
        Govt->>Portal: Acceptance confirmation + Invoice ID
        
        Portal->>Customer: Submission successful
        Portal->>Customer: Provide govt invoice ID
    end
\`\`\`

### Country-Specific Submission Procedures

#### Saudi Arabia (ZATCA) Example

**Phase 2 Requirements:**
- Real-time invoice submission (<24 hours of issuance)
- Digital signature using ZATCA-approved certificate
- QR code on invoice (links to ZATCA portal for verification)
- Invoice UUID (unique identifier)

**Submission Process:**

\`\`\`yaml
zatca_submission:
  step_1_generation:
    action: Generate invoice XML per ZATCA spec
    validation: XSD schema v1.0.4
    
  step_2_hash:
    action: Calculate invoice hash (SHA-256)
    purpose: Integrity verification
    
  step_3_signature:
    action: Sign with ZATCA certificate (X.509)
    algorithm: RSA-SHA256
    
  step_4_qr_code:
    action: Encode base64 QR code data
    content: Seller VAT, timestamp, total, tax, hash
    
  step_5_submission:
    endpoint: https://api.zatca.gov.sa/invoices
    method: POST
    auth: OAuth 2.0 bearer token
    
  step_6_validation:
    response: UUID + status (ACCEPTED, REJECTED, WARNING)
    error_handling: Retry up to 3x, then manual review
    
  step_7_storage:
    action: Store UUID + submission proof
    retention: 10 years (ZATCA requirement)
\`\`\`

**Common Rejection Reasons:**
- Invalid VAT number
- Missing required fields
- Signature validation failed
- Duplicate invoice number
- Tax calculation error

**Resolution SLA:** <2 hours for rejection review and resubmission

### E-Invoice Compliance Dashboard

**For Each Country:**

| Country | Invoices Submitted | Acceptance Rate | Avg Submission Time | Issues |
|---------|-------------------|----------------|---------------------|--------|
| Saudi Arabia | 1,240 | 98.4% | 1.2 seconds | 20 rejections (corrected) |
| Italy | 850 | 99.1% | 2.3 seconds | 8 rejections |
| Poland | 420 | 97.8% | 3.1 seconds | 9 rejections |
| India | 2,100 | 96.5% | 4.5 seconds | 73 rejections |

**Alert Thresholds:**
- Acceptance rate <95%: Investigate within 24 hours
- Submission failure: Immediate retry, alert if fails 3x
- Government API down: Switch to manual submission process

### Metrics

- E-invoice submission success rate (target: >98%)
- E-invoice generation time (target: <5 seconds)
- Government acceptance rate (target: >97%)
- Compliance with submission deadlines (target: 100%)
- Customer e-invoice errors (target: <2% require correction)

---

## Appendix: E-Invoice Format Samples

### ZATCA (Saudi Arabia) Structure

\`\`\`xml
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <UUID>8e3b5e7f-9d2c-4a1b-8f6e-1234567890ab</UUID>
  <IssueDate>2026-01-15</IssueDate>
  <InvoiceTypeCode>388</InvoiceTypeCode>
  <AccountingSupplierParty>
    <Party>
      <PartyTaxScheme>
        <CompanyID>300000000000003</CompanyID>
        <TaxScheme><ID>VAT</ID></TaxScheme>
      </PartyTaxScheme>
    </Party>
  </AccountingSupplierParty>
  <LegalMonetaryTotal>
    <TaxExclusiveAmount currencyID="SAR">1000.00</TaxExclusiveAmount>
    <TaxInclusiveAmount currencyID="SAR">1150.00</TaxInclusiveAmount>
  </LegalMonetaryTotal>
  <TaxTotal>
    <TaxAmount currencyID="SAR">150.00</TaxAmount>
  </TaxTotal>
</Invoice>
\`\`\`

---

**Document Information**
- **Version:** 1.0
- **Last Updated:** January 11, 2026
- **Owner:** Tax Operations Manager

© 2026 FTS.Money. Internal use only.
`;

export default TaxEInvoicingOperationsSOPs;