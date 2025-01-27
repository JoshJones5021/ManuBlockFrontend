import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.removeItem('token');
            sessionStorage.clear();
            window.location.href = '/login';  // Forces a full page reload
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };
       

    return (
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold">Dashboard</h1>
            <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
                Logout
            </button>
        </div>
    );
};

export default Navbar;
