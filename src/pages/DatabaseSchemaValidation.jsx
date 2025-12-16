import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, XCircle, Play, Database, FileWarning, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DatabaseSchemaValidation() {
    const { platformUser, loading } = usePlatformAuth();
    const [validationResults, setValidationResults] = useState(null);
    const [validating, setValidating] = useState(false);

    const { data: psps = [] } = useQuery({
        queryKey: ['provisioned-psps'],
        queryFn: () => base44.entities.ProvisionedPSP.list()
    });

    const handleValidateAll = async () => {
        setValidating(true);
        try {
            const response = await base44.functions.invoke('validateDatabaseSchema', {
                auto_fix: false
            });
            setValidationResults(response.data);
            
            if (response.data.summary.critical_issues > 0) {
                toast.error(`Found ${response.data.summary.critical_issues} critical isolation issues!`);
            } else if (response.data.summary.total_issues > 0) {
                toast.warning(`Found ${response.data.summary.total_issues} non-critical issues`);
            } else {
                toast.success('Schema validation passed - all PSPs properly isolated');
            }
        } catch (error) {
            toast.error('Validation failed: ' + error.message);
        } finally {
            setValidating(false);
        }
    };

    const handleValidateSingle = async (pspId) => {
        setValidating(true);
        try {
            const response = await base44.functions.invoke('validateDatabaseSchema', {
                psp_id: pspId,
                auto_fix: false
            });
            setValidationResults(response.data);
            toast.success('PSP validation completed');
        } catch (error) {
            toast.error('Validation failed: ' + error.message);
        } finally {
            setValidating(false);
        }
    };

    if (loading) return null;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="DatabaseSchemaValidation" 
                userRole={platformUser?.platform_role}
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Database Schema Validation</h2>
                        <p className="text-xs text-slate-600">Phase 0, Step 4: Validate PSP isolation & prevent cross-tenant data leaks</p>
                    </div>
                    <Button 
                        onClick={handleValidateAll}
                        disabled={validating}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {validating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                        Run Full Validation
                    </Button>
                </header>

                <main className="p-6">
                    {/* Summary Cards */}
                    {validationResults && (
                        <div className="grid grid-cols-5 gap-4 mb-6">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">PSPs Validated</p>
                                            <p className="text-3xl font-bold text-blue-600 mt-1">
                                                {validationResults.summary.total_psps_validated}
                                            </p>
                                        </div>
                                        <Database className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Passed</p>
                                            <p className="text-3xl font-bold text-emerald-600 mt-1">
                                                {validationResults.summary.passed}
                                            </p>
                                        </div>
                                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Failed</p>
                                            <p className="text-3xl font-bold text-red-600 mt-1">
                                                {validationResults.summary.failed}
                                            </p>
                                        </div>
                                        <XCircle className="h-8 w-8 text-red-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Critical Issues</p>
                                            <p className="text-3xl font-bold text-red-600 mt-1">
                                                {validationResults.summary.critical_issues}
                                            </p>
                                        </div>
                                        <AlertTriangle className="h-8 w-8 text-red-600" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-slate-600">Warnings</p>
                                            <p className="text-3xl font-bold text-amber-600 mt-1">
                                                {validationResults.summary.total_warnings}
                                            </p>
                                        </div>
                                        <FileWarning className="h-8 w-8 text-amber-600" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Recommendations */}
                    {validationResults?.recommendations && (
                        <Card className="mb-6 border-blue-200 bg-blue-50">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-blue-900 mb-2">Recommendations:</p>
                                        <ul className="space-y-1">
                                            {validationResults.recommendations.map((rec, idx) => (
                                                <li key={idx} className="text-sm text-blue-700">• {rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Validation Results */}
                    {validationResults ? (
                        <div className="space-y-4">
                            {validationResults.results.map((result, idx) => (
                                <Card key={idx} className={
                                    !result.passed ? 'border-red-300 bg-red-50' :
                                    result.warnings.length > 0 ? 'border-amber-300 bg-amber-50' :
                                    'border-emerald-300 bg-emerald-50'
                                }>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {result.passed ? (
                                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                                <div>
                                                    <CardTitle className="text-base">{result.psp_name}</CardTitle>
                                                    <p className="text-xs text-slate-600 mt-1">
                                                        Code: {result.psp_code} | Tenant: {result.tenant_id || 'None'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={
                                                result.passed ? 'bg-emerald-600' : 'bg-red-600'
                                            }>
                                                {result.passed ? 'PASSED' : 'FAILED'}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Issues */}
                                        {result.issues.length > 0 && (
                                            <div className="mb-4">
                                                <p className="font-semibold text-red-900 mb-2">Issues:</p>
                                                <div className="space-y-2">
                                                    {result.issues.map((issue, i) => (
                                                        <div key={i} className="bg-white border border-red-300 rounded-lg p-3">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Badge className={
                                                                            issue.severity === 'critical' ? 'bg-red-600' :
                                                                            issue.severity === 'error' ? 'bg-orange-600' :
                                                                            'bg-amber-600'
                                                                        }>
                                                                            {issue.severity}
                                                                        </Badge>
                                                                        <span className="text-sm font-medium text-slate-900">
                                                                            {issue.entity}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-slate-700 mb-1">{issue.issue}</p>
                                                                    {issue.fix && (
                                                                        <p className="text-xs text-slate-600">
                                                                            Fix: {issue.fix}
                                                                        </p>
                                                                    )}
                                                                    {issue.affected_records && (
                                                                        <p className="text-xs text-red-600 mt-1">
                                                                            Affected: {issue.affected_records} records
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Warnings */}
                                        {result.warnings.length > 0 && (
                                            <div>
                                                <p className="font-semibold text-amber-900 mb-2">Warnings:</p>
                                                <div className="space-y-2">
                                                    {result.warnings.map((warning, i) => (
                                                        <div key={i} className="bg-white border border-amber-200 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                                                    {warning.severity || 'warning'}
                                                                </Badge>
                                                                <span className="text-sm font-medium text-slate-900">
                                                                    {warning.entity}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-700">
                                                                {warning.issue || warning.message}
                                                            </p>
                                                            {warning.fix && (
                                                                <p className="text-xs text-slate-600 mt-1">
                                                                    Fix: {warning.fix}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 mb-4">No validation results yet</p>
                                <p className="text-sm text-slate-500 mb-6">
                                    Run a validation to check PSP database schema isolation and prevent cross-tenant data leaks
                                </p>
                                <div className="flex justify-center gap-3">
                                    <Button onClick={handleValidateAll} className="bg-blue-600">
                                        <Play className="h-4 w-4 mr-2" />
                                        Validate All PSPs
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card className="mt-6 border-slate-300">
                        <CardHeader>
                            <CardTitle className="text-base">Quick Validation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-3">
                                {psps.slice(0, 6).map(psp => (
                                    <Button
                                        key={psp.id}
                                        variant="outline"
                                        onClick={() => handleValidateSingle(psp.id)}
                                        disabled={validating}
                                        className="justify-start"
                                    >
                                        <Database className="h-4 w-4 mr-2" />
                                        {psp.psp_name}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}