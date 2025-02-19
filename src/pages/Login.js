import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Web3 from 'web3';
import manublockLogo from '../assets/manublock.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/users/login', {
                email: email.trim(),
                password: password.trim(),
            });

            console.log('Login response:', response.data); // Log the response data

            if (response.status === 200 && response.data.token) {
                const token = response.data.token;
                const walletAddress = response.data.walletAddress;

                console.log('Wallet address from response:', walletAddress); // Log the wallet address

                localStorage.setItem('token', token);
                localStorage.setItem('walletAddress', walletAddress || 'Not connected');

                const decodedToken = jwtDecode(token);
                localStorage.setItem('userId', decodedToken.id.toString());
                localStorage.setItem('username', decodedToken.username);
                localStorage.setItem('role', decodedToken.role);

                setMessage('Login successful! Redirecting...');
                console.log('Login successful! Redirecting...');
                setTimeout(() => {
                    navigate('/dashboard');
                    connectMetaMask(walletAddress); // Trigger MetaMask connection
                }, 1500);
            } else {
                setError('Invalid login attempt. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err); // Log the error
            setError(err.response?.data?.error || 'Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const connectMetaMask = async (walletAddress) => {
        console.log('Attempting to connect MetaMask with wallet address:', walletAddress);
        if (window.ethereum && walletAddress && walletAddress !== 'Not connected') {
            const web3 = new Web3(window.ethereum);
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const accounts = await web3.eth.getAccounts();
                if (accounts.length > 0 && accounts[0].toLowerCase() === walletAddress.toLowerCase()) {
                    console.log('MetaMask connected automatically');
                } else {
                    console.log('MetaMask account does not match the stored wallet address');
                }
            } catch (error) {
                console.error('Error connecting MetaMask:', error);
            }
        } else {
            console.log('MetaMask not available or wallet address is not valid');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <div className="bg-[#1B263B] p-8 rounded-lg shadow-md w-96 border border-[#415A77]">
                <div className="flex justify-center mb-4">
                    <img src={manublockLogo} alt="ManuBlock Logo" className="h-16" />
                </div>
                <div className="bg-[#1B263B] text-white text-center py-3 px-6 rounded-lg border border-[#1B263B] mb-6">
                    <h2 className="text-2xl font-bold">Login</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#415A77] text-white py-2 rounded-md hover:bg-[#778DA9] disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Submit'}
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