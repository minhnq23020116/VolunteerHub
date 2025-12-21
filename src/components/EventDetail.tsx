import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    Share2,
    Heart,
    MessageSquare,
    Send,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";

/* =====================
   Types
===================== */

export interface VolunteerEvent {
    _id: string;
    title: string;
    description?: string;
    category?: string;
    dateStart: string;
    dateEnd: string;
    location?: string;
    status: string;
    createdBy: {
        name: string;
        email: string;
    };
    totalSpots?: number;
    spotsAvailable?: number;
}

interface Registration {
    _id: string;
    eventId: string | { _id: string; [key: string]: any };
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

interface EventDetailProps {
    eventId: string;
    onBack: () => void;
}

/* =====================
   Component
===================== */

export function EventDetail({ eventId, onBack }: EventDetailProps) {
    const [event, setEvent] = useState<VolunteerEvent | null>(null);
    const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);
    const [canViewPosts, setCanViewPosts] = useState(false);
    const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});

    // Get user role from localStorage
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const userRole = userObj?.role || 'volunteer';
    const currentUserId = userObj?.id;

    /* =====================
       Fetch event and registration
    ===================== */

    const fetchEvent = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/events/${eventId}`);
            if (!res.ok) throw new Error("Event not found");
            const data = await res.json();
            setEvent(data);
        } catch (err) {
            console.error("Failed to fetch event:", err);
            setEvent(null);
        }
    };

    const fetchMyRegistration = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("http://localhost:4000/api/registrations/me/history", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) return;

            const data: Registration[] = await res.json();
            
            // Find registration for this event
            const reg = data.find((r) => {
                const regEventId = typeof r.eventId === 'string' 
                    ? r.eventId 
                    : r.eventId._id;
                return regEventId === eventId && r.status !== 'cancelled';
            });

            setMyRegistration(reg || null);

            // Determine if user can view posts for this event
            if (userRole === 'admin') {
                setCanViewPosts(true);
            } else if (userRole === 'manager') {
                // Check if user is the event owner (will check after event is loaded)
                setCanViewPosts(false); // Will update after event fetch
            } else if (userRole === 'volunteer') {
                // Can view if approved or completed
                setCanViewPosts(reg && (reg.status === 'approved' || reg.status === 'completed') || false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPosts = async () => {
        if (!canViewPosts) {
            setPostsLoading(false);
            return;
        }

        setPostsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/api/posts/feed", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (!res.ok) throw new Error();
            
            const allPosts = await res.json();
            
            // Filter posts for this specific event
            const eventPosts = allPosts.filter((post: Post) => 
                post.eventId._id === eventId
            );
            
            setPosts(eventPosts);
        } catch (err) {
            console.error("Failed to fetch posts:", err);
        } finally {
            setPostsLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchEvent();
            await fetchMyRegistration();
            setLoading(false);
        };
        loadData();
    }, [eventId]);

    // Fetch posts after permissions are determined
    useEffect(() => {
        if (!loading && event) {
            // Update canViewPosts for manager based on event ownership
            if (userRole === 'manager' && event.createdBy) {
                const isOwner = userObj?.id === event.createdBy._id;
                setCanViewPosts(isOwner);
            }
        }
    }, [loading, event, userRole]);

    useEffect(() => {
        if (canViewPosts) {
            fetchPosts();
        }
    }, [canViewPosts]);

    /* =====================
       Registration actions
    ===================== */

    const handleSignUp = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to register for events");
                return;
            }

            const res = await fetch(`http://localhost:4000/api/registrations/${eventId}/register`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Registration failed");
            }

            toast.success("Registration submitted! Waiting for approval.");
            await fetchMyRegistration(); // Refresh registration status
        } catch (err: any) {
            toast.error(err.message || "Failed to register");
        }
    };

    const handleCancelRegistration = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`http://localhost:4000/api/registrations/${eventId}/cancel`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error();

            toast.success("Registration cancelled");
            await fetchMyRegistration(); // Refresh registration status
        } catch (err) {
            toast.error("Failed to cancel registration");
        }
    };

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
                fetchPosts(); // Reload posts to show new comment
            }
        } catch (err) {
            toast.error("Failed to comment");
        }
    };

    /* =====================
       Helpers
    ===================== */

    const isEventInFuture = (dateStart: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dateStart) >= today;
    };

    /* =====================
       States
    ===================== */

    if (loading) {
        return <p className="text-center py-12 text-muted-foreground">Loading event...</p>;
    }

    if (!event) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Discovery
                </Button>
                <p className="text-center py-12 text-muted-foreground">Event not found</p>
            </div>
        );
    }

    const isRegistered = !!myRegistration;
    const isFuture = isEventInFuture(event.dateStart);

    /* =====================
       Render
    ===================== */

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Discovery
            </Button>

            {/* Hero Section */}
            <div className="relative h-[400px] rounded-lg overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    {event.category && (
                        <Badge className="mb-4 capitalize">{event.category}</Badge>
                    )}
                    <h1 className="text-4xl font-bold text-white mb-2">{event.title}</h1>
                    <p className="text-xl text-white/90">{event.createdBy.name}</p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-2xl font-bold">About This Event</h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                {event.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date & Time</p>
                                        <p className="font-medium">
                                            {new Date(event.dateStart).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(event.dateStart).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}{" "}
                                            -{" "}
                                            {new Date(event.dateEnd).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">{event.location || "TBA"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Community Posts */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-xl font-semibold">Community Posts</h3>
                            {!canViewPosts && (
                                <p className="text-sm text-muted-foreground">
                                    {userRole === 'volunteer' 
                                        ? 'Register and get approved to see posts from this event'
                                        : 'You need to be the event owner to view posts'}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            {!canViewPosts ? (
                                <div className="py-12 text-center text-muted-foreground">
                                    <p>You don't have permission to view posts for this event.</p>
                                </div>
                            ) : postsLoading ? (
                                <div className="py-8 text-center text-muted-foreground">Loading posts...</div>
                            ) : posts.length > 0 ? (
                                <div className="space-y-6">
                                    {posts.map((post) => (
                                        <div key={post._id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                            <div className="mb-3">
                                                <p className="font-bold">{post.authorId?.name || "Volunteer"}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

                                            {/* Like & Comment */}
                                            <div className="flex flex-col gap-4 pt-4 border-t border-muted">
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

                                                {/* Comments */}
                                                {post.comments && post.comments.length > 0 && (
                                                    <div className="space-y-3">
                                                        {post.comments.map((comment) => (
                                                            <div key={comment._id} className="bg-muted/30 p-2 rounded-lg text-sm">
                                                                <span className="font-bold mr-2">{comment.authorId?.name}:</span>
                                                                <span className="text-muted-foreground">{comment.content}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Comment Input */}
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
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-muted-foreground">
                                    <p>No posts yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Join Event */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-xl font-semibold">Join This Event</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {event.spotsAvailable ?? "∞"} spots available
                                    </p>
                                    {event.totalSpots && (
                                        <p className="text-sm text-muted-foreground">
                                            of {event.totalSpots} total
                                        </p>
                                    )}
                                </div>
                            </div>

                            {userRole === 'volunteer' ? (
                                // Only volunteers can register
                                isFuture ? (
                                    isRegistered ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-muted rounded-md">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">Registration Status</span>
                                                    <Badge
                                                        variant={
                                                            myRegistration.status === 'approved'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="capitalize"
                                                    >
                                                        {myRegistration.status}
                                                    </Badge>
                                                </div>
                                                {myRegistration.status === 'pending' && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Waiting for organizer approval
                                                    </p>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full"
                                                onClick={handleCancelRegistration}
                                            >
                                                Cancel Registration
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={handleSignUp}
                                        >
                                            Sign Up to Volunteer
                                        </Button>
                                    )
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="w-full justify-center py-3 text-base"
                                    >
                                        Event Completed
                                    </Badge>
                                )
                            ) : (
                                // Managers and Admins see info message
                                <div className="p-4 bg-muted rounded-md text-center">
                                    <p className="text-sm text-muted-foreground">
                                        {userRole === 'manager' 
                                            ? 'As a manager, you can view event details but cannot register as a volunteer.'
                                            : 'As an admin, you can view event details but cannot register as a volunteer.'
                                        }
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Organizer */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-xl font-semibold">Organizer</h3>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="text-lg">
                                        {event.createdBy.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{event.createdBy.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Event Organizer
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Share */}
                    <Card>
                        <CardHeader>
                            <h3 className="text-xl font-semibold">Share This Event</h3>
                        </CardHeader>
                        <CardContent>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success("Link copied to clipboard!");
                                }}
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Event
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}