import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import LinkDeviceQR from '../components/LinkDeviceQR.jsx';
import api from '../services/api.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { User, Mail, Shield, BadgeCheck, Loader2 } from 'lucide-react';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Map the JWT claims to our user state
                // Matches your Java JwtService: firstName, lastName, role, sub (email)
                setUser({
                    firstName: decoded.firstName || "Not Set",
                    lastName: decoded.lastName || "",
                    email: decoded.sub || "No email found",
                    role: decoded.role || "STAFF"
                });
            } catch (error) {
                console.error("Failed to decode token for settings:", error);
            }
        }
        setLoading(false);
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your profile and security preferences.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-sm border-slate-200">
                        <CardHeader className="pb-4 border-b bg-slate-50/50">
                            <CardTitle className="flex items-center gap-2">
                                <User className="text-blue-600" size={20}/>
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
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

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <div className="p-3 bg-slate-50 border rounded-md font-medium text-slate-900">
                                    {user?.email}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Shield size={14} /> System Role
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200 uppercase">
                                        <BadgeCheck size={14} />
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <LinkDeviceQR />
                </div>
            </div>
        </div>
    );
};

export default Settings;