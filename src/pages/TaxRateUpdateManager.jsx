import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    RefreshCw, 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    Database,
    TrendingUp,
    Download,
    Upload,
    History,
    Shield
} from 'lucide-react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { base44 } from '@/api/base44Client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function TaxRateUpdateManager() {
    const { platformUser, loading: authLoading } = usePlatformAuth();
    const [loading, setLoading] = useState(false);
    const [updates, setUpdates] = useState([]);
    const [currentRates, setCurrentRates] = useState({});
    const [updateHistory, setUpdateHistory] = useState([]);
    const [lastSync, setLastSync] = useState(null);
    const [validationResults, setValidationResults] = useState([]);
    const [syncSchedule, setSyncSchedule] = useState({ sync_enabled: false, sync_interval: 24, sync_unit: 'hours' });
    const [overrideForm, setOverrideForm] = useState({ country: '', override_type: 'standard_rate', value: '', reason: '' });
    const [countrySearch, setCountrySearch] = useState('');
    const [allCountryRules, setAllCountryRules] = useState([]);

    const [manualUpdate, setManualUpdate] = useState({
        country: '',
        tax_type: 'VAT',
        new_rate: '',
        effective_date: new Date().toISOString().split('T')[0],
        notes: '',
        source: 'manual'
    });

    const fetchUpdates = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'fetch_updates',
                provider: 'all'
            });
            setUpdates(response.data.updates || []);
            setLastSync(response.data.timestamp);
        } catch (error) {
            console.error('Error fetching updates:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentRates = async () => {
        try {
            const response = await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'get_current_rates'
            });
            setCurrentRates(response.data.rates || {});
        } catch (error) {
            console.error('Error fetching rates:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'get_update_history'
            });
            setUpdateHistory(response.data.history || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const approveUpdate = async (update) => {
        setLoading(true);
        try {
            await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'approve_update',
                ...update
            });
            await fetchUpdates();
            await fetchCurrentRates();
            await fetchHistory();
            alert('Tax rate update approved and applied system-wide!');
        } catch (error) {
            alert('Failed to approve update: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const rejectUpdate = async (update) => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        setLoading(true);
        try {
            await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'reject_update',
                ...update,
                rejection_reason: reason
            });
            await fetchUpdates();
            await fetchHistory();
            alert('Tax rate update rejected');
        } catch (error) {
            alert('Failed to reject update: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const validateTaxRules = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'validate_tax_rules'
            });
            setValidationResults(response.data.results || []);
        } catch (error) {
            console.error('Validation error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateSyncSchedule = async () => {
        setLoading(true);
        try {
            await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'set_sync_schedule',
                ...syncSchedule
            });
            alert('Sync schedule updated successfully!');
        } catch (error) {
            alert('Failed to update schedule: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const submitOverride = async () => {
        setLoading(true);
        try {
            await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'manual_override',
                ...overrideForm
            });
            await fetchHistory();
            alert('Manual override applied successfully!');
            setOverrideForm({ country: '', override_type: 'standard_rate', value: '', reason: '' });
        } catch (error) {
            alert('Failed to apply override: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const applyAllUpdates = async () => {
        if (updates.length === 0) {
            alert('No updates available to apply');
            return;
        }

        const confirmApply = window.confirm(
            `Apply all ${updates.length} tax rate updates?\n\nThis will update tax rates system-wide for VAT/TAX calculations, e-invoicing, and billing.`
        );
        
        if (!confirmApply) return;

        setLoading(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const update of updates) {
                try {
                    await base44.functions.invoke('updateGlobalTaxRates', {
                        action: 'apply_update',
                        ...update
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to apply update for ${update.country}:`, error);
                    errorCount++;
                }
            }

            await fetchUpdates();
            await fetchCurrentRates();
            await fetchHistory();
            
            alert(`Applied ${successCount} updates successfully${errorCount > 0 ? ` (${errorCount} failed)` : ''}.\n\nTax rates are now available system-wide for VAT/TAX, e-invoicing, and billing.`);
        } catch (error) {
            alert('Error during batch update: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const submitManualUpdate = async () => {
        setLoading(true);
        try {
            await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'manual_update',
                ...manualUpdate
            });
            await fetchHistory();
            alert('Manual update applied successfully!');
            setManualUpdate({
                country: '',
                tax_type: 'VAT',
                new_rate: '',
                effective_date: new Date().toISOString().split('T')[0],
                notes: '',
                source: 'manual'
            });
        } catch (error) {
            alert('Failed to apply manual update: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentRates();
        fetchHistory();
    }, []);

    if (authLoading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="TaxRateUpdateManager"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Tax Rate Update Manager</h1>
                            <p className="text-slate-600 mt-1">Automated tax rate synchronization & manual updates</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {lastSync && (
                                <div className="text-xs text-slate-500">
                                    Last sync: {new Date(lastSync).toLocaleString()}
                                </div>
                            )}
                            <Button onClick={fetchUpdates} disabled={loading}>
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Fetch Updates
                            </Button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Countries Tracked</p>
                                        <p className="text-3xl font-bold text-blue-600">{Object.keys(currentRates).length}</p>
                                    </div>
                                    <Database className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pending Updates</p>
                                        <p className="text-3xl font-bold text-orange-600">
                                            {updates.filter(u => u.requires_approval).length}
                                        </p>
                                    </div>
                                    <AlertTriangle className="h-10 w-10 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Verified Updates</p>
                                        <p className="text-3xl font-bold text-green-600">
                                            {updates.filter(u => u.confidence === 'verified').length}
                                        </p>
                                    </div>
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Update History</p>
                                        <p className="text-3xl font-bold text-slate-900">{updateHistory.length}</p>
                                    </div>
                                    <History className="h-10 w-10 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Tabs defaultValue="updates">
                        <TabsList className="grid w-full grid-cols-7">
                            <TabsTrigger value="updates">Available Updates ({updates.length})</TabsTrigger>
                            <TabsTrigger value="current">Current Rates</TabsTrigger>
                            <TabsTrigger value="details">Country Details</TabsTrigger>
                            <TabsTrigger value="manual">Manual Update</TabsTrigger>
                            <TabsTrigger value="validation">Validation & Overrides</TabsTrigger>
                            <TabsTrigger value="schedule">Auto-Sync Schedule</TabsTrigger>
                            <TabsTrigger value="history">History ({updateHistory.length})</TabsTrigger>
                        </TabsList>

                        {/* Available Updates */}
                        <TabsContent value="updates" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle>Tax Rate Updates from External Providers</CardTitle>
                                            <CardDescription>Review and apply updates from Avalara, TaxJar, OECD, and EU VIES</CardDescription>
                                        </div>
                                        {updates.length > 0 && (
                                            <Button 
                                                onClick={applyAllUpdates}
                                                disabled={loading}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Apply All ({updates.length})
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {updates.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <Database className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                            <p>No updates available. Click "Fetch Updates" to check for changes.</p>
                                        </div>
                                    ) : (
                                        updates.map((update, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg bg-white">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="font-bold text-lg">{update.country}</span>
                                                            <Badge className="bg-blue-100 text-blue-800">{update.source}</Badge>
                                                            <Badge className={
                                                                update.confidence === 'verified' ? 'bg-green-100 text-green-800' :
                                                                update.confidence === 'official' ? 'bg-purple-100 text-purple-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                            }>
                                                                {update.confidence}
                                                            </Badge>
                                                            {update.requires_approval && (
                                                                <Badge variant="outline" className="border-orange-300 text-orange-700">
                                                                    Requires Approval
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-700 mb-2">{update.details}</p>
                                                        <div className="flex items-center gap-4 text-xs text-slate-600">
                                                            <span>Change: {update.change_type}</span>
                                                            <span>Effective: {update.effective_date}</span>
                                                            {update.new_rate && (
                                                                <span className="font-semibold">
                                                                    Rate: {update.old_rate}% → {update.new_rate}%
                                                                </span>
                                                            )}
                                                        {update.current_system_rate !== undefined && (
                                                            <span className="text-xs text-slate-500">
                                                                Current: {update.current_system_rate}%
                                                            </span>
                                                        )}
                                                        {update.change_magnitude > 0 && (
                                                            <Badge variant="outline" className="border-red-300 text-red-700">
                                                                Change: {update.change_magnitude > 0 ? '+' : ''}{(update.new_rate - update.current_system_rate).toFixed(2)}%
                                                            </Badge>
                                                        )}
                                                        </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                        <Button 
                                                        onClick={() => approveUpdate(update)}
                                                        disabled={loading}
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        >
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Approve
                                                        </Button>
                                                        <Button 
                                                        onClick={() => rejectUpdate(update)}
                                                        disabled={loading}
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                                        >
                                                        Reject
                                                        </Button>
                                                        </div>
                                                        </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Current Rates */}
                        <TabsContent value="current">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Current Tax Rates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {Object.entries(currentRates).map(([country, data]) => (
                                            <div key={country} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-lg">{country}</span>
                                                    <Badge variant="outline">{data.type}</Badge>
                                                </div>
                                                <div className="text-3xl font-bold text-blue-600 mb-1">{data.rate}%</div>
                                                <div className="text-xs text-slate-500">
                                                    Last updated: {data.last_updated}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Manual Update */}
                        <TabsContent value="manual">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Manual Tax Rate Update</CardTitle>
                                    <CardDescription>Override rates manually for urgent changes or unsupported sources</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 max-w-2xl">
                                        <Alert className="bg-yellow-50 border-yellow-200">
                                            <Shield className="h-4 w-4 text-yellow-600" />
                                            <AlertDescription className="text-yellow-800">
                                                Manual updates should only be applied with verified information from official government sources.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Country Code *</Label>
                                                <Input 
                                                    value={manualUpdate.country}
                                                    onChange={(e) => setManualUpdate({...manualUpdate, country: e.target.value})}
                                                    placeholder="US, FR, SA..."
                                                    maxLength={2}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Tax Type *</Label>
                                                <Select 
                                                    value={manualUpdate.tax_type}
                                                    onValueChange={(v) => setManualUpdate({...manualUpdate, tax_type: v})}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="VAT">VAT</SelectItem>
                                                        <SelectItem value="GST">GST</SelectItem>
                                                        <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                                                        <SelectItem value="Service Tax">Service Tax</SelectItem>
                                                        <SelectItem value="Withholding">Withholding Tax</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>New Rate (%) *</Label>
                                                <Input 
                                                    type="number"
                                                    value={manualUpdate.new_rate}
                                                    onChange={(e) => setManualUpdate({...manualUpdate, new_rate: e.target.value})}
                                                    placeholder="15.00"
                                                    step="0.01"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Effective Date *</Label>
                                                <Input 
                                                    type="date"
                                                    value={manualUpdate.effective_date}
                                                    onChange={(e) => setManualUpdate({...manualUpdate, effective_date: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Source/Reference *</Label>
                                            <Input 
                                                value={manualUpdate.source}
                                                onChange={(e) => setManualUpdate({...manualUpdate, source: e.target.value})}
                                                placeholder="Official gazette, government API, etc."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Notes</Label>
                                            <Textarea 
                                                value={manualUpdate.notes}
                                                onChange={(e) => setManualUpdate({...manualUpdate, notes: e.target.value})}
                                                placeholder="Additional details about this update..."
                                                rows={3}
                                            />
                                        </div>

                                        <Button 
                                            onClick={submitManualUpdate}
                                            disabled={loading || !manualUpdate.country || !manualUpdate.new_rate}
                                            className="w-full"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Apply Manual Update
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Validation & Overrides */}
                        <TabsContent value="validation" className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Validation */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Tax Rules Validation</CardTitle>
                                        <CardDescription>Check for consistency issues in tax rules</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Button onClick={validateTaxRules} disabled={loading} className="w-full">
                                            <Shield className="h-4 w-4 mr-2" />
                                            Validate All Tax Rules
                                        </Button>
                                        
                                        {validationResults.length > 0 && (
                                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                                {validationResults.map((result, idx) => (
                                                    <div key={idx} className="p-3 border rounded-lg bg-red-50">
                                                        <div className="font-bold text-red-900 mb-2">{result.country}</div>
                                                        <ul className="text-xs text-red-800 space-y-1">
                                                            {result.issues.map((issue, i) => (
                                                                <li key={i}>• {issue}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Manual Override */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Manual Rule Override</CardTitle>
                                        <CardDescription>Fine-tune specific tax rules</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Country Code</Label>
                                            <Input 
                                                value={overrideForm.country}
                                                onChange={(e) => setOverrideForm({...overrideForm, country: e.target.value.toUpperCase()})}
                                                placeholder="US, FR, SA..."
                                                maxLength={2}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label>Override Type</Label>
                                            <Select 
                                                value={overrideForm.override_type}
                                                onValueChange={(v) => setOverrideForm({...overrideForm, override_type: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="standard_rate">Standard Rate</SelectItem>
                                                    <SelectItem value="digital_services">Digital Services Rate</SelectItem>
                                                    <SelectItem value="physical_goods">Physical Goods Rate</SelectItem>
                                                    <SelectItem value="tourism_tax">Tourism Tax</SelectItem>
                                                    <SelectItem value="sez_rate">SEZ Rate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Override Value</Label>
                                            <Input 
                                                type="number"
                                                value={overrideForm.value}
                                                onChange={(e) => setOverrideForm({...overrideForm, value: e.target.value})}
                                                placeholder="15.00"
                                                step="0.01"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Reason</Label>
                                            <Textarea 
                                                value={overrideForm.reason}
                                                onChange={(e) => setOverrideForm({...overrideForm, reason: e.target.value})}
                                                placeholder="Reason for override..."
                                                rows={3}
                                            />
                                        </div>

                                        <Button 
                                            onClick={submitOverride}
                                            disabled={loading || !overrideForm.country || !overrideForm.value || !overrideForm.reason}
                                            className="w-full"
                                        >
                                            Apply Override
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Country Details */}
                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Country Tax Details ({allCountryRules.length} countries)</CardTitle>
                                    <CardDescription>View granular rules: SEZs, tourism taxes, exemptions, digital vs physical goods</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4">
                                        <Input 
                                            placeholder="Search country (code or name)..."
                                            className="max-w-md"
                                            value={countrySearch}
                                            onChange={(e) => setCountrySearch(e.target.value)}
                                        />
                                    </div>

                                    <div className="grid gap-4 max-h-[600px] overflow-y-auto">
                                        {allCountryRules
                                            .filter(country => 
                                                !countrySearch || 
                                                country.code.toLowerCase().includes(countrySearch.toLowerCase()) ||
                                                (country.name && country.name.toLowerCase().includes(countrySearch.toLowerCase()))
                                            )
                                            .map((country) => (
                                            <Card key={country.code} className="border-blue-200">
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-lg">{country.name || country.code} ({country.code})</CardTitle>
                                                            <CardDescription>{country.type} - {country.standard}% Standard Rate</CardDescription>
                                                        </div>
                                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-xs text-slate-600">Digital Services</Label>
                                                            <div className="text-sm font-medium">{country.digital_services || country.standard}%</div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-slate-600">Physical Goods</Label>
                                                            <div className="text-sm font-medium">{country.physical_goods || country.standard}%</div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-slate-600">Tourism Tax</Label>
                                                            <div className="text-sm font-medium">{country.tourism_tax ? `${country.tourism_tax}%` : 'N/A'}</div>
                                                        </div>
                                                        <div>
                                                            <Label className="text-xs text-slate-600">Reverse Charge B2B</Label>
                                                            <div className="text-sm font-medium">{country.reverse_charge_b2b ? 'Yes' : 'No'}</div>
                                                        </div>
                                                    </div>

                                                    {country.sez && country.sez.length > 0 && (
                                                        <div>
                                                            <Label className="text-xs text-slate-600 mb-2 block">Special Economic Zones (SEZ)</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {country.sez.map((zone, idx) => (
                                                                    <Badge key={idx} variant="outline">{zone}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {(country.exemptions || country.zero) && (
                                                        <div>
                                                            <Label className="text-xs text-slate-600 mb-2 block">Exemptions & Zero-Rated</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {[...(country.exemptions || []), ...(country.zero || [])].map((item, idx) => (
                                                                    <Badge key={idx} className="bg-purple-100 text-purple-800">{item}</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {country.reduced && country.reduced.length > 0 && (
                                                        <div>
                                                            <Label className="text-xs text-slate-600 mb-2 block">Reduced Rates</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {country.reduced.map((rate, idx) => (
                                                                    <Badge key={idx} className="bg-blue-100 text-blue-800">{rate}%</Badge>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Auto-Sync Schedule */}
                        <TabsContent value="schedule">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Automatic Sync Schedule</CardTitle>
                                    <CardDescription>Configure automatic tax rate synchronization</CardDescription>
                                </CardHeader>
                                <CardContent className="max-w-2xl space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="checkbox"
                                                checked={syncSchedule.sync_enabled}
                                                onChange={(e) => setSyncSchedule({...syncSchedule, sync_enabled: e.target.checked})}
                                                className="h-4 w-4"
                                            />
                                            <Label>Enable Automatic Sync</Label>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Sync Interval</Label>
                                            <Input 
                                                type="number"
                                                value={syncSchedule.sync_interval}
                                                onChange={(e) => setSyncSchedule({...syncSchedule, sync_interval: parseInt(e.target.value)})}
                                                min="1"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Time Unit</Label>
                                            <Select 
                                                value={syncSchedule.sync_unit}
                                                onValueChange={(v) => setSyncSchedule({...syncSchedule, sync_unit: v})}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hours">Hours</SelectItem>
                                                    <SelectItem value="days">Days</SelectItem>
                                                    <SelectItem value="weeks">Weeks</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Alert className="bg-blue-50 border-blue-200">
                                        <Clock className="h-4 w-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            {syncSchedule.sync_enabled ? (
                                                <>Tax rates will be automatically fetched and reviewed every {syncSchedule.sync_interval} {syncSchedule.sync_unit}. Changes will require admin approval before being applied.</>
                                            ) : (
                                                <>Automatic sync is disabled. Tax rates must be fetched manually.</>
                                            )}
                                        </AlertDescription>
                                    </Alert>

                                    <Button 
                                        onClick={updateSyncSchedule}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Save Schedule
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* History */}
                        <TabsContent value="history">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Update History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {updateHistory.length === 0 ? (
                                            <div className="text-center py-12 text-slate-500">
                                                No update history available yet.
                                            </div>
                                        ) : (
                                            updateHistory.map((log, idx) => (
                                                <div key={idx} className="p-4 border rounded-lg">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="font-bold">{log.country}</span>
                                                                <Badge>{log.source}</Badge>
                                                                <Badge className={
                                                                    log.status === 'applied' ? 'bg-green-100 text-green-800' :
                                                                    log.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }>
                                                                    {log.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-slate-600">
                                                                Rate updated to {log.new_rate}% • Effective: {log.effective_date}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                Applied by {log.applied_by} on {new Date(log.applied_at).toLocaleString()}
                                                            </p>
                                                            {log.notes && (
                                                                <p className="text-xs text-slate-600 mt-2 italic">{log.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}