import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Headphones, 
    Send, 
    CheckCircle, 
    Clock, 
    AlertCircle,
    MessageCircle,
    Mail,
    Phone,
    FileText,
    Search,
    Plus,
    X
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Support() {
    const [pspSettings, setPspSettings] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
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

    const queryClient = useQueryClient();

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await base44.entities.PSPSettings.list();
                if (settings && settings.length > 0) {
                    setPspSettings(settings[0]);
                }
            } catch (error) {
                console.error('Failed to load PSP settings');
            }
        };
        loadSettings();
    }, []);

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ['support-tickets'],
        queryFn: () => base44.entities.SupportTicket.list('-created_date', 50)
    });

    const createTicketMutation = useMutation({
        mutationFn: (ticketData) => {
            const ticketId = `TKT-${Date.now()}`;
            return base44.entities.SupportTicket.create({
                ...ticketData,
                ticket_id: ticketId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['support-tickets']);
            setShowForm(false);
            setFormData({
                subject: '',
                description: '',
                category: 'general',
                priority: 'medium',
                requester_name: '',
                requester_email: '',
                requester_phone: '',
                merchant_id: ''
            });
            alert('✓ Support ticket created successfully! We\'ll get back to you soon.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.description || !formData.requester_email) {
            alert('Please fill in all required fields');
            return;
        }
        createTicketMutation.mutate(formData);
    };

    const companyName = pspSettings?.company_name || 'netXhub.tech';
    const supportEmail = pspSettings?.support_email || 'support@netxhub.tech';

    const statusColors = {
        open: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-amber-100 text-amber-700',
        waiting_for_customer: 'bg-purple-100 text-purple-700',
        resolved: 'bg-green-100 text-green-700',
        closed: 'bg-slate-100 text-slate-700'
    };

    const priorityColors = {
        low: 'bg-slate-100 text-slate-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700'
    };

    const filteredTickets = tickets.filter(ticket =>
        ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticket_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Headphones className="h-10 w-10 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Support Center</h1>
                                <p className="text-slate-600">{companyName}</p>
                            </div>
                        </div>
                        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4 mr-2" />
                            New Ticket
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Contact Cards */}
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
                            <p className="text-blue-600 text-sm">
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

                {/* New Ticket Form */}
                {showForm && (
                    <Card className="mb-8">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Create Support Ticket</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                        <Label>Phone Number</Label>
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
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="urgent">Urgent</SelectItem>
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
                                        rows={6}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={createTicketMutation.isPending}>
                                        {createTicketMutation.isPending ? (
                                            <>Creating...</>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Submit Ticket
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Tickets List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Your Support Tickets</CardTitle>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search tickets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-64"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-12 text-slate-500">Loading tickets...</div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No support tickets found</p>
                                <Button onClick={() => setShowForm(true)} className="mt-4" variant="outline">
                                    Create Your First Ticket
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTickets.map((ticket) => (
                                    <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-sm text-slate-500">{ticket.ticket_id}</span>
                                                    <Badge className={statusColors[ticket.status]}>
                                                        {ticket.status.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge variant="outline" className={priorityColors[ticket.priority]}>
                                                        {ticket.priority}
                                                    </Badge>
                                                </div>
                                                <h3 className="font-semibold text-slate-900 mb-1">{ticket.subject}</h3>
                                                <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(ticket.created_date).toLocaleDateString()}
                                            </span>
                                            <span>{ticket.category}</span>
                                            {ticket.assigned_to && <span>Assigned to: {ticket.assigned_to}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* FAQ Section */}
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
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
                                <h3 className="font-semibold text-slate-900 mb-2">How do I handle chargebacks?</h3>
                                <p className="text-sm text-slate-600">Access the Chargebacks section in your dashboard to view, respond to, and manage disputes with supporting documentation.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="font-semibold text-slate-900 mb-2">Where can I find API documentation?</h3>
                                <p className="text-sm text-slate-600">Complete API documentation is available at <a href="https://netxhub.tech/docs" className="text-blue-600 hover:underline">netxhub.tech/docs</a></p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 bg-white border-t py-6">
                <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} {companyName}. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}