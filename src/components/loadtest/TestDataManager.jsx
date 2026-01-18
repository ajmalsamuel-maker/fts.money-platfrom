import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Database, Plus, Trash2, Download, Sparkles, Tag } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

export default function TestDataManager({ pspCode, onSelectDataset }) {
    const queryClient = useQueryClient();
    const [newDataset, setNewDataset] = useState({
        dataset_name: '',
        dataset_type: 'cards',
        record_count: 10,
        purge_after_test: true
    });
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: datasets = [] } = useQuery({
        queryKey: ['testDataSets', pspCode],
        queryFn: async () => {
            if (!pspCode) return [];
            return await base44.entities.TestDataSet.filter({ psp_code: pspCode });
        },
        enabled: !!pspCode
    });

    const generateSyntheticData = (type, count) => {
        switch (type) {
            case 'cards':
                return Array.from({ length: count }, (_, i) => ({
                    card_number: `4${Math.floor(Math.random() * 1e15).toString().padStart(15, '0')}`,
                    card_brand: ['visa', 'mastercard', 'amex'][Math.floor(Math.random() * 3)],
                    cvv: Math.floor(Math.random() * 900 + 100).toString(),
                    expiry: `${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}/2${Math.floor(Math.random() * 6 + 5)}`,
                    cardholder_name: `Test User ${i + 1}`
                }));
            case 'customers':
                return Array.from({ length: count }, (_, i) => ({
                    email: `test.customer${i + 1}@loadtest.com`,
                    name: `Test Customer ${i + 1}`,
                    phone: `+1${Math.floor(Math.random() * 1e10).toString().padStart(10, '0')}`,
                    country: ['US', 'GB', 'CA', 'DE'][Math.floor(Math.random() * 4)]
                }));
            case 'merchants':
                return Array.from({ length: count }, (_, i) => ({
                    merchant_code: `TEST_MERCH_${i + 1}`,
                    business_name: `Test Business ${i + 1}`,
                    mcc: ['5411', '5812', '5999'][Math.floor(Math.random() * 3)],
                    currency: 'USD'
                }));
            default:
                return [];
        }
    };

    const createMutation = useMutation({
        mutationFn: async () => {
            const syntheticData = generateSyntheticData(newDataset.dataset_type, newDataset.record_count);
            return await base44.entities.TestDataSet.create({
                psp_code: pspCode,
                dataset_name: newDataset.dataset_name,
                dataset_type: newDataset.dataset_type,
                data: syntheticData,
                is_synthetic: true,
                purge_after_test: newDataset.purge_after_test,
                tags: [`auto-generated`, newDataset.dataset_type]
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['testDataSets']);
            setDialogOpen(false);
            setNewDataset({ dataset_name: '', dataset_type: 'cards', record_count: 10, purge_after_test: true });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.TestDataSet.delete(id),
        onSuccess: () => queryClient.invalidateQueries(['testDataSets'])
    });

    const exportDataset = (dataset) => {
        const dataStr = JSON.stringify(dataset.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataset.dataset_name}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Test Data Manager
                    </CardTitle>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Dataset
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Generate Synthetic Test Data</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Dataset Name</Label>
                                    <Input 
                                        value={newDataset.dataset_name}
                                        onChange={(e) => setNewDataset({...newDataset, dataset_name: e.target.value})}
                                        placeholder="e.g., Visa Test Cards"
                                    />
                                </div>
                                <div>
                                    <Label>Data Type</Label>
                                    <Select value={newDataset.dataset_type} onValueChange={(v) => setNewDataset({...newDataset, dataset_type: v})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cards">Card Data</SelectItem>
                                            <SelectItem value="customers">Customer Profiles</SelectItem>
                                            <SelectItem value="merchants">Merchant Configs</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Record Count</Label>
                                    <Input 
                                        type="number"
                                        value={newDataset.record_count}
                                        onChange={(e) => setNewDataset({...newDataset, record_count: parseInt(e.target.value)})}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Auto-purge after test</Label>
                                    <Switch 
                                        checked={newDataset.purge_after_test}
                                        onCheckedChange={(v) => setNewDataset({...newDataset, purge_after_test: v})}
                                    />
                                </div>
                                <Button onClick={() => createMutation.mutate()} className="w-full" disabled={!newDataset.dataset_name}>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate Dataset
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {datasets.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">No test datasets yet</p>
                    ) : (
                        datasets.map((dataset) => (
                            <div key={dataset.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{dataset.dataset_name}</span>
                                        <Badge variant="outline">{dataset.dataset_type}</Badge>
                                        {dataset.is_synthetic && <Badge variant="secondary">Synthetic</Badge>}
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        {dataset.data.length} records · Used {dataset.usage_count || 0} times
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => onSelectDataset && onSelectDataset(dataset)}>
                                        Use
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => exportDataset(dataset)}>
                                        <Download className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(dataset.id)}>
                                        <Trash2 className="h-3 w-3 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}