import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    BarChart3,
    Settings,
    DollarSign,
    Users,
    Building,
    AlertCircle,
    Clock,
    ChevronDown,
    ChevronRight,
    Wallet,
    HelpCircle,
    Book,
    Bitcoin
} from 'lucide-react';

const menuSections = [
    {
        title: 'Overview',
        items: [
            { label: 'Dashboard', icon: LayoutDashboard, path: 'MerchantDashboard' },
            { label: 'Analytics', icon: BarChart3, path: 'MerchantMonitorTools' },
        ]
    },
    {
        title: 'Payments',
        items: [
            { label: 'Virtual Terminals', icon: CreditCard, path: 'MerchantVirtualTerminals' },
            { label: 'Crypto Management', icon: Bitcoin, path: 'MerchantCryptoDashboard' },
        ]
    },
    {
        title: 'Transactions',
        items: [
            { label: 'All Transactions', icon: FileText, path: 'MerchantTransactionList' },
            { label: 'Transaction Data', icon: CreditCard, path: 'MerchantDataTransactions' },
            { label: 'Disputes', icon: AlertCircle, path: 'MerchantDisputeManagement' },
        ]
    },
    {
        title: 'Finance',
        items: [
            { label: 'Settlements', icon: DollarSign, path: 'MerchantSettlementReports' },
            { label: 'Chargebacks', icon: AlertCircle, path: 'MerchantChargebackReport' },
            { label: 'Statements', icon: FileText, path: 'MerchantStatementReport' },
            { label: 'Batch Reports', icon: BarChart3, path: 'MerchantBatchReports' },
        ]
    },
    {
        title: 'Settings',
        items: [
            { label: 'Merchant Info', icon: Building, path: 'MerchantInfo' },
            { label: 'Bank Details', icon: Wallet, path: 'MerchantBankInfo' },
            { label: 'Users & Operators', icon: Users, path: 'MerchantOperators' },
            { label: 'Email Templates', icon: FileText, path: 'MerchantEmailTemplates' },
            { label: 'Appearance', icon: Settings, path: 'MerchantAppearance' },
            { label: 'Change Password', icon: Settings, path: 'MerchantChangePassword' },
        ]
    },
    {
        title: 'Resources',
        items: [
            { label: 'Help Center', icon: HelpCircle, path: 'MerchantHelpCenter' },
            { label: 'API Documentation', icon: Book, path: 'MerchantAPIDoc' },
        ]
    }
];

export default function MerchantSidebar({ selectedMID, mids, onMIDChange, currentPage, user, merchant }) {
    // Find which section contains the current page
    const currentSection = menuSections.find(section => 
        section.items.some(item => item.path === currentPage)
    );
    
    const [expandedSections, setExpandedSections] = useState([currentSection?.title || 'Merchant Profile']);

    const toggleSection = (title) => {
        setExpandedSections(prev => 
            prev.includes(title) 
                ? prev.filter(s => s !== title)
                : [...prev, title]
        );
    };

    return (
        <aside className="w-64 bg-slate-800 text-white flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-sm">Merchant Portal</h1>
                    </div>
                </div>
                
                {/* Merchant Code Display */}
                {(merchant?.merchant_code || user?.merchant_code) && (
                    <div className="mb-3 p-2 bg-slate-700 rounded border border-slate-600">
                        <label className="text-[10px] text-slate-400 block mb-1">MERCHANT CODE</label>
                        <div className="font-mono font-bold text-sm text-blue-400">
                            {merchant?.merchant_code || user?.merchant_code}
                        </div>
                    </div>
                )}

                {/* MID Selection */}
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">MID:</label>
                    <select
                        value={selectedMID}
                        onChange={(e) => onMIDChange(e.target.value)}
                        className="w-full bg-slate-700 text-white text-sm px-2 py-1.5 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                    >
                        {mids.map((mid) => (
                            <option key={mid.id} value={mid.mid}>
                                {mid.mid}
                            </option>
                        ))}
                    </select>
                    {selectedMID && mids.find(m => m.mid === selectedMID) && (
                        <div className="mt-1">
                            <Badge variant="outline" className="text-[10px] border-slate-600 text-slate-300">
                                {mids.find(m => m.mid === selectedMID)?.account_type}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <ScrollArea className="flex-1">
                <nav className="py-2">
                    {menuSections.map((section) => {
                        const isExpanded = expandedSections.includes(section.title);
                        return (
                            <div key={section.title} className="mb-1">
                                <button
                                    onClick={() => toggleSection(section.title)}
                                    className="w-full px-4 py-2 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                                >
                                    <span>{section.title}</span>
                                    {isExpanded ? (
                                        <ChevronDown className="h-3 w-3" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3" />
                                    )}
                                </button>
                                {isExpanded && (
                                    <div className="py-1">
                                        {section.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = currentPage === item.path;
                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={createPageUrl(item.path)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 pl-8 py-2 text-sm transition-colors",
                                                        isActive
                                                            ? "bg-blue-600 text-white"
                                                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                                    )}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    <span>{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </ScrollArea>

            {/* Footer Info */}
            <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Currency: USD</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span>Timezone: Asia/Hong_Kong</span>
                </div>
            </div>
        </aside>
    );
}