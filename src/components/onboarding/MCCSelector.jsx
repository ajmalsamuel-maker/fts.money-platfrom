import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, AlertCircle } from 'lucide-react';

const mccCodes = [
    { code: '5411', description: 'Grocery Stores, Supermarkets' },
    { code: '5812', description: 'Eating Places, Restaurants' },
    { code: '5813', description: 'Drinking Places (Bars, Taverns)' },
    { code: '5912', description: 'Drug Stores and Pharmacies' },
    { code: '5999', description: 'Miscellaneous Retail Stores' },
    { code: '7011', description: 'Hotels, Motels, Resorts' },
    { code: '7230', description: 'Beauty and Barber Shops' },
    { code: '7311', description: 'Advertising Services' },
    { code: '7399', description: 'Business Services' },
    { code: '7512', description: 'Car Rental' },
    { code: '7832', description: 'Motion Picture Theaters' },
    { code: '7841', description: 'Video Entertainment Rental' },
    { code: '7922', description: 'Theatrical Producers' },
    { code: '7941', description: 'Sports Clubs, Fields' },
    { code: '7995', description: 'Gambling, Betting' },
    { code: '7999', description: 'Recreation Services' },
    { code: '8011', description: 'Doctors, Physicians' },
    { code: '8021', description: 'Dentists, Orthodontists' },
    { code: '8042', description: 'Optometrists, Ophthalmologists' },
    { code: '8050', description: 'Nursing Care Facilities' },
    { code: '8111', description: 'Legal Services, Attorneys' },
    { code: '8211', description: 'Schools, Educational Services' },
    { code: '8299', description: 'Schools and Educational Services' },
    { code: '8398', description: 'Charitable and Social Service Organizations' },
    { code: '8699', description: 'Membership Organizations' },
    { code: '8999', description: 'Professional Services' },
    { code: '4111', description: 'Transportation - Suburban and Local Commuter' },
    { code: '4121', description: 'Taxicabs and Limousines' },
    { code: '4131', description: 'Bus Lines' },
    { code: '4411', description: 'Steamship and Cruise Lines' },
    { code: '4511', description: 'Airlines, Air Carriers' },
    { code: '4722', description: 'Travel Agencies and Tour Operators' },
    { code: '4816', description: 'Computer Network Services' },
    { code: '5045', description: 'Computers, Peripherals, Software' },
    { code: '5311', description: 'Department Stores' },
    { code: '5399', description: 'Miscellaneous General Merchandise' },
    { code: '5541', description: 'Service Stations' },
    { code: '5651', description: 'Family Clothing Stores' },
    { code: '5691', description: 'Mens and Womens Clothing Stores' },
    { code: '5732', description: 'Electronics Stores' },
    { code: '5734', description: 'Computer Software Stores' },
    { code: '5816', description: 'Digital Goods - Games' },
    { code: '5817', description: 'Digital Goods - Applications' },
    { code: '5818', description: 'Digital Goods - Large Digital Goods Merchant' },
    { code: '5967', description: 'Direct Marketing - Inbound Teleservices' },
    { code: '5968', description: 'Direct Marketing - Subscription' },
    { code: '6012', description: 'Financial Institutions - Merchandise and Services' },
    { code: '6051', description: 'Non-Financial Institutions - Foreign Currency' },
    { code: '6211', description: 'Security Brokers/Dealers' },
    { code: '6300', description: 'Insurance Sales, Underwriting' },
    { code: '6513', description: 'Real Estate Agents and Managers' },
];

export default function MCCSelector({ value, onChange, error }) {
    const [search, setSearch] = useState('');
    const [showList, setShowList] = useState(false);

    const filteredCodes = mccCodes.filter(mcc => 
        mcc.code.includes(search) || 
        mcc.description.toLowerCase().includes(search.toLowerCase())
    );

    const selectedMCC = mccCodes.find(m => m.code === value);

    return (
        <div className="space-y-2">
            <Label>Merchant Category Code (MCC)</Label>
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowList(true);
                        }}
                        onFocus={() => setShowList(true)}
                        placeholder="Search MCC code or description..."
                        className="pl-10"
                    />
                </div>
                
                {showList && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                        <ScrollArea className="h-60">
                            {filteredCodes.length > 0 ? (
                                filteredCodes.map((mcc) => (
                                    <button
                                        key={mcc.code}
                                        type="button"
                                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 flex justify-between items-center ${value === mcc.code ? 'bg-blue-50' : ''}`}
                                        onClick={() => {
                                            onChange(mcc.code);
                                            setSearch('');
                                            setShowList(false);
                                        }}
                                    >
                                        <span className="font-mono text-sm">{mcc.code}</span>
                                        <span className="text-sm text-slate-600">{mcc.description}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-3 text-sm text-slate-500">No matching MCC codes found</div>
                            )}
                        </ScrollArea>
                        <div className="border-t p-2">
                            <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowList(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </div>

            {selectedMCC && (
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <span className="font-mono text-sm font-medium">{selectedMCC.code}</span>
                    <span className="text-sm text-slate-600">- {selectedMCC.description}</span>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {error}
                </p>
            )}
        </div>
    );
}