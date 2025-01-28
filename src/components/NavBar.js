import React, { useState, useEffect } from 'react';
import { logoutUser } from '../services/api';
import blockies from 'ethereum-blockies';

const Navbar = () => {
    const [walletAddress, setWalletAddress] = useState('');
    const [username, setUsername] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        const storedWallet = localStorage.getItem('walletAddress');
        const storedUsername = localStorage.getItem('username');

        if (storedWallet) {
            setWalletAddress(storedWallet);

            // Generate Blockies identicon for wallet address
            const blockiesIcon = blockies.create({
                seed: storedWallet.toLowerCase(),
                size: 8,
                scale: 4,
            }).toDataURL();

            setProfileImage(blockiesIcon);
        }
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleLogout = async () => {
        try {
            await logoutUser();
            localStorage.clear();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="bg-[#1B263B] text-[#E0E1DD] p-4 flex justify-between items-center shadow-md border-b border-[#415A77]">
            <div className="flex items-center space-x-4">
                {/* Wallet Profile Picture */}
                {profileImage && (
                    <img
                        src={profileImage}
                        alt="Wallet Profile"
                        className="h-10 w-10 rounded-full"
                    />
                )}
                {/* Username */}
                <h1 className="text-xl font-bold">{username || 'User'}</h1>
            </div>

            <div className="flex items-center space-x-4">
                {/* Wallet Address */}
                {walletAddress && (
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-md">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                )}
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Navbar;
