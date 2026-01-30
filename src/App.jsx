import {useEffect, useState} from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import LinkDevice from './components/LinkDevice.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
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
  const [count, setCount] = useState(0)

    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Desktop Route */}
            <Route path="/link-device" element={<LinkDevice />} />

            {/* Mobile Routes */}
            <Route path="/mobile" element={<MobileLayout />}>
                <Route index element={<MobileIndex />} />
                <Route path="setup" element={<MobileSetup />} />
                <Route path="home" element={<MobileHome />} />
                <Route path="scanner" element={<MobileQRLogin />} />
            </Route>

            {/* Dashboard Placeholder */}
            <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<div className="text-2xl font-bold">Dashboard Overview</div>} />
                <Route path="inventory" element={<div>Inventory Table</div>} />
                <Route path="products" element={<div>Products List</div>} />
                <Route path="orders" element={<div>Sales Orders</div>} />
                <Route path="suppliers" element={<div>Suppliers List</div>} />
            </Route>

            {/* Default redirect: if user hits '/', they go to '/login' */}
            <Route path="*" element={<Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
    );
}

export default App
