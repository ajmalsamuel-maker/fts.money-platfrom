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
    Calendar
} from 'lucide-react';

export default function FTSArchitectureDoc() {
    const navigate = useNavigate();

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
                    <div className="flex gap-2">
                        <Badge className="bg-blue-100 text-blue-700">Version 1.0</Badge>
                        <Badge variant="outline">Strategic Planning Document</Badge>
                        <Badge variant="outline">December 2025</Badge>
                    </div>
                </div>

                <Tabs defaultValue="concept" className="space-y-6">
                    <TabsList className="grid grid-cols-6">
                        <TabsTrigger value="concept">Concept</TabsTrigger>
                        <TabsTrigger value="architecture">Architecture</TabsTrigger>
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
                                                    <li>• FTSServiceRegistry</li>
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