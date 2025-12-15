import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Play } from 'lucide-react';

export default function IsolationValidator({ pspCode }) {
    const [validating, setValidating] = useState(false);
    const [results, setResults] = useState(null);

    const runValidation = async () => {
        setValidating(true);
        try {
            const { data } = await base44.functions.invoke('validatePSPIsolation', { psp_code: pspCode });
            setResults(data);
        } catch (error) {
            setResults({ success: false, error: error.message });
        }
        setValidating(false);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <CardTitle>PCI/GDPR Isolation Validator</CardTitle>
                    </div>
                    <Button onClick={runValidation} disabled={validating}>
                        <Play className="h-4 w-4 mr-2" />
                        {validating ? 'Validating...' : 'Run Validation'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {!results && (
                    <Alert>
                        <AlertDescription>
                            Click "Run Validation" to verify complete PSP isolation for PCI DSS Level 1 and GDPR compliance.
                        </AlertDescription>
                    </Alert>
                )}

                {results && (
                    <div className="space-y-4">
                        {/* Compliance Status */}
                        <div className="flex items-center justify-between p-4 rounded-lg border">
                            <div>
                                <h3 className="font-semibold">Compliance Status</h3>
                                <p className="text-sm text-slate-600">PSP: {results.psp_code}</p>
                            </div>
                            <Badge className={results.compliance_status === 'COMPLIANT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {results.compliance_status === 'COMPLIANT' ? (
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                ) : (
                                    <XCircle className="h-4 w-4 mr-1" />
                                )}
                                {results.compliance_status}
                            </Badge>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg border">
                                <div className="text-2xl font-bold">{results.summary?.total_tests || 0}</div>
                                <div className="text-sm text-slate-600">Total Tests</div>
                            </div>
                            <div className="p-4 rounded-lg border">
                                <div className="text-2xl font-bold text-red-600">
                                    {results.summary?.critical_violations || 0}
                                </div>
                                <div className="text-sm text-slate-600">Critical Violations</div>
                            </div>
                            <div className="p-4 rounded-lg border">
                                <div className="text-2xl font-bold text-amber-600">
                                    {results.summary?.warnings || 0}
                                </div>
                                <div className="text-sm text-slate-600">Warnings</div>
                            </div>
                        </div>

                        {/* Violations */}
                        {results.violations && results.violations.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-red-600">Critical Violations</h3>
                                {results.violations.map((violation, idx) => (
                                    <Alert key={idx} variant="destructive">
                                        <XCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="font-semibold">{violation.test}</div>
                                            <div className="text-sm">{violation.message}</div>
                                            <div className="text-xs mt-1 text-slate-600">
                                                Compliance: {violation.compliance}
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}

                        {/* Warnings */}
                        {results.warnings && results.warnings.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-amber-600">Warnings</h3>
                                {results.warnings.map((warning, idx) => (
                                    <Alert key={idx}>
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="font-semibold">{warning.test}</div>
                                            <div className="text-sm">{warning.message}</div>
                                            {warning.recommendation && (
                                                <div className="text-xs mt-1 text-blue-600">
                                                    → {warning.recommendation}
                                                </div>
                                            )}
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        )}

                        {/* Success */}
                        {results.compliance_status === 'COMPLIANT' && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                <AlertDescription>
                                    <div className="font-semibold text-green-900">
                                        ✓ All Compliance Tests Passed
                                    </div>
                                    <div className="text-sm text-green-700 mt-1">
                                        PSP {results.psp_code} is fully isolated and compliant with PCI DSS Level 1 and GDPR requirements.
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="text-xs text-slate-500">
                            Validation completed: {results.timestamp}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}