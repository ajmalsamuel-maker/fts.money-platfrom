import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Smart Prefetching Hook
 * Prefetches likely next destinations based on current page
 */
export function usePrefetchData(currentPage) {
    const queryClient = useQueryClient();

    useEffect(() => {
        const prefetchMap = {
            // Community Portal
            'CommunityPortalDashboard': [
                ['my-psp-instances'],
                ['active-services'],
                ['my-subscriptions']
            ],
            'MyPSPInstances': [
                ['active-services'],
                ['subscriptions']
            ],
            
            // Platform Admin
            'FTSMoneyPlatform': [
                ['provisioned-psps'],
                ['payment-providers'],
                ['payout-routes']
            ],
            
            // PSP Portal
            'Dashboard': [
                ['transactions'],
                ['merchants'],
                ['balances']
            ],
            
            // Merchant Portal
            'MerchantDashboard': [
                ['merchant-transactions'],
                ['merchant-customers']
            ]
        };

        const queryKeys = prefetchMap[currentPage];
        if (!queryKeys) return;

        // Prefetch in background
        queryKeys.forEach(([key, ...args]) => {
            queryClient.prefetchQuery({
                queryKey: [key, ...args],
                queryFn: () => {
                    // Define prefetch functions based on key
                    switch (key) {
                        case 'my-psp-instances':
                            return base44.entities.ProvisionedPSP.list();
                        case 'transactions':
                            return base44.entities.Transaction.list('-created_date', 50);
                        case 'merchants':
                            return base44.entities.Merchant.list();
                        // Add more as needed
                        default:
                            return Promise.resolve([]);
                    }
                },
                staleTime: 30000 // 30 seconds
            });
        });
    }, [currentPage, queryClient]);
}