import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Truck,
    LogOut,
    Menu,
    X,
    Bell,
    ShieldCheck
} from 'lucide-react';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const userRole = localStorage.getItem('role');

    const navItems = [
        { label: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
            ...(userRole === 'ADMIN' ? [{
                label: 'Admin Panel',
                path: '/admin/dashboard',
                icon: <ShieldCheck size={20} />
            }] : []),
        { label: 'Inventory', path: '/dashboard/inventory', icon: <Package size={20} /> },
        { label: 'Products', path: '/dashboard/products', icon: <ShoppingCart size={20} /> },
        { label: 'Orders', path: '/dashboard/orders', icon: <Users size={20} /> },
        { label: 'Suppliers', path: '/dashboard/suppliers', icon: <Truck size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <aside
                className={`bg-slate-900 text-white transition-all duration-300 ease-in-out flex flex-col
                    ${isSidebarOpen ? 'w-64' : 'w-20'} 
                    hidden md:flex`}
            >
                <div className="p-4 flex items-center justify-between border-b border-slate-800 h-16">
                    {isSidebarOpen ? (
                        <h1 className="font-bold text-xl tracking-wider">SUPPLY<span className="text-blue-400">MIND</span></h1>
                    ) : (
                        <span className="font-bold text-xl text-blue-400">SM</span>
                    )}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center p-3 rounded-lg transition-colors
                                ${location.pathname === item.path
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <span className="min-w-[24px]">{item.icon}</span>
                            {isSidebarOpen && (
                                <span className="ml-3 font-medium text-sm animate-fade-in">
                                    {item.label}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center p-2 rounded-lg text-red-400 hover:bg-slate-800 transition-colors
                            ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="ml-3 text-sm font-medium">Sign Out</span>}
                    </button>
                </div>
            </aside>


            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center md:hidden">
                        <button className="text-gray-600"><Menu /></button>
                        <span className="ml-4 font-bold text-gray-800">SupplyMind</span>
                    </div>

                    <div className="ml-auto flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                            AD
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;