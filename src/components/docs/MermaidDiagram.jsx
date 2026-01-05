import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
});

export default function MermaidDiagram({ chart }) {
    const containerRef = useRef(null);
    const hasRendered = useRef(false);
    
    useEffect(() => {
        if (!chart || !containerRef.current || hasRendered.current) return;
        
        hasRendered.current = true;
        
        const render = async () => {
            try {
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const result = await mermaid.render(id, chart.trim());
                
                if (containerRef.current) {
                    containerRef.current.innerHTML = result.svg;
                }
            } catch (err) {
                console.error('Mermaid render error:', err);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<div class="p-4 border border-red-300 rounded bg-red-50 text-red-600">Failed to render diagram: ${err.message}</div>`;
                }
            }
        };
        
        render();
    }, [chart]);
    
    return (
        <div 
            ref={containerRef}
            className="my-6 overflow-x-auto flex justify-center"
        >
            <div className="text-center text-slate-500">Loading diagram...</div>
        </div>
    );
}