import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Reusable Empty State Component
 * Consistent empty states across all portals
 */
export default function EmptyState({ 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    onAction,
    secondaryActionLabel,
    onSecondaryAction 
}) {
    return (
        <Card className="border-2 border-dashed border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
                {Icon && (
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Icon className="h-8 w-8 text-slate-400" />
                    </div>
                )}
                {title && <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>}
                {description && <p className="text-sm text-slate-600 mb-6 max-w-md">{description}</p>}
                {(actionLabel || secondaryActionLabel) && (
                    <div className="flex gap-3">
                        {actionLabel && onAction && (
                            <Button onClick={onAction} className="bg-gradient-to-r from-blue-600 to-cyan-500">
                                {actionLabel}
                            </Button>
                        )}
                        {secondaryActionLabel && onSecondaryAction && (
                            <Button onClick={onSecondaryAction} variant="outline">
                                {secondaryActionLabel}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}