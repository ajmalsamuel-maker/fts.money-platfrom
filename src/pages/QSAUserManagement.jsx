import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, UserPlus, Copy, Ban, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function QSAUserManagement() {
    const { user, loading } = usePlatformAuth();
    const [inviteDialog, setInviteDialog] = useState(false);
    const queryClient = useQueryClient();

    const { data: qsaUsers, isLoading } = useQuery({
        queryKey: ['qsa-users'],
        queryFn: () => base44.entities.QSAUser.list('-created_date'),
        enabled: !loading
    });

    const { data: accessLogs } = useQuery({
        queryKey: ['qsa-access-logs'],
        queryFn: () => base44.entities.QSAAccessLog.list('-created_date', 100),
        enabled: !loading
    });

    const createQSAMutation = useMutation({
        mutationFn: (data) => base44.entities.QSAUser.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['qsa-users']);
            setInviteDialog(false);
            toast.success('QSA user invited successfully');
        }
    });

    const revokeAccessMutation = useMutation({
        mutationFn: (id) => base44.entities.QSAUser.update(id, { status: 'revoked' }),
        onSuccess: () => {
            queryClient.invalidateQueries(['qsa-users']);
            toast.success('Access revoked');
        }
    });

    const regenerateTokenMutation = useMutation({
        mutationFn: async (qsaUser) => {
            const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const newExpiry = new Date();
            newExpiry.setDate(newExpiry.getDate() + 90); // 90 days
            
            return base44.entities.QSAUser.update(qsaUser.id, {
                access_token: newToken,
                token_expires: newExpiry.toISOString(),
                status: 'active'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['qsa-users']);
            toast.success('Access token regenerated');
        }
    });

    if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

    const activeUsers = qsaUsers?.filter(u => u.status === 'active') || [];
    const expiredUsers = qsaUsers?.filter(u => u.status === 'expired' || new Date(u.token_expires) < new Date()) || [];

    return (
        <div className="flex min-h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="QSAUserManagement"
                userRole={user?.platform_role}
                userEmail={user?.email}
                isSuperAdmin={user?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 ml-64">
                <main className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">QSA User Management</h1>
                            <p className="text-slate-600">Manage external auditor access to compliance portal</p>
                        </div>
                        <InviteQSADialog 
                            open={inviteDialog}
                            onOpenChange={setInviteDialog}
                            invitedBy={user?.email}
                            onSubmit={(data) => createQSAMutation.mutate(data)}
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Active QSA Users</CardDescription>
                                <CardTitle className="text-3xl">{activeUsers.length}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Expired/Revoked</CardDescription>
                                <CardTitle className="text-3xl">{expiredUsers.length}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Total Access Logs</CardDescription>
                                <CardTitle className="text-3xl">{accessLogs?.length || 0}</CardTitle>
                            </CardHeader>
                        </Card>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Recent Logins (24h)</CardDescription>
                                <CardTitle className="text-3xl">
                                    {accessLogs?.filter(log => {
                                        const logDate = new Date(log.created_date);
                                        const oneDayAgo = new Date();
                                        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                                        return log.action_type === 'login' && logDate > oneDayAgo;
                                    }).length || 0}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* QSA Users List */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>QSA Users</CardTitle>
                            <CardDescription>External auditors with portal access</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {qsaUsers?.map((qsa) => {
                                    const isExpired = new Date(qsa.token_expires) < new Date();
                                    const statusColor = qsa.status === 'active' && !isExpired ? 'default' : 
                                                       qsa.status === 'revoked' ? 'destructive' : 'secondary';
                                    
                                    return (
                                        <div key={qsa.id} className="p-4 bg-slate-50 rounded-lg border">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <p className="font-semibold">{qsa.qsa_name}</p>
                                                        <Badge variant={statusColor}>
                                                            {isExpired ? 'expired' : qsa.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{qsa.qsa_email}</p>
                                                    <p className="text-sm text-slate-500">{qsa.qsa_company}</p>
                                                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                                        <span>Expires: {new Date(qsa.token_expires).toLocaleDateString()}</span>
                                                        <span>Logins: {qsa.login_count || 0}</span>
                                                        {qsa.last_login && <span>Last: {new Date(qsa.last_login).toLocaleDateString()}</span>}
                                                    </div>
                                                    <div className="mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                                {qsa.access_token}
                                                            </code>
                                                            <Button 
                                                                size="sm" 
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(qsa.access_token);
                                                                    toast.success('Token copied');
                                                                }}
                                                            >
                                                                <Copy className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => regenerateTokenMutation.mutate(qsa)}
                                                    >
                                                        <RefreshCw className="h-3 w-3 mr-1" />
                                                        Regenerate
                                                    </Button>
                                                    {qsa.status === 'active' && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive"
                                                            onClick={() => revokeAccessMutation.mutate(qsa.id)}
                                                        >
                                                            <Ban className="h-3 w-3 mr-1" />
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {qsaUsers?.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">No QSA users yet. Click "Invite QSA User" to add one.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Access Logs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Access Logs</CardTitle>
                            <CardDescription>Audit trail of QSA portal activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {accessLogs?.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm">
                                        <div className="flex-1">
                                            <span className="font-medium">{log.qsa_email}</span>
                                            <span className="text-slate-500 mx-2">•</span>
                                            <span className="text-slate-600">{log.action_type.replace('_', ' ')}</span>
                                            {log.details && (
                                                <>
                                                    <span className="text-slate-500 mx-2">•</span>
                                                    <span className="text-slate-500">{log.details}</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                                {log.status}
                                            </Badge>
                                            <span className="text-xs text-slate-500">
                                                {new Date(log.created_date).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {accessLogs?.length === 0 && (
                                    <p className="text-center text-slate-500 py-8">No access logs yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

function InviteQSADialog({ open, onOpenChange, invitedBy, onSubmit }) {
    const [formData, setFormData] = useState({
        qsa_name: '',
        qsa_email: '',
        qsa_company: '',
        duration_days: '90'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const accessToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(formData.duration_days));
        
        onSubmit({
            ...formData,
            access_token: accessToken,
            token_expires: expiryDate.toISOString(),
            status: 'active',
            invited_by: invitedBy,
            login_count: 0
        });
        
        setFormData({ qsa_name: '', qsa_email: '', qsa_company: '', duration_days: '90' });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite QSA User
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite QSA User</DialogTitle>
                    <DialogDescription>Grant time-limited access to external auditor</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">QSA Name</label>
                        <Input
                            value={formData.qsa_name}
                            onChange={(e) => setFormData({...formData, qsa_name: e.target.value})}
                            placeholder="John Smith"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">QSA Email</label>
                        <Input
                            type="email"
                            value={formData.qsa_email}
                            onChange={(e) => setFormData({...formData, qsa_email: e.target.value})}
                            placeholder="john@auditfirm.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">QSA Company</label>
                        <Input
                            value={formData.qsa_company}
                            onChange={(e) => setFormData({...formData, qsa_company: e.target.value})}
                            placeholder="ABC Audit Firm"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Access Duration</label>
                        <Select value={formData.duration_days} onValueChange={(v) => setFormData({...formData, duration_days: v})}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">30 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                                <SelectItem value="90">90 days (recommended)</SelectItem>
                                <SelectItem value="180">180 days</SelectItem>
                                <SelectItem value="365">365 days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Generate Access & Invite</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}