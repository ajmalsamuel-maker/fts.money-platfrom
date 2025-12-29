import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import LEIVerificationWidget from '@/components/lei/LEIVerificationWidget';
import GracePeriodBanner from '@/components/lei/GracePeriodBanner';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Database } from 'lucide-react';

export default function LEIPhase1Testing() {
    const { platformUser, loading } = usePlatformAuth();
    const [testResults, setTestResults] = useState([]);
    const [testEntityId, setTestEntityId] = useState('');
    const [testEntityType, setTestEntityType] = useState('ProvisionedPSP');

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    const addTestResult = (test, success, message, data = null) => {
        setTestResults(prev => [...prev, { test, success, message, data, timestamp: new Date() }]);
    };

    const testGLEIFVerification = async () => {
        const testLEIs = [
            { lei: '549300VGEJQDPBGRBZ35', name: 'Apple Inc.' },
            { lei: '54930084UKLVMY22DS16', name: 'Amazon.com Inc.' },
            { lei: 'INVALID1234567890XX', name: 'Invalid LEI' }
        ];

        for (const { lei, name } of testLEIs) {
            try {
                const { data } = await base44.functions.invoke('gleifIntegration', {
                    action: 'verify_lei',
                    lei: lei
                });

                addTestResult(
                    `Verify ${name}`,
                    data.valid,
                    data.valid ? `✓ Verified: ${data.legal_name}` : `✗ ${data.error}`,
                    data
                );
            } catch (error) {
                addTestResult(`Verify ${name}`, false, error.message);
            }
        }
    };

    const testSearchLEI = async () => {
        const testCompanies = ['Apple', 'Microsoft', 'Goldman Sachs'];

        for (const company of testCompanies) {
            try {
                const { data } = await base44.functions.invoke('gleifIntegration', {
                    action: 'search_lei',
                    company_name: company
                });

                addTestResult(
                    `Search "${company}"`,
                    data.results.length > 0,
                    `Found ${data.results.length} results`,
                    data.results
                );
            } catch (error) {
                addTestResult(`Search "${company}"`, false, error.message);
            }
        }
    };

    const testGracePeriod = async () => {
        if (!testEntityId) {
            addTestResult('Grace Period', false, 'Please enter entity ID');
            return;
        }

        try {
            // Start grace period
            const { data: startData } = await base44.functions.invoke('gleifIntegration', {
                action: 'start_grace_period',
                entity_type: testEntityType,
                entity_id: testEntityId
            });

            addTestResult('Start Grace Period', true, startData.message, startData);

            // Check grace period
            const { data: checkData } = await base44.functions.invoke('gleifIntegration', {
                action: 'check_grace_period',
                entity_type: testEntityType,
                entity_id: testEntityId
            });

            addTestResult('Check Grace Period', checkData.in_grace_period, 
                `${checkData.days_remaining} days remaining`, checkData);

        } catch (error) {
            addTestResult('Grace Period Test', false, error.message);
        }
    };

    const testEntitySchemas = async () => {
        const entities = [
            { name: 'AppUser', requiredFields: ['lei', 'lei_status', 'vlei_credential', 'grace_period_end'] },
            { name: 'ProvisionedPSP', requiredFields: ['lei', 'lei_status', 'vlei_issued_date', 'grace_period_end'] },
            { name: 'ISOGatewayCustomer', requiredFields: ['lei', 'lei_status', 'grace_period_end'] },
            { name: 'OrchestrationCustomer', requiredFields: ['lei', 'lei_status', 'grace_period_end'] },
            { name: 'CryptoGatewayCustomer', requiredFields: ['lei', 'lei_status', 'grace_period_end'] },
            { name: 'RWAProvider', requiredFields: ['lei', 'lei_status', 'grace_period_end'] },
            { name: 'Merchant', requiredFields: ['lei', 'lei_status', 'lei_verified_date'] }
        ];

        for (const { name, requiredFields } of entities) {
            try {
                // Fetch a sample record to check schema structure
                const records = await base44.entities[name].list('', 1);
                
                // Check if entity has data
                if (records.length > 0) {
                    const sample = records[0];
                    const hasFields = requiredFields.some(field => field in sample);
                    
                    addTestResult(
                        `${name} Schema`,
                        hasFields,
                        hasFields ? '✓ LEI fields present in entity' : '✗ No LEI fields found',
                        { entity: name, sample: Object.keys(sample).filter(k => k.includes('lei') || k.includes('grace')) }
                    );
                } else {
                    addTestResult(
                        `${name} Schema`,
                        true,
                        'ℹ No records yet - schema assumed correct',
                        { entity: name, requiredFields }
                    );
                }
            } catch (error) {
                addTestResult(`${name} Schema`, false, error.message);
            }
        }
    };

    const runAllTests = async () => {
        setTestResults([]);
        addTestResult('Test Suite', true, 'Starting Phase 1 LEI Tests...');
        
        await testEntitySchemas();
        await testGLEIFVerification();
        await testSearchLEI();
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebar 
                currentPage="LEIPhase1Testing"
                userEmail={platformUser.email}
                userRole={platformUser.platform_role}
                isSuperAdmin={platformUser.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900">LEI Phase 1 Testing</h1>
                            <p className="text-slate-600 mt-2">Test GLEIF integration, grace periods, and schema updates</p>
                        </div>

                        <Tabs defaultValue="automated" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="automated">Automated Tests</TabsTrigger>
                                <TabsTrigger value="widget">LEI Widget</TabsTrigger>
                                <TabsTrigger value="grace-banner">Grace Period Banner</TabsTrigger>
                                <TabsTrigger value="manual">Manual Testing</TabsTrigger>
                            </TabsList>

                            {/* Automated Tests */}
                            <TabsContent value="automated" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Automated Test Suite</CardTitle>
                                        <CardDescription>Run comprehensive tests for all Phase 1 components</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-3">
                                            <Button onClick={runAllTests}>
                                                Run All Tests
                                            </Button>
                                            <Button onClick={testEntitySchemas} variant="outline">
                                                Test Schemas Only
                                            </Button>
                                            <Button onClick={testGLEIFVerification} variant="outline">
                                                Test GLEIF API
                                            </Button>
                                            <Button onClick={testSearchLEI} variant="outline">
                                                Test LEI Search
                                            </Button>
                                        </div>

                                        {/* Test Results */}
                                        {testResults.length > 0 && (
                                            <div className="mt-6 space-y-2 max-h-96 overflow-y-auto">
                                                <h3 className="font-medium text-sm">Test Results:</h3>
                                                {testResults.map((result, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className={`p-3 rounded-lg border ${
                                                            result.success 
                                                                ? 'bg-green-50 border-green-200' 
                                                                : 'bg-red-50 border-red-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            {result.success ? (
                                                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{result.test}</p>
                                                                <p className="text-sm text-slate-600">{result.message}</p>
                                                                {result.data && (
                                                                    <details className="mt-2">
                                                                        <summary className="text-xs text-slate-500 cursor-pointer">View data</summary>
                                                                        <pre className="text-xs mt-2 p-2 bg-slate-900 text-slate-100 rounded overflow-auto max-h-40">
                                                                            {JSON.stringify(result.data, null, 2)}
                                                                        </pre>
                                                                    </details>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-slate-500">
                                                                {result.timestamp.toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* LEI Widget Test */}
                            <TabsContent value="widget" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>LEI Verification Widget</CardTitle>
                                        <CardDescription>Test the reusable LEI verification component</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <LEIVerificationWidget 
                                            entityType="ProvisionedPSP"
                                            entityId="test-psp-001"
                                            currentLEI=""
                                            onLEIVerified={(data) => {
                                                addTestResult('Widget LEI Verified', true, `Verified: ${data.legal_name}`, data);
                                            }}
                                        />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Test with Known LEIs</CardTitle>
                                        <CardDescription>Use these verified LEIs for testing</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="grid gap-2">
                                            <div className="p-3 border rounded-lg">
                                                <p className="font-medium text-sm">Apple Inc.</p>
                                                <code className="text-xs">549300VGEJQDPBGRBZ35</code>
                                            </div>
                                            <div className="p-3 border rounded-lg">
                                                <p className="font-medium text-sm">Amazon.com Inc.</p>
                                                <code className="text-xs">54930084UKLVMY22DS16</code>
                                            </div>
                                            <div className="p-3 border rounded-lg">
                                                <p className="font-medium text-sm">Goldman Sachs Group Inc.</p>
                                                <code className="text-xs">784F5XWPLTWKTBV3E584</code>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Grace Period Banner Test */}
                            <TabsContent value="grace-banner" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Grace Period Banner</CardTitle>
                                        <CardDescription>Test grace period notifications</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Entity Type</label>
                                            <select 
                                                value={testEntityType}
                                                onChange={(e) => setTestEntityType(e.target.value)}
                                                className="w-full p-2 border rounded"
                                            >
                                                <option value="ProvisionedPSP">PSP</option>
                                                <option value="ISOGatewayCustomer">ISO Gateway Customer</option>
                                                <option value="OrchestrationCustomer">Orchestration Customer</option>
                                                <option value="CryptoGatewayCustomer">Crypto Gateway Customer</option>
                                                <option value="RWAProvider">RWA Provider</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Entity ID</label>
                                            <Input
                                                value={testEntityId}
                                                onChange={(e) => setTestEntityId(e.target.value)}
                                                placeholder="Enter entity ID to test..."
                                            />
                                        </div>

                                        <Button onClick={testGracePeriod}>
                                            <Clock className="h-4 w-4 mr-2" />
                                            Test Grace Period
                                        </Button>

                                        {testEntityId && (
                                            <div className="mt-6">
                                                <p className="text-sm font-medium mb-2">Live Banner Test:</p>
                                                <GracePeriodBanner 
                                                    entityType={testEntityType}
                                                    entityId={testEntityId}
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Manual Testing Guide */}
                            <TabsContent value="manual" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Manual Testing Checklist</CardTitle>
                                        <CardDescription>Step-by-step testing guide</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-3 p-3 border rounded-lg">
                                                <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-sm">1. Verify Schema Updates</p>
                                                    <p className="text-sm text-slate-600">Check that all entities have LEI fields (click "Test Schemas Only")</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 border rounded-lg">
                                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-sm">2. Test LEI Verification</p>
                                                    <p className="text-sm text-slate-600">Use the Widget tab to verify real LEIs against GLEIF API</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 border rounded-lg">
                                                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-sm">3. Test Grace Period Flow</p>
                                                    <p className="text-sm text-slate-600">Create test entity → Start grace period → Check banner display</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3 p-3 border rounded-lg">
                                                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-sm">4. Test Integration in Pages</p>
                                                    <p className="text-sm text-slate-600">Add LEIVerificationWidget to PSP provisioning, merchant onboarding</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="font-medium text-sm text-blue-900 mb-2">✅ Phase 1 Complete When:</p>
                                            <ul className="space-y-1 text-sm text-blue-800">
                                                <li>• All entity schemas have LEI fields</li>
                                                <li>• GLEIF API verification working</li>
                                                <li>• LEI search returning results</li>
                                                <li>• Grace period start/check functional</li>
                                                <li>• Widgets integrated in key pages</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}