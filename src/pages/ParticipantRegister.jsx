import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function ParticipantRegister() {
    const [formData, setFormData] = useState({
        full_name: '',
        participant_email: '',
        password: '',
        program_id: ''
    });

    const { data: programs = [] } = useQuery({
        queryKey: ['active-programs'],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ status: 'active' })
    });

    const registerMutation = useMutation({
        mutationFn: async (data) => {
            const participant = await base44.entities.LoyaltyParticipant.create({
                program_id: data.program_id,
                participant_email: data.participant_email,
                full_name: data.full_name,
                current_balance: 0,
                current_tier: 'bronze'
            });
            return participant;
        },
        onSuccess: (participant) => {
            toast.success('Registration successful!');
            localStorage.setItem('participant_session', JSON.stringify(participant));
            window.location.href = '/ParticipantDashboard';
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        registerMutation.mutate(formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle>Join a Loyalty Program</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Full Name</Label>
                            <Input value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} required />
                        </div>
                        <div>
                            <Label>Email</Label>
                            <Input type="email" value={formData.participant_email} onChange={(e) => setFormData({...formData, participant_email: e.target.value})} required />
                        </div>
                        <div>
                            <Label>Password</Label>
                            <Input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                        <div>
                            <Label>Select Program</Label>
                            <Select value={formData.program_id} onValueChange={(value) => setFormData({...formData, program_id: value})}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a program" />
                                </SelectTrigger>
                                <SelectContent>
                                    {programs.map(program => (
                                        <SelectItem key={program.id} value={program.id}>
                                            {program.program_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600" disabled={registerMutation.isPending}>
                            {registerMutation.isPending ? 'Creating account...' : 'Register'}
                        </Button>
                        <Button type="button" variant="link" className="w-full" onClick={() => window.location.href = '/ParticipantLogin'}>
                            Already have an account? Sign in
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}