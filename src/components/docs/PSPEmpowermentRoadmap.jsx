import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    CheckCircle2, 
    Circle, 
    AlertCircle, 
    ChevronRight,
    Package,
    Workflow,
    DollarSign,
    Gauge,
    FileText,
    Layout,
    Key,
    LineChart
} from 'lucide-react';

export default function PSPEmpowermentRoadmap() {
    const [selectedPhase, setSelectedPhase] = useState('phase1');

    const roadmap = {
        phase1: {
            name: "Phase 1: Core Product & Workflow Foundation",
            duration: "3-4 weeks",
            priority: "CRITICAL",
            components: [
                {
                    name: "PSPProductCatalog",
                    icon: Package,
                    description: "Allow PSPs to define their merchant-facing products/services",
                    entities: ["PSPProductTemplate", "PSPProductComponent", "PSPProductBundle"],
                    dependencies: [],
                    implementation: {
                        step1: "Create entity schemas for PSPProductTemplate with flexible component structure",
                        step2: "Build PSP Product Catalog UI (view, create, edit, clone products)",
                        step3: "Implement product bundling logic (combine multiple features)",
                        step4: "Add product versioning and lifecycle management",
                        step5: "Create product activation/deactivation workflow"
                    },
                    testPlan: [
                        "Create a basic product (e.g., 'Basic Payment Gateway')",
                        "Add components (payment processing, fraud detection, reporting)",
                        "Create a bundle combining 3+ products",
                        "Clone an existing product and modify it",
                        "Version a product and ensure backward compatibility",
                        "Deactivate a product and verify merchant impact handling",
                        "Test product dependencies (Product B requires Product A)"
                    ]
                },
                {
                    name: "PSPProvisioningWorkflow",
                    icon: Workflow,
                    description: "Configurable merchant onboarding workflows for each PSP",
                    entities: ["MerchantOnboardingWorkflowTemplate", "WorkflowStep", "WorkflowCondition"],
                    dependencies: ["WorkflowTemplate (existing)"],
                    implementation: {
                        step1: "Extend WorkflowTemplate for merchant onboarding context",
                        step2: "Create workflow builder UI (drag-drop steps)",
                        step3: "Implement conditional logic (if/then branching)",
                        step4: "Add approval gates and notifications",
                        step5: "Build workflow execution engine with state management",
                        step6: "Implement rollback/compensation logic for failures"
                    },
                    testPlan: [
                        "Create simple 3-step workflow (KYB → Documents → Pricing)",
                        "Add conditional branch (if high-risk, add enhanced due diligence)",
                        "Test approval gate (finance manager must approve)",
                        "Simulate failure at step 2 and verify rollback",
                        "Test parallel execution (multiple merchants onboarding)",
                        "Verify notification delivery at each step",
                        "Test workflow versioning (migrate merchants to v2)"
                    ]
                }
            ]
        },
        phase2: {
            name: "Phase 2: Pricing & Billing Engine",
            duration: "3-4 weeks",
            priority: "CRITICAL",
            components: [
                {
                    name: "MerchantPricingEngine",
                    icon: DollarSign,
                    description: "Dynamic pricing rules for PSPs to charge merchants",
                    entities: ["MerchantPricingRule", "PricingTier", "VolumeDiscount", "PromotionalPricing"],
                    dependencies: ["PSPProductCatalog", "MasterPricing (existing)"],
                    implementation: {
                        step1: "Create MerchantPricingRule entity with rule engine schema",
                        step2: "Build pricing rule builder UI (visual editor)",
                        step3: "Implement tiered pricing calculator",
                        step4: "Add volume-based discount engine",
                        step5: "Create promotional pricing campaigns (time-bound)",
                        step6: "Build pricing simulation/what-if tool"
                    },
                    testPlan: [
                        "Create simple percentage-based pricing (2.9% + $0.30)",
                        "Create tiered pricing (0-1k: 2.9%, 1k-10k: 2.7%, 10k+: 2.5%)",
                        "Add volume discount (>$100k/month: -0.2%)",
                        "Create promotional campaign (50% off first month)",
                        "Simulate pricing for $50k monthly volume merchant",
                        "Test pricing rule priority (specific > general)",
                        "Verify pricing inheritance from MasterPricing"
                    ]
                },
                {
                    name: "UsageMeteringSystem",
                    icon: Gauge,
                    description: "Track merchant consumption for usage-based billing",
                    entities: ["MerchantUsageMeter", "UsageEvent", "MeteringRule"],
                    dependencies: ["MerchantPricingRule"],
                    implementation: {
                        step1: "Create MerchantUsageMeter entity for various metrics",
                        step2: "Build event collection API (transactions, API calls, storage)",
                        step3: "Implement real-time aggregation engine",
                        step4: "Create usage dashboard for PSPs",
                        step5: "Add usage alerts and threshold notifications",
                        step6: "Build historical usage analytics"
                    },
                    testPlan: [
                        "Record 1000 transaction events for a merchant",
                        "Verify real-time usage counter updates",
                        "Test API call metering (track 500 API requests)",
                        "Set usage threshold (alert at 80% of limit)",
                        "Generate usage report for billing period",
                        "Test usage reset on billing cycle",
                        "Verify usage data retention (6 months minimum)"
                    ]
                },
                {
                    name: "MerchantInvoiceGenerator",
                    icon: FileText,
                    description: "Automated invoice generation for PSPs",
                    entities: ["MerchantInvoice", "InvoiceLineItem", "InvoiceTemplate"],
                    dependencies: ["MerchantPricingRule", "MerchantUsageMeter"],
                    implementation: {
                        step1: "Create MerchantInvoice entity with line items",
                        step2: "Build invoice calculation engine (apply pricing rules to usage)",
                        step3: "Create customizable invoice templates",
                        step4: "Implement automated invoice generation (scheduled)",
                        step5: "Add invoice delivery (email, portal download)",
                        step6: "Build invoice dispute/adjustment workflow"
                    },
                    testPlan: [
                        "Generate invoice for merchant with 5000 transactions",
                        "Verify all line items (base fees, volume discounts, promotions)",
                        "Test proration for partial month",
                        "Customize invoice template (add PSP logo, colors)",
                        "Schedule automatic invoice generation (1st of month)",
                        "Test invoice email delivery",
                        "Create invoice adjustment (credit note for dispute)"
                    ]
                }
            ]
        },
        phase3: {
            name: "Phase 3: Merchant Portal Framework",
            duration: "4-5 weeks",
            priority: "HIGH",
            components: [
                {
                    name: "MerchantPortalBuilder",
                    icon: Layout,
                    description: "Component library for PSPs to build merchant portals",
                    entities: ["PSPPortalConfig", "PortalComponent", "PortalTheme"],
                    dependencies: ["PSPProductCatalog"],
                    implementation: {
                        step1: "Create library of reusable merchant portal components",
                        step2: "Build portal builder UI (drag-drop page composer)",
                        step3: "Implement theming system (colors, fonts, logos)",
                        step4: "Add component configuration (show/hide features)",
                        step5: "Create portal preview/deployment system",
                        step6: "Build multi-language support framework"
                    },
                    testPlan: [
                        "Create basic dashboard using 5 standard components",
                        "Apply custom theme (PSP colors, logo)",
                        "Configure component visibility (hide advanced features)",
                        "Preview portal in sandbox environment",
                        "Deploy portal to test PSP instance",
                        "Test mobile responsiveness",
                        "Add Spanish language pack and verify translation"
                    ]
                },
                {
                    name: "MerchantAPIManager",
                    icon: Key,
                    description: "API access control for PSP merchants",
                    entities: ["MerchantAPIKey", "APIEndpoint", "APIRateLimit"],
                    dependencies: ["APIGatewayConfiguration (existing)"],
                    implementation: {
                        step1: "Create MerchantAPIKey entity with scopes",
                        step2: "Build API key generation/rotation UI",
                        step3: "Implement rate limiting per merchant/key",
                        step4: "Create API usage analytics dashboard",
                        step5: "Add webhook management for merchants",
                        step6: "Build API documentation generator (per PSP)"
                    },
                    testPlan: [
                        "Generate API key for merchant with payment scope",
                        "Test API call with valid key (200 response)",
                        "Test API call with invalid key (401 response)",
                        "Set rate limit (100 req/min) and verify enforcement",
                        "Rotate API key and verify old key invalidation",
                        "Track API usage (1000 calls) and view analytics",
                        "Configure webhook endpoint and test delivery"
                    ]
                }
            ]
        },
        phase4: {
            name: "Phase 4: Analytics & Intelligence",
            duration: "2-3 weeks",
            priority: "MEDIUM",
            components: [
                {
                    name: "MerchantAnalyticsDashboard",
                    icon: LineChart,
                    description: "Pre-built analytics for PSPs to understand merchants",
                    entities: ["AnalyticsMetric", "AnalyticsReport", "AnalyticsDashboard"],
                    dependencies: ["MerchantUsageMeter"],
                    implementation: {
                        step1: "Create AnalyticsMetric entity for KPIs",
                        step2: "Build data aggregation pipeline",
                        step3: "Create pre-built report templates (transaction reports, revenue, etc)",
                        step4: "Implement custom dashboard builder",
                        step5: "Add predictive analytics (churn prediction, upsell)",
                        step6: "Create automated insights/recommendations"
                    },
                    testPlan: [
                        "View merchant transaction trend report (30 days)",
                        "Create custom dashboard with 4 metrics",
                        "Test cohort analysis (merchants onboarded in Q1)",
                        "Run churn prediction model (identify at-risk merchants)",
                        "Generate revenue forecast (next 3 months)",
                        "Verify automated insight notifications",
                        "Export analytics data to CSV"
                    ]
                }
            ]
        }
    };

    const renderImplementation = (component) => (
        <div className="space-y-4 mt-4">
            <h4 className="font-semibold text-sm">Implementation Steps:</h4>
            <div className="space-y-2">
                {Object.entries(component.implementation).map(([key, step]) => (
                    <div key={key} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {key.replace('step', '')}
                        </div>
                        <p className="text-sm text-slate-700">{step}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTestPlan = (component) => (
        <div className="space-y-4 mt-4">
            <h4 className="font-semibold text-sm">Test Scenarios:</h4>
            <div className="space-y-2">
                {component.testPlan.map((test, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{test}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2">PSP Empowerment Implementation Roadmap</h2>
                <p className="text-blue-100">
                    Comprehensive plan to transform FTS.Money into a true platform that empowers PSPs 
                    to build, manage, and deliver their own products to merchants
                </p>
            </div>

            {/* Phase Overview */}
            <div className="grid grid-cols-4 gap-4">
                {Object.entries(roadmap).map(([key, phase]) => (
                    <Card 
                        key={key}
                        className={`cursor-pointer transition-all ${selectedPhase === key ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => setSelectedPhase(key)}
                    >
                        <CardContent className="p-4">
                            <Badge className={
                                phase.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                                phase.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                            }>
                                {phase.priority}
                            </Badge>
                            <h3 className="font-semibold text-slate-900 mt-3 mb-1">{phase.name}</h3>
                            <p className="text-xs text-slate-600">{phase.duration}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs text-slate-600">{phase.components.length} components</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Detailed Phase View */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        {roadmap[selectedPhase].name}
                        <Badge>{roadmap[selectedPhase].duration}</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {roadmap[selectedPhase].components.map((component, idx) => {
                            const Icon = component.icon;
                            return (
                                <div key={idx} className="border border-slate-200 rounded-lg p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-slate-900">{component.name}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{component.description}</p>
                                            
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="text-xs font-semibold text-slate-700">Entities:</span>
                                                {component.entities.map((entity, i) => (
                                                    <Badge key={i} variant="outline" className="text-xs">
                                                        {entity}
                                                    </Badge>
                                                ))}
                                            </div>
                                            
                                            {component.dependencies.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <span className="text-xs font-semibold text-slate-700">Dependencies:</span>
                                                    {component.dependencies.map((dep, i) => (
                                                        <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700">
                                                            {dep}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Tabs defaultValue="implementation" className="mt-6">
                                        <TabsList>
                                            <TabsTrigger value="implementation">Implementation</TabsTrigger>
                                            <TabsTrigger value="testing">Test Plan</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="implementation">
                                            {renderImplementation(component)}
                                        </TabsContent>
                                        <TabsContent value="testing">
                                            {renderTestPlan(component)}
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Integration & Testing Strategy */}
            <Card>
                <CardHeader>
                    <CardTitle>Cross-Phase Integration & Testing Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Integration Testing Milestones</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900">Phase 1 + 2 Integration Test</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Create a product → Define pricing → Simulate merchant usage → Generate invoice
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900">Phase 1 + 3 Integration Test</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Create product bundle → Build merchant portal → Expose product via API → Merchant activation
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-slate-900">Full Stack Integration Test</p>
                                    <p className="text-sm text-slate-600 mt-1">
                                        PSP creates product → Merchant onboards via workflow → Uses API → Usage tracked → Invoice generated → Analytics visible
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Performance & Scale Testing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="font-medium text-slate-900 mb-2">Load Testing Scenarios</p>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    <li>• 100 concurrent merchant onboardings</li>
                                    <li>• 10,000 usage events/second</li>
                                    <li>• 1,000 invoice generations simultaneously</li>
                                    <li>• 50 PSPs managing 10,000 merchants each</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <p className="font-medium text-slate-900 mb-2">Security Testing</p>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    <li>• PSP isolation verification (data leakage)</li>
                                    <li>• API key rotation and revocation</li>
                                    <li>• Encrypted secrets storage validation</li>
                                    <li>• RBAC permission boundary testing</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">User Acceptance Testing (UAT)</h3>
                        <p className="text-sm text-slate-600 mb-3">
                            Recruit 3 pilot PSPs to test the complete flow end-to-end:
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                                <Circle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-slate-700">PSP configures 3 unique products using the catalog</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                                <Circle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-slate-700">PSP designs custom merchant onboarding workflow (5+ steps)</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                                <Circle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-slate-700">PSP builds branded merchant portal and deploys it</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                                <Circle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-slate-700">Onboard 10 test merchants through the workflow</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                                <Circle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-slate-700">Generate 1 month of usage and verify invoice accuracy</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Overall Timeline & Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-sm font-semibold text-slate-700">Week 1-4</div>
                            <div className="flex-1 h-2 bg-red-200 rounded-full relative">
                                <div className="absolute inset-0 bg-red-500 rounded-full" style={{width: '100%'}}></div>
                            </div>
                            <div className="text-sm text-slate-600">Phase 1 Complete</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-sm font-semibold text-slate-700">Week 5-8</div>
                            <div className="flex-1 h-2 bg-amber-200 rounded-full relative">
                                <div className="absolute inset-0 bg-amber-500 rounded-full" style={{width: '100%'}}></div>
                            </div>
                            <div className="text-sm text-slate-600">Phase 2 Complete</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-sm font-semibold text-slate-700">Week 9-13</div>
                            <div className="flex-1 h-2 bg-blue-200 rounded-full relative">
                                <div className="absolute inset-0 bg-blue-500 rounded-full" style={{width: '100%'}}></div>
                            </div>
                            <div className="text-sm text-slate-600">Phase 3 Complete</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-32 text-sm font-semibold text-slate-700">Week 14-16</div>
                            <div className="flex-1 h-2 bg-emerald-200 rounded-full relative">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full" style={{width: '100%'}}></div>
                            </div>
                            <div className="text-sm text-slate-600">Phase 4 Complete + UAT</div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200">
                        <p className="font-semibold text-slate-900">Total Timeline: ~16 weeks (4 months)</p>
                        <p className="text-sm text-slate-600 mt-2">
                            This represents the minimum viable implementation. Each phase can be deployed independently, 
                            allowing PSPs to start using features as they become available.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}