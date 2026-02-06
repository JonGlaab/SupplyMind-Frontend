import React from 'react'; // Added this
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
const ProcurementDashboard = () => <div className="p-10 text-2xl font-bold">Procurement Dashboard</div>;

// Mobile Components
import MobileSetup from './mobile/MobileSetup.jsx';
import MobileHome from './mobile/MobileHome.jsx';
import MobileQRLogin from "./mobile/MobileQRLogin.jsx";

// Warehouse/Inventory Pages
import WarehousePortal from "./pages/staff/WarehousePortal.jsx";
import InventoryView from "./pages/core/InventoryView.jsx";
import ProductList from "./pages/core/ProductList.jsx";
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

    const getRedirectPath = () => {
        if (!isAuthenticated) return "/login";
        if (isMobileDevice) return "/mobile/home";

        switch (userRole) {
            case 'ADMIN': return "/admin/dashboard";
            case 'MANAGER': return "/manager/dashboard";
            case 'PROCUREMENT_OFFICER': return "/procurement/dashboard";
            default: return "/warehouse/dashboard";
        }
    };

    return (
        <Routes>
            {/* 1. PUBLIC ROUTES */}
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* 2. DASHBOARD ROUTES */}
            <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to={getRedirectPath()} replace />} />

                <Route path="settings" element={<Settings />} />
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="manager/dashboard" element={<ManagerDashboard />} />
                <Route path="manager/warehouselist" element={<WarehouseList />} />
                <Route path="warehouses/:warehouseId/inventory" element={<WarehouseInventory />} />
                <Route path="procurement/dashboard" element={<ProcurementDashboard />} />
                <Route path="procurement/suppliers" element={<SupplierList />} />
                <Route path="procurement/suppliers/:supplierId/products" element={<SupplierProductView />} />
                <Route path="procurement/purchaseorders" element={<PurchaseOrders />} />
                <Route path="warehouse/dashboard" element={<WarehousePortal />} />
                <Route path="warehouse/inventory" element={<InventoryView />} />
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

            {/* 4. CATCH-ALL */}
            <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
        </Routes>
    );
};

export default App;