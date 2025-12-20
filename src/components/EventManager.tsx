import { useEffect, useState } from 'react';
import {
  Plus,
  Info,
  Search,
  Calendar,
  MapPin,
  Clock,
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
  DialogTrigger,
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
    name: string;
    email: string;
  };
}

/* ================= COMPONENT ================= */

export function EventManager() {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      const res = await fetch(`${API_URL}/events`, {
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

  const createEvent = async () => {

    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success('Event created (pending approval)');
      setDialogOpen(false);
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

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Event Manager</h1>
          <p className="text-muted-foreground">
            Manage events you have created
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event</DialogTitle>
              <DialogDescription>
                New events will be pending admin approval
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={e =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={e =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={v =>
                    setForm({ ...form, category: v })
                  }
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
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={form.dateStart}
                    onChange={e =>
                      setForm({ ...form, dateStart: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={form.dateEnd}
                    onChange={e =>
                      setForm({ ...form, dateEnd: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={e =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createEvent}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ===== Search ===== */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="Search events..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ===== Events ===== */}
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map(ev => (
            <Card key={ev._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{ev.title}</CardTitle>
                    <CardDescription>{ev.location}</CardDescription>
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

              <CardContent className="space-y-2 text-sm text-muted-foreground">
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
                  {ev.location}
                </div>

                <Button variant="outline" size="sm" className="w-full mt-2">
                  <Info className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <p className="text-muted-foreground">No events found</p>
      )}
    </div>
  );
}
