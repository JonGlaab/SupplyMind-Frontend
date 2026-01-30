import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import LinkDevice from './components/LinkDevice.jsx';
import MobileSetup from './pages/MobileSetup.jsx';
import MobileHome from './pages/MobileHome.jsx';
import MobileScanner from './pages/MobileScanner.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

function App() {
  const [count, setCount] = useState(0)

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Desktop Route */}
            <Route path="/link-device" element={<LinkDevice />} />

            {/* Mobile "Companion" Routes */}
            <Route path="/mobile/setup" element={<MobileSetup />} />
            <Route path="/mobile/home" element={<MobileHome />} />
            <Route path="/mobile/scanner" element={<MobileScanner />} />

            {/* Dashboard Placeholder */}
            <Route path="/dashboard" element={<div className="p-10 text-2xl">🖥️ Desktop Dashboard</div>} />

            {/* Default redirect */}
            <Route path="*" element={<Navigate to="/login" />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
    );
}

export default App
