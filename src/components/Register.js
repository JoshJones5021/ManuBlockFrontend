import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

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
    
        // Clear all existing validation messages
        document.getElementById('email').setCustomValidity('');
        document.getElementById('username').setCustomValidity('');
        document.getElementById('password').setCustomValidity('');
    
        // Email validation
        if (!userData.email.includes('@')) {
            document.getElementById('email').setCustomValidity('Please enter a valid email address.');
            document.getElementById('email').reportValidity();
            isValid = false;
        }
    
        // Username validation
        if (userData.username.length < 3 || userData.username.length > 30) {
            document.getElementById('username').setCustomValidity('Username must be between 3 and 30 characters.');
            document.getElementById('username').reportValidity();
            isValid = false;
        }
    
        // Password validation
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

        // Clear validation message as user types
        document.getElementById(e.target.name).setCustomValidity('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validateInput()) {
            return; // Stop submission if validation fails
        }

        try {
            const response = await registerUser({
                email: userData.email.trim(),
                password: userData.password.trim(),
                username: userData.username.trim(),
                role: userData.role
            });
            setMessage('Registration successful! Redirecting...');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setMessage('');
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'object') {
                    const errorMessages = Object.values(err.response.data).join(" and ");
                    setError(errorMessages);
                } else {
                    setError(err.response.data.error || "Registration failed.");
                }
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Register</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Username"
                        value={userData.username}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        id="password"
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
                </form>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {message && <p className="text-green-500 text-center mt-4">{message}</p>}
            </div>
        </div>
    );
};

export default Register;
