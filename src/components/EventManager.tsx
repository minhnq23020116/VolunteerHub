import { useEffect, useState } from 'react';
import {
  Plus,
  Info,
  Search,
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  FileText,
  X,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';

const API_URL = 'http://localhost:4000/api';

/* ================= TYPES ================= */

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
  attendeesCount?: number;
}

interface Registration {
  _id: string;
  eventId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  registeredAt: string;
}

type DialogType = 'info' | 'volunteers' | 'confirm' | 'report' | 'create' | null;

/* ================= COMPONENT ================= */

export function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  /* ---------- form state ---------- */
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    dateStart: '',
    dateEnd: '',
    location: '',
  });

  /* ================= API ================= */

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/events/me`, {
        headers: authHeader(),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setEvents(data);
    } catch {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      const res = await fetch(`${API_URL}/registrations/${eventId}`, {
        headers: authHeader(),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setRegistrations(data);
    } catch {
      toast.error('Failed to load registrations');
    }
  };

  const createEvent = async () => {
    if (!form.title || !form.dateStart || !form.dateEnd || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success('Event created (pending approval)');
      setDialogType(null);
      setForm({
        title: '',
        description: '',
        category: '',
        dateStart: '',
        dateEnd: '',
        location: '',
      });
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Create failed');
    }
  };

  const approveRegistration = async (regId: string) => {
    try {
      const res = await fetch(`${API_URL}/registrations/${regId}/approve`, {
        method: 'PATCH',
        headers: authHeader(),
      });

      if (!res.ok) throw new Error();

      toast.success('Volunteer approved!');
      if (selectedEvent) fetchRegistrations(selectedEvent._id);
    } catch {
      toast.error('Failed to approve volunteer');
    }
  };

  const rejectRegistration = async (regId: string) => {
    try {
      const res = await fetch(`${API_URL}/registrations/${regId}/reject`, {
        method: 'PATCH',
        headers: authHeader(),
      });

      if (!res.ok) throw new Error();

      toast.success('Registration rejected');
      if (selectedEvent) fetchRegistrations(selectedEvent._id);
    } catch {
      toast.error('Failed to reject registration');
    }
  };

  const markAsCompleted = async (regId: string) => {
    try {
      const res = await fetch(`${API_URL}/registrations/${regId}/completed`, {
        method: 'PATCH',
        headers: authHeader(),
      });

      if (!res.ok) throw new Error();

      toast.success('Contribution confirmed!');
      if (selectedEvent) fetchRegistrations(selectedEvent._id);
    } catch {
      toast.error('Failed to confirm contribution');
    }
  };

  /* ================= HANDLERS ================= */

  const openDialog = (type: DialogType, event?: Event) => {
    if (event) {
      setSelectedEvent(event);
      fetchRegistrations(event._id);
    }
    setDialogType(type);
  };

  const closeDialog = () => {
    setDialogType(null);
    setSelectedEvent(null);
    setRegistrations([]);
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    fetchEvents();
  }, []);

  /* ================= RENDER ================= */

  const filteredEvents = events.filter(
    e =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()),
  );

  const pendingRegs = registrations.filter(r => r.status === 'pending');
  const approvedRegs = registrations.filter(r => r.status === 'approved');
  const completedRegs = registrations.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Event Manager</h1>
          <p className="text-muted-foreground">
            Manage your hosted events and volunteers
          </p>
        </div>

        <Button onClick={() => setDialogType('create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* ===== Search ===== */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search your events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ===== Events Grid ===== */}
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(ev => {
            const pendingCount = 0; // TODO: fetch from backend
            const confirmedCount = ev.attendeesCount || 0;

            return (
              <Card key={ev._id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">{ev.title}</CardTitle>
                      <CardDescription className="line-clamp-1">
                        {ev.createdBy?.name || 'Unknown'}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        ev.status === 'approved'
                          ? 'default'
                          : ev.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {ev.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(ev.dateStart).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {new Date(ev.dateEnd).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{ev.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Volunteers</span>
                    <span>{confirmedCount}</span>
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
                      onClick={() => openDialog('info', ev)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Info
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog('volunteers', ev)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog('confirm', ev)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog('report', ev)}
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
      )}

      {!loading && filteredEvents.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">No events found</h3>
            <p className="text-muted-foreground">
              {search ? 'Try adjusting your search' : 'Create your first event to get started'}
            </p>
          </div>
        </Card>
      )}

      {/* ===== Create Event Dialog ===== */}
      <Dialog open={dialogType === 'create'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              New events will be pending admin approval
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="Enter event title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your event..."
                rows={4}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={v => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={form.dateStart}
                  onChange={e => setForm({ ...form, dateStart: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={form.dateEnd}
                  onChange={e => setForm({ ...form, dateEnd: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Location *</Label>
              <Input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="Event location"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button onClick={createEvent}>Create Event</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Event Info Dialog ===== */}
      <Dialog open={dialogType === 'info'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>{selectedEvent?.createdBy?.name}</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p>{new Date(selectedEvent.dateStart).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p>{new Date(selectedEvent.dateEnd).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{selectedEvent.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p>{selectedEvent.category || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={
                      selectedEvent.status === 'approved'
                        ? 'default'
                        : selectedEvent.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{selectedEvent.description || 'No description provided'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== Approve Volunteers Dialog ===== */}
      <Dialog open={dialogType === 'volunteers'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Volunteers</DialogTitle>
            <DialogDescription>
              Review and approve volunteer registrations for {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {pendingRegs.length > 0 ? (
              pendingRegs.map(reg => (
                <Card key={reg._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={reg.userId.avatar} />
                          <AvatarFallback>
                            {reg.userId.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium">{reg.userId.name}</p>
                          <p className="text-sm text-muted-foreground">{reg.userId.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Applied {new Date(reg.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => approveRegistration(reg._id)}>
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRegistration(reg._id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pending volunteer approvals
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Confirm Contributions Dialog ===== */}
      <Dialog open={dialogType === 'confirm'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Volunteer Contributions</DialogTitle>
            <DialogDescription>
              Mark volunteers who completed their service for {selectedEvent?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {approvedRegs.length > 0 ? (
              approvedRegs.map(reg => (
                <Card key={reg._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={reg.status === 'completed'}
                          onCheckedChange={() => markAsCompleted(reg._id)}
                        />
                        <Avatar>
                          <AvatarImage src={reg.userId.avatar} />
                          <AvatarFallback>
                            {reg.userId.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium">{reg.userId.name}</p>
                          <p className="text-sm text-muted-foreground">{reg.userId.email}</p>
                          {reg.status === 'completed' && (
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
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No approved volunteers yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Report Dialog ===== */}
      <Dialog open={dialogType === 'report'} onOpenChange={(open) => !open && closeDialog()}>
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
                <p className="text-2xl font-bold">{pendingRegs.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{approvedRegs.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{completedRegs.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              <div className="grid gap-4 p-2 text-sm font-medium border-b" style={{ gridTemplateColumns: '2fr 2.5fr 1.5fr 1fr' }}>
                <div>Volunteer</div>
                <div>Contact</div>
                <div>Status</div>
                <div>Completed</div>
              </div>
              {registrations.map(reg => (
                <div key={reg._id} className="grid gap-4 p-2 items-center" style={{ gridTemplateColumns: '2fr 2.5fr 1.5fr 1fr' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reg.userId.avatar} />
                      <AvatarFallback>
                        {reg.userId.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{reg.userId.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{reg.userId.email}</div>
                  <div>
                    <Badge
                      variant={
                        reg.status === 'approved' || reg.status === 'completed'
                          ? 'default'
                          : 'secondary'
                      }
                      className="text-xs"
                    >
                      {reg.status}
                    </Badge>
                  </div>
                  <div>
                    {reg.status === 'completed' ? (
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
              <Button onClick={closeDialog}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}