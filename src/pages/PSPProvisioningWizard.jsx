import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { COUNTRIES } from '@/components/utils/countries';
import { TIMEZONES } from '@/components/utils/timezones';
import { ISO4217_CURRENCIES } from '@/components/utils/iso4217';
import { ArrowLeft, Check, Rocket, Zap, Shield, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

const tiers = [
    { id: 'starter', name: 'Starter', price: '$2,000/mo', revenue_share: 30, icon: Rocket, limits: { max_payment_providers: 1, max_merchants: 100 } },
    { id: 'professional', name: 'Professional', price: '$5,000/mo', revenue_share: 25, icon: Zap, limits: { max_payment_providers: 3, max_merchants: 1000 } },
    { id: 'enterprise', name: 'Enterprise', price: '$10,000/mo', revenue_share: 20, icon: Shield, limits: { max_payment_providers: 10, max_merchants: null } },
    { id: 'custom', name: 'Custom', price: 'Contact Us', revenue_share: 15, icon: Sparkles, limits: { max_payment_providers: null, max_merchants: null } }
];

export default function PSPProvisioningWizard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser } = usePlatformAuth();
    const [step, setStep] = useState(1);
    const [selectedTier, setSelectedTier] = useState('professional');
    const [provisioning, setProvisioning] = useState(false);
    const [provisioningComplete, setProvisioningComplete] = useState(false);
    const [formData, setFormData] = useState({
        psp_code: '',
        psp_name: '',
        legal_entity_name: '',
        contact_email: '',
        contact_phone: '',
        owner_email: '',
        country: '',
        currency: 'USD',
        timezone: 'UTC',
        domain: '',
        subdomain: '',
        branding: { primary_color: '#3b82f6', secondary_color: '#8b5cf6' },
        transaction_fees: { card_percentage: 2.9, fixed_fee: 0.30 },
        enabled_services: [],
        enabled_payment_methods: [],
        enabled_payout_methods: [],
        deployment_config: { primary_cloud: null, dr_enabled: false }
    });

    const { data: services = [] } = useQuery({
        queryKey: ['services'],
        queryFn: () => base44.entities.ServiceCatalog.list()
    });

    const { data: paymentProviders = [] } = useQuery({
        queryKey: ['payment-providers'],
        queryFn: () => base44.entities.PaymentProvider.list()
    });

    const { data: payoutRoutes = [] } = useQuery({
        queryKey: ['payout-routes'],
        queryFn: () => base44.entities.PayoutRoute.list()
    });

    const { data: connectors = [] } = useQuery({
        queryKey: ['cloud-connectors'],
        queryFn: () => base44.entities.CloudConnector.list()
    });

    const provisionMutation = useMutation({
        mutationFn: async (data) => {
            const psp = await base44.entities.ProvisionedPSP.create({
                ...data,
                status: 'provisioning'
            });
            
            await base44.entities.ApprovalRequest.create({
                request_type: 'psp_creation',
                entity_type: 'ProvisionedPSP',
                entity_id: psp.id,
                entity_data: data,
                submitted_by: platformUser?.email || 'admin@fts.money',
                submitted_by_name: platformUser?.email || 'Admin',
                priority: 'high'
            });
            
            return psp;
        },
        onSuccess: () => {
            setProvisioningComplete(true);
            queryClient.invalidateQueries(['provisioned-psps']);
            queryClient.invalidateQueries(['approval-requests']);
        }
    });

    const handleProvision = async () => {
        setProvisioning(true);
        const tier = tiers.find(t => t.id === selectedTier);
        
        const data = {
            ...formData,
            tier: selectedTier,
            pricing_model: 'revenue_share',
            revenue_share_percentage: tier.revenue_share,
            max_payment_providers: tier.limits.max_payment_providers,
            max_merchants: tier.limits.max_merchants,
            core_features: { payment_processing: true, merchant_portal: true, virtual_terminal: true, reporting: true },
            advanced_features: {},
            compliance_features: { pci_dss: true, kyb_verification: true, aml_screening: true }
        };
        
        await provisionMutation.mutateAsync(data);
        setProvisioning(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 bg-white rounded-lg p-6 border border-slate-200">
                    <button 
                        onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Platform
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 mt-4">PSP Instance Provisioning</h1>
                    <p className="text-sm text-slate-600">Infrastructure deployment and configuration</p>
                </div>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center gap-4 mb-6">
                        {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold border-2 ${
                                    step >= s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-300'
                                }`}>
                                    {step > s ? <Check className="h-5 w-5" /> : s}
                                </div>
                            </div>
                        ))}
                    </div>

                    {provisioningComplete ? (
                        <div className="text-center py-12">
                            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">PSP Submitted for Approval</h2>
                            <p className="text-slate-600 mb-6">Your request is now in the provisioning queue</p>
                            <button
                                onClick={() => navigate(createPageUrl('FTSProvisioningQueue'))}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                View Provisioning Queue
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {step === 1 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Select Service Tier</h2>
                                    <div className="grid grid-cols-4 gap-4">
                                        {tiers.map((tier) => {
                                            const Icon = tier.icon;
                                            return (
                                                <div
                                                    key={tier.id}
                                                    onClick={() => setSelectedTier(tier.id)}
                                                    className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                                                        selectedTier === tier.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <Icon className="h-8 w-8 text-blue-600 mb-2" />
                                                    <h3 className="font-semibold text-slate-900">{tier.name}</h3>
                                                    <p className="text-sm text-slate-600 mb-2">{tier.price}</p>
                                                    <p className="text-xs text-slate-500">Revenue Share: {tier.revenue_share}%</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Instance Configuration</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">PSP Code</label>
                                            <input
                                                type="text"
                                                value={formData.psp_code}
                                                onChange={(e) => setFormData({...formData, psp_code: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                placeholder="e.g., ACME001"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">PSP Name</label>
                                            <input
                                                type="text"
                                                value={formData.psp_name}
                                                onChange={(e) => setFormData({...formData, psp_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                placeholder="Acme Payments"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Legal Entity Name</label>
                                            <input
                                                type="text"
                                                value={formData.legal_entity_name}
                                                onChange={(e) => setFormData({...formData, legal_entity_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                placeholder="Acme Payments Inc."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Contact Email</label>
                                            <input
                                                type="email"
                                                value={formData.contact_email}
                                                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                placeholder="contact@acme.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Owner Email</label>
                                            <input
                                                type="email"
                                                value={formData.owner_email}
                                                onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                placeholder="owner@acme.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Country</label>
                                            <select
                                                value={formData.country}
                                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            >
                                                <option value="">Select country</option>
                                                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Select Services</h2>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {services.map((service) => (
                                            <label key={service.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.enabled_services.includes(service.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({...formData, enabled_services: [...formData.enabled_services, service.id]});
                                                        } else {
                                                            setFormData({...formData, enabled_services: formData.enabled_services.filter(id => id !== service.id)});
                                                        }
                                                    }}
                                                    className="w-4 h-4"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-900">{service.service_name}</p>
                                                    <p className="text-xs text-slate-600">{service.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Fee Structure</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Card Transaction % Fee</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={formData.transaction_fees.card_percentage}
                                                onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, card_percentage: parseFloat(e.target.value)}})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Fixed Fee ($)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.transaction_fees.fixed_fee}
                                                onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, fixed_fee: parseFloat(e.target.value)}})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Payment Providers</h2>
                                    <div className="space-y-2 max-h-96 overflow-y-auto">
                                        {paymentProviders.map((provider) => (
                                            <label key={provider.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.enabled_payment_methods.includes(provider.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({...formData, enabled_payment_methods: [...formData.enabled_payment_methods, provider.id]});
                                                        } else {
                                                            setFormData({...formData, enabled_payment_methods: formData.enabled_payment_methods.filter(id => id !== provider.id)});
                                                        }
                                                    }}
                                                    className="w-4 h-4"
                                                />
                                                <p className="font-medium text-slate-900">{provider.provider_name}</p>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 6 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Cloud Deployment</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Primary Cloud Provider</label>
                                            <select
                                                value={formData.deployment_config.primary_cloud || ''}
                                                onChange={(e) => setFormData({...formData, deployment_config: {...formData.deployment_config, primary_cloud: e.target.value}})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                            >
                                                <option value="">Select cloud provider</option>
                                                {connectors.map(c => <option key={c.id} value={c.provider_name}>{c.display_name || c.provider_name}</option>)}
                                            </select>
                                        </div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.deployment_config.dr_enabled}
                                                onChange={(e) => setFormData({...formData, deployment_config: {...formData.deployment_config, dr_enabled: e.target.checked}})}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">Enable Disaster Recovery</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {step === 7 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Review & Deploy</h2>
                                    <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                                        <p><strong>Tier:</strong> {tiers.find(t => t.id === selectedTier)?.name}</p>
                                        <p><strong>PSP Code:</strong> {formData.psp_code}</p>
                                        <p><strong>PSP Name:</strong> {formData.psp_name}</p>
                                        <p><strong>Owner Email:</strong> {formData.owner_email}</p>
                                        <p><strong>Services:</strong> {formData.enabled_services.length} selected</p>
                                        <p><strong>Payment Providers:</strong> {formData.enabled_payment_methods.length} selected</p>
                                        <p><strong>Cloud:</strong> {formData.deployment_config.primary_cloud || 'Not selected'}</p>
                                    </div>
                                    <button
                                        onClick={handleProvision}
                                        disabled={provisioning || !formData.psp_code || !formData.psp_name || !formData.owner_email}
                                        className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {provisioning ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Provisioning...
                                            </>
                                        ) : (
                                            'Submit for Approval'
                                        )}
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between pt-6 border-t border-slate-200">
                                {step > 1 && (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                                    >
                                        Back
                                    </button>
                                )}
                                {step < 7 && (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto"
                                    >
                                        Continue
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}