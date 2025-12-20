import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    Heart,
    MessageCircle,
    Share2,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";

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

interface EventDetailProps {
    eventId: string;
    onBack: () => void;
    onSignUp?: (eventId: string) => void;
    onCancelRegistration?: (eventId: string) => void;
}

/* =====================
   Component
===================== */

export function EventDetail({
                                eventId,
                                onBack,
                                onSignUp,
                                onCancelRegistration,
                            }: EventDetailProps) {
    const [event, setEvent] = useState<VolunteerEvent | null>(null);
    const [loading, setLoading] = useState(true);

    /* =====================
       Fetch event from DB
    ===================== */

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(
                    `http://localhost:4000/api/events/${eventId}`
                );

                if (!res.ok) throw new Error("Event not found");

                const data = await res.json();
                setEvent(data);
            } catch (err) {
                console.error("Failed to fetch event:", err);
                setEvent(null);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [eventId]);

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
        return <p className="text-center py-12">Loading event...</p>;
    }

    if (!event) {
        return <p className="text-center py-12">Event not found</p>;
    }

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
                    {event.category && <Badge className="mb-4">{event.category}</Badge>}
                    <h1 className="text-white mb-2">{event.title}</h1>
                    <p className="text-xl text-white/90">
                        {event.createdBy.name}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <Card>
                        <CardHeader>
                            <h2>About This Event</h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                {event.description || "No description provided."}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <div className="flex items-start gap-3">
                                    <CalendarIcon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Date & Time
                                        </p>
                                        <p>
                                            {new Date(event.dateStart).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm">
                                            {new Date(event.dateStart).toLocaleTimeString()} –{" "}
                                            {new Date(event.dateEnd).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Location
                                        </p>
                                        <p>{event.location || "TBA"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Community Posts (Chưa có API) */}
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No posts yet. Be the first to volunteer and share your experience!
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Join Event */}
                    <Card>
                        <CardHeader>
                            <h3>Join This Event</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p>{event.spotsAvailable ?? "∞"} spots available</p>
                                    {event.totalSpots && (
                                        <p className="text-sm text-muted-foreground">
                                            of {event.totalSpots} total
                                        </p>
                                    )}
                                </div>
                            </div>

                            {isEventInFuture(event.dateStart) ? (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={() => onSignUp?.(event._id)}
                                >
                                    Sign Up to Volunteer
                                </Button>
                            ) : (
                                <Badge
                                    variant="outline"
                                    className="w-full justify-center py-3"
                                >
                                    Event Completed
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    {/* Organizer */}
                    <Card>
                        <CardHeader>
                            <h3>Organizer</h3>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarFallback>
                                        {event.createdBy.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p>{event.createdBy.name}</p>
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
                            <h3>Share This Event</h3>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" size="sm" className="w-full">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
