import { useEffect, useState } from "react";
import { Plus, Heart, MessageSquare, Send } from "lucide-react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

import { toast } from "sonner";

/* =====================
   Interfaces
===================== */

interface Registration {
    _id: string;
    eventId: {
        _id: string;
        title: string;
        category?: string;
        dateStart: string;
        dateEnd: string;
        location?: string;
        status: string;
        createdBy: {
            _id: string;
            name: string;
            email: string;
        };
    };
    userId: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    registeredAt: string;
    contributionConfirmed?: boolean;
}

interface MyEvent {
    registrationId: string;
    _id: string;
    title: string;
    category?: string;
    dateStart: string;
    dateEnd: string;
    location?: string;
    createdBy: {
        name: string;
    };
    registrationStatus: string;
    contributionConfirmed?: boolean;
}

interface CommentType {
    _id: string;
    content: string;
    authorId: { name: string; avatar?: string };
    createdAt: string;
}

interface Post {
    _id: string;
    content: string;
    authorId: { _id: string; name: string; avatar?: string };
    eventId: { _id: string; title: string };
    likes: string[];
    createdAt: string;
    comments?: CommentType[];
}

/* =====================
   Component
===================== */

export function Feed() {
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    const [createPostOpen, setCreatePostOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [postContent, setPostContent] = useState("");

    // State cho ô nhập bình luận của từng bài viết
    const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});

    // Lấy ID người dùng hiện tại để kiểm tra trạng thái Like
    // [CẬP NHẬT MỚI] Trích xuất ID từ đối tượng 'user' được lưu trong Auth.tsx
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const currentUserId = userObj?.id; // Auth.tsx lưu là 'id'

    /* =====================
       Fetch Data Functions
    ===================== */

    const fetchPosts = async () => {
        setPostsLoading(true);
        try {
            const res = await fetch("http://localhost:4000/api/posts");
            if (!res.ok) throw new Error("Failed to fetch community posts");
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            console.error(err);
            toast.error("Could not load community feed");
        } finally {
            setPostsLoading(false);
        }
    };

    const fetchMyEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [regRes, ownedRes] = await Promise.all([
                fetch("http://localhost:4000/api/registrations/me/history", { headers }),
                fetch("http://localhost:4000/api/events", { headers })
            ]);

            let combinedEvents: MyEvent[] = [];

            if (regRes.ok) {
                const regData: Registration[] = await regRes.json();
                const fromReg = regData.filter(reg => reg.eventId).map(reg => ({
                    registrationId: reg._id,
                    _id: reg.eventId._id,
                    title: reg.eventId.title,
                    registrationStatus: reg.status,
                    contributionConfirmed: reg.contributionConfirmed || reg.status === 'completed'
                }));
                combinedEvents = [...fromReg];
            }

            if (ownedRes.ok) {
                const ownedData = await ownedRes.json();
                const fromOwned = ownedData
                    .filter((ev: any) => !combinedEvents.some(ce => ce._id === ev._id))
                    .map((ev: any) => ({
                        registrationId: `owner-${ev._id}`,
                        _id: ev._id,
                        title: ev.title,
                        dateStart: ev.dateStart, // QUAN TRỌNG: Phải lấy ngày bắt đầu
                        location: ev.location,
                        registrationStatus: 'owner',
                        contributionConfirmed: false // Đổi thành false để hiện ở mục Upcoming
                    }));
                combinedEvents = [...combinedEvents, ...fromOwned];
            }

            setEvents(combinedEvents);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load events list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyEvents();
        fetchPosts();
    }, []);

    /* =====================
       Handlers
    ===================== */

    const handleLike = async (postId: string) => {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("Please login to like");

        try {
            const res = await fetch(`http://localhost:4000/api/posts/post/${postId}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok && data.likes) {
                // Cập nhật mảng likes từ backend trả về
                setPosts(prevPosts => prevPosts.map(p =>
                    p._id === postId ? { ...p, likes: data.likes } : p
                ));
            }
        } catch (err) {
            console.error("Like error", err);
        }
    };

    const handleSendComment = async (postId: string) => {
        const text = commentTexts[postId];
        if (!text?.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:4000/api/posts/post/${postId}/comment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: text })
            });

            if (res.ok) {
                toast.success("Commented!");
                setCommentTexts({ ...commentTexts, [postId]: "" });
                fetchPosts(); // Load lại để hiện bình luận mới
            }
        } catch (err) {
            toast.error("Failed to comment");
        }
    };

    const handleCreatePost = async () => {
        if (!selectedEvent || !postContent.trim()) {
            toast.error("Please select an event and write your post");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ eventId: selectedEvent, content: postContent }),
            });

            if (res.ok) {
                toast.success("Post created successfully!");
                setCreatePostOpen(false);
                setSelectedEvent("");
                setPostContent("");
                fetchPosts();
            } else {
                const error = await res.json();
                throw new Error(error.error);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to create post");
        }
    };

    /* =====================
       Render
    ===================== */

    const pendingEvents = events.filter(e => e.registrationStatus === 'pending');
    const upcomingEvents = events.filter(e =>
        (e.registrationStatus === 'approved' || e.registrationStatus === 'owner') &&
        new Date(e.dateStart) >= new Date() // Chỉ hiện các sự kiện chưa diễn ra
    );
    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            <div>
                <h1 className="text-3xl font-bold">My Events Feed</h1>
                <p className="text-muted-foreground mt-2">Track your volunteer journey and share your experiences</p>
            </div>

            {/* Pending & Upcoming Sections */}
            {pendingEvents.length > 0 && (
                <Card>
                    <CardHeader><h3 className="text-xl font-semibold">Pending Approval</h3></CardHeader>
                    <CardContent className="space-y-3">
                        {pendingEvents.map((event) => (
                            <div key={event.registrationId} className="flex items-start justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50/50">
                                <div>
                                    <h4 className="font-medium">{event.title}</h4>
                                    <p className="text-sm text-muted-foreground">Waiting for manager approval</p>
                                </div>
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><h3 className="text-xl font-semibold">Your Upcoming Events</h3></CardHeader>
                <CardContent className="space-y-3">
                    {loading ? <p className="text-center">Loading...</p> : upcomingEvents.map((event) => (
                        <div key={event.registrationId} className="p-3 rounded-lg border hover:border-primary">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Community Updates */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Community Updates</h2>

                {postsLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading feed...</div>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <Card key={post._id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div>
                                    <p className="font-bold">{post.authorId?.name || "Volunteer"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Volunteered at <span className="text-primary font-medium">{post.eventId?.title}</span>
                                        {" • "}{new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                                {/* Like & Comment Controls */}
                                <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-muted">
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center gap-1.5 text-sm transition-colors ${
                                                // Kiểm tra xem ID người dùng có trong mảng likes không
                                                post.likes?.some(id => String(id) === String(currentUserId))
                                                    ? "text-red-500 font-bold"
                                                    : "text-muted-foreground hover:text-red-500"
                                            }`}
                                        >
                                            <Heart
                                                className={`h-4 w-4 ${
                                                    post.likes?.some(id => String(id) === String(currentUserId))
                                                        ? "fill-red-500 text-red-500"
                                                        : ""
                                                }`}
                                                // Lấp đầy màu cho trái tim khi đã like
                                                fill={post.likes?.some(id => String(id) === String(currentUserId)) ? "currentColor" : "none"}
                                            />
                                            <span>{post.likes?.length || 0} Likes</span>
                                        </button>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>Comment</span>
                                        </div>
                                    </div>

                                    {post.comments && post.comments.length > 0 && (
                                        <div className="space-y-3 mt-2">
                                            {post.comments.map((comment) => (
                                                <div key={comment._id} className="bg-muted/30 p-2 rounded-lg text-sm">
                                                    <span className="font-bold mr-2">{comment.authorId?.name}:</span>
                                                    <span className="text-muted-foreground">{comment.content}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Input Field */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            className="flex-1 text-sm border rounded-full px-4 py-1.5 bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
                                            value={commentTexts[post._id] || ""}
                                            onChange={(e) => setCommentTexts({ ...commentTexts, [post._id]: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post._id)}
                                        />
                                        <Button size="sm" variant="ghost" className="rounded-full" onClick={() => handleSendComment(post._id)}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card><CardContent className="py-12 text-center text-muted-foreground"><p>No posts yet.</p></CardContent></Card>
                )}
            </div>

            {/* Floating Create Post Button */}
            <Button
                size="lg"
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
                onClick={() => setCreatePostOpen(true)}
                disabled={events.length === 0}
            >
                <Plus className="h-6 w-6" />
            </Button>

            {/* Create Post Dialog */}
            <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Share Your Experience</DialogTitle>
                        <DialogDescription>Tell others about your recent activity</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Event</Label>
                            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
                                <SelectContent>
                                    {events.map((event) => (
                                        <SelectItem key={event._id} value={event._id}>
                                            {event.title} <span className="text-xs opacity-50">({event.registrationStatus})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Your Story</Label>
                            <Textarea
                                placeholder="What happened today?"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                className="min-h-[150px]"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCreatePostOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreatePost}>Post</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}