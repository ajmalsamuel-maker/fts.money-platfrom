import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Reusable Error State Component
 * Consistent error handling across portals
 */
export default function ErrorState({ 
    title = 'Something went wrong',
    message = 'An error occurred while loading this content.',
    onRetry,
    variant = 'default' // 'default', 'destructive'
}) {
    return (
        <Alert variant={variant === 'destructive' ? 'destructive' : 'default'} className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold mb-2">{title}</AlertTitle>
            <AlertDescription className="mb-4">
                {message}
            </AlertDescription>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
            )}
        </Alert>
    );
}