import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export default function ErrorCodeReference() {
  const [searchTerm, setSearchTerm] = useState('');

  const errorCodes = [
    {
      code: '400',
      name: 'Bad Request',
      description: 'The request is malformed or missing required parameters.',
      solution: 'Check your request parameters and ensure all required fields are provided.'
    },
    {
      code: '401',
      name: 'Unauthorized',
      description: 'Invalid or missing authentication credentials.',
      solution: 'Verify your API key and ensure it\'s correctly included in the Authorization header.'
    },
    {
      code: '403',
      name: 'Forbidden',
      description: 'The request is valid but you don\'t have permission to access this resource.',
      solution: 'Check your account permissions or contact support.'
    },
    {
      code: '404',
      name: 'Not Found',
      description: 'The requested resource does not exist.',
      solution: 'Verify the endpoint URL and resource ID are correct.'
    },
    {
      code: '429',
      name: 'Rate Limited',
      description: 'You\'ve exceeded the API rate limit.',
      solution: 'Wait before making more requests or upgrade your plan for higher limits.'
    },
    {
      code: '500',
      name: 'Internal Server Error',
      description: 'An unexpected error occurred on the server.',
      solution: 'Retry the request or contact support if the issue persists.'
    },
    {
      code: 'TXN_001',
      name: 'Invalid Amount',
      description: 'Transaction amount is invalid or zero.',
      solution: 'Provide a valid positive amount for the transaction.'
    },
    {
      code: 'TXN_002',
      name: 'Invalid Currency',
      description: 'The specified currency code is not supported.',
      solution: 'Use a valid ISO 4217 currency code (e.g., USD, EUR, GBP).'
    },
    {
      code: 'MER_001',
      name: 'Merchant Not Found',
      description: 'The merchant ID does not exist.',
      solution: 'Verify your merchant ID and ensure your account is active.'
    },
    {
      code: 'MID_001',
      name: 'MID Not Active',
      description: 'The Merchant ID (MID) is not active for processing.',
      solution: 'Contact support to activate your MID.'
    },
  ];

  const filteredCodes = errorCodes.filter(e =>
    e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (code) => {
    if (code.startsWith('4')) return 'bg-yellow-100 text-yellow-800';
    if (code.startsWith('5')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Code Reference</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search error codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredCodes.map(error => (
            <div key={error.code} className="p-4 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(error.code)}>
                    {error.code}
                  </Badge>
                  <h4 className="font-medium">{error.name}</h4>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-2">{error.description}</p>
              <div className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                <p className="font-medium text-blue-900 mb-1">Solution:</p>
                <p className="text-blue-800">{error.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}