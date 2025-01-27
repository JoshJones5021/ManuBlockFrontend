import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import manublockLogo from '../assets/manublock.png';

const Register = () => {
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'CUSTOMER'
    });

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const validateInput = () => {
        let isValid = true;
        document.getElementById('email').setCustomValidity('');
        document.getElementById('username').setCustomValidity('');
        document.getElementById('password').setCustomValidity('');

        if (!userData.email.includes('@')) {
            document.getElementById('email').setCustomValidity('Please enter a valid email address.');
            document.getElementById('email').reportValidity();
            isValid = false;
        }

        if (userData.username.length < 3 || userData.username.length > 30) {
            document.getElementById('username').setCustomValidity('Username must be between 3 and 30 characters.');
            document.getElementById('username').reportValidity();
            isValid = false;
        }

        if (userData.password.length < 6) {
            document.getElementById('password').setCustomValidity('Password must be at least 6 characters long.');
            document.getElementById('password').reportValidity();
            isValid = false;
        }

        return isValid;
    };

    const handleChange = (e) => {
        setUserData({
            ...userData,
            [e.target.name]: e.target.value
        });
        document.getElementById(e.target.name).setCustomValidity('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            await registerUser({
                email: userData.email.trim(),
                username: userData.username.trim(),
                password: userData.password.trim()
            });

            setMessage('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <div className="flex justify-center mb-4">
                    <img src={manublockLogo} alt="ManuBlock Logo" className="h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Register</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={userData.username}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={userData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button type="submit" className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">
                        Register
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-full bg-gray-400 text-white py-2 rounded-md mt-2 cursor-pointer hover:bg-gray-500"
                    >
                        Already a user? Login!
                    </button>
                </form>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {message && <p className="text-green-500 text-center mt-4">{message}</p>}
            </div>
        </div>
    );
};

export default Register;
