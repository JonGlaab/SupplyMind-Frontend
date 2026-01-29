import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import DesktopLogin from '../components/DesktopLogin'; // Importing the .js component

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', formData);

            // Standard Login Logic
            localStorage.setItem('token', res.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError("Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row h-[600px]">

                {/* LEFT SIDE: Manual Login */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center border-r border-gray-100">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
                        <p className="text-gray-500 mt-2">Enter your details to access your dashboard.</p>
                    </div>

                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="name@company.com"
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                            <input
                                type="password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••••"
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        <button className="w-full bg-gray-900 text-white p-3 rounded-lg font-bold hover:bg-black transition">
                            Sign In
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account? <Link to="/register" className="text-blue-600 font-bold">Sign up</Link>
                    </p>
                </div>

                {/* RIGHT SIDE: QR Login */}
                <div className="w-full md:w-1/2 bg-blue-50 p-8 md:p-12 flex flex-col items-center justify-center text-center relative">
                    <div className="absolute top-6 right-6">
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">FAST LOGIN</span>
                    </div>

                    <h2 className="text-xl font-bold text-blue-900 mb-2">Scan to Login</h2>
                    <p className="text-blue-600 mb-8 max-w-xs">
                        Open the SupplyMind Mobile App and point your camera here.
                    </p>

                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        {/* Pass a success callback to handle the redirect */}
                        <DesktopLogin />
                    </div>

                    <p className="mt-8 text-xs text-blue-400">
                        Secure Connection • WebSocket Encrypted
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Login;