import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Check, AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';

const STEP_1_ORG_INFO = 'org_info';
const STEP_2_LEI = 'lei';
const STEP_3_AML_KYB = 'aml_kyb';
const STEP_4_ADMIN = 'admin';

export default function BusinessEInvoiceOnboarding({ onSuccess }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(STEP_1_ORG_INFO);
    const [orgData, setOrgData] = useState({
        org_name: '',
        business_email: '',
        country: '',
        tax_id: ''
    });
    const [lei, setLei] = useState('');
    const [gracePeriodDays, setGracePeriodDays] = useState(30);
    const [amlKybData, setAmlKybData] = useState({
        director_name: '',
        director_email: '',
        beneficial_owner: '',
        aml_approved: false,
        kyb_approved: false
    });
    const [adminData, setAdminData] = useState({
        admin_email: '',
        admin_name: ''
    });
    const [generatedPassword, setGeneratedPassword] = useState('');
    const queryClient = useQueryClient();

    // Create organization
    const createOrgMutation = useMutation({
        mutationFn: async (data) => {
            const now = new Date();
            const gracePeriodEnd = new Date(now.getTime() + data.grace_period_days * 24 * 60 * 60 * 1000);
            
            return base44.entities.CompanyAccount.create({
                ...orgData,
                lei_status: data.lei ? 'verified' : 'grace_period',
                lei: data.lei || null,
                grace_period_end: data.lei ? null : gracePeriodEnd.toISOString(),
                kyb_status: 'pending',
                aml_status: 'pending',
                onboarding_step: STEP_4_ADMIN,
                portal_url: `${window.location.origin}/BusinessEInvoicePortal?org=${orgData.org_name.toLowerCase().replace(/\s+/g, '-')}`
            });
        },
        onSuccess: (org) => {
            setOrgData({ org_id: org.id });
            setStep(STEP_4_ADMIN);
        },
        onError: (err) => toast.error('Failed to create organization: ' + err.message)
    });

    // Verify LEI
    const verifyLeiMutation = useMutation({
        mutationFn: async (leiNumber) => {
            // In real scenario, call GLEIF API
            return await base44.integrations.Core.InvokeLLM({
                prompt: `Verify if this is a valid LEI format: ${leiNumber}. Respond with valid:true or valid:false`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        valid: { type: "boolean" }
                    }
                }
            });
        }
    });

    // Create admin user
    const createAdminMutation = useMutation({
        mutationFn: async () => {
            const pwd = Math.random().toString(36).slice(-12);
            const response = await base44.entities.CompanyAccount.update(orgData.org_id, {
                admin_email: adminData.admin_email,
                admin_name: adminData.admin_name,
                admin_password_hash: btoa(pwd),
                status: 'active',
                onboarding_step: 'completed'
            });
            setGeneratedPassword(pwd);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['businessEInvoicingOrgs'] });
            toast.success('Organization created and admin user provisioned');
            setOpen(false);
            resetForm();
            onSuccess?.();
        },
        onError: (err) => toast.error('Failed to create admin: ' + err.message)
    });

    const resetForm = () => {
        setStep(STEP_1_ORG_INFO);
        setOrgData({ org_name: '', business_email: '', country: '', tax_id: '' });
        setLei('');
        setGracePeriodDays(30);
        setAmlKybData({ director_name: '', director_email: '', beneficial_owner: '', aml_approved: false, kyb_approved: false });
        setAdminData({ admin_email: '', admin_name: '' });
        setGeneratedPassword('');
    };

    const handleNextFromOrgInfo = () => {
        if (!orgData.org_name || !orgData.business_email || !orgData.country) {
            toast.error('Please fill required fields');
            return;
        }
        setStep(STEP_2_LEI);
    };

    const handleNextFromLei = async () => {
        if (lei.trim()) {
            // Verify LEI format
            const result = await verifyLeiMutation.mutateAsync(lei);
            if (!result.valid) {
                toast.error('Invalid LEI format');
                return;
            }
            // LEI provided - skip to AML/KYB
            setStep(STEP_3_AML_KYB);
        } else {
            // No LEI - create org with grace period
            await createOrgMutation.mutateAsync({ lei: null, grace_period_days: gracePeriodDays });
        }
    };

    const handleNextFromAmlKyb = async () => {
        if (!amlKybData.aml_approved || !amlKybData.kyb_approved) {
            toast.error('Both AML and KYB must be approved');
            return;
        }
        // Create org with LEI
        await createOrgMutation.mutateAsync({ lei, grace_period_days: 0 });
    };

    const handleCreateAdmin = async () => {
        if (!adminData.admin_email || !adminData.admin_name) {
            toast.error('Please fill admin details');
            return;
        }
        await createAdminMutation.mutateAsync();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    onClick={() => {
                        resetForm();
                        setOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Organization
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Business E-Invoicing Onboarding</DialogTitle>
                </DialogHeader>

                {/* Step 1: Organization Info */}
                {step === STEP_1_ORG_INFO && (
                    <div className="space-y-4">
                        <div>
                            <Label>Organization Name *</Label>
                            <Input
                                value={orgData.org_name}
                                onChange={(e) => setOrgData({...orgData, org_name: e.target.value})}
                                placeholder="ACME Corp"
                            />
                        </div>
                        <div>
                            <Label>Business Email *</Label>
                            <Input
                                type="email"
                                value={orgData.business_email}
                                onChange={(e) => setOrgData({...orgData, business_email: e.target.value})}
                                placeholder="admin@acme.com"
                            />
                        </div>
                        <div>
                            <Label>Country *</Label>
                            <Select value={orgData.country} onValueChange={(value) => setOrgData({...orgData, country: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IT">Italy</SelectItem>
                                    <SelectItem value="DE">Germany</SelectItem>
                                    <SelectItem value="FR">France</SelectItem>
                                    <SelectItem value="ES">Spain</SelectItem>
                                    <SelectItem value="NL">Netherlands</SelectItem>
                                    <SelectItem value="BE">Belgium</SelectItem>
                                    <SelectItem value="AT">Austria</SelectItem>
                                    <SelectItem value="PL">Poland</SelectItem>
                                    <SelectItem value="PT">Portugal</SelectItem>
                                    <SelectItem value="GB">United Kingdom</SelectItem>
                                    <SelectItem value="SE">Sweden</SelectItem>
                                    <SelectItem value="DK">Denmark</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Tax ID</Label>
                            <Input
                                value={orgData.tax_id}
                                onChange={(e) => setOrgData({...orgData, tax_id: e.target.value})}
                                placeholder="VAT/Tax ID"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleNextFromOrgInfo} className="bg-blue-600">Next</Button>
                        </div>
                    </div>
                )}

                {/* Step 2: LEI */}
                {step === STEP_2_LEI && (
                    <div className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Provide a Legal Entity Identifier (LEI) if available. If not, you'll get a grace period to obtain one.
                            </AlertDescription>
                        </Alert>
                        <div>
                            <Label>LEI (Optional)</Label>
                            <Input
                                value={lei}
                                onChange={(e) => setLei(e.target.value)}
                                placeholder="e.g., 5493001KJTIIGC8Y1R12"
                                maxLength="20"
                            />
                            <p className="text-xs text-slate-500 mt-1">20-character alphanumeric code</p>
                        </div>

                        {!lei && (
                            <div>
                                <Label>Grace Period Days</Label>
                                <Input
                                    type="number"
                                    value={gracePeriodDays}
                                    onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 30)}
                                    min="7"
                                    max="180"
                                />
                                <p className="text-xs text-slate-500 mt-1">Organization will have this many days to provide LEI</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setStep(STEP_1_ORG_INFO)}>Back</Button>
                            <Button onClick={handleNextFromLei} className="bg-blue-600" disabled={verifyLeiMutation.isPending}>
                                {lei ? 'Verify & Continue' : 'Continue without LEI'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: AML/KYB (only if LEI provided) */}
                {step === STEP_3_AML_KYB && (
                    <div className="space-y-4">
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Complete AML and KYB verification before final activation
                            </AlertDescription>
                        </Alert>
                        <div>
                            <Label>Director Name *</Label>
                            <Input
                                value={amlKybData.director_name}
                                onChange={(e) => setAmlKybData({...amlKybData, director_name: e.target.value})}
                                placeholder="Full name"
                            />
                        </div>
                        <div>
                            <Label>Director Email *</Label>
                            <Input
                                type="email"
                                value={amlKybData.director_email}
                                onChange={(e) => setAmlKybData({...amlKybData, director_email: e.target.value})}
                                placeholder="director@acme.com"
                            />
                        </div>
                        <div>
                            <Label>Beneficial Owner</Label>
                            <Input
                                value={amlKybData.beneficial_owner}
                                onChange={(e) => setAmlKybData({...amlKybData, beneficial_owner: e.target.value})}
                                placeholder="Name or None"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={amlKybData.aml_approved}
                                    onCheckedChange={(checked) => setAmlKybData({...amlKybData, aml_approved: checked})}
                                />
                                <Label className="cursor-pointer">AML screening passed</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={amlKybData.kyb_approved}
                                    onCheckedChange={(checked) => setAmlKybData({...amlKybData, kyb_approved: checked})}
                                />
                                <Label className="cursor-pointer">KYB verification passed</Label>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button variant="outline" onClick={() => setStep(STEP_2_LEI)}>Back</Button>
                            <Button onClick={handleNextFromAmlKyb} className="bg-blue-600" disabled={createOrgMutation.isPending}>
                                Approve & Continue
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Create Admin User */}
                {step === STEP_4_ADMIN && (
                    <div className="space-y-4">
                        {!generatedPassword ? (
                            <>
                                <Alert>
                                    <Lock className="h-4 w-4" />
                                    <AlertDescription>
                                        Create the initial admin user for this organization
                                    </AlertDescription>
                                </Alert>
                                <div>
                                    <Label>Admin Name *</Label>
                                    <Input
                                        value={adminData.admin_name}
                                        onChange={(e) => setAdminData({...adminData, admin_name: e.target.value})}
                                        placeholder="Admin name"
                                    />
                                </div>
                                <div>
                                    <Label>Admin Email *</Label>
                                    <Input
                                        type="email"
                                        value={adminData.admin_email}
                                        onChange={(e) => setAdminData({...adminData, admin_email: e.target.value})}
                                        placeholder="admin@acme.com"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setStep(STEP_3_AML_KYB)}>Back</Button>
                                    <Button onClick={handleCreateAdmin} className="bg-blue-600" disabled={createAdminMutation.isPending}>
                                        Create Organization & Admin
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <Card className="bg-green-50 border-green-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <Check className="h-5 w-5" />
                                        Setup Complete
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <p className="text-sm">Organization has been created successfully. Share these credentials with the admin:</p>
                                    <div className="bg-white p-3 rounded border border-green-200 space-y-2">
                                        <div>
                                            <p className="text-xs text-slate-600">Email:</p>
                                            <p className="font-mono text-sm">{adminData.admin_email}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600">Temporary Password:</p>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono text-sm bg-slate-50 px-2 py-1 rounded flex-1">{generatedPassword}</p>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(generatedPassword);
                                                        toast.success('Password copied');
                                                    }}
                                                >
                                                    Copy
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <Button onClick={() => setOpen(false)} className="w-full bg-green-600">Done</Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}