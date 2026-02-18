import React, { useEffect, useState } from 'react';
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
    ShieldCheck,
    RotateCcw,
    Settings,
    MessageCircle,
} from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
//import NotificationBell from '../components/NotificationBell.jsx';

const DashboardLayout = () => {
    const [initials, setInitials] = useState('??');
    const [userRole] = useState(localStorage.getItem('userRole'));
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
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
                } else {
                    setInitials(decoded.sub?.substring(0, 2).toUpperCase() || '??');
                }
            } catch (error) {
                console.error("Error decoding token:", error);
                handleLogout();
            }
        }
    }, []);

    const navItems = [
        ...(userRole === 'ADMIN' ? [{ label: 'Admin Dashboard', path: '/admin/dashboard', icon: <ShieldCheck size={20} /> }] : []),
        ...(userRole === 'MANAGER' ? [{ label: 'Manager Dashboard', path: '/manager/dashboard', icon: <LayoutDashboard size={20} /> }] : []),
        ...(userRole === 'PROCUREMENT_OFFICER' ? [{ label: 'Procurement Hub', path: '/procurement/dashboard', icon: <ShoppingCart size={20} /> }] : []),
        ...(userRole === 'STAFF' ? [{ label: 'Warehouse Portal', path: '/staff/dashboard', icon: <Package size={20} /> }] : []),

        ...(userRole === 'MANAGER' ? [
            { type: 'divider', label: 'Managerial Tools' },
            { label: 'PO Approvals', path: '/manager/po-approval', icon: <ShieldCheck size={20} /> },
            { label: 'Inventory Network', path: '/staff/warehouselist', icon: <Truck size={20} /> },
            { label: 'Master Product List', path: '/staff/productlist', icon: <Package size={20} /> },
            { label: 'Finance and payments', path: '/finance', icon: <Package size={20} /> },
        ] : []),

        ...(userRole === 'PROCUREMENT_OFFICER' ? [
            { type: 'divider', label: 'Procurement & Inventory' },
            { label: 'Suppliers', path: '/procurement/suppliers', icon: <Users size={20} /> },
            { label: 'Purchase Orders', path: '/procurement/purchaseorders', icon: <ShoppingCart size={20} /> },
        ] : []),

        ...(userRole === 'STAFF'? [
            { type: 'divider', label: 'Warehouse Operations' },
            { label: 'Warehouse Operations', path: '/staff/dashboard', icon: <Truck size={20} /> },
            { label: 'Initiate Return', path: '/staff/returnrequest', icon: <RotateCcw size={20} /> },
            { label: 'Inventory Network', path: '/staff/warehouselist', icon: <Truck size={20} /> },
        ] : []),

        { type: 'divider' },
        { label: 'User Settings', path: '/settings', icon: <Settings size={20} /> }
    ];

    return (
        <div className="flex h-screen bg-slate-50">
            <aside className={cn(
                "bg-slate-950 text-slate-100 transition-all duration-300 flex flex-col border-r border-slate-800 shrink-0",
                isSidebarOpen ? 'w-64' : 'w-20'
            )}>
                <div className="p-6 border-b border-slate-800/50 flex items-center justify-between h-16">
                    {isSidebarOpen && <span className="font-bold tracking-tight uppercase text-sm">SUPPLY<span className="text-blue-500">MIND</span></span>}
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-500 hover:text-white transition-colors">
                        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
                    {navItems.map((item, idx) => {
                        if (item.type === 'divider') {
                            return (
                                <div key={`div-${idx}`} className="py-4">
                                    {isSidebarOpen && item.label && (
                                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
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
                                key={`${item.path}-${idx}`}
                                onClick={() => navigate(item.path)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all group",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                                )}
                            >
                                <span className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400")}>
                                    {item.icon}
                                </span>
                                {isSidebarOpen && <span className="truncate">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center">
                        {!isSidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="mr-4 text-slate-500 lg:hidden">
                                <Menu size={20} />
                            </button>
                        )}
                        <h2 className="text-sm font-semibold text-slate-600 hidden md:block">
                            {navItems.find(n => n.path === location.pathname)?.label || "Platform"}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="hidden sm:flex border-slate-200 text-slate-500 font-medium">
                            {userRole?.replace('_', ' ')}
                        </Badge>
                        {userRole === 'MANAGER' && (
                            <button
                                onClick={() => navigate('/inbox')}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative"
                                title="Inbox"
                            >
                                <MessageCircle size={20} />
                            </button>
                        )}

                        {userRole === 'MANAGER' && (
                            {/* < NotificationBell /> */}
                            )}

                        <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm border-2 border-white">
                            {initials}
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;