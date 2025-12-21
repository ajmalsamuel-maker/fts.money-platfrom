import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { COUNTRIES } from '@/components/utils/countries';
import { TIMEZONES } from '@/components/utils/timezones';
import { ISO4217_CURRENCIES } from '@/components/utils/iso4217';
import { ArrowLeft, Check, Rocket, Zap, Shield, Sparkles, CheckCircle2, Loader2, Building2, Mail, Phone, Globe, DollarSign, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        license_type: 'full_license',
        branding: { primary_color: '#3b82f6', secondary_color: '#8b5cf6', logo_url: '', favicon_url: '' },
        transaction_fees: { card_percentage: 2.9, fixed_fee: 0.30, international_percentage: 3.9, crypto_percentage: 1.5 },
        enabled_services: [],
        enabled_payment_methods: [],
        enabled_payout_methods: [],
        deployment_config: { primary_cloud: null, dr_cloud: null, dr_enabled: false },
        lei: '',
        lei_waived: false,
        advanced_features: {
            smart_routing: false,
            ai_fraud_detection: false,
            network_tokenization: false,
            account_updater: false,
            smart_retry: false,
            crypto_payments: false,
            instant_settlements: false
        }
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
        
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        
        const data = {
            ...formData,
            tier: selectedTier,
            pricing_model: 'revenue_share',
            revenue_share_percentage: tier.revenue_share,
            max_payment_providers: tier.limits.max_payment_providers,
            max_merchants: tier.limits.max_merchants,
            core_features: { payment_processing: true, merchant_portal: true, virtual_terminal: true, reporting: true },
            compliance_features: { pci_dss: true, kyb_verification: true, aml_screening: true, fatf_compliance: true, lei_verification: !formData.lei_waived },
            lei_status: formData.lei ? 'pending_verification' : 'not_required',
            lei_grace_period_end: formData.lei_waived ? sixMonthsFromNow.toISOString().split('T')[0] : null,
            vlei_grace_period_end: sixMonthsFromNow.toISOString().split('T')[0],
            oor_grace_period_end: sixMonthsFromNow.toISOString().split('T')[0],
            ecr_grace_period_end: sixMonthsFromNow.toISOString().split('T')[0]
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
                                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        Business Information
                                    </h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">PSP Code *</label>
                                            <input
                                                type="text"
                                                value={formData.psp_code}
                                                onChange={(e) => setFormData({...formData, psp_code: e.target.value.toUpperCase()})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., ACME001"
                                                required
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Unique identifier for your PSP</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">PSP Business Name *</label>
                                            <input
                                                type="text"
                                                value={formData.psp_name}
                                                onChange={(e) => setFormData({...formData, psp_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Acme Payments"
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium mb-1 text-slate-700">Legal Entity Name *</label>
                                            <input
                                                type="text"
                                                value={formData.legal_entity_name}
                                                onChange={(e) => setFormData({...formData, legal_entity_name: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Acme Payments Inc."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700 flex items-center gap-1">
                                                <Mail className="h-4 w-4" />
                                                Contact Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.contact_email}
                                                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="contact@acme.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">
                                                <Phone className="h-4 w-4 inline mr-1" />
                                                Contact Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.contact_phone}
                                                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">Owner Email *</label>
                                            <input
                                                type="email"
                                                value={formData.owner_email}
                                                onChange={(e) => setFormData({...formData, owner_email: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="owner@acme.com"
                                                required
                                            />
                                            <p className="text-xs text-slate-500 mt-1">Admin account will be created</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">License Type</label>
                                            <select
                                                value={formData.license_type}
                                                onChange={(e) => setFormData({...formData, license_type: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="full_license">Full License</option>
                                                <option value="agent_model">Agent Model</option>
                                                <option value="payfac">PayFac</option>
                                                <option value="iso">ISO</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">
                                                <Globe className="h-4 w-4 inline mr-1" />
                                                Country *
                                            </label>
                                            <select
                                                value={formData.country}
                                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select country</option>
                                                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">Currency</label>
                                            <select
                                                value={formData.currency}
                                                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {ISO4217_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">Timezone</label>
                                            <select
                                                value={formData.timezone}
                                                onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">Custom Domain (Optional)</label>
                                            <input
                                                type="text"
                                                value={formData.domain}
                                                onChange={(e) => setFormData({...formData, domain: e.target.value})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="payments.acme.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1 text-slate-700">FTS Subdomain</label>
                                            <input
                                                type="text"
                                                value={formData.subdomain}
                                                onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase()})}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="acme"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">{formData.subdomain || 'yourname'}.fts.money</p>
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
                                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-blue-600" />
                                        Fee Structure & LEI Compliance
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-medium text-slate-900 mb-3">Transaction Fees</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Card Transaction %</label>
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
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">International %</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={formData.transaction_fees.international_percentage}
                                                        onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, international_percentage: parseFloat(e.target.value)}})}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">Crypto %</label>
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        value={formData.transaction_fees.crypto_percentage}
                                                        onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, crypto_percentage: parseFloat(e.target.value)}})}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 pt-6">
                                            <h3 className="font-medium text-slate-900 mb-3">LEI/vLEI Compliance</h3>
                                            <Alert className="mb-4 bg-blue-50 border-blue-200">
                                                <Info className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-sm text-blue-900">
                                                    <strong>Legal Entity Identifier (LEI)</strong> is required for payment institutions under FATF and regulatory standards. 
                                                    You can obtain it later during a 6-month grace period.
                                                </AlertDescription>
                                            </Alert>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">LEI (20-character code)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.lei}
                                                        onChange={(e) => setFormData({...formData, lei: e.target.value.toUpperCase(), lei_waived: false})}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        placeholder="213800ABCDEFGHIJ1234"
                                                        maxLength={20}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">If available, enter your GLEIF-issued LEI</p>
                                                </div>

                                                <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.lei_waived}
                                                        onChange={(e) => setFormData({...formData, lei_waived: e.target.checked, lei: e.target.checked ? '' : formData.lei})}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-900">Request 6-month grace period</p>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            I don't have an LEI yet. Grant me 6 months to obtain LEI and vLEI credentials. 
                                                            Platform will assist with GLEIF registration during this period.
                                                        </p>
                                                    </div>
                                                </label>

                                                {formData.lei_waived && (
                                                    <Alert className="bg-amber-50 border-amber-200">
                                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                                        <AlertDescription className="text-sm text-amber-900">
                                                            <strong>Grace Period Activated:</strong> You must obtain LEI within 6 months from provisioning. 
                                                            vLEI, OOR, and ECR credentials will also be required within this timeframe.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
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
                                    <h2 className="text-xl font-semibold mb-4">Advanced Features & Cloud Deployment</h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-medium text-slate-900 mb-3">Advanced Features</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries({
                                                    smart_routing: 'Smart Payment Routing',
                                                    ai_fraud_detection: 'AI Fraud Detection',
                                                    network_tokenization: 'Network Tokenization',
                                                    account_updater: 'Account Updater',
                                                    smart_retry: 'Smart Retry Logic',
                                                    crypto_payments: 'Crypto Payments',
                                                    instant_settlements: 'Instant Settlements'
                                                }).map(([key, label]) => (
                                                    <label key={key} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.advanced_features[key]}
                                                            onChange={(e) => setFormData({...formData, advanced_features: {...formData.advanced_features, [key]: e.target.checked}})}
                                                        />
                                                        <span className="text-sm">{label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 pt-6">
                                            <h3 className="font-medium text-slate-900 mb-3">Cloud Deployment</h3>
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
                                                
                                                <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.deployment_config.dr_enabled}
                                                        onChange={(e) => setFormData({...formData, deployment_config: {...formData.deployment_config, dr_enabled: e.target.checked}})}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-900">Enable Disaster Recovery</p>
                                                        <p className="text-sm text-slate-600 mt-1">Multi-region deployment for high availability and business continuity</p>
                                                    </div>
                                                </label>

                                                {formData.deployment_config.dr_enabled && (
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">DR Cloud Provider</label>
                                                        <select
                                                            value={formData.deployment_config.dr_cloud || ''}
                                                            onChange={(e) => setFormData({...formData, deployment_config: {...formData.deployment_config, dr_cloud: e.target.value}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        >
                                                            <option value="">Select DR provider</option>
                                                            {connectors.filter(c => c.provider_name !== formData.deployment_config.primary_cloud).map(c => (
                                                                <option key={c.id} value={c.provider_name}>{c.display_name || c.provider_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 7 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Review & Deploy</h2>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Service Tier</p>
                                                    <p className="font-semibold text-slate-900">{tiers.find(t => t.id === selectedTier)?.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Revenue Share</p>
                                                    <p className="font-semibold text-slate-900">{tiers.find(t => t.id === selectedTier)?.revenue_share}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">PSP Code</p>
                                                    <p className="font-semibold text-slate-900">{formData.psp_code || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Business Name</p>
                                                    <p className="font-semibold text-slate-900">{formData.psp_name || 'Not set'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Country</p>
                                                    <p className="font-semibold text-slate-900">{COUNTRIES.find(c => c.code === formData.country)?.name || 'Not selected'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">License Type</p>
                                                    <p className="font-semibold text-slate-900">{formData.license_type.replace('_', ' ').toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                                            <h3 className="font-medium text-slate-900 mb-2">Configuration Summary</h3>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span>{formData.enabled_services.length} Services</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span>{formData.enabled_payment_methods.length} Payment Providers</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span>{Object.values(formData.advanced_features).filter(Boolean).length} Advanced Features</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                    <span>Cloud: {formData.deployment_config.primary_cloud || 'Not selected'}</span>
                                                </div>
                                                {formData.deployment_config.dr_enabled && (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        <span>DR Enabled</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h3 className="font-medium text-blue-900 mb-2">LEI/vLEI Compliance Status</h3>
                                            {formData.lei ? (
                                                <p className="text-sm text-blue-800">✓ LEI Provided: {formData.lei}</p>
                                            ) : formData.lei_waived ? (
                                                <div className="text-sm text-blue-800">
                                                    <p className="font-medium">⏱ 6-Month Grace Period Activated</p>
                                                    <p className="mt-1">You must obtain LEI, vLEI, OOR, and ECR credentials within 6 months from provisioning.</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-blue-800">⚠ LEI not provided - compliance check will be required</p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleProvision}
                                        disabled={provisioning || !formData.psp_code || !formData.psp_name || !formData.owner_email}
                                        className="w-full mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                                    >
                                        {provisioning ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Submitting for Approval...
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="h-5 w-5" />
                                                Submit PSP for Approval
                                            </>
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