import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PSPPageWrapper from '@/components/layout/PSPPageWrapper';
import MerchantDashboardKPIs from '@/components/merchant-portal/MerchantDashboardKPIs';
import AdvancedTransactionSearch from '@/components/merchant-portal/AdvancedTransactionSearch';
import SettlementCalendar from '@/components/merchant-portal/SettlementCalendar';
import InvoiceGeneratorWidget from '@/components/merchant-portal/InvoiceGeneratorWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Activity, TrendingUp } from 'lucide-react';

export default function MerchantSelfServicePortal() {
  const [merchantId, setMerchantId] = useState(null);
  const [searchFilters, setSearchFilters] = useState(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('merchantSession') || '{}');
    setMerchantId(session.merchant_id);
  }, []);

  // Fetch merchant data
  const { data: merchant } = useQuery({
    queryKey: ['merchant', merchantId],
    queryFn: () => merchantId ? base44.entities.Merchant.filter({ merchant_id: merchantId }) : [],
    enabled: !!merchantId,
  });

  // Fetch transactions
  const { data: transactions } = useQuery({
    queryKey: ['transactions', merchantId, searchFilters],
    queryFn: () => merchantId ? base44.entities.Transaction.filter({ merchant_id: merchantId }) : [],
    enabled: !!merchantId,
  });

  // Fetch settlements
  const { data: settlements } = useQuery({
    queryKey: ['settlements', merchantId],
    queryFn: () => merchantId ? base44.entities.Settlement.filter({ merchant_id: merchantId }) : [],
    enabled: !!merchantId,
  });

  // Calculate KPIs
  const calculateMetrics = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalVolume: 0,
        volumeChange: 0,
        successRate: 0,
        successRateChange: 0,
        activeDisputes: 0,
        disputeChange: 0,
        pendingSettlement: 0,
        settlementChange: 0,
      };
    }

    const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const approved = transactions.filter(t => t.status === 'approved').length;
    const successRate = (approved / transactions.length) * 100;
    const pendingSettlement = settlements?.filter(s => s.status === 'pending').reduce((sum, s) => sum + (s.net_amount || 0), 0) || 0;

    return {
      totalVolume,
      volumeChange: 2.5,
      successRate,
      successRateChange: 1.2,
      activeDisputes: transactions.filter(t => t.status === 'disputed').length,
      disputeChange: -0.5,
      pendingSettlement,
      settlementChange: 0.8,
    };
  };

  const metrics = calculateMetrics();

  return (
    <PSPPageWrapper>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Merchant Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {merchant?.[0]?.business_name || 'Merchant'}</p>
        </div>

        {/* KPI Cards */}
        <MerchantDashboardKPIs metrics={metrics} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Search */}
            <AdvancedTransactionSearch onSearch={setSearchFilters} />

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions?.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{t.merchant_transaction_id}</p>
                        <p className="text-sm text-slate-600">{new Date(t.created_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${t.amount}</p>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          t.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Settlement Calendar */}
            <SettlementCalendar settlements={settlements} />

            {/* Invoice Generator */}
            <InvoiceGeneratorWidget merchantData={merchant?.[0]} transactions={transactions} />
          </div>
        </div>

        {/* Alerts Section */}
        {transactions?.some(t => t.status === 'disputed') && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700">
                You have {transactions.filter(t => t.status === 'disputed').length} disputed transaction(s) requiring attention.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PSPPageWrapper>
  );
}