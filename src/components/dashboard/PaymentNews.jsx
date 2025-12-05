import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, ExternalLink, RefreshCw, Clock, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";

// Simulated news data based on real ThePaypers headlines
const newsData = [
    {
        id: 1,
        title: "ACI Worldwide study shows growing payments modernisation gap",
        category: "Payments",
        source: "The Paypers",
        time: "10:00",
        url: "https://thepaypers.com/payments/news/aci-worldwide-study-shows-growing-payments-modernisation-gap",
        trending: true
    },
    {
        id: 2,
        title: "Fi911 launches ResolveLab for payment facilitator dispute tools",
        category: "Fraud & Fincrime",
        source: "The Paypers",
        time: "10:09",
        url: "https://thepaypers.com/fraud-and-fincrime/news/fi911-launches-resolvelab-for-payment-facilitator-dispute-tools"
    },
    {
        id: 3,
        title: "Nexus closes USD 700 million funding round",
        category: "Fintech",
        source: "The Paypers",
        time: "08:59",
        url: "https://thepaypers.com/fintech/news/nexus-closes-usd-700-million-funding-round",
        trending: true
    },
    {
        id: 4,
        title: "ClearBank and Plaid drive faster Pay by Bank experiences",
        category: "Fintech",
        source: "The Paypers",
        time: "08:56",
        url: "https://thepaypers.com/fintech/news/clearbank-and-plaid-drive-faster-pay-by-bank-experiences"
    },
    {
        id: 5,
        title: "Bolt launches Bolt ID to help counter synthetic fraud crisis",
        category: "Fraud & Fincrime",
        source: "The Paypers",
        time: "07:43",
        url: "https://thepaypers.com/fraud-and-fincrime/news/bolt-launches-bolt-id-to-help-counter-synthetic-fraud-crisis"
    },
    {
        id: 6,
        title: "Trulioo joins Google's Agent Payments Protocol",
        category: "Fraud & Fincrime",
        source: "The Paypers",
        time: "09:10",
        url: "https://thepaypers.com/fraud-and-fincrime/news/trulioo-joins-googles-agent-payments-protocol"
    },
    {
        id: 7,
        title: "Cumbuca unveils fast-track access to Brazil's payments market",
        category: "Payments",
        source: "The Paypers",
        time: "Yesterday",
        url: "https://thepaypers.com/payments/news/cumbuca-unveils-fast-track-access-to-brazils-payments-market"
    },
    {
        id: 8,
        title: "Doccle makes first Wero payment in Europe",
        category: "Payments",
        source: "The Paypers",
        time: "Yesterday",
        url: "https://thepaypers.com/payments/news/doccle-makes-first-wero-payment-in-europe"
    }
];

const categoryColors = {
    "Payments": "bg-blue-100 text-blue-700",
    "Fintech": "bg-purple-100 text-purple-700",
    "Fraud & Fincrime": "bg-red-100 text-red-700",
    "Crypto": "bg-amber-100 text-amber-700",
    "M&A": "bg-emerald-100 text-emerald-700"
};

export default function PaymentNews() {
    const [news, setNews] = useState(newsData);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            // Shuffle news slightly to simulate refresh
            setNews([...newsData].sort(() => Math.random() - 0.5));
            setIsRefreshing(false);
        }, 1000);
    };

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Newspaper className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Payment News</h3>
                        <p className="text-xs text-slate-500">Top stories from The Paypers</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto">
                {news.slice(0, 6).map((item) => (
                    <a 
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge className={cn("text-[10px]", categoryColors[item.category] || "bg-slate-100 text-slate-700")}>
                                        {item.category}
                                    </Badge>
                                    {item.trending && (
                                        <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-600 gap-1">
                                            <TrendingUp className="h-2.5 w-2.5" /> Trending
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug">
                                    {item.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{item.time}</span>
                                    <span>•</span>
                                    <span>{item.source}</span>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0 mt-1" />
                        </div>
                    </a>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t">
                <a 
                    href="https://thepaypers.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                    View all news on The Paypers
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </Card>
    );
}