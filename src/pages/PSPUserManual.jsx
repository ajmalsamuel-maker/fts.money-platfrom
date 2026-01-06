import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopHeader from '@/components/dashboard/TopHeader';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
    BookOpen, 
    CreditCard, 
    Users, 
    Settings, 
    BarChart3,
    Shield,
    FileText,
    Zap
} from 'lucide-react';

export default function PSPUserManual() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} currentPage="PSPUserManual" />
            
            <div className={cn("transition-all duration-300", "lg:ml-20", sidebarCollapsed && "ml-0")}>
                <TopHeader onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} collapsed={sidebarCollapsed} />
                
                <main className="p-6 max-w-6xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-bold text-slate-900">PSP User Manual</h1>
                        </div>
                        <p className="text-slate-600">Complete guide to using your Payment Service Provider portal</p>
                    </div>

                    <Tabs defaultValue="getting-started" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                            <TabsTrigger value="transactions">Transactions</TabsTrigger>
                            <TabsTrigger value="merchants">Merchants</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>

                        <TabsContent value="getting-started" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        Quick Start Guide
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose prose-slate max-w-none">
                                    <h3>Welcome to Your PSP Portal</h3>
                                    <p>Your Payment Service Provider portal gives you complete control over payment processing, merchant management, and financial operations.</p>
                                    
                                    <h4>Dashboard Overview</h4>
                                    <ul>
                                        <li><strong>Real-time Metrics:</strong> Monitor transaction volumes, success rates, and active merchants</li>
                                        <li><strong>Transaction Monitoring:</strong> Track all payment activities across your network</li>
                                        <li><strong>Merchant Analytics:</strong> View performance data for your merchant portfolio</li>
                                        <li><strong>Risk Alerts:</strong> Stay informed about potential fraud or compliance issues</li>
                                    </ul>

                                    <h4>First Steps</h4>
                                    <ol>
                                        <li>Complete your PSP profile in Settings</li>
                                        <li>Configure payment processors and routing rules</li>
                                        <li>Set up merchant pricing and fee structures</li>
                                        <li>Onboard your first merchant</li>
                                        <li>Configure Virtual Terminal for manual transactions</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        User Roles & Permissions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose prose-slate max-w-none">
                                    <div className="grid md:grid-cols-2 gap-4 not-prose">
                                        <div className="p-4 border rounded-lg">
                                            <Badge className="bg-red-100 text-red-700 mb-2">Administrator</Badge>
                                            <p className="text-sm text-slate-600">Full system access including user management and settings</p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <Badge className="bg-emerald-100 text-emerald-700 mb-2">Finance Manager</Badge>
                                            <p className="text-sm text-slate-600">Manage pricing, settlements, and financial reports</p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <Badge className="bg-blue-100 text-blue-700 mb-2">Operations Manager</Badge>
                                            <p className="text-sm text-slate-600">Handle daily operations, merchants, and transactions</p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <Badge className="bg-purple-100 text-purple-700 mb-2">Viewer</Badge>
                                            <p className="text-sm text-slate-600">Read-only access to reports and dashboards</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="transactions" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5 text-green-600" />
                                        Managing Transactions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose prose-slate max-w-none">
                                    <h4>Transaction Processing</h4>
                                    <p>Your PSP portal supports multiple transaction types:</p>
                                    <ul>
                                        <li><strong>Card Payments:</strong> Visa, Mastercard, Amex, and other major networks</li>
                                        <li><strong>Cryptocurrency:</strong> Bitcoin, USDC, and other digital assets</li>
                                        <li><strong>Bank Transfers:</strong> SEPA, SWIFT, and local payment methods</li>
                                        <li><strong>Alternative Payments:</strong> Digital wallets and instant payment methods</li>
                                    </ul>

                                    <h4>Transaction Statuses</h4>
                                    <ul>
                                        <li><Badge className="bg-amber-100 text-amber-700">Pending</Badge> - Awaiting processing</li>
                                        <li><Badge className="bg-blue-100 text-blue-700">Processing</Badge> - Being processed</li>
                                        <li><Badge className="bg-green-100 text-green-700">Approved</Badge> - Successfully completed</li>
                                        <li><Badge className="bg-red-100 text-red-700">Declined</Badge> - Rejected by processor</li>
                                        <li><Badge className="bg-slate-100 text-slate-700">Settled</Badge> - Funds transferred</li>
                                    </ul>

                                    <h4>Refunds & Chargebacks</h4>
                                    <p>Process refunds directly from the transaction details page. Monitor chargebacks in the dedicated Chargebacks section and respond with evidence through the dispute management interface.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="merchants" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-indigo-600" />
                                        Merchant Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose prose-slate max-w-none">
                                    <h4>Merchant Onboarding</h4>
                                    <ol>
                                        <li>Navigate to Merchants → Merchant Onboarding</li>
                                        <li>Enter merchant business details and contact information</li>
                                        <li>Complete KYB (Know Your Business) verification</li>
                                        <li>Configure pricing and fee structure</li>
                                        <li>Assign MIDs and payment methods</li>
                                        <li>Approve and activate the merchant account</li>
                                    </ol>

                                    <h4>Merchant Portal Builder</h4>
                                    <p>Create custom branded portals for your merchants with configurable modules, themes, and features.</p>

                                    <h4>Merchant Pricing</h4>
                                    <p>Set up flexible pricing models including:</p>
                                    <ul>
                                        <li>Percentage-based MDR (Merchant Discount Rate)</li>
                                        <li>Fixed fees per transaction</li>
                                        <li>Tiered pricing based on volume</li>
                                        <li>Custom pricing for specific card types or regions</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-red-600" />
                                        Advanced Features
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="prose prose-slate max-w-none">
                                    <h4>Smart Routing & Orchestration</h4>
                                    <p>Configure intelligent payment routing based on:</p>
                                    <ul>
                                        <li>Card BIN ranges and issuing countries</li>
                                        <li>Transaction amount thresholds</li>
                                        <li>Processor success rates and costs</li>
                                        <li>Time-based routing rules</li>
                                        <li>AI-powered optimization</li>
                                    </ul>

                                    <h4>Compliance & Security</h4>
                                    <ul>
                                        <li><strong>PCI DSS:</strong> View compliance status and security reports</li>
                                        <li><strong>AML/KYC:</strong> Monitor merchant screening and verification</li>
                                        <li><strong>GDPR:</strong> Manage data retention and privacy controls</li>
                                        <li><strong>Audit Logs:</strong> Track all system activities and changes</li>
                                    </ul>

                                    <h4>API Integration</h4>
                                    <p>Access comprehensive API documentation for:</p>
                                    <ul>
                                        <li>Payment processing endpoints</li>
                                        <li>Merchant management APIs</li>
                                        <li>Webhook notifications</li>
                                        <li>Reporting and analytics</li>
                                    </ul>

                                    <h4>Wholesale Platform</h4>
                                    <p>Connect with other PSPs to offer white-label services, share processing capacity, and expand your merchant network.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}