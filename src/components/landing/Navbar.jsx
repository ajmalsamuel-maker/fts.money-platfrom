import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { 
    CreditCard, 
    ChevronDown, 
    Menu, 
    X,
    Building2,
    Wallet,
    Smartphone,
    Globe,
    BadgeCheck,
    BookOpen,
    FileCode,
    Headphones
} from 'lucide-react';

const navItems = [
    { 
        label: 'Products', 
        hasDropdown: true,
        items: [
            { icon: CreditCard, label: 'Payment Gateway', desc: 'White-label solution' },
            { icon: Building2, label: 'Acquirer Processing', desc: 'Merchant services' },
            { icon: Wallet, label: 'Issuer Processing', desc: 'Card management' },
            { icon: Smartphone, label: 'Digital Banking', desc: 'Modern banking platform' },
            { icon: Globe, label: 'Payment Acquiring', desc: 'Global acceptance' },
            { icon: BadgeCheck, label: 'BIN Sponsorship', desc: 'Card issuing programs' },
        ]
    },
    { 
        label: 'Solutions', 
        hasDropdown: true,
        items: [
            { icon: Building2, label: 'For Banks', desc: 'Banking solutions' },
            { icon: Globe, label: 'For Fintechs', desc: 'Scale your fintech' },
            { icon: CreditCard, label: 'For Merchants', desc: 'Accept payments' },
        ]
    },
    { 
        label: 'Resources', 
        hasDropdown: true,
        items: [
            { icon: BookOpen, label: 'Documentation', desc: 'Integration guides' },
            { icon: FileCode, label: 'API Reference', desc: 'Technical docs' },
            { icon: Headphones, label: 'Support', desc: '24/7 assistance' },
        ]
    },
    { label: 'Pricing', hasDropdown: false },
    { label: 'Company', hasDropdown: false },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled 
                        ? 'bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100' 
                        : 'bg-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <a href="#" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">PaymentHub</span>
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-1">
                            {navItems.map((item, idx) => (
                                <div 
                                    key={idx}
                                    className="relative"
                                    onMouseEnter={() => item.hasDropdown && setActiveDropdown(idx)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <button className="flex items-center gap-1 px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
                                        {item.label}
                                        {item.hasDropdown && (
                                            <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === idx ? 'rotate-180' : ''}`} />
                                        )}
                                    </button>

                                    {/* Dropdown */}
                                    <AnimatePresence>
                                        {item.hasDropdown && activeDropdown === idx && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 pt-4"
                                            >
                                                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 min-w-[280px]">
                                                    {item.items.map((subItem, subIdx) => (
                                                        <a
                                                            key={subIdx}
                                                            href="#"
                                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                                        >
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                                                                <subItem.icon className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-slate-900">{subItem.label}</p>
                                                                <p className="text-sm text-slate-500">{subItem.desc}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Right Actions */}
                        <div className="hidden lg:flex items-center gap-4">
                            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                                Log in
                            </Button>
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl px-6">
                                Get Started
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            className="lg:hidden p-2"
                            onClick={() => setMobileOpen(!mobileOpen)}
                        >
                            {mobileOpen ? (
                                <X className="h-6 w-6 text-slate-900" />
                            ) : (
                                <Menu className="h-6 w-6 text-slate-900" />
                            )}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 lg:hidden"
                    >
                        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween' }}
                            className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl p-6 pt-24"
                        >
                            <div className="space-y-4">
                                {navItems.map((item, idx) => (
                                    <a
                                        key={idx}
                                        href="#"
                                        className="block px-4 py-3 text-slate-700 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-50"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <Button variant="outline" className="w-full">Log in</Button>
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500">
                                        Get Started
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}