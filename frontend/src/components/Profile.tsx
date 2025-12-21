import { useEffect, useState } from "react";
import {
    User,
    Mail,
    Calendar,
    Award,
    Clock,
    MapPin,
    Camera,
    Save,
    LogOut,
    Trash2,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

import { toast } from "sonner";

/* =====================
   Types
===================== */

interface UserProfile {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    avatar?: string;
    role: string;
    createdAt: string;
    hoursVolunteered?: number;
    eventsAttended?: number;
}

/* =====================
   Props
===================== */

interface ProfileProps {
    onLogout: () => void;
}

/* =====================
   Component
===================== */

export function Profile({ onLogout }: ProfileProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [weeklyDigest, setWeeklyDigest] = useState(true);

    /* =====================
       Fetch profile
    ===================== */

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("http://localhost:4000/api/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) throw new Error("Failed to load profile");

                const data = await res.json();
                setProfile(data);
            } catch (err) {
                console.error(err);
                toast.error("Unable to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    /* =====================
       Save profile
    ===================== */

    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:4000/api/auth/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: profile?.name,
                    email: profile?.email,
                    bio: profile?.bio,
                }),
            });

            if (!res.ok) throw new Error("Update failed");

            const updated = await res.json();
            setProfile(updated);

            toast.success("Profile updated successfully");
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        }
    };

    /* =====================
       Delete account
    ===================== */

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            const token = localStorage.getItem("token");

            const res = await fetch("http://localhost:4000/api/auth/me", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Delete failed");

            toast.success("Account deleted successfully");

            // Logout sau khi xóa tài khoản
            localStorage.removeItem("token");
            onLogout();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete account");
        }
    };

    /* =====================
       Render states
    ===================== */

    if (loading) {
        return <p className="text-center py-12">Loading profile...</p>;
    }

    if (!profile) {
        return <p className="text-center py-12">Profile not found</p>;
    }

    /* =====================
       Render
    ===================== */

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1>Profile & Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account and preferences
                </p>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profile.avatar} />
                                <AvatarFallback>
                                    {profile.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                size="icon"
                                variant="secondary"
                                className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                                disabled
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex-1">
                            <h3>{profile.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {profile.email}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Member since{" "}
                                {new Date(profile.createdAt).toLocaleDateString()}
                            </p>
                        </div>

                        <Button
                            variant={isEditing ? "default" : "outline"}
                            onClick={() =>
                                isEditing ? handleSave() : setIsEditing(true)
                            }
                        >
                            {isEditing ? (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            ) : (
                                "Edit Profile"
                            )}
                        </Button>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Full Name</Label>
                            <Input
                                value={profile.name}
                                onChange={(e) =>
                                    setProfile({ ...profile, name: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={profile.email}
                                onChange={(e) =>
                                    setProfile({ ...profile, email: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Bio</Label>
                            <Textarea
                                rows={4}
                                value={profile.bio || ""}
                                onChange={(e) =>
                                    setProfile({ ...profile, bio: e.target.value })
                                }
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Impact */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Impact</CardTitle>
                    <CardDescription>Track your volunteer journey</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ImpactItem
                            icon={<Clock className="h-6 w-6 text-primary" />}
                            value={profile.hoursVolunteered ?? 0}
                            label="Hours Volunteered"
                        />
                        <ImpactItem
                            icon={<Calendar className="h-6 w-6 text-primary" />}
                            value={profile.eventsAttended ?? 0}
                            label="Events Attended"
                        />
                        <ImpactItem
                            icon={<Award className="h-6 w-6 text-primary" />}
                            value={5}
                            label="Badges Earned"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Notifications (local only for now) */}
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <NotificationItem
                        label="Email Notifications"
                        checked={emailNotifications}
                        onChange={setEmailNotifications}
                    />
                    <Separator />
                    <NotificationItem
                        label="Push Notifications"
                        checked={pushNotifications}
                        onChange={setPushNotifications}
                    />
                    <Separator />
                    <NotificationItem
                        label="Weekly Digest"
                        checked={weeklyDigest}
                        onChange={setWeeklyDigest}
                    />
                </CardContent>
            </Card>

            {/* Account */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        variant="destructive"
                        className="w-full justify-start"
                        onClick={handleDeleteAccount}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={onLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log Out
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

/* =====================
   Helpers
===================== */

function ImpactItem({
                        icon,
                        value,
                        label,
                    }: {
    icon: React.ReactNode;
    value: number;
    label: string;
}) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-lg border">
            <div className="p-3 rounded-full bg-primary/10">{icon}</div>
            <div>
                <p className="text-2xl">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

function NotificationItem({
                              label,
                              checked,
                              onChange,
                          }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <p>{label}</p>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}