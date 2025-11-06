import { useState } from 'react';
import { Plus, Info, Users, CheckCircle, FileText, Search, Calendar, MapPin, Clock, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { managedEvents, eventVolunteers, type ManagedEvent, type EventVolunteer } from '../data/mockData';
import { toast } from 'sonner@2.0.3';

export function EventManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events] = useState<ManagedEvent[]>(managedEvents);
  const [selectedEvent, setSelectedEvent] = useState<ManagedEvent | null>(null);
  const [dialogType, setDialogType] = useState<'info' | 'volunteers' | 'confirm' | 'report' | 'create' | null>(null);

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventVolunteers = (eventId: string) => {
    return eventVolunteers.filter(v => v.eventId === eventId);
  };

  const handleApproveVolunteer = (volunteerId: string) => {
    toast.success('Volunteer approved successfully!');
  };

  const handleRejectVolunteer = (volunteerId: string) => {
    toast.success('Volunteer registration rejected.');
  };

  const handleConfirmContribution = (volunteerId: string) => {
    toast.success('Volunteer contribution confirmed!');
  };

  const openDialog = (type: typeof dialogType, event?: ManagedEvent) => {
    if (event) setSelectedEvent(event);
    setDialogType(type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Event Manager</h1>
          <p className="text-muted-foreground">
            Manage your hosted events and volunteers
          </p>
        </div>
        <Dialog open={dialogType === 'create'} onOpenChange={(open) => !open && setDialogType(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => setDialogType('create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Fill in the details for your new volunteer event</DialogDescription>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success('Event created successfully!'); setDialogType(null); }}>
              <div className="space-y-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input id="event-title" placeholder="Enter event title" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-org">Organization</Label>
                <Input id="event-org" placeholder="Your organization name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input id="event-time" placeholder="e.g., 9:00 AM - 12:00 PM" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-location">Location</Label>
                <Input id="event-location" placeholder="Event location" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-category">Category</Label>
                <Select required>
                  <SelectTrigger id="event-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="community">Community</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-spots">Total Spots</Label>
                <Input id="event-spots" type="number" placeholder="Number of volunteer spots" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-description">Description</Label>
                <Textarea id="event-description" placeholder="Describe your event..." rows={4} required />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogType(null)}>Cancel</Button>
                <Button type="submit">Create Event</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          const volunteers = getEventVolunteers(event.id);
          const pendingCount = volunteers.filter(v => v.status === 'pending').length;
          const confirmedCount = volunteers.filter(v => v.status === 'confirmed').length;

          return (
            <Card key={event.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{event.organization}</CardDescription>
                  </div>
                  <Badge variant={event.status === 'active' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Volunteers</span>
                  <span>{confirmedCount}/{event.totalSpots}</span>
                </div>
                {pendingCount > 0 && (
                  <Badge variant="outline" className="w-full justify-center">
                    {pendingCount} pending approval{pendingCount > 1 ? 's' : ''}
                  </Badge>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog('info', event)}
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Info
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog('volunteers', event)}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog('confirm', event)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog('report', event)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3>No events found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Create your first event to get started'}
            </p>
          </div>
        </Card>
      )}

      {/* Event Info Dialog */}
      <Dialog open={dialogType === 'info'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>{selectedEvent?.organization}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.title}
                className="w-full aspect-video object-cover rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p>{selectedEvent.time}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{selectedEvent.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p>{selectedEvent.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Spots</p>
                  <p>{selectedEvent.totalSpots}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedEvent.status === 'active' ? 'default' : 'secondary'}>
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{selectedEvent.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Volunteers Approval Dialog */}
      <Dialog open={dialogType === 'volunteers'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Volunteers</DialogTitle>
            <DialogDescription>
              Review and approve volunteer registrations for {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedEvent && getEventVolunteers(selectedEvent.id)
              .filter(v => v.status === 'pending')
              .map((volunteer) => (
                <Card key={volunteer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
                          <AvatarFallback>{volunteer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p>{volunteer.name}</p>
                          <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                          <p className="text-sm text-muted-foreground">
                            {volunteer.hoursVolunteered} hours volunteered • {volunteer.eventsAttended} events
                          </p>
                          <p className="text-xs text-muted-foreground">Applied {volunteer.appliedDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApproveVolunteer(volunteer.id)}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectVolunteer(volunteer.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {selectedEvent && getEventVolunteers(selectedEvent.id).filter(v => v.status === 'pending').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No pending volunteer approvals
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Contribution Dialog */}
      <Dialog open={dialogType === 'confirm'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Volunteer Contributions</DialogTitle>
            <DialogDescription>
              Mark volunteers who completed their service for {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedEvent && getEventVolunteers(selectedEvent.id)
              .filter(v => v.status === 'confirmed')
              .map((volunteer) => (
                <Card key={volunteer.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`confirm-${volunteer.id}`}
                          checked={volunteer.contributionConfirmed}
                          onCheckedChange={() => handleConfirmContribution(volunteer.id)}
                        />
                        <Avatar>
                          <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
                          <AvatarFallback>{volunteer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p>{volunteer.name}</p>
                          <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                          {volunteer.contributionConfirmed && (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirmed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            {selectedEvent && getEventVolunteers(selectedEvent.id).filter(v => v.status === 'confirmed').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No confirmed volunteers yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={dialogType === 'report'} onOpenChange={(open) => !open && setDialogType(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Volunteer Report</DialogTitle>
            <DialogDescription>
              Complete list of volunteers for {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="text-2xl">{selectedEvent && getEventVolunteers(selectedEvent.id).filter(v => v.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl">{selectedEvent && getEventVolunteers(selectedEvent.id).filter(v => v.status === 'confirmed').length}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl">{selectedEvent && getEventVolunteers(selectedEvent.id).filter(v => v.contributionConfirmed).length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              <div className="grid gap-4 p-2 text-sm text-muted-foreground border-b" style={{ gridTemplateColumns: '2fr 2.5fr 1.5fr 1fr' }}>
                <div>Volunteer</div>
                <div>Contact</div>
                <div>Status</div>
                <div>Confirmed</div>
              </div>
              {selectedEvent && getEventVolunteers(selectedEvent.id).map((volunteer) => (
                <div key={volunteer.id} className="grid gap-4 p-2 items-center" style={{ gridTemplateColumns: '2fr 2.5fr 1.5fr 1fr' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={volunteer.avatar} alt={volunteer.name} />
                      <AvatarFallback>{volunteer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{volunteer.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate" title={volunteer.email}>{volunteer.email}</div>
                  <div>
                    <Badge variant={volunteer.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                      {volunteer.status}
                    </Badge>
                  </div>
                  <div>
                    {volunteer.contributionConfirmed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => toast.success('Report exported!')}>
                Export CSV
              </Button>
              <Button onClick={() => setDialogType(null)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
