import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function CompanyAccountSetup() {
    const [session] = useState(() => JSON.parse(localStorage.getItem('participant_session') || '{}'));
    const [formData, setFormData] = useState({
        company_name: '',
        company_email: '',
        industry: '',
        employee_count: '',
        registration_number: '',
        website: '',
        csr_goals: ''
    });
    const [step, setStep] = useState('info');
    const queryClient = useQueryClient();

    if (!session.id) {
        window.location.href = '/ParticipantLogin';
        return null;
    }

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.CompanyAccount.create({
            ...data,
            program_id: session.program_id,
            admin_email: session.participant_email,
            participant_count: 1
        }),
        onSuccess: (company) => {
            // Link participant to company
            base44.entities.CompanyParticipantLink.create({
                program_id: session.program_id,
                participant_id: session.id,
                company_id: company.id,
                role: 'admin'
            });
            toast.success('Company account created successfully!');
            queryClient.invalidateQueries(['company']);
            window.location.href = '/CompanyDashboard';
        },
        onError: (error) => {
            toast.error('Failed to create company account');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-8 w-8" />
                        <div>
                            <CardTitle>Create Company Account</CardTitle>
                            <p className="text-sm text-indigo-100 mt-1">Compete with other companies and unlock team benefits</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Company Name *</Label>
                                <Input
                                    value={formData.company_name}
                                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                    placeholder="Acme Corp"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Company Email *</Label>
                                <Input
                                    type="email"
                                    value={formData.company_email}
                                    onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                                    placeholder="company@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Industry</Label>
                                <Input
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    placeholder="Technology"
                                />
                            </div>
                            <div>
                                <Label>Employee Count</Label>
                                <Input
                                    type="number"
                                    value={formData.employee_count}
                                    onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                                    placeholder="500"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Registration Number</Label>
                            <Input
                                value={formData.registration_number}
                                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                                placeholder="REG-123456"
                            />
                        </div>

                        <div>
                            <Label>Website</Label>
                            <Input
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div>
                            <Label>CSR Goals (Optional)</Label>
                            <Textarea
                                value={formData.csr_goals}
                                onChange={(e) => setFormData({ ...formData, csr_goals: e.target.value })}
                                placeholder="What are your company's social responsibility goals?"
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => window.history.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Account'}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}