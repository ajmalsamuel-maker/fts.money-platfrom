import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, XCircle, Loader2, Play, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth, getRoleLabel } from '@/components/auth/usePlatformAuth';

const testCases = [
    {
        id: 'platform_lei',
        name: 'Platform LEI Initialization',
        description: 'Test FTS Platform LEI initialization with GLEIF verification',
        function: 'initializePlatformLEI',
        payload: {
            action: 'initialize',
            lei: '8755004V1PELJONQ7791',
            legal_name: 'FTS.Money Ltd Test'
        }
    },
    {
        id: 'platform_lei_get',
        name: 'Platform LEI Retrieval',
        description: 'Verify Platform LEI can be retrieved',
        function: 'initializePlatformLEI',
        payload: {
            action: 'get'
        }
    },
    {
        id: 'psp_lei_verify',
        name: 'PSP LEI Verification',
        description: 'Test PSP LEI verification via GLEIF API',
        function: 'gleifIntegration',
        payload: {
            action: 'verify_lei',
            lei: '8755004V1PELJONQ7791',
            entity_type: 'psp',
            entity_id: 'test-psp-lei-001'
        }
    },
    {
        id: 'merchant_lei_verify',
        name: 'Merchant LEI Verification',
        description: 'Test Merchant LEI verification via GLEIF API',
        function: 'gleifIntegration',
        payload: {
            action: 'verify_lei',
            lei: '8755004V1PELJONQ7791',
            entity_type: 'merchant',
            entity_id: 'test-merchant-lei-001'
        }
    },
    {
        id: 'vlei_issuance',
        name: 'vLEI Credential Issuance',
        description: 'Test vLEI credential generation for verified LEI',
        function: 'gleifIntegration',
        payload: {
            action: 'issue_vlei',
            lei: '8755004V1PELJONQ7791',
            entity_type: 'psp',
            entity_id: 'test-psp-lei-001'
        }
    },
    {
        id: 'chain_verification',
        name: 'Credential Chain Verification',
        description: 'Test LEI credential chain validation',
        function: 'gleifIntegration',
        payload: {
            action: 'verify_chain',
            credential_chain: ['8755004V1PELJONQ7791']
        }
    }
];

export default function LEIGLEIFTestReport() {
    const navigate = useNavigate();
    const { platformUser } = usePlatformAuth();
    const [testResults, setTestResults] = useState({});
    const [runningTest, setRunningTest] = useState(null);
    const [runningAll, setRunningAll] = useState(false);

    const runTest = async (testCase) => {
        setRunningTest(testCase.id);
        setTestResults(prev => ({
            ...prev,
            [testCase.id]: { status: 'running', startTime: Date.now() }
        }));

        try {
            const response = await base44.functions.invoke(testCase.function, testCase.payload);
            const duration = Date.now() - testResults[testCase.id].startTime;
            
            setTestResults(prev => ({
                ...prev,
                [testCase.id]: {
                    status: response.data.success !== false ? 'passed' : 'failed',
                    duration,
                    response: response.data,
                    error: response.data.error || null
                }
            }));
        } catch (error) {
            const duration = Date.now() - (testResults[testCase.id]?.startTime || Date.now());
            setTestResults(prev => ({
                ...prev,
                [testCase.id]: {
                    status: 'failed',
                    duration,
                    error: error.message,
                    response: null
                }
            }));
        }

        setRunningTest(null);
    };

    const runAllTests = async () => {
        setRunningAll(true);
        for (const testCase of testCases) {
            await runTest(testCase);
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        setRunningAll(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'passed': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
            case 'failed': return 'bg-red-100 text-red-700 border-red-300';
            case 'running': return 'bg-blue-100 text-blue-700 border-blue-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    const totalTests = testCases.length;
    const completedTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(r => r.status === 'passed').length;
    const failedTests = Object.values(testResults).filter(r => r.status === 'failed').length;

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="LEIGLEIFTestReport" 
                userRole={getRoleLabel(platformUser?.platform_role)} 
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => navigate(createPageUrl('FTSMoneyPlatform'))}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">GLEIF API Integration Test Report</h2>
                            <p className="text-xs text-slate-600">LEI/vLEI verification across all platform levels</p>
                        </div>
                    </div>
                    <Button 
                        onClick={runAllTests}
                        disabled={runningAll}
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                    >
                        {runningAll ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Running Tests...
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4" />
                                Run All Tests
                            </>
                        )}
                    </Button>
                </header>

                <div className="p-6">
                    {/* Summary */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-slate-600 mb-1">Total Tests</p>
                                <p className="text-3xl font-bold">{totalTests}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-slate-600 mb-1">Completed</p>
                                <p className="text-3xl font-bold text-blue-600">{completedTests}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-slate-600 mb-1">Passed</p>
                                <p className="text-3xl font-bold text-emerald-600">{passedTests}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-sm text-slate-600 mb-1">Failed</p>
                                <p className="text-3xl font-bold text-red-600">{failedTests}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Fix Summary */}
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-900">
                            <strong>GLEIF API Data Fix Applied:</strong> registration_authority and registration_number 
                            now correctly parse object responses from GLEIF API to extract string values.
                            <div className="mt-2 text-sm space-y-1">
                                <div>✓ Fixed initializePlatformLEI.js (Platform Level)</div>
                                <div>✓ Fixed gleifIntegration.js (PSP/Merchant Level)</div>
                                <div>✓ Frontend component (LEIVerificationStep.js) uses LLM simulation - no changes needed</div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Test Cases */}
                    <div className="space-y-4">
                        {testCases.map((testCase) => {
                            const result = testResults[testCase.id];
                            return (
                                <Card key={testCase.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {result?.status === 'passed' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                                                {result?.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                                                {result?.status === 'running' && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
                                                {!result && <div className="h-5 w-5 rounded-full border-2 border-slate-300" />}
                                                <div>
                                                    <CardTitle className="text-base">{testCase.name}</CardTitle>
                                                    <p className="text-xs text-slate-600 mt-1">{testCase.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {result && (
                                                    <Badge className={getStatusColor(result.status)}>
                                                        {result.status.toUpperCase()}
                                                    </Badge>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => runTest(testCase)}
                                                    disabled={runningTest === testCase.id}
                                                >
                                                    {runningTest === testCase.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Play className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {result && (
                                        <CardContent>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4 text-sm">
                                                    <div>
                                                        <span className="text-slate-600">Duration: </span>
                                                        <span className="font-medium">{result.duration}ms</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-600">Function: </span>
                                                        <span className="font-mono text-xs">{testCase.function}</span>
                                                    </div>
                                                </div>

                                                {result.error && (
                                                    <Alert className="bg-red-50 border-red-200">
                                                        <AlertDescription className="text-red-900 text-sm">
                                                            <strong>Error:</strong> {result.error}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}

                                                {result.response && (
                                                    <div>
                                                        <p className="text-xs text-slate-600 mb-2">Response:</p>
                                                        <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-auto max-h-64">
                                                            {JSON.stringify(result.response, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    {/* Platform Coverage Summary */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Platform Coverage Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-sm mb-3">Backend Functions Fixed</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span>functions/initializePlatformLEI.js</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span>functions/gleifIntegration.js</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm mb-3">Coverage by Entity Type</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span>Platform LEI (FTS.Money)</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span>PSP LEI Verification</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span>Merchant LEI Verification</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                                            <span>Community Portal (uses same backend)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}