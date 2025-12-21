import { useEffect, useState } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    MapPin,
    Users,
    Filter,
    X,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { toast } from "sonner";

import { EventDetail } from "./EventDetail";

/* =====================
   Types
===================== */

interface Event {
    _id: string;
    title: string;
    description: string;
    category?: string;
    dateStart: string;
    dateEnd: string;
    location: string;
    status: 'pending' | 'approved' | 'rejected';
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    attendeesCount?: number;
}

interface Registration {
    _id: string;
    eventId: string | { _id: string; [key: string]: any };
    userId: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    registeredAt: string;
}

/* =====================
   Dashboard
===================== */

export function Dashboard() {
    const [events, setEvents] = useState<Event[]>([]);
    const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    /* =====================
       Fetch data
    ===================== */

    const fetchEvents = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/events");
            if (!res.ok) throw new Error("Failed to fetch events");
            const data = await res.json();
            setEvents(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load events");
        }
    };

    const fetchMyRegistrations = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return; // User not logged in

            const res = await fetch("http://localhost:4000/api/registrations/me/history", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error();
            const data = await res.json();
            console.log("My registrations:", data); // Debug log
            setMyRegistrations(data);
        } catch (err) {
            console.error(err);
            // Don't show error - user might not be logged in
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchEvents(), fetchMyRegistrations()]);
            setLoading(false);
        };
        loadData();
    }, []);

    /* =====================
       Registration actions
    ===================== */

    const handleSignUp = async (eventId: string) => {
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
            
            // Refresh registrations and wait for it to complete
            await fetchMyRegistrations();
            
            // Force re-render by updating state
            setMyRegistrations(prev => [...prev]);
        } catch (err: any) {
            toast.error(err.message || "Failed to register");
        }
    };

    const handleCancelRegistration = async (eventId: string) => {
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
            await fetchMyRegistrations(); // Refresh registrations
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

    const getEventRegistration = (eventId: string): Registration | undefined => {
        return myRegistrations.find((reg) => {
            // Handle both populated and non-populated eventId
            const regEventId = typeof reg.eventId === 'string' 
                ? reg.eventId 
                : reg.eventId._id;
            
            return regEventId === eventId && reg.status !== 'cancelled';
        });
    };

    /* =====================
       Filters
    ===================== */

    const filteredEvents = events.filter((event) => {
        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.createdBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (event.location || "").toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
            categoryFilter === "all" || event.category === categoryFilter;

        let matchesDate = true;
        if (selectedDate) {
            const eventDate = new Date(event.dateStart);
            matchesDate =
                eventDate.toDateString() === selectedDate.toDateString();
        }

        // Show recent (last month) or future events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const oneMonthAgo = new Date(today);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const eventDate = new Date(event.dateStart);
        const isRecentOrFuture = eventDate >= oneMonthAgo;

        return matchesSearch && matchesCategory && matchesDate && isRecentOrFuture;
    });

    const categories = [
        "all",
        ...Array.from(new Set(events.map((e) => e.category).filter(Boolean))),
    ];

    /* =====================
       Navigation
    ===================== */

    if (selectedEventId) {
        return (
            <EventDetail
                eventId={selectedEventId}
                onBack={() => setSelectedEventId(null)}
            />
        );
    }

    /* =====================
       Render
    ===================== */

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Discover Volunteer Opportunities</h1>
                <p className="text-muted-foreground mt-2">
                    Find meaningful ways to give back to your community
                </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search events, organizations, or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c === "all" ? "All Categories" : c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={selectedDate ? "default" : "outline"}
                            className="w-[180px] justify-start"
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {selectedDate
                                ? selectedDate.toLocaleDateString()
                                : "Select Date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                        />
                        {selectedDate && (
                            <div className="p-3 border-t">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setSelectedDate(undefined)}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear Date
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>

            {/* Events Grid */}
            {loading ? (
                <p className="text-center py-12 text-muted-foreground">Loading events...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => {
                        const registration = getEventRegistration(event._id);
                        const isRegistered = !!registration;
                        const isFuture = isEventInFuture(event.dateStart);

                        return (
                            <Card
                                key={event._id}
                                className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
                                onClick={() => setSelectedEventId(event._id)}
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                                        alt={event.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {event.category && (
                                        <Badge className="absolute top-3 right-3 capitalize">
                                            {event.category}
                                        </Badge>
                                    )}
                                </div>

                                <CardHeader>
                                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                                    <CardDescription className="line-clamp-1">
                                        {event.createdBy.name}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent 
                                    className="space-y-3 flex-1 flex flex-col"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-start gap-2 text-sm">
                                        <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                        <div>
                                            <div>{new Date(event.dateStart).toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-sm">
                                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                        <span className="line-clamp-1">{event.location || "TBA"}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {event.attendeesCount ?? "∞"} volunteers
                                        </span>
                                    </div>

                                    {event.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                                            {event.description}
                                        </p>
                                    )}

                                    {/* Registration Actions */}
                                    <div className="pt-2 mt-auto">
                                        {isFuture ? (
                                            isRegistered ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                                                        <div className="flex items-center gap-2">
                                                            <Badge 
                                                                variant={
                                                                    registration.status === 'approved' 
                                                                        ? 'default' 
                                                                        : 'secondary'
                                                                }
                                                                className="capitalize"
                                                            >
                                                                {registration.status}
                                                            </Badge>
                                                            <span className="text-sm">Registration status</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => handleCancelRegistration(event._id)}
                                                    >
                                                        Cancel Registration
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    className="w-full"
                                                    onClick={() => handleSignUp(event._id)}
                                                >
                                                    Sign Up
                                                </Button>
                                            )
                                        ) : (
                                            <Badge variant="outline" className="w-full justify-center py-2">
                                                Event Completed
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {!loading && filteredEvents.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No events found matching your criteria.
                    </p>
                </div>
            )}
        </div>
    );
}