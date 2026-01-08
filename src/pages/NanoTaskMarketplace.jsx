import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Leaf, Zap, Gift, TrendingUp, CheckCircle, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function NanoTaskMarketplace() {
    const [selectedTask, setSelectedTask] = useState(null);
    const [verificationData, setVerificationData] = useState({});
    const queryClient = useQueryClient();

    // Check for community session or Base44 auth
    const [communityUser, setCommunityUser] = useState(null);
    
    React.useEffect(() => {
        const sessionData = localStorage.getItem('community_portal_session');
        if (sessionData) {
            setCommunityUser(JSON.parse(sessionData));
        }
    }, []);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            try {
                return await base44.auth.me();
            } catch (error) {
                return null;
            }
        },
    });

    const currentUser = communityUser || user;

    const { data: tasks = [], isLoading: tasksLoading } = useQuery({
        queryKey: ['nanoTasks'],
        queryFn: () => base44.entities.NanoTask.filter({ status: 'active' }),
    });

    const { data: userTokens } = useQuery({
        queryKey: ['nanoTokens', user?.email],
        queryFn: () => base44.entities.NanoToken.filter({ user_email: user?.email }),
        enabled: !!user?.email,
    });

    const { data: completedTasks = [] } = useQuery({
        queryKey: ['taskCompletions', user?.email],
        queryFn: () => base44.entities.TaskCompletion.filter({ user_email: user?.email }),
        enabled: !!user?.email,
    });

    const completeTaskMutation = useMutation({
        mutationFn: (data) => base44.entities.TaskCompletion.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['taskCompletions']);
            toast.success('Task submitted for verification!');
            setSelectedTask(null);
        },
    });

    const handleTaskComplete = (task) => {
        completeTaskMutation.mutate({
            task_id: task.id,
            user_email: user.email,
            verification_data: verificationData,
            nano_tokens_earned: task.reward_amount,
            carbon_impact: task.carbon_impact,
            verification_status: 'pending',
        });
    };

    const tokenBalance = userTokens?.[0]?.balance || 0;

    const taskTypeIcons = {
        reduce_plastic: '♻️',
        plant_tree: '🌳',
        public_transport: '🚌',
        recycle: '🗑️',
        energy_saving: '💡',
        custom: '⭐',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Nano Task Marketplace</h1>
                        <p className="text-slate-600">Complete sustainable actions, earn NANO tokens</p>
                    </div>
                    <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Zap className="h-8 w-8" />
                                <div>
                                    <p className="text-xs opacity-90">Your Balance</p>
                                    <p className="text-2xl font-bold">{tokenBalance} NANO</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">Tasks Completed</p>
                                    <p className="text-2xl font-bold">{completedTasks.length}</p>
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
                                    <p className="text-2xl font-bold">
                                        {completedTasks.reduce((sum, t) => sum + (t.carbon_impact || 0), 0).toFixed(1)} kg
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Zap className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">Tokens Earned</p>
                                    <p className="text-2xl font-bold">{userTokens?.[0]?.total_earned || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600">This Month</p>
                                    <p className="text-2xl font-bold">{completedTasks.filter(t => 
                                        new Date(t.created_date).getMonth() === new Date().getMonth()
                                    ).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tasks Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task) => {
                        const alreadyCompleted = completedTasks.some(c => c.task_id === task.id);
                        return (
                            <Card key={task.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{taskTypeIcons[task.task_type]}</span>
                                            <CardTitle className="text-lg">{task.task_title}</CardTitle>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700">
                                            +{task.reward_amount} NANO
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-slate-600">{task.task_description}</p>
                                    
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Leaf className="h-3 w-3" />
                                            {task.carbon_impact} kg CO₂
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {task.completion_count || 0} completed
                                        </span>
                                    </div>

                                    {task.sponsor_merchant_id && (
                                        <Badge variant="outline" className="w-full justify-center">
                                            <Gift className="h-3 w-3 mr-1" />
                                            {task.sponsor_discount}% off with completion
                                        </Badge>
                                    )}

                                    {!currentUser ? (
                                        <Button 
                                            onClick={() => window.location.href = createPageUrl('CommunityPortalLogin')}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            Login to Start Task
                                        </Button>
                                    ) : alreadyCompleted ? (
                                        <Button disabled className="w-full">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Completed
                                        </Button>
                                    ) : (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                                    Start Task
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Complete Task: {task.task_title}</DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <p className="text-sm text-slate-600">{task.task_description}</p>
                                                    
                                                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                        <p className="text-sm font-medium text-green-800">Verification Method: {task.verification_method}</p>
                                                    </div>

                                                    <Textarea 
                                                        placeholder="Add notes or details about your completion..."
                                                        onChange={(e) => setVerificationData({ notes: e.target.value })}
                                                    />

                                                    <Button 
                                                        onClick={() => handleTaskComplete(task)} 
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Submit for Verification
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}