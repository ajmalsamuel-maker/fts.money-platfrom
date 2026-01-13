import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Book, Video, MessageCircle, Send, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function SupportTraining({ partnerId }) {
    const [ticketTitle, setTicketTitle] = useState('');
    const [ticketDescription, setTicketDescription] = useState('');

    const submitTicket = () => {
        if (!ticketTitle || !ticketDescription) {
            toast.error('Please fill in all fields');
            return;
        }
        toast.success('Support ticket submitted! We\'ll respond within 24 hours.');
        setTicketTitle('');
        setTicketDescription('');
    };

    const faqs = [
        { q: 'How do I verify a redemption?', a: 'Scan the QR code in the Redemptions tab or enter the code manually' },
        { q: 'When do I receive payments?', a: 'Settlements are processed on the 1st week of each month' },
        { q: 'How to add new outlet locations?', a: 'Go to Locations tab and click "Add Location"' },
        { q: 'Can I customize my offers?', a: 'Yes! Go to Offers tab to create and manage your redemption options' }
    ];

    const tutorials = [
        { title: 'Getting Started Guide', duration: '5 min', type: 'video', lang: 'EN/中文' },
        { title: 'QR Code Verification', duration: '3 min', type: 'video', lang: 'EN/中文' },
        { title: 'Setting Up Offers', duration: '7 min', type: 'video', lang: 'EN/中文' },
        { title: 'Financial Reporting', duration: '4 min', type: 'video', lang: 'EN/中文' }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Support & Training</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 text-center">
                        <MessageCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">WhatsApp Support</h3>
                        <p className="text-sm text-gray-600 mb-3">Chat with us in English or 中文</p>
                        <Button className="w-full bg-green-600">
                            Open WhatsApp
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 text-center">
                        <Phone className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Hotline</h3>
                        <p className="text-sm text-gray-600 mb-3">+852 3000 1234</p>
                        <Button className="w-full" variant="outline">
                            Call Now
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 text-center">
                        <Send className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                        <h3 className="font-semibold mb-2">Email Support</h3>
                        <p className="text-sm text-gray-600 mb-3">partners@loyalty.hk</p>
                        <Button className="w-full" variant="outline">
                            Send Email
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        Submit Support Ticket
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Issue Title</Label>
                        <Input 
                            value={ticketTitle}
                            onChange={(e) => setTicketTitle(e.target.value)}
                            placeholder="Brief description of your issue"
                        />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Textarea
                            value={ticketDescription}
                            onChange={(e) => setTicketDescription(e.target.value)}
                            placeholder="Please provide details about your issue..."
                            rows={4}
                        />
                    </div>
                    <Button onClick={submitTicket} className="w-full">
                        <Send className="h-4 w-4 mr-2" />
                        Submit Ticket
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                        Response time: Within 24 hours (weekdays) • 中文/English support available
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Video Tutorials
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tutorials.map((tutorial, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                                    <Video className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="font-semibold mb-1">{tutorial.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <Badge variant="outline">{tutorial.duration}</Badge>
                                    <Badge variant="outline">{tutorial.lang}</Badge>
                                </div>
                                <Button size="sm" variant="outline" className="w-full">
                                    Watch Tutorial
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5" />
                        FAQs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="border-b pb-3 last:border-b-0">
                                <p className="font-semibold mb-1">{faq.q}</p>
                                <p className="text-sm text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                        View All FAQs
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}