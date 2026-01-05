import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid once
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' },
    sequence: { useMaxWidth: true, wrap: true },
    pie: { useMaxWidth: true }
});

export default function MermaidDiagram({ chart }) {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const renderDiagram = async () => {
            if (!chart) return;
            
            try {
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
                setSvg(renderedSvg);
                setError(null);
            } catch (err) {
                console.error('Mermaid error:', err);
                setError(err.message);
            }
        };
        
        renderDiagram();
    }, [chart]);
    
    if (error) {
        return (
            <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                Diagram rendering error: {error}
            </div>
        );
    }
    
    if (!svg) {
        return (
            <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="animate-pulse h-32 bg-slate-200 rounded"></div>
            </div>
        );
    }
    
    return (
        <div className="my-6 flex justify-center overflow-x-auto">
            <div dangerouslySetInnerHTML={{ __html: svg }} />
        </div>
    );
}