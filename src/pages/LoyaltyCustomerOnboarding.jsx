import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Menu, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';

const STEPS = ['Organization', 'Program', 'Pricing'];
const TIER_PRICING = {
    starter: { fee: 500, setup: 5000, programs: 1, participants: 5000 },
    growth: { fee: 3000, setup: 15000, programs: 3, participants: 25000 },
    enterprise: { fee: 15000, setup: 50000, programs: 999, participants: 999999 }
};

export default function LoyaltyCustomerOnboarding() {
    const { platformUser, loading } = usePlatformAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        customer_code: '', organization_name: '', organization_type: 'ngo',
        admin_email: '', password_hash: '', subscription_tier: 'starter',
        program_code: '', program_name: '', token_name: '', token_symbol: ''
    });

    const createMutation = useMutation({
        mutationFn: async () => {
            const tierConfig = TIER_PRICING[formData.subscription_tier];
            const customer = await base44.entities.LoyaltyCustomer.create({
                customer_code: formData.customer_code,
                organization_name: formData.organization_name,
                organization_type: formData.organization_type,
                admin_email: formData.admin_email,
                password_hash: formData.password_hash,
                subscription_tier: formData.subscription_tier,
                monthly_fee: tierConfig.fee,
                status: 'trial'
            });

            await base44.entities.LoyaltyProgram.create({
                program_code: formData.program_code,
                organization_name: formData.organization_name,
                organization_type: formData.organization_type,
                admin_email: formData.admin_email,
                program_name: formData.program_name,
                token_name: formData.token_name,
                token_symbol: formData.token_symbol,
                subscription_tier: formData.subscription_tier,
                status: 'active'
            });

            // Create FTS billing subscription
            await base44.entities.ServiceSubscription.create({
                customer_code: formData.customer_code,
                service_type: 'loyalty_platform',
                subscription_tier: formData.subscription_tier,
                monthly_fee: tierConfig.fee,
                billing_cycle: 'monthly',
                status: 'trial',
                start_date: new Date().toISOString(),
                auto_renew: true
            });

            return customer;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['loyalty-customers']);
            toast.success('Customer onboarded successfully!');
            setTimeout(() => window.location.href = createPageUrl('LoyaltyPlatformDashboard'), 1500);
        }
    });

    if (loading) return null;

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30">
            {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
            
            <FTSPlatformSidebar currentPage="LoyaltyCustomerOnboarding" userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white/80 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div>
                            <h2 className="text-base md:text-lg font-semibold">Onboard Customer</h2>
                            <p className="text-xs text-slate-600 hidden sm:block">Create white-label loyalty program</p>
                        </div>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={false} />
                </header>

                <div className="p-4 md:p-8 max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
                        <div className="flex justify-between mt-2">
                            {STEPS.map((step, idx) => (
                                <div key={step} className={idx <= currentStep ? "text-xs text-purple-600 font-medium" : "text-xs text-slate-400"}>
                                    {step}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-6 md:p-8 space-y-6">
                            {currentStep === 0 && (
                                <>
                                    <div>
                                        <Label>Organization Name *</Label>
                                        <Input value={formData.organization_name} onChange={(e) => setFormData({...formData, organization_name: e.target.value})} 
                                            placeholder="Foundation Name" />
                                    </div>
                                    <div>
                                        <Label>Organization Type *</Label>
                                        <Select value={formData.organization_type} onValueChange={(v) => setFormData({...formData, organization_type: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ngo">NGO / Charity</SelectItem>
                                                <SelectItem value="corporate">Corporate</SelectItem>
                                                <SelectItem value="healthcare">Healthcare</SelectItem>
                                                <SelectItem value="education">Education</SelectItem>
                                                <SelectItem value="retail">Retail</SelectItem>
                                                <SelectItem value="government">Government</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Admin Email *</Label>
                                            <Input type="email" value={formData.admin_email} onChange={(e) => setFormData({...formData, admin_email: e.target.value})} />
                                        </div>
                                        <div>
                                            <Label>Password *</Label>
                                            <Input type="password" value={formData.password_hash} onChange={(e) => setFormData({...formData, password_hash: e.target.value})} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Customer Code *</Label>
                                        <Input value={formData.customer_code} onChange={(e) => setFormData({...formData, customer_code: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})} 
                                            placeholder="customer-code" />
                                    </div>
                                </>
                            )}

                            {currentStep === 1 && (
                                <>
                                    <div>
                                        <Label>Program Name *</Label>
                                        <Input value={formData.program_name} onChange={(e) => setFormData({...formData, program_name: e.target.value})} 
                                            placeholder="Loyalty Program" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Token Name *</Label>
                                            <Input value={formData.token_name} onChange={(e) => setFormData({...formData, token_name: e.target.value})} placeholder="Points" />
                                        </div>
                                        <div>
                                            <Label>Token Symbol *</Label>
                                            <Input value={formData.token_symbol} onChange={(e) => setFormData({...formData, token_symbol: e.target.value.toUpperCase()})} 
                                                placeholder="PTS" maxLength={6} />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Program Code *</Label>
                                        <Input value={formData.program_code} onChange={(e) => setFormData({...formData, program_code: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})} 
                                            placeholder="program-code" />
                                    </div>
                                </>
                            )}

                            {currentStep === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Object.entries(TIER_PRICING).map(([tier, config]) => (
                                        <button key={tier} onClick={() => setFormData({...formData, subscription_tier: tier})}
                                            className={`p-6 rounded-xl border-2 transition-all text-left ${
                                                formData.subscription_tier === tier ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}>
                                            <h4 className="text-lg font-bold capitalize mb-2">{tier}</h4>
                                            <p className="text-3xl font-bold mb-1">${config.fee.toLocaleString()}</p>
                                            <p className="text-sm text-slate-600 mb-4">/month</p>
                                            <p className="text-xs text-slate-600">Setup: ${config.setup.toLocaleString()}</p>
                                            <p className="text-xs text-slate-600">Max programs: {config.programs === 999 ? 'Unlimited' : config.programs}</p>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-between pt-6 border-t">
                                <Button variant="outline" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />Back
                                </Button>
                                <Button onClick={() => currentStep < STEPS.length - 1 ? setCurrentStep(currentStep + 1) : createMutation.mutate()}
                                    className="bg-gradient-to-r from-purple-600 to-blue-600">
                                    {currentStep === STEPS.length - 1 ? <><Rocket className="h-4 w-4 mr-2" />{createMutation.isPending ? 'Creating...' : 'Launch'}</> : 
                                    <>Next<ArrowRight className="h-4 w-4 ml-2" /></>}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}