import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function WebhookTester() {
  const [webhookUrl, setWebhookUrl] = useState('https://your-domain.com/webhooks');
  const [eventType, setEventType] = useState('transaction.completed');
  const [payload, setPayload] = useState(JSON.stringify({
    event: 'transaction.completed',
    data: {
      transaction_id: 'txn_abc123',
      amount: 100,
      currency: 'USD',
      status: 'completed'
    }
  }, null, 2));
  const [testResults, setTestResults] = useState([]);

  const eventTypes = [
    'transaction.completed',
    'transaction.failed',
    'payment.received',
    'settlement.processed',
    'dispute.opened',
    'refund.issued',
  ];

  const handleTestWebhook = async () => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      // Simulate webhook test
      await new Promise(r => setTimeout(r, 800));
      setTestResults(prev => [{
        id: Date.now(),
        timestamp,
        event: eventType,
        status: 'success',
        statusCode: 200,
        responseTime: '234ms'
      }, ...prev].slice(0, 10));
    } catch (error) {
      setTestResults(prev => [{
        id: Date.now(),
        timestamp,
        event: eventType,
        status: 'failed',
        statusCode: 500,
        responseTime: '1200ms',
        error: error.message
      }, ...prev].slice(0, 10));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Config */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Webhook URL</label>
              <Input
                placeholder="https://your-domain.com/webhooks"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <Button onClick={handleTestWebhook} className="w-full gap-2">
              <Send className="w-4 h-4" />
              Send Test Webhook
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payload & Results */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payload</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              className="font-mono text-xs h-32"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test History</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No tests yet</p>
            ) : (
              <div className="space-y-2">
                {testResults.map(result => (
                  <div key={result.id} className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                    {result.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{result.event}</p>
                      <p className="text-xs text-slate-600">{result.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {result.statusCode}
                      </Badge>
                      <p className="text-xs text-slate-600 mt-1">{result.responseTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}