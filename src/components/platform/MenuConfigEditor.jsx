import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
    Plus, 
    Trash2, 
    GripVertical, 
    ChevronDown, 
    ChevronRight,
    LayoutDashboard,
    ArrowLeftRight,
    Users,
    Store,
    CreditCard,
    Wallet,
    FileText,
    Settings,
    Shield,
    BarChart3,
    Terminal,
    Globe,
    Key,
    Zap
} from 'lucide-react';
import { cn } from "@/lib/utils";

const AVAILABLE_ICONS = {
    LayoutDashboard, ArrowLeftRight, Users, Store, CreditCard,
    Wallet, FileText, Settings, Shield, BarChart3, Terminal,
    Globe, Key, Zap
};

const DEFAULT_MENU_ITEMS = [
    {
        id: 'overview',
        label: 'Overview',
        icon: 'LayoutDashboard',
        enabled: true,
        items: [
            { id: 'dashboard', label: 'Dashboard', path: 'Dashboard', enabled: true },
            { id: 'analytics', label: 'Analytics', path: 'Analytics', enabled: true }
        ]
    },
    {
        id: 'transactions',
        label: 'Transactions',
        icon: 'ArrowLeftRight',
        enabled: true,
        items: [
            { id: 'all-transactions', label: 'All Transactions', path: 'Transactions', enabled: true },
            { id: 'settlements', label: 'Settlements', path: 'Settlements', enabled: true },
            { id: 'refunds', label: 'Refunds', path: 'Refunds', enabled: true }
        ]
    },
    {
        id: 'merchants',
        label: 'Merchants',
        icon: 'Store',
        enabled: true,
        items: [
            { id: 'all-merchants', label: 'All Merchants', path: 'Merchants', enabled: true },
            { id: 'onboarding', label: 'Onboarding', path: 'MerchantOnboarding', enabled: true },
            { id: 'merchant-users', label: 'Merchant Users', path: 'MerchantUsers', enabled: true }
        ]
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: 'Wallet',
        enabled: true,
        items: [
            { id: 'balances', label: 'Balances', path: 'Balances', enabled: true },
            { id: 'payouts', label: 'Payouts', path: 'Payouts', enabled: true },
            { id: 'reports', label: 'Reports', path: 'Reports', enabled: true }
        ]
    },
    {
        id: 'system',
        label: 'System',
        icon: 'Settings',
        enabled: true,
        items: [
            { id: 'user-management', label: 'User Management', path: 'UserManagement', enabled: true },
            { id: 'settings', label: 'Settings', path: 'Settings', enabled: true }
        ]
    }
];

export default function MenuConfigEditor({ menuConfig, enabledModules, onChange }) {
    const [menus, setMenus] = useState(menuConfig?.length > 0 ? menuConfig : DEFAULT_MENU_ITEMS);
    const [expandedGroups, setExpandedGroups] = useState({});

    const handleUpdate = (updatedMenus) => {
        setMenus(updatedMenus);
        onChange(updatedMenus);
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const toggleGroupEnabled = (groupIndex) => {
        const updated = [...menus];
        updated[groupIndex].enabled = !updated[groupIndex].enabled;
        handleUpdate(updated);
    };

    const toggleItemEnabled = (groupIndex, itemIndex) => {
        const updated = [...menus];
        updated[groupIndex].items[itemIndex].enabled = !updated[groupIndex].items[itemIndex].enabled;
        handleUpdate(updated);
    };

    const addMenuItem = (groupIndex) => {
        const updated = [...menus];
        updated[groupIndex].items.push({
            id: `custom-${Date.now()}`,
            label: 'New Menu Item',
            path: 'CustomPage',
            enabled: true
        });
        handleUpdate(updated);
    };

    const removeMenuItem = (groupIndex, itemIndex) => {
        const updated = [...menus];
        updated[groupIndex].items.splice(itemIndex, 1);
        handleUpdate(updated);
    };

    const updateMenuItem = (groupIndex, itemIndex, field, value) => {
        const updated = [...menus];
        updated[groupIndex].items[itemIndex][field] = value;
        handleUpdate(updated);
    };

    const addMenuGroup = () => {
        const updated = [...menus, {
            id: `group-${Date.now()}`,
            label: 'New Group',
            icon: 'Settings',
            enabled: true,
            items: []
        }];
        handleUpdate(updated);
    };

    const removeMenuGroup = (groupIndex) => {
        const updated = menus.filter((_, i) => i !== groupIndex);
        handleUpdate(updated);
    };

    const updateGroupLabel = (groupIndex, value) => {
        const updated = [...menus];
        updated[groupIndex].label = value;
        handleUpdate(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Menu Configuration</h3>
                    <p className="text-sm text-slate-500">Configure sidebar menu groups and items</p>
                </div>
                <Button onClick={addMenuGroup} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Group
                </Button>
            </div>

            <div className="space-y-3">
                {menus.map((group, groupIndex) => {
                    const Icon = AVAILABLE_ICONS[group.icon] || Settings;
                    const isExpanded = expandedGroups[group.id];

                    return (
                        <Card key={group.id} className={cn(
                            "transition-all",
                            !group.enabled && "opacity-50"
                        )}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                                    <Icon className="h-5 w-5 text-slate-600" />
                                    <Input
                                        value={group.label}
                                        onChange={(e) => updateGroupLabel(groupIndex, e.target.value)}
                                        className="flex-1 h-8 text-sm font-medium"
                                    />
                                    <Switch
                                        checked={group.enabled}
                                        onCheckedChange={() => toggleGroupEnabled(groupIndex)}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleGroup(group.id)}
                                    >
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeMenuGroup(groupIndex)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <CardContent className="pt-0">
                                    <div className="space-y-2 pl-8">
                                        {group.items.map((item, itemIndex) => (
                                            <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                <GripVertical className="h-4 w-4 text-slate-400" />
                                                <Input
                                                    value={item.label}
                                                    onChange={(e) => updateMenuItem(groupIndex, itemIndex, 'label', e.target.value)}
                                                    className="flex-1 h-8 text-sm"
                                                    placeholder="Label"
                                                />
                                                <Input
                                                    value={item.path}
                                                    onChange={(e) => updateMenuItem(groupIndex, itemIndex, 'path', e.target.value)}
                                                    className="flex-1 h-8 text-sm"
                                                    placeholder="Page Path"
                                                />
                                                <Switch
                                                    checked={item.enabled}
                                                    onCheckedChange={() => toggleItemEnabled(groupIndex, itemIndex)}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeMenuItem(groupIndex, itemIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addMenuItem(groupIndex)}
                                            className="w-full"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Menu Item
                                        </Button>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Tips:</strong> Drag items to reorder, toggle switches to enable/disable, 
                    and ensure page paths match your actual page names.
                </p>
            </div>
        </div>
    );
}