import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    Search, 
    Download, 
    Upload, 
    RefreshCw,
    Settings,
    CreditCard,
    Building2,
    Globe,
    Loader2,
    AlertCircle
} from 'lucide-react';

export default function BINTable() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [lookupBin, setLookupBin] = useState('');
    const [selectedBin, setSelectedBin] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [routingPriority, setRoutingPriority] = useState(100);
    const [preferredProcessor, setPreferredProcessor] = useState('');
    const [binStatus, setBinStatus] = useState('active');
    const queryClient = useQueryClient();

    const { data: bins = [], isLoading, refetch } = useQuery({
        queryKey: ['bins'],
        queryFn: async () => {
            try {
                const response = await base44.functions.invoke('binLookup', { action: 'list' });
                console.log('BIN response:', response.data);
                return response.data?.data || [];
            } catch (error) {
                console.error('Failed to fetch BINs:', error);
                toast.error('Failed to load BINs');
                return [];
            }
        },
    });

    const lookupMutation = useMutation({
        mutationFn: async (bin) => {
            return await base44.functions.invoke('binLookup', { 
                action: 'lookup', 
                bin 
            });
        },
        onSuccess: (response) => {
            if (response.data.success) {
                toast.success(`BIN ${lookupBin} found and added to database`);
                queryClient.invalidateQueries({ queryKey: ['bins'] });
                setLookupBin('');
            } else {
                toast.error(response.data.error || 'BIN lookup failed');
            }
        },
        onError: () => {
            toast.error('Failed to lookup BIN');
        }
    });

    const bulkImportMutation = useMutation({
        mutationFn: async () => {
            return await base44.functions.invoke('binLookup', { 
                action: 'bulk_import' 
            });
        },
        onSuccess: (response) => {
            if (response.data.success) {
                const { success, failed, errors } = response.data.results;
                toast.success(`Imported ${success} BINs successfully. ${failed} failed.`);
                if (errors.length > 0) {
                    console.log('Import errors:', errors);
                }
                queryClient.invalidateQueries({ queryKey: ['bins'] });
            }
        },
        onError: () => {
            toast.error('Failed to import BINs');
        }
    });

    const updateRoutingMutation = useMutation({
        mutationFn: async ({ bin_id, routing_priority, preferred_processor, status }) => {
            return await base44.functions.invoke('binLookup', { 
                action: 'update_routing',
                bin_id,
                routing_priority,
                preferred_processor,
                status
            });
        },
        onSuccess: () => {
            toast.success('BIN routing updated successfully');
            queryClient.invalidateQueries({ queryKey: ['bins'] });
            setEditDialogOpen(false);
            setSelectedBin(null);
        },
        onError: () => {
            toast.error('Failed to update BIN routing');
        }
    });

    const handleLookup = () => {
        if (lookupBin.length >= 6) {
            lookupMutation.mutate(lookupBin);
        } else {
            toast.error('BIN must be at least 6 digits');
        }
    };

    const handleEditRouting = (bin) => {
        setSelectedBin(bin);
        setRoutingPriority(bin.routing_priority || 100);
        setPreferredProcessor(bin.preferred_processor || '');
        setBinStatus(bin.status || 'active');
        setEditDialogOpen(true);
    };

    const handleSaveRouting = () => {
        updateRoutingMutation.mutate({
            bin_id: selectedBin.id,
            routing_priority: routingPriority,
            preferred_processor: preferredProcessor,
            status: binStatus
        });
    };

    const filteredBins = bins.filter(bin => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            bin.bin?.includes(query) ||
            bin.bank_name?.toLowerCase().includes(query) ||
            bin.scheme?.toLowerCase().includes(query) ||
            bin.country_name?.toLowerCase().includes(query)
        );
    });

    const schemeLogos = {
        visa: (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md font-bold text-sm">
                VISA
            </div>
        ),
        mastercard: (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-md font-bold text-sm">
                <div className="flex -space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
                    <div className="w-3 h-3 bg-orange-400 rounded-full opacity-80"></div>
                </div>
                mastercard
            </div>
        ),
        amex: (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-md font-bold text-sm">
                AMEX
            </div>
        ),
        discover: (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-md font-bold text-sm">
                DISCOVER
            </div>
        ),
        jcb: (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-700 text-white rounded-md font-bold text-xs">
                JCB
            </div>
        ),
        unionpay: (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-700 text-white rounded-md font-bold text-sm">
                <span className="text-xs">中国</span>
                UnionPay
            </div>
        ),
        'diners club': (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-md font-bold text-sm">
                DINERS
            </div>
        ),
        'diners club international': (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-md font-bold text-sm">
                DINERS
            </div>
        )
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar 
                collapsed={sidebarCollapsed} 
                currentPage="BINTable"
            />
            
            <div className={cn(
                "transition-all duration-300 lg:ml-20",
                sidebarCollapsed && "ml-0"
            )}>
                <TopHeader 
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    collapsed={sidebarCollapsed}
                />
                
                <main className="p-6">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">BIN Database</h1>
                            <p className="text-slate-500">Bank Identification Numbers for routing and card issuer detection</p>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => refetch()}
                                disabled={isLoading}
                            >
                                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                                Refresh
                            </Button>
                            <Button 
                                className="gap-2 bg-blue-600 hover:bg-blue-700"
                                onClick={() => bulkImportMutation.mutate()}
                                disabled={bulkImportMutation.isPending}
                            >
                                {bulkImportMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                Import Common BINs
                            </Button>
                        </div>
                    </div>

                    {/* BIN Lookup Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                BIN Lookup & Add
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3">
                                <Input
                                    placeholder="Enter BIN (6-8 digits)..."
                                    value={lookupBin}
                                    onChange={(e) => setLookupBin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                    className="max-w-xs"
                                />
                                <Button 
                                    onClick={handleLookup}
                                    disabled={lookupMutation.isPending || lookupBin.length < 6}
                                >
                                    {lookupMutation.isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Looking up...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Lookup BIN
                                        </>
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Enter a BIN to fetch details from binlist.net and add to database
                            </p>
                        </CardContent>
                    </Card>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by BIN, bank, scheme, country..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Badge variant="secondary" className="ml-auto">
                                    {filteredBins.length} BINs
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* BINs Table */}
                    <Card>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">BIN</TableHead>
                                            <TableHead className="font-semibold">Scheme</TableHead>
                                            <TableHead className="font-semibold">Type</TableHead>
                                            <TableHead className="font-semibold">Bank</TableHead>
                                            <TableHead className="font-semibold">Country</TableHead>
                                            <TableHead className="font-semibold">Priority</TableHead>
                                            <TableHead className="font-semibold">Processor</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold w-12"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12">
                                                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                    <p className="text-slate-500">Loading BINs...</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredBins.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                                                    No BINs found. Use the lookup tool above or import common BINs.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredBins.map((bin) => (
                                                <TableRow key={bin.id} className="hover:bg-slate-50/50">
                                                    <TableCell>
                                                        <span className="font-mono font-semibold text-blue-600">
                                                            {bin.bin}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {bin.scheme ? (
                                                            schemeLogos[bin.scheme.toLowerCase()] || (
                                                                <Badge variant="outline" className="text-xs uppercase bg-slate-100 text-slate-700">
                                                                    <CreditCard className="h-3 w-3 mr-1" />
                                                                    {bin.scheme}
                                                                </Badge>
                                                            )
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-xs capitalize">
                                                            {bin.type || 'Unknown'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {bin.bank_name ? (
                                                            <div className="flex items-center gap-2">
                                                                <Building2 className="h-4 w-4 text-slate-400" />
                                                                <div>
                                                                    <div className="text-sm font-medium">{bin.bank_name}</div>
                                                                    {bin.bank_city && (
                                                                        <div className="text-xs text-slate-500">{bin.bank_city}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-amber-600">
                                                                <AlertCircle className="h-4 w-4" />
                                                                <span className="text-sm">No bank data</span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="h-4 w-4 text-slate-400" />
                                                            <span className="text-sm">
                                                                {bin.country_name || bin.country || '-'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {bin.routing_priority || 100}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-slate-600">
                                                            {bin.preferred_processor || '-'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant="outline"
                                                            className={cn(
                                                                "text-xs",
                                                                bin.status === 'active' && "bg-green-50 text-green-700 border-green-200",
                                                                bin.status === 'inactive' && "bg-slate-50 text-slate-700 border-slate-200",
                                                                bin.status === 'blocked' && "bg-red-50 text-red-700 border-red-200"
                                                            )}
                                                        >
                                                            {bin.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleEditRouting(bin)}
                                                        >
                                                            <Settings className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>

            {/* Edit Routing Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Configure BIN Routing</DialogTitle>
                    </DialogHeader>
                    {selectedBin && (
                        <div className="space-y-4">
                            <div className="p-3 bg-slate-50 rounded-lg border">
                                <p className="text-xs text-slate-500 mb-1">BIN Number</p>
                                <p className="font-mono font-bold text-lg">{selectedBin.bin}</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {selectedBin.bank_name} • {selectedBin.scheme?.toUpperCase()}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Routing Priority</Label>
                                <Input
                                    type="number"
                                    value={routingPriority}
                                    onChange={(e) => setRoutingPriority(parseInt(e.target.value))}
                                    min="1"
                                    max="1000"
                                />
                                <p className="text-xs text-slate-500">Lower values = higher priority</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Preferred Processor</Label>
                                <Input
                                    value={preferredProcessor}
                                    onChange={(e) => setPreferredProcessor(e.target.value)}
                                    placeholder="e.g., stripe, adyen, checkout"
                                />
                                <p className="text-xs text-slate-500">Processor to route this BIN to</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={binStatus} onValueChange={setBinStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleSaveRouting}
                            disabled={updateRoutingMutation.isPending}
                        >
                            {updateRoutingMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}