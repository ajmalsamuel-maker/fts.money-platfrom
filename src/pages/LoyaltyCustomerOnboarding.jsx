import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, PLATFORM_ROLES, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    ArrowRight,
    ArrowLeft,
    Check,
    Menu,
    Building2,
    Heart,
    Briefcase,
    GraduationCap,
    Stethoscope,
    ShoppingBag,
    Landmark,
    Rocket
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

const STEPS = ['Organization', 'Program', 'Branding', 'Pricing', 'Review'];

const TIER_PRICING = {
    starter: { 
        fee: 500, 
        setup: 5000, 
        transaction: 0.01,
        programs: 1,
        participants: 5000,
        features: ['Basic gamification', 'Email support', 'Standard analytics']
    },
    growth: { 
        fee: 3000, 
        setup: 15000, 
        transaction: 0.008,
        programs: 3,
        participants: 25000,
        features: ['Advanced gamification', 'NFT badges', 'Priority support', 'Custom branding', 'API access']
    },
    enterprise: { 
        fee: 15000, 
        setup: 50000, 
        transaction: 0.005,
        programs: 999,
        participants: 999999,
        features: ['Unlimited programs', 'Coalition loyalty', 'Dedicated support', 'Custom development', 'White-label apps']
    }
};

export default function LoyaltyCustomerOnboarding() {
    const { platformUser, loading } = usePlatformAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        // Customer data
        customer_code: '',
        organization_name: '',
        organization_type: 'ngo',
        admin_email: '',
        password_hash: '',
        subscription_tier: 'starter',
        
        // Program data
        program_code: '',
        program_name: '',
        token_name: '',
        token_symbol: '',
        program_description: '',
        
        // Branding
        branding: {
            logo_url: '',
            primary_color: '#8b5cf6',
            secondary_color: '#3b82f6',
            custom_domain: ''
        },
        
        blockchain_network: 'polygon_edge'
    });

    const createCustomerMutation = useMutation({
        mutationFn: async () => {
            const tierConfig = TIER_PRICING[formData.subscription_tier];
            
            // Create customer
            const customer = await base44.entities.LoyaltyCustomer.create({
                customer_code: formData.customer_code,
                organization_name: formData.organization_name,
                organization_type: formData.organization_type,
                admin_email: formData.admin_email,
                password_hash: formData.password_hash,
                subscription_tier: formData.subscription_tier,
                programs_limit: tierConfig.programs,
                participants_limit: tierConfig.participants,
                monthly_fee: tierConfig.fee,
                setup_fee: tierConfig.setup,
                transaction_fee_per_token: tierConfig.transaction,
                status: 'trial',
                trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                onboarding_status: 'in_progress'
            });

            // Create first program
            const program = await base44.entities.LoyaltyProgram.create({
                program_code: formData.program_code,
                organization_name: formData.organization_name,
                organization_type: formData.organization_type,
                admin_email: formData.admin_email,
                program_name: formData.program_name,
                token_name: formData.token_name,
                token_symbol: formData.token_symbol,
                program_description: formData.program_description,
                branding: formData.branding,
                subscription_tier: formData.subscription_tier,
                monthly_fee: tierConfig.fee,
                setup_fee: tierConfig.setup,
                transaction_fee: tierConfig.transaction,
                blockchain_network: formData.blockchain_network,
                status: 'provisioning',
                features_enabled: {
                    badges: true,
                    leaderboards: true,
                    tiers: formData.subscription_tier !== 'starter',
                    nft_achievements: formData.subscription_tier === 'enterprise',
                    redemption_marketplace: true,
                    impact_index: formData.organization_type === 'ngo'
                }
            });

            return { customer, program };
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['loyalty-customers']);
            queryClient.invalidateQueries(['loyalty-programs']);
            toast.success('Customer onboarded successfully! Redirecting to dashboard...');
            setTimeout(() => {
                window.location.href = createPageUrl('LoyaltyPlatformDashboard');
            }, 2000);
        },
        onError: (error) => {
            toast.error('Failed to create customer: ' + error.message);
        }
    });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            createCustomerMutation.mutate();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    if (loading) return null;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            {mobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            
            <FTSPlatformSidebar 
                currentPage="LoyaltyCustomerOnboarding" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === PLATFORM_ROLES.SUPER_ADMIN}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden flex-shrink-0"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="min-w-0">
                            <h2 className="text-base md:text-lg font-semibold text-slate-900 truncate">Onboard Loyalty Customer</h2>
                            <p className="text-xs text-slate-600 truncate hidden sm:block">White-label loyalty program setup</p>
                        </div>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={false} />
                </header>

                <div className="p-4 md:p-8 max-w-4xl mx-auto">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-slate-700">Step {currentStep + 1} of {STEPS.length}</p>
                            <p className="text-sm text-slate-600">{STEPS[currentStep]}</p>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between mt-2">
                            {STEPS.map((step, idx) => (
                                <div key={step} className={cn(
                                    "text-xs",
                                    idx <= currentStep ? "text-purple-600 font-medium" : "text-slate-400"
                                )}>
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-6 md:p-8">
                            {/* Step 0: Organization */}
                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Organization Details</h3>
                                        <p className="text-sm text-slate-600">Tell us about the organization launching the loyalty program</p>
                                    </div>

                                    <div>
                                        <Label>Organization Name *</Label>
                                        <Input
                                            value={formData.organization_name}
                                            onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
                                            placeholder="Ajmal Samuel Foundation"
                                        />
                                    </div>

                                    <div>
                                        <Label>Organization Type *</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                            {[
                                                { value: 'ngo', label: 'NGO / Charity', icon: Heart },
                                                { value: 'corporate', label: 'Corporate', icon: Briefcase },
                                                { value: 'education', label: 'Education', icon: GraduationCap },
                                                { value: 'healthcare', label: 'Healthcare', icon: Stethoscope },
                                                { value: 'retail', label: 'Retail', icon: ShoppingBag },
                                                { value: 'government', label: 'Government', icon: Landmark }
                                            ].map(({ value, label, icon: Icon }) => (
                                                <button
                                                    key={value}
                                                    onClick={() => setFormData({...formData, organization_type: value})}
                                                    className={cn(
                                                        "p-4 rounded-lg border-2 transition-all text-left",
                                                        formData.organization_type === value 
                                                            ? "border-purple-500 bg-purple-50" 
                                                            : "border-slate-200 hover:border-purple-300"
                                                    )}
                                                >
                                                    <Icon className={cn(
                                                        "h-6 w-6 mb-2",
                                                        formData.organization_type === value ? "text-purple-600" : "text-slate-400"
                                                    )} />
                                                    <p className="text-sm font-medium">{label}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Admin Email *</Label>
                                            <Input
                                                type="email"
                                                value={formData.admin_email}
                                                onChange={(e) => setFormData({...formData, admin_email: e.target.value})}
                                                placeholder="admin@organization.org"
                                            />
                                        </div>
                                        <div>
                                            <Label>Temporary Password *</Label>
                                            <Input
                                                type="password"
                                                value={formData.password_hash}
                                                onChange={(e) => setFormData({...formData, password_hash: e.target.value})}
                                                placeholder="Min 8 characters"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Customer Code *</Label>
                                        <Input
                                            value={formData.customer_code}
                                            onChange={(e) => setFormData({...formData, customer_code: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                                            placeholder="ajmal-foundation"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Unique identifier (lowercase, no spaces)</p>
                                    </div>
                                </div>
                            )}

                            {/* Step 1: Program */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">First Loyalty Program</h3>
                                        <p className="text-sm text-slate-600">Configure the initial loyalty program for this customer</p>
                                    </div>

                                    <div>
                                        <Label>Program Name *</Label>
                                        <Input
                                            value={formData.program_name}
                                            onChange={(e) => setFormData({...formData, program_name: e.target.value})}
                                            placeholder="ImpactMiles Program"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Token Name *</Label>
                                            <Input
                                                value={formData.token_name}
                                                onChange={(e) => setFormData({...formData, token_name: e.target.value})}
                                                placeholder="ImpactMiles"
                                            />
                                        </div>
                                        <div>
                                            <Label>Token Symbol *</Label>
                                            <Input
                                                value={formData.token_symbol}
                                                onChange={(e) => setFormData({...formData, token_symbol: e.target.value.toUpperCase()})}
                                                placeholder="IMI"
                                                maxLength={6}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Program Code *</Label>
                                        <Input
                                            value={formData.program_code}
                                            onChange={(e) => setFormData({...formData, program_code: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                                            placeholder="impactmiles"
                                        />
                                    </div>

                                    <div>
                                        <Label>Program Description</Label>
                                        <Textarea
                                            value={formData.program_description}
                                            onChange={(e) => setFormData({...formData, program_description: e.target.value})}
                                            placeholder="Earn ImpactMiles for sports, volunteering, and community engagement..."
                                            rows={4}
                                        />
                                    </div>

                                    <div>
                                        <Label>Blockchain Network</Label>
                                        <Select 
                                            value={formData.blockchain_network} 
                                            onValueChange={(v) => setFormData({...formData, blockchain_network: v})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="polygon_edge">Polygon Edge (Recommended - Private)</SelectItem>
                                                <SelectItem value="hyperledger_fabric">Hyperledger Fabric (Enterprise)</SelectItem>
                                                <SelectItem value="polygon">Polygon (Public)</SelectItem>
                                                <SelectItem value="ethereum">Ethereum (Public)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Branding */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">White-Label Branding</h3>
                                        <p className="text-sm text-slate-600">Customize the look and feel of the program</p>
                                    </div>

                                    <div>
                                        <Label>Logo URL</Label>
                                        <Input
                                            value={formData.branding.logo_url}
                                            onChange={(e) => setFormData({...formData, branding: {...formData.branding, logo_url: e.target.value}})}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Primary Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={formData.branding.primary_color}
                                                    onChange={(e) => setFormData({...formData, branding: {...formData.branding, primary_color: e.target.value}})}
                                                    className="w-20"
                                                />
                                                <Input
                                                    value={formData.branding.primary_color}
                                                    onChange={(e) => setFormData({...formData, branding: {...formData.branding, primary_color: e.target.value}})}
                                                    placeholder="#8b5cf6"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Secondary Color</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="color"
                                                    value={formData.branding.secondary_color}
                                                    onChange={(e) => setFormData({...formData, branding: {...formData.branding, secondary_color: e.target.value}})}
                                                    className="w-20"
                                                />
                                                <Input
                                                    value={formData.branding.secondary_color}
                                                    onChange={(e) => setFormData({...formData, branding: {...formData.branding, secondary_color: e.target.value}})}
                                                    placeholder="#3b82f6"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label>Custom Domain (Optional)</Label>
                                        <Input
                                            value={formData.branding.custom_domain}
                                            onChange={(e) => setFormData({...formData, branding: {...formData.branding, custom_domain: e.target.value}})}
                                            placeholder="loyalty.yourorganization.org"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Leave blank to use default FTS subdomain</p>
                                    </div>

                                    {/* Live Preview */}
                                    <div className="border-t pt-6">
                                        <Label className="mb-3 block">Preview</Label>
                                        <div 
                                            className="p-6 rounded-lg"
                                            style={{ 
                                                background: `linear-gradient(135deg, ${formData.branding.primary_color}15, ${formData.branding.secondary_color}15)`,
                                                borderColor: formData.branding.primary_color,
                                                borderWidth: '2px'
                                            }}
                                        >
                                            <h4 className="text-2xl font-bold mb-2" style={{ color: formData.branding.primary_color }}>
                                                {formData.program_name || 'Your Program'}
                                            </h4>
                                            <Badge style={{ backgroundColor: formData.branding.secondary_color, color: 'white' }}>
                                                Earn {formData.token_name || 'Points'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Pricing */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Select Subscription Tier</h3>
                                        <p className="text-sm text-slate-600">Choose the plan that fits your organization's needs</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {Object.entries(TIER_PRICING).map(([tier, config]) => (
                                            <button
                                                key={tier}
                                                onClick={() => setFormData({...formData, subscription_tier: tier})}
                                                className={cn(
                                                    "p-6 rounded-xl border-2 transition-all text-left",
                                                    formData.subscription_tier === tier 
                                                        ? "border-purple-500 bg-purple-50 shadow-lg scale-105" 
                                                        : "border-slate-200 hover:border-purple-300"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-bold capitalize">{tier}</h4>
                                                    {formData.subscription_tier === tier && (
                                                        <Check className="h-5 w-5 text-purple-600" />
                                                    )}
                                                </div>
                                                <p className="text-3xl font-bold text-slate-900 mb-1">${config.fee.toLocaleString()}</p>
                                                <p className="text-sm text-slate-600 mb-4">/month</p>
                                                <div className="space-y-2 mb-4">
                                                    <p className="text-xs text-slate-600">Setup: ${config.setup.toLocaleString()}</p>
                                                    <p className="text-xs text-slate-600">Transaction: ${config.transaction}/token</p>
                                                    <p className="text-xs text-slate-600">Max programs: {config.programs === 999 ? 'Unlimited' : config.programs}</p>
                                                    <p className="text-xs text-slate-600">Max participants: {config.participants.toLocaleString()}</p>
                                                </div>
                                                <div className="border-t pt-3">
                                                    <p className="text-xs font-medium text-slate-700 mb-2">Features:</p>
                                                    <ul className="space-y-1">
                                                        {config.features.map((feature, idx) => (
                                                            <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                                                                <Check className="h-3 w-3 text-emerald-600" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Review */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Review & Launch</h3>
                                        <p className="text-sm text-slate-600">Confirm the details before provisioning</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <h4 className="font-semibold text-slate-900 mb-3">Organization</h4>
                                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <dt className="text-slate-600">Name</dt>
                                                    <dd className="font-medium">{formData.organization_name}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-600">Type</dt>
                                                    <dd className="font-medium capitalize">{formData.organization_type}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-600">Admin Email</dt>
                                                    <dd className="font-medium">{formData.admin_email}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-600">Code</dt>
                                                    <dd className="font-medium font-mono">{formData.customer_code}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="p-4 bg-purple-50 rounded-lg">
                                            <h4 className="font-semibold text-slate-900 mb-3">Program</h4>
                                            <dl className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <dt className="text-slate-600">Name</dt>
                                                    <dd className="font-medium">{formData.program_name}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-600">Token</dt>
                                                    <dd className="font-medium">{formData.token_name} ({formData.token_symbol})</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-600">Network</dt>
                                                    <dd className="font-medium">{formData.blockchain_network}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-slate-600">Code</dt>
                                                    <dd className="font-medium font-mono">{formData.program_code}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="p-4 bg-blue-50 rounded-lg">
                                            <h4 className="font-semibold text-slate-900 mb-3">Pricing</h4>
                                            <dl className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-600">Tier</dt>
                                                    <dd className="font-medium capitalize">{formData.subscription_tier}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-600">Setup Fee</dt>
                                                    <dd className="font-medium">${TIER_PRICING[formData.subscription_tier].setup.toLocaleString()}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-600">Monthly SaaS</dt>
                                                    <dd className="font-medium">${TIER_PRICING[formData.subscription_tier].fee.toLocaleString()}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-slate-600">Per-Token Fee</dt>
                                                    <dd className="font-medium">${TIER_PRICING[formData.subscription_tier].transaction}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-sm text-amber-800">
                                                <strong>Trial Period:</strong> 30-day free trial included. Customer will be billed after trial ends.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-8 pt-6 border-t">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={currentStep === 0}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleNext}
                                    disabled={
                                        (currentStep === 0 && (!formData.organization_name || !formData.admin_email || !formData.customer_code || !formData.password_hash)) ||
                                        (currentStep === 1 && (!formData.program_name || !formData.token_name || !formData.program_code))
                                    }
                                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                                >
                                    {currentStep === STEPS.length - 1 ? (
                                        <>
                                            <Rocket className="h-4 w-4 mr-2" />
                                            {createCustomerMutation.isPending ? 'Provisioning...' : 'Launch Program'}
                                        </>
                                    ) : (
                                        <>
                                            Next
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}