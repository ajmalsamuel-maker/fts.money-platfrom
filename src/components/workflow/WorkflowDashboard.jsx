import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
    TrendingUp, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Activity,
    BarChart3
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function WorkflowDashboard({ workflows }) {
    const now = new Date();

    // Calculate metrics
    const activeWorkflows = workflows.filter(w => w.status === 'active').length;
    const compliantWorkflows = workflows.filter(w => 
        w.iso_19510_compliant && w.iso_10746_compliant && w.iso_9001_compliant
    ).length;
    const complianceRate = workflows.length > 0 ? (compliantWorkflows / workflows.length * 100).toFixed(1) : 0;

    // Audit alerts
    const auditAlerts = workflows.filter(w => {
        if (!w.next_audit_date) return false;
        const daysUntil = Math.floor((new Date(w.next_audit_date) - now) / (1000 * 60 * 60 * 24));
        return daysUntil <= 30 && daysUntil >= 0;
    });

    const overdueAudits = workflows.filter(w => {
        if (!w.next_audit_date) return false;
        return new Date(w.next_audit_date) < now;
    });

    // Compliance by type
    const complianceByType = {};
    workflows.forEach(w => {
        if (!complianceByType[w.workflow_type]) {
            complianceByType[w.workflow_type] = { total: 0, compliant: 0 };
        }
        complianceByType[w.workflow_type].total++;
        if (w.iso_19510_compliant && w.iso_10746_compliant && w.iso_9001_compliant) {
            complianceByType[w.workflow_type].compliant++;
        }
    });

    const chartData = Object.entries(complianceByType).map(([type, data]) => ({
        name: type.replace(/_/g, ' '),
        compliance: ((data.compliant / data.total) * 100).toFixed(0),
        total: data.total
    }));

    // ISO Standards distribution
    const isoDistribution = [
        { name: 'BPMN 2.0', value: workflows.filter(w => w.iso_19510_compliant).length },
        { name: 'ODP', value: workflows.filter(w => w.iso_10746_compliant).length },
        { name: 'ISO 9001', value: workflows.filter(w => w.iso_9001_compliant).length },
        { name: 'Multimedia', value: workflows.filter(w => w.iso_23005_7_compliant).length }
    ];

    // Average quality metrics
    const avgMetrics = workflows.reduce((acc, w) => {
        if (w.quality_metrics) {
            acc.successRate += w.quality_metrics.success_rate || 0;
            acc.slaCompliance += w.quality_metrics.sla_compliance || 0;
            acc.count++;
        }
        return acc;
    }, { successRate: 0, slaCompliance: 0, count: 0 });

    const avgSuccessRate = avgMetrics.count > 0 ? (avgMetrics.successRate / avgMetrics.count).toFixed(1) : 0;
    const avgSlaCompliance = avgMetrics.count > 0 ? (avgMetrics.slaCompliance / avgMetrics.count).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* Alert Bar */}
            {(auditAlerts.length > 0 || overdueAudits.length > 0) && (
                <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-semibold text-amber-900">Audit Attention Required</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    {overdueAudits.length > 0 && `${overdueAudits.length} overdue audit(s). `}
                                    {auditAlerts.length > 0 && `${auditAlerts.length} audit(s) due within 30 days.`}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700 font-medium">Active Workflows</p>
                                <p className="text-3xl font-bold text-blue-900 mt-1">{activeWorkflows}</p>
                            </div>
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Compliance Rate</p>
                                <p className="text-3xl font-bold text-emerald-900 mt-1">{complianceRate}%</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700 font-medium">Avg Success Rate</p>
                                <p className="text-3xl font-bold text-purple-900 mt-1">{avgSuccessRate}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-amber-700 font-medium">Pending Audits</p>
                                <p className="text-3xl font-bold text-amber-900 mt-1">{auditAlerts.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Compliance by Workflow Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={11} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="compliance" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">ISO Standards Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={isoDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {isoDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Audit Timeline */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Upcoming Audits (Next 90 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {workflows
                            .filter(w => {
                                if (!w.next_audit_date) return false;
                                const daysUntil = Math.floor((new Date(w.next_audit_date) - now) / (1000 * 60 * 60 * 24));
                                return daysUntil >= 0 && daysUntil <= 90;
                            })
                            .sort((a, b) => new Date(a.next_audit_date) - new Date(b.next_audit_date))
                            .map(workflow => {
                                const daysUntil = Math.floor((new Date(workflow.next_audit_date) - now) / (1000 * 60 * 60 * 24));
                                const isUrgent = daysUntil <= 30;
                                
                                return (
                                    <div key={workflow.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-900">{workflow.workflow_name}</p>
                                            <p className="text-sm text-slate-600">{new Date(workflow.next_audit_date).toLocaleDateString()}</p>
                                        </div>
                                        <Badge className={isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}>
                                            {daysUntil} days
                                        </Badge>
                                    </div>
                                );
                            })}
                        {workflows.filter(w => {
                            if (!w.next_audit_date) return false;
                            const daysUntil = Math.floor((new Date(w.next_audit_date) - now) / (1000 * 60 * 60 * 24));
                            return daysUntil >= 0 && daysUntil <= 90;
                        }).length === 0 && (
                            <p className="text-center text-slate-500 py-4">No audits scheduled in next 90 days</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}