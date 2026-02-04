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

// Core Pages (Mapped to Sidebar Views)
import ProductList from "./pages/core/ProductList.jsx";
import Inventory from "./pages/core/Inventory.jsx";
import { ReturnsInspection } from "./pages/core/ReturnsInspection.jsx";

// Procurement & Supplier Pages
import { PurchaseOrders } from "./pages/procurementofficer/PurchaseOrders.jsx";
import SupplierList from "./pages/procurementofficer/SupplierList.jsx";
import SupplierProductView from "./pages/procurementofficer/SupplierProductView.jsx";

// Manager Specialized Pages
import WarehouseList from "./pages/manager/WarehouseList.jsx";
import WarehouseInventory from "./pages/WarehouseInventory.jsx";

// Staff/Warehouse Pages
import WarehousePortal from "./pages/staff/WarehousePortal.jsx";
import InventoryView from "./pages/core/InventoryView.jsx";

// Mobile Pages
import MobileSetup from './mobile/MobileSetup.jsx';
import MobileHome from './mobile/MobileHome.jsx';
import MobileQRLogin from "./mobile/MobileQRLogin.jsx";

const App = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('UserRole');
    const isAuthenticated = !!token;

    // Placeholder for Procurement Dashboard once ready
    const ProcurementDashboard = () => <div className="p-10 text-2xl font-bold">Procurement Dashboard</div>;

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Main Application Frame (Protected) */}
            <Route
                path="/"
                element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
            >
                {/* Landing Page Logic */}
                <Route index element={
                    userRole === 'ADMIN' ? <Navigate to="dashboard" replace /> :
                        userRole === 'MANAGER' ? <Navigate to="dashboard" replace /> :
                            userRole === 'PROCUREMENT_OFFICER' ? <Navigate to="procurement" replace /> :
                                <Navigate to="inventory" replace />
                } />

                {/* Unified Dashboard Path */}
                <Route path="dashboard" element={
                    userRole === 'ADMIN' ? <AdminDashboard /> : <ManagerDashboard />
                } />

                {/* Inventory Operations */}
                <Route path="productlist" element={<ProductList />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventoryview" element={<InventoryView />} />

                {/* 4. Procurement & Suppliers */}
                <Route path="procurement" element={<PurchaseOrders />} />
                <Route path="suppliers" element={<SupplierList />} />
                <Route path="suppliers/:supplierId/products" element={<SupplierProductView />} />

                {/* 5. Logistics & Admin Specific */}
                <Route path="returns" element={<ReturnsInspection />} />
                <Route path="admin-panel" element={<AdminDashboard />} />

                {/* 6. Specialized Manager & Settings */}
                <Route path="manager/warehouselist" element={<WarehouseList />} />
                <Route path="warehouses/:warehouseId/inventory" element={<WarehouseInventory />} />
                <Route path="settings" element={<Settings />} />

                {/* Staff Default */}
                <Route path="warehouse/dashboard" element={<WarehousePortal />} />
            </Route>

            {/* Mobile Application */}
            <Route path="/mobile" element={<MobileLayout />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<MobileHome />} />
                <Route path="setup" element={<MobileSetup />} />
                <Route path="qr-login" element={<MobileQRLogin />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;