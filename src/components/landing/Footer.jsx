import React from 'react';
import { CreditCard, Linkedin, Twitter, Github, Youtube } from 'lucide-react';

const footerLinks = {
    Products: [
        "Payment Gateway",
        "Acquirer Processing",
        "Issuer Processing",
        "Digital Banking",
        "Payment Acquiring",
        "BIN Sponsorship"
    ],
    Solutions: [
        "For Merchants",
        "For Banks",
        "For Fintechs",
        "For Marketplaces",
        "For Enterprises"
    ],
    Resources: [
        "Documentation",
        "API Reference",
        "Integration Guides",
        "Changelog",
        "Status Page"
    ],
    Company: [
        "About Us",
        "Careers",
        "Press Kit",
        "Blog",
        "Contact"
    ]
};

const socialLinks = [
    { icon: Twitter, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Github, href: "#" },
    { icon: Youtube, href: "#" },
];

export default function Footer() {
    return (
        <footer className="bg-slate-900 pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-16 border-b border-slate-800">
                    {/* Logo & Description */}
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">PaymentHub</span>
                        </div>
                        <p className="text-slate-400 mb-6 max-w-xs">
                            White-label payment infrastructure for merchants, fintechs, and banks worldwide.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                                >
                                    <social.icon className="h-5 w-5 text-slate-400" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="text-white font-semibold mb-4">{category}</h3>
                            <ul className="space-y-3">
                                {links.map((link, idx) => (
                                    <li key={idx}>
                                        <a 
                                            href="#" 
                                            className="text-slate-400 hover:text-white transition-colors text-sm"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Footer */}
                <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © 2024 PaymentHub. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-slate-500 hover:text-slate-400 text-sm">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-slate-500 hover:text-slate-400 text-sm">
                            Terms of Service
                        </a>
                        <a href="#" className="text-slate-500 hover:text-slate-400 text-sm">
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}