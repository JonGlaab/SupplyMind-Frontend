import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import DesktopLogin from '../components/DesktopLogin.jsx';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Smartphone, Lock, Mail, Loader2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            // redirects Admin to new Admin Dashboard where he can add users.
            navigate('/admin/dashboard');
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-muted/40 flex items-center justify-center p-4">
            <div className="grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left: Traditional Login */}
                <Card className="w-full h-full border-none shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>Enter your email below to login to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="m@example.com"
                                        className="pl-9"
                                        required
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                                    <Link to="#" className="text-sm text-primary underline-offset-4 hover:underline">Forgot password?</Link>
                                </div>
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
                        <p className="text-sm text-muted-foreground">
                            Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Sign up</Link>
                        </p>
                    </CardFooter>
                </Card>

                {/* Right: Mobile Companion Login */}
                <Card className="w-full h-full bg-slate-950 text-white border-slate-800 shadow-2xl flex flex-col justify-center items-center text-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center max-w-sm">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 ring-1 ring-blue-500/20">
                            <Smartphone className="h-6 w-6 text-blue-400" />
                        </div>

                        <h2 className="text-2xl font-bold mb-2">Mobile Companion</h2>
                        <p className="text-slate-400 mb-8 text-sm">
                            Open the SupplyMind app and scan this code for instant, password-free access.
                        </p>

                        <div className="bg-white p-4 rounded-xl shadow-inner shadow-black/10">
                            {/* DesktopLogin handles the QR and WebSocket logic */}
                            <DesktopLogin />
                        </div>

                        <p className="mt-8 text-xs text-slate-500 uppercase tracking-widest font-medium">
                            Secure Handshake Active
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;