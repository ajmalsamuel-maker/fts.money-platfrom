import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Building2, TrendingUp, Zap } from 'lucide-react';

export const PORTAL_TEMPLATES = {
    full_merchant_portal: {
        id: 'full_merchant_portal',
        name: 'Complete Merchant Portal',
        description: 'Full-featured merchant portal with all pages (NetXHub template)',
        icon: Building2,
        config: {
            portal_name: 'Merchant Portal',
            theme: {
                primary_color: '#3b82f6',
                secondary_color: '#06b6d4',
                accent_color: '#8b5cf6',
                font_family: 'Inter',
                background_pattern: 'dots'
            },
            layout: {
                sidebar_position: 'left',
                sidebar_style: 'full',
                header_style: 'full'
            },
            enabled_features: [
                'transactions',
                'analytics',
                'payouts',
                'customers',
                'invoices',
                'refunds',
                'webhooks',
                'api_keys',
                'payment_links',
                'subscriptions',
                'saved_cards'
            ],
            dashboard_widgets: [
                {
                    widget_id: 'w1',
                    widget_type: 'merchant_dashboard_overview',
                    position: { row: 0, col: 0, width: 12, height: 6 },
                    config: { title: 'Dashboard', showBalance: true, showTransactions: true }
                }
            ],
            navigation_menu: [
                { label: 'Dashboard', path: '/dashboard', icon: 'Activity', enabled: true },
                { label: 'Transactions', path: '/transactions', icon: 'FileText', enabled: true },
                { label: 'Analytics', path: '/analytics', icon: 'BarChart3', enabled: true },
                { label: 'Customers', path: '/customers', icon: 'Users', enabled: true },
                { label: 'Payouts', path: '/payouts', icon: 'DollarSign', enabled: true },
                { label: 'Invoices', path: '/invoices', icon: 'FileText', enabled: true },
                { label: 'Payment Links', path: '/payment-links', icon: 'FileText', enabled: true },
                { label: 'Subscriptions', path: '/subscriptions', icon: 'RefreshCw', enabled: true },
                { label: 'Settings', path: '/settings', icon: 'Settings', enabled: true }
            ]
        }
    },
    minimal_portal: {
        id: 'minimal_portal',
        name: 'Minimal Portal',
        description: 'Basic portal with essential features only',
        icon: Zap,
        config: {
            portal_name: 'Simple Portal',
            theme: {
                primary_color: '#6366f1',
                secondary_color: '#8b5cf6',
                accent_color: '#ec4899',
                font_family: 'Inter',
                background_pattern: 'none'
            },
            layout: {
                sidebar_position: 'left',
                sidebar_style: 'compact',
                header_style: 'minimal'
            },
            enabled_features: ['transactions', 'analytics', 'payouts'],
            dashboard_widgets: [
                {
                    widget_id: 'w1',
                    widget_type: 'balance_overview',
                    position: { row: 0, col: 0, width: 6, height: 4 },
                    config: { title: 'Balance', showPending: true }
                },
                {
                    widget_id: 'w2',
                    widget_type: 'recent_transactions',
                    position: { row: 0, col: 6, width: 6, height: 4 },
                    config: { title: 'Recent Activity', limit: 5 }
                }
            ],
            navigation_menu: [
                { label: 'Dashboard', path: '/dashboard', icon: 'Activity', enabled: true },
                { label: 'Transactions', path: '/transactions', icon: 'FileText', enabled: true },
                { label: 'Payouts', path: '/payouts', icon: 'DollarSign', enabled: true }
            ]
        }
    },
    analytics_focused: {
        id: 'analytics_focused',
        name: 'Analytics-First Portal',
        description: 'Portal optimized for data and insights',
        icon: TrendingUp,
        config: {
            portal_name: 'Analytics Portal',
            theme: {
                primary_color: '#0ea5e9',
                secondary_color: '#06b6d4',
                accent_color: '#14b8a6',
                font_family: 'Inter',
                background_pattern: 'grid'
            },
            layout: {
                sidebar_position: 'left',
                sidebar_style: 'full',
                header_style: 'full'
            },
            enabled_features: ['transactions', 'analytics', 'customers'],
            dashboard_widgets: [
                {
                    widget_id: 'w1',
                    widget_type: 'merchant_analytics',
                    position: { row: 0, col: 0, width: 12, height: 6 },
                    config: { title: 'Performance Analytics', defaultPeriod: '30d' }
                }
            ],
            navigation_menu: [
                { label: 'Analytics', path: '/analytics', icon: 'BarChart3', enabled: true },
                { label: 'Transactions', path: '/transactions', icon: 'FileText', enabled: true },
                { label: 'Customers', path: '/customers', icon: 'Users', enabled: true }
            ]
        }
    }
};

export default function PortalTemplates({ onSelectTemplate }) {
    return (
        <div className="grid gap-4">
            {Object.values(PORTAL_TEMPLATES).map(template => {
                const Icon = template.icon;
                return (
                    <Card key={template.id} className="hover:border-blue-500 transition-all cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">{template.name}</CardTitle>
                                    <CardDescription className="text-xs">{template.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-600">
                                    {template.config.enabled_features.length} features • {template.config.navigation_menu?.length || 0} pages
                                </div>
                                <Button 
                                    size="sm"
                                    onClick={() => onSelectTemplate(template)}
                                >
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    Use Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}