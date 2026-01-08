import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Globe, 
    Calendar,
    FileText,
    TrendingUp,
    Settings,
    Bell,
    Download,
    RefreshCw
} from 'lucide-react';

export default function ComplianceMonitoringDashboard() {
    const { platformUser, loading } = usePlatformAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [lastUpdated, setLastUpdated] = useState(new Date());

    // Compliance data structure
    const complianceData = {
        currentlySupported: [
            { 
                country: 'EU (Peppol)', 
                standard: 'Peppol UBL 2.1', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'B2G mandatory',
                implementation: '100%'
            },
            { 
                country: 'Saudi Arabia', 
                standard: 'ZATCA', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'Phase 2 active',
                implementation: '100%'
            },
            { 
                country: 'Italy', 
                standard: 'FatturaPA', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'Mandatory',
                implementation: '100%'
            },
            { 
                country: 'Mexico', 
                standard: 'CFDI 4.0', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'Mandatory',
                implementation: '100%'
            },
            { 
                country: 'Germany', 
                standard: 'XRechnung', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'B2G mandatory',
                implementation: '100%'
            },
            { 
                country: 'Spain', 
                standard: 'FacturaE', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'B2G mandatory',
                implementation: '100%'
            },
            { 
                country: 'Norway', 
                standard: 'EHF', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'B2G mandatory',
                implementation: '100%'
            },
            { 
                country: 'Finland', 
                standard: 'Finvoice', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'B2G mandatory',
                implementation: '100%'
            },
            { 
                country: 'Pakistan', 
                standard: 'PRAL/FBR', 
                status: 'compliant', 
                lastCheck: '2026-01-08',
                nextDeadline: null,
                mandate: 'Mandatory',
                implementation: '100%'
            }
        ],
        upcomingMandates: [
            {
                country: 'Poland',
                standard: 'KSeF',
                deadline: '2026-02-01',
                daysRemaining: 24,
                status: 'planning',
                priority: 'critical',
                scope: 'Large taxpayers (PLN 200M+)',
                action: 'Integration development required'
            },
            {
                country: 'Belgium',
                standard: 'B2B Peppol',
                deadline: '2026-04-01',
                daysRemaining: 83,
                status: 'planning',
                priority: 'high',
                scope: 'All B2B transactions',
                action: 'Peppol Access Point setup'
            },
            {
                country: 'India',
                standard: 'GST e-Invoice',
                deadline: '2026-04-01',
                daysRemaining: 83,
                status: 'planning',
                priority: 'critical',
                scope: 'Turnover > ₹5 crore',
                action: 'IRP integration required'
            },
            {
                country: 'Malaysia',
                standard: 'MyInvois',
                deadline: '2027-01-01',
                daysRemaining: 358,
                status: 'monitoring',
                priority: 'medium',
                scope: 'All businesses (final phase)',
                action: 'Monitor IRBM updates'
            }
        ],
        recentChanges: [
            {
                date: '2026-01-05',
                country: 'Romania',
                change: 'Extended e-Transport mandate to all businesses',
                impact: 'Low - not currently supported',
                action: 'Monitor for customer demand'
            },
            {
                date: '2025-12-20',
                country: 'France',
                change: 'B2B e-invoicing mandate delayed to 2026',
                impact: 'Medium - provides more implementation time',
                action: 'Adjust roadmap timeline'
            },
            {
                date: '2025-12-15',
                country: 'UAE',
                change: 'Phase 2 CTC e-invoicing postponed',
                impact: 'Low - Phase 1 compliance sufficient',
                action: 'Continue monitoring'
            },
            {
                date: '2025-11-30',
                country: 'Singapore',
                change: 'InvoiceNow mandatory for new GST registrants',
                impact: 'Medium - Peppol-based, already supported',
                action: 'Update documentation'
            }
        ],
        gapAnalysis: [
            {
                region: 'Asia Pacific',
                supported: 1,
                missing: 10,
                priority: 'critical',
                keyGaps: ['India GST', 'Malaysia MyInvois', 'Indonesia Coretax', 'Vietnam GDT']
            },
            {
                region: 'Latin America',
                supported: 1,
                missing: 6,
                priority: 'critical',
                keyGaps: ['Brazil NF-e', 'Chile DTE', 'Colombia DIAN', 'Peru CPE']
            },
            {
                region: 'Europe',
                supported: 6,
                missing: 5,
                priority: 'high',
                keyGaps: ['Romania RO e-Factura', 'Poland KSeF', 'France Chorus', 'Turkey e-Fatura']
            },
            {
                region: 'Middle East & Africa',
                supported: 1,
                missing: 5,
                priority: 'medium',
                keyGaps: ['Egypt ETA', 'UAE FTA', 'Kenya eTIMS']
            }
        ]
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'compliant': return 'bg-green-100 text-green-800';
            case 'planning': return 'bg-orange-100 text-orange-800';
            case 'monitoring': return 'bg-blue-100 text-blue-800';
            case 'at-risk': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'destructive';
            case 'high': return 'default';
            case 'medium': return 'secondary';
            default: return 'outline';
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="ComplianceMonitoringDashboard"
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />
            
            <div className="flex-1 overflow-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">E-Invoicing Compliance Dashboard</h1>
                            <p className="text-slate-600 mt-1">Real-time monitoring of global e-invoicing mandates and compliance status</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-slate-500">
                                Last updated: {lastUpdated.toLocaleString()}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setLastUpdated(new Date())}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>
                            <Button size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export Report
                            </Button>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Supported Standards</p>
                                        <p className="text-3xl font-bold text-green-600">{complianceData.currentlySupported.length}</p>
                                    </div>
                                    <CheckCircle className="h-10 w-10 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Upcoming Mandates</p>
                                        <p className="text-3xl font-bold text-orange-600">{complianceData.upcomingMandates.length}</p>
                                    </div>
                                    <Clock className="h-10 w-10 text-orange-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Recent Changes</p>
                                        <p className="text-3xl font-bold text-blue-600">{complianceData.recentChanges.length}</p>
                                    </div>
                                    <Bell className="h-10 w-10 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Global Coverage</p>
                                        <p className="text-3xl font-bold text-slate-900">26%</p>
                                    </div>
                                    <Globe className="h-10 w-10 text-slate-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="supported">Supported (9)</TabsTrigger>
                            <TabsTrigger value="upcoming">Upcoming (4)</TabsTrigger>
                            <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
                            <TabsTrigger value="changes">Recent Changes</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-6">
                            {/* Critical Alerts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        Critical Deadlines (Next 90 Days)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {complianceData.upcomingMandates.filter(m => m.daysRemaining < 90).map((mandate, idx) => (
                                            <Alert key={idx} className={mandate.priority === 'critical' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
                                                <AlertDescription>
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="font-semibold text-slate-900">{mandate.country} - {mandate.standard}</div>
                                                            <div className="text-sm text-slate-600 mt-1">{mandate.scope}</div>
                                                            <div className="text-xs text-slate-500 mt-1">Action: {mandate.action}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant={getPriorityColor(mandate.priority)}>{mandate.priority.toUpperCase()}</Badge>
                                                            <div className="text-sm font-bold text-slate-900 mt-2">{mandate.daysRemaining} days</div>
                                                            <div className="text-xs text-slate-500">{mandate.deadline}</div>
                                                        </div>
                                                    </div>
                                                </AlertDescription>
                                            </Alert>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Gap Analysis Summary */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Regional Coverage Gap Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {complianceData.gapAnalysis.map((region, idx) => (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-semibold">{region.region}</div>
                                                        <div className="text-xs text-slate-600">
                                                            {region.supported} supported / {region.missing} missing
                                                        </div>
                                                    </div>
                                                    <Badge variant={getPriorityColor(region.priority)}>{region.priority}</Badge>
                                                </div>
                                                <Progress value={(region.supported / (region.supported + region.missing)) * 100} className="h-2" />
                                                <div className="text-xs text-slate-600">
                                                    Key gaps: {region.keyGaps.join(', ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Supported Standards Tab */}
                        <TabsContent value="supported">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Currently Supported Standards ({complianceData.currentlySupported.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {complianceData.currentlySupported.map((standard, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                                                <div className="flex items-center gap-4">
                                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                                    <div>
                                                        <div className="font-semibold text-slate-900">{standard.country}</div>
                                                        <div className="text-sm text-slate-600">{standard.standard}</div>
                                                        <div className="text-xs text-slate-500 mt-1">{standard.mandate}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                                                    <div className="text-xs text-slate-500 mt-2">Last checked: {standard.lastCheck}</div>
                                                    <div className="text-xs font-semibold text-green-700 mt-1">{standard.implementation} Implemented</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Upcoming Mandates Tab */}
                        <TabsContent value="upcoming">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upcoming Mandates & Deadlines</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {complianceData.upcomingMandates.map((mandate, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="font-bold text-lg text-slate-900">{mandate.country}</div>
                                                            <Badge variant={getPriorityColor(mandate.priority)}>{mandate.priority}</Badge>
                                                            <Badge className={getStatusColor(mandate.status)}>{mandate.status}</Badge>
                                                        </div>
                                                        <div className="text-sm text-slate-700 mb-1">{mandate.standard}</div>
                                                        <div className="text-sm text-slate-600 mb-2">{mandate.scope}</div>
                                                        <div className="flex items-center gap-2 text-xs">
                                                            <Calendar className="h-3 w-3 text-slate-400" />
                                                            <span className="text-slate-500">Deadline: {mandate.deadline}</span>
                                                            <span className="font-semibold text-orange-700">({mandate.daysRemaining} days remaining)</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <Button size="sm" variant="outline">View Details</Button>
                                                    </div>
                                                </div>
                                                <Alert className="mt-3 bg-blue-50 border-blue-200">
                                                    <AlertDescription className="text-sm">
                                                        <span className="font-semibold">Action Required:</span> {mandate.action}
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Gap Analysis Tab */}
                        <TabsContent value="gaps">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Comprehensive Gap Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {complianceData.gapAnalysis.map((region, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{region.region}</h3>
                                                        <p className="text-sm text-slate-600">
                                                            Coverage: {region.supported}/{region.supported + region.missing} countries
                                                        </p>
                                                    </div>
                                                    <Badge variant={getPriorityColor(region.priority)} className="text-sm">
                                                        {region.priority} priority
                                                    </Badge>
                                                </div>
                                                <Progress 
                                                    value={(region.supported / (region.supported + region.missing)) * 100} 
                                                    className="h-3 mb-3"
                                                />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-700 mb-2">Key Missing Standards:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {region.keyGaps.map((gap, gapIdx) => (
                                                            <Badge key={gapIdx} variant="outline">{gap}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Recent Changes Tab */}
                        <TabsContent value="changes">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Regulatory Changes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {complianceData.recentChanges.map((change, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <FileText className="h-6 w-6 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-slate-900">{change.country}</span>
                                                            <span className="text-xs text-slate-500">{change.date}</span>
                                                        </div>
                                                        <div className="text-sm text-slate-700 mb-2">{change.change}</div>
                                                        <div className="flex items-center gap-4 text-xs">
                                                            <div>
                                                                <span className="text-slate-500">Impact:</span>
                                                                <Badge variant="outline" className="ml-2">{change.impact}</Badge>
                                                            </div>
                                                            <div className="text-slate-600">
                                                                <span className="font-semibold">Action:</span> {change.action}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}