import React from 'react';
import { motion } from 'framer-motion';

const partners = [
    { name: 'Visa', color: '#1A1F71' },
    { name: 'Mastercard', color: '#EB001B' },
    { name: 'Stripe', color: '#635BFF' },
    { name: 'PayPal', color: '#003087' },
    { name: 'Apple Pay', color: '#000000' },
    { name: 'Google Pay', color: '#4285F4' },
    { name: 'Klarna', color: '#FFB3C7' },
    { name: 'Adyen', color: '#0ABF53' },
    { name: 'Alipay', color: '#1677FF' },
    { name: 'UnionPay', color: '#D02127' },
];

export default function PartnersCarousel() {
    return (
        <section className="py-16 bg-white border-y border-slate-100">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider mb-10"
                >
                    Trusted Payment Integrations — Global Names, Local Reach
                </motion.p>
                
                <div className="relative overflow-hidden">
                    {/* Gradient Masks */}
                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
                    
                    <motion.div 
                        className="flex gap-12"
                        animate={{ x: [0, -1200] }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        {[...partners, ...partners, ...partners].map((partner, idx) => (
                            <div 
                                key={idx}
                                className="flex-shrink-0 flex items-center justify-center w-32 h-16 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <span 
                                    className="font-bold text-lg"
                                    style={{ color: partner.color }}
                                >
                                    {partner.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}