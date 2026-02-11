import { useState } from 'react';
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

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

            localStorage.clear();

            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);

            if (needsPasswordChange) {
                navigate('/change-password');
                return;
            }

            const isMobile = isMobileDevice();

            if (isMobile && (role === 'MANAGER' || role === 'PROCUREMENT_OFFICER')) {
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

        <div className="login-page">

            {/* BACKGROUND */}
            <div className="login-background" />

            {/* CONTENT */}
            <div className="login-container">

                {/* LOGO */}
                <div className="login-logo-wrapper">

                    <img
                        src="/images/supplymind-logo.png"
                        alt="SupplyMind"
                        className="login-logo"
                    />

                </div>

                {/* CARDS */}
                <div className="login-grid">

                    {/* EMAIL LOGIN CARD */}
                    <Card className="login-card">

                        <CardHeader>

                            <CardTitle className="text-xl font-semibold">
                                Internal Portal
                            </CardTitle>

                            <CardDescription>
                                Enter your credentials to access the system.
                            </CardDescription>

                        </CardHeader>

                        <CardContent>

                            {error && (

                                <div className="login-error">

                                    <AlertCircle size={16} />
                                    {error}

                                </div>

                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">

                                {/* EMAIL */}
                                <div>

                                    <label className="text-sm font-medium">
                                        Email
                                    </label>

                                    <div className="input-wrapper">

                                        <Mail className="input-icon" />

                                        <Input
                                            type="email"
                                            placeholder="user@supplymind.com"
                                            className="pl-9"
                                            required
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                </div>

                                {/* PASSWORD */}
                                <div>

                                    <label className="text-sm font-medium">
                                        Password
                                    </label>

                                    <div className="input-wrapper">

                                        <Lock className="input-icon" />

                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-9"
                                            required
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    password: e.target.value
                                                })
                                            }
                                        />

                                    </div>

                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading}
                                >

                                    {isLoading &&
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    }

                                    Sign In

                                </Button>

                            </form>

                        </CardContent>

                        <CardFooter className="login-footer">

                            Restricted Access. Unauthorized use prohibited.

                        </CardFooter>

                    </Card>

                    {/* QR CARD */}
                    <Card className="qr-card">

                        <div className="qr-content">

                            <div className="qr-icon-wrapper">

                                <Smartphone className="qr-icon" />

                            </div>

                            <h2 className="qr-title">

                                Instant Unlock

                            </h2>

                            <p className="qr-subtitle">

                                Already linked? Scan to login instantly.

                            </p>

                            <div className="qr-box">

                                <DesktopLoginQR />

                                <p className="secure-text">

                                    Secure Handshake Active

                                </p>

                            </div>

                        </div>

                    </Card>

                </div>

            </div>

        </div>
    );
};

export default Login;
