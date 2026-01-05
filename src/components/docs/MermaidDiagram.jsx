import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
});

export default function MermaidDiagram({ chart }) {
    const containerRef = useRef(null);
    const [svg, setSvg] = useState(null);
    const hasRendered = useRef(false);
    
    useEffect(() => {
        // Only render once
        if (hasRendered.current || !chart) return;
        hasRendered.current = true;
        
        const render = async () => {
            try {
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const result = await mermaid.render(id, chart.trim());
                setSvg(result.svg);
            } catch (err) {
                console.error('Mermaid render error:', err);
                setSvg(`<div class="p-4 border border-red-300 rounded bg-red-50 text-red-600">Failed to render diagram: ${err.message}</div>`);
            }
        };
        
        render();
    }, []); // Empty dependency array - only run once
    
    if (!svg) {
        return (
            <div className="my-6 text-center text-slate-500">
                Loading diagram...
            </div>
        );
    }
    
    return (
        <div 
            className="my-6 overflow-x-auto flex justify-center"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}