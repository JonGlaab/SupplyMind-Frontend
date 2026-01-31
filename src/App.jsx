import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout.jsx'; // Teammate's new switcher
import DashboardLayout from './layouts/DashboardLayout.jsx'; // Our generic layout
import MobileLayout from './layouts/MobileLayout.jsx';

// Public & Auth Pages
import Login from './pages/Login.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

// Protected Pages
import Settings from './pages/Settings.jsx';

// Role Dashboard Placeholders
// (You can replace these with real imports like './pages/admin/AdminDashboard.jsx')
const AdminDashboard = () => <div className="p-10 text-2xl font-bold">Admin Dashboard</div>;
const ManagerDashboard = () => <div className="p-10 text-2xl font-bold">Manager Dashboard</div>;
const ProcurementDashboard = () => <div className="p-10 text-2xl font-bold">Procurement Dashboard</div>;

// Mobile Component Placeholders (Ensure these files exist or adjust imports)
import MobileSetup from './mobile/MobileSetup.jsx';
import MobileHome from './mobile/MobileHome.jsx';
import MobileQRLogin from "./mobile/MobileQRLogin.jsx";

const App = () => {
    return (
        <Routes>
            {/* --- 1. Public Routes --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Root Redirect -> Login */}
            <Route path="/" element={<Navigate to="/login" replace />} />


            {/* --- 2. The Staff Portal (Teammate's MainLayout) --- */}
            {/* This layout handles its own internal views (Inventory, POs) via state */}
            <Route path="/dashboard" element={<MainLayout />} />

            {/* Dedicated Settings Route (Accessible via /settings) */}
            <Route path="/settings" element={
                <DashboardLayout>
                    <Settings />
                </DashboardLayout>
            } />


            {/* --- 3. Role-Based Routes (Admin, Manager, Procurement) --- */}

            {/* Admin Area */}
            <Route path="/admin" element={<DashboardLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Manager Area */}
            <Route path="/manager" element={<DashboardLayout />}>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Procurement Area */}
            <Route path="/procurement" element={<DashboardLayout />}>
                <Route path="dashboard" element={<ProcurementDashboard />} />
                <Route path="settings" element={<Settings />} />
            </Route>


            {/* --- 4. Mobile Routes --- */}
            <Route path="/mobile" element={<MobileLayout />}>
                {/* Default to Home */}
                <Route index element={<Navigate to="home" replace />} />

                <Route path="home" element={<MobileHome />} />
                <Route path="setup" element={<MobileSetup />} />
                <Route path="scanner" element={<MobileQRLogin />} />
            </Route>


            {/* --- 5. Fallback (404) --- */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;