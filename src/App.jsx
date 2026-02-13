import React, { Suspense, lazy } from 'react';
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
import InboxPage from './pages/shared/InboxPage.jsx';

// Warehouse/Inventory
import ProductList from "./pages/staff/ProductList.jsx";
import PurchaseOrders from "./pages/procurementofficer/PurchaseOrders.jsx";
import SupplierList from "./pages/procurementofficer/SupplierList.jsx";
import SupplierProductView from "./pages/procurementofficer/SupplierProductView.jsx";
import WarehouseList from "./pages/staff/WarehouseList.jsx";
import ReturnRequest from "./pages/staff/ReturnRequest.jsx";
import ProcessOrder from "./pages/staff/ProcessOrder.jsx";
import Receiving from "./pages/staff/Receiving.jsx";
import WarehouseInventory from "./pages/staff/WarehouseInventory.jsx";
import WarehouseTransferHistory from "./pages/staff/WarehouseTransferHistory.jsx";
import WarehousePOsHistory from "./pages/staff/WarehouseOrdersReceived.jsx";
import WarehouseDashboard from "./pages/staff/WarehouseDashboard.jsx";
import InventoryTransferModal from "./pages/staff/components/InventoryTransferModal.jsx";

// Returns & PO Shared
import PurchaseOrderView from "./pages/shared/PurchaseOrder.jsx";
import ReturnInspection from "./pages/shared/ReturnsInspection.jsx";
import ReturnRequestApproval from "./pages/manager/ReturnRequestApproval.jsx";

// Mobile
import MobileSetup from './mobile/MobileSetup.jsx';
import MobileHome from './mobile/MobileHome.jsx';
import MobileQRLogin from "./mobile/MobileQRLogin.jsx";
import PurchaseOrderApproval from "./pages/manager/PurchaseOrderApproval.jsx";
import MobileReceivingManifest from './mobile/MobileReceivingManifest.jsx';
import MobileProductDetail from "./mobile/MobileProductDetail.jsx";
import MobileManualLookup from "./mobile/MobileManualLookup.jsx";
import MobileReturnRequest from './mobile/MobileReturnRequest';

import SuppliersPage from "./pages/SuppliersPage";
import FinanceDashboard from "./pages/FinanceDashboard";
import "./api/axiosConfig";




const StripePayPage = lazy(() => import('./pages/StripePayPage'));

const App = () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const isAuthenticated = !!token;
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const getRedirectPath = () => {
        if (isMobileDevice) return "/mobile/home";
        if (!isAuthenticated) return "/login";
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

                {/* basic */}
                <Route path="settings" element={<Settings />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="purchase-order/:poId" element={<PurchaseOrderView />} />

                {/* ADMIN */}
                <Route path="admin/dashboard" element={<AdminDashboard />} />

                {/* STAFF  */}
                <Route path="staff/dashboard" element={<WarehouseDashboard />} />
                <Route path="staff/receiving" element={<Receiving />} />
                <Route path="staff/returnrequest" element={<ReturnRequest />} />
                <Route path="staff/:warehouseId/transfer" element={< InventoryTransferModal />} />
                <Route path="staff/return-request/:poId" element={<ReturnRequest />} />
                <Route path="staff/transfer" element={<div className="p-8">Internal Transfer Page (Coming Soon)</div>} />
                <Route path="staff/:warehouseId/transferhistory" element={<WarehouseTransferHistory />} />
                <Route path="staff/:warehouseId/receiving-history" element={<WarehousePOsHistory />} />
                <Route path="staff/process/:poId" element={<ProcessOrder />} />
                <Route path="staff/warehouselist" element={<WarehouseList />} />
                <Route path="staff/:warehouseId/inventory" element={<WarehouseInventory />} />
                <Route path="staff/productlist" element={<ProductList />} />

                {/* PO */}
                <Route path="procurement/dashboard" element={<ProcurementDashboard />} />
                <Route path="procurement/suppliers" element={<SupplierList />} />
                <Route path="procurement/suppliers/:supplierId/products" element={<SupplierProductView />} />
                <Route path="procurement/purchaseorders" element={<PurchaseOrders />} />

                {/* MANAGER */}
                <Route path="manager/dashboard" element={<ManagerDashboard />} />
                <Route path="manager/po-approval" element={<PurchaseOrderApproval />} />
                <Route path="manager/returns-approval" element={<ReturnRequestApproval />} />
                <Route path="manager/returns-approval/:id" element={<ReturnInspection />} />
            </Route>

            <Route
                path="/payments/po/:poId"
                element={
                    <Suspense fallback={<div className="p-8 text-center">Loading Payment Gateway...</div>}>
                        <StripePayPage />
                    </Suspense>} />

            <Route path="/mobile" element={<MobileLayout />}>
                <Route index element={<Navigate to="home" replace />} />
                <Route path="home" element={<MobileHome />} />
                <Route path="setup" element={<MobileSetup />} />
                <Route path="qr-login" element={<MobileQRLogin />} />
                <Route path="process/:poId" element={<MobileReceivingManifest />} />
                <Route path="product/:productId" element={<MobileProductDetail />} />
                <Route path="manual-lookup" element={<MobileManualLookup />} />
                <Route path="return-request" element={<MobileReturnRequest />} />
            </Route>

            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/finance" element={<FinanceDashboard />} />

            <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
        </Routes>
    );
};

export default App;