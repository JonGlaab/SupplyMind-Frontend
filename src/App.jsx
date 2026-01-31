import {useEffect, useState} from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
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

    useEffect(() => {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        setDebugInfo(ua);

        const check = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(ua.toLowerCase());
        setIsMobile(check);
    }, []);

    if (isMobile === null) {
        return (
            <div className="p-10 text-white bg-slate-900 h-screen">
                <h1 className="text-xl font-bold text-blue-400 mb-4">Detecting Device...</h1>
                <p className="text-xs text-slate-500 font-mono break-all">{debugInfo}</p>
            </div>
        );
    }

    return isMobile ? <Navigate to="/mobile/setup" replace /> : <Navigate to="/login" replace />;
};
const MobileIndex = () => {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/mobile/home" /> : <Navigate to="/mobile/setup" />;
};

function App() {
    return (
        <Routes>
            {/* 1. Device Detection Logic */}
            <Route path="/" element={<RootRedirect />} />

            {/* 2. Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
}
export default App;