import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ConsumerNavbar from '@/components/consumer/ConsumerNavbar';
import DiscordWidget from '@/components/community/DiscordWidget';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, ThumbsUp, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function CommunityForum() {
    const [user, setUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [newPost, setNewPost] = useState({ title: '', content: '', post_type: 'discussion', tags: [] });
    const queryClient = useQueryClient();

    React.useEffect(() => {
        const session = localStorage.getItem('consumer_session') || localStorage.getItem('community_portal_session');
        if (session) setUser(JSON.parse(session));
    }, []);

    const { data: posts = [] } = useQuery({
        queryKey: ['communityPosts', filter],
        queryFn: () => base44.entities.CommunityPost.filter(
            filter === 'all' ? { status: 'active' } : { status: 'active', post_type: filter }
        ),
    });

    const createPostMutation = useMutation({
        mutationFn: (data) => base44.entities.CommunityPost.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['communityPosts']);
            toast.success('Post created!');
            setNewPost({ title: '', content: '', post_type: 'discussion', tags: [] });
        },
    });

    const handleCreatePost = () => {
        if (!user) {
            toast.error('Please log in to post');
            return;
        }
        createPostMutation.mutate({ ...newPost, author_email: user.email });
    };

    const postTypeColors = {
        tip: 'bg-green-100 text-green-700',
        question: 'bg-blue-100 text-blue-700',
        achievement: 'bg-purple-100 text-purple-700',
        discussion: 'bg-slate-100 text-slate-700',
    };

    return (
        <>
            <ConsumerNavbar user={user} />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>Community Forum</h1>
                            <p className="text-slate-600">Share tips, ask questions, celebrate achievements</p>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Post
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create a Post</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Post title"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    />
                                    <Select value={newPost.post_type} onValueChange={(value) => setNewPost({ ...newPost, post_type: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="discussion">Discussion</SelectItem>
                                            <SelectItem value="tip">Sustainability Tip</SelectItem>
                                            <SelectItem value="question">Question</SelectItem>
                                            <SelectItem value="achievement">Achievement</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Textarea
                                        placeholder="What's on your mind?"
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        rows={6}
                                    />
                                    <Button onClick={handleCreatePost} className="w-full bg-blue-600 hover:bg-blue-700">
                                        Post
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="flex gap-2">
                        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
                            All Posts
                        </Button>
                        <Button variant={filter === 'tip' ? 'default' : 'outline'} onClick={() => setFilter('tip')}>
                            Tips
                        </Button>
                        <Button variant={filter === 'question' ? 'default' : 'outline'} onClick={() => setFilter('question')}>
                            Questions
                        </Button>
                        <Button variant={filter === 'achievement' ? 'default' : 'outline'} onClick={() => setFilter('achievement')}>
                            Achievements
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {posts.map((post) => (
                            <Card key={post.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-green-100 text-green-700">
                                                    {post.author_email?.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg">{post.title}</CardTitle>
                                                <p className="text-xs text-slate-500">
                                                    {post.author_email} · {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge className={postTypeColors[post.post_type]}>
                                            {post.post_type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-700">{post.content}</p>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <button className="flex items-center gap-1 hover:text-blue-600">
                                            <ThumbsUp className="h-4 w-4" />
                                            {post.likes_count || 0}
                                        </button>
                                        <button className="flex items-center gap-1 hover:text-blue-600">
                                            <MessageSquare className="h-4 w-4" />
                                            {post.comments_count || 0}
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <DiscordWidget />
                        </div>
                    </div>
                </div>
            </>
        );
    }