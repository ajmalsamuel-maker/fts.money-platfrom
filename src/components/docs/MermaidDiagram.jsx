import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif'
});

export default function MermaidDiagram({ chart }) {
    const ref = useRef(null);
    
    useEffect(() => {
        if (ref.current && chart) {
            ref.current.innerHTML = chart;
            mermaid.contentLoaded();
        }
    }, [chart]);
    
    return (
        <div className="mermaid my-6 flex justify-center bg-white p-4 rounded-lg border border-slate-200" ref={ref}>
            {chart}
        </div>
    );
}