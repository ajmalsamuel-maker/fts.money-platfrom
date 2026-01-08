import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useMerchantAuth } from '@/components/auth/useMerchantAuth';
import MerchantSidebar from '@/components/merchant/MerchantSidebar';
import MerchantTopBar from '@/components/merchant/MerchantTopBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Leaf, Award, TrendingUp, Users, Zap, Plus, Gift } from 'lucide-react';
import { toast } from 'sonner';

export default function GreenMerchantDashboard() {
    const { merchantUser } = useMerchantAuth();
    const [newTask, setNewTask] = useState({});
    const queryClient = useQueryClient();

    const { data: greenMerchant } = useQuery({
        queryKey: ['greenMerchant', merchantUser?.email],
        queryFn: () => base44.entities.GreenMerchant.filter({ merchant_email: merchantUser?.email }),
        enabled: !!merchantUser?.email,
    });

    const { data: sponsoredTasks = [] } = useQuery({
        queryKey: ['sponsoredTasks', greenMerchant?.[0]?.id],
        queryFn: () => base44.entities.NanoTask.filter({ sponsor_merchant_id: greenMerchant?.[0]?.id }),
        enabled: !!greenMerchant?.[0]?.id,
    });

    const createTaskMutation = useMutation({
        mutationFn: (data) => base44.entities.NanoTask.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['sponsoredTasks']);
            toast.success('Task campaign created!');
            setNewTask({});
        },
    });

    const merchant = greenMerchant?.[0] || {};

    const handleCreateTask = () => {
        createTaskMutation.mutate({
            ...newTask,
            sponsor_merchant_id: merchant.id,
            status: 'active',
            start_date: new Date().toISOString().split('T')[0],
        });
    };

    const badgeColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        verified: 'bg-green-100 text-green-700',
        premium: 'bg-purple-100 text-purple-700',
        inactive: 'bg-gray-100 text-gray-700',
    };

    return (
        <div className="flex h-screen bg-slate-50">
            <MerchantSidebar currentPage="GreenMerchantDashboard" />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <MerchantTopBar title="Sustainability Dashboard" />
                
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Green Merchant Program</h1>
                                <p className="text-slate-600">Sponsor sustainability tasks & earn customer loyalty</p>
                            </div>
                            <Badge className={badgeColors[merchant.green_badge_status || 'pending']}>
                                <Award className="h-4 w-4 mr-1" />
                                {merchant.green_badge_status || 'Not Enrolled'}
                            </Badge>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <TrendingUp className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600">Sustainability Score</p>
                                            <p className="text-2xl font-bold">{merchant.sustainability_score || 0}/100</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Leaf className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600">CO₂ Offset</p>
                                            <p className="text-2xl font-bold">{(merchant.total_co2_offset || 0).toFixed(1)} kg</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Users className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600">Engaged Users</p>
                                            <p className="text-2xl font-bold">{merchant.green_transactions || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <Zap className="h-5 w-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-600">NANO Issued</p>
                                            <p className="text-2xl font-bold">{merchant.total_nano_rewards_issued || 0}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Create Task Campaign */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Your Task Campaigns</CardTitle>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="bg-green-600 hover:bg-green-700">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create Campaign
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Create Nano Task Campaign</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <Input
                                                    placeholder="Task Title"
                                                    onChange={(e) => setNewTask({...newTask, task_title: e.target.value})}
                                                />
                                                <Textarea
                                                    placeholder="Task Description"
                                                    onChange={(e) => setNewTask({...newTask, task_description: e.target.value})}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Select onValueChange={(value) => setNewTask({...newTask, task_type: value})}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Task Type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="reduce_plastic">Reduce Plastic</SelectItem>
                                                            <SelectItem value="plant_tree">Plant Tree</SelectItem>
                                                            <SelectItem value="public_transport">Public Transport</SelectItem>
                                                            <SelectItem value="recycle">Recycle</SelectItem>
                                                            <SelectItem value="energy_saving">Energy Saving</SelectItem>
                                                            <SelectItem value="custom">Custom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <Select onValueChange={(value) => setNewTask({...newTask, verification_method: value})}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Verification" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="receipt_scan">Receipt Scan</SelectItem>
                                                            <SelectItem value="photo_upload">Photo Upload</SelectItem>
                                                            <SelectItem value="qr_code">QR Code</SelectItem>
                                                            <SelectItem value="manual">Manual</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <Input
                                                        type="number"
                                                        placeholder="NANO Reward"
                                                        onChange={(e) => setNewTask({...newTask, reward_amount: parseFloat(e.target.value)})}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="Discount %"
                                                        onChange={(e) => setNewTask({...newTask, sponsor_discount: parseFloat(e.target.value)})}
                                                    />
                                                    <Input
                                                        type="number"
                                                        placeholder="CO₂ Impact (kg)"
                                                        onChange={(e) => setNewTask({...newTask, carbon_impact: parseFloat(e.target.value)})}
                                                    />
                                                </div>
                                                <Button onClick={handleCreateTask} className="w-full bg-green-600 hover:bg-green-700">
                                                    Launch Campaign
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {sponsoredTasks.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>No campaigns yet. Create your first sustainability task!</p>
                                        </div>
                                    ) : (
                                        sponsoredTasks.map((task) => (
                                            <Card key={task.id} className="border-green-200">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold">{task.task_title}</h4>
                                                            <p className="text-sm text-slate-600">{task.task_description}</p>
                                                            <div className="flex gap-2 mt-2">
                                                                <Badge className="bg-green-100 text-green-700">
                                                                    +{task.reward_amount} NANO
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    {task.sponsor_discount}% discount
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    {task.completion_count || 0} completions
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <Badge className={task.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                                                            {task.status}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}