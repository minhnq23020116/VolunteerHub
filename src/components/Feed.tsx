import { useEffect, useState } from "react";
import { Plus, Heart, MessageSquare } from "lucide-react"; // Thêm icon cho sinh động

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

// Interface mới cho Bài viết từ Backend
interface Post {
    _id: string;
    content: string;
    authorId: { _id: string; name: string; avatar?: string };
    eventId: { _id: string; title: string };
    likes: string[];
    createdAt: string;
}

/* =====================
   Component
===================== */

export function Feed() {
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // State cho bài viết cộng đồng
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    const [createPostOpen, setCreatePostOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [postContent, setPostContent] = useState("");

    /* =====================
       Fetch Data Functions
    ===================== */

    // Hàm lấy danh sách bài viết chung
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

    // Hàm lấy sự kiện cá nhân
    const fetchMyEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                "http://localhost:4000/api/registrations/me/history",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) throw new Error("Failed to fetch my events");

            const data: Registration[] = await res.json();

            const transformedEvents: MyEvent[] = data
                .filter(reg => reg.eventId)
                .map(reg => ({
                    registrationId: reg._id,
                    _id: reg.eventId._id,
                    title: reg.eventId.title,
                    category: reg.eventId.category,
                    dateStart: reg.eventId.dateStart,
                    dateEnd: reg.eventId.dateEnd,
                    location: reg.eventId.location,
                    createdBy: {
                        name: reg.eventId.createdBy.name
                    },
                    registrationStatus: reg.status,
                    contributionConfirmed: reg.contributionConfirmed || reg.status === 'completed'
                }));

            setEvents(transformedEvents);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyEvents();
        fetchPosts(); // Gọi fetch bài viết khi mount component
    }, []);

    /* =====================
       Derived lists
    ===================== */

    const upcomingEvents = events.filter(
        (e) => e.registrationStatus === 'approved' && !e.contributionConfirmed
    );

    const pendingEvents = events.filter(
        (e) => e.registrationStatus === 'pending'
    );

    const contributedEvents = events.filter(
        (e) => e.contributionConfirmed || e.registrationStatus === 'completed'
    );

    /* =====================
       Handlers
    ===================== */

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
                body: JSON.stringify({
                    eventId: selectedEvent,
                    content: postContent,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to create post");
            }

            toast.success("Post created successfully!");
            setCreatePostOpen(false);
            setSelectedEvent("");
            setPostContent("");
            fetchPosts(); // Cập nhật lại danh sách bài viết ngay lập tức
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to create post");
        }
    };

    /* =====================
       Render
    ===================== */

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            <div>
                <h1 className="text-3xl font-bold">My Events Feed</h1>
                <p className="text-muted-foreground mt-2">
                    Track your volunteer journey and share your experiences
                </p>
            </div>

            {/* Pending & Upcoming Sections giữ nguyên như cũ... */}
            {pendingEvents.length > 0 && (
                <Card>
                    <CardHeader>
                        <h3 className="text-xl font-semibold">Pending Approval</h3>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingEvents.map((event) => (
                            <div key={event.registrationId} className="flex items-start gap-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50/50">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-medium">{event.title}</h4>
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{new Date(event.dateStart).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <h3 className="text-xl font-semibold">Your Upcoming Events</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? <p className="text-center">Loading...</p> : upcomingEvents.map((event) => (
                        <div key={event.registrationId} className="p-3 rounded-lg border hover:border-primary">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Community Updates Section (ĐÃ CẬP NHẬT DỮ LIỆU THẬT) */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Community Updates</h2>

                {postsLoading ? (
                    <div className="py-8 text-center text-muted-foreground">Loading feed...</div>
                ) : posts.length > 0 ? (
                    posts.map((post) => (
                        <Card key={post._id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold">{post.authorId?.name || "Volunteer"}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Volunteered at <span className="text-primary font-medium">{post.eventId?.title || "Event"}</span>
                                            {" • "}{new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-muted">
                                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors">
                                        <Heart className="h-4 w-4" />
                                        <span>{post.likes?.length || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>Comment</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <p>No community posts yet. Be the first to share!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Floating Button & Dialog giữ nguyên như cũ... */}
            <Button
                size="lg"
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
                onClick={() => setCreatePostOpen(true)}
                disabled={events.length === 0}
            >
                <Plus className="h-6 w-6" />
            </Button>

            <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Share Your Experience</DialogTitle>
                        <DialogDescription>Create a post about your volunteer experience</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Event</Label>
                            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an event" />
                                </SelectTrigger>
                                <SelectContent>
                                    {events.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            You haven't joined any events yet
                                        </div>
                                    ) : (
                                        /* Sửa từ contributedEvents.map thành events.map */
                                        events.map((event) => (
                                            <SelectItem key={event._id} value={event._id}>
                                                {event.title}
                                                {/* Thêm nhãn trạng thái để người dùng dễ phân biệt */}
                                                <span className="ml-2 text-xs opacity-50"> ({event.registrationStatus}) </span>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Your Story</Label>
                            <Textarea
                                placeholder="Share your experience..."
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