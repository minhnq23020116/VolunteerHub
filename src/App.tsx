import { useState } from 'react';
import { Home, Calendar, Bell, User, Briefcase, Users, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Dashboard } from './components/Dashboard';
import { Feed } from './components/Feed';
import { Notifications } from './components/Notifications';
import { Profile } from './components/Profile';
import { EventManager } from './components/EventManager';
import { Auth } from './components/Auth';
import { Toaster } from './components/ui/sonner';
import { UserManager } from './components/UserManager';
import { AdminEventManager } from './components/AdminEventManager';

type UserType = 'user' | 'manager' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState<UserType>('user');

  const handleLogin = (email: string, name: string, type: UserType) => {
    setUserEmail(email);
    setUserName(name);
    setUserType(type);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setUserType('user');
    setActiveTab('dashboard');
  };

  // Show authentication screen if not logged in
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  // Admin interface
  if (userType === 'admin') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
                <Settings className="h-5 w-5" />
              </div>
              <h2>VolunteerHub Admin</h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`text-sm transition-colors hover:text-foreground/80 ${
                  activeTab === 'dashboard' ? '' : 'text-foreground/60'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('usermanager')}
                className={`text-sm transition-colors hover:text-foreground/80 ${
                  activeTab === 'usermanager' ? '' : 'text-foreground/60'
                }`}
              >
                User Manager
              </button>
              <button
                onClick={() => setActiveTab('eventmanager')}
                className={`text-sm transition-colors hover:text-foreground/80 ${
                  activeTab === 'eventmanager' ? '' : 'text-foreground/60'
                }`}
              >
                Event Manager
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`text-sm transition-colors hover:text-foreground/80 ${
                  activeTab === 'notifications' ? '' : 'text-foreground/60'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`text-sm transition-colors hover:text-foreground/80 ${
                  activeTab === 'profile' ? '' : 'text-foreground/60'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="container px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Mobile Tab Navigation */}
            <TabsList className="grid w-full grid-cols-5 md:hidden mb-6">
              <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-3">
                <Home className="h-5 w-5" />
                <span className="text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="usermanager" className="flex flex-col gap-1 py-3">
                <Users className="h-5 w-5" />
                <span className="text-xs">Users</span>
              </TabsTrigger>
              <TabsTrigger value="eventmanager" className="flex flex-col gap-1 py-3">
                <Briefcase className="h-5 w-5" />
                <span className="text-xs">Events</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex flex-col gap-1 py-3">
                <Bell className="h-5 w-5" />
                <span className="text-xs">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex flex-col gap-1 py-3">
                <User className="h-5 w-5" />
                <span className="text-xs">Profile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
              <Dashboard />
            </TabsContent>

            <TabsContent value="usermanager" className="mt-0">
              <UserManager />
            </TabsContent>

            <TabsContent value="eventmanager" className="mt-0">
              <AdminEventManager />
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Notifications />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <Profile onLogout={handleLogout} />
            </TabsContent>
          </Tabs>
        </main>

        <Toaster />
      </div>
    );
  }

  // Manager/User interface
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <h2>VolunteerHub</h2>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`text-sm transition-colors hover:text-foreground/80 ${
                activeTab === 'dashboard' ? '' : 'text-foreground/60'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`text-sm transition-colors hover:text-foreground/80 ${
                activeTab === 'feed' ? '' : 'text-foreground/60'
              }`}
            >
              My Events
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`text-sm transition-colors hover:text-foreground/80 ${
                activeTab === 'notifications' ? '' : 'text-foreground/60'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`text-sm transition-colors hover:text-foreground/80 ${
                activeTab === 'profile' ? '' : 'text-foreground/60'
              }`}
            >
              Profile
            </button>
            {userType === 'manager' && (
              <button
                onClick={() => setActiveTab('eventmanager')}
                className={`text-sm transition-colors hover:text-foreground/80 ${
                  activeTab === 'eventmanager' ? '' : 'text-foreground/60'
                }`}
              >
                Event Manager
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Mobile Tab Navigation */}
          <TabsList className={`grid w-full ${userType === 'manager' ? 'grid-cols-5' : 'grid-cols-4'} md:hidden mb-6`}>
            <TabsTrigger value="dashboard" className="flex flex-col gap-1 py-3">
              <Home className="h-5 w-5" />
              <span className="text-xs">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="feed" className="flex flex-col gap-1 py-3">
              <Calendar className="h-5 w-5" />
              <span className="text-xs">My Events</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col gap-1 py-3">
              <Bell className="h-5 w-5" />
              <span className="text-xs">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col gap-1 py-3">
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
            {userType === 'manager' && (
              <TabsTrigger value="eventmanager" className="flex flex-col gap-1 py-3">
                <Briefcase className="h-5 w-5" />
                <span className="text-xs">Manager</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <Dashboard />
          </TabsContent>

          <TabsContent value="feed" className="mt-0">
            <Feed />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <Notifications />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <Profile onLogout={handleLogout} />
          </TabsContent>

          {userType === 'manager' && (
            <TabsContent value="eventmanager" className="mt-0">
              <EventManager />
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}
