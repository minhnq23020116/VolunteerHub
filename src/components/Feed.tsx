import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

import { toast } from "sonner";

// Định nghĩa interface cho Registration response từ backend
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

// Interface cho Event đã được flatten để hiển thị
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

/* =====================
   Component
===================== */

export function Feed() {
    const [events, setEvents] = useState<MyEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [createPostOpen, setCreatePostOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [postContent, setPostContent] = useState("");

    /* =====================
       Fetch my registered events
    ===================== */

    useEffect(() => {
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
                
                // Transform registrations thành events để hiển thị
                const transformedEvents: MyEvent[] = data
                    .filter(reg => reg.eventId) // Chỉ lấy những registration có eventId
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

        fetchMyEvents();
    }, []);

    /* =====================
       Derived lists
    ===================== */

    // Upcoming: approved registrations chưa completed
    const upcomingEvents = events.filter(
        (e) => e.registrationStatus === 'approved' && !e.contributionConfirmed
    );

    // Pending: registrations đang chờ duyệt
    const pendingEvents = events.filter(
        (e) => e.registrationStatus === 'pending'
    );

    // Contributed: registrations đã completed
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

            {/* Pending Registrations */}
            {pendingEvents.length > 0 && (
                <Card>
                    <CardHeader>
                        <h3 className="text-xl font-semibold">Pending Approval</h3>
                        <p className="text-sm text-muted-foreground">
                            Waiting for organizer confirmation
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingEvents.map((event) => (
                            <div
                                key={event.registrationId}
                                className="flex items-start gap-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50/50"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-medium line-clamp-1">{event.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {event.createdBy.name}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                            Pending
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(event.dateStart).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Upcoming Events */}
            <Card>
                <CardHeader>
                    <h3 className="text-xl font-semibold">Your Upcoming Events</h3>
                    <p className="text-sm text-muted-foreground">
                        Approved registrations ready to participate
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? (
                        <p className="text-muted-foreground text-center py-4">
                            Loading events...
                        </p>
                    ) : upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event) => (
                            <div
                                key={event.registrationId}
                                className="flex items-start gap-4 p-3 rounded-lg border hover:border-primary transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-medium line-clamp-1">{event.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {event.createdBy.name}
                                            </p>
                                        </div>
                                        {event.category && (
                                            <Badge variant="secondary">{event.category}</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(event.dateStart).toLocaleDateString()}
                                        </p>
                                        {event.location && (
                                            <>
                                                <span className="text-muted-foreground">•</span>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.location}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            {pendingEvents.length > 0 
                                ? "No approved events yet. Check your pending registrations above."
                                : "You haven't signed up for any events yet."}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Contributed Events */}
            <Card>
                <CardHeader>
                    <h3 className="text-xl font-semibold">Contributed Events</h3>
                    <p className="text-sm text-muted-foreground">
                        Events where your participation has been completed
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                    {contributedEvents.length > 0 ? (
                        contributedEvents.map((event) => (
                            <div
                                key={event.registrationId}
                                className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium line-clamp-1">{event.title}</h4>
                                        <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                                            Completed
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {event.createdBy.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(event.dateStart).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            No completed contributions yet. Keep volunteering!
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Community Posts (placeholder) */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Community Updates</h2>
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <p>Community posts from other volunteers will appear here.</p>
                        <p className="text-sm mt-2">Share your story using the + button below!</p>
                    </CardContent>
                </Card>
            </div>

            {/* Floating Action Button */}
            <Button
                size="lg"
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
                onClick={() => setCreatePostOpen(true)}
                disabled={contributedEvents.length === 0}
            >
                <Plus className="h-6 w-6" />
            </Button>

            {/* Create Post Dialog */}
            <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Share Your Experience</DialogTitle>
                        <DialogDescription>
                            Create a post about your volunteer experience
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Select Event</Label>
                            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a completed event" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contributedEvents.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No completed events to share
                                        </div>
                                    ) : (
                                        contributedEvents.map((event) => (
                                            <SelectItem key={event._id} value={event._id}>
                                                {event.title} - {new Date(event.dateStart).toLocaleDateString()}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Your Story</Label>
                            <Textarea
                                placeholder="Share what you learned, who you met, and how this experience impacted you..."
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