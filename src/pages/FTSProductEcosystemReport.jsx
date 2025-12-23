import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    Wallet, CreditCard, Globe, Building2, TrendingUp, Users, 
    ArrowRightLeft, ShoppingCart, Zap, Shield, DollarSign, 
    Repeat, ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
    Target, Coins, BarChart3, Network, Rocket, Lock
} from 'lucide-react';

export default function FTSProductEcosystemReport() {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const coreProducts = [
        {
            id: 'merchant_acquiring',
            name: 'Merchant Acquiring Platform (TPP)',
            icon: CreditCard,
            status: 'enhancement_needed',
            description: 'Card acceptance infrastructure (CP & CNP) for PSPs',
            currentCapability: 'Transaction recording, ISO fields support, multi-currency',
            enhancements: [
                'ISO 8583 gateway for real-time authorization',
                'Sponsor acquirer integrations (Elavon, Banking Circle, TSYS)',
                'PCI DSS Level 1 compliance infrastructure',
                'HSM integration for cryptographic operations',
                '3D Secure 2.0 authentication',
                'Dynamic routing across multiple acquirers',
                'Physical terminal integration (Ingenico, Verifone)',
                'Network tokenization (Visa/Mastercard)'
            ],
            revenue: {
                setup: '$5K-20K per PSP',
                monthly: '$1K-5K per PSP',
                perTransaction: '$0.03-0.10',
                mdrMargin: '0.3-0.7% of transaction volume',
                annual: '$2M-10M (at 10-50 PSPs, $500M volume)'
            },
            market: '$2.3T global acquiring market, growing 12% YoY',
            priority: 'critical'
        },
        {
            id: 'payment_orchestration',
            name: 'Payment Orchestration Layer',
            icon: Network,
            status: 'partially_built',
            description: 'Intelligent routing, cascading, and optimization',
            currentCapability: 'RoutingRule entity, basic provider selection',
            enhancements: [
                'ML-based smart routing (success rate, cost, speed)',
                'Real-time cascading/fallback logic',
                'A/B testing for routing strategies',
                'Geographic routing optimization',
                'Load balancing across processors',
                'Cost optimization engine',
                'Performance analytics dashboard',
                'Fraud-based routing decisions'
            ],
            revenue: {
                setup: '$10K-30K per PSP',
                monthly: '$2K-8K per PSP',
                transactionLift: '2-5% approval rate improvement = significant revenue',
                annual: '$1.5M-6M (at 20-50 PSPs)'
            },
            market: '$8B orchestration market by 2030',
            priority: 'high'
        },
        {
            id: 'digital_wallets',
            name: 'White-Label Digital Wallets',
            icon: Wallet,
            status: 'new_product',
            description: 'Stored value accounts, P2P transfers, card linking',
            currentCapability: 'Customer entity, transaction processing',
            enhancements: [
                'Wallet account management (create, load, transfer)',
                'P2P transfer functionality',
                'Card tokenization for wallet payments',
                'QR code payment generation',
                'Loyalty points integration',
                'Multi-currency wallet support',
                'Wallet-to-bank account transfers',
                'Mobile SDK (iOS/Android)',
                'Virtual card issuance from wallet'
            ],
            revenue: {
                setup: '$15K-50K per PSP',
                monthly: '$3K-10K per PSP',
                perTransaction: '$0.10-0.30',
                interchange: '0.5-1.5% on wallet-funded transactions',
                annual: '$3M-12M (at 25-75 PSPs, 10M wallet users)'
            },
            market: '$16T digital wallet market by 2028',
            priority: 'high'
        },
        {
            id: 'bnpl',
            name: 'Buy Now Pay Later (BNPL) Engine',
            icon: ShoppingCart,
            status: 'new_product',
            description: 'Installment financing at checkout',
            currentCapability: 'Transaction management, customer tracking',
            enhancements: [
                'Credit decisioning engine (ML-based)',
                'Installment plan configuration (2/4/6 weeks, monthly)',
                'Auto-debit/payment collection',
                'Late fee management',
                'Credit limit management per customer',
                'Merchant risk sharing models',
                'Integration with checkout flows',
                'Dunning management for failed payments',
                'Early payoff capabilities'
            ],
            revenue: {
                setup: '$20K-60K per PSP',
                monthly: '$5K-15K per PSP',
                mdr: '3-6% of purchase amount (paid by merchant)',
                lateFeesInterest: '10-25% annual revenue from customers',
                annual: '$5M-20M (at 20-50 PSPs, $1B BNPL volume)'
            },
            market: '$576B BNPL market by 2026, 40% CAGR',
            priority: 'medium'
        },
        {
            id: 'cross_border',
            name: 'Cross-Border Payments & FX',
            icon: Globe,
            status: 'partially_built',
            description: 'Multi-currency processing, FX conversion, remittances',
            currentCapability: 'Multi-currency transaction support, ISO 20022 fields',
            enhancements: [
                'Real-time FX rate aggregation (multiple sources)',
                'Competitive FX margin management',
                'Currency corridor optimization',
                'Correspondent banking network',
                'Local payout methods (150+ countries)',
                'Compliance/AML for cross-border',
                'FX risk hedging tools for merchants',
                'Transparent fee breakdown',
                'SWIFT integration for bank transfers'
            ],
            revenue: {
                setup: '$15K-40K per PSP',
                monthly: '$3K-12K per PSP',
                fxMargin: '0.5-2% on FX conversion',
                perTransaction: '$2-10 per cross-border payment',
                annual: '$4M-15M (at 30-60 PSPs, $2B cross-border volume)'
            },
            market: '$290T cross-border payments by 2030',
            priority: 'high'
        },
        {
            id: 'crypto_rails',
            name: 'Crypto Payment Rails',
            icon: Coins,
            status: 'partially_built',
            description: 'Crypto acceptance, stablecoin settlements, on/off-ramp',
            currentCapability: 'Crypto transaction fields (ISO 23257), blockchain connectors',
            enhancements: [
                'Multi-chain support (Bitcoin, Ethereum, Polygon, Solana)',
                'Stablecoin acceptance (USDC, USDT, DAI)',
                'Instant crypto-to-fiat settlement',
                'On-ramp (fiat → crypto) services',
                'Off-ramp (crypto → fiat) services',
                'DeFi protocol integrations',
                'NFT payment support',
                'Gas fee optimization',
                'Crypto wallet integrations (MetaMask, Coinbase Wallet)'
            ],
            revenue: {
                setup: '$25K-75K per PSP',
                monthly: '$5K-20K per PSP',
                conversionFee: '1-3% on crypto transactions',
                settlementFee: '0.5-1.5% crypto→fiat conversion',
                annual: '$3M-12M (at 15-40 PSPs, $500M crypto volume)'
            },
            market: '$10.9T crypto payment market by 2032',
            priority: 'medium'
        },
        {
            id: 'subscription_billing',
            name: 'Subscription & Recurring Billing',
            icon: Repeat,
            status: 'partially_built',
            description: 'Usage-based billing, subscription management, dunning',
            currentCapability: 'RecurringPayment entity, subscription tracking',
            enhancements: [
                'Flexible billing models (tiered, usage-based, hybrid)',
                'Proration and mid-cycle changes',
                'Dunning management (smart retry, email campaigns)',
                'Revenue recognition automation',
                'Trial management and conversion tracking',
                'Add-ons and upgrades',
                'Multi-currency subscription pricing',
                'Tax calculation (VAT, GST, sales tax)',
                'Customer self-service portal'
            ],
            revenue: {
                setup: '$10K-35K per PSP',
                monthly: '$2K-10K per PSP',
                percentOfBilling: '0.5-1.5% of subscription revenue processed',
                annual: '$2M-8M (at 30-70 PSPs, $500M subscription volume)'
            },
            market: '$2.6T SaaS/subscription market globally',
            priority: 'high'
        },
        {
            id: 'payout_orchestration',
            name: 'Payout & Disbursement Platform',
            icon: ArrowRightLeft,
            status: 'partially_built',
            description: 'Mass payouts, marketplace disbursements, gig economy',
            currentCapability: 'Payout entity, PayoutRoute management',
            enhancements: [
                'Bulk payout processing (CSV upload)',
                'Multi-method payouts (bank, card, wallet, crypto)',
                'Payout scheduling and automation',
                '1099/tax form generation',
                'Beneficiary KYC/verification',
                'Payout status tracking & notifications',
                'Failed payout handling',
                'Compliance reporting',
                'API for real-time payouts'
            ],
            revenue: {
                setup: '$15K-45K per PSP',
                monthly: '$3K-12K per PSP',
                perPayout: '$0.50-2.00',
                fxMargin: '0.5-1.5% on international payouts',
                annual: '$4M-16M (at 25-60 PSPs, 10M payouts/year)'
            },
            market: '$2.4T disbursement market by 2027',
            priority: 'high'
        },
        {
            id: 'embedded_finance',
            name: 'Embedded Finance APIs (BaaS)',
            icon: Zap,
            status: 'new_product',
            description: 'Banking services embedded in non-financial platforms',
            currentCapability: 'API infrastructure, white-label portals',
            enhancements: [
                'Virtual account issuance',
                'Balance management APIs',
                'Card issuance APIs (virtual/physical)',
                'Loan origination APIs',
                'Savings account creation',
                'Investment account management',
                'KYC/KYB verification services',
                'Compliance-as-a-Service',
                'Ledger & account management'
            ],
            revenue: {
                setup: '$30K-100K per platform',
                monthly: '$10K-40K per platform',
                perTransaction: '$0.05-0.20',
                accountFee: '$1-5 per active account/month',
                annual: '$5M-25M (at 15-50 platforms, 1M end users)'
            },
            market: '$230B embedded finance by 2027',
            priority: 'high'
        },
        {
            id: 'lei_vlei',
            name: 'LEI/vLEI Identity Services',
            icon: Shield,
            status: 'partially_built',
            description: 'Digital identity verification, credential management',
            currentCapability: 'LEI entities, credential chain, GLEIF integration',
            enhancements: [
                'Automated LEI verification & renewal',
                'vLEI credential issuance',
                'OOR (Organizational Role) management',
                'ECR (Engagement Context Role) setup',
                'Digital signature services',
                'Identity proofing as a service',
                'API for third-party verification',
                'Compliance reporting dashboard',
                'White-label identity portal'
            ],
            revenue: {
                setup: '$5K-15K per PSP',
                monthly: '$1K-5K per PSP',
                perVerification: '$2-10',
                leiRenewal: '$50-200 per year per entity',
                annual: '$1M-5M (at 50-200 PSPs, 10K entities)'
            },
            market: '$39.8B identity verification market by 2032',
            priority: 'medium'
        }
    ];

    const enhancementProducts = [
        {
            name: 'Fraud Prevention & Risk Management',
            icon: Lock,
            description: 'ML-based fraud detection, rule engine, chargeback prevention',
            enhancements: [
                'Real-time fraud scoring (ML models)',
                'Behavioral analytics',
                'Device fingerprinting',
                'Velocity checks',
                'Custom rule builder',
                'Chargeback alerts & representment',
                'Fraud insights dashboard',
                '3DS exemption optimization'
            ],
            revenue: {
                setup: '$20K-50K per PSP',
                monthly: '$5K-15K per PSP',
                perTransaction: '$0.02-0.08',
                chargebackFee: '$25-75 per chargeback handled',
                annual: '$3M-12M (at 30-80 PSPs)'
            }
        },
        {
            name: 'Business Intelligence & Analytics',
            icon: BarChart3,
            description: 'Real-time dashboards, reporting, predictive analytics',
            enhancements: [
                'Customizable dashboards',
                'Cohort analysis',
                'Revenue forecasting',
                'Merchant benchmarking',
                'Payment method performance',
                'Geographic analytics',
                'Export to BI tools (Tableau, PowerBI)',
                'Automated reporting (PDF/Excel)'
            ],
            revenue: {
                setup: '$10K-25K per PSP',
                monthly: '$2K-8K per PSP',
                perUser: '$50-200/user/month',
                annual: '$1.5M-6M (at 40-100 PSPs)'
            }
        },
        {
            name: 'Compliance & Regulatory Tech',
            icon: Shield,
            description: 'AML, KYC, sanctions screening, regulatory reporting',
            enhancements: [
                'Automated KYC/KYB verification',
                'Sanctions list screening (OFAC, UN)',
                'Transaction monitoring (AML)',
                'SAR filing assistance',
                'GDPR compliance tools',
                'PSD2/SCA compliance',
                'Audit trail management',
                'Regulatory report generation'
            ],
            revenue: {
                setup: '$15K-40K per PSP',
                monthly: '$3K-12K per PSP',
                perCheck: '$0.50-3.00',
                annual: '$2M-10M (at 30-70 PSPs)'
            }
        },
        {
            name: 'Developer Platform & API Marketplace',
            icon: Rocket,
            description: 'API documentation, SDKs, sandbox, app marketplace',
            enhancements: [
                'Interactive API docs (OpenAPI)',
                'SDK libraries (Python, Node, PHP, Ruby)',
                'Sandbox environment',
                'Webhook testing tools',
                'API usage analytics',
                'Third-party app marketplace',
                'OAuth 2.0 for third-party apps',
                'API versioning & deprecation management'
            ],
            revenue: {
                setup: 'Free (platform feature)',
                monthly: '$0 (drives core product adoption)',
                marketplaceFee: '15-30% of third-party app revenue',
                annual: '$500K-3M (marketplace commissions)'
            }
        }
    ];

    const marketOpportunity = {
        totalAddressableMarket: '$320T global payments by 2032',
        servicableMarket: '$45T (merchant acquiring, cross-border, disbursements)',
        targetMarket: '$2.3T (multi-PSP platform segment)',
        marketShare: {
            year1: '$500M (0.02% of TAM)',
            year3: '$5B (0.16% of TAM)',
            year5: '$25B (0.78% of TAM)'
        }
    };

    const revenueProjections = {
        year1: {
            psps: 10,
            avgRevenue: '$500K per PSP',
            totalRevenue: '$5M',
            breakdown: {
                acquiring: '$2M',
                orchestration: '$800K',
                crossBorder: '$600K',
                subscriptions: '$400K',
                other: '$1.2M'
            }
        },
        year3: {
            psps: 50,
            avgRevenue: '$1.2M per PSP',
            totalRevenue: '$60M',
            breakdown: {
                acquiring: '$25M',
                orchestration: '$8M',
                crossBorder: '$10M',
                wallets: '$6M',
                bnpl: '$4M',
                subscriptions: '$7M'
            }
        },
        year5: {
            psps: 150,
            avgRevenue: '$2M per PSP',
            totalRevenue: '$300M',
            breakdown: {
                acquiring: '$120M',
                orchestration: '$35M',
                crossBorder: '$50M',
                wallets: '$30M',
                bnpl: '$25M',
                payouts: '$20M',
                other: '$20M'
            }
        }
    };

    const competitiveAdvantages = [
        {
            advantage: 'White-Label Multi-Tenancy',
            description: 'Each PSP gets branded portal, isolated data, custom configuration',
            value: '40% faster PSP onboarding vs building in-house'
        },
        {
            advantage: 'ISO Standards Compliance',
            description: 'Built-in ISO 8583, ISO 20022, ISO 23257, EMV standards',
            value: 'Reduce compliance costs by 60%'
        },
        {
            advantage: 'Unified Infrastructure',
            description: 'Single platform for acquiring, issuing, wallets, crypto, payouts',
            value: '$2M-5M infrastructure savings per PSP'
        },
        {
            advantage: 'Regulatory Readiness',
            description: 'PCI DSS, PSD2, GDPR, LEI/vLEI, AML/KYC built-in',
            value: '6-12 months faster time-to-market'
        },
        {
            advantage: 'Global Reach',
            description: 'Multi-acquirer, multi-currency, multi-region from day one',
            value: 'Access 180+ countries without individual integrations'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-slate-900">
                        FTS.Money Product Ecosystem & Monetization Strategy
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Comprehensive analysis of products, enhancements, revenue models, and market opportunities
                        for the FTS.Money white-label multi-PSP platform
                    </p>
                    <div className="flex justify-center gap-4">
                        <Badge className="bg-blue-600 text-white px-4 py-2 text-sm">
                            Multi-Tenant Infrastructure
                        </Badge>
                        <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
                            ISO Standards Compliant
                        </Badge>
                        <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
                            Global Payment Network
                        </Badge>
                    </div>
                </div>

                {/* Executive Summary */}
                <Card className="border-2 border-blue-200 bg-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-6 h-6 text-blue-600" />
                            Executive Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-blue-600 font-medium">Total Addressable Market</div>
                                <div className="text-2xl font-bold text-blue-900">$320T</div>
                                <div className="text-xs text-blue-600">Global payments by 2032</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="text-sm text-green-600 font-medium">Year 5 Revenue Target</div>
                                <div className="text-2xl font-bold text-green-900">$300M</div>
                                <div className="text-xs text-green-600">150 PSPs @ $2M ARPU</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium">Core Products</div>
                                <div className="text-2xl font-bold text-purple-900">10+</div>
                                <div className="text-xs text-purple-600">Revenue-generating services</div>
                            </div>
                        </div>

                        <div className="prose prose-slate max-w-none">
                            <p className="text-slate-700">
                                FTS.Money's existing infrastructure provides a <strong>battle-tested foundation</strong> for building 
                                a comprehensive financial services ecosystem. With multi-tenancy, ISO standards compliance, and white-label 
                                capabilities already in place, the platform can rapidly expand into high-value product verticals.
                            </p>
                            <p className="text-slate-700">
                                The <strong>priority focus</strong> should be: (1) <span className="text-blue-600 font-semibold">Merchant Acquiring Platform</span> (highest revenue, 
                                critical market need), (2) <span className="text-blue-600 font-semibold">Payment Orchestration</span> (differentiator, high margin), 
                                and (3) <span className="text-blue-600 font-semibold">Cross-Border Payments</span> (massive market, strong infrastructure match).
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for different sections */}
                <Tabs defaultValue="products" className="space-y-6">
                    <TabsList className="grid grid-cols-5 w-full">
                        <TabsTrigger value="products">Core Products</TabsTrigger>
                        <TabsTrigger value="enhancements">Enhancements</TabsTrigger>
                        <TabsTrigger value="revenue">Revenue Models</TabsTrigger>
                        <TabsTrigger value="market">Market Analysis</TabsTrigger>
                        <TabsTrigger value="roadmap">Implementation</TabsTrigger>
                    </TabsList>

                    {/* Core Products Tab */}
                    <TabsContent value="products" className="space-y-4">
                        {coreProducts.map((product) => {
                            const Icon = product.icon;
                            const isExpanded = expandedSection === product.id;
                            
                            return (
                                <Card key={product.id} className="border-l-4 border-l-blue-500">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="p-3 bg-blue-100 rounded-lg">
                                                    <Icon className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <CardTitle className="text-xl">{product.name}</CardTitle>
                                                        {product.status === 'enhancement_needed' && (
                                                            <Badge className="bg-orange-100 text-orange-700">Enhancement Needed</Badge>
                                                        )}
                                                        {product.status === 'partially_built' && (
                                                            <Badge className="bg-yellow-100 text-yellow-700">Partially Built</Badge>
                                                        )}
                                                        {product.status === 'new_product' && (
                                                            <Badge className="bg-blue-100 text-blue-700">New Product</Badge>
                                                        )}
                                                        {product.priority === 'critical' && (
                                                            <Badge className="bg-red-100 text-red-700">Critical Priority</Badge>
                                                        )}
                                                        {product.priority === 'high' && (
                                                            <Badge className="bg-orange-100 text-orange-700">High Priority</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-600 mt-2">{product.description}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleSection(product.id)}
                                            >
                                                {isExpanded ? <ChevronUp /> : <ChevronDown />}
                                            </Button>
                                        </div>
                                    </CardHeader>

                                    {isExpanded && (
                                        <CardContent className="space-y-6">
                                            {/* Current Capability */}
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    Current Capability
                                                </h4>
                                                <p className="text-slate-600">{product.currentCapability}</p>
                                            </div>

                                            {/* Needed Enhancements */}
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                                    Required Enhancements
                                                </h4>
                                                <ul className="grid md:grid-cols-2 gap-2">
                                                    {product.enhancements.map((enhancement, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                            <span className="text-blue-600 mt-0.5">•</span>
                                                            {enhancement}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Revenue Model */}
                                            <div>
                                                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    Revenue Model
                                                </h4>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {Object.entries(product.revenue).map(([key, value]) => (
                                                        <div key={key} className="bg-slate-50 p-3 rounded-lg">
                                                            <div className="text-xs text-slate-500 uppercase tracking-wide">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </div>
                                                            <div className="text-sm font-semibold text-slate-900 mt-1">
                                                                {value}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Market Opportunity */}
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <TrendingUp className="w-4 h-4 text-blue-600" />
                                                    <h4 className="font-semibold text-blue-900">Market Opportunity</h4>
                                                </div>
                                                <p className="text-sm text-blue-800">{product.market}</p>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </TabsContent>

                    {/* Enhancement Products Tab */}
                    <TabsContent value="enhancements" className="space-y-4">
                        {enhancementProducts.map((product, idx) => {
                            const Icon = product.icon;
                            
                            return (
                                <Card key={idx} className="border-l-4 border-l-purple-500">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-purple-100 rounded-lg">
                                                <Icon className="w-6 h-6 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-xl">{product.name}</CardTitle>
                                                <p className="text-slate-600 mt-2">{product.description}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Key Features</h4>
                                            <ul className="grid md:grid-cols-2 gap-2">
                                                {product.enhancements.map((enhancement, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                                        <span className="text-purple-600 mt-0.5">•</span>
                                                        {enhancement}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-slate-900 mb-2">Revenue Model</h4>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                {Object.entries(product.revenue).map(([key, value]) => (
                                                    <div key={key} className="bg-slate-50 p-3 rounded-lg">
                                                        <div className="text-xs text-slate-500 uppercase tracking-wide">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </div>
                                                        <div className="text-sm font-semibold text-slate-900 mt-1">
                                                            {value}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </TabsContent>

                    {/* Revenue Models Tab */}
                    <TabsContent value="revenue" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Projection Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {Object.entries(revenueProjections).map(([year, data]) => (
                                        <div key={year} className="border-2 border-slate-200 rounded-lg p-6 space-y-4">
                                            <div>
                                                <div className="text-sm text-slate-500 uppercase tracking-wide">
                                                    {year.replace('year', 'Year ')}
                                                </div>
                                                <div className="text-3xl font-bold text-slate-900 mt-1">
                                                    {data.totalRevenue}
                                                </div>
                                                <div className="text-sm text-slate-600 mt-1">
                                                    {data.psps} PSPs • {data.avgRevenue}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="text-xs font-semibold text-slate-700 uppercase">
                                                    Revenue Breakdown
                                                </div>
                                                {Object.entries(data.breakdown).map(([product, revenue]) => (
                                                    <div key={product} className="flex justify-between text-sm">
                                                        <span className="text-slate-600 capitalize">
                                                            {product.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <span className="font-semibold text-slate-900">{revenue}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-green-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-6 h-6 text-green-600" />
                                    Unit Economics & ARPU Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-4 gap-4">
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="text-sm text-green-600 font-medium">Year 1 ARPU</div>
                                        <div className="text-2xl font-bold text-green-900">$500K</div>
                                        <div className="text-xs text-green-600">Per PSP annually</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="text-sm text-green-600 font-medium">Year 3 ARPU</div>
                                        <div className="text-2xl font-bold text-green-900">$1.2M</div>
                                        <div className="text-xs text-green-600">140% growth</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="text-sm text-green-600 font-medium">Year 5 ARPU</div>
                                        <div className="text-2xl font-bold text-green-900">$2M</div>
                                        <div className="text-xs text-green-600">300% total growth</div>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-sm text-blue-600 font-medium">Gross Margin</div>
                                        <div className="text-2xl font-bold text-blue-900">65-75%</div>
                                        <div className="text-xs text-blue-600">Software platform</div>
                                    </div>
                                </div>

                                <div className="prose prose-slate max-w-none text-sm">
                                    <p>
                                        <strong>Revenue Streams Per PSP:</strong> (1) Setup fees $50K-200K one-time, 
                                        (2) Monthly platform fees $5K-50K recurring, (3) Transaction-based fees 0.05-0.30% of volume, 
                                        (4) Value-added services (fraud, analytics, compliance) $2K-15K/month. 
                                        Average PSP processes $100M-500M annually, generating $500K-2M revenue for FTS.Money.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Market Analysis Tab */}
                    <TabsContent value="market" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Addressable Market (TAM)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-6 rounded-lg">
                                        <div className="text-sm text-blue-600 font-medium mb-2">Total Addressable Market</div>
                                        <div className="text-4xl font-bold text-blue-900">$320T</div>
                                        <div className="text-sm text-blue-600 mt-2">
                                            Global payments volume by 2032
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-6 rounded-lg">
                                        <div className="text-sm text-green-600 font-medium mb-2">Serviceable Market</div>
                                        <div className="text-4xl font-bold text-green-900">$45T</div>
                                        <div className="text-sm text-green-600 mt-2">
                                            Merchant acquiring, cross-border, disbursements
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 p-6 rounded-lg">
                                        <div className="text-sm text-purple-600 font-medium mb-2">Target Market</div>
                                        <div className="text-4xl font-bold text-purple-900">$2.3T</div>
                                        <div className="text-sm text-purple-600 mt-2">
                                            Multi-PSP platform segment
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3">Market Share Trajectory</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <div className="font-semibold text-slate-900">Year 1</div>
                                                <div className="text-sm text-slate-600">Early adopters, pilot programs</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-900">$500M</div>
                                                <div className="text-xs text-slate-500">0.02% of TAM</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <div className="font-semibold text-slate-900">Year 3</div>
                                                <div className="text-sm text-slate-600">Market validation, scale-up</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-slate-900">$5B</div>
                                                <div className="text-xs text-slate-500">0.16% of TAM</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <div>
                                                <div className="font-semibold text-green-900">Year 5</div>
                                                <div className="text-sm text-green-600">Market leader position</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-green-900">$25B</div>
                                                <div className="text-xs text-green-600">0.78% of TAM</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-blue-200">
                            <CardHeader>
                                <CardTitle>Competitive Advantages</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {competitiveAdvantages.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-900">{item.advantage}</div>
                                                <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                                                <div className="text-sm text-blue-600 font-medium mt-2">
                                                    💡 {item.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Implementation Roadmap Tab */}
                    <TabsContent value="roadmap" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Phased Implementation Roadmap</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Phase 1 */}
                                <div className="border-l-4 border-l-blue-500 pl-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-blue-600 text-white">Phase 1: Months 1-6</Badge>
                                        <span className="text-lg font-semibold text-slate-900">Foundation & Quick Wins</span>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Merchant Acquiring Platform:</strong> ISO 8583 gateway, sponsor acquirer partnerships (Elavon, Banking Circle), PCI DSS certification start</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Payment Orchestration:</strong> Smart routing engine, multi-acquirer support, cascading logic</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Subscription Billing:</strong> Enhance recurring payment module, dunning management</span>
                                        </div>
                                        <div className="text-xs text-blue-600 font-medium mt-3">
                                            💰 Target Revenue: $5M (10 PSPs onboarded)
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 2 */}
                                <div className="border-l-4 border-l-green-500 pl-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-green-600 text-white">Phase 2: Months 7-12</Badge>
                                        <span className="text-lg font-semibold text-slate-900">Market Expansion</span>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Cross-Border Payments:</strong> FX engine, multi-currency support, 150+ countries coverage</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Digital Wallets:</strong> Wallet accounts, P2P transfers, mobile SDK</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Payout Platform:</strong> Mass payouts, multi-method disbursements</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>PCI DSS Certification:</strong> Complete Level 1 certification</span>
                                        </div>
                                        <div className="text-xs text-green-600 font-medium mt-3">
                                            💰 Target Revenue: $15M cumulative (25 PSPs total)
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 3 */}
                                <div className="border-l-4 border-l-purple-500 pl-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-purple-600 text-white">Phase 3: Months 13-24</Badge>
                                        <span className="text-lg font-semibold text-slate-900">Advanced Products</span>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>BNPL Platform:</strong> Credit decisioning, installment plans, merchant risk sharing</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Crypto Rails:</strong> Multi-chain support, stablecoin settlements, on/off-ramp</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Embedded Finance:</strong> BaaS APIs, virtual accounts, card issuance</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>ML Fraud Prevention:</strong> Real-time scoring, behavioral analytics</span>
                                        </div>
                                        <div className="text-xs text-purple-600 font-medium mt-3">
                                            💰 Target Revenue: $60M cumulative (50 PSPs total)
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 4 */}
                                <div className="border-l-4 border-l-orange-500 pl-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Badge className="bg-orange-600 text-white">Phase 4: Months 25-36</Badge>
                                        <span className="text-lg font-semibold text-slate-900">Market Leadership</span>
                                    </div>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Regional Expansion:</strong> APAC sponsor acquirers, LATAM partnerships</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>API Marketplace:</strong> Third-party app ecosystem, developer platform</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>Advanced Analytics:</strong> Predictive modeling, merchant benchmarking, BI platform</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                            <span><strong>White-Label Expansion:</strong> Private-label programs for banks/large enterprises</span>
                                        </div>
                                        <div className="text-xs text-orange-600 font-medium mt-3">
                                            💰 Target Revenue: $120M cumulative (100 PSPs total)
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-green-200 bg-green-50">
                            <CardHeader>
                                <CardTitle className="text-green-900">Key Success Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-green-900">Growth Metrics</div>
                                        <div className="text-green-800">• PSP acquisition rate: 3-5 per month by Year 2</div>
                                        <div className="text-green-800">• ARPU growth: 20-30% YoY</div>
                                        <div className="text-green-800">• Transaction volume: $50B+ by Year 3</div>
                                        <div className="text-green-800">• Gross margin: 65-75% maintained</div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="font-semibold text-green-900">Operational Metrics</div>
                                        <div className="text-green-800">• Uptime SLA: 99.95%+</div>
                                        <div className="text-green-800">• Authorization latency: &lt;200ms</div>
                                        <div className="text-green-800">• Churn rate: &lt;5% annually</div>
                                        <div className="text-green-800">• NPS score: 50+ (industry leading)</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Final Recommendations */}
                <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-white">
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Rocket className="w-7 h-7 text-blue-600" />
                            Strategic Recommendations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="prose prose-slate max-w-none">
                            <h3 className="text-lg font-semibold text-slate-900">Immediate Actions (Next 30 Days)</h3>
                            <ol className="text-sm text-slate-700 space-y-1">
                                <li>Contact 3-5 sponsor acquirers (Elavon, Banking Circle, TSYS, FIS) for partnership discussions</li>
                                <li>Hire ISO 8583 specialist consultant ($15K-25K/month) to architect gateway infrastructure</li>
                                <li>Initiate PCI DSS Level 1 certification process with QSA (6-12 month timeline)</li>
                                <li>Define go-to-market strategy for first 10 PSPs (neobanks, fintech platforms)</li>
                                <li>Secure $3M-5M funding for infrastructure buildout and team expansion</li>
                            </ol>

                            <h3 className="text-lg font-semibold text-slate-900 mt-6">Critical Success Factors</h3>
                            <ul className="text-sm text-slate-700 space-y-1">
                                <li><strong>Speed to Market:</strong> Launch merchant acquiring within 6 months to capture first-mover advantage</li>
                                <li><strong>Partnership Quality:</strong> Tier-1 sponsor acquirers are non-negotiable for credibility</li>
                                <li><strong>Compliance First:</strong> PCI DSS certification unlocks enterprise customers</li>
                                <li><strong>Multi-Product Bundle:</strong> Cross-sell increases ARPU by 40-60%</li>
                                <li><strong>White-Label Excellence:</strong> Each PSP should feel like their own platform</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-slate-900 mt-6">Economic Moat</h3>
                            <p className="text-sm text-slate-700">
                                FTS.Money's <strong>defensible advantages</strong> are: (1) Multi-tenant architecture built for scale, 
                                (2) ISO standards compliance as core DNA, (3) White-label capabilities rare in the market, 
                                (4) Network effects from PSP-to-PSP wholesale marketplace, (5) Regulatory readiness (LEI/vLEI, PCI, PSD2) 
                                providing 12-18 month barrier to entry for competitors.
                            </p>

                            <div className="bg-blue-100 border-l-4 border-blue-600 p-4 mt-6">
                                <p className="text-sm text-blue-900 font-medium">
                                    <strong>Bottom Line:</strong> With existing infrastructure, FTS.Money can build a $300M revenue business 
                                    within 5 years by focusing on merchant acquiring, payment orchestration, and cross-border payments—
                                    three high-value products with massive TAM and natural fit with current capabilities.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}