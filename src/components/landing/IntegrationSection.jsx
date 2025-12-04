import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, BookOpen, ArrowRight } from 'lucide-react';

const codeExamples = {
    javascript: `// Initialize PaymentHub SDK
import PaymentHub from '@paymenthub/sdk';

const client = new PaymentHub({
  apiKey: 'pk_live_xxxxx',
  environment: 'production'
});

// Create a payment intent
const payment = await client.payments.create({
  amount: 2000,
  currency: 'USD',
  customer: 'cus_xxxxx',
  payment_method: 'pm_card_visa',
  confirm: true
});

console.log(payment.status); // 'succeeded'`,
    python: `# Initialize PaymentHub SDK
from paymenthub import PaymentHub

client = PaymentHub(
    api_key='pk_live_xxxxx',
    environment='production'
)

# Create a payment intent
payment = client.payments.create(
    amount=2000,
    currency='USD',
    customer='cus_xxxxx',
    payment_method='pm_card_visa',
    confirm=True
)

print(payment.status)  # 'succeeded'`,
    curl: `curl -X POST https://api.paymenthub.com/v1/payments \\
  -H "Authorization: Bearer pk_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 2000,
    "currency": "USD",
    "customer": "cus_xxxxx",
    "payment_method": "pm_card_visa",
    "confirm": true
  }'`
};

export default function IntegrationSection() {
    const [activeTab, setActiveTab] = useState('javascript');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeExamples[activeTab]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
                            Developer First
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                            Payment Integration
                            <br />
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                Made Easy
                            </span>
                        </h2>
                        <p className="text-xl text-slate-600 leading-relaxed mb-8">
                            Extensive API functionalities supported by comprehensive, 
                            user-friendly documentation. Our powerful APIs ensure smooth 
                            integration with your existing systems.
                        </p>

                        <div className="space-y-4 mb-8">
                            {[
                                "RESTful APIs with SDKs for 10+ languages",
                                "Webhook support for real-time notifications",
                                "Sandbox environment for testing",
                                "Detailed API reference & tutorials"
                            ].map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-slate-700">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Button 
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl"
                            >
                                <BookOpen className="mr-2 h-5 w-5" />
                                View Documentation
                            </Button>
                            <Button 
                                variant="outline" 
                                size="lg"
                                className="rounded-xl border-slate-200"
                            >
                                API Reference
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>

                    {/* Right - Code Editor */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-2xl opacity-10" />
                        <div className="relative bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                            {/* Editor Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="bg-slate-800 border border-slate-700">
                                        <TabsTrigger value="javascript" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
                                            JavaScript
                                        </TabsTrigger>
                                        <TabsTrigger value="python" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
                                            Python
                                        </TabsTrigger>
                                        <TabsTrigger value="curl" className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400">
                                            cURL
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="text-slate-400 hover:text-white hover:bg-slate-700"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-400" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            {/* Code Content */}
                            <div className="p-6 overflow-x-auto">
                                <pre className="text-sm">
                                    <code className="text-slate-300 font-mono leading-relaxed">
                                        {codeExamples[activeTab].split('\n').map((line, idx) => (
                                            <div key={idx} className="flex">
                                                <span className="text-slate-600 select-none w-8 text-right mr-4">
                                                    {idx + 1}
                                                </span>
                                                <span 
                                                    className={
                                                        line.startsWith('//') || line.startsWith('#') 
                                                            ? 'text-slate-500' 
                                                            : line.includes("'") || line.includes('"')
                                                                ? 'text-emerald-400'
                                                                : 'text-slate-300'
                                                    }
                                                >
                                                    {line || ' '}
                                                </span>
                                            </div>
                                        ))}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}