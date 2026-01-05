import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
});

const renderedCharts = new Map();

export default function MermaidDiagram({ chart }) {
    const containerRef = useRef(null);
    const chartKey = useRef(chart);
    
    useEffect(() => {
        if (!chart || !containerRef.current) return;
        
        // Check if we've already rendered this exact chart
        if (renderedCharts.has(chart)) {
            containerRef.current.innerHTML = renderedCharts.get(chart);
            return;
        }
        
        // Only render if this is a new chart
        if (chartKey.current === chart && containerRef.current.querySelector('svg')) {
            return;
        }
        
        const render = async () => {
            try {
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const result = await mermaid.render(id, chart.trim());
                
                // Cache the result
                renderedCharts.set(chart, result.svg);
                
                if (containerRef.current) {
                    containerRef.current.innerHTML = result.svg;
                }
            } catch (err) {
                console.error('Mermaid render error:', err);
                const errorHtml = `<div class="p-4 border border-red-300 rounded bg-red-50 text-red-600">Failed to render diagram: ${err.message}</div>`;
                if (containerRef.current) {
                    containerRef.current.innerHTML = errorHtml;
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