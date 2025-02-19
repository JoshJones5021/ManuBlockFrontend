import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import Web3 from 'web3';
import blockies from 'ethereum-blockies';

const Profile = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [user, setUser] = useState({
        username: '',
        email: '',
        role: '',
        walletAddress: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        // Fetch user details from the backend
        const fetchUserDetails = async () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const userData = await response.json();
                setUser({
                    username: userData.username,
                    email: userData.email,
                    role: userData.role,
                    walletAddress: userData.walletAddress || '',
                });
                setNewEmail(userData.email);

                // Generate Blockies identicon only if wallet address exists
                if (userData.walletAddress) {
                    generateProfileImage(userData.walletAddress);
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserDetails();
    }, []);

    const generateProfileImage = (walletAddress) => {
        const blockiesIcon = blockies
            .create({
                seed: walletAddress.toLowerCase(),
                size: 8,
                scale: 4,
            })
            .toDataURL();
        setProfileImage(blockiesIcon);
    };

    const handleConnectWallet = async () => {
        if (!user.walletAddress || user.walletAddress === 'Not connected') {
            if (window.ethereum) {
                try {
                    // Request account permissions
                    await window.ethereum.request({
                        method: 'wallet_requestPermissions',
                        params: [{ eth_accounts: {} }],
                    });

                    const web3 = new Web3(window.ethereum);
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const accounts = await web3.eth.getAccounts();

                    if (accounts.length > 0) {
                        const newWalletAddress = accounts[0];
                        setUser((prev) => ({
                            ...prev,
                            walletAddress: newWalletAddress,
                        }));
                        localStorage.setItem('walletAddress', newWalletAddress);

                        // Generate new Blockies profile image
                        generateProfileImage(newWalletAddress);

                        // Update the backend with the wallet address
                        const token = localStorage.getItem('token');
                        const userId = localStorage.getItem('userId');
                        await fetch(`http://localhost:8080/api/users/${userId}/connect-wallet`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ walletAddress: newWalletAddress }),
                        });
                    }
                } catch (error) {
                    console.error('Error connecting wallet:', error);
                }
            } else {
                alert('MetaMask is not installed!');
            }
        } else {
            handleDisconnectWallet();
        }
    };

    const handleDisconnectWallet = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            await fetch(`http://localhost:8080/api/users/${userId}/connect-wallet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ walletAddress: '' }),
            });

            localStorage.removeItem('walletAddress');
            setUser((prev) => ({ ...prev, walletAddress: '' }));
            setProfileImage(null);
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            alert('Failed to disconnect wallet. Please try again.');
        }
    };

    const handleEmailChange = (e) => {
        setNewEmail(e.target.value);
    };

    const handleSaveEmail = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: newEmail }),
            });

            if (response.ok) {
                setUser((prev) => ({ ...prev, email: newEmail }));
                setIsEditingEmail(false);
            } else {
                console.error('Failed to update email');
            }
        } catch (error) {
            console.error('Error updating email:', error);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 flex flex-col">
                <Navbar
                    username={user.username}
                    role={user.role}
                    walletAddress={user.walletAddress}
                    profileImage={profileImage}
                />

                <div className="flex-1 flex flex-col items-center p-8 overflow-auto">
                    {/* Profile Details */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-4xl">
                        <h2 className="text-2xl font-semibold text-center mb-6">Profile</h2>

                        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-bold mb-3">Basic Details</h3>
                            <div className="space-y-2">
                                <label className="block text-sm">Email Address</label>
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={handleEmailChange}
                                    className={`w-full p-2 rounded border border-gray-500 ${
                                        isEditingEmail ? 'bg-gray-600' : 'bg-gray-500 cursor-not-allowed'
                                    }`}
                                    disabled={!isEditingEmail}
                                />
                                {isEditingEmail ? (
                                    <button
                                        onClick={handleSaveEmail}
                                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300 mt-2"
                                    >
                                        Save Email
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditingEmail(true)}
                                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300 mt-2"
                                    >
                                        Change Email
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-700 rounded-lg">
                            <h3 className="text-lg font-bold mb-3">MetaMask Wallet Connection</h3>
                            <div className="flex items-center gap-4 mb-4">
                                {profileImage && (
                                    <img
                                        src={profileImage}
                                        alt="Wallet Profile"
                                        className="w-10 h-10 rounded-full"
                                    />
                                )}
                                <p>{user.walletAddress || 'Not connected'}</p>
                            </div>
                            <button
                                onClick={handleConnectWallet}
                                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                            >
                                {user.walletAddress && user.walletAddress !== 'Not connected' ? 'Disconnect Wallet' : 'Connect Wallet'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;