import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Copy, Clock } from 'lucide-react';

export default function APITestConsole() {
  const [method, setMethod] = useState('POST');
  const [endpoint, setEndpoint] = useState('/api/transactions');
  const [headers, setHeaders] = useState('Content-Type: application/json\nAuthorization: Bearer YOUR_API_KEY');
  const [body, setBody] = useState(JSON.stringify({ amount: 100, currency: 'USD' }, null, 2));
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState(null);

  const handleSendRequest = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));
      setStatusCode(200);
      setResponse({
        success: true,
        transaction_id: 'txn_' + Math.random().toString(36).substr(2, 9),
        amount: 100,
        currency: 'USD',
        status: 'completed',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setStatusCode(500);
      setResponse({ error: error.message });
    }
    setLoading(false);
  };

  const getStatusColor = (code) => {
    if (code >= 200 && code < 300) return 'bg-green-100 text-green-800';
    if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-800';
    if (code >= 500) return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Request Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Request Builder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="/api/endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="flex-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Headers</label>
            <Textarea
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="font-mono text-xs h-24"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Body</label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono text-xs h-32"
            />
          </div>

          <Button
            onClick={handleSendRequest}
            disabled={loading}
            className="w-full gap-2"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Sending...' : 'Send Request'}
          </Button>
        </CardContent>
      </Card>

      {/* Response Viewer */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Response</CardTitle>
            {statusCode && (
              <Badge className={getStatusColor(statusCode)}>
                {statusCode}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!response ? (
            <p className="text-slate-500 text-center py-8">No response yet</p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Response Time: 1.2s</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(response, null, 2))}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
              </div>
              <div className="bg-slate-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-64">
                <pre>{JSON.stringify(response, null, 2)}</pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}