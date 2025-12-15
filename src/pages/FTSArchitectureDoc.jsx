import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    ArrowLeft, 
    Building2, 
    Users, 
    Zap, 
    Shield, 
    DollarSign,
    Layers,
    GitBranch,
    Target,
    TrendingUp,
    CheckCircle2,
    Calendar,
    Download,
    FileText
} from 'lucide-react';

export default function FTSArchitectureDoc() {
    const navigate = useNavigate();

    const handleDownloadPDF = () => {
        // Create detailed markdown content
        const content = generateMarkdownDocument();
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'FTS-Money-Ecosystem-Architecture.md';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    const generateMarkdownDocument = () => {
        return `# FTS.Money Ecosystem Architecture
## Complete Platform, Marketplace & Community Blueprint
**Version 1.0 | December 2025**

---

## Executive Summary

**Document Purpose:** This comprehensive architecture document outlines FTS.Money's transformation from a traditional white-label PSP platform into a sophisticated three-layer ecosystem with an integrated community marketplace. It serves as the master blueprint for platform engineering, business development, and strategic planning.

**Target Audience:** FTS.Money leadership, engineering teams, potential investors, strategic partners, and service providers considering marketplace integration.

FTS.Money is undergoing a fundamental architectural transformation—evolving from a traditional white-label Payment Service Provider (PSP) platform into a sophisticated three-layer ecosystem. This document outlines the complete strategy for building a Platform-as-a-Service (PaaS) model with an integrated community marketplace, positioning FTS.Money as the industry-leading infrastructure for payment service providers globally.

### The Strategic Shift

**From:** Individual PSP instances with duplicate features and siloed operations  
**To:** A unified control plane powering a two-sided marketplace where service providers offer best-in-class capabilities that PSPs subscribe to on-demand.

### Market Opportunity

The global payments infrastructure market is valued at $2.3 trillion, with PSPs and payment orchestration platforms representing the fastest-growing segment. However, most PSPs struggle with:

- **High Development Costs:** Building compliance, fraud detection, and orchestration systems from scratch
- **Slow Time-to-Market:** 12-18 months to launch with basic features
- **Limited Innovation:** Resources focused on infrastructure rather than differentiation
- **Fragmented Provider Management:** Separate contracts with dozens of vendors

FTS.Money's ecosystem model solves these challenges by providing instant access to enterprise-grade services through a single platform, dramatically reducing PSP operational complexity while unlocking new revenue streams through marketplace commissions and service subscriptions.

---

## 1. Strategic Vision & Concept

### 1.0 Recent Platform Enhancements (December 2025)

**Compliance & Security Infrastructure:**

The platform has been significantly enhanced with enterprise-grade compliance and security features:

1. **GDPR & Privacy Compliance Suite**
   - GDPRConsent entity: Track consent management across all data processing activities
   - DataSubjectRequest entity: Handle DSAR (Data Subject Access Requests) with 30-day SLA tracking
   - PrivacyImpactAssessment entity: Document high-risk processing activities
   - Full GDPR Article 5(1) compliance: Lawfulness, purpose limitation, data minimization

2. **Data Breach & Incident Management**
   - DataBreachIncident entity: Track security incidents with 72-hour regulatory notification timelines
   - SecurityIncident entity: Log access violations, malware, DDoS, API abuse
   - Automated incident response workflows with severity classification
   - Integration with regulatory reporting (ICO, DPA notifications)

3. **Access Control & Audit Trail**
   - AccessControlLog entity: Comprehensive audit logging of all platform access
   - AI-powered anomaly detection with risk scoring (0-100 scale)
   - Behavioral analytics: Unusual IP, time-of-day, resource access patterns
   - Enhanced Audit Logs dashboard with hourly trends and top user analytics

4. **Data Retention & Lifecycle Management**
   - DataRetentionPolicy entity: Define retention periods per data category
   - Automated scheduler: Daily enforcement with archive-before-delete capability
   - Compliance with PCI DSS (7-year transaction retention), GDPR (data minimization)
   - Cold storage integration (S3/Glacier) for archived data
   - Dry-run mode for testing retention policies before enforcement

5. **Compliance Certification Tracking**
   - ComplianceCertification entity: Track PCI DSS, ISO27001, SOC2, GDPR certifications
   - Automated expiry alerts (90-day, 60-day, 30-day warnings)
   - Multi-PSP certification management
   - Audit findings and remediation tracking

**Financial Integration:**

6. **Xero Accounting Integration**
   - OAuth 2.0 connection to Xero API
   - Automated transaction sync (invoices, payments, contacts)
   - Multi-organization support for PSPs with multiple entities
   - Real-time financial metrics: Outstanding balances, invoiced amounts
   - Date range filtering and reconciliation tools

**Backend Functions Added:**

- \`complianceDataManagement\`: GDPR DSAR handling, data export, erasure, retention enforcement
- \`auditAnomalyDetection\`: AI-powered security anomaly detection with behavioral analysis
- \`dataRetentionScheduler\`: Automated data deletion/archival based on retention policies
- \`xeroIntegration\`: Full OAuth flow, token management, API calls to Xero
- \`xeroMetrics\`: Financial dashboard data aggregation from Xero

**Navigation Reorganization:**

The FTS Control Panel menu has been restructured into 7 logical sections:
1. Core Management (Tenants, PSPs, Users, Provisioning Queue)
2. Analytics & Reporting (Analytics, Reports, Revenue)
3. Marketplace & Services (Service Catalog, Providers, Product Catalog, Provider Pool, Payout Routes)
4. Infrastructure (API Gateway, Domains, Blockchain, Financial Registries)
5. Financial Management (Fee Templates, Xero Integration)
6. Compliance & Security (Compliance Policies, Standard Audit Logs, Enhanced Audit Logs, Data Retention)
7. System (Platform Settings, Architecture Docs)

**Impact on Architecture:**

These additions strengthen the platform's enterprise readiness by providing:
- Full regulatory compliance (GDPR, PCI DSS, ISO27001)
- Automated data governance and lifecycle management
- AI-powered security monitoring with anomaly detection
- Financial system integration for accounting automation
- Comprehensive audit trails for regulatory reporting

---

## 1. Strategic Vision & Concept

### 1.1 The Paradigm Shift

Traditional PSP platforms operate as isolated instances, each requiring independent development, provider relationships, and compliance infrastructure. This model is:

- **Inefficient:** Features must be rebuilt for each PSP client
- **Costly:** Each PSP negotiates separate terms with service providers
- **Slow:** Updates and new features take months to deploy across instances
- **Limited:** Small PSPs can't access enterprise-grade tools

The FTS.Money ecosystem introduces a fundamentally different approach inspired by successful platform models like Stripe Connect, Shopify App Store, and AWS Marketplace.

### 1.2 The Three-Layer Model

**Layer 1: FTS.Money Control Plane**  
The infrastructure foundation that provisions PSP instances, manages global provider pools, sets compliance policies, and curates the marketplace. Think of this as AWS for payment platforms—centralized management of distributed infrastructure.

**Layer 2: FTS Community Marketplace**  
A two-sided platform connecting vetted service providers (payment rails, compliance vendors, crypto infrastructure, developer tools) with PSP subscribers who can enable services with one click. This is where the ecosystem monetization occurs through service subscriptions and usage-based fees.

**Layer 3: PSP Portal (Lightweight Consumer)**  
Individual PSP instances become lightweight service consumers rather than monolithic applications. They maintain branded interfaces and merchant relationships while orchestrating backend services from the marketplace. This reduces PSP operational overhead by 70%.

**Layer 4: Merchant Portal**  
End merchants interact with their PSP's branded portal, transparently consuming the services their PSP has enabled—completely unaware of the underlying marketplace architecture.

### 1.3 Market Validation

This model isn't theoretical—it's proven by industry leaders:

**Stripe Connect ($95B valuation):**  
- Platform model with 100+ app integrations
- Revenue from platform fees + transaction share
- Powers marketplaces like Shopify, Instacart, Lyft

**Plaid Exchange ($13.4B valuation):**  
- Ecosystem of 50+ data providers
- Single API for financial institutions
- 25% commission on partner revenue

**Shopify App Store:**  
- 8,000+ third-party apps
- $1B+ annual partner revenue
- Average merchant subscribes to 6 apps

FTS.Money uniquely combines these models specifically for the PSP infrastructure market—a $50B+ opportunity with no dominant platform player.

---

## 2. Four-Layer Architecture Deep Dive

### 2.1 Layer 1: FTS.Money Control Plane

**Role:** Platform operator, infrastructure provisioner, marketplace curator, compliance enforcer

**Core Responsibilities:**

1. **PSP Instance Provisioning**
   - Automated infrastructure deployment (compute, storage, networking)
   - Database provisioning with schema migration
   - SSL/TLS certificate generation and DNS configuration
   - Subdomain allocation (e.g., acme.fts.money) or custom domain mapping
   - Admin portal access and credential distribution
   - Service tier configuration (Starter/Professional/Enterprise/Custom)

2. **Global Provider Pool Management**
   - Payment provider onboarding and certification
   - Acquirer relationship management
   - Bank MID allocation and routing
   - Crypto exchange integrations
   - Alternative payment method (APM) partnerships
   - Provider performance monitoring and SLA enforcement

3. **Payout Route Configuration**
   - Global payout method registry (SWIFT, SEPA, ACH, PIX, UPI, crypto)
   - Banking partner integrations
   - Instant payment rail connections (FedNow, Faster Payments)
   - Payout orchestration rules and failover logic
   - Settlement account management

4. **Fee Template Administration**
   - Tier-based pricing models
   - Volume-based discount structures
   - Currency-specific fee configurations
   - Payment method pricing (card, crypto, APM)
   - Revenue share calculations
   - Automated billing and invoicing

5. **Marketplace Curation**
   - Service provider certification process
   - Security and compliance audits (SOC 2, PCI-DSS)
   - API quality standards enforcement
   - Performance benchmarking (uptime, latency, error rates)
   - Service rating and review system
   - Dispute resolution between providers and PSPs

6. **Compliance Policy Setting**
   - Global KYB/KYC standards
   - AML screening requirements by jurisdiction
   - PCI-DSS compliance monitoring
   - FATF compliance enforcement
   - Data residency and privacy (GDPR, CCPA)
   - Audit trail and regulatory reporting

**Technical Components:**

\`\`\`
ProvisionedPSP Entity
├─ Infrastructure Configuration
├─ Service Subscriptions
├─ Provider Pool Assignments
├─ Payout Route Mappings
├─ Fee Structure Templates
├─ Compliance Rule Sets
└─ Usage Metrics & Billing

PSPAuditTrail Entity
├─ Configuration Changes
├─ Service Activations
├─ Provider Updates
├─ User Actions
└─ System Events

PSPInstanceLog Entity
├─ Deployment Logs
├─ Error Tracking
├─ Performance Metrics
└─ Security Events

Compliance & Security Entities (New - Dec 2025)
├─ GDPRConsent: Consent management & legal basis tracking
├─ DataSubjectRequest: DSAR handling with 30-day SLA
├─ DataBreachIncident: Security incident management & notifications
├─ SecurityIncident: Access violations, malware, attacks
├─ AccessControlLog: Comprehensive access audit trail
├─ DataRetentionPolicy: Automated lifecycle management
├─ ComplianceCertification: PCI DSS, ISO27001, SOC2 tracking
└─ PrivacyImpactAssessment: High-risk processing documentation

Accounting Integration (New - Dec 2025)
└─ Xero OAuth Integration: Automated financial sync
\`\`\`

### 2.2 Layer 2: FTS Community Marketplace

**The Heart of the Ecosystem:** This is where the platform's network effects compound. More service providers → more PSP value → more PSPs → more provider revenue → more providers join.

#### 2.2.1 Left Side: Service Provider Ecosystem

**A. Payment Infrastructure Providers**

*Card Networks*
- Visa, Mastercard, American Express, Discover
- Network tokenization services
- 3DS authentication servers
- Chargeback management integrations
- **Revenue Model:** Per-transaction fees + interchange

*Acquirers & Payment Processors*
- Stripe, Adyen, Checkout.com, Worldpay
- Local acquirers in 50+ markets
- Specialized processors (high-risk, crypto-friendly)
- ISO partnerships
- **Revenue Model:** Processing fees + volume bonuses

*Alternative Payment Methods*
- Digital wallets: PayPal, Apple Pay, Google Pay, Samsung Pay
- Asian payments: Alipay, WeChat Pay, UnionPay, Paytm, GCash
- European: Klarna, Sofort, iDEAL, Bancontact, Giropay
- Latin America: Pix, Mercado Pago, OXXO
- BNPL: Affirm, Afterpay, Zip, Sezzle
- **Revenue Model:** 1.5-3.5% per transaction

*Crypto Infrastructure*
- Exchanges: Coinbase Commerce, Binance Pay, Kraken
- On/Off Ramps: MoonPay, Wyre, Simplex
- Custody: Fireblocks, BitGo, Anchorage, Copper
- Blockchain Analytics: Chainalysis, Elliptic, TRM Labs
- **Revenue Model:** 1-2% + network fees

*Instant Payment Rails*
- US: FedNow, RTP (The Clearing House)
- Brazil: PIX
- India: UPI
- UK: Faster Payments
- EU: SEPA Instant, Target Instant Payment Settlement (TIPS)
- Singapore: PayNow
- **Revenue Model:** Fixed fee per transaction ($0.01-0.50)

*Banking-as-a-Service*
- Solarisbank, Railsbank, Treasury Prime
- Embedded banking accounts
- Multi-currency accounts
- Virtual IBANs
- **Revenue Model:** Monthly + transaction fees

**B. Compliance & Identity Service Providers**

*KYB/KYC Verification*
- **Trulioo:** Global business verification in 195+ countries ($5-8 per check)
- **Jumio:** Document verification with liveness detection ($6-10 per verification)
- **Onfido:** Video KYC and biometric authentication ($8-12 per check)
- **IDnow:** EU-focused identity verification ($5-8 per check)
- **Persona:** Customizable identity flows ($3-6 per check)
- **FTS AI Basic:** Entry-level verification ($2 per check)

*Strategy:* PSPs choose providers based on:
- Geographic coverage (Trulioo best for emerging markets)
- Verification depth (Onfido for high-risk merchants)
- Cost (FTS AI for low-risk checks)
- Compliance requirements (IDnow for EU regulations)

*AML Screening & Transaction Monitoring*
- **ComplyAdvantage:** Real-time watchlist screening ($2-5 per check)
- **Chainalysis:** Crypto AML and transaction monitoring ($0.50-2 per check)
- **Elliptic:** Crypto risk scoring and forensics ($1-3 per check)
- **World-Check (Refinitiv):** Premium screening ($5-10 per check)
- **FTS AI Basic:** Rule-based screening ($0.50 per check)

*Ongoing Monitoring:* $25-100/month per merchant for continuous screening

*LEI/vLEI Services*
- **Bloomberg LEI:** Global coverage ($180 issuance, $90 annual renewal)
- **Refinitiv LEI:** Americas focus ($150 issuance, $75 renewal)
- **London Stock Exchange (LSEG):** EU coverage ($165 issuance)
- **DTCC LEI:** US-centric ($140 issuance)
- **Regional RAs:** Cost-effective local options ($100-120 issuance)

*vLEI (Verifiable LEI):*
- Blockchain-based digital credentials
- Instant verification without API calls to GLEIF
- One-time issuance: +$50 to standard LEI cost
- Verification: $5 per check
- Annual renewal: $60

*Strategic Opportunity:* FTS.Money could become a GLEIF-accredited Registration Agent (RA):
- One-time accreditation cost: ~$50,000
- Keep 100% of LEI issuance fees (vs 15-20% commission)
- Control entire verification workflow
- Differentiator for enterprise PSPs

*Fraud Detection & Prevention*
- **Sift:** ML-based fraud scoring ($0.05-0.10 per transaction)
- **Kount:** Advanced risk assessment ($0.08-0.15 per transaction)
- **Forter:** Chargeback guarantee model ($0.10-0.20 per transaction)
- **Riskified:** E-commerce fraud prevention ($0.10-0.25 per transaction)
- **FTS AI Fraud Suite:** Integrated with orchestration ($0.05 per check)

*Document Verification*
- **Onfido:** Passport, ID, driver's license ($3-6 per document)
- **Jumio:** 4,000+ document types ($3-7 per document)
- **AU10TIX:** Government ID verification ($2-5 per document)
- **FTS AI OCR:** Basic extraction ($1 per document)

*3D Secure Services*
- Visa 3DS Server
- Mastercard Identity Check
- Cardinal Commerce (Visa-owned)
- **Pricing:** $0.05-0.15 per authentication

**C. Financial Service Providers**

*Treasury Management*
- FX optimization and hedging
- Multi-currency treasury accounts
- Yield optimization on reserves
- **Revenue Model:** Basis points on balances + FX spread

*Embedded Lending*
- Merchant cash advances
- Invoice financing
- BNPL for merchant customers
- **Revenue Model:** Interest spread + origination fees

*Insurance & Risk Transfer*
- Chargeback insurance
- Fraud loss coverage
- Cyber liability
- **Revenue Model:** % of insured volume

**D. Technology Service Providers**

*Smart Routing Engines*
- ML-based provider selection
- Real-time performance optimization
- Cost optimization algorithms
- **Revenue Model:** Subscription + % of optimized savings

*Reconciliation & Accounting*
- Automated transaction matching
- Multi-provider reconciliation
- Accounting system integrations (QuickBooks, Xero, NetSuite)
- **Revenue Model:** Monthly subscription + per-record fees

*Reporting & Business Intelligence*
- Advanced analytics dashboards
- Predictive modeling
- Merchant benchmarking
- **Revenue Model:** Tiered subscriptions

*Developer Tools*
- Testing frameworks
- API documentation generators
- SDK maintenance
- Monitoring and observability
- **Revenue Model:** Usage-based or flat fee

#### 2.2.2 Right Side: PSP Subscriber Experience

**Service Discovery**
- Searchable catalog with filters (category, pricing, region, ratings)
- Featured services and recommendations
- Integration complexity indicators
- Case studies and success metrics

**One-Click Subscription**
- Pre-negotiated terms (no individual contracts needed)
- Instant API key provisioning
- Automated webhook configuration
- Usage-based billing starts immediately

**Service Configuration**
- Custom parameter settings per PSP
- Merchant-level routing rules
- Fallback and failover configuration
- Real-time testing and validation

**Usage Monitoring**
- Live usage dashboards
- Cost tracking and projections
- Performance metrics (success rates, latency, errors)
- Alert configuration for anomalies

**Service Management**
- One-click enable/disable
- Version updates (automated or manual)
- Support ticket integration
- Rate and review services

#### 2.2.3 Community Features

**Member Profiles**
- **FinTech Role:** PSP operators, payment companies, financial institutions
  - Access to service marketplace
  - Participation in challenges
  - Industry networking
  
- **Developer Role:** Technical integrators, solution builders
  - API access and SDKs
  - Hackathon participation
  - Code repository access
  
- **Influencer Role:** Industry experts, consultants, advisors
  - Thought leadership platform
  - Mentorship programs
  - Content creation rewards
  
- **Service Provider Role:** Marketplace vendors
  - Service listings
  - Revenue analytics dashboard
  - Customer feedback system

**Fluidity Index Gamification**

A proprietary scoring system that measures member engagement, impact, and value contribution:

*Score Components:*
1. **Transaction Volume (40%):** Total payment volume processed
2. **Community Engagement (20%):** Forum posts, event participation, mentorship
3. **ESG Impact (15%):** Financial inclusion metrics, green payment adoption
4. **Innovation Index (15%):** New services launched, patents filed, hackathon wins
5. **Compliance Score (10%):** Audit pass rates, incident-free operations

*Score Benefits:*
- 0-30: Basic member
- 31-60: Featured in directory, access to beta features
- 61-80: Priority support, reduced marketplace fees (-5%)
- 81-100: VIP tier (reduced fees -10%, exclusive events, dedicated account manager)

*Monetization:*
- Members pay to boost visibility
- Leaderboards drive competitive behavior
- Unlocks premium features and discounts

**Challenges & Hackathons**

*Monthly Innovation Challenges:*
- Build the best fraud detection model (prize: $10,000)
- Fastest payment orchestration algorithm
- Most innovative crypto on-ramp solution
- Best merchant onboarding UX

*Quarterly Hackathons:*
- 48-hour coding events
- Themes: AI in payments, DeFi integration, ESG metrics
- Prizes: Cash + marketplace credits + FTS partnership opportunities

*Benefits:*
- Community engagement and content generation
- Talent recruitment pipeline
- Product innovation crowdsourcing
- Platform differentiation

**Discussion Forums**

*Categories:*
- Technical Q&A
- Regulatory updates and interpretation
- Payment industry news
- Integration troubleshooting
- Best practices and case studies

*Moderation:*
- FTS team + community moderators
- Reputation system (upvotes, accepted answers)
- Expert badges and verification

### 2.3 Layer 3: PSP Portal (Lightweight Service Consumer)

**Strategic Reorientation:** The PSP Portal transforms from a feature-rich monolith to a thin orchestration layer. Instead of building merchant onboarding, fraud detection, routing, and reporting from scratch, PSPs now configure and consume these as services.

**Core Features (Kept in PSP Portal):**

1. **Dashboard**
   - PSP-branded interface with their logo and colors
   - High-level metrics (daily volume, active merchants, success rate)
   - Recent transactions and alerts
   - Service status indicators

2. **Merchant Onboarding Hub**
   - Workflow designer for onboarding steps
   - Calls marketplace services (KYB, AML, LEI, document verification)
   - Aggregates results and displays unified approval screen
   - Manages merchant lifecycle (approved → active → suspended)

3. **Basic Merchant List**
   - Read-only view of merchants
   - Search and filtering
   - Quick actions (view details, suspend, contact)

4. **Transaction Viewer**
   - Simple transaction history
   - Status tracking
   - Basic filtering (date, amount, status)
   - Links to detailed reports (powered by Advanced Analytics service)

5. **Service Marketplace UI**
   - Browse available services
   - Subscribe/unsubscribe to services
   - Configure service parameters
   - Monitor usage and costs

6. **Settings & Appearance**
   - Branding customization (logo, colors, domain)
   - User management (invite staff, assign roles)
   - Notification preferences
   - API key management

**Removed/Deprecated Features:**
- Smart routing engine → Migrated to FTS Payment Orchestration Service
- Fraud detection → Migrated to FTS AI Fraud Suite
- Crypto gateway → Migrated to FTS Crypto Gateway Service
- Advanced analytics → Migrated to FTS Advanced Analytics Service
- Compliance automation → Migrated to FTS Compliance Suite
- Sub-merchant management → Migrated to FTS Sub-Merchant Platform

**Key Insight:** PSPs no longer build or maintain complex features. They focus on:
- Merchant relationships and sales
- Brand differentiation
- Customer support
- Service configuration and optimization

This reduces PSP operational overhead by ~70% and time-to-market from 12-18 months to 4-6 weeks.

### 2.4 Layer 4: Merchant Portal

**Minimal Changes Required**

Merchants continue to interact with their PSP's branded portal without knowing about the underlying marketplace architecture. The experience is seamless:

- Payment forms and checkouts work identically
- Transaction history shows the same details
- Settlement schedules remain consistent
- Support is still provided by their PSP

**Transparency:** Merchants are unaware that their PSP is consuming services from the FTS marketplace. From their perspective, everything is provided directly by their PSP—which it is, just orchestrated rather than built in-house.

---

## 3. Critical Use Case: Merchant Onboarding Workflow

Merchant onboarding is the perfect example of marketplace orchestration. Traditionally, each PSP would:
- Build their own onboarding form
- Integrate separately with Trulioo, ComplyAdvantage, GLEIF, etc.
- Develop custom logic for approval rules
- Manually review documents

With the FTS marketplace, this becomes automated service orchestration:

### 3.1 Complete Onboarding Flow

**Step 1: PSP Portal (Information Collection)**

Merchant completes application form:
- Business Information: Legal name, trading name, website, business type
- Contact Details: Email, phone, address
- Business Structure: Sole proprietor, LLC, corporation, etc.
- Tax Information: EIN/VAT, tax jurisdiction
- Processing Details: Expected volume, average ticket, MCC code
- Bank Account: For settlements
- Document Upload: Registration certificates, licenses, utility bills

**Step 2: PSP Portal → Marketplace (KYB Verification)**

\`\`\`
POST /marketplace/services/kyb
{
  "service_id": "trulioo_business_verification",
  "merchant_data": {
    "business_name": "Acme Corp",
    "registration_number": "12345678",
    "country": "US",
    "address": {...}
  }
}

Response:
{
  "verification_id": "kyb_abc123",
  "status": "verified",
  "confidence_score": 0.94,
  "match_details": {
    "business_name": "MATCH",
    "registration_number": "MATCH",
    "address": "MATCH"
  },
  "cost": 5.00,
  "provider": "Trulioo"
}
\`\`\`

**Cost:** $5.00 charged to PSP's marketplace account

**Step 3: PSP Portal → Marketplace (Document Verification)**

\`\`\`
POST /marketplace/services/document-verification
{
  "service_id": "onfido_document_check",
  "documents": [
    {
      "type": "business_registration",
      "file_url": "https://..."
    },
    {
      "type": "proof_of_address",
      "file_url": "https://..."
    }
  ]
}

Response:
{
  "verification_id": "doc_xyz789",
  "status": "clear",
  "documents": [
    {
      "type": "business_registration",
      "extracted_data": {
        "company_name": "Acme Corp",
        "registration_date": "2020-01-15",
        "registration_number": "12345678"
      },
      "authenticity_score": 0.98
    },
    {...}
  ],
  "cost": 8.00,
  "provider": "Onfido"
}
\`\`\`

**Cost:** $8.00 per document verification

**Step 4: PSP Portal → Marketplace (LEI Issuance - Large Merchants Only)**

For merchants processing >$10M annually or operating in regulated markets, LEI is required:

\`\`\`
POST /marketplace/services/lei-issuance
{
  "service_id": "bloomberg_lei",
  "merchant_data": {
    "legal_name": "Acme Corp",
    "legal_form": "LLC",
    "registration_authority": "Delaware",
    "headquarters_address": {...}
  }
}

Response:
{
  "lei": "549300ABCDEF12345678",
  "issuance_date": "2025-01-15",
  "expiration_date": "2026-01-15",
  "status": "issued",
  "cost": 150.00,
  "annual_renewal_cost": 75.00,
  "provider": "Bloomberg LEI"
}
\`\`\`

**Cost:** $150 issuance (passed to merchant as onboarding fee)  
**Annual Renewal:** $75 (recurring charge to merchant)

**Optional vLEI:**
- Additional $50 for blockchain-based verifiable credential
- Enables instant verification without API calls

**Step 5: PSP Portal → Marketplace (AML Screening)**

\`\`\`
POST /marketplace/services/aml-screening
{
  "service_id": "complyadvantage_screening",
  "entity": {
    "type": "business",
    "name": "Acme Corp",
    "registration_number": "12345678",
    "country": "US",
    "ubo_list": [
      {"name": "John Smith", "ownership": 60},
      {"name": "Jane Doe", "ownership": 40}
    ]
  }
}

Response:
{
  "screening_id": "aml_def456",
  "status": "no_match",
  "watchlist_checks": {
    "sanctions": "clear",
    "pep": "clear",
    "adverse_media": "clear"
  },
  "risk_score": 12,  // Low risk (0-100 scale)
  "ongoing_monitoring": {
    "enabled": true,
    "monthly_cost": 25.00
  },
  "cost": 2.00,
  "provider": "ComplyAdvantage"
}
\`\`\`

**Cost:** $2.00 initial screening + $25/month ongoing monitoring

**Step 6: PSP Portal → Marketplace (Risk Assessment)**

\`\`\`
POST /marketplace/services/risk-scoring
{
  "service_id": "fts_ai_risk",
  "merchant_profile": {
    "kyb_result": {...},
    "aml_result": {...},
    "industry": "E-commerce",
    "expected_volume": 500000,
    "average_ticket": 75,
    "chargeback_rate_estimate": 0.003
  }
}

Response:
{
  "risk_score": 45,  // Medium-low risk
  "risk_category": "standard",
  "recommended_actions": [
    "3DS required for transactions >$100",
    "Daily settlement (no reserves needed)",
    "Standard chargeback monitoring"
  ],
  "cost": 1.00,
  "provider": "FTS AI"
}
\`\`\`

**Cost:** $1.00 (included in PSP tier pricing)

**Step 7: PSP Portal (Final Decision)**

PSP reviews aggregated results:
- ✅ KYB: Verified
- ✅ Documents: Authentic
- ✅ LEI: Issued (for enterprise merchants)
- ✅ AML: No matches, low risk
- ✅ Risk Score: 45 (acceptable)

**Approval Decision:**
- Auto-approve if all checks pass and risk score < 50
- Manual review if any check fails or risk score 50-70
- Auto-reject if risk score > 70 or sanctions match

**Total Onboarding Cost:**
- KYB: $5
- Document Verification: $8
- LEI (optional): $150
- AML: $2
- Risk Scoring: $1
- **Total: $16-166 per merchant**

PSP can:
- Absorb cost (merchant acquisition investment)
- Pass to merchant as onboarding fee
- Build into monthly subscription

**Key Advantages:**
1. **No Direct Contracts:** PSP doesn't negotiate with Trulioo, Onfido, ComplyAdvantage—FTS handles it
2. **One API:** All services called through unified FTS marketplace API
3. **Instant Updates:** When ComplyAdvantage updates their database, all PSPs benefit immediately
4. **Cost Transparency:** Real-time cost tracking per merchant
5. **Flexibility:** PSPs can choose which services to use based on merchant risk profile

### 3.2 Multi-Provider Strategy

PSPs on Professional or Enterprise tiers can configure routing rules:

\`\`\`yaml
kyb_routing:
  - if merchant_country in [US, CA, UK, EU]:
      use: trulioo_business_verification
  - else if merchant_country in [BR, MX, AR]:
      use: regional_provider_latam
  - else:
      use: fts_ai_basic_kyb

document_verification_routing:
  - if merchant_risk_score > 60:
      use: onfido_enhanced  # Higher accuracy, $10 per document
  - else:
      use: fts_ai_ocr  # Cost-effective, $2 per document
\`\`\`

This gives PSPs the best of both worlds:
- High-quality verification for high-risk merchants
- Cost-effective verification for low-risk merchants
- Automatic failover if primary provider is down

---

## 4. Monetization Model & Financial Projections

### 4.1 Five Revenue Streams

**Revenue Stream 1: PSP Platform Subscriptions**

*Tier Structure:*

**Starter Tier**
- Monthly Fee: $2,000
- Revenue Share: 30%
- Max Payment Providers: 1
- Max Merchants: 100
- Core Features: Payment processing, merchant portal, virtual terminal, reporting
- Advanced Features: API access
- Compliance: PCI-DSS, KYB, AML basic
- Support: Email (48hr response)
- Target Market: New PSPs, regional players, testing market fit

**Professional Tier** ⭐ Most Popular
- Monthly Fee: $5,000
- Revenue Share: 25%
- Max Payment Providers: 3
- Max Merchants: 1,000
- Core Features: All Starter features
- Advanced Features: Smart routing, AI fraud detection, crypto payments, API access, webhooks, smart retry
- Compliance: PCI-DSS, KYB, AML advanced, FATF
- Support: Priority (24hr response)
- Target Market: Growth-stage PSPs, multi-market operators

**Enterprise Tier**
- Monthly Fee: $10,000
- Revenue Share: 20%
- Max Payment Providers: 10
- Max Merchants: Unlimited
- Core Features: All Professional features
- Advanced Features: Network tokenization, account updater, sub-merchant platform, split payments, instant settlements
- Compliance: PCI-DSS, KYB, AML enterprise, FATF, LEI verification
- Support: Dedicated account manager (4hr response, Slack channel)
- Target Market: Established PSPs, enterprise clients, marketplace platforms

**Custom Tier**
- Monthly Fee: Custom (typically $15,000-50,000)
- Revenue Share: 15%
- Max Payment Providers: Unlimited
- Max Merchants: Unlimited
- Core Features: All Enterprise features
- Advanced Features: Custom integrations, white-glove onboarding, regulatory consultation
- Compliance: Custom compliance frameworks
- Support: Dedicated team, 1hr SLA, on-call support
- Target Market: Large PSPs, banks, regulated entities

**Revenue Stream 2: FTS-Owned Service Subscriptions**

These services are developed and operated by FTS, so margins are 100%:

*Payment Orchestration Service*
- Base: $500/month
- Volume-Based: + 0.05% per transaction routed
- Features: Smart routing, MID routing, load balancing, cascade logic, real-time failover
- Target Users: Professional+ tier PSPs
- Estimated ARR: $6,000 base + $30,000 volume (avg PSP) = $36,000 per PSP/year

*AI Fraud Suite*
- Base: $1,000/month
- Usage-Based: + $0.10 per fraud check
- Features: ML scoring, anomaly detection, network tokenization, account updater, 3DS orchestration
- Target Users: All tiers (fraud is critical)
- Estimated ARR: $12,000 base + $24,000 usage = $36,000 per PSP/year

*Crypto Gateway Service*
- Base: $2,000/month
- Volume-Based: + 1% per crypto transaction
- Features: Multi-chain support, on/off ramp, custody integration, compliance, tax reporting
- Target Users: PSPs serving crypto merchants
- Estimated ARR: $24,000 base + $60,000 volume (3% crypto adoption) = $84,000 per PSP/year

*Advanced Analytics Service*
- Base: $750/month
- Features: BI dashboards, predictive analytics, merchant benchmarking, cohort analysis
- Target Users: Professional+ tier PSPs
- Estimated ARR: $9,000 per PSP/year

*Sub-Merchant Platform*
- Base: $1,500/month
- Split Fee: + 0.5% per split payment
- Features: Marketplace infrastructure, automated split payments, sub-merchant onboarding, separate payouts
- Target Users: Marketplace platforms (Shopify-like PSPs)
- Estimated ARR: $18,000 base + $40,000 split fees = $58,000 per PSP/year

*Developer API Suite*
- Base: $300/month
- Usage Tiers: Free (10K API calls/mo), $300 (100K), $500 (1M), $1,000 (unlimited)
- Features: Unified API, webhooks, SDKs (Python, Node, PHP, Ruby), sandbox environment, Postman collection
- Target Users: All tiers with developers
- Estimated ARR: $3,600-12,000 per PSP/year

**Revenue Stream 3: Marketplace Commissions (Third-Party Services)**

FTS takes 15-25% commission on all third-party service subscriptions:

*Commission Structure:*
- Standard Partners: 20% commission
- Strategic Partners (Trulioo, ComplyAdvantage): 15% commission (volume discounts)
- Premium Listings: +$500-2,000/year for featured placement

*Example Calculation:*

A Professional tier PSP with 500 merchants onboards 50 new merchants per month:
- KYB checks (Trulioo): 50 × $5 = $250/month → FTS earns $50 (20%)
- Document verification (Onfido): 50 × $8 = $400/month → FTS earns $80 (20%)
- AML screening (ComplyAdvantage): 50 × $2 + (500 × $25/month monitoring) = $12,600/month → FTS earns $1,890 (15%)
- LEI issuance (5 enterprise merchants/month): 5 × $150 = $750 → FTS earns $150 (20%)

**Total Monthly Commission:** $2,170/month = $26,040/year per PSP

**Revenue Stream 4: Premium Community Memberships**

*Tier Structure:*

**Basic Membership: Free**
- Access to forums
- View marketplace catalog
- Basic Fluidity Index score
- Attend public webinars

**Influencer Membership: $99/month**
- Featured profile in directory
- Publish thought leadership content
- Mentor program access
- Early access to beta features
- Fluidity Index boost (+5 points)
- Quarterly industry reports

**Service Provider Membership: $499/month**
- Service listing in marketplace
- Revenue analytics dashboard
- Customer feedback system
- Priority support for integrations
- Quarterly business reviews with FTS
- Co-marketing opportunities

*Additional Revenue:*
- Sponsored content placements: $5,000-20,000 per campaign
- Event sponsorships (hackathons, conferences): $10,000-50,000
- Data licensing (anonymized payment trends): $50,000-200,000/year to research firms

**Revenue Stream 5: Transaction & Usage Fees**

Micro-charges on high-volume services:

- API calls (above free tier): $0.001-0.01 per call
- Routing decisions: $0.001 per routing calculation
- Fraud checks: $0.05 per check (FTS AI)
- Webhook deliveries: $0.0001 per webhook

These are typically negligible for small PSPs but add up significantly for large-volume operators.

### 4.2 Revenue Projections

**Scenario: 100 PSPs on FTS Platform**

*PSP Tier Distribution:*
- 30 Starter tier
- 50 Professional tier
- 15 Enterprise tier
- 5 Custom tier

**Monthly Recurring Revenue (MRR) Calculation:**

*PSP Platform Subscriptions:*
- Starter: 30 × $2,000 = $60,000
- Professional: 50 × $5,000 = $250,000
- Enterprise: 15 × $10,000 = $150,000
- Custom: 5 × $25,000 (avg) = $125,000
- **Total PSP Subscriptions: $585,000/month**

*FTS-Owned Service Add-Ons (avg 3 services per PSP):*
- Payment Orchestration: 70 PSPs × $500 = $35,000
- AI Fraud Suite: 90 PSPs × $1,000 = $90,000
- Crypto Gateway: 40 PSPs × $2,000 = $80,000
- Advanced Analytics: 60 PSPs × $750 = $45,000
- Sub-Merchant Platform: 20 PSPs × $1,500 = $30,000
- Developer API Suite: 80 PSPs × $300 = $24,000
- **Total Service Subscriptions: $304,000/month**

*Marketplace Commissions (avg $2,000/PSP/month):*
- 100 PSPs × $2,000 = $200,000/month
- **Total Marketplace Revenue: $200,000/month**

*Community Memberships:*
- 150 Influencers × $99 = $14,850
- 40 Service Providers × $499 = $19,960
- **Total Community Revenue: $34,810/month**

**Total MRR: $1,123,810/month**  
**Annual Run Rate: $13,485,720**

**Revenue Share Income (Variable):**

Average PSP processes $10M monthly volume:
- 100 PSPs × $10M = $1B monthly volume
- Average merchant fee: 2.7%
- Total merchant fees collected: $27M/month
- FTS revenue share (average 25%): $6.75M/month
- **Annual Revenue Share: $81M/year**

**Total Annual Revenue Potential:**
- MRR-based: $13.5M
- Revenue share: $81M
- **Total: $94.5M/year**

**At Scale (500 PSPs):**
- MRR-based: $67.5M
- Revenue share: $405M
- **Total: $472.5M/year**

---

## 3. Production Technical Architecture

### 3.1 Hybrid Architecture Model

**Strategic Decision:** Base44 for PSP Portal UI + AWS for high-performance payment processing

**Rationale:**
- **Base44:** Rapid UI development, built-in authentication, entity management, ideal for admin interfaces
- **AWS:** High-performance compute, proven at scale, PCI-DSS compliant infrastructure, global reach

**Architecture Layers:**

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WAF/CDN                           │
│              (DDoS Protection, Rate Limiting)                   │
└────────────────┬────────────────────────┬───────────────────────┘
                 │                        │
                 ▼                        ▼
        ┌────────────────┐      ┌────────────────┐
        │ Base44 Portal  │      │ Merchant       │
        │ (Admin/Staff)  │      │ Portal         │
        └────────┬───────┘      └────────┬───────┘
                 │                        │
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌─────────────────────────────────────────┐
                 │    AWS Application Load Balancer        │
                 │           (ALB with SSL)                 │
                 └──────────────────┬──────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
           ┌──────────┐       ┌──────────┐     ┌──────────┐
           │   ECS    │       │   ECS    │     │   ECS    │
           │  Task 1  │       │  Task 2  │     │  Task 3  │
           │(Go/Fiber)│       │(Go/Fiber)│     │(Go/Fiber)│
           └─────┬────┘       └─────┬────┘     └─────┬────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
           ┌──────────┐       ┌──────────┐     ┌──────────┐
           │   SQS    │       │  Redis   │     │   RDS    │
           │  Queue   │       │ Cluster  │     │PostgreSQL│
           │          │       │ (Cache)  │     │          │
           └─────┬────┘       └──────────┘     └─────┬────┘
                 │                                     │
                 ▼                                     ▼
           ┌──────────────────┐            ┌──────────────────┐
           │   Transaction    │            │   Transaction    │
           │   Processors     │            │    Database      │
           │   (Workers)      │            │  (PCI Scope)     │
           └──────────────────┘            └─────┬────────────┘
                                                  │
                                                  ▼
                                           ┌──────────────────┐
                                           │  Operational DB  │
                                           │ (Non-PCI Scope)  │
                                           └──────────────────┘
\`\`\`

### 3.2 Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | React + Base44 | Rapid development, built-in auth, entity management |
| **API Gateway** | Cloudflare + ALB | DDoS protection, WAF, SSL termination, load balancing |
| **Backend** | Go + Fiber | Low latency (p99 <200ms), high concurrency (5K TPS/instance) |
| **Database** | PostgreSQL (RDS) | ACID compliance, Multi-AZ, point-in-time recovery, Citus sharding path |
| **Cache** | Redis Cluster | Sub-ms latency, rate limiting, token storage, session management |
| **Queue** | AWS SQS | Managed, reliable, FIFO support, encryption at rest |
| **Orchestration** | ECS + Fargate | Serverless containers, easier than EKS, auto-scaling |
| **Monitoring** | CloudWatch + PagerDuty | Native AWS integration, real-time alerting, incident management |
| **Security** | AWS KMS + WAF | Encryption key management, PCI-DSS compliance, SQL injection prevention |

### 3.3 Performance & SLA Targets

**Latency:**
- p50 (median): <50ms
- p95: <100ms
- p99: <200ms

**Throughput:**
- Per instance: 5,000 TPS
- With 4 instances (base): 20,000 TPS
- With 20 instances (max scale): 100,000 TPS

**Error Rate:**
- Target: <0.1% of all transactions
- Critical errors: <0.01%

**Uptime:**
- SLA: 99.95% (max 4.38 hours downtime per year)
- Actual target: 99.99% (52 minutes downtime per year)

### 3.4 Component Details

#### Cloudflare WAF/CDN

**DDoS Protection:**
- Layer 3-7 protection
- Automatic mitigation (no manual intervention)
- 100+ Tbps network capacity

**WAF Rules:**
- SQL injection prevention
- Cross-site scripting (XSS) protection
- Rate limiting: Configurable per IP, per merchant, per endpoint
- Geographic restrictions: Block/allow by country
- Custom rules for payment-specific threats

**SSL/TLS:**
- Full (strict) mode
- TLS 1.3 support
- Automatic certificate renewal
- HSTS enabled

**Caching:**
- Static assets only (images, CSS, JS)
- Never cache API responses (dynamic, sensitive)

**Cost:** ~$200/month (Pro plan)

#### AWS Application Load Balancer

**Configuration:**
- SSL certificates: AWS Certificate Manager (free, auto-renewal)
- Health checks: /health endpoint every 30 seconds
- Unhealthy threshold: 3 consecutive failures
- Connection draining: 300-second timeout (graceful shutdown)
- Sticky sessions: Disabled (stateless architecture)

**Target Groups:**
- Payment API: Port 8080 (transaction processing)
- Webhook receivers: Port 8081 (provider callbacks)

**Cost:** ~$50/month for 2 load balancers

#### Go Payment Processor (Fiber Framework)

**Services:**

1. **Payment API Service** (\`/api/v1/*\`)
   - Transaction processing (authorize, capture, sale)
   - Refunds & voids
   - 3DS authentication orchestration
   - Tokenization (card → token)
   - Detokenization (token → gateway call)

2. **Webhook Service** (\`/webhooks/*\`)
   - Provider callbacks (authorization results)
   - Bank notifications (settlement confirmations)
   - Exchange updates (crypto price changes)
   - Signature verification (HMAC-SHA256)

3. **Orchestration Service** (Internal)
   - Smart routing engine (select optimal provider)
   - MID selection (choose best merchant account)
   - Failover logic (cascade to backup provider)
   - Load balancing (distribute across providers)

**ECS Configuration (per PSP instance):**

\`\`\`yaml
Cluster: psp-production
Service: payment-processor-{psp_code}
Task Definition:
  CPU: 2048 (2 vCPU)
  Memory: 4096 (4 GB)
  Image: payment-processor:latest
  Port: 8080
  Health Check: /health
  Environment Variables:
    - PSP_CODE
    - DATABASE_URL (encrypted)
    - REDIS_URL
    - SQS_QUEUE_URL
  
Scaling Policy:
  Min Tasks: 4 (always-on for high availability)
  Max Tasks: 20 (burst capacity for peak traffic)
  Target CPU: 70% (scale up if exceeded for 2 minutes)
  Target Memory: 80% (scale up if exceeded for 2 minutes)
  Scale-in cooldown: 300s (gradual scale-down)
  Scale-out cooldown: 60s (rapid scale-up)
\`\`\`

**Performance:**
- Throughput: 5,000 TPS per instance
- Latency: p95 <100ms, p99 <200ms
- Error rate: <0.1%

#### PostgreSQL Database (RDS)

**Transaction Database (PCI Scope):**

- **Instance:** db.r6g.2xlarge (8 vCPU, 64GB RAM, Graviton2)
- **Storage:** 1TB gp3 (16,000 IOPS, 1,000 MB/s throughput)
- **Multi-AZ:** Synchronous replication to standby (automatic failover in <60s)
- **Encryption:** AES-256 at rest (AWS KMS), TLS 1.3 in transit
- **Backups:** 
  - Automated daily snapshots (30-day retention)
  - Point-in-time recovery (up to 5 minutes)
  - Cross-region backup to us-west-2 (disaster recovery)
- **Connections:** Max 5,000 (connection pooling in Go app)
- **Cost:** ~$600/month

**Tables:**
- transactions (partitioned by date)
- tokenized_cards (encrypted card tokens)
- transaction_signatures (ISO 8583 messages)
- authorization_logs

**Operational Database (Non-PCI Scope):**

- **Instance:** db.r6g.xlarge (4 vCPU, 32GB RAM)
- **Read Replica:** For analytics queries (no impact on transactional database)
- **Storage:** 500GB gp3
- **Purpose:** 
  - Merchant profiles (no card data)
  - Aggregated analytics
  - Reporting data
  - User management
  - Service subscription tracking
- **Cost:** ~$350/month

**Scaling Path:**
- Current: Single RDS instance (handles up to 10K TPS)
- Future (50K+ TPS): Migrate to Citus (distributed PostgreSQL)
  - Horizontal sharding across multiple nodes
  - Shard key: merchant_id (co-locate merchant's transactions)
  - Coordinator node + 4-8 worker nodes

#### Redis Cluster (ElastiCache)

**Configuration:**
- 4-node cluster (r6g.xlarge per node: 4 vCPU, 26GB RAM)
- Cluster mode enabled (data distributed across shards)
- Multi-AZ (replicas in different availability zones)
- Encryption: At rest and in transit

**Use Cases:**
- **Rate Limiting:** Track API calls per merchant/IP (TTL-based counters)
- **Session Storage:** User sessions for portals
- **Token Cache:** Frequently-accessed card tokens (reduce database load)
- **Routing Rules Cache:** Payment orchestration rules (sub-ms lookups)
- **Idempotency Keys:** Prevent duplicate transactions

**Performance:**
- Latency: <1ms for cache hits
- Throughput: 100,000+ operations/second per node
- Cache hit rate target: >90%

**Cost:** ~$200/month

#### AWS SQS (Message Queue)

**Queues:**

1. **Transaction Processing Queue**
   - Async transaction steps (settlement, notification)
   - FIFO queue (ordered processing)
   - Message retention: 14 days
   - Visibility timeout: 30 seconds (worker processing time)

2. **Webhook Delivery Queue**
   - Merchant webhook deliveries
   - Standard queue (high throughput)
   - Dead-letter queue for failed deliveries (retry up to 3 times)

3. **Usage Metering Queue**
   - Marketplace service usage logs
   - High volume (1M+ messages/day)
   - Batch processing by workers

**Security:**
- Encryption at rest (AWS KMS)
- IAM-based access control (no public access)

**Cost:** ~$50/month for 10M requests

### 3.5 PCI-DSS Compliance Architecture

**PCI Scope (Cardholder Data Environment):**

Systems that store, process, or transmit card data:
- ECS Payment Processor (Go application)
- Transaction Database (RDS - encrypted)
- Redis Cache (if storing tokenized card references)
- ALB (SSL termination point)
- AWS KMS (encryption key storage)

**Out of PCI Scope:**

Systems that never touch card data:
- Base44 Admin Portal (reports, merchant management)
- Merchant Portal (uses tokens only, not raw card numbers)
- Operational Database (aggregated data, no PANs)
- SQS Queues (encrypted messages, no card data in queue)
- Analytics systems

**Benefits of Separation:**
- **Reduced Audit Scope:** Only ~30% of infrastructure in PCI scope
- **Faster Development:** Non-PCI systems can iterate quickly without compliance overhead
- **Cost Savings:** PCI audits cost $50K-150K; smaller scope = lower cost

**Security Controls:**

1. **Network Segmentation:**
   - Private subnets for all PCI components (no internet access)
   - NAT Gateway for outbound connections only
   - Security groups: Deny all by default, allow only necessary ports
   - VPC flow logs: Track all network traffic for forensics

2. **Encryption:**
   - **In Transit:** TLS 1.3 for all API calls, database connections, cache connections
   - **At Rest:** AES-256 for RDS, S3, SQS, ElastiCache
   - **Key Management:** AWS KMS with automatic 90-day key rotation

3. **Access Control:**
   - IAM roles (no long-lived access keys in application code)
   - MFA required for all admin access (AWS Console, SSH equivalent)
   - AWS SSM Session Manager (no SSH keys, all sessions logged)
   - Principle of least privilege (granular IAM policies per service)
   - CloudTrail: Audit all AWS API calls (who did what, when)

4. **Tokenization:**
   - Card numbers tokenized immediately upon receipt
   - Tokens stored in database (encrypted)
   - Original card data never persists (only transmitted to gateway)
   - Token format: \`tok_abc123xyz789\` (impossible to reverse-engineer)

### 3.6 Infrastructure Cost Breakdown

**Monthly Cost per PSP Instance (at 1,000 TPS):**

| Component | Specification | Cost |
|-----------|---------------|------|
| ECS Tasks | 4x c6g.xlarge (2 vCPU, 4GB, 24/7) | $400 |
| RDS Transaction DB | db.r6g.2xlarge + Multi-AZ (PCI scope) | $600 |
| RDS Operational DB | db.r6g.xlarge + Read Replica | $350 |
| ElastiCache Redis | 4-node cluster (r6g.xlarge) | $200 |
| SQS | 10M requests/month | $50 |
| ALB | 2 load balancers | $50 |
| Data Transfer | 5TB outbound | $450 |
| CloudWatch | Logs + Metrics + Alarms | $100 |
| Cloudflare Pro | WAF + DDoS | $200 |
| Backups & Storage | S3 snapshots, 90-day retention | $100 |
| **Total** | | **~$2,500/mo** |

**Scaling Costs:**

- **At 10K TPS:** ~$5,000/mo (8 ECS tasks, larger RDS, more data transfer)
- **At 50K TPS:** ~$12,000/mo (20 ECS tasks, Citus sharding, larger Redis cluster)

**Control Plane Shared Infrastructure:**

These costs are shared across all PSPs (not per-instance):
- FTS Service Registry: $200/mo (small RDS instance)
- Marketplace API Gateway: $300/mo (ALB + CloudFront)
- Community Platform: $500/mo (Base44 hosting)
- **Total Shared:** ~$1,000/mo (amortized across all PSPs)

**Cost per PSP decreases as platform scales:**
- 10 PSPs: $2,500 + $100 shared = $2,600/PSP/mo
- 100 PSPs: $2,500 + $10 shared = $2,510/PSP/mo
- 500 PSPs: $2,500 + $2 shared = $2,502/PSP/mo

### 3.7 Disaster Recovery & Business Continuity

**Backup Strategy:**

- **RDS Automated Backups:**
  - Daily snapshots at 3:00 AM UTC (low-traffic window)
  - 30-day retention period
  - Point-in-time recovery (any moment in last 5 minutes)
  - Cross-region backup to us-west-2 (geographic redundancy)

- **Application State:**
  - Stateless ECS tasks (no local storage)
  - Configuration in AWS Systems Manager Parameter Store
  - Secrets in AWS Secrets Manager (encrypted)

**Recovery Objectives:**

- **RTO (Recovery Time Objective):** 1 hour
  - Multi-AZ failover: <60 seconds (automatic)
  - Cross-region failover: <60 minutes (manual, for total region outage)

- **RPO (Recovery Point Objective):** 5 minutes
  - Maximum acceptable data loss: 5 minutes of transactions
  - Achieved via continuous replication (Multi-AZ) and frequent snapshots

**Availability SLA:** 99.95% uptime
- Allows: 4.38 hours downtime per year
- Actual target: 99.99% (52 minutes downtime per year)

**Incident Response:**
- PagerDuty integration for critical alerts
- On-call rotation (24/7 coverage)
- Escalation path: Engineer → Lead → Director → CTO
- Runbooks for common scenarios:
  - Database failover procedure
  - Provider outage response (switch to backup)
  - DDoS attack mitigation
  - Security incident response
- Post-incident reviews (blameless culture, focus on systemic improvements)

### 3.8 Monitoring & Observability

**Application Metrics (CloudWatch):**

- **Transaction Metrics:**
  - \`transaction.count\` (by status: authorized, declined, failed)
  - \`transaction.latency\` (p50, p95, p99)
  - \`transaction.errors\` (by error_code: gateway_timeout, insufficient_funds, etc.)
  - \`transaction.amount\` (track volume trends)

- **Routing Metrics:**
  - \`routing.decision_time\` (how long to select provider)
  - \`routing.provider_selected\` (distribution across providers)
  - \`routing.failover_count\` (cascade events)

- **Cache Metrics:**
  - \`cache.hit_rate\` (target: >90%)
  - \`cache.evictions\` (memory pressure indicator)

- **API Metrics:**
  - \`api.requests_per_second\` (traffic patterns)
  - \`api.response_time\` (by endpoint)

**Infrastructure Metrics:**

- **ECS:**
  - \`ecs.cpu_utilization\` (target: 60-70% avg, <90% peak)
  - \`ecs.memory_utilization\` (target: 70-80% avg)
  - \`ecs.task_count\` (scaling events)

- **RDS:**
  - \`rds.connections\` (max 5,000, alert if >4,000)
  - \`rds.read_iops\` / \`rds.write_iops\` (I/O patterns)
  - \`rds.cpu_utilization\` (alert if >80% for 10 minutes)
  - \`rds.replica_lag\` (Multi-AZ replication delay)

- **Redis:**
  - \`redis.cache_hits\` / \`redis.cache_misses\` (hit rate calculation)
  - \`redis.evictions\` (memory pressure)
  - \`redis.connections\` (connection pool health)

- **SQS:**
  - \`sqs.messages_visible\` (queue depth)
  - \`sqs.messages_delayed\` (processing backlog)
  - \`sqs.messages_in_flight\` (currently being processed)

**Compliance & Security Metrics (New - Dec 2025):**

- **Access Control:**
  - \`access.anomaly_detected\` (AI-flagged suspicious activities)
  - \`access.risk_score_avg\` (average risk score across all access logs)
  - \`access.failed_logins_rate\` (% of login attempts that fail)
  - \`access.unusual_ip_count\` (access from new/unusual IPs)

- **Data Retention:**
  - \`retention.records_deleted\` (daily automated cleanup count)
  - \`retention.records_archived\` (moved to cold storage)
  - \`retention.policy_violations\` (data exceeding retention period)
  - \`retention.archive_storage_size\` (S3/Glacier usage)

- **GDPR Compliance:**
  - \`gdpr.dsar_pending\` (data subject requests awaiting completion)
  - \`gdpr.dsar_sla_compliance\` (% completed within 30 days)
  - \`gdpr.consent_rate\` (% users with active consent)
  - \`gdpr.breach_incidents\` (count of reportable breaches)

- **Certifications:**
  - \`certs.expiring_soon\` (certifications expiring in <90 days)
  - \`certs.compliance_coverage\` (% of PSPs with required certs)
  - \`certs.audit_findings_open\` (unresolved audit issues)

**Alerting (PagerDuty):**

**Critical Alerts (immediate page):**
- Error rate >1% for 5 minutes
- Latency p99 >500ms for 5 minutes
- RDS CPU >90% for 10 minutes
- Failed health checks (3 consecutive)
- Fraud detection service down
- Data breach incident reported (immediate regulatory notification required)
- GDPR DSAR SLA breach (>30 days)
- High-risk anomaly detected (risk score >90)
- Compliance certification expired (PCI DSS, ISO27001)

**Warning Alerts (email/Slack):**
- Error rate >0.5% for 10 minutes
- Cache hit rate <80% for 15 minutes
- SQS queue depth >10,000 messages
- Disk usage >80%
- Anomaly detected (risk score 70-89)
- Compliance certification expiring in <30 days
- Failed login attempts >5 from same IP
- Data retention policy violation detected

**Info Alerts (dashboard only):**
- New PSP provisioned
- Service subscription changed
- Backup completed
- Data retention scheduler completed successfully
- GDPR consent updated
- Compliance certification renewed

### 3.9 Marketplace Integration Architecture

**How This Infrastructure Supports the Marketplace:**

1. **Multi-Tenancy:**
   - Each PSP gets dedicated ECS task group (isolated processing)
   - Shared control plane infrastructure (service registry, provider pool)
   - Database partitioning by \`psp_id\` (logical isolation)

2. **Service Invocation:**
   - PSP instance calls FTS Marketplace API: \`POST /marketplace/invoke\`
   - Marketplace Gateway (Go service) looks up service in ServiceCatalog
   - Routes request to external provider (Trulioo, ComplyAdvantage, etc.)
   - Logs usage to ServiceUsageMetric (via SQS, async)
   - Returns response to PSP instance

3. **Usage Metering:**
   - Every marketplace service call logged (PSP ID, service ID, timestamp, cost)
   - Background worker aggregates usage hourly
   - Nightly job generates invoices (ServiceInvoice entity)
   - Weekly/monthly payment to service providers (minus FTS commission)

4. **Provider Pool Routing:**
   - Go orchestration service queries global provider pool (PostgreSQL)
   - Applies routing rules based on:
     - PSP tier (Starter can only use 1 provider, Enterprise uses 10)
     - Merchant country (use regional providers for better success rates)
     - Provider performance (real-time success rates from Redis cache)
     - Cost (optimize for lowest-cost provider if multiple options)
   - Caches routing decisions in Redis (10-minute TTL)

5. **Performance Optimization:**
   - Service catalog cached in Redis (fast lookups)
   - Provider credentials cached (avoid database roundtrip)
   - Routing rules cached (sub-ms decision time)
   - Async logging (no blocking on usage metric writes)

**Result:** Marketplace service calls add <10ms overhead to transaction processing

---

## 4. Service Components & Marketplace Categories

### 4.3 Unit Economics

*Customer Acquisition Cost (CAC) per PSP:*
- Sales & Marketing: $15,000
- Onboarding & Implementation: $5,000
- **Total CAC: $20,000**

*Lifetime Value (LTV) per PSP:*
- Average monthly revenue per PSP (subscriptions + services): $11,238
- Average customer lifetime: 5 years
- Churn rate: 10% annually
- **LTV: $11,238 × 12 × 4.5 years = $606,846**

**LTV:CAC Ratio: 30:1** (exceptional; industry benchmark is 3:1)

*Payback Period:*
- Monthly revenue per PSP: $11,238
- CAC: $20,000
- **Payback: 1.8 months**

*Gross Margin:*
- Platform infrastructure costs: 15% of revenue
- Service delivery costs: 10% of revenue
- Marketplace commissions paid out: 75-85% of marketplace revenue (so FTS keeps 15-25%)
- **Blended Gross Margin: 65-70%**

### 4.4 Marketplace Network Effects

The marketplace exhibits powerful network effects:

1. **Supply-Side Network Effects**
   - More service providers → more PSP value → more PSPs join → more provider revenue → more providers join

2. **Data Network Effects**
   - More transaction data → better fraud detection → higher success rates → more merchants → more data

3. **Ecosystem Network Effects**
   - More community members → more integrations built → more ecosystem value → more members join

**Projected Growth:**
- Year 1: 20 PSPs, 10 service providers
- Year 2: 100 PSPs, 50 service providers
- Year 3: 500 PSPs, 150 service providers
- Year 4: 2,000 PSPs, 400 service providers
- Year 5: 5,000 PSPs, 800 service providers (market leadership position)

---

## 5. Stakeholder Onboarding & Integration

### 5.1 Service Provider Onboarding Process

**Phase 1: Company Registration (2-3 days)**

*Information Collected:*
- Legal Entity Details
  - Company name (legal and trading)
  - Registration number and jurisdiction
  - Tax identification number (EIN, VAT, etc.)
  - Business address (headquarters and operational)
  - Company structure (private, public, subsidiary)
  
- Financial Information
  - Funding stage: Pre-Seed, Seed, Series A/B/C, IPO, Profitable
  - Annual revenue range
  - Bank account details (for revenue share payments)
  - Preferred payment schedule (weekly, monthly)
  
- Contact Information
  - Primary contact (name, email, phone)
  - Technical contact (API support)
  - Business development contact
  - Support escalation contact
  
- Organization Structure
  - Key executives and ownership
  - Data protection officer (DPO)
  - Compliance officer

*Required Documents:*
- Certificate of incorporation
- Tax registration certificate
- Proof of business address (utility bill, lease agreement)
- Financial services license (if applicable for regulated entities)
- Insurance certificates:
  - Professional indemnity insurance ($2M minimum)
  - Cyber liability insurance ($5M minimum)
  - Errors & omissions insurance (for compliance providers)

*FTS Review:*
- Entity verification through business registries
- Credit check and financial stability assessment
- Background checks on key executives
- Review of any regulatory actions or lawsuits

**Phase 2: Service Submission (5-7 days)**

*Technical Specifications:*
- Service Description
  - Category (payment rail, compliance, fraud, analytics, etc.)
  - Target customer (PSP tier, merchant type, geography)
  - Key features and differentiation
  - Integration complexity (simple, moderate, complex)
  
- API Documentation
  - OpenAPI 3.0 specification (required)
  - Authentication method: OAuth 2.0 or API key
  - Rate limiting: Requests per second/minute
  - Webhook support (for asynchronous operations)
  - Error codes and handling
  - Sample requests and responses
  - SDKs (optional but recommended): Python, Node.js, PHP, Ruby, Go
  
- Pricing Model
  - Per-transaction: $X per API call
  - Fixed subscription: $Y per month
  - Tiered pricing based on volume
  - Setup fees (if any)
  - Overage charges
  - Enterprise pricing (custom quotes)
  
- Service Level Agreement (SLA)
  - Uptime commitment: 99.5%, 99.9%, or 99.95%
  - Response time (p50, p95, p99 latency)
  - Support response times: Critical (1hr), High (4hr), Medium (24hr), Low (48hr)
  - Downtime credits or refunds
  
- Security & Compliance
  - SOC 2 Type II certification (required)
  - ISO 27001 (optional but preferred)
  - PCI-DSS (for payment handling services)
  - GDPR compliance documentation
  - Data residency options (US, EU, APAC)
  - Encryption standards (at rest and in transit)
  - Penetration testing schedule

*Test Environment:*
- Sandbox credentials provided
- Test data sets for validation
- Postman collection or Swagger UI
- Sample integration code

**Phase 3: FTS Certification Process (7-14 days)**

*Technical Review:*
- API Testing
  - Functional testing of all endpoints
  - Load testing: Can the service handle 10,000 requests/second?
  - Latency benchmarks: p99 latency must be <500ms
  - Error handling: Graceful degradation and retries
  - Authentication and authorization flows
  - Webhook delivery and retry logic
  
- Integration Testing
  - Test in FTS staging environment
  - Integration with multiple PSP configurations
  - Edge case handling
  - Backward compatibility (if updating existing service)
  
*Security Audit:*
- Vulnerability Scanning
  - Automated scans using tools like Qualys, Nessus
  - OWASP Top 10 coverage
  - Dependency checks (outdated libraries, known CVEs)
  
- Penetration Testing
  - API security assessment
  - Authentication bypass attempts
  - Injection attacks (SQL, XSS, etc.)
  - Rate limiting validation
  - Data leakage testing
  
- Compliance Verification
  - SOC 2 report review (must be <12 months old)
  - GDPR compliance checklist
  - Data processing agreement (DPA) review
  - Subprocessor disclosure

*Performance Benchmarking:*
- Latency: Average and p99 response times
- Throughput: Transactions per second capacity
- Error Rate: Must be <0.1% under normal load
- Uptime: Historical uptime from status page (requires 6 months data)

*Business Review:*
- Pricing competitiveness vs alternatives
- Target market fit (do PSPs need this?)
- Differentiation analysis
- Reference customers (3 required)

**Phase 4: Go Live (1-2 days)**

*Marketplace Listing:*
- Service page creation
  - Description, features, pricing
  - Screenshots, demo videos
  - Case studies and testimonials
  - Integration guide and documentation links
  
- Initial Placement
  - New services get "Recently Added" badge for 30 days
  - Featured placement available for $2,000/month
  
*Monitoring Setup:*
- Uptime monitoring (Pingdom, UptimeRobot)
- Latency tracking (synthetic transactions every 5 minutes)
- Error rate dashboards
- Usage analytics (API calls, active PSPs, revenue)

*Revenue Sharing Begins:*
- PSPs can now subscribe to the service
- FTS takes 15-25% commission
- Payments processed weekly or monthly (provider choice)
- Detailed invoices with per-PSP usage breakdown

### 5.2 Bank & Financial Institution Onboarding

Banks are special-category service providers requiring enhanced due diligence:

**Required Certifications:**
1. **Banking License Verification**
   - License issued by national regulator (Fed, ECB, FSA, etc.)
   - License type: Full banking license, payments institution, e-money institution
   - Geographic scope: Single jurisdiction or passported across EU, etc.
   - Expiration date and renewal status

2. **Regulatory Approval**
   - No enforcement actions in last 5 years
   - Clean regulatory audit history
   - Adequate capital ratios (Basel III compliance)
   - Anti-money laundering program in place

3. **Deposit Insurance Proof**
   - FDIC (US), FSCS (UK), DGS (EU)
   - Coverage limits and eligibility

4. **Anti-Fraud Systems**
   - Transaction monitoring capabilities
   - Suspicious activity reporting (SAR) procedures
   - Know Your Customer (KYC) and Know Your Business (KYB) processes

5. **ISO 20022 Compliance**
   - Support for modern payment messaging standards
   - SWIFT gpi (global payments innovation) membership
   - SEPA instant payments capability (for EU banks)

**Services Banks Can Offer in Marketplace:**

*Settlement Accounts*
- Merchant settlement accounts with IBANs/account numbers
- Multi-currency accounts (up to 30 currencies)
- Instant account opening via API
- Pricing: $50/month per account + transaction fees

*SWIFT/SEPA Connectivity*
- International wire transfers
- SEPA credit transfers (EU)
- SEPA instant (settlement in <10 seconds)
- Pricing: $15-25 per international wire, $0.20-0.50 per SEPA transfer

*Instant Payment Rails*
- FedNow connectivity (US)
- Faster Payments (UK)
- PIX integration (Brazil)
- UPI gateway (India)
- Pricing: 0.5-1% per instant payment

*Treasury Services*
- Foreign exchange (FX) spot and forward contracts
- Currency hedging for PSPs with multi-currency operations
- Pricing: FX spread of 0.1-0.5%

*Credit Lines*
- Merchant cash advance programs
- Invoice financing
- Working capital loans
- Pricing: Interest rates at prevailing commercial rates + origination fees

**Example: Regional Bank Partnership**

*Bank Profile:*
- Name: Coastal Community Bank
- License: State-chartered bank (FDIC insured)
- Service: Settlement accounts + SEPA connectivity

*Onboarding:*
- FDIC license verified ✓
- No regulatory actions ✓
- Insurance: $250K per depositor ✓
- APIs: RESTful with ISO 20022 support ✓

*Marketplace Offering:*
- Settlement accounts: $40/month per account (20% below market)
- SEPA transfers: $0.15 per transfer
- FTS commission: 20%
- **Bank Revenue:** $8/account + $0.03/transfer
- **FTS Revenue:** $32/account + $0.12/transfer

### 5.3 Payment Method Provider Onboarding

**Category A: Digital Wallet Providers**

Examples: PayPal, Apple Pay, Google Pay, Alipay, WeChat Pay

*Integration Requirements:*
- OAuth 2.0 authentication flow
- Transaction notification webhooks
- Refund and chargeback APIs
- Settlement reconciliation reports

*Pricing Models:*
- Percentage per transaction: 2.5-3.5%
- Fixed fee: $0.30-0.50 per transaction
- No monthly fees (volume-based only)

*Onboarding Checklist:*
- ✓ Wallet provider agreement signed
- ✓ Merchant application process documented
- ✓ API credentials provisioned (sandbox and production)
- ✓ Test transactions completed ($1 authorization, refund, void)
- ✓ Webhook endpoints registered and tested
- ✓ Compliance: PCI-DSS (wallet providers handle card data)

**Category B: Buy Now, Pay Later (BNPL) Providers**

Examples: Klarna, Afterpay, Affirm, Zip

*Integration Requirements:*
- Widget/iframe for checkout
- Credit check API (real-time approval)
- Installment schedule management
- Settlement notifications (when BNPL provider pays merchant)

*Pricing Models:*
- Merchant fee: 3-6% per transaction (paid by merchant, not customer)
- No monthly fees
- Instant merchant payout (BNPL provider assumes credit risk)

*Onboarding Checklist:*
- ✓ BNPL provider credit license verified
- ✓ Widget integration tested (mobile and desktop)
- ✓ Consumer disclosure compliance (Truth in Lending Act for US)
- ✓ Merchant eligibility criteria documented
- ✓ Settlement account configured

**Category C: Crypto Exchange Integrations**

Examples: Coinbase Commerce, Binance Pay, Kraken, local exchanges

*Integration Requirements:*
- Wallet address generation API
- Payment notification webhooks (when crypto received)
- Exchange rate API (real-time conversion)
- On-chain transaction monitoring
- Settlement: Auto-convert to fiat or hold in crypto

*Pricing Models:*
- Transaction fee: 1-2% (low compared to cards)
- Network fees: Passed through to customer (variable based on blockchain congestion)
- Conversion fee: 0.5-1% if auto-converting to fiat
- Settlement time: Instant (if holding crypto) or T+1 (if converting to fiat)

*Compliance Requirements:*
- Exchange license or money transmitter license (state-by-state in US)
- AML program with transaction monitoring
- Sanctions screening (OFAC compliance)
- Travel Rule compliance (for transactions >$3,000)
- Customer due diligence (CDD) for large transactions

*Onboarding Checklist:*
- ✓ Exchange license verified in operating jurisdictions
- ✓ AML program review (Chainalysis or Elliptic integration confirmed)
- ✓ Supported cryptocurrencies listed (BTC, ETH, USDT, USDC, etc.)
- ✓ API credentials and webhook endpoints configured
- ✓ Test transactions on testnet completed
- ✓ Settlement account configured (fiat or crypto)

**Category D: Alternative Payment Methods (APMs)**

Regional payment methods dominate certain markets:
- Europe: iDEAL (Netherlands), Bancontact (Belgium), Sofort (Germany), Multibanco (Portugal)
- Latin America: OXXO (Mexico cash payments), Boleto (Brazil)
- Asia: Alipay, WeChat Pay (China), GrabPay (Southeast Asia), GCash (Philippines)

*Integration Patterns:*
- Redirect flow: Customer redirects to APM site, then back to merchant
- QR code: Customer scans code with mobile wallet app
- Bank transfer: Customer initiates transfer from their bank account

*Pricing:*
- Typically 0.5-2% per transaction (lower than cards)
- Fixed fee: $0.10-0.50 per transaction

*Compliance:*
- Local payment licenses required (varies by country)
- Data residency (must store payment data in-country for many jurisdictions)

### 5.4 Crypto Infrastructure Provider Onboarding

**Sub-Category A: Custody Providers**

Examples: Fireblocks, BitGo, Anchorage Digital, Copper

*What They Provide:*
- Multi-signature wallets for secure crypto storage
- Hot wallet (for instant payments) and cold storage (for reserves)
- Transaction signing and approval workflows
- Insurance on deposits (up to $100M for institutional custodians)

*Integration:*
- API for wallet creation and transaction signing
- Webhooks for deposit notifications
- Multi-party computation (MPC) for key management (no single point of failure)

*Pricing:*
- Setup fee: $5,000-50,000 (depending on custody volume)
- Monthly custody fee: 0.1-0.5% of assets under management (AUM)
- Transaction fee: $1-10 per withdrawal

*Onboarding Requirements:*
- SOC 2 Type II certification ✓
- Insurance policy verification ✓
- Multi-sig setup (typically 2-of-3 or 3-of-5) ✓
- Disaster recovery and key recovery procedures ✓

**Sub-Category B: Blockchain Analytics Providers**

Examples: Chainalysis, Elliptic, TRM Labs

*What They Provide:*
- Transaction risk scoring (is this wallet associated with illicit activity?)
- Sanctions screening (OFAC SDN list)
- Compliance reporting (FINCEN reports for crypto businesses)

*Integration:*
- Real-time API: Check wallet address before accepting payment
- Batch screening: Analyze historical transactions
- Ongoing monitoring: Alerts if previously-clean wallet is flagged

*Pricing:*
- Per-address screening: $0.50-2.00
- Monthly monitoring: $500-5,000 (based on transaction volume)
- Enterprise: $50,000-250,000/year for unlimited screening

**Sub-Category C: On/Off Ramp Providers**

Examples: MoonPay, Wyre, Simplex, Ramp Network

*What They Provide:*
- Fiat-to-crypto conversion (customer pays with card, receives crypto)
- Crypto-to-fiat conversion (customer sends crypto, receives bank transfer)

*Integration:*
- Widget for embedded checkout
- KYC/AML flows integrated (providers handle compliance)
- Multiple fiat currencies and crypto assets

*Pricing:*
- Fee: 3-5% per transaction (higher than card fees due to fraud risk)
- Instant settlement to merchant (provider assumes chargeback risk)

*Compliance:*
- Money transmitter licenses in all US states
- FCA registration (UK)
- MiCA compliance (EU, upcoming)

---

## 6. Execution Roadmap

### Phase 1: Control Plane Service Architecture (Weeks 1-2)

**Objective:** Build the foundational registry and subscription system that enables the marketplace.

**New Entities:**

\`\`\`json
ServiceCatalog {
  "service_id": "uuid",
  "service_name": "string",
  "service_category": "enum[payment_rail, compliance, fraud, analytics, crypto, developer_tools]",
  "provider_id": "uuid",  // Reference to ServiceProvider
  "description": "string",
  "long_description": "markdown",
  "features": ["array of strings"],
  "pricing_model": "enum[fixed, per_transaction, tiered, custom]",
  "base_price": "number",
  "variable_price": "number",
  "pricing_tiers": [{volume_min, volume_max, price}],
  "trial_available": "boolean",
  "trial_duration_days": "number",
  "integration_complexity": "enum[simple, moderate, complex]",
  "estimated_setup_time": "string",
  "documentation_url": "string",
  "api_spec_url": "string",
  "status": "enum[draft, under_review, certified, active, deprecated]",
  "certification_date": "date",
  "uptime_sla": "number",
  "avg_latency_ms": "number",
  "rating": "number",
  "total_reviews": "number",
  "total_subscribers": "number"
}

ServiceProvider {
  "provider_id": "uuid",
  "company_name": "string",
  "legal_name": "string",
  "website": "string",
  "logo_url": "string",
  "description": "string",
  "founding_year": "number",
  "funding_stage": "enum[pre_seed, seed, series_a, series_b, series_c, public, profitable]",
  "headquarters_country": "string",
  "contact_email": "string",
  "support_email": "string",
  "support_phone": "string",
  "certifications": ["SOC2", "ISO27001", "PCI_DSS"],
  "status": "enum[pending, approved, active, suspended]",
  "approval_date": "date",
  "commission_rate": "number",  // e.g., 0.20 for 20%
  "payment_schedule": "enum[weekly, monthly]",
  "total_revenue_earned": "number",
  "total_services": "number"
}

PSPServiceSubscription {
  "subscription_id": "uuid",
  "psp_id": "uuid",
  "service_id": "uuid",
  "subscribed_date": "date",
  "status": "enum[active, paused, cancelled]",
  "configuration": "json",  // Service-specific config
  "billing_cycle": "enum[monthly, annual]",
  "current_period_start": "date",
  "current_period_end": "date",
  "usage_limits": "json",  // e.g., max API calls per month
  "current_usage": "json"
}

ServiceUsageMetric {
  "metric_id": "uuid",
  "psp_id": "uuid",
  "service_id": "uuid",
  "subscription_id": "uuid",
  "usage_date": "date",
  "metric_type": "enum[api_call, transaction_routed, fraud_check, etc.]",
  "quantity": "number",
  "unit_cost": "number",
  "total_cost": "number",
  "metadata": "json"  // Additional context
}
\`\`\`

**New Pages:**

1. **FTSServiceRegistry** (Control Plane)
   - View all services in catalog
   - Filter by category, status, provider
   - Approve/reject services pending certification
   - View service performance metrics
   - Manage commission rates

**Deliverables:**
- ✓ 4 new entities created with schema definitions
- ✓ Service registry UI (admin only)
- ✓ API endpoints for service CRUD operations
- ✓ Basic subscription management (enable/disable services for PSPs)
- ✓ 8 compliance entities (GDPR, Data Breach, Security, Access Control, Retention, Certifications, PIA)
- ✓ Enhanced Audit Logs with AI anomaly detection
- ✓ Data Retention Management with automated scheduler
- ✓ Xero accounting integration with OAuth

**Success Metrics:**
- All FTS-owned services registered in catalog
- Test PSP can subscribe to and use a service
- Usage metrics captured correctly
- Compliance framework operational with automated retention enforcement
- AI anomaly detection achieving >90% accuracy on suspicious activity flagging
- Xero integration syncing financial data in real-time

### Phase 2: Core Services Migration (Weeks 3-4)

**Objective:** Migrate 7 flagship features from PSP Portal to FTS Services, making them subscribable through the marketplace.

**Services to Migrate:**

1. **Payment Orchestration Service**
   - Smart routing engine
   - MID routing rules
   - Load balancing across providers
   - Cascade logic (failover)
   - Real-time provider performance tracking

2. **AI Fraud Detection Suite**
   - ML-based fraud scoring
   - Network tokenization management
   - Account updater service
   - 3DS orchestration
   - Velocity checks and anomaly detection

3. **Crypto Gateway Service**
   - Multi-chain support (Bitcoin, Ethereum, Polygon, BSC, Solana)
   - On/off ramp integrations
   - Custody provider connections
   - Compliance and AML screening (Chainalysis integration)
   - Tax reporting (cost basis tracking)

4. **Advanced Analytics Service**
   - Business intelligence dashboards
   - Predictive analytics (churn prediction, revenue forecasting)
   - Merchant benchmarking (compare merchant performance to cohorts)
   - Custom report builder

5. **Compliance Automation Service**
   - KYB orchestration (call multiple providers, aggregate results)
   - AML screening and monitoring
   - PCI-DSS compliance checklists
   - FATF compliance workflows

6. **Sub-Merchant Platform**
   - Marketplace infrastructure (platforms like Shopify, Etsy)
   - Split payment calculations
   - Sub-merchant onboarding and KYB
   - Separate settlement accounts and payouts

7. **Developer API Suite**
   - Unified REST API
   - Webhook management
   - SDKs (Python, Node.js, PHP, Ruby, Go)
   - Sandbox environment
   - API documentation portal (Swagger/OpenAPI)

**Migration Process per Service:**

1. Refactor service code to be tenant-aware (multi-PSP support)
2. Add configuration layer (PSPs can customize behavior)
3. Implement usage metering (count API calls, transactions, etc.)
4. Create service-specific documentation
5. Register service in ServiceCatalog
6. Test with pilot PSP
7. Migrate existing PSPs from built-in feature to subscribed service

**Deliverables:**
- 7 services fully migrated and available in marketplace
- Each service has:
  - API documentation
  - Pricing page
  - Configuration UI for PSPs
  - Usage dashboard
- Existing PSPs automatically subscribed (no disruption)

**Success Metrics:**
- All services have >99.5% uptime
- Avg latency <200ms for critical services (routing, fraud)
- PSPs can enable/disable services without downtime
- Usage metrics accurately tracked

### Phase 3: Marketplace Foundation (Weeks 5-7)

**Objective:** Build the two-sided marketplace UI where service providers register and PSPs subscribe.

**New Entities:**

\`\`\`json
MarketplaceService {
  // Extends ServiceCatalog with marketplace-specific fields
  "featured": "boolean",
  "featured_until": "date",
  "banner_image_url": "string",
  "screenshots": ["array of URLs"],
  "demo_video_url": "string",
  "case_studies": ["array of objects"],
  "integration_guide_url": "string",
  "changelog": ["array of version updates"]
}

ServiceIntegration {
  "integration_id": "uuid",
  "psp_id": "uuid",
  "service_id": "uuid",
  "integration_status": "enum[not_started, in_progress, testing, live]",
  "api_credentials": "encrypted_json",
  "webhook_url": "string",
  "configuration": "json",
  "test_results": "json",
  "go_live_date": "date"
}

ServiceReview {
  "review_id": "uuid",
  "service_id": "uuid",
  "psp_id": "uuid",
  "reviewer_name": "string",
  "rating": "number",  // 1-5 stars
  "review_text": "string",
  "created_date": "date",
  "helpful_count": "number"
}

ServiceInvoice {
  "invoice_id": "uuid",
  "psp_id": "uuid",
  "billing_period_start": "date",
  "billing_period_end": "date",
  "line_items": [{
    "service_id": "uuid",
    "service_name": "string",
    "quantity": "number",
    "unit_price": "number",
    "total": "number"
  }],
  "subtotal": "number",
  "tax": "number",
  "total_amount": "number",
  "status": "enum[draft, sent, paid, overdue]",
  "due_date": "date",
  "paid_date": "date"
}
\`\`\`

**New Pages:**

1. **FTSMarketplace** (PSP-facing)
   - Browse service catalog
   - Filter by category, price, rating
   - Search functionality
   - Service detail pages (description, pricing, reviews, integration guide)
   - Subscribe button (1-click enable)

2. **ProviderPortal** (Service Provider-facing)
   - Dashboard showing subscriber count, revenue, usage
   - Service listing management (edit description, pricing, screenshots)
   - Analytics (which PSPs are using the service, how often)
   - Support ticket system (PSPs can contact provider)
   - Revenue reports and payment history

3. **ServiceDetails** (per service)
   - Full description and features
   - Pricing calculator (estimate monthly cost based on usage)
   - Integration guide and API docs
   - Screenshots and demo video
   - Customer reviews and ratings
   - Related services ("Customers who use this also use...")

4. **SubscriptionManagement** (PSP-facing)
   - View all active subscriptions
   - Configure each service
   - Monitor usage and costs in real-time
   - Upgrade/downgrade plans
   - Cancel subscriptions

**UI Components:**

- Service Card: Compact view in catalog
- Service Comparison Table: Compare pricing and features of similar services
- Integration Wizard: Step-by-step setup for new service
- Cost Estimator: Calculate monthly bill based on expected usage
- Rating Widget: 5-star rating with filtering by rating

**Deliverables:**
- Marketplace catalog UI (browse, search, filter)
- Service provider portal (manage listings)
- PSP subscription interface (1-click enable/disable)
- Service certification workflow (FTS approves new services)
- Billing integration (usage tracking → invoice generation)

**Success Metrics:**
- 5 external service providers onboarded
- 10 services listed in marketplace
- PSPs can browse and subscribe in <5 minutes
- Service provider receives payment within 7 days of month-end

### Phase 4: Community Features (Weeks 8-10)

**Objective:** Build community engagement layer to drive network effects and platform stickiness.

**New Entities:**

\`\`\`json
CommunityMember {
  "member_id": "uuid",
  "user_id": "uuid",  // Link to AppUser or external auth
  "member_type": "enum[fintech, developer, influencer, service_provider]",
  "display_name": "string",
  "avatar_url": "string",
  "bio": "string",
  "company": "string",
  "title": "string",
  "location": "string",
  "website": "string",
  "linkedin_url": "string",
  "twitter_handle": "string",
  "fluidity_score": "number",
  "badges": ["array of badge IDs"],
  "reputation_points": "number",
  "join_date": "date",
  "last_active": "date"
}

FluidityScore {
  "score_id": "uuid",
  "member_id": "uuid",
  "current_score": "number",  // 0-100
  "transaction_volume_score": "number",
  "engagement_score": "number",
  "esg_impact_score": "number",
  "innovation_score": "number",
  "compliance_score": "number",
  "last_updated": "date",
  "score_history": ["array of {date, score}"]
}

Challenge {
  "challenge_id": "uuid",
  "title": "string",
  "description": "markdown",
  "category": "enum[ai_ml, fraud_detection, payment_innovation, crypto, esg]",
  "start_date": "date",
  "end_date": "date",
  "prize_pool": "number",
  "sponsor": "string",
  "rules": "markdown",
  "submission_requirements": "json",
  "status": "enum[upcoming, active, judging, completed]",
  "participant_count": "number",
  "submission_count": "number"
}

ChallengeSubmission {
  "submission_id": "uuid",
  "challenge_id": "uuid",
  "member_id": "uuid",
  "submission_date": "date",
  "title": "string",
  "description": "markdown",
  "github_repo": "string",
  "demo_url": "string",
  "video_url": "string",
  "score": "number",
  "judges_feedback": "array of {judge_name, score, comments}",
  "status": "enum[submitted, under_review, winner, finalist, not_selected]"
}

MemberConnection {
  "connection_id": "uuid",
  "member_id_1": "uuid",
  "member_id_2": "uuid",
  "connection_type": "enum[follow, mentor, partner]",
  "status": "enum[pending, accepted, declined]",
  "created_date": "date"
}

ForumPost {
  "post_id": "uuid",
  "author_id": "uuid",
  "category": "enum[technical_qa, regulatory, news, best_practices, integration_help]",
  "title": "string",
  "content": "markdown",
  "tags": ["array of strings"],
  "views": "number",
  "upvotes": "number",
  "created_date": "date",
  "last_activity": "date",
  "is_answered": "boolean",
  "accepted_answer_id": "uuid"
}

ForumComment {
  "comment_id": "uuid",
  "post_id": "uuid",
  "author_id": "uuid",
  "content": "markdown",
  "upvotes": "number",
  "created_date": "date",
  "is_accepted_answer": "boolean"
}
\`\`\`

**New Pages:**

1. **CommunityHome**
   - Activity feed (recent posts, challenges, new members)
   - Fluidity Index leaderboard (top 10)
   - Upcoming events (hackathons, webinars)
   - Featured members of the month

2. **MemberDirectory**
   - Search members by role, company, location
   - Filter by Fluidity Index score range
   - Member profiles (bio, badges, recent activity)
   - Connect button (send connection request)

3. **FluidityLeaderboard**
   - Global leaderboard (all members)
   - Category leaderboards (FinTech, Developer, Influencer, Provider)
   - Score breakdown (transaction volume, engagement, ESG, innovation, compliance)
   - Score history chart (track improvement over time)

4. **Challenges**
   - Browse active and upcoming challenges
   - Challenge detail page (rules, prizes, deadlines)
   - Submit project (GitHub repo, demo, video)
   - Voting and judging interface
   - Winner announcement and showcase

5. **Forums**
   - Category view (Technical Q&A, Regulatory, etc.)
   - Thread view with comments
   - Post creation (markdown editor)
   - Upvote/downvote
   - Accept answer (for question threads)
   - Search and filtering

**Gamification Mechanics:**

*Badges:*
- Early Adopter (joined in first 100 members)
- Transaction Titan (processed >$100M)
- Community Champion (100+ forum posts)
- ESG Leader (high sustainability score)
- Innovation Award (challenge winner)
- Compliance Star (zero incidents)

*Reputation System:*
- +10 points: Post helpful answer
- +5 points: Upvoted content
- +50 points: Accepted answer
- +100 points: Challenge finalist
- +500 points: Challenge winner

*Levels:*
- 0-100 points: Novice
- 101-500: Contributor
- 501-2000: Expert
- 2001-5000: Leader
- 5001+: Legend

**Deliverables:**
- Member profiles with Fluidity Index scores
- Challenge platform (create, submit, judge)
- Discussion forums with Q&A
- Networking features (connections, mentorship)
- Leaderboards and gamification

**Success Metrics:**
- 500+ community members
- 100+ forum posts per week
- 50+ submissions per challenge
- 80% member engagement rate (active in last 30 days)

### Phase 5: Partner Ecosystem Opening (Month 4+)

**Objective:** Open the marketplace to vetted third-party service providers and scale the ecosystem.

**Partner Outreach Strategy:**

*Wave 1: Strategic Partners (Months 4-5)*

Target: High-value providers with established reputations

**Compliance Providers:**
- Trulioo (KYB/KYC) – Target: 10 PSPs onboarded by Month 6
- ComplyAdvantage (AML) – Target: 15 PSPs onboarded by Month 6
- Bloomberg LEI (LEI issuance) – Target: 5 enterprise PSPs
- Onfido (document verification) – Target: 12 PSPs
- Jumio (identity verification) – Target: 8 PSPs

**Fraud & Security:**
- Sift (fraud detection) – Target: 20 PSPs
- Kount (fraud prevention) – Target: 15 PSPs
- Cardinal Commerce (3DS) – Target: 25 PSPs

**Crypto Infrastructure:**
- Coinbase Commerce (crypto payments) – Target: 10 PSPs
- Fireblocks (custody) – Target: 5 institutional PSPs
- Chainalysis (AML for crypto) – Target: 12 PSPs

**Developer Tools:**
- Postman (API testing) – Target: 50 PSPs
- Datadog (monitoring) – Target: 30 PSPs
- Sentry (error tracking) – Target: 40 PSPs

*Outreach Tactics:*
- Personal introductions from FTS leadership
- Co-marketing webinar series
- Revenue share guarantees (minimum monthly revenue commitment)
- Featured placement for first 90 days
- Dedicated integration support

*Wave 2: Mid-Tier Providers (Months 6-8)*

Target: 50 additional service providers across categories

*Wave 3: Long-Tail Providers (Months 9-12)*

Target: Open marketplace to all qualified providers

**Partner Success Program:**

*Onboarding Support:*
- Dedicated partner success manager
- Technical integration assistance
- Co-marketing materials (case studies, webinars, blog posts)
- Quarterly business reviews

*Certification Fast-Track:*
- Expedited review for providers with existing certifications (SOC 2, ISO 27001)
- Reduced commission rate (15% vs 20%) for first 6 months

*Revenue Guarantees:*
- Minimum $10,000 monthly revenue for strategic partners
- If target not met, FTS covers the difference for first 3 months

**Marketplace Growth Targets:**

- Month 4: 10 service providers, 20 services
- Month 6: 30 service providers, 60 services
- Month 9: 75 service providers, 150 services
- Month 12: 150 service providers, 300 services
- Month 24: 400 service providers, 800 services

**Network Effects Indicators:**

*Supply-Side:*
- Provider join rate increasing month-over-month
- Average services per provider increasing (providers launch additional offerings)

*Demand-Side:*
- PSPs subscribing to more services over time (2 → 3 → 5 services avg)
- Higher-tier PSP adoption increasing

*Cross-Side:*
- PSPs requesting specific services → FTS recruits those providers
- Providers suggesting features → FTS builds into platform

### Phased Rollout Summary

| Phase | Timeline | Key Deliverables | Success Criteria |
|-------|----------|------------------|------------------|
| 1: Control Plane | Weeks 1-2 | Service registry, subscriptions | Test PSP can subscribe to FTS service |
| 2: Service Migration | Weeks 3-4 | 7 FTS services migrated | All services >99.5% uptime |
| 3: Marketplace | Weeks 5-7 | Catalog UI, provider portal | 5 external providers onboarded |
| 4: Community | Weeks 8-10 | Forums, challenges, Fluidity Index | 500 members, 100 posts/week |
| 5: Partner Opening | Month 4+ | 150 service providers | 300 services live |

**Total Timeline:** 10 weeks to MVP, 12 months to market leadership

---

## 7. Success Metrics & KPIs

### 7.1 Platform Health Metrics

**Infrastructure:**
- Service Uptime: 99.9% (industry standard)
- API Latency: p50 <100ms, p95 <250ms, p99 <500ms
- Error Rate: <0.1% of all API calls
- Incident Response Time: Critical issues resolved in <1 hour

**PSP Metrics:**
- Total PSP Instances: Target 100 in Year 1, 500 in Year 2, 2000 in Year 3
- PSP Tier Distribution: 30% Starter, 50% Professional, 15% Enterprise, 5% Custom
- Average Services per PSP: 3-5 services (indicates engagement)
- PSP Churn Rate: <10% annually (industry benchmark: 15-20%)
- Net Revenue Retention (NRR): >120% (PSPs upgrading tiers and adding services)

**Transaction Metrics:**
- Total Payment Volume: Track monthly and annual growth
- Average Transaction Value: Benchmark across PSPs
- Success Rate: >95% (failed transactions indicate provider or orchestration issues)
- Chargeback Rate: <0.5% (industry average: 0.6-0.8%)

### 7.2 Marketplace Growth Metrics

**Supply-Side (Service Providers):**
- Total Service Providers: Target 50 by Month 6, 150 by Month 12
- Services per Provider: >1.5 (providers expanding offerings)
- Provider Revenue Growth: Month-over-month increase
- Provider Satisfaction Score: >8/10 (quarterly survey)
- Provider Retention: >90% annually

**Demand-Side (PSPs):**
- Service Adoption Rate: % of PSPs using at least 1 marketplace service
- Services per PSP: Avg 3-5 (engagement indicator)
- Subscription Growth: Month-over-month new subscriptions
- Service Utilization: Active usage vs inactive subscriptions
- Service Satisfaction: >4.2/5 stars average rating

**Marketplace Efficiency:**
- Time to Service Activation: <24 hours from subscription to go-live
- Service Discovery Rate: % of PSPs finding services via search/browse (vs direct URL)
- Cross-Sell Rate: % of PSPs who subscribe to 2nd service after 1st
- Revenue per Service: Average revenue generated per marketplace service

### 7.3 Community Engagement Metrics

**Member Metrics:**
- Total Community Members: Target 500 by Month 6, 2000 by Month 12
- Member Type Distribution: 40% FinTech, 30% Developer, 20% Influencer, 10% Provider
- Active Members: >80% active in last 30 days
- Premium Membership Conversion: 10% of free members upgrade

**Engagement Metrics:**
- Forum Posts per Week: >100 posts
- Challenge Submissions per Challenge: >20 submissions
- Fluidity Index Activity: >50% of members actively improving their score
- Networking Connections: Avg 10 connections per member

**Content Metrics:**
- Blog Posts Published: 2 per week (company + community-generated)
- Webinar Attendance: >200 attendees per webinar
- Video Content Views: YouTube channel with >10K monthly views
- Social Media Engagement: Twitter, LinkedIn followers growing 10% monthly

### 7.4 Financial Metrics

**Revenue Metrics:**
- Monthly Recurring Revenue (MRR): Track growth month-over-month
- Annual Recurring Revenue (ARR): Project from MRR
- Revenue by Stream: Breakdown (subscriptions, marketplace commissions, revenue share)
- Average Revenue per PSP (ARPP): Target >$10,000/month
- Customer Lifetime Value (LTV): Target >$500,000

**Profitability Metrics:**
- Gross Margin: Target 65-70%
- Operating Margin: Breakeven by Month 18, 25% by Year 3
- Customer Acquisition Cost (CAC): <$20,000 per PSP
- LTV:CAC Ratio: >25:1 (exceptional)
- Payback Period: <2 months

**Cash Flow Metrics:**
- Cash Burn Rate: Track monthly (target breakeven by Month 18)
- Runway: Maintain 24+ months runway
- Days Sales Outstanding (DSO): <30 days (fast payment collection)

### 7.5 Competitive Positioning Metrics

**Market Share:**
- % of global PSPs using FTS.Money: Target 5% by Year 3
- Competitive Win Rate: >60% of RFPs won
- Brand Awareness: Unprompted recall in target market surveys

**Product Leadership:**
- Feature Release Velocity: New marketplace service every 2 weeks
- Innovation Index: Customer-rated innovativeness score
- Ecosystem Strength: Number of integrations built by community

---

## 8. Risk Mitigation & Contingencies

### 8.1 Technical Risks

**Risk: Service Provider Downtime**
- Mitigation: Multi-provider redundancy (PSPs can configure failover)
- Contingency: FTS provides backup services for critical functions

**Risk: API Performance Degradation**
- Mitigation: Auto-scaling infrastructure, rate limiting
- Contingency: Performance SLA credits to affected PSPs

**Risk: Security Breach**
- Mitigation: SOC 2 Type II, penetration testing, bug bounty program
- Contingency: Cyber insurance, incident response plan, customer notifications

### 8.2 Business Risks

**Risk: Slow PSP Adoption**
- Mitigation: Aggressive sales team, free trials, migration assistance
- Contingency: Pivot to B2C fintech (direct consumer payments app)

**Risk: Service Provider Conflicts**
- Mitigation: Clear terms of service, conflict resolution process
- Contingency: FTS develops competing services in-house

**Risk: Regulatory Changes**
- Mitigation: Compliance team monitoring global regulations
- Contingency: Rapid feature adaptation, region-specific offerings

### 8.3 Market Risks

**Risk: Competitor Launches Similar Platform**
- Mitigation: Move fast (10 weeks to MVP), lock in strategic providers
- Contingency: M&A strategy (acquire competing platforms)

**Risk: Economic Downturn**
- Mitigation: Focus on cost-saving services, efficiency tools
- Contingency: Reduce pricing, extend payment terms for struggling PSPs

---

## 9. Conclusion & Next Steps

### 9.1 Strategic Advantages

FTS.Money's ecosystem approach delivers five strategic advantages:

1. **Network Effects:** Platform value grows exponentially with each new PSP and service provider
2. **Switching Costs:** PSPs become deeply integrated, reducing churn
3. **Data Moat:** Aggregated transaction data improves fraud detection and routing for all users
4. **Monetization Optionality:** Multiple revenue streams (subscriptions, commissions, revenue share)
5. **Defensibility:** Two-sided marketplace is harder to replicate than single-product companies

### 9.2 Immediate Next Steps

**Week 1-2:**
- Create ServiceCatalog, ServiceProvider, PSPServiceSubscription, ServiceUsageMetric entities
- Build FTSServiceRegistry page
- Register first FTS-owned service (Payment Orchestration)
- Test subscription workflow with pilot PSP

**Week 3-4:**
- Migrate remaining 6 FTS services
- Document each service (API specs, pricing, config)
- Deploy service-specific dashboards
- Validate usage metering accuracy

**Week 5-7:**
- Launch marketplace UI (browse, search, subscribe)
- Onboard first 5 external service providers
- Build provider portal (revenue dashboards, analytics)
- Test billing workflow (usage → invoice → payment)

### 9.3 Critical Decision Points

**Decision 1: Build vs Buy vs Partner**

For each service category, decide:
- Build in-house (FTS-owned service, 100% margin)
- Partner with best-in-class provider (marketplace commission)
- Acquire smaller provider (if strategic)

**Recommendation:** 
- Build: Core orchestration, fraud, analytics (differentiation)
- Partner: Compliance, crypto custody, payment rails (commodity)

**Decision 2: Geographic Expansion**

Launch order:
- Year 1: North America, UK, EU
- Year 2: Latin America, Southeast Asia
- Year 3: Middle East, Africa

**Recommendation:** Follow PSP demand, not arbitrary geography.

**Decision 3: Become LEI Registration Agent**

Should FTS.Money become GLEIF-accredited to issue LEIs directly?

**Pros:**
- 100% revenue (vs 15-20% commission)
- Control over merchant onboarding workflow
- Differentiation for enterprise PSPs

**Cons:**
- $50K accreditation cost
- Ongoing compliance and audit requirements
- Operational complexity

**Recommendation:** Yes, pursue accreditation in Year 2 once scale justifies investment.

### 9.4 Success Criteria

This ecosystem will be deemed successful when:

✅ 100+ PSPs provisioned and active  
✅ 50+ third-party service providers live in marketplace  
✅ $10M+ ARR from subscriptions and marketplace commissions  
✅ 500+ active community members  
✅ 99.9%+ platform uptime  
✅ Net Promoter Score (NPS) >50 from PSPs  

**Target Date:** 12 months from project kickoff

---

## Appendices

### Appendix A: Glossary

- **APM:** Alternative Payment Method
- **ARR:** Annual Recurring Revenue
- **CAC:** Customer Acquisition Cost
- **KYB:** Know Your Business
- **KYC:** Know Your Customer
- **LEI:** Legal Entity Identifier
- **MID:** Merchant Identifier
- **MRR:** Monthly Recurring Revenue
- **NRR:** Net Revenue Retention
- **PSP:** Payment Service Provider
- **vLEI:** Verifiable Legal Entity Identifier

### Appendix B: References

- Stripe Connect Platform Documentation
- Plaid Exchange Partner Program
- Shopify App Store Best Practices
- GLEIF LEI Issuance Standards
- PCI-DSS Compliance Requirements
- ISO 20022 Payment Messaging Standards

### Appendix C: Contact

For questions about this architecture:
- **Strategic:** Contact FTS Platform Team
- **Technical:** Contact FTS Engineering
- **Partnerships:** Contact FTS Business Development

---

**Document Version:** 1.0  
**Last Updated:** December 2025  
**Next Review:** Quarterly or upon major architectural changes

---

*This document is confidential and proprietary to FTS.Money. Do not distribute without authorization.*
`;
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Platform
                    </Button>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                            <Layers className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">FTS.Money Ecosystem Architecture</h1>
                            <p className="text-slate-600">Complete Platform, Marketplace & Community Blueprint</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-blue-100 text-blue-700">Version 1.0</Badge>
                        <Badge variant="outline">Strategic Planning Document</Badge>
                        <Badge variant="outline">December 2025</Badge>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDownloadPDF}
                            className="ml-auto gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download Full Document
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="concept" className="space-y-6">
                    <TabsList className="grid grid-cols-7">
                        <TabsTrigger value="concept">Concept</TabsTrigger>
                        <TabsTrigger value="architecture">Architecture</TabsTrigger>
                        <TabsTrigger value="technical">Technical</TabsTrigger>
                        <TabsTrigger value="components">Components</TabsTrigger>
                        <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                        <TabsTrigger value="monetization">Monetization</TabsTrigger>
                        <TabsTrigger value="execution">Execution</TabsTrigger>
                    </TabsList>

                    {/* CONCEPT */}
                    <TabsContent value="concept" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-600" />
                                    Core Concept
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Vision Statement</h3>
                                    <p className="text-slate-700 leading-relaxed">
                                        Transform FTS.Money from a white-label PSP platform into a <strong>three-layer ecosystem</strong>:
                                        a centralized control plane, a two-sided marketplace connecting service providers with PSPs, 
                                        and lightweight PSP portals consuming services on-demand.
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2">Paradigm Shift</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="font-medium text-blue-800 mb-1">❌ OLD MODEL</p>
                                            <ul className="space-y-1 text-blue-700">
                                                <li>• Each PSP is fully independent</li>
                                                <li>• Features deployed per PSP</li>
                                                <li>• Separate contracts with providers</li>
                                                <li>• Manual onboarding processes</li>
                                                <li>• Hard to monetize add-ons</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium text-emerald-800 mb-1">✅ NEW MODEL</p>
                                            <ul className="space-y-1 text-emerald-700">
                                                <li>• PSPs consume shared services</li>
                                                <li>• Deploy once, all PSPs benefit</li>
                                                <li>• Marketplace of vetted providers</li>
                                                <li>• Automated service orchestration</li>
                                                <li>• Per-service monetization</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Market Validation</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                                            <p className="text-sm font-medium mb-1">Stripe Connect</p>
                                            <p className="text-xs text-slate-600">Platform model with app marketplace. $95B valuation.</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                                            <p className="text-sm font-medium mb-1">Plaid Exchange</p>
                                            <p className="text-xs text-slate-600">Partner ecosystem of 50+ providers. $13.4B valuation.</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                                            <p className="text-sm font-medium mb-1">Shopify App Store</p>
                                            <p className="text-xs text-slate-600">8,000+ apps. $1B+ partner revenue annually.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ARCHITECTURE */}
                    <TabsContent value="architecture" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-blue-600" />
                                    Four-Layer Ecosystem Architecture
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Layer 1 */}
                                <div className="border-l-4 border-blue-600 pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-bold text-lg">Layer 1: FTS.Money Control Plane</h3>
                                        <Badge className="bg-blue-100 text-blue-700">Infrastructure</Badge>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-3">Platform infrastructure operator and marketplace curator</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 rounded border">
                                            <p className="font-medium text-sm mb-1">Primary Functions</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• Provision PSP instances</li>
                                                <li>• Manage global provider pool</li>
                                                <li>• Manage global payout routes</li>
                                                <li>• Configure fee templates by tier</li>
                                                <li>• Set compliance policies</li>
                                                <li>• Monitor all PSP instances</li>
                                            </ul>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded border">
                                            <p className="font-medium text-sm mb-1">Marketplace Functions</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• Approve service providers</li>
                                                <li>• Certify marketplace services</li>
                                                <li>• Security & compliance audits</li>
                                                <li>• Revenue share management</li>
                                                <li>• Platform-wide analytics</li>
                                                <li>• Quality assurance</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Layer 2 */}
                                <div className="border-l-4 border-purple-600 pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        <h3 className="font-bold text-lg">Layer 2: FTS Community Marketplace</h3>
                                        <Badge className="bg-purple-100 text-purple-700">Two-Sided Platform</Badge>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-3">Service provider ecosystem and PSP subscription marketplace</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                            <p className="font-medium text-sm mb-1">Left Side: Service Providers</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li><strong>Payment Rails:</strong> Card schemes, acquirers, banks, crypto providers, APMs</li>
                                                <li><strong>Compliance:</strong> KYC/KYB vendors, AML screening, LEI issuers, fraud detection</li>
                                                <li><strong>Financial Services:</strong> BaaS, treasury, lending, custody</li>
                                                <li><strong>Technology:</strong> Routing engines, reconciliation, analytics, dev tools</li>
                                            </ul>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                            <p className="font-medium text-sm mb-1">Right Side: PSP Subscribers</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• Browse service catalog</li>
                                                <li>• Subscribe to services (1-click)</li>
                                                <li>• Configure service parameters</li>
                                                <li>• Monitor usage & costs</li>
                                                <li>• Rate & review services</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-slate-50 rounded border">
                                        <p className="font-medium text-sm mb-1">Community Features</p>
                                        <ul className="text-xs text-slate-700 space-y-1">
                                            <li>• <strong>Member Profiles:</strong> FinTech, Developer, Influencer roles with networking</li>
                                            <li>• <strong>Fluidity Index:</strong> Gamification scoring (ESG impact, volume, innovation)</li>
                                            <li>• <strong>Challenges & Hackathons:</strong> AI competitions, innovation contests</li>
                                            <li>• <strong>Discussion Forums:</strong> Knowledge sharing and collaboration</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Layer 3 */}
                                <div className="border-l-4 border-emerald-600 pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap className="h-5 w-5 text-emerald-600" />
                                        <h3 className="font-bold text-lg">Layer 3: PSP Portal (Lightweight)</h3>
                                        <Badge className="bg-emerald-100 text-emerald-700">Service Consumer</Badge>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-3">Minimal core with service orchestration layer</p>
                                    <div className="p-3 bg-slate-50 rounded border">
                                        <p className="font-medium text-sm mb-2">Core Features (Keep in PSP Portal)</p>
                                        <ul className="text-xs text-slate-700 space-y-1">
                                            <li>• <strong>Dashboard:</strong> PSP-branded overview with their metrics</li>
                                            <li>• <strong>Merchant Onboarding Hub:</strong> Workflow orchestrator calling marketplace services</li>
                                            <li>• <strong>Basic Merchant List:</strong> Read-only view of their merchants</li>
                                            <li>• <strong>Transaction Viewer:</strong> Simple transaction history</li>
                                            <li>• <strong>Service Marketplace UI:</strong> Browse and subscribe to services</li>
                                            <li>• <strong>Settings & Appearance:</strong> Branding, user management, basic config</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Layer 4 */}
                                <div className="border-l-4 border-amber-600 pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="h-5 w-5 text-amber-600" />
                                        <h3 className="font-bold text-lg">Layer 4: Merchant Portal</h3>
                                        <Badge className="bg-amber-100 text-amber-700">End Users</Badge>
                                    </div>
                                    <p className="text-sm text-slate-700">Minimal changes - consume services PSP has enabled</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Service Architecture Diagram */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Consumption Flow</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 font-mono text-xs">
                                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                        <p className="font-bold text-blue-900 mb-1">PSP Portal (Merchant Onboarding)</p>
                                        <p className="text-blue-700">Merchant applies via PSP's branded interface</p>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="text-slate-400">↓ Calls FTS Marketplace API</div>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded border border-purple-200">
                                        <p className="font-bold text-purple-900 mb-1">FTS Community Marketplace (Service Orchestration)</p>
                                        <div className="space-y-1 text-purple-700">
                                            <p>→ KYB Service (Trulioo) - $5 per check</p>
                                            <p>→ AML Screening (ComplyAdvantage) - $2 per check</p>
                                            <p>→ LEI Verification (GLEIF Provider) - $150 issuance</p>
                                            <p>→ Document Verification (Onfido) - $8 per document</p>
                                            <p>→ Risk Scoring (FTS AI) - $1 per score</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <div className="text-slate-400">↓ Results aggregated</div>
                                    </div>
                                    <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                                        <p className="font-bold text-emerald-900 mb-1">PSP Portal (Decision)</p>
                                        <p className="text-emerald-700">Approve/Reject merchant based on results</p>
                                        <p className="text-xs text-emerald-600 mt-1">Total cost: $166 → Billed to PSP → PSP passes to merchant</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TECHNICAL ARCHITECTURE */}
                    <TabsContent value="technical" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-blue-600" />
                                    Production Technical Architecture
                                </CardTitle>
                                <p className="text-sm text-slate-600 mt-2">PCI-DSS Level 1 compliant infrastructure capable of 5,000+ TPS with high availability</p>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Key Decisions */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Architecture Decisions</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                            <p className="font-medium text-sm mb-1">Hybrid Approach</p>
                                            <p className="text-xs text-slate-700">Base44 for PSP Portal (admin/backoffice), AWS for payment processing engine</p>
                                            <p className="text-xs text-blue-700 mt-1">Rationale: Leverage Base44's rapid development for UI, AWS for high-performance transactions</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                                            <p className="font-medium text-sm mb-1">Payment Processing Language</p>
                                            <p className="text-xs text-slate-700">Go (Fiber framework)</p>
                                            <p className="text-xs text-purple-700 mt-1">Rationale: Low latency, high concurrency, strong typing, easy AWS deployment</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                                            <p className="font-medium text-sm mb-1">Database</p>
                                            <p className="text-xs text-slate-700">PostgreSQL (RDS) with future Citus sharding</p>
                                            <p className="text-xs text-emerald-700 mt-1">Rationale: ACID compliance, proven at scale, horizontal sharding path</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                                            <p className="font-medium text-sm mb-1">Message Queue</p>
                                            <p className="text-xs text-slate-700">AWS SQS for async processing</p>
                                            <p className="text-xs text-amber-700 mt-1">Rationale: Managed, reliable, FIFO support, PCI-compliant</p>
                                        </div>
                                        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded">
                                            <p className="font-medium text-sm mb-1">Cache Layer</p>
                                            <p className="text-xs text-slate-700">Redis Cluster (ElastiCache)</p>
                                            <p className="text-xs text-cyan-700 mt-1">Rationale: Sub-millisecond latency, rate limiting, session storage</p>
                                        </div>
                                        <div className="p-3 bg-pink-50 border border-pink-200 rounded">
                                            <p className="font-medium text-sm mb-1">Container Orchestration</p>
                                            <p className="text-xs text-slate-700">AWS ECS with Fargate</p>
                                            <p className="text-xs text-pink-700 mt-1">Rationale: Simpler than EKS, serverless, auto-scaling</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Architecture Diagram */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">System Architecture</h3>
                                    <div className="p-6 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto">
                                        <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE WAF/CDN                           │
│              (DDoS Protection, Rate Limiting)                   │
└────────────────┬────────────────────────┬───────────────────────┘
                 │                        │
                 ▼                        ▼
        ┌────────────────┐      ┌────────────────┐
        │ Base44 Portal  │      │ Merchant       │
        │ (Admin/Staff)  │      │ Portal         │
        └────────┬───────┘      └────────┬───────┘
                 │                        │
                 └───────────┬────────────┘
                             │
                             ▼
                 ┌─────────────────────────────────────────┐
                 │    AWS Application Load Balancer        │
                 │           (ALB with SSL)                 │
                 └──────────────────┬──────────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
           ┌──────────┐       ┌──────────┐     ┌──────────┐
           │   ECS    │       │   ECS    │     │   ECS    │
           │  Task 1  │       │  Task 2  │     │  Task 3  │
           │(Go/Fiber)│       │(Go/Fiber)│     │(Go/Fiber)│
           └─────┬────┘       └─────┬────┘     └─────┬────┘
                 │                  │                  │
                 └──────────────────┼──────────────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 ▼                  ▼                  ▼
           ┌──────────┐       ┌──────────┐     ┌──────────┐
           │   SQS    │       │  Redis   │     │   RDS    │
           │  Queue   │       │ Cluster  │     │PostgreSQL│
           │          │       │ (Cache)  │     │          │
           └─────┬────┘       └──────────┘     └─────┬────┘
                 │                                     │
                 ▼                                     ▼
           ┌──────────────────┐            ┌──────────────────┐
           │   Transaction    │            │   Transaction    │
           │   Processors     │            │    Database      │
           │   (Workers)      │            │  (PCI Scope)     │
           └──────────────────┘            └─────┬────────────┘
                                                  │
                                                  ▼
                                           ┌──────────────────┐
                                           │  Operational DB  │
                                           │ (Non-PCI Scope)  │
                                           └──────────────────┘`}</pre>
                                    </div>
                                </div>

                                {/* Technology Stack */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Technology Stack</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-100">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold">Layer</th>
                                                    <th className="text-left p-3 font-semibold">Technology</th>
                                                    <th className="text-left p-3 font-semibold">Justification</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">Frontend</td>
                                                    <td className="p-3">React + Base44</td>
                                                    <td className="p-3 text-slate-600">Rapid development, built-in auth, entity management</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">API Gateway</td>
                                                    <td className="p-3">Cloudflare + ALB</td>
                                                    <td className="p-3 text-slate-600">DDoS protection, WAF, SSL termination, load balancing</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">Backend</td>
                                                    <td className="p-3">Go + Fiber</td>
                                                    <td className="p-3 text-slate-600">Low latency (p99 &lt;200ms), high concurrency (5K TPS/instance)</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">Database</td>
                                                    <td className="p-3">PostgreSQL (RDS)</td>
                                                    <td className="p-3 text-slate-600">ACID compliance, Multi-AZ, point-in-time recovery, Citus sharding path</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">Cache</td>
                                                    <td className="p-3">Redis Cluster</td>
                                                    <td className="p-3 text-slate-600">Sub-ms latency, rate limiting, token storage, session management</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">Queue</td>
                                                    <td className="p-3">AWS SQS</td>
                                                    <td className="p-3 text-slate-600">Managed, reliable, FIFO support, encryption at rest</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">Orchestration</td>
                                                    <td className="p-3">ECS + Fargate</td>
                                                    <td className="p-3 text-slate-600">Serverless containers, easier than EKS, auto-scaling</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">Monitoring</td>
                                                    <td className="p-3">CloudWatch + PagerDuty</td>
                                                    <td className="p-3 text-slate-600">Native AWS integration, real-time alerting, incident management</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium">Security</td>
                                                    <td className="p-3">AWS KMS + WAF</td>
                                                    <td className="p-3 text-slate-600">Encryption key management, PCI-DSS compliance, SQL injection prevention</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Performance Targets */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Performance & SLA Targets</h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
                                            <p className="text-xs text-slate-600 mb-1">Latency (p95)</p>
                                            <p className="text-2xl font-bold text-blue-700">&lt;100ms</p>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
                                            <p className="text-xs text-slate-600 mb-1">Latency (p99)</p>
                                            <p className="text-2xl font-bold text-purple-700">&lt;200ms</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                                            <p className="text-xs text-slate-600 mb-1">Throughput</p>
                                            <p className="text-2xl font-bold text-emerald-700">5K TPS</p>
                                            <p className="text-xs text-slate-500 mt-1">per instance</p>
                                        </div>
                                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-center">
                                            <p className="text-xs text-slate-600 mb-1">Uptime SLA</p>
                                            <p className="text-2xl font-bold text-amber-700">99.95%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* PCI-DSS Scope */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">PCI-DSS Compliance Scope</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded">
                                            <p className="font-bold text-red-900 mb-2">In PCI Scope (Cardholder Data Environment)</p>
                                            <ul className="text-sm text-slate-700 space-y-1">
                                                <li>• ECS Payment Processor (Go/Fiber)</li>
                                                <li>• Transaction Database (RDS - encrypted)</li>
                                                <li>• Redis Cache (if storing tokens)</li>
                                                <li>• ALB (SSL termination)</li>
                                                <li>• AWS KMS (encryption keys)</li>
                                            </ul>
                                            <p className="text-xs text-red-700 mt-3">⚠️ Requires quarterly vulnerability scans, annual penetration testing, strict access controls</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded">
                                            <p className="font-bold text-emerald-900 mb-2">Out of PCI Scope</p>
                                            <ul className="text-sm text-slate-700 space-y-1">
                                                <li>• Base44 Admin Portal (no card data)</li>
                                                <li>• Merchant Portal (tokenized references only)</li>
                                                <li>• Operational Database (aggregated data)</li>
                                                <li>• SQS Queues (encrypted, no raw card data)</li>
                                                <li>• Analytics & reporting systems</li>
                                            </ul>
                                            <p className="text-xs text-emerald-700 mt-3">✓ Reduced compliance burden, faster development iteration</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Component Details */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Component Specifications</h3>
                                    
                                    {/* Cloudflare */}
                                    <div className="mb-4 p-4 bg-slate-50 rounded border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Shield className="h-5 w-5 text-orange-600" />
                                            <h4 className="font-bold">Cloudflare WAF/CDN</h4>
                                            <Badge className="bg-orange-100 text-orange-700">Security Layer</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <p className="font-medium mb-1">DDoS Protection</p>
                                                <p className="text-xs text-slate-600">Layer 3-7 protection, automatic mitigation</p>
                                            </div>
                                            <div>
                                                <p className="font-medium mb-1">WAF Rules</p>
                                                <p className="text-xs text-slate-600">SQL injection, XSS protection, rate limiting per IP/merchant</p>
                                            </div>
                                            <div>
                                                <p className="font-medium mb-1">SSL/TLS</p>
                                                <p className="text-xs text-slate-600">Full (strict) mode, TLS 1.3, automatic cert renewal</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Cost: ~$200/mo (Pro plan)</p>
                                    </div>

                                    {/* AWS ALB */}
                                    <div className="mb-4 p-4 bg-slate-50 rounded border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="h-5 w-5 text-blue-600" />
                                            <h4 className="font-bold">AWS Application Load Balancer</h4>
                                            <Badge className="bg-blue-100 text-blue-700">Traffic Distribution</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <p className="font-medium mb-1">SSL Certificates</p>
                                                <p className="text-xs text-slate-600">AWS Certificate Manager (auto-renewal)</p>
                                            </div>
                                            <div>
                                                <p className="font-medium mb-1">Health Checks</p>
                                                <p className="text-xs text-slate-600">/health endpoint every 30s, 3 consecutive failures = unhealthy</p>
                                            </div>
                                            <div>
                                                <p className="font-medium mb-1">Target Groups</p>
                                                <p className="text-xs text-slate-600">Payment API (8080), Webhooks (8081), connection draining 300s</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Go Payment Processor */}
                                    <div className="mb-4 p-4 bg-slate-50 rounded border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="h-5 w-5 text-purple-600" />
                                            <h4 className="font-bold">Go Payment Processor (Fiber Framework)</h4>
                                            <Badge className="bg-purple-100 text-purple-700">Core Engine</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                                            <div className="p-3 bg-white rounded border">
                                                <p className="font-medium mb-1">Payment API Service</p>
                                                <p className="text-xs text-slate-600">POST /api/v1/authorize, /capture, /refund, /void, /3ds</p>
                                            </div>
                                            <div className="p-3 bg-white rounded border">
                                                <p className="font-medium mb-1">Webhook Service</p>
                                                <p className="text-xs text-slate-600">POST /webhooks/:provider - Provider callbacks, bank notifications</p>
                                            </div>
                                            <div className="p-3 bg-white rounded border">
                                                <p className="font-medium mb-1">Orchestration Service</p>
                                                <p className="text-xs text-slate-600">Internal - Smart routing, MID selection, failover, load balancing</p>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                            <p className="font-medium text-sm mb-2">ECS Configuration (per PSP Instance)</p>
                                            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                                                <div>
                                                    <p>CPU: 2048 (2 vCPU)</p>
                                                    <p>Memory: 4096 (4 GB)</p>
                                                    <p>Port: 8080</p>
                                                    <p>Health Check: /health</p>
                                                </div>
                                                <div>
                                                    <p>Min Tasks: 4</p>
                                                    <p>Max Tasks: 20</p>
                                                    <p>Target CPU: 70%</p>
                                                    <p>Target Memory: 80%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Database */}
                                    <div className="mb-4 p-4 bg-slate-50 rounded border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Building2 className="h-5 w-5 text-emerald-600" />
                                            <h4 className="font-bold">PostgreSQL Database (RDS)</h4>
                                            <Badge className="bg-emerald-100 text-emerald-700">Data Layer</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded">
                                                <p className="font-medium text-sm mb-2">Transaction Database (PCI Scope)</p>
                                                <ul className="text-xs text-slate-700 space-y-1">
                                                    <li>• Instance: db.r6g.2xlarge (8 vCPU, 64GB RAM)</li>
                                                    <li>• Multi-AZ deployment (automatic failover)</li>
                                                    <li>• Encrypted at rest (AES-256, AWS KMS)</li>
                                                    <li>• Automated backups (30-day retention)</li>
                                                    <li>• Point-in-time recovery (5-minute RPO)</li>
                                                </ul>
                                                <p className="text-xs text-emerald-700 mt-2">Cost: ~$600/mo</p>
                                            </div>
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                                                <p className="font-medium text-sm mb-2">Operational Database (Non-PCI)</p>
                                                <ul className="text-xs text-slate-700 space-y-1">
                                                    <li>• Instance: db.r6g.xlarge (4 vCPU, 32GB RAM)</li>
                                                    <li>• Read replica for analytics queries</li>
                                                    <li>• Aggregated data only (no card details)</li>
                                                    <li>• Daily snapshots to S3</li>
                                                    <li>• Faster iteration (no PCI audit requirements)</li>
                                                </ul>
                                                <p className="text-xs text-blue-700 mt-2">Cost: ~$350/mo</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                                            <p className="font-medium text-sm mb-1">Future Scaling: Citus Sharding</p>
                                            <p className="text-xs text-slate-700">When volume exceeds 50K TPS, migrate to Citus (distributed PostgreSQL) for horizontal sharding across nodes</p>
                                        </div>
                                    </div>

                                    {/* Redis Cache */}
                                    <div className="p-4 bg-slate-50 rounded border">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap className="h-5 w-5 text-cyan-600" />
                                            <h4 className="font-bold">Redis Cluster (ElastiCache)</h4>
                                            <Badge className="bg-cyan-100 text-cyan-700">Cache Layer</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <p className="font-medium mb-1">Configuration</p>
                                                <p className="text-xs text-slate-600">4-node cluster (r6g.xlarge), cluster mode enabled, Multi-AZ</p>
                                            </div>
                                            <div>
                                                <p className="font-medium mb-1">Use Cases</p>
                                                <p className="text-xs text-slate-600">Rate limiting, session storage, token cache, routing rules cache</p>
                                            </div>
                                            <div>
                                                <p className="font-medium mb-1">Performance</p>
                                                <p className="text-xs text-slate-600">Sub-millisecond latency, 100K+ ops/sec per node</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">Cost: ~$200/mo</p>
                                    </div>
                                </div>

                                {/* Security Controls */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Security Controls</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-slate-50 rounded border">
                                            <p className="font-bold mb-2">Network Segmentation</p>
                                            <ul className="text-sm text-slate-700 space-y-1">
                                                <li>• Private subnets for all PCI components (no direct internet access)</li>
                                                <li>• NAT Gateway for outbound connections only</li>
                                                <li>• Security groups: Allow only necessary ports (8080, 8081, 5432, 6379)</li>
                                                <li>• VPC flow logs enabled for audit trail</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded border">
                                            <p className="font-bold mb-2">Encryption</p>
                                            <ul className="text-sm text-slate-700 space-y-1">
                                                <li>• TLS 1.3 for all data in transit (API, database connections)</li>
                                                <li>• AES-256 for data at rest (RDS, S3, SQS, ElastiCache)</li>
                                                <li>• AWS KMS for key management (automatic rotation every 90 days)</li>
                                                <li>• Card data tokenized immediately (never stored in plain text)</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded border">
                                            <p className="font-bold mb-2">Access Control</p>
                                            <ul className="text-sm text-slate-700 space-y-1">
                                                <li>• IAM roles (no long-lived access keys)</li>
                                                <li>• MFA required for all admin access</li>
                                                <li>• AWS SSM Session Manager (no SSH keys needed)</li>
                                                <li>• Principle of least privilege (granular IAM policies)</li>
                                                <li>• Audit logging: CloudTrail for all AWS API calls</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Infrastructure Cost */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Infrastructure Cost Breakdown</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-100">
                                                <tr>
                                                    <th className="text-left p-3 font-semibold">Component</th>
                                                    <th className="text-left p-3 font-semibold">Specification</th>
                                                    <th className="text-right p-3 font-semibold">Monthly Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">ECS Tasks</td>
                                                    <td className="p-3 text-slate-600">4x c6g.xlarge (2 vCPU, 4GB each, 24/7)</td>
                                                    <td className="p-3 text-right font-mono">$400</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">RDS Transaction DB</td>
                                                    <td className="p-3 text-slate-600">db.r6g.2xlarge + Multi-AZ (PCI scope)</td>
                                                    <td className="p-3 text-right font-mono">$600</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">RDS Operational DB</td>
                                                    <td className="p-3 text-slate-600">db.r6g.xlarge + Read Replica (non-PCI)</td>
                                                    <td className="p-3 text-right font-mono">$350</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">ElastiCache Redis</td>
                                                    <td className="p-3 text-slate-600">4-node cluster (r6g.xlarge each)</td>
                                                    <td className="p-3 text-right font-mono">$200</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">SQS</td>
                                                    <td className="p-3 text-slate-600">10M requests/month (async processing)</td>
                                                    <td className="p-3 text-right font-mono">$50</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">ALB</td>
                                                    <td className="p-3 text-slate-600">2 load balancers (public + internal)</td>
                                                    <td className="p-3 text-right font-mono">$50</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">Data Transfer</td>
                                                    <td className="p-3 text-slate-600">5TB outbound (API responses, webhooks)</td>
                                                    <td className="p-3 text-right font-mono">$450</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">CloudWatch</td>
                                                    <td className="p-3 text-slate-600">Logs + Metrics + Alarms</td>
                                                    <td className="p-3 text-right font-mono">$100</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">Cloudflare Pro</td>
                                                    <td className="p-3 text-slate-600">WAF + DDoS protection</td>
                                                    <td className="p-3 text-right font-mono">$200</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50">
                                                    <td className="p-3">Backups & Storage</td>
                                                    <td className="p-3 text-slate-600">S3 snapshots, 90-day retention</td>
                                                    <td className="p-3 text-right font-mono">$100</td>
                                                </tr>
                                                <tr className="bg-blue-50 font-bold">
                                                    <td className="p-3" colSpan="2">Total Monthly Infrastructure Cost</td>
                                                    <td className="p-3 text-right text-blue-700 font-mono">~$2,500</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                                            <p className="font-bold text-purple-900 mb-1">At 10K TPS Scale</p>
                                            <p className="text-slate-700">~$5,000/mo (8 ECS tasks, larger RDS instances)</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                                            <p className="font-bold text-amber-900 mb-1">At 50K TPS Scale</p>
                                            <p className="text-slate-700">~$12,000/mo (20 ECS tasks, Citus sharding, larger Redis cluster)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Disaster Recovery */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Disaster Recovery & Business Continuity</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <p className="font-bold text-blue-900 mb-2">Backup Strategy</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• Daily automated RDS snapshots</li>
                                                <li>• 30-day retention period</li>
                                                <li>• Point-in-time recovery (up to 5 min)</li>
                                                <li>• Cross-region backup to us-west-2</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                            <p className="font-bold text-emerald-900 mb-2">Recovery Objectives</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• <strong>RTO:</strong> 1 hour (max downtime)</li>
                                                <li>• <strong>RPO:</strong> 5 minutes (max data loss)</li>
                                                <li>• <strong>Availability:</strong> 99.95% uptime SLA</li>
                                                <li>• <strong>Failover:</strong> Automatic (Multi-AZ)</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="font-bold text-purple-900 mb-2">Incident Response</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• PagerDuty integration</li>
                                                <li>• On-call rotation (24/7)</li>
                                                <li>• Runbooks for common scenarios</li>
                                                <li>• Post-incident reviews (blameless)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Monitoring */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Monitoring & Observability</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded border">
                                            <p className="font-bold mb-2">Application Metrics (CloudWatch)</p>
                                            <ul className="text-xs text-slate-700 space-y-1 font-mono">
                                                <li>• transaction.count (by status, merchant)</li>
                                                <li>• transaction.latency (p50, p95, p99)</li>
                                                <li>• transaction.errors (by error_code)</li>
                                                <li>• routing.decision_time</li>
                                                <li>• cache.hit_rate</li>
                                                <li>• api.requests_per_second</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded border">
                                            <p className="font-bold mb-2">Infrastructure Metrics</p>
                                            <ul className="text-xs text-slate-700 space-y-1 font-mono">
                                                <li>• ecs.cpu_utilization</li>
                                                <li>• ecs.memory_utilization</li>
                                                <li>• rds.connections</li>
                                                <li>• rds.read_iops / rds.write_iops</li>
                                                <li>• redis.cache_hits / redis.cache_misses</li>
                                                <li>• sqs.messages_visible</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                        <p className="font-medium text-sm text-red-900 mb-1">Critical Alerts (PagerDuty)</p>
                                        <ul className="text-xs text-red-800 space-y-1">
                                            <li>• Error rate &gt; 1% for 5 minutes</li>
                                            <li>• Latency p99 &gt; 500ms for 5 minutes</li>
                                            <li>• RDS CPU &gt; 90% for 10 minutes</li>
                                            <li>• Failed health checks (3 consecutive)</li>
                                            <li>• Fraud detection service down</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Marketplace Integration */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-blue-600">
                                    <h3 className="font-bold text-lg mb-3">Marketplace Architecture Integration</h3>
                                    <p className="text-sm text-slate-700 mb-3">
                                        This technical stack supports the FTS.Money marketplace model:
                                    </p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="font-medium mb-1">Multi-Tenancy Support</p>
                                            <p className="text-xs text-slate-600">Each PSP instance gets dedicated ECS tasks but shares control plane infrastructure (provider pool, payout routes, service registry)</p>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-1">Service Isolation</p>
                                            <p className="text-xs text-slate-600">Marketplace services (KYB, AML, LEI) called via internal API from PSP instances, usage metered per call</p>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-1">Provider Pool Routing</p>
                                            <p className="text-xs text-slate-600">Go orchestration service queries global provider pool (PostgreSQL), routes to optimal provider based on PSP tier</p>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-1">Usage Metering</p>
                                            <p className="text-xs text-slate-600">Every service call logged to ServiceUsageMetric entity (async via SQS), aggregated for billing</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Marketplace-Specific Technical Components */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Marketplace Technical Components</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
                                    <h4 className="font-bold text-purple-900 mb-3">Service Registry & Discovery</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="font-medium mb-1">Implementation</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• ServiceCatalog entity (PostgreSQL)</li>
                                                <li>• Redis cache for fast lookups</li>
                                                <li>• REST API: GET /marketplace/services</li>
                                                <li>• GraphQL for complex queries</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-1">Performance</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• Catalog lookup: &lt;10ms (cached)</li>
                                                <li>• Service discovery: &lt;50ms</li>
                                                <li>• Cache TTL: 5 minutes</li>
                                                <li>• Invalidation on service updates</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                                    <h4 className="font-bold text-blue-900 mb-3">Usage Metering Pipeline</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="p-3 bg-white rounded border">
                                            <p className="font-medium mb-1">1. Service Call Interception</p>
                                            <p className="text-xs text-slate-600">Middleware in Go processor logs every marketplace service call (KYB check, routing decision, etc.)</p>
                                        </div>
                                        <div className="p-3 bg-white rounded border">
                                            <p className="font-medium mb-1">2. Async Logging</p>
                                            <p className="text-xs text-slate-600">Usage event pushed to SQS queue (non-blocking, &lt;1ms overhead)</p>
                                        </div>
                                        <div className="p-3 bg-white rounded border">
                                            <p className="font-medium mb-1">3. Metric Aggregation</p>
                                            <p className="text-xs text-slate-600">Background worker consumes SQS, writes to ServiceUsageMetric entity</p>
                                        </div>
                                        <div className="p-3 bg-white rounded border">
                                            <p className="font-medium mb-1">4. Billing Generation</p>
                                            <p className="text-xs text-slate-600">Nightly cron job aggregates usage, generates ServiceInvoice entities</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded">
                                    <h4 className="font-bold text-emerald-900 mb-3">Service API Gateway Pattern</h4>
                                    <p className="text-sm text-slate-700 mb-3">Unified API abstraction for marketplace services</p>
                                    <div className="p-3 bg-white rounded border font-mono text-xs">
                                        <p className="text-blue-600">// PSP calls marketplace service</p>
                                        <p className="text-slate-800">POST /marketplace/invoke</p>
                                        <p className="text-slate-600">{'{'}</p>
                                        <p className="text-slate-600 ml-4">"psp_id": "psp_abc123",</p>
                                        <p className="text-slate-600 ml-4">"service_id": "trulioo_kyb",</p>
                                        <p className="text-slate-600 ml-4">"method": "verify_business",</p>
                                        <p className="text-slate-600 ml-4">"params": {'{ "business_name": "...", "country": "US" }'}</p>
                                        <p className="text-slate-600">{'}'}</p>
                                        <p className="mt-2 text-emerald-600">// FTS Gateway routes to provider</p>
                                        <p className="text-slate-800">→ Lookup service endpoint from ServiceCatalog</p>
                                        <p className="text-slate-800">→ Authenticate with provider OAuth token</p>
                                        <p className="text-slate-800">→ Call provider API</p>
                                        <p className="text-slate-800">→ Log usage to SQS</p>
                                        <p className="text-slate-800">→ Return response to PSP</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* COMPONENTS */}
                    <TabsContent value="components" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Categories & Providers</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Payment Infrastructure */}
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                        Payment Infrastructure Services
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Card Processing Rails</p>
                                            <p className="text-xs text-slate-600">Providers: Visa, Mastercard, Amex, Discover</p>
                                            <p className="text-xs text-slate-600">Pricing: 2.5-2.9% + $0.20-0.30</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Acquirer Services</p>
                                            <p className="text-xs text-slate-600">Providers: Stripe, Adyen, Checkout.com, local acquirers</p>
                                            <p className="text-xs text-slate-600">Pricing: Custom negotiations</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Alternative Payment Methods</p>
                                            <p className="text-xs text-slate-600">Providers: PayPal, Alipay, WeChat Pay, Klarna, local APMs</p>
                                            <p className="text-xs text-slate-600">Pricing: 1.5-3.5% per transaction</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Crypto Infrastructure</p>
                                            <p className="text-xs text-slate-600">Providers: Coinbase Commerce, Fireblocks, local exchanges</p>
                                            <p className="text-xs text-slate-600">Pricing: 1-2% + network fees</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Instant Payment Rails</p>
                                            <p className="text-xs text-slate-600">Providers: FedNow, PIX, UPI, Faster Payments, SEPA Instant</p>
                                            <p className="text-xs text-slate-600">Pricing: 0.5-1% per transaction</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Banking-as-a-Service</p>
                                            <p className="text-xs text-slate-600">Providers: Solarisbank, Railsbank, Stripe Treasury</p>
                                            <p className="text-xs text-slate-600">Pricing: Monthly + transaction fees</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Compliance Services */}
                                <div className="border-l-4 border-purple-500 pl-4">
                                    <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-purple-600" />
                                        Compliance & Identity Services
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">KYB/KYC Verification</p>
                                            <p className="text-xs text-slate-600">Providers: Trulioo, Jumio, Onfido, IDnow, Persona</p>
                                            <p className="text-xs text-slate-600">Pricing: $2-8 per check (tiered by depth)</p>
                                            <p className="text-xs text-blue-600 mt-1">Strategy: Multi-provider with routing rules</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">AML Screening</p>
                                            <p className="text-xs text-slate-600">Providers: ComplyAdvantage, Chainalysis, Elliptic, World-Check</p>
                                            <p className="text-xs text-slate-600">Pricing: $0.50-5 per check + monitoring fees</p>
                                            <p className="text-xs text-blue-600 mt-1">Strategy: Crypto vs Fiat specialized providers</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">LEI/vLEI Services</p>
                                            <p className="text-xs text-slate-600">Providers: GLEIF-accredited RAs (Bloomberg, Refinitiv, local RAs)</p>
                                            <p className="text-xs text-slate-600">Pricing: $50-200 issuance, $50-100 annual renewal</p>
                                            <p className="text-xs text-blue-600 mt-1">Strategy: Geographic coverage selection</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Fraud Detection</p>
                                            <p className="text-xs text-slate-600">Providers: Sift, Kount, Forter, Riskified, FTS AI</p>
                                            <p className="text-xs text-slate-600">Pricing: $0.01-0.10 per transaction</p>
                                            <p className="text-xs text-blue-600 mt-1">Strategy: ML-based with human review escalation</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Document Verification</p>
                                            <p className="text-xs text-slate-600">Providers: Onfido, Jumio, AU10TIX, FTS AI OCR</p>
                                            <p className="text-xs text-slate-600">Pricing: $2-6 per document</p>
                                            <p className="text-xs text-blue-600 mt-1">Strategy: AI first, human review fallback</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">3DS Authentication</p>
                                            <p className="text-xs text-slate-600">Providers: Visa, Mastercard 3DS servers, Cardinal Commerce</p>
                                            <p className="text-xs text-slate-600">Pricing: $0.05-0.15 per authentication</p>
                                            <p className="text-xs text-blue-600 mt-1">Strategy: Integrated with card rails</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Services */}
                                <div className="border-l-4 border-emerald-500 pl-4">
                                    <h3 className="font-bold mb-2 flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-emerald-600" />
                                        Advanced Platform Services (FTS-Owned)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Payment Orchestration</p>
                                            <p className="text-xs text-slate-600">Smart routing, MID routing, cascade logic, load balancing</p>
                                            <p className="text-xs text-emerald-700">$500/mo + 0.05% per routed transaction</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">AI Fraud Suite</p>
                                            <p className="text-xs text-slate-600">ML scoring, network tokenization, account updater, 3DS orchestration</p>
                                            <p className="text-xs text-emerald-700">$1,000/mo + $0.10 per check</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Crypto Gateway</p>
                                            <p className="text-xs text-slate-600">Multi-chain support, on/off ramp, custody integration, compliance</p>
                                            <p className="text-xs text-emerald-700">$2,000/mo + 1% per crypto transaction</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Advanced Analytics</p>
                                            <p className="text-xs text-slate-600">BI dashboards, predictive analytics, merchant insights, benchmarking</p>
                                            <p className="text-xs text-emerald-700">$750/mo</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Sub-Merchant Platform</p>
                                            <p className="text-xs text-slate-600">Split payments, marketplace infrastructure, automated payouts</p>
                                            <p className="text-xs text-emerald-700">$1,500/mo + 0.5% per split</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Developer API Suite</p>
                                            <p className="text-xs text-slate-600">Unified API, webhooks, SDKs, sandbox, documentation</p>
                                            <p className="text-xs text-emerald-700">$300/mo + usage tiers</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* STAKEHOLDERS */}
                    <TabsContent value="stakeholders" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Stakeholder Onboarding & Integration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Service Providers */}
                                <div>
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        Service Provider Onboarding
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-700 font-bold text-sm">1</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">Company Registration</p>
                                                <p className="text-xs text-slate-600">Legal entity verification, funding details (Pre-Seed, Series A, etc.), contact information, organization structure</p>
                                                <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                                                    <strong>Required Documents:</strong> Business registration, tax ID, proof of financial services license (if applicable), insurance certificates
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-700 font-bold text-sm">2</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">Service Submission</p>
                                                <p className="text-xs text-slate-600">Service description, API documentation, pricing model, SLA commitments, security certifications</p>
                                                <div className="mt-2 p-2 bg-slate-50 rounded text-xs">
                                                    <strong>API Requirements:</strong> RESTful API, OpenAPI spec, authentication (OAuth 2.0), webhook support, rate limiting disclosure
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-blue-700 font-bold text-sm">3</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">FTS Certification Process</p>
                                                <p className="text-xs text-slate-600">Technical review, security audit, compliance verification, performance benchmarks, approval</p>
                                                <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
                                                    <div className="p-2 bg-blue-50 rounded text-center">
                                                        <p className="font-bold text-blue-700">7-14 days</p>
                                                        <p className="text-blue-600">Review Time</p>
                                                    </div>
                                                    <div className="p-2 bg-emerald-50 rounded text-center">
                                                        <p className="font-bold text-emerald-700">99.9%</p>
                                                        <p className="text-emerald-600">Min Uptime</p>
                                                    </div>
                                                    <div className="p-2 bg-purple-50 rounded text-center">
                                                        <p className="font-bold text-purple-700">&lt;500ms</p>
                                                        <p className="text-purple-600">Max Latency</p>
                                                    </div>
                                                    <div className="p-2 bg-amber-50 rounded text-center">
                                                        <p className="font-bold text-amber-700">SOC 2</p>
                                                        <p className="text-amber-600">Required</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">Go Live</p>
                                                <p className="text-xs text-slate-600">Service listed in marketplace, PSPs can subscribe, usage metering active, revenue sharing begins</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Banks & Financial Institutions */}
                                <div className="mt-6">
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-purple-600" />
                                        Bank & Financial Institution Onboarding
                                    </h3>
                                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                        <p className="text-sm mb-3"><strong>Special Category:</strong> Banks require enhanced due diligence</p>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <p className="font-medium mb-1">Required Certifications:</p>
                                                <ul className="space-y-1 text-slate-700">
                                                    <li>• Banking license verification</li>
                                                    <li>• Regulatory approval (Fed, ECB, local)</li>
                                                    <li>• Proof of deposit insurance</li>
                                                    <li>• Anti-fraud systems certification</li>
                                                    <li>• ISO 20022 compliance (for settlements)</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="font-medium mb-1">Services Banks Can Offer:</p>
                                                <ul className="space-y-1 text-slate-700">
                                                    <li>• Merchant settlement accounts</li>
                                                    <li>• SWIFT/SEPA connectivity</li>
                                                    <li>• Instant payment rails</li>
                                                    <li>• Treasury services</li>
                                                    <li>• Foreign exchange</li>
                                                    <li>• Credit lines for merchants</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="mt-6">
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-amber-600" />
                                        Payment Method Provider Onboarding
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                                            <p className="font-medium mb-1">Wallet Providers</p>
                                            <p className="text-xs text-slate-700">PayPal, Apple Pay, Google Pay, Alipay, WeChat Pay</p>
                                            <p className="text-xs text-amber-700 mt-2">Integration: OAuth + API keys</p>
                                        </div>
                                        <div className="p-3 bg-pink-50 border border-pink-200 rounded">
                                            <p className="font-medium mb-1">BNPL Providers</p>
                                            <p className="text-xs text-slate-700">Klarna, Afterpay, Affirm, Zip, local BNPL</p>
                                            <p className="text-xs text-pink-700 mt-2">Integration: Widget + callback API</p>
                                        </div>
                                        <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                                            <p className="font-medium mb-1">Crypto Exchanges</p>
                                            <p className="text-xs text-slate-700">Coinbase, Binance, Kraken, local exchanges</p>
                                            <p className="text-xs text-orange-700 mt-2">Integration: API + wallet addresses</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Merchant Onboarding Placement */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Merchant Onboarding Architecture</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 border-l-4 border-blue-600">
                                        <p className="font-bold text-blue-900 mb-2">WHERE: PSP Portal (Orchestrator)</p>
                                        <p className="text-sm text-blue-800">The PSP Portal remains the interface where merchants apply, but it orchestrates all verification services from the marketplace.</p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-3">Complete Merchant Onboarding Workflow</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border">
                                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">Business Information Collection</p>
                                                    <p className="text-xs text-slate-600">PSP Portal collects: Legal name, trading name, address, tax ID, business type, website, MCC</p>
                                                </div>
                                                <Badge variant="outline">PSP Portal</Badge>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">2</div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">KYB Verification Service</p>
                                                    <p className="text-xs text-slate-600">Calls: Trulioo Global Business Verification API</p>
                                                    <p className="text-xs text-purple-700 mt-1">Cost: $5 per check → PSP billed via marketplace</p>
                                                </div>
                                                <Badge className="bg-purple-100 text-purple-700">Marketplace Service</Badge>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">3</div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">Document Verification Service</p>
                                                    <p className="text-xs text-slate-600">Calls: Onfido Document Verification + Liveness Check</p>
                                                    <p className="text-xs text-purple-700 mt-1">Cost: $8 per verification → PSP billed</p>
                                                </div>
                                                <Badge className="bg-purple-100 text-purple-700">Marketplace Service</Badge>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">4</div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">LEI Issuance (for large merchants)</p>
                                                    <p className="text-xs text-slate-600">Calls: GLEIF-accredited RA (Bloomberg, Refinitiv, or regional provider)</p>
                                                    <p className="text-xs text-purple-700 mt-1">Cost: $150 issuance + $75/year renewal → Passed to merchant</p>
                                                </div>
                                                <Badge className="bg-purple-100 text-purple-700">Marketplace Service</Badge>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">5</div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">AML Screening Service</p>
                                                    <p className="text-xs text-slate-600">Calls: ComplyAdvantage Watchlist Screening + Ongoing Monitoring</p>
                                                    <p className="text-xs text-purple-700 mt-1">Cost: $2 initial + $25/mo monitoring → PSP billed</p>
                                                </div>
                                                <Badge className="bg-purple-100 text-purple-700">Marketplace Service</Badge>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded border border-purple-200">
                                                <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">6</div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">Risk Assessment Service</p>
                                                    <p className="text-xs text-slate-600">Calls: FTS AI Risk Scoring Engine (analyzes all above data)</p>
                                                    <p className="text-xs text-purple-700 mt-1">Cost: $1 per assessment → Included in PSP tier</p>
                                                </div>
                                                <Badge className="bg-emerald-100 text-emerald-700">FTS Service</Badge>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded border border-emerald-200">
                                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">7</div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">PSP Decision & Activation</p>
                                                    <p className="text-xs text-slate-600">PSP reviews aggregated results and approves/rejects merchant</p>
                                                    <p className="text-xs text-emerald-700 mt-1">Total cost: ~$166 → PSP can pass to merchant as onboarding fee</p>
                                                </div>
                                                <Badge variant="outline">PSP Portal</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* LEI/vLEI Deep Dive */}
                                <div>
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                        LEI/vLEI Issuance & Verification Strategy
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded border">
                                            <p className="font-medium mb-2">Community Marketplace Approach</p>
                                            <p className="text-xs text-slate-700 mb-3">Multiple GLEIF-accredited RAs register as service providers</p>
                                            <div className="space-y-2 text-xs">
                                                <div className="flex justify-between items-center p-2 bg-white rounded">
                                                    <span>Bloomberg LEI Service (Global)</span>
                                                    <span className="font-mono">$180</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-white rounded">
                                                    <span>Refinitiv LEI (Americas)</span>
                                                    <span className="font-mono">$150</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-white rounded">
                                                    <span>London Stock Exchange (EU)</span>
                                                    <span className="font-mono">$165</span>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-white rounded">
                                                    <span>DTCC LEI (US)</span>
                                                    <span className="font-mono">$140</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-blue-600 mt-3">PSPs choose provider based on merchant location, cost, and speed</p>
                                        </div>

                                        <div className="p-4 bg-blue-50 rounded border border-blue-200">
                                            <p className="font-medium mb-2">vLEI (Verifiable LEI) Integration</p>
                                            <p className="text-xs text-slate-700 mb-3">Blockchain-based digital credential verification</p>
                                            <div className="space-y-2 text-xs">
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">Issuance Flow:</p>
                                                    <p className="text-slate-600">1. Traditional LEI issued<br/>2. vLEI credential created on blockchain<br/>3. Merchant downloads digital wallet<br/>4. Instant verification for future transactions</p>
                                                </div>
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">Pricing Model:</p>
                                                    <p className="text-slate-600">• vLEI issuance: +$50 to LEI cost<br/>• Verification: $5 per check<br/>• Annual renewal: $60</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                                        <p className="text-xs"><strong>FTS.Money Opportunity:</strong> Consider becoming a GLEIF-accredited RA yourself. One-time accreditation cost ~$50K, but then you control the entire LEI issuance workflow and keep 100% of fees (not just 15-20% commission).</p>
                                    </div>
                                </div>

                                {/* Crypto Provider Onboarding */}
                                <div className="mt-6">
                                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-orange-600" />
                                        Crypto Infrastructure Provider Onboarding
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                        <div className="p-3 bg-orange-50 rounded border border-orange-200">
                                            <p className="font-medium mb-1">Crypto Exchanges</p>
                                            <p className="text-xs text-slate-700 mb-2">On/Off Ramp Services</p>
                                            <p className="text-xs text-slate-600">Coinbase Commerce, Binance Pay, Kraken, local exchanges</p>
                                            <p className="text-xs text-orange-700 mt-2">Required: Exchange license, AML compliance, custody insurance</p>
                                        </div>
                                        <div className="p-3 bg-orange-50 rounded border border-orange-200">
                                            <p className="font-medium mb-1">Custody Providers</p>
                                            <p className="text-xs text-slate-700 mb-2">Wallet Infrastructure</p>
                                            <p className="text-xs text-slate-600">Fireblocks, BitGo, Anchorage, Copper</p>
                                            <p className="text-xs text-orange-700 mt-2">Required: SOC 2, insurance policy, multi-sig setup</p>
                                        </div>
                                        <div className="p-3 bg-orange-50 rounded border border-orange-200">
                                            <p className="font-medium mb-1">Blockchain Analytics</p>
                                            <p className="text-xs text-slate-700 mb-2">Transaction Monitoring</p>
                                            <p className="text-xs text-slate-600">Chainalysis, Elliptic, TRM Labs</p>
                                            <p className="text-xs text-orange-700 mt-2">Required: Coverage across 20+ chains</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Community Members */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Community Member Types</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <p className="font-bold text-sm mb-1">FinTech</p>
                                        <p className="text-xs text-slate-600">PSP operators, payment companies, financial institutions</p>
                                        <p className="text-xs text-blue-700 mt-2">Can: Subscribe to services, participate in challenges</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center mb-2">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        <p className="font-bold text-sm mb-1">Developer</p>
                                        <p className="text-xs text-slate-600">Technical integrators, API consumers, solution builders</p>
                                        <p className="text-xs text-purple-700 mt-2">Can: Build apps, join hackathons, access APIs</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-2">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <p className="font-bold text-sm mb-1">Influencer</p>
                                        <p className="text-xs text-slate-600">Industry experts, consultants, advisors, content creators</p>
                                        <p className="text-xs text-emerald-700 mt-2">Can: Share insights, mentor, boost fluidity score</p>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center mb-2">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <p className="font-bold text-sm mb-1">Service Provider</p>
                                        <p className="text-xs text-slate-600">Companies offering marketplace services</p>
                                        <p className="text-xs text-amber-700 mt-2">Can: List services, earn revenue, analytics dashboard</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* MONETIZATION */}
                    <TabsContent value="monetization" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-600" />
                                    Revenue Model & Projections
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Revenue Streams */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Five Revenue Streams</h3>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-blue-900">Stream 1: PSP Platform Subscriptions</p>
                                                <Badge className="bg-blue-600 text-white">Primary Revenue</Badge>
                                            </div>
                                            <div className="grid grid-cols-4 gap-3 text-xs">
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">Starter Tier</p>
                                                    <p className="text-blue-700 font-bold">$2,000/mo</p>
                                                    <p className="text-slate-600">+ 30% revenue share</p>
                                                </div>
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">Professional</p>
                                                    <p className="text-blue-700 font-bold">$5,000/mo</p>
                                                    <p className="text-slate-600">+ 25% revenue share</p>
                                                </div>
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">Enterprise</p>
                                                    <p className="text-blue-700 font-bold">$10,000/mo</p>
                                                    <p className="text-slate-600">+ 20% revenue share</p>
                                                </div>
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">Custom</p>
                                                    <p className="text-blue-700 font-bold">Custom</p>
                                                    <p className="text-slate-600">+ 15% revenue share</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-purple-900">Stream 2: FTS-Owned Service Subscriptions</p>
                                                <Badge className="bg-purple-600 text-white">High Margin</Badge>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 text-xs">
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">Payment Orchestration</p>
                                                    <p className="text-purple-700 font-bold">$500/mo</p>
                                                    <p className="text-slate-600">+ 0.05% per transaction</p>
                                                </div>
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">AI Fraud Suite</p>
                                                    <p className="text-purple-700 font-bold">$1,000/mo</p>
                                                    <p className="text-slate-600">+ $0.10 per check</p>
                                                </div>
                                                <div className="p-2 bg-white rounded">
                                                    <p className="font-medium">Crypto Gateway</p>
                                                    <p className="text-purple-700 font-bold">$2,000/mo</p>
                                                    <p className="text-slate-600">+ 1% per crypto tx</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-emerald-900">Stream 3: Marketplace Commissions (3rd-party)</p>
                                                <Badge className="bg-emerald-600 text-white">Scalable</Badge>
                                            </div>
                                            <p className="text-xs text-slate-700 mb-2">15-25% commission on all 3rd-party service subscriptions</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div className="p-2 bg-white rounded">
                                                    <p className="text-slate-600">KYB check ($5)</p>
                                                    <p className="text-emerald-700 font-bold">FTS earns: $1</p>
                                                </div>
                                                <div className="p-2 bg-white rounded">
                                                    <p className="text-slate-600">LEI issuance ($150)</p>
                                                    <p className="text-emerald-700 font-bold">FTS earns: $30</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-amber-50 border-l-4 border-amber-600 rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-amber-900">Stream 4: Premium Community Memberships</p>
                                                <Badge className="bg-amber-600 text-white">Engagement</Badge>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="p-2 bg-white rounded text-center">
                                                    <p className="font-medium">Basic</p>
                                                    <p className="text-amber-700 font-bold">Free</p>
                                                </div>
                                                <div className="p-2 bg-white rounded text-center">
                                                    <p className="font-medium">Influencer</p>
                                                    <p className="text-amber-700 font-bold">$99/mo</p>
                                                </div>
                                                <div className="p-2 bg-white rounded text-center">
                                                    <p className="font-medium">Provider</p>
                                                    <p className="text-amber-700 font-bold">$499/mo</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-cyan-50 border-l-4 border-cyan-600 rounded">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-bold text-cyan-900">Stream 5: Transaction & Usage Fees</p>
                                                <Badge className="bg-cyan-600 text-white">Variable</Badge>
                                            </div>
                                            <p className="text-xs text-slate-700">Micro-charges on high-volume services (routing, fraud checks, API calls)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue Projections */}
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Revenue Projections (100 PSPs)</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-50 rounded border">
                                            <p className="font-medium mb-3">Monthly Recurring Revenue</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>PSP Subscriptions (100 PSPs × $5k avg)</span>
                                                    <span className="font-bold">$500,000</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>FTS Service Add-ons (avg 3 × $1k)</span>
                                                    <span className="font-bold">$300,000</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Marketplace Commissions (3rd-party)</span>
                                                    <span className="font-bold">$60,000</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Community Memberships (200 × $99)</span>
                                                    <span className="font-bold">$20,000</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t-2 border-slate-300 font-bold text-lg">
                                                    <span>Total MRR</span>
                                                    <span className="text-emerald-600">$880,000</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-xl">
                                                    <span>Annual Run Rate</span>
                                                    <span className="text-blue-600">$10.56M</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
                                            <p className="font-medium mb-3">Revenue Share Income</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>PSP Transaction Revenue (avg 25%)</span>
                                                    <span className="font-bold">Variable</span>
                                                </div>
                                                <div className="p-3 bg-white rounded mt-2">
                                                    <p className="text-xs text-slate-600 mb-2">Example Scenario:</p>
                                                    <p className="text-xs">100 PSPs × $10M monthly volume = $1B</p>
                                                    <p className="text-xs">Avg merchant fee: 2.7% = $27M merchant fees</p>
                                                    <p className="text-xs">FTS revenue share (25%): <strong className="text-emerald-700">$6.75M/mo</strong></p>
                                                    <p className="text-xs font-bold text-emerald-700 mt-2">+ $81M annually from revenue share alone</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                                        <p className="text-sm mb-2">Total Annual Revenue Potential</p>
                                        <p className="text-4xl font-bold">$91M+</p>
                                        <p className="text-xs mt-1 opacity-90">With 100 PSPs at $10M monthly volume each</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Commission Structure */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Marketplace Commission Structure</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <h4 className="font-semibold">FTS-Owned Services</h4>
                                        <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-sm">
                                            <p className="font-medium mb-1">100% Revenue to FTS</p>
                                            <p className="text-xs text-slate-700">No revenue sharing - full margin capture</p>
                                            <p className="text-xs text-emerald-700 mt-2">Examples: Payment Orchestration, AI Fraud Suite, Crypto Gateway, Advanced Analytics</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="font-semibold">3rd-Party Services</h4>
                                        <div className="space-y-2">
                                            <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                                                <p className="font-medium mb-1">Standard Commission: 20%</p>
                                                <p className="text-xs text-slate-700">For most marketplace services</p>
                                            </div>
                                            <div className="p-3 bg-purple-50 rounded border border-purple-200 text-sm">
                                                <p className="font-medium mb-1">Strategic Partners: 15%</p>
                                                <p className="text-xs text-slate-700">For high-volume providers (Trulioo, ComplyAdvantage)</p>
                                            </div>
                                            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-sm">
                                                <p className="font-medium mb-1">Premium Listing: +$500-2,000/year</p>
                                                <p className="text-xs text-slate-700">Featured placement in marketplace</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fluidity Index Monetization */}
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-3">Fluidity Index Gamification</h4>
                                    <p className="text-sm text-slate-700 mb-3">Engagement scoring system that drives platform activity and unlocks benefits</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-3 bg-slate-50 rounded border">
                                            <p className="font-medium text-sm mb-2">Score Components</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• Transaction Volume (40%)</li>
                                                <li>• Community Engagement (20%)</li>
                                                <li>• ESG Impact (15%)</li>
                                                <li>• Innovation Index (15%)</li>
                                                <li>• Compliance Score (10%)</li>
                                            </ul>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded border">
                                            <p className="font-medium text-sm mb-2">Score Benefits</p>
                                            <ul className="text-xs text-slate-700 space-y-1">
                                                <li>• 0-30: Basic member</li>
                                                <li>• 31-60: Featured in directory</li>
                                                <li>• 61-80: Priority support</li>
                                                <li>• 81-100: VIP tier (reduced fees)</li>
                                            </ul>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded border border-blue-200">
                                            <p className="font-medium text-sm mb-2">Monetization Impact</p>
                                            <ul className="text-xs text-blue-700 space-y-1">
                                                <li>• Higher scores = more visibility</li>
                                                <li>• Members pay to boost score</li>
                                                <li>• Leaderboards drive competition</li>
                                                <li>• Unlocks premium features</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* EXECUTION */}
                    <TabsContent value="execution" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    5-Phase Execution Roadmap
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Phase 1 */}
                                <div className="border-l-4 border-blue-600 pl-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg">Phase 1: Control Plane Service Architecture</h3>
                                        <Badge className="bg-blue-100 text-blue-700">Weeks 1-2</Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Service Registry Entity</p>
                                                <p className="text-xs text-slate-600">ServiceCatalog, ServiceProvider, ServiceVersion, ServicePricing</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">PSP Service Subscription Entity</p>
                                                <p className="text-xs text-slate-600">Track which PSP has what services enabled</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Usage Metering Foundation</p>
                                                <p className="text-xs text-slate-600">ServiceUsageMetric entity for billing</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Enhanced Provider & Payout Pools</p>
                                                <p className="text-xs text-slate-600">Already completed ✓</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 2 */}
                                <div className="border-l-4 border-purple-600 pl-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg">Phase 2: Core Services Migration</h3>
                                        <Badge className="bg-purple-100 text-purple-700">Weeks 3-4</Badge>
                                    </div>
                                    <p className="text-sm text-slate-700 mb-3">Migrate 7 flagship features from PSP Portal to FTS Services</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 bg-slate-50 rounded">✓ Payment Orchestration Service</div>
                                        <div className="p-2 bg-slate-50 rounded">✓ AI Fraud Detection Suite</div>
                                        <div className="p-2 bg-slate-50 rounded">✓ Crypto Gateway Service</div>
                                        <div className="p-2 bg-slate-50 rounded">✓ Advanced Analytics Service</div>
                                        <div className="p-2 bg-slate-50 rounded">✓ Compliance Automation Service</div>
                                        <div className="p-2 bg-slate-50 rounded">✓ Sub-Merchant Platform Service</div>
                                        <div className="p-2 bg-slate-50 rounded">✓ Developer API Suite</div>
                                    </div>
                                </div>

                                {/* Phase 3 */}
                                <div className="border-l-4 border-emerald-600 pl-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg">Phase 3: Marketplace Foundation</h3>
                                        <Badge className="bg-emerald-100 text-emerald-700">Weeks 5-7</Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold">1</div>
                                            <p>Service catalog UI (browse, search, filter)</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold">2</div>
                                            <p>Provider registration portal</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold">3</div>
                                            <p>PSP subscription interface (1-click enable/disable)</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold">4</div>
                                            <p>Basic billing integration (usage tracking → invoice)</p>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 rounded bg-emerald-200 flex items-center justify-center text-emerald-700 text-xs font-bold">5</div>
                                            <p>Service certification workflow (FTS approval process)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 4 */}
                                <div className="border-l-4 border-amber-600 pl-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg">Phase 4: Community Features</h3>
                                        <Badge className="bg-amber-100 text-amber-700">Weeks 8-10</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Member Profiles</p>
                                            <p className="text-xs text-slate-600">Roles: FinTech, Developer, Influencer, Provider</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Fluidity Index</p>
                                            <p className="text-xs text-slate-600">Gamification scoring, leaderboards, badges</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Challenges & Hackathons</p>
                                            <p className="text-xs text-slate-600">AI competitions, innovation contests, prizes</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded">
                                            <p className="font-medium mb-1">Discussion Forums</p>
                                            <p className="text-xs text-slate-600">Knowledge sharing, Q&A, best practices</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 5 */}
                                <div className="border-l-4 border-cyan-600 pl-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg">Phase 5: Partner Ecosystem Opening</h3>
                                        <Badge className="bg-cyan-100 text-cyan-700">Month 4+</Badge>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p className="text-slate-700">Open marketplace to vetted 3rd-party service providers</p>
                                        <div className="p-3 bg-cyan-50 rounded border border-cyan-200">
                                            <p className="font-medium mb-2">Initial Partner Targets:</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <p className="font-medium text-cyan-900">KYB/KYC:</p>
                                                    <p className="text-slate-700">Trulioo, Jumio, Onfido, Persona</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-cyan-900">AML:</p>
                                                    <p className="text-slate-700">ComplyAdvantage, Chainalysis, Elliptic</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-cyan-900">LEI:</p>
                                                    <p className="text-slate-700">Bloomberg, Refinitiv, DTCC, regional RAs</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-cyan-900">Fraud:</p>
                                                    <p className="text-slate-700">Sift, Kount, Forter, Riskified</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-cyan-900">Crypto:</p>
                                                    <p className="text-slate-700">Coinbase, Fireblocks, BitGo</p>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-cyan-900">Payments:</p>
                                                    <p className="text-slate-700">Local APMs, instant payment providers</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Summary */}
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                    <h4 className="font-bold mb-3">Complete Timeline</h4>
                                    <div className="grid grid-cols-5 gap-2 text-xs text-center">
                                        <div className="p-2 bg-white rounded border border-blue-200">
                                            <p className="font-bold text-blue-700">Weeks 1-2</p>
                                            <p className="text-slate-600">Control Plane</p>
                                        </div>
                                        <div className="p-2 bg-white rounded border border-purple-200">
                                            <p className="font-bold text-purple-700">Weeks 3-4</p>
                                            <p className="text-slate-600">Service Migration</p>
                                        </div>
                                        <div className="p-2 bg-white rounded border border-emerald-200">
                                            <p className="font-bold text-emerald-700">Weeks 5-7</p>
                                            <p className="text-slate-600">Marketplace</p>
                                        </div>
                                        <div className="p-2 bg-white rounded border border-amber-200">
                                            <p className="font-bold text-amber-700">Weeks 8-10</p>
                                            <p className="text-slate-600">Community</p>
                                        </div>
                                        <div className="p-2 bg-white rounded border border-cyan-200">
                                            <p className="font-bold text-cyan-700">Month 4+</p>
                                            <p className="text-slate-600">Partners</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Technical Requirements */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Technical Requirements Per Phase</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded border">
                                        <p className="font-bold mb-2">Phase 1 Deliverables</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="font-medium text-xs text-slate-500 mb-1">NEW ENTITIES</p>
                                                <ul className="text-xs space-y-1">
                                                    <li>• ServiceCatalog</li>
                                                    <li>• ServiceProvider</li>
                                                    <li>• PSPServiceSubscription</li>
                                                    <li>• ServiceUsageMetric</li>
                                                </ul>
                                            </div>
                                            <div>
                                               <p className="font-medium text-xs text-slate-500 mb-1">NEW PAGES</p>
                                               <ul className="text-xs space-y-1">
                                                   <li>✓ FTSProviderPool (completed)</li>
                                                   <li>✓ FTSPayoutRoutes (completed)</li>
                                                   <li>✓ FTSFeeTemplates (completed)</li>
                                                   <li>✓ FTSServiceManager (completed)</li>
                                                   <li>✓ EnhancedAuditLogs (completed)</li>
                                                   <li>✓ DataRetentionManagement (completed)</li>
                                                   <li>✓ XeroIntegration (completed)</li>
                                               </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded border">
                                        <p className="font-bold mb-2">Phase 3 Deliverables (Marketplace)</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="font-medium text-xs text-slate-500 mb-1">NEW ENTITIES</p>
                                                <ul className="text-xs space-y-1">
                                                    <li>• MarketplaceService</li>
                                                    <li>• ServiceIntegration</li>
                                                    <li>• ServiceReview</li>
                                                    <li>• ServiceInvoice</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="font-medium text-xs text-slate-500 mb-1">NEW PAGES</p>
                                                <ul className="text-xs space-y-1">
                                                    <li>• FTSMarketplace (catalog)</li>
                                                    <li>• ProviderPortal (for providers)</li>
                                                    <li>• ServiceDetails (per service)</li>
                                                    <li>• SubscriptionManagement</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded border">
                                        <p className="font-bold mb-2">Phase 4 Deliverables (Community)</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="font-medium text-xs text-slate-500 mb-1">NEW ENTITIES</p>
                                                <ul className="text-xs space-y-1">
                                                    <li>• CommunityMember</li>
                                                    <li>• FluidityScore</li>
                                                    <li>• Challenge</li>
                                                    <li>• ChallengeSubmission</li>
                                                    <li>• MemberConnection</li>
                                                    <li>• ForumPost</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <p className="font-medium text-xs text-slate-500 mb-1">NEW PAGES</p>
                                                <ul className="text-xs space-y-1">
                                                    <li>• CommunityHome</li>
                                                    <li>• MemberDirectory</li>
                                                    <li>• FluidityLeaderboard</li>
                                                    <li>• Challenges</li>
                                                    <li>• Forums</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Success Metrics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Success Metrics & KPIs</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="font-bold text-blue-900 mb-3">Platform Health</p>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span>PSP Instances</span>
                                                <span className="font-bold">Target: 100+</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Avg Services per PSP</span>
                                                <span className="font-bold">Target: 3-5</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Service Uptime</span>
                                                <span className="font-bold">99.9%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                        <p className="font-bold text-purple-900 mb-3">Marketplace Growth</p>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span>Service Providers</span>
                                                <span className="font-bold">Target: 50+</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Total Services</span>
                                                <span className="font-bold">Target: 100+</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Service Satisfaction</span>
                                                <span className="font-bold">4.5+ stars</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                        <p className="font-bold text-emerald-900 mb-3">Community Engagement</p>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span>Active Members</span>
                                                <span className="font-bold">Target: 500+</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Monthly Challenges</span>
                                                <span className="font-bold">2-3</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Forum Activity</span>
                                                <span className="font-bold">50+ posts/week</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Action Button */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-center">
                    <h2 className="text-2xl font-bold mb-2">Ready to Build</h2>
                    <p className="text-sm opacity-90 mb-4">This architecture will position FTS.Money as the industry-leading PSP platform ecosystem</p>
                    <Button 
                        size="lg" 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="bg-white text-blue-600 hover:bg-slate-100"
                    >
                        Return to Control Plane
                    </Button>
                </div>
            </div>
        </div>
    );
}