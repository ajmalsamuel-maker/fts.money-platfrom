import React from 'react';
import { Shield, Lock, Globe, FileCheck, AlertCircle, CheckCircle2, Award, Landmark } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const complianceCategories = [
    {
        title: "Payment Standards",
        icon: Landmark,
        color: "blue",
        standards: [
            { name: "ISO 20022", description: "Universal financial messaging", logo: true },
            { name: "ISO 8583", description: "Card transaction messaging", logo: true },
            { name: "ISO 23257", description: "Blockchain & digital assets", logo: true },
            { name: "ISO 24165", description: "Digital token identifiers", logo: true },
            { name: "ISO 4217", description: "Currency codes", logo: true }
        ]
    },
    {
        title: "Security & Infrastructure",
        icon: Shield,
        color: "emerald",
        standards: [
            { name: "ISO 27001", description: "Information security", logo: true },
            { name: "PCI DSS Level 1", description: "Payment card security", logo: true },
            { name: "SOC 2 Type II", description: "Service organization controls", logo: false },
            { name: "ISO 9001", description: "Quality management", logo: true }
        ]
    },
    {
        title: "Identity & Verification",
        icon: FileCheck,
        color: "purple",
        standards: [
            { name: "LEI/vLEI", description: "GLEIF legal entity identifiers", logo: false },
            { name: "eIDAS", description: "EU electronic identification", logo: false },
            { name: "KYC/KYB", description: "Identity verification", logo: false }
        ]
    },
    {
        title: "Privacy & Data Protection",
        icon: Lock,
        color: "indigo",
        standards: [
            { name: "GDPR", description: "EU data protection regulation", logo: false },
            { name: "CCPA", description: "California privacy act", logo: false },
            { name: "ISO 27701", description: "Privacy information management", logo: true }
        ]
    },
    {
        title: "Financial Crime Prevention",
        icon: AlertCircle,
        color: "red",
        standards: [
            { name: "FATF", description: "Financial action task force", logo: false },
            { name: "AML/CTF", description: "Anti-money laundering", logo: false },
            { name: "6AMLD", description: "6th AML directive", logo: false }
        ]
    },
    {
        title: "Banking & Open Finance",
        icon: Globe,
        color: "cyan",
        standards: [
            { name: "PSD2", description: "Payment services directive", logo: false },
            { name: "ISO 13616", description: "IBAN standard", logo: true },
            { name: "ISO 9362", description: "BIC/SWIFT codes", logo: true },
            { name: "Open Banking", description: "UK open banking standard", logo: false }
        ]
    }
];

const colorSchemes = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    red: "bg-red-50 border-red-200 text-red-700",
    cyan: "bg-cyan-50 border-cyan-200 text-cyan-700"
};

export default function ComplianceFooter() {
    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6 mt-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Award className="h-8 w-8 text-blue-400" />
                        <h2 className="text-3xl font-bold">Enterprise-Grade Compliance</h2>
                    </div>
                    <p className="text-slate-300 text-lg max-w-3xl mx-auto">
                        FTS.Money adheres to the world's most rigorous financial, security, and regulatory standards, 
                        ensuring your payments infrastructure is built on a foundation of trust and compliance.
                    </p>
                </div>

                {/* Compliance Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {complianceCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.title} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-lg ${colorSchemes[category.color]} flex items-center justify-center`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold">{category.title}</h3>
                                </div>
                                <div className="space-y-2">
                                    {category.standards.map((standard) => (
                                        <div key={standard.name} className="flex items-start gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-medium text-white">{standard.name}</span>
                                                <span className="text-slate-400 ml-1">· {standard.description}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ISO Standards Showcase */}
                <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-indigo-900/30 rounded-xl p-8 border border-slate-700 mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-center">ISO Standards Excellence</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {['ISO 20022', 'ISO 8583', 'ISO 23257', 'ISO 24165', 'ISO 27001', 'ISO 27701', 'ISO 13616', 'ISO 9362', 'ISO 4217', 'ISO 9001'].map((iso) => (
                            <Badge key={iso} className="bg-slate-800 text-white border-slate-600 px-4 py-2 text-sm font-mono">
                                {iso}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                        <p className="text-3xl font-bold text-blue-400">25+</p>
                        <p className="text-slate-400 text-sm mt-1">Compliance Standards</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-emerald-400">10+</p>
                        <p className="text-slate-400 text-sm mt-1">ISO Certifications</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-purple-400">100%</p>
                        <p className="text-slate-400 text-sm mt-1">GLEIF LEI Verified</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-cyan-400">Global</p>
                        <p className="text-slate-400 text-sm mt-1">Regulatory Coverage</p>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-400 text-sm">
                    <p>© {new Date().getFullYear()} FTS.Money Ltd. All rights reserved. Licensed and regulated worldwide.</p>
                    <p className="mt-2">Building the future of compliant payment infrastructure.</p>
                </div>
            </div>
        </footer>
    );
}