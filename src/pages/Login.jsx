import { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DesktopLoginQR from '../components/DesktopLoginQR.jsx';

import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '../components/ui/card';

import {
    Smartphone,
    Lock,
    Mail,
    Loader2,
    AlertCircle
} from 'lucide-react';

import './Login.css';

const Login = () => {

    const navigate = useNavigate();

    // 1. Define Helper First
    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    };

    useEffect(() => {
        if (isMobileDevice()) {
            navigate('/mobile/home');
        }
    }, [navigate]);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setIsLoading(true);
        setError('');

        try {

            const res = await api.post('/api/auth/login', formData);

            const { token, role, needsPasswordChange } = res.data;

            localStorage.clear();

            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);

            if (needsPasswordChange) {
                navigate('/change-password');
                return;
            }

            // Fallback check (mostly for desktop responsiveness testing)
            const isMobile = isMobileDevice();

            if (
                isMobile &&
                (role === 'MANAGER' || role === 'PROCUREMENT_OFFICER')
            ) {
                navigate('/mobile/home');
                return;
            }

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
                    navigate('/staff/dashboard');
                    break;

                default:
                    navigate('/warehouse/dashboard');
            }

        } catch (err) {

            console.error(err);
            setError("Invalid credentials. Please try again.");

        } finally {

            setIsLoading(false);

        }
    };


    return (

        <div className="login-page min-h-screen w-full flex flex-col items-center justify-center p-6">

            {/* Background */}
            <div className="login-background" />


            {/* LOGO BIG CENTER */}
            <div className="login-logo-wrapper relative z-10">

                <img
                    src="/images/supplymind-logo.png"
                    alt="SupplyMind Logo"
                    className="login-logo"
                />

            </div>



            {/* LOGIN GRID */}
            <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 md:grid-cols-2 gap-10">

                {/* LEFT CARD */}
                <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-md">

                    <CardHeader>

                        <CardTitle className="text-2xl font-bold text-center">
                            Internal Portal
                        </CardTitle>

                        <CardDescription className="text-center">
                            Enter your credentials to access the system.
                        </CardDescription>

                    </CardHeader>


                    <CardContent>

                        {error && (

                            <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>

                        )}


                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* EMAIL */}
                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Email
                                </label>

                                <div className="relative">

                                    <Input
                                        type="email"
                                        placeholder="user@supplymind.com"
                                        required
                                        className="pr-10"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                email: e.target.value
                                            })
                                        }
                                    />

                                    {/* ICON INSIDE FIELD */}
                                    <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />

                                </div>

                            </div>


                            {/* PASSWORD */}
                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Password
                                </label>

                                <div className="relative">

                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="pr-10"
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value
                                            })
                                        }
                                    />

                                    {/* ICON INSIDE FIELD */}
                                    <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />

                                </div>

                            </div>


                            <Button
                                type="submit"
                                className="w-full text-base font-semibold"
                                disabled={isLoading}
                            >

                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}

                                Sign In

                            </Button>

                        </form>

                    </CardContent>


                    {/* CENTERED FOOTER */}
                    <CardFooter className="flex justify-center">

                        <p className="text-xs text-center text-gray-500">

                            Restricted Access. Unauthorized use prohibited.

                        </p>

                    </CardFooter>

                </Card>



                {/* RIGHT CARD */}
                <Card className="bg-slate-950 text-white border-slate-800 shadow-2xl flex flex-col justify-center items-center p-10">

                    {/* MOBILE ICON CENTERED */}
                    <Smartphone className="h-10 w-10 text-blue-400 mb-4" />

                    <h2 className="text-2xl font-bold mb-2 text-center">
                        Instant Unlock
                    </h2>

                    <p className="text-slate-400 mb-6 text-center">
                        Already linked? Scan to login instantly.
                    </p>


                    <div className="bg-white p-4 rounded-xl">

                        <DesktopLoginQR />

                    </div>

                    <p className="mt-6 text-xs text-slate-500 text-center uppercase tracking-widest">

                        Secure Handshake Active

                    </p>

                </Card>

            </div>

        </div>
    );

};

export default Login;