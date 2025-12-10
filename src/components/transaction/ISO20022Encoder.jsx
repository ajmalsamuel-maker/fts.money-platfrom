import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Code } from 'lucide-react';
import { 
    transactionToISO20022,
    MESSAGE_TYPES 
} from '@/components/utils/iso20022';

export default function ISO20022Encoder({ transaction }) {
    const [encoded, setEncoded] = useState(null);
    const [messageType, setMessageType] = useState('pacs.008');

    const handleEncode = () => {
        const message = transactionToISO20022(transaction, messageType);
        setEncoded(message);
    };

    if (!transaction) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    ISO 20022 Message
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600">Message Type:</span>
                        <select
                            value={messageType}
                            onChange={(e) => setMessageType(e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                        >
                            <option value="pacs.008">pacs.008 - Credit Transfer</option>
                            <option value="pain.001">pain.001 - Payment Initiation</option>
                        </select>
                    </div>

                    {!encoded ? (
                        <Button onClick={handleEncode} size="sm" variant="outline">
                            <Code className="h-4 w-4 mr-2" />
                            Generate ISO 20022 Message
                        </Button>
                    ) : (
                        <div>
                            <pre className="p-3 bg-slate-100 rounded text-xs overflow-x-auto max-h-96">
                                {JSON.stringify(encoded, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}