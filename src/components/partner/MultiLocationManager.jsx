import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit, Users, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function MultiLocationManager({ partnerId, programId, partnerData }) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [locations, setLocations] = useState([
        {
            id: '1',
            name: `${partnerData?.business_name || 'Main'} - Central`,
            address: 'Shop G12, IFC Mall, Central, Hong Kong',
            district: 'Central & Western',
            nearest_mtr: 'Hong Kong Station',
            staff_count: 5,
            redemptions_30d: 145
        },
        {
            id: '2',
            name: `${partnerData?.business_name || 'Branch'} - Tsim Sha Tsui`,
            address: '3/F, Harbour City, Tsim Sha Tsui, Kowloon',
            district: 'Yau Tsim Mong',
            nearest_mtr: 'Tsim Sha Tsui Station',
            staff_count: 8,
            redemptions_30d: 203
        },
        {
            id: '3',
            name: `${partnerData?.business_name || 'Branch'} - Causeway Bay`,
            address: '2/F, Times Square, Causeway Bay, Hong Kong',
            district: 'Wan Chai',
            nearest_mtr: 'Causeway Bay Station',
            staff_count: 6,
            redemptions_30d: 178
        }
    ]);

    const [newLocation, setNewLocation] = useState({
        name: '',
        address: '',
        district: '',
        nearest_mtr: '',
        staff_count: 0
    });

    const districts = [
        'Central & Western', 'Wan Chai', 'Eastern', 'Southern',
        'Yau Tsim Mong', 'Sham Shui Po', 'Kowloon City', 'Wong Tai Sin', 'Kwun Tong',
        'Kwai Tsing', 'Tsuen Wan', 'Tuen Mun', 'Yuen Long', 'North', 'Tai Po', 'Sha Tin', 'Sai Kung', 'Islands'
    ];

    const handleAddLocation = () => {
        if (!newLocation.name || !newLocation.address) {
            toast.error('Please fill in required fields');
            return;
        }

        const location = {
            ...newLocation,
            id: Date.now().toString(),
            redemptions_30d: 0
        };

        setLocations([...locations, location]);
        toast.success('Location added successfully!');
        setNewLocation({ name: '', address: '', district: '', nearest_mtr: '', staff_count: 0 });
        setDialogOpen(false);
    };

    const totalRedemptions = locations.reduce((sum, loc) => sum + loc.redemptions_30d, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Outlet Locations</h2>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Outlets</p>
                                <p className="text-3xl font-bold mt-1">{locations.length}</p>
                            </div>
                            <MapPin className="h-10 w-10 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Staff</p>
                                <p className="text-3xl font-bold mt-1">{locations.reduce((sum, loc) => sum + loc.staff_count, 0)}</p>
                            </div>
                            <Users className="h-10 w-10 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">All Redemptions (30d)</p>
                                <p className="text-3xl font-bold mt-1">{totalRedemptions}</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4">
                {locations.map((location, idx) => (
                    <Card key={location.id}>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold text-lg">{location.name}</h3>
                                        <Badge variant="outline">{location.district}</Badge>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {location.address}
                                        </p>
                                        {location.nearest_mtr && (
                                            <p className="flex items-center gap-2">
                                                <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">MTR</span>
                                                {location.nearest_mtr}
                                            </p>
                                        )}
                                        <div className="flex gap-4 mt-3">
                                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                                {location.staff_count} staff
                                            </span>
                                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                                {location.redemptions_30d} redemptions (30d)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button size="sm" variant="outline">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Location</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div>
                            <Label>Location Name *</Label>
                            <Input
                                value={newLocation.name}
                                onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                                placeholder="e.g., Pacific Coffee - Causeway Bay"
                            />
                        </div>

                        <div>
                            <Label>Address *</Label>
                            <Input
                                value={newLocation.address}
                                onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                                placeholder="Full address"
                            />
                        </div>

                        <div>
                            <Label>District</Label>
                            <select
                                className="w-full border rounded-md p-2"
                                value={newLocation.district}
                                onChange={(e) => setNewLocation({...newLocation, district: e.target.value})}
                            >
                                <option value="">Select district</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label>Nearest MTR Station</Label>
                            <Input
                                value={newLocation.nearest_mtr}
                                onChange={(e) => setNewLocation({...newLocation, nearest_mtr: e.target.value})}
                                placeholder="e.g., Causeway Bay Station"
                            />
                        </div>

                        <div>
                            <Label>Staff Count</Label>
                            <Input
                                type="number"
                                value={newLocation.staff_count}
                                onChange={(e) => setNewLocation({...newLocation, staff_count: parseInt(e.target.value) || 0})}
                            />
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddLocation}>
                                Add Location
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}