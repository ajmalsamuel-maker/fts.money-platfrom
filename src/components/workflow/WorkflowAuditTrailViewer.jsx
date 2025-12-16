import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
    Search, 
    Filter, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    User,
    Calendar,
    Shield,
    XCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import BPMNDiagramViewer from './BPMNDiagramViewer';

export default function WorkflowAuditTrailViewer() {
    const [searchTerm, setSearchTerm] = useState('');
    const [workflowTypeFilter, setWorkflowTypeFilter] = useState('all');
    const [complianceFilter, setComplianceFilter] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [expandedRows, setExpandedRows] = useState(new Set());

    const { data: workflows = [], isLoading } = useQuery({
        queryKey: ['workflow-audit-trail'],
        queryFn: () => base44.entities.WorkflowCompliance.list('-updated_date'),
        refetchInterval: 10000 // Real-time: refresh every 10 seconds
    });

    const filteredWorkflows = useMemo(() => {
        return workflows.filter(workflow => {
            // Search filter
            const matchesSearch = searchTerm === '' || 
                workflow.workflow_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                workflow.workflow_id?.toLowerCase().includes(searchTerm.toLowerCase());

            // Workflow type filter
            const matchesType = workflowTypeFilter === 'all' || workflow.workflow_type === workflowTypeFilter;

            // Compliance filter
            let matchesCompliance = true;
            if (complianceFilter === 'compliant') {
                matchesCompliance = workflow.iso_19510_compliant && 
                                   workflow.iso_10746_compliant && 
                                   workflow.iso_9001_compliant;
            } else if (complianceFilter === 'non_compliant') {
                matchesCompliance = !workflow.iso_19510_compliant || 
                                   !workflow.iso_10746_compliant || 
                                   !workflow.iso_9001_compliant;
            } else if (complianceFilter === 'iso_19510') {
                matchesCompliance = workflow.iso_19510_compliant;
            } else if (complianceFilter === 'iso_10746') {
                matchesCompliance = workflow.iso_10746_compliant;
            } else if (complianceFilter === 'iso_9001') {
                matchesCompliance = workflow.iso_9001_compliant;
            }

            // Date range filter
            let matchesDate = true;
            if (dateRange !== 'all' && workflow.updated_date) {
                const updatedDate = new Date(workflow.updated_date);
                const now = new Date();
                const daysDiff = Math.floor((now - updatedDate) / (1000 * 60 * 60 * 24));
                
                if (dateRange === '7days') matchesDate = daysDiff <= 7;
                else if (dateRange === '30days') matchesDate = daysDiff <= 30;
                else if (dateRange === '90days') matchesDate = daysDiff <= 90;
            }

            return matchesSearch && matchesType && matchesCompliance && matchesDate;
        });
    }, [workflows, searchTerm, workflowTypeFilter, complianceFilter, dateRange]);

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const getComplianceStatus = (workflow) => {
        const issues = [];
        if (!workflow.iso_19510_compliant) issues.push('BPMN 2.0');
        if (!workflow.iso_10746_compliant) issues.push('ODP');
        if (!workflow.iso_9001_compliant) issues.push('ISO 9001');
        if (!workflow.iso_23005_7_compliant) issues.push('Multimedia');
        
        return {
            isCompliant: issues.length === 0,
            issues
        };
    };

    const getQualityIssues = (workflow) => {
        const issues = [];
        const metrics = workflow.quality_metrics || {};
        
        if (metrics.success_rate && metrics.success_rate < 95) {
            issues.push(`Low success rate: ${metrics.success_rate}%`);
        }
        if (metrics.error_rate && metrics.error_rate > 5) {
            issues.push(`High error rate: ${metrics.error_rate}%`);
        }
        if (metrics.sla_compliance && metrics.sla_compliance < 99) {
            issues.push(`SLA below target: ${metrics.sla_compliance}%`);
        }
        
        return issues;
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters & Search
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-5 gap-4">
                        <div className="col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search workflows..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={workflowTypeFilter} onValueChange={setWorkflowTypeFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Workflow Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="psp_provisioning">PSP Provisioning</SelectItem>
                                <SelectItem value="merchant_onboarding">Merchant Onboarding</SelectItem>
                                <SelectItem value="transaction_processing">Transaction Processing</SelectItem>
                                <SelectItem value="compliance_verification">Compliance Verification</SelectItem>
                                <SelectItem value="payout_processing">Payout Processing</SelectItem>
                                <SelectItem value="service_provisioning">Service Provisioning</SelectItem>
                                <SelectItem value="dispute_resolution">Dispute Resolution</SelectItem>
                                <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Compliance" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="compliant">Fully Compliant</SelectItem>
                                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                                <SelectItem value="iso_19510">ISO 19510 (BPMN)</SelectItem>
                                <SelectItem value="iso_10746">ISO 10746 (ODP)</SelectItem>
                                <SelectItem value="iso_9001">ISO 9001</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="7days">Last 7 Days</SelectItem>
                                <SelectItem value="30days">Last 30 Days</SelectItem>
                                <SelectItem value="90days">Last 90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <Badge variant="outline">{filteredWorkflows.length} results</Badge>
                        {(searchTerm || workflowTypeFilter !== 'all' || complianceFilter !== 'all' || dateRange !== 'all') && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                    setSearchTerm('');
                                    setWorkflowTypeFilter('all');
                                    setComplianceFilter('all');
                                    setDateRange('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Audit Trail Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Workflow Execution History</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-600">Loading audit trail...</div>
                    ) : filteredWorkflows.length === 0 ? (
                        <div className="text-center py-8 text-slate-600">No workflows found matching filters</div>
                    ) : (
                        <div className="space-y-2">
                            {filteredWorkflows.map((workflow) => {
                                const { isCompliant, issues } = getComplianceStatus(workflow);
                                const qualityIssues = getQualityIssues(workflow);
                                const hasIssues = !isCompliant || qualityIssues.length > 0;
                                const isExpanded = expandedRows.has(workflow.id);

                                return (
                                    <div 
                                        key={workflow.id} 
                                        className={`border rounded-lg transition-all ${hasIssues ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 bg-white'}`}
                                    >
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        {hasIssues ? (
                                                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                                                        ) : (
                                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                        )}
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900">{workflow.workflow_name}</h4>
                                                            <p className="text-sm text-slate-600">{workflow.workflow_id}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 text-sm text-slate-600 ml-8">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {workflow.updated_date ? format(new Date(workflow.updated_date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                                                        </div>
                                                        <Badge variant="outline" className="capitalize">
                                                            {workflow.workflow_type.replace(/_/g, ' ')}
                                                        </Badge>
                                                        <Badge className={workflow.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                                                            {workflow.status}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    {/* Compliance Badges */}
                                                    <div className="flex gap-1">
                                                        <Badge className={workflow.iso_19510_compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            BPMN
                                                        </Badge>
                                                        <Badge className={workflow.iso_10746_compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            ODP
                                                        </Badge>
                                                        <Badge className={workflow.iso_9001_compliant ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                                            <Shield className="h-3 w-3 mr-1" />
                                                            9001
                                                        </Badge>
                                                    </div>

                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => toggleRow(workflow.id)}
                                                    >
                                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Non-Compliance Alerts */}
                                            {hasIssues && (
                                                <div className="mt-3 ml-8 p-3 bg-amber-100 border border-amber-200 rounded-lg">
                                                    <div className="flex items-start gap-2">
                                                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-amber-900 text-sm">Issues Detected</p>
                                                            <ul className="text-sm text-amber-800 mt-1 space-y-1">
                                                                {issues.map((issue, idx) => (
                                                                    <li key={idx}>• Non-compliant with {issue}</li>
                                                                ))}
                                                                {qualityIssues.map((issue, idx) => (
                                                                    <li key={`q-${idx}`}>• {issue}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className="border-t border-slate-200 p-4 bg-slate-50">
                                                {/* BPMN Diagram */}
                                                <div className="mb-6">
                                                    <BPMNDiagramViewer workflow={workflow} />
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <h5 className="font-semibold text-slate-900 mb-3">Workflow Details</h5>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">Version:</span>
                                                                <span className="font-medium">{workflow.version || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">Created:</span>
                                                                <span className="font-medium">
                                                                    {workflow.created_date ? format(new Date(workflow.created_date), 'MMM dd, yyyy') : 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">Last Audit:</span>
                                                                <span className="font-medium">
                                                                    {workflow.last_audit_date ? format(new Date(workflow.last_audit_date), 'MMM dd, yyyy') : 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-slate-600">Next Audit:</span>
                                                                <span className="font-medium">
                                                                    {workflow.next_audit_date ? format(new Date(workflow.next_audit_date), 'MMM dd, yyyy') : 'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h5 className="font-semibold text-slate-900 mb-3">Quality Metrics</h5>
                                                        {workflow.quality_metrics ? (
                                                            <div className="space-y-2 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600">Success Rate:</span>
                                                                    <span className={`font-medium ${workflow.quality_metrics.success_rate >= 95 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                        {workflow.quality_metrics.success_rate}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600">Error Rate:</span>
                                                                    <span className={`font-medium ${workflow.quality_metrics.error_rate <= 5 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                        {workflow.quality_metrics.error_rate}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600">SLA Compliance:</span>
                                                                    <span className={`font-medium ${workflow.quality_metrics.sla_compliance >= 99 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                        {workflow.quality_metrics.sla_compliance}%
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-600">Avg Completion:</span>
                                                                    <span className="font-medium">
                                                                        {workflow.quality_metrics.average_completion_time ? 
                                                                            `${Math.round(workflow.quality_metrics.average_completion_time / 60)}m` : 
                                                                            'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-slate-600">No metrics available</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {workflow.audit_trail && workflow.audit_trail.length > 0 && (
                                                    <div className="mt-6">
                                                        <h5 className="font-semibold text-slate-900 mb-3">Recent Activity</h5>
                                                        <div className="space-y-2">
                                                            {workflow.audit_trail.slice(0, 5).map((entry, idx) => (
                                                                <div key={idx} className="flex items-center gap-3 text-sm p-2 bg-white rounded border border-slate-200">
                                                                    <Clock className="h-3 w-3 text-slate-400" />
                                                                    <span className="text-slate-600">{entry.timestamp}</span>
                                                                    <span className="font-medium text-slate-900">{entry.action}</span>
                                                                    <span className="text-slate-600">by {entry.user}</span>
                                                                    <Badge className={entry.result === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                                                                        {entry.result}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {workflow.compliance_notes && (
                                                    <div className="mt-6">
                                                        <h5 className="font-semibold text-slate-900 mb-2">Compliance Notes</h5>
                                                        <p className="text-sm text-slate-600 p-3 bg-white rounded border border-slate-200">
                                                            {workflow.compliance_notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}