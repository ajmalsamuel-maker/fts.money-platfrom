import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({ startOnLoad: true, theme: 'default' });

export default function MermaidRenderer({ chart }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current && chart) {
            containerRef.current.innerHTML = '';
            try {
                const svg = mermaid.render('mermaid-diagram', chart);
                svg.then(result => {
                    if (containerRef.current) {
                        containerRef.current.innerHTML = result.svg;
                    }
                }).catch(err => {
                    if (containerRef.current) {
                        containerRef.current.innerHTML = `<p class="text-red-600 text-sm">Error rendering diagram: ${err.message}</p>`;
                    }
                });
            } catch (error) {
                if (containerRef.current) {
                    containerRef.current.innerHTML = `<p class="text-red-600 text-sm">Error: ${error.message}</p>`;
                }
            }
        }
    }, [chart]);

    return <div ref={containerRef} className="flex justify-center overflow-x-auto" />;
}