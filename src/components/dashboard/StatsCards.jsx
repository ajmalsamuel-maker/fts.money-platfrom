import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCards({ stats }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <Card key={idx} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            {stat.change && (
                                <div className={cn(
                                    "flex items-center gap-1 mt-2 text-sm font-medium",
                                    stat.changeType === 'positive' ? "text-emerald-600" : "text-red-600"
                                )}>
                                    {stat.changeType === 'positive' ? (
                                        <TrendingUp className="h-4 w-4" />
                                    ) : (
                                        <TrendingDown className="h-4 w-4" />
                                    )}
                                    {stat.change}
                                    <span className="text-slate-400 font-normal ml-1">vs last period</span>
                                </div>
                            )}
                        </div>
                        <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            stat.bgColor || "bg-blue-50"
                        )}>
                            <stat.icon className={cn("h-6 w-6", stat.iconColor || "text-blue-600")} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}