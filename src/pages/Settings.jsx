import { useState, useEffect, useRef } from 'react';
import LinkDeviceQR from '../components/LinkDeviceQR.jsx';
import api from '../services/api.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { User, Mail, Shield, Loader2, PenTool, Upload, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { Input } from '../components/ui/input.jsx';
import toast from 'react-hot-toast';

const Settings = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [signatureUrl, setSignatureUrl] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadProfile().catch(console.error);
    }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setUser(res.data);
            setSignatureUrl(res.data.signatureUrl || '');
        } catch (error) {
            console.error("Failed to load profile", error);
            toast.error("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a PNG or JPG image.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File is too large. Max size is 2MB.');
            return;
        }

        await uploadSignature(file);
    };

    const uploadSignature = async (file) => {
        if (!user) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await api.post('/api/auth/me/signature', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSignatureUrl(result.data.url);
            setUser(prev => ({ ...prev, signatureUrl: result.data.url }));
            toast.success("Signature uploaded successfully!");
        } catch (error) {
            toast.error("Failed to upload signature.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemoveSignature = () => {
        toast((t) => (
            <div className="flex flex-col gap-4">
                <p className="font-semibold">Are you sure you want to remove your signature?</p>
                <div className="flex gap-2">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            removeSignature().catch(console.error);
                            toast.dismiss(t.id);
                        }}
                    >
                        Yes, Remove
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.dismiss(t.id)}>
                        Cancel
                    </Button>
                </div>
            </div>
        ), {
            duration: 6000,
        });
    };

    const removeSignature = async () => {
        try {
            await api.delete('/api/auth/me/signature');
            setSignatureUrl('');
            setUser(prev => ({ ...prev, signatureUrl: '' }));
            toast.success("Signature removed successfully!");
        } catch (error) {
            console.error("Failed to remove signature", error);
            toast.error("Failed to remove signature.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
                <p className="text-slate-500 mt-2">Manage your profile, security, and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Profile Information */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>Update your basic profile details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">First Name</label>
                                    <Input value={user?.firstName || ''} readOnly className="bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                                    <Input value={user?.lastName || ''} readOnly className="bg-slate-50" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <Mail size={14} /> Email Address
                                </label>
                                <Input value={user?.email || ''} readOnly className="bg-slate-50" />
                            </div>
                            <div className="pt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <Shield size={12} className="mr-1" />
                                    {user?.role || 'USER'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Digital Signature (Manager Only) */}
                    {user?.role === 'MANAGER' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <PenTool className="h-5 w-5 text-blue-600" />
                                    Digital Signature
                                </CardTitle>
                                <CardDescription>
                                    Upload a copy of your signature for Purchase Orders and official documents.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg"
                                    onChange={handleFileSelect}
                                />

                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    {/* Preview Area */}
                                    <div className="w-full sm:w-48 h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center bg-slate-50 relative overflow-hidden group">
                                        {signatureUrl ? (
                                            <img
                                                src={signatureUrl}
                                                alt="Signature"
                                                className="w-full h-full object-contain p-2"
                                            />
                                        ) : (
                                            <div className="text-center p-4">
                                                <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                                <span className="text-xs text-slate-400">No signature</span>
                                            </div>
                                        )}

                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Button
                                                onClick={() => fileInputRef.current.click()}
                                                disabled={uploading}
                                                variant="outline"
                                                className="w-full sm:w-auto"
                                            >
                                                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                {signatureUrl ? 'Change Signature' : 'Upload Signature'}
                                            </Button>

                                            {signatureUrl && (
                                                <Button
                                                    onClick={handleRemoveSignature}
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 w-full sm:w-auto"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>

                                        <div className="text-xs text-slate-500 space-y-1">
                                            <p>• Saved in: <span className="font-mono text-slate-600">/{user ? `${user.firstName}_${user.lastName}` : 'user'}/{user?.id}/...</span></p>
                                            <p>• Accepted formats: <span className="font-medium text-slate-700">PNG, JPG</span></p>
                                            <p>• Max file size: <span className="font-medium text-slate-700">2MB</span></p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
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