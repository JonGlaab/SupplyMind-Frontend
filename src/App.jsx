import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout.jsx';
import MobileLayout from './layouts/MobileLayout.jsx';

// Public & Auth Pages
import Login from './pages/Login.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

// Protected Pages
import Settings from './pages/Settings.jsx';


const AdminDashboard = () => <div className="p-10 text-2xl font-bold">Admin Dashboard</div>;
const ManagerDashboard = () => <div className="p-10 text-2xl font-bold">Manager Dashboard</div>;
const ProcurementDashboard = () => <div className="p-10 text-2xl font-bold">Procurement Dashboard</div>;
const StandardDashboard = () => <div className="p-10 text-2xl font-bold">My Dashboard</div>;

const App = () => {
    return (
        <Routes>
            {/* --- Public Routes --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Root redirects to login */}
            <Route path="/" element={<Navigate to="/login" />} />


            {/* --- Protected User Routes (All Logged-in Users) --- */}
            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<StandardDashboard />} />
                <Route path="settings" element={<Settings />} />
            </Route>


            {/* --- Admin Routes --- */}
            <Route path="/admin" element={<DashboardLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="settings" element={<Settings />} />

            </Route>


            {/* --- Manager Routes --- */}
            <Route path="/manager" element={<DashboardLayout />}>
                <Route path="dashboard" element={<ManagerDashboard />} />
                <Route path="settings" element={<Settings />} />
            </Route>


            {/* --- Procurement Routes --- */}
            <Route path="/procurement" element={<DashboardLayout />}>
                <Route path="dashboard" element={<ProcurementDashboard />} />
                <Route path="settings" element={<Settings />} />
            </Route>


            {/* --- Mobile App Routes --- */}
            <Route path="/mobile/*" element={<MobileLayout />} />


            {/* --- Fallback (404) --- */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
};

export default App;