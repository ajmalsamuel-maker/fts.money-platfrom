import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Headphones, Send, Mail, Phone, MessageCircle, CheckCircle, FileText } from 'lucide-react';

export default function PublicSupport() {
    const [pspSettings, setPspSettings] = useState(null);
    const [themeSettings, setThemeSettings] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [ticketId, setTicketId] = useState('');
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: 'general',
        priority: 'medium',
        requester_name: '',
        requester_email: '',
        requester_phone: '',
        merchant_id: ''
    });

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [psp, theme] = await Promise.all([
                    base44.entities.PSPSettings.list(),
                    base44.entities.ThemeSettings.list()
                ]);
                if (psp && psp.length > 0) setPspSettings(psp[0]);
                if (theme && theme.length > 0) setThemeSettings(theme[0]);
            } catch (error) {
                console.error('Failed to load settings');
            }
        };
        loadSettings();
    }, []);

    const createTicketMutation = useMutation({
        mutationFn: (ticketData) => {
            const newTicketId = `TKT-${Date.now()}`;
            setTicketId(newTicketId);
            return base44.entities.SupportTicket.create({
                ...ticketData,
                ticket_id: newTicketId,
                status: 'open'
            });
        },
        onSuccess: () => {
            setSubmitted(true);
        },
        onError: () => {
            alert('Failed to submit ticket. Please try again or email us directly.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.description || !formData.requester_email || !formData.requester_name) {
            alert('Please fill in all required fields');
            return;
        }
        createTicketMutation.mutate(formData);
    };

    const companyName = pspSettings?.company_name || 'netXhub.tech';
    const supportEmail = pspSettings?.support_email || 'support@netxhub.tech';
    const primaryColor = themeSettings?.primary_color || '#3b82f6';
    const logoUrl = themeSettings?.logo_url;

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full">
                    <CardContent className="pt-8">
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-3">Ticket Submitted Successfully!</h1>
                            <p className="text-slate-600 mb-6">
                                Your support ticket has been received and our team will respond shortly.
                            </p>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                <p className="text-sm text-slate-600 mb-2">Your Ticket Reference</p>
                                <p className="text-2xl font-mono font-bold text-blue-600">{ticketId}</p>
                                <p className="text-xs text-slate-500 mt-2">Please save this reference number for tracking your request</p>
                            </div>

                            <div className="text-left mb-6">
                                <h3 className="font-semibold mb-3">What happens next?</h3>
                                <ol className="space-y-2 text-sm text-slate-700">
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold text-blue-600">1.</span>
                                        <span>You'll receive a confirmation email at <strong>{formData.requester_email}</strong></span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold text-blue-600">2.</span>
                                        <span>Our support team will review your ticket based on priority</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="font-semibold text-blue-600">3.</span>
                                        <span>We'll respond within our SLA timeframe via email</span>
                                    </li>
                                </ol>
                            </div>

                            <div className="flex gap-3 justify-center">
                                <Button variant="outline" onClick={() => { setSubmitted(false); setFormData({ subject: '', description: '', category: 'general', priority: 'medium', requester_name: '', requester_email: '', requester_phone: '', merchant_id: '' }); }}>
                                    Submit Another Ticket
                                </Button>
                                <Button onClick={() => window.close()}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="h-12 object-contain" />
                        ) : (
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, #06b6d4)` }}>
                                <Headphones className="h-6 w-6 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Support Center</h1>
                            <p className="text-slate-600">{companyName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {/* Contact Options */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Email Support</p>
                                    <p className="text-sm text-slate-600">24/7 Response</p>
                                </div>
                            </div>
                            <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline text-sm">
                                {supportEmail}
                            </a>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Phone className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Phone Support</p>
                                    <p className="text-sm text-slate-600">Mon-Fri 9AM-6PM</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-700">
                                {pspSettings?.support_phone || '+1 (555) 123-4567'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <MessageCircle className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">Documentation</p>
                                    <p className="text-sm text-slate-600">Self-Service</p>
                                </div>
                            </div>
                            <a href="https://netxhub.tech/docs" className="text-blue-600 hover:underline text-sm">
                                View Documentation
                            </a>
                        </CardContent>
                    </Card>
                </div>

                {/* Ticket Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Submit a Support Ticket</CardTitle>
                        <p className="text-sm text-slate-600">Fill out the form below and our team will get back to you</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Alert>
                                <FileText className="h-4 w-4" />
                                <AlertDescription>
                                    All fields marked with * are required. We typically respond within 12-24 hours.
                                </AlertDescription>
                            </Alert>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Full Name *</Label>
                                    <Input
                                        value={formData.requester_name}
                                        onChange={(e) => setFormData({...formData, requester_name: e.target.value})}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Email Address *</Label>
                                    <Input
                                        type="email"
                                        value={formData.requester_email}
                                        onChange={(e) => setFormData({...formData, requester_email: e.target.value})}
                                        placeholder="john@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Phone Number (Optional)</Label>
                                    <Input
                                        type="tel"
                                        value={formData.requester_phone}
                                        onChange={(e) => setFormData({...formData, requester_phone: e.target.value})}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                                <div>
                                    <Label>Merchant ID (if applicable)</Label>
                                    <Input
                                        value={formData.merchant_id}
                                        onChange={(e) => setFormData({...formData, merchant_id: e.target.value})}
                                        placeholder="MID-..."
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Category *</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technical">Technical Issue</SelectItem>
                                            <SelectItem value="billing">Billing & Payments</SelectItem>
                                            <SelectItem value="onboarding">Onboarding Support</SelectItem>
                                            <SelectItem value="compliance">Compliance Question</SelectItem>
                                            <SelectItem value="general">General Inquiry</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Priority *</Label>
                                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low - General Question</SelectItem>
                                            <SelectItem value="medium">Medium - Need Assistance</SelectItem>
                                            <SelectItem value="high">High - Service Impacted</SelectItem>
                                            <SelectItem value="urgent">Urgent - Critical Issue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label>Subject *</Label>
                                <Input
                                    value={formData.subject}
                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                    placeholder="Brief description of your issue"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Description *</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Please provide detailed information about your issue..."
                                    rows={8}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Include relevant details like error messages, transaction IDs, or steps to reproduce the issue
                                </p>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700" 
                                disabled={createTicketMutation.isPending}
                            >
                                {createTicketMutation.isPending ? (
                                    <>Submitting...</>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        Submit Support Ticket
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* FAQ */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-slate-900 mb-2">How long does onboarding take?</h3>
                                <p className="text-sm text-slate-600">Typical onboarding is completed within 2-3 business days after all required documentation is submitted.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-slate-900 mb-2">When are settlements processed?</h3>
                                <p className="text-sm text-slate-600">Settlements are processed according to your agreement, typically T+1 to T+3 business days.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-slate-900 mb-2">How do I track my ticket?</h3>
                                <p className="text-sm text-slate-600">Save your ticket reference number. You'll receive email updates, or contact us with your ticket ID.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-slate-900 mb-2">What are your support hours?</h3>
                                <p className="text-sm text-slate-600">Email support is monitored 24/7. Phone support is available Monday-Friday, 9AM-6PM.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 bg-white border-t py-6">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-sm text-slate-500 mb-2">© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
                    <div className="flex justify-center gap-4 text-xs">
                        <a href="https://netxhub.tech/privacy" className="text-slate-500 hover:text-blue-600">Privacy Policy</a>
                        <a href="https://netxhub.tech/terms" className="text-slate-500 hover:text-blue-600">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    );
}