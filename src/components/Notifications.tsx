import { Bell, Calendar, CheckCircle, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { notifications } from '../data/mockData';
import { Separator } from './ui/separator';

export function Notifications() {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'reminder':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'update':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Notifications</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your volunteer activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="secondary">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <div 
                className={`p-4 hover:bg-accent/50 transition-colors ${
                  !notification.read ? 'bg-accent/20' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={!notification.read ? '' : 'text-muted-foreground'}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {index < notifications.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3>No notifications yet</h3>
          <p className="text-muted-foreground mt-2">
            We'll notify you when there are updates about your volunteer activities
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="outline">
          Mark all as read
        </Button>
      </div>
    </div>
  );
}
