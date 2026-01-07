import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ValuationUpdateDialog({ asset, open, onClose }) {
    const [newValue, setNewValue] = useState(asset?.current_value || '');
    const [notes, setNotes] = useState('');
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationFn: (data) => base44.entities.RWAAsset.update(asset.id, data),
        onSuccess: () => {
            toast.success('Valuation updated successfully!');
            queryClient.invalidateQueries(['my-assets']);
            onClose();
        }
    });

    const handleUpdate = () => {
        if (!newValue) {
            toast.error('Please enter a new valuation');
            return;
        }

        updateMutation.mutate({
            current_value: parseFloat(newValue),
            last_valuation_date: new Date().toISOString()
        });
    };

    if (!asset) return null;

    const oldValue = asset.current_value;
    const change = newValue ? ((parseFloat(newValue) - oldValue) / oldValue) * 100 : 0;
    const isIncrease = change > 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Asset Valuation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-slate-600">Asset</p>
                        <p className="font-semibold">{asset.name} ({asset.symbol})</p>
                    </div>

                    <div>
                        <p className="text-sm text-slate-600">Current Valuation</p>
                        <p className="text-2xl font-bold">${oldValue.toLocaleString()}</p>
                        {asset.last_valuation_date && (
                            <p className="text-xs text-slate-500">
                                Last updated: {new Date(asset.last_valuation_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label>New Valuation (USD)</Label>
                        <Input
                            type="number"
                            placeholder="Enter new valuation"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Notes (Optional)</Label>
                        <Textarea
                            placeholder="Reason for revaluation (e.g., new appraisal, market conditions)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {newValue && parseFloat(newValue) !== oldValue && (
                        <div className={`p-3 rounded-lg ${isIncrease ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Valuation Change:</span>
                                <span className={`flex items-center gap-1 font-bold ${isIncrease ? 'text-green-700' : 'text-red-700'}`}>
                                    {isIncrease ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    {Math.abs(change).toFixed(2)}%
                                </span>
                            </div>
                            <div className="text-sm mt-1">
                                <span className="text-slate-600">New value: </span>
                                <span className="font-semibold">${parseFloat(newValue).toLocaleString()}</span>
                            </div>
                        </div>
                    )}

                    <Button 
                        className="w-full" 
                        onClick={handleUpdate}
                        disabled={updateMutation.isPending || !newValue}
                    >
                        {updateMutation.isPending ? 'Updating...' : 'Update Valuation'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}