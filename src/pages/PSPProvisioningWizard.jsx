import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { COUNTRIES } from '@/components/utils/countries';
import { TIMEZONES } from '@/components/utils/timezones';
import { ISO4217_CURRENCIES } from '@/components/utils/iso4217';
import { ArrowLeft, Check, Rocket, Zap, Shield, Sparkles, CheckCircle2, Loader2, Building2, Mail, Phone, Globe, DollarSign, AlertCircle, Info, CreditCard, Wallet, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getPaymentMethodLogo, getPaymentMethodDisplayName } from '@/components/utils/paymentLogos';
import { cn } from "@/lib/utils";

const defaultTiers = [
    { id: 'starter', name: 'Starter', price: 2000, revenue_share: 30, icon: Rocket, limits: { max_payment_providers: 1, max_merchants: 100 } },
    { id: 'professional', name: 'Professional', price: 5000, revenue_share: 25, icon: Zap, limits: { max_payment_providers: 3, max_merchants: 1000 } },
    { id: 'enterprise', name: 'Enterprise', price: 10000, revenue_share: 20, icon: Shield, limits: { max_payment_providers: 10, max_merchants: null } },
    { id: 'custom', name: 'Custom', price: 0, revenue_share: 15, icon: Sparkles, limits: { max_payment_providers: null, max_merchants: null } }
];

const paymentMethodOptions = [
    { category: 'Cards', methods: ['visa', 'mastercard', 'amex', 'discover', 'jcb', 'diners_club', 'unionpay'] },
    { category: 'Digital Wallets', methods: ['alipay', 'wechat', 'apple_pay', 'google_pay', 'paypal', 'samsung_pay'] },
    { category: 'Bank Transfers', methods: ['ach', 'sepa', 'wire_transfer', 'faster_payments', 'bacs'] },
    { category: 'Crypto', methods: ['bitcoin', 'ethereum', 'usdt', 'usdc', 'litecoin', 'bitcoin_cash'] },
    { category: 'Local Methods', methods: ['ideal', 'sofort', 'giropay', 'bancontact', 'eps', 'p24', 'multibanco'] },
    { category: 'Buy Now Pay Later', methods: ['klarna', 'afterpay', 'affirm', 'zip', 'sezzle'] }
];

const payoutMethodOptions = [
    { category: 'Bank Transfers', methods: ['ach', 'sepa', 'wire', 'faster_payments', 'bacs', 'swift'] },
    { category: 'Cards', methods: ['visa_debit', 'mastercard_debit', 'prepaid_card'] },
    { category: 'Digital Wallets', methods: ['paypal', 'venmo', 'cash_app', 'revolut', 'wise'] },
    { category: 'Crypto', methods: ['bitcoin', 'ethereum', 'usdt', 'usdc'] },
    { category: 'Instant Payments', methods: ['push_to_card', 'real_time_payments', 'zelle'] }
];

export default function PSPProvisioningWizard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { platformUser } = usePlatformAuth();
    const [step, setStep] = useState(1);
    const [selectedTier, setSelectedTier] = useState('professional');
    const [provisioning, setProvisioning] = useState(false);
    const [provisioningComplete, setProvisioningComplete] = useState(false);
    const [customTiers, setCustomTiers] = useState(defaultTiers);
    const [editingTier, setEditingTier] = useState(null);
    const [savedProgress, setSavedProgress] = useState(null);
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
        tas_number: '',
        tas_verified: false,
        branding: { primary_color: '#3b82f6', secondary_color: '#8b5cf6', logo_url: '', favicon_url: '' },
        transaction_fees: {
            card_domestic_percentage: 2.9,
            card_domestic_fixed: 0.30,
            card_international_percentage: 3.9,
            card_international_fixed: 0.50,
            crypto_percentage: 1.5,
            crypto_fixed: 0.00,
            ach_percentage: 0.8,
            ach_fixed: 0.25,
            wire_percentage: 0.5,
            wire_fixed: 15.00,
            wallet_percentage: 2.5,
            wallet_fixed: 0.30
        },
        enabled_services: [],
        enabled_payment_methods: [],
        enabled_payout_methods: [],
        deployment_config: { primary_cloud: null, dr_cloud: null, dr_enabled: false },
        lei: '',
        vlei: '',
        lei_waived: false,
        admin_email: '',
        admin_full_name: '',
        admin_password: '',
        orchestration_features: {
            smart_routing: false,
            ai_fraud_detection: false,
            network_tokenization: false,
            account_updater: false,
            smart_retry: false,
            crypto_payments: false,
            instant_settlements: false,
            cascade_logic: false,
            load_balancing: false
        },
        compliance_features: {
            pci_dss: true,
            kyb_verification: true,
            aml_screening: true,
            fatf_compliance: true,
            lei_verification: true
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

    const handleSaveProgress = () => {
        localStorage.setItem('psp_provisioning_draft', JSON.stringify({
            step,
            formData,
            selectedTier,
            customTiers,
            savedAt: new Date().toISOString()
        }));
        setSavedProgress(new Date().toLocaleTimeString());
    };

    const handleProvision = async () => {
        setProvisioning(true);
        const tier = customTiers.find(t => t.id === selectedTier);
        
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
                    <div className="flex items-center justify-between mb-6">
                        {[
                            { num: 1, label: 'Tier' },
                            { num: 2, label: 'Business' },
                            { num: 3, label: 'Services' },
                            { num: 4, label: 'Appearance' },
                            { num: 5, label: 'Fees' },
                            { num: 6, label: 'Payments' },
                            { num: 7, label: 'Payouts' },
                            { num: 8, label: 'Regional' },
                            { num: 9, label: 'Review' }
                        ].map((s) => (
                            <div key={s.num} className="flex flex-col items-center gap-1">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold border-2 ${
                                    step >= s.num ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-300'
                                }`}>
                                    {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                                </div>
                                <span className="text-xs text-slate-600">{s.label}</span>
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
                                    <h2 className="text-xl font-semibold mb-4">Select & Configure Service Tier</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        {customTiers.map((tier) => {
                                            const Icon = tier.icon;
                                            return (
                                                <div
                                                    key={tier.id}
                                                    className={`border-2 rounded-lg p-4 transition-all ${
                                                        selectedTier === tier.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="h-8 w-8 text-blue-600" />
                                                            <h3 className="font-semibold text-slate-900">{tier.name}</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedTier(tier.id)}
                                                            className={`px-3 py-1 rounded text-sm font-medium ${
                                                                selectedTier === tier.id 
                                                                    ? 'bg-blue-600 text-white' 
                                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                        >
                                                            {selectedTier === tier.id ? 'Selected' : 'Select'}
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <div>
                                                            <label className="text-xs text-slate-600">Monthly Price ($)</label>
                                                            <input
                                                                type="number"
                                                                value={tier.price}
                                                                onChange={(e) => {
                                                                    const updated = customTiers.map(t => 
                                                                        t.id === tier.id ? {...t, price: parseFloat(e.target.value) || 0} : t
                                                                    );
                                                                    setCustomTiers(updated);
                                                                }}
                                                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-600">Revenue Share (%)</label>
                                                            <input
                                                                type="number"
                                                                value={tier.revenue_share}
                                                                onChange={(e) => {
                                                                    const updated = customTiers.map(t => 
                                                                        t.id === tier.id ? {...t, revenue_share: parseFloat(e.target.value) || 0} : t
                                                                    );
                                                                    setCustomTiers(updated);
                                                                }}
                                                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-600">Max Providers</label>
                                                            <input
                                                                type="number"
                                                                value={tier.limits.max_payment_providers || ''}
                                                                onChange={(e) => {
                                                                    const updated = customTiers.map(t => 
                                                                        t.id === tier.id ? {...t, limits: {...t.limits, max_payment_providers: e.target.value ? parseInt(e.target.value) : null}} : t
                                                                    );
                                                                    setCustomTiers(updated);
                                                                }}
                                                                placeholder="Unlimited"
                                                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-slate-600">Max Merchants</label>
                                                            <input
                                                                type="number"
                                                                value={tier.limits.max_merchants || ''}
                                                                onChange={(e) => {
                                                                    const updated = customTiers.map(t => 
                                                                        t.id === tier.id ? {...t, limits: {...t.limits, max_merchants: e.target.value ? parseInt(e.target.value) : null}} : t
                                                                    );
                                                                    setCustomTiers(updated);
                                                                }}
                                                                placeholder="Unlimited"
                                                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                                                            />
                                                        </div>
                                                    </div>
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

                                    <div className="border-t border-slate-200 pt-6 mt-6">
                                        <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-blue-600" />
                                            TAS Integration & LEI/vLEI Compliance
                                        </h3>
                                        <Alert className="mb-4 bg-blue-50 border-blue-200">
                                            <Info className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-sm text-blue-900">
                                                <strong>TAS (Third-party Attestation Service)</strong> allows pre-vetted businesses with existing LEI/vLEI and completed KYB/KYC/AML to fast-track provisioning.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">TAS Number (Optional)</label>
                                                <input
                                                    type="text"
                                                    value={formData.tas_number}
                                                    onChange={(e) => setFormData({...formData, tas_number: e.target.value})}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                    placeholder="TAS-XXXXXXXX-XXXX"
                                                />
                                                <p className="text-xs text-slate-500 mt-1">If you have a TAS certificate from an authorized provider</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">LEI (20-character)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.lei}
                                                        onChange={(e) => setFormData({...formData, lei: e.target.value.toUpperCase(), lei_waived: false})}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        placeholder="213800ABCDEFGHIJ1234"
                                                        maxLength={20}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">vLEI Credential (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={formData.vlei}
                                                        onChange={(e) => setFormData({...formData, vlei: e.target.value})}
                                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        placeholder="W3C Verifiable Credential"
                                                    />
                                                </div>
                                            </div>

                                            <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.lei_waived}
                                                    onChange={(e) => setFormData({...formData, lei_waived: e.target.checked, lei: e.target.checked ? '' : formData.lei})}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-900">Request 6-month grace period for LEI/vLEI</p>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        I don't have LEI/vLEI yet. Grant 6 months to obtain credentials (LEI, vLEI, OOR, ECR).
                                                    </p>
                                                </div>
                                            </label>

                                            {formData.lei_waived && (
                                                <Alert className="bg-amber-50 border-amber-200">
                                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                                    <AlertDescription className="text-sm text-amber-900">
                                                        Grace period activated. Deadline: {new Date(new Date().setMonth(new Date().getMonth() + 6)).toLocaleDateString()}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Platform Services</h2>
                                    
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                        {services.length > 0 && services.map((service) => (
                                            <label key={service.id} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
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
                                                    className="w-4 h-4 mt-1"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-900">{service.service_name}</p>
                                                    <p className="text-xs text-slate-600">{service.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                        
                                        <div className="border-t border-slate-200 pt-4 mt-4">
                                            <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-blue-600" />
                                                Compliance Services
                                            </h3>
                                            {Object.entries({
                                                pci_dss: 'PCI DSS Compliance',
                                                kyb_verification: 'KYB Verification',
                                                aml_screening: 'AML Screening',
                                                fatf_compliance: 'FATF Compliance',
                                                lei_verification: 'LEI Verification'
                                            }).map(([key, label]) => (
                                                <label key={key} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer mb-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.compliance_features[key]}
                                                        onChange={(e) => setFormData({...formData, compliance_features: {...formData.compliance_features, [key]: e.target.checked}})}
                                                        className="w-4 h-4 mt-1"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-900">{label}</p>
                                                        <p className="text-xs text-slate-600">Required for regulatory compliance</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                        
                                        {services.length === 0 && (
                                            <p className="text-sm text-slate-500 py-8 text-center">No platform services configured yet</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Branding & Appearance</h2>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Company Name</label>
                                                <input
                                                    value={formData.branding.company_name || formData.psp_name}
                                                    onChange={(e) => setFormData({...formData, branding: {...formData.branding, company_name: e.target.value}})}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                    placeholder="Enter company name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Logo URL</label>
                                                <input
                                                    value={formData.branding.logo_url || ''}
                                                    onChange={(e) => setFormData({...formData, branding: {...formData.branding, logo_url: e.target.value}})}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                    placeholder="https://example.com/logo.png"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Primary Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={formData.branding.primary_color || '#3b82f6'}
                                                        onChange={(e) => setFormData({...formData, branding: {...formData.branding, primary_color: e.target.value}})}
                                                        className="w-20 h-10"
                                                    />
                                                    <input
                                                        value={formData.branding.primary_color || '#3b82f6'}
                                                        onChange={(e) => setFormData({...formData, branding: {...formData.branding, primary_color: e.target.value}})}
                                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                                        placeholder="#3b82f6"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={formData.branding.secondary_color || '#8b5cf6'}
                                                        onChange={(e) => setFormData({...formData, branding: {...formData.branding, secondary_color: e.target.value}})}
                                                        className="w-20 h-10"
                                                    />
                                                    <input
                                                        value={formData.branding.secondary_color || '#8b5cf6'}
                                                        onChange={(e) => setFormData({...formData, branding: {...formData.branding, secondary_color: e.target.value}})}
                                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                                                        placeholder="#8b5cf6"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Favicon URL</label>
                                                <input
                                                    value={formData.branding.favicon_url || ''}
                                                    onChange={(e) => setFormData({...formData, branding: {...formData.branding, favicon_url: e.target.value}})}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                    placeholder="https://example.com/favicon.ico"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {step === 5 && (
                                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-blue-600" />
                                            Base Fee Structure
                                        </h2>
                                        <p className="text-sm text-slate-600 mb-4">Default transaction fees applied to all merchants in this PSP instance</p>
                                        
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">Card Payments</span>
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Domestic Card %</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.card_domestic_percentage}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, card_domestic_percentage: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Domestic Card Fixed ($)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.card_domestic_fixed}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, card_domestic_fixed: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">International Card %</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.card_international_percentage}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, card_international_percentage: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">International Card Fixed ($)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.card_international_fixed}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, card_international_fixed: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-sm">Bank Transfers</span>
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">ACH/SEPA %</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.ach_percentage}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, ach_percentage: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">ACH/SEPA Fixed ($)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.ach_fixed}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, ach_fixed: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Wire Transfer %</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.wire_percentage}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, wire_percentage: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Wire Transfer Fixed ($)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.wire_fixed}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, wire_fixed: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">Digital Wallets & Crypto</span>
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Digital Wallet %</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.wallet_percentage}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, wallet_percentage: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Digital Wallet Fixed ($)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.wallet_fixed}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, wallet_fixed: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Cryptocurrency %</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.crypto_percentage}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, crypto_percentage: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium mb-1">Cryptocurrency Fixed ($)</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={formData.transaction_fees.crypto_fixed}
                                                            onChange={(e) => setFormData({...formData, transaction_fees: {...formData.transaction_fees, crypto_fixed: parseFloat(e.target.value)}})}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                                        <h3 className="font-semibold text-slate-900 mb-3">Volume-Based Fee Tiers</h3>
                                        <p className="text-sm text-slate-600 mb-4">Automatic fee reductions based on merchant transaction volume</p>
                                        <div className="space-y-3">
                                            {[
                                                { min: 0, max: 100000, discount: 0, label: 'Base Tier (Standard rates)' },
                                                { min: 100000, max: 1000000, discount: 0.2, label: 'Volume Tier 1 (-0.2% discount)' },
                                                { min: 1000000, max: null, discount: 0.5, label: 'Volume Tier 2 (-0.5% discount)' }
                                            ].map((tier, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-sm">${(tier.min / 1000).toFixed(0)}k - {tier.max ? `$${(tier.max / 1000).toFixed(0)}k` : '∞'} monthly volume</p>
                                                        <p className="text-xs text-slate-600">{tier.label}</p>
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">{tier.discount}% discount</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                                        <h3 className="font-semibold text-slate-900 mb-3">Currency-Specific Fees</h3>
                                        <p className="text-sm text-slate-600 mb-4">Override base fees for specific currencies</p>
                                        <div className="space-y-4">
                                            {['USD', 'EUR', 'GBP', 'SGD', 'HKD'].map((currency) => (
                                                <div key={currency} className="grid grid-cols-3 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-semibold">{currency}</span>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs mb-1">Percentage (%)</label>
                                                        <input type="number" step="0.01" placeholder="2.9" className="w-full px-2 py-1 text-sm border border-slate-300 rounded" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs mb-1">Fixed Fee</label>
                                                        <input type="number" step="0.01" placeholder="0.30" className="w-full px-2 py-1 text-sm border border-slate-300 rounded" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                                        <h3 className="font-semibold text-slate-900 mb-3">Additional Fee Types</h3>
                                        <p className="text-sm text-slate-600 mb-4">Enable/disable specific fee types for this PSP instance</p>
                                        <div className="space-y-3">
                                            {[
                                                { id: 'chargeback', name: 'Chargeback Fees', description: 'Fee charged when a chargeback occurs', defaultAmount: 15 },
                                                { id: 'refund', name: 'Refund Processing Fees', description: 'Fee for processing refunds', defaultAmount: 0.50 },
                                                { id: 'monthly_minimum', name: 'Monthly Minimum Fee', description: 'Minimum monthly fee charged to merchants', defaultAmount: 25 },
                                                { id: 'retrieval', name: 'Retrieval Request Fee', description: 'Fee for dispute retrieval requests', defaultAmount: 10 },
                                                { id: 'batch', name: 'Batch Processing Fee', description: 'Fee per batch settlement', defaultAmount: 0.25 }
                                            ].map((feeType) => (
                                                <div key={feeType.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <input type="checkbox" className="w-4 h-4" />
                                                        <div>
                                                            <p className="font-medium text-sm">{feeType.name}</p>
                                                            <p className="text-xs text-slate-600">{feeType.description}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input type="number" step="0.01" placeholder={feeType.defaultAmount.toString()} className="w-24 px-2 py-1 text-sm border border-slate-300 rounded" />
                                                        <span className="text-sm text-slate-600">{feeType.id === 'refund' || feeType.id === 'batch' ? 'per txn' : 'USD'}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 6 && (
                                <div className="bg-white border border-slate-200 rounded-lg p-6">
                                    <h2 className="text-xl font-semibold mb-2">Payment Methods</h2>
                                    <p className="text-sm text-slate-600 mb-4">Enable payment methods for this PSP instance</p>
                                    
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                        {['visa', 'mastercard', 'amex', 'discover', 'unionpay', 'diners_club', 'jcb', 'alipay', 'wechat', 'apple_pay', 'google_pay', 'paypal', 'ach', 'sepa', 'faster_payments', 'bitcoin', 'ethereum', 'usdt', 'usdc', 'bitcoin_cash', 'litecoin', 'ideal', 'sofort', 'giropay', 'bancontact', 'multibanco', 'p24', 'eps', 'sezzle', 'afterpay'].map((method) => {
                                            const isEnabled = formData.enabled_payment_methods?.includes(method);
                                            const displayName = getPaymentMethodDisplayName(method);
                                            const logoUrl = getPaymentMethodLogo(method);
                                            return (
                                                <div 
                                                    key={method} 
                                                    className={cn(
                                                        "flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer",
                                                        isEnabled 
                                                            ? "border-blue-500 bg-blue-50" 
                                                            : "border-slate-200 hover:border-blue-300"
                                                    )}
                                                    onClick={() => {
                                                        const methods = isEnabled
                                                            ? formData.enabled_payment_methods.filter(m => m !== method)
                                                            : [...(formData.enabled_payment_methods || []), method];
                                                        setFormData({...formData, enabled_payment_methods: methods});
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-10 rounded flex items-center justify-center bg-white border border-slate-200 p-1">
                                                            {logoUrl ? (
                                                                <img src={logoUrl} alt={displayName} className="max-w-full max-h-full object-contain" />
                                                            ) : (
                                                                <CreditCard className="h-5 w-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <p className="font-medium text-slate-900">{displayName}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {isEnabled && <Badge className="bg-emerald-600">Enabled</Badge>}
                                                        <div className={cn(
                                                            "w-6 h-6 rounded border-2 flex items-center justify-center",
                                                            isEnabled ? "bg-blue-600 border-blue-600" : "border-slate-300"
                                                        )}>
                                                            {isEnabled && <Check className="h-4 w-4 text-white" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {step === 7 && (
                                <div className="bg-white border border-slate-200 rounded-lg p-6">
                                    <h2 className="text-xl font-semibold mb-2">Payout Route Configuration</h2>
                                    <p className="text-sm text-slate-600 mb-4">Enable payout routes for merchant settlements</p>
                                    
                                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                        {['sepa', 'wire', 'visa_debit', 'mastercard_debit', 'cash_app', 'venmo', 'paypal', 'ethereum', 'usdt', 'usdc', 'bitcoin', 'real_time_payments', 'push_to_card'].map((method) => {
                                            const isEnabled = formData.enabled_payout_methods?.includes(method);
                                            const displayName = getPaymentMethodDisplayName(method);
                                            const logoUrl = getPaymentMethodLogo(method);
                                            return (
                                                <div 
                                                    key={method} 
                                                    className={cn(
                                                        "flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer",
                                                        isEnabled ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"
                                                    )}
                                                    onClick={() => {
                                                        const methods = isEnabled
                                                            ? formData.enabled_payout_methods.filter(m => m !== method)
                                                            : [...(formData.enabled_payout_methods || []), method];
                                                        setFormData({...formData, enabled_payout_methods: methods});
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-10 rounded flex items-center justify-center bg-white border border-slate-200 p-1">
                                                            {logoUrl ? (
                                                                <img src={logoUrl} alt={displayName} className="max-w-full max-h-full object-contain" />
                                                            ) : (
                                                                <Wallet className="h-5 w-5 text-slate-400" />
                                                            )}
                                                        </div>
                                                        <p className="font-medium text-slate-900">{displayName}</p>
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded border-2 flex items-center justify-center",
                                                        isEnabled ? "bg-emerald-600 border-emerald-600" : "border-slate-300"
                                                    )}>
                                                        {isEnabled && <Check className="h-4 w-4 text-white" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {step === 8 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Regional Settings</h2>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Default Currency (ISO 4217)</label>
                                                <select
                                                    value={formData.currency}
                                                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                >
                                                    {ISO4217_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Timezone</label>
                                                <select
                                                    value={formData.timezone}
                                                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                >
                                                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Operating Region</label>
                                                <select
                                                    value={formData.country}
                                                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                                >
                                                    <option value="">Select country</option>
                                                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Language</label>
                                                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                                    <option value="en">English</option>
                                                    <option value="zh">Chinese</option>
                                                    <option value="es">Spanish</option>
                                                    <option value="fr">French</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {step === 9 && (
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Review, Admin Setup & Cloud Deployment</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                                                <Zap className="h-5 w-5 text-blue-600" />
                                                Payment Orchestration Features
                                            </h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries({
                                                    smart_routing: 'Smart Payment Routing',
                                                    cascade_logic: 'Cascade Logic',
                                                    load_balancing: 'Load Balancing',
                                                    smart_retry: 'Smart Retry Logic',
                                                    ai_fraud_detection: 'AI Fraud Detection',
                                                    network_tokenization: 'Network Tokenization',
                                                    account_updater: 'Account Updater',
                                                    crypto_payments: 'Crypto Payments',
                                                    instant_settlements: 'Instant Settlements'
                                                }).map(([key, label]) => (
                                                    <label key={key} className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.orchestration_features[key]}
                                                            onChange={(e) => setFormData({...formData, orchestration_features: {...formData.orchestration_features, [key]: e.target.checked}})}
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

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                                                <Shield className="h-5 w-5" />
                                                Create Admin Account
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-blue-900">Admin Email *</label>
                                                    <input
                                                        type="email"
                                                        value={formData.admin_email}
                                                        onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                                                        placeholder="admin@yourpsp.com"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-1 text-blue-900">Full Name *</label>
                                                    <input
                                                        type="text"
                                                        value={formData.admin_full_name}
                                                        onChange={(e) => setFormData({...formData, admin_full_name: e.target.value})}
                                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                                                        placeholder="John Doe"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-medium mb-1 text-blue-900">Initial Password *</label>
                                                    <input
                                                        type="password"
                                                        value={formData.admin_password}
                                                        onChange={(e) => setFormData({...formData, admin_password: e.target.value})}
                                                        className="w-full px-3 py-2 border border-blue-300 rounded-lg"
                                                        placeholder="Strong password (min 8 characters)"
                                                        required
                                                        minLength={8}
                                                    />
                                                    <p className="text-xs text-blue-700 mt-1">Admin will be prompted to change password on first login</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-200 pt-6">
                                            <h3 className="font-medium text-slate-900 mb-3">Configuration Review</h3>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Service Tier</p>
                                                    <p className="font-semibold text-slate-900">{customTiers.find(t => t.id === selectedTier)?.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 mb-1">Revenue Share</p>
                                                    <p className="font-semibold text-slate-900">{customTiers.find(t => t.id === selectedTier)?.revenue_share}%</p>
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
                                                    <span>{Object.values(formData.orchestration_features).filter(Boolean).length} Orchestration Features</span>
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

                                        </div>

                                        <button
                                            onClick={handleProvision}
                                            disabled={provisioning || !formData.psp_code || !formData.psp_name || !formData.owner_email || !formData.admin_email || !formData.admin_password}
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
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                                <div className="flex items-center gap-3">
                                    {step > 1 && (
                                        <button
                                            onClick={() => setStep(step - 1)}
                                            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        onClick={handleSaveProgress}
                                        className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50"
                                    >
                                        Save Progress
                                    </button>
                                    {savedProgress && (
                                        <span className="text-xs text-green-600">Saved at {savedProgress}</span>
                                    )}
                                </div>
                                {step < 9 && (
                                    <button
                                        onClick={() => setStep(step + 1)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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