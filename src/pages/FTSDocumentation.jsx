import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, FileText, BookOpen, Code, GitBranch, Wallet, Shield, Printer, Lock, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebar from '@/components/platform/FTSPlatformSidebar';
import FTSOverviewDoc from '@/components/docs/FTSOverviewDoc';
import FTSControlPanelDoc from '@/components/docs/FTSControlPanelDoc';
import PSPPortalDoc from '@/components/docs/PSPPortalDoc';
import CommunityPortalDoc from '@/components/docs/CommunityPortalDoc';
import ISOGatewayDoc from '@/components/docs/ISOGatewayDoc';
import OrchestrationDoc from '@/components/docs/OrchestrationDoc';
import ArchitectureDoc from '@/components/docs/ArchitectureDoc';
import ProductEcosystemDoc from '@/components/docs/ProductEcosystemDoc';
import VerticalSolutionsDoc from '@/components/docs/VerticalSolutionsDoc';
import { RWATechnicalSpec } from '@/components/docs/RWATechnicalSpec';
import CryptoBankingDoc from '@/components/docs/CryptoBankingDoc';

import { MerchantPortalDoc } from '@/components/docs/MerchantPortalDoc';
import { VirtualTerminalDoc } from '@/components/docs/VirtualTerminalDoc';
import VATTaxManagementDoc from '@/components/docs/VATTaxManagementDoc';
import EInvoicingSystemDoc from '@/components/docs/EInvoicingSystemDoc';
import VASPPlatformDoc from '@/components/docs/VASPPlatformDoc';
import ServiceInteroperabilityDoc from '@/components/docs/ServiceInteroperabilityDoc';
import { PCIDSSComplianceDoc } from '@/components/docs/PCIDSSComplianceDoc';
import { DigitalIdentityDoc } from '@/components/docs/DigitalIdentityDoc';
import { PlatformPortalsGuide } from '@/components/docs/PlatformPortalsGuide';
import NANOSustainabilityIntegrationDoc from '@/components/docs/NANOSustainabilityIntegrationDoc';
import FIXScoreSystemDoc from '@/components/docs/FIXScoreSystemDoc';
import NANOSustainabilityDoc from '@/components/docs/NANOSustainabilityDoc';
import LoyaltyImpactPlatformDoc from '@/components/docs/LoyaltyImpactPlatformDoc';
import InvoicingSystemDoc from '@/components/docs/InvoicingSystemDoc';
import PCIAdvancedFeaturesDoc from '@/components/docs/PCIAdvancedFeaturesDoc';
import ServicePublicationDoc from '@/components/docs/ServicePublicationDoc';
import BillingInvoicingSystemDoc from '@/components/docs/BillingInvoicingSystemDoc';
import MultiUserRBACSystemDoc from '@/components/docs/MultiUserRBACSystemDoc';
import DocumentationGapAnalysis from '@/components/docs/DocumentationGapAnalysis';
import ISOGatewayPortalGuide from '@/components/docs/ISOGatewayPortalGuide';
import OrchestrationPortalGuide from '@/components/docs/OrchestrationPortalGuide';
import CryptoGatewayPortalGuide from '@/components/docs/CryptoGatewayPortalGuide';
import RWAProviderPortalGuide from '@/components/docs/RWAProviderPortalGuide';
import RWAIssuerPortalGuide from '@/components/docs/RWAIssuerPortalGuide';
import RWAInvestorPortalGuide from '@/components/docs/RWAInvestorPortalGuide';
import TaxManagementCompleteGuide from '@/components/docs/TaxManagementCompleteGuide';
import EInvoicingOperationsGuide from '@/components/docs/EInvoicingOperationsGuide';
import QSAPortalGuide from '@/components/docs/QSAPortalGuide';
import AuthenticationArchitectureDoc from '@/components/docs/AuthenticationArchitectureDoc';
import APIReferenceGuide from '@/components/docs/APIReferenceGuide';
import IntegrationPatternsDoc from '@/components/docs/IntegrationPatternsDoc';
import OperationalRunbooksDoc from '@/components/docs/OperationalRunbooksDoc';
import UserJourneyMapsDoc from '@/components/docs/UserJourneyMapsDoc';
import TroubleshootingGuide from '@/components/docs/TroubleshootingGuide';
import MigrationGuidesDoc from '@/components/docs/MigrationGuidesDoc';
import FTSBusinessPlan from '@/components/docs/FTSBusinessPlan';
import PSPProvisioningSOPs from '@/components/docs/PSPProvisioningSOPs';
import MultiServiceCustomerSuccessSOPs from '@/components/docs/MultiServiceCustomerSuccessSOPs';
import PartnerResellerManagementSOPs from '@/components/docs/PartnerResellerManagementSOPs';
import CryptoVASPOperationsSOPs from '@/components/docs/CryptoVASPOperationsSOPs';
import ISOGatewayOperationsSOPs from '@/components/docs/ISOGatewayOperationsSOPs';
import RWATokenizationOperationsSOPs from '@/components/docs/RWATokenizationOperationsSOPs';
import TaxEInvoicingOperationsSOPs from '@/components/docs/TaxEInvoicingOperationsSOPs';
import PlatformInfrastructureSOPs from '@/components/docs/PlatformInfrastructureSOPs';
import SecurityComplianceOperationsSOPs from '@/components/docs/SecurityComplianceOperationsSOPs';
import BillingRevenueOperationsSOPs from '@/components/docs/BillingRevenueOperationsSOPs';
import ComplianceRiskManagementSOPs from '@/components/docs/ComplianceRiskManagementSOPs';
import BusinessContinuityDRSOPs from '@/components/docs/BusinessContinuityDRSOPs';
import OrchestrationOperationsSOPs from '@/components/docs/OrchestrationOperationsSOPs';
import MarketingLeadGenSOPs from '@/components/docs/MarketingLeadGenSOPs';
import ProductManagementSOPs from '@/components/docs/ProductManagementSOPs';
import HumanResourcesSOPs from '@/components/docs/HumanResourcesSOPs';
import MermaidDiagram from '@/components/docs/MermaidDiagram';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
import ExportDialog from '@/components/docs/ExportDialog';

export default function FTSDocumentation() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState('overview');
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [openCategories, setOpenCategories] = useState(['getting-started']);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const documentCategories = [
        {
            id: 'getting-started',
            title: '🚀 Getting Started',
            documents: [
                {
                    id: 'overview',
                    title: 'Platform Overview',
                    icon: BookOpen,
                    content: FTSOverviewDoc,
                    description: 'Complete platform architecture, market positioning, and roadmap'
                },
                {
                    id: 'architecture',
                    title: 'Platform Architecture',
                    icon: Code,
                    content: ArchitectureDoc,
                    description: 'Technical infrastructure, system design, and security architecture'
                },
                {
                    id: 'products',
                    title: 'Product Ecosystem',
                    icon: FileText,
                    content: ProductEcosystemDoc,
                    description: 'Complete product portfolio, revenue models, and market analysis'
                },
                {
                    id: 'auth-architecture',
                    title: 'Authentication Architecture',
                    icon: Lock,
                    content: AuthenticationArchitectureDoc,
                    description: 'Multi-portal auth systems, session management, password security, vLEI roadmap'
                }
            ]
        },
        {
            id: 'portal-guides',
            title: '🏛️ Portal Guides',
            documents: [
                {
                    id: 'control-panel',
                    title: 'FTS Control Panel',
                    icon: FileText,
                    content: FTSControlPanelDoc,
                    description: 'Platform administration and global infrastructure management'
                },
                {
                    id: 'psp-portal',
                    title: 'PSP Portal',
                    icon: FileText,
                    content: PSPPortalDoc,
                    description: 'Payment Service Provider operations and management'
                },
                {
                    id: 'community',
                    title: 'Community Portal',
                    icon: FileText,
                    content: CommunityPortalDoc,
                    description: 'Self-service payment infrastructure marketplace'
                },
                {
                    id: 'merchant-portal',
                    title: 'Merchant Portal',
                    icon: FileText,
                    content: MerchantPortalDoc,
                    description: 'Self-service merchant portal - transactions, settlements, disputes, and analytics'
                },
                {
                    id: 'virtual-terminal',
                    title: 'Virtual Payment Terminal',
                    icon: Code,
                    content: VirtualTerminalDoc,
                    description: 'Web-based payment terminal - MOTO, recurring, and card-not-present processing'
                },
                {
                    id: 'iso-gateway-portal-guide',
                    title: 'ISO Gateway Portal',
                    icon: Code,
                    content: ISOGatewayPortalGuide,
                    description: 'Message translation portal - API keys, connections, routing, real-time monitoring'
                },
                {
                    id: 'orchestration-portal-guide',
                    title: 'Orchestration Portal',
                    icon: GitBranch,
                    content: OrchestrationPortalGuide,
                    description: 'Payment routing portal - processor management, routing strategies, cost optimization'
                },
                {
                    id: 'crypto-gateway-portal-guide',
                    title: 'Crypto Gateway Portal',
                    icon: Wallet,
                    content: CryptoGatewayPortalGuide,
                    description: 'Crypto banking portal - wallets, IBANs, cards, KYC/AML, compliance monitoring'
                },
                {
                    id: 'rwa-provider-portal-guide',
                    title: 'RWA Provider Portal',
                    icon: BookOpen,
                    content: RWAProviderPortalGuide,
                    description: 'White-label RWA platform - issuer management, asset portfolio, investor administration'
                },
                {
                    id: 'rwa-issuer-portal-guide',
                    title: 'RWA Issuer Portal',
                    icon: FileText,
                    content: RWAIssuerPortalGuide,
                    description: 'Asset tokenization - tokenization wizard, investor management, dividend distribution'
                },
                {
                    id: 'rwa-investor-portal-guide',
                    title: 'RWA Investor Portal',
                    icon: Wallet,
                    content: RWAInvestorPortalGuide,
                    description: 'Investor portal - marketplace, portfolio tracking, secondary trading, dividends'
                },
                {
                    id: 'qsa-portal-guide',
                    title: 'QSA Portal',
                    icon: Shield,
                    content: QSAPortalGuide,
                    description: 'PCI DSS audit platform - evidence review, compliance scoring, QSA workflows'
                },
                {
                    id: 'platform-portals',
                    title: 'All Portals Overview',
                    icon: BookOpen,
                    content: PlatformPortalsGuide,
                    description: 'Complete guide to all FTS.Money portals - URLs, pages, features, and workflows'
                }
            ]
        },
        {
            id: 'core-services',
            title: '⚡ Core Services',
            documents: [
                {
                    id: 'iso-gateway',
                    title: 'ISO Gateway Service',
                    icon: Code,
                    content: ISOGatewayDoc,
                    description: 'Message translation for ISO 8583, ISO 20022, and SWIFT MT'
                },
                {
                    id: 'orchestration',
                    title: 'Orchestration Service',
                    icon: GitBranch,
                    content: OrchestrationDoc,
                    description: 'Intelligent payment routing and optimization'
                },
                {
                    id: 'crypto-banking',
                    title: 'Crypto Banking (VASP)',
                    icon: Wallet,
                    content: CryptoBankingDoc,
                    description: 'Enterprise crypto banking infrastructure - wallets, IBANs, cards, compliance'
                },
                {
                    id: 'rwa-tokenization',
                    title: 'RWA Tokenization',
                    icon: FileText,
                    content: RWATechnicalSpec,
                    description: 'Real World Assets tokenization - smart contracts, investor management, compliance'
                },
                {
                    id: 'tax-management',
                    title: 'Tax Management (VAT/GST)',
                    icon: FileText,
                    content: TaxManagementCompleteGuide,
                    description: 'Global VAT/GST compliance, automated rate updates, real-time calculation'
                },
                {
                    id: 'einvoicing-service',
                    title: 'E-Invoicing Service',
                    icon: FileText,
                    content: EInvoicingOperationsGuide,
                    description: 'Multi-standard e-invoicing - Peppol, ZATCA, FatturaPA, CFDI, government submission'
                },
                {
                    id: 'pci-compliance',
                    title: 'PCI DSS Compliance',
                    icon: Shield,
                    content: PCIDSSComplianceDoc,
                    description: 'PCI DSS Level 1 compliance management, continuous monitoring, QSA coordination'
                },
                {
                    id: 'digital-identity-service',
                    title: 'Digital Identity (LEI/vLEI)',
                    icon: Lock,
                    content: DigitalIdentityDoc,
                    description: 'W3C Verifiable Credentials, DIDs, LEI verification, passwordless authentication'
                },
                {
                    id: 'nano-sustainability-service',
                    title: 'NANO Sustainability',
                    icon: FileText,
                    content: NANOSustainabilityDoc,
                    description: 'Gamified sustainability platform - carbon tracking, eco-tasks, token rewards, NFT achievements'
                }
            ]
        },
        {
            id: 'rwa-platform',
            title: '🏢 RWA Tokenization',
            documents: [
                {
                    id: 'rwa-technical',
                    title: 'RWA Technical Spec',
                    icon: Code,
                    content: RWATechnicalSpec,
                    description: 'Real World Assets tokenization platform - complete technical specifications'
                },
                {
                    id: 'rwa-provider-portal',
                    title: 'RWA Provider Portal',
                    icon: BookOpen,
                    content: RWAProviderPortalGuide,
                    description: 'White-label platform management, issuer onboarding, asset portfolio'
                },
                {
                    id: 'rwa-issuer-portal',
                    title: 'RWA Issuer Portal',
                    icon: FileText,
                    content: RWAIssuerPortalGuide,
                    description: 'Asset tokenization wizard, investor management, dividend distribution'
                },
                {
                    id: 'rwa-investor-portal',
                    title: 'RWA Investor Portal',
                    icon: Wallet,
                    content: RWAInvestorPortalGuide,
                    description: 'Asset marketplace, portfolio tracking, secondary trading, dividend history'
                }
            ]
        },
        {
            id: 'financial-ops',
            title: '💰 Financial Operations',
            documents: [
                {
                    id: 'billing-invoicing',
                    title: 'Billing & Invoicing System',
                    icon: FileText,
                    content: BillingInvoicingSystemDoc,
                    description: 'Unified billing, usage metering, invoice generation, payment processing'
                },
                {
                    id: 'vat-tax',
                    title: 'VAT & Tax Management',
                    icon: FileText,
                    content: VATTaxManagementDoc,
                    description: 'Global tax compliance, automated VAT calculation, and tax reporting'
                },
                {
                    id: 'tax-management-complete',
                    title: 'Tax Management Complete',
                    icon: FileText,
                    content: TaxManagementCompleteGuide,
                    description: 'Global VAT/GST compliance, automated rate updates, real-time calculation'
                },
                {
                    id: 'einvoicing',
                    title: 'E-Invoicing System',
                    icon: FileText,
                    content: EInvoicingSystemDoc,
                    description: 'Multi-standard electronic invoicing - Peppol, ZATCA, FatturaPA, CFDI'
                },
                {
                    id: 'einvoicing-operations',
                    title: 'E-Invoicing Operations',
                    icon: FileText,
                    content: EInvoicingOperationsGuide,
                    description: 'Multi-standard invoicing, government submission, country workflows'
                },
                {
                    id: 'invoicing-system',
                    title: 'Global Invoicing & Tax',
                    icon: FileText,
                    content: InvoicingSystemDoc,
                    description: 'Multi-standard e-invoicing and global VAT compliance'
                }
            ]
        },
        {
            id: 'compliance-security',
            title: '🛡️ Compliance & Security',
            documents: [
                {
                    id: 'pci-dss-compliance',
                    title: 'PCI DSS Level 1',
                    icon: Shield,
                    content: PCIDSSComplianceDoc,
                    description: 'Comprehensive PCI DSS compliance management - continuous monitoring, predictive analytics'
                },
                {
                    id: 'pci-advanced',
                    title: 'PCI DSS Advanced Suite',
                    icon: Shield,
                    content: PCIAdvancedFeaturesDoc,
                    description: 'AI-powered continuous monitoring, predictive analytics, workflow automation'
                },
                {
                    id: 'digital-identity',
                    title: 'Digital Identity & VCs',
                    icon: Wallet,
                    content: DigitalIdentityDoc,
                    description: 'W3C Verifiable Credentials and DIDs - passwordless authentication'
                },
                {
                    id: 'rbac-system',
                    title: 'Multi-User RBAC System',
                    icon: Shield,
                    content: MultiUserRBACSystemDoc,
                    description: 'Six-tier role hierarchy, permission matrices, user management'
                }
            ]
        },
        {
            id: 'sustainability',
            title: '🌱 Sustainability',
            documents: [
                {
                    id: 'loyalty-impact',
                    title: 'Loyalty & IMPACT Platform',
                    icon: Trophy,
                    content: LoyaltyImpactPlatformDoc,
                    description: 'Comprehensive gamified loyalty & sustainability integration - programs, gamification, impact tracking'
                },
                {
                    id: 'fix-score',
                    title: 'FIX Score System',
                    icon: Shield,
                    content: FIXScoreSystemDoc,
                    description: 'FTS Index merchant scoring algorithm - calculation methodology'
                },
                {
                    id: 'nano-platform',
                    title: 'NANO Platform',
                    icon: FileText,
                    content: NANOSustainabilityDoc,
                    description: 'Complete NANO ecosystem - tasks, tokens, staking, NFTs, DAO governance'
                },
                {
                    id: 'nano-sustainability',
                    title: 'NANO Integration',
                    icon: FileText,
                    content: NANOSustainabilityIntegrationDoc,
                    description: 'Strategic integration of gamified sustainability platform - market analysis, tokenomics, revenue projections'
                }
            ]
        },
        {
            id: 'developer-resources',
            title: '👨‍💻 Developer Resources',
            documents: [
                {
                    id: 'api-reference',
                    title: 'API Reference',
                    icon: Code,
                    content: APIReferenceGuide,
                    description: 'Complete REST API documentation - endpoints, authentication, examples'
                },
                {
                    id: 'integration-patterns',
                    title: 'Integration Patterns',
                    icon: GitBranch,
                    content: IntegrationPatternsDoc,
                    description: 'Common integration scenarios, best practices, code examples'
                },
                {
                    id: 'migration-guides',
                    title: 'Migration Guides',
                    icon: GitBranch,
                    content: MigrationGuidesDoc,
                    description: 'Migrate from Stripe, PayPal, legacy systems - zero-downtime strategies'
                },
                {
                    id: 'troubleshooting',
                    title: 'Troubleshooting',
                    icon: Shield,
                    content: TroubleshootingGuide,
                    description: 'Common issues and solutions across all services'
                }
            ]
        },
        {
            id: 'operations',
            title: '⚙️ Operations',
            documents: [
                {
                    id: 'psp-provisioning-sops',
                    title: 'PSP Provisioning & Onboarding SOPs',
                    icon: FileText,
                    content: PSPProvisioningSOPs,
                    description: '24-hour PSP deployment procedures - sales, onboarding, provisioning, go-live protocols'
                },
                {
                    id: 'customer-success-sops',
                    title: 'Customer Success Operations SOPs',
                    icon: FileText,
                    content: MultiServiceCustomerSuccessSOPs,
                    description: 'Multi-service support, TAM engagement, QBRs, upsell/cross-sell, churn prevention'
                },
                {
                    id: 'partner-management-sops',
                    title: 'Partner & Reseller Management SOPs',
                    icon: FileText,
                    content: PartnerResellerManagementSOPs,
                    description: 'Partner onboarding, enablement, co-marketing, commission processing'
                },
                {
                    id: 'crypto-vasp-sops',
                    title: 'Crypto VASP Operations SOPs',
                    icon: Wallet,
                    content: CryptoVASPOperationsSOPs,
                    description: 'Striga integration, wallet provisioning, IBAN setup, crypto KYC/AML, Travel Rule'
                },
                {
                    id: 'iso-gateway-sops',
                    title: 'ISO Gateway Operations SOPs',
                    icon: Code,
                    content: ISOGatewayOperationsSOPs,
                    description: 'Message translation setup, monitoring, routing, error handling, performance optimization'
                },
                {
                    id: 'rwa-operations-sops',
                    title: 'RWA Tokenization Operations SOPs',
                    icon: FileText,
                    content: RWATokenizationOperationsSOPs,
                    description: 'Asset issuer onboarding, tokenization workflow, investor KYC, smart contract deployment'
                },
                {
                    id: 'tax-einvoicing-sops',
                    title: 'Tax & E-Invoicing Operations SOPs',
                    icon: FileText,
                    content: TaxEInvoicingOperationsSOPs,
                    description: 'Tax rate management, real-time calculation, e-invoice generation, government submission'
                },
                {
                    id: 'platform-infrastructure-sops',
                    title: 'Platform Infrastructure & DevOps SOPs',
                    icon: Code,
                    content: PlatformInfrastructureSOPs,
                    description: '24/7 monitoring, deployment procedures, database operations, auto-scaling, incident response'
                },
                {
                    id: 'security-compliance-sops',
                    title: 'Security & Compliance Operations SOPs',
                    icon: Shield,
                    content: SecurityComplianceOperationsSOPs,
                    description: 'Fraud detection, incident response, access control, vulnerability management, PCI DSS, AML'
                },
                {
                    id: 'billing-revenue-sops',
                    title: 'Billing & Revenue Operations SOPs',
                    icon: FileText,
                    content: BillingRevenueOperationsSOPs,
                    description: 'Usage metering, invoice generation, payment processing, revenue recognition, collections'
                },
                {
                    id: 'compliance-risk-sops',
                    title: 'Compliance & Risk Management SOPs',
                    icon: Shield,
                    content: ComplianceRiskManagementSOPs,
                    description: 'Enterprise risk assessment, vendor risk, regulatory examinations, audit coordination'
                },
                {
                    id: 'business-continuity-sops',
                    title: 'Business Continuity & DR SOPs',
                    icon: Shield,
                    content: BusinessContinuityDRSOPs,
                    description: 'BCP activation, disaster recovery, data center failover, crisis communication, testing'
                },
                {
                    id: 'orchestration-sops',
                    title: 'Payment Orchestration Operations SOPs',
                    icon: GitBranch,
                    content: OrchestrationOperationsSOPs,
                    description: 'Multi-processor routing, optimization, failover management, cost analysis'
                },
                {
                    id: 'marketing-leadgen-sops',
                    title: 'Marketing & Lead Generation SOPs',
                    icon: FileText,
                    content: MarketingLeadGenSOPs,
                    description: 'Content strategy, SEO, demand generation, campaign management, MQL handoff'
                },
                {
                    id: 'product-management-sops',
                    title: 'Product Management SOPs',
                    icon: Code,
                    content: ProductManagementSOPs,
                    description: 'Product lifecycle, roadmap planning, sprint management, API versioning, release procedures'
                },
                {
                    id: 'human-resources-sops',
                    title: 'Human Resources SOPs',
                    icon: FileText,
                    content: HumanResourcesSOPs,
                    description: 'Employee onboarding/offboarding, performance reviews, compliance training, incident reporting'
                },
                {
                    id: 'operational-runbooks',
                    title: 'Operational Runbooks',
                    icon: Shield,
                    content: OperationalRunbooksDoc,
                    description: 'Daily ops checklists, incident response, escalation procedures'
                },
                {
                    id: 'user-journeys',
                    title: 'User Journey Maps',
                    icon: BookOpen,
                    content: UserJourneyMapsDoc,
                    description: 'End-to-end workflows for PSP operators, merchants, ISO customers'
                },
                {
                    id: 'service-publication',
                    title: 'Service Publication',
                    icon: GitBranch,
                    content: ServicePublicationDoc,
                    description: 'Phased rollout, soft launch, beta programs, version control'
                },
                {
                    id: 'service-interoperability',
                    title: 'Service Interoperability',
                    icon: GitBranch,
                    content: ServiceInteroperabilityDoc,
                    description: 'How FTS services integrate to create unique composite solutions'
                }
            ]
        },
        {
            id: 'advanced',
            title: '🔧 Advanced Topics',
            documents: [
                {
                    id: 'business-plan',
                    title: 'FTS.Money Business Plan',
                    icon: FileText,
                    content: FTSBusinessPlan,
                    description: 'Comprehensive business plan with SWOT, market analysis, GTM strategy, 5-year projections, budget & headcount'
                },
                {
                    id: 'verticals',
                    title: 'Vertical Solutions',
                    icon: BookOpen,
                    content: VerticalSolutionsDoc,
                    description: 'Industry-specific payment solutions and implementations'
                },
                {
                    id: 'documentation-gaps',
                    title: 'Documentation Gap Analysis',
                    icon: FileText,
                    content: DocumentationGapAnalysis,
                    description: 'Complete platform audit, identified gaps, and update roadmap'
                }
            ]
        }
    ];

    // Flatten for legacy support
    const documents = documentCategories.flatMap(cat => 
        cat.documents.map(doc => ({ ...doc, category: cat.id }))
    );

    const [selectedCategory, setSelectedCategory] = useState('getting-started');

    const downloadMarkdown = (doc) => {
        const element = document.createElement('a');
        const file = new Blob([doc.content], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = `${doc.title.replace(/\s+/g, '-').toLowerCase()}.md`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const printDocument = () => {
        window.print();
    };

    const currentDoc = documents.find(d => d.id === activeTab);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @media print {
                    /* Forcefully hide ALL navigation and UI */
                    aside, nav, header, button, footer,
                    [role="tablist"], [role="tab"], [role="navigation"],
                    [class*="sidebar"], [class*="Sidebar"],
                    [class*="w-64"], div.w-64,
                    [class*="ticker"], [class*="news"], [class*="News"],
                    div[class*="bg-slate-900"], div[class*="bg-blue"],
                    div[class*="bg-white"][class*="border-r"],
                    div.flex.h-screen > aside,
                    div.flex.h-screen > div:first-child {
                        display: none !important;
                        visibility: hidden !important;
                        position: absolute !important;
                        left: -9999px !important;
                        width: 0 !important;
                        height: 0 !important;
                        overflow: hidden !important;
                    }
                    
                    .print-hide {
                        display: none !important;
                    }
                    
                    @page {
                        size: A4;
                        margin: 20mm;
                    }
                    
                    body, html {
                        margin: 0;
                        padding: 0;
                    }
                    
                    body::before {
                        content: '';
                        display: block;
                        width: 300px;
                        height: 80px;
                        margin: 0 auto 30px;
                        background-image: url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6931510c4507988f66a42ca8/80c34e6d5_FTSMoney-primary-logo-RGB.png');
                        background-size: contain;
                        background-repeat: no-repeat;
                        background-position: center;
                    }
                    
                    /* Hide Base44 App text */
                    title, [class*="base44"], [class*="Base44"] {
                        display: none !important;
                    }
                    
                    /* Remove all flex layouts */
                    .flex, .flex-1, .h-screen {
                        display: block !important;
                        height: auto !important;
                        width: 100% !important;
                    }
                    
                    /* Show all text content */
                    .prose {
                        max-width: 100% !important;
                        font-size: 10pt !important;
                        line-height: 1.5 !important;
                    }
                    
                    .prose * {
                        color: #000 !important;
                        visibility: visible !important;
                    }
                    
                    .prose p {
                        display: block !important;
                        margin: 6pt 0 !important;
                    }
                    
                    .prose ul, .prose ol {
                        display: block !important;
                        padding-left: 20pt !important;
                        margin: 6pt 0 !important;
                    }
                    
                    .prose li {
                        display: list-item !important;
                        margin: 3pt 0 !important;
                    }
                    
                    .prose strong, .prose em {
                        display: inline !important;
                    }
                    
                    .prose h1 { 
                        display: block !important;
                        font-size: 16pt !important; 
                        page-break-after: avoid !important; 
                        margin: 12pt 0 8pt !important; 
                    }
                    .prose h2 { 
                        display: block !important;
                        font-size: 13pt !important; 
                        page-break-after: avoid !important; 
                        margin: 10pt 0 6pt !important; 
                    }
                    .prose h3 { 
                        display: block !important;
                        font-size: 11pt !important; 
                        page-break-after: avoid !important; 
                        margin: 8pt 0 4pt !important; 
                    }
                    
                    .prose table {
                        display: table !important;
                        font-size: 8pt !important;
                        border-collapse: collapse !important;
                        width: 100% !important;
                        margin: 6pt 0 !important;
                    }
                    
                    .prose thead { display: table-header-group !important; }
                    .prose tbody { display: table-row-group !important; }
                    .prose tr { display: table-row !important; }
                    .prose th, .prose td {
                        display: table-cell !important;
                        padding: 4px !important;
                        border: 1px solid #000 !important;
                    }
                    
                    .prose pre {
                        display: block !important;
                        font-size: 7pt !important;
                        page-break-inside: avoid !important;
                        white-space: pre-wrap !important;
                        word-wrap: break-word !important;
                    }
                    
                    .prose code {
                        display: inline !important;
                        font-size: 8pt !important;
                    }
                    
                    .prose blockquote {
                        display: block !important;
                        margin: 6pt 0 !important;
                        padding-left: 10pt !important;
                        border-left: 2pt solid #000 !important;
                    }
                }
            `}</style>
            <div className="flex flex-col md:flex-row h-screen bg-slate-50">
                <div className="hidden md:block">
                    <FTSPlatformSidebar 
                        currentPage="FTSDocumentation"
                        userEmail={platformUser?.email}
                        userRole={platformUser?.platform_role}
                        isSuperAdmin={platformUser?.platform_role === 'super_admin'}
                    />
                </div>

                <div className="flex-1 overflow-auto w-full">
                <div className="p-4 md:p-6">
                    {/* Header with Mobile Menu Toggle */}
                    <div className="mb-6 print-hide">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{t('platform:subMenuItems.documentationHub')}</h1>
                                <p className="text-sm md:text-base text-slate-600">{t('platform:subMenuItems.documentationHubDesc')}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Category Navigation */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Mobile Menu Overlay */}
                        {mobileMenuOpen && (
                            <div 
                                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                                onClick={() => setMobileMenuOpen(false)}
                            />
                        )}
                        
                        {/* Category Sidebar */}
                        <div className={`
                            fixed md:static inset-y-0 left-0 z-50 w-80 md:w-auto
                            md:col-span-3 print-hide
                            transform transition-transform duration-200 ease-in-out
                            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                        `}>
                            <Card className="h-full md:h-auto md:sticky md:top-6 overflow-y-auto">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Documentation</CardTitle>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="md:hidden"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <nav className="space-y-1">
                                        {documentCategories.map((category) => {
                                            const isOpen = openCategories.includes(category.id);
                                            return (
                                                <Collapsible
                                                    key={category.id}
                                                    open={isOpen}
                                                    onOpenChange={(open) => {
                                                        if (open) {
                                                            setOpenCategories([...openCategories, category.id]);
                                                            setSelectedCategory(category.id);
                                                        } else {
                                                            setOpenCategories(openCategories.filter(id => id !== category.id));
                                                        }
                                                    }}
                                                >
                                                    <CollapsibleTrigger asChild>
                                                        <button
                                                            className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors flex items-center justify-between ${
                                                                selectedCategory === category.id
                                                                    ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                                                                    : 'text-slate-600 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <span>{category.title}</span>
                                                            <span className="text-xs">
                                                                {isOpen ? '▼' : '▶'}
                                                            </span>
                                                        </button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="ml-4 mt-1 space-y-1">
                                                            {category.documents.map((doc) => {
                                                                const Icon = doc.icon;
                                                                return (
                                                                    <button
                                                                        key={doc.id}
                                                                        onClick={() => {
                                                                            setActiveTab(doc.id);
                                                                            setMobileMenuOpen(false);
                                                                        }}
                                                                        className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                                                                            activeTab === doc.id
                                                                                ? 'bg-blue-50 text-blue-700 font-medium'
                                                                                : 'text-slate-600 hover:bg-slate-50'
                                                                        }`}
                                                                    >
                                                                        <Icon className="h-3 w-3 flex-shrink-0" />
                                                                        <span className="truncate">{doc.title}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            );
                                        })}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Document Content */}
                        <div className="col-span-1 md:col-span-9">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

                        {documents.map((doc) => (
                            <TabsContent key={doc.id} value={doc.id}>
                                <Card>
                                    <CardHeader className="border-b bg-white print-hide">
                                      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                                          <div className="flex-1">
                                              <CardTitle className="text-xl md:text-2xl">{doc.title}</CardTitle>
                                              <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                                          </div>
                                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                               <Button
                                                   onClick={() => setExportDialogOpen(true)}
                                                   className="gap-2 bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-none"
                                                   size="sm"
                                               >
                                                   <Download className="h-4 w-4" />
                                                   <span className="hidden sm:inline">Export</span>
                                               </Button>
                                               <Button
                                                   onClick={() => downloadMarkdown(doc)}
                                                   variant="outline"
                                                   className="gap-2 flex-1 md:flex-none"
                                                   size="sm"
                                               >
                                                   <FileText className="h-4 w-4" />
                                                   <span className="hidden sm:inline">Markdown</span>
                                               </Button>
                                               <Button
                                                   onClick={printDocument}
                                                   variant="outline"
                                                   className="gap-2 flex-1 md:flex-none"
                                                   size="sm"
                                               >
                                                   <Printer className="h-4 w-4" />
                                                   <span className="hidden sm:inline">Print</span>
                                               </Button>
                                           </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 md:p-8 bg-white">
                                      <div className="prose prose-slate max-w-none prose-sm md:prose-base">
                                           <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    h1: ({ children }) => {
                                                       const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                       return (
                                                           <h1 id={id} className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-slate-900 border-b pb-2 scroll-mt-6 break-words">
                                                               {children}
                                                           </h1>
                                                       );
                                                    },
                                                    h2: ({ children }) => {
                                                       const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                       return (
                                                           <h2 id={id} className="text-xl md:text-3xl font-bold mt-6 md:mt-8 mb-3 md:mb-4 text-slate-800 scroll-mt-6 break-words">
                                                               {children}
                                                           </h2>
                                                       );
                                                    },
                                                    h3: ({ children }) => {
                                                       const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                       return (
                                                           <h3 id={id} className="text-lg md:text-2xl font-semibold mt-4 md:mt-6 mb-2 md:mb-3 text-slate-700 scroll-mt-6 break-words">
                                                               {children}
                                                           </h3>
                                                       );
                                                    },
                                                    h4: ({ children }) => {
                                                       const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                       return (
                                                           <h4 id={id} className="text-base md:text-xl font-semibold mt-3 md:mt-4 mb-2 text-slate-700 scroll-mt-6 break-words">
                                                               {children}
                                                           </h4>
                                                       );
                                                    },
                                                    p: ({ children }) => (
                                                       <p className="mb-3 md:mb-4 text-sm md:text-base text-slate-600 leading-relaxed break-words">
                                                           {children}
                                                       </p>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="list-disc pl-6 mb-4 space-y-2">
                                                            {children}
                                                        </ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="list-decimal pl-6 mb-4 space-y-2">
                                                            {children}
                                                        </ol>
                                                    ),
                                                    li: ({ children }) => (
                                                        <li className="text-slate-600">
                                                            {children}
                                                        </li>
                                                    ),
                                                    code: ({ inline, className, children }) => {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        const language = match ? match[1] : '';

                                                        if (inline) {
                                                            return (
                                                                <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono">
                                                                    {children}
                                                                </code>
                                                            );
                                                        }

                                                        if (language === 'mermaid') {
                                                            const textContent = Array.isArray(children) 
                                                                ? children.join('') 
                                                                : String(children);
                                                            const cleanChart = textContent.replace(/^\n+|\n+$/g, '');
                                                            const chartKey = `mermaid-${cleanChart.substring(0, 50)}`;
                                                            return <MermaidDiagram key={chartKey} chart={cleanChart} />;
                                                        }

                                                        return (
                                                           <pre className="bg-slate-900 text-slate-100 p-3 md:p-4 rounded-lg overflow-x-auto mb-4 -mx-4 md:mx-0">
                                                               <code className="text-xs md:text-sm font-mono block">
                                                                   {children}
                                                               </code>
                                                           </pre>
                                                        );
                                                    },
                                                    table: ({ children }) => (
                                                       <div className="overflow-x-auto mb-4 -mx-4 md:mx-0">
                                                           <div className="inline-block min-w-full align-middle">
                                                               <table className="min-w-full border border-slate-200 text-sm">
                                                                   {children}
                                                               </table>
                                                           </div>
                                                       </div>
                                                    ),
                                                    thead: ({ children }) => (
                                                        <thead className="bg-slate-50">
                                                            {children}
                                                        </thead>
                                                    ),
                                                    th: ({ children }) => (
                                                       <th className="border border-slate-200 px-2 md:px-4 py-2 text-left font-semibold text-slate-700 text-xs md:text-sm">
                                                           {children}
                                                       </th>
                                                    ),
                                                    td: ({ children }) => (
                                                       <td className="border border-slate-200 px-2 md:px-4 py-2 text-slate-600 text-xs md:text-sm">
                                                           {children}
                                                       </td>
                                                    ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-slate-600">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    a: ({ children, href }) => {
                                                        // Check if it's an internal anchor link
                                                        if (href && href.startsWith('#')) {
                                                            return (
                                                                <a
                                                                    href={href}
                                                                    className="text-blue-600 hover:text-blue-700 underline"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        const id = href.replace('#', '');
                                                                        const element = document.getElementById(id);
                                                                        if (element) {
                                                                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                                        }
                                                                    }}
                                                                >
                                                                    {children}
                                                                </a>
                                                            );
                                                        }
                                                        // External link
                                                        return (
                                                            <a
                                                                href={href}
                                                                className="text-blue-600 hover:text-blue-700 underline"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                {children}
                                                            </a>
                                                        );
                                                    },
                                                }}
                                            >
                                                {doc.content}
                                            </ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Export Dialog */}
        {currentDoc && (
            <ExportDialog
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                documentTitle={currentDoc.title}
                documentContent={currentDoc.content}
            />
        )}
        </>
    );
}