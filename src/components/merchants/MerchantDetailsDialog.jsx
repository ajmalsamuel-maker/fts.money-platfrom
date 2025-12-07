import React from 'react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    Building,
    Mail,
    Phone,
    Globe,
    MapPin,
    Calendar,
    Shield,
    AlertTriangle,
    DollarSign,
    CreditCard,
    FileText
} from 'lucide-react';
import MerchantDocumentsTab from './MerchantDocumentsTab';

const statusConfig = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700' },
    terminated: { label: 'Terminated', className: 'bg-slate-100 text-slate-700' },
};

const riskConfig = {
    low: { label: 'Low', className: 'bg-emerald-100 text-emerald-700' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
    high: { label: 'High', className: 'bg-red-100 text-red-700' },
};

export default function MerchantDetailsDialog({ merchant, open, onOpenChange }) {
    if (!merchant) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Building className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-xl mb-2">{merchant.business_name}</DialogTitle>
                            <div className="flex items-center gap-2">
                                <Badge className={statusConfig[merchant.status]?.className}>
                                    {statusConfig[merchant.status]?.label}
                                </Badge>
                                <Badge variant="outline" className={riskConfig[merchant.risk_level]?.className}>
                                    {riskConfig[merchant.risk_level]?.label} Risk
                                </Badge>
                                <span className="text-sm text-slate-500">
                                    ID: <span className="font-mono text-blue-600">{merchant.merchant_id}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="mt-6">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="financial">Financial</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6 mt-6">
                        {/* Business Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Business Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-slate-500">Legal Name</Label>
                                    <p className="font-medium">{merchant.business_name}</p>
                                </div>
                                {merchant.trading_name && (
                                    <div>
                                        <Label className="text-slate-500">Trading Name</Label>
                                        <p className="font-medium">{merchant.trading_name}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-slate-500">Category</Label>
                                    <p className="font-medium capitalize">{merchant.category?.replace('_', ' ') || 'N/A'}</p>
                                </div>
                                <div>
                                    <Label className="text-slate-500">Country</Label>
                                    <p className="font-medium">{merchant.country || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-slate-900">Contact Information</h3>
                            <div className="space-y-3">
                                {merchant.contact_name && (
                                    <div className="flex items-center gap-3">
                                        <Building className="h-4 w-4 text-slate-400" />
                                        <span>{merchant.contact_name}</span>
                                    </div>
                                )}
                                {merchant.contact_email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <a href={`mailto:${merchant.contact_email}`} className="text-blue-600 hover:underline">
                                            {merchant.contact_email}
                                        </a>
                                    </div>
                                )}
                                {merchant.contact_phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span>{merchant.contact_phone}</span>
                                    </div>
                                )}
                                {merchant.website && (
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-4 w-4 text-slate-400" />
                                        <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {merchant.website}
                                        </a>
                                    </div>
                                )}
                                {merchant.address && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span className="text-sm">{merchant.address}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="font-semibold text-slate-900">Timeline</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Created</p>
                                        <p className="text-sm font-medium">
                                            {merchant.created_date ? format(new Date(merchant.created_date), 'MMM dd, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <div>
                                        <p className="text-xs text-slate-500">Last Updated</p>
                                        <p className="text-sm font-medium">
                                            {merchant.updated_date ? format(new Date(merchant.updated_date), 'MMM dd, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-6 mt-6">
                        {/* KYB/AML Status */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Verification Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">KYB Status</p>
                                            <p className="text-xs text-slate-500">Know Your Business</p>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        merchant.kyb_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        merchant.kyb_status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-700'
                                    )}>
                                        {merchant.kyb_status || 'N/A'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                        <div>
                                            <p className="font-medium">AML Status</p>
                                            <p className="text-xs text-slate-500">Anti-Money Laundering</p>
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        merchant.aml_status === 'clear' ? 'bg-emerald-100 text-emerald-700' :
                                        merchant.aml_status === 'monitoring' ? 'bg-amber-100 text-amber-700' :
                                        merchant.aml_status === 'flagged' ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-700'
                                    )}>
                                        {merchant.aml_status || 'N/A'}
                                    </Badge>
                                </div>

                                {merchant.aml_risk_score !== null && merchant.aml_risk_score !== undefined && (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-slate-600" />
                                            <div>
                                                <p className="font-medium">AML Risk Score</p>
                                                <p className="text-xs text-slate-500">0-100 scale</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-bold">{merchant.aml_risk_score}/100</span>
                                    </div>
                                )}

                                {merchant.lei && (
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-slate-600" />
                                            <div>
                                                <p className="font-medium">LEI Status</p>
                                                <p className="text-xs text-slate-500 font-mono">{merchant.lei}</p>
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            merchant.lei_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                            'bg-amber-100 text-amber-700'
                                        )}>
                                            {merchant.lei_status || 'pending'}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="documents" className="space-y-6 mt-6">
                        <MerchantDocumentsTab merchant={merchant} />
                    </TabsContent>

                    <TabsContent value="financial" className="space-y-6 mt-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Financial Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-slate-400" />
                                        <p className="text-xs text-slate-500">Total Volume</p>
                                    </div>
                                    <p className="text-2xl font-bold">${(merchant.total_volume || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-4 w-4 text-slate-400" />
                                        <p className="text-xs text-slate-500">Transactions</p>
                                    </div>
                                    <p className="text-2xl font-bold">{(merchant.total_transactions || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-slate-400" />
                                        <p className="text-xs text-slate-500">Processing Limit</p>
                                    </div>
                                    <p className="text-lg font-bold">${(merchant.processing_volume || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-slate-400" />
                                        <p className="text-xs text-slate-500">Fee Rate</p>
                                    </div>
                                    <p className="text-lg font-bold">{merchant.fee_rate || 2.5}%</p>
                                </div>
                            </div>
                        </div>

                        {merchant.settlement_period && (
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="font-semibold text-slate-900">Settlement</h3>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <Label className="text-slate-500">Settlement Period</Label>
                                    <p className="font-medium">{merchant.settlement_period}</p>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6 mt-6">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-900">Account Settings</h3>
                            <div className="space-y-3">
                                {merchant.kyb_provider && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <Label className="text-slate-500">KYB Provider</Label>
                                        <p className="font-medium">{merchant.kyb_provider}</p>
                                    </div>
                                )}
                                {merchant.aml_provider && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <Label className="text-slate-500">AML Provider</Label>
                                        <p className="font-medium">{merchant.aml_provider}</p>
                                    </div>
                                )}
                                {merchant.currency && (
                                    <div className="p-3 bg-slate-50 rounded-lg">
                                        <Label className="text-slate-500">Currency</Label>
                                        <p className="font-medium">{merchant.currency}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}