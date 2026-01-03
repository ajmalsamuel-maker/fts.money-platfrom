import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Code, Rocket, FileText, Terminal, Download } from 'lucide-react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import RWA_CONTRACTS from '@/components/docs/RWAContractsComplete';
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function RWAPlatform() {
    const { platformUser } = usePlatformAuth();
    const { t } = useI18n();
    const [selectedContract, setSelectedContract] = useState('RWASecurityToken');

    const contracts = [
        { id: 'RWASecurityToken', name: 'Universal Security Token', language: 'solidity' },
        { id: 'RealEstateExtension', name: 'Real Estate Module', language: 'solidity' },
        { id: 'TreasuryBillExtension', name: 'Treasury Bill Module', language: 'solidity' },
        { id: 'PrivateCreditExtension', name: 'Private Credit Module', language: 'solidity' },
        { id: 'CommodityExtension', name: 'Commodity Module', language: 'solidity' }
    ];

    const downloadContract = (contractId) => {
        const content = RWA_CONTRACTS[contractId];
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contractId}.sol`;
        a.click();
    };

    const downloadAllContracts = () => {
        contracts.forEach(contract => downloadContract(contract.id));
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="RWAPlatform"
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{t('platform:pages.rwaPlatform.title')}</h2>
                        <p className="text-xs text-slate-600">{t('platform:pages.rwaPlatform.subtitle')}</p>
                    </div>
                    <LanguageSwitcher variant="select" showLabel={true} />
                </header>
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 mb-2">Smart Contracts</h1>
                            </div>
                            <Button onClick={downloadAllContracts} className="gap-2">
                                <Download className="h-4 w-4" />
                                Download All Contracts
                            </Button>
                        </div>
                    </div>

                    {/* Architecture Notice */}
                    <Card className="mb-6 border-blue-200 bg-blue-50">
                        <CardContent className="pt-6">
                            <div className="flex gap-3">
                                <Code className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Production Independence</h3>
                                    <p className="text-sm text-blue-700">
                                        Smart contracts are <strong>100% blockchain-native</strong> with zero Base44 dependencies. 
                                        Deploy using Hardhat/Foundry directly. Base44 entities are only for the white-label platform wrapper.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="contracts" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
                            <TabsTrigger value="deployment">Deployment (No Base44)</TabsTrigger>
                            <TabsTrigger value="testing">Testing Guide</TabsTrigger>
                            <TabsTrigger value="architecture">Architecture</TabsTrigger>
                        </TabsList>

                        {/* Contracts Tab */}
                        <TabsContent value="contracts">
                            <div className="grid grid-cols-12 gap-6">
                                {/* Contract List */}
                                <div className="col-span-3">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm">Contracts</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {contracts.map(contract => (
                                                <button
                                                    key={contract.id}
                                                    onClick={() => setSelectedContract(contract.id)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                        selectedContract === contract.id
                                                            ? 'bg-blue-100 text-blue-900 font-medium'
                                                            : 'hover:bg-slate-100 text-slate-700'
                                                    }`}
                                                >
                                                    {contract.name}
                                                </button>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Contract Code */}
                                <div className="col-span-9">
                                    <Card>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle>
                                                        {contracts.find(c => c.id === selectedContract)?.name}
                                                    </CardTitle>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        Solidity ^0.8.20 | OpenZeppelin 5.0 | ERC-3643 Compliant
                                                    </p>
                                                </div>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => downloadContract(selectedContract)}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Download
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-[600px] text-xs font-mono">
                                                {RWA_CONTRACTS[selectedContract]}
                                            </pre>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Deployment Tab */}
                        <TabsContent value="deployment">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Base44-Independent Deployment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">1. Initialize Hardhat Project</h3>
                                        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
{`mkdir rwa-contracts && cd rwa-contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
# Choose "Create a TypeScript project"`}
                                        </pre>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">2. Install Dependencies</h3>
                                        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
{`npm install @openzeppelin/contracts-upgradeable@5.0.0
npm install @openzeppelin/hardhat-upgrades
npm install dotenv ethers@6`}
                                        </pre>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">3. Copy Contracts</h3>
                                        <p className="text-sm text-slate-600 mb-2">
                                            Download all contracts above and place in <code className="bg-slate-100 px-1 py-0.5 rounded">contracts/</code> folder
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">4. Deployment Script (deploy.ts)</h3>
                                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto text-xs">
{`import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy Identity Registry (separate contract)
  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();
  await identityRegistry.waitForDeployment();
  console.log("IdentityRegistry:", await identityRegistry.getAddress());

  // Deploy Compliance Engine
  const ComplianceEngine = await ethers.getContractFactory("ComplianceEngine");
  const complianceEngine = await ComplianceEngine.deploy();
  await complianceEngine.waitForDeployment();
  console.log("ComplianceEngine:", await complianceEngine.getAddress());

  // Deploy RWA Token (UUPS Upgradeable)
  const RWASecurityToken = await ethers.getContractFactory("RWASecurityToken");
  
  const assetMetadata = {
    assetType: 3, // COMMODITY (Gold)
    assetClass: "gold_bars",
    assetId: ethers.id("GOLD-001"),
    extensionModule: ethers.ZeroAddress,
    totalValue: ethers.parseUnits("1000000", 18), // $1M
    jurisdiction: "US",
    issuerLEI: ethers.encodeBytes32String("123456789012ABCDEFGH"),
    issuanceDate: Math.floor(Date.now() / 1000),
    state: 0 // PENDING_TOKENIZATION
  };

  const token = await upgrades.deployProxy(
    RWASecurityToken,
    [
      "Gold Token",
      "XAUG",
      assetMetadata,
      await identityRegistry.getAddress(),
      await complianceEngine.getAddress(),
      deployer.address
    ],
    { kind: 'uups' }
  );
  
  await token.waitForDeployment();
  console.log("RWASecurityToken:", await token.getAddress());

  // Deploy Gold Extension
  const CommodityExtension = await ethers.getContractFactory("CommodityExtension");
  const extension = await CommodityExtension.deploy();
  await extension.waitForDeployment();
  console.log("CommodityExtension:", await extension.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`}
                                        </pre>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">5. Deploy to Network</h3>
                                        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
{`# Polygon Mumbai (Testnet)
npx hardhat run scripts/deploy.ts --network mumbai

# Polygon Mainnet
npx hardhat run scripts/deploy.ts --network polygon

# Ethereum Mainnet
npx hardhat run scripts/deploy.ts --network mainnet`}
                                        </pre>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-sm text-amber-900">
                                            <strong>No Base44 Required:</strong> Deploy directly to blockchain using your own infrastructure. 
                                            Contracts are self-contained with OpenZeppelin dependencies only.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Testing Tab */}
                        <TabsContent value="testing">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Testing Guide</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">Unit Tests (Hardhat)</h3>
                                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto text-xs">
{`import { expect } from "chai";
import { ethers } from "hardhat";

describe("RWASecurityToken", function () {
  let token, owner, investor1, investor2;

  beforeEach(async function () {
    [owner, investor1, investor2] = await ethers.getSigners();
    
    // Deploy mocks
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const identityRegistry = await IdentityRegistry.deploy();
    
    const ComplianceEngine = await ethers.getContractFactory("ComplianceEngine");
    const complianceEngine = await ComplianceEngine.deploy();
    
    // Deploy token
    const RWASecurityToken = await ethers.getContractFactory("RWASecurityToken");
    token = await upgrades.deployProxy(RWASecurityToken, [...initParams]);
  });

  it("Should mint tokens to verified investor", async function () {
    await identityRegistry.addVerified(investor1.address);
    await token.mint(investor1.address, ethers.parseEther("100"));
    expect(await token.balanceOf(investor1.address)).to.equal(ethers.parseEther("100"));
  });

  it("Should reject transfer to unverified address", async function () {
    await token.mint(investor1.address, ethers.parseEther("100"));
    await expect(
      token.connect(investor1).transfer(investor2.address, ethers.parseEther("10"))
    ).to.be.revertedWith("Recipient not verified");
  });

  it("Should enforce lockup period", async function () {
    const lockupEnd = Math.floor(Date.now() / 1000) + 86400; // 1 day
    await token.setLockup(investor1.address, lockupEnd);
    await token.mint(investor1.address, ethers.parseEther("100"));
    
    await expect(
      token.connect(investor1).transfer(investor2.address, ethers.parseEther("10"))
    ).to.be.revertedWith("Tokens locked");
  });
});`}
                                        </pre>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Run Tests</h3>
                                        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
{`npx hardhat test
npx hardhat coverage`}
                                        </pre>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Verify on Etherscan</h3>
                                        <pre className="bg-slate-900 text-green-400 p-4 rounded-lg text-sm">
{`npx hardhat verify --network polygon 0xYourContractAddress "Constructor" "Args"`}
                                        </pre>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Architecture Tab */}
                        <TabsContent value="architecture">
                            <div className="grid gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Base44 vs Blockchain-Native</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className="bg-green-100 text-green-800">Blockchain Native (No Base44)</Badge>
                                                </div>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-600">✓</span>
                                                        <span><strong>Smart Contracts</strong> - 100% self-contained Solidity</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-600">✓</span>
                                                        <span><strong>Identity Registry</strong> - On-chain vLEI verification</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-600">✓</span>
                                                        <span><strong>Compliance Engine</strong> - On-chain transfer restrictions</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-600">✓</span>
                                                        <span><strong>Valuation Adapters</strong> - Chainlink oracles</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-600">✓</span>
                                                        <span><strong>Corporate Actions</strong> - Dividend distribution on-chain</span>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="border-t pt-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge className="bg-blue-100 text-blue-800">Base44 White-Label Layer (Optional)</Badge>
                                                </div>
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-blue-600">•</span>
                                                        <span><strong>Entities</strong> - Off-chain metadata, investor records, order book</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-blue-600">•</span>
                                                        <span><strong>Backend Functions</strong> - Deployment automation, payment rails integration</span>
                                                    </li>
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-blue-600">•</span>
                                                        <span><strong>Portal UI</strong> - White-labeled investor/issuer dashboards</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Production Deployment Options</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2">Option 1: Fully Independent</h4>
                                                <ul className="text-sm space-y-1 text-slate-600">
                                                    <li>• Deploy contracts with Hardhat</li>
                                                    <li>• Build your own frontend</li>
                                                    <li>• Host on any infrastructure</li>
                                                    <li>• Zero Base44 dependency</li>
                                                </ul>
                                            </div>
                                            <div className="border rounded-lg p-4">
                                                <h4 className="font-semibold mb-2">Option 2: Base44 White-Label</h4>
                                                <ul className="text-sm space-y-1 text-slate-600">
                                                    <li>• Use Base44 deployment automation</li>
                                                    <li>• Pre-built investor portal</li>
                                                    <li>• Payment rails integration</li>
                                                    <li>• 40-minute setup vs 18 months</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}