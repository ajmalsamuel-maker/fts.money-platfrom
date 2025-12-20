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
        <footer className="bg-white border-t border-slate-200 py-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Enterprise-Grade Compliance</h3>
                    </div>
                    <p className="text-slate-600 text-xs max-w-3xl mx-auto">
                        FTS.Money adheres to the world's most rigorous financial, security, and regulatory standards.
                    </p>
                </div>

                {/* Compliance Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    {complianceCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <div key={category.title} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-3 w-3 text-slate-500" />
                                    <h4 className="text-xs font-semibold text-slate-900">{category.title}</h4>
                                </div>
                                <div className="space-y-1">
                                    {category.standards.slice(0, 3).map((standard) => (
                                        <div key={standard.name} className="text-[10px] text-slate-600">
                                            {standard.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ISO Standards Showcase */}
                <div className="bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
                    <div className="flex flex-wrap justify-center gap-2">
                        {['ISO 20022', 'ISO 8583', 'ISO 23257', 'ISO 24165', 'ISO 27001', 'ISO 27701', 'ISO 13616', 'ISO 9362', 'ISO 4217', 'ISO 9001'].map((iso) => (
                            <Badge key={iso} className="bg-white text-blue-700 border-blue-300 px-2 py-0.5 text-[10px] font-mono">
                                {iso}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Bottom Stats */}
                <div className="flex justify-center gap-6 text-center mb-4">
                    <div>
                        <p className="text-lg font-bold text-blue-600">25+</p>
                        <p className="text-slate-600 text-[10px]">Standards</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-blue-600">10+</p>
                        <p className="text-slate-600 text-[10px]">ISO Certs</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-blue-600">100%</p>
                        <p className="text-slate-600 text-[10px]">LEI Verified</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-blue-600">Global</p>
                        <p className="text-slate-600 text-[10px]">Coverage</p>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="pt-4 border-t border-slate-200 text-center text-slate-500 text-[10px]">
                    <p>© {new Date().getFullYear()} FTS.Money Ltd. Licensed and regulated worldwide. Building compliant payment infrastructure.</p>
                </div>
            </div>
        </footer>
    );
}