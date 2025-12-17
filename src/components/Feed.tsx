import { useState } from 'react';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { posts, volunteerEvents } from '../data/mockData';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { toast } from 'sonner@2.0.3';

export function Feed() {
  const signedUpEvents = volunteerEvents.filter(e => e.isSignedUp);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [postContent, setPostContent] = useState('');

  // Separate upcoming events and contributed events (where contribution is confirmed)
  const upcomingEvents = signedUpEvents.filter(event => !event.contributionConfirmed);
  const contributedEvents = signedUpEvents.filter(event => event.contributionConfirmed);

  const handleCreatePost = () => {
    if (!selectedEvent || !postContent.trim()) {
      toast.error('Please select an event and write your post');
      return;
    }
    
    toast.success('Post created successfully!');
    setCreatePostOpen(false);
    setSelectedEvent('');
    setPostContent('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1>My Events Feed</h1>
        <p className="text-muted-foreground mt-2">
          Stay connected with your volunteer community
        </p>
      </div>

      {/* Upcoming Events Summary */}
      <Card>
        <CardHeader>
          <h3>Your Upcoming Events</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg border">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="line-clamp-1">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.organization}</p>
                      </div>
                      <Badge variant="secondary">{event.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.date} • {event.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                You haven't signed up for any upcoming events. Check the Dashboard to find opportunities!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contributed Events */}
      <Card>
        <CardHeader>
          <h3>Contributed Events</h3>
          <p className="text-sm text-muted-foreground">
            Events where your contribution has been confirmed by organizers
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {contributedEvents.length > 0 ? (
              contributedEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg border bg-muted/30">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="line-clamp-1">{event.title}</h4>
                          <Badge variant="default" className="shrink-0 text-xs">
                            Confirmed
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.organization}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{event.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.date} • {event.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No confirmed contributions yet. Once event organizers confirm your participation, they will appear here!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feed Posts */}
      <div>
        <h2 className="mb-4">Community Updates</h2>
        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id}>
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
              <CardContent className="space-y-4">
                <p>{post.content}</p>
                {post.image && (
                  <img 
                    src={post.image} 
                    alt="Post content"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                )}
                <Separator />
                <div className="flex items-center gap-6">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setCreatePostOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Create Post Dialog */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a Post</DialogTitle>
            <DialogDescription>
              Share your volunteer experience with the community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="event">Select Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger id="event">
                  <SelectValue placeholder="Choose an event you volunteered at" />
                </SelectTrigger>
                <SelectContent>
                  {signedUpEvents.length > 0 ? (
                    signedUpEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No events signed up
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Your Story</Label>
              <Textarea
                id="content"
                placeholder="Share your experience, what you learned, or how you made an impact..."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCreatePostOpen(false);
                  setSelectedEvent('');
                  setPostContent('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePost}>
                Post
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
