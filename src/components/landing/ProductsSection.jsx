import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
    CreditCard, 
    Building2, 
    Wallet, 
    Smartphone, 
    Globe, 
    BadgeCheck,
    ArrowRight 
} from 'lucide-react';

const products = [
    {
        icon: CreditCard,
        title: "White Label Payment Gateway",
        description: "Customize your payment gateway with ease and flexibility. Full control over branding and features.",
        gradient: "from-blue-600 to-cyan-500",
        bgGradient: "from-blue-50 to-cyan-50",
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop"
    },
    {
        icon: Building2,
        title: "Acquirer Processing",
        description: "Efficient and secure processing for acquirers worldwide. Handle millions of transactions seamlessly.",
        gradient: "from-purple-600 to-indigo-500",
        bgGradient: "from-purple-50 to-indigo-50",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop"
    },
    {
        icon: Wallet,
        title: "Issuer Processing",
        description: "Simplify card issuing with tailored processing solutions. From virtual cards to physical ones.",
        gradient: "from-emerald-600 to-teal-500",
        bgGradient: "from-emerald-50 to-teal-50",
        image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop"
    },
    {
        icon: Smartphone,
        title: "Digital Banking Platform",
        description: "Launch your digital bank with a powerful and scalable platform. Mobile-first approach.",
        gradient: "from-orange-600 to-amber-500",
        bgGradient: "from-orange-50 to-amber-50",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop"
    },
    {
        icon: Globe,
        title: "Payment Acquiring",
        description: "Accept payments globally with a seamless acquiring solution. 300+ payment methods supported.",
        gradient: "from-pink-600 to-rose-500",
        bgGradient: "from-pink-50 to-rose-50",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
    },
    {
        icon: BadgeCheck,
        title: "BIN Sponsorship",
        description: "Empower your business with BIN sponsorship and card issuing. Go to market faster.",
        gradient: "from-violet-600 to-purple-500",
        bgGradient: "from-violet-50 to-purple-50",
        image: "https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=400&h=300&fit=crop"
    }
];

export default function ProductsSection() {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-600 text-sm font-medium mb-4">
                        Our Products
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Innovative Services,
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            Exceptional Support
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                        Comprehensive suite of payment solutions designed for fintechs, banks, and enterprises.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500"
                        >
                            {/* Image */}
                            <div className={`relative h-48 bg-gradient-to-br ${product.bgGradient} overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10" />
                                <img 
                                    src={product.image} 
                                    alt={product.title}
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className={`absolute top-4 left-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${product.gradient} flex items-center justify-center shadow-lg z-20`}>
                                    <product.icon className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {product.title}
                                </h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    {product.description}
                                </p>
                                <Button variant="ghost" className="p-0 h-auto text-blue-600 hover:text-blue-700 font-medium group/btn">
                                    Learn more 
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}