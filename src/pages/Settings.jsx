import { useState, useEffect } from 'react';
import LinkDeviceQR from '../components/LinkDeviceQR.jsx';
import api from '../services/api.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { User, Mail, Shield, BadgeCheck, Loader2, PenTool, Save } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [signatureUrl, setSignatureUrl] = useState('');
    const [savingSig, setSavingSig] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setUser(res.data);
            setSignatureUrl(res.data.signatureUrl || '');
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSignature = async () => {
        setSavingSig(true);
        try {
            await api.put('/api/auth/me/signature', { signatureUrl });
            setUser(prev => ({ ...prev, signatureUrl })); // Update local UI
        } catch (error) {
            console.error("Failed to save signature", error);
        } finally {
            setSavingSig(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Account Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Profile Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Manage your personal details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <User size={14} /> First Name
                                    </label>
                                    <div className="p-3 bg-slate-50 border rounded-md font-medium text-slate-900">
                                        {user?.firstName}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <User size={14} /> Last Name
                                    </label>
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

                    {/* 2. Digital Signature (Linked to AuthController) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PenTool size={20} /> Digital Signature
                            </CardTitle>
                            <CardDescription>
                                Used to sign Purchase Orders sent to suppliers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-500">
                                    Signature Image URL
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={signatureUrl}
                                        onChange={(e) => setSignatureUrl(e.target.value)}
                                        placeholder="https://example.com/signature.png"
                                    />
                                    <Button onClick={handleSaveSignature} disabled={savingSig}>
                                        {savingSig ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />}
                                        <span className="ml-2">Save</span>
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Paste a direct link to a PNG of your signature (transparent background recommended).
                                </p>
                            </div>

                            {user?.signatureUrl && (
                                <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-white">
                                    <p className="text-xs text-slate-400 mb-2">Current Signature:</p>
                                    <img
                                        src={user.signatureUrl}
                                        alt="Signature"
                                        className="h-16 object-contain"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* 3. 2FA QR Code */}
                <div className="lg:col-span-1">
                    <LinkDeviceQR />
                </div>
            </div>
        </div>
    );
};

export default Settings;