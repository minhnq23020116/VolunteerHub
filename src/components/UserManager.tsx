import { useEffect, useState } from 'react';
import { Search, Check, X, Trash2, Eye, Download, UserCheck, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    accountType: string;
    hoursVolunteered: number;
    eventsAttended: number;
    joinedDate: string;
    bio?: string;
    isLocked?: boolean;
}

interface ManagerRequest {
    id: string;
    name: string;
    email: string;
    avatar: string;
    organization: string;
    reason: string;
    status: string;
}

export function UserManager() {
    const [pendingRequests, setPendingRequests] = useState<ManagerRequest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch data on mount
    useEffect(() => {
        fetchManagerRequests();
        fetchUsers();
    }, []);

    const fetchManagerRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/admin/manager-requests', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to load manager requests');

            const data = await res.json();
            setPendingRequests(data);
        } catch (err) {
            console.error(err);
            showToast('Unable to load manager requests', 'error');
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/admin/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to load users');

            const data = await res.json();
            setUsers(data);
        } catch (err) {
            console.error(err);
            showToast('Unable to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleApproveManager = async (requestId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:4000/api/admin/manager-requests/${requestId}/approve`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to approve');

            setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
            fetchUsers(); // Refresh user list
            showToast('Manager account approved', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to approve manager request', 'error');
        }
    };

    const handleRejectManager = async (requestId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:4000/api/admin/manager-requests/${requestId}/reject`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to reject');

            setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
            showToast('Manager request rejected', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to reject manager request', 'error');
        }
    };

    const handleLockUser = async (userId: string) => {
        if (!confirm('Are you sure you want to lock this user account?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:4000/api/admin/users/${userId}/lock`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to lock user');

            // Update local state
            setUsers(users.map(user => 
                user.id === userId ? { ...user, isLocked: true } : user
            ));
            
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, isLocked: true });
            }
            
            showToast('User account locked', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to lock user', 'error');
        }
    };

    const handleUnlockUser = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:4000/api/admin/users/${userId}/unlock`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to unlock user');

            // Update local state
            setUsers(users.map(user => 
                user.id === userId ? { ...user, isLocked: false } : user
            ));
            
            if (selectedUser?.id === userId) {
                setSelectedUser({ ...selectedUser, isLocked: false });
            }
            
            showToast('User account unlocked', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to unlock user', 'error');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user account?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:4000/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to delete user');

            setUsers(users.filter(user => user.id !== userId));
            setSelectedUser(null);
            showToast('User account deleted', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to delete user', 'error');
        }
    };

    const handleExportData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:4000/api/admin/export/users', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to export data');

            const data = await res.json();

            const csvContent = [
                ['Name', 'Email', 'Account Type', 'Hours Volunteered', 'Events Attended', 'Join Date', 'Status'],
                ...data.map((user: any) => [
                    user.name,
                    user.email,
                    user.accountType,
                    user.hoursVolunteered.toString(),
                    user.eventsAttended.toString(),
                    user.joinedDate,
                    user.isLocked ? 'Locked' : 'Active'
                ])
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users-data.csv';
            a.click();

            showToast('User data exported successfully', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to export data', 'error');
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
            type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white z-50`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    if (loading) {
        return <p className="text-center py-12">Loading...</p>;
    }

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">User Manager</h1>
                    <p className="text-gray-600 mt-2">
                        Manage user accounts and manager requests
                    </p>
                </div>
                <Button onClick={handleExportData} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Data
                </Button>
            </div>

            {/* Pending Manager Requests */}
            {pendingRequests.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            Manager Account Requests
                        </CardTitle>
                        <CardDescription>
                            Review and approve accounts requesting manager privileges
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingRequests.map((request) => (
                                <div key={request.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={request.avatar} alt={request.name} />
                                        <AvatarFallback>{request.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-semibold">{request.name}</p>
                                                <p className="text-sm text-gray-600">{request.email}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Organization: {request.organization}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">Pending</Badge>
                                        </div>
                                        <p className="text-sm mt-2">{request.reason}</p>
                                        <div className="flex gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                onClick={() => handleApproveManager(request.id)}
                                                className="gap-2"
                                            >
                                                <Check className="h-4 w-4" />
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRejectManager(request.id)}
                                                className="gap-2"
                                            >
                                                <X className="h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* All Users */}
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>
                        Search and manage all user accounts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* User List */}
                        <div className="border rounded-lg divide-y">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                    <Avatar>
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={user.accountType === 'manager' ? 'default' : 'secondary'}>
                                            {user.accountType}
                                        </Badge>
                                        {user.isLocked && (
                                            <Badge variant="destructive" className="gap-1">
                                                <Lock className="h-3 w-3" />
                                                Locked
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {user.isLocked ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleUnlockUser(user.id)}
                                                className="gap-2 text-green-600 hover:text-green-700"
                                            >
                                                <Unlock className="h-4 w-4" />
                                                Unlock
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleLockUser(user.id)}
                                                className="gap-2 text-orange-600 hover:text-orange-700"
                                            >
                                                <Lock className="h-4 w-4" />
                                                Lock
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedUser(user)}
                                            className="gap-2"
                                        >
                                            <Eye className="h-4 w-4" />
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="gap-2 text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-600">No users found matching your search.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* User Detail Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>
                            View detailed information about this user
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                                    <AvatarFallback>{selectedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                                    <p className="text-gray-600">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant={selectedUser.accountType === 'manager' ? 'default' : 'secondary'}>
                                            {selectedUser.accountType}
                                        </Badge>
                                        {selectedUser.isLocked && (
                                            <Badge variant="destructive" className="gap-1">
                                                <Lock className="h-3 w-3" />
                                                Locked
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Hours Volunteered</p>
                                    <p className="text-2xl font-bold">{selectedUser.hoursVolunteered}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Events Attended</p>
                                    <p className="text-2xl font-bold">{selectedUser.eventsAttended}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Join Date</p>
                                    <p>{selectedUser.joinedDate}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Account Type</p>
                                    <p className="capitalize">{selectedUser.accountType}</p>
                                </div>
                            </div>

                            {selectedUser.bio && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">Bio</p>
                                        <p>{selectedUser.bio}</p>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                                    Close
                                </Button>
                                {selectedUser.isLocked ? (
                                    <Button
                                        onClick={() => handleUnlockUser(selectedUser.id)}
                                        className="gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <Unlock className="h-4 w-4" />
                                        Unlock Account
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleLockUser(selectedUser.id)}
                                        className="gap-2 text-orange-600 hover:text-orange-700"
                                    >
                                        <Lock className="h-4 w-4" />
                                        Lock Account
                                    </Button>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}