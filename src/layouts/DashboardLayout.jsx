import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { jwtDecode } from "jwt-decode";
import { Sidebar } from '../components/Sidebar'; // Import your new Sidebar

const DashboardLayout = () => {
    const [initials, setInitials] = useState('??');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const decoded = jwtDecode(token);
            // Extraction logic for initials
            const fName = decoded.firstName || '';
            const lName = decoded.lastName || '';
            if (fName && lName) {
                setInitials(`${fName[0]}${lName[0]}`.toUpperCase());
            } else if (decoded.sub) {
                setInitials(decoded.sub.substring(0, 2).toUpperCase());
            }
        } catch (error) {
            console.error("Error decoding token:", error);
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    // This handles the clicks from your new Sidebar component
    const handleViewChange = (view) => {
        navigate(`/${view}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');

        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-slate-50">
            {/* The Unified Sidebar */}
            <Sidebar
                currentView={location.pathname.substring(1)}
                onViewChange={handleViewChange}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Global Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
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

                {/* Main Content Area: Renders ProductList, ManagerDashboard, etc. */}
                <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;