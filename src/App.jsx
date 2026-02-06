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
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx';
import { ProcurementDashboard } from './pages/procurementofficer/ProcurementDashboard.jsx';

// Mobile Component Placeholders
import MobileSetup from './mobile/MobileSetup.jsx';
import MobileHome from './mobile/MobileHome.jsx';
import MobileQRLogin from "./mobile/MobileQRLogin.jsx";

// Warehouse pages
import WarehousePortal from "./pages/staff/WarehousePortal.jsx";
import InventoryView from "./pages/core/InventoryView.jsx";
import ProductList from "./pages/core/ProductList.jsx";

// Other Imports
import { PurchaseOrders } from "./pages/procurementofficer/PurchaseOrders.jsx";
import { ReturnsInspection } from "./pages/core/ReturnsInspection.jsx";
import Inventory from "./pages/core/Inventory.jsx";
import SupplierList from "./pages/procurementofficer/SupplierList.jsx";
import SupplierProductView from "./pages/procurementofficer/SupplierProductView.jsx";
import WarehouseList from "./pages/manager/WarehouseList.jsx";
import WarehouseInventory from "./pages/core/WarehouseInventory.jsx";

const App = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isAuthenticated = !!token;

    const isMobileDevice = /Mobi|Android|iPhone/i.test(navigator.userAgent);

    return (
        <Routes>
            {/* 1. PUBLIC ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* 2. DASHBOARD ROUTES (Wrapped in DashboardLayout) */}
            <Route path="/" element={<DashboardLayout />}>
                {/* Default redirect for base path */}
                <Route index element={<Navigate to="/login" replace />} />

                {/* SHARED */}
                <Route path="settings" element={<Settings />} />

                {/* ADMIN */}
                <Route path="admin/dashboard" element={<AdminDashboard />} />

                {/* MANAGER */}
                <Route path="manager/dashboard" element={<ManagerDashboard />} />
                <Route path="manager/warehouselist" element={<WarehouseList />} />
                <Route path="warehouses/:warehouseId/inventory" element={<WarehouseInventory />} />

                {/* PROCUREMENT */}
                <Route path="procurement/dashboard" element={<ProcurementDashboard />} />
                <Route path="procurement/suppliers" element={<SupplierList />} />
                <Route path="procurement/suppliers/:supplierId/products" element={<SupplierProductView />} />
                <Route path="procurement/purchaseorders" element={<PurchaseOrders />} />

                {/* WAREHOUSE/STAFF */}
                <Route path="warehouse/dashboard" element={<WarehousePortal />} />
                <Route path="warehouse/inventory" element={<InventoryView />} />

                {/* OTHER/CORE */}
                <Route path="productlist" element={<ProductList />} />
                <Route path="returnsinspection" element={<ReturnsInspection />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventoryview" element={<InventoryView />} />
            </Route>

            {/* 3. MOBILE ROUTES */}
            <Route path="/mobile" element={<MobileLayout />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<MobileHome />} />
                <Route path="setup" element={<MobileSetup />} />
                <Route path="qr-login" element={<MobileQRLogin />} />
            </Route>

            {/* 4. CATCH-ALL REDIRECT (The logic from version 2) */}
            <Route path="*" element={
                !isAuthenticated ? (
                    <Navigate to="/login" replace />
                ) : (
                    // Logic: If on mobile, always send to /mobile/home
                    // Otherwise, send to role-specific desktop dashboard
                    isMobileDevice ? (
                        <Navigate to="/mobile/home" replace />
                    ) : (
                        userRole === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> :
                            userRole === 'MANAGER' ? <Navigate to="/manager/dashboard" replace /> :
                                userRole === 'PROCUREMENT_OFFICER' ? <Navigate to="/procurement/dashboard" replace /> :
                                    <Navigate to="/warehouse/dashboard" replace />
                    )
                )
            } />
        </Routes>
    );
};

export default App;
