import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

let mermaidInitialized = false;

export default function MermaidDiagram({ chart }) {
    const containerRef = useRef(null);
    
    useEffect(() => {
        if (!mermaidInitialized) {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
                flowchart: { useMaxWidth: true, htmlLabels: true },
                sequence: { useMaxWidth: true }
            });
            mermaidInitialized = true;
        }
    }, []);
    
    useEffect(() => {
        const render = async () => {
            if (!containerRef.current || !chart) return;
            
            try {
                containerRef.current.innerHTML = chart;
                await mermaid.run({
                    nodes: [containerRef.current],
                });
            } catch (err) {
                console.error('Mermaid render error:', err);
                containerRef.current.innerHTML = `<div class="text-red-600 p-4 border border-red-300 rounded bg-red-50">Failed to render diagram: ${err.message}</div>`;
            }
        };
        
        render();
    }, [chart]);
    
    return (
        <div className="my-6 overflow-x-auto">
            <div ref={containerRef} className="mermaid"></div>
        </div>
    );
}