import { useState, useEffect } from 'react';
import LinkDeviceQR from '../components/LinkDeviceQR';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { User, Mail, Shield, BadgeCheck, Loader2 } from 'lucide-react';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // 1. Try to fetch real data from backend
                const res = await api.get('/auth/me');
                setUser(res.data);
            } catch (error) {
                console.warn("Could not fetch profile, using fallback data.");

                setUser({
                    firstName: "Current",
                    lastName: "User",
                    email: "user@supplymind.com",
                    role: localStorage.getItem('role') || "STAFF"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="animate-spin text-blue-600" size={48} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your profile and security preferences.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">

                {/* COLUMN 1: User Profile Details (Takes up 2 columns on large screens) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-4 border-b bg-slate-50/50">
                            <CardTitle className="flex items-center gap-2">
                                <User className="text-blue-600" size={20}/>
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">

                            {/* Name Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500">First Name</label>
                                    <div className="p-3 bg-slate-50 border rounded-md font-medium text-slate-900">
                                        {user?.firstName}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500">Last Name</label>
                                    <div className="p-3 bg-slate-50 border rounded-md font-medium text-slate-900">
                                        {user?.lastName}
                                    </div>
                                </div>
                            </div>

                            {/* Email Row */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <div className="p-3 bg-slate-50 border rounded-md font-medium text-slate-900">
                                    {user?.email}
                                </div>
                            </div>

                            {/* Role Row */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Shield size={14} /> System Role
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                                        <BadgeCheck size={14} />
                                        {user?.role}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Roles define your permissions within the SupplyMind platform. Contact an administrator to change this.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* COLUMN 2: Link Device QR (Sidebar) */}
                <div className="lg:col-span-1">
                    <LinkDeviceQR />
                </div>
            </div>
        </div>
    );
};

export default Settings;