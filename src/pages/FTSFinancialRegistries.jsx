import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    CreditCard, 
    Building2, 
    Globe, 
    Search, 
    RefreshCw,
    Upload,
    Settings,
    Shield,
    Database,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { validateIBAN, validateBIC, parseBIC } from '@/components/utils/ibanBic';

export default function FTSFinancialRegistries() {
    const queryClient = useQueryClient();
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('bins');
    const [searchQuery, setSearchQuery] = useState('');
    const [lookupBin, setLookupBin] = useState('');
    const [lookupIBAN, setLookupIBAN] = useState('');
    const [lookupBIC, setLookupBIC] = useState('');
    const [selectedBin, setSelectedBin] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    // BIN queries
    const { data: bins = [], isLoading: binsLoading } = useQuery({
        queryKey: ['bins'],
        queryFn: async () => {
            const response = await base44.functions.invoke('binLookup', { action: 'list' });
            return response.data?.data || [];
        }
    });

    // BIN mutations
    const lookupBinMutation = useMutation({
        mutationFn: async (bin) => {
            const response = await base44.functions.invoke('binLookup', { action: 'lookup', bin });
            return response.data;
        },
        onSuccess: (data) => {
            if (data.success) {
                toast.success(`BIN ${lookupBin} added to registry`);
                queryClient.invalidateQueries(['bins']);
                setLookupBin('');
            }
        },
        onError: () => toast.error('Failed to lookup BIN')
    });

    const bulkImportBinsMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('binLookup', { action: 'bulk_import' });
            return response.data;
        },
        onSuccess: (data) => {
            const { success, failed } = data.results;
            toast.success(`Imported ${success} BINs. ${failed} failed.`);
            queryClient.invalidateQueries(['bins']);
        },
        onError: () => toast.error('Failed to bulk import BINs')
    });

    const updateBinMutation = useMutation({
        mutationFn: async (data) => {
            const response = await base44.functions.invoke('binLookup', { 
                action: 'update_routing',
                ...data
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('BIN updated successfully');
            queryClient.invalidateQueries(['bins']);
            setEditDialogOpen(false);
        },
        onError: () => toast.error('Failed to update BIN')
    });

    // IBAN validation
    const [ibanValidation, setIbanValidation] = useState(null);
    const handleValidateIBAN = () => {
        if (lookupIBAN.length < 15) {
            toast.error('IBAN must be at least 15 characters');
            return;
        }
        const result = validateIBAN(lookupIBAN);
        setIbanValidation(result);
        if (result.valid) {
            toast.success('Valid IBAN');
        } else {
            toast.error('Invalid IBAN');
        }
    };

    // BIC validation
    const [bicValidation, setBicValidation] = useState(null);
    const handleValidateBIC = () => {
        if (lookupBIC.length < 8) {
            toast.error('BIC must be 8 or 11 characters');
            return;
        }
        const result = parseBIC(lookupBIC);
        setBicValidation(result);
        if (result.valid) {
            toast.success('Valid BIC/SWIFT code');
        } else {
            toast.error('Invalid BIC/SWIFT code');
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

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
        visa: <div className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-bold text-sm">VISA</div>,
        mastercard: <div className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-md font-bold text-sm">Mastercard</div>,
        amex: <div className="px-3 py-1.5 bg-blue-500 text-white rounded-md font-bold text-sm">AMEX</div>,
        discover: <div className="px-3 py-1.5 bg-orange-600 text-white rounded-md font-bold text-sm">DISCOVER</div>
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSFinancialRegistries" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">ISO Financial Registries</h2>
                        <p className="text-xs text-slate-600">Manage BINs (ISO/IEC 7812), IBANs (ISO 13616), BIC/SWIFT (ISO 9362) and global bank data</p>
                    </div>
                    <Button variant="outline" onClick={() => queryClient.invalidateQueries()}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh All
                    </Button>
                </header>

                <div className="p-6">
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-blue-100">BIN Records</p>
                                        <p className="text-3xl font-bold mt-1">{bins.length}</p>
                                        <p className="text-xs text-blue-100 mt-1">ISO/IEC 7812</p>
                                    </div>
                                    <CreditCard className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-purple-100">IBAN Validator</p>
                                        <p className="text-3xl font-bold mt-1">Ready</p>
                                        <p className="text-xs text-purple-100 mt-1">ISO 13616</p>
                                    </div>
                                    <Shield className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-emerald-100">BIC/SWIFT</p>
                                        <p className="text-3xl font-bold mt-1">Global</p>
                                        <p className="text-xs text-emerald-100 mt-1">ISO 9362</p>
                                    </div>
                                    <Building2 className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-amber-100">Banks</p>
                                        <p className="text-3xl font-bold mt-1">{new Set(bins.map(b => b.bank_name).filter(Boolean)).size}</p>
                                        <p className="text-xs text-amber-100 mt-1">Unique institutions</p>
                                    </div>
                                    <Database className="h-12 w-12 opacity-50" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="bins">BIN Registry (ISO/IEC 7812)</TabsTrigger>
                            <TabsTrigger value="iban">IBAN Validator (ISO 13616)</TabsTrigger>
                            <TabsTrigger value="bic">BIC/SWIFT (ISO 9362)</TabsTrigger>
                            <TabsTrigger value="standards">ISO Standards</TabsTrigger>
                        </TabsList>

                        {/* BIN Registry */}
                        <TabsContent value="bins" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Search className="h-5 w-5" />
                                        BIN Lookup & Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder="Enter BIN (6-8 digits)..."
                                            value={lookupBin}
                                            onChange={(e) => setLookupBin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                                            className="max-w-xs"
                                        />
                                        <Button 
                                            onClick={() => lookupBinMutation.mutate(lookupBin)}
                                            disabled={lookupBinMutation.isPending || lookupBin.length < 6}
                                        >
                                            {lookupBinMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                                            Lookup BIN
                                        </Button>
                                        <Button 
                                            onClick={() => bulkImportBinsMutation.mutate()}
                                            disabled={bulkImportBinsMutation.isPending}
                                            variant="outline"
                                        >
                                            {bulkImportBinsMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                                            Import Common BINs
                                        </Button>
                                    </div>
                                    <p className="text-xs text-slate-500">Fetches from binlist.net API and stores in registry</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>BIN Database</CardTitle>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <Input
                                                placeholder="Search BINs..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 w-64"
                                            />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-slate-200">
                                                    <th className="text-left py-3 px-4 font-semibold">BIN</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Scheme</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Bank</th>
                                                    <th className="text-left py-3 px-4 font-semibold">Country</th>
                                                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                                                    <th className="text-center py-3 px-4 font-semibold"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {binsLoading ? (
                                                    <tr>
                                                        <td colSpan={7} className="text-center py-12">
                                                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                                            <p className="text-slate-500">Loading BINs...</p>
                                                        </td>
                                                    </tr>
                                                ) : filteredBins.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={7} className="text-center py-12 text-slate-500">
                                                            No BINs found. Use lookup or import tools above.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredBins.map((bin) => (
                                                        <tr key={bin.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                            <td className="py-3 px-4 font-mono font-semibold text-blue-600">{bin.bin}</td>
                                                            <td className="py-3 px-4">
                                                                {schemeLogos[bin.scheme?.toLowerCase()] || (
                                                                    <Badge variant="outline" className="uppercase">{bin.scheme || '-'}</Badge>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <Badge variant="outline" className="capitalize">{bin.type || 'Unknown'}</Badge>
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {bin.bank_name ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <Building2 className="h-4 w-4 text-slate-400" />
                                                                        <div>
                                                                            <div className="text-sm font-medium">{bin.bank_name}</div>
                                                                            {bin.bank_city && <div className="text-xs text-slate-500">{bin.bank_city}</div>}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex items-center gap-2">
                                                                    <Globe className="h-4 w-4 text-slate-400" />
                                                                    <span>{bin.country_name || bin.country || '-'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <Badge className={cn(
                                                                    bin.status === 'active' && "bg-emerald-100 text-emerald-700",
                                                                    bin.status === 'inactive' && "bg-slate-100 text-slate-700",
                                                                    bin.status === 'blocked' && "bg-red-100 text-red-700"
                                                                )}>
                                                                    {bin.status}
                                                                </Badge>
                                                            </td>
                                                            <td className="py-3 px-4 text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setSelectedBin(bin);
                                                                        setEditDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Settings className="h-4 w-4" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* IBAN Validator */}
                        <TabsContent value="iban" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>IBAN Validator (ISO 13616)</CardTitle>
                                    <p className="text-sm text-slate-600">Validate International Bank Account Numbers</p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder="Enter IBAN (e.g., GB82 WEST 1234 5698 7654 32)"
                                            value={lookupIBAN}
                                            onChange={(e) => setLookupIBAN(e.target.value.toUpperCase())}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleValidateIBAN}>
                                            <Shield className="h-4 w-4 mr-2" />
                                            Validate
                                        </Button>
                                    </div>

                                    {ibanValidation && (
                                        <Card className={cn(
                                            "border-2",
                                            ibanValidation.valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                                        )}>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    {ibanValidation.valid ? (
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                                    ) : (
                                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                                    )}
                                                    <div>
                                                        <p className={cn(
                                                            "font-semibold text-lg",
                                                            ibanValidation.valid ? "text-emerald-900" : "text-red-900"
                                                        )}>
                                                            {ibanValidation.valid ? 'Valid IBAN' : 'Invalid IBAN'}
                                                        </p>
                                                        <p className="text-sm text-slate-600">ISO 13616 Compliance Check</p>
                                                    </div>
                                                </div>
                                                {ibanValidation.valid && (
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-slate-600">Country Code</p>
                                                            <p className="font-semibold">{ibanValidation.country}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Check Digits</p>
                                                            <p className="font-semibold">{ibanValidation.checkDigits}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-slate-600">Formatted</p>
                                                            <p className="font-mono font-semibold">{ibanValidation.formatted}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-slate-600">Electronic Format</p>
                                                            <p className="font-mono font-semibold">{ibanValidation.electronic}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* BIC/SWIFT */}
                        <TabsContent value="bic" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>BIC/SWIFT Code Validator (ISO 9362)</CardTitle>
                                    <p className="text-sm text-slate-600">Validate Business Identifier Codes</p>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex gap-3">
                                        <Input
                                            placeholder="Enter BIC/SWIFT (e.g., DEUTDEFF or DEUTDEFF500)"
                                            value={lookupBIC}
                                            onChange={(e) => setLookupBIC(e.target.value.toUpperCase())}
                                            className="flex-1"
                                        />
                                        <Button onClick={handleValidateBIC}>
                                            <Building2 className="h-4 w-4 mr-2" />
                                            Validate
                                        </Button>
                                    </div>

                                    {bicValidation && (
                                        <Card className={cn(
                                            "border-2",
                                            bicValidation.valid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                                        )}>
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    {bicValidation.valid ? (
                                                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                                                    ) : (
                                                        <AlertCircle className="h-8 w-8 text-red-600" />
                                                    )}
                                                    <div>
                                                        <p className={cn(
                                                            "font-semibold text-lg",
                                                            bicValidation.valid ? "text-emerald-900" : "text-red-900"
                                                        )}>
                                                            {bicValidation.valid ? 'Valid BIC/SWIFT Code' : 'Invalid BIC/SWIFT Code'}
                                                        </p>
                                                        <p className="text-sm text-slate-600">ISO 9362 Compliance Check</p>
                                                    </div>
                                                </div>
                                                {bicValidation.valid && (
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <p className="text-slate-600">Bank Code</p>
                                                            <p className="font-semibold font-mono">{bicValidation.bankCode}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Country Code</p>
                                                            <p className="font-semibold">{bicValidation.countryCode}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Location Code</p>
                                                            <p className="font-semibold font-mono">{bicValidation.locationCode}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-slate-600">Branch Code</p>
                                                            <p className="font-semibold font-mono">{bicValidation.branchCode}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-slate-600">Office Type</p>
                                                            <p className="font-semibold">{bicValidation.isPrimaryOffice ? 'Primary Office' : 'Branch Office'}</p>
                                                        </div>
                                                        <div className="col-span-2">
                                                            <p className="text-slate-600">Full Code</p>
                                                            <p className="font-mono font-semibold">{bicValidation.formatted}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* ISO Standards Reference */}
                        <TabsContent value="standards" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BookOpen className="h-5 w-5" />
                                        ISO Financial Standards Reference
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <Card className="border-2 border-blue-200">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-3">
                                                    <CreditCard className="h-6 w-6 text-blue-600 mt-1" />
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2">ISO/IEC 7812 - Bank Identification Numbers</h3>
                                                        <p className="text-sm text-slate-600 mb-3">
                                                            Defines the numbering system and structure for identification of issuers of cards that require 
                                                            an issuer identification number to operate. BINs identify the institution that issued the card.
                                                        </p>
                                                        <div className="text-sm space-y-2">
                                                            <p><strong>Structure:</strong> 6-8 digits identifying the card issuer</p>
                                                            <p><strong>Usage:</strong> Card routing, fraud detection, processor selection</p>
                                                            <p><strong>Data Source:</strong> binlist.net API, ISO registry</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-2 border-purple-200">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-3">
                                                    <Shield className="h-6 w-6 text-purple-600 mt-1" />
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2">ISO 13616 - International Bank Account Number</h3>
                                                        <p className="text-sm text-slate-600 mb-3">
                                                            Defines the structure of an IBAN (up to 34 alphanumeric characters) to facilitate automated 
                                                            processing of cross-border payment transactions.
                                                        </p>
                                                        <div className="text-sm space-y-2">
                                                            <p><strong>Structure:</strong> Country code (2) + Check digits (2) + Basic Bank Account Number</p>
                                                            <p><strong>Usage:</strong> International wire transfers, SEPA payments</p>
                                                            <p><strong>Countries:</strong> 80+ countries worldwide</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-2 border-emerald-200">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-3">
                                                    <Building2 className="h-6 w-6 text-emerald-600 mt-1" />
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2">ISO 9362 - Business Identifier Codes (BIC/SWIFT)</h3>
                                                        <p className="text-sm text-slate-600 mb-3">
                                                            Defines a standard format of Business Identifier Codes (also known as SWIFT codes) used to 
                                                            uniquely identify banks and financial institutions globally.
                                                        </p>
                                                        <div className="text-sm space-y-2">
                                                            <p><strong>Structure:</strong> Bank code (4) + Country code (2) + Location code (2) + Branch code (3, optional)</p>
                                                            <p><strong>Usage:</strong> International payments, SWIFT network, bank identification</p>
                                                            <p><strong>Registry:</strong> SWIFT maintains the official BIC directory</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="border-2 border-amber-200">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-3">
                                                    <Globe className="h-6 w-6 text-amber-600 mt-1" />
                                                    <div>
                                                        <h3 className="font-semibold text-lg mb-2">ISO 20022 - Universal Financial Industry Message Scheme</h3>
                                                        <p className="text-sm text-slate-600 mb-3">
                                                            Defines a common platform for the development of messages using XML syntax and provides a 
                                                            common language for payment processing globally.
                                                        </p>
                                                        <div className="text-sm space-y-2">
                                                            <p><strong>Format:</strong> XML-based structured data</p>
                                                            <p><strong>Usage:</strong> Cross-border payments, clearing, settlement, securities</p>
                                                            <p><strong>Adoption:</strong> Mandatory for SWIFT by 2025</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Edit BIN Dialog */}
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
                                <Label>Status</Label>
                                <Select 
                                    defaultValue={selectedBin.status || 'active'}
                                    onValueChange={(value) => setSelectedBin({...selectedBin, status: value})}
                                >
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
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button 
                            onClick={() => updateBinMutation.mutate({
                                bin_id: selectedBin.id,
                                status: selectedBin.status,
                                routing_priority: selectedBin.routing_priority || 100,
                                preferred_processor: selectedBin.preferred_processor || ''
                            })}
                            disabled={updateBinMutation.isPending}
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}