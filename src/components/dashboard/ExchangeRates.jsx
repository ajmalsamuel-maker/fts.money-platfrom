import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Settings, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Simulated exchange rates (in production, these would come from an API)
const defaultRates = {
    EUR: { rate: 0.9234, change: -0.12, name: 'Euro' },
    GBP: { rate: 0.7891, change: 0.08, name: 'British Pound' },
    JPY: { rate: 149.45, change: 0.34, name: 'Japanese Yen' },
    CHF: { rate: 0.8812, change: -0.05, name: 'Swiss Franc' },
    CAD: { rate: 1.3567, change: 0.15, name: 'Canadian Dollar' },
    AUD: { rate: 1.5234, change: -0.22, name: 'Australian Dollar' },
    CNY: { rate: 7.2456, change: 0.02, name: 'Chinese Yuan' },
    INR: { rate: 83.45, change: 0.18, name: 'Indian Rupee' },
    BRL: { rate: 4.9876, change: -0.35, name: 'Brazilian Real' },
    MXN: { rate: 17.234, change: 0.28, name: 'Mexican Peso' },
    SGD: { rate: 1.3412, change: -0.08, name: 'Singapore Dollar' },
    HKD: { rate: 7.8234, change: 0.01, name: 'Hong Kong Dollar' },
};

const currencyFlags = {
    EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CHF: '🇨🇭', CAD: '🇨🇦', 
    AUD: '🇦🇺', CNY: '🇨🇳', INR: '🇮🇳', BRL: '🇧🇷', MXN: '🇲🇽',
    SGD: '🇸🇬', HKD: '🇭🇰', USD: '🇺🇸'
};

export default function ExchangeRates({ selectedCurrencies = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'] }) {
    const [rates, setRates] = useState(defaultRates);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            // Simulate slight rate changes
            const updatedRates = { ...rates };
            Object.keys(updatedRates).forEach(key => {
                const variance = (Math.random() - 0.5) * 0.01;
                updatedRates[key] = {
                    ...updatedRates[key],
                    rate: parseFloat((updatedRates[key].rate * (1 + variance)).toFixed(4)),
                    change: parseFloat((Math.random() * 0.6 - 0.3).toFixed(2))
                };
            });
            setRates(updatedRates);
            setLastUpdated(new Date());
            setIsRefreshing(false);
        }, 800);
    };

    const displayCurrencies = selectedCurrencies.filter(c => rates[c]);

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">Exchange Rates</h3>
                        <p className="text-xs text-slate-500">Base: USD • Updated {lastUpdated.toLocaleTimeString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </Button>
                    <Link to={createPageUrl('Settings') + '?tab=currencies'}>
                        <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {displayCurrencies.map((currency) => {
                    const data = rates[currency];
                    const isPositive = data.change >= 0;
                    
                    return (
                        <div 
                            key={currency}
                            className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{currencyFlags[currency]}</span>
                                    <span className="font-medium text-slate-900">{currency}</span>
                                </div>
                                <Badge 
                                    variant="outline" 
                                    className={cn(
                                        "text-[10px] gap-0.5",
                                        isPositive ? "border-emerald-300 text-emerald-700" : "border-red-300 text-red-700"
                                    )}
                                >
                                    {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                                    {isPositive ? '+' : ''}{data.change}%
                                </Badge>
                            </div>
                            <p className="text-lg font-semibold text-slate-900">{data.rate.toFixed(4)}</p>
                            <p className="text-[10px] text-slate-500">{data.name}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-slate-500">Rates from XE.com</span>
                <a 
                    href="https://www.xe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                    View on XE.com
                    <ExternalLink className="h-3 w-3" />
                </a>
            </div>
        </Card>
    );
}