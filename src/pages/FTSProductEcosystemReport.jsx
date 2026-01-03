import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePlatformAuth } from '@/components/auth/usePlatformAuth';
import FTSPlatformSidebarRestructured from '@/components/platform/FTSPlatformSidebarRestructured';
import MermaidDiagram from '@/components/docs/MermaidDiagram';
import ProductEcosystemDoc from '@/components/docs/ProductEcosystemDoc';
import { useI18n } from '@/components/i18n/EnhancedLanguageProvider';

export default function FTSProductEcosystemReport() {
    const { platformUser, loading } = usePlatformAuth();
    const { t } = useI18n();

    const downloadMarkdown = () => {
        const element = document.createElement('a');
        const file = new Blob([ProductEcosystemDoc], { type: 'text/markdown' });
        element.href = URL.createObjectURL(file);
        element.download = 'fts-money-product-ecosystem.md';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50">
            <FTSPlatformSidebarRestructured 
                currentPage="FTSProductEcosystemReport"
                userEmail={platformUser?.email}
            />

            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <Card>
                        <CardHeader className="border-b bg-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl">Product Ecosystem</CardTitle>
                                    <p className="text-sm text-slate-600 mt-1">Complete product portfolio, revenue models, and market analysis</p>
                                </div>
                                <Button
                                    onClick={downloadMarkdown}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download MD
                                </Button>
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
                                    {ProductEcosystemDoc}
                                </ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}