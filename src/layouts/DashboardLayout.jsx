import { useEffect, useState } from 'react';
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
    ShieldCheck,
    RotateCcw,
    Settings,
    Smartphone,
    MessageCircle// Added for mobile testing link
} from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import { cn } from '../lib/utils';

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

    // --- Dynamic Navigation Logic ---
    const navItems = [
        // 1. PRIMARY DASHBOARDS
        ...(userRole === 'ADMIN' ? [{ label: 'Admin System', path: '/admin/dashboard', icon: <ShieldCheck size={20} /> }] : []),

        ...(userRole === 'MANAGER' ? [{
            label: 'Manager Intelligence', path: '/manager/dashboard', icon: <LayoutDashboard size={20} />
        }] : []),

        ...(userRole === 'PROCUREMENT_OFFICER' ? [{
            label: 'Procurement Hub', path: '/procurement/dashboard', icon: <ShoppingCart size={20} />
        }] : []),

        ...(userRole === 'WAREHOUSE_STAFF' ? [{
            label: 'Warehouse Portal', path: '/warehouse/dashboard', icon: <Package size={20} />
        }] : []),

        // 2. ROLE-SPECIFIC TOOLS (Separated for Admin)
        ...(userRole === 'ADMIN' ? [{ type: 'divider', label: 'Managerial Tools' }] : []),
        ...((userRole === 'MANAGER' || userRole === 'ADMIN') ? [
            { label: 'Product Management', path: '/productlist', icon: <Package size={20} /> },
            { label: 'Warehouse Network', path: '/manager/warehouselist', icon: <Truck size={20} /> },
            { label: 'Returns & Inspection', path: '/returnsinspection', icon: <RotateCcw size={20} /> }
        ] : []),

        ...(userRole === 'ADMIN' ? [{ type: 'divider', label: 'Procurement & Inventory' }] : []),
        ...((userRole === 'PROCUREMENT_OFFICER' || userRole === 'ADMIN') ? [
            { label: 'Inbox', path: '/inbox', icon: <MessageCircle size={20} /> },
            { label: 'Product Management', path: '/productlist', icon: <Package size={20} /> },
            { label: 'Supplier Management', path: '/procurement/suppliers', icon: <Users size={20} /> },
            { label: 'Purchase Orders', path: '/procurement/purchaseorders', icon: <ShoppingCart size={20} /> },
            { label: 'Returns & Inspection', path: '/returnsinspection', icon: <RotateCcw size={20} /> },
        ] : []),

        ...(userRole === 'ADMIN' ? [{ type: 'divider', label: 'Warehouse Peons' }] : []),
        ...((userRole === 'STAFF' || userRole === 'ADMIN') ? [
            { label: 'Warehouse dashboard', path: 'warehouse/dashboard', icon: <Package size={20} /> },
            { label: 'Warehouse inventories', path: 'warehouse/inventory', icon: <Package size={20} /> },
            { label: 'received order?', path: 'warehouse/inventory', icon: <Users size={20} /> },
        ] : []),

        // 3. TESTING & SYSTEM
        ...(userRole === 'ADMIN' ? [
            { type: 'divider', label: 'Developer Testing' },
            { label: 'Mobile Interface', path: '/mobile/home', icon: <Smartphone size={20} /> },
            { label: 'Product List', path: '/productlist', icon: <Package size={20} /> }
        ] : []),

        { type: 'divider' },
        { label: 'User Settings', path: '/settings', icon: <Settings size={20} /> }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            {/* SIDEBAR */}
            <aside className={cn(
                "bg-slate-950 text-slate-100 transition-all duration-300 flex flex-col border-r border-slate-800",
                isSidebarOpen ? 'w-64' : 'w-20'
            )}>
                <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
                    {isSidebarOpen && <span className="font-bold tracking-tight uppercase text-sm">SUPPLY<span className="text-blue-500">MIND</span></span>}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-white">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item, idx) => {
                        if (item.type === 'divider') {
                            return (
                                <div key={`div-${idx}`} className="py-2">
                                    {isSidebarOpen && item.label && (
                                        <p className="px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                            {item.label}
                                        </p>
                                    )}
                                    <div className="border-t border-slate-800/50 mx-2" />
                                </div>
                            );
                        }

                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                                )}
                            >
                                {item.icon}
                                {isSidebarOpen && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
                    <div className="flex items-center md:hidden">
                        <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
                            <Menu />
                        </button>
                    </div>

                    <div className="ml-auto flex items-center space-x-4">
                        {/* Role Badge for easier testing */}
                        <span className="hidden sm:inline-block px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-500 border">
                            {userRole}
                        </span>

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