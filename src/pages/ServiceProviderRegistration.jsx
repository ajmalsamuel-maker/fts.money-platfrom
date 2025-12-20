import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CommunityPortalSidebar from '@/components/community/CommunityPortalSidebar';
import ComplianceFooter from '@/components/community/ComplianceFooter';
import LEIVerificationStep from '@/components/onboarding/LEIVerificationStep';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, CheckCircle2, Sparkles, Shield } from 'lucide-react';

export default function ServiceProviderRegistration() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [session, setSession] = useState(null);
    const [formData, setFormData] = useState({
        company_name: '',
        legal_name: '',
        website: '',
        description: '',
        contact_email: '',
        support_email: '',
        headquarters_country: '',
        lei: '',
        lei_verification_result: null
    });

    useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (!sessionData) {
            navigate(createPageUrl('CommunityPortalLogin'));
            return;
        }
        const parsed = JSON.parse(sessionData);
        setSession(parsed);
        setFormData(prev => ({ ...prev, contact_email: parsed.email }));
    }, [navigate]);

    const registerMutation = useMutation({
        mutationFn: async (data) => {
            return await base44.entities.ServiceProvider.create({
                ...data,
                status: 'pending'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['service-providers'] });
            navigate(createPageUrl('CommunityPortalDashboard'));
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        registerMutation.mutate(formData);
    };

    if (!session) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <CommunityPortalSidebar currentPage="ServiceProviderRegistration" userEmail={session?.email} />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Register as Service Provider</h2>
                        <p className="text-xs text-slate-600">Offer your services in the FTS.Money marketplace</p>
                    </div>
                </header>

                <div className="p-6 max-w-3xl mx-auto">
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                            Join our growing marketplace and reach PSPs worldwide. Your application will be reviewed within 24-48 hours.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Company Name *</Label>
                                        <Input
                                            value={formData.company_name}
                                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                            placeholder="Your Company"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Legal Entity Name *</Label>
                                        <Input
                                            value={formData.legal_name}
                                            onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                                            placeholder="Your Company Ltd"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Website</Label>
                                        <Input
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            placeholder="https://yourcompany.com"
                                            type="url"
                                        />
                                    </div>
                                    <div>
                                        <Label>Headquarters Country *</Label>
                                        <Input
                                            value={formData.headquarters_country}
                                            onChange={(e) => setFormData({ ...formData, headquarters_country: e.target.value })}
                                            placeholder="United States"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Contact Email *</Label>
                                        <Input
                                            value={formData.contact_email}
                                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                                            type="email"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Support Email</Label>
                                        <Input
                                            value={formData.support_email}
                                            onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                                            type="email"
                                            placeholder="support@yourcompany.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>Company Description *</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Tell us about your company and the services you provide..."
                                        rows={4}
                                        required
                                    />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Legal Entity Identifier (LEI) or TAS Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LEIVerificationStep
                                data={{
                                    lei: formData.lei,
                                    lei_verification_result: formData.lei_verification_result
                                }}
                                onChange={(leiData) => setFormData({ ...formData, ...leiData })}
                                errors={{}}
                                businessData={{
                                    legal_name: formData.legal_name,
                                    country: formData.headquarters_country
                                }}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-slate-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                        What Happens Next?
                                    </h4>
                                    <ul className="space-y-1 text-sm text-slate-600">
                                        <li>• Your application will be reviewed by our team</li>
                                        <li>• We'll verify your company information</li>
                                        <li>• You'll receive approval status within 24-48 hours</li>
                                        <li>• Once approved, you can register services in the marketplace</li>
                                    </ul>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => navigate(createPageUrl('CommunityPortalDashboard'))}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        disabled={registerMutation.isPending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {registerMutation.isPending ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                
                <ComplianceFooter />
            </div>
        </div>
    );
}