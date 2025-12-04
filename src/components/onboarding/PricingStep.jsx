import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import MerchantPricingForm from '@/components/merchants/MerchantPricingForm';
import { AlertCircle } from 'lucide-react';

export default function PricingStep({ data, onChange, errors }) {
    const { data: processors = [] } = useQuery({
        queryKey: ['payment-processors'],
        queryFn: () => base44.entities.PaymentProcessor.list(),
    });

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Pricing Configuration</h2>
                <p className="text-slate-500">Define the charging model for this merchant including transaction fees, payment method pricing, and connector markups.</p>
            </div>

            <MerchantPricingForm 
                data={data} 
                onChange={onChange}
                connectors={processors}
                errors={errors}
            />

            {errors?.pricing && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.pricing}
                </p>
            )}
        </div>
    );
}