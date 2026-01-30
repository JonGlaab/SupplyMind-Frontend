import { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ email: '', password: '', role: 'STAFF' });
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', formData);
            setMessage({ type: 'success', text: 'User created successfully!' });
            setFormData({ email: '', password: '', role: 'STAFF' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to create user' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
            <header className="mb-10 flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">ADMIN CONTROL</div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CREATE USER FORM */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                    <h2 className="text-xl font-bold mb-6">Create New User</h2>
                    {message.text && (
                        <div className={`p-3 rounded mb-4 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email Address</label>
                            <input
                                type="email" required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Temporary Password</label>
                            <input
                                type="password" required
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Assign Role</label>
                            <select
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="MANAGER">Manager</option>
                                <option value="STAFF">Staff</option>
                                <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                            </select>
                        </div>
                        <button className="w-full bg-gray-900 text-white p-3 rounded-lg font-bold hover:bg-black transition mt-2">
                            Add User to System
                        </button>
                    </form>
                </div>

                {/* USER LIST TABLE */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">User Email</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Role</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">2FA Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(users) && users.map(user => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="p-4 font-medium">{user.email}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    {user.is2faEnabled ?
                                        <span className="text-green-600 font-bold text-sm">Active</span> :
                                        <span className="text-gray-400 text-sm italic">Disabled</span>
                                    }
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;