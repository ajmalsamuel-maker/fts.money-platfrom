import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
    ArrowRight, 
    ArrowLeftRight, 
    CheckCircle, 
    Coins,
    CreditCard,
    DollarSign,
    FileText,
    Gift,
    Network,
    Shuffle,
    TrendingUp,
    Wallet,
    Zap
} from 'lucide-react';

/**
 * Payment Switch Integration Matrix
 * Comprehensive mapping of service interoperability across FTS platform
 * 
 * Research Sources:
 * - Payment Switch Architecture (ISO 8583, ISO 20022)
 * - Payment Orchestration Patterns
 * - Crypto On/Off Ramp Integration
 * - RWA Tokenization Payment Flows
 * - Loyalty Platform Payment Integration
 * - E-Invoicing Real-Time Settlement
 */

export default function PaymentSwitchIntegrationMatrix() {
    const [activeTab, setActiveTab] = useState('overview');

    // Core Integration Scenarios
    const integrationScenarios = {
        // PAYMENT PROVIDER → SERVICES
        provider_to_services: [
            {
                source: 'Payment Provider Management',
                target: 'PSP Services',
                flow: 'One-to-Many',
                scenarios: [
                    'Provider configured once → Available to all PSP instances',
                    'PSP selects providers from centralized registry',
                    'Volume limits enforced per PSP',
                    'Pricing inheritance with PSP-specific overrides'
                ],
                businessValue: 'Reduce configuration overhead, ensure consistency'
            },
            {
                source: 'Payment Provider Management',
                target: 'Payment Orchestration',
                flow: 'Many-to-One',
                scenarios: [
                    'Orchestration customer receives all assigned providers',
                    'Smart routing based on currency, region, cost',
                    'Load balancing across multiple providers',
                    'Automatic failover on provider downtime'
                ],
                businessValue: 'Optimize success rates, reduce costs, ensure uptime'
            },
            {
                source: 'Payment Provider Management',
                target: 'Crypto Banking',
                flow: 'Bidirectional',
                scenarios: [
                    'Fiat on-ramp: Traditional payment methods → Crypto purchase',
                    'Fiat off-ramp: Crypto sale → Bank transfer/card payout',
                    'Stablecoin settlement via payment rails',
                    'Real-time FX conversion for cross-border crypto'
                ],
                businessValue: 'Bridge TradFi and DeFi, enable instant liquidity'
            },
            {
                source: 'Payment Provider Management',
                target: 'RWA Platform',
                flow: 'Bidirectional',
                scenarios: [
                    'Investor top-up: Card/bank → RWA token purchase',
                    'Dividend distribution: RWA platform → Investor bank account',
                    'Redemption: Sell RWA tokens → Fiat withdrawal',
                    'Secondary market settlement via payment rails'
                ],
                businessValue: 'Enable fractional ownership, instant settlement'
            },
            {
                source: 'Payment Provider Management',
                target: 'E-Invoicing',
                flow: 'One-Way',
                scenarios: [
                    'Invoice payment via assigned providers',
                    'Real-time payment confirmation (ISO 20022)',
                    'Instant reconciliation with invoice system',
                    'Multi-currency invoice settlement'
                ],
                businessValue: 'Automate AR, reduce DSO, improve cash flow'
            },
            {
                source: 'Payment Provider Management',
                target: 'Loyalty Platform',
                flow: 'Bidirectional',
                scenarios: [
                    'Point purchase: Payment provider → Loyalty wallet top-up',
                    'Point redemption: Loyalty points → Cash-out via provider',
                    'Pay-with-points at checkout (instant conversion)',
                    'Tokenized loyalty points tradeable via payment rails'
                ],
                businessValue: 'Increase engagement, reduce liability, enable liquidity'
            }
        ],

        // ISO GATEWAY INTEROPERABILITY
        iso_gateway_integration: [
            {
                source: 'ISO 8583 Gateway',
                target: 'Payment Switch',
                flow: 'Bidirectional',
                scenarios: [
                    'ISO Gateway as payment method: Bank acquirer → Switch routing',
                    'Switch routes transactions to ISO Gateway for legacy systems',
                    'ISO 8583 to JSON translation for modern APIs',
                    'Stand-in processing when primary gateway is down'
                ],
                businessValue: 'Bridge legacy and modern infrastructure'
            },
            {
                source: 'ISO 8583 Gateway',
                target: 'Crypto Banking',
                flow: 'One-Way',
                scenarios: [
                    'Card-to-crypto: ISO 8583 authorization → Crypto purchase',
                    'ATM withdrawal: Crypto balance → ISO 8583 cash dispensing',
                    'POS payments: Crypto wallet → ISO 8583 merchant settlement'
                ],
                businessValue: 'Enable crypto spending at traditional POS/ATM'
            },
            {
                source: 'ISO 8583 Gateway',
                target: 'RWA Platform',
                flow: 'Bidirectional',
                scenarios: [
                    'RWA-backed card: Tokenized asset → ISO 8583 spending power',
                    'Instant settlement: ISO 8583 transaction → RWA token redemption'
                ],
                businessValue: 'Create RWA-backed payment instruments'
            }
        ],

        // ORCHESTRATION LAYER SCENARIOS
        orchestration_scenarios: [
            {
                name: 'Multi-Provider Routing',
                description: 'Intelligent transaction routing across providers',
                rules: [
                    'Cost optimization: Route to cheapest provider per transaction type',
                    'Success rate optimization: Route to highest approval rate',
                    'Geographic routing: Local acquirer for domestic transactions',
                    'Currency routing: Native currency provider preference',
                    'Load balancing: Distribute volume to prevent bottlenecks',
                    'Time-based routing: Different providers for peak/off-peak'
                ]
            },
            {
                name: 'Failover & Redundancy',
                description: 'Automatic failover for high availability',
                rules: [
                    'Primary provider down → Cascade to secondary',
                    'Circuit breaker: Auto-disable failing providers',
                    'Health checks: Real-time provider status monitoring',
                    'Smart retry: Exponential backoff with provider switching'
                ]
            },
            {
                name: 'Hybrid Payment Flows',
                description: 'Combine multiple payment methods',
                rules: [
                    'Split payments: Card + loyalty points + crypto',
                    'Multi-currency: Auto-convert via best FX provider',
                    'Installments: Route to BNPL provider automatically',
                    'Top-up cascade: Try card → bank → wallet → crypto'
                ]
            }
        ],

        // CRYPTO BANKING INTEGRATION
        crypto_scenarios: [
            {
                type: 'Fiat On-Ramp',
                methods: [
                    'Card payment → Instant crypto purchase (Stripe, Adyen)',
                    'Bank transfer → Delayed crypto credit (ACH, SEPA)',
                    'Mobile wallet → Crypto via aggregator (Apple Pay, Google Pay)',
                    'Cash → Crypto via partnered locations'
                ],
                considerations: 'KYC/AML requirements, settlement time, fees'
            },
            {
                type: 'Fiat Off-Ramp',
                methods: [
                    'Crypto sale → Bank transfer payout',
                    'Crypto → Card reload (crypto debit cards)',
                    'Crypto → P2P fiat transfer',
                    'Crypto → Bill payment via provider'
                ],
                considerations: 'Withdrawal limits, processing time, tax reporting'
            },
            {
                type: 'Crypto-Native Payments',
                methods: [
                    'Stablecoin payments via blockchain rails',
                    'Lightning Network for instant Bitcoin payments',
                    'DeFi protocol integration (Uniswap, Aave)',
                    'Cross-chain swaps for currency conversion'
                ],
                considerations: 'Gas fees, settlement finality, slippage'
            }
        ],

        // RWA TOKENIZATION FLOWS
        rwa_scenarios: [
            {
                phase: 'Primary Issuance',
                flows: [
                    'Investor: Fiat payment → RWA token minting',
                    'Payment methods: Card, bank transfer, crypto, wire',
                    'Fractional ownership: Minimum investment thresholds',
                    'KYC/AML: Accreditation verification before purchase'
                ]
            },
            {
                phase: 'Secondary Trading',
                flows: [
                    'Buyer: Fiat payment → RWA token purchase from seller',
                    'Seller: RWA token sale → Fiat payout',
                    'Payment switch routes settlement between parties',
                    'Instant settlement via stablecoin rails'
                ]
            },
            {
                phase: 'Income Distribution',
                flows: [
                    'Dividend payout: RWA platform → Investor bank account',
                    'Payment routing via investor preferred method',
                    'Multi-currency distribution based on investor location',
                    'Reinvestment option: Auto-purchase more RWA tokens'
                ]
            },
            {
                phase: 'Redemption',
                flows: [
                    'Token burn → Fiat refund to investor',
                    'Asset sale → Pro-rata distribution to token holders',
                    'Payment switch handles mass payouts',
                    'Tax withholding integration'
                ]
            }
        ],

        // E-INVOICING INTEGRATION
        einvoicing_scenarios: [
            {
                stage: 'Invoice Issuance',
                integrations: [
                    'Invoice created → Payment link with provider options',
                    'Smart invoice: Supports multiple payment methods',
                    'QR code payments: Instant bank transfer (ISO 20022)',
                    'Request to Pay (RTP) integration for real-time settlement'
                ]
            },
            {
                stage: 'Payment Processing',
                integrations: [
                    'Customer pays → Payment switch routes via optimal provider',
                    'Instant confirmation via ISO 20022 rich data',
                    'Auto-reconciliation: Payment matched to invoice',
                    'Multi-currency: Auto-conversion at payment time'
                ]
            },
            {
                stage: 'Settlement & Reconciliation',
                integrations: [
                    'Real-time settlement notification to ERP',
                    'Bank statement auto-import (CAMT.053)',
                    'Discrepancy detection and alerting',
                    'Automated payment reminders for overdue invoices'
                ]
            }
        ],

        // LOYALTY PLATFORM FLOWS
        loyalty_scenarios: [
            {
                action: 'Earn Points',
                methods: [
                    'Transaction: Payment via provider → Auto-credit loyalty points',
                    'Bonus: Promotional spend → Multiplier points',
                    'Referral: New customer → Reward points',
                    'Social: Share/engage → Micro-rewards'
                ]
            },
            {
                action: 'Redeem Points',
                methods: [
                    'Cash-out: Points → Bank transfer via payment provider',
                    'Shop: Points → Product purchase settlement',
                    'Donate: Points → Charity payment',
                    'Transfer: P2P points transfer (blockchain rails)'
                ]
            },
            {
                action: 'Tokenized Loyalty',
                methods: [
                    'Points on blockchain: ERC-20 tokens',
                    'Tradeable: Secondary market via crypto exchanges',
                    'DeFi integration: Stake points for yield',
                    'Cross-brand: Universal loyalty token'
                ]
            },
            {
                action: 'Pay with Points',
                methods: [
                    'Checkout: Points + card split payment',
                    'Instant conversion: Points → Fiat via payment switch',
                    'Dynamic value: Real-time point valuation',
                    'Merchant settlement: Platform pays merchant in fiat'
                ]
            }
        ]
    };

    // Service Compatibility Matrix
    const compatibilityMatrix = [
        {
            service: 'PSP',
            payment_providers: 'Full',
            iso_gateway: 'Full',
            orchestration: 'Consumer',
            crypto: 'On/Off-Ramp',
            rwa: 'Payment Rail',
            einvoicing: 'Provider',
            loyalty: 'Integration'
        },
        {
            service: 'ISO Gateway',
            payment_providers: 'Limited',
            iso_gateway: 'Native',
            orchestration: 'Provider',
            crypto: 'Bridge',
            rwa: 'Settlement',
            einvoicing: 'Legacy',
            loyalty: 'POS Integration'
        },
        {
            service: 'Orchestration',
            payment_providers: 'Full',
            iso_gateway: 'Full',
            orchestration: 'Native',
            crypto: 'Aggregator',
            rwa: 'Router',
            einvoicing: 'Router',
            loyalty: 'Router'
        },
        {
            service: 'Crypto Banking',
            payment_providers: 'On/Off-Ramp',
            iso_gateway: 'Bridge',
            orchestration: 'Consumer',
            crypto: 'Native',
            rwa: 'Settlement',
            einvoicing: 'Payout',
            loyalty: 'Reward Medium'
        },
        {
            service: 'RWA Platform',
            payment_providers: 'Top-up/Payout',
            iso_gateway: 'Settlement',
            orchestration: 'Consumer',
            crypto: 'Settlement',
            rwa: 'Native',
            einvoicing: 'Distribution',
            loyalty: 'Asset Rewards'
        },
        {
            service: 'E-Invoicing',
            payment_providers: 'Collection',
            iso_gateway: 'Legacy',
            orchestration: 'Consumer',
            crypto: 'Alternative',
            rwa: 'Distribution',
            einvoicing: 'Native',
            loyalty: 'Incentive'
        },
        {
            service: 'Loyalty Platform',
            payment_providers: 'Earn/Redeem',
            iso_gateway: 'POS',
            orchestration: 'Consumer',
            crypto: 'Tokenization',
            rwa: 'Asset Rewards',
            einvoicing: 'Incentive',
            loyalty: 'Native'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Payment Switch Integration Matrix</h1>
                <p className="text-slate-600">
                    Comprehensive service interoperability mapping for FTS.Money platform
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="providers">Payment Providers</TabsTrigger>
                    <TabsTrigger value="iso">ISO Gateway</TabsTrigger>
                    <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
                    <TabsTrigger value="crypto">Crypto Banking</TabsTrigger>
                    <TabsTrigger value="rwa">RWA Platform</TabsTrigger>
                    <TabsTrigger value="einvoicing">E-Invoicing</TabsTrigger>
                    <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
                    <TabsTrigger value="matrix">Compatibility Matrix</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5 text-blue-600" />
                                Platform Integration Architecture
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                        <CreditCard className="h-4 w-4" />
                                        Payment Provider Hub
                                    </h4>
                                    <p className="text-sm text-blue-800">
                                        Central registry of payment methods (Stripe, PayPal, Adyen, etc.) 
                                        configured once and provisioned to all services
                                    </p>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                        <Shuffle className="h-4 w-4" />
                                        Payment Switch
                                    </h4>
                                    <p className="text-sm text-purple-800">
                                        Intelligent routing layer that directs transactions to optimal 
                                        providers based on rules, cost, and availability
                                    </p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                                        <Network className="h-4 w-4" />
                                        Service Ecosystem
                                    </h4>
                                    <p className="text-sm text-emerald-800">
                                        PSP, ISO Gateway, Orchestration, Crypto, RWA, E-Invoicing, 
                                        Loyalty all interconnected via unified payment rails
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-lg p-6">
                                <h4 className="font-semibold mb-4">Core Integration Principles</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Configure Once, Use Everywhere</p>
                                            <p className="text-sm text-slate-600">
                                                Payment providers set up in central registry are automatically 
                                                available to all services
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Bidirectional Money Flow</p>
                                            <p className="text-sm text-slate-600">
                                                Services can both receive and send payments through 
                                                the switch (top-ups, payouts, settlements)
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Intelligent Routing</p>
                                            <p className="text-sm text-slate-600">
                                                Switch automatically selects best provider based on cost, 
                                                success rate, geography, and business rules
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Real-Time Settlement</p>
                                            <p className="text-sm text-slate-600">
                                                ISO 20022 standards enable instant settlement with 
                                                rich data for auto-reconciliation
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payment Providers Tab */}
                <TabsContent value="providers" className="space-y-4">
                    {integrationScenarios.provider_to_services.map((scenario, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {scenario.source}
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    {scenario.target}
                                    <Badge variant="outline">{scenario.flow}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-sm text-slate-700 mb-2">Integration Scenarios:</h4>
                                    <ul className="space-y-1">
                                        {scenario.scenarios.map((s, i) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <Zap className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded p-3">
                                    <p className="text-sm font-medium text-green-900">
                                        <TrendingUp className="h-4 w-4 inline mr-1" />
                                        Business Value: {scenario.businessValue}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* ISO Gateway Tab */}
                <TabsContent value="iso" className="space-y-4">
                    {integrationScenarios.iso_gateway_integration.map((scenario, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {scenario.source}
                                    <ArrowLeftRight className="h-4 w-4 text-slate-400" />
                                    {scenario.target}
                                    <Badge variant="outline">{scenario.flow}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <ul className="space-y-2">
                                    {scenario.scenarios.map((s, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                                    <p className="text-sm font-medium text-blue-900">{scenario.businessValue}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Orchestration Tab */}
                <TabsContent value="orchestration" className="space-y-4">
                    {integrationScenarios.orchestration_scenarios.map((scenario, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg">{scenario.name}</CardTitle>
                                <p className="text-sm text-slate-600">{scenario.description}</p>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {scenario.rules.map((rule, i) => (
                                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                            <Shuffle className="h-4 w-4 text-purple-500 mt-0.5" />
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Crypto Banking Tab */}
                <TabsContent value="crypto" className="space-y-4">
                    {integrationScenarios.crypto_scenarios.map((scenario, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Coins className="h-5 w-5 text-amber-600" />
                                    {scenario.type}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <h4 className="font-semibold text-sm mb-2">Payment Methods:</h4>
                                    <ul className="space-y-1">
                                        {scenario.methods.map((method, i) => (
                                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                <ArrowRight className="h-4 w-4 text-slate-400 mt-0.5" />
                                                {method}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-amber-50 border border-amber-200 rounded p-2">
                                    <p className="text-xs text-amber-900">
                                        <strong>Considerations:</strong> {scenario.considerations}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* RWA Platform Tab */}
                <TabsContent value="rwa" className="space-y-4">
                    {integrationScenarios.rwa_scenarios.map((scenario, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-indigo-600" />
                                    {scenario.phase}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {scenario.flows.map((flow, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <DollarSign className="h-4 w-4 text-indigo-500 mt-0.5" />
                                            {flow}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* E-Invoicing Tab */}
                <TabsContent value="einvoicing" className="space-y-4">
                    {integrationScenarios.einvoicing_scenarios.map((scenario, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    {scenario.stage}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {scenario.integrations.map((integration, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <Zap className="h-4 w-4 text-blue-500 mt-0.5" />
                                            {integration}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Loyalty Tab */}
                <TabsContent value="loyalty" className="space-y-4">
                    {integrationScenarios.loyalty_scenarios.map((scenario, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Gift className="h-5 w-5 text-pink-600" />
                                    {scenario.action}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {scenario.methods.map((method, i) => (
                                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-pink-500 mt-0.5" />
                                            {method}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                {/* Compatibility Matrix Tab */}
                <TabsContent value="matrix">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Compatibility Matrix</CardTitle>
                            <p className="text-sm text-slate-600">
                                Interoperability levels between services
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2 font-semibold">Service</th>
                                            <th className="text-center p-2 font-semibold">Payment Providers</th>
                                            <th className="text-center p-2 font-semibold">ISO Gateway</th>
                                            <th className="text-center p-2 font-semibold">Orchestration</th>
                                            <th className="text-center p-2 font-semibold">Crypto</th>
                                            <th className="text-center p-2 font-semibold">RWA</th>
                                            <th className="text-center p-2 font-semibold">E-Invoicing</th>
                                            <th className="text-center p-2 font-semibold">Loyalty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {compatibilityMatrix.map((row, idx) => (
                                            <tr key={idx} className="border-b hover:bg-slate-50">
                                                <td className="p-2 font-medium">{row.service}</td>
                                                <td className="p-2 text-center">
                                                    <Badge variant={row.payment_providers === 'Full' ? 'default' : 'outline'}>
                                                        {row.payment_providers}
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge variant={row.iso_gateway === 'Native' || row.iso_gateway === 'Full' ? 'default' : 'outline'}>
                                                        {row.iso_gateway}
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge variant={row.orchestration === 'Native' || row.orchestration === 'Full' ? 'default' : 'outline'}>
                                                        {row.orchestration}
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge variant={row.crypto === 'Native' ? 'default' : 'outline'}>
                                                        {row.crypto}
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge variant={row.rwa === 'Native' ? 'default' : 'outline'}>
                                                        {row.rwa}
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge variant={row.einvoicing === 'Native' ? 'default' : 'outline'}>
                                                        {row.einvoicing}
                                                    </Badge>
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Badge variant={row.loyalty === 'Native' ? 'default' : 'outline'}>
                                                        {row.loyalty}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 flex gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <Badge>Full/Native</Badge>
                                    <span className="text-slate-600">Complete integration</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge variant="outline">Limited/Bridge</Badge>
                                    <span className="text-slate-600">Partial integration</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}