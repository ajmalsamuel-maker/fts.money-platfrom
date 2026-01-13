import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share2, Image as ImageIcon, Gift, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function MarketingTools({ partnerId, partnerData }) {
    const [generatedBadge, setGeneratedBadge] = useState(null);

    const downloadMaterial = (type) => {
        toast.success(`Downloading ${type}...`);
    };

    const generateBadge = () => {
        setGeneratedBadge(`https://via.placeholder.com/400x200/10b981/ffffff?text=${partnerData?.business_name}+Partner`);
        toast.success('Badge generated!');
    };

    const materials = [
        { name: 'Loyalty Program Logo', type: 'PNG, SVG', size: '2.3 MB' },
        { name: 'Partner Window Sticker', type: 'PDF', size: '1.1 MB' },
        { name: 'Table Tent Template', type: 'PDF', size: '850 KB' },
        { name: 'Social Media Assets', type: 'ZIP', size: '5.2 MB' }
    ];

    const campaigns = [
        { name: 'Chinese New Year 2026', status: 'active', endDate: '2026-02-15', bonus: '2x points' },
        { name: 'Summer Rewards Fest', status: 'upcoming', endDate: '2026-06-30', bonus: '50% off' },
        { name: 'Dragon Boat Festival', status: 'upcoming', endDate: '2026-06-10', bonus: 'Free gift' }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Marketing & Promotion</h2>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Marketing Materials
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map((material, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold">{material.name}</p>
                                        <p className="text-sm text-gray-600">{material.type} • {material.size}</p>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => downloadMaterial(material.name)}>
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gift className="h-5 w-5" />
                        Active Campaigns
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {campaigns.map((campaign, idx) => (
                            <div key={idx} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold">{campaign.name}</h3>
                                    <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                                        {campaign.status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Bonus: {campaign.bonus}</span>
                                    <span className="text-gray-600">Until: {campaign.endDate}</span>
                                </div>
                                <Button size="sm" className="mt-3 w-full" variant="outline">
                                    Enroll in Campaign
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Generate "Accepted Here" Badge</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Create a custom badge to display on your website, storefront, or social media
                        </p>
                        <Button onClick={generateBadge} className="w-full">
                            Generate Badge
                        </Button>
                        {generatedBadge && (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <img src={generatedBadge} alt="Partner Badge" className="w-full rounded" />
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Download className="h-4 w-4 mr-1" />
                                        Download
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <Share2 className="h-4 w-4 mr-1" />
                                        Share
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Partner Network
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                        Connect with other partners for cross-promotion opportunities
                    </p>
                    <Button className="w-full">Browse Partner Directory</Button>
                </CardContent>
            </Card>
        </div>
    );
}