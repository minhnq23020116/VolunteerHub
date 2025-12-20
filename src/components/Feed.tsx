import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

import { toast } from "sonner";

interface MyEvent {
    _id: string;
    title: string;
    category?: string;
    dateStart: string;
    dateEnd: string;
    location?: string;
    createdBy: {
        name: string;
    };
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
                    "http://localhost:4000/api/events/my-registered",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!res.ok) throw new Error("Failed to fetch my events");

                const data = await res.json();
                setEvents(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, []);

    /* =====================
       Derived lists
    ===================== */

    const upcomingEvents = events.filter(
        (e) => !e.contributionConfirmed
    );

    const contributedEvents = events.filter(
        (e) => e.contributionConfirmed
    );

    /* =====================
       Handlers
    ===================== */

    const handleCreatePost = () => {
        if (!selectedEvent || !postContent.trim()) {
            toast.error("Please select an event and write your post");
            return;
        }

        // TODO: call POST /api/posts
        toast.success("Post created successfully!");

        setCreatePostOpen(false);
        setSelectedEvent("");
        setPostContent("");
    };

    /* =====================
       Render
    ===================== */

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1>My Events Feed</h1>
                <p className="text-muted-foreground mt-2">
                    Events you have registered for
                </p>
            </div>

            {/* Upcoming Events */}
            <Card>
                <CardHeader>
                    <h3>Your Upcoming Events</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loading ? (
                        <p className="text-muted-foreground text-center py-4">
                            Loading events...
                        </p>
                    ) : upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event) => (
                            <div
                                key={event._id}
                                className="flex items-start gap-4 p-3 rounded-lg border"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="line-clamp-1">{event.title}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {event.createdBy.name}
                                            </p>
                                        </div>
                                        {event.category && (
                                            <Badge variant="secondary">{event.category}</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(event.dateStart).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            You haven't signed up for any events yet.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Contributed Events */}
            <Card>
                <CardHeader>
                    <h3>Contributed Events</h3>
                    <p className="text-sm text-muted-foreground">
                        Events where your participation is confirmed
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                    {contributedEvents.length > 0 ? (
                        contributedEvents.map((event) => (
                            <div
                                key={event._id}
                                className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="line-clamp-1">{event.title}</h4>
                                        <Badge className="text-xs">Confirmed</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {event.createdBy.name}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-4">
                            No confirmed contributions yet.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Community Posts (placeholder) */}
            <div>
                <h2 className="mb-4">Community Updates</h2>
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Community posts will appear here.
                    </CardContent>
                </Card>
            </div>

            {/* Floating Action Button */}
            <Button
                size="lg"
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
                onClick={() => setCreatePostOpen(true)}
            >
                <Plus className="h-6 w-6" />
            </Button>

            {/* Create Post Dialog */}
            <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Create a Post</DialogTitle>
                        <DialogDescription>
                            Share your volunteer experience
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
                                    {events.map((event) => (
                                        <SelectItem key={event._id} value={event._id}>
                                            {event.title}
                                        </SelectItem>
                                    ))}
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
                            <Button onClick={handleCreatePost}>Post</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
