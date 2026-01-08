import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Zap, Plus, Edit2, Save, X } from 'lucide-react';

const SERVICES = [
  { id: 'PSP', name: 'PSP', color: 'bg-blue-100 text-blue-700' },
  { id: 'ISO_Gateway', name: 'ISO Gateway', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Orchestration', name: 'Orchestration', color: 'bg-purple-100 text-purple-700' },
  { id: 'Crypto_Banking', name: 'Crypto Banking', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'RWA_Platform', name: 'RWA Platform', color: 'bg-amber-100 text-amber-700' },
  { id: 'E_Invoicing', name: 'E-Invoicing', color: 'bg-green-100 text-green-700' },
  { id: 'ESG_Reporting', name: 'ESG Reporting', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'FIX_Score', name: 'FIX Score (Free)', color: 'bg-slate-100 text-slate-700' },
  { id: 'NANO', name: 'NANO (PSP Subsidy)', color: 'bg-orange-100 text-orange-700' }
];

export default function ServiceBillingConfiguration() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [newConfig, setNewConfig] = useState({});

  const { data: configs = [] } = useQuery({
    queryKey: ['billing-configs'],
    queryFn: () => base44.entities.ServiceBillingConfig.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServiceBillingConfig.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing-configs'] })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ServiceBillingConfig.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['billing-configs'] })
  });

  const handleSaveConfig = async (config) => {
    if (editingId) {
      await updateMutation.mutate({ id: editingId, data: config });
    } else {
      await createMutation.mutate(config);
    }
    setNewConfig({});
    setEditingId(null);
  };

  const getConfig = (serviceName) => configs.find(c => c.service_name === serviceName);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Service Billing Configuration</h1>
        <p className="text-slate-600">Configure pricing, tiers, and billing rules for each FTS.Money service</p>
      </div>

      {/* Billing Model Overview */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Billing Cascade Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-semibold text-slate-900">Platform Wholesale Pricing</p>
                <p className="text-slate-600">Base price per unit + volume discounts</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-semibold text-slate-900">PSP Markup</p>
                <p className="text-slate-600">PSP adds margin, buys services at platform pricing</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-semibold text-slate-900">Merchant Rate</p>
                <p className="text-slate-600">Merchant pays PSP marked-up price</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SERVICES.map((service) => {
          const config = getConfig(service.id);
          return (
            <Card key={service.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className={service.color}>{service.name}</Badge>
                    <p className="text-xs text-slate-600 mt-2">
                      {config ? `${config.billing_model}` : 'Not configured'}
                    </p>
                  </div>
                  <Dialog open={editingId === service.id} onOpenChange={(open) => !open && setEditingId(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(service.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Configure {service.name} Billing</DialogTitle>
                      </DialogHeader>
                      <BillingConfigForm 
                        service={service} 
                        config={config}
                        onSave={handleSaveConfig}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              {config && (
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Billing Model</span>
                      <span className="font-semibold text-slate-900">{config.billing_model}</span>
                    </div>
                    {config.base_price_per_unit && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Base Unit Price</span>
                        <span className="font-semibold text-slate-900">${config.base_price_per_unit}</span>
                      </div>
                    )}
                    {config.subscription_tiers?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Tiers</p>
                        <div className="space-y-1">
                          {config.subscription_tiers.map((tier, i) => (
                            <div key={i} className="text-xs text-slate-600">
                              <span className="font-medium">{tier.tier_name}</span> - ${tier.monthly_fee}/mo
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function BillingConfigForm({ service, config, onSave }) {
  const [form, setForm] = useState(config || {
    service_name: service.id,
    billing_model: 'hybrid',
    base_price_per_unit: 0,
    subscription_tiers: [],
    volume_discounts: [],
    cascade_markup: { psp_markup_percent: 15, merchant_markup_percent: 20 }
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-900">Billing Model</label>
        <Select value={form.billing_model} onValueChange={(v) => setForm({...form, billing_model: v})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="subscription">Subscription Only</SelectItem>
            <SelectItem value="usage_based">Usage-Based</SelectItem>
            <SelectItem value="hybrid">Subscription + Usage</SelectItem>
            <SelectItem value="free">Free</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {form.billing_model !== 'free' && (
        <>
          <div>
            <label className="text-sm font-semibold text-slate-900">Base Price Per Unit</label>
            <Input 
              type="number" 
              value={form.base_price_per_unit} 
              onChange={(e) => setForm({...form, base_price_per_unit: parseFloat(e.target.value)})}
              placeholder="e.g., 0.05"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-900">PSP Markup %</label>
            <Input 
              type="number" 
              value={form.cascade_markup?.psp_markup_percent || 15}
              onChange={(e) => setForm({
                ...form, 
                cascade_markup: {...form.cascade_markup, psp_markup_percent: parseFloat(e.target.value)}
              })}
              placeholder="15"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-900">Merchant Markup %</label>
            <Input 
              type="number" 
              value={form.cascade_markup?.merchant_markup_percent || 20}
              onChange={(e) => setForm({
                ...form, 
                cascade_markup: {...form.cascade_markup, merchant_markup_percent: parseFloat(e.target.value)}
              })}
              placeholder="20"
            />
          </div>
        </>
      )}

      <Button 
        onClick={() => onSave(form)}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Save className="h-4 w-4 mr-2" />
        Save Configuration
      </Button>
    </div>
  );
}