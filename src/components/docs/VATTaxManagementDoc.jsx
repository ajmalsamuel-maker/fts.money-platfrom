const VATTaxManagementDoc = `# VAT & Tax Management System - Complete Technical Specification

## Executive Summary

The FTS.Money VAT & Tax Management System is a comprehensive, globally-compliant automated tax calculation and reporting platform built on international standards including **UN/CEFACT UNCL5305** (tax categories), **UNSPSC** (product classification), **UN CPC** (service classification), and **ISO 20022** (financial messaging). The system automatically determines applicable tax jurisdictions, calculates VAT/GST/sales tax, applies complex rules like reverse charge and MOSS/OSS, generates compliant tax invoices, and produces regulatory reports for 100+ countries.

### What is VAT?

**VAT (Value Added Tax)** is a consumption tax levied on the value added at each stage of production or distribution. Unlike sales tax (charged only at final sale), VAT is collected incrementally at each transaction in the supply chain, with businesses reclaiming VAT paid on inputs (input VAT) and remitting VAT collected on outputs (output VAT) to tax authorities.

**Global VAT Landscape:**
- **170+ countries** use VAT/GST systems
- **Standard rates:** 15-27% (EU average: 21%)
- **Revenue:** VAT represents 20-30% of government tax revenue globally
- **Digital economy:** Special rules for cross-border digital services

### Why Automated VAT Management?

**Complexity Drivers:**
1. **Multi-Jurisdiction:** Different rates in 100+ countries
2. **Service Classification:** Digital vs physical goods vs financial services
3. **Customer Type:** B2C vs B2B with different rules
4. **Cross-Border:** Destination vs origin principle
5. **Special Regimes:** MOSS, OSS, reverse charge, margin schemes
6. **Rate Changes:** Governments change rates frequently
7. **Exemptions:** Financial, educational, healthcare, export exemptions

**Manual VAT Management Challenges:**
- Average 40 hours/month per jurisdiction for manual VAT compliance
- High error rate (15-25%) in manual tax calculations
- Delayed reporting leading to penalties ($500-$50,000 per late filing)
- Complexity of cross-border digital services (MOSS/OSS)
- Keeping track of rate changes across jurisdictions

**FTS.Money Automation Benefits:**
- <1 second real-time tax calculation
- 99.9%+ accuracy rate
- Automatic rate updates from government sources
- Zero manual calculation effort
- Pre-filled VAT returns ready for review and submission

---

## Global VAT/GST/Sales Tax Framework

### Tax System Types by Region

\`\`\`mermaid
graph TB
    subgraph "European Union - VAT"
        EU[EU VAT Directive<br/>Harmonized System]
        EU1[Standard Rate: 15-27%<br/>Reduced: 5-12%]
        EU2[MOSS/OSS System<br/>Digital Services]
        EU3[Reverse Charge<br/>B2B Services]
        EU4[Intra-EU Supply<br/>Zero-Rated]
    end
    
    subgraph "United Kingdom - VAT"
        UK[UK VAT Act<br/>Post-Brexit]
        UK1[Standard: 20%<br/>Reduced: 5%<br/>Zero: 0%]
        UK2[Digital Services Tax<br/>2% on revenues]
        UK3[Making Tax Digital<br/>MTD Mandate]
    end
    
    subgraph "GCC Countries - VAT"
        GCC[GCC VAT Agreement<br/>2016]
        GCC1[Standard: 5-15%<br/>Zero for exports]
        GCC2[KSA: 15%<br/>UAE: 5%<br/>Bahrain: 10%]
    end
    
    subgraph "Asia-Pacific - GST"
        APAC[Various GST Systems]
        APAC1[Singapore: 9%<br/>Australia: 10%<br/>India: 5-28%]
        APAC2[Malaysia: 0% currently<br/>Indonesia: 11%]
    end
    
    subgraph "Americas - Sales Tax/VAT"
        AMER[Mixed Systems]
        AMER1[US: State sales tax<br/>0-10.25%]
        AMER2[Canada: GST+PST<br/>5-15%]
        AMER3[Mexico: IVA 16%<br/>Brazil: ICMS varies]
    end
    
    subgraph "FTS.Money Tax Engine"
        FTS[Unified Tax Platform<br/>100+ Jurisdictions]
    end
    
    EU --> FTS
    UK --> FTS
    GCC --> FTS
    APAC --> FTS
    AMER --> FTS
    
    FTS --> AUTO[Automated Calculation<br/>Real-Time Compliance]
    
    style FTS fill:#10b981,color:#fff
    style AUTO fill:#2563eb,color:#fff
\`\`\`

### Major VAT Systems Comparison

| Aspect | EU VAT | UK VAT | GCC VAT | India GST | US Sales Tax |
|--------|--------|--------|---------|-----------|--------------|
| **Type** | Consumption tax | Consumption tax | Consumption tax | Dual GST | Sales tax |
| **Rates** | 15-27% std | 20% std | 5-15% | 5-28% tiered | 0-10.25% varies |
| **Input Credit** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Cross-Border** | Intra-EU rules | Import VAT | GCC imports | IGST | Interstate |
| **Digital Services** | MOSS/OSS | UK OSS | Destination | Destination | Nexus rules |
| **Reverse Charge** | ✅ B2B services | ✅ B2B services | ✅ Limited | ✅ RCM | ❌ No |
| **Registration Threshold** | €10K-€35K | £90K | Varies | INR 40 lakhs | $100K-$500K |
| **Filing Frequency** | Monthly/Quarterly | Quarterly | Quarterly | Monthly | Monthly |
| **E-Invoicing** | Optional (B2G) | Optional | Mandatory (KSA) | Mandatory | No |

---

## System Architecture

### Tax Calculation Flow

\`\`\`mermaid
flowchart TD
    A[Transaction Input] --> B[Gather Data]
    B --> C[Customer Location & Type]
    B --> D[Merchant Location]
    B --> E[Service Classification]
    
    C --> F[Jurisdiction Resolver]
    D --> F
    E --> F
    
    F --> G[Determine Tax Jurisdiction]
    G --> H[Load Tax Rates]
    H --> I[Apply Tax Category]
    
    I --> J{Special Rules?}
    J -->|MOSS/OSS| K[Apply OSS Rules]
    J -->|Reverse Charge| L[Apply Reverse Charge]
    J -->|Standard| M[Apply Standard Rate]
    
    K --> N[Calculate Tax Amount]
    L --> N
    M --> N
    
    N --> O[Validate VAT Numbers]
    O --> P[Round Per Country Rules]
    P --> Q[Generate Tax Breakdown]
    
    Q --> R[Tax Amount]
    Q --> S[Tax Category Code]
    Q --> T[Jurisdiction Info]
    Q --> U[Audit Log]
    
    style F fill:#2563eb,color:#fff
    style N fill:#10b981,color:#fff
    style O fill:#f59e0b,color:#fff
    style R fill:#8b5cf6,color:#fff
\`\`\`

---

## Tax Classification Standards

### UN/CEFACT UNCL5305 - Complete Tax Categories

**Primary Tax Category Codes:**

\`\`\`yaml
uncl5305_tax_categories:
  S_standard_rate:
    code: "S"
    name: "Standard Rate"
    description: "Default VAT/GST rate applicable in jurisdiction"
    vat_claimable: true
    use_cases:
      - "Most goods and services"
      - "Default when no exception applies"
    examples:
      - "UK: 20% on consumer goods"
      - "Germany: 19% on restaurant services"
      - "France: 20% on digital services"
      
  Z_zero_rated:
    code: "Z"
    name: "Zero-Rated"
    description: "0% VAT but input VAT is claimable"
    vat_claimable: true
    use_cases:
      - "Exports outside EU"
      - "Essential goods (bread, milk in some countries)"
      - "Children's clothing"
      - "Books and newspapers"
      - "Passenger transport"
    tax_treatment: "Taxable at 0% - VAT registration required"
    
  E_exempt:
    code: "E"
    name: "Exempt"
    description: "No VAT charged, no input VAT claimable"
    vat_claimable: false
    use_cases:
      - "Financial services (insurance, lending)"
      - "Healthcare services"
      - "Education and training"
      - "Postal services"
      - "Non-profit activities"
    tax_treatment: "Outside VAT system - no registration needed if only exempt supplies"
    
  AE_reverse_charge:
    code: "AE"
    name: "Reverse Charge"
    description: "Buyer accounts for VAT (B2B only)"
    vat_claimable: true
    use_cases:
      - "B2B services with non-resident supplier"
      - "Construction services (UK)"
      - "Mobile phones and computer chips (fraud prevention)"
      - "Emissions trading"
    tax_treatment: "Supplier charges 0%, buyer self-assesses VAT"
    mechanism: "Customer becomes liable for VAT payment"
    
  K_intra_eu_supply:
    code: "K"
    name: "Intra-Community Supply (EU)"
    description: "Cross-border EU B2B supply"
    vat_claimable: true
    use_cases:
      - "Goods moved between EU states (B2B)"
      - "Digital services EU to EU (B2B)"
    requirements:
      - "Buyer must have valid VAT number"
      - "VIES (VAT Information Exchange) validation"
      - "EC Sales List reporting"
    tax_treatment: "Zero-rated in origin, buyer accounts in destination"
    
  G_export_outside_eu:
    code: "G"
    name: "Export Outside EU"
    description: "Goods/services exported to non-EU countries"
    vat_claimable: true
    use_cases:
      - "Exports to USA, Asia, Africa, etc."
      - "International digital services to non-EU businesses"
    evidence_required:
      - "Customs export declaration"
      - "Proof of transport"
      - "Evidence of receipt in third country"
    tax_treatment: "Zero-rated export"
    
  O_out_of_scope:
    code: "O"
    name: "Out of Scope"
    description: "Not subject to VAT"
    vat_claimable: false
    use_cases:
      - "Transactions outside tax territory"
      - "Goods in bonded warehouse"
      - "Non-economic activity"
      - "Services to non-taxable persons in third countries"
    
  L_canary_islands:
    code: "L"
    name: "Canary Islands General Indirect Tax"
    description: "Special tax regime for Canary Islands"
    jurisdiction: "Spain - Canary Islands only"
    rate: "IGIC instead of IVA"
    
  M_tax_for_margin:
    code: "M"
    name: "Tax for Margin Scheme"
    description: "VAT on profit margin only"
    use_cases:
      - "Second-hand goods"
      - "Works of art"
      - "Antiques and collectors' items"
    tax_base: "Selling price minus purchase price (margin)"
    
  B_transferred:
    code: "B"
    name: "Transferred (VAT)"
    description: "VAT liability transferred to recipient"
    use_cases:
      - "Specific construction services"
      - "Certain property transactions"
      
  AA_lower_rate:
    code: "AA"
    name: "Lower Rate"
    description: "Reduced VAT rate"
    typical_rate: "5-12%"
    use_cases:
      - "Food and beverages"
      - "Hotel accommodation"
      - "Passenger transport"
      - "Cultural services"
      - "Medical equipment"
\`\`\`

---

## Service Classification Systems

### UNSPSC (United Nations Standard Products and Services Code)

**8-Digit Hierarchical Classification:**

\`\`\`
Structure: SEGMENT-FAMILY-CLASS-COMMODITY
Example: 81-11-15-00

Segment (81): Services
├─ Family (11): Computer Services
   ├─ Class (15): Software or Hardware Engineering
      └─ Commodity (00): All software engineering services
\`\`\`

**Payment Industry UNSPSC Codes:**

| UNSPSC Code | Description | Default Tax Category | Typical Rate | Common Exemptions |
|-------------|-------------|---------------------|--------------|-------------------|
| **81161500** | Payment processing services | E (Exempt) | 0% | Often exempt as financial service |
| **81161501** | Merchant acquiring | E (Exempt) | 0% | Financial service exemption |
| **81161502** | Card issuing services | E (Exempt) | 0% | Financial intermediation |
| **81161503** | Payment gateway | S (Standard) or E | 0-23% | Varies by jurisdiction - some exempt, some standard |
| **81111500** | Software development | S (Standard) | 19-27% | Educational software may be exempt |
| **81111501** | Software maintenance | S (Standard) | 19-27% | Same as underlying software |
| **81111502** | Software implementation | S (Standard) | 19-27% | Installation service |
| **81111503** | Software training | S (Standard) or AA (Reduced) | 5-27% | Training often reduced rate |
| **81161700** | Cloud hosting/SaaS | S (Standard) | 19-27% | Standard rate in most jurisdictions |
| **84121500** | Financial advisory | E (Exempt) | 0% | Investment advice exempt |
| **84121501** | Tax consulting | S (Standard) | 19-23% | Professional services |

### UN CPC (Central Product Classification)

**UN CPC for Services:**

\`\`\`yaml
un_cpc_codes:
  division_7_business_services:
    71_financial_services:
      713_financial_intermediation:
        71312: "Merchant acquiring services"
        71313: "Card issuing services"
        71314: "Payment transaction services"
        treatment: "Typically exempt from VAT"
        eu_directive: "Article 135 (financial exemptions)"
        
      714_investment_banking:
        71410: "Securities trading"
        71420: "Asset management"
        treatment: "Exempt"
        
    72_insurance_services:
      treatment: "Exempt in most jurisdictions"
      
    73_professional_services:
      731_legal:
        treatment: "Standard rate (reverse charge for B2B)"
      732_accounting:
        treatment: "Standard rate (may be exempt in some countries)"
      733_consulting:
        treatment: "Standard rate"
        
    74_telecommunications:
      741_telephony:
        treatment: "Standard rate"
      742_internet:
        treatment: "Standard rate"
      743_data_transmission:
        treatment: "Standard rate"
        
    84_computer_services:
      841_software:
        84110: "Software licensing"
        84120: "Software customization"
        84130: "Software support"
        treatment: "Standard rate"
      842_data_processing:
        84210: "Data processing"
        84220: "Cloud computing"
        treatment: "Standard rate"
        special_rules: "Digital services MOSS/OSS"
\`\`\`

---

## Tax Calculation Logic - Deep Dive

### Jurisdiction Determination Algorithm

**Supply Location Rules:**

\`\`\`javascript
/**
 * Determine tax jurisdiction for a transaction
 * Implements EU VAT Directive Articles 44-59ter
 */
async function determineJurisdiction(transaction) {
  const { 
    customer_country, 
    customer_type, 
    merchant_country,
    service_type,
    customer_vat_number 
  } = transaction;
  
  // Step 1: Classify service type
  const classification = await classifyService(service_type);
  
  // Step 2: Apply jurisdiction rules based on service type
  
  if (classification.is_digital_service) {
    // Digital services: B2C destination, B2B place of customer
    if (customer_type === 'B2C') {
      return {
        jurisdiction: customer_country,
        reason: 'Digital services B2C - destination principle (Article 58)',
        tax_point: 'customer_location'
      };
    } else {
      // B2B digital services
      if (isEU(customer_country) && isEU(merchant_country)) {
        // Intra-EU B2B digital - reverse charge
        return {
          jurisdiction: customer_country,
          reason: 'Intra-EU B2B digital - reverse charge (Article 44/196)',
          mechanism: 'reverse_charge',
          tax_point: 'customer_location'
        };
      } else {
        return {
          jurisdiction: customer_country,
          reason: 'B2B digital - place of customer',
          tax_point: 'customer_location'
        };
      }
    }
  }
  
  if (classification.is_financial_service) {
    // Financial services: typically place of supplier
    return {
      jurisdiction: merchant_country,
      reason: 'Financial services - place of supplier (Article 135)',
      exemption_check: true,
      tax_point: 'merchant_location'
    };
  }
  
  if (classification.involves_goods) {
    // Goods: place of delivery
    return {
      jurisdiction: transaction.delivery_country || customer_country,
      reason: 'Goods - place of delivery',
      tax_point: 'delivery_location'
    };
  }
  
  if (classification.is_b2b_service) {
    // Generic B2B services: place of customer (reverse charge)
    if (isEU(customer_country) && isEU(merchant_country)) {
      return {
        jurisdiction: customer_country,
        reason: 'Intra-EU B2B services - reverse charge (Article 196)',
        mechanism: 'reverse_charge',
        tax_point: 'customer_location'
      };
    } else {
      return {
        jurisdiction: customer_country,
        reason: 'B2B services - place of customer',
        tax_point: 'customer_location'
      };
    }
  }
  
  // Default: place of supplier
  return {
    jurisdiction: merchant_country,
    reason: 'Default - place of supplier',
    tax_point: 'merchant_location'
  };
}
\`\`\`

### MOSS/OSS System (Digital Services)

**EU One-Stop Shop (OSS) for Digital Services:**

\`\`\`mermaid
flowchart TD
    A[EU Merchant Sells Digital Service] --> B{Customer Location}
    
    B -->|EU Country| C{Quarterly Revenue Check}
    B -->|Non-EU| D[Domestic Rate Only]
    
    C -->|Below €10,000 threshold| E[Home Country Rate<br/>Simplification]
    C -->|Above €10,000 threshold| F[Destination Country Rate<br/>OSS Registration]
    
    E --> G[Charge Home Country VAT]
    G --> H[File Domestic VAT Return]
    
    F --> I[Charge Destination VAT]
    I --> J{Per Country}
    J -->|Germany| K[19% German VAT]
    J -->|France| L[20% French VAT]
    J -->|Spain| M[21% Spanish VAT]
    J -->|Other EU| N[Local Rate]
    
    K --> O[Aggregate All EU Sales]
    L --> O
    M --> O
    N --> O
    
    O --> P[File Single OSS Return]
    P --> Q[Submit to Home Country Tax Office]
    Q --> R[Tax Office Distributes to Member States]
    
    D --> S[No EU VAT]
    
    style F fill:#2563eb,color:#fff
    style P fill:#10b981,color:#fff
    style R fill:#8b5cf6,color:#fff
\`\`\`

**OSS Registration & Filing:**

\`\`\`yaml
oss_system:
  full_name: "One-Stop Shop (formerly MOSS - Mini One-Stop Shop)"
  effective_date: "July 1, 2021"
  scope: "All cross-border B2C supplies within EU"
  
  registration:
    where: "Home country tax authority"
    identifier: "EU VAT number + 'EU' prefix"
    example: "IE1234567T becomes EU372123456T"
    cost: "Free in most countries"
    
  threshold:
    amount: "€10,000 annual sales to other EU countries"
    calculation: "Previous and current calendar year"
    behavior:
      below: "Can charge home country rate"
      above: "Must charge destination country rate and register for OSS"
      
  filing_frequency: "Quarterly"
  filing_deadlines:
    q1: "April 30"
    q2: "July 31"
    q3: "October 31"
    q4: "January 31 (following year)"
    
  currency: "Euro (EUR) only"
  exchange_rates: "ECB rates on last day of quarter"
  
  payment_deadline: "Same as filing deadline"
  payment_method: "Bank transfer to home country tax office"
  
  oss_return_contents:
    for_each_member_state:
      - "Total taxable amount (by VAT rate)"
      - "VAT rate applied"
      - "VAT amount collected"
    
    example:
      member_state_de:
        supplies_at_19: "€50,000"
        vat_at_19: "€9,500"
        supplies_at_7: "€10,000"
        vat_at_7: "€700"
        total_vat_de: "€10,200"
      
      member_state_fr:
        supplies_at_20: "€35,000"
        vat_at_20: "€7,000"
        supplies_at_10: "€5,000"
        vat_at_10: "€500"
        total_vat_fr: "€7,500"
        
  benefits:
    - "Single quarterly return instead of 27 separate returns"
    - "One payment instead of 27 payments"
    - "No need to register for VAT in each country"
    - "Home country interface (language, currency)"
    
  penalties:
    late_filing: "€50-€500 per return"
    late_payment: "Interest + penalties (country-specific)"
    incorrect_return: "Penalties up to 30% of underpaid VAT"
\`\`\`

### Reverse Charge Mechanism - Complete Implementation

**B2B Reverse Charge Logic:**

\`\`\`javascript
/**
 * Determine if reverse charge applies
 * Implements EU VAT Directive Article 196
 */
async function shouldApplyReverseCharge(transaction) {
  const {
    customer_country,
    merchant_country,
    customer_type,
    customer_vat_number,
    service_type
  } = transaction;
  
  // Reverse charge only applies to B2B
  if (customer_type !== 'B2B') {
    return { 
      applies: false, 
      reason: 'Customer is B2C - reverse charge not applicable' 
    };
  }
  
  // Customer must have valid VAT number
  if (!customer_vat_number) {
    return { 
      applies: false, 
      reason: 'No customer VAT number - treat as B2C' 
    };
  }
  
  // Validate VAT number via VIES
  const viesCheck = await validateVATNumber(customer_vat_number, customer_country);
  if (!viesCheck.valid) {
    return { 
      applies: false, 
      reason: 'Invalid VAT number - treat as B2C',
      vies_response: viesCheck
    };
  }
  
  // Check if countries are both in EU
  const bothInEU = isEU(customer_country) && isEU(merchant_country);
  
  if (bothInEU && customer_country !== merchant_country) {
    // Intra-EU B2B supply - reverse charge applies
    return {
      applies: true,
      reason: 'Intra-EU B2B supply (Article 196)',
      mechanism: 'domestic_reverse_charge',
      supplier_action: 'Charge 0% VAT, indicate reverse charge on invoice',
      customer_action: 'Self-assess VAT in own country',
      uncl5305_code: 'AE'
    };
  }
  
  // Check service-specific reverse charge rules
  const serviceRules = await getReverseChargeRules(merchant_country, service_type);
  if (serviceRules.domestic_reverse_charge) {
    return {
      applies: true,
      reason: \`Domestic reverse charge - \${serviceRules.reason}\`,
      mechanism: 'domestic_reverse_charge',
      uncl5305_code: 'AE',
      specific_rule: serviceRules.legal_reference
    };
  }
  
  // No reverse charge applies
  return {
    applies: false,
    reason: 'Standard B2B transaction - charge normal VAT'
  };
}
\`\`\`

**Reverse Charge Invoice Treatment:**

\`\`\`xml
<!-- Peppol Invoice with Reverse Charge -->
<cac:TaxTotal>
  <cbc:TaxAmount currencyID="EUR">0.00</cbc:TaxAmount>
  <cac:TaxSubtotal>
    <cbc:TaxableAmount currencyID="EUR">10000.00</cbc:TaxableAmount>
    <cbc:TaxAmount currencyID="EUR">0.00</cbc:TaxAmount>
    <cac:TaxCategory>
      <cbc:ID>AE</cbc:ID>
      <cbc:Percent>0</cbc:Percent>
      <cbc:TaxExemptionReasonCode>vatex-eu-ae</cbc:TaxExemptionReasonCode>
      <cbc:TaxExemptionReason>Reverse charge</cbc:TaxExemptionReason>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:TaxSubtotal>
</cac:TaxTotal>

<!-- Invoice Note -->
<cbc:Note>Reverse charge applies - Customer to self-assess VAT</cbc:Note>
\`\`\`

---

## Advanced Tax Scenarios

### Multi-Rate Transactions

**Handling Transactions with Multiple VAT Rates:**

\`\`\`mermaid
flowchart TD
    A[Transaction with Multiple Line Items] --> B{Analyze Each Line}
    
    B --> C[Line 1: Software License<br/>€1,000]
    B --> D[Line 2: Training Services<br/>€500]
    B --> E[Line 3: Hardware<br/>€200]
    
    C --> F{Classify Line 1}
    F --> G[UNSPSC: 81111500<br/>Digital Service]
    G --> H[Standard Rate: 19%<br/>€190 VAT]
    
    D --> I{Classify Line 2}
    I --> J[UNSPSC: 81111503<br/>Training Service]
    J --> K[Reduced Rate: 7%<br/>€35 VAT]
    
    E --> L{Classify Line 3}
    L --> M[Physical Goods<br/>Tangible Property]
    M --> N[Standard Rate: 19%<br/>€38 VAT]
    
    H --> O[Aggregate VAT by Rate]
    K --> O
    N --> O
    
    O --> P[VAT Summary]
    P --> Q[19% rate: €1,200 → €228]
    P --> R[7% rate: €500 → €35]
    
    Q --> S[Total Transaction]
    R --> S
    
    S --> T[Subtotal: €1,700<br/>VAT: €263<br/>Total: €1,963]
    
    style O fill:#2563eb,color:#fff
    style T fill:#10b981,color:#fff
\`\`\`

**Multi-Rate Invoice XML:**

\`\`\`xml
<cac:TaxTotal>
  <cbc:TaxAmount currencyID="EUR">263.00</cbc:TaxAmount>
  
  <!-- Tax subtotal for 19% rate -->
  <cac:TaxSubtotal>
    <cbc:TaxableAmount currencyID="EUR">1200.00</cbc:TaxableAmount>
    <cbc:TaxAmount currencyID="EUR">228.00</cbc:TaxAmount>
    <cac:TaxCategory>
      <cbc:ID>S</cbc:ID>
      <cbc:Percent>19.00</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:TaxSubtotal>
  
  <!-- Tax subtotal for 7% rate -->
  <cac:TaxSubtotal>
    <cbc:TaxableAmount currencyID="EUR">500.00</cbc:TaxableAmount>
    <cbc:TaxAmount currencyID="EUR">35.00</cbc:TaxAmount>
    <cac:TaxCategory>
      <cbc:ID>AA</cbc:ID>
      <cbc:Percent>7.00</cbc:Percent>
      <cac:TaxScheme>
        <cbc:ID>VAT</cbc:ID>
      </cac:TaxScheme>
    </cac:TaxCategory>
  </cac:TaxSubtotal>
</cac:TaxTotal>

<cac:LegalMonetaryTotal>
  <cbc:LineExtensionAmount currencyID="EUR">1700.00</cbc:LineExtensionAmount>
  <cbc:TaxExclusiveAmount currencyID="EUR">1700.00</cbc:TaxExclusiveAmount>
  <cbc:TaxInclusiveAmount currencyID="EUR">1963.00</cbc:TaxInclusiveAmount>
  <cbc:PayableAmount currencyID="EUR">1963.00</cbc:PayableAmount>
</cac:LegalMonetaryTotal>
\`\`\`

---

## Integration APIs

### VAT Calculation API

**Real-Time Tax Calculation:**

\`\`\`javascript
// Request
POST /api/v1/tax/calculate

{
  "amount": 1000.00,
  "currency": "EUR",
  "customer": {
    "type": "B2C",
    "country": "DE",
    "vat_number": null,
    "postal_code": "10115"
  },
  "merchant": {
    "country": "IE",
    "vat_number": "IE1234567T",
    "established_in": ["IE"]
  },
  "service": {
    "type": "digital_services",
    "unspsc_code": "81161700",
    "un_cpc_code": "84",
    "description": "Cloud hosting subscription"
  },
  "transaction_date": "2026-01-05"
}

// Response
{
  "calculation_id": "CALC_abc123xyz",
  "status": "success",
  "tax_treatment": {
    "jurisdiction": "DE",
    "jurisdiction_name": "Germany",
    "determination_reason": "Digital services B2C - destination principle (EU VAT Directive Article 58)",
    "tax_point": "customer_location"
  },
  "tax_details": {
    "tax_type": "VAT",
    "tax_category": "S",
    "uncl5305_code": "S",
    "rate_type": "standard",
    "rate_percentage": 19.0,
    "taxable_amount": 1000.00,
    "tax_amount": 190.00,
    "total_amount": 1190.00,
    "currency": "EUR"
  },
  "compliance_info": {
    "oss_applicable": true,
    "oss_registration_required": true,
    "reverse_charge": false,
    "exemption": false,
    "evidence_required": [
      "Customer IP address",
      "Billing address",
      "Payment method location"
    ]
  },
  "calculation_log": {
    "timestamp": "2026-01-05T14:23:45Z",
    "processing_time_ms": 45,
    "rules_applied": [
      "EU_DIGITAL_SERVICES_B2C",
      "GERMANY_STANDARD_RATE_19",
      "OSS_DESTINATION_PRINCIPLE"
    ]
  }
}
\`\`\`

---

## Reporting & Analytics

### VAT Return Automation

**Automated VAT Return Generation:**

\`\`\`mermaid
sequenceDiagram
    participant System as Tax System
    participant DB as Transaction Database
    participant Report as Report Generator
    participant Review as Human Review
    participant Submit as Tax Authority
    
    Note over System: End of VAT Period (Month/Quarter)
    
    System->>DB: Query All Transactions for Period
    DB-->>System: Transaction Dataset
    
    System->>System: Filter by Jurisdiction
    System->>System: Aggregate by Tax Rate
    System->>System: Calculate Totals
    
    System->>Report: Generate VAT Return
    Report->>Report: Format for Tax Authority
    Report->>Report: Apply Country Template
    Report->>Report: Include Supporting Schedules
    
    Report-->>Review: Draft VAT Return
    
    Review->>Review: Validate Calculations
    Review->>Review: Check for Anomalies
    Review->>Review: Verify Exemptions
    
    alt Issues Found
        Review->>System: Request Corrections
        System->>DB: Update Transaction Classifications
        DB-->>System: Updated Data
        System->>Report: Regenerate Return
        Report-->>Review: Updated Draft
    end
    
    Review->>Review: Approve Return
    Review->>Submit: File VAT Return
    
    alt Electronic Filing
        Submit->>Submit: Submit via Government Portal
        Submit-->>Review: Confirmation Number
    else Manual Filing
        Submit->>Submit: Generate PDF for Upload
        Submit-->>Review: Ready for Manual Submission
    end
    
    Review->>System: Mark Period as Filed
    System->>System: Store Filed Return
    System->>System: Update Compliance Dashboard
\`\`\`

**VAT Return Template (UK Example):**

\`\`\`yaml
uk_vat_return:
  form: "VAT 100"
  frequency: "Quarterly"
  
  boxes:
    box_1_vat_due_sales:
      description: "VAT due on sales and other outputs"
      calculation: "SUM(output_vat) for standard-rated, reduced-rated supplies"
      rounding: "Down to nearest penny"
      
    box_2_vat_due_acquisitions:
      description: "VAT due on acquisitions from other EC Member States"
      calculation: "SUM(reverse_charge_vat) on EU purchases"
      
    box_3_total_vat_due:
      description: "Total VAT due"
      calculation: "Box 1 + Box 2"
      
    box_4_vat_reclaimed:
      description: "VAT reclaimed on purchases and other inputs"
      calculation: "SUM(input_vat) - blocked input VAT"
      note: "Cannot reclaim VAT on entertainment, cars (unless taxi/driving school)"
      
    box_5_net_vat:
      description: "Net VAT to pay to HMRC or reclaim"
      calculation: "Box 3 - Box 4"
      payment_due: "If positive - pay HMRC. If negative - reclaim from HMRC"
      
    box_6_total_value_sales:
      description: "Total value of sales excluding VAT"
      calculation: "SUM(sales_excl_vat)"
      rounding: "Down to nearest pound"
      
    box_7_total_value_purchases:
      description: "Total value of purchases excluding VAT"
      calculation: "SUM(purchases_excl_vat)"
      rounding: "Down to nearest pound"
      
    box_8_total_value_supplies_ec:
      description: "Total value of supplies to other EC Member States"
      calculation: "SUM(intra_eu_supplies_excl_vat)"
      note: "Goods only - not services"
      
    box_9_total_acquisitions_ec:
      description: "Total acquisitions from other EC Member States"
      calculation: "SUM(intra_eu_acquisitions_excl_vat)"
      note: "Goods only - not services"
      
  submission:
    method: "MTD (Making Tax Digital) API"
    deadline: "1 month and 7 days after period end"
    payment_deadline: "Same as submission deadline"
    late_penalty: "£100 (1 day late), up to 15% of VAT (6+ months)"
\`\`\`

---

## Integration with Payment Processing

### Real-Time Tax Calculation at Checkout

\`\`\`javascript
/**
 * Calculate tax during payment checkout
 * Integrates with FTS.Money payment processing
 */
async function processPaymentWithTax(checkoutData) {
  const {
    cart_items,
    customer,
    merchant,
    currency
  } = checkoutData;
  
  // Calculate subtotal
  const subtotal = cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Classify each cart item
  const classifiedItems = await Promise.all(
    cart_items.map(async item => {
      const classification = await classifyProductService(item.product_code);
      return {
        ...item,
        unspsc_code: classification.unspsc,
        un_cpc_code: classification.cpc,
        tax_category: classification.default_tax_category
      };
    })
  );
  
  // Calculate tax for each item
  const taxCalculations = await Promise.all(
    classifiedItems.map(async item => {
      const tax = await calculateItemTax({
        amount: item.price * item.quantity,
        currency: currency,
        customer: customer,
        merchant: merchant,
        service_type: item.unspsc_code,
        tax_category: item.tax_category
      });
      
      return {
        item_id: item.id,
        taxable_amount: tax.taxable_amount,
        tax_amount: tax.tax_amount,
        tax_rate: tax.rate_percentage,
        tax_category: tax.uncl5305_code,
        jurisdiction: tax.jurisdiction
      };
    })
  );
  
  // Aggregate tax by rate
  const taxByRate = taxCalculations.reduce((acc, calc) => {
    const key = \`\${calc.jurisdiction}_\${calc.tax_rate}\`;
    if (!acc[key]) {
      acc[key] = {
        jurisdiction: calc.jurisdiction,
        rate: calc.tax_rate,
        taxable_amount: 0,
        tax_amount: 0,
        category: calc.tax_category
      };
    }
    acc[key].taxable_amount += calc.taxable_amount;
    acc[key].tax_amount += calc.tax_amount;
    return acc;
  }, {});
  
  // Calculate total tax
  const totalTax = Object.values(taxByRate).reduce((sum, rate) => sum + rate.tax_amount, 0);
  const totalAmount = subtotal + totalTax;
  
  // Create payment with tax breakdown
  const payment = await fts.payments.create({
    amount: Math.round(totalAmount * 100), // Convert to cents
    currency: currency,
    merchant_id: merchant.id,
    customer: customer,
    metadata: {
      subtotal: subtotal,
      total_tax: totalTax,
      tax_breakdown: taxByRate,
      cart_items: classifiedItems
    },
    tax_calculation_id: taxCalculations[0].calculation_id
  });
  
  return {
    payment: payment,
    subtotal: subtotal,
    tax_breakdown: taxByRate,
    total_tax: totalTax,
    total_amount: totalAmount
  };
}
\`\`\`

---

---

**Document Information**
- **Version:** 3.0
- **Last Updated:** January 11, 2026
- **Owner:** Tax Operations Team
- **Contact:** tax@fts.money

© 2026 FTS.Money. All rights reserved.
`;

export default VATTaxManagementDoc;