import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    Share2,
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
    const [loading, setLoading] = useState(true);

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
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchEvent(), fetchMyRegistration()]);
            setLoading(false);
        };
        loadData();
    }, [eventId]);

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
                        </CardHeader>
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

                            {isFuture ? (
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