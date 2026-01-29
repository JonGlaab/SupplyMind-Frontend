import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/register', formData);

            localStorage.setItem('token', res.data.token);
            navigate('/link-device');
        } catch (err) {
            const msg = err.response && err.response.data ? err.response.data : "Registration failed";
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Join SupplyMind</h2>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="firstName" placeholder="First Name" required
                            className="p-3 border rounded w-full"
                            onChange={handleChange}
                        />
                        <input
                            name="lastName" placeholder="Last Name" required
                            className="p-3 border rounded w-full"
                            onChange={handleChange}
                        />
                    </div>
                    <input
                        name="email" type="email" placeholder="Email Address" required
                        className="p-3 border rounded w-full"
                        onChange={handleChange}
                    />
                    <input
                        name="password" type="password" placeholder="Password" required
                        className="p-3 border rounded w-full"
                        onChange={handleChange}
                    />

                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
                        Create Account
                    </button>
                </form>

                <p className="mt-4 text-center text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;