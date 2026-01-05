import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
});

export default function MermaidDiagram({ chart }) {
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const hasRendered = useRef(false);
    
    useEffect(() => {
        if (!chart || hasRendered.current) return;
        
        hasRendered.current = true;
        
        const render = async () => {
            try {
                const id = `mermaid-${Date.now()}`;
                const result = await mermaid.render(id, chart.trim());
                setSvg(result.svg);
            } catch (err) {
                console.error('Mermaid error:', err);
                setError(err.message);
            }
        };
        
        render();
    }, []);
    
    if (error) {
        return (
            <div className="my-6 p-4 border border-red-300 rounded bg-red-50 text-red-600">
                Failed to render diagram: {error}
            </div>
        );
    }
    
    if (!svg) {
        return <div className="my-6 text-center text-slate-500">Loading diagram...</div>;
    }
    
    return (
        <div 
            className="my-6 overflow-x-auto flex justify-center"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}