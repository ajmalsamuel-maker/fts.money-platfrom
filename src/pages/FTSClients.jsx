import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Building2, Mail, Phone, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function FTSClients() {
    const navigate = useNavigate();
    const [search, setSearch] = React.useState('');
    
    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list('-created_date')
    });

    const filteredPSPs = psps.filter(p => 
        p.psp_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.psp_code?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="mb-3"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Platform
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
                            <p className="text-sm text-slate-600">Manage PSP clients and their configurations</p>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search clients..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid gap-4">
                    {filteredPSPs.map((psp) => (
                        <Card 
                            key={psp.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(createPageUrl('PSPInstanceConfig') + `?id=${psp.id}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div 
                                            className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                                            style={{ background: psp.branding?.primary_color || '#3b82f6' }}
                                        >
                                            {psp.psp_code?.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-slate-900">{psp.psp_name}</h3>
                                                <Badge className={cn(
                                                    psp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                                                )}>
                                                    {psp.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 font-mono mb-2">Code: {psp.psp_code}</p>
                                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-4 w-4" />
                                                    {psp.contact_email}
                                                </div>
                                                {psp.contact_phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone className="h-4 w-4" />
                                                        {psp.contact_phone}
                                                    </div>
                                                )}
                                                {psp.domain && (
                                                    <div className="flex items-center gap-1">
                                                        <Globe className="h-4 w-4" />
                                                        {psp.domain}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="mb-2">{psp.tier} tier</Badge>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-slate-600">
                                                <span className="font-semibold">{psp.total_merchants || 0}</span> merchants
                                            </p>
                                            <p className="text-slate-600">
                                                <span className="font-semibold">${((psp.monthly_volume || 0) / 1000000).toFixed(1)}M</span> volume
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}