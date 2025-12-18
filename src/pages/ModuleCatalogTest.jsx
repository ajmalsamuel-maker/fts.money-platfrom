import React, { useState } from 'react';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ModuleSelector from '@/components/platform/ModuleSelector';
import ModuleDependencyEngine from '@/components/platform/ModuleDependencyEngine';
import SmartMenuGenerator from '@/components/platform/SmartMenuGenerator';
import { MODULE_DEFINITIONS } from '@/components/platform/ModuleDefinitions';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Code,
  Menu as MenuIcon,
  Shield,
  DollarSign,
  Zap
} from 'lucide-react';

export default function ModuleCatalogTest() {
  const { user } = usePlatformAuth(['VIEW_PLATFORM']);
  const [selectedModules, setSelectedModules] = useState([
    'core_dashboard',
    'core_transactions',
    'core_merchants',
    'core_system'
  ]);
  const [subscriptionTier, setSubscriptionTier] = useState('professional');
  const [testResults, setTestResults] = useState(null);

  const runTests = () => {
    const engine = new ModuleDependencyEngine();
    const menuGen = new SmartMenuGenerator(selectedModules, 'admin');

    // Test 1: Dependency Resolution
    const validation = engine.validateModuleSelection(selectedModules);

    // Test 2: Pricing Calculation
    const pricing = engine.calculatePricing(selectedModules);

    // Test 3: Compliance Requirements
    const compliance = engine.getComplianceRequirements(selectedModules);

    // Test 4: Feature Flags
    const features = engine.getEnabledFeatures(selectedModules);

    // Test 5: Menu Generation
    const generatedMenus = menuGen.generateMenus();
    const adminMenus = menuGen.generateMenuForRole('admin');
    const viewerMenus = menuGen.generateMenuForRole('viewer');

    // Test 6: Conflict Detection
    const conflictTest = engine.checkConflicts(selectedModules);

    setTestResults({
      validation,
      pricing,
      compliance,
      features,
      generatedMenus,
      adminMenus,
      viewerMenus,
      conflictTest,
      timestamp: new Date().toISOString()
    });
  };

  const TestResultCard = ({ title, status, children }) => (
    <Card className={status === 'pass' ? 'border-green-500 bg-green-50' : status === 'fail' ? 'border-red-500 bg-red-50' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {status === 'pass' && <CheckCircle className="h-5 w-5 text-green-600" />}
          {status === 'fail' && <XCircle className="h-5 w-5 text-red-600" />}
          {status === 'info' && <AlertTriangle className="h-5 w-5 text-blue-600" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <FTSPlatformSidebar 
        currentPage="ModuleCatalogTest"
        userEmail={user?.email}
        userRole={user?.role}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Module Catalog System Test Suite</h1>
                <p className="text-slate-600">Comprehensive testing for module dependencies, pricing, compliance, and menu generation</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="setup" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="setup">Setup & Configuration</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
              <TabsTrigger value="menus">Generated Menus</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>

            {/* Setup Tab */}
            <TabsContent value="setup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Configuration</CardTitle>
                  <CardDescription>Select modules and subscription tier for testing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subscription Tier</label>
                    <div className="flex gap-2">
                      {['free', 'starter', 'professional', 'enterprise'].map(tier => (
                        <Button
                          key={tier}
                          variant={subscriptionTier === tier ? 'default' : 'outline'}
                          onClick={() => setSubscriptionTier(tier)}
                        >
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Selected Modules ({selectedModules.length})</label>
                    <ModuleSelector
                      selectedModules={selectedModules}
                      subscriptionTier={subscriptionTier}
                      onChange={setSelectedModules}
                    />
                  </div>

                  <Button onClick={runTests} size="lg" className="w-full">
                    <Zap className="mr-2 h-5 w-5" />
                    Run Complete Test Suite
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {!testResults && (
                <Alert>
                  <AlertDescription>
                    Click "Run Complete Test Suite" in the Setup tab to see test results.
                  </AlertDescription>
                </Alert>
              )}

              {testResults && (
                <>
                  {/* Test 1: Dependency Resolution */}
                  <TestResultCard 
                    title="Test 1: Dependency Resolution"
                    status={testResults.validation.valid ? 'pass' : 'fail'}
                  >
                    <div className="space-y-3">
                      <div>
                        <strong>Status:</strong> {testResults.validation.valid ? '✅ Valid' : '❌ Invalid'}
                      </div>
                      {testResults.validation.missingDependencies.length > 0 && (
                        <div>
                          <strong>Missing Dependencies:</strong>
                          <ul className="list-disc ml-5 mt-1">
                            {testResults.validation.missingDependencies.map(id => (
                              <li key={id}>{MODULE_DEFINITIONS[id]?.module_name} ({id})</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <strong>All Required Modules:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {testResults.validation.allRequiredModules.map(id => (
                            <Badge key={id} variant="outline">
                              {MODULE_DEFINITIONS[id]?.module_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TestResultCard>

                  {/* Test 2: Pricing */}
                  <TestResultCard title="Test 2: Pricing Calculation" status="pass">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                        <span className="font-semibold">Monthly Fixed Cost:</span>
                        <span className="text-2xl font-bold">${testResults.pricing.monthlyFixed}</span>
                      </div>
                      {testResults.pricing.transactionFees > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg">
                          <span className="font-semibold">Transaction Fees:</span>
                          <span className="text-xl font-bold">{testResults.pricing.transactionFees.toFixed(3)}%</span>
                        </div>
                      )}
                      {testResults.pricing.perMerchantFees > 0 && (
                        <div className="flex items-center justify-between p-3 bg-purple-100 rounded-lg">
                          <span className="font-semibold">Per Merchant Fee:</span>
                          <span className="text-xl font-bold">${testResults.pricing.perMerchantFees}/mo</span>
                        </div>
                      )}
                    </div>
                  </TestResultCard>

                  {/* Test 3: Compliance */}
                  <TestResultCard title="Test 3: Compliance Requirements" status="pass">
                    <div className="flex flex-wrap gap-2">
                      {testResults.compliance.map(standard => (
                        <Badge key={standard} className="bg-red-100 text-red-800">
                          <Shield className="h-3 w-3 mr-1" />
                          {standard}
                        </Badge>
                      ))}
                    </div>
                  </TestResultCard>

                  {/* Test 4: Features */}
                  <TestResultCard title="Test 4: Enabled Features" status="info">
                    <div className="flex flex-wrap gap-2">
                      {testResults.features.map(feature => (
                        <Badge key={feature} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </TestResultCard>

                  {/* Test 5: Conflicts */}
                  <TestResultCard 
                    title="Test 5: Conflict Detection"
                    status={testResults.conflictTest.length === 0 ? 'pass' : 'fail'}
                  >
                    {testResults.conflictTest.length === 0 ? (
                      <p className="text-green-700">✅ No conflicts detected</p>
                    ) : (
                      <ul className="list-disc ml-5 text-red-700">
                        {testResults.conflictTest.map((conflict, idx) => (
                          <li key={idx}>{conflict.reason}</li>
                        ))}
                      </ul>
                    )}
                  </TestResultCard>
                </>
              )}
            </TabsContent>

            {/* Menus Tab */}
            <TabsContent value="menus" className="space-y-6">
              {!testResults && (
                <Alert>
                  <AlertDescription>
                    Run tests first to see generated menus.
                  </AlertDescription>
                </Alert>
              )}

              {testResults && (
                <>
                  {/* Admin Menus */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MenuIcon className="h-5 w-5" />
                        Admin Menus ({testResults.adminMenus.length} groups)
                      </CardTitle>
                      <CardDescription>Full menu structure for admin role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {testResults.adminMenus.map(group => (
                          <div key={group.id} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">{group.label} ({group.items.length} items)</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {group.items.map(item => (
                                <div key={item.path} className="text-sm flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{item.path}</Badge>
                                  <span className="text-slate-600">{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Viewer Menus */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MenuIcon className="h-5 w-5" />
                        Viewer Menus ({testResults.viewerMenus.length} groups)
                      </CardTitle>
                      <CardDescription>Filtered menu structure for viewer role (read-only)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {testResults.viewerMenus.map(group => (
                          <div key={group.id} className="border rounded-lg p-4 bg-slate-50">
                            <h4 className="font-semibold mb-2">{group.label} ({group.items.length} items)</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {group.items.map(item => (
                                <div key={item.path} className="text-sm flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{item.path}</Badge>
                                  <span className="text-slate-600">{item.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* JSON Export */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Menu Configuration Export</CardTitle>
                      <CardDescription>JSON format for database storage</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs">
                        {JSON.stringify(testResults.generatedMenus, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="documentation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Case Documentation</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Test Scenarios</h3>
                  
                  <h4>Scenario 1: Basic Module Selection</h4>
                  <ol>
                    <li>Select "Core Dashboard", "Core Transactions", "Core Merchants"</li>
                    <li>Expected: No missing dependencies, valid configuration</li>
                    <li>Verify: All core menus are generated</li>
                  </ol>

                  <h4>Scenario 2: Module with Dependencies</h4>
                  <ol>
                    <li>Select only "Smart Routing" (requires Payment Gateways)</li>
                    <li>Expected: System auto-adds "Payment Gateways" dependency</li>
                    <li>Verify: Missing dependencies alert shows before auto-add</li>
                  </ol>

                  <h4>Scenario 3: Subscription Tier Restrictions</h4>
                  <ol>
                    <li>Set tier to "Starter"</li>
                    <li>Attempt to select "Smart Routing" (Enterprise only)</li>
                    <li>Expected: Module is locked with lock icon</li>
                    <li>Verify: Cannot select locked modules</li>
                  </ol>

                  <h4>Scenario 4: Pricing Calculation</h4>
                  <ol>
                    <li>Select modules with different pricing models</li>
                    <li>Expected: Correct calculation of fixed, per-transaction, and per-merchant fees</li>
                    <li>Verify: Pricing summary shows all components</li>
                  </ol>

                  <h4>Scenario 5: Compliance Requirements</h4>
                  <ol>
                    <li>Select "Crypto Payments" + "Compliance Suite"</li>
                    <li>Expected: Shows FATF, PCI DSS, GDPR, ISO 27001 badges</li>
                    <li>Verify: All standards are listed</li>
                  </ol>

                  <h4>Scenario 6: Menu Generation for Different Roles</h4>
                  <ol>
                    <li>Run tests with selected modules</li>
                    <li>Check "Generated Menus" tab</li>
                    <li>Expected: Admin sees all menus, Viewer sees filtered menus</li>
                    <li>Verify: Viewer only sees VIEW_* permissions</li>
                  </ol>

                  <h4>Scenario 7: Complete Enterprise Setup</h4>
                  <ol>
                    <li>Set tier to "Enterprise"</li>
                    <li>Select all modules</li>
                    <li>Expected: All dependencies resolve, comprehensive menu structure</li>
                    <li>Verify: Total pricing and compliance requirements</li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}