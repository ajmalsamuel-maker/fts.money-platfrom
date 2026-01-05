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
    const isRenderedRef = useRef(false);
    const chartContentRef = useRef(null);
    
    useEffect(() => {
        // Only render if we have a chart, a container, and haven't rendered this exact chart yet
        if (!chart || !containerRef.current) return;
        if (isRenderedRef.current && chartContentRef.current === chart) return;
        
        const render = async () => {
            try {
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chart.trim());
                
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                    isRenderedRef.current = true;
                    chartContentRef.current = chart;
                }
            } catch (err) {
                console.error('Mermaid render error:', err);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<div class="text-red-600 p-4 border border-red-300 rounded bg-red-50">Failed to render diagram: ${err.message}</div>`;
                }
            }
        };
        
        render();
    }, [chart]);
    
    return <div ref={containerRef} className="my-6 overflow-x-auto flex justify-center" />;
}