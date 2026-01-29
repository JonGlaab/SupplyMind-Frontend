import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// 1. You MUST import these or the app will crash/show nothing
import Login from './pages/Login.jsx';       // Check if your file is in /pages or /components
import Register from './pages/Register.jsx';

// Your existing imports
import LinkDevice from './components/LinkDevice.jsx';
import MobileSetup from './pages/MobileSetup.jsx';
import MobileHome from './pages/MobileHome.jsx';
import MobileScanner from './pages/MobileScanner.jsx';

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Desktop Route */}
            <Route path="/link-device" element={<LinkDevice />} />

            {/* Mobile Routes */}
            <Route path="/mobile/setup" element={<MobileSetup />} />
            <Route path="/mobile/home" element={<MobileHome />} />
            <Route path="/mobile/scanner" element={<MobileScanner />} />

            {/* Dashboard Placeholder */}
            <Route path="/dashboard" element={<div className="p-10 text-2xl">🖥️ Desktop Dashboard</div>} />

            {/* Default redirect: if user hits '/', they go to '/login' */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;