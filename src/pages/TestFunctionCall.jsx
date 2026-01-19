import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function TestFunctionCall() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTest = async () => {
        setLoading(true);
        try {
            const response = await base44.functions.invoke('testImports', {});
            setResult(response.data);
        } catch (error) {
            setResult({ error: error.message });
        }
        setLoading(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Function Call</h1>
            <Button onClick={handleTest} disabled={loading}>
                {loading ? 'Testing...' : 'Test testImports Function'}
            </Button>
            {result && (
                <pre className="mt-4 p-4 bg-gray-100 rounded">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    );
}