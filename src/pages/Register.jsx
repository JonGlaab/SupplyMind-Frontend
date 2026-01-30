import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    // ✅ Updated: Removed firstName/lastName from state
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/register', formData);

            console.log("🔍 Backend Response:", res.data);


            const token = res.data.token || res.data.accessToken || res.data.jwt;

            if (!token) {

                console.warn("No token found in response. Backend update required.");
                throw new Error("Registration successful, but the server didn't send a login token.");
            }

            localStorage.setItem('token', token);
            navigate('/link-device');

        } catch (err) {
            console.error("Registration Error:", err);

            const msg = err.response?.data?.message || err.response?.data || "Registration failed.";
            setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="mx-auto max-w-sm w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl">Sign Up</CardTitle>
                    <CardDescription>
                        Create your account to access the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="grid gap-4">

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input name="email" type="email" placeholder="m@example.com" required onChange={handleChange} />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Password</label>
                            <Input name="password" type="password" required onChange={handleChange} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link to="/login" className="underline hover:text-primary">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;