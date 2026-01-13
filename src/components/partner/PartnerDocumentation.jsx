import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { BookOpen, QrCode, Gift, Users, DollarSign, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function PartnerDocumentation() {
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: BookOpen },
        { id: 'redemptions', title: 'Processing Redemptions', icon: QrCode },
        { id: 'offers', title: 'Managing Offers', icon: Gift },
        { id: 'staff', title: 'Staff Training', icon: Users },
        { id: 'financials', title: 'Financials & Settlements', icon: DollarSign },
        { id: 'troubleshooting', title: 'Troubleshooting', icon: AlertCircle },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'getting-started':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Welcome to the Partner Portal</h3>
                            <p className="text-gray-600 mb-4">
                                The Impact Loyalty Partner Portal is your central hub for managing your loyalty program participation. 
                                This platform allows you to process customer redemptions, manage your offers, track earnings, and analyze performance.
                            </p>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Dashboard Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold mb-2">Operations</h4>
                                        <p className="text-sm text-gray-600">Quick access to Redemptions, Offers, and Location management.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold mb-2">Analytics</h4>
                                        <p className="text-sm text-gray-600">View real-time performance metrics, customer insights, and redemption trends.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold mb-2">Business</h4>
                                        <p className="text-sm text-gray-600">Access Financial reports, Settlements, and Marketing tools.</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-semibold mb-2">Settings</h4>
                                        <p className="text-sm text-gray-600">Configure POS integration, HK localization, and Security settings.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'redemptions':
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold mb-4">Processing Redemptions</h3>
                        
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="h-5 w-5" />
                                        Method 1: QR Code Scanning (Recommended)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ol className="list-decimal pl-5 space-y-3">
                                        <li>Navigate to the <strong>Redemptions</strong> tab in the portal.</li>
                                        <li>Ensure your device camera permissions are enabled.</li>
                                        <li>Click the <strong>"Scan QR"</strong> button to activate the scanner.</li>
                                        <li>Ask the customer to present their redemption QR code from their app.</li>
                                        <li>Scan the code. The system will instantly verify the validity.</li>
                                        <li>Upon success, you will see a green confirmation screen with the reward details.</li>
                                        <li>Hand over the item/service to the customer and click <strong>"Complete Fulfillment"</strong>.</li>
                                    </ol>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Method 2: Manual Entry</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 mb-4">Use this method if the scanner is unavailable or the customer's screen is unreadable.</p>
                                    <ol className="list-decimal pl-5 space-y-3">
                                        <li>Go to the <strong>Redemptions</strong> tab.</li>
                                        <li>Locate the <strong>"Manual Entry"</strong> input field.</li>
                                        <li>Enter the alphanumeric code displayed below the customer's QR code.</li>
                                        <li>Click <strong>"Verify"</strong>.</li>
                                        <li>Confirm the reward details and complete the fulfillment.</li>
                                    </ol>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            case 'offers':
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold mb-4">Managing Offers</h3>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Creating a New Offer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>To attract more customers, keep your offers fresh and exciting.</p>
                                <div className="space-y-2">
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold text-sm">1</div>
                                        <div>
                                            <p className="font-semibold">Go to Offers Tab</p>
                                            <p className="text-sm text-gray-600">Click on "Create New Offer".</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold text-sm">2</div>
                                        <div>
                                            <p className="font-semibold">Enter Details</p>
                                            <p className="text-sm text-gray-600">Provide a catchy title, clear description, and upload an attractive image.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold text-sm">3</div>
                                        <div>
                                            <p className="font-semibold">Set Points & Terms</p>
                                            <p className="text-sm text-gray-600">Define the points cost and any specific terms (e.g., "Valid weekdays only").</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <div className="bg-blue-100 p-2 rounded-full text-blue-600 font-bold text-sm">4</div>
                                        <div>
                                            <p className="font-semibold">Publish</p>
                                            <p className="text-sm text-gray-600">Review and publish immediately or schedule for later.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'staff':
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold mb-4">Staff Training Guide</h3>
                        
                        <Card>
                            <CardHeader>
                                <CardTitle>Frontline Staff Protocol</CardTitle>
                                <CardDescription>Train your staff to ensure a smooth customer experience.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50">
                                        <h4 className="font-semibold text-green-800">Do's</h4>
                                        <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                                            <li>Always greet customers warmly when they mention loyalty redemption.</li>
                                            <li>Verify the timer on the customer's app screen (if applicable) to ensure it's not a screenshot.</li>
                                            <li>Confirm the item availability BEFORE processing the redemption.</li>
                                            <li>Thank the customer for their loyalty after the transaction.</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50">
                                        <h4 className="font-semibold text-red-800">Don'ts</h4>
                                        <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                                            <li>Do not accept screenshots or printed photos of QR codes.</li>
                                            <li>Do not process a redemption if the internet connection is unstable; wait for reconnection.</li>
                                            <li>Never ask for the customer's password or personal login details.</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Role-Playing Scenarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="font-semibold">Scenario A: Invalid QR Code</h5>
                                        <p className="text-sm text-gray-600 italic">"I'm sorry, but the system isn't recognizing this code. Could you please refresh your app or verify your internet connection? We can also try entering the code manually."</p>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold">Scenario B: Out of Stock Item</h5>
                                        <p className="text-sm text-gray-600 italic">"I apologize, but this specific reward item is currently out of stock. Would you like to save your points for next time, or can I recommend an alternative reward available today?"</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            case 'financials':
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold mb-4">Financials & Settlements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settlement Cycle</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                            <span>Redemptions are tallied daily at 23:59 HKT.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                            <span>Invoices are generated automatically on the 1st of every month.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                                            <span>Payments are processed via FPS or Bank Transfer within 7 business days.</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Reconciliation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600 mb-4">
                                        You can download detailed CSV reports from the <strong>Financials</strong> tab to reconcile with your POS system.
                                    </p>
                                    <Button variant="outline" size="sm">View Settlement History</Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            case 'troubleshooting':
                return (
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold mb-4">Troubleshooting</h3>
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {[
                                        { problem: "Scanner not working", solution: "Check browser camera permissions. Ensure good lighting. Try refreshing the page." },
                                        { problem: "Login failed", solution: "Verify email/password. Check internet connection. Use 'Forgot Password' if needed." },
                                        { problem: "Slow dashboard loading", solution: "Clear browser cache. Check your internet speed. Contact support if issue persists." },
                                        { problem: "Customer points not deducting", solution: "Check transaction history. If 'Pending', wait a few minutes. If failed, contact support with Transaction ID." }
                                    ].map((item, idx) => (
                                        <div key={idx} className="border-b last:border-0 pb-4 last:pb-0">
                                            <h5 className="font-semibold text-red-600 mb-1">{item.problem}</h5>
                                            <p className="text-sm text-gray-600">{item.solution}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-blue-800">Need more help?</h4>
                                <p className="text-sm text-blue-600">Our support team is available 9am - 6pm HKT.</p>
                            </div>
                            <Button>Contact Support</Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
            <Card className="lg:w-64 flex-shrink-0 h-full">
                <CardHeader>
                    <CardTitle className="text-lg">User Manual</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                        <div className="space-y-1 p-2">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        activeSection === section.id 
                                            ? 'bg-primary/10 text-primary' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <section.icon className="h-4 w-4" />
                                    {section.title}
                                    {activeSection === section.id && <ChevronRight className="h-3 w-3 ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            <div className="flex-1 overflow-y-auto pr-2">
                {renderContent()}
            </div>
        </div>
    );
}