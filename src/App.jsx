import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout.jsx';
import MobileLayout from './layouts/MobileLayout.jsx';

// Public & Auth Pages
import Login from './pages/Login.jsx';
import ChangePassword from './pages/ChangePassword.jsx';

// Protected Pages
import Settings from './pages/Settings.jsx';

// Role-Based Dashboards
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
// Role Dashboard Placeholders
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx';
const ProcurementDashboard = () => <div className="p-10 text-2xl font-bold">Procurement Dashboard</div>;

// Mobile Component Placeholders (Ensure these files exist or adjust imports)
import MobileSetup from './mobile/MobileSetup.jsx';
import MobileHome from './mobile/MobileHome.jsx';
import MobileQRLogin from "./mobile/MobileQRLogin.jsx";

// Warehouse pages here
import WarehousePortal from "./pages/staff/WarehousePortal.jsx";
import {InventoryView} from "./pages/core/InventoryView.jsx";
import ProductList from "./pages/core/ProductList.jsx";
import {PurchaseOrders} from "./pages/core/PurchaseOrders.jsx";
import {ReturnsInspection} from "./pages/core/ReturnsInspection.jsx";
import Inventory from "./pages/core/Inventory.jsx";

const App = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole'); // Or decode from token
    const isAuthenticated = !!token;

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Shared Dashboard Routes */}
            <Route path="/" element={<DashboardLayout />}>
                {/* Redirect base / to a default based on role logic later, or just login */}
                <Route index element={<Navigate to="/login" replace />} />

                {/* SHARED: Everyone goes to the same settings page */}
                <Route path="settings" element={<Settings />} />

                {/* ADMIN */}
                <Route path="admin/dashboard" element={<AdminDashboard />} />

                {/* MANAGER */}
                <Route path="manager/dashboard" element={<ManagerDashboard />} />

                {/* PROCUREMENT */}
                <Route path="procurement/dashboard" element={<ProcurementDashboard />} />

                {/* WAREHOUSE/STAFF */}
                <Route path="warehouse/dashboard" element={<WarehousePortal />} />
                <Route path="warehouse/inventory" element={<InventoryView />} />

                {/* test routes */}
                <Route path="productlist" element={<ProductList />}/>
                <Route path="purchaseorders" element={<PurchaseOrders />}/>
                <Route path="returnsinspection" element={<ReturnsInspection />}/>
                <Route path="inventory" element={<Inventory />}/>
                <Route path="inventoryview" element={<InventoryView />}/>
            </Route>

            {/* Mobile Routes */}
            <Route path="/mobile" element={<MobileLayout />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<MobileHome />} />
                {/* ... etc */}
            </Route>

            <Route path="*" element={
                !isAuthenticated ? (
                    <Navigate to="/login" replace />
                ) : (
                    userRole === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
                    userRole === 'MANAGER' ? <Navigate to="/manager/dashboard" replace /> :
                    userRole === 'PROCUREMENT_OFFICER' ? <Navigate to="/procurement/dashboard" replace /> :
                    <Navigate to="/warehouse/dashboard" replace /> // Default for STAFF
                )
            } />

        </Routes>
    );
};

export default App;