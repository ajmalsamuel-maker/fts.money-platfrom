import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Code } from 'lucide-react';
import { 
    transactionToISO8583, 
    parseISO8583Response,
    RESPONSE_CODES,
    MTI 
} from '@/components/utils/iso8583';

export default function ISO8583Encoder({ transaction }) {
    const [encoded, setEncoded] = useState(null);

    const handleEncode = () => {
        const message = transactionToISO8583(transaction);
        setEncoded(message);
    };

    if (!transaction) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4" />
                    ISO 8583 Message
                </CardTitle>
            </CardHeader>
            <CardContent>
                {!encoded ? (
                    <Button onClick={handleEncode} size="sm" variant="outline">
                        <Code className="h-4 w-4 mr-2" />
                        Generate ISO 8583 Message
                    </Button>
                ) : (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600">MTI:</span>
                            <Badge variant="outline" className="font-mono">{encoded.mti}</Badge>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-600">Bitmap:</span>
                            <pre className="mt-1 p-2 bg-slate-100 rounded text-xs font-mono overflow-x-auto">
                                {encoded.bitmap}
                            </pre>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-slate-600">Fields:</span>
                            <div className="mt-2 space-y-1">
                                {Object.entries(encoded.fields).map(([fieldNum, field]) => (
                                    <div key={fieldNum} className="flex gap-2 text-xs">
                                        <span className="font-mono text-slate-500 w-8">{fieldNum}:</span>
                                        <span className="font-medium">{field.name}:</span>
                                        <span className="font-mono text-slate-700">{field.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}