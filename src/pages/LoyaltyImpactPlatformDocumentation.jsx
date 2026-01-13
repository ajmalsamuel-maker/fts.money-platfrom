import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import MermaidRenderer from '@/components/utils/MermaidRenderer';

export default function LoyaltyImpactPlatformDocumentation() {
    const [expandedSections, setExpandedSections] = useState({});

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Loyalty & IMPACT Platform Documentation</h1>
                    <p className="text-slate-600 text-lg">Complete technical guide for implementation, integration, and operations</p>
                    <div className="flex gap-2 mt-4">
                        <Badge className="bg-emerald-100 text-emerald-800">v2.0.0</Badge>
                        <Badge className="bg-blue-100 text-blue-800">Production Ready</Badge>
                        <Badge className="bg-purple-100 text-purple-800">Multi-Tenant</Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-2">
                        Last Updated: January 13, 2026
                    </div>
                </div>

                {/* Table of Contents */}
                <Card className="mb-8 bg-white">
                    <CardHeader>
                        <CardTitle>Table of Contents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <a href="#overview" className="block text-blue-600 hover:underline">1. Platform Overview</a>
                                <a href="#architecture" className="block text-blue-600 hover:underline">2. System Architecture</a>
                                <a href="#core-concepts" className="block text-blue-600 hover:underline">3. Core Concepts</a>
                                <a href="#entities" className="block text-blue-600 hover:underline">4. Data Entities & Schemas</a>
                                <a href="#user-flows" className="block text-blue-600 hover:underline">5. User Flows & Diagrams</a>
                            </div>
                            <div className="space-y-2">
                                <a href="#features" className="block text-blue-600 hover:underline">6. Core Features</a>
                                <a href="#integration" className="block text-blue-600 hover:underline">7. Integration Guide</a>
                                <a href="#api-reference" className="block text-blue-600 hover:underline">8. API Reference</a>
                                <a href="#operations" className="block text-blue-600 hover:underline">9. Operations & Management</a>
                                <a href="#compliance" className="block text-blue-600 hover:underline">10. Compliance & Security</a>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Documentation */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10 h-auto mb-6">
                        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                        <TabsTrigger value="architecture" className="text-xs">Architecture</TabsTrigger>
                        <TabsTrigger value="concepts" className="text-xs">Concepts</TabsTrigger>
                        <TabsTrigger value="entities" className="text-xs">Entities</TabsTrigger>
                        <TabsTrigger value="flows" className="text-xs">Flows</TabsTrigger>
                        <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
                        <TabsTrigger value="integration" className="text-xs">Integration</TabsTrigger>
                        <TabsTrigger value="api" className="text-xs">API</TabsTrigger>
                        <TabsTrigger value="operations" className="text-xs">Operations</TabsTrigger>
                        <TabsTrigger value="compliance" className="text-xs">Compliance</TabsTrigger>
                    </TabsList>

                    {/* 1. OVERVIEW */}
                    <TabsContent value="overview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Platform Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Vision & Purpose</h3>
                                    <p className="text-slate-700 mb-4">
                                        The Loyalty & IMPACT Platform is a comprehensive, multi-tenant SaaS solution designed to enable organizations to build, manage, and scale customer loyalty programs with integrated impact metrics, gamification, and blockchain-based token systems.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Key Features</h3>
                                    <ul className="space-y-2 text-slate-700">
                                        <li>✓ Multi-tenant loyalty program management</li>
                                        <li>✓ Real-time points/token earning and redemption</li>
                                        <li>✓ Gamification framework (challenges, leaderboards, achievements)</li>
                                        <li>✓ Blockchain token integration (ERC-20 compatible)</li>
                                        <li>✓ Carbon offset and ESG impact tracking</li>
                                        <li>✓ Dynamic reward catalog with AI-powered recommendations</li>
                                        <li>✓ Advanced analytics and reporting dashboards</li>
                                        <li>✓ Comprehensive RBAC and audit logging</li>
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Target Users</h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Card className="bg-blue-50">
                                            <CardContent className="p-4">
                                                <p className="font-semibold text-blue-900">Merchants</p>
                                                <p className="text-sm text-blue-800 mt-2">Retail, e-commerce, hospitality businesses building customer loyalty</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-green-50">
                                            <CardContent className="p-4">
                                                <p className="font-semibold text-green-900">Enterprises</p>
                                                <p className="text-sm text-green-800 mt-2">Large organizations with complex loyalty and impact initiatives</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-purple-50">
                                            <CardContent className="p-4">
                                                <p className="font-semibold text-purple-900">Partners</p>
                                                <p className="text-sm text-purple-800 mt-2">ISVs and integrators extending platform capabilities</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 2. ARCHITECTURE */}
                    <TabsContent value="architecture" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>2. System Architecture</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">High-Level Architecture Diagram</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                                        <MermaidRenderer chart={`
graph TB
    subgraph Client["Client Layer"]
        WEB["Web Portal"]
        MOBILE["Mobile App"]
        PARTNER["Partner API"]
    end
    
    subgraph Gateway["API Gateway"]
        AUTH["Auth Service"]
        RATE["Rate Limiting"]
        VALIDATE["Validation"]
    end
    
    subgraph Core["Core Services"]
        LOYALTY["Loyalty Service"]
        GAMIFICATION["Gamification Engine"]
        REWARDS["Rewards Manager"]
        IMPACT["Impact Tracker"]
    end
    
    subgraph Data["Data Layer"]
        DB[(("Primary DB"))]
        CACHE[("Cache Layer")]
        QUEUE["Message Queue"]
    end
    
    subgraph Integration["External Integrations"]
        BLOCKCHAIN["Blockchain Network"]
        PAYMENT["Payment Systems"]
        CRM["CRM Systems"]
    end
    
    Client --> Gateway
    Gateway --> Core
    Core --> Data
    Core --> Integration
`} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">Component Breakdown</h3>
                                    <div className="space-y-3">
                                        {[
                                            { name: "Loyalty Service", desc: "Manages programs, members, and point lifecycle", tech: "Node.js" },
                                            { name: "Gamification Engine", desc: "Handles challenges, achievements, leaderboards", tech: "React + D3" },
                                            { name: "Rewards Manager", desc: "Catalog management, redemption workflows", tech: "Node.js" },
                                            { name: "Impact Tracker", desc: "Carbon offsets, ESG metrics, sustainability", tech: "Analytics Engine" },
                                            { name: "Blockchain Connector", desc: "Token minting/burning, smart contracts", tech: "Web3.js/Ethers" },
                                            { name: "Analytics Hub", desc: "Real-time dashboards, reporting", tech: "ClickHouse" }
                                        ].map((comp, idx) => (
                                            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                                                <p className="font-semibold text-slate-900">{comp.name}</p>
                                                <p className="text-sm text-slate-600">{comp.desc}</p>
                                                <Badge className="mt-2 bg-slate-100 text-slate-800">{comp.tech}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 3. CORE CONCEPTS */}
                    <TabsContent value="concepts" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>3. Core Concepts & Terminology</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    {[
                                        { term: "Loyalty Program", def: "Top-level container for all loyalty mechanics. Each organization can manage multiple programs." },
                                        { term: "Member", def: "A participant enrolled in a loyalty program with earned points, tier status, and achievement history." },
                                        { term: "Point/Token", def: "Fundamental unit of value. Can be points (traditional) or blockchain tokens (native/bridged)." },
                                        { term: "Earning Rule", def: "Business logic defining how members earn points. Examples: $1 spent = 10 points, or 1 referral = 50 points." },
                                        { term: "Tier", def: "Membership level (Bronze, Silver, Gold) with escalating benefits and unlock thresholds." },
                                        { term: "Challenge", def: "Gamification mechanic: specific tasks members complete to earn bonus points/badges." },
                                        { term: "Achievement", def: "Badge/credential earned by completing challenges or reaching milestones." },
                                        { term: "Leaderboard", def: "Real-time ranking of members based on points, challenges completed, or impact metrics." },
                                        { term: "Redemption", def: "Converting earned points into rewards (discounts, products, experiences)." },
                                        { term: "Impact Score", def: "ESG metric measuring environmental/social contributions through loyalty activities." },
                                        { term: "Carbon Credit", def: "Tokenized carbon offset associated with sustainable rewards." },
                                        { term: "Blockchain Wallet", def: "User's wallet address holding loyalty tokens on blockchain." }
                                    ].map((item, idx) => (
                                        <div key={idx} className="border-b border-slate-200 pb-3 last:border-b-0">
                                            <p className="font-semibold text-slate-900">{item.term}</p>
                                            <p className="text-sm text-slate-600 mt-1">{item.def}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 4. ENTITIES */}
                    <TabsContent value="entities" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>4. Data Entities & Schemas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">LoyaltyProgram Entity</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200 overflow-x-auto text-sm">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left p-2">Field</th>
                                                    <th className="text-left p-2">Type</th>
                                                    <th className="text-left p-2">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { field: "id", type: "UUID", desc: "Primary identifier" },
                                                    { field: "name", type: "String", desc: "Program name" },
                                                    { field: "description", type: "Text", desc: "Program description" },
                                                    { field: "organization_id", type: "UUID", desc: "Parent organization" },
                                                    { field: "status", type: "Enum", desc: "active | inactive | suspended" },
                                                    { field: "currency", type: "String", desc: "Point currency code" },
                                                    { field: "total_members", type: "Integer", desc: "Enrolled participants" },
                                                    { field: "total_points_issued", type: "Decimal", desc: "Cumulative points issued" },
                                                    { field: "total_points_redeemed", type: "Decimal", desc: "Cumulative points redeemed" },
                                                    { field: "blockchain_enabled", type: "Boolean", desc: "Token integration enabled" },
                                                    { field: "token_contract_address", type: "String", desc: "ERC-20 contract address" },
                                                    { field: "impact_enabled", type: "Boolean", desc: "ESG tracking enabled" },
                                                    { field: "created_date", type: "Timestamp", desc: "Creation timestamp" }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
                                                        <td className="p-2 font-mono">{row.field}</td>
                                                        <td className="p-2">{row.type}</td>
                                                        <td className="p-2">{row.desc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">LoyaltyMember Entity</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200 overflow-x-auto text-sm">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left p-2">Field</th>
                                                    <th className="text-left p-2">Type</th>
                                                    <th className="text-left p-2">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { field: "id", type: "UUID", desc: "Member identifier" },
                                                    { field: "program_id", type: "UUID", desc: "Parent program" },
                                                    { field: "customer_id", type: "String", desc: "External customer reference" },
                                                    { field: "email", type: "Email", desc: "Member email" },
                                                    { field: "phone", type: "String", desc: "Contact phone" },
                                                    { field: "tier", type: "String", desc: "bronze | silver | gold | platinum" },
                                                    { field: "current_points", type: "Decimal", desc: "Available points balance" },
                                                    { field: "lifetime_points", type: "Decimal", desc: "Total points ever earned" },
                                                    { field: "wallet_address", type: "String", desc: "Blockchain wallet (ERC-20)" },
                                                    { field: "impact_score", type: "Decimal", desc: "ESG impact metric" },
                                                    { field: "joined_date", type: "Timestamp", desc: "Enrollment date" },
                                                    { field: "last_activity", type: "Timestamp", desc: "Last interaction" }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
                                                        <td className="p-2 font-mono">{row.field}</td>
                                                        <td className="p-2">{row.type}</td>
                                                        <td className="p-2">{row.desc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">EarningRule Entity</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200 overflow-x-auto text-sm">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left p-2">Field</th>
                                                    <th className="text-left p-2">Type</th>
                                                    <th className="text-left p-2">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { field: "id", type: "UUID", desc: "Rule identifier" },
                                                    { field: "program_id", type: "UUID", desc: "Parent program" },
                                                    { field: "name", type: "String", desc: "Rule name" },
                                                    { field: "event_type", type: "Enum", desc: "purchase | referral | review | challenge | social" },
                                                    { field: "points_multiplier", type: "Decimal", desc: "Points per unit (e.g., 10 per $1)" },
                                                    { field: "max_points_per_transaction", type: "Decimal", desc: "Cap on single earning event" },
                                                    { field: "frequency_limit", type: "String", desc: "once_per_day | once_per_week | unlimited" },
                                                    { field: "min_transaction_amount", type: "Decimal", desc: "Minimum to trigger earning" },
                                                    { field: "conditions", type: "JSON", desc: "Custom business logic" },
                                                    { field: "status", type: "Enum", desc: "active | inactive" },
                                                    { field: "created_date", type: "Timestamp", desc: "Creation date" }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
                                                        <td className="p-2 font-mono">{row.field}</td>
                                                        <td className="p-2">{row.type}</td>
                                                        <td className="p-2">{row.desc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">RedemptionOption Entity</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200 overflow-x-auto text-sm">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left p-2">Field</th>
                                                    <th className="text-left p-2">Type</th>
                                                    <th className="text-left p-2">Description</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { field: "id", type: "UUID", desc: "Reward identifier" },
                                                    { field: "program_id", type: "UUID", desc: "Parent program" },
                                                    { field: "name", type: "String", desc: "Reward name" },
                                                    { field: "description", type: "Text", desc: "Reward description" },
                                                    { field: "category", type: "String", desc: "discount | product | experience | donation" },
                                                    { field: "points_cost", type: "Decimal", desc: "Points required" },
                                                    { field: "monetary_value", type: "Decimal", desc: "Cash value equivalent" },
                                                    { field: "quantity_available", type: "Integer", desc: "-1 for unlimited" },
                                                    { field: "quantity_redeemed", type: "Integer", desc: "Redemptions count" },
                                                    { field: "impact_category", type: "String", desc: "carbon_offset | tree_planted | water_saved" },
                                                    { field: "status", type: "Enum", desc: "active | inactive | archived" },
                                                    { field: "expiry_date", type: "Timestamp", desc: "Reward availability end" }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
                                                        <td className="p-2 font-mono">{row.field}</td>
                                                        <td className="p-2">{row.type}</td>
                                                        <td className="p-2">{row.desc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 5. USER FLOWS */}
                    <TabsContent value="flows" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>5. User Flows & Detailed Diagrams</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">5.1 Member Enrollment Flow</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                                        <MermaidRenderer chart={`
sequenceDiagram
    participant Member as Member/Customer
    participant Portal as Web Portal
    participant API as Loyalty API
    participant DB as Database
    participant Email as Email Service
    
    Member->>Portal: Click "Join Program"
    Portal->>Portal: Display enrollment form
    Member->>Portal: Enter email, phone, preferences
    Portal->>API: POST /programs/{id}/members
    API->>API: Validate input & check duplicates
    API->>DB: Create member record
    DB-->>API: Member created (ID, tier=bronze)
    API->>Email: Send welcome email
    Email-->>Member: Welcome + how to earn points
    API-->>Portal: Success response
    Portal->>Portal: Show confirmation
    Portal-->>Member: "Welcome! Start earning points"
`} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">5.2 Point Earning Flow</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                                        <MermaidRenderer chart={`
sequenceDiagram
    participant Customer as Customer
    participant Merchant as Merchant System
    participant API as Points API
    participant Rules as Rules Engine
    participant DB as Database
    participant Cache as Cache Layer
    
    Customer->>Merchant: Make purchase ($100)
    Merchant->>API: POST /earnings/process {member_id, amount}
    API->>Rules: Evaluate earning rules
    Rules->>DB: Get active rules for program
    DB-->>Rules: Rules data
    Rules->>Rules: Calculate points (100 * 10 = 1000 pts)
    Rules-->>API: 1000 points earned
    API->>DB: Increment member.current_points
    API->>Cache: Update member balance cache
    API->>DB: Log transaction
    DB-->>API: Confirmed
    API-->>Merchant: {points_earned: 1000, balance: 5500}
    Merchant-->>Customer: "Earned 1000 points! Total: 5500"
`} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">5.3 Redemption Flow</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                                        <MermaidRenderer chart={`
sequenceDiagram
    participant Member as Member Portal
    participant API as Redemption API
    participant Rules as Validation Engine
    participant DB as Database
    participant Integration as Fulfillment Integration
    
    Member->>API: GET /rewards - List available
    API->>DB: Get active rewards
    DB-->>API: Rewards list (filtered by member tier)
    API-->>Member: Show reward catalog
    
    Member->>API: POST /redemptions {reward_id, member_id}
    API->>Rules: Validate eligibility
    Rules->>DB: Check member balance
    DB-->>Rules: current_points = 8500
    Rules->>DB: Check reward availability
    DB-->>Rules: cost = 5000 pts, qty = 10
    Rules->>Rules: Validate: 8500 >= 5000? YES
    Rules-->>API: Approved
    API->>DB: Create redemption record (PENDING)
    DB-->>API: Confirmed
    API->>Integration: Send fulfillment request
    Integration-->>API: Processing...
    API->>DB: Update member points (8500 - 5000 = 3500)
    DB-->>API: Updated
    API-->>Member: "Redemption confirmed! Processing..."
    Integration->>DB: Update redemption status (COMPLETED)
`} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">5.4 Tier Progression Flow</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                                        <MermaidRenderer chart={`
graph TD
    A["Member Earns Points"] --> B{"Lifetime Points >= Tier Threshold?"}
    B -->|No| C["Stay in Current Tier"]
    B -->|Yes| D["Check Next Tier Requirements"]
    D --> E{"All Requirements Met?"}
    E -->|No| F["Remain in Current Tier"]
    E -->|Yes| G["Upgrade to Next Tier"]
    G --> H["Update Member Record"]
    H --> I["Send Tier Upgrade Email"]
    I --> J["Apply Tier Benefits"]
    J --> K["Unlock Premium Rewards"]
    K --> L["Log to Audit Trail"]
    L --> M["✓ Member Tier Upgraded"]
    
    C --> N["✓ Continue Earning"]
    F --> N
`} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">5.5 Challenge Completion Flow</h3>
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
                                        <MermaidRenderer chart={`
sequenceDiagram
    participant Member as Member
    participant App as Mobile App
    participant API as Challenge API
    participant Rules as Validation
    participant DB as Database
    
    Member->>App: View active challenges
    App->>API: GET /challenges/active
    API->>DB: Get member's active challenges
    DB-->>API: [Challenge A, Challenge B, Challenge C]
    API-->>App: Display challenges with progress
    
    Member->>App: Complete Challenge A (e.g., make 5 purchases)
    App->>API: POST /challenges/{id}/complete
    API->>Rules: Validate completion criteria
    Rules->>DB: Check transaction history
    DB-->>Rules: Found 5 purchases in 7 days
    Rules-->>API: Criteria met ✓
    API->>DB: Mark challenge complete
    API->>DB: Award bonus points (500 pts)
    API->>DB: Award achievement badge
    DB-->>API: Updated
    API-->>App: Success
    App-->>Member: "Challenge Complete! +500 pts & Badge Earned"
`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 6. FEATURES */}
                    <TabsContent value="features" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>6. Core Features & Capabilities</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-3">6.1 Gamification Engine</h3>
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                        <p className="text-sm"><strong>Features:</strong></p>
                                        <ul className="text-sm text-slate-700 mt-2 space-y-1 ml-4">
                                            <li>• Dynamic challenges with rules engine</li>
                                            <li>• Real-time leaderboards (global, friend, tier-based)</li>
                                            <li>• Achievement badges with unlock conditions</li>
                                            <li>• Streak tracking for consistent engagement</li>
                                            <li>• Social sharing incentives</li>
                                            <li>• AI-powered challenge recommendations</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">6.2 Tiered Membership System</h3>
                                    <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                                        <p className="text-sm"><strong>Tier Levels:</strong></p>
                                        <div className="mt-3 space-y-2 text-sm">
                                            <div className="flex justify-between"><span>Bronze (0-999 pts)</span><span className="text-slate-600">Base benefits</span></div>
                                            <div className="flex justify-between"><span>Silver (1000-4999 pts)</span><span className="text-slate-600">+5% bonus points</span></div>
                                            <div className="flex justify-between"><span>Gold (5000-9999 pts)</span><span className="text-slate-600">+10% + exclusive rewards</span></div>
                                            <div className="flex justify-between"><span>Platinum (10000+ pts)</span><span className="text-slate-600">+15% + VIP access</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">6.3 IMPACT Sustainability Tracking</h3>
                                    <div className="bg-green-50 border-l-4 border-green-500 p-4">
                                        <p className="text-sm"><strong>Impact Metrics:</strong></p>
                                        <ul className="text-sm text-slate-700 mt-2 space-y-1 ml-4">
                                            <li>• Carbon offset tracking (kg CO₂ equivalent)</li>
                                            <li>• Tree planting milestones</li>
                                            <li>• Water conservation metrics</li>
                                            <li>• Charitable donation tracking</li>
                                            <li>• ESG score calculation</li>
                                            <li>• Verifiable impact certificates</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">6.4 Blockchain Token Integration</h3>
                                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                                        <p className="text-sm"><strong>Capabilities:</strong></p>
                                        <ul className="text-sm text-slate-700 mt-2 space-y-1 ml-4">
                                            <li>• ERC-20 token minting/burning</li>
                                            <li>• Wallet management (Metamask, WalletConnect)</li>
                                            <li>• Cross-chain bridge support</li>
                                            <li>• DeFi yield farming integration</li>
                                            <li>• NFT achievement minting</li>
                                            <li>• Liquidity pool integration</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">6.5 Advanced Analytics</h3>
                                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
                                        <p className="text-sm"><strong>Dashboard Metrics:</strong></p>
                                        <ul className="text-sm text-slate-700 mt-2 space-y-1 ml-4">
                                            <li>• Member engagement scores</li>
                                            <li>• Redemption rate analysis</li>
                                            <li>• Cohort retention tracking</li>
                                            <li>• RLV (Rewards Lifetime Value)</li>
                                            <li>• Program ROI metrics</li>
                                            <li>• Predictive churn analysis</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 7. INTEGRATION */}
                    <TabsContent value="integration" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>7. Integration Guide</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">7.1 REST API Integration</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <p className="text-sm font-mono mb-3">Base URL: https://api.loyalty.fts.money/v1</p>
                                        <p className="text-sm mb-3">Authentication: Bearer {'{token}'}</p>
                                        
                                        <p className="font-semibold text-sm mb-2">Example: Enroll Member</p>
                                        <div className="bg-slate-900 text-slate-100 p-3 rounded text-xs font-mono overflow-x-auto">
                                            {`POST /programs/{program_id}/members
Authorization: Bearer your_token
Content-Type: application/json

{
  "email": "customer@example.com",
  "phone": "+1234567890",
  "first_name": "John",
  "last_name": "Doe",
  "external_id": "CUST_12345",
  "preferences": {
    "opt_in_email": true,
    "opt_in_sms": false
  }
}`}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">7.2 Webhook Events</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <p className="text-sm mb-3">Platform sends real-time events to your webhook endpoint:</p>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left p-2">Event</th>
                                                    <th className="text-left p-2">Description</th>
                                                    <th className="text-left p-2">Use Case</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { event: "member.enrolled", desc: "New member joins program", use: "Send welcome offer" },
                                                    { event: "points.earned", desc: "Points awarded to member", use: "Update customer profile" },
                                                    { event: "points.redeemed", desc: "Reward redeemed", use: "Fulfill reward" },
                                                    { event: "tier.upgraded", desc: "Member reaches new tier", use: "Trigger VIP campaign" },
                                                    { event: "challenge.completed", desc: "Member completes challenge", use: "Send social share" },
                                                    { event: "achievement.unlocked", desc: "Badge earned", use: "Celebratory notification" }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
                                                        <td className="p-2 font-mono">{row.event}</td>
                                                        <td className="p-2 text-xs">{row.desc}</td>
                                                        <td className="p-2 text-xs">{row.use}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">7.3 CRM System Integration</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <p className="text-sm mb-3">Supported integrations:</p>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Microsoft Dynamics", "Custom API"].map((sys, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-sm">
                                                    ✓ {sys}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">7.4 Payment Gateway Integration</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <p className="text-sm mb-3">Supported payment systems for reward redemption:</p>
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {["Stripe", "PayPal", "Square", "Adyen", "Razorpay", "Amazon Pay"].map((sys, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded border border-slate-200 text-sm">
                                                    ✓ {sys}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 8. API REFERENCE */}
                    <TabsContent value="api" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>8. API Reference</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">8.1 Core Endpoints</h3>
                                    <div className="space-y-3">
                                        {[
                                            { method: "POST", path: "/programs", desc: "Create loyalty program" },
                                            { method: "GET", path: "/programs/{id}", desc: "Get program details" },
                                            { method: "POST", path: "/programs/{id}/members", desc: "Enroll member" },
                                            { method: "GET", path: "/members/{id}/profile", desc: "Get member details" },
                                            { method: "POST", path: "/members/{id}/earnings", desc: "Award points" },
                                            { method: "GET", path: "/members/{id}/redemptions", desc: "Get redemption history" },
                                            { method: "POST", path: "/members/{id}/redeem", desc: "Redeem reward" },
                                            { method: "GET", path: "/programs/{id}/leaderboard", desc: "Get leaderboard" },
                                            { method: "POST", path: "/challenges", desc: "Create challenge" },
                                            { method: "GET", path: "/members/{id}/achievements", desc: "Get member badges" }
                                        ].map((ep, idx) => (
                                            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={ep.method === 'GET' ? 'bg-blue-600' : ep.method === 'POST' ? 'bg-green-600' : 'bg-yellow-600'}>
                                                        {ep.method}
                                                    </Badge>
                                                    <code className="text-sm font-mono">{ep.path}</code>
                                                </div>
                                                <p className="text-sm text-slate-700 mt-1">{ep.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">8.2 Rate Limiting & Quotas</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left p-2">Plan</th>
                                                    <th className="text-left p-2">Requests/Min</th>
                                                    <th className="text-left p-2">Max Members</th>
                                                    <th className="text-left p-2">Support</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { plan: "Starter", req: "60", members: "10,000", support: "Email" },
                                                    { plan: "Professional", req: "300", members: "100,000", support: "Email + Chat" },
                                                    { plan: "Enterprise", req: "1,000+", members: "Unlimited", support: "Dedicated" }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
                                                        <td className="p-2 font-semibold">{row.plan}</td>
                                                        <td className="p-2">{row.req}</td>
                                                        <td className="p-2">{row.members}</td>
                                                        <td className="p-2">{row.support}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">8.3 Error Codes</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left p-2">Code</th>
                                                    <th className="text-left p-2">Message</th>
                                                    <th className="text-left p-2">Resolution</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { code: "401", msg: "Unauthorized", res: "Check API key/token" },
                                                    { code: "422", msg: "Validation Error", res: "Review request data" },
                                                    { code: "429", msg: "Rate Limit Exceeded", res: "Implement backoff" },
                                                    { code: "500", msg: "Internal Server Error", res: "Contact support" },
                                                    { code: "INSUFFICIENT_POINTS", msg: "Not enough points", res: "User must earn more points" },
                                                    { code: "TIER_LOCK", msg: "Action restricted by tier", res: "Upgrade member tier" }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-100">
                                                        <td className="p-2 font-mono">{row.code}</td>
                                                        <td className="p-2">{row.msg}</td>
                                                        <td className="p-2">{row.res}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 9. OPERATIONS */}
                    <TabsContent value="operations" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>9. Operations & Management</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">9.1 Admin Dashboard Features</h3>
                                    <div className="space-y-3">
                                        {[
                                            { feature: "Program Management", desc: "Create, edit, configure programs", icon: "⚙️" },
                                            { feature: "Member Management", desc: "View, filter, segment members", icon: "👥" },
                                            { feature: "Rule Configuration", desc: "Define earning & redemption rules", icon: "📋" },
                                            { feature: "Reward Catalog", desc: "Manage rewards and inventory", icon: "🎁" },
                                            { feature: "Analytics Dashboard", desc: "Real-time KPIs and trends", icon: "📊" },
                                            { feature: "Bulk Operations", desc: "Import members, issue points", icon: "📁" },
                                            { feature: "Audit Logs", desc: "Full transaction history", icon: "🔍" },
                                            { feature: "User Management", desc: "Team access control (RBAC)", icon: "🔐" }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-3 bg-slate-50 rounded border border-slate-200">
                                                <span className="text-2xl">{item.icon}</span>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{item.feature}</p>
                                                    <p className="text-sm text-slate-600">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">9.2 SLA & Uptime Commitments</h3>
                                    <div className="grid md:grid-cols-3 gap-4">
                                        <Card className="bg-emerald-50 border-emerald-200">
                                            <CardContent className="p-4">
                                                <p className="text-2xl font-bold text-emerald-700">99.99%</p>
                                                <p className="text-sm text-emerald-700 mt-1">Platform Uptime</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-blue-50 border-blue-200">
                                            <CardContent className="p-4">
                                                <p className="text-2xl font-bold text-blue-700">&lt;100ms</p>
                                                <p className="text-sm text-blue-700 mt-1">API Response Time (p95)</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-purple-50 border-purple-200">
                                            <CardContent className="p-4">
                                                <p className="text-2xl font-bold text-purple-700">24/7</p>
                                                <p className="text-sm text-purple-700 mt-1">Enterprise Support</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">9.3 Monitoring & Alerts</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <p className="text-sm font-semibold mb-3">Key Metrics Monitored:</p>
                                        <ul className="text-sm text-slate-700 space-y-2">
                                            <li>✓ API response times (latency SLA)</li>
                                            <li>✓ Database performance (query times, connections)</li>
                                            <li>✓ Error rates by endpoint</li>
                                            <li>✓ Member activity patterns</li>
                                            <li>✓ Point accounting (earned vs redeemed balance)</li>
                                            <li>✓ Blockchain transaction confirmations</li>
                                            <li>✓ Webhook delivery success rates</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* 10. COMPLIANCE */}
                    <TabsContent value="compliance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>10. Compliance & Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-3">10.1 Security Standards</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { std: "ISO 27001", desc: "Information security management" },
                                            { std: "SOC 2 Type II", desc: "Security, availability, processing integrity" },
                                            { std: "GDPR", desc: "EU data protection compliance" },
                                            { std: "CCPA", desc: "California consumer privacy" },
                                            { std: "PCI DSS v3.2.1", desc: "Payment card data security" },
                                            { std: "HIPAA", desc: "Health information privacy (if applicable)" }
                                        ].map((cert, idx) => (
                                            <div key={idx} className="bg-slate-50 p-4 rounded border border-slate-200 border-l-4 border-l-blue-500">
                                                <p className="font-semibold text-slate-900">{cert.std}</p>
                                                <p className="text-sm text-slate-600 mt-1">{cert.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">10.2 Data Protection</h3>
                                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                                        <ul className="text-sm text-slate-700 space-y-2">
                                            <li>✓ <strong>Encryption in Transit:</strong> TLS 1.3 for all API calls</li>
                                            <li>✓ <strong>Encryption at Rest:</strong> AES-256 for stored data</li>
                                            <li>✓ <strong>Tokenization:</strong> Sensitive data (SSN, credit cards) tokenized</li>
                                            <li>✓ <strong>Hashing:</strong> Passwords hashed with bcrypt (12 rounds minimum)</li>
                                            <li>✓ <strong>Key Management:</strong> AWS KMS for encryption key rotation</li>
                                            <li>✓ <strong>Data Residency:</strong> Regional data storage options (US, EU, APAC)</li>
                                            <li>✓ <strong>Backup & Recovery:</strong> Daily encrypted backups, 30-day retention</li>
                                            <li>✓ <strong>Data Deletion:</strong> GDPR right-to-be-forgotten compliance</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">10.3 Access Control & RBAC</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <p className="text-sm font-semibold mb-3">Default Roles:</p>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-300">
                                                    <th className="text-left p-2">Role</th>
                                                    <th className="text-left p-2">Permissions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { role: "Super Admin", perm: "Full platform access, create programs" },
                                                    { role: "Program Owner", perm: "Manage own programs, analytics" },
                                                    { role: "Manager", perm: "View reports, manage members" },
                                                    { role: "Operator", perm: "Process redemptions, respond tickets" },
                                                    { role: "Viewer", perm: "Read-only access to dashboards" }
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200">
                                                        <td className="p-2 font-semibold">{row.role}</td>
                                                        <td className="p-2">{row.perm}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">10.4 Audit & Logging</h3>
                                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                                        <p className="text-sm text-slate-700">All actions logged with:</p>
                                        <ul className="text-sm text-slate-700 mt-2 space-y-1 ml-4">
                                            <li>• User ID and email</li>
                                            <li>• Action type (create, update, delete)</li>
                                            <li>• Resource affected</li>
                                            <li>• Timestamp (UTC)</li>
                                            <li>• IP address & user agent</li>
                                            <li>• Request/response hashes</li>
                                            <li>• Immutable log storage (Loki + Prometheus)</li>
                                        </ul>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-3">10.5 Incident Response</h3>
                                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                                        <p className="text-sm text-slate-700">
                                            <strong>Response Times:</strong><br/>
                                            P1 (Critical): &lt;1 hour | P2 (High): &lt;4 hours | P3 (Medium): &lt;24 hours | P4 (Low): &lt;5 days
                                        </p>
                                        <p className="text-sm text-slate-700 mt-3">
                                            <strong>Incident Communication:</strong> Status page updates, email notifications, dedicated Slack channel
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Appendix */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Appendix: Quick Reference Tables</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-3">Status Codes & Definitions</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-300 bg-slate-50">
                                            <th className="text-left p-2">Member Status</th>
                                            <th className="text-left p-2">Program Status</th>
                                            <th className="text-left p-2">Challenge Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-2">active | inactive | suspended | deleted</td>
                                            <td className="p-2">active | inactive | archived | terminated</td>
                                            <td className="p-2">draft | active | expired | completed</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3">Common Calculation Formulas</h3>
                            <div className="space-y-3 bg-slate-50 p-4 rounded">
                                <div>
                                    <p className="font-mono text-xs">Tier Threshold = (Tier Index) × 5000 points</p>
                                    <p className="text-xs text-slate-600 mt-1">E.g., Gold (tier 3) = 15,000 points</p>
                                </div>
                                <div className="border-t border-slate-300 pt-3">
                                    <p className="font-mono text-xs">Bonus Points = Base Points × (1 + Tier Multiplier)</p>
                                    <p className="text-xs text-slate-600 mt-1">E.g., 100 points at Gold tier (10%) = 110 points</p>
                                </div>
                                <div className="border-t border-slate-300 pt-3">
                                    <p className="font-mono text-xs">Program ROI = (Redemptions - Cost) / Acquisition Cost</p>
                                    <p className="text-xs text-slate-600 mt-1">Measure loyalty program profitability</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-900">
                        <strong>Need Help?</strong> Contact our support team at <code className="bg-blue-100 px-2 py-1 rounded">support@loyalty.fts.money</code> or visit the Developer Portal at <code className="bg-blue-100 px-2 py-1 rounded">dev.loyalty.fts.money</code>
                    </p>
                    <p className="text-xs text-blue-800 mt-3">Documentation Last Updated: January 13, 2026 | Version 2.0.0 | Status: Production | Format: FTS Standard Documentation</p>
                </div>
            </div>
        </div>
    );
}