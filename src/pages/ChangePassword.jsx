import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Lock, Save, AlertCircle } from 'lucide-react';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.new !== passwords.confirm) {
            setError("Passwords do not match.");
            return;
        }

        if (passwords.new.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/api/auth/change-password', { newPassword: passwords.new });
            const role = localStorage.getItem('role');

            // Conditional Routing
            if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            setError("Failed to update password. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="text-blue-600" size={24} />
                        Setup New Password
                    </CardTitle>
                    <CardDescription>
                        For security, you must change your temporary password before continuing.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <Input
                                type="password"
                                required
                                placeholder="Min 6 characters"
                                onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm Password</label>
                            <Input
                                type="password"
                                required
                                placeholder="Re-enter password"
                                onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Save & Continue"} <Save size={16} className="ml-2"/>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChangePassword;