import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

export default function MermaidDiagram({ chart }) {
    const ref = useRef(null);
    const [svg, setSvg] = useState('');
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);
    
    useEffect(() => {
        // Initialize mermaid once globally
        if (!initialized) {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
                securityLevel: 'loose',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis'
                },
                sequence: {
                    useMaxWidth: true,
                    wrap: true
                },
                pie: {
                    useMaxWidth: true
                },
                mindmap: {
                    useMaxWidth: true
                }
            });
            setInitialized(true);
        }
    }, [initialized]);
    
    useEffect(() => {
        const renderDiagram = async () => {
            if (!chart || !initialized) return;
            
            try {
                // Generate unique ID for this diagram
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                // Clean the chart text
                const cleanChart = chart.trim();
                
                // Render the diagram
                const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
                setSvg(renderedSvg);
                setError(null);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError(err.message);
            }
        };
        
        renderDiagram();
    }, [chart, initialized]);
    
    if (error) {
        return (
            <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                Failed to render diagram: {error}
            </div>
        );
    }
    
    return (
        <div 
            className="my-8 flex justify-center bg-white p-6 rounded-lg border border-slate-200 overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}