import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
    Plus, 
    Trash2, 
    GripVertical, 
    ChevronDown, 
    ChevronRight,
    Settings
} from 'lucide-react';
import { cn } from "@/lib/utils";

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
            { id: 'onboarding', label: 'Onboarding', path: 'MerchantOnboarding', enabled: true }
        ]
    },
    {
        id: 'finance',
        label: 'Finance',
        icon: 'Wallet',
        enabled: true,
        items: [
            { id: 'balances', label: 'Balances', path: 'Balances', enabled: true },
            { id: 'payouts', label: 'Payouts', path: 'Payouts', enabled: true }
        ]
    }
];

export default function MenuConfigEditor({ menuConfig = [], onChange }) {
    const [menus, setMenus] = useState(menuConfig.length > 0 ? menuConfig : DEFAULT_MENU_ITEMS);
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
            label: 'New Item',
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Menu Configuration</h3>
                    <p className="text-sm text-slate-500">Configure sidebar menus and items</p>
                </div>
            </div>

            <div className="space-y-3">
                {menus.map((group, groupIndex) => {
                    const isExpanded = expandedGroups[group.id];

                    return (
                        <Card key={group.id} className={cn(!group.enabled && "opacity-50")}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-5 w-5 text-slate-400" />
                                    <Settings className="h-5 w-5 text-slate-600" />
                                    <span className="flex-1 text-sm font-medium">{group.label}</span>
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
                                </div>
                            </CardHeader>

                            {isExpanded && (
                                <div className="px-6 pb-4">
                                    <div className="space-y-2 pl-8">
                                        {group.items.map((item, itemIndex) => (
                                            <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                                                <Input
                                                    value={item.label}
                                                    onChange={(e) => updateMenuItem(groupIndex, itemIndex, 'label', e.target.value)}
                                                    className="flex-1 h-8 text-sm"
                                                />
                                                <Input
                                                    value={item.path}
                                                    onChange={(e) => updateMenuItem(groupIndex, itemIndex, 'path', e.target.value)}
                                                    className="flex-1 h-8 text-sm"
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
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}