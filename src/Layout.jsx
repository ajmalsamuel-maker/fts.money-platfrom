import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-[#F5F8FF]">
            <style>{`
                :root {
                    --fts-navy: #000044;
                    --fts-royal-blue: #003EFF;
                    --fts-aqua: #54F0E4;
                    --fts-sky: #99C1FC;
                    --fts-sea-foam: #C4F3EF;
                    --fts-mist: #F5F8FF;
                }
            `}</style>
            {children}
        </div>
    );
}