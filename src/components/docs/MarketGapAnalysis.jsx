import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, AlertCircle, Info, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MarketGapAnalysis() {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">PSP Platform Market Gap Analysis</h1>
                <p className="text-slate-600">Comparison with market leaders: Stripe, Adyen, Checkout.com, PayPal, Spreedly, Primer</p>
                <p className="text-sm text-slate-500 mt-2">Analysis Date: December 2024</p>
            </div>

            <Tabs defaultValue="critical" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="critical">Critical Gaps</TabsTrigger>
                    <TabsTrigger value="high">High Priority</TabsTrigger>
                    <TabsTrigger value="nice">Nice-to-Have</TabsTrigger>
                    <TabsTrigger value="strengths">Strengths</TabsTrigger>
                    <TabsTrigger value="summary">Executive Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="critical" className="space-y-4">
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-900">
                                <AlertTriangle className="h-5 w-5" />
                                Critical Gaps - Must Have for Competitive PSP
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <GapItem
                                title="Network Tokenization"
                                description="Stripe, Adyen, and Checkout.com all offer automatic network tokenization (Visa, Mastercard Token Service) to improve authorization rates and reduce card decline rates by 2-3%."
                                impact="HIGH"
                                competitors="Stripe, Adyen, Checkout.com"
                                priority="CRITICAL"
                            />
                            
                            <GapItem
                                title="Account Updater Service"
                                description="Automatic card credential updates when cards are renewed or replaced. Essential for subscription/recurring payment businesses."
                                impact="HIGH"
                                competitors="Stripe, Adyen, Authorize.Net"
                                priority="CRITICAL"
                            />

                            <GapItem
                                title="Smart Retry Logic for Failed Payments"
                                description="Intelligent retry mechanisms with optimal timing based on decline codes. Stripe Billing and Adyen have sophisticated dunning management with machine learning."
                                impact="MEDIUM-HIGH"
                                competitors="Stripe, Adyen, Recurly"
                                priority="CRITICAL"
                            />

                            <GapItem
                                title="PCI DSS Level 1 Certification Status"
                                description="While platform has security features, explicit PCI DSS Level 1 certification and SAQ-D compliance documentation is not visible. All major PSPs display this prominently."
                                impact="HIGH"
                                competitors="All major PSPs"
                                priority="CRITICAL"
                            />

                            <GapItem
                                title="Real-time Payment Methods"
                                description="Missing instant payment schemes: FedNow (US), PIX (Brazil), UPI (India), Faster Payments (UK), SEPA Instant Credit Transfer (EU)."
                                impact="HIGH"
                                competitors="Adyen, Checkout.com, Stripe"
                                priority="CRITICAL"
                            />

                            <GapItem
                                title="Embedded Finance / Platform Features"
                                description="Stripe Connect, Adyen for Platforms - ability to onboard sub-merchants, split payments, manage payouts to connected accounts. Critical for marketplace and platform businesses."
                                impact="VERY HIGH"
                                competitors="Stripe Connect, Adyen for Platforms"
                                priority="CRITICAL"
                            />

                            <GapItem
                                title="Production-Ready SDKs"
                                description="Missing official SDKs in major languages (Node.js, Python, PHP, Ruby, Java, .NET, Go). Only base44 SDK exists. Stripe has 10+ language SDKs."
                                impact="HIGH"
                                competitors="Stripe, PayPal, Adyen"
                                priority="CRITICAL"
                            />

                            <GapItem
                                title="Pre-built Checkout UI Components"
                                description="No embeddable checkout forms, payment element, or hosted payment pages. Stripe Elements, Adyen Drop-in, Checkout.com Frames are industry standard."
                                impact="HIGH"
                                competitors="Stripe, Adyen, Checkout.com"
                                priority="CRITICAL"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="high" className="space-y-4">
                    <Card className="border-amber-200 bg-amber-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-900">
                                <AlertCircle className="h-5 w-5" />
                                High Priority Gaps - Competitive Differentiators
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <GapItem
                                title="Link Payment Method"
                                description="One-click checkout similar to Stripe Link, PayPal One Touch, or Amazon Pay. Significantly reduces checkout friction and increases conversion."
                                impact="MEDIUM"
                                competitors="Stripe Link, PayPal"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Buy Now Pay Later (BNPL) Integration"
                                description="Missing Klarna, Affirm, Afterpay, Clearpay integrations. BNPL is 25% of e-commerce checkout options in 2024."
                                impact="MEDIUM"
                                competitors="All major PSPs"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Revenue Recognition / Financial Reporting"
                                description="Stripe Revenue Recognition, automatic accrual accounting, GAAP/IFRS compliance reporting. Critical for enterprise merchants."
                                impact="MEDIUM"
                                competitors="Stripe, Zuora"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Tax Calculation Integration"
                                description="Stripe Tax, Avalara, TaxJar integration for automatic sales tax/VAT calculation. Essential for global merchants."
                                impact="MEDIUM"
                                competitors="Stripe, PayPal"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Advanced Fraud Tools"
                                description="Missing: device fingerprinting, behavioral analytics, velocity checks, custom fraud rules builder, machine learning risk scoring beyond basic implementation."
                                impact="MEDIUM-HIGH"
                                competitors="Stripe Radar, Adyen Risk Management"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Cascading / Retry Routing"
                                description="While basic routing exists, missing intelligent cascading to backup PSPs on failure, retry with different BINs/networks."
                                impact="MEDIUM"
                                competitors="Spreedly, Primer, BR-DGE"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Authorization Rate Optimization"
                                description="No A/B testing framework for routing rules, no authorization rate analytics by PSP/BIN/region to optimize routing decisions."
                                impact="MEDIUM"
                                competitors="Adyen, Primer"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Card Brand Direct Connections"
                                description="Platform appears to route through acquirers/processors. Direct Visa/Mastercard connections improve authorization rates and reduce costs."
                                impact="MEDIUM"
                                competitors="Adyen, Checkout.com"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Mobile SDKs (iOS/Android)"
                                description="No native mobile SDKs for iOS and Android payment integration. Critical for app-based businesses."
                                impact="MEDIUM-HIGH"
                                competitors="Stripe, PayPal, Adyen"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Instant Payouts"
                                description="Stripe Instant Payouts (within 30 minutes), PayPal Instant Transfer. Real-time settlement to merchants."
                                impact="MEDIUM"
                                competitors="Stripe, PayPal"
                                priority="HIGH"
                            />

                            <GapItem
                                title="Automated Testing / Sandbox Environment"
                                description="No visible test mode, test card numbers, webhook testing tools, or sandbox environment documentation."
                                impact="MEDIUM"
                                competitors="All major PSPs"
                                priority="HIGH"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="nice" className="space-y-4">
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <Info className="h-5 w-5" />
                                Nice-to-Have Features - Enhancement Opportunities
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <GapItem
                                title="Climate Contribution / Carbon Removal"
                                description="Stripe Climate - optional carbon removal contributions on transactions. Growing demand from eco-conscious merchants."
                                impact="LOW"
                                competitors="Stripe"
                                priority="NICE"
                            />

                            <GapItem
                                title="Identity Verification Service"
                                description="Stripe Identity - KYC verification for end customers, not just merchants. Useful for financial services, crypto platforms."
                                impact="LOW-MEDIUM"
                                competitors="Stripe, Jumio, Onfido"
                                priority="NICE"
                            />

                            <GapItem
                                title="Issuing / Card Creation"
                                description="Stripe Issuing, Adyen Issuing - create virtual/physical cards for disbursements, employee expenses, etc."
                                impact="LOW"
                                competitors="Stripe, Adyen, Marqeta"
                                priority="NICE"
                            />

                            <GapItem
                                title="Treasury / Banking as a Service"
                                description="Stripe Treasury - bank accounts, card management for platforms. Niche but high-value for fintech platforms."
                                impact="LOW"
                                competitors="Stripe, Adyen, Modern Treasury"
                                priority="NICE"
                            />

                            <GapItem
                                title="No-Code / Low-Code Tools"
                                description="Payment link builders, no-code checkout page creators, Zapier/Make integrations. Stripe Payment Links, Checkout Sessions."
                                impact="LOW-MEDIUM"
                                competitors="Stripe, Square"
                                priority="NICE"
                            />

                            <GapItem
                                title="Data Warehouse Sync"
                                description="Automatic data pipeline to BigQuery, Snowflake, Redshift for analytics. Stripe Sigma, Adyen Data Export."
                                impact="LOW"
                                competitors="Stripe, Adyen"
                                priority="NICE"
                            />

                            <GapItem
                                title="Pre-built Integrations Marketplace"
                                description="App marketplace with pre-built integrations to e-commerce platforms, accounting software, CRMs (Shopify, WooCommerce, QuickBooks, Xero, Salesforce)."
                                impact="MEDIUM"
                                competitors="Stripe Apps, PayPal Commerce"
                                priority="NICE"
                            />

                            <GapItem
                                title="White-label / Branding Options"
                                description="While appearance settings exist, missing comprehensive white-label hosting, custom domain support, branded emails with merchant logos."
                                impact="LOW-MEDIUM"
                                competitors="Checkout.com, PayPal"
                                priority="NICE"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="strengths" className="space-y-4">
                    <Card className="border-emerald-200 bg-emerald-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-emerald-900">
                                <CheckCircle2 className="h-5 w-5" />
                                Platform Strengths - Competitive Advantages
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <StrengthItem
                                title="Comprehensive Crypto Payment Support"
                                description="Native crypto transaction processing, blockchain connectors, crypto exchange integrations (on-ramp/off-ramp). More advanced than most traditional PSPs."
                                advantage="Leading edge - Stripe/Adyen only recently added crypto"
                            />

                            <StrengthItem
                                title="Advanced Payment Orchestration"
                                description="Both rule-based and AI-powered routing. Most PSPs only offer basic rule-based routing. Primer and Spreedly are specialized competitors here."
                                advantage="Matches specialized orchestration platforms"
                            />

                            <StrengthItem
                                title="MID-Level Pricing Granularity"
                                description="Ability to configure different pricing per MID per merchant, with payment method-specific rates. More granular than standard merchant-level pricing."
                                advantage="More flexible than Stripe/PayPal"
                            />

                            <StrengthItem
                                title="Payout Orchestration"
                                description="Dedicated payout routing and management for both fiat and crypto. Most PSPs have basic payouts but not orchestration."
                                advantage="Advanced feature not common in standard PSPs"
                            />

                            <StrengthItem
                                title="Extensive ISO Standards Support"
                                description="ISO 8583, 20022, 23257 (blockchain), 24165 (DTI) support built-in. More comprehensive than most modern PSPs who focus on REST APIs."
                                advantage="Strong for bank and legacy system integration"
                            />

                            <StrengthItem
                                title="Compliance Suite"
                                description="Integrated KYB, AML, LEI verification, FATF compliance, sanctions screening. Usually requires separate providers (Stripe uses Stripe Identity, others use Onfido/Jumio)."
                                advantage="More integrated than competitors"
                            />

                            <StrengthItem
                                title="Multi-Entity Management"
                                description="Built for PSP use case with multi-merchant management, not just single merchant. Competes with Stripe Connect, Adyen for Platforms."
                                advantage="Purpose-built for payment facilitators"
                            />

                            <StrengthItem
                                title="Transparent Fee Structure Display"
                                description="Clear buy rate vs sell rate visibility, fee type management, detailed billing/invoicing. More transparent than typical PSP black boxes."
                                advantage="Better cost visibility for merchants"
                            />

                            <StrengthItem
                                title="Unified Virtual Terminal"
                                description="Single VT for card present, card not present, crypto, and alternative payment methods. Most PSPs have separate systems."
                                advantage="More unified than traditional PSPs"
                            />

                            <StrengthItem
                                title="AI-Powered Features"
                                description="AI payment routing, automated dispute resolution, anomaly detection. Leading-edge features that most PSPs are still developing."
                                advantage="Ahead of most PSPs except Stripe/Adyen"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Executive Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Market Position</h3>
                                <p className="text-slate-700">
                                    This platform is positioned as a <strong>comprehensive PSP and payment orchestration platform</strong> targeting payment facilitators, 
                                    large enterprises, and businesses needing advanced routing capabilities. It competes most directly with:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-600">
                                    <li><strong>Adyen</strong> - multi-merchant management, global processing</li>
                                    <li><strong>Spreedly/Primer</strong> - payment orchestration specialists</li>
                                    <li><strong>Checkout.com</strong> - advanced routing and optimization</li>
                                    <li><strong>Stripe Connect</strong> - platform payment features</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Critical Action Items (3-6 months)</h3>
                                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                                    <li><strong>Network Tokenization</strong> - Partner with Visa/Mastercard Token Service (2-3% authorization lift)</li>
                                    <li><strong>Pre-built Checkout UI</strong> - Embeddable payment forms/elements (critical for developer adoption)</li>
                                    <li><strong>Language SDKs</strong> - Node.js, Python, PHP SDKs at minimum (blocks 80% of developers)</li>
                                    <li><strong>Account Updater</strong> - Essential for subscription businesses (major use case)</li>
                                    <li><strong>PCI DSS Certification</strong> - Display Level 1 certification prominently (trust factor)</li>
                                    <li><strong>Embedded Finance</strong> - Sub-merchant onboarding, split payments (opens marketplace segment)</li>
                                    <li><strong>Real-time Payments</strong> - FedNow, PIX, UPI, SEPA Instant (geographic expansion)</li>
                                    <li><strong>Test Environment</strong> - Sandbox mode with test cards (developer experience)</li>
                                </ol>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Strategic Recommendations</h3>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-medium text-slate-900">1. Developer Experience First</h4>
                                        <p className="text-sm text-slate-600">
                                            Stripe's success is 80% developer experience. Invest in SDKs, documentation, sandbox environment, 
                                            and pre-built UI components before adding more backend features.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">2. Leverage Crypto Advantage</h4>
                                        <p className="text-sm text-slate-600">
                                            Your crypto capabilities exceed traditional PSPs. Market heavily to Web3, NFT platforms, 
                                            gaming, and crypto-native businesses where you have a clear edge.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">3. Focus on Payment Facilitators</h4>
                                        <p className="text-sm text-slate-600">
                                            Your multi-merchant architecture is excellent for PayFacs. Target platforms, marketplaces, 
                                            and SaaS companies needing to embed payments (vs competing with Stripe for single merchants).
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">4. Orchestration as Core Differentiator</h4>
                                        <p className="text-sm text-slate-600">
                                            Your AI-powered orchestration is advanced. Package this as the primary value prop: 
                                            "Best authorization rates through intelligent routing" - measurable ROI story.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Competitive Matrix</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border">
                                        <thead className="bg-slate-100">
                                            <tr>
                                                <th className="border p-2 text-left">Feature Category</th>
                                                <th className="border p-2">This Platform</th>
                                                <th className="border p-2">Stripe</th>
                                                <th className="border p-2">Adyen</th>
                                                <th className="border p-2">Primer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border p-2">Payment Orchestration</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟡</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟢</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">Crypto Support</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟡</td>
                                                <td className="border p-2 text-center">🔴</td>
                                                <td className="border p-2 text-center">🔴</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">Developer SDKs</td>
                                                <td className="border p-2 text-center">🔴</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟢</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">Network Tokenization</td>
                                                <td className="border p-2 text-center">🔴</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟡</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">Embedded Finance</td>
                                                <td className="border p-2 text-center">🔴</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🔴</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">Compliance Suite</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟡</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🔴</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">Multi-Merchant Management</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟡</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🔴</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2">UI Components</td>
                                                <td className="border p-2 text-center">🔴</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟢</td>
                                                <td className="border p-2 text-center">🟡</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">🟢 Strong | 🟡 Partial | 🔴 Missing</p>
                            </div>

                            <div className="bg-slate-100 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Bottom Line</h3>
                                <p className="text-slate-700">
                                    This platform has <strong>excellent PSP/orchestration backend infrastructure</strong> with unique 
                                    advantages in crypto and multi-merchant management. The primary gap is <strong>developer experience</strong>: 
                                    SDKs, pre-built UI components, and sandbox environment. Closing these gaps would make it highly competitive 
                                    with Adyen/Checkout.com while maintaining advantages over Stripe in orchestration and crypto.
                                </p>
                                <p className="text-slate-700 mt-2">
                                    <strong>Target Market:</strong> Payment facilitators, marketplaces, crypto platforms, enterprises needing 
                                    advanced routing - NOT small businesses looking for simple Stripe alternative.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function GapItem({ title, description, impact, competitors, priority }) {
    const priorityColors = {
        CRITICAL: 'bg-red-100 text-red-700 border-red-300',
        HIGH: 'bg-amber-100 text-amber-700 border-amber-300',
        NICE: 'bg-blue-100 text-blue-700 border-blue-300'
    };

    return (
        <div className="border-l-4 pl-4 py-2 border-slate-300">
            <div className="flex items-start justify-between mb-1">
                <h4 className="font-semibold text-slate-900">{title}</h4>
                <Badge className={priorityColors[priority]}>{priority}</Badge>
            </div>
            <p className="text-sm text-slate-700 mb-2">{description}</p>
            <div className="flex gap-4 text-xs text-slate-600">
                <span><strong>Impact:</strong> {impact}</span>
                <span><strong>Leaders:</strong> {competitors}</span>
            </div>
        </div>
    );
}

function StrengthItem({ title, description, advantage }) {
    return (
        <div className="border-l-4 pl-4 py-2 border-emerald-300">
            <h4 className="font-semibold text-emerald-900 mb-1">{title}</h4>
            <p className="text-sm text-slate-700 mb-2">{description}</p>
            <p className="text-xs text-emerald-700"><strong>Advantage:</strong> {advantage}</p>
        </div>
    );
}