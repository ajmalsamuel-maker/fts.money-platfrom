import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function QueryOptimizationAnalyzer() {
  const [queries, setQueries] = useState([
    {
      id: 1,
      query: 'SELECT * FROM transactions WHERE merchant_id = ?',
      executionTime: 245,
      optimization: 'Add index on merchant_id',
      potential_savings: '78%',
      status: 'warning'
    },
    {
      id: 2,
      query: 'SELECT * FROM merchants LEFT JOIN users',
      executionTime: 512,
      optimization: 'Missing JOIN condition',
      potential_savings: '92%',
      status: 'critical'
    },
    {
      id: 3,
      query: 'SELECT COUNT(*) FROM transactions',
      executionTime: 89,
      optimization: 'Use materialized view',
      potential_savings: '45%',
      status: 'info'
    },
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-orange-100 text-orange-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Slow Query Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {queries.map(query => (
            <div key={query.id} className="p-4 border rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <code className="text-xs bg-slate-100 p-2 rounded flex-1 font-mono overflow-x-auto">
                  {query.query}
                </code>
                <Badge className={getStatusColor(query.status)}>
                  {query.executionTime}ms
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Suggested Fix</p>
                  <p className="font-medium">{query.optimization}</p>
                </div>
                <div>
                  <p className="text-slate-600">Potential Savings</p>
                  <p className="font-bold text-green-600">{query.potential_savings}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 gap-2">
                {query.status === 'critical' ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Fix Now
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Apply
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}