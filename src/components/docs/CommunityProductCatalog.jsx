import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    ArrowRight, 
    TrendingUp, 
    DollarSign, 
    Users, 
    Zap,
    Globe,
    Shield,
    Repeat,
    Database,
    Wallet,
    BarChart3,
    Code,
    Lock,
    Layers,
    CheckCircle2,
    Clock
} from 'lucide-react';

// Market Research-Based Product Catalog for FTS.Money Community Platform
// Based on 2024-2025 Payment Industry Trends

const PRODUCT_CATALOG = {
    // Category 1: ISO Standards & Migration Services
    iso_services: {
        category: "ISO Standards & Migration Services",
        icon: Code,
        color: "blue",
        products: [
            {
                name: "ISO20022 Migration Suite",
                tagline: "Enterprise payment message transformation",
                description: "Complete ISO20022 migration service for banks and financial institutions transitioning from legacy MT formats (MT103, MT202) to MX messages (pacs.008, pacs.009). Includes message translation, validation, testing sandbox, and compliance certification.",
                infrastructure: "Uses FTS ISO20022Handler, ISO8583Handler, API Gateway, and compliance validation tools",
                target_market: "Banks, Payment processors, Corporate treasuries with $50M+ annual payment volume",
                pricing_tiers: [
                    {
                        tier: "Starter",
                        setup_fee: 25000,
                        monthly: 2500,
                        per_message: 0.05,
                        features: ["Up to 100K messages/month", "MT to MX translation", "Basic validation", "Email support"]
                    },
                    {
                        tier: "Enterprise",
                        setup_fee: 75000,
                        monthly: 8500,
                        per_message: 0.02,
                        features: ["Unlimited messages", "Bidirectional translation", "Custom field mapping", "Testing sandbox", "Dedicated support", "SLA guarantee"]
                    }
                ],
                revenue_models: ["Setup fee", "Monthly subscription", "Per-message fee", "Professional services"],
                arr_potential: "$500K - $2M (10-20 enterprise clients)",
                setup_time: "2-4 weeks",
                usp: "Only platform offering both ISO8583 and ISO20022 with built-in compliance validation and crypto bridge capability",
                gtm: "Direct sales to tier-2/tier-3 banks, partnerships with core banking vendors, presence at SWIFT conferences"
            },
            {
                name: "Cross-Standard Payment Switch",
                tagline: "Universal payment message router",
                description: "Multi-protocol payment switch supporting ISO8583, ISO20022, FedNow, RTP, SEPA, and proprietary formats. Routes and translates messages between different payment rails seamlessly.",
                infrastructure: "Leverages payment orchestration engine, routing rules, provider pool, and message handlers",
                target_market: "Regional payment processors, fintech companies, acquiring banks",
                pricing_tiers: [
                    {
                        tier: "Professional",
                        monthly: 4500,
                        per_transaction: 0.03,
                        features: ["Up to 5 protocols", "Basic routing", "10K TPS", "Standard support"]
                    },
                    {
                        tier: "Enterprise",
                        monthly: 15000,
                        per_transaction: 0.01,
                        features: ["Unlimited protocols", "AI routing", "50K TPS", "Custom integrations", "24/7 support"]
                    }
                ],
                revenue_models: ["Monthly platform fee", "Transaction-based pricing", "Setup & integration fees"],
                arr_potential: "$1M - $5M (25-50 mid-market clients)",
                setup_time: "4-6 weeks",
                usp: "AI-powered intelligent routing between payment standards with real-time fallback and retry logic",
                gtm: "Partner with payment consultancies, target processors upgrading infrastructure, content marketing on payment modernization"
            }
        ]
    },

    // Category 2: Payment Orchestration Platforms
    orchestration: {
        category: "Payment Orchestration & Optimization",
        icon: Layers,
        color: "purple",
        products: [
            {
                name: "Smart Payment Orchestration Platform",
                tagline: "Multi-acquirer optimization engine",
                description: "Enterprise payment orchestration with AI-powered smart routing across 50+ acquirers and PSPs. Optimizes for cost, success rate, latency, and compliance. Real-time A/B testing and performance analytics.",
                infrastructure: "Built on FTS orchestration layer, routing engine, provider pool, analytics, and ML optimization",
                target_market: "E-commerce platforms, marketplaces, SaaS companies processing $10M+ annually",
                pricing_tiers: [
                    {
                        tier: "Growth",
                        monthly: 2500,
                        revenue_share: 0.15,
                        features: ["Up to 10 PSPs", "Basic routing", "Dashboard", "Email support"]
                    },
                    {
                        tier: "Scale",
                        monthly: 7500,
                        revenue_share: 0.08,
                        features: ["Unlimited PSPs", "AI routing", "A/B testing", "Custom rules", "Dedicated CSM"]
                    },
                    {
                        tier: "Enterprise",
                        custom: true,
                        revenue_share: 0.05,
                        features: ["White-label", "On-premise", "Custom ML models", "24/7 support", "SLA"]
                    }
                ],
                revenue_models: ["Monthly SaaS fee", "Revenue share on processed volume", "Setup fees"],
                arr_potential: "$2M - $10M (50-100 clients at $500K avg payment volume)",
                setup_time: "2-3 weeks",
                usp: "Only platform with native crypto routing, ISO20022 support, and instant settlement optimization in one solution",
                gtm: "Inbound through SEO/content, partnerships with Shopify/BigCommerce, attend e-commerce conferences"
            },
            {
                name: "Local Payment Method Aggregator",
                tagline: "Global checkout, local payments",
                description: "Single integration for 200+ local payment methods worldwide (PIX, UPI, Alipay, GCash, M-Pesa, etc.). Handles local compliance, currency conversion, and settlement.",
                infrastructure: "Uses provider pool, payout routes, compliance tools, FX management, regional routing",
                target_market: "Global e-commerce, gaming, digital services expanding internationally",
                pricing_tiers: [
                    {
                        tier: "Standard",
                        monthly: 500,
                        transaction_fee: 1.5,
                        features: ["50+ payment methods", "Basic checkout", "Standard settlement"]
                    },
                    {
                        tier: "Premium",
                        monthly: 2500,
                        transaction_fee: 1.2,
                        features: ["200+ payment methods", "Customizable checkout", "Next-day settlement", "Multi-currency"]
                    }
                ],
                revenue_models: ["Monthly fee", "Transaction percentage", "FX spread", "Cross-border fees"],
                arr_potential: "$3M - $15M (high volume from transaction fees)",
                setup_time: "1-2 weeks",
                usp: "Fastest integration (< 1 day) with automatic compliance handling for each region",
                gtm: "Partner with payment consultants, target rapidly scaling startups, developer-focused content marketing"
            }
        ]
    },

    // Category 3: Embedded Finance & BaaS
    embedded_finance: {
        category: "Embedded Finance & Banking-as-a-Service",
        icon: Wallet,
        color: "emerald",
        products: [
            {
                name: "PayFac-as-a-Service Platform",
                tagline: "Turn your SaaS into a payment platform",
                description: "Complete payment facilitator infrastructure for SaaS platforms. Enables sub-merchant onboarding, split payments, instant payouts, and unified reporting. Handles underwriting, compliance, and risk.",
                infrastructure: "Built on PSP provisioning, sub-merchant management, KYB/AML tools, split payment engine, payout orchestration",
                target_market: "Vertical SaaS platforms, marketplaces, gig economy platforms with 500+ merchants",
                pricing_tiers: [
                    {
                        tier: "Starter",
                        monthly: 5000,
                        per_merchant: 10,
                        transaction_fee: 0.5,
                        features: ["Up to 100 merchants", "Basic onboarding", "Standard compliance", "Weekly payouts"]
                    },
                    {
                        tier: "Scale",
                        monthly: 15000,
                        per_merchant: 5,
                        transaction_fee: 0.3,
                        features: ["Unlimited merchants", "Automated onboarding", "Advanced compliance", "Instant payouts", "White-label"]
                    }
                ],
                revenue_models: ["Platform fee", "Per-merchant fee", "Transaction revenue share", "Compliance services"],
                arr_potential: "$5M - $25M (10-20 SaaS platforms with 1000+ merchants each)",
                setup_time: "6-8 weeks",
                usp: "90% faster merchant onboarding with AI-powered KYB/AML, and built-in crypto payout support",
                gtm: "Partner with SaaS accelerators, target vertical SaaS conferences, case studies with successful platforms"
            },
            {
                name: "Embedded Lending Platform",
                tagline: "Point-of-sale financing infrastructure",
                description: "White-label BNPL and working capital lending for marketplaces and B2B platforms. Instant credit decisions, flexible repayment terms, automated collections, and risk management.",
                infrastructure: "Uses merchant analytics, transaction data, credit scoring, automated payouts, and compliance tools",
                target_market: "B2B marketplaces, invoice factoring platforms, supply chain finance",
                pricing_tiers: [
                    {
                        tier: "Standard",
                        setup_fee: 50000,
                        monthly: 5000,
                        revenue_share: 20,
                        features: ["Up to $10M loan book", "Basic risk models", "Standard terms", "Monthly reporting"]
                    },
                    {
                        tier: "Enterprise",
                        setup_fee: 150000,
                        monthly: 15000,
                        revenue_share: 15,
                        features: ["Unlimited loan book", "Custom risk models", "Flexible terms", "Real-time reporting", "API access"]
                    }
                ],
                revenue_models: ["Setup fee", "Platform fee", "Revenue share on interest", "Risk management fees"],
                arr_potential: "$2M - $8M (5-10 platforms)",
                setup_time: "8-12 weeks",
                usp: "Real-time credit decisions using payment history data with 95% automation rate",
                gtm: "Target supply chain finance platforms, B2B marketplaces, content on working capital solutions"
            },
            {
                name: "Digital Wallet-as-a-Service",
                tagline: "Launch branded wallets in weeks",
                description: "Complete digital wallet infrastructure with P2P transfers, bill payments, QR code payments, loyalty programs, and cryptocurrency support. Fully compliant and customizable.",
                infrastructure: "Built on account management, payment orchestration, crypto connectors, compliance tools, loyalty engine",
                target_market: "Retailers, telcos, fintechs, super-apps in emerging markets",
                pricing_tiers: [
                    {
                        tier: "Basic",
                        setup_fee: 100000,
                        monthly: 10000,
                        per_user: 0.5,
                        features: ["Up to 100K users", "Basic features", "Standard design", "Email support"]
                    },
                    {
                        tier: "Premium",
                        setup_fee: 250000,
                        monthly: 25000,
                        per_user: 0.25,
                        features: ["Unlimited users", "All features", "Custom design", "Crypto support", "24/7 support"]
                    }
                ],
                revenue_models: ["Setup fee", "Monthly platform fee", "Per-user fee", "Transaction fees", "Interchange"],
                arr_potential: "$5M - $30M (5-10 large deployments with millions of users)",
                setup_time: "12-16 weeks",
                usp: "Only wallet supporting both fiat and crypto with built-in DeFi yield optimization",
                gtm: "Target emerging markets, partner with telcos, showcase at Money20/20"
            }
        ]
    },

    // Category 4: Crypto & Blockchain Infrastructure
    crypto_services: {
        category: "Crypto & Blockchain Services",
        icon: Database,
        color: "amber",
        products: [
            {
                name: "Fiat-Crypto Gateway",
                tagline: "Seamless crypto on/off ramp",
                description: "Enterprise-grade fiat-to-crypto conversion platform. Supports 50+ cryptocurrencies, bank transfers, cards, and instant settlements. Includes AML screening, travel rule compliance, and tax reporting.",
                infrastructure: "Built on blockchain connectors, exchange integrations, FATF compliance, bank rails, KYC/AML",
                target_market: "Crypto exchanges, neobanks, trading platforms, institutional investors",
                pricing_tiers: [
                    {
                        tier: "Standard",
                        monthly: 5000,
                        transaction_fee: 1.0,
                        features: ["Up to $10M volume", "Basic coins", "Bank transfers", "Email support"]
                    },
                    {
                        tier: "Premium",
                        monthly: 15000,
                        transaction_fee: 0.6,
                        features: ["Up to $100M volume", "All coins", "Cards + banks", "Instant settlement", "Priority support"]
                    },
                    {
                        tier: "Enterprise",
                        monthly: 50000,
                        transaction_fee: 0.3,
                        features: ["Unlimited volume", "OTC desk", "Custom routing", "White-label", "24/7 support", "SLA"]
                    }
                ],
                revenue_models: ["Platform fee", "Transaction percentage", "Spread on conversions", "Compliance services"],
                arr_potential: "$10M - $50M (high volume business)",
                setup_time: "6-8 weeks",
                usp: "Best rates through aggregated liquidity + instant settlement via Lightning Network",
                gtm: "Partner with crypto exchanges, target institutional investors, sponsor blockchain conferences"
            },
            {
                name: "Stablecoin Payment Rails",
                tagline: "USDC/USDT payment infrastructure",
                description: "Enterprise stablecoin payment processing for cross-border B2B payments, remittances, and treasury operations. Real-time settlement, on-chain transparency, and automated reconciliation.",
                infrastructure: "Uses blockchain connectors, smart contract management, treasury services, compliance tools",
                target_market: "Remittance companies, international businesses, supply chain finance",
                pricing_tiers: [
                    {
                        tier: "Business",
                        monthly: 2500,
                        per_transaction: 5,
                        features: ["USDC/USDT", "Basic countries", "Standard settlement"]
                    },
                    {
                        tier: "Enterprise",
                        monthly: 10000,
                        per_transaction: 2,
                        features: ["Multiple stablecoins", "Global coverage", "Instant settlement", "API access", "Multi-sig"]
                    }
                ],
                revenue_models: ["Monthly fee", "Per-transaction fee", "FX spread on conversions", "Treasury services"],
                arr_potential: "$3M - $15M (50-100 corporate clients)",
                setup_time: "3-4 weeks",
                usp: "Hybrid routing - uses stablecoins for cross-border, auto-converts to local fiat at destination",
                gtm: "Target CFOs at multinational companies, content on treasury optimization, direct sales"
            }
        ]
    },

    // Category 5: Compliance & Risk Services
    compliance_services: {
        category: "Compliance & Risk Management",
        icon: Shield,
        color: "red",
        products: [
            {
                name: "Compliance-as-a-Service Platform",
                tagline: "Automated regulatory compliance",
                description: "Complete compliance automation including KYB, KYC, AML screening, sanctions checking, LEI verification, PCI DSS, and regulatory reporting. Real-time monitoring and audit trails.",
                infrastructure: "Built on KYB/AML connectors, LEI verification, document verification, audit logging, reporting tools",
                target_market: "Neobanks, fintechs, payment companies, crypto platforms needing compliance",
                pricing_tiers: [
                    {
                        tier: "Starter",
                        monthly: 2000,
                        per_check: 2.5,
                        features: ["KYC/KYB", "Basic AML", "Document verification", "Standard reporting"]
                    },
                    {
                        tier: "Professional",
                        monthly: 8000,
                        per_check: 1.5,
                        features: ["All checks", "Advanced AML", "Real-time monitoring", "Custom rules", "API access"]
                    },
                    {
                        tier: "Enterprise",
                        monthly: 25000,
                        per_check: 0.75,
                        features: ["White-label", "Unlimited checks", "Custom integrations", "Dedicated compliance officer", "SLA"]
                    }
                ],
                revenue_models: ["Monthly platform fee", "Per-verification fee", "Consulting services", "Training"],
                arr_potential: "$5M - $20M (100-200 fintech clients)",
                setup_time: "2-4 weeks",
                usp: "99.7% automation rate with AI-powered document verification and global coverage (180+ countries)",
                gtm: "Partner with fintech incubators, target regulated fintechs, compliance-focused content marketing"
            },
            {
                name: "AI Fraud Prevention Suite",
                tagline: "Real-time fraud detection & prevention",
                description: "Machine learning-powered fraud detection analyzing transaction patterns, device fingerprinting, behavioral analytics, and network analysis. Real-time scoring with explainable AI.",
                infrastructure: "Uses transaction monitoring, ML models, risk scoring, behavioral analytics, device intelligence",
                target_market: "E-commerce, digital goods, online gaming, fintech apps with fraud losses",
                pricing_tiers: [
                    {
                        tier: "Standard",
                        monthly: 3000,
                        per_transaction: 0.02,
                        features: ["Basic models", "Real-time scoring", "Dashboard", "Email alerts"]
                    },
                    {
                        tier: "Advanced",
                        monthly: 10000,
                        per_transaction: 0.01,
                        features: ["Advanced models", "Behavioral analytics", "Custom rules", "API access", "Chargeback protection"]
                    }
                ],
                revenue_models: ["Monthly fee", "Per-transaction fee", "Performance-based pricing (% of fraud prevented)"],
                arr_potential: "$8M - $40M (200+ e-commerce clients)",
                setup_time: "1-2 weeks",
                usp: "Reduces fraud by 92% while maintaining 99.5% approval rates using explainable AI",
                gtm: "Freemium model for small merchants, upsell to premium, content on fraud trends"
            }
        ]
    },

    // Category 6: Treasury & Finance Management
    treasury_services: {
        category: "Treasury & Financial Operations",
        icon: BarChart3,
        color: "indigo",
        products: [
            {
                name: "Multi-Currency Treasury Platform",
                tagline: "Global treasury management suite",
                description: "Complete treasury operations platform with multi-currency accounts, FX hedging, cash forecasting, automated reconciliation, and liquidity management across 100+ currencies.",
                infrastructure: "Uses multi-currency accounts, FX management, payment orchestration, reporting, reconciliation",
                target_market: "CFOs at international businesses, remittance companies, marketplace platforms",
                pricing_tiers: [
                    {
                        tier: "Professional",
                        monthly: 5000,
                        per_currency: 100,
                        features: ["Up to 20 currencies", "Basic FX", "Monthly reports", "Email support"]
                    },
                    {
                        tier: "Enterprise",
                        monthly: 15000,
                        per_currency: 50,
                        features: ["Unlimited currencies", "Advanced FX", "Real-time reports", "API access", "Dedicated CFO support"]
                    }
                ],
                revenue_models: ["Monthly SaaS fee", "FX spread", "Per-currency account fee", "Advisory services"],
                arr_potential: "$3M - $12M (50-100 enterprise clients)",
                setup_time: "4-6 weeks",
                usp: "AI-powered cash forecasting with 95% accuracy and automatic FX hedging optimization",
                gtm: "Target CFO communities, sponsor treasury conferences, content on FX optimization"
            },
            {
                name: "Automated Reconciliation Engine",
                tagline: "Real-time payment reconciliation",
                description: "AI-powered reconciliation matching bank statements, payment files, and accounting systems in real-time. Handles complex scenarios like split payments, refunds, and multi-party transactions.",
                infrastructure: "Uses transaction data, bank feeds, accounting integrations, ML matching algorithms",
                target_market: "Payment companies, marketplaces, large merchants with high transaction volumes",
                pricing_tiers: [
                    {
                        tier: "Growth",
                        monthly: 2000,
                        per_transaction: 0.01,
                        features: ["Up to 100K transactions", "Basic matching", "Daily reconciliation"]
                    },
                    {
                        tier: "Scale",
                        monthly: 8000,
                        per_transaction: 0.005,
                        features: ["Unlimited transactions", "AI matching", "Real-time reconciliation", "Custom rules", "API"]
                    }
                ],
                revenue_models: ["Monthly fee", "Per-transaction fee", "Implementation services"],
                arr_potential: "$2M - $8M (100-150 high-volume clients)",
                setup_time: "3-5 weeks",
                usp: "99.9% automatic match rate with sub-second processing for millions of transactions",
                gtm: "Target finance teams at payment companies, showcase ROI calculators, free trial"
            }
        ]
    },

    // Category 7: Developer Tools & APIs
    developer_tools: {
        category: "Developer Tools & Infrastructure",
        icon: Code,
        color: "cyan",
        products: [
            {
                name: "Payment API Aggregator",
                tagline: "One API for all payment providers",
                description: "Unified payment API abstracting 100+ payment providers (Stripe, Adyen, PayPal, etc.). Single integration, automatic failover, normalized responses, and unified testing sandbox.",
                infrastructure: "Built on API gateway, provider connectors, request normalization, response mapping, testing sandbox",
                target_market: "Developer-first startups, agencies, platforms building payment features",
                pricing_tiers: [
                    {
                        tier: "Free",
                        monthly: 0,
                        monthly_limit: 1000,
                        features: ["Up to 1K transactions", "5 providers", "Basic support", "Testing sandbox"]
                    },
                    {
                        tier: "Pro",
                        monthly: 500,
                        transaction_fee: 0.5,
                        features: ["Unlimited transactions", "All providers", "Priority support", "Custom webhooks"]
                    },
                    {
                        tier: "Enterprise",
                        monthly: 5000,
                        transaction_fee: 0.2,
                        features: ["White-label", "Custom integrations", "SLA", "Dedicated engineer"]
                    }
                ],
                revenue_models: ["Freemium to paid conversion", "Transaction fees", "Enterprise licenses"],
                arr_potential: "$2M - $10M (viral growth, high volume of small/mid customers)",
                setup_time: "< 1 day",
                usp: "Fastest switching between providers (zero code changes) with automatic retry logic",
                gtm: "Developer-focused content, open-source SDKs, hackathon sponsorships, DevRel program"
            },
            {
                name: "Payment Testing & Simulation Platform",
                tagline: "Test payments like production",
                description: "Complete payment testing environment simulating real provider behavior, edge cases, network conditions, and failure scenarios. Load testing, chaos engineering, and regression testing.",
                infrastructure: "Uses sandbox environments, provider simulators, test data generation, monitoring tools",
                target_market: "QA teams at payment companies, fintechs, e-commerce platforms",
                pricing_tiers: [
                    {
                        tier: "Team",
                        monthly: 500,
                        per_developer: 50,
                        features: ["Up to 10 developers", "Basic scenarios", "Standard providers"]
                    },
                    {
                        tier: "Business",
                        monthly: 2500,
                        per_developer: 30,
                        features: ["Unlimited developers", "All scenarios", "Custom providers", "CI/CD integration"]
                    }
                ],
                revenue_models: ["Per-seat pricing", "Usage-based for load testing", "Enterprise licenses"],
                arr_potential: "$1M - $5M (200-400 development teams)",
                setup_time: "1 week",
                usp: "Only platform with production-grade simulation of all major PSPs and payment methods",
                gtm: "Free tier for open-source projects, developer advocacy, integration with CI/CD tools"
            }
        ]
    },

    // Category 8: Specialized Vertical Solutions
    vertical_solutions: {
        category: "Vertical-Specific Solutions",
        icon: Users,
        color: "pink",
        products: [
            {
                name: "Healthcare Payment Platform",
                tagline: "HIPAA-compliant payment processing",
                description: "Specialized payment solution for healthcare with insurance verification, split billing (patient + insurance), flexible payment plans, HIPAA compliance, and automated claims processing.",
                infrastructure: "Uses PSP provisioning, compliance tools, split payments, patient management, insurance integrations",
                target_market: "Hospitals, clinics, medical billing companies, telehealth platforms",
                pricing_tiers: [
                    {
                        tier: "Practice",
                        monthly: 300,
                        transaction_fee: 2.5,
                        features: ["Up to 1000 patients", "Basic billing", "Payment plans", "HIPAA compliant"]
                    },
                    {
                        tier: "Enterprise",
                        monthly: 2000,
                        transaction_fee: 1.8,
                        features: ["Unlimited patients", "Insurance verification", "Automated claims", "API access", "White-label"]
                    }
                ],
                revenue_models: ["Monthly SaaS fee", "Transaction percentage", "Setup fees"],
                arr_potential: "$5M - $20M (500-1000 healthcare providers)",
                setup_time: "4-6 weeks",
                usp: "80% faster payment collection with automatic insurance verification and patient financing",
                gtm: "Partner with EMR vendors, target medical billing associations, HIPAA-focused content"
            },
            {
                name: "Property Management Payment Suite",
                tagline: "All-in-one rent & property payments",
                description: "Complete payment solution for property management with rent collection, security deposits, maintenance payments, late fees, automatic reminders, and tenant portals.",
                infrastructure: "Built on recurring billing, automated payouts, split payments, tenant management, late fee automation",
                target_market: "Property management companies, landlords, real estate platforms",
                pricing_tiers: [
                    {
                        tier: "Landlord",
                        monthly: 50,
                        per_unit: 3,
                        features: ["Up to 10 units", "Rent collection", "Tenant portal", "Basic reports"]
                    },
                    {
                        tier: "Property Manager",
                        monthly: 500,
                        per_unit: 1.5,
                        features: ["Unlimited units", "All features", "Owner distributions", "Advanced reports", "API access"]
                    }
                ],
                revenue_models: ["Monthly fee", "Per-unit fee", "Transaction fees on rent payments"],
                arr_potential: "$3M - $12M (1000-2000 property management companies)",
                setup_time: "2-3 weeks",
                usp: "95% on-time rent collection with AI-powered payment reminders and flexible payment options",
                gtm: "Partner with property management software, target property management associations"
            },
            {
                name: "Education Payment Platform",
                tagline: "Tuition & fee management system",
                description: "Comprehensive payment solution for educational institutions with tuition billing, installment plans, scholarship management, fee collection, and parent/student portals.",
                infrastructure: "Uses recurring billing, split payments, multi-currency support, installment management, reporting",
                target_market: "Universities, schools, tutoring centers, online education platforms",
                pricing_tiers: [
                    {
                        tier: "School",
                        monthly: 500,
                        per_student: 2,
                        features: ["Up to 500 students", "Tuition billing", "Payment plans", "Parent portal"]
                    },
                    {
                        tier: "University",
                        monthly: 5000,
                        per_student: 0.5,
                        features: ["Unlimited students", "All features", "Financial aid integration", "Multi-campus", "API"]
                    }
                ],
                revenue_models: ["Monthly platform fee", "Per-student fee", "Transaction fees"],
                arr_potential: "$4M - $15M (500-1000 educational institutions)",
                setup_time: "6-8 weeks",
                usp: "Reduces administrative workload by 70% with automated billing and integrated financial aid",
                gtm: "Target education conferences, partner with student information systems, content on EdTech"
            }
        ]
    }
};

const MARKET_INSIGHTS = {
    top_trends: [
        "ISO20022 migration creates $2B opportunity as banks need translation services by 2025",
        "Payment orchestration market growing 25% YoY reaching $8.5B by 2027",
        "Embedded finance expected to reach $185B market by 2026 (25% CAGR)",
        "Stablecoin payments for B2B crossing $1T annually in transaction volume",
        "Real-time payments adoption accelerating - 74% of banks prioritizing instant payments",
        "AI-powered fraud detection becoming table stakes - 85% reduction in manual review",
        "PayFac-as-a-Service enabling vertical SaaS to capture payment economics",
        "Cross-border payment costs decreasing 50% through blockchain rails",
        "Compliance automation reducing regulatory costs by 60-80%",
        "API-first payment infrastructure dominating new builds"
    ],
    market_gaps: [
        "Lack of unified ISO20022 + ISO8583 + crypto bridge solutions",
        "No end-to-end PayFac platform with instant payouts and crypto support",
        "Limited compliance automation for crypto-fiat businesses",
        "Missing developer-friendly testing platforms for complex payment flows",
        "Gap in vertical-specific solutions (healthcare, education, property)",
        "Insufficient real-time treasury management with crypto integration",
        "Limited B2B payment solutions with smart contract automation",
        "Absence of AI-powered payment recovery optimization platforms"
    ],
    competitive_advantages: [
        "FTS.Money is the ONLY platform with native ISO20022, ISO8583, and blockchain integration",
        "Built-in compliance automation (KYB, AML, LEI, FATF) reduces time-to-market by 80%",
        "Multi-tenancy enables rapid white-label PSP provisioning in < 24 hours",
        "Hybrid payment rails (traditional + crypto) provide unique cost optimization",
        "Service marketplace model creates network effects and revenue opportunities",
        "Open API architecture enables unlimited customization and integration",
        "Real-time analytics and AI optimization across all payment flows"
    ]
};

export default function CommunityProductCatalog() {
    const [selectedCategory, setSelectedCategory] = useState('iso_services');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const category = PRODUCT_CATALOG[selectedCategory];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">
                        FTS.Money Community Product Catalog
                    </h1>
                    <p className="text-lg text-slate-600">
                        Market research-based product opportunities leveraging FTS.Money infrastructure
                    </p>
                    <div className="flex gap-3 mt-4">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            $50M+ TAM Annually
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                            <Zap className="h-3 w-3 mr-1" />
                            20+ Product Ideas
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                            <Globe className="h-3 w-3 mr-1" />
                            Global Market Coverage
                        </Badge>
                    </div>
                </div>

                {/* Market Insights */}
                <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-900">
                            <TrendingUp className="h-5 w-5" />
                            Key Market Insights (2024-2025)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="trends" className="w-full">
                            <TabsList>
                                <TabsTrigger value="trends">Top Trends</TabsTrigger>
                                <TabsTrigger value="gaps">Market Gaps</TabsTrigger>
                                <TabsTrigger value="advantages">Our Advantages</TabsTrigger>
                            </TabsList>
                            <TabsContent value="trends" className="space-y-2">
                                {MARKET_INSIGHTS.top_trends.map((trend, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-700">{trend}</span>
                                    </div>
                                ))}
                            </TabsContent>
                            <TabsContent value="gaps" className="space-y-2">
                                {MARKET_INSIGHTS.market_gaps.map((gap, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <ArrowRight className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-700">{gap}</span>
                                    </div>
                                ))}
                            </TabsContent>
                            <TabsContent value="advantages" className="space-y-2">
                                {MARKET_INSIGHTS.competitive_advantages.map((adv, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm">
                                        <Zap className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-700 font-medium">{adv}</span>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Category Selection */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    {Object.entries(PRODUCT_CATALOG).map(([key, cat]) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${
                                    isSelected 
                                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                                }`}
                            >
                                <Icon className={`h-8 w-8 mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`} />
                                <h3 className="font-semibold text-sm text-slate-900 mb-1">{cat.category}</h3>
                                <p className="text-xs text-slate-500">{cat.products.length} products</p>
                            </button>
                        );
                    })}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {category.products.map((product, idx) => (
                        <Card key={idx} className="border-2 hover:border-blue-300 hover:shadow-xl transition-all">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <CardTitle className="text-xl mb-1">{product.name}</CardTitle>
                                        <p className="text-sm text-slate-600 font-medium">{product.tagline}</p>
                                    </div>
                                    <Badge className={`bg-${category.color}-100 text-${category.color}-700 border-${category.color}-300`}>
                                        {product.arr_potential}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{product.description}</p>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Infrastructure */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">FTS Infrastructure</h4>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{product.infrastructure}</p>
                                </div>

                                {/* Target Market */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Target Market</h4>
                                    <p className="text-sm text-slate-700">{product.target_market}</p>
                                </div>

                                {/* Pricing Tiers */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Pricing Tiers</h4>
                                    <div className="space-y-2">
                                        {product.pricing_tiers.map((tier, tidx) => (
                                            <div key={tidx} className="bg-gradient-to-r from-slate-50 to-slate-100 p-3 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-semibold text-slate-900">{tier.tier}</span>
                                                    <div className="text-right">
                                                        {tier.monthly && <span className="text-sm font-bold text-slate-900">${tier.monthly.toLocaleString()}/mo</span>}
                                                        {tier.setup_fee && <span className="text-xs text-slate-600 ml-2">${tier.setup_fee.toLocaleString()} setup</span>}
                                                        {tier.custom && <span className="text-sm font-bold text-slate-900">Custom</span>}
                                                    </div>
                                                </div>
                                                {tier.transaction_fee && (
                                                    <p className="text-xs text-slate-600 mb-2">+ {tier.transaction_fee}% per transaction</p>
                                                )}
                                                {tier.revenue_share && (
                                                    <p className="text-xs text-slate-600 mb-2">+ {tier.revenue_share}% revenue share</p>
                                                )}
                                                <div className="flex flex-wrap gap-1">
                                                    {tier.features.map((feature, fidx) => (
                                                        <span key={fidx} className="text-xs bg-white px-2 py-1 rounded text-slate-700">
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* USP */}
                                <div className="bg-emerald-50 border-2 border-emerald-200 p-3 rounded-lg">
                                    <h4 className="text-xs font-semibold text-emerald-900 uppercase mb-1 flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        Unique Selling Proposition
                                    </h4>
                                    <p className="text-sm text-emerald-900 font-medium">{product.usp}</p>
                                </div>

                                {/* Revenue Models & GTM */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Revenue Models</h4>
                                        <div className="space-y-1">
                                            {product.revenue_models.map((model, midx) => (
                                                <div key={midx} className="flex items-center gap-1 text-xs text-slate-700">
                                                    <DollarSign className="h-3 w-3 text-emerald-600" />
                                                    {model}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Setup Time</h4>
                                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                                            <Clock className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-semibold text-blue-900">{product.setup_time}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* GTM Strategy */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Go-to-Market</h4>
                                    <p className="text-sm text-slate-700 bg-purple-50 p-3 rounded-lg">{product.gtm}</p>
                                </div>

                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    View Full Business Plan
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Summary Stats */}
                <Card className="mt-8 border-2 border-purple-200 bg-purple-50">
                    <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-purple-900 mb-4">Portfolio Summary</h3>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-purple-700 mb-1">Total Products</p>
                                <p className="text-3xl font-bold text-purple-900">
                                    {Object.values(PRODUCT_CATALOG).reduce((sum, cat) => sum + cat.products.length, 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-purple-700 mb-1">Combined ARR Potential</p>
                                <p className="text-3xl font-bold text-purple-900">$100M+</p>
                            </div>
                            <div>
                                <p className="text-sm text-purple-700 mb-1">Market Categories</p>
                                <p className="text-3xl font-bold text-purple-900">{Object.keys(PRODUCT_CATALOG).length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-purple-700 mb-1">Avg. Setup Time</p>
                                <p className="text-3xl font-bold text-purple-900">3-6 weeks</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Business Plan Dialog */}
            <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{selectedProduct?.name}</DialogTitle>
                        <p className="text-slate-600">{selectedProduct?.tagline}</p>
                    </DialogHeader>
                    <ScrollArea className="h-[70vh] pr-4">
                        {selectedProduct && (
                            <div className="space-y-6">
                                {/* Executive Summary */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Executive Summary</h3>
                                    <p className="text-slate-700">{selectedProduct.description}</p>
                                </div>

                                {/* Market Opportunity */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Market Opportunity</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-sm font-semibold text-blue-900 mb-1">Target Market</p>
                                        <p className="text-sm text-blue-800">{selectedProduct.target_market}</p>
                                        <p className="text-sm font-semibold text-blue-900 mt-3 mb-1">ARR Potential</p>
                                        <p className="text-lg font-bold text-blue-900">{selectedProduct.arr_potential}</p>
                                    </div>
                                </div>

                                {/* Technical Infrastructure */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Technical Infrastructure</h3>
                                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg">{selectedProduct.infrastructure}</p>
                                </div>

                                {/* Pricing Strategy */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Pricing Strategy</h3>
                                    <div className="space-y-3">
                                        {selectedProduct.pricing_tiers.map((tier, idx) => (
                                            <Card key={idx}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-slate-900">{tier.tier}</h4>
                                                        <div className="text-right">
                                                            {tier.monthly && <p className="font-bold text-slate-900">${tier.monthly.toLocaleString()}/month</p>}
                                                            {tier.setup_fee && <p className="text-sm text-slate-600">${tier.setup_fee.toLocaleString()} setup</p>}
                                                            {tier.custom && <p className="font-bold text-slate-900">Custom Pricing</p>}
                                                        </div>
                                                    </div>
                                                    {tier.transaction_fee && (
                                                        <p className="text-sm text-slate-600 mb-2">+ {tier.transaction_fee}% per transaction</p>
                                                    )}
                                                    {tier.revenue_share && (
                                                        <p className="text-sm text-slate-600 mb-2">+ {tier.revenue_share}% revenue share</p>
                                                    )}
                                                    {tier.per_transaction && (
                                                        <p className="text-sm text-slate-600 mb-2">+ ${tier.per_transaction} per transaction</p>
                                                    )}
                                                    {tier.per_message && (
                                                        <p className="text-sm text-slate-600 mb-2">+ ${tier.per_message} per message</p>
                                                    )}
                                                    <div className="mt-2">
                                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Features</p>
                                                        <ul className="space-y-1">
                                                            {tier.features.map((feature, fidx) => (
                                                                <li key={fidx} className="flex items-center gap-2 text-sm text-slate-700">
                                                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                                                    {feature}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>

                                {/* Revenue Models */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Revenue Models</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedProduct.revenue_models.map((model, idx) => (
                                            <div key={idx} className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                                <span className="text-sm text-slate-900">{model}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Unique Selling Proposition */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Unique Selling Proposition</h3>
                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
                                        <p className="text-slate-900 font-medium">{selectedProduct.usp}</p>
                                    </div>
                                </div>

                                {/* Go-to-Market Strategy */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Go-to-Market Strategy</h3>
                                    <p className="text-slate-700 bg-slate-50 p-4 rounded-lg">{selectedProduct.gtm}</p>
                                </div>

                                {/* Implementation Timeline */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Implementation Timeline</h3>
                                    <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg">
                                        <Clock className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="font-semibold text-blue-900">Setup Time</p>
                                            <p className="text-xl font-bold text-blue-900">{selectedProduct.setup_time}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
}