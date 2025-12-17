import { useState } from 'react';
import { Search, Calendar as CalendarIcon, MapPin, Users, Filter, X, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { volunteerEvents, VolunteerEvent, posts } from '../data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { EventDetail } from './EventDetail';

export function Dashboard() {
  const [events, setEvents] = useState(volunteerEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<VolunteerEvent | null>(null);

  const handleSignUp = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { 
        ...event, 
        isSignedUp: true, 
        registrationStatus: 'pending',
        spotsAvailable: event.spotsAvailable - 1 
      } : event
    ));
  };

  const handleCancelRegistration = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId ? { 
        ...event, 
        isSignedUp: false, 
        registrationStatus: undefined,
        spotsAvailable: event.spotsAvailable + 1 
      } : event
    ));
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    let matchesDate = true;
    if (selectedDate) {
      const eventDate = new Date(event.date);
      matchesDate = eventDate.toDateString() === selectedDate.toDateString();
    }
    
    // Only show events from the last month or future events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const eventDate = new Date(event.date);
    const isRecentOrFuture = eventDate >= oneMonthAgo;
    
    return matchesSearch && matchesCategory && matchesDate && isRecentOrFuture;
  });

  // Helper function to check if an event is in the future
  const isEventInFuture = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    return event >= today;
  };

  const categories = ['all', ...Array.from(new Set(events.map(e => e.category)))];

  const handleViewEvent = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedEvent(null);
  };

  // If an event is selected, show the detail view
  if (selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        onBack={handleBackToDashboard}
        onSignUp={handleSignUp}
        onCancelRegistration={handleCancelRegistration}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1>Discover Volunteer Opportunities</h1>
        <p className="text-muted-foreground mt-2">
          Find meaningful ways to give back to your community
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search events, organizations, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={selectedDate ? "default" : "outline"} className="w-[180px] justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {selectedDate ? selectedDate.toLocaleDateString() : "Select Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
              {selectedDate && (
                <div className="p-3 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    size="sm"
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
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card 
            key={event.id} 
            className="overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleViewEvent(event.id)}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-3 right-3">
                {event.category}
              </Badge>
            </div>
            <CardHeader>
              <CardTitle>{event.title}</CardTitle>
              <CardDescription>{event.organization}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-2 flex-1">
                <div className="flex items-start gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div>{event.date}</div>
                    <div className="text-muted-foreground">{event.time}</div>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.spotsAvailable} spots available</span>
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  {event.description}
                </p>
              </div>
              {isEventInFuture(event.date) ? (
                event.isSignedUp ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {event.registrationStatus || 'Registered'}
                        </Badge>
                        <span className="text-sm">Registration status</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleCancelRegistration(event.id)}
                    >
                      Cancel Registration
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full mt-4"
                    onClick={() => handleSignUp(event.id)}
                  >
                    Sign Up
                  </Button>
                )
              ) : (
                <div className="mt-4">
                  <Badge variant="outline" className="w-full justify-center py-2">
                    Event Completed
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No events found matching your criteria.</p>
        </div>
      )}

      {/* Trending Posts Section */}
      <div className="mt-12 space-y-6">
        <div>
          <h2>Trending Posts</h2>
          <p className="text-muted-foreground mt-2">
            See what volunteers are sharing from events around the community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.slice(0, 4).map((post) => (
            <Card key={post.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={post.authorAvatar} alt={post.author} />
                    <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p>{post.author}</p>
                    <p className="text-sm text-muted-foreground">
                      Volunteered at {post.eventTitle} • {post.timestamp}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <p className="flex-1">{post.content}</p>
                {post.image && (
                  <img 
                    src={post.image} 
                    alt="Post content"
                    className="w-full rounded-lg object-cover max-h-64"
                  />
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{post.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{post.comments}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 h-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewEvent(post.eventId)}
                  >
                    View Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
