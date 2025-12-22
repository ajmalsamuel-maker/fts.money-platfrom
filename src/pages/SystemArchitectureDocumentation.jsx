import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    Building2, 
    Globe, 
    Shield, 
    Database, 
    Cloud, 
    Users, 
    CreditCard,
    Zap,
    Lock,
    Network,
    Server,
    ArrowRight,
    CheckCircle2,
    Info,
    Code,
    Layers,
    Activity
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function SystemArchitectureDocumentation() {
    const [activeSection, setActiveSection] = useState('overview');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="flex items-center gap-3 mb-4">
                        <Building2 className="h-12 w-12" />
                        <div>
                            <h1 className="text-4xl font-bold mb-2">FTS.Money Platform</h1>
                            <p className="text-xl text-blue-100">Complete System Architecture & Design Documentation</p>
                        </div>
                    </div>
                    <p className="text-lg text-blue-50 max-w-4xl">
                        Comprehensive technical documentation for stakeholders, developers, and regulators covering the multi-tenant PSP platform architecture, compliance framework, and operational workflows.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Table of Contents */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Navigation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { id: 'overview', label: 'Executive Overview', icon: Globe },
                                { id: 'architecture', label: 'Architecture', icon: Server },
                                { id: 'components', label: 'Components', icon: Layers },
                                { id: 'data', label: 'Data Models', icon: Database },
                                { id: 'security', label: 'Security & Compliance', icon: Shield },
                                { id: 'workflows', label: 'Workflows', icon: Activity },
                                { id: 'tech', label: 'Tech Stack', icon: Code },
                                { id: 'iso', label: 'ISO Standards', icon: CheckCircle2 }
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id)}
                                        className={cn(
                                            "p-3 rounded-lg border-2 text-left transition-all",
                                            activeSection === item.id
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-slate-200 hover:border-blue-300"
                                        )}
                                    >
                                        <Icon className="h-4 w-4 mb-1" />
                                        <p className="text-sm font-medium">{item.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Executive Overview */}
                {activeSection === 'overview' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Executive Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-slate-700 leading-relaxed">
                                    <strong>FTS.Money (Fluid Global Payments)</strong> is an enterprise-grade, multi-tenant Platform-as-a-Service (PaaS) that enables businesses to launch and operate their own white-label Payment Service Provider (PSP) infrastructure. The platform provides a complete payment processing ecosystem with built-in compliance, multi-cloud orchestration, and advanced payment routing capabilities.
                                </p>
                                
                                <Alert className="bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription>
                                        <strong>Platform Vision:</strong> Democratize access to enterprise payment infrastructure by allowing any business to become a PSP in hours, not months, with full regulatory compliance and multi-market capabilities.
                                    </AlertDescription>
                                </Alert>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <p className="text-sm text-slate-600 mb-1">Target Market</p>
                                        <p className="font-semibold text-slate-900">FinTechs, Banks, Enterprises, Payment Aggregators</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <p className="text-sm text-slate-600 mb-1">Deployment Model</p>
                                        <p className="font-semibold text-slate-900">SaaS Multi-Tenant + Isolated Schemas</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <p className="text-sm text-slate-600 mb-1">Compliance</p>
                                        <p className="font-semibold text-slate-900">PCI DSS L1, LEI/vLEI, GDPR, FATF</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg p-4">
                                        <p className="text-sm text-slate-600 mb-1">Global Reach</p>
                                        <p className="font-semibold text-slate-900">150+ Countries, 40+ Currencies</p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="font-semibold text-lg mb-3">Key Value Propositions</h3>
                                    <div className="space-y-2">
                                        {[
                                            'Rapid PSP Deployment: Launch in hours with self-service provisioning wizard',
                                            'Complete Data Isolation: Each PSP operates in isolated database schema (multi-tenancy)',
                                            'Regulatory Compliance: Built-in LEI/vLEI, KYB/AML, FATF, PCI DSS compliance',
                                            'Payment Orchestration: Smart routing, cascade logic, load balancing across multiple providers',
                                            'Multi-Cloud Ready: Deploy on AWS, GCP, Azure, or local infrastructure with DR capabilities',
                                            'Wholesale Marketplace: PSPs can offer services to other PSPs creating revenue streams',
                                            'Service Catalog: 150+ payment rails and services through NetXHub integration',
                                            'White-Label Ready: Fully brandable with custom domains, colors, logos'
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                <span className="text-slate-700">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Capabilities Matrix</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200">
                                                <th className="text-left p-3 font-semibold">Capability</th>
                                                <th className="text-left p-3 font-semibold">Starter</th>
                                                <th className="text-left p-3 font-semibold">Professional</th>
                                                <th className="text-left p-3 font-semibold">Enterprise</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { name: 'Payment Providers', starter: '1', pro: '3', ent: '10+' },
                                                { name: 'Max Merchants', starter: '100', pro: '1,000', ent: 'Unlimited' },
                                                { name: 'Revenue Share', starter: '30%', pro: '25%', ent: '20%' },
                                                { name: 'Smart Routing', starter: '❌', pro: '✓', ent: '✓' },
                                                { name: 'AI Fraud Detection', starter: '❌', pro: '✓', ent: '✓' },
                                                { name: 'Crypto Payments', starter: '❌', pro: '✓', ent: '✓' },
                                                { name: 'Disaster Recovery', starter: '❌', pro: 'Optional', ent: '✓' },
                                                { name: 'Wholesale Services', starter: '❌', pro: '❌', ent: '✓' },
                                                { name: 'API Access', starter: 'Basic', pro: 'Advanced', ent: 'Full' }
                                            ].map((row, i) => (
                                                <tr key={i} className="border-b border-slate-100">
                                                    <td className="p-3 font-medium">{row.name}</td>
                                                    <td className="p-3">{row.starter}</td>
                                                    <td className="p-3">{row.pro}</td>
                                                    <td className="p-3">{row.ent}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* System Architecture */}
                {activeSection === 'architecture' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Server className="h-6 w-6 text-blue-600" />
                                    System Architecture Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Multi-Layered Architecture</h3>
                                    <p className="text-slate-700 mb-4">
                                        FTS.Money follows a hierarchical, multi-tenant architecture with complete data isolation at each PSP level. The system is designed for horizontal scalability, regulatory compliance, and operational resilience.
                                    </p>
                                </div>

                                {/* Architecture Diagram */}
                                <div className="bg-slate-900 rounded-lg p-6 text-white">
                                    <pre className="text-xs font-mono whitespace-pre overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────────┐
│                    FTS.MONEY PLATFORM LAYER                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Platform Admin Console (FTSMoneyPlatform)               │   │
│  │  - Global Resource Pool Management                       │   │
│  │  - PSP Provisioning & Approval Queue                     │   │
│  │  - Master Pricing & Revenue Management                   │   │
│  │  - Compliance Monitoring & LEI Registry                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↓ ↓
┌─────────────────────────────────────────────────────────────────┐
│                   COMMUNITY PORTAL LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Self-Service PSP Provisioning                           │   │
│  │  - Provisioning Wizard (9-step configuration)            │   │
│  │  - Service Marketplace Browsing                          │   │
│  │  - Service Provider Registration                         │   │
│  │  - My PSP Instances Dashboard                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↓ ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PSP INSTANCE LAYER (Multi-Tenant)              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  PSP-001    │  │  PSP-002    │  │  PSP-NNN    │             │
│  │  (Isolated  │  │  (Isolated  │  │  (Isolated  │  ← Tenant   │
│  │   Schema)   │  │   Schema)   │  │   Schema)   │    Isolation│
│  │             │  │             │  │             │             │
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  │             │
│  │  Merchants  │  │  Merchants  │  │  Merchants  │             │
│  │  Txns       │  │  Txns       │  │  Txns       │             │
│  │  Settings   │  │  Settings   │  │  Settings   │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↓ ↓
┌─────────────────────────────────────────────────────────────────┐
│                   MERCHANT PORTAL LAYER                          │
│  Each PSP manages N merchants with isolated credentials          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Merchant Login → Dashboard → Transactions → VT         │    │
│  │  - Transaction History & Analytics                      │    │
│  │  - Virtual Terminal (Card/Crypto Processing)            │    │
│  │  - Invoice Generation & Payment Links                   │    │
│  │  - Settlement Reports & Payouts                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↓ ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PAYMENT PROCESSING LAYER                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Orchestration Engine (Smart Routing)                    │   │
│  │  ├─ Card Networks (Visa, MC, Amex, Discover)            │   │
│  │  ├─ Bank Transfers (ACH, SEPA, Wire, FedNow)            │   │
│  │  ├─ Crypto Networks (BTC, ETH, USDT, USDC)              │   │
│  │  ├─ Digital Wallets (Alipay, WeChat, PayPal)            │   │
│  │  └─ BNPL Providers (Klarna, Afterpay, Affirm)           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ ↓ ↓
┌─────────────────────────────────────────────────────────────────┐
│              COMPLIANCE & INFRASTRUCTURE LAYER                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  LEI/vLEI        │  │  Cloud Resources │  │  Security    │  │
│  │  - GLEIF API     │  │  - AWS/GCP/Azure │  │  - PCI DSS   │  │
│  │  - Credential    │  │  - Multi-region  │  │  - ISO 27001 │  │
│  │    Chain         │  │  - DR/HA Config  │  │  - GDPR      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘`}
                                    </pre>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <Database className="h-6 w-6 text-blue-600 mb-2" />
                                        <h4 className="font-semibold mb-1">Multi-Tenant Isolation</h4>
                                        <p className="text-sm text-slate-700">Each PSP operates in a completely isolated database schema with separate authentication contexts.</p>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                        <Shield className="h-6 w-6 text-emerald-600 mb-2" />
                                        <h4 className="font-semibold mb-1">Compliance-First Design</h4>
                                        <p className="text-sm text-slate-700">Built-in LEI/vLEI verification, KYB/AML screening, and automatic FATF compliance monitoring.</p>
                                    </div>
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <Zap className="h-6 w-6 text-purple-600 mb-2" />
                                        <h4 className="font-semibold mb-1">Payment Orchestration</h4>
                                        <p className="text-sm text-slate-700">AI-powered smart routing, cascade logic, and multi-provider failover for optimal transaction success.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Hierarchy & Relationships</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-slate-50 rounded-lg p-6">
                                    <pre className="text-sm font-mono whitespace-pre overflow-x-auto text-slate-700">
{`FTS.Money Platform (Root)
│
├─ Platform Admin Users
│  ├─ Super Admin (full system access)
│  ├─ Platform Admin (PSP management)
│  ├─ Operations (provisioning & monitoring)
│  ├─ Finance (pricing & revenue)
│  └─ Support (ticket resolution)
│
├─ Service Providers (Third-party integrations)
│  ├─ Payment Processors (Stripe, Adyen, etc.)
│  ├─ Crypto Exchanges (Coinbase, Binance)
│  ├─ Compliance Services (TheKYB, AMLWatcher)
│  └─ Cloud Providers (AWS, GCP, Azure, etc.)
│
├─ Provisioned PSP Instances (Tenants)
│  │
│  ├─ PSP-001 (Acme Payments)
│  │  ├─ PSP Staff Users (admin, operations, finance, support)
│  │  ├─ PSP Settings (branding, fees, features)
│  │  ├─ Service Subscriptions (NetXHub services)
│  │  ├─ Merchants
│  │  │  ├─ Merchant-001
│  │  │  │  ├─ Merchant Users (admin, operator, viewer)
│  │  │  │  ├─ MIDs (Merchant IDs)
│  │  │  │  ├─ Transactions
│  │  │  │  ├─ Settlements
│  │  │  │  └─ Virtual Terminal Sessions
│  │  │  ├─ Merchant-002
│  │  │  └─ Merchant-NNN
│  │  └─ PSP-Level Transactions (aggregated)
│  │
│  ├─ PSP-002 (GlobalPay Solutions)
│  │  └─ [Same structure as PSP-001]
│  │
│  └─ PSP-NNN
│     └─ [Same structure]
│
└─ Global Resources (Shared Pool)
   ├─ Payment Providers
   ├─ Payout Routes
   ├─ Cloud Connectors
   └─ Compliance Services`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Components */}
                {activeSection === 'components' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Core Platform Components</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Component 1: Community Portal */}
                                    <div className="border-l-4 border-blue-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                            <Globe className="h-5 w-5 text-blue-600" />
                                            1. Community Portal
                                        </h3>
                                        <Badge className="mb-3">Public-Facing</Badge>
                                        <p className="text-slate-700 mb-3">
                                            Self-service portal for businesses to discover, provision, and manage PSP instances without technical expertise.
                                        </p>
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <p className="font-semibold mb-2">Key Features:</p>
                                            <ul className="space-y-1 text-sm text-slate-700">
                                                <li>• <strong>PSP Provisioning Wizard:</strong> 9-step guided setup (Tier → Business → Services → Appearance → Fees → Payments → Payouts → Regional → Review)</li>
                                                <li>• <strong>Service Marketplace:</strong> Browse 150+ payment services from NetXHub catalog</li>
                                                <li>• <strong>Service Provider Registration:</strong> Third-parties can register to offer services</li>
                                                <li>• <strong>My PSP Instances:</strong> Dashboard showing all owned PSPs with status and quick actions</li>
                                                <li>• <strong>Wholesale Marketplace:</strong> Browse and subscribe to services offered by other PSPs</li>
                                            </ul>
                                        </div>
                                        <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                                            <strong>Authentication:</strong> Email-based community accounts managed in <code>CommunityUser</code> entity (separate from PSP staff)
                                        </div>
                                    </div>

                                    {/* Component 2: FTS Platform */}
                                    <div className="border-l-4 border-purple-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-purple-600" />
                                            2. FTS.Money Platform (Admin Console)
                                        </h3>
                                        <Badge className="mb-3 bg-purple-100 text-purple-700">Internal - Platform Team Only</Badge>
                                        <p className="text-slate-700 mb-3">
                                            Central command center for FTS.Money platform team to manage all PSP instances, approve provisioning requests, monitor health, and configure global resources.
                                        </p>
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <p className="font-semibold mb-2">Key Features:</p>
                                            <ul className="space-y-1 text-sm text-slate-700">
                                                <li>• <strong>PSP Instance Management:</strong> View, configure, suspend, or terminate PSP instances</li>
                                                <li>• <strong>Provisioning Queue:</strong> Approve/reject new PSP requests with compliance validation</li>
                                                <li>• <strong>Global Resource Pool:</strong> Manage payment providers, payout routes, cloud connectors</li>
                                                <li>• <strong>Service Registry:</strong> Configure NetXHub services and pricing</li>
                                                <li>• <strong>Master Pricing:</strong> Set buy/sell rates for all payment rails and services</li>
                                                <li>• <strong>Revenue Analytics:</strong> Platform-wide revenue, volume, and margin tracking</li>
                                                <li>• <strong>Compliance Dashboard:</strong> Monitor LEI/vLEI status, grace periods, compliance alerts</li>
                                                <li>• <strong>Audit Logs:</strong> Cryptographically signed audit trail of all platform actions</li>
                                            </ul>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                                                <strong>Authentication:</strong> Platform-specific RBAC with roles: Super Admin, Platform Admin, Operations, Finance, Finance Manager, Support, Viewer
                                            </div>
                                            <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                                                <strong>Access:</strong> <code>PlatformAdminLogin</code> → Role-based permissions → Platform actions
                                            </div>
                                        </div>
                                    </div>

                                    {/* Component 3: PSP Portal */}
                                    <div className="border-l-4 border-emerald-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                            <Building2 className="h-5 w-5 text-emerald-600" />
                                            3. PSP Portal (White-Label Instance)
                                        </h3>
                                        <Badge className="mb-3 bg-emerald-100 text-emerald-700">Per-Tenant Portal</Badge>
                                        <p className="text-slate-700 mb-3">
                                            Each provisioned PSP receives a fully white-labeled portal where PSP staff manage merchants, process transactions, configure settings, and monitor business performance.
                                        </p>
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <p className="font-semibold mb-2">Key Features:</p>
                                            <ul className="space-y-1 text-sm text-slate-700">
                                                <li>• <strong>Dashboard:</strong> Real-time metrics (volume, TPS, success rate, merchant count)</li>
                                                <li>• <strong>Merchant Management:</strong> Onboard, provision, configure, suspend merchants</li>
                                                <li>• <strong>Transaction Monitoring:</strong> View all transactions across all merchants (tenant-isolated)</li>
                                                <li>• <strong>Payment Orchestration:</strong> Configure routing rules, cascade logic, load balancing</li>
                                                <li>• <strong>Settlement Management:</strong> Batch settlements, payout scheduling, reconciliation</li>
                                                <li>• <strong>Dispute & Chargeback Management:</strong> Case tracking, evidence submission, resolution</li>
                                                <li>• <strong>Reporting & Analytics:</strong> Customizable reports, export capabilities, business insights</li>
                                                <li>• <strong>Settings:</strong> Branding, fees, payment methods, compliance, API keys</li>
                                                <li>• <strong>User Management:</strong> RBAC for PSP staff (admin, operations, finance, compliance)</li>
                                            </ul>
                                        </div>
                                        <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded p-3 text-sm">
                                            <strong>Isolation Mechanism:</strong> Each PSP has a unique <code>psp_code</code> used to filter ALL database queries, ensuring complete tenant isolation at the application layer. Authentication via <code>PSPLogin</code> → <code>pspAuth</code> function → Session with <code>psp_code</code>
                                        </div>
                                    </div>

                                    {/* Component 4: Merchant Portal */}
                                    <div className="border-l-4 border-amber-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                            <Users className="h-5 w-5 text-amber-600" />
                                            4. Merchant Portal
                                        </h3>
                                        <Badge className="mb-3 bg-amber-100 text-amber-700">Per-Merchant Access</Badge>
                                        <p className="text-slate-700 mb-3">
                                            Self-service portal for merchants to view transactions, manage settings, process payments, and generate invoices within their PSP's ecosystem.
                                        </p>
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <p className="font-semibold mb-2">Key Features:</p>
                                            <ul className="space-y-1 text-sm text-slate-700">
                                                <li>• <strong>Transaction Dashboard:</strong> View payment history, filter by status, export reports</li>
                                                <li>• <strong>Virtual Terminal Access:</strong> Process card payments, crypto, recurring billing</li>
                                                <li>• <strong>Invoice Generator:</strong> Create professional invoices with PSP branding</li>
                                                <li>• <strong>Payment Links:</strong> Generate one-time or recurring payment links</li>
                                                <li>• <strong>Settlement Reports:</strong> View payout schedules, batch reports, reconciliation</li>
                                                <li>• <strong>Customer Management:</strong> Store customer data, saved cards (PCI-compliant tokenization)</li>
                                                <li>• <strong>API Credentials:</strong> Generate API keys for integration</li>
                                                <li>• <strong>Webhook Configuration:</strong> Configure callback URLs for transaction events</li>
                                            </ul>
                                        </div>
                                        <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 text-sm">
                                            <strong>Authentication:</strong> Merchant-specific login via <code>merchant_code</code> + email + password → <code>merchantAuth</code> function → Session with <code>merchant_id</code> and <code>psp_code</code>
                                        </div>
                                    </div>

                                    {/* Component 5: Virtual Terminal */}
                                    <div className="border-l-4 border-cyan-500 pl-4">
                                        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-cyan-600" />
                                            5. Virtual Terminal
                                        </h3>
                                        <Badge className="mb-3 bg-cyan-100 text-cyan-700">POS Interface</Badge>
                                        <p className="text-slate-700 mb-3">
                                            Browser-based point-of-sale terminal for merchants to process manual card payments, crypto transactions, and recurring billing with real-time authorization.
                                        </p>
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <p className="font-semibold mb-2">Key Features:</p>
                                            <ul className="space-y-1 text-sm text-slate-700">
                                                <li>• <strong>Quick Charge:</strong> Fast card payment processing with auto card brand detection</li>
                                                <li>• <strong>Crypto Payments:</strong> BTC, ETH, USDT, USDC with real-time conversion</li>
                                                <li>• <strong>Itemized Sale:</strong> Line-item billing with tax calculation</li>
                                                <li>• <strong>Recurring Billing:</strong> Setup subscription payments with flexible intervals</li>
                                                <li>• <strong>Card Vault:</strong> Save cards for repeat customers (PCI-compliant tokenization)</li>
                                                <li>• <strong>Receipt Generation:</strong> Email or print receipts with merchant branding</li>
                                                <li>• <strong>Transaction History:</strong> View and search past transactions</li>
                                                <li>• <strong>Multi-MID Support:</strong> Switch between multiple Merchant IDs</li>
                                            </ul>
                                        </div>
                                        <div className="mt-3 bg-cyan-50 border border-cyan-200 rounded p-3 text-sm">
                                            <strong>Authentication:</strong> Separate VT login via <code>VirtualTerminalLogin</code> → <code>vtAuth</code> function → Operators can be different from merchant portal users
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Data Models */}
                {activeSection === 'data' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Database className="h-6 w-6 text-blue-600" />
                                    Data Models & Entity Relationships
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Alert className="bg-blue-50 border-blue-200">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <AlertDescription>
                                        <strong>Critical Design Principle:</strong> All merchant and transaction entities MUST include <code>psp_code</code> for tenant isolation. Every query filters by <code>psp_code</code> to ensure data privacy.
                                    </AlertDescription>
                                </Alert>

                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Core Entity Groups</h3>
                                    
                                    {/* Platform Entities */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-2 text-purple-700">Platform-Level Entities</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { name: 'ProvisionedPSP', desc: 'PSP instance configuration, branding, tier, status, LEI/vLEI' },
                                                { name: 'PlatformLEI', desc: 'FTS.Money platform LEI credentials and chain' },
                                                { name: 'ServiceCatalog', desc: 'NetXHub services available to PSPs' },
                                                { name: 'ServiceProvider', desc: 'Third-party service providers' },
                                                { name: 'PaymentProvider', desc: 'Global payment processor pool' },
                                                { name: 'PayoutRoute', desc: 'Global payout method pool' },
                                                { name: 'CloudConnector', desc: 'Multi-cloud infrastructure providers' },
                                                { name: 'MasterPricing', desc: 'Platform-wide pricing catalog' },
                                                { name: 'ApprovalRequest', desc: 'Provisioning approval workflow' },
                                                { name: 'PlatformConfig', desc: 'Global settings and compliance rules' }
                                            ].map((entity, i) => (
                                                <div key={i} className="bg-purple-50 border border-purple-200 rounded p-3">
                                                    <p className="font-mono text-sm font-semibold text-purple-900 mb-1">{entity.name}</p>
                                                    <p className="text-xs text-slate-700">{entity.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* PSP-Tenant Entities */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-2 text-emerald-700">PSP-Tenant Entities (Isolated by psp_code)</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { name: 'Merchant', desc: 'Merchant records with KYB status, pricing, LEI, psp_code' },
                                                { name: 'MerchantUser', desc: 'Merchant portal users with RBAC permissions' },
                                                { name: 'MerchantMID', desc: 'Merchant IDs from acquiring banks' },
                                                { name: 'Transaction', desc: 'All payment transactions with psp_code isolation' },
                                                { name: 'Settlement', desc: 'Batch settlements and payouts to merchants' },
                                                { name: 'Dispute', desc: 'Chargebacks and dispute cases' },
                                                { name: 'Chargeback', desc: 'Detailed chargeback lifecycle management' },
                                                { name: 'Terminal', desc: 'POS terminal configurations' },
                                                { name: 'VirtualTerminal', desc: 'VT configuration and access control' },
                                                { name: 'PSPSettings', desc: 'PSP-specific configuration overrides' },
                                                { name: 'PSPServiceSubscription', desc: 'Services subscribed by PSP' },
                                                { name: 'RoutingRule', desc: 'Smart routing and cascade configurations' }
                                            ].map((entity, i) => (
                                                <div key={i} className="bg-emerald-50 border border-emerald-200 rounded p-3">
                                                    <p className="font-mono text-sm font-semibold text-emerald-900 mb-1">{entity.name}</p>
                                                    <p className="text-xs text-slate-700">{entity.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Compliance & Identity */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-2 text-blue-700">Compliance & Identity Entities</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { name: 'LEICredential', desc: 'vLEI credentials for PSPs, merchants, users' },
                                                { name: 'SignedAuditLog', desc: 'Cryptographically signed audit trail' },
                                                { name: 'TransactionSignature', desc: 'Digital signatures for transactions' },
                                                { name: 'PCICompliance', desc: 'PCI DSS compliance records' },
                                                { name: 'SanctionsScreening', desc: 'FATF sanctions check results' },
                                                { name: 'TravelRuleData', desc: 'FATF Travel Rule data for crypto' }
                                            ].map((entity, i) => (
                                                <div key={i} className="bg-blue-50 border border-blue-200 rounded p-3">
                                                    <p className="font-mono text-sm font-semibold text-blue-900 mb-1">{entity.name}</p>
                                                    <p className="text-xs text-slate-700">{entity.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <h3 className="font-semibold text-lg mb-3">Entity Relationship Diagram</h3>
                                    <div className="bg-slate-900 text-white rounded-lg p-6 text-xs font-mono overflow-x-auto">
                                        <pre className="whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────────┐
│                         PLATFORM LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PlatformLEI ──────────┐                                            │
│       │                │                                            │
│       │                ↓                                            │
│  ProvisionedPSP ←── LEICredential (entity_type='psp')              │
│       │                │                                            │
│       │                │                                            │
│       ├──→ PSPServiceSubscription ←── ServiceCatalog               │
│       │                                                             │
│       ├──→ PSPSettings                                              │
│       │                                                             │
│       ├──→ PSPWholesaleOffering ←──→ PSPResellerRelationship       │
│       │                                                             │
└───────┼─────────────────────────────────────────────────────────────┘
        │
        │ (psp_code isolation)
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      PSP TENANT LAYER (Isolated)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Merchant ──────────────┐                                           │
│       │                 │                                           │
│       │                 ↓                                           │
│       ├──→ MerchantUser (portal access)                             │
│       │                                                             │
│       ├──→ MerchantMID (acquiring bank IDs)                         │
│       │                                                             │
│       ├──→ MerchantPricing (custom fee overrides)                   │
│       │                                                             │
│       ├──→ LEICredential (entity_type='merchant')                   │
│       │                                                             │
│       └──→ Transaction ─────────┐                                   │
│                │                │                                   │
│                ├──→ Settlement  │                                   │
│                ├──→ Refund      │                                   │
│                ├──→ Dispute     │                                   │
│                ├──→ Chargeback  │                                   │
│                └──→ TransactionSignature (vLEI signed)              │
│                                                                      │
│  RoutingRule ──→ (governs transaction routing)                      │
│                                                                      │
│  VirtualTerminal ──→ VirtualTerminalUser                            │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

CRITICAL: All entities in PSP Tenant Layer include psp_code for isolation.
Every query MUST filter by psp_code to maintain tenant boundaries.`}
                                        </pre>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Key Data Attributes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Transaction Entity (ISO-Compliant)</h4>
                                        <div className="bg-slate-50 rounded p-4 text-sm space-y-1">
                                            <p><strong>Isolation:</strong> <code>psp_code</code> (REQUIRED for all queries)</p>
                                            <p><strong>References:</strong> <code>merchant_id</code>, <code>mid</code>, <code>terminal_id</code></p>
                                            <p><strong>ISO 20022:</strong> <code>iso20022_message_id</code>, <code>iso20022_end_to_end_id</code>, <code>iso20022_uetr</code></p>
                                            <p><strong>ISO 8583:</strong> <code>rrn</code>, <code>eci</code>, <code>arn</code>, <code>auth_code</code></p>
                                            <p><strong>ISO 23257 (Crypto):</strong> <code>crypto_dti</code>, <code>crypto_tx_hash</code>, <code>blockchain_network</code></p>
                                            <p><strong>LEI/vLEI:</strong> <code>psp_lei</code>, <code>merchant_lei</code>, <code>credential_chain[]</code>, <code>vlei_signature</code></p>
                                            <p><strong>Status Flow:</strong> pending → processing → approved/declined → settled</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Merchant Entity</h4>
                                        <div className="bg-slate-50 rounded p-4 text-sm space-y-1">
                                            <p><strong>Isolation:</strong> <code>psp_code</code>, <code>merchant_code</code> (unique within PSP)</p>
                                            <p><strong>Identity:</strong> <code>lei</code>, <code>vlei</code>, <code>lei_status</code></p>
                                            <p><strong>Compliance:</strong> <code>kyb_status</code>, <code>aml_status</code>, <code>documents[]</code></p>
                                            <p><strong>Onboarding:</strong> <code>onboarding_token</code>, <code>onboarding_url_expires</code></p>
                                            <p><strong>Metrics:</strong> <code>total_transactions</code>, <code>total_volume</code>, <code>risk_level</code></p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Security & Compliance */}
                {activeSection === 'security' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                    Security & Compliance Framework
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Multi-Tenant Security Architecture</h3>
                                    <div className="space-y-3">
                                        <div className="bg-red-50 border border-red-200 rounded p-4">
                                            <h4 className="font-semibold text-red-900 mb-2">Tenant Isolation Enforcement</h4>
                                            <p className="text-sm text-slate-700 mb-3">
                                                Every PSP operates in a logically isolated namespace using the <code>psp_code</code> attribute. This prevents data leakage between tenants.
                                            </p>
                                            <div className="bg-slate-900 rounded p-3 text-xs text-green-400 font-mono">
                                                <p>// CORRECT: Always filter by psp_code</p>
                                                <p>const txns = await base44.entities.Transaction.filter({`{ psp_code: userSession.psp_code }`});</p>
                                                <br/>
                                                <p className="text-red-400">// WRONG: Global query exposes all PSPs' data</p>
                                                <p className="text-red-400">const txns = await base44.entities.Transaction.list(); // ❌ SECURITY VIOLATION</p>
                                            </div>
                                        </div>

                                        <div className="bg-emerald-50 border border-emerald-200 rounded p-4">
                                            <h4 className="font-semibold text-emerald-900 mb-2">Authentication Layers</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <Badge className="bg-purple-600 text-white">Layer 1</Badge>
                                                    <div>
                                                        <p className="font-semibold">Platform Admin Authentication</p>
                                                        <p className="text-slate-600">platformAuth function → PlatformUser entity → RBAC via platform_role</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Badge className="bg-emerald-600 text-white">Layer 2</Badge>
                                                    <div>
                                                        <p className="font-semibold">PSP Staff Authentication</p>
                                                        <p className="text-slate-600">pspAuth function → AppUser entity → psp_code session injection</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Badge className="bg-blue-600 text-white">Layer 3</Badge>
                                                    <div>
                                                        <p className="font-semibold">Merchant User Authentication</p>
                                                        <p className="text-slate-600">merchantAuth function → MerchantUser entity → merchant_id + psp_code session</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Badge className="bg-cyan-600 text-white">Layer 4</Badge>
                                                    <div>
                                                        <p className="font-semibold">Virtual Terminal Authentication</p>
                                                        <p className="text-slate-600">vtAuth function → VirtualTerminalUser entity → operator-level access</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                            <h4 className="font-semibold text-blue-900 mb-2">Role-Based Access Control (RBAC)</h4>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="font-semibold mb-1">Platform Roles:</p>
                                                    <ul className="space-y-1 text-slate-700">
                                                        <li>• super_admin (all permissions)</li>
                                                        <li>• platform_admin (PSP management)</li>
                                                        <li>• operations (provisioning)</li>
                                                        <li>• finance (pricing, revenue)</li>
                                                        <li>• support (tickets)</li>
                                                        <li>• viewer (read-only)</li>
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="font-semibold mb-1">PSP Staff Roles:</p>
                                                    <ul className="space-y-1 text-slate-700">
                                                        <li>• admin (full PSP access)</li>
                                                        <li>• operations (merchants, txns)</li>
                                                        <li>• finance (settlements, pricing)</li>
                                                        <li>• compliance (KYB, AML)</li>
                                                        <li>• support (merchant help)</li>
                                                        <li>• viewer (read-only)</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-3">LEI/vLEI Compliance Framework</h3>
                                    <Alert className="bg-amber-50 border-amber-200 mb-4">
                                        <Info className="h-4 w-4 text-amber-600" />
                                        <AlertDescription className="text-sm">
                                            <strong>GLEIF Integration:</strong> The platform integrates with the Global Legal Entity Identifier Foundation (GLEIF) for verifiable organizational identity.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-3">
                                        <div className="bg-slate-50 border border-slate-200 rounded p-4">
                                            <h4 className="font-semibold mb-2">LEI (Legal Entity Identifier) - ISO 17442</h4>
                                            <p className="text-sm text-slate-700 mb-2">
                                                20-character alphanumeric code that uniquely identifies legal entities participating in financial transactions globally.
                                            </p>
                                            <p className="text-xs font-mono bg-white border rounded p-2">Example: 213800ABCDEFGHIJ1234</p>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-200 rounded p-4">
                                            <h4 className="font-semibold mb-2">vLEI (Verifiable LEI)</h4>
                                            <p className="text-sm text-slate-700 mb-2">
                                                W3C Verifiable Credential format that digitally proves LEI ownership using cryptographic signatures. Enables automated identity verification without manual checks.
                                            </p>
                                            <div className="mt-2 space-y-1 text-xs">
                                                <p>• <strong>OOR (Official Organizational Role):</strong> Credentials for specific roles within organization</p>
                                                <p>• <strong>ECR (Engagement Context Role):</strong> Credentials for relationships with other entities</p>
                                                <p>• <strong>Credential Chain:</strong> Full provenance from GLEIF root → Platform → PSP → Merchant</p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                            <h4 className="font-semibold mb-2 text-blue-900">Grace Period Mechanism</h4>
                                            <p className="text-sm text-slate-700 mb-2">
                                                PSPs can request a 6-month grace period if they don't have LEI/vLEI at provisioning. The platform tracks:
                                            </p>
                                            <ul className="text-sm space-y-1 text-slate-700">
                                                <li>• <code>lei_grace_period_end</code> - LEI must be obtained</li>
                                                <li>• <code>vlei_grace_period_end</code> - vLEI credential required</li>
                                                <li>• <code>oor_grace_period_end</code> - OOR credentials needed</li>
                                                <li>• <code>ecr_grace_period_end</code> - ECR relationships established</li>
                                            </ul>
                                            <Alert className="mt-3 bg-amber-50 border-amber-300">
                                                <AlertDescription className="text-xs">
                                                    <strong>Enforcement:</strong> PSPs approaching deadline receive warnings. Expired grace periods trigger account suspension until credentials are provided.
                                                </AlertDescription>
                                            </Alert>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-200 rounded p-4">
                                            <h4 className="font-semibold mb-2">TAS (Third-Party Attestation Service)</h4>
                                            <p className="text-sm text-slate-700">
                                                Allows pre-vetted businesses with existing LEI/vLEI and completed KYB/KYC/AML to fast-track provisioning. TAS providers issue attestation certificates that the platform validates, bypassing redundant compliance checks.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Regulatory Compliance Stack</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { 
                                                title: 'PCI DSS Level 1', 
                                                icon: Lock,
                                                items: ['Tokenized card storage', 'Encrypted data at rest/transit', 'Annual compliance audits', 'Network segmentation']
                                            },
                                            { 
                                                title: 'GDPR Compliance', 
                                                icon: Shield,
                                                items: ['Data retention policies', 'Right to erasure', 'Consent management', 'Data breach protocols']
                                            },
                                            { 
                                                title: 'FATF Travel Rule', 
                                                icon: Globe,
                                                items: ['Sanctions screening', 'AML monitoring', 'Travel rule data collection', 'SAR filing']
                                            },
                                            { 
                                                title: 'ISO 27001', 
                                                icon: CheckCircle2,
                                                items: ['Information security', 'Risk assessment', 'Access controls', 'Incident response']
                                            }
                                        ].map((standard, i) => {
                                            const Icon = standard.icon;
                                            return (
                                                <div key={i} className="border border-slate-200 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Icon className="h-5 w-5 text-blue-600" />
                                                        <h4 className="font-semibold">{standard.title}</h4>
                                                    </div>
                                                    <ul className="space-y-1 text-sm text-slate-700">
                                                        {standard.items.map((item, j) => (
                                                            <li key={j}>• {item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Workflows */}
                {activeSection === 'workflows' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Activity className="h-6 w-6 text-blue-600" />
                                    Platform Workflows & User Journeys
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Workflow 1 */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded">Workflow 1</span>
                                        PSP Provisioning Journey
                                    </h3>
                                    <div className="space-y-3">
                                        {[
                                            { step: 1, title: 'User Registration', desc: 'Business owner creates account in Community Portal', color: 'bg-blue-50 border-blue-200' },
                                            { step: 2, title: 'Provisioning Wizard', desc: 'Complete 9-step configuration: Tier → Business → Services → Appearance → Fees → Payments → Payouts → Regional → Review', color: 'bg-blue-50 border-blue-200' },
                                            { step: 3, title: 'LEI/vLEI Verification', desc: 'Provide LEI or request 6-month grace period. TAS certificate fast-tracks approval.', color: 'bg-blue-50 border-blue-200' },
                                            { step: 4, title: 'Approval Queue', desc: 'Platform team reviews request, validates compliance, approves/rejects', color: 'bg-amber-50 border-amber-200' },
                                            { step: 5, title: 'Cloud Deployment', desc: 'Multi-cloud resource orchestration provisions infrastructure (database, compute, storage)', color: 'bg-purple-50 border-purple-200' },
                                            { step: 6, title: 'Schema Creation', desc: 'Isolated database schema created with psp_code namespace', color: 'bg-purple-50 border-purple-200' },
                                            { step: 7, title: 'Admin Account Setup', desc: 'First admin user created for PSP portal access', color: 'bg-emerald-50 border-emerald-200' },
                                            { step: 8, title: 'PSP Portal Activation', desc: 'White-label portal live with custom branding and domain', color: 'bg-emerald-50 border-emerald-200' },
                                            { step: 9, title: 'Go-Live', desc: 'PSP can now onboard merchants and process transactions', color: 'bg-green-50 border-green-200' }
                                        ].map((item) => (
                                            <div key={item.step} className={`border-2 rounded-lg p-4 ${item.color}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold">
                                                        {item.step}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold">{item.title}</h4>
                                                        <p className="text-sm text-slate-700">{item.desc}</p>
                                                    </div>
                                                    {item.step < 9 && <ArrowRight className="h-5 w-5 text-slate-400" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Workflow 2 */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded">Workflow 2</span>
                                        Merchant Onboarding Journey
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { step: 'PSP Creates Merchant', detail: 'Enter business details, generate unique merchant_code', icon: Building2 },
                                            { step: 'Self-Onboarding URL', detail: 'Generate secure token-based URL for merchant to complete KYB', icon: Globe },
                                            { step: 'KYB Verification', detail: 'TheKYB integration validates business documents and ownership', icon: Shield },
                                            { step: 'AML Screening', detail: 'AMLWatcher screens against sanctions lists and PEP databases', icon: CheckCircle2 },
                                            { step: 'Pricing Configuration', detail: 'PSP sets merchant-specific fees or inherits defaults', icon: DollarSign },
                                            { step: 'MID Assignment', detail: 'Allocate acquiring bank MID(s) for transaction processing', icon: CreditCard },
                                            { step: 'User Provisioning', detail: 'Create merchant portal users with role assignments', icon: Users },
                                            { step: 'Portal Access Granted', detail: 'Merchant can login, view dashboard, process payments', icon: CheckCircle2 }
                                        ].map((item, i) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={i} className="bg-slate-50 border border-slate-200 rounded p-4">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Icon className="h-5 w-5 text-emerald-600" />
                                                        <h4 className="font-semibold text-sm">{item.step}</h4>
                                                    </div>
                                                    <p className="text-xs text-slate-600">{item.detail}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Workflow 3 */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded">Workflow 3</span>
                                        Transaction Processing Flow
                                    </h3>
                                    <div className="bg-slate-900 text-white rounded-lg p-6">
                                        <pre className="text-xs font-mono whitespace-pre overflow-x-auto">
{`Transaction Lifecycle:

1. INITIATION
   Merchant/VT → Create transaction request
   ├─ Validate merchant status (active)
   ├─ Check MID configuration
   └─ Verify customer data

2. FRAUD DETECTION (if enabled)
   ├─ AI Risk Scoring
   ├─ Velocity checks
   ├─ Geo-IP analysis
   └─ Card testing detection

3. ROUTING DECISION
   Smart Router analyzes:
   ├─ Card network (Visa, MC, etc.)
   ├─ Transaction amount
   ├─ Currency & country
   ├─ Merchant MCC code
   ├─ Time of day
   ├─ Provider success rates
   └─ Cost optimization

4. ORCHESTRATION
   ├─ Primary Provider → Send authorization request
   │   ├─ Success → Continue
   │   └─ Failure → Cascade to next provider
   ├─ Retry Logic (if enabled)
   └─ Load Balancing across providers

5. AUTHORIZATION
   Payment Provider/Network:
   ├─ Card validation
   ├─ Issuer authorization
   ├─ 3DS verification (if required)
   └─ Response code (approved/declined)

6. RECORDING
   ├─ Create Transaction entity
   ├─ Log ISO 20022/8583 data
   ├─ Sign with vLEI (if enabled)
   ├─ Update merchant balances
   └─ Trigger webhooks

7. SETTLEMENT
   ├─ Batch transactions by merchant
   ├─ Calculate fees and net amounts
   ├─ Generate settlement reports
   └─ Initiate payout via configured route

8. RECONCILIATION
   ├─ Match platform records with provider statements
   ├─ Identify discrepancies
   └─ Update financial records

Status Flow: pending → processing → approved/declined → settled`}
                                        </pre>
                                    </div>
                                </div>

                                {/* Workflow 4 */}
                                <div>
                                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded">Workflow 4</span>
                                        Wholesale Marketplace Flow
                                    </h3>
                                    <p className="text-slate-700 mb-4">
                                        PSPs can become service providers, offering their capabilities to other PSPs on the platform, creating a B2B marketplace within the ecosystem.
                                    </p>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-cyan-100 rounded flex items-center justify-center font-bold text-cyan-700">1</div>
                                            <div className="flex-1 bg-slate-50 border rounded p-3">
                                                <p className="font-semibold">Provider PSP Creates Offering</p>
                                                <p className="text-slate-600">Define service, pricing model, features in PSPWholesaleOffering entity</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-cyan-100 rounded flex items-center justify-center font-bold text-cyan-700">2</div>
                                            <div className="flex-1 bg-slate-50 border rounded p-3">
                                                <p className="font-semibold">Platform Approval</p>
                                                <p className="text-slate-600">FTS admin reviews and approves offering before marketplace publication</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-cyan-100 rounded flex items-center justify-center font-bold text-cyan-700">3</div>
                                            <div className="flex-1 bg-slate-50 border rounded p-3">
                                                <p className="font-semibold">Reseller PSP Subscribes</p>
                                                <p className="text-slate-600">Browse marketplace, subscribe to offering, create PSPResellerRelationship</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-cyan-100 rounded flex items-center justify-center font-bold text-cyan-700">4</div>
                                            <div className="flex-1 bg-slate-50 border rounded p-3">
                                                <p className="font-semibold">Revenue Sharing</p>
                                                <p className="text-slate-600">Platform takes commission (default 15%), remainder split between provider and reseller</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* ISO Standards */}
                {activeSection === 'iso' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                    ISO Standards Implementation
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <p className="text-slate-700">
                                    FTS.Money is built on international standards to ensure global interoperability, regulatory compliance, and future-proof architecture.
                                </p>

                                <div className="space-y-4">
                                    {[
                                        {
                                            standard: 'ISO 20022',
                                            title: 'Financial Messaging Standard',
                                            description: 'Universal XML-based message format for financial transactions. Used by SWIFT, FedNow, SEPA, and central banks worldwide.',
                                            implementation: [
                                                'Transaction messages include iso20022_message_id, iso20022_payment_info_id',
                                                'End-to-end identification tracking (iso20022_end_to_end_id)',
                                                'UETR (Unique End-to-End Transaction Reference) for cross-border tracking',
                                                'Charge bearer codes (DEBT, CRED, SHAR, SLEV)',
                                                'Purpose codes for transaction categorization'
                                            ],
                                            color: 'blue'
                                        },
                                        {
                                            standard: 'ISO 8583',
                                            title: 'Card Transaction Messaging',
                                            description: 'Standard for card payment messages between acquirers, issuers, and card networks.',
                                            implementation: [
                                                'RRN (Retrieval Reference Number) for transaction tracing',
                                                'ECI (Electronic Commerce Indicator) for 3D Secure transactions',
                                                'ARN (Acquirer Reference Number) for chargebacks',
                                                'Auth codes and response codes from card networks',
                                                'Full ISO 8583 message encoding/decoding capability'
                                            ],
                                            color: 'emerald'
                                        },
                                        {
                                            standard: 'ISO 4217',
                                            title: 'Currency Codes',
                                            description: 'Three-letter currency codes and numeric codes for representing currencies worldwide.',
                                            implementation: [
                                                'Complete currency catalog with 40+ supported currencies',
                                                'Minor unit handling (cents, pence, etc.)',
                                                'Currency conversion and multi-currency support',
                                                'Currency-specific fee configuration',
                                                'Validation utilities in utils/iso4217.jsx'
                                            ],
                                            color: 'purple'
                                        },
                                        {
                                            standard: 'ISO 23257',
                                            title: 'Blockchain & DLT',
                                            description: 'Standard for distributed ledger technology and crypto asset transactions.',
                                            implementation: [
                                                'Digital Token Identifier (DTI) - 9-character alphanumeric',
                                                'Blockchain network and chain ID tracking',
                                                'Crypto asset registry (BTC, ETH, USDT, USDC)',
                                                'Transaction hash recording and verification',
                                                'Wallet address validation'
                                            ],
                                            color: 'amber'
                                        },
                                        {
                                            standard: 'ISO 17442',
                                            title: 'Legal Entity Identifier (LEI)',
                                            description: 'Global reference identifier for legal entities in financial transactions.',
                                            implementation: [
                                                'GLEIF API integration for LEI validation',
                                                'vLEI credential issuance and verification',
                                                'Credential chain provenance tracking',
                                                'Grace period management for compliance',
                                                'OOR/ECR credential support'
                                            ],
                                            color: 'cyan'
                                        },
                                        {
                                            standard: 'ISO 3166',
                                            title: 'Country Codes',
                                            description: 'Two-letter and three-letter country codes for geographic identification.',
                                            implementation: [
                                                'Complete country database with alpha-2 and alpha-3 codes',
                                                'Country-based routing rules',
                                                'Regional compliance configuration',
                                                'Geo-IP validation and fraud detection'
                                            ],
                                            color: 'pink'
                                        }
                                    ].map((iso, i) => {
                                        const colorClasses = {
                                            blue: 'bg-blue-50 border-blue-200',
                                            emerald: 'bg-emerald-50 border-emerald-200',
                                            purple: 'bg-purple-50 border-purple-200',
                                            amber: 'bg-amber-50 border-amber-200',
                                            cyan: 'bg-cyan-50 border-cyan-200',
                                            pink: 'bg-pink-50 border-pink-200'
                                        };
                                        return (
                                            <div key={i} className={`border-2 rounded-lg p-4 ${colorClasses[iso.color]}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className="font-mono">{iso.standard}</Badge>
                                                    <h4 className="font-semibold">{iso.title}</h4>
                                                </div>
                                                <p className="text-sm text-slate-700 mb-3">{iso.description}</p>
                                                <div className="bg-white rounded p-3">
                                                    <p className="font-semibold text-xs mb-2">Implementation:</p>
                                                    <ul className="space-y-1 text-xs text-slate-700">
                                                        {iso.implementation.map((impl, j) => (
                                                            <li key={j}>• {impl}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Technical Stack */}
                {activeSection === 'tech' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Code className="h-6 w-6 text-blue-600" />
                                    Technology Stack
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-semibold mb-3 text-blue-900">Frontend</h4>
                                        <ul className="space-y-1 text-sm text-slate-700">
                                            <li>• React 18</li>
                                            <li>• TypeScript</li>
                                            <li>• Tailwind CSS</li>
                                            <li>• shadcn/ui Components</li>
                                            <li>• TanStack Query</li>
                                            <li>• React Router</li>
                                            <li>• Recharts (analytics)</li>
                                            <li>• Framer Motion</li>
                                        </ul>
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                                        <h4 className="font-semibold mb-3 text-emerald-900">Backend</h4>
                                        <ul className="space-y-1 text-sm text-slate-700">
                                            <li>• Base44 Platform (BaaS)</li>
                                            <li>• Deno Runtime (functions)</li>
                                            <li>• PostgreSQL (multi-tenant)</li>
                                            <li>• Entity CRUD SDK</li>
                                            <li>• Backend Functions (API)</li>
                                            <li>• Real-time subscriptions</li>
                                        </ul>
                                    </div>

                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <h4 className="font-semibold mb-3 text-purple-900">Infrastructure</h4>
                                        <ul className="space-y-1 text-sm text-slate-700">
                                            <li>• Multi-Cloud (AWS/GCP/Azure)</li>
                                            <li>• Docker Containers</li>
                                            <li>• Load Balancers</li>
                                            <li>• CDN (global edge)</li>
                                            <li>• Database Replication</li>
                                            <li>• Disaster Recovery</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Key Backend Functions</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {[
                                            { name: 'pspAuth', purpose: 'PSP staff authentication and session management' },
                                            { name: 'merchantAuth', purpose: 'Merchant user authentication with psp_code isolation' },
                                            { name: 'vtAuth', purpose: 'Virtual terminal operator authentication' },
                                            { name: 'platformAuth', purpose: 'Platform admin authentication with RBAC' },
                                            { name: 'pspData', purpose: 'Tenant-isolated data access for PSP queries' },
                                            { name: 'paymentOrchestrator', purpose: 'Smart routing and cascade logic execution' },
                                            { name: 'payoutOrchestrator', purpose: 'Settlement and payout route selection' },
                                            { name: 'kybVerification', purpose: 'TheKYB integration for business verification' },
                                            { name: 'amlScreening', purpose: 'AMLWatcher integration for sanctions checks' },
                                            { name: 'leiVerification', purpose: 'GLEIF API integration for LEI validation' },
                                            { name: 'iso20022Handler', purpose: 'ISO 20022 message encoding/decoding' },
                                            { name: 'blockchainConnector', purpose: 'Crypto transaction processing' },
                                            { name: 'resourceProvisioner', purpose: 'Multi-cloud infrastructure deployment' },
                                            { name: 'signedAuditLogger', purpose: 'Cryptographically signed audit logging' }
                                        ].map((func, i) => (
                                            <div key={i} className="bg-slate-50 border border-slate-200 rounded p-3">
                                                <p className="font-mono text-sm font-semibold mb-1">{func.name}</p>
                                                <p className="text-xs text-slate-600">{func.purpose}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Third-Party Integrations</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {[
                                            { name: 'Stripe', category: 'Payment Gateway' },
                                            { name: 'Adyen', category: 'Payment Gateway' },
                                            { name: 'PayPal', category: 'Digital Wallet' },
                                            { name: 'Coinbase', category: 'Crypto Exchange' },
                                            { name: 'TheKYB', category: 'KYB Verification' },
                                            { name: 'AMLWatcher', category: 'AML Screening' },
                                            { name: 'GLEIF', category: 'LEI Verification' },
                                            { name: 'Xero', category: 'Accounting' }
                                        ].map((integration, i) => (
                                            <div key={i} className="bg-white border-2 border-slate-200 rounded p-3 text-center">
                                                <p className="font-semibold text-sm">{integration.name}</p>
                                                <p className="text-xs text-slate-500">{integration.category}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Download Documentation */}
                <Card className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Complete System Documentation</h3>
                                <p className="text-blue-100">Comprehensive 50+ page technical specification, API reference, and compliance guide</p>
                            </div>
                            <Button className="bg-white text-blue-600 hover:bg-blue-50">
                                Download PDF
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}