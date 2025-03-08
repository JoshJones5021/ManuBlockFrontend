import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SupplyChain from './pages/SupplyChain';
import SupplierDashboard from './pages/SupplierDashboard';
import MaterialDetail from './pages/MaterialDetail';
import TransferDetail from './pages/TransferDetail';
import ProtectedRoute from './components/ProtectedRoute';

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
                
                {/* Supplier Routes */}
                <Route path="/supplier-dashboard" element={
                    <ProtectedRoute>
                        <SupplierDashboard />
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
            </Routes>
        </Router>
    );
}

// Create a component that redirects based on user role
function RoleBasedDashboard() {
    const userRole = localStorage.getItem('role');
    
    if (userRole === 'SUPPLIER') {
        return <Navigate to="/supplier-dashboard" replace />;
    } else if (userRole === 'MANUFACTURER') {
        // Will redirect to manufacturer dashboard when implemented
        return <Dashboard />;
    } else if (userRole === 'DISTRIBUTOR') {
        // Will redirect to distributor dashboard when implemented
        return <Dashboard />;
    } else if (userRole === 'CUSTOMER') {
        // Will redirect to customer dashboard when implemented
        return <Dashboard />;
    } else {
        // Admin or any other role
        return <Dashboard />;
    }
}

export default App;