/**
 * Language Inheritance Hierarchy Diagram
 * Visual representation of how languages cascade through the platform
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Building2, Code, Workflow, Wallet, Briefcase, Store, CreditCard, Users } from 'lucide-react';

export default function LanguageInheritanceDiagram() {
    const hierarchy = [
        {
            level: 1,
            name: "FTS.Money Platform",
            icon: Building2,
            color: "bg-purple-600",
            description: "Master language registry • ISO 639-1/639-2 compliant",
            languages: "25+ languages available",
            children: [
                {
                    level: 2,
                    name: "PSP Instances",
                    icon: Building2,
                    color: "bg-blue-600",
                    description: "Payment Service Providers",
                    inherits: "Selects from platform languages",
                    children: [
                        { level: 3, name: "Merchants", icon: Store, color: "bg-emerald-600" },
                        { level: 3, name: "Virtual Terminals", icon: CreditCard, color: "bg-emerald-600" },
                        { level: 3, name: "PSP Staff", icon: Users, color: "bg-emerald-600" }
                    ]
                },
                {
                    level: 2,
                    name: "ISO Gateway",
                    icon: Code,
                    color: "bg-indigo-600",
                    description: "ISO 8583/20022 Translation",
                    inherits: "Selects from platform languages",
                    children: [
                        { level: 3, name: "Gateway Customers", icon: Building2, color: "bg-cyan-600" },
                        { level: 3, name: "Customer Users", icon: Users, color: "bg-cyan-600" }
                    ]
                },
                {
                    level: 2,
                    name: "Orchestration",
                    icon: Workflow,
                    color: "bg-violet-600",
                    description: "Payment Routing & Orchestration",
                    inherits: "Selects from platform languages",
                    children: [
                        { level: 3, name: "Orchestration Customers", icon: Building2, color: "bg-fuchsia-600" },
                        { level: 3, name: "Customer Users", icon: Users, color: "bg-fuchsia-600" }
                    ]
                },
                {
                    level: 2,
                    name: "Crypto Banking",
                    icon: Wallet,
                    color: "bg-amber-600",
                    description: "Crypto Gateway (Striga)",
                    inherits: "Selects from platform languages",
                    children: [
                        { level: 3, name: "Crypto Customers", icon: Building2, color: "bg-orange-600" },
                        { level: 3, name: "Customer Users", icon: Users, color: "bg-orange-600" }
                    ]
                },
                {
                    level: 2,
                    name: "RWA Platform",
                    icon: Briefcase,
                    color: "bg-rose-600",
                    description: "Real World Asset Tokenization",
                    inherits: "Selects from platform languages",
                    children: [
                        { level: 3, name: "RWA Providers", icon: Building2, color: "bg-pink-600" },
                        { level: 3, name: "Asset Issuers", icon: Store, color: "bg-pink-600" },
                        { level: 3, name: "Investors", icon: Users, color: "bg-pink-600" }
                    ]
                }
            ]
        }
    ];

    const renderNode = (node, index, isLast = false) => {
        const Icon = node.icon;
        return (
            <div key={index} className="relative">
                <div className={`flex items-center gap-4 p-4 rounded-lg border-2 ${node.level === 1 ? 'border-purple-300 bg-purple-50' : node.level === 2 ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
                    <div className={`${node.color} text-white p-3 rounded-lg`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{node.name}</h3>
                        {node.description && (
                            <p className="text-xs text-slate-600 mt-1">{node.description}</p>
                        )}
                        {node.languages && (
                            <Badge variant="outline" className="mt-2 text-[10px]">{node.languages}</Badge>
                        )}
                        {node.inherits && (
                            <Badge className="mt-2 text-[10px] bg-blue-100 text-blue-800 border-blue-300">
                                🔗 {node.inherits}
                            </Badge>
                        )}
                    </div>
                </div>

                {node.children && node.children.length > 0 && (
                    <div className="ml-8 mt-4 space-y-4 border-l-2 border-slate-300 pl-8">
                        {node.children.map((child, idx) => (
                            <div key={idx}>
                                <div className="absolute left-0 w-8 border-t-2 border-slate-300" style={{ marginTop: '20px' }}></div>
                                {renderNode(child, idx, idx === node.children.length - 1)}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Language Inheritance Architecture</CardTitle>
                <CardDescription>
                    How languages cascade from platform → services → sub-tenants
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Diagram */}
                    <div className="space-y-6">
                        {hierarchy.map((node, index) => renderNode(node, index))}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <h4 className="font-semibold text-sm mb-3">Inheritance Rules</h4>
                        <div className="space-y-2 text-xs text-slate-700">
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-purple-600">1.</span>
                                <p><strong>Platform Level:</strong> Maintains the master registry of all supported languages (ISO 639-1/639-2)</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-600">2.</span>
                                <p><strong>Service Level:</strong> Each service (PSP, ISO, Orchestration, etc.) enables a subset of platform languages</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-emerald-600">3.</span>
                                <p><strong>Sub-tenant Level:</strong> Merchants, customers, and end-users automatically inherit their parent service's enabled languages</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-slate-600">4.</span>
                                <p><strong>Cascading Updates:</strong> When a service updates its language configuration, all child entities reflect the changes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}