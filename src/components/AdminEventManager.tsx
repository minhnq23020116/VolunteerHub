import { useState } from 'react';
import { Search, Check, X, Trash2, Eye, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { pendingEvents, allEvents } from '../data/mockData';
import { toast } from 'sonner@2.0.3';

export function AdminEventManager() {
  const [pendingEventsList, setPendingEventsList] = useState(pendingEvents);
  const [events, setEvents] = useState(allEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<typeof allEvents[0] | null>(null);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApproveEvent = (eventId: string) => {
    setPendingEventsList(pendingEventsList.filter(event => event.id !== eventId));
    toast.success('Event approved and published');
  };

  const handleRejectEvent = (eventId: string) => {
    setPendingEventsList(pendingEventsList.filter(event => event.id !== eventId));
    toast.success('Event rejected');
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    setSelectedEvent(null);
    toast.success('Event deleted');
  };

  const handleExportData = () => {
    const csvContent = [
      ['Title', 'Organization', 'Date', 'Time', 'Location', 'Category', 'Total Spots', 'Status', 'Created By'],
      ...events.map(event => [
        event.title,
        event.organization,
        event.date,
        event.time,
        event.location,
        event.category,
        event.totalSpots.toString(),
        event.status,
        event.createdBy
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events-data.csv';
    a.click();
    
    toast.success('Event data exported successfully');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>Event Manager</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage all volunteer events
          </p>
        </div>
        <Button onClick={handleExportData} className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Pending Events */}
      {pendingEventsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pending Event Approvals
            </CardTitle>
            <CardDescription>
              Review and approve events created by managers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingEventsList.map((event) => (
                <div key={event.id} className="border rounded-lg overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0">
                      <img 
                        src={event.image} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-3 right-3">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3>{event.title}</h3>
                          <p className="text-muted-foreground">{event.organization}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Created by: {event.createdBy}
                          </p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <p className="text-sm mb-3">{event.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Date:</span> {event.date}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span> {event.time}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span> {event.location}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Spots:</span> {event.totalSpots}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveEvent(event.id)}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectEvent(event.id)}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Events */}
      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
          <CardDescription>
            Search and manage all volunteer events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by title, organization, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Event List */}
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-24 h-24 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <p>{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.organization}</p>
                      </div>
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.date} • {event.location}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedEvent(event)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events found matching your search.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View detailed information about this event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 right-3">
                  {selectedEvent.category}
                </Badge>
              </div>

              <div>
                <h3>{selectedEvent.title}</h3>
                <p className="text-muted-foreground">{selectedEvent.organization}</p>
                <Badge className="mt-2" variant={selectedEvent.status === 'active' ? 'default' : 'secondary'}>
                  {selectedEvent.status}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p>{selectedEvent.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{selectedEvent.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p>{selectedEvent.time}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{selectedEvent.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spots</p>
                  <p>{selectedEvent.totalSpots}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p>{selectedEvent.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p>{selectedEvent.createdBy}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Event
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
