import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, BookOpen, Code, GitBranch, Wallet, Shield, Printer } from 'lucide-react';
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
import NanoSustainabilityIntegration from '@/components/docs/NanoSustainabilityIntegration';
import FIXScoreSystemDoc from '@/components/docs/FIXScoreSystemDoc';
import NANOSustainabilityDoc from '@/components/docs/NANOSustainabilityDoc';
import InvoicingSystemDoc from '@/components/docs/InvoicingSystemDoc';
import PCIAdvancedFeaturesDoc from '@/components/docs/PCIAdvancedFeaturesDoc';
import ServicePublicationDoc from '@/components/docs/ServicePublicationDoc';
import BillingInvoicingSystemDoc from '@/components/docs/BillingInvoicingSystemDoc';
import MultiUserRBACSystemDoc from '@/components/docs/MultiUserRBACSystemDoc';
import DocumentationGapAnalysis from '@/components/docs/DocumentationGapAnalysis';
import MermaidDiagram from '@/components/docs/MermaidDiagram';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';
import ExportDialog from '@/components/docs/ExportDialog';

export default function FTSDocumentation() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState('overview');
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const documents = [
        {
            id: 'overview',
            title: 'FTS.Money Platform Overview',
            icon: BookOpen,
            content: FTSOverviewDoc,
            description: 'Complete platform architecture, market positioning, and roadmap'
        },
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
            id: 'verticals',
            title: 'Vertical Solutions',
            icon: BookOpen,
            content: VerticalSolutionsDoc,
            description: 'Industry-specific payment solutions and implementations'
        },
        {
            id: 'crypto-banking',
            title: 'Crypto Banking Service',
            icon: Wallet,
            content: CryptoBankingDoc,
            description: 'Enterprise crypto banking infrastructure - wallets, IBANs, cards, compliance'
        },
        {
            id: 'rwa-technical',
            title: 'RWA Platform',
            icon: Code,
            content: RWATechnicalSpec,
            description: 'Real World Assets tokenization platform - complete technical specifications'
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
            id: 'vat-tax',
            title: 'VAT & Tax Management',
            icon: FileText,
            content: VATTaxManagementDoc,
            description: 'Global tax compliance, automated VAT calculation, and tax reporting'
        },
        {
            id: 'einvoicing',
            title: 'E-Invoicing System',
            icon: FileText,
            content: EInvoicingSystemDoc,
            description: 'Multi-standard electronic invoicing - Peppol, ZATCA, FatturaPA, CFDI'
        },
        {
            id: 'vasp-platform',
            title: 'VASP Platform - White-Label Crypto Banking',
            icon: Wallet,
            content: VASPPlatformDoc,
            description: 'Complete VASP infrastructure - wallets, IBANs, cards, compliance, and white-label portal'
        },
        {
            id: 'service-interoperability',
            title: 'Service Interoperability',
            icon: GitBranch,
            content: ServiceInteroperabilityDoc,
            description: 'How FTS services integrate to create unique composite solutions'
        },
        {
            id: 'pci-dss-compliance',
            title: 'PCI DSS Level 1 Compliance',
            icon: Shield,
            content: PCIDSSComplianceDoc,
            description: 'Comprehensive PCI DSS compliance management - continuous monitoring, predictive analytics, QSA integration, and blockchain audit trails'
        },
        {
            id: 'digital-identity',
            title: 'Digital Identity & Verifiable Credentials',
            icon: Wallet,
            content: DigitalIdentityDoc,
            description: 'W3C Verifiable Credentials and DIDs - passwordless authentication, selective disclosure, and privacy-preserving identity'
        },
        {
            id: 'platform-portals',
            title: 'Platform Portals Guide',
            icon: BookOpen,
            content: PlatformPortalsGuide,
            description: 'Complete guide to all FTS.Money portals - URLs, pages, features, and workflows with detailed diagrams'
        },
        {
            id: 'nano-sustainability',
            title: 'Nano Sustainability Integration',
            icon: FileText,
            content: NanoSustainabilityIntegration,
            description: 'Strategic integration of gamified sustainability platform - market analysis, revenue models, and implementation roadmap'
        },
        {
            id: 'fix-score',
            title: 'FIX Score System',
            icon: Shield,
            content: FIXScoreSystemDoc,
            description: 'FTS Index merchant scoring algorithm - complete technical documentation with calculation methodology and integration guide'
        },
        {
            id: 'nano-platform',
            title: 'NANO Sustainability Platform',
            icon: FileText,
            content: NANOSustainabilityDoc,
            description: 'Complete NANO ecosystem - tasks, tokens, staking, NFTs, DAO governance, and carbon offset integration'
        },
        {
            id: 'invoicing-system',
            title: 'Global Invoicing & Tax System',
            icon: FileText,
            content: InvoicingSystemDoc,
            description: 'Multi-standard e-invoicing and global VAT compliance - Peppol, ZATCA, FatturaPA, CFDI with automated tax calculation'
        },
        {
            id: 'pci-advanced',
            title: 'PCI DSS Advanced Suite',
            icon: Shield,
            content: PCIAdvancedFeaturesDoc,
            description: 'AI-powered continuous monitoring, predictive analytics, workflow automation, and QSA collaboration tools'
        },
        {
            id: 'service-publication',
            title: 'Service Publication System',
            icon: GitBranch,
            content: ServicePublicationDoc,
            description: 'Phased rollout, soft launch, beta programs, version control, and grandfathered pricing management'
        },
        {
            id: 'billing-invoicing',
            title: 'Billing & Invoicing System',
            icon: FileText,
            content: BillingInvoicingSystemDoc,
            description: 'Unified billing, usage metering, invoice generation, payment processing, and accounting integrations'
        },
        {
            id: 'rbac-system',
            title: 'Multi-User RBAC System',
            icon: Shield,
            content: MultiUserRBACSystemDoc,
            description: 'Six-tier role hierarchy, permission matrices, user management across all services'
        },
        {
            id: 'documentation-gaps',
            title: 'Documentation Gap Analysis',
            icon: FileText,
            content: DocumentationGapAnalysis,
            description: 'Complete platform audit, identified gaps, and documentation update roadmap'
        }
    ];

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
            <div className="flex h-screen bg-slate-50">
                <FTSPlatformSidebar 
                    currentPage="FTSDocumentation"
                    userEmail={platformUser?.email}
                    userRole={platformUser?.platform_role}
                    isSuperAdmin={platformUser?.platform_role === 'super_admin'}
                />

                <div className="flex-1 overflow-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6 print-hide">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('platform:subMenuItems.documentationHub')}</h1>
                        <p className="text-slate-600">{t('platform:subMenuItems.documentationHubDesc')}</p>
                    </div>

                    {/* Document Selector */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-white p-2 rounded-lg shadow h-auto flex-wrap justify-start">
                            {documents.map((doc) => {
                                const Icon = doc.icon;
                                return (
                                    <TabsTrigger
                                        key={doc.id}
                                        value={doc.id}
                                        className="flex items-center gap-2"
                                    >
                                        <Icon className="h-4 w-4" />
                                        {doc.title}
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>

                        {documents.map((doc) => (
                            <TabsContent key={doc.id} value={doc.id}>
                                <Card>
                                    <CardHeader className="border-b bg-white print-hide">
                                       <div className="flex items-start justify-between">
                                           <div>
                                               <CardTitle className="text-2xl">{doc.title}</CardTitle>
                                               <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                                           </div>
                                           <div className="flex gap-2">
                                               <Button
                                                   onClick={() => setExportDialogOpen(true)}
                                                   className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                               >
                                                   <Download className="h-4 w-4" />
                                                   Export
                                               </Button>
                                               <Button
                                                   onClick={() => downloadMarkdown(doc)}
                                                   variant="outline"
                                                   className="gap-2"
                                               >
                                                   <FileText className="h-4 w-4" />
                                                   Markdown
                                               </Button>
                                               <Button
                                                   onClick={printDocument}
                                                   variant="outline"
                                                   className="gap-2"
                                               >
                                                   <Printer className="h-4 w-4" />
                                                   Print
                                               </Button>
                                           </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 bg-white">
                                       {doc.id === 'nano-sustainability' ? (
                                           <doc.content />
                                       ) : (
                                       <div className="prose prose-slate max-w-none">
                                           <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    h1: ({ children }) => {
                                                        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                        return (
                                                            <h1 id={id} className="text-4xl font-bold mb-4 text-slate-900 border-b pb-2 scroll-mt-6">
                                                                {children}
                                                            </h1>
                                                        );
                                                    },
                                                    h2: ({ children }) => {
                                                        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                        return (
                                                            <h2 id={id} className="text-3xl font-bold mt-8 mb-4 text-slate-800 scroll-mt-6">
                                                                {children}
                                                            </h2>
                                                        );
                                                    },
                                                    h3: ({ children }) => {
                                                        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                        return (
                                                            <h3 id={id} className="text-2xl font-semibold mt-6 mb-3 text-slate-700 scroll-mt-6">
                                                                {children}
                                                            </h3>
                                                        );
                                                    },
                                                    h4: ({ children }) => {
                                                        const id = String(children).toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                                        return (
                                                            <h4 id={id} className="text-xl font-semibold mt-4 mb-2 text-slate-700 scroll-mt-6">
                                                                {children}
                                                            </h4>
                                                        );
                                                    },
                                                    p: ({ children }) => (
                                                        <p className="mb-4 text-slate-600 leading-relaxed">
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
                                                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto mb-4">
                                                                <code className="text-sm font-mono">
                                                                    {children}
                                                                </code>
                                                            </pre>
                                                        );
                                                    },
                                                    table: ({ children }) => (
                                                        <div className="overflow-x-auto mb-4">
                                                            <table className="min-w-full border border-slate-200">
                                                                {children}
                                                            </table>
                                                        </div>
                                                    ),
                                                    thead: ({ children }) => (
                                                        <thead className="bg-slate-50">
                                                            {children}
                                                        </thead>
                                                    ),
                                                    th: ({ children }) => (
                                                        <th className="border border-slate-200 px-4 py-2 text-left font-semibold text-slate-700">
                                                            {children}
                                                        </th>
                                                    ),
                                                    td: ({ children }) => (
                                                        <td className="border border-slate-200 px-4 py-2 text-slate-600">
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
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
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