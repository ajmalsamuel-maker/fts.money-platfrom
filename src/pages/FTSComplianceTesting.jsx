import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Shield,
    Database,
    Lock,
    FileCheck,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    Download,
    Play,
    Eye,
    TrendingUp
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

const testCategories = [
    {
        id: 'database_schema',
        title: 'Database Schema Validation',
        description: 'RLS policies, tenant isolation, foreign keys',
        icon: Database,
        color: 'blue'
    },
    {
        id: 'multi_tenant',
        title: 'Multi-Tenant Isolation',
        description: 'Cross-tenant access prevention, data leakage',
        icon: Lock,
        color: 'purple'
    },
    {
        id: 'function_security',
        title: 'Backend Function Security',
        description: 'Authentication, authorization, input validation',
        icon: Shield,
        color: 'emerald'
    },
    {
        id: 'compliance',
        title: 'Global Standards Compliance',
        description: 'PCI-DSS, GDPR, ISO 27001, FATF, LEI/vLEI',
        icon: FileCheck,
        color: 'indigo'
    }
];

const severityConfig = {
    critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300', icon: AlertTriangle },
    medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-300', icon: AlertTriangle },
    low: { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: AlertTriangle },
    pass: { label: 'Pass', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle2 }
};

export default function FTSComplianceTesting() {
    const navigate = useNavigate();
    const { platformUser } = usePlatformAuth();
    const { t } = useI18n();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [testResults, setTestResults] = useState(null);
    const [expandedTest, setExpandedTest] = useState(null);

    const runTestMutation = useMutation({
        mutationFn: async (category) => {
            const response = await base44.functions.invoke('complianceTestRunner', {
                action: 'run_test',
                category: category || 'all'
            });
            return response.data;
        },
        onSuccess: (data) => {
            setTestResults(data);
        }
    });

    const generateReportMutation = useMutation({
        mutationFn: async () => {
            const response = await base44.functions.invoke('complianceTestRunner', {
                action: 'generate_report',
                results: testResults
            });
            return response.data;
        },
        onSuccess: (data) => {
            // Download report
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `compliance-report-${new Date().toISOString()}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    });

    const handleRunTest = (categoryId) => {
        setSelectedCategory(categoryId);
        runTestMutation.mutate(categoryId);
    };

    const handleRunAllTests = () => {
        setSelectedCategory('all');
        runTestMutation.mutate('all');
    };

    const getSeverityCount = (severity) => {
        if (!testResults?.tests) return 0;
        return testResults.tests.filter(t => t.severity === severity).length;
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="FTSComplianceTesting" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:subMenuItems.complianceTesting')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:subMenuItems.complianceTestingDesc')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleRunAllTests}
                            disabled={runTestMutation.isPending}
                            className="gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            {runTestMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                            Run All Tests
                        </Button>
                        {testResults && (
                            <Button
                                onClick={() => generateReportMutation.mutate()}
                                variant="outline"
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Export Report
                            </Button>
                        )}
                    </div>
                </header>

                <div className="p-6">
                    {/* Test Categories */}
                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                        {testCategories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Card 
                                    key={category.id}
                                    className="hover:border-blue-300 transition-all cursor-pointer"
                                    onClick={() => handleRunTest(category.id)}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center",
                                                `bg-${category.color}-100`
                                            )}>
                                                <Icon className={cn("h-6 w-6", `text-${category.color}-600`)} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-sm mb-1">{category.title}</h3>
                                                <p className="text-xs text-slate-500">{category.description}</p>
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            className="w-full"
                                            disabled={runTestMutation.isPending && selectedCategory === category.id}
                                        >
                                            {runTestMutation.isPending && selectedCategory === category.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Play className="h-4 w-4 mr-2" />
                                            )}
                                            Run Test
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Test Results */}
                    {runTestMutation.isPending && (
                        <Card className="mb-6">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">Running compliance tests...</p>
                                        <p className="text-sm text-slate-500">This may take a few minutes</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {testResults && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid md:grid-cols-5 gap-4 mb-6">
                                <Card className="bg-white">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-slate-600 mb-1">Total Tests</p>
                                        <p className="text-2xl font-bold">{testResults.tests?.length || 0}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-red-50 border-red-200">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-red-600 mb-1">Critical</p>
                                        <p className="text-2xl font-bold text-red-700">{getSeverityCount('critical')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-orange-50 border-orange-200">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-orange-600 mb-1">High</p>
                                        <p className="text-2xl font-bold text-orange-700">{getSeverityCount('high')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-amber-50 border-amber-200">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-amber-600 mb-1">Medium</p>
                                        <p className="text-2xl font-bold text-amber-700">{getSeverityCount('medium')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-emerald-50 border-emerald-200">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-emerald-600 mb-1">Passed</p>
                                        <p className="text-2xl font-bold text-emerald-700">{getSeverityCount('pass')}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Overall Status */}
                            <Alert className={cn(
                                "mb-6",
                                getSeverityCount('critical') > 0 ? "bg-red-50 border-red-200" :
                                getSeverityCount('high') > 0 ? "bg-orange-50 border-orange-200" :
                                getSeverityCount('medium') > 0 ? "bg-amber-50 border-amber-200" :
                                "bg-emerald-50 border-emerald-200"
                            )}>
                                <AlertDescription>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold mb-1">
                                                {getSeverityCount('critical') > 0 ? 'Critical Issues Found' :
                                                 getSeverityCount('high') > 0 ? 'High Priority Issues Found' :
                                                 getSeverityCount('medium') > 0 ? 'Medium Priority Issues Found' :
                                                 'All Tests Passed'}
                                            </p>
                                            <p className="text-sm">
                                                {testResults.summary || 'Review detailed results below'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-500">Compliance Score</p>
                                            <p className="text-2xl font-bold">
                                                {Math.round((getSeverityCount('pass') / testResults.tests.length) * 100)}%
                                            </p>
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>

                            {/* Detailed Results */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Test Results</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Tabs defaultValue={testCategories[0].id}>
                                        <TabsList className="mb-4">
                                            <TabsTrigger value="all">All Results</TabsTrigger>
                                            {testCategories.map((cat) => (
                                                <TabsTrigger key={cat.id} value={cat.id}>
                                                    {cat.title}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>

                                        <TabsContent value="all">
                                            <div className="space-y-3">
                                                {testResults.tests?.map((test, idx) => {
                                                    const severity = severityConfig[test.severity];
                                                    const Icon = severity.icon;
                                                    return (
                                                        <div 
                                                            key={idx}
                                                            className={cn(
                                                                "p-4 border rounded-lg cursor-pointer transition-all",
                                                                severity.color,
                                                                expandedTest === idx && "ring-2 ring-offset-2"
                                                            )}
                                                            onClick={() => setExpandedTest(expandedTest === idx ? null : idx)}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-start gap-3 flex-1">
                                                                    <Icon className="h-5 w-5 mt-0.5" />
                                                                    <div className="flex-1">
                                                                        <p className="font-medium mb-1">{test.name}</p>
                                                                        <p className="text-sm mb-2">{test.description}</p>
                                                                        {expandedTest === idx && (
                                                                            <div className="mt-3 space-y-2">
                                                                                {test.details && (
                                                                                    <div className="bg-white/50 p-3 rounded">
                                                                                        <p className="text-xs font-medium mb-1">Details:</p>
                                                                                        <pre className="text-xs whitespace-pre-wrap">{test.details}</pre>
                                                                                    </div>
                                                                                )}
                                                                                {test.recommendation && (
                                                                                    <div className="bg-white/50 p-3 rounded">
                                                                                        <p className="text-xs font-medium mb-1">Recommendation:</p>
                                                                                        <p className="text-xs">{test.recommendation}</p>
                                                                                    </div>
                                                                                )}
                                                                                {test.affected_entities && (
                                                                                    <div className="bg-white/50 p-3 rounded">
                                                                                        <p className="text-xs font-medium mb-1">Affected Entities:</p>
                                                                                        <p className="text-xs">{test.affected_entities.join(', ')}</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <Badge className={severity.color}>
                                                                    {severity.label}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </TabsContent>

                                        {testCategories.map((cat) => (
                                            <TabsContent key={cat.id} value={cat.id}>
                                                <div className="space-y-3">
                                                    {testResults.tests?.filter(t => t.category === cat.id).map((test, idx) => {
                                                        const severity = severityConfig[test.severity];
                                                        const Icon = severity.icon;
                                                        return (
                                                            <div 
                                                                key={idx}
                                                                className={cn(
                                                                    "p-4 border rounded-lg",
                                                                    severity.color
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex items-start gap-3">
                                                                        <Icon className="h-5 w-5 mt-0.5" />
                                                                        <div>
                                                                            <p className="font-medium mb-1">{test.name}</p>
                                                                            <p className="text-sm">{test.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge className={severity.color}>
                                                                        {severity.label}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </TabsContent>
                                        ))}
                                    </Tabs>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {!testResults && !runTestMutation.isPending && (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Tests Run Yet</h3>
                                <p className="text-slate-600 mb-6">
                                    Run compliance tests to validate multi-tenant isolation, security, and global standards compliance
                                </p>
                                <Button onClick={handleRunAllTests} className="bg-blue-600 hover:bg-blue-700">
                                    <Play className="h-4 w-4 mr-2" />
                                    Run All Tests Now
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}