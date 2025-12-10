import React from 'react';
import { Badge } from "@/components/ui/badge";
import { 
    CheckCircle, 
    AlertCircle, 
    Shield, 
    XCircle 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { getISOComplianceScore } from '@/components/utils/isoValidator';

export default function ISOComplianceBadge({ transaction, showScore = false, size = "default" }) {
    const score = getISOComplianceScore(transaction);
    
    const getConfig = () => {
        if (score === 100) {
            return {
                icon: CheckCircle,
                label: 'ISO Compliant',
                className: 'bg-green-100 text-green-700 border-green-300',
                description: 'Fully compliant with all ISO standards'
            };
        } else if (score >= 75) {
            return {
                icon: Shield,
                label: 'Mostly Compliant',
                className: 'bg-blue-100 text-blue-700 border-blue-300',
                description: 'Meets most ISO standards requirements'
            };
        } else if (score >= 50) {
            return {
                icon: AlertCircle,
                label: 'Partial Compliance',
                className: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                description: 'Some ISO standards not met'
            };
        } else {
            return {
                icon: XCircle,
                label: 'Non-Compliant',
                className: 'bg-red-100 text-red-700 border-red-300',
                description: 'Does not meet ISO standards'
            };
        }
    };

    const config = getConfig();
    const Icon = config.icon;
    const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant="outline" className={cn(config.className, sizeClass)}>
                        <Icon className={cn("mr-1", size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
                        {showScore ? `${score}%` : config.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="space-y-1">
                        <p className="font-semibold">{config.description}</p>
                        <p className="text-xs">Compliance Score: {score}%</p>
                        <div className="text-xs text-slate-500 mt-2">
                            <p>Standards checked:</p>
                            <ul className="list-disc ml-4">
                                <li>ISO 4217 (Currency)</li>
                                <li>ISO 3166-1 (Country)</li>
                                {transaction.crypto_asset && (
                                    <>
                                        <li>ISO 23257 (Blockchain)</li>
                                        <li>ISO 24165 (DTI)</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}