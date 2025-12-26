import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, BookOpen, Code, GitBranch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import FTSOverviewDoc from '@/components/docs/FTSOverviewDoc';
import FTSControlPanelDoc from '@/components/docs/FTSControlPanelDoc';
import PSPPortalDoc from '@/components/docs/PSPPortalDoc';
import CommunityPortalDoc from '@/components/docs/CommunityPortalDoc';
import ISOGatewayDoc from '@/components/docs/ISOGatewayDoc';
import OrchestrationDoc from '@/components/docs/OrchestrationDoc';
import jsPDF from 'jspdf';

export default function FTSDocumentation() {
    const { platformUser, loading } = usePlatformAuth();
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

    const downloadPDF = (doc) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const maxLineWidth = pageWidth - (margin * 2);
        
        // Split content into lines and pages
        const lines = doc.content.split('\n');
        let yPosition = margin;
        let currentPage = 1;

        // Add title page
        pdf.setFontSize(24);
        pdf.text(doc.title, pageWidth / 2, 40, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('FTS.Money Documentation', pageWidth / 2, 50, { align: 'center' });
        pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 60, { align: 'center' });
        pdf.addPage();
        
        yPosition = margin;
        pdf.setFontSize(10);

        lines.forEach((line, index) => {
            // Handle headers
            if (line.startsWith('# ')) {
                if (yPosition > margin + 10) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.setFontSize(18);
                pdf.setFont(undefined, 'bold');
                const text = line.replace('# ', '');
                pdf.text(text, margin, yPosition);
                yPosition += 10;
                pdf.setFontSize(10);
                pdf.setFont(undefined, 'normal');
            } else if (line.startsWith('## ')) {
                if (yPosition > pageHeight - 30) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.setFontSize(14);
                pdf.setFont(undefined, 'bold');
                const text = line.replace('## ', '');
                pdf.text(text, margin, yPosition);
                yPosition += 8;
                pdf.setFontSize(10);
                pdf.setFont(undefined, 'normal');
            } else if (line.startsWith('### ')) {
                if (yPosition > pageHeight - 25) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.setFontSize(12);
                pdf.setFont(undefined, 'bold');
                const text = line.replace('### ', '');
                pdf.text(text, margin, yPosition);
                yPosition += 7;
                pdf.setFontSize(10);
                pdf.setFont(undefined, 'normal');
            } else if (line.trim().startsWith('```')) {
                // Skip code blocks for now
                return;
            } else if (line.trim() === '') {
                yPosition += 4;
            } else if (!line.includes('```mermaid') && !line.includes('graph') && !line.includes('sequenceDiagram')) {
                // Regular text
                const wrappedLines = pdf.splitTextToSize(line, maxLineWidth);
                wrappedLines.forEach(wrappedLine => {
                    if (yPosition > pageHeight - 20) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    pdf.text(wrappedLine, margin, yPosition);
                    yPosition += 5;
                });
            }
        });

        // Add page numbers
        const totalPages = pdf.internal.pages.length - 1;
        for (let i = 2; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.text(`Page ${i - 1} of ${totalPages - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        pdf.save(`${doc.title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
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
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Documentation</h1>
                        <p className="text-slate-600">Comprehensive guides for the entire FTS.Money ecosystem</p>
                    </div>

                    {/* Document Selector */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-white p-1 rounded-lg shadow">
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
                                                components={{
                                                    h1: ({ children }) => (
                                                        <h1 className="text-4xl font-bold mb-4 text-slate-900 border-b pb-2">
                                                            {children}
                                                        </h1>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h2 className="text-3xl font-bold mt-8 mb-4 text-slate-800">
                                                            {children}
                                                        </h2>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="text-2xl font-semibold mt-6 mb-3 text-slate-700">
                                                            {children}
                                                        </h3>
                                                    ),
                                                    h4: ({ children }) => (
                                                        <h4 className="text-xl font-semibold mt-4 mb-2 text-slate-700">
                                                            {children}
                                                        </h4>
                                                    ),
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
                                                    code: ({ inline, children }) => {
                                                        if (inline) {
                                                            return (
                                                                <code className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded text-sm font-mono">
                                                                    {children}
                                                                </code>
                                                            );
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
                                                    a: ({ children, href }) => (
                                                        <a
                                                            href={href}
                                                            className="text-blue-600 hover:text-blue-700 underline"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {children}
                                                        </a>
                                                    ),
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