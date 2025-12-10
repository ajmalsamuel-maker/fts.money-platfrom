import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
    Building2, 
    FileText, 
    Shield, 
    Wallet,
    CheckCircle,
    AlertCircle,
    Landmark,
    Bitcoin,
    Globe,
    ArrowRight,
    ArrowLeft
} from 'lucide-react';
import { ISO4217_CURRENCIES } from '../utils/iso4217';
import { getAllCountries } from '../utils/countries';
import { validateISO9362, validateIBANFormat, validateCurrency, validateCountry } from '../utils/isoValidator';
import { BLOCKCHAIN_NETWORKS } from '../utils/iso23257';
import { getCryptoInfo } from '../utils/cryptoRegistry';

const INSTITUTION_TYPES = [
    { value: 'traditional_bank', label: 'Traditional Bank', icon: Landmark },
    { value: 'crypto_exchange', label: 'Licensed Crypto Exchange', icon: Bitcoin },
    { value: 'payment_institution', label: 'Payment Institution', icon: Building2 },
    { value: 'e_money_institution', label: 'E-Money Institution', icon: Wallet },
];

const STEPS = [
    { id: 'institution', label: 'Institution Details', icon: Building2 },
    { id: 'compliance', label: 'Compliance & Licensing', icon: Shield },
    { id: 'banking', label: 'Banking/Wallet Details', icon: Wallet },
    { id: 'configuration', label: 'Configuration', icon: FileText },
    { id: 'review', label: 'Review & Submit', icon: CheckCircle },
];

export default function BankMIDOnboardingWizard({ onSubmit, onCancel, initialData = {} }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        institution_type: 'traditional_bank',
        bank_mid_id: '',
        bank_mid_name: '',
        legal_entity_name: '',
        lei: '',
        country: '',
        currency: 'USD',
        supported_currencies: ['USD'],
        bic_swift: '',
        iban: '',
        license_number: '',
        licensing_authority: '',
        license_jurisdiction: '',
        crypto_license_types: [],
        bank_account_number: '',
        crypto_wallet_address: '',
        crypto_wallet_network: '',
        branch_name: '',
        routing_number: '',
        sort_code: '',
        supported_card_types: ['visa', 'mastercard'],
        supported_crypto_assets: [],
        supported_blockchain_networks: [],
        connector_type: 'standard',
        account_type: 'ecomm',
        settlement_cycle: 'T+1',
        kyc_aml_compliant: false,
        pci_dss_compliant: false,
        iso_20022_compliant: false,
        iso_8583_compliant: false,
        ...initialData
    });

    const [validations, setValidations] = useState({});

    const countries = getAllCountries();
    const currencies = ISO4217_CURRENCIES;

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateCurrentStep = () => {
        const errors = {};
        
        if (currentStep === 0) {
            if (!formData.bank_mid_id) errors.bank_mid_id = 'Required';
            if (!formData.bank_mid_name) errors.bank_mid_name = 'Required';
            if (!formData.legal_entity_name) errors.legal_entity_name = 'Required';
            if (!formData.country) errors.country = 'Required';
            const countryValidation = validateCountry(formData.country);
            if (formData.country && !countryValidation.valid) errors.country = 'Invalid ISO 3166-1 country code';
            const currencyValidation = validateCurrency(formData.currency);
            if (!currencyValidation.valid) errors.currency = 'Invalid ISO 4217 currency code';
        }
        
        if (currentStep === 1) {
            if (!formData.license_number) errors.license_number = 'Required';
            if (!formData.licensing_authority) errors.licensing_authority = 'Required';
            if (formData.bic_swift) {
                const bicValidation = validateISO9362(formData.bic_swift);
                if (!bicValidation.valid) errors.bic_swift = 'Invalid ISO 9362 BIC/SWIFT code';
            }
            if (formData.iban) {
                const ibanValidation = validateIBANFormat(formData.iban);
                if (!ibanValidation.valid) errors.iban = 'Invalid ISO 13616 IBAN';
            }
        }

        if (currentStep === 2) {
            if (formData.institution_type === 'traditional_bank') {
                if (!formData.bank_account_number) errors.bank_account_number = 'Required for banks';
            }
            if (formData.institution_type === 'crypto_exchange') {
                if (!formData.crypto_wallet_address) errors.crypto_wallet_address = 'Required for crypto exchanges';
                if (!formData.crypto_wallet_network) errors.crypto_wallet_network = 'Required for crypto exchanges';
            }
        }

        setValidations(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = () => {
        if (validateCurrentStep()) {
            onSubmit(formData);
        }
    };

    const isCrypto = formData.institution_type === 'crypto_exchange';

    return (
        <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between mb-8">
                {STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isActive = idx === currentStep;
                    const isCompleted = idx < currentStep;
                    return (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex flex-col items-center ${idx !== 0 ? 'ml-4' : ''}`}>
                                <div className={`
                                    w-10 h-10 rounded-full flex items-center justify-center
                                    ${isActive ? 'bg-blue-600 text-white' : ''}
                                    ${isCompleted ? 'bg-emerald-600 text-white' : ''}
                                    ${!isActive && !isCompleted ? 'bg-slate-200 text-slate-500' : ''}
                                `}>
                                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <StepIcon className="h-5 w-5" />}
                                </div>
                                <p className="text-xs mt-2 text-center w-20">{step.label}</p>
                            </div>
                            {idx < STEPS.length - 1 && (
                                <div className={`h-0.5 w-12 mx-2 ${isCompleted ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Step 1: Institution Details */}
            {currentStep === 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Institution Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Institution Type *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {INSTITUTION_TYPES.map(type => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => updateField('institution_type', type.value)}
                                            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                                                formData.institution_type === type.value 
                                                    ? 'border-blue-600 bg-blue-50' 
                                                    : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                        >
                                            <Icon className="h-6 w-6" />
                                            <span className="text-sm font-medium">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bank MID ID *</Label>
                                <Input
                                    value={formData.bank_mid_id}
                                    onChange={(e) => updateField('bank_mid_id', e.target.value)}
                                    placeholder="BANK_USD_PRIMARY"
                                />
                                {validations.bank_mid_id && <p className="text-xs text-red-600">{validations.bank_mid_id}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Bank MID Name *</Label>
                                <Input
                                    value={formData.bank_mid_name}
                                    onChange={(e) => updateField('bank_mid_name', e.target.value)}
                                    placeholder="Primary USD Account"
                                />
                                {validations.bank_mid_name && <p className="text-xs text-red-600">{validations.bank_mid_name}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Legal Entity Name *</Label>
                            <Input
                                value={formData.legal_entity_name}
                                onChange={(e) => updateField('legal_entity_name', e.target.value)}
                                placeholder="Full legal name of institution"
                            />
                            {validations.legal_entity_name && <p className="text-xs text-red-600">{validations.legal_entity_name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Country (ISO 3166-1) *</Label>
                                <Select value={formData.country} onValueChange={(val) => updateField('country', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {countries.map(c => (
                                            <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validations.country && <p className="text-xs text-red-600">{validations.country}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Primary Currency (ISO 4217) *</Label>
                                <Select value={formData.currency} onValueChange={(val) => updateField('currency', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.slice(0, 50).map(c => (
                                            <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {validations.currency && <p className="text-xs text-red-600">{validations.currency}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>LEI (Legal Entity Identifier)</Label>
                            <Input
                                value={formData.lei}
                                onChange={(e) => updateField('lei', e.target.value)}
                                placeholder="20-character LEI code"
                                maxLength={20}
                            />
                            <p className="text-xs text-slate-500">Optional but recommended for institutional verification</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Compliance & Licensing */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Compliance & Licensing
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>License Number *</Label>
                                <Input
                                    value={formData.license_number}
                                    onChange={(e) => updateField('license_number', e.target.value)}
                                    placeholder="Financial services license"
                                />
                                {validations.license_number && <p className="text-xs text-red-600">{validations.license_number}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Licensing Authority *</Label>
                                <Input
                                    value={formData.licensing_authority}
                                    onChange={(e) => updateField('licensing_authority', e.target.value)}
                                    placeholder="e.g., FCA, BaFin, SEC, FINRA"
                                />
                                {validations.licensing_authority && <p className="text-xs text-red-600">{validations.licensing_authority}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>License Jurisdiction (ISO 3166-1)</Label>
                            <Select value={formData.license_jurisdiction} onValueChange={(val) => updateField('license_jurisdiction', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select jurisdiction" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map(c => (
                                        <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {isCrypto && (
                            <div className="space-y-2">
                                <Label>Crypto License Types</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['VASP', 'MTL', 'BitLicense', 'MiFID', 'Other'].map(type => (
                                        <Badge
                                            key={type}
                                            variant={formData.crypto_license_types?.includes(type) ? 'default' : 'outline'}
                                            className="cursor-pointer"
                                            onClick={() => {
                                                const current = formData.crypto_license_types || [];
                                                updateField('crypto_license_types', 
                                                    current.includes(type) 
                                                        ? current.filter(t => t !== type)
                                                        : [...current, type]
                                                );
                                            }}
                                        >
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>BIC/SWIFT Code (ISO 9362)</Label>
                            <Input
                                value={formData.bic_swift}
                                onChange={(e) => updateField('bic_swift', e.target.value.toUpperCase())}
                                placeholder="8 or 11 characters"
                                maxLength={11}
                            />
                            {validations.bic_swift && <p className="text-xs text-red-600">{validations.bic_swift}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>IBAN (ISO 13616)</Label>
                            <Input
                                value={formData.iban}
                                onChange={(e) => updateField('iban', e.target.value.replace(/\s/g, '').toUpperCase())}
                                placeholder="International Bank Account Number"
                            />
                            {validations.iban && <p className="text-xs text-red-600">{validations.iban}</p>}
                        </div>

                        <div className="space-y-3">
                            <Label>ISO Compliance Standards</Label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2">
                                    <Checkbox 
                                        checked={formData.kyc_aml_compliant}
                                        onCheckedChange={(checked) => updateField('kyc_aml_compliant', checked)}
                                    />
                                    <span className="text-sm">KYC/AML Compliant</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Checkbox 
                                        checked={formData.pci_dss_compliant}
                                        onCheckedChange={(checked) => updateField('pci_dss_compliant', checked)}
                                    />
                                    <span className="text-sm">PCI DSS Compliant</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Checkbox 
                                        checked={formData.iso_20022_compliant}
                                        onCheckedChange={(checked) => updateField('iso_20022_compliant', checked)}
                                    />
                                    <span className="text-sm">ISO 20022 Messaging Support</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <Checkbox 
                                        checked={formData.iso_8583_compliant}
                                        onCheckedChange={(checked) => updateField('iso_8583_compliant', checked)}
                                    />
                                    <span className="text-sm">ISO 8583 Messaging Support</span>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Banking/Wallet Details */}
            {currentStep === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            {isCrypto ? 'Wallet Details' : 'Banking Details'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!isCrypto ? (
                            <>
                                <div className="space-y-2">
                                    <Label>Bank Account Number *</Label>
                                    <Input
                                        value={formData.bank_account_number}
                                        onChange={(e) => updateField('bank_account_number', e.target.value)}
                                        placeholder="Account number"
                                    />
                                    {validations.bank_account_number && <p className="text-xs text-red-600">{validations.bank_account_number}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Branch Name</Label>
                                        <Input
                                            value={formData.branch_name}
                                            onChange={(e) => updateField('branch_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Routing Number</Label>
                                        <Input
                                            value={formData.routing_number}
                                            onChange={(e) => updateField('routing_number', e.target.value)}
                                            placeholder="US routing number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Sort Code (UK)</Label>
                                    <Input
                                        value={formData.sort_code}
                                        onChange={(e) => updateField('sort_code', e.target.value)}
                                        placeholder="XX-XX-XX"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Crypto Wallet Address (ISO 23257) *</Label>
                                    <Input
                                        value={formData.crypto_wallet_address}
                                        onChange={(e) => updateField('crypto_wallet_address', e.target.value)}
                                        placeholder="Blockchain wallet address"
                                        className="font-mono text-sm"
                                    />
                                    {validations.crypto_wallet_address && <p className="text-xs text-red-600">{validations.crypto_wallet_address}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Blockchain Network (ISO 23257) *</Label>
                                    <Select value={formData.crypto_wallet_network} onValueChange={(val) => updateField('crypto_wallet_network', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select network" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(BLOCKCHAIN_NETWORKS).map(([key, network]) => (
                                                <SelectItem key={key} value={key}>
                                                    {network.name} (Chain ID: {network.chainId})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {validations.crypto_wallet_network && <p className="text-xs text-red-600">{validations.crypto_wallet_network}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Supported Crypto Assets (ISO 23257)</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['BTC', 'ETH', 'USDT', 'USDC', 'BNB', 'SOL', 'XRP', 'ADA'].map(asset => (
                                            <Badge
                                                key={asset}
                                                variant={formData.supported_crypto_assets?.includes(asset) ? 'default' : 'outline'}
                                                className="cursor-pointer"
                                                onClick={() => {
                                                    const current = formData.supported_crypto_assets || [];
                                                    updateField('supported_crypto_assets', 
                                                        current.includes(asset) 
                                                            ? current.filter(a => a !== asset)
                                                            : [...current, asset]
                                                    );
                                                }}
                                            >
                                                {asset}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Configuration */}
            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Connector Type</Label>
                                <Select value={formData.connector_type} onValueChange={(val) => updateField('connector_type', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="gateway">Gateway</SelectItem>
                                        <SelectItem value="direct">Direct</SelectItem>
                                        <SelectItem value="aggregator">Aggregator</SelectItem>
                                        {isCrypto && <SelectItem value="blockchain_api">Blockchain API</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Account Type</Label>
                                <Select value={formData.account_type} onValueChange={(val) => updateField('account_type', val)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bank">Bank</SelectItem>
                                        <SelectItem value="ecomm">E-Commerce</SelectItem>
                                        <SelectItem value="moto">MOTO</SelectItem>
                                        <SelectItem value="pos">POS</SelectItem>
                                        {isCrypto && <SelectItem value="crypto_wallet">Crypto Wallet</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Settlement Cycle</Label>
                            <Select value={formData.settlement_cycle} onValueChange={(val) => updateField('settlement_cycle', val)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {isCrypto && <SelectItem value="instant">Instant (Blockchain)</SelectItem>}
                                    <SelectItem value="T+0">T+0 (Same Day)</SelectItem>
                                    <SelectItem value="T+1">T+1 (Next Day)</SelectItem>
                                    <SelectItem value="T+2">T+2</SelectItem>
                                    <SelectItem value="T+3">T+3</SelectItem>
                                    <SelectItem value="T+7">T+7 (Weekly)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {!isCrypto && (
                            <div className="space-y-2">
                                <Label>Supported Card Types</Label>
                                <div className="flex flex-wrap gap-2">
                                    {['visa', 'mastercard', 'amex', 'discover', 'unionpay', 'jcb'].map(card => (
                                        <Badge
                                            key={card}
                                            variant={formData.supported_card_types?.includes(card) ? 'default' : 'outline'}
                                            className="cursor-pointer capitalize"
                                            onClick={() => {
                                                const current = formData.supported_card_types || [];
                                                updateField('supported_card_types', 
                                                    current.includes(card) 
                                                        ? current.filter(c => c !== card)
                                                        : [...current, card]
                                                );
                                            }}
                                        >
                                            {card}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => updateField('notes', e.target.value)}
                                placeholder="Additional configuration notes"
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 5: Review */}
            {currentStep === 4 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Review & Submit
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <h3 className="font-semibold text-sm mb-3">Institution Details</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-slate-500">Type:</span> <span className="font-medium capitalize">{formData.institution_type.replace('_', ' ')}</span></div>
                                    <div><span className="text-slate-500">MID ID:</span> <span className="font-medium">{formData.bank_mid_id}</span></div>
                                    <div><span className="text-slate-500">Name:</span> <span className="font-medium">{formData.bank_mid_name}</span></div>
                                    <div><span className="text-slate-500">Legal Entity:</span> <span className="font-medium">{formData.legal_entity_name}</span></div>
                                    <div><span className="text-slate-500">Country:</span> <span className="font-medium">{formData.country}</span></div>
                                    <div><span className="text-slate-500">Currency:</span> <span className="font-medium">{formData.currency}</span></div>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg">
                                <h3 className="font-semibold text-sm mb-3">Compliance & Standards</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-slate-500">License:</span> <span className="font-medium">{formData.license_number}</span></div>
                                    <div><span className="text-slate-500">Authority:</span> <span className="font-medium">{formData.licensing_authority}</span></div>
                                    {formData.bic_swift && <div><span className="text-slate-500">BIC/SWIFT:</span> <span className="font-medium font-mono">{formData.bic_swift}</span></div>}
                                    {formData.iban && <div><span className="text-slate-500">IBAN:</span> <span className="font-medium font-mono">{formData.iban}</span></div>}
                                </div>
                                <div className="flex gap-2 mt-3">
                                    {formData.kyc_aml_compliant && <Badge variant="secondary">KYC/AML</Badge>}
                                    {formData.pci_dss_compliant && <Badge variant="secondary">PCI DSS</Badge>}
                                    {formData.iso_20022_compliant && <Badge variant="secondary">ISO 20022</Badge>}
                                    {formData.iso_8583_compliant && <Badge variant="secondary">ISO 8583</Badge>}
                                </div>
                            </div>

                            {formData.institution_type === 'crypto_exchange' ? (
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                        <Bitcoin className="h-4 w-4" />
                                        Crypto Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><span className="text-slate-500">Wallet:</span> <span className="font-medium font-mono text-xs">{formData.crypto_wallet_address}</span></div>
                                        <div><span className="text-slate-500">Network:</span> <span className="font-medium">{formData.crypto_wallet_network}</span></div>
                                    </div>
                                    {formData.supported_crypto_assets?.length > 0 && (
                                        <div className="mt-3">
                                            <span className="text-slate-500 text-sm">Supported Assets:</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {formData.supported_crypto_assets.map(asset => (
                                                    <Badge key={asset} variant="outline">{asset}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h3 className="font-semibold text-sm mb-3">Banking Details</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {formData.bank_account_number && <div><span className="text-slate-500">Account:</span> <span className="font-medium">{formData.bank_account_number}</span></div>}
                                        {formData.routing_number && <div><span className="text-slate-500">Routing:</span> <span className="font-medium">{formData.routing_number}</span></div>}
                                        {formData.sort_code && <div><span className="text-slate-500">Sort Code:</span> <span className="font-medium">{formData.sort_code}</span></div>}
                                        {formData.branch_name && <div><span className="text-slate-500">Branch:</span> <span className="font-medium">{formData.branch_name}</span></div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-emerald-900">Ready to Submit</p>
                                    <p className="text-emerald-700 mt-1">
                                        Your Bank MID configuration meets all ISO standards requirements and is ready for verification.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={currentStep === 0 ? onCancel : handleBack}
                    disabled={currentStep === 0}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {currentStep === 0 ? 'Cancel' : 'Back'}
                </Button>
                {currentStep < STEPS.length - 1 ? (
                    <Button onClick={handleNext}>
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit for Verification
                    </Button>
                )}
            </div>
        </div>
    );
}