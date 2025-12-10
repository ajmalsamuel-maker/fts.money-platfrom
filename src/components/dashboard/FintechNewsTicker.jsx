import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, ExternalLink } from 'lucide-react';

export default function FintechNewsTicker() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
        // Refresh every 6 hours
        const interval = setInterval(fetchNews, 6 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            
            const sources = [
                'https://finovate.com/',
                'https://www.fintechnexus.com/',
                'https://www.finextra.com/',
                'https://thepaypers.com/'
            ];

            const allHeadlines = [];
            
            // Shuffle sources for variety
            const shuffledSources = [...sources].sort(() => Math.random() - 0.5);
            
            for (const url of shuffledSources) {
                try {
                    const response = await base44.integrations.Core.InvokeLLM({
                        prompt: `Extract the latest fintech news headlines from this website. Return a JSON array of objects with 'title' and 'url' fields. Only return the top 5 most recent headlines. Make sure the URLs are complete and valid.`,
                        add_context_from_internet: true,
                        response_json_schema: {
                            type: "object",
                            properties: {
                                headlines: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            title: { type: "string" },
                                            url: { type: "string" }
                                        }
                                    }
                                }
                            }
                        }
                    });

                    if (response.headlines) {
                        allHeadlines.push(...response.headlines.map(h => ({
                            ...h,
                            source: new URL(url).hostname.replace('www.', '')
                        })));
                    }
                } catch (err) {
                    console.error(`Failed to fetch from ${url}:`, err);
                }
            }
            
            // Shuffle all headlines for variety
            const shuffledHeadlines = allHeadlines.sort(() => Math.random() - 0.5);

            // Remove duplicates based on title similarity
            const uniqueHeadlines = [];
            const seenTitles = new Set();
            
            for (const headline of shuffledHeadlines) {
                const normalizedTitle = headline.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (!seenTitles.has(normalizedTitle)) {
                    seenTitles.add(normalizedTitle);
                    uniqueHeadlines.push(headline);
                }
            }

            setNews(uniqueHeadlines.slice(0, 20)); // Show top 20 unique headlines
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch news:', error);
            setLoading(false);
        }
    };

    if (loading && news.length === 0) {
        return (
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-4 overflow-hidden">
                <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 animate-pulse" />
                    <span>Loading fintech news...</span>
                </div>
            </div>
        );
    }

    if (news.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white py-3 overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center">
                <div className="flex items-center gap-2 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-r-full mr-4 flex-shrink-0">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-semibold text-sm">FINTECH NEWS</span>
                </div>
                
                <div className="flex-1 overflow-hidden">
                    <div className="animate-ticker flex gap-8 whitespace-nowrap">
                        {/* Duplicate the news items for seamless loop */}
                        {[...news, ...news].map((item, index) => (
                            <a
                                key={index}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 hover:text-yellow-300 transition-colors group"
                            >
                                <span className="text-xs font-medium opacity-60">{item.source}</span>
                                <span className="text-sm font-medium">{item.title}</span>
                                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="mx-2 text-yellow-300">•</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes ticker {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                .animate-ticker {
                    animation: ticker 120s linear infinite;
                }
                .animate-ticker:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}