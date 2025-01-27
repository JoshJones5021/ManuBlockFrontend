import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import manublockLogo from '../assets/manublock.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8080/api/users/login', {
                email: email.trim(),
                password: password.trim(),
            });

            if (response.status === 200 && response.data.token) {
                setMessage('Login successful! Redirecting...');
                localStorage.setItem('token', response.data.token);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setError('Invalid login attempt. Please try again.');
            }
        } catch (err) {
            setMessage('');
            setError(err.response?.data?.error || 'Something went wrong. Please try again later.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <div className="flex justify-center mb-4">
                    <img src={manublockLogo} alt="ManuBlock Logo" className="h-16" />
                </div>
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="w-full bg-gray-400 text-white py-2 rounded-md mt-2 cursor-pointer hover:bg-gray-500"
                    >
                        Don't have an account? Register here!
                    </button>
                </form>
                {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                {message && <p className="text-green-500 text-center mt-4">{message}</p>}
            </div>
        </div>
    );
};

export default Login;
