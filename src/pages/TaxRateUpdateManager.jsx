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

    const applyUpdate = async (update) => {
        setLoading(true);
        try {
            await base44.functions.invoke('updateGlobalTaxRates', {
                action: 'apply_update',
                ...update
            });
            await fetchUpdates();
            await fetchHistory();
            alert('Tax rate updated successfully!');
        } catch (error) {
            alert('Failed to apply update: ' + error.message);
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
                        <TabsList>
                            <TabsTrigger value="updates">Available Updates ({updates.length})</TabsTrigger>
                            <TabsTrigger value="current">Current Rates</TabsTrigger>
                            <TabsTrigger value="manual">Manual Update</TabsTrigger>
                            <TabsTrigger value="history">History ({updateHistory.length})</TabsTrigger>
                        </TabsList>

                        {/* Available Updates */}
                        <TabsContent value="updates" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tax Rate Updates from External Providers</CardTitle>
                                    <CardDescription>Review and apply updates from Avalara, TaxJar, OECD, and EU VIES</CardDescription>
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
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        onClick={() => applyUpdate(update)}
                                                        disabled={loading}
                                                        size="sm"
                                                    >
                                                        Apply Update
                                                    </Button>
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