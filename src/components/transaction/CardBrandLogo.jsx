import React from 'react';

export default function CardBrandLogo({ brand, size = 'md' }) {
    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base'
    };

    const sizeClass = sizes[size] || sizes.md;

    const logos = {
        visa: (
            <div className={`flex items-center gap-2 bg-blue-600 text-white rounded-md font-bold ${sizeClass}`}>
                VISA
            </div>
        ),
        mastercard: (
            <div className={`flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-md font-bold ${sizeClass}`}>
                <div className="flex -space-x-1">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full opacity-80"></div>
                    <div className="w-2.5 h-2.5 bg-orange-400 rounded-full opacity-80"></div>
                </div>
                mastercard
            </div>
        ),
        amex: (
            <div className={`flex items-center gap-2 bg-blue-500 text-white rounded-md font-bold ${sizeClass}`}>
                AMEX
            </div>
        ),
        discover: (
            <div className={`flex items-center gap-2 bg-orange-600 text-white rounded-md font-bold ${sizeClass}`}>
                DISCOVER
            </div>
        ),
        jcb: (
            <div className={`flex items-center gap-2 bg-blue-700 text-white rounded-md font-bold ${sizeClass}`}>
                JCB
            </div>
        ),
        unionpay: (
            <div className={`flex items-center gap-2 bg-red-700 text-white rounded-md font-bold ${sizeClass}`}>
                <span className="text-xs">中国</span>
                UnionPay
            </div>
        ),
        'diners club': (
            <div className={`flex items-center gap-2 bg-slate-700 text-white rounded-md font-bold ${sizeClass}`}>
                DINERS
            </div>
        ),
        'american express': (
            <div className={`flex items-center gap-2 bg-blue-500 text-white rounded-md font-bold ${sizeClass}`}>
                AMEX
            </div>
        )
    };

    if (!brand) {
        return <span className="text-slate-400 text-sm">Unknown</span>;
    }

    return logos[brand.toLowerCase()] || (
        <div className={`flex items-center gap-2 bg-slate-100 text-slate-700 rounded-md font-medium ${sizeClass}`}>
            {brand.toUpperCase()}
        </div>
    );
}