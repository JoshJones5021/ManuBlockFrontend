import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import SupplyChainPage from './components/SupplyChainPage';
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
                <Route path="/supply-chain/:id" element={
                    <ProtectedRoute>
                      <SupplyChainPage />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
