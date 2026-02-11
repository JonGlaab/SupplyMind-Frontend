import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './layouts/DashboardLayout.jsx';
import MobileLayout from './layouts/MobileLayout.jsx';

// Pages
import Login from './pages/Login.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Settings from './pages/Settings.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx';
import ProcurementDashboard from "./pages/procurementofficer/ProcurementDashboard.jsx";
import InboxPage from './pages/shared/InboxPage.jsx'; // Import InboxPage

// Warehouse/Inventory
import ProductList from "./pages/shared/ProductList.jsx";
import PurchaseOrders from "./pages/procurementofficer/PurchaseOrders.jsx";
import SupplierList from "./pages/procurementofficer/SupplierList.jsx";
import SupplierProductView from "./pages/procurementofficer/SupplierProductView.jsx";
import WarehouseList from "./pages/shared/WarehouseList.jsx";
import ReturnRequest from "./pages/staff/ReturnRequest.jsx";
import ProcessOrder from "./pages/staff/ProcessOrder.jsx";
import Receiving from "./pages/staff/Receiving.jsx";
import WarehouseInventory from "./pages/shared/WarehouseInventory.jsx";
import WarehouseTransferHistory from "./pages/shared/WarehouseTransferHistory.jsx";
import WarehousePOsHistory from "./pages/staff/WarehouseOrdersReceived.jsx";
import WarehouseDashboard from "./pages/staff/WarehouseDashboard.jsx";

// Returns & PO Shared
import PurchaseOrderView from "./pages/shared/PurchaseOrder.jsx";
import ReturnsInspection from "./pages/shared/ReturnsInspection.jsx";
import ReturnRequestOversight from "./pages/manager/ReturnRequestOversight.jsx";

// Mobile
import MobileSetup from './mobile/MobileSetup.jsx';
import MobileHome from './mobile/MobileHome.jsx';
import MobileQRLogin from "./mobile/MobileQRLogin.jsx";
import PurchaseOrderApproval from "./pages/manager/PurchaseOrderApproval.jsx";

import StripePayPage from "./pages/StripePayPage";

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
            default: return "/staff/dashboard";
        }
    };

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />

            <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to={getRedirectPath()} replace />} />

                {/* Shared */}
                <Route path="settings" element={<Settings />} />
                <Route path="inbox" element={<InboxPage />} /> {/* Add Inbox Route */}
                <Route path="warehouselist" element={<WarehouseList />} />
                <Route path="productlist" element={<ProductList />} />
                <Route path="purchase-order/:poId" element={<PurchaseOrderView />} />

                {/* Dashboards */}
                <Route path="admin/dashboard" element={<AdminDashboard />} />
                <Route path="manager/dashboard" element={<ManagerDashboard />} />
                <Route path="manager/warehouselist" element={<WarehouseList />} />
                <Route path="staff/dashboard" element={<WarehouseDashboard />} />
                <Route path="warehouses/:warehouseId/inventory" element={<WarehouseInventory />} />
                <Route path="procurement/dashboard" element={<ProcurementDashboard />} />

                {/* Procurement */}
                <Route path="procurement/suppliers" element={<SupplierList />} />
                <Route path="procurement/suppliers/:supplierId/products" element={<SupplierProductView />} />
                <Route path="procurement/purchaseorders" element={<PurchaseOrders />} />

                {/* Warehouse  */}
                <Route path="staff/receiving" element={<Receiving />} />
                <Route path="staff/returnorder" element={<ReturnRequest />} />
                <Route path="staff/transfer" element={<div className="p-8">Internal Transfer Page (Coming Soon)</div>} />
                <Route path="staff/:warehouseId/transfers" element={<WarehouseTransferHistory />} />
                <Route path="staff/:warehouseId/receiving-history" element={<WarehousePOsHistory />} />
                <Route path="staff/process/:poId" element={<ProcessOrder />} />

                {/* Manager Oversight */}
                <Route path="manager/returns-oversight" element={<ReturnRequestOversight />} />
                <Route path="manager/returns-inspection/:returnId" element={<ReturnsInspection />} />
                <Route path="manager/returns-oversight" element={<ReturnRequestOversight />} />
                <Route path="manager/po-approval" element={<PurchaseOrderApproval />} /> {/* ADD THIS */}
                <Route path="manager/returns-inspection/:returnId" element={<ReturnsInspection />} />
            </Route>

            <Route path="/payments/po/:poId" element={<StripePayPage />} />

            <Route path="/mobile" element={<MobileLayout />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<MobileHome />} />
                <Route path="setup" element={<MobileSetup />} />
                <Route path="qr-login" element={<MobileQRLogin />} />
            </Route>

            <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
        </Routes>
    );
};

export default App;
