import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, AlertCircle, Receipt, FileText, CreditCard } from 'lucide-react';
import CardBrandLogo from './CardBrandLogo';
import BankInfoDisplay from './BankInfoDisplay';
import ISO8583Encoder from './ISO8583Encoder';
import ISO20022Encoder from './ISO20022Encoder';
import ISOComplianceBadge from './ISOComplianceBadge';
import { generateISOComplianceReport } from '@/components/utils/isoValidator';

const getStatusConfig = (status) => {
    const configs = {
        approved: { label: 'Approved', icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
        accepted: { label: 'Accepted', icon: CheckCircle2, className: 'bg-green-50 text-green-700 border-green-200' },
        settled: { label: 'Settled', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        pending: { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
        processing: { label: 'Processing', icon: Clock, className: 'bg-blue-50 text-blue-700 border-blue-200' },
        declined: { label: 'Declined', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
        rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
        failed: { label: 'Failed', icon: AlertCircle, className: 'bg-red-50 text-red-700 border-red-200' },
        voided: { label: 'Voided', icon: XCircle, className: 'bg-slate-50 text-slate-700 border-slate-200' },
        cancelled: { label: 'Cancelled', icon: XCircle, className: 'bg-slate-50 text-slate-700 border-slate-200' },
        error: { label: 'Error', icon: AlertCircle, className: 'bg-red-50 text-red-700 border-red-200' },
    };
    return configs[status] || configs.pending;
};

const DetailField = ({ label, value, mono = false, className = "" }) => (
    <div className={className}>
        <Label className="text-xs text-slate-500">{label}</Label>
        <p className={`text-sm mt-1 ${mono ? 'font-mono' : ''} ${!value || value === 'N/A' ? 'text-slate-400' : ''}`}>
            {value || 'N/A'}
        </p>
    </div>
);

export default function TransactionDetailsDialog({ transaction, open, onClose }) {
    if (!transaction) return null;

    const statusConfig = getStatusConfig(transaction.status);
    const StatusIcon = statusConfig.icon;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Transaction Details
                        </div>
                        <ISOComplianceBadge transaction={transaction} showScore={true} />
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="details" className="flex-1 overflow-hidden">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="iso">ISO Messages</TabsTrigger>
                        <TabsTrigger value="compliance">ISO Compliance</TabsTrigger>
                        <TabsTrigger value="receipt">Receipt</TabsTrigger>
                    </TabsList>

                    <ScrollArea className="h-[calc(85vh-180px)] mt-4">
                        {/* Transaction Details Tab */}
                        <TabsContent value="details" className="space-y-6 pr-4">
                            {/* Transaction Overview */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Transaction Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <DetailField label="MID" value={transaction.mid} mono />
                                        <DetailField label="Transaction ID" value={transaction.transaction_id || transaction.id} mono />
                                        <DetailField label="Merchant Txn ID" value={transaction.merchant_transaction_id} mono />
                                        <DetailField label="Order ID" value={transaction.order_id} mono />
                                        <DetailField label="Connector Txn No" value={transaction.connector_txn_no} mono />
                                        <DetailField label="Channel Txn ID" value={transaction.channel_txn_id} mono />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Timing */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Status & Timing</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-xs text-slate-500">Status</Label>
                                            <div className="mt-1">
                                                <Badge variant="outline" className={statusConfig.className}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {statusConfig.label}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-500">Action</Label>
                                            <Badge className="mt-1">{transaction.action || transaction.type}</Badge>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-500">Transaction Type</Label>
                                            <Badge className="mt-1" variant="outline">{transaction.type}</Badge>
                                        </div>
                                        <DetailField label="Created Time" value={transaction.created_date ? new Date(transaction.created_date).toLocaleString() : 'N/A'} />
                                        <DetailField label="Complete Time" value={transaction.complete_time ? new Date(transaction.complete_time).toLocaleString() : 'N/A'} />
                                        <DetailField label="Accepted Time" value={transaction.accepted_time ? new Date(transaction.accepted_time).toLocaleString() : 'N/A'} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Amount Details */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Amount Details</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label className="text-xs text-slate-500">Transaction Amount</Label>
                                            <p className="text-lg font-bold mt-1">
                                                {transaction.currency} {transaction.amount?.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </p>
                                        </div>
                                        <DetailField label="Original Amount" value={transaction.original_amount ? `${transaction.currency} ${transaction.original_amount.toFixed(2)}` : 'N/A'} />
                                        <DetailField label="VAT Amount" value={transaction.vat_amount ? `${transaction.currency} ${transaction.vat_amount.toFixed(2)}` : 'N/A'} />
                                        <DetailField label="Actual Amount" value={transaction.actual_amount ? `${transaction.currency} ${transaction.actual_amount.toFixed(2)}` : 'N/A'} />
                                        <DetailField label="Fee" value={transaction.fee ? `${transaction.currency} ${transaction.fee.toFixed(2)}` : 'N/A'} />
                                        <DetailField label="Net Amount" value={transaction.net_amount ? `${transaction.currency} ${transaction.net_amount.toFixed(2)}` : 'N/A'} />
                                        <DetailField label="Currency" value={transaction.currency} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Payment Method</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <DetailField label="Payment Method" value={transaction.payment_method} />
                                        <div>
                                            <Label className="text-xs text-slate-500">Card Brand</Label>
                                            <div className="mt-1">
                                                {transaction.card_brand ? (
                                                    <CardBrandLogo brand={transaction.card_brand} size="md" />
                                                ) : (
                                                    <span className="text-sm text-slate-400">N/A</span>
                                                )}
                                            </div>
                                        </div>
                                        <DetailField label="Card Number" value={transaction.card_number || (transaction.card_last_four ? `•••• ${transaction.card_last_four}` : 'N/A')} mono />
                                        <DetailField label="Card Prefix (BIN)" value={transaction.card_prefix} mono />
                                        <DetailField label="Issuer Bank" value={transaction.issuer_bank} />
                                        <DetailField label="Payment Code" value={transaction.payment_code} mono />
                                        <div>
                                            <Label className="text-xs text-slate-500">3D Secure</Label>
                                            <Badge className="mt-1" variant={transaction.is_3ds ? "default" : "outline"}>
                                                {transaction.is_3ds ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Card & Bank Info Section */}
                                    {transaction.card_brand && (
                                        <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
                                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" />
                                                Issuing Bank Information
                                            </h4>
                                            <BankInfoDisplay 
                                                cardNumber={transaction.card_number} 
                                                bin={transaction.card_prefix}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Customer Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <DetailField label="Customer Name" value={transaction.customer_name} />
                                        <DetailField label="Email" value={transaction.customer_email} />
                                        <DetailField label="Phone" value={transaction.customer_phone} />
                                        <DetailField label="Country" value={transaction.customer_country} />
                                        <DetailField label="IP Address" value={transaction.ip_address} mono />
                                        <DetailField label="Bill To Account" value={transaction.bill_to_account_name} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Response & Authorization */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Response & Authorization</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <DetailField label="Auth Code" value={transaction.auth_code} mono />
                                        <DetailField label="Approval Code" value={transaction.approval_code} mono />
                                        <DetailField label="Response Code" value={transaction.response_code} mono />
                                        <DetailField label="Connector Response Code" value={transaction.connector_response_code} mono />
                                        <div className="col-span-3">
                                            <DetailField label="Response Message" value={transaction.response_message} />
                                        </div>
                                        <DetailField label="RRN" value={transaction.rrn} mono />
                                        <DetailField label="ECI" value={transaction.eci} mono />
                                        <DetailField label="ARN" value={transaction.arn} mono />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Additional Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-4">
                                        <DetailField label="Operator" value={transaction.operator || transaction.user_id} />
                                        <DetailField label="Trial ID" value={transaction.trial_id} mono />
                                        <DetailField label="Terminal ID" value={transaction.terminal_id} mono />
                                        <DetailField label="Risk Score" value={transaction.risk_score?.toString()} />
                                        <DetailField label="Fraud Control Status" value={transaction.fraud_control_status} />
                                        <DetailField label="Notification Status" value={transaction.notification_status} />
                                        {transaction.description && (
                                            <div className="col-span-3">
                                                <DetailField label="Description" value={transaction.description} />
                                            </div>
                                        )}
                                        {transaction.remarks && (
                                            <div className="col-span-3">
                                                <DetailField label="Remarks" value={transaction.remarks} />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bank Transfer Details (if applicable) */}
                            {(transaction.beneficiary_name || transaction.account_no || transaction.bank_code) && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Bank Transfer Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4">
                                            <DetailField label="Beneficiary Name" value={transaction.beneficiary_name} />
                                            <DetailField label="Account Number" value={transaction.account_no} mono />
                                            <DetailField label="Bank Code" value={transaction.bank_code} mono />
                                            <DetailField label="Bank Name" value={transaction.bank_name} />
                                            <DetailField label="Branch Number" value={transaction.branch_number} mono />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* History & Logs Tab */}
                        <TabsContent value="history" className="space-y-4 pr-4">
                            {/* History Table */}
                            {transaction.history && transaction.history.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Transaction History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Last Updated Time</TableHead>
                                                    <TableHead>Accepted Time</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Response Code</TableHead>
                                                    <TableHead>Connector Response</TableHead>
                                                    <TableHead>Actual Amount</TableHead>
                                                    <TableHead>Note</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {transaction.history.map((entry, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="text-xs">{entry.updated_time || 'N/A'}</TableCell>
                                                        <TableCell className="text-xs">{entry.accepted_time || 'N/A'}</TableCell>
                                                        <TableCell className="text-xs">{entry.status || 'N/A'}</TableCell>
                                                        <TableCell className="text-xs font-mono">{entry.response_code || 'N/A'}</TableCell>
                                                        <TableCell className="text-xs font-mono">{entry.connector_response || 'N/A'}</TableCell>
                                                        <TableCell className="text-xs">{entry.actual_amount || 'N/A'}</TableCell>
                                                        <TableCell className="text-xs">{entry.note || 'N/A'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Transaction Log */}
                            {transaction.transaction_log && transaction.transaction_log.length > 0 && (
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Transaction Log</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {transaction.transaction_log.map((log, idx) => (
                                                <div key={idx} className="border-l-2 border-slate-200 pl-4 py-2">
                                                    <p className="text-xs font-mono text-slate-500 mb-1">{log.timestamp || new Date(log.created_time).toLocaleString()}</p>
                                                    <p className="text-sm font-mono text-slate-700">{log.message || JSON.stringify(log)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {(!transaction.history || transaction.history.length === 0) && (!transaction.transaction_log || transaction.transaction_log.length === 0) && (
                                <Card>
                                    <CardContent className="py-8 text-center text-slate-500">
                                        No history or logs available for this transaction
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* ISO Messages Tab */}
                        <TabsContent value="iso" className="space-y-4 pr-4">
                            <ISO8583Encoder transaction={transaction} />
                            <ISO20022Encoder transaction={transaction} />
                        </TabsContent>

                        {/* ISO Compliance Tab */}
                        <TabsContent value="compliance" className="pr-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">ISO Standards Compliance Report</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {(() => {
                                        const report = generateISOComplianceReport(transaction);
                                        return (
                                            <>
                                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                                                    <div>
                                                        <p className="text-sm text-slate-600">Compliance Score</p>
                                                        <p className="text-3xl font-bold">{report.complianceScore}%</p>
                                                    </div>
                                                    <Badge className={report.isCompliant ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                                        {report.isCompliant ? 'Fully Compliant' : 'Partial Compliance'}
                                                    </Badge>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold text-sm mb-2">Standards Validated</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {report.standards.map((std, idx) => (
                                                            <Badge key={idx} variant="outline">{std}</Badge>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-semibold text-sm mb-2">Validation Details</h4>
                                                    <div className="space-y-2">
                                                        {Object.entries(report.validations).map(([key, validation]) => (
                                                            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                                                                <div>
                                                                    <p className="font-medium text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                                                                    <p className="text-xs text-slate-500">{validation.standard}</p>
                                                                </div>
                                                                {validation.valid ? (
                                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {report.recommendations.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-sm mb-2">Recommendations</h4>
                                                        <div className="space-y-2">
                                                            {report.recommendations.map((rec, idx) => (
                                                                <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <p className="text-sm font-medium text-yellow-900 capitalize">{rec.field.replace(/_/g, ' ')}</p>
                                                                    <p className="text-xs text-yellow-700 mt-1">{rec.error}</p>
                                                                    <p className="text-xs text-yellow-600 mt-1">Standard: {rec.standard}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Receipt Tab */}
                        <TabsContent value="receipt" className="pr-4">
                            <Card>
                                <CardHeader className="pb-3 border-b">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Receipt className="h-5 w-5" />
                                        Transaction Receipt
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="max-w-md mx-auto bg-white border-2 border-dashed border-slate-300 rounded-lg p-6 space-y-4">
                                        <div className="text-center border-b pb-4">
                                            <h3 className="text-lg font-bold">{transaction.merchant_name || 'Merchant'}</h3>
                                            <p className="text-xs text-slate-500">Transaction Receipt</p>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Merchant ID:</span>
                                                <span className="font-mono">{transaction.merchant_id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Order Reference:</span>
                                                <span className="font-mono">{transaction.merchant_transaction_id || transaction.order_id || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Transaction ID:</span>
                                                <span className="font-mono text-xs">{transaction.transaction_id || transaction.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Date/Time:</span>
                                                <span>{new Date(transaction.created_date).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Transaction Type:</span>
                                                <span className="uppercase">{transaction.type}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-b py-3 space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600">Card Number:</span>
                                                <span className="font-mono">{transaction.card_number || `•••• ${transaction.card_last_four}`}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Amount:</span>
                                                <span>{transaction.currency} {transaction.amount?.toFixed(2)}</span>
                                            </div>
                                            {transaction.approval_code && (
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Approval Code:</span>
                                                    <span className="font-mono">{transaction.approval_code}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-center pt-2">
                                            <Badge className={statusConfig.className}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {statusConfig.label}
                                            </Badge>
                                        </div>

                                        <p className="text-xs text-center text-slate-500 pt-2">
                                            This is an electronic receipt. No signature is required.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}