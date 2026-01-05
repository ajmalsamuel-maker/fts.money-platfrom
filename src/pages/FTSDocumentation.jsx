import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, BookOpen, Code, GitBranch, Wallet, Shield } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
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
import { RBACSystemDoc } from '@/components/docs/RBACSystemDoc';
import { MerchantPortalDoc } from '@/components/docs/MerchantPortalDoc';
import { VirtualTerminalDoc } from '@/components/docs/VirtualTerminalDoc';
import VATTaxManagementDoc from '@/components/docs/VATTaxManagementDoc';
import MermaidDiagram from '@/components/docs/MermaidDiagram';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function FTSDocumentation() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState('overview');

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
            id: 'rbac-system',
            title: 'RBAC & Access Control',
            icon: Shield,
            content: RBACSystemDoc,
            description: 'Role-Based Access Control system - multi-user permissions across all services'
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

    const downloadPDF = async (doc) => {
        // Create loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        loadingDiv.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                <div style="width: 32px; height: 32px; border: 4px solid #2563eb; border-top-color: transparent; border-radius: 50%; margin: 0 auto 16px; animation: spin 1s linear infinite;"></div>
                <p style="color: #475569; margin: 0;">Generating PDF with tables and diagrams...</p>
            </div>
            <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
        `;
        document.body.appendChild(loadingDiv);

        try {
            // Wait for Mermaid diagrams to render
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get the rendered content element
            const contentElement = document.querySelector('.prose');
            if (!contentElement) {
                throw new Error('Content element not found');
            }

            // Scroll to top to ensure everything is visible
            contentElement.scrollTop = 0;
            window.scrollTo(0, 0);

            // Capture the rendered content as canvas with better settings
            const canvas = await html2canvas(contentElement, {
                scale: 1,
                useCORS: true,
                allowTaint: true,
                logging: true,
                backgroundColor: '#ffffff',
                width: 1200,
                height: contentElement.scrollHeight,
                windowWidth: 1200,
                windowHeight: contentElement.scrollHeight,
                x: 0,
                y: 0
            });

            console.log('Canvas created:', canvas.width, 'x', canvas.height);

            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Add title page
            pdf.setFontSize(24);
            pdf.setFont(undefined, 'bold');
            pdf.text(doc.title, pageWidth / 2, 40, { align: 'center' });
            pdf.setFontSize(12);
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(100);
            pdf.text('FTS.Money Documentation', pageWidth / 2, 50, { align: 'center' });
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 60, { align: 'center' });

            // Convert canvas to image
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            console.log('Image data length:', imgData.length);
            
            if (imgData === 'data:,' || imgData.length < 100) {
                throw new Error('Canvas is empty - content may not be visible');
            }

            const imgWidth = pageWidth - 4;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Calculate pages needed
            const margin = 2;
            const maxHeight = pageHeight - 4;
            let heightLeft = imgHeight;
            let position = margin;

            // Add first page of content
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
            heightLeft -= maxHeight;

            // Add additional pages
            while (heightLeft > 0) {
                position = -(imgHeight - heightLeft) + margin;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
                heightLeft -= maxHeight;
            }

            // Add page numbers
            const totalPages = pdf.internal.pages.length - 1;
            pdf.setFontSize(8);
            pdf.setTextColor(150);
            for (let i = 2; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.text(`Page ${i - 1} of ${totalPages - 1}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
            }

            pdf.save(`${doc.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert(`Failed to generate PDF: ${error.message}. Please try the Markdown download instead.`);
        } finally {
            if (loadingDiv.parentNode) {
                document.body.removeChild(loadingDiv);
            }
        }
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
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="FTSDocumentation"
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
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
                                    <CardHeader className="border-b bg-white">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-2xl">{doc.title}</CardTitle>
                                                <p className="text-sm text-slate-600 mt-1">{doc.description}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => downloadMarkdown(doc)}
                                                    variant="outline"
                                                    className="gap-2"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download MD
                                                </Button>
                                                <Button
                                                    onClick={() => downloadPDF(doc)}
                                                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download PDF
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-8 bg-white">
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
                                                            return <MermaidDiagram chart={String(children)} />;
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
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </div>
        </div>
    );
}