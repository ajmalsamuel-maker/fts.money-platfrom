import React from 'react';
import { 
    DollarSign, 
    TrendingUp, 
    Users, 
    CreditCard,
    BarChart3,
    Activity,
    Calendar,
    FileText,
    AlertTriangle,
    CheckCircle,
    Layers
} from 'lucide-react';
import { MERCHANT_WIDGETS } from './MerchantWidgets';

export const AVAILABLE_WIDGETS = {
    ...MERCHANT_WIDGETS,
    stats_card: {
        id: 'stats_card',
        name: 'Stats Card',
        description: 'Display key metrics',
        icon: TrendingUp,
        category: 'Stats & Metrics',
        defaultConfig: {
            title: 'Total Revenue',
            metric: 'revenue',
            format: 'currency'
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm text-slate-600">{config.title}</p>
                <p className="text-2xl font-bold">$12,345</p>
            </div>
        )
    },
    transaction_chart: {
        id: 'transaction_chart',
        name: 'Transaction Chart',
        description: 'Line chart of transactions',
        icon: BarChart3,
        category: 'Charts',
        defaultConfig: {
            title: 'Transaction Volume',
            period: '7d',
            chartType: 'line'
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg h-64">
                <p className="text-sm font-medium mb-4">{config.title}</p>
                <div className="h-48 bg-slate-100 rounded flex items-center justify-center">
                    <BarChart3 className="h-12 w-12 text-slate-400" />
                </div>
            </div>
        )
    },
    recent_transactions: {
        id: 'recent_transactions',
        name: 'Recent Transactions',
        description: 'List of recent transactions',
        icon: FileText,
        category: 'Lists',
        defaultConfig: {
            title: 'Recent Transactions',
            limit: 10
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="flex justify-between p-2 bg-slate-50 rounded">
                            <span className="text-sm">Transaction #{i}</span>
                            <span className="text-sm font-medium">$100.00</span>
                        </div>
                    ))}
                </div>
            </div>
        )
    },
    balance_overview: {
        id: 'balance_overview',
        name: 'Balance Overview',
        description: 'Current balance and pending',
        icon: DollarSign,
        category: 'Stats & Metrics',
        defaultConfig: {
            title: 'Balance Overview',
            showPending: true
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Available</span>
                        <span className="text-sm font-bold text-emerald-600">$5,432.10</span>
                    </div>
                    {config.showPending && (
                        <div className="flex justify-between">
                            <span className="text-sm text-slate-600">Pending</span>
                            <span className="text-sm font-medium text-amber-600">$1,234.50</span>
                        </div>
                    )}
                </div>
            </div>
        )
    },
    alert_list: {
        id: 'alert_list',
        name: 'Alerts & Notifications',
        description: 'Important alerts',
        icon: AlertTriangle,
        category: 'Lists',
        defaultConfig: {
            title: 'Alerts',
            types: ['warning', 'info']
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="flex gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span className="text-sm">Payment gateway maintenance</span>
                    </div>
                </div>
            </div>
        )
    },
    quick_actions: {
        id: 'quick_actions',
        name: 'Quick Actions',
        description: 'Action buttons',
        icon: Activity,
        category: 'Stats & Metrics',
        defaultConfig: {
            title: 'Quick Actions',
            actions: ['new_payment', 'refund', 'invoice']
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 border rounded-lg hover:bg-slate-50 text-sm">
                        New Payment
                    </button>
                    <button className="p-3 border rounded-lg hover:bg-slate-50 text-sm">
                        Create Invoice
                    </button>
                </div>
            </div>
        )
    },
    customer_insights: {
        id: 'customer_insights',
        name: 'Customer Insights',
        description: 'Customer statistics',
        icon: Users,
        category: 'Stats & Metrics',
        defaultConfig: {
            title: 'Customer Insights',
            metric: 'total'
        },
        preview: ({ config }) => (
            <div className="p-4 bg-white border rounded-lg">
                <p className="text-sm font-medium mb-3">{config.title}</p>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Total Customers</span>
                        <span className="text-sm font-bold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm text-slate-600">New This Month</span>
                        <span className="text-sm font-medium text-emerald-600">+56</span>
                    </div>
                </div>
            </div>
        )
    }
};

export default function WidgetLibrary({ onSelectWidget }) {
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    
    const categories = ['all', 'Full Pages', 'Stats & Metrics', 'Charts', 'Lists'];
    
    const filteredWidgets = selectedCategory === 'all' 
        ? Object.values(AVAILABLE_WIDGETS)
        : Object.values(AVAILABLE_WIDGETS).filter(w => w.category === selectedCategory);
    
    return (
        <div>
            <div className="flex gap-2 mb-4 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            selectedCategory === cat 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredWidgets.map(widget => {
                    const Icon = widget.icon;
                    return (
                        <button
                            key={widget.id}
                            onClick={() => onSelectWidget(widget)}
                            className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Icon className="h-5 w-5 text-slate-600" />
                                <span className="font-medium text-sm">{widget.name}</span>
                            </div>
                            <p className="text-xs text-slate-600">{widget.description}</p>
                            {widget.category && (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
                                    {widget.category}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}