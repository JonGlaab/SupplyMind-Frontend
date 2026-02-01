import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DesktopLoginQR from '../components/DesktopLoginQR.jsx'; // Renamed component
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Smartphone, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 📱 Simple Mobile Detection Helper
    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/api/auth/login', formData);
            const { token, role, needsPasswordChange } = res.data;

            // 1. Save Session
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            // 2. Security Check (Force Password Change)
            if (needsPasswordChange) {
                navigate('/change-password');
                return;
            }

            // 3. 🔀 SMART ROUTING (Role + Device)
            const isMobile = isMobileDevice();

            // A. Specialized Mobile Roles (Go to App Layout if on phone)
            if (isMobile && (role === 'MANAGER' || role === 'PROCUREMENT_OFFICER')) {
                navigate('/mobile/home');
                return;
            }

            // B. Standard Role Routing (Desktop / Non-Mobile users)
            switch (role) {
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'MANAGER':
                    navigate('/manager/dashboard');
                    break;
                case 'PROCUREMENT_OFFICER':
                    navigate('/procurement/dashboard');
                    break;
                case 'STAFF':
                case 'CUSTOMER':
                    navigate('/staff/dashboard');
                    break;
                default:
                    navigate('/dashboard');
            }

        } catch (err) {
            console.error(err);
            setError("Invalid credentials. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-muted/40 flex items-center justify-center p-4">
            <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left: Email Login */}
                <Card className="w-full h-full border-none shadow-xl bg-background/95 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Internal Portal</CardTitle>
                        <CardDescription>Enter your credentials to access the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium flex items-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="user@supplymind.com"
                                        className="pl-9"
                                        required
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-9"
                                        required
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t p-6">
                        <p className="text-xs text-muted-foreground">Restricted Access. Unauthorized use prohibited.</p>
                    </CardFooter>
                </Card>

                {/* Right: Mobile Unlock */}
                <Card className="w-full h-full bg-slate-950 text-white border-slate-800 shadow-2xl flex flex-col justify-center items-center text-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center max-w-sm">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 ring-1 ring-blue-500/20">
                            <Smartphone className="h-6 w-6 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Instant Unlock</h2>
                        <p className="text-slate-400 mb-8 text-sm">Already linked? Scan to login instantly.</p>
                        <div className="bg-white p-4 rounded-xl shadow-inner shadow-black/10">
                            <DesktopLoginQR />
                        </div>
                        <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest font-medium">Secure Handshake Active</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;