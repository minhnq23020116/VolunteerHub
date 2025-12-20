import { useState, useEffect } from 'react';
import { Search, Check, X, Trash2, Eye, Download, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

const API_URL = 'http://localhost:4000/api';

interface Event {
  _id: string;
  title: string;
  description: string;
  category?: string;
  dateStart: string;
  dateEnd: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  attendeesCount: number;
}

export function AdminEventManager() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const authHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please login first.');
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Fetch all events (including pending/rejected)
  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const headers = authHeader();
      if (!headers) return;

      const res = await fetch(`${API_URL}/admin/events/all`, {
        headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized. Please login again.');
        }
        if (res.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setAllEvents(data);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to load events';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const pendingEvents = allEvents.filter(e => e.status === 'pending');
  const filteredEvents = allEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.createdBy?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApproveEvent = async (eventId: string) => {
    try {
      const headers = authHeader();
      if (!headers) return;

      const res = await fetch(`${API_URL}/admin/events/${eventId}/approve`, {
        method: 'PATCH',
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to approve event');
      }

      const updatedEvent = await res.json();
      
      // Update local state
      setAllEvents(allEvents.map(e => 
        e._id === eventId ? updatedEvent : e
      ));
      
      toast.success('Event approved and published');
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve event');
      console.error('Approve error:', err);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    try {
      const headers = authHeader();
      if (!headers) return;

      const res = await fetch(`${API_URL}/admin/events/${eventId}/reject`, {
        method: 'PATCH',
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject event');
      }

      const updatedEvent = await res.json();
      
      // Update local state
      setAllEvents(allEvents.map(e => 
        e._id === eventId ? updatedEvent : e
      ));
      
      toast.success('Event rejected');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject event');
      console.error('Reject error:', err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const headers = authHeader();
      if (!headers) return;

      // Note: You may need to add a DELETE route in events_admin.js
      const res = await fetch(`${API_URL}/admin/events/${eventId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete event');
      }

      // Update local state
      setAllEvents(allEvents.filter(e => e._id !== eventId));
      setSelectedEvent(null);
      
      toast.success('Event deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete event');
      console.error('Delete error:', err);
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ['Title', 'Organization', 'Start Date', 'End Date', 'Location', 'Category', 'Status', 'Created By', 'Attendees'],
      ...allEvents.map(event => [
        event.title,
        event.createdBy?.name || 'N/A',
        new Date(event.dateStart).toLocaleDateString(),
        new Date(event.dateEnd).toLocaleDateString(),
        event.location,
        event.category || 'N/A',
        event.status,
        event.createdBy?.email || 'N/A',
        event.attendeesCount.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Event data exported successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="link" 
              className="ml-2 h-auto p-0"
              onClick={fetchAllEvents}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Event Manager</h1>
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
      {pendingEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pending Event Approvals ({pendingEvents.length})
            </CardTitle>
            <CardDescription>
              Review and approve events created by managers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <div key={event._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <p className="text-muted-foreground">
                        {event.createdBy?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Created by: {event.createdBy?.email || 'Unknown'}
                      </p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  
                  <p className="text-sm mb-3">{event.description}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-muted-foreground">Start:</span> {formatDate(event.dateStart)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">End:</span> {formatDate(event.dateEnd)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span> {event.location}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span> {event.category || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproveEvent(event._id)}
                      className="gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectEvent(event._id)}
                      className="gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedEvent(event)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
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
          <CardTitle>All Events ({allEvents.length})</CardTitle>
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
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event._id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.createdBy?.name || 'Unknown'}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            event.status === 'approved' 
                              ? 'default' 
                              : event.status === 'pending'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.dateStart)} • {event.location}
                      </p>
                      {event.category && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          {event.category}
                        </Badge>
                      )}
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
                        onClick={() => handleDeleteEvent(event._id)}
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'No events found matching your search.' 
                    : 'No events available.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View detailed information about this event
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                <p className="text-muted-foreground">
                  {selectedEvent.createdBy?.name || 'Unknown Organization'}
                </p>
                <Badge className="mt-2" variant={
                  selectedEvent.status === 'approved' 
                    ? 'default' 
                    : selectedEvent.status === 'pending'
                    ? 'secondary'
                    : 'destructive'
                }>
                  {selectedEvent.status}
                </Badge>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p>{selectedEvent.description || 'No description provided'}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p>{formatDate(selectedEvent.dateStart)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p>{formatDate(selectedEvent.dateEnd)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p>{selectedEvent.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p>{selectedEvent.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Attendees</p>
                  <p>{selectedEvent.attendeesCount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created By</p>
                  <p>{selectedEvent.createdBy?.email || 'N/A'}</p>
                </div>
              </div>

              {selectedEvent.status === 'pending' && (
                <>
                  <Separator />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        handleApproveEvent(selectedEvent._id);
                        setSelectedEvent(null);
                      }}
                      className="gap-2 flex-1"
                    >
                      <Check className="h-4 w-4" />
                      Approve Event
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleRejectEvent(selectedEvent._id);
                        setSelectedEvent(null);
                      }}
                      className="gap-2 flex-1"
                    >
                      <X className="h-4 w-4" />
                      Reject Event
                    </Button>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteEvent(selectedEvent._id);
                  }}
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