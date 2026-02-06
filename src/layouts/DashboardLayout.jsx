import {useEffect, useState} from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Cog,
    Truck,
    LogOut,
    Menu,
    X,
    Bell,
    ShieldCheck,
    RotateCcw,
    Settings
} from 'lucide-react';
import {jwtDecode} from "jwt-decode";
import {cn} from '../lib/utils';

const DashboardLayout = () => {
    const [initials, setInitials] = useState('??');
    const [userRole] = useState(localStorage.getItem('userRole'));
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);

                const fName = decoded.firstName || '';
                const lName = decoded.lastName || '';
                if (fName && lName) {
                    setInitials(`${fName[0]}${lName[0]}`.toUpperCase());
                } else if (decoded.sub) {
                    setInitials(decoded.sub.substring(0, 2).toUpperCase());
                }

            } catch (error) {
                console.error("Error decoding token:", error);
                handleLogout();
            }
        }
    }, []);

    const navItems = [
        // Intelligence Hub
        // TODO: Remove (userRole === 'ADMIN') after dev testing is complete
        ...((userRole === 'MANAGER' || userRole === 'ADMIN') ? [{
            label: userRole === 'MANAGER' ? 'Manager Intelligence' : 'Test: Manager Hub',
            path: '/manager/dashboard',
            icon: <LayoutDashboard size={20} />
        }] : []),

        // Admin Panel
        ...(userRole === 'ADMIN' ? [{
            label: 'System Administration',
            path: '/admin/dashboard',
            icon: <ShieldCheck size={20} />
        }] : []),

        // Procurement Officer Dashboard
        ...(userRole === 'PROCUREMENT_OFFICER' ? [{
            label: 'Procurement Dashboard',
            path: '/procurement/dashboard',
            icon: <LayoutDashboard size={20} />
        }] : []),

        // Operational Views (ADMIN has access to everything for testing)
        // TODO: Restrict these paths to specific roles before production
        { label: 'Product Catalog', path: '/productlist', icon: <Package size={20} /> },
        { label: 'Stock Management', path: '/inventory', icon: <Truck size={20} /> },
        { label: 'Purchase Orders', path: '/procurement/purchaseorders', icon: <ShoppingCart size={20} /> },
        { label: 'Returns & Inspection', path: '/returnsinspection', icon: <RotateCcw size={20} /> },

        // Warehouse (ADMIN Test)
        ...(userRole === 'ADMIN' ? [{
            label: 'Warehouse Portal', path: '/warehouse/dashboard', icon: <Package size={20} />
        }] : []),

        { label: 'User Settings', path: '/settings', icon: <Cog size={20} /> }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <aside className={cn(
                "bg-slate-950 text-slate-100 transition-all duration-300 flex flex-col border-r border-slate-800",
                isSidebarOpen ? 'w-64' : 'w-20'
            )}>
                <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
                    {isSidebarOpen && <span className="font-bold tracking-tight uppercase">SUPPLY<span className="text-blue-500">MIND</span></span>}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-white">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
                                location.pathname === item.path
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                            )}
                        >
                            {item.icon}
                            {isSidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Sign Out</span>}
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

                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm border border-blue-200 shadow-sm">
                            {initials}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;