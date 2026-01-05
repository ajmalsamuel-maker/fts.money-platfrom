import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
});

const MermaidDiagram = React.memo(({ chart }) => {
    const containerRef = useRef(null);
    const isRendering = useRef(false);
    const renderedChart = useRef(null);
    
    useEffect(() => {
        if (!chart || !containerRef.current || isRendering.current) return;
        
        // Skip if already rendered this exact chart
        if (renderedChart.current === chart) return;
        
        isRendering.current = true;
        renderedChart.current = chart;
        
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
            } finally {
                isRendering.current = false;
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
});

MermaidDiagram.displayName = 'MermaidDiagram';

export default MermaidDiagram;