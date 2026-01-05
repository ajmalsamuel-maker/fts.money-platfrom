import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
});

export default function MermaidDiagram({ chart }) {
    const [html, setHtml] = useState('');
    const [error, setError] = useState(null);
    
    useEffect(() => {
        if (!chart) return;
        
        const render = async () => {
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chart);
                setHtml(svg);
                setError(null);
            } catch (err) {
                console.error('Mermaid error:', err);
                setError(err.message);
            }
        };
        
        render();
    }, [chart]);
    
    if (error) {
        return (
            <div className="my-4 p-4 bg-red-50 border border-red-300 rounded text-red-600 text-sm">
                Diagram error: {error}
            </div>
        );
    }
    
    if (!html) {
        return (
            <div className="my-4 p-4 bg-slate-100 rounded animate-pulse h-32"></div>
        );
    }
    
    return (
        <div className="my-6 overflow-x-auto flex justify-center" dangerouslySetInnerHTML={{ __html: html }} />
    );
}