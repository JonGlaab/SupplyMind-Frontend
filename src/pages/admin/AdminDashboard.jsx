import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'STAFF'
    });
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
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'STAFF' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data || 'Failed to create user' });
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await api.patch(`/admin/users/${userId}/role`, { role: newRole });
            setMessage({ type: 'success', text: 'Role updated successfully!' });
            fetchUsers();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update role' });
        }
    };

    return (
        <div className="p-8 text-foreground">
            <header className="mb-10 flex justify-between items-center max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold shadow-sm">
                    ADMIN CONTROL
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {/* CREATE USER FORM */}
                <Card className="h-fit shadow-lg border-none">
                    <CardHeader>
                        <CardTitle className="text-xl">Create New User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {message.text && (
                            <div className={`p-3 rounded-md mb-4 text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-destructive/15 text-destructive'}`}>
                                {message.text}
                            </div>
                        )}
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">First Name</label>
                                    <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase">Last Name</label>
                                    <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Temporary Password</label>
                                <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Assign Role</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={formData.role}
                                    onChange={e => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="STAFF">Staff</option>
                                    <option value="PROCUREMENT_OFFICER">Procurement Officer</option>
                                </select>
                            </div>
                            <Button type="submit" className="w-full">Add User to System</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* USER LIST TABLE */}
                <Card className="lg:col-span-2 shadow-lg border-none overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Name</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase">Email</th>
                            <th className="p-4 text-xs font-bold text-muted-foreground uppercase text-center">Role Management</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(users) && users.map(user => (
                            <tr key={user.id} className="border-b hover:bg-muted/30 transition">
                                <td className="p-4 font-medium">{user.firstName} {user.lastName}</td>
                                <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                                <td className="p-4 flex justify-center gap-2">
                                    <select
                                        className="text-xs border rounded p-1"
                                        value={user.role}
                                        onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="MANAGER">Manager</option>
                                        <option value="STAFF">Staff</option>
                                        <option value="PROCUREMENT_OFFICER">Officer</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;