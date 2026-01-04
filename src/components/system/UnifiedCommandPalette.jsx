import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { 
    Building2, Code, GitBranch, Globe, Settings, Users, 
    DollarSign, BarChart3, Shield, Package, Zap,
    Store, CreditCard, FileText, Terminal
} from 'lucide-react';

/**
 * Unified Command Palette for all portals
 * Adapts based on portal context
 */
export default function UnifiedCommandPalette({ 
    open, 
    onOpenChange, 
    portalType = 'community', // community, platform, psp, merchant
    customCommands = []
}) {
    const [search, setSearch] = useState('');

    // Portal-specific commands
    const commandSets = {
        community: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: 'CommunityPortalDashboard', category: 'Navigation' },
            { id: 'launch', label: 'Launch Services', icon: Zap, path: 'LaunchServices', category: 'Actions' },
            { id: 'psp', label: 'My PSPs', icon: Building2, path: 'MyPSPInstances', category: 'Services' },
            { id: 'iso', label: 'ISO Gateway', icon: Code, path: 'ISOGatewayLogin', category: 'Services' },
            { id: 'orch', label: 'Orchestration', icon: GitBranch, path: 'OrchestrationLogin', category: 'Services' },
            { id: 'crypto', label: 'Crypto Gateway', icon: Zap, path: 'CryptoGatewayLogin', category: 'Services' },
            { id: 'marketplace', label: 'Marketplace', icon: Globe, path: 'CommunityMarketplace', category: 'Navigation' },
            { id: 'billing', label: 'Billing', icon: DollarSign, path: 'CommunityBilling', category: 'Business' },
            { id: 'settings', label: 'Settings', icon: Settings, path: 'CommunityAccountSettings', category: 'Settings' },
        ],
        platform: [
            { id: 'dashboard', label: 'Platform Dashboard', icon: BarChart3, path: 'FTSMoneyPlatform', category: 'Navigation' },
            { id: 'psps', label: 'PSP Instances', icon: Building2, path: 'PSPProvisioning', category: 'Management' },
            { id: 'users', label: 'User Management', icon: Users, path: 'PlatformUserManagement', category: 'Management' },
            { id: 'services', label: 'Service Catalog', icon: Package, path: 'FTSServiceManager', category: 'Services' },
            { id: 'providers', label: 'Provider Pool', icon: Store, path: 'FTSProviderPool', category: 'Services' },
            { id: 'analytics', label: 'Analytics', icon: BarChart3, path: 'FTSAnalytics', category: 'Reports' },
            { id: 'revenue', label: 'Revenue', icon: DollarSign, path: 'FTSRevenue', category: 'Finance' },
            { id: 'compliance', label: 'Compliance', icon: Shield, path: 'FTSCompliance', category: 'Security' },
        ],
        psp: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: 'Dashboard', category: 'Navigation' },
            { id: 'transactions', label: 'Transactions', icon: CreditCard, path: 'Transactions', category: 'Operations' },
            { id: 'merchants', label: 'Merchants', icon: Store, path: 'Merchants', category: 'Management' },
            { id: 'terminals', label: 'Terminals', icon: Terminal, path: 'Terminals', category: 'Hardware' },
            { id: 'reports', label: 'Reports', icon: FileText, path: 'Reports', category: 'Analytics' },
            { id: 'settings', label: 'Settings', icon: Settings, path: 'Settings', category: 'Configuration' },
        ],
        merchant: [
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: 'MerchantDashboard', category: 'Navigation' },
            { id: 'transactions', label: 'Transactions', icon: CreditCard, path: 'MerchantTransactionList', category: 'Operations' },
            { id: 'customers', label: 'Customers', icon: Users, path: 'MerchantCustomers', category: 'Management' },
            { id: 'invoices', label: 'Invoices', icon: FileText, path: 'MerchantInvoicing', category: 'Billing' },
            { id: 'terminal', label: 'Virtual Terminal', icon: Terminal, path: 'MerchantVirtualTerminal', category: 'Tools' },
        ]
    };

    const commands = [...(commandSets[portalType] || []), ...customCommands];

    // Filter commands based on search
    const filteredCommands = search 
        ? commands.filter(cmd => 
            cmd.label.toLowerCase().includes(search.toLowerCase()) ||
            cmd.category.toLowerCase().includes(search.toLowerCase())
          )
        : commands;

    // Group by category
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {});

    // Keyboard shortcut handler
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);

    const handleSelect = (path) => {
        onOpenChange(false);
        window.location.href = createPageUrl(path);
    };

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput 
                placeholder="Search commands..." 
                value={search}
                onValueChange={setSearch}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {Object.entries(groupedCommands).map(([category, items]) => (
                    <CommandGroup key={category} heading={category}>
                        {items.map((cmd) => {
                            const Icon = cmd.icon;
                            return (
                                <CommandItem
                                    key={cmd.id}
                                    onSelect={() => handleSelect(cmd.path)}
                                    className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                                >
                                    <Icon className="h-4 w-4 text-slate-500" />
                                    <span>{cmd.label}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                ))}
            </CommandList>
        </CommandDialog>
    );
}