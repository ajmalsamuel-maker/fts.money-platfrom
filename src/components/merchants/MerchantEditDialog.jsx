import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function MerchantEditDialog({ merchant, open, onOpenChange, onSave }) {
    const [formData, setFormData] = useState({
        business_name: '',
        trading_name: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        country: '',
        category: '',
        website: '',
        address: '',
        status: '',
        risk_level: '',
    });

    useEffect(() => {
        if (merchant) {
            setFormData({
                business_name: merchant.business_name || '',
                trading_name: merchant.trading_name || '',
                contact_name: merchant.contact_name || '',
                contact_email: merchant.contact_email || '',
                contact_phone: merchant.contact_phone || '',
                country: merchant.country || '',
                category: merchant.category || '',
                website: merchant.website || '',
                address: merchant.address || '',
                status: merchant.status || '',
                risk_level: merchant.risk_level || '',
            });
        }
    }, [merchant]);

    const handleSave = () => {
        onSave(formData);
    };

    if (!merchant) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Merchant</DialogTitle>
                    <DialogDescription>
                        Update merchant information for {merchant.business_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Business Name *</Label>
                        <Input
                            value={formData.business_name}
                            onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                            placeholder="Legal business name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Trading Name</Label>
                        <Input
                            value={formData.trading_name}
                            onChange={(e) => setFormData({...formData, trading_name: e.target.value})}
                            placeholder="DBA / Trading name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Contact Name</Label>
                        <Input
                            value={formData.contact_name}
                            onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                            placeholder="Primary contact"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                            type="email"
                            value={formData.contact_email}
                            onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                            placeholder="contact@merchant.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input
                            value={formData.contact_phone}
                            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Select 
                            value={formData.country}
                            onValueChange={(val) => setFormData({...formData, country: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="EU">European Union</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="SG">Singapore</SelectItem>
                                <SelectItem value="HK">Hong Kong</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select 
                            value={formData.category}
                            onValueChange={(val) => setFormData({...formData, category: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="ecommerce">E-Commerce</SelectItem>
                                <SelectItem value="hospitality">Hospitality</SelectItem>
                                <SelectItem value="services">Services</SelectItem>
                                <SelectItem value="travel">Travel</SelectItem>
                                <SelectItem value="gaming">Gaming</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select 
                            value={formData.status}
                            onValueChange={(val) => setFormData({...formData, status: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Risk Level</Label>
                        <Select 
                            value={formData.risk_level}
                            onValueChange={(val) => setFormData({...formData, risk_level: val})}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select risk level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-2 space-y-2">
                        <Label>Website</Label>
                        <Input
                            value={formData.website}
                            onChange={(e) => setFormData({...formData, website: e.target.value})}
                            placeholder="https://merchant.com"
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <Label>Address</Label>
                        <Textarea
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            placeholder="Business address"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave}
                        disabled={!formData.business_name || !formData.contact_email}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}