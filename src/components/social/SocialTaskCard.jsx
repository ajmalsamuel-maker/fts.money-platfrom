import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Users, Heart, MessageSquare, Gift, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function SocialTaskCard({ task, onComplete, isCompleted }) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    const getIcon = (type) => {
        switch (type) {
            case 'invite': return <Users className="h-5 w-5" />;
            case 'referral': return <Gift className="h-5 w-5" />;
            case 'social_share': return <Share2 className="h-5 w-5" />;
            case 'review': return <MessageSquare className="h-5 w-5" />;
            case 'community_post': return <MessageSquare className="h-5 w-5" />;
            case 'engagement': return <Heart className="h-5 w-5" />;
            default: return <Gift className="h-5 w-5" />;
        }
    };

    const handleCopy = () => {
        if (task.share_url) {
            navigator.clipboard.writeText(task.share_url);
            setCopied(true);
            toast.success('Link copied!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleComplete = async () => {
        await onComplete(task);
        setOpen(false);
    };

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md ${isCompleted ? 'opacity-60 bg-slate-50' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1 p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            {getIcon(task.task_type)}
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                                {task.task_name}
                                {task.multiplier > 1 && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                                        {task.multiplier}x Bonus
                                    </Badge>
                                )}
                            </CardTitle>
                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">
                            {Math.round(task.points_reward * task.multiplier)}
                        </p>
                        <p className="text-xs text-slate-500">points</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button 
                            className="w-full" 
                            disabled={isCompleted}
                            variant={isCompleted ? "outline" : "default"}
                        >
                            {isCompleted ? 'Completed ✓' : 'Complete Task'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{task.task_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-slate-600">{task.description}</p>
                            
                            {task.share_url && (
                                <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                    <p className="text-sm font-medium text-slate-700">Share this link:</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={task.share_url}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-white border rounded text-sm"
                                        />
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={handleCopy}
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {task.share_message && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Suggested message:</p>
                                    <p className="text-sm text-slate-600 italic">"{task.share_message}"</p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleComplete}
                                    className="flex-1"
                                >
                                    Mark as Complete
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}