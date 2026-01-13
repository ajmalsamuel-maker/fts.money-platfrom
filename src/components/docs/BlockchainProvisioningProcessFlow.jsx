import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Shield, CheckCircle, ArrowRight, Users, Building2 } from 'lucide-react';

export default function BlockchainProvisioningProcessFlow() {
    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Blockchain Provisioning Process Flow</h1>
                <p className="text-slate-600">Detailed workflow for permissioned blockchain deployment</p>
            </div>

            {/* Role Definitions */}
            <Card>
                <CardHeader>
                    <CardTitle>Key Actors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-blue-600 mt-1" />
                        <div>
                            <p className="font-semibold text-blue-900">FTS.Money Platform Admin</p>
                            <p className="text-sm text-slate-600">Infrastructure provider with access to FTS Control Panel</p>
                            <Badge className="mt-1 bg-blue-100 text-blue-800">Platform Level</Badge>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-purple-600 mt-1" />
                        <div>
                            <p className="font-semibold text-purple-900">IMPACT Loyalty Customer</p>
                            <p className="text-sm text-slate-600">Organization using the loyalty platform (e.g., NGO, Corporate)</p>
                            <Badge className="mt-1 bg-purple-100 text-purple-800">Customer Level</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Process Flow */}
            <Card>
                <CardHeader>
                    <CardTitle>Complete Process Flow</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Step 1 */}
                        <div className="relative pl-8 pb-6 border-l-2 border-blue-300">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                1
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-purple-100 text-purple-800">CUSTOMER</Badge>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">Sign up for Loyalty Platform</span>
                                </div>
                                <p className="text-sm text-slate-600">Customer creates account via <code>/LoyaltyCustomerOnboarding</code></p>
                                <div className="mt-2 bg-slate-50 p-3 rounded text-xs">
                                    <strong>Data Created:</strong> LoyaltyCustomer record with organization details, subscription tier
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative pl-8 pb-6 border-l-2 border-blue-300">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                2
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-blue-100 text-blue-800">FTS ADMIN</Badge>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">Provision Blockchain Infrastructure</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Admin navigates to: <strong>FTS Control Panel → Infrastructure → Blockchain Provisioning</strong></p>
                                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Select customer from dropdown</li>
                                    <li>Choose chain type (Polygon Edge)</li>
                                    <li>Click "Provision Chain"</li>
                                </ul>
                                <div className="mt-2 bg-blue-50 border border-blue-200 p-3 rounded text-xs">
                                    <strong>Backend Function:</strong> <code>provisionCustomerBlockchain.js</code>
                                    <ul className="mt-1 space-y-1 list-disc list-inside ml-2">
                                        <li>Generates unique chain ID (10000-99999 range)</li>
                                        <li>Creates deployer wallet with private key</li>
                                        <li>Spins up 4 validator nodes</li>
                                        <li>Deploys gas relay contract</li>
                                        <li>Creates private RPC/WS endpoints</li>
                                        <li>Sets up block explorer URL</li>
                                    </ul>
                                </div>
                                <div className="mt-2 bg-green-50 p-3 rounded text-xs">
                                    <strong>Data Created:</strong> BlockchainConfig record with status "active"
                                </div>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative pl-8 pb-6 border-l-2 border-blue-300">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                3
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-purple-100 text-purple-800">CUSTOMER</Badge>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">View Blockchain Configuration</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Customer navigates to: <strong>Loyalty Customer Portal → Blockchain Config</strong></p>
                                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                                    <li>View RPC endpoints, explorer URL</li>
                                    <li>See resource allocation (CPU, RAM, storage)</li>
                                    <li>Check monthly costs</li>
                                    <li>Verify gas relay is enabled</li>
                                </ul>
                                <div className="mt-2 bg-yellow-50 border border-yellow-200 p-3 rounded text-xs">
                                    <strong>Note:</strong> Customer has <strong>READ-ONLY</strong> access to technical details. They can view but not modify chain parameters.
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative pl-8 pb-6 border-l-2 border-blue-300">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                4
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-purple-100 text-purple-800">CUSTOMER</Badge>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">Create Loyalty Program</span>
                                </div>
                                <p className="text-sm text-slate-600">Customer creates program with token details via Loyalty Portal</p>
                                <div className="mt-2 bg-slate-50 p-3 rounded text-xs">
                                    <strong>Data Created:</strong> LoyaltyProgram record with token_name, token_symbol, program details
                                </div>
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="relative pl-8 pb-6 border-l-2 border-blue-300">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                5
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-purple-100 text-purple-800">CUSTOMER</Badge>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">Deploy Token Smart Contract</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Customer navigates to: <strong>Loyalty Portal → Program Setup → Blockchain Tokens</strong></p>
                                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Click "Deploy Token Contract"</li>
                                    <li>Confirm token details (inherited from program)</li>
                                    <li>Set initial supply</li>
                                </ul>
                                <div className="mt-2 bg-purple-50 border border-purple-200 p-3 rounded text-xs">
                                    <strong>Backend Function:</strong> <code>deployLoyaltyTokenRBAC.js</code>
                                    <ul className="mt-1 space-y-1 list-disc list-inside ml-2">
                                        <li>Retrieves customer's blockchain config</li>
                                        <li>Connects to customer's private chain via RPC</li>
                                        <li>Uses deployer wallet to deploy ERC-20 with RBAC</li>
                                        <li>Grants minter/burner roles</li>
                                        <li>Updates LoyaltyToken entity</li>
                                    </ul>
                                </div>
                                <div className="mt-2 bg-green-50 p-3 rounded text-xs">
                                    <strong>Result:</strong> Token deployed on customer's isolated chain, contract address saved
                                </div>
                            </div>
                        </div>

                        {/* Step 6 */}
                        <div className="relative pl-8">
                            <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                                ✓
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-purple-100 text-purple-800">CUSTOMER</Badge>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-medium">Operational - Gas-Free Transactions</span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">Participants can now:</p>
                                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                                    <li>Earn tokens (minted via backend)</li>
                                    <li>Transfer tokens (gas-free via meta-transactions)</li>
                                    <li>Redeem tokens (burned via backend)</li>
                                    <li>View balances on-chain</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Responsibility Matrix */}
            <Card>
                <CardHeader>
                    <CardTitle>Responsibility Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-semibold">Action</th>
                                    <th className="text-center py-2 font-semibold">FTS Admin</th>
                                    <th className="text-center py-2 font-semibold">Customer</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="py-2">Provision blockchain infrastructure</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                    <td className="text-center text-slate-300">—</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Configure validator nodes</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                    <td className="text-center text-slate-300">—</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Deploy gas relay contract</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                    <td className="text-center text-slate-300">—</td>
                                </tr>
                                <tr>
                                    <td className="py-2">View blockchain configuration</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                </tr>
                                <tr>
                                    <td className="py-2">Edit resource allocation</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                    <td className="text-center text-slate-300">—</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Create loyalty program</td>
                                    <td className="text-center text-slate-300">—</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                </tr>
                                <tr>
                                    <td className="py-2">Deploy token smart contract</td>
                                    <td className="text-center text-slate-300">—</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                </tr>
                                <tr>
                                    <td className="py-2">Mint/burn tokens</td>
                                    <td className="text-center text-slate-300">—</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                </tr>
                                <tr>
                                    <td className="py-2">Manage participants</td>
                                    <td className="text-center text-slate-300">—</td>
                                    <td className="text-center"><CheckCircle className="h-5 w-5 text-green-600 mx-auto" /></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Key Points */}
            <Card>
                <CardHeader>
                    <CardTitle>Key Points</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex gap-3">
                            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-blue-900">Infrastructure = FTS Admin</p>
                                <p className="text-slate-600">Blockchain provisioning is handled by FTS platform admins. Customers don't need blockchain expertise.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Users className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-purple-900">Business Logic = Customer</p>
                                <p className="text-slate-600">Token deployment and program management are self-service for customers via their portal.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Server className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold text-green-900">Automated Deployment</p>
                                <p className="text-slate-600">When customer clicks "Deploy Token", the backend automatically connects to their pre-provisioned chain and deploys the contract using the platform's deployer wallet.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}