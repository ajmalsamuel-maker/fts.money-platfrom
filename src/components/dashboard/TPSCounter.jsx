import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function TPSCounter() {
    const [currentTPS, setCurrentTPS] = useState(0);
    const [previousTPS, setPreviousTPS] = useState(0);
    const [peakTPS, setPeakTPS] = useState(0);
    const [avgTPS, setAvgTPS] = useState(0);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Simulate realistic TPS data
        const interval = setInterval(() => {
            const baseRate = 45;
            const variance = Math.random() * 30 - 15;
            const timeOfDay = new Date().getHours();
            const timeMultiplier = timeOfDay >= 9 && timeOfDay <= 18 ? 1.5 : 0.8;
            
            const newTPS = Math.max(5, Math.round((baseRate + variance) * timeMultiplier));
            
            setPreviousTPS(currentTPS);
            setCurrentTPS(newTPS);
            setPeakTPS(prev => Math.max(prev, newTPS));
            
            setHistory(prev => {
                const updated = [...prev, newTPS].slice(-60);
                const avg = updated.reduce((a, b) => a + b, 0) / updated.length;
                setAvgTPS(Math.round(avg));
                return updated;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [currentTPS]);

    const trend = currentTPS > previousTPS ? 'up' : currentTPS < previousTPS ? 'down' : 'stable';
    const trendPercent = previousTPS > 0 ? ((currentTPS - previousTPS) / previousTPS * 100).toFixed(1) : 0;

    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-cyan-600" />
                    </div>
                    <span className="font-medium text-slate-700">Live TPS</span>
                </div>
                <Badge 
                    variant="outline" 
                    className={cn(
                        "gap-1",
                        trend === 'up' && "border-emerald-300 text-emerald-700",
                        trend === 'down' && "border-red-300 text-red-700",
                        trend === 'stable' && "border-slate-300 text-slate-700"
                    )}
                >
                    {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {trend === 'stable' && <Minus className="h-3 w-3" />}
                    {trendPercent > 0 ? '+' : ''}{trendPercent}%
                </Badge>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-bold text-slate-900">{currentTPS}</span>
                <span className="text-slate-500">tx/sec</span>
            </div>

            {/* Mini Sparkline */}
            <div className="h-8 flex items-end gap-px mb-3">
                {history.slice(-30).map((val, i) => (
                    <div 
                        key={i}
                        className="flex-1 bg-cyan-400 rounded-t"
                        style={{ height: `${Math.min(100, (val / (peakTPS || 1)) * 100)}%` }}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-slate-500">Peak</p>
                    <p className="font-semibold text-slate-900">{peakTPS} tx/s</p>
                </div>
                <div>
                    <p className="text-slate-500">Avg (1min)</p>
                    <p className="font-semibold text-slate-900">{avgTPS} tx/s</p>
                </div>
            </div>
        </Card>
    );
}