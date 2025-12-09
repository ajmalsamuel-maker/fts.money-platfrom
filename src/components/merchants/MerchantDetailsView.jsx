import React from 'react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    Calendar,
    Shield,
    AlertTriangle,
    DollarSign,
    CreditCard,
    FileText,
    Settings,
    CheckCircle,
    Users,
    Landmark,
    Eye,
    Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const statusConfig = {
    active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700' },
    terminated: { label: 'Terminated', className: 'bg-slate-100 text-slate-700' },
    onboarding: { label: 'Onboarding', className: 'bg-blue-100 text-blue-700' },
};

const riskConfig = {
    low: { label: 'Low', className: 'bg-emerald-100 text-emerald-700' },
    medium: { label: 'Medium', className: 'bg-amber-100 text-amber-700' },
    high: { label: 'High', className: 'bg-red-100 text-red-700' },
};

export default function MerchantDetailsView({ merchant, open, onOpenChange }) {
    if (!merchant) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-slate-50 sticky top-0 z-10">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-2xl mb-2">{merchant.business_name}</DialogTitle>
                            <div className="flex items-center gap-2 flex-wrap">
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

                <ScrollArea className="h-[calc(90vh-140px)] px-6 py-6">
                    <div className="space-y-8">
                        {/* Business Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Business Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <Label className="text-slate-500">Legal Business Name</Label>
                                    <p className="font-medium mt-1.5">{merchant.business_name}</p>
                                </div>
                                {merchant.trading_name && (
                                    <div>
                                        <Label className="text-slate-500">Trading Name</Label>
                                        <p className="font-medium mt-1.5">{merchant.trading_name}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-slate-500">Category</Label>
                                    <p className="font-medium mt-1.5 capitalize">{merchant.category?.replace('_', ' ') || 'N/A'}</p>
                                </div>
                                {merchant.mcc_code && (
                                    <div>
                                        <Label className="text-slate-500">MCC Code</Label>
                                        <p className="font-medium mt-1.5">{merchant.mcc_code}</p>
                                    </div>
                                )}
                                <div>
                                    <Label className="text-slate-500">Country</Label>
                                    <p className="font-medium mt-1.5">{merchant.country || 'N/A'}</p>
                                </div>
                                {merchant.currency && (
                                    <div>
                                        <Label className="text-slate-500">Currency</Label>
                                        <p className="font-medium mt-1.5">{merchant.currency}</p>
                                    </div>
                                )}
                                {merchant.industry && (
                                    <div>
                                        <Label className="text-slate-500">Industry</Label>
                                        <p className="font-medium mt-1.5 capitalize">{merchant.industry}</p>
                                    </div>
                                )}
                                {merchant.business_type && (
                                    <div>
                                        <Label className="text-slate-500">Business Type</Label>
                                        <p className="font-medium mt-1.5 capitalize">{merchant.business_type.replace('_', ' ')}</p>
                                    </div>
                                )}
                                {merchant.registration_number && (
                                    <div>
                                        <Label className="text-slate-500">Registration Number</Label>
                                        <p className="font-medium mt-1.5 font-mono text-sm">{merchant.registration_number}</p>
                                    </div>
                                )}
                                {merchant.tax_id && (
                                    <div>
                                        <Label className="text-slate-500">Tax ID</Label>
                                        <p className="font-medium mt-1.5 font-mono text-sm">{merchant.tax_id}</p>
                                    </div>
                                )}
                                {merchant.incorporation_date && (
                                    <div>
                                        <Label className="text-slate-500">Incorporation Date</Label>
                                        <p className="font-medium mt-1.5">{format(new Date(merchant.incorporation_date), 'MMM dd, yyyy')}</p>
                                    </div>
                                )}
                                {merchant.description && (
                                    <div className="col-span-2">
                                        <Label className="text-slate-500">Business Description</Label>
                                        <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">{merchant.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
                            </div>
                            <div className="space-y-4">
                                {merchant.contact_name && (
                                    <div className="flex items-start gap-3">
                                        <Users className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <Label className="text-slate-500">Contact Name</Label>
                                            <p className="font-medium mt-1">{merchant.contact_name}</p>
                                        </div>
                                    </div>
                                )}
                                {merchant.contact_email && (
                                    <div className="flex items-start gap-3">
                                        <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <Label className="text-slate-500">Email</Label>
                                            <a href={`mailto:${merchant.contact_email}`} className="text-blue-600 hover:underline font-medium block mt-1">
                                                {merchant.contact_email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {merchant.contact_phone && (
                                    <div className="flex items-start gap-3">
                                        <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <Label className="text-slate-500">Phone</Label>
                                            <p className="font-medium mt-1">{merchant.contact_phone}</p>
                                        </div>
                                    </div>
                                )}
                                {merchant.website && (
                                    <div className="flex items-start gap-3">
                                        <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <Label className="text-slate-500">Website</Label>
                                            <a href={merchant.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium block mt-1">
                                                {merchant.website}
                                            </a>
                                        </div>
                                    </div>
                                )}
                                {merchant.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div>
                                            <Label className="text-slate-500">Address</Label>
                                            <p className="font-medium text-sm mt-1 leading-relaxed">{merchant.address}</p>
                                        </div>
                                    </div>
                                )}
                                {merchant.primary_contact && (
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <Label className="text-blue-900 font-semibold">Primary Contact</Label>
                                        <div className="grid grid-cols-2 gap-3 mt-3">
                                            {merchant.primary_contact.name && (
                                                <div>
                                                    <Label className="text-xs text-blue-700">Name</Label>
                                                    <p className="text-sm font-medium text-blue-900 mt-0.5">{merchant.primary_contact.name}</p>
                                                </div>
                                            )}
                                            {merchant.primary_contact.email && (
                                                <div>
                                                    <Label className="text-xs text-blue-700">Email</Label>
                                                    <p className="text-sm font-medium text-blue-900 mt-0.5">{merchant.primary_contact.email}</p>
                                                </div>
                                            )}
                                            {merchant.primary_contact.phone && (
                                                <div>
                                                    <Label className="text-xs text-blue-700">Phone</Label>
                                                    <p className="text-sm font-medium text-blue-900 mt-0.5">{merchant.primary_contact.phone}</p>
                                                </div>
                                            )}
                                            {merchant.primary_contact.role && (
                                                <div>
                                                    <Label className="text-xs text-blue-700">Role</Label>
                                                    <p className="text-sm font-medium text-blue-900 mt-0.5 capitalize">{merchant.primary_contact.role}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Compliance & Verification */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Compliance & Verification</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">KYB Verification</p>
                                            <p className="text-xs text-slate-500">Know Your Business</p>
                                            {merchant.kyb_provider && (
                                                <p className="text-xs text-slate-400 mt-0.5">Provider: {merchant.kyb_provider}</p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge className={cn(
                                        merchant.kyb_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                        merchant.kyb_status === 'pending_review' ? 'bg-amber-100 text-amber-700' :
                                        merchant.kyb_status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-700'
                                    )}>
                                        {merchant.kyb_status?.replace('_', ' ') || 'Not Started'}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                                        <div>
                                            <p className="font-medium">AML Screening</p>
                                            <p className="text-xs text-slate-500">Anti-Money Laundering</p>
                                            {merchant.aml_provider && (
                                                <p className="text-xs text-slate-400 mt-0.5">Provider: {merchant.aml_provider}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={cn(
                                            merchant.aml_status === 'clear' ? 'bg-emerald-100 text-emerald-700' :
                                            merchant.aml_status === 'monitoring' ? 'bg-amber-100 text-amber-700' :
                                            merchant.aml_status === 'flagged' ? 'bg-red-100 text-red-700' :
                                            merchant.aml_status === 'blocked' ? 'bg-red-100 text-red-700' :
                                            'bg-slate-100 text-slate-700'
                                        )}>
                                            {merchant.aml_status?.replace('_', ' ') || 'Not Started'}
                                        </Badge>
                                        {merchant.aml_risk_score !== null && merchant.aml_risk_score !== undefined && (
                                            <p className="text-xs text-slate-500 mt-1">Risk Score: {merchant.aml_risk_score}/100</p>
                                        )}
                                    </div>
                                </div>

                                {merchant.lei && (
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3">
                                            <Landmark className="h-5 w-5 text-slate-600" />
                                            <div>
                                                <p className="font-medium">Legal Entity Identifier (LEI)</p>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5">{merchant.lei}</p>
                                                {merchant.vlei && (
                                                    <p className="text-xs text-purple-600 mt-1">vLEI: {merchant.vlei}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={cn(
                                                merchant.lei_status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                                merchant.lei_status === 'expired' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            )}>
                                                {merchant.lei_status || 'pending'}
                                            </Badge>
                                            {merchant.lei_verified_date && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Verified: {format(new Date(merchant.lei_verified_date), 'MMM dd, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {merchant.kyb_reference_id && (
                                        <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                            <Label className="text-slate-500 text-xs">KYB Reference</Label>
                                            <p className="font-mono text-sm mt-1">{merchant.kyb_reference_id}</p>
                                        </div>
                                    )}
                                    {merchant.aml_last_check && (
                                        <div className="p-3 bg-white border border-slate-200 rounded-lg">
                                            <Label className="text-slate-500 text-xs">Last AML Check</Label>
                                            <p className="font-medium text-sm mt-1">{format(new Date(merchant.aml_last_check), 'MMM dd, yyyy')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Company Structure */}
                        {(merchant.directors?.length > 0 || merchant.beneficial_owners?.length > 0) && (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-slate-900">Company Structure</h3>
                                    </div>
                                    
                                    {merchant.directors?.length > 0 && (
                                        <div>
                                            <Label className="text-slate-700 font-medium mb-2 block">Directors</Label>
                                            <div className="space-y-2">
                                                {merchant.directors.map((director, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                        <p className="font-medium">{director.name}</p>
                                                        {director.role && <p className="text-sm text-slate-500 capitalize">{director.role}</p>}
                                                        {director.nationality && <p className="text-sm text-slate-500">Nationality: {director.nationality}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {merchant.beneficial_owners?.length > 0 && (
                                        <div className="mt-4">
                                            <Label className="text-slate-700 font-medium mb-2 block">Beneficial Owners (UBOs)</Label>
                                            <div className="space-y-2">
                                                {merchant.beneficial_owners.map((owner, idx) => (
                                                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="font-medium">{owner.name}</p>
                                                                {owner.ownership_percentage && (
                                                                    <p className="text-sm text-slate-500">Ownership: {owner.ownership_percentage}%</p>
                                                                )}
                                                            </div>
                                                            {owner.is_pep && (
                                                                <Badge className="bg-amber-100 text-amber-700 text-xs">PEP</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Financial Information */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Financial Metrics</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-emerald-600" />
                                        <p className="text-sm text-emerald-700 font-medium">Total Volume</p>
                                    </div>
                                    <p className="text-3xl font-bold text-emerald-900">${(merchant.total_volume || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard className="h-5 w-5 text-blue-600" />
                                        <p className="text-sm text-blue-700 font-medium">Total Transactions</p>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-900">{(merchant.total_transactions || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                    <Label className="text-slate-500 text-xs">Processing Limit</Label>
                                    <p className="text-xl font-bold mt-1">${(merchant.processing_volume || 0).toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                    <Label className="text-slate-500 text-xs">Fee Rate</Label>
                                    <p className="text-xl font-bold mt-1">{merchant.fee_rate || 2.5}%</p>
                                </div>
                                {merchant.settlement_period && (
                                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                        <Label className="text-slate-500 text-xs">Settlement Period</Label>
                                        <p className="font-medium mt-1">{merchant.settlement_period}</p>
                                    </div>
                                )}
                                {merchant.monthly_volume && (
                                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                                        <Label className="text-slate-500 text-xs">Expected Monthly Volume</Label>
                                        <p className="font-medium mt-1">{merchant.monthly_volume}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Bank Details */}
                        {(merchant.bank_name || merchant.account_number) && (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Landmark className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-slate-900">Bank Details</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {merchant.bank_name && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-slate-500 text-xs">Bank Name</Label>
                                                <p className="font-medium mt-1">{merchant.bank_name}</p>
                                            </div>
                                        )}
                                        {merchant.account_holder_name && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-slate-500 text-xs">Account Holder</Label>
                                                <p className="font-medium mt-1">{merchant.account_holder_name}</p>
                                            </div>
                                        )}
                                        {merchant.account_number && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-slate-500 text-xs">Account Number</Label>
                                                <p className="font-mono mt-1">****{merchant.account_number.slice(-4)}</p>
                                            </div>
                                        )}
                                        {merchant.swift_code && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-slate-500 text-xs">SWIFT/BIC Code</Label>
                                                <p className="font-mono mt-1">{merchant.swift_code}</p>
                                            </div>
                                        )}
                                        {merchant.routing_number && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-slate-500 text-xs">Routing Number</Label>
                                                <p className="font-mono mt-1">{merchant.routing_number}</p>
                                            </div>
                                        )}
                                        {merchant.settlement_currency && (
                                            <div className="p-3 bg-slate-50 rounded-lg">
                                                <Label className="text-slate-500 text-xs">Settlement Currency</Label>
                                                <p className="font-medium mt-1">{merchant.settlement_currency}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Documents */}
                        {merchant.documents && merchant.documents.length > 0 && (
                            <>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {merchant.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-slate-400" />
                                                    <div>
                                                        <p className="font-medium">{doc.type || doc.file_name}</p>
                                                        {doc.status && (
                                                            <Badge className={cn(
                                                                "text-xs mt-1",
                                                                doc.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                                                                doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            )}>
                                                                {doc.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {doc.upload_date && (
                                                        <span className="text-xs text-slate-500">
                                                            {format(new Date(doc.upload_date), 'MMM dd, yyyy')}
                                                        </span>
                                                    )}
                                                    {doc.file_url && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => window.open(doc.file_url, '_blank')}
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Settings & Configuration */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Settings className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Account Settings</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {merchant.onboarding_token && (
                                    <div className="col-span-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                        <Label className="text-purple-700 font-medium text-xs">Self-Onboarding Token</Label>
                                        <p className="font-mono text-sm mt-1 text-purple-900">{merchant.onboarding_token}</p>
                                        {merchant.onboarding_url_expires && (
                                            <p className="text-xs text-purple-600 mt-1">
                                                Expires: {format(new Date(merchant.onboarding_url_expires), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Timeline */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-slate-900">Timeline</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <Label className="text-slate-500 text-xs">Created</Label>
                                        <p className="font-medium mt-1">
                                            {merchant.created_date ? format(new Date(merchant.created_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                        </p>
                                        {merchant.created_by && (
                                            <p className="text-xs text-slate-500 mt-1">by {merchant.created_by}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <div>
                                        <Label className="text-slate-500 text-xs">Last Updated</Label>
                                        <p className="font-medium mt-1">
                                            {merchant.updated_date ? format(new Date(merchant.updated_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}