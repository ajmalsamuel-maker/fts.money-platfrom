import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Leaf, Zap, Users, DollarSign, Globe, Shield, TrendingUp, Coins } from 'lucide-react';

export default function NanoSustainabilityIntegration() {
    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <div className="border-l-4 border-green-500 pl-4 mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    Nano Sustainability Integration
                </h1>
                <p className="text-xl text-slate-600">
                    Strategic Analysis: Integrating Gamified Sustainability into FTS.Money Ecosystem
                </p>
            </div>

            {/* Executive Summary */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-6 w-6 text-green-600" />
                        Executive Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-slate-700">
                            <strong>Concept:</strong> Integrate 2Cimple's Nano (gamified sustainability platform) 
                            with FTS.Money's payment infrastructure to create an ecosystem that rewards eco-friendly 
                            actions with seamless payments, merchant partnerships, and tokenized carbon credits.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mt-4">
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <div className="text-2xl font-bold text-green-600">$127B</div>
                                <div className="text-sm text-slate-600">Green Fintech Market by 2030</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <div className="text-2xl font-bold text-green-600">73%</div>
                                <div className="text-sm text-slate-600">Gen Z prefer sustainable brands</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border border-green-200">
                                <div className="text-2xl font-bold text-green-600">CAGR 24%</div>
                                <div className="text-sm text-slate-600">Gametech growth rate</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="integration">Integration</TabsTrigger>
                    <TabsTrigger value="architecture">Architecture</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                    <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                    <TabsTrigger value="implementation">Implementation</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>What is Nano?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-700">
                                Nano is a gamified sustainability platform that empowers users to make positive 
                                environmental impact through small, rewarding actions called "nano tasks."
                            </p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="border-l-4 border-green-500 pl-4">
                                    <h4 className="font-semibold text-green-700 mb-2">Nano Tasks Examples</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                        <li>Reduce plastic use (scan receipts)</li>
                                        <li>Plant trees (verify with photos)</li>
                                        <li>Use public transport (GPS tracking)</li>
                                        <li>Recycle (QR code verification)</li>
                                        <li>Reduce energy consumption</li>
                                    </ul>
                                </div>
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h4 className="font-semibold text-blue-700 mb-2">Reward Mechanisms</h4>
                                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                        <li>Points/tokens for completed tasks</li>
                                        <li>Merchant discounts & cashback</li>
                                        <li>Carbon credit certificates</li>
                                        <li>NFT achievement badges</li>
                                        <li>Donation matching to green causes</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Why This Matters for FTS.Money</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-2 bg-green-100 rounded">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Market Differentiation</h4>
                                            <p className="text-sm text-slate-600">
                                                First payment orchestrator with native sustainability layer
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-2 bg-blue-100 rounded">
                                            <Users className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">New Customer Segments</h4>
                                            <p className="text-sm text-slate-600">
                                                Attract Gen Z/Millennial eco-conscious consumers & merchants
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-2 bg-purple-100 rounded">
                                            <DollarSign className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">New Revenue Streams</h4>
                                            <p className="text-sm text-slate-600">
                                                Carbon credit marketplace, ESG-as-a-Service, premium sustainability features
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-2 bg-orange-100 rounded">
                                            <Shield className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Regulatory Advantage</h4>
                                            <p className="text-sm text-slate-600">
                                                Built-in ESG compliance for EU Green Deal, CSRD requirements
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Integration Tab */}
                <TabsContent value="integration" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Integration Points Across FTS.Money Ecosystem</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Payment Processing */}
                            <div className="border-l-4 border-indigo-500 pl-4">
                                <h3 className="text-lg font-semibold text-indigo-700 mb-3">
                                    1. Payment Infrastructure Layer
                                </h3>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Green Payment Routing:</strong> Merchants flagged as "eco-friendly" get payment routing priority</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Carbon Footprint Tracking:</strong> Real-time CO₂ calculation per transaction based on merchant category</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-blue-100 text-blue-700">Enhanced</Badge>
                                        <span><strong>Auto-Offset Payments:</strong> Optional roundup feature donates to carbon offset projects</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-blue-100 text-blue-700">Enhanced</Badge>
                                        <span><strong>Nano Rewards Integration:</strong> Earn points on every "green" transaction processed via FTS.Money</span>
                                    </div>
                                </div>
                            </div>

                            {/* Community Portal */}
                            <div className="border-l-4 border-purple-500 pl-4">
                                <h3 className="text-lg font-semibold text-purple-700 mb-3">
                                    2. Community Portal (PSPs)
                                </h3>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Sustainability Module:</strong> PSPs can enable "Green Package" for their merchants</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Merchant Sponsorships:</strong> Merchants sponsor nano tasks (e.g., "Recycle and get 10% off")</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-blue-100 text-blue-700">Enhanced</Badge>
                                        <span><strong>ESG Dashboard:</strong> Real-time reporting on merchant carbon impact, task completions</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-purple-100 text-purple-700">Premium</Badge>
                                        <span><strong>White-Label Nano:</strong> PSPs can offer branded sustainability apps to their merchants</span>
                                    </div>
                                </div>
                            </div>

                            {/* Crypto Gateway */}
                            <div className="border-l-4 border-orange-500 pl-4">
                                <h3 className="text-lg font-semibold text-orange-700 mb-3">
                                    3. Crypto Gateway (Striga Integration)
                                </h3>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Carbon Token (CRBN):</strong> Mint tokenized carbon credits on Polygon/Base</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Nano Rewards Token (NANO):</strong> ERC-20 token for completed sustainability tasks</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-blue-100 text-blue-700">Enhanced</Badge>
                                        <span><strong>NFT Certificates:</strong> On-chain sustainability achievement badges</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-purple-100 text-purple-700">Premium</Badge>
                                        <span><strong>DeFi Staking:</strong> Stake NANO tokens for higher rewards, governance voting</span>
                                    </div>
                                </div>
                            </div>

                            {/* RWA Platform */}
                            <div className="border-l-4 border-green-500 pl-4">
                                <h3 className="text-lg font-semibold text-green-700 mb-3">
                                    4. RWA Tokenization Platform
                                </h3>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Green Bonds:</strong> Tokenize environmental projects (solar farms, reforestation)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Fractional Ownership:</strong> Invest in carbon offset projects with $50 minimums</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-blue-100 text-blue-700">Enhanced</Badge>
                                        <span><strong>Impact Dividends:</strong> Investors receive carbon credits as dividends</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-purple-100 text-purple-700">Premium</Badge>
                                        <span><strong>Project DAOs:</strong> Token holders vote on which green projects to fund</span>
                                    </div>
                                </div>
                            </div>

                            {/* Merchant Portal */}
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                                    5. Merchant Portal
                                </h3>
                                <div className="space-y-2 text-sm text-slate-700">
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Green Badge:</strong> Merchants earn verified "Eco-Friendly" badge for sustainable practices</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-green-100 text-green-700">Core</Badge>
                                        <span><strong>Task Campaigns:</strong> Create custom nano tasks (e.g., "Bring reusable bag, get 5% off")</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-blue-100 text-blue-700">Enhanced</Badge>
                                        <span><strong>Impact Reports:</strong> Monthly PDF reports showing carbon impact, customer engagement</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Badge className="mt-0.5 bg-purple-100 text-purple-700">Premium</Badge>
                                        <span><strong>Carbon Neutral Checkout:</strong> Offer customers one-click carbon offset at checkout</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Architecture Tab */}
                <TabsContent value="architecture" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Technical Architecture</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6">
                                <h4 className="font-semibold mb-4 text-center">System Architecture Diagram</h4>
                                <pre className="text-xs overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                        Nano Frontend App                        │
│  (React Native - iOS/Android + Web Progressive App)            │
└─────────────┬───────────────────────────────────────────────────┘
              │
              │ REST API / GraphQL
              │
┌─────────────▼───────────────────────────────────────────────────┐
│                    Nano Backend Services                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Task Engine │  │ Gamification │  │  Reward Manager    │   │
│  │  (Verify)    │  │   Engine     │  │  (Points/Tokens)   │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘   │
│         │                  │                    │                │
└─────────┼──────────────────┼────────────────────┼───────────────┘
          │                  │                    │
          │ Webhooks         │ API Calls          │
          │                  │                    │
┌─────────▼──────────────────▼────────────────────▼───────────────┐
│                    FTS.Money Platform                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Sustainability Layer (New Module)                       │  │
│  │  - Carbon Tracking Service                               │  │
│  │  - Green Merchant Registry                               │  │
│  │  - Nano Task API Integration                             │  │
│  │  - ESG Reporting Engine                                  │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│  ┌──────────────▼───────────────────────────────────────────┐  │
│  │  Core Payment Infrastructure                             │  │
│  │  - Orchestration Engine                                  │  │
│  │  - Transaction Processing                                │  │
│  │  - Settlement System                                     │  │
│  └──────────────┬───────────────────────────────────────────┘  │
│                 │                                                │
│  ┌──────────────▼───────────────────────────────────────────┐  │
│  │  Integration Modules                                     │  │
│  │  ├─ Community Portal (PSP Module)                        │  │
│  │  ├─ Crypto Gateway (Striga) - Carbon Token CRBN          │  │
│  │  ├─ RWA Platform - Green Bonds                           │  │
│  │  └─ Merchant Portal - Green Badge                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              │                    │
              │ Blockchain         │ Payment Networks
              │                    │
┌─────────────▼─────┐   ┌─────────▼──────────┐
│  Polygon Network  │   │  Visa/Mastercard   │
│  - CRBN Token     │   │  - Card Processing │
│  - NANO Token     │   │  - Settlement      │
│  - NFT Badges     │   │                    │
└───────────────────┘   └────────────────────┘`}
                                </pre>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-lg">Key Technical Components</h4>
                                
                                <div className="grid md:grid-cols-2 gap-4">
                                    <Card className="border-green-200">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">Carbon Tracking Service</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p><strong>Function:</strong> Calculate CO₂ per transaction</p>
                                            <p><strong>Data Source:</strong> Merchant category codes (MCC), product data</p>
                                            <p><strong>Formula:</strong> MCC-based emission factors × transaction amount</p>
                                            <p><strong>Storage:</strong> PostgreSQL + time-series DB for analytics</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-blue-200">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">Nano Task API Integration</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p><strong>Endpoint:</strong> POST /api/nano/task-completion</p>
                                            <p><strong>Webhook:</strong> Nano → FTS (task verified)</p>
                                            <p><strong>Reward Flow:</strong> FTS credits merchant account, customer receives points</p>
                                            <p><strong>Security:</strong> JWT tokens, IP whitelisting</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-purple-200">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">Tokenization (CRBN & NANO)</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p><strong>Blockchain:</strong> Polygon (low gas fees)</p>
                                            <p><strong>CRBN Token:</strong> ERC-20, backed by verified carbon credits</p>
                                            <p><strong>NANO Token:</strong> ERC-20, reward token</p>
                                            <p><strong>Smart Contracts:</strong> OpenZeppelin standards</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-orange-200">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-base">ESG Reporting Engine</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-sm space-y-2">
                                            <p><strong>Standards:</strong> GRI, TCFD, CSRD compliance</p>
                                            <p><strong>Output:</strong> PDF reports, API data feeds</p>
                                            <p><strong>Automation:</strong> Monthly/quarterly scheduled reports</p>
                                            <p><strong>Features:</strong> Benchmarking, trend analysis</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Revenue Tab */}
                <TabsContent value="revenue" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue Models & Pricing Strategy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                {
                                    title: "1. Transaction Fee Premium",
                                    color: "green",
                                    items: [
                                        { model: "Green Payment Processing", pricing: "+0.1% on eco-certified transactions", annual: "$2.5M (assuming $2.5B volume)" },
                                        { model: "Carbon Offset Facilitation", pricing: "2% of offset purchase value", annual: "$500K" },
                                        { model: "Roundup Donations", pricing: "1% admin fee on roundup donations", annual: "$200K" }
                                    ]
                                },
                                {
                                    title: "2. Subscription Tiers",
                                    color: "blue",
                                    items: [
                                        { model: "Merchant Sustainability Package", pricing: "$49-499/month based on volume", annual: "$5M (10K merchants avg $41/mo)" },
                                        { model: "PSP White-Label Module", pricing: "$2,000-10,000/month per PSP", annual: "$3.6M (30 PSPs avg $10K/mo)" },
                                        { model: "Enterprise ESG Reporting", pricing: "$999/month + usage fees", annual: "$1.2M" }
                                    ]
                                },
                                {
                                    title: "3. Carbon Credit Marketplace",
                                    color: "purple",
                                    items: [
                                        { model: "Trading Commission", pricing: "1.5% per carbon credit transaction", annual: "$4M (assuming $267M marketplace volume)" },
                                        { model: "Verification Services", pricing: "$500-5,000 per project certification", annual: "$800K" },
                                        { model: "CRBN Token Minting", pricing: "$0.50 per token + gas fees", annual: "$1M" }
                                    ]
                                },
                                {
                                    title: "4. B2B Partnerships",
                                    color: "orange",
                                    items: [
                                        { model: "Merchant Sponsored Tasks", pricing: "$0.10-1.00 per task completion", annual: "$3M (30M tasks)" },
                                        { model: "Brand Partnership Programs", pricing: "$10K-100K annual contracts", annual: "$2.5M (50 brands avg $50K)" },
                                        { model: "API Access Licensing", pricing: "$500-5,000/month based on calls", annual: "$1.8M" }
                                    ]
                                },
                                {
                                    title: "5. RWA Green Bonds",
                                    color: "emerald",
                                    items: [
                                        { model: "Tokenization Fees", pricing: "0.5% of asset value", annual: "$2.5M ($500M tokenized)" },
                                        { model: "Management Fees", pricing: "0.25% annual AUM", annual: "$1.25M" },
                                        { model: "Secondary Trading", pricing: "0.3% transaction fee", annual: "$900K" }
                                    ]
                                }
                            ].map((category, idx) => (
                                <div key={idx} className={`border-l-4 border-${category.color}-500 pl-4`}>
                                    <h3 className={`text-lg font-semibold text-${category.color}-700 mb-3`}>
                                        {category.title}
                                    </h3>
                                    <div className="space-y-3">
                                        {category.items.map((item, i) => (
                                            <div key={i} className="bg-slate-50 p-3 rounded-lg">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-medium text-slate-800">{item.model}</span>
                                                    <Badge className="bg-green-100 text-green-700">{item.annual}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-600">{item.pricing}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border-2 border-green-300">
                                <h3 className="text-2xl font-bold text-green-800 mb-4 text-center">
                                    Total Projected Annual Revenue
                                </h3>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-3xl font-bold text-green-600">$30.75M</div>
                                        <div className="text-sm text-slate-600">Year 1 Conservative</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-green-600">$52M</div>
                                        <div className="text-sm text-slate-600">Year 2 Moderate Growth</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-green-600">$89M</div>
                                        <div className="text-sm text-slate-600">Year 3 Scale</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Roadmap Tab */}
                <TabsContent value="roadmap" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Implementation Roadmap</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {/* Phase 1 */}
                                <div className="relative pl-8 pb-8 border-l-2 border-green-300">
                                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                                        1
                                    </div>
                                    <div className="mb-2">
                                        <Badge className="bg-green-600">Q2 2026 - MVP Launch</Badge>
                                        <span className="ml-2 text-sm text-slate-600">3 months</span>
                                    </div>
                                    <h4 className="text-lg font-semibold mb-3">Foundation & Pilot</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm text-slate-700">Core Features</h5>
                                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                                <li>Nano API integration (task verification)</li>
                                                <li>Basic carbon tracking per transaction</li>
                                                <li>Merchant green badge system</li>
                                                <li>Simple point rewards (no tokens yet)</li>
                                                <li>5 pilot merchants onboarded</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm text-slate-700">Success Metrics</h5>
                                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                                <li>1,000 active users completing tasks</li>
                                                <li>10,000 transactions processed</li>
                                                <li>5 merchants with green badges</li>
                                                <li>$50K transaction volume through green merchants</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 2 */}
                                <div className="relative pl-8 pb-8 border-l-2 border-blue-300">
                                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                        2
                                    </div>
                                    <div className="mb-2">
                                        <Badge className="bg-blue-600">Q3-Q4 2026 - Scale Up</Badge>
                                        <span className="ml-2 text-sm text-slate-600">6 months</span>
                                    </div>
                                    <h4 className="text-lg font-semibold mb-3">Tokenization & Community</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm text-slate-700">Core Features</h5>
                                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                                <li>Launch CRBN & NANO tokens (Polygon)</li>
                                                <li>Community Portal: PSP sustainability module</li>
                                                <li>Merchant task sponsorship campaigns</li>
                                                <li>Basic ESG reporting dashboard</li>
                                                <li>Carbon offset marketplace v1</li>
                                                <li>50 merchants onboarded</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm text-slate-700">Success Metrics</h5>
                                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                                <li>25,000 active users</li>
                                                <li>500K transactions/month</li>
                                                <li>$5M carbon offset marketplace volume</li>
                                                <li>10 PSPs with sustainability module</li>
                                                <li>50 merchants with sponsored tasks</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Phase 3 */}
                                <div className="relative pl-8">
                                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                        3
                                    </div>
                                    <div className="mb-2">
                                        <Badge className="bg-purple-600">2027 - Enterprise & RWA</Badge>
                                        <span className="ml-2 text-sm text-slate-600">12 months</span>
                                    </div>
                                    <h4 className="text-lg font-semibold mb-3">Full Ecosystem</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm text-slate-700">Core Features</h5>
                                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                                <li>RWA Platform: Tokenized green bonds</li>
                                                <li>Advanced ESG reporting (CSRD compliant)</li>
                                                <li>White-label Nano for enterprise PSPs</li>
                                                <li>NFT achievement system</li>
                                                <li>DeFi staking for NANO tokens</li>
                                                <li>Project DAOs for green investments</li>
                                                <li>AI-powered carbon predictions</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h5 className="font-medium text-sm text-slate-700">Success Metrics</h5>
                                            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                                <li>250,000+ active users</li>
                                                <li>$500M green bond AUM</li>
                                                <li>$50M carbon marketplace volume</li>
                                                <li>100+ enterprise merchants</li>
                                                <li>50+ PSPs with white-label solution</li>
                                                <li>1M+ tons CO₂ offset tracked</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Market Tab */}
                <TabsContent value="market" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Market Analysis & Competitive Landscape (2025-2026)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Market Size */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <Card className="border-green-200">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Green Fintech Market</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-green-600 mb-1">$127B</div>
                                        <div className="text-sm text-slate-600">Projected by 2030</div>
                                        <div className="text-sm font-semibold text-green-700 mt-2">CAGR: 18%</div>
                                    </CardContent>
                                </Card>

                                <Card className="border-blue-200">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Carbon Credit Market</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-blue-600 mb-1">$50B</div>
                                        <div className="text-sm text-slate-600">Voluntary market 2030</div>
                                        <div className="text-sm font-semibold text-blue-700 mt-2">CAGR: 32%</div>
                                    </CardContent>
                                </Card>

                                <Card className="border-purple-200">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Gametech in Finance</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-purple-600 mb-1">$11.9B</div>
                                        <div className="text-sm text-slate-600">Market size 2026</div>
                                        <div className="text-sm font-semibold text-purple-700 mt-2">CAGR: 24%</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Competitive Landscape */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Competitive Landscape</h3>
                                <div className="space-y-3">
                                    {[
                                        {
                                            name: "Aspiration (US)",
                                            model: "Neobank with plant-a-tree-per-swipe",
                                            weakness: "No tokenization, limited to banking",
                                            opportunity: "FTS has payment orchestration + crypto + RWA"
                                        },
                                        {
                                            name: "Mastercard Carbon Calculator",
                                            model: "CO₂ tracking per transaction (B2B licensing)",
                                            weakness: "No gamification, no rewards, no marketplace",
                                            opportunity: "FTS adds Nano gamification + token rewards + offsetting"
                                        },
                                        {
                                            name: "Klima DAO",
                                            model: "Blockchain carbon credit marketplace",
                                            weakness: "Crypto-only, no fiat integration, no gamification",
                                            opportunity: "FTS bridges fiat-crypto + adds consumer UX via Nano"
                                        },
                                        {
                                            name: "Cogo (UK)",
                                            model: "Carbon footprint tracking for banks (API)",
                                            weakness: "API only, no end-user app, no tokenization",
                                            opportunity: "FTS builds full consumer experience + PSP network effect"
                                        },
                                        {
                                            name: "Tomorrow Bank (Germany)",
                                            model: "Green neobank, carbon offsetting",
                                            weakness: "Single-country, no B2B platform, no crypto",
                                            opportunity: "FTS is multi-jurisdictional + B2B2C + RWA platform"
                                        }
                                    ].map((competitor, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 bg-slate-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold text-slate-800">{competitor.name}</h4>
                                                    <p className="text-sm text-slate-600">{competitor.model}</p>
                                                </div>
                                                <Badge variant="outline" className="text-red-600 border-red-200">
                                                    Competitor
                                                </Badge>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-2 mt-3 text-sm">
                                                <div>
                                                    <span className="text-red-600 font-medium">❌ Weakness: </span>
                                                    <span className="text-slate-700">{competitor.weakness}</span>
                                                </div>
                                                <div>
                                                    <span className="text-green-600 font-medium">✅ Our Edge: </span>
                                                    <span className="text-slate-700">{competitor.opportunity}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Unique Value Proposition */}
                            <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                                <CardHeader>
                                    <CardTitle>Nano + FTS.Money: Unique Value Proposition</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-2 bg-green-600 rounded-full">
                                                <Zap className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Full-Stack Green Ecosystem</h4>
                                                <p className="text-sm text-slate-600">
                                                    Only platform combining gamification (Nano) + payment infrastructure (FTS) + 
                                                    tokenization (Crypto Gateway) + RWA green bonds in ONE ecosystem
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-2 bg-blue-600 rounded-full">
                                                <Globe className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">B2B2C Network Effect</h4>
                                                <p className="text-sm text-slate-600">
                                                    PSPs deploy sustainability module → merchants sponsor tasks → consumers complete 
                                                    tasks → merchants get more customers → PSPs earn more revenue (flywheel)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 p-2 bg-purple-600 rounded-full">
                                                <Coins className="h-4 w-4 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Fiat-Crypto Bridge</h4>
                                                <p className="text-sm text-slate-600">
                                                    Seamlessly convert fiat payments → carbon tokens → RWA green bonds. 
                                                    Users don't need crypto wallets to participate in tokenized sustainability
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Implementation Tab */}
                <TabsContent value="implementation" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Go-to-Market Strategy & Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Target Segments */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Target Customer Segments</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            segment: "Early Adopter PSPs",
                                            description: "Forward-thinking PSPs wanting to differentiate with sustainability",
                                            examples: "Eco-focused neobanks, European PSPs (CSRD compliance pressure)",
                                            strategy: "Offer 6-month free pilot, co-marketing partnerships"
                                        },
                                        {
                                            segment: "Green Merchants",
                                            description: "Businesses with existing sustainability commitments",
                                            examples: "Organic food stores, renewable energy providers, eco-fashion",
                                            strategy: "Green badge certification, discounted transaction fees"
                                        },
                                        {
                                            segment: "Gen Z/Millennial Consumers",
                                            description: "Eco-conscious individuals who prioritize sustainability",
                                            examples: "18-40 year olds, urban professionals, students",
                                            strategy: "Gamified onboarding, social sharing features, influencer partnerships"
                                        },
                                        {
                                            segment: "Enterprise Corporations",
                                            description: "Large companies needing ESG compliance reporting",
                                            examples: "Fortune 500 with CSRD requirements, public companies",
                                            strategy: "White-label ESG reporting, API integration, consulting services"
                                        }
                                    ].map((item, idx) => (
                                        <Card key={idx} className="border-green-200">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base">{item.segment}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2 text-sm">
                                                <p><strong>Description:</strong> {item.description}</p>
                                                <p><strong>Examples:</strong> {item.examples}</p>
                                                <p className="text-green-700"><strong>Strategy:</strong> {item.strategy}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Launch Checklist */}
                            <Card className="border-blue-300">
                                <CardHeader>
                                    <CardTitle>Pre-Launch Checklist (Next 90 Days)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold mb-3">Technical Development</h4>
                                            <div className="space-y-2">
                                                {[
                                                    "Nano API integration & webhook setup",
                                                    "Carbon tracking database schema",
                                                    "Green merchant registry implementation",
                                                    "Basic ESG dashboard (read-only)",
                                                    "Polygon testnet deployment (CRBN/NANO tokens)",
                                                    "Security audit for API endpoints"
                                                ].map((task, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input type="checkbox" className="rounded" />
                                                        <span className="text-sm text-slate-700">{task}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-3">Business Development</h4>
                                            <div className="space-y-2">
                                                {[
                                                    "Sign 5 pilot merchants (LOI)",
                                                    "Partner with 1 carbon credit verifier",
                                                    "Legal review: carbon credit regulations",
                                                    "Pricing model finalization",
                                                    "Marketing materials (1-pager, demo video)",
                                                    "Launch event planning"
                                                ].map((task, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <input type="checkbox" className="rounded" />
                                                        <span className="text-sm text-slate-700">{task}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Regulatory Considerations */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Regulatory & Compliance Considerations</h3>
                                <div className="space-y-3">
                                    {[
                                        {
                                            regulation: "EU Corporate Sustainability Reporting Directive (CSRD)",
                                            impact: "Mandatory ESG reporting for 50,000+ EU companies starting 2024",
                                            action: "Position FTS as CSRD-compliant reporting tool, target EU enterprises"
                                        },
                                        {
                                            regulation: "Voluntary Carbon Market Standards (VCMI, ICVCM)",
                                            impact: "Carbon credits must meet verification standards to be tradable",
                                            action: "Partner with Verra, Gold Standard for carbon credit certification"
                                        },
                                        {
                                            regulation: "MiCA (Markets in Crypto-Assets Regulation)",
                                            impact: "CRBN and NANO tokens may require e-money license if fiat-backed",
                                            action: "Legal opinion on token classification, potentially use Striga's license"
                                        },
                                        {
                                            regulation: "PSD2 & Open Banking",
                                            impact: "Payment data can be used for carbon footprint calculations",
                                            action: "Integrate open banking APIs for automatic transaction categorization"
                                        }
                                    ].map((item, idx) => (
                                        <div key={idx} className="border-l-4 border-orange-400 pl-4 bg-orange-50 p-3 rounded">
                                            <h4 className="font-semibold text-orange-800">{item.regulation}</h4>
                                            <p className="text-sm text-slate-700 mt-1"><strong>Impact:</strong> {item.impact}</p>
                                            <p className="text-sm text-green-700 mt-1"><strong>Action:</strong> {item.action}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Key Partnerships */}
                            <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                                <CardHeader>
                                    <CardTitle>Strategic Partnerships to Pursue</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { partner: "Verra / Gold Standard", type: "Carbon Credit Verifiers", value: "Credibility for carbon offset marketplace" },
                                            { partner: "Chainlink", type: "Oracle Provider", value: "Real-time carbon price feeds, RWA valuations" },
                                            { partner: "Polygon", type: "Blockchain Partner", value: "Co-marketing, grants for green dApps" },
                                            { partner: "Mastercard / Visa", type: "Card Networks", value: "Carbon calculator licensing, joint marketing" },
                                            { partner: "Patagonia / Allbirds", type: "Eco-Brands", value: "Pilot merchants, brand credibility" },
                                            { partner: "Climate Neutral / B Corp", type: "Certification Bodies", value: "Merchant verification, green badges" }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                <div>
                                                    <h4 className="font-semibold text-slate-800">{item.partner}</h4>
                                                    <p className="text-xs text-slate-600">{item.type}</p>
                                                </div>
                                                <div className="text-right text-sm text-slate-700 max-w-xs">
                                                    {item.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Call to Action */}
            <Card className="border-green-500 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50">
                <CardContent className="py-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-green-800">Ready to Build the Future of Sustainable Fintech?</h2>
                        <p className="text-lg text-slate-700 max-w-3xl mx-auto">
                            By integrating Nano with FTS.Money, we can create a powerful ecosystem where 
                            every payment drives positive environmental impact, tokenized carbon credits 
                            democratize sustainability, and merchants, PSPs, and consumers all benefit.
                        </p>
                        <div className="flex gap-4 justify-center mt-6">
                            <Badge className="bg-green-600 text-white px-6 py-2 text-base">
                                <Leaf className="h-5 w-5 mr-2" />
                                $30.75M ARR Potential
                            </Badge>
                            <Badge className="bg-blue-600 text-white px-6 py-2 text-base">
                                <TrendingUp className="h-5 w-5 mr-2" />
                                24% Market Growth
                            </Badge>
                            <Badge className="bg-purple-600 text-white px-6 py-2 text-base">
                                <Globe className="h-5 w-5 mr-2" />
                                First Mover Advantage
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}