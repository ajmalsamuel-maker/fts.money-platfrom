import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { cn } from "@/lib/utils";

const presetRanges = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Yesterday', getValue: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) },
    { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
    { label: 'Last Month', getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
];

export default function ReportFilters({ 
    dateRange, 
    onDateRangeChange, 
    merchant, 
    onMerchantChange, 
    merchants = [],
    provider,
    onProviderChange,
    providers = [],
    onReset
}) {
    return (
        <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-lg border mb-4">
            {/* Date Range */}
            <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Date Range</Label>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[130px] justify-start text-left font-normal", !dateRange?.from && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? format(dateRange.from, "MMM d, yyyy") : "Start date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateRange?.from}
                                onSelect={(date) => onDateRangeChange({ ...dateRange, from: date })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <span className="self-center text-slate-400">to</span>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-[130px] justify-start text-left font-normal", !dateRange?.to && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.to ? format(dateRange.to, "MMM d, yyyy") : "End date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={dateRange?.to}
                                onSelect={(date) => onDateRangeChange({ ...dateRange, to: date })}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Preset Buttons */}
            <div className="space-y-1.5">
                <Label className="text-xs text-slate-500">Quick Select</Label>
                <div className="flex gap-1 flex-wrap">
                    {presetRanges.map((preset) => (
                        <Button
                            key={preset.label}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => onDateRangeChange(preset.getValue())}
                        >
                            {preset.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Merchant Filter */}
            {merchants.length > 0 && (
                <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Merchant</Label>
                    <Select value={merchant || 'all'} onValueChange={onMerchantChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Merchants" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Merchants</SelectItem>
                            {merchants.map(m => (
                                <SelectItem key={m.id} value={m.id}>{m.business_name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Provider Filter */}
            {providers.length > 0 && (
                <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">Provider</Label>
                    <Select value={provider || 'all'} onValueChange={onProviderChange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Providers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Providers</SelectItem>
                            {providers.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Reset */}
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
                <RotateCcw className="h-3 w-3" />
                Reset
            </Button>
        </div>
    );
}