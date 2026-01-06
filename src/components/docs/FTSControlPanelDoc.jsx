const FTSControlPanelDoc = `# FTS Control Panel - Complete Platform Administration Guide
## Enterprise Payment Infrastructure Management

**Version:** 2.0  
**Classification:** Internal - Platform Administrators  
**Last Updated:** January 5, 2026  
**Document Owner:** FTS.Money Platform Team

---

## Executive Summary

The FTS Control Panel is the master administrative interface for the entire FTS.Money infrastructure ecosystem. Unlike individual service portals (PSP Portal, VASP Portal, ISO Gateway Portal, etc.) which manage specific services, the Control Panel provides **global oversight and administration** across all FTS.Money offerings:

**Administered Services:**
- ✅ PSP Platform provisioning and management
- ✅ VASP Platform (Crypto Banking) customer administration
- ✅ ISO Gateway customer accounts and routing
- ✅ Orchestration Engine client management
- ✅ RWA Platform asset issuers and investors
- ✅ VAT/Tax Management global configuration
- ✅ E-Invoicing System standard management
- ✅ Service Marketplace provider catalog
- ✅ Multi-user RBAC across all services
- ✅ Global compliance and audit

### Platform vs Service Portals

\`\`\`mermaid
graph TB
    subgraph "Platform Control Layer"
        CP[FTS Control Panel<br/>platform.fts.money<br/>INTERNAL ADMINISTRATION]
    end
    
    subgraph "Service Management Portals - Customer Access"
        PSP[PSP Portal<br/>Payment Operations]
        VASP[VASP Portal<br/>Crypto Banking]
        ISO[ISO Gateway Portal<br/>Message Translation]
        ORCH[Orchestration Portal<br/>Routing Rules]
        RWA[RWA Portal<br/>Asset Management]
        COMM[Community Portal<br/>Self-Service]
    end
    
    subgraph "End-User Portals"
        MERCH[Merchant Portals<br/>Payment Acceptance]
        VT[Virtual Terminals<br/>Manual Entry]
        INV[Investor Portals<br/>Asset Investment]
    end
    
    CP -.->|Provisions| PSP
    CP -.->|Provisions| VASP
    CP -.->|Provisions| ISO
    CP -.->|Provisions| ORCH
    CP -.->|Provisions| RWA
    CP -.->|Configures| COMM
    
    PSP -->|Creates| MERCH
    PSP -->|Provisions| VT
    RWA -->|Onboards| INV
    
    style CP fill:#ef4444,color:#fff
    style PSP fill:#2563eb,color:#fff
    style VASP fill:#0ea5e9,color:#fff
    style MERCH fill:#10b981,color:#fff
\`\`\`

**Control Panel Scope:**
- **NOT a customer-facing portal** - Internal FTS.Money administration only
- **Global configuration** - Settings that affect all services
- **Provisioning engine** - Deploy new service instances
- **Financial oversight** - Revenue, billing, reconciliation across all services
- **Compliance monitoring** - Audit trails, regulatory reporting platform-wide
- **Infrastructure orchestration** - Multi-cloud resource management

---

## Platform Administration Dashboard

### Main Dashboard - At-a-Glance Metrics

\`\`\`mermaid
graph TB
    subgraph "Service Instance Metrics"
        M1[Active PSP Instances: 247]
        M2[VASP Customers: 89]
        M3[ISO Gateway Customers: 34]
        M4[Orchestration Customers: 56]
        M5[RWA Providers: 12]
    end
    
    subgraph "Transaction Metrics (Last 24h)"
        T1[Payment Transactions: 2.4M]
        T2[Crypto Transactions: 45K]
        T3[ISO Messages: 156K]
        T4[Routing Decisions: 890K]
        T5[RWA Trades: 234]
    end
    
    subgraph "Revenue Metrics (MTD)"
        R1[Total Revenue: $4.2M]
        R2[PSP Subscriptions: $1.8M]
        R3[Service Usage: $1.1M]
        R4[Marketplace: $0.9M]
        R5[Professional Services: $0.4M]
    end
    
    subgraph "Health & Compliance"
        H1[System Uptime: 99.98%]
        H2[PCI DSS: Compliant]
        H3[Compliance Alerts: 3]
        H4[Security Incidents: 0]
    end
    
    M1 --> ALL[Platform Status]
    M2 --> ALL
    M3 --> ALL
    M4 --> ALL
    M5 --> ALL
    
    T1 --> ALL
    T2 --> ALL
    T3 --> ALL
    T4 --> ALL
    T5 --> ALL
    
    R1 --> ALL
    H1 --> ALL
    
    style ALL fill:#10b981,color:#fff
    style M1 fill:#2563eb,color:#fff
    style R1 fill:#f59e0b,color:#fff
\`\`\`

---

## Service Administration

### 1. PSP Platform Administration

**Provisioning New PSP:**

\`\`\`mermaid
gantt
    title PSP Provisioning Timeline (Automated)
    dateFormat HH:mm
    axisFormat %H:%M
    
    section Business Verification (1h)
    KYB Submission          :done, 00:00, 10m
    Document Review         :done, 00:10, 30m
    LEI Verification        :done, 00:40, 5m
    Sanctions Screening     :done, 00:45, 10m
    Approval Decision       :done, 00:55, 5m
    
    section Infrastructure (40m)
    Create Tenant Schema    :done, 01:00, 2m
    Cloud Resource Alloc    :done, 01:02, 5m
    Database Provisioning   :done, 01:07, 8m
    Network Configuration   :done, 01:15, 3m
    Deploy App Stack        :done, 01:18, 10m
    Security Setup          :done, 01:28, 5m
    SSL Certificate         :done, 01:33, 2m
    Validation & Testing    :done, 01:35, 5m
    
    section Finalization (20m)
    Generate Credentials    :done, 01:40, 2m
    Configure Subdomains    :done, 01:42, 3m
    Welcome Email           :done, 01:45, 1m
    Portal Access Grant     :milestone, 01:46, 0m
\`\`\`

**PSP Configuration Matrix:**

| Configuration Item | Starter | Professional | Enterprise | Customizable |
|--------------------|---------|--------------|------------|--------------|
| **Transactions/Month** | 1,000 | 50,000 | Unlimited | ✅ Per contract |
| **Merchant Accounts** | 5 | Unlimited | Unlimited | ❌ |
| **Geographic Regions** | 1 | 2 | Multi-region | ✅ Add regions |
| **Payment Methods** | Cards | Cards + APMs | Cards + APMs + Crypto | ✅ Per method |
| **Virtual Terminal** | Basic | Advanced | Enterprise | ❌ |
| **Fraud Detection** | Rules | ML | AI + Manual | ✅ Custom rules |
| **Settlement Speed** | T+2 | T+1 | T+0 available | ✅ Per merchant |
| **API Limits** | 100 req/min | 1,000 req/min | 10,000 req/min | ✅ Scale up |
| **White-Label Depth** | Logo/colors | Full portal | Full + mobile | ✅ Custom dev |
| **Support SLA** | 24h email | 4h priority | 1h dedicated | ✅ Custom SLA |
| **Uptime SLA** | 99.9% | 99.95% | 99.99% | ❌ |

---

### 2. VASP Platform (Crypto Banking) Administration

**Customer Tiers & Identity Framework:**

\`\`\`mermaid
flowchart TD
    A[New VASP Customer] --> B{Identity Credential Type}
    
    B -->|TAS ID Provided| C[Trust Anchor Service Verification]
    B -->|vLEI Provided| D[Verifiable LEI Verification]
    B -->|LEI Only| E[GLEIF LEI Verification]
    B -->|None Provided| F[Grace Period Initiated]
    
    C --> C1[Verify TAS Credential]
    C1 --> C2{TAS Valid?}
    C2 -->|Yes| C3[✅ Instant Approval<br/>Full Access<br/>Trust Score: 100]
    C2 -->|No| F
    
    D --> D1[Verify vLEI Signature]
    D1 --> D2[Check GLEIF QVI Registry]
    D2 --> D3{vLEI Valid?}
    D3 -->|Yes| D4[✅ Instant Approval<br/>Full Access<br/>Trust Score: 100]
    D3 -->|No| E
    
    E --> E1[Query GLEIF API]
    E1 --> E2{LEI Status?}
    E2 -->|Active| E3[⚠️ LEI Valid<br/>Requires 10-Step KYB]
    E2 -->|Expired| E4[❌ Expired LEI<br/>30-Day Renewal Period]
    E2 -->|Invalid| F
    
    E3 --> KYB[10-Step KYB Process]
    KYB --> KYB1[Step 1: Business Info]
    KYB1 --> KYB2[Step 2: LEI Verification]
    KYB2 --> KYB3[Step 3: vLEI Check]
    KYB3 --> KYB4[Step 4: Documents]
    KYB4 --> KYB5[Step 5: UBO Identification]
    KYB5 --> KYB6[Step 6: Sanctions/PEP]
    KYB6 --> KYB7[Step 7: Adverse Media]
    KYB7 --> KYB8[Step 8: Business Activity]
    KYB8 --> KYB9[Step 9: Source of Funds]
    KYB9 --> KYB10[Step 10: Risk Scoring]
    
    KYB10 --> KYB_DEC{Risk Score}
    KYB_DEC -->|0-20 Low| KYB_APP[✅ Approved<br/>Full Access<br/>Trust Score: 80]
    KYB_DEC -->|21-40 Medium| KYB_REV[⚠️ Manual Review]
    KYB_DEC -->|41-60 High| KYB_EDD[⚠️ Enhanced Due Diligence]
    KYB_DEC -->|61+ Prohibited| KYB_REJ[❌ Rejected]
    
    E4 --> E5[Customer Notified]
    E5 --> E6{LEI Renewed Within 30 Days?}
    E6 -->|Yes| E3
    E6 -->|No| E7[Account Suspended]
    
    F --> F1[90-Day Grace Period]
    F1 --> F2[Limited Services:<br/>1 wallet, $1K/day limit]
    F2 --> F3{Credentials Provided?}
    F3 -->|Before Day 90| C
    F3 -->|After Day 90| F4[Account Suspended<br/>30-Day Data Retention]
    
    style C3 fill:#10b981,color:#fff
    style D4 fill:#10b981,color:#fff
    style KYB_APP fill:#10b981,color:#fff
    style KYB_REJ fill:#ef4444,color:#fff
    style F4 fill:#ef4444,color:#fff
\`\`\`

**10-Step KYB/KYC Framework (Complete):**

\`\`\`yaml
universal_10_step_verification:
  applies_to:
    - VASP customer onboarding (crypto banking)
    - RWA asset issuer verification
    - PSP merchant onboarding (high-value)
    - ISO Gateway enterprise customers
    - Orchestration service customers
    
  provenance_tracking:
    purpose: "Create immutable chain of trust from root authority to end customer"
    mechanism: "LEI/vLEI credential chain with cryptographic verification"
    benefit: "Instant verification + regulatory compliance + fraud prevention"
    
  step_1_initial_data_collection:
    individual_kyc:
      - full_legal_name
      - date_of_birth
      - nationality
      - residential_address
      - government_id_number
      - email_address
      - mobile_phone_number
      
    business_kyb:
      - legal_business_name
      - trading_name_dba
      - registration_number
      - incorporation_date
      - jurisdiction_of_incorporation
      - business_type_structure
      - tax_identification_number
      - lei_number_if_available
      - registered_address
      - operational_addresses
      - website_url
      - business_description
      - industry_classification_mcc
      - expected_transaction_volume
      
  step_2_lei_verification:
    description: "Query GLEIF database for Legal Entity Identifier status"
    api_endpoint: "https://api.gleif.org/api/v1/lei-records/{lei}"
    validation_checks:
      - lei_status: "Must be ISSUED (not LAPSED, RETIRED, etc.)"
      - legal_name_match: "Fuzzy match >80% similarity"
      - jurisdiction_match: "Country codes must align"
      - next_renewal_date: "Must be >30 days in future"
      
    outcomes:
      lei_verified_active:
        trust_score: 80
        next_step: "Step 3 (vLEI check)"
        kyb_required: true
        
      lei_expired_grace:
        trust_score: 50
        grace_period: "30 days to renew"
        kyb_required: true
        restricted_access: true
        
      lei_not_found:
        trust_score: 20
        initiate: "90-day compliance grace period"
        kyb_required: "Yes (after grace period or on request)"
        
  step_3_vlei_credential_verification:
    description: "Verify W3C Verifiable Credential if customer provides vLEI"
    standard: "ISO 17442-3 + W3C Verifiable Credentials Data Model"
    
    verification_process:
      parse_credential:
        - validate_json_structure
        - check_w3c_context
        - verify_credential_type: "LegalEntityvLEICredential"
        
      verify_issuer:
        - query_qvi_registry: "Is issuer a Qualified vLEI Issuer?"
        - check_issuer_status: "Is QVI credential still valid?"
        
      verify_subject:
        - match_lei_to_credential_subject
        - validate_entity_data_consistency
        
      cryptographic_verification:
        - extract_public_key_from_credential
        - verify_digital_signature
        - check_proof_type: "Ed25519Signature2020, EcdsaSecp256k1Signature2019, etc."
        - validate_proof_created_timestamp
        
      check_credential_status:
        - verify_not_revoked
        - check_expiration_date
        - validate_issuance_date
        
      build_credential_chain:
        - trace_to_qvi
        - trace_qvi_to_gleif_root
        - verify_entire_chain_cryptographically
        - calculate_chain_depth
        
    outcomes:
      vlei_fully_verified:
        trust_score: 100
        kyb_required: false
        instant_approval: true
        access_level: "full_unrestricted"
        provenance: "complete_chain_to_gleif_root"
        
      vlei_failed_verification:
        trust_score: 0
        fallback_to: "Step 2 (LEI-only path)"
        
  step_4_document_collection_verification:
    required_documents:
      corporate_registration:
        - certificate_of_incorporation
        - articles_of_association
        - company_bylaws
        - shareholders_agreement
        
      tax_compliance:
        - vat_registration_certificate
        - tax_identification_document
        - recent_tax_return: "Last fiscal year"
        
      financial:
        - bank_account_verification_letter
        - bank_statements: "Last 3 months"
        - audited_financial_statements: "If applicable"
        - proof_of_funding_sources
        
      operational:
        - business_license
        - professional_liability_insurance
        - aml_compliance_policy
        - data_protection_policy
        
      beneficial_ownership:
        - ubo_declaration
        - ownership_structure_chart
        - ubo_identification_documents
        
    ai_verification:
      ocr_extraction: "Extract text from documents"
      authenticity_check: "Detect forgeries, alterations"
      cross_reference: "Compare with business registry APIs"
      data_validation: "Verify consistency across documents"
      expiry_monitoring: "Flag expiring documents"
      
  step_5_ultimate_beneficial_owner_identification:
    definition: "Natural person(s) owning >25% equity or control"
    requirements_per_ubo:
      - full_legal_name
      - date_of_birth
      - nationality_and_citizenships
      - residential_address
      - government_issued_id: "Passport or national ID"
      - proof_of_address: "<3 months old"
      - ownership_percentage
      - nature_of_control: "Shares, voting rights, appointment power"
      
    verification_process:
      - run_individual_kyc_on_each_ubo: "Same as retail customer"
      - verify_id_documents: "Government ID + liveness"
      - verify_address: "Utility bill or bank statement"
      - check_pep_status: "Politically Exposed Person screening"
      - sanctions_screening: "OFAC, UN, EU lists"
      - adverse_media_screening: "Negative news"
      
    complex_ownership:
      multi_tier_entities:
        - trace_ownership_to_natural_persons
        - maximum_depth: "5 levels"
        - each_intermediate_entity_requires_lei
        
      trust_structures:
        - identify_trustees
        - identify_settlors
        - identify_beneficiaries
        - verify_trust_deed
        
      nominee_shareholders:
        - identify_underlying_beneficial_owner
        - obtain_nominee_agreement
        - verify_ultimate_control
        
  step_6_sanctions_pep_screening:
    sanctions_lists_checked:
      global:
        - ofac_sdn_list: "US Office of Foreign Assets Control"
        - un_consolidated_list: "UN Security Council"
        - eu_sanctions_list: "EU Consolidated List"
        - uk_hmt_list: "UK HM Treasury"
        - interpol_notices: "Red notices"
        
      regional:
        - australia_dfat: "Australian sanctions"
        - canada_osfi: "Canadian sanctions"
        - japan_meti: "Japanese sanctions"
        - singapore_mas: "Singapore"
        
      country_specific: "100+ jurisdictions"
      
    pep_databases:
      - dow_jones_watchlist
      - world_check_refinitiv
      - comply_advantage
      - namesan_accuity
      
    screening_algorithm:
      - exact_name_match
      - fuzzy_matching: "Levenshtein distance <2"
      - phonetic_matching: "Soundex, Metaphone"
      - date_of_birth_matching: "If available"
      - nationality_cross_check
      - known_aliases_check
      
    match_handling:
      true_positive:
        - auto_reject_if_sanctioned
        - enhanced_due_diligence_if_pep
        - senior_approval_required
        
      false_positive:
        - manual_review_required
        - additional_documentation
        - whitelist_after_verification
        
  step_7_adverse_media_screening:
    search_scope:
      timeframe: "Last 5 years"
      sources:
        - global_news_databases
        - court_records_legal_proceedings
        - regulatory_enforcement_actions
        - bankruptcy_filings
        - fraud_databases
        - reputation_monitoring
        
    risk_categories:
      critical_reject:
        - financial_crime_conviction
        - active_money_laundering_investigation
        - terrorism_financing_links
        - sanctions_evasion
        
      high_risk_edd:
        - fraud_allegations_unproven
        - regulatory_fines_last_5_years
        - civil_litigation_financial_matters
        - bankruptcy_within_3_years
        
      medium_risk_review:
        - customer_complaints
        - business_disputes
        - minor_regulatory_violations
        
      low_risk_informational:
        - general_business_news
        - corporate_announcements
        - industry_mentions
        
  step_8_business_activity_verification:
    verification_methods:
      website_audit:
        - functional_website_exists
        - https_ssl_certificate
        - privacy_policy_present
        - terms_of_service_present
        - contact_information_valid
        - business_description_matches
        
      social_media_presence:
        - linkedin_company_page
        - twitter_facebook_accounts
        - employee_count_verification
        - engagement_and_activity
        
      public_records:
        - business_registry_search
        - trade_license_verification
        - professional_certifications
        - industry_memberships
        
      reputation_check:
        - customer_reviews_ratings
        - better_business_bureau
        - trustpilot_google_reviews
        - industry_reputation
        
    red_flags:
      - website_doesnt_exist_or_template
      - incorporation_less_than_3_months_ago
      - stated_activity_differs_from_evidence
      - shell_company_indicators
      - high_risk_jurisdiction
      - no_physical_presence
      - inconsistent_business_narrative
      
  step_9_source_of_funds_verification:
    volume_based_requirements:
      low_volume:
        threshold: "< $100K/month"
        documentation:
          - basic_bank_statements: "Last 3 months"
          - transaction_history
          
      medium_volume:
        threshold: "$100K - $1M/month"
        documentation:
          - detailed_bank_statements: "Last 6 months"
          - profit_loss_statements
          - tax_returns: "Last 2 years"
          - customer_contracts_samples
          
      high_volume:
        threshold: "> $1M/month"
        documentation:
          - audited_financial_statements
          - business_plan_revenue_projections
          - major_customer_contracts
          - proof_of_business_operations
          - investor_funding_documentation
          
    verification_checks:
      - bank_account_ownership: "IBAN/account in business name"
      - transaction_pattern_analysis: "Consistent with business model"
      - source_of_initial_capital: "How business was funded"
      - revenue_sources: "Customer base, contracts"
      - growth_trajectory: "Realistic vs stated projections"
      
  step_10_comprehensive_risk_scoring:
    risk_calculation:
      base_score: 0
      
      jurisdiction_risk:
        high_risk_fatf: +20
        medium_risk: +10
        low_risk_oecd: +0
        
      business_type_risk:
        crypto_exchange_vasp: +15
        money_transmitter: +12
        fintech_payments: +8
        ecommerce_platform: +5
        saas_software: +3
        
      volume_risk:
        over_10m_monthly: +10
        over_1m_monthly: +5
        under_1m_monthly: +2
        
      credential_bonus:
        verified_vlei: -30
        verified_lei: -20
        tas_id: -35
        none: +15
        
      document_quality:
        complete_certified: -10
        complete_standard: 0
        incomplete: +10
        
      adverse_findings:
        none: 0
        minor: +5
        major: +20
        critical: +50
        
      lei_credential_chain:
        complete_chain_to_root: -15
        partial_chain: -5
        no_chain: +10
        
    decision_matrix:
      score_0_to_20:
        risk_level: "Low Risk"
        decision: "Auto-Approve"
        access: "Full unrestricted"
        monitoring: "Standard (quarterly)"
        
      score_21_to_40:
        risk_level: "Medium Risk"
        decision: "Manual Review Required"
        reviewer: "Compliance Officer"
        timeline: "2-3 business days"
        access: "Conditional approval"
        monitoring: "Enhanced (monthly)"
        
      score_41_to_60:
        risk_level: "High Risk"
        decision: "Enhanced Due Diligence"
        reviewer: "Senior Compliance Officer"
        requirements:
          - additional_documentation
          - source_of_wealth_verification
          - ongoing_transaction_monitoring
        timeline: "5-7 business days"
        access: "Restricted initially"
        monitoring: "Intensive (weekly)"
        
      score_61_plus:
        risk_level: "Prohibited"
        decision: "Auto-Reject"
        notification: "Customer informed with rejection reasons"
        appeal_process: "Available with additional evidence"
        
    provenance_score_impact:
      verified_vlei_with_chain:
        description: "Full credential chain to GLEIF root"
        trust_level: "Maximum"
        score_adjustment: -45
        effectively: "Almost impossible to reject with clean record"
        
      verified_lei_only:
        description: "GLEIF-verified LEI without vLEI"
        trust_level: "High"
        score_adjustment: -20
        effectively: "Strong positive signal, still requires KYB"
        
      no_credentials_grace_period:
        description: "No LEI or vLEI provided"
        trust_level: "Low"
        score_adjustment: +15
        effectively: "Requires full KYB after 90 days or sooner"
\`\`\`

---

### 3. ISO Gateway Administration

**Customer Types & Pricing:**

\`\`\`yaml
iso_gateway_customers:
  customer_types:
    legacy_modernization:
      description: "Banks modernizing core banking systems"
      use_case: "Translate ISO 8583 ATM/POS to ISO 20022"
      pricing: "$2,500-$10,000/month + $0.05/message"
      
    correspondent_banking:
      description: "Banks enabling SWIFT cross-border"
      use_case: "SWIFT MT → ISO 20022 migration"
      pricing: "$5,000-$25,000/month + $0.10/message"
      
    payment_aggregation:
      description: "Fintechs aggregating multiple rails"
      use_case: "Unified API for SEPA, ACH, SWIFT"
      pricing: "$1,000-$5,000/month + $0.02/message"
      
  message_volume_tiers:
    starter:
      monthly_fee: $499
      included_messages: 10000
      overage: $0.05
      
    professional:
      monthly_fee: $2499
      included_messages: 100000
      overage: $0.03
      
    enterprise:
      monthly_fee: $9999
      included_messages: 1000000
      overage: $0.01
\`\`\`

**Message Translation Configuration:**

\`\`\`javascript
// Configure ISO Gateway customer routing
await platform.isoGateway.configureCustomer({
  customer_id: 'iso_customer_abc123',
  
  input_protocols: [
    { format: 'iso8583', versions: ['1987', '1993', '2003'] },
    { format: 'swift_mt', message_types: ['MT103', 'MT940', 'MT202'] }
  ],
  
  output_protocols: [
    { format: 'iso20022', message_types: ['pacs.008', 'pain.001', 'camt.054'] },
    { format: 'sepa', types: ['SCT', 'SDD', 'Inst'] }
  ],
  
  routing_rules: [
    {
      condition: "message.type == 'MT103' AND message.amount > 10000",
      route_to: "iso20022_high_value_queue",
      enrichment: ["beneficiary_lei_lookup", "sanctions_screening"]
    },
    {
      condition: "message.type == 'iso8583' AND message.mti == '0100'",
      route_to: "card_network_processor",
      transformation: "map_to_visa_auth_request"
    }
  ],
  
  compliance_settings: {
    sanctions_screening: true,
    lei_verification: true,
    transaction_monitoring: true,
    audit_retention_days: 2555 // 7 years
  }
});
\`\`\`

---

### 4. Orchestration Service Administration

**Customer Provisioning:**

\`\`\`mermaid
sequenceDiagram
    participant Customer
    participant Portal as Orch Portal
    participant Admin as Platform Admin
    participant Engine as Orch Engine
    participant Processor1 as Payment Processor A
    participant Processor2 as Payment Processor B
    
    Customer->>Portal: Sign Up for Orchestration
    Portal->>Admin: New Customer Request
    Admin->>Admin: Review Business Case
    Admin->>Admin: Check Payment Volume
    
    alt Volume > $1M/month
        Admin->>Portal: Approve Customer
        Portal->>Engine: Create Customer Account
        
        Engine->>Customer: Request Processor Credentials
        Customer->>Engine: Provide API Keys
        
        Engine->>Processor1: Test Connection
        Processor1-->>Engine: Connected
        
        Engine->>Processor2: Test Connection
        Processor2-->>Engine: Connected
        
        Engine->>Engine: Initialize Routing Rules
        Engine-->>Portal: Customer Ready
        Portal->>Customer: Orchestration Active
        
    else Volume < $1M/month
        Admin->>Portal: Request More Info
        Portal->>Customer: Minimum Volume Not Met
    end
\`\`\`

**Routing Strategy Configuration:**

| Strategy | Description | Use Case | Complexity |
|----------|-------------|----------|------------|
| **Cost Optimization** | Route to lowest-cost processor | High-volume, low-margin | Low |
| **Success Rate** | Route to highest approval rate | Maximize conversions | Medium |
| **Geographic** | Route based on card BIN location | Cross-border optimization | Medium |
| **Load Balancing** | Distribute evenly across processors | Prevent overload | Low |
| **Custom Rules** | Business logic-based routing | Specific requirements | High |
| **AI-Powered** | Machine learning optimization | Enterprise tier | Very High |

---

### 5. RWA Platform Administration

**Asset Issuer Verification (10-Step KYB + Asset Due Diligence):**

\`\`\`yaml
rwa_asset_issuer_verification:
  step_1_to_10_kyb:
    process: "Standard 10-step KYB as defined above"
    lei_requirement: "Mandatory - no grace period for asset issuers"
    vlei_preferred: "Fast-track with vLEI credential"
    minimum_score: "Must score <30 (Low-Medium risk)"
    
  additional_rwa_specific_checks:
    step_11_asset_legitimacy:
      real_estate:
        - property_title_deed
        - property_valuation_report: "Independent appraiser"
        - property_insurance
        - zoning_clearances
        - environmental_assessments
        
      treasury_bills:
        - government_issuance_certificate
        - cusip_isin_identifier
        - current_market_valuation
        
      private_credit:
        - loan_agreement
        - borrower_creditworthiness
        - collateral_documentation
        - legal_opinion
        
    step_12_custody_arrangement:
      - custody_agreement_with_fireblocks
      - insurance_coverage_verification: "$100M+ coverage"
      - multi_sig_policy_approved: "3-of-5 for large transfers"
      - cold_storage_allocation: "95% cold, 5% hot"
      
    step_13_legal_structure:
      - legal_opinion: "Securities lawyer"
      - jurisdiction_compliance: "Reg D, MiFID II, etc."
      - investor_suitability: "Accredited investor only or public"
      - transfer_restrictions: "Lock-up periods, vesting"
      
    step_14_oracle_integration:
      - price_feed_configuration: "Chainlink/Band"
      - valuation_methodology: "How price is determined"
      - update_frequency: "Real-time, daily, monthly"
      - backup_oracle: "Redundancy for price failure"
      
  decision_criteria:
    approve_if:
      - kyb_risk_score: "< 30"
      - lei_verified: true
      - asset_valuation: "Independent third-party"
      - legal_opinion: "Favorable"
      - custody_arrangement: "Institutional-grade"
      
    reject_if:
      - kyb_risk_score: "> 40"
      - no_lei: true
      - asset_legitimacy: "Questionable"
      - legal_risk: "High"
      - sanctions_match: "Any"
\`\`\`

---

## Financial Operations

### Multi-Service Revenue Tracking

\`\`\`yaml
monthly_revenue_breakdown:
  psp_platform:
    subscriptions:
      starter: 120 × $499 = $59,880
      professional: 95 × $999 = $94,905
      enterprise: 32 × $4,999 = $159,968
      subtotal: $314,753
      
    usage_fees:
      transaction_overages: $45,230
      additional_features: $28,900
      subtotal: $74,130
      
    total_psp: $388,883
    
  vasp_platform:
    subscriptions:
      starter: 35 × $2,500 = $87,500
      professional: 42 × $5,000 = $210,000
      enterprise: 12 × $15,000 = $180,000
      subtotal: $477,500
      
    usage_fees:
      kyc_verifications: 3450 × $5 = $17,250
      crypto_exchanges: $125,800 (1.5% on $8.4M)
      card_issuance: 890 × $8 = $7,120
      subtotal: $150,170
      
    total_vasp: $627,670
    
  iso_gateway:
    subscriptions: 34 × $2,500 = $85,000
    message_fees: 2.4M × $0.05 = $120,000
    total_iso: $205,000
    
  orchestration:
    subscriptions: 56 × $1,000 = $56,000
    routing_fees: 1.2M × $0.01 = $12,000
    total_orch: $68,000
    
  rwa_platform:
    subscriptions: 8 × $15,000 = $120,000
    tokenization_fees: $85,000
    trading_fees: $12,400
    custody_fees: $28,500
    total_rwa: $245,900
    
  service_marketplace:
    kyc_aml_services: $89,500
    payment_providers: $124,800
    dev_tools: $34,200
    total_marketplace: $248,500
    
  professional_services:
    custom_integrations: $180,000
    consulting: $95,000
    training: $45,000
    total_prof_services: $320,000
    
total_monthly_revenue: $2,103,953
annual_run_rate: $25,247,436
\`\`\`

---

## Compliance & Audit

### Global LEI/vLEI Compliance Monitoring

\`\`\`mermaid
graph TB
    subgraph "Daily Compliance Checks"
        D1[Monitor LEI Expiry Dates<br/>Alert 60 Days Before]
        D2[Validate vLEI Credentials<br/>Check Revocation Status]
        D3[Verify Credential Chains<br/>Trace to GLEIF Root]
        D4[Update Trust Scores<br/>Recalculate Risk]
    end
    
    subgraph "Automated Actions"
        A1[Send Renewal Reminders<br/>Day 60, 30, 15, 7]
        A2[Restrict Services<br/>Expired LEI Grace Period]
        A3[Suspend Accounts<br/>After Grace Period]
        A4[Generate Compliance Reports<br/>Monthly Summary]
    end
    
    subgraph "Manual Reviews"
        M1[High-Risk Customer Review<br/>Quarterly]
        M2[PEP Account Monitoring<br/>Monthly]
        M3[Sanctions List Updates<br/>Weekly]
        M4[Adverse Media Alerts<br/>Real-Time]
    end
    
    D1 --> A1
    D2 --> A2
    D3 --> A4
    D4 --> A2
    
    A2 --> M1
    A3 --> M2
    
    style D2 fill:#2563eb,color:#fff
    style A3 fill:#ef4444,color:#fff
    style M2 fill:#f59e0b,color:#fff
\`\`\`

---

## vLEI Authentication Migration Roadmap

### Future Enhancement: Passwordless Authentication

**Implementation Timeline:**

\`\`\`mermaid
gantt
    title vLEI Authentication Migration (2026-2027)
    dateFormat YYYY-MM-DD
    
    section Phase 1: Foundation (Q2 2026)
    vLEI Storage System         :done, 2026-04-01, 30d
    HSM Integration            :done, 2026-04-15, 30d
    W3C VC Parser              :done, 2026-05-01, 20d
    Crypto Signature Validator :done, 2026-05-10, 15d
    
    section Phase 2: Pilot (Q3 2026)
    Auth API Endpoints         :active, 2026-07-01, 30d
    Challenge-Response Protocol:active, 2026-07-15, 20d
    Dual Auth Support          :active, 2026-08-01, 20d
    Pilot with 20 Customers    :active, 2026-08-15, 30d
    
    section Phase 3: Rollout (Q4 2026)
    All Portals vLEI Support   :2026-10-01, 45d
    Mobile App Integration     :2026-10-20, 30d
    API vLEI Tokens            :2026-11-01, 20d
    Migration Tools            :2026-11-10, 25d
    
    section Phase 4: Deprecation (Q1-Q2 2027)
    Customer Migration         :2027-01-01, 90d
    Password Auth Optional     :2027-02-01, 60d
    Password Auth Deprecated   :milestone, 2027-04-01, 0d
    Security Audit             :2027-04-01, 30d
\`\`\`

**Technical Implementation:**

\`\`\`javascript
/**
 * vLEI Challenge-Response Authentication
 * Replaces username/password with cryptographic proof
 */

// Step 1: Customer initiates login with vLEI
async function initiateVLEILogin(customerLEI) {
  // Generate random challenge nonce
  const challenge = crypto.randomBytes(32).toString('base64');
  const challengeTimestamp = Date.now();
  
  // Store challenge temporarily (5 minutes expiry)
  await redis.setex(
    \`vlei_challenge:\${customerLEI}\`,
    300,
    JSON.stringify({ challenge, timestamp: challengeTimestamp })
  );
  
  return {
    challenge: challenge,
    expires_at: challengeTimestamp + 300000,
    instructions: "Sign this challenge with your vLEI private key"
  };
}

// Step 2: Customer signs challenge and submits response
async function verifyVLEIChallenge(customerLEI, signedChallenge, vleiCredential) {
  // Retrieve original challenge
  const stored = await redis.get(\`vlei_challenge:\${customerLEI}\`);
  if (!stored) {
    throw new Error('Challenge expired or not found');
  }
  
  const { challenge, timestamp } = JSON.parse(stored);
  
  // Verify challenge timestamp (5-minute window)
  if (Date.now() - timestamp > 300000) {
    throw new Error('Challenge expired');
  }
  
  // Parse vLEI credential (W3C Verifiable Credential)
  const credential = JSON.parse(vleiCredential);
  
  // Verify vLEI credential structure and issuer
  await verifyVLEICredential(credential);
  
  // Extract public key from vLEI credential
  const publicKeyJwk = credential.credentialSubject.publicKey;
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    publicKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['verify']
  );
  
  // Verify signature
  const signatureValid = await crypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    publicKey,
    Buffer.from(signedChallenge, 'base64'),
    Buffer.from(challenge, 'base64')
  );
  
  if (!signatureValid) {
    throw new Error('Invalid signature');
  }
  
  // Authentication successful - create session
  const session = await createSession({
    customer_lei: customerLEI,
    auth_method: 'vlei_cryptographic_proof',
    credential_issuer: credential.issuer,
    trust_score: 100,
    authenticated_at: new Date(),
    credential_chain_verified: true
  });
  
  // Delete used challenge (prevent replay attacks)
  await redis.del(\`vlei_challenge:\${customerLEI}\`);
  
  return {
    session_token: session.token,
    expires_at: session.expires_at,
    customer: await loadCustomerProfile(customerLEI)
  };
}

// Step 3: Ongoing verification (every API request)
async function verifyVLEISession(sessionToken) {
  const session = await getSession(sessionToken);
  
  if (!session) {
    throw new Error('Invalid session');
  }
  
  if (session.expires_at < Date.now()) {
    throw new Error('Session expired');
  }
  
  // Periodically re-verify vLEI credential (every 24h)
  if (session.last_credential_check < Date.now() - 86400000) {
    const customer = await getCustomer(session.customer_lei);
    const credentialStillValid = await verifyVLEICredential(customer.vlei_credential);
    
    if (!credentialStillValid) {
      await invalidateSession(sessionToken);
      throw new Error('vLEI credential revoked or expired');
    }
    
    await updateSession(sessionToken, {
      last_credential_check: Date.now()
    });
  }
  
  return session;
}
\`\`\`

---

## Operational Excellence

### Daily Operations Checklist

\`\`\`markdown
Platform Administrator Daily Checklist

□ Morning Review (09:00):
  □ Check overnight provisioning queue (new PSPs, services)
  □ Review system health dashboard (all services green?)
  □ Verify backup completion (database, file storage)
  □ Check security alerts (failed logins, suspicious activity)
  □ Review compliance grace period expirations (LEI renewals due)
  
□ Financial Monitoring (11:00):
  □ Verify daily revenue vs projections
  □ Check failed payment methods (customer billing)
  □ Review reconciliation exceptions
  □ Monitor marketplace service usage
  
□ Compliance & Security (14:00):
  □ Review new KYB/KYC submissions
  □ Check sanctions list updates (OFAC, UN, EU)
  □ Monitor PEP screening alerts
  □ Verify LEI/vLEI credential status checks
  □ Review adverse media alerts
  
□ Infrastructure (16:00):
  □ Check auto-scaling events (unusual spikes?)
  □ Review cloud cost optimization opportunities
  □ Monitor database performance (slow queries?)
  □ Verify disaster recovery replication health
  
□ End-of-Day (18:00):
  □ Generate daily operational report
  □ Update incident log (if any issues)
  □ Prepare tomorrow's deployment schedule
  □ Review overnight maintenance windows
\`\`\`

---

## Conclusion

The FTS Control Panel provides comprehensive administration capabilities across the entire FTS.Money ecosystem, enabling efficient management of all services—PSP Platform, VASP, ISO Gateway, Orchestration, RWA, VAT/Tax, and E-Invoicing—with global compliance, LEI/vLEI provenance tracking, and automated 10-step KYB/KYC workflows.

**Future Enhancements:**
- vLEI passwordless authentication (2027)
- AI-powered anomaly detection
- Predictive resource scaling
- Automated compliance reporting

---

**Document Information:**
- **Version:** 2.0
- **Last Updated:** January 5, 2026
- **Classification:** Internal - Platform Administrators

© 2026 FTS.Money. Internal use only.`;

export default FTSControlPanelDoc;