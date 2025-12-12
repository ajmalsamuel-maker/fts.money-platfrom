import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Database, Code, Map, Shield } from 'lucide-react';
import { FULL_ARCHITECTURE_DOC } from '@/components/docs/FullArchitectureDoc';
import { FULL_MIGRATION_PLAN } from '@/components/docs/FullMigrationPlan';
import { FULL_API_SPEC } from '@/components/docs/FullAPISpec';
import { FULL_SCHEMA_SCRIPT } from '@/components/docs/FullSchemaScript';
import { ROLE_PERMISSIONS_DOC } from '@/components/docs/RolePermissionsDoc';

export default function Documentation() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const downloadFile = (filename, content) => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const architectureDoc = FULL_ARCHITECTURE_DOC;
    const migrationPlan = FULL_MIGRATION_PLAN;
    const apiSpec = FULL_API_SPEC;
    const schemaScript = FULL_SCHEMA_SCRIPT;

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} currentPage="Documentation" />
            <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-20" : "ml-64")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900">Migration Documentation</h1>
                        <p className="text-slate-500">Architecture, migration plans, and API specifications for production deployment</p>
                    </div>

                    <Tabs defaultValue="roles" className="w-full">
                        <TabsList className="grid w-full grid-cols-5 mb-6">
                            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                            <TabsTrigger value="architecture">Architecture</TabsTrigger>
                            <TabsTrigger value="migration">Migration Plan</TabsTrigger>
                            <TabsTrigger value="api">API Spec</TabsTrigger>
                            <TabsTrigger value="schema">Schema Export</TabsTrigger>
                        </TabsList>

                        <TabsContent value="roles">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-purple-600" />
                                            <CardTitle>User Roles and Permissions</CardTitle>
                                        </div>
                                        <Button onClick={() => downloadFile('RolesPermissions.md', ROLE_PERMISSIONS_DOC)} className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Download Documentation
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Role-Based Access Control (RBAC)</h3>
                                            <p className="text-slate-600">
                                                Comprehensive documentation of user roles, permissions, and responsibilities for the PSP platform.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-3">Available Roles</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        <span className="font-medium">Administrator</span> - Full Access
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        <span className="font-medium">Finance Manager</span> - Finance & Settlements
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                                        <span className="font-medium">Operations Manager</span> - Merchants & Transactions
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                        <span className="font-medium">Compliance Officer</span> - Risk & Compliance
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                                        <span className="font-medium">Technical Manager</span> - System & Gateways
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                        <span className="font-medium">Editor</span> - Content & Analytics
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                        <span className="font-medium">Viewer</span> - Read-Only
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-3">Key Features</h4>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    <li>• Granular permission control</li>
                                                    <li>• Module-based access</li>
                                                    <li>• Least privilege principle</li>
                                                    <li>• Audit trail coverage</li>
                                                    <li>• Role separation enforcement</li>
                                                    <li>• PCI-DSS compliance</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <h4 className="font-medium text-purple-900 mb-2">Documentation Includes</h4>
                                            <ul className="text-sm text-purple-800 space-y-1">
                                                <li>✓ Complete role descriptions and responsibilities</li>
                                                <li>✓ Permission matrix for all modules</li>
                                                <li>✓ Role assignment guidelines</li>
                                                <li>✓ Security best practices</li>
                                                <li>✓ User onboarding/offboarding procedures</li>
                                                <li>✓ Compliance and audit requirements</li>
                                            </ul>
                                        </div>

                                        <div className="text-sm text-slate-500">
                                            <strong>Management:</strong> Assign and manage user roles in System → User Management
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="architecture">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Map className="h-5 w-5 text-blue-600" />
                                            <CardTitle>Production Architecture Design</CardTitle>
                                        </div>
                                        <Button onClick={() => downloadFile('Architecture.md', architectureDoc)} className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Download Architecture.md
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Overview</h3>
                                            <p className="text-slate-600">
                                                Complete architecture design for a PCI-DSS Level 1 compliant PSP platform with hybrid Base44/AWS deployment.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-2">Key Components</h4>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    <li>• Go + Fiber (Payment Processing)</li>
                                                    <li>• PostgreSQL RDS (Transaction & Operational DBs)</li>
                                                    <li>• Redis Cluster (Caching)</li>
                                                    <li>• AWS SQS (Message Queue)</li>
                                                    <li>• ECS + Fargate (Orchestration)</li>
                                                    <li>• Cloudflare (WAF + DDoS)</li>
                                                </ul>
                                            </div>
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-2">Performance Targets</h4>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    <li>• 5,000+ TPS capacity</li>
                                                    <li>• p99 latency &lt; 200ms</li>
                                                    <li>• 99.95% uptime SLA</li>
                                                    <li>• Error rate &lt; 0.1%</li>
                                                    <li>• ~$2,500/mo infrastructure</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="font-medium text-blue-900 mb-2">What's Included</h4>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>✓ Complete architecture diagrams</li>
                                                <li>✓ Network & VPC design</li>
                                                <li>✓ PCI compliance strategy</li>
                                                <li>✓ Security controls & encryption</li>
                                                <li>✓ Disaster recovery plan</li>
                                                <li>✓ Monitoring & observability</li>
                                                <li>✓ Cost breakdown</li>
                                                <li>✓ Technology stack decisions</li>
                                            </ul>
                                        </div>

                                        <div className="text-sm text-slate-500">
                                            <strong>Note:</strong> Download the full Architecture.md file for complete documentation including detailed component specifications, code examples, and configuration templates.
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="migration">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-green-600" />
                                            <CardTitle>16-Week Migration Plan</CardTitle>
                                        </div>
                                        <Button onClick={() => downloadFile('MigrationPlan.md', migrationPlan)} className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Download MigrationPlan.md
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-blue-600">16</div>
                                                <div className="text-sm text-slate-600">Weeks</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-green-600">8</div>
                                                <div className="text-sm text-slate-600">Phases</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-purple-600">100+</div>
                                                <div className="text-sm text-slate-600">Tasks</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-orange-600">$94K</div>
                                                <div className="text-sm text-slate-600">Est. Budget</div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="font-semibold">Migration Phases</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">Weeks 1-2</div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">Foundation & Database Setup</div>
                                                        <div className="text-sm text-slate-600">AWS infrastructure, RDS configuration, network setup</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">Weeks 3-6</div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">Payment Processor Development</div>
                                                        <div className="text-sm text-slate-600">Go + Fiber app, routing engine, SQS workers</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">Weeks 7-8</div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">Infrastructure Deployment</div>
                                                        <div className="text-sm text-slate-600">ECS setup, Redis, ALB configuration</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">Weeks 9-10</div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">Base44 Integration</div>
                                                        <div className="text-sm text-slate-600">API proxy, data migration, frontend updates</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">Weeks 11-12</div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">Cloudflare & Security</div>
                                                        <div className="text-sm text-slate-600">WAF setup, PCI hardening, security baseline</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">Weeks 13-14</div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">Testing & Optimization</div>
                                                        <div className="text-sm text-slate-600">Load testing (k6), security testing, performance tuning</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border rounded-lg">
                                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-blue-600">Weeks 15-16</div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">Production Launch</div>
                                                        <div className="text-sm text-slate-600">Deployment, monitoring, validation</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 p-3 border rounded-lg bg-amber-50">
                                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-amber-600">Weeks 17-24</div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">PCI Certification</div>
                                                        <div className="text-sm text-slate-600">QSA audit, documentation, AOC acquisition</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <h4 className="font-medium text-green-900 mb-2">Success Criteria</h4>
                                            <ul className="text-sm text-green-800 space-y-1">
                                                <li>✓ 5,000+ TPS processing capability</li>
                                                <li>✓ p99 latency &lt; 200ms</li>
                                                <li>✓ PCI DSS Level 1 certified</li>
                                                <li>✓ 99.95% uptime achieved</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="api">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Code className="h-5 w-5 text-purple-600" />
                                            <CardTitle>API Contract Specification</CardTitle>
                                        </div>
                                        <Button onClick={() => downloadFile('API.md', apiSpec)} className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Download API.md
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">RESTful API Specification</h3>
                                            <p className="text-slate-600">
                                                Complete API documentation for Base44 ↔ Payment Processor communication.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-3">Core Endpoints</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
                                                        <code className="text-slate-600">/api/v1/transactions</code>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-mono">GET</span>
                                                        <code className="text-slate-600">/api/v1/transactions/:id</code>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
                                                        <code className="text-slate-600">/api/v1/transactions/:id/void</code>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
                                                        <code className="text-slate-600">/api/v1/transactions/:id/refund</code>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
                                                        <code className="text-slate-600">/api/v1/transactions/crypto</code>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-3">Authentication</h4>
                                                <div className="space-y-2 text-sm text-slate-600">
                                                    <div>
                                                        <strong>Method:</strong> HMAC-SHA256
                                                    </div>
                                                    <div>
                                                        <strong>Headers:</strong>
                                                        <ul className="mt-1 space-y-1 text-xs font-mono">
                                                            <li>X-API-Key</li>
                                                            <li>X-Signature</li>
                                                            <li>X-Timestamp</li>
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <strong>Rate Limit:</strong> 1,000 req/min
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border rounded-lg p-4 bg-slate-50">
                                            <h4 className="font-medium mb-2">Webhook Events</h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                                <div>• transaction.approved</div>
                                                <div>• transaction.declined</div>
                                                <div>• transaction.voided</div>
                                                <div>• transaction.refunded</div>
                                                <div>• crypto.confirmed</div>
                                                <div>• settlement.completed</div>
                                            </div>
                                        </div>

                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <h4 className="font-medium text-purple-900 mb-2">Complete Documentation Includes</h4>
                                            <ul className="text-sm text-purple-800 space-y-1">
                                                <li>✓ Request/response examples</li>
                                                <li>✓ Error codes & handling</li>
                                                <li>✓ Webhook signature verification</li>
                                                <li>✓ Code examples (Node.js, Go, PHP)</li>
                                                <li>✓ Test cards & sandbox environment</li>
                                                <li>✓ Rate limiting details</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="schema">
                            <Card>
                                <CardHeader className="border-b">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Database className="h-5 w-5 text-orange-600" />
                                            <CardTitle>Database Schema Export Script</CardTitle>
                                        </div>
                                        <Button onClick={() => downloadFile('export-schema.js', schemaScript)} className="gap-2">
                                            <Download className="h-4 w-4" />
                                            Download export-schema.js
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-semibold text-lg mb-2">Automated Schema Export</h3>
                                            <p className="text-slate-600">
                                                Node.js script to export all Base44 entities to PostgreSQL CREATE TABLE statements.
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 border rounded-lg p-4 font-mono text-sm">
                                            <div className="text-green-600 mb-2"># Usage</div>
                                            <div className="text-slate-700">node export-schema.js</div>
                                            <div className="text-green-600 mt-4 mb-2"># Output Files</div>
                                            <div className="text-slate-700 space-y-1">
                                                <div>database/schemas/pci-scope.sql</div>
                                                <div>database/schemas/operational.sql</div>
                                                <div>database/schemas/indexes.sql</div>
                                                <div>database/schemas/constraints.sql</div>
                                                <div>database/schemas/partitioning.sql</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-2 text-red-600">PCI Scope Tables</h4>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    <li>• transactions</li>
                                                    <li>• saved_cards</li>
                                                    <li>• travel_rule_data</li>
                                                    <li>• sanctions_screening</li>
                                                </ul>
                                            </div>
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-medium mb-2 text-blue-600">Operational Tables</h4>
                                                <ul className="text-sm text-slate-600 space-y-1">
                                                    <li>• merchants</li>
                                                    <li>• merchant_mids</li>
                                                    <li>• bank_mids</li>
                                                    <li>• payment_providers</li>
                                                    <li>• routing_rules</li>
                                                    <li>• ... and 20+ more</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <h4 className="font-medium text-orange-900 mb-2">Features</h4>
                                            <ul className="text-sm text-orange-800 space-y-1">
                                                <li>✓ JSON Schema → PostgreSQL DDL conversion</li>
                                                <li>✓ Automatic index generation</li>
                                                <li>✓ CHECK constraints for enums</li>
                                                <li>✓ Table partitioning (for transactions)</li>
                                                <li>✓ Separates PCI vs non-PCI scope</li>
                                                <li>✓ Column comments from descriptions</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}