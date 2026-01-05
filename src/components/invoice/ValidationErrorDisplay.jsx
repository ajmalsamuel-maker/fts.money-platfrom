import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, XCircle, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function ValidationErrorDisplay({ validation, onRetry, format }) {
    if (!validation) return null;

    const { valid, errors = [], warnings = [], validated_at } = validation;

    if (valid && errors.length === 0 && warnings.length === 0) {
        return (
            <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                    <strong>Validation Passed</strong> - Invoice is compliant with {format.toUpperCase()} standards
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="border-red-200 bg-red-50">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-red-900">
                    <div className="flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        Validation Failed - {errors.length} Error{errors.length !== 1 ? 's' : ''}, {warnings.length} Warning{warnings.length !== 1 ? 's' : ''}
                    </div>
                    {onRetry && (
                        <Button 
                            size="sm" 
                            variant="outline"
                            onClick={onRetry}
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Retry Validation
                        </Button>
                    )}
                </CardTitle>
                {validated_at && (
                    <p className="text-xs text-slate-600">
                        Last validated: {new Date(validated_at).toLocaleString()}
                    </p>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Errors */}
                {errors.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-red-900 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Critical Errors
                        </h4>
                        {errors.map((error, idx) => (
                            <Alert key={idx} variant="destructive" className="bg-white">
                                <AlertDescription>
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="destructive" className="text-xs">
                                                        {error.code}
                                                    </Badge>
                                                    <span className="font-medium text-red-900">
                                                        {error.message}
                                                    </span>
                                                </div>
                                                {error.field && (
                                                    <p className="text-xs text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">
                                                        Field: {error.field}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {(error.currentValue || error.expectedValue) && (
                                            <div className="text-xs space-y-1 bg-slate-50 p-2 rounded">
                                                {error.currentValue && (
                                                    <div>
                                                        <span className="font-semibold">Current: </span>
                                                        <code className="bg-red-100 text-red-800 px-1 py-0.5 rounded">
                                                            {error.currentValue}
                                                        </code>
                                                    </div>
                                                )}
                                                {error.expectedValue && (
                                                    <div>
                                                        <span className="font-semibold">Expected: </span>
                                                        <code className="bg-green-100 text-green-800 px-1 py-0.5 rounded">
                                                            {error.expectedValue}
                                                        </code>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {error.suggestion && (
                                            <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                                                <span className="font-semibold text-blue-900">💡 Suggestion: </span>
                                                <span className="text-blue-800">{error.suggestion}</span>
                                            </div>
                                        )}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Warnings */}
                {warnings.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Warnings
                        </h4>
                        {warnings.map((warning, idx) => (
                            <Alert key={idx} className="bg-amber-50 border-amber-200">
                                <AlertDescription>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className="bg-amber-100 text-amber-800 text-xs">
                                                    {warning.code}
                                                </Badge>
                                                <span className="font-medium text-amber-900">
                                                    {warning.message}
                                                </span>
                                            </div>
                                            {warning.field && (
                                                <p className="text-xs text-slate-600 font-mono bg-white px-2 py-1 rounded">
                                                    Field: {warning.field}
                                                </p>
                                            )}
                                            {warning.currentValue && (
                                                <p className="text-xs text-slate-600 mt-1">
                                                    Current value: <code className="bg-amber-100 px-1 py-0.5 rounded">{warning.currentValue}</code>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </AlertDescription>
                            </Alert>
                        ))}
                    </div>
                )}

                {/* Action Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Action Required</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Fix all {errors.length} critical error{errors.length !== 1 ? 's' : ''} before submission</li>
                        <li>Review {warnings.length} warning{warnings.length !== 1 ? 's' : ''} to ensure compliance</li>
                        <li>Use the suggestions provided to correct each issue</li>
                        <li>Click "Retry Validation" after making corrections</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}

export function ValidationSummaryBadge({ validation }) {
    if (!validation) {
        return <Badge variant="outline">Not Validated</Badge>;
    }

    const { valid, error_count = 0, warning_count = 0 } = validation;

    if (valid && error_count === 0) {
        return (
            <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Valid
            </Badge>
        );
    }

    if (error_count > 0) {
        return (
            <Badge className="bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" />
                {error_count} Error{error_count !== 1 ? 's' : ''}
            </Badge>
        );
    }

    if (warning_count > 0) {
        return (
            <Badge className="bg-amber-100 text-amber-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {warning_count} Warning{warning_count !== 1 ? 's' : ''}
            </Badge>
        );
    }

    return null;
}