import React, { useState } from 'react';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FTSOverviewDoc } from '@/components/docs/FTSOverviewDoc';
import { CommunityPortalDoc } from '@/components/docs/CommunityPortalDoc';
import { FTSControlPanelDoc } from '@/components/docs/FTSControlPanelDoc';
import { PSPPortalDoc } from '@/components/docs/PSPPortalDoc';
import { MerchantPortalDoc } from '@/components/docs/MerchantPortalDoc';
import { ISOGatewayDoc } from '@/components/docs/ISOGatewayDoc';
import { OrchestrationDoc } from '@/components/docs/OrchestrationDoc';

export default function SystemDocumentation() {
    const { platformUser } = usePlatformAuth();
    const [activeDoc, setActiveDoc] = useState('overview');

    const documents = [
        { id: 'overview', title: 'FTS.Money Overview', icon: BookOpen, content: FTSOverviewDoc, pages: '35+' },
        { id: 'community', title: 'Community Portal', icon: FileText, content: CommunityPortalDoc, pages: '42+' },
        { id: 'control', title: 'FTS Control Panel', icon: FileText, content: FTSControlPanelDoc, pages: '38+' },
        { id: 'psp', title: 'PSP Portal', icon: FileText, content: PSPPortalDoc, pages: '40+' },
        { id: 'merchant', title: 'Merchant Portal', icon: FileText, content: MerchantPortalDoc, pages: '36+' },
        { id: 'iso', title: 'ISO Gateway', icon: FileText, content: ISOGatewayDoc, pages: '45+' },
        { id: 'orchestration', title: 'Orchestration', icon: FileText, content: OrchestrationDoc, pages: '38+' }
    ];

    const downloadMarkdown = (doc) => {
        const blob = new Blob([doc.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/ /g, '_')}.md`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadAllDocs = () => {
        documents.forEach(doc => downloadMarkdown(doc));
    };

    const currentDoc = documents.find(d => d.id === activeDoc);

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="SystemDocumentation" 
                userRole={platformUser?.platform_role} 
                userEmail={platformUser?.email}
                isSuperAdmin={platformUser?.platform_role === 'super_admin'}
            />

            <div className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">System Documentation</h2>
                        <p className="text-xs text-slate-600">Complete technical & business documentation</p>
                    </div>
                    <Button onClick={downloadAllDocs} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download All (Markdown)
                    </Button>
                </header>

                <div className="p-6">
                    {/* Document Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {documents.map((doc) => {
                            const Icon = doc.icon;
                            return (
                                <Card 
                                    key={doc.id}
                                    className={`cursor-pointer transition-all hover:shadow-lg ${activeDoc === doc.id ? 'border-2 border-blue-500 bg-blue-50' : ''}`}
                                    onClick={() => setActiveDoc(doc.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Icon className="h-5 w-5 text-blue-600" />
                                            <span className="font-semibold text-sm">{doc.title}</span>
                                        </div>
                                        <p className="text-xs text-slate-600">{doc.pages} pages</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Document Viewer */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    {currentDoc?.title}
                                </CardTitle>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => downloadMarkdown(currentDoc)}
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Markdown
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-slate max-w-none">
                                <ReactMarkdown
                                    components={{
                                        code: ({ inline, className, children, ...props }) => {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const isMermaid = match && match[1] === 'mermaid';
                                            
                                            if (isMermaid && !inline) {
                                                return (
                                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 my-4">
                                                        <pre className="text-sm text-slate-700 overflow-x-auto">
                                                            <code>{children}</code>
                                                        </pre>
                                                        <p className="text-xs text-slate-500 mt-2">
                                                            ℹ️ Mermaid diagram - Use external viewer or Markdown editor to render
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            
                                            return !inline && match ? (
                                                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 overflow-x-auto my-4">
                                                    <code className={className} {...props}>{children}</code>
                                                </pre>
                                            ) : (
                                                <code className="bg-slate-100 text-slate-900 px-1 py-0.5 rounded text-sm" {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        table: ({ children }) => (
                                            <div className="overflow-x-auto my-4">
                                                <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
                                                    {children}
                                                </table>
                                            </div>
                                        ),
                                        th: ({ children }) => (
                                            <th className="px-4 py-2 bg-slate-50 text-left text-sm font-semibold text-slate-900">
                                                {children}
                                            </th>
                                        ),
                                        td: ({ children }) => (
                                            <td className="px-4 py-2 border-t border-slate-200 text-sm text-slate-700">
                                                {children}
                                            </td>
                                        ),
                                        h1: ({ children }) => (
                                            <h1 className="text-3xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b-2 border-blue-500">
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-3">
                                                {children}
                                            </h2>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-xl font-semibold text-slate-900 mt-4 mb-2">
                                                {children}
                                            </h3>
                                        ),
                                        blockquote: ({ children }) => (
                                            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-600 my-4">
                                                {children}
                                            </blockquote>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="list-disc list-inside my-4 space-y-1">
                                                {children}
                                            </ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="list-decimal list-inside my-4 space-y-1">
                                                {children}
                                            </ol>
                                        )
                                    }}
                                >
                                    {currentDoc?.content}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}