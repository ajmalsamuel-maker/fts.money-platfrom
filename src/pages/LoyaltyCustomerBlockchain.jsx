import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import CustomerPortalSidebar from '@/components/loyalty/CustomerPortalSidebar';
import BlockchainConfigManager from '@/components/loyalty/BlockchainConfigManager';
import { Menu } from 'lucide-react';

export default function LoyaltyCustomerBlockchain() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const sessionData = localStorage.getItem('loyalty_customer_session');
    if (!sessionData) {
        window.location.href = '/LoyaltyCustomerLogin';
        return null;
    }

    const customer = JSON.parse(sessionData);

    const { data: programs = [] } = useQuery({
        queryKey: ['loyalty-programs', customer.admin_email],
        queryFn: () => base44.entities.LoyaltyProgram.filter({ admin_email: customer.admin_email })
    });

    return (
        <div className="flex min-h-screen bg-slate-50">
            <CustomerPortalSidebar 
                customer={customer}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />
            
            <div className="flex-1">
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 md:hidden">
                    <button onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6 max-w-6xl mx-auto space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Blockchain Infrastructure</h1>
                        <p className="text-slate-600 mt-1">Manage your dedicated permissioned blockchain</p>
                    </div>

                    <BlockchainConfigManager 
                        customerId={customer.id}
                        customerName={customer.organization_name}
                    />

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="font-semibold text-blue-900 mb-3">About Your Blockchain</h3>
                        <div className="space-y-2 text-sm text-blue-800">
                            <p>✓ <strong>Isolated Network:</strong> Your own private blockchain instance</p>
                            <p>✓ <strong>Gas-Free Transactions:</strong> Meta-transaction relay covers all gas costs</p>
                            <p>✓ <strong>Role-Based Access:</strong> Fine-grained permissions for minting/burning tokens</p>
                            <p>✓ <strong>Dedicated Validators:</strong> 4 validator nodes ensuring security and uptime</p>
                            <p>✓ <strong>Private RPC:</strong> Direct access to your chain via dedicated endpoints</p>
                            <p>✓ <strong>Block Explorer:</strong> Monitor all transactions in real-time</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}