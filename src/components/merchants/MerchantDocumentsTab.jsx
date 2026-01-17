import React from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    FileText, 
    Download, 
    CheckCircle, 
    Clock, 
    AlertTriangle,
    Eye,
    Upload
} from 'lucide-react';
import { cn } from "@/lib/utils";

const documentTypes = {
    certificate_incorporation: 'Certificate of Incorporation',
    business_license: 'Business License',
    director_id: 'Director ID',
    proof_of_address: 'Proof of Address',
    bank_statement: 'Bank Statement',
    tax_certificate: 'Tax Certificate',
    shareholder_registry: 'Shareholder Registry',
    operating_agreement: 'Operating Agreement',
    financial_statements: 'Financial Statements',
    other: 'Other Document'
};

const verificationStatus = {
    verified: { label: 'Verified', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700', icon: Clock },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700', icon: AlertTriangle },
    expired: { label: 'Expired', className: 'bg-slate-100 text-slate-700', icon: AlertTriangle }
};

export default function MerchantDocumentsTab({ merchant }) {
    const documents = merchant?.documents || [];

    const handleDownload = (doc) => {
        if (doc.file_url) {
            window.open(doc.file_url, '_blank');
        }
    };

    const handleView = (doc) => {
        if (doc.file_url) {
            window.open(doc.file_url, '_blank');
        }
    };

    if (documents.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No documents uploaded yet</p>
                <p className="text-sm text-slate-400">Documents will appear here once uploaded during onboarding</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Document Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-900">Verified</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-700">
                        {documents.filter(d => d.status === 'verified').length}
                    </p>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <p className="text-sm font-medium text-amber-900">Pending</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-700">
                        {documents.filter(d => d.status === 'pending').length}
                    </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-slate-600" />
                        <p className="text-sm font-medium text-slate-900">Total</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-700">
                        {documents.length}
                    </p>
                </div>
            </div>

            {/* Documents Table */}
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Document Type</TableHead>
                            <TableHead>File Name</TableHead>
                            <TableHead>Upload Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.map((doc, index) => {
                            const StatusIcon = verificationStatus[doc?.status]?.icon || Clock;
                            const isExpired = doc && doc.expiry_date && new Date(doc.expiry_date) < new Date();
                            
                            return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-slate-400" />
                                            <span className="font-medium">
                                                {documentTypes[doc.type] || doc.type}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-600">
                                            {doc.file_name || 'Document'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-slate-600">
                                            {doc.upload_date ? format(new Date(doc.upload_date), 'MMM dd, yyyy') : 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "gap-1",
                                            isExpired ? verificationStatus.expired.className : verificationStatus[doc.status]?.className
                                        )}>
                                            <StatusIcon className="h-3 w-3" />
                                            {isExpired ? 'Expired' : verificationStatus[doc.status]?.label || doc.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {doc?.expiry_date ? (
                                            <span className={cn(
                                                "text-sm",
                                                isExpired ? "text-red-600 font-medium" : "text-slate-600"
                                            )}>
                                                {format(new Date(doc.expiry_date), 'MMM dd, yyyy')}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-slate-400">No expiry</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleView(doc)}
                                                disabled={!doc.file_url}
                                                className="h-8"
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(doc)}
                                                disabled={!doc.file_url}
                                                className="h-8"
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Compliance Notes */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-blue-900 mb-1">Document Compliance</h4>
                        <p className="text-sm text-blue-700">
                            All documents are securely stored and accessible only to authorized compliance personnel.
                            Documents are retained according to regulatory requirements (typically 5-7 years).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}