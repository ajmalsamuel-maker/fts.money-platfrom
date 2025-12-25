import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reusable Loading State Component
 * Options: spinner, skeleton, or custom
 */
export default function LoadingState({ 
    type = 'spinner', // 'spinner', 'skeleton', 'custom'
    message = 'Loading...',
    rows = 3,
    children
}) {
    if (type === 'spinner') {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                <p className="text-sm text-slate-600">{message}</p>
            </div>
        );
    }

    if (type === 'skeleton') {
        return (
            <Card>
                <CardContent className="p-6 space-y-3">
                    {Array.from({ length: rows }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (type === 'custom' && children) {
        return <>{children}</>;
    }

    return null;
}