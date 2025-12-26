import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
    LayoutDashboard, Building2, Globe, Users, Settings, Rocket,
    FileText, DollarSign, Code, GitBranch, Package, Search
} from 'lucide-react';

const commands = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: 'CommunityPortalDashboard', category: 'Navigation' },
    { id: 'launch', label: 'Launch Services', icon: Rocket, path: 'LaunchServices', category: 'Get Started' },
    { id: 'psp', label: 'My PSP Instances', icon: Building2, path: 'MyPSPInstances', category: 'My Services' },
    { id: 'iso', label: 'ISO Gateway', icon: Code, path: 'ISOGatewayLogin', category: 'My Services' },
    { id: 'orch', label: 'Orchestration', icon: GitBranch, path: 'OrchestrationLogin', category: 'My Services' },
    { id: 'crypto', label: 'Crypto Gateway', icon: Package, path: 'CryptoGatewayLogin', category: 'My Services' },
    { id: 'marketplace', label: 'Marketplace', icon: Globe, path: 'CommunityMarketplace', category: 'Explore' },
    { id: 'subscriptions', label: 'My Subscriptions', path: 'MySubscriptions', category: 'My Services' },
    { id: 'billing', label: 'Billing', icon: DollarSign, path: 'CommunityBilling', category: 'Business' },
    { id: 'provider', label: 'Become a Provider', icon: Users, path: 'ServiceProviderRegistration', category: 'Provider' },
    { id: 'settings', label: 'Account Settings', icon: Settings, path: 'CommunityAccountSettings', category: 'Settings' }
];

export default function CommandPalette({ open, onOpenChange }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(true);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [onOpenChange]);

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (path) => {
        navigate(createPageUrl(path));
        onOpenChange(false);
        setSearch('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 max-w-xl">
                <div className="flex items-center border-b px-4 py-3">
                    <Search className="h-4 w-4 text-slate-400 mr-2" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for pages, actions..."
                        className="border-0 focus-visible:ring-0 px-0"
                        autoFocus
                    />
                    <Badge variant="outline" className="text-xs ml-2">⌘K</Badge>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                    {filteredCommands.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-6">No results found</p>
                    ) : (
                        <div className="space-y-1">
                            {filteredCommands.map((cmd) => {
                                const Icon = cmd.icon || FileText;
                                return (
                                    <button
                                        key={cmd.id}
                                        onClick={() => handleSelect(cmd.path)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 transition-colors text-left"
                                    >
                                        <Icon className="h-4 w-4 text-slate-600" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900">{cmd.label}</p>
                                            <p className="text-xs text-slate-500">{cmd.category}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}