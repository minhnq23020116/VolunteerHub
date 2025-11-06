import { ArrowLeft, Calendar as CalendarIcon, MapPin, Users, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { VolunteerEvent, posts } from '../data/mockData';

interface EventDetailProps {
  event: VolunteerEvent;
  onBack: () => void;
  onSignUp: (eventId: string) => void;
  onCancelRegistration: (eventId: string) => void;
}

export function EventDetail({ event, onBack, onSignUp, onCancelRegistration }: EventDetailProps) {
  // Filter posts related to this event
  const eventPosts = posts.filter(post => post.eventId === event.id);

  // Helper function to check if an event is in the future
  const isEventInFuture = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const event = new Date(eventDate);
    return event >= today;
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discovery
      </Button>

      {/* Event Hero Section */}
      <div className="relative h-[400px] rounded-lg overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <Badge className="mb-4">{event.category}</Badge>
          <h1 className="text-white mb-2">{event.title}</h1>
          <p className="text-xl text-white/90">{event.organization}</p>
        </div>
      </div>

      {/* Event Info and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader>
              <h2>About This Event</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{event.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p>{event.date}</p>
                    <p className="text-sm">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{event.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community Posts */}
          <div className="space-y-4">
            <div>
              <h2>Community Posts</h2>
              <p className="text-muted-foreground mt-2">
                See what volunteers are saying about this event
              </p>
            </div>

            {eventPosts.length > 0 ? (
              <div className="space-y-6">
                {eventPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={post.authorAvatar} alt={post.author} />
                          <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p>{post.author}</p>
                          <p className="text-sm text-muted-foreground">{post.timestamp}</p>
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
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No posts yet. Be the first to volunteer and share your experience!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <h3>Join This Event</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p>{event.spotsAvailable} spots available</p>
                  <p className="text-sm text-muted-foreground">of {event.totalSpots} total</p>
                </div>
              </div>

              {isEventInFuture(event.date) ? (
                event.isSignedUp ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {event.registrationStatus || 'Registered'}
                        </Badge>
                        <span className="text-sm">You're registered!</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => onCancelRegistration(event.id)}
                    >
                      Cancel Registration
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={() => onSignUp(event.id)}
                  >
                    Sign Up to Volunteer
                  </Button>
                )
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline" className="w-full justify-center py-3">
                    Event Completed
                  </Badge>
                  <p className="text-sm text-muted-foreground text-center">
                    This event has already taken place
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organizer Info */}
          <Card>
            <CardHeader>
              <h3>Organizer</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{event.organization.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p>{event.organization}</p>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Contact Organizer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Share Card */}
          <Card>
            <CardHeader>
              <h3>Share This Event</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Spread the word and get more volunteers involved!
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
