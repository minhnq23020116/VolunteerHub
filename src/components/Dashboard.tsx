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

import { EventDetail, VolunteerEvent } from "./EventDetail";

/* =====================
   Dashboard
===================== */

export function Dashboard() {
    const [events, setEvents] = useState<VolunteerEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    /* =====================
       Fetch events from backend
    ===================== */

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/events");
                if (!res.ok) throw new Error("Failed to fetch events");
                const data = await res.json();
                setEvents(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    /* =====================
       Helpers
    ===================== */

    const isEventInFuture = (dateStart: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(dateStart) >= today;
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

        return matchesSearch && matchesCategory && matchesDate;
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
                <h1>Discover Volunteer Opportunities</h1>
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
                                {c === "all" ? "All" : c}
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
                <p className="text-center py-12">Loading events...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <Card
                            key={event._id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => setSelectedEventId(event._id)}
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                                    alt={event.title}
                                    className="w-full h-full object-cover"
                                />
                                {event.category && (
                                    <Badge className="absolute top-3 right-3">
                                        {event.category}
                                    </Badge>
                                )}
                            </div>

                            <CardHeader>
                                <CardTitle>{event.title}</CardTitle>
                                <CardDescription>
                                    {event.createdBy.name}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-2">
                                <div className="flex items-start gap-2 text-sm">
                                    <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <div>
                                        {new Date(event.dateStart).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-sm">
                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                    <span>{event.location || "TBA"}</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span>
                    {event.spotsAvailable ?? "∞"} spots available
                  </span>
                                </div>

                                {!isEventInFuture(event.dateStart) && (
                                    <Badge variant="outline" className="mt-2">
                                        Event Completed
                                    </Badge>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {!loading && filteredEvents.length === 0 && (
                <p className="text-center py-12 text-muted-foreground">
                    No events found matching your criteria.
                </p>
            )}
        </div>
    );
}
