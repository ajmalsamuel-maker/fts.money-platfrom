import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe, Search, Check } from 'lucide-react';
import { GLOBAL_PAYMENT_METHODS, PAYMENT_CATEGORIES } from '@/components/utils/globalPaymentMethods';
import { getPaymentMethodLogoAsync } from '@/components/utils/paymentLogos';

export default function PaymentMethodSelector({ selectedMethods = [], onSelectionChange, open, onOpenChange }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [methodLogos, setMethodLogos] = useState({});

    const toggleMethod = (methodId) => {
        const newSelection = selectedMethods.includes(methodId)
            ? selectedMethods.filter(id => id !== methodId)
            : [...selectedMethods, methodId];
        onSelectionChange(newSelection);
    };

    // Fetch dynamic logos for methods without static logos
    useEffect(() => {
        if (!open) return;
        
        const fetchLogos = async () => {
            const allMethods = [
                ...GLOBAL_PAYMENT_METHODS.global,
                ...Object.values(GLOBAL_PAYMENT_METHODS.regions).flatMap(r => [
                    ...r.regional,
                    ...Object.values(r.countries).flat()
                ])
            ];

            const logosToFetch = allMethods.filter(m => !m.logo);
            const logoPromises = logosToFetch.map(async (method) => {
                const logoUrl = await getPaymentMethodLogoAsync(method.id);
                return { id: method.id, logo: logoUrl };
            });

            const results = await Promise.all(logoPromises);
            const logosMap = results.reduce((acc, { id, logo }) => {
                if (logo) acc[id] = logo;
                return acc;
            }, {});

            setMethodLogos(logosMap);
        };

        fetchLogos();
    }, [open]);

    const renderMethodItem = (method) => {
        const isSelected = selectedMethods.includes(method.id);
        const category = PAYMENT_CATEGORIES[method.category];
        const logoUrl = method.logo || methodLogos[method.id];
        
        return (
            <div
                key={method.id}
                onClick={() => toggleMethod(method.id)}
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                }`}
            >
                <div className="flex items-center gap-3">
                    <Checkbox checked={isSelected} />
                    {logoUrl && (
                        <img src={logoUrl} alt={method.name} className="h-6 w-10 object-contain" />
                    )}
                    <div>
                        <p className="font-medium text-sm">{method.name}</p>
                        {category && (
                            <p className="text-xs text-slate-500">{category.icon} {category.label}</p>
                        )}
                    </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-blue-600" />}
            </div>
        );
    };

    const filteredGlobal = GLOBAL_PAYMENT_METHODS.global.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Select Payment Methods
                    </DialogTitle>
                    <DialogDescription>
                        Choose from global, regional, and country-specific payment methods
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search payment methods..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Selection Count */}
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-blue-50">
                            {selectedMethods.length} selected
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectionChange([])}
                        >
                            Clear all
                        </Button>
                    </div>

                    <Tabs defaultValue="global">
                        <TabsList className="grid grid-cols-4 w-full">
                            <TabsTrigger value="global">Global</TabsTrigger>
                            <TabsTrigger value="regions">By Region</TabsTrigger>
                            <TabsTrigger value="countries">By Country</TabsTrigger>
                            <TabsTrigger value="category">By Category</TabsTrigger>
                        </TabsList>

                        {/* Global Methods */}
                        <TabsContent value="global">
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-slate-600 mb-3">Available globally</p>
                                    {filteredGlobal.map(method => renderMethodItem(method))}
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        {/* Regional Methods */}
                        <TabsContent value="regions">
                            <div className="grid grid-cols-2 gap-4 h-[400px]">
                                {/* Region List */}
                                <ScrollArea>
                                    <div className="space-y-2 pr-2">
                                        {Object.keys(GLOBAL_PAYMENT_METHODS.regions).map(region => (
                                            <div
                                                key={region}
                                                onClick={() => setSelectedRegion(region)}
                                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                    selectedRegion === region ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                                                }`}
                                            >
                                                <p className="font-medium">{region}</p>
                                                <p className="text-xs text-slate-500">
                                                    {GLOBAL_PAYMENT_METHODS.regions[region].regional.length} methods
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {/* Regional Methods */}
                                <ScrollArea>
                                    {selectedRegion ? (
                                        <div className="space-y-2 pl-2">
                                            {GLOBAL_PAYMENT_METHODS.regions[selectedRegion].regional.map(method => 
                                                renderMethodItem(method)
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400">
                                            Select a region
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        {/* Country Methods */}
                        <TabsContent value="countries">
                            <div className="grid grid-cols-3 gap-4 h-[400px]">
                                {/* Region List */}
                                <ScrollArea>
                                    <div className="space-y-2 pr-2">
                                        {Object.keys(GLOBAL_PAYMENT_METHODS.regions).map(region => (
                                            <div
                                                key={region}
                                                onClick={() => {
                                                    setSelectedRegion(region);
                                                    setSelectedCountry(null);
                                                }}
                                                className={`p-2 rounded-lg border cursor-pointer text-xs ${
                                                    selectedRegion === region ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                                                }`}
                                            >
                                                {region}
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                {/* Country List */}
                                <ScrollArea>
                                    {selectedRegion ? (
                                        <div className="space-y-2 px-2">
                                            {Object.keys(GLOBAL_PAYMENT_METHODS.regions[selectedRegion].countries).map(country => (
                                                <div
                                                    key={country}
                                                    onClick={() => setSelectedCountry(country)}
                                                    className={`p-2 rounded-lg border cursor-pointer text-xs ${
                                                        selectedCountry === country ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                                                    }`}
                                                >
                                                    <p className="font-medium">{country}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {GLOBAL_PAYMENT_METHODS.regions[selectedRegion].countries[country].length} methods
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                            Select region
                                        </div>
                                    )}
                                </ScrollArea>

                                {/* Country Methods */}
                                <ScrollArea>
                                    {selectedRegion && selectedCountry ? (
                                        <div className="space-y-2 pl-2">
                                            {GLOBAL_PAYMENT_METHODS.regions[selectedRegion].countries[selectedCountry].map(method =>
                                                renderMethodItem(method)
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                            Select country
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        {/* By Category */}
                        <TabsContent value="category">
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-4">
                                    {Object.entries(PAYMENT_CATEGORIES).map(([catKey, catInfo]) => {
                                        const methods = [
                                            ...GLOBAL_PAYMENT_METHODS.global,
                                            ...Object.values(GLOBAL_PAYMENT_METHODS.regions).flatMap(r => [
                                                ...r.regional,
                                                ...Object.values(r.countries).flat()
                                            ])
                                        ].filter(m => m.category === catKey);

                                        if (methods.length === 0) return null;

                                        return (
                                            <div key={catKey}>
                                                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                    <span>{catInfo.icon}</span>
                                                    {catInfo.label}
                                                </h3>
                                                <div className="space-y-2">
                                                    {methods.map(method => renderMethodItem(method))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>
                        Done ({selectedMethods.length} selected)
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}