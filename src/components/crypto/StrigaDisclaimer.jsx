import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function StrigaDisclaimer() {
    return (
        <div className="mt-8 border-t border-slate-200 pt-4">
            <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p>
                    <strong>Service Provider Notice:</strong> The crypto banking services, including wallet custody, 
                    virtual IBAN issuance, card programs, and fiat on/off-ramp facilities are provided by Striga 
                    Technology OÜ (Estonia VASP License FVT000290) in partnership with FTS.Money as an authorized 
                    technology distributor. FTS.Money acts as a platform aggregator and does not provide custody, 
                    banking, or financial services directly.
                </p>
            </div>
        </div>
    );
}