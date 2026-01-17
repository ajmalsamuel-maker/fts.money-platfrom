import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Filter } from 'lucide-react';

export default function AdvancedTransactionSearch({ onSearch }) {
  const [filters, setFilters] = useState({
    transactionId: '',
    status: 'all',
    paymentMethod: 'all',
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      transactionId: '',
      status: 'all',
      paymentMethod: 'all',
      amountMin: '',
      amountMax: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const activeFilters = Object.values(filters).filter(v => v && v !== 'all').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Advanced Transaction Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Transaction ID"
            value={filters.transactionId}
            onChange={(e) => handleFilterChange('transactionId', e.target.value)}
          />
          
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.paymentMethod} onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="number"
            placeholder="Min Amount"
            value={filters.amountMin}
            onChange={(e) => handleFilterChange('amountMin', e.target.value)}
          />

          <Input
            type="number"
            placeholder="Max Amount"
            value={filters.amountMax}
            onChange={(e) => handleFilterChange('amountMax', e.target.value)}
          />

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />

          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>

        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
            <Button onClick={handleReset} variant="outline">
              Reset
            </Button>
          </div>
          {activeFilters > 0 && (
            <Badge variant="secondary">{activeFilters} active filter{activeFilters !== 1 ? 's' : ''}</Badge>
          )}
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}