import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow'; // ✅ Import ReactFlowProvider
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import SupplyChain from './pages/SupplyChain';
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
                        <Dashboard />
                    </ProtectedRoute>
                } />
                {/* ✅ Wrap SupplyChain with ReactFlowProvider */}
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

export default App;
