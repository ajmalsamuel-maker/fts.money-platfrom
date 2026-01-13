import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Server, Activity, Users, Zap, CheckCircle, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function BlockchainNetworkDashboard() {
    const platformSession = localStorage.getItem('platform_admin_session');
    if (!platformSession) {
        window.location.href = '/PlatformAdminLogin';
        return null;
    }

    const { data: blockchainConfigs = [] } = useQuery({
        queryKey: ['blockchain-configs'],
        queryFn: () => base44.entities.BlockchainConfig.list()
    });

    const { data: customers = [] } = useQuery({
        queryKey: ['loyalty-customers'],
        queryFn: () => base44.entities.LoyaltyCustomer.list()
    });

    const { data: participants = [] } = useQuery({
        queryKey: ['loyalty-participants'],
        queryFn: () => base44.entities.LoyaltyParticipant.list()
    });

    const { data: tokenTransactions = [] } = useQuery({
        queryKey: ['token-transactions'],
        queryFn: () => base44.entities.TokenTransaction.list()
    });

    const { data: programs = [] } = useQuery({
        queryKey: ['loyalty-programs'],
        queryFn: () => base44.entities.LoyaltyProgram.list()
    });

    const activeChains = blockchainConfigs.filter(c => c.provisioning_status === 'active');
    const totalRevenue = blockchainConfigs.reduce((sum, c) => sum + (c.monthly_cost || 0), 0);

    const getCustomerName = (customerId) => {
        const customer = customers.find(c => c.id === customerId);
        return customer?.organization_name || 'Unknown';
    };

    const getChainStats = (config) => {
        const customer = customers.find(c => c.id === config.customer_id);
        const customerPrograms = programs.filter(p => p.admin_email === customer?.admin_email);
        const programIds = customerPrograms.map(p => p.id);
        
        const chainParticipants = participants.filter(p => programIds.includes(p.program_id));
        const chainTransactions = tokenTransactions.filter(t => programIds.includes(t.program_id));
        
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentTx = chainTransactions.filter(t => new Date(t.created_date) > last24h).length;
        
        return {
            totalParticipants: chainParticipants.length,
            totalTransactions: chainTransactions.length,
            txLast24h: recentTx,
            gasRelayCalls: chainTransactions.length, // All transactions are gas-free
            validators: config.validator_nodes?.length || 0
        };
    };

    const getHealthStatus = (config, stats) => {
        if (config.provisioning_status !== 'active') return 'offline';
        if (stats.txLast24h > 100) return 'healthy';
        if (stats.txLast24h > 10) return 'moderate';
        return 'low-activity';
    };

    const getHealthColor = (status) => {
        switch (status) {
            case 'healthy': return 'bg-green-100 text-green-800';
            case 'moderate': return 'bg-yellow-100 text-yellow-800';
            case 'low-activity': return 'bg-blue-100 text-blue-800';
            default: return 'bg-red-100 text-red-800';
        }
    };

    const totalParticipants = activeChains.reduce((sum, config) => {
        const stats = getChainStats(config);
        return sum + stats.totalParticipants;
    }, 0);

    const totalTransactions = activeChains.reduce((sum, config) => {
        const stats = getChainStats(config);
        return sum + stats.totalTransactions;
    }, 0);

    const totalGasRelayCalls = activeChains.reduce((sum, config) => {
        const stats = getChainStats(config);
        return sum + stats.gasRelayCalls;
    }, 0);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar currentPage="blockchain-network" />
            
            <div className="flex-1 p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Blockchain Network Dashboard</h1>
                        <p className="text-slate-600 mt-1">Monitor performance across all customer chains</p>
                    </div>

                    {/* Global Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Chains</p>
                                        <p className="text-3xl font-bold">{activeChains.length}</p>
                                        <p className="text-xs text-slate-500 mt-1">of {blockchainConfigs.length} total</p>
                                    </div>
                                    <Server className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Transactions</p>
                                        <p className="text-3xl font-bold">{totalTransactions.toLocaleString()}</p>
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            All gas-free
                                        </p>
                                    </div>
                                    <Activity className="h-10 w-10 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Participants</p>
                                        <p className="text-3xl font-bold">{totalParticipants.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">across all chains</p>
                                    </div>
                                    <Users className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Monthly Revenue</p>
                                        <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 mt-1">{activeChains.length} active subscriptions</p>
                                    </div>
                                    <DollarSign className="h-10 w-10 text-yellow-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chain-by-Chain Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Chain Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeChains.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Server className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                                    <p>No active blockchain networks</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {activeChains.map(config => {
                                        const stats = getChainStats(config);
                                        const health = getHealthStatus(config, stats);
                                        
                                        return (
                                            <div key={config.id} className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{getCustomerName(config.customer_id)}</h3>
                                                        <p className="text-sm text-slate-600">Chain ID: {config.chain_id}</p>
                                                    </div>
                                                    <Badge className={getHealthColor(health)}>
                                                        {health === 'healthy' ? <CheckCircle className="h-3 w-3 mr-1" /> : 
                                                         health === 'offline' ? <AlertCircle className="h-3 w-3 mr-1" /> : 
                                                         <Activity className="h-3 w-3 mr-1" />}
                                                        {health}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-slate-500">Participants</p>
                                                        <p className="font-semibold text-lg">{stats.totalParticipants}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Total TX</p>
                                                        <p className="font-semibold text-lg">{stats.totalTransactions.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">TX (24h)</p>
                                                        <p className="font-semibold text-lg">{stats.txLast24h}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Validators</p>
                                                        <p className="font-semibold text-lg">{stats.validators}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Gas Relay</p>
                                                        <div className="flex items-center gap-1">
                                                            <Zap className="h-4 w-4 text-yellow-600" />
                                                            <p className="font-semibold text-lg">{stats.gasRelayCalls}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-xs">
                                                    <div>
                                                        <p className="text-slate-500">Resources</p>
                                                        <p className="text-slate-700">{config.resources_allocated?.cpu_cores || 0} cores • {config.resources_allocated?.ram_gb || 0}GB RAM</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-500">Monthly Cost</p>
                                                        <p className="text-green-600 font-medium">${config.monthly_cost || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}