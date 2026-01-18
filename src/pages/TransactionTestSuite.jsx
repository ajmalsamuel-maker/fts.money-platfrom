import React, { useState } from 'react';
import PlatformLayout from '@/components/platform/PlatformLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Loader2, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function TransactionTestSuite() {
  const [testData, setTestData] = useState({
    merchant_id: '',
    amount: 100,
    currency: 'USD',
    payment_method: 'visa',
    card_number: '4111111111111111',
  });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTransactionTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await base44.functions.invoke('processPayment', {
        merchant_id: testData.merchant_id,
        amount: testData.amount,
        currency: testData.currency,
        payment_method: testData.payment_method,
        card_number: testData.card_number,
        card_last_four: testData.card_number.slice(-4),
        customer_email: 'test@example.com',
        type: 'sale',
      });

      setTestResult({
        success: response.data.success,
        transaction_id: response.data.transaction_id,
        status: response.data.status,
        message: response.data.message || 'Transaction processed',
        details: response.data,
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        error: true,
      });
    } finally {
      setTesting(false);
    }
  };

  const testScenarios = [
    { name: 'Successful Payment', amount: 100, expected: 'approved' },
    { name: 'Declined Payment', amount: 5001, expected: 'declined' },
    { name: 'Fraud Detection', amount: 10000, expected: 'fraud_review' },
    { name: 'Insufficient Funds', amount: 9999, expected: 'declined' },
  ];

  return (
    <PlatformLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction Test Suite</h1>
          <p className="text-slate-600 mt-1">Test end-to-end payment processing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Merchant ID</Label>
                <Input
                  value={testData.merchant_id}
                  onChange={(e) => setTestData({ ...testData, merchant_id: e.target.value })}
                  placeholder="Enter merchant ID"
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={testData.amount}
                  onChange={(e) => setTestData({ ...testData, amount: parseFloat(e.target.value) })}
                />
              </div>

              <div>
                <Label>Currency</Label>
                <Select value={testData.currency} onValueChange={(val) => setTestData({ ...testData, currency: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Method</Label>
                <Select value={testData.payment_method} onValueChange={(val) => setTestData({ ...testData, payment_method: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visa">Visa</SelectItem>
                    <SelectItem value="mastercard">Mastercard</SelectItem>
                    <SelectItem value="amex">American Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Test Card Number</Label>
                <Input
                  value={testData.card_number}
                  onChange={(e) => setTestData({ ...testData, card_number: e.target.value })}
                  placeholder="4111111111111111"
                />
              </div>

              <Button onClick={runTransactionTest} disabled={testing || !testData.merchant_id} className="w-full">
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Test Transaction
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Test Result */}
          <Card>
            <CardHeader>
              <CardTitle>Test Result</CardTitle>
            </CardHeader>
            <CardContent>
              {!testResult ? (
                <div className="text-center py-12 text-slate-500">
                  <p>Run a test transaction to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg">
                    {testResult.success ? (
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {testResult.success ? 'Transaction Successful' : 'Transaction Failed'}
                      </p>
                      <p className="text-sm text-slate-600">{testResult.message}</p>
                    </div>
                  </div>

                  {testResult.transaction_id && (
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-sm font-medium">Transaction ID</p>
                      <p className="font-mono text-xs mt-1">{testResult.transaction_id}</p>
                    </div>
                  )}

                  {testResult.status && (
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-sm font-medium">Status</p>
                      <Badge className="mt-1">{testResult.status}</Badge>
                    </div>
                  )}

                  {testResult.details && (
                    <div className="p-3 bg-slate-50 rounded">
                      <p className="text-sm font-medium mb-2">Response Details</p>
                      <pre className="text-xs overflow-auto">
                        {JSON.stringify(testResult.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle>Common Test Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {testScenarios.map((scenario) => (
                <div key={scenario.name} className="p-4 border rounded-lg">
                  <p className="font-medium">{scenario.name}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Amount: ${scenario.amount} → Expected: {scenario.expected}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlatformLayout>
  );
}