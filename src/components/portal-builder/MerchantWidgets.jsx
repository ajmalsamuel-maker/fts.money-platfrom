import React from 'react';
import { 
    Activity,
    TrendingUp, 
    Users, 
    CreditCard,
    FileText,
    DollarSign,
    RefreshCw,
    Zap,
    Bell,
    Key,
    BarChart3
} from 'lucide-react';

// Reusable merchant portal widgets
export const MERCHANT_WIDGETS = {
    merchant_dashboard_overview: {
        id: 'merchant_dashboard_overview',
        name: 'Merchant Dashboard',
        description: 'Complete merchant dashboard with all metrics',
        icon: Activity,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Dashboard',
            showBalance: true,
            showTransactions: true,
            showCharts: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 bg-blue-50 rounded text-center">
                        <p className="text-xs text-slate-600">Balance</p>
                        <p className="text-sm font-bold text-blue-600">$5,234</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded text-center">
                        <p className="text-xs text-slate-600">Volume</p>
                        <p className="text-sm font-bold text-emerald-600">$12.5K</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded text-center">
                        <p className="text-xs text-slate-600">Transactions</p>
                        <p className="text-sm font-bold text-purple-600">248</p>
                    </div>
                </div>
                <div className="h-24 bg-slate-100 rounded flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 text-slate-400" />
                </div>
            </div>
        )
    },
    merchant_transactions: {
        id: 'merchant_transactions',
        name: 'Transaction List',
        description: 'Merchant transaction history',
        icon: FileText,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Transactions',
            pageSize: 20,
            showFilters: true,
            showExport: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded text-xs">
                            <div>
                                <p className="font-medium">TXN-{1000 + i}</p>
                                <p className="text-slate-600">Customer #{i}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">${(100 * i).toFixed(2)}</p>
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">
                                    Success
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    merchant_analytics: {
        id: 'merchant_analytics',
        name: 'Analytics Dashboard',
        description: 'Merchant analytics and insights',
        icon: BarChart3,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Analytics',
            defaultPeriod: '30d',
            showComparison: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-blue-400" />
                </div>
            </div>
        )
    },
    merchant_payouts: {
        id: 'merchant_payouts',
        name: 'Payouts',
        description: 'Payout history and scheduling',
        icon: DollarSign,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Payouts',
            showScheduled: true,
            showHistory: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                        <p className="text-xs text-slate-600">Next Payout</p>
                        <p className="text-sm font-bold text-emerald-700">$1,234.50</p>
                        <p className="text-xs text-slate-500">in 2 days</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs text-slate-600">Last Payout</p>
                        <p className="text-sm font-medium">$987.30</p>
                    </div>
                </div>
            </div>
        )
    },
    merchant_customers: {
        id: 'merchant_customers',
        name: 'Customer Management',
        description: 'Customer list and details',
        icon: Users,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Customers',
            showSavedCards: true,
            showSubscriptions: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                C{i}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-medium">Customer {i}</p>
                                <p className="text-[10px] text-slate-600">{i} transactions</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    merchant_invoices: {
        id: 'merchant_invoices',
        name: 'Invoicing',
        description: 'Invoice creation and management',
        icon: FileText,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Invoices',
            allowCreate: true,
            showDraft: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <button className="w-full p-2 bg-blue-500 text-white rounded text-xs font-medium">
                        Create Invoice
                    </button>
                    <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs font-medium">INV-001</p>
                        <p className="text-[10px] text-slate-600">$500.00 • Pending</p>
                    </div>
                </div>
            </div>
        )
    },
    merchant_refunds: {
        id: 'merchant_refunds',
        name: 'Refunds',
        description: 'Refund processing',
        icon: RefreshCw,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Refunds',
            allowCreate: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded">
                        <p className="text-xs font-medium">REF-001</p>
                        <p className="text-[10px] text-slate-600">$50.00 • Processing</p>
                    </div>
                </div>
            </div>
        )
    },
    merchant_saved_cards: {
        id: 'merchant_saved_cards',
        name: 'Saved Payment Methods',
        description: 'Customer saved cards',
        icon: CreditCard,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Payment Methods',
            showExpired: false
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="p-2 bg-slate-50 rounded flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-600" />
                        <div className="flex-1">
                            <p className="text-xs font-medium">Visa •••• 4242</p>
                            <p className="text-[10px] text-slate-600">Expires 12/25</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    merchant_webhooks: {
        id: 'merchant_webhooks',
        name: 'Webhooks',
        description: 'Webhook configuration',
        icon: Zap,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Webhooks',
            showLogs: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                        <p className="text-xs font-medium">payment.success</p>
                        <p className="text-[10px] text-slate-600">https://api.example.com/webhook</p>
                        <span className="text-[10px] text-emerald-600">Active</span>
                    </div>
                </div>
            </div>
        )
    },
    merchant_api_keys: {
        id: 'merchant_api_keys',
        name: 'API Keys',
        description: 'API credential management',
        icon: Key,
        category: 'Full Pages',
        defaultConfig: {
            title: 'API Keys',
            allowCreate: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs font-medium">Production Key</p>
                        <p className="text-[10px] text-slate-600 font-mono">pk_live_••••••••</p>
                    </div>
                </div>
            </div>
        )
    },
    merchant_payment_links: {
        id: 'merchant_payment_links',
        name: 'Payment Links',
        description: 'Create shareable payment links',
        icon: FileText,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Payment Links',
            allowCreate: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <button className="w-full p-2 bg-blue-500 text-white rounded text-xs font-medium">
                        Create Payment Link
                    </button>
                    <div className="p-2 bg-slate-50 rounded">
                        <p className="text-xs font-medium">Product Purchase</p>
                        <p className="text-[10px] text-slate-600">$99.00 • 12 clicks</p>
                    </div>
                </div>
            </div>
        )
    },
    merchant_subscriptions: {
        id: 'merchant_subscriptions',
        name: 'Subscriptions',
        description: 'Recurring billing management',
        icon: RefreshCw,
        category: 'Full Pages',
        defaultConfig: {
            title: 'Subscriptions',
            showActive: true,
            showCancelled: false
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
                        <p className="text-xs font-medium">Monthly Plan</p>
                        <p className="text-[10px] text-slate-600">$29.99/mo • 5 active</p>
                    </div>
                </div>
            </div>
        )
    }
};