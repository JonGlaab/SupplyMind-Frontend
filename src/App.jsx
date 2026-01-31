import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import LinkDevice from './components/LinkDevice.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import MainLayout from './layouts/MainLayout.jsx'; // Our new switcher
import './App.css';
import './index.css';
// Mobile Components
import MobileLayout from './mobile/MobileLayout.jsx';
import MobileSetup from './mobile/MobileSetup.jsx';
import MobileHome from './mobile/MobileHome.jsx';
import MobileQRLogin from "./mobile/MobileQRLogin.jsx";

const RootRedirect = () => {
    const [isMobile, setIsMobile] = useState(null);
    const [debugInfo, setDebugInfo] = useState("");

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

            {/* 3. The Staff Portal (Restored)
                MainLayout handles its own views (Inventory, POs, etc.) internally */}
            <Route path="/dashboard" element={<MainLayout />} />

            {/* 4. Mobile Routes Grouped */}
            <Route path="/mobile" element={<MobileLayout />}>
                <Route index element={<MobileIndex />} />
                <Route path="setup" element={<MobileSetup />} />
                <Route path="home" element={<MobileHome />} />
                <Route path="scanner" element={<MobileQRLogin />} />
            </Route>

            {/* 5. Misc Admin/Tools */}
            <Route path="/link-device" element={<LinkDevice />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* 6. Global Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;