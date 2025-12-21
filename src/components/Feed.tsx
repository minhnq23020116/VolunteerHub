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

interface Event {
    _id: string;
    title: string;
    description?: string;
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
}

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
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [contributedEvents, setContributedEvents] = useState<Event[]>([]);
    const [postableEvents, setPostableEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    const [createPostOpen, setCreatePostOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [postContent, setPostContent] = useState("");
    const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});

    // Get user info
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const currentUserId = userObj?.id;
    const userRole = userObj?.role || 'volunteer';

    /* =====================
       Fetch Data Functions
    ===================== */

    const fetchPosts = async () => {
        setPostsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/posts/feed", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
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
            if (!token) {
                setLoading(false);
                return;
            }
            
            const headers = { Authorization: `Bearer ${token}` };
            const role = userRole;

            if (role === 'volunteer') {
                const regRes = await fetch("http://localhost:4000/api/registrations/me/history", { headers });

                if (regRes.ok) {
                    const regData: Registration[] = await regRes.json();
                    
                    const upcoming = regData
                        .filter(reg => 
                            reg.eventId && 
                            reg.status === 'approved' && 
                            new Date(reg.eventId.dateStart) >= new Date()
                        )
                        .map(reg => ({
                            _id: reg.eventId._id,
                            title: reg.eventId.title,
                            description: '',
                            category: reg.eventId.category,
                            dateStart: reg.eventId.dateStart,
                            dateEnd: reg.eventId.dateEnd,
                            location: reg.eventId.location || '',
                            status: reg.eventId.status,
                            createdBy: reg.eventId.createdBy
                        }));
                    
                    const contributed = regData
                        .filter(reg => 
                            reg.eventId && 
                            reg.status === 'completed'
                        )
                        .map(reg => ({
                            _id: reg.eventId._id,
                            title: reg.eventId.title,
                            description: '',
                            category: reg.eventId.category,
                            dateStart: reg.eventId.dateStart,
                            dateEnd: reg.eventId.dateEnd,
                            location: reg.eventId.location || '',
                            status: reg.eventId.status,
                            createdBy: reg.eventId.createdBy
                        }));
                    
                    const postable = regData
                        .filter(reg => 
                            reg.eventId && 
                            (reg.status === 'approved' || reg.status === 'completed')
                        )
                        .map(reg => ({
                            _id: reg.eventId._id,
                            title: reg.eventId.title,
                            description: '',
                            category: reg.eventId.category,
                            dateStart: reg.eventId.dateStart,
                            dateEnd: reg.eventId.dateEnd,
                            location: reg.eventId.location || '',
                            status: reg.eventId.status,
                            createdBy: reg.eventId.createdBy
                        }));
                    
                    setUpcomingEvents(upcoming);
                    setContributedEvents(contributed);
                    setPostableEvents(postable);
                }
            } else if (role === 'manager' || role === 'admin') {
                const eventsRes = await fetch("http://localhost:4000/api/events/me", { headers });

                if (eventsRes.ok) {
                    const eventsData = await eventsRes.json();
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);

                    const upcoming = eventsData
                        .filter((ev: any) => new Date(ev.dateStart) >= now)
                        .map((ev: any) => ({
                            _id: ev._id,
                            title: ev.title,
                            description: ev.description || '',
                            category: ev.category,
                            dateStart: ev.dateStart,
                            dateEnd: ev.dateEnd,
                            location: ev.location || '',
                            status: ev.status,
                            createdBy: ev.createdBy
                        }));

                    const contributed = eventsData
                        .filter((ev: any) => new Date(ev.dateStart) < now)
                        .map((ev: any) => ({
                            _id: ev._id,
                            title: ev.title,
                            description: ev.description || '',
                            category: ev.category,
                            dateStart: ev.dateStart,
                            dateEnd: ev.dateEnd,
                            location: ev.location || '',
                            status: ev.status,
                            createdBy: ev.createdBy
                        }));

                    const postable = eventsData.map((ev: any) => ({
                        _id: ev._id,
                        title: ev.title,
                        description: ev.description || '',
                        category: ev.category,
                        dateStart: ev.dateStart,
                        dateEnd: ev.dateEnd,
                        location: ev.location || '',
                        status: ev.status,
                        createdBy: ev.createdBy
                    }));

                    setUpcomingEvents(upcoming);
                    setContributedEvents(contributed);
                    setPostableEvents(postable);
                }
            }
        } catch (err) {
            console.error("Fetch events error:", err);
            toast.error("Failed to load events");
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
                fetchPosts();
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

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            <div>
                <h1 className="text-3xl font-bold">My Events Feed</h1>
                <p className="text-muted-foreground mt-2">
                    Track your volunteer journey and share your experiences
                </p>
            </div>

            {/* Upcoming Events */}
            <Card>
                <CardHeader>
                    <h3 className="text-xl font-semibold">
                        {userRole === 'volunteer' ? 'Your Upcoming Events' : 'Your Upcoming Events'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {userRole === 'volunteer' 
                            ? "Events you're registered for that haven't happened yet"
                            : "Future events you're managing"
                        }
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-center text-muted-foreground py-4">Loading...</p>
                        ) : upcomingEvents.length > 0 ? (
                            upcomingEvents.map((event) => (
                                <div key={event._id} className="flex items-start gap-4 p-3 rounded-lg border hover:border-primary transition-colors">
                                    <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                        <img 
                                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium line-clamp-1">{event.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.createdBy.name}
                                                </p>
                                            </div>
                                            {event.category && (
                                                <Badge variant="secondary" className="capitalize flex-shrink-0">
                                                    {event.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {new Date(event.dateStart).toLocaleDateString()} • {event.location}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                {userRole === 'volunteer' 
                                    ? "No upcoming events. Check the Dashboard to find opportunities!"
                                    : "No upcoming events. Create new events in Event Manager!"
                                }
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Contributed Events */}
            <Card>
                <CardHeader>
                    <h3 className="text-xl font-semibold">
                        {userRole === 'volunteer' ? 'Contributed Events' : 'Past Events'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {userRole === 'volunteer'
                            ? "Events where your contribution has been confirmed by organizers"
                            : "Events you've managed that have already occurred"
                        }
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {loading ? (
                            <p className="text-center text-muted-foreground py-4">Loading...</p>
                        ) : contributedEvents.length > 0 ? (
                            contributedEvents.map((event) => (
                                <div key={event._id} className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30">
                                    <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                                        <img 
                                            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium line-clamp-1">{event.title}</h4>
                                                    <Badge className="shrink-0 text-xs bg-green-100 text-green-800 hover:bg-green-100">
                                                        {userRole === 'volunteer' ? 'Confirmed' : 'Completed'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.createdBy.name}
                                                </p>
                                            </div>
                                            {event.category && (
                                                <Badge variant="secondary" className="capitalize flex-shrink-0">
                                                    {event.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {new Date(event.dateStart).toLocaleDateString()} • {event.location}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">
                                {userRole === 'volunteer'
                                    ? "No confirmed contributions yet. Once event organizers confirm your participation, they will appear here!"
                                    : "No past events yet. Events you manage will appear here after they occur."
                                }
                            </p>
                        )}
                    </div>
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

                                <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-muted">
                                    <div className="flex items-center gap-6">
                                        <button
                                            onClick={() => handleLike(post._id)}
                                            className={`flex items-center gap-1.5 text-sm transition-colors ${
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
                                                fill={post.likes?.some(id => String(id) === String(currentUserId)) ? "currentColor" : "none"}
                                            />
                                            <span>{post.likes?.length || 0} Likes</span>
                                        </button>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{post.comments?.length || 0} Comments</span>
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
                    <Card>
                        <CardContent className="py-12 text-center text-muted-foreground">
                            <p>No posts yet. Be the first to share your experience!</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <Button
                size="lg"
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
                onClick={() => setCreatePostOpen(true)}
                disabled={postableEvents.length === 0}
            >
                <Plus className="h-6 w-6" />
            </Button>

            <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Share Your Experience</DialogTitle>
                        <DialogDescription>
                            Create a post about an event you're participating in or have contributed to
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Event</Label>
                            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose an event" />
                                </SelectTrigger>
                                <SelectContent>
                                    {postableEvents.length > 0 ? (
                                        postableEvents.map((event) => (
                                            <SelectItem key={event._id} value={event._id}>
                                                {event.title}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>
                                            No events available for posting
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Your Story</Label>
                            <Textarea
                                placeholder="Share your experience, what you learned, or how you made an impact..."
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                className="min-h-[150px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                {postContent.length} characters
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setCreatePostOpen(false);
                                    setSelectedEvent("");
                                    setPostContent("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreatePost}
                                disabled={!selectedEvent || !postContent.trim()}
                            >
                                Post
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}