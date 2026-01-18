import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { 
    CheckSquare, Clock, CheckCircle, XCircle, Eye, AlertTriangle, Store, Terminal, Users, Globe
} from 'lucide-react';
import { format } from 'date-fns';

const typeIcons = { merchant_onboarding: Store, terminal_creation: Terminal, user_creation: Users, processor_connection: Globe };
const typeLabels = { merchant_onboarding: 'Merchant Onboarding', terminal_creation: 'Terminal Creation', user_creation: 'User Creation', processor_connection: 'Processor Connection' };

export default function Approvals() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const queryClient = useQueryClient();

    const { data: requests = [] } = useQuery({
        queryKey: ['approval-requests'],
        queryFn: () => base44.entities.ApprovalRequest.list('-created_date'),
    });

    const updateRequest = useMutation({
        mutationFn: ({ id, data }) => base44.entities.ApprovalRequest.update(id, data),
        onSuccess: () => { 
            queryClient.invalidateQueries({ queryKey: ['approval-requests'] });
            queryClient.invalidateQueries({ queryKey: ['merchants'] }, { exact: false });
            setSelectedRequest(null);
            setReviewComment('');
        }
    });

    const handleApprove = async () => {
        // Update approval status
        updateRequest.mutate({ 
            id: selectedRequest.id, 
            data: { 
                status: 'approved', 
                review_comments: reviewComment, 
                review_date: new Date().toISOString(), 
                reviewed_by: 'current_user' 
            } 
        });
        
        // If it's a merchant onboarding approval, generate API credentials
        if (selectedRequest.request_type === 'merchant_onboarding' && selectedRequest.entity_id) {
            try {
                const merchants = await base44.entities.Merchant.filter({ id: selectedRequest.entity_id });
                const merchant = merchants[0];

                if (merchant) {
                    const pspCode = JSON.parse(localStorage.getItem('staff_session') || '{}').psp_code;

                    // Update merchant status in PostgreSQL (PSP schema)
                    if (pspCode) {
                        const merchantId = merchant.merchant_id || merchant.id;
                        await base44.functions.invoke('pspData', {
                            action: 'updateMerchant',
                            psp_code: pspCode,
                            merchantId: merchantId,
                            updates: { status: 'active' }
                        });
                    }

                    // Also update Base44 entity for consistency
                    await base44.entities.Merchant.update(merchant.id, { status: 'active' });
                    
                    // Generate API keys for sandbox and production
                    const environments = ['sandbox', 'production'];
                    
                    for (const env of environments) {
                        const apiKey = `pk_${env}_${crypto.randomUUID().replace(/-/g, '')}`;
                        const apiSecret = `sk_${env}_${crypto.randomUUID().replace(/-/g, '')}`;
                        
                        await base44.entities.APIKey.create({
                            merchant_id: merchant.id,
                            merchant_name: merchant.business_name,
                            key_name: `${env === 'sandbox' ? 'Test' : 'Live'} API Key`,
                            api_key: apiKey,
                            api_secret: apiSecret,
                            key_prefix: apiKey.substring(0, 8),
                            environment: env,
                            permissions: [
                                'create_payment', 'capture_payment', 'refund_payment', 
                                'void_payment', 'tokenize_card', 'get_transaction', 
                                'list_transactions', 'create_webhook', 'list_webhooks'
                            ],
                            rate_limit: env === 'sandbox' ? 100 : 1000,
                            status: 'active',
                            allowed_ips: []
                        });
                    }
                    
                    // Send welcome email with credentials info
                    await base44.integrations.Core.SendEmail({
                        to: merchant.contact_email,
                        subject: `Welcome to PaymentHub - Merchant Approved!`,
                        body: `
                            <h2>Congratulations! Your Merchant Account is Approved</h2>
                            <p>Hello ${merchant.business_name},</p>
                            <p>We're excited to inform you that your merchant application has been approved!</p>
                            
                            <h3>Your Account Details:</h3>
                            <ul>
                                <li><strong>Merchant Code:</strong> ${merchant.merchant_code}</li>
                                <li><strong>Business Name:</strong> ${merchant.business_name}</li>
                                <li><strong>Status:</strong> Active</li>
                            </ul>
                            
                            <h3>API Credentials Generated:</h3>
                            <p>We've automatically generated API credentials for both sandbox (testing) and production environments.</p>
                            <p>You can access your API keys by logging into the merchant portal:</p>
                            <ol>
                                <li>Go to Settings → API Credentials</li>
                                <li>View your sandbox and production API keys</li>
                                <li>Copy and securely store your credentials</li>
                            </ol>
                            
                            <h3>Next Steps:</h3>
                            <ol>
                                <li>Login to your merchant portal using your merchant code</li>
                                <li>Complete your profile settings</li>
                                <li>Access your API credentials in Settings</li>
                                <li>Review our API documentation</li>
                                <li>Start processing test payments in sandbox mode</li>
                            </ol>
                            
                            <p><strong>Important Security Notice:</strong> Your API credentials provide access to your payment processing. Keep them secure and never share them publicly.</p>
                            
                            <p>If you have any questions or need assistance with integration, our support team is here to help.</p>
                            
                            <p>Welcome aboard!</p>
                        `
                    });
                }
            } catch (error) {
                console.error('Error generating API credentials:', error);
            }
        }
    };

    const handleReject = () => {
        updateRequest.mutate({ id: selectedRequest.id, data: { status: 'rejected', review_comments: reviewComment, review_date: new Date().toISOString(), reviewed_by: 'current_user' } });
    };

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const processedRequests = requests.filter(r => r.status !== 'pending');

    const RequestCard = ({ request }) => {
        const Icon = typeIcons[request.request_type] || CheckSquare;
        return (
            <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedRequest(request)}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", request.priority === 'urgent' ? "bg-red-100" : "bg-blue-100")}>
                            <Icon className={cn("h-5 w-5", request.priority === 'urgent' ? "text-red-600" : "text-blue-600")} />
                        </div>
                        <div>
                            <p className="font-medium">{typeLabels[request.request_type] || request.request_type}</p>
                            <p className="text-sm text-slate-500">By {request.submitted_by_name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400 mt-1">{request.created_date && format(new Date(request.created_date), 'MMM d, yyyy HH:mm')}</p>
                        </div>
                    </div>
                    <Badge className={cn(request.priority === 'urgent' ? 'bg-red-100 text-red-700' : request.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100')}>{request.priority}</Badge>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Approvals" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-56")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold">Approval Queue</h1>
                        <p className="text-slate-500">Review and approve pending requests (Maker-Checker)</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card className="p-4"><div className="flex items-center gap-3"><Clock className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">{pendingRequests.length}</p><p className="text-sm text-slate-500">Pending</p></div></div></Card>
                        <Card className="p-4"><div className="flex items-center gap-3"><CheckCircle className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">{requests.filter(r => r.status === 'approved').length}</p><p className="text-sm text-slate-500">Approved</p></div></div></Card>
                        <Card className="p-4"><div className="flex items-center gap-3"><XCircle className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">{requests.filter(r => r.status === 'rejected').length}</p><p className="text-sm text-slate-500">Rejected</p></div></div></Card>
                    </div>

                    <Tabs defaultValue="pending">
                        <TabsList><TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger><TabsTrigger value="processed">Processed</TabsTrigger></TabsList>
                        <TabsContent value="pending" className="mt-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pendingRequests.length === 0 ? <p className="col-span-full text-center py-12 text-slate-500">No pending requests</p> : pendingRequests.map(r => <RequestCard key={r.id} request={r} />)}
                            </div>
                        </TabsContent>
                        <TabsContent value="processed" className="mt-4">
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {processedRequests.map(r => (
                                    <Card key={r.id} className="p-4 opacity-75">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium">{typeLabels[r.request_type]}</p>
                                            <Badge className={r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>{r.status}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 mt-1">Reviewed by {r.reviewed_by_name || 'N/A'}</p>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                        <DialogContent className="max-w-lg">
                            <DialogHeader><DialogTitle>Review Request</DialogTitle></DialogHeader>
                            {selectedRequest && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="font-medium">{typeLabels[selectedRequest.request_type]}</p>
                                        <p className="text-sm text-slate-500">Submitted by: {selectedRequest.submitted_by_name}</p>
                                        <p className="text-sm text-slate-500">Date: {selectedRequest.created_date && format(new Date(selectedRequest.created_date), 'PPpp')}</p>
                                    </div>
                                    {selectedRequest.entity_data && (
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <p className="text-sm font-medium mb-2">Request Details:</p>
                                            <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(selectedRequest.entity_data, null, 2)}</pre>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Review Comments</p>
                                        <Textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Add comments..." />
                                    </div>
                                </div>
                            )}
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleReject} className="gap-2"><XCircle className="h-4 w-4" />Reject</Button>
                                <Button onClick={handleApprove} className="gap-2 bg-emerald-600 hover:bg-emerald-700"><CheckCircle className="h-4 w-4" />Approve</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </main>
            </div>
        </div>
    );
}