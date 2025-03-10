import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SupplyChain from './pages/SupplyChain';
import SupplierDashboard from './pages/SupplierDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import MaterialDetail from './pages/MaterialDetail';
import TransferDetail from './pages/TransferDetail';
import UserManagement from './pages/UserManagement';
import OrderDetail from './pages/OrderDetail';
import ProtectedRoute from './components/ProtectedRoute';

// New: Admin Protected Route
const AdminRoute = ({ children }) => {
    const userRole = localStorage.getItem('role');
    return userRole === 'ADMIN' ? children : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <RoleBasedDashboard />
                    </ProtectedRoute>
                } />

                {/* Customer Routes */}
                <Route path="/customer-dashboard" element={
                    <ProtectedRoute>
                        <CustomerDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/order/:orderId" element={
                    <ProtectedRoute>
                        <OrderDetail />
                    </ProtectedRoute>
                } />

                {/* Supplier Routes */}
                <Route path="/supplier-dashboard" element={
                    <ProtectedRoute>
                        <SupplierDashboard />
                    </ProtectedRoute>
                } />
                
                {/* Distributor Routes */}
                <Route path="/distributor-dashboard" element={
                    <ProtectedRoute>
                        <DistributorDashboard />
                    </ProtectedRoute>
                } />
                
                <Route path="/material/:materialId" element={
                    <ProtectedRoute>
                        <MaterialDetail />
                    </ProtectedRoute>
                } />
                <Route path="/transfer/:transferId" element={
                    <ProtectedRoute>
                        <TransferDetail />
                    </ProtectedRoute>
                } />

                <Route path="/supply-chain/:id" element={
                    <ProtectedRoute>
                        <ReactFlowProvider>
                            <SupplyChain />
                        </ReactFlowProvider>
                    </ProtectedRoute>
                } />
                
                <Route path="/user-management" element={
                    <ProtectedRoute>
                        <AdminRoute>
                            <UserManagement />
                        </AdminRoute>
                    </ProtectedRoute>
                } />
                {/* Manufacturer Routes */}
                <Route path="/manufacturer-dashboard" element={
                    <ProtectedRoute>
                        <ReactFlowProvider>
                            <ManufacturerDashboard />
                        </ReactFlowProvider>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

// Create a component that redirects based on user role
function RoleBasedDashboard() {
    const userRole = localStorage.getItem('role');
    
    if (userRole === 'SUPPLIER') {
        return <Navigate to="/supplier-dashboard" replace />;
    } else if (userRole === 'DISTRIBUTOR') {
        return <Navigate to="/distributor-dashboard" replace />;
    } else if (userRole === 'MANUFACTURER') {
        return <Navigate to="/manufacturer-dashboard" replace />;
    } else if (userRole === 'CUSTOMER') {
        return <Navigate to="/customer-dashboard" replace />;
    } else {
        return <Dashboard />;
    }
}

export default App;