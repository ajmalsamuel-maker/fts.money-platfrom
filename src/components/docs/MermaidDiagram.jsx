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
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                containerRef.current.innerHTML = `<div class="mermaid" id="${id}">${chart}</div>`;
                await mermaid.run({
                    nodes: [containerRef.current.querySelector('.mermaid')],
                });
            } catch (err) {
                console.error('Mermaid render error:', err);
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<div class="text-red-600 p-4 border border-red-300 rounded bg-red-50">Failed to render diagram: ${err.message}</div>`;
                }
            }
        };
        
        setTimeout(render, 100);
    }, [chart]);
    
    return (
        <div className="my-6 overflow-x-auto">
            <div ref={containerRef} className="mermaid"></div>
        </div>
    );
}