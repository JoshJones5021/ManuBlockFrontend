import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import axios from 'axios';

const MaterialDetail = () => {
    const { materialId } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);

    // Helper functions for transaction display
    const shortenAddress = (address) => {
        if (!address || address === 'Unknown') return 'Unknown';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'Unknown';
        return new Date(timestamp * 1000).toLocaleString();
    };

    const formatTxType = (type) => {
        if (!type) return 'Transaction';
        
        // Convert camelCase or snake_case to readable format
        return type
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    const getTxTypeColor = (type) => {
        if (!type) return 'bg-gray-700 text-gray-300';
        
        const lowerType = type.toLowerCase();
        
        if (lowerType.includes('deactivate'))
            return 'bg-red-800 text-red-200';
        if (lowerType.includes('creation') || lowerType.includes('source'))
            return 'bg-green-900 text-green-300';
        if (lowerType.includes('transfer') || lowerType.includes('transit'))
            return 'bg-blue-900 text-blue-300';
        if (lowerType.includes('process'))
            return 'bg-purple-900 text-purple-300';
        if (lowerType.includes('complete'))
            return 'bg-teal-900 text-teal-300';
        if (lowerType.includes('reject') || lowerType.includes('cancel'))
            return 'bg-red-900 text-red-300';
            
        return 'bg-gray-700 text-gray-300';
    };

    // Helper function to process the trace response
    const processTraceResponseForTransactions = (traceData) => {
        const transactions = [];
        
        // Add the creation event for the current material
        if (traceData.currentState) {
            transactions.push({
                id: `creation-${traceData.currentState.id}`,
                actionType: 'Material Creation',
                from: 'Origin',
                to: traceData.currentState.owner || 'Unknown',
                quantityTransferred: traceData.currentState.quantity,
                timestamp: new Date(traceData.currentState.timestamp || traceData.databaseDetails?.createdAt || Date.now()).getTime() / 1000,
                // Include blockchain transaction hash if available
                transactionHash: traceData.currentState.blockchainTxHash || null
            });
        }
        
        // Extract transactions from parent items
        if (traceData.parentItems && traceData.parentItems.length) {
            traceData.parentItems.forEach(parent => {
                transactions.push({
                    id: `parent-${parent.id}`,
                    actionType: 'Material Sourcing',
                    from: parent.owner || 'Unknown',
                    to: traceData.currentState?.owner || 'Unknown',
                    quantityTransferred: parent.quantity,
                    timestamp: new Date(parent.timestamp || Date.now()).getTime() / 1000
                });
            });
        }
        
        // Look for a transfers array if it exists
        if (traceData.transfers && traceData.transfers.length) {
            traceData.transfers.forEach(transfer => {
                transactions.push({
                    id: transfer.id || `transfer-${Math.random().toString(36).substr(2, 9)}`,
                    actionType: transfer.actionType || 'Transfer',
                    from: transfer.from || 'Unknown',
                    to: transfer.to || 'Unknown',
                    quantityTransferred: transfer.quantityTransferred || transfer.quantity || 0,
                    timestamp: transfer.timestamp || (Date.now() / 1000),
                    transactionHash: transfer.blockchainTxHash || transfer.transactionHash || null
                });
            });
        }
        
        // If there's blockchain transaction data in a different format
        if (traceData.transactions) {
            traceData.transactions.forEach(tx => {
                transactions.push({
                    id: tx.id || tx.transactionId || `tx-${Math.random().toString(36).substr(2, 9)}`,
                    actionType: tx.actionType || 'Blockchain Transaction',
                    from: tx.from || 'Unknown',
                    to: tx.to || 'Unknown',
                    quantityTransferred: tx.quantityTransferred || tx.quantity || 0,
                    timestamp: tx.timestamp || (Date.now() / 1000),
                    transactionHash: tx.blockchainTxHash || tx.transactionHash || tx.hash || null
                });
            });
        }
        
        // Sort transactions by timestamp (newest first)
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    };

    useEffect(() => {
        const fetchMaterialDetails = async () => {
            try {
                setLoading(true);
                
                // Fetch material details
                const materialResponse = await axios.get(`http://localhost:8080/api/supplier/material/${materialId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });                
                
                const materialData = materialResponse.data;
                setMaterial(materialData);
                
                // If material has a blockchain ID, fetch its transaction history
                // When fetching material details
                if (materialData.blockchainItemId) {
                    try {
                        // Get full trace history instead of just blockchain item details
                        const traceResponse = await axios.get(`http://localhost:8080/api/tracing/item/${materialData.blockchainItemId}/trace`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        
                        // Process the trace response to extract transaction history
                        if (traceResponse.data) {
                            // Add material's own blockchain transaction hash to the response
                            if (materialData.blockchainTxHash && traceResponse.data.currentState) {
                                traceResponse.data.currentState.blockchainTxHash = materialData.blockchainTxHash;
                            }
                            
                            const transactions = processTraceResponseForTransactions(traceResponse.data);
                            
                            // Add deactivation entry if material is inactive
                            if (!materialData.active) {
                                transactions.unshift({
                                    id: 'deactivation',
                                    actionType: 'Material Deactivated',
                                    from: materialData.supplier?.username || 'Supplier',
                                    to: 'System',
                                    quantityTransferred: materialData.quantity,
                                    timestamp: new Date(materialData.updatedAt).getTime() / 1000,
                                    // Use material's blockchain transaction hash for deactivation 
                                    // (since deactivation is a database-only operation)
                                    transactionHash: materialData.blockchainTxHash || null
                                });
                            }
                            
                            setTransactionHistory(transactions);
                        }
                    } catch (traceError) {
                        console.error('Error fetching blockchain history:', traceError);
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching material details:', err);
                setError('Failed to load material details. Please try again later.');
                setLoading(false);
            }
        };
        
        fetchMaterialDetails();
    }, [materialId]);

    const shortenTxHash = (hash) => {
        if (!hash) return 'N/A';
        return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
    };

    const handleDeactivate = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/supplier/materials/${materialId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            // Update local state to reflect the deactivation
            setMaterial(prevMaterial => ({
                ...prevMaterial,
                active: false
            }));
            
            // Add deactivation entry to transaction history
            setTransactionHistory(prevHistory => [
                {
                    id: 'deactivation',
                    actionType: 'Material Deactivated',
                    from: material.supplier?.username || 'Supplier',
                    to: 'System',
                    quantityTransferred: material.quantity,
                    timestamp: Date.now() / 1000
                },
                ...prevHistory
            ]);
            
            // Close the modal
            setShowDeactivateModal(false);
        } catch (err) {
            console.error('Error deactivating material:', err);
            setError('Failed to deactivate material. Please try again.');
            setShowDeactivateModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E0E1DD]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="bg-red-900 text-white p-4 rounded-lg">
                            <h3 className="text-xl font-bold mb-2">Error</h3>
                            <p>{error}</p>
                            <button 
                                onClick={() => navigate('/supplier-dashboard')}
                                className="mt-4 bg-[#415A77] text-white py-2 px-4 rounded"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!material) {
        return (
            <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">Material Not Found</h3>
                            <button 
                                onClick={() => navigate('/supplier-dashboard')}
                                className="mt-4 bg-[#415A77] text-white py-2 px-4 rounded"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 flex flex-col overflow-y-auto">
                <Navbar />
                
                <div className="flex-1 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-semibold">{material.name}</h1>
                            <p className="text-gray-400">Material ID: {material.id}</p>
                        </div>
                        <div>
                            <button 
                                onClick={() => navigate('/supplier-dashboard')}
                                className="bg-gray-600 text-white py-2 px-4 rounded"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Material Details */}
                        <div className="lg:col-span-2 bg-[#1B263B] p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Material Details</h2>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400">Current Quantity</p>
                                    <div className="flex items-center">
                                    <p className="text-xl font-semibold">{material.quantity} {material.unit}</p>
                                    {/* Inventory level indicator */}
                                    <div className="ml-2 w-24 h-4 bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                        className={`h-full ${
                                            material.quantity > 1000 ? 'bg-green-500' : 
                                            material.quantity > 500 ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                        style={{width: `${Math.min(100, (material.quantity / 1000) * 100)}%`}}
                                        ></div>
                                    </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400">Status</p>
                                    <div className="flex items-center">
                                    <p className={`inline-block px-3 py-1 rounded-full ${material.active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                        {material.active ? 'Active' : 'Inactive'}
                                    </p>
                                    {material.blockchainItemId && (
                                        <span className="ml-2 px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">
                                        On-Chain
                                        </span>
                                    )}
                                    </div>
                                </div>
                                </div>
                                
                                <div>
                                <p className="text-gray-400">Description</p>
                                <p>{material.description}</p>
                                </div>
                                
                                {material.specifications && (
                                <div>
                                    <p className="text-gray-400">Specifications</p>
                                    <p className="whitespace-pre-wrap">{material.specifications}</p>
                                </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400">Created At</p>
                                    <p>{new Date(material.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400">Last Updated</p>
                                    <p>{new Date(material.updatedAt).toLocaleString()}</p>
                                </div>
                                </div>
                                
                                {material.blockchainItemId && (
                                <div>
                                    <p className="text-gray-400">Blockchain Item ID</p>
                                    <div className="flex items-center">
                                    <p className="font-mono">{material.blockchainItemId}</p>
                                    <a 
                                        href={`https://sepolia.etherscan.io/token/${material.blockchainItemId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-blue-400 hover:text-blue-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Material Actions */}
                        <div className="bg-[#1B263B] p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Actions</h2>
                            <div className="space-y-4">
                            <button 
                                onClick={() => navigate(`/supplier-dashboard?tab=requests&material=${material.id}`)}
                                className="w-full bg-[#415A77] text-white py-2 px-4 rounded flex items-center justify-center"
                            >
                                <span>View Related Requests</span>
                            </button>
                                {material.active ? (
                                    <button 
                                        onClick={() => setShowDeactivateModal(true)}
                                        className="w-full bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
                                    >
                                        <span>Deactivate Material</span>
                                    </button>
                                ) : (
                                    <button 
                                        disabled
                                        className="w-full bg-gray-700 text-gray-400 py-2 px-4 rounded flex items-center justify-center cursor-not-allowed"
                                    >
                                        <span>Material is Deactivated</span>
                                    </button>
                                )}
                            </div>
                            
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">Current Allocation</h3>
                                <div className="bg-[#0D1B2A] p-4 rounded">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Total Quantity:</span>
                                        <span>{material.quantity} {material.unit}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-400">Reserved:</span>
                                        <span>0 {material.unit}</span> {/* This would come from backend */}
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>Available:</span>
                                        <span>{material.quantity} {material.unit}</span> {/* This would be calculated */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Blockchain Transaction History */}
                    {material.blockchainItemId && (
                        <div className="bg-[#1B263B] p-6 rounded-lg shadow mb-8">
                            <h2 className="text-xl font-semibold mb-4">Blockchain Transaction History</h2>
                            
                            {transactionHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="py-3 px-4 text-left">Transaction Type</th>
                                                <th className="py-3 px-4 text-left">From</th>
                                                <th className="py-3 px-4 text-left">To</th>
                                                <th className="py-3 px-4 text-left">Quantity</th>
                                                <th className="py-3 px-4 text-left">Date</th>
                                                <th className="py-3 px-4 text-left">Tx Hash</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactionHistory.map((tx, index) => (
                                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-900">
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded text-xs ${getTxTypeColor(tx.actionType)}`}>
                                                            {formatTxType(tx.actionType)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center">
                                                            <span className="font-mono text-xs truncate max-w-[120px]" title={tx.from}>
                                                                {shortenAddress(tx.from)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center">
                                                            <span className="font-mono text-xs truncate max-w-[120px]" title={tx.to}>
                                                                {shortenAddress(tx.to)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">{tx.quantityTransferred} {material.unit}</td>
                                                    <td className="py-3 px-4">{formatTimestamp(tx.timestamp)}</td>
                                                    <td className="py-3 px-4">
                                                        {tx.transactionHash ? (
                                                            <a 
                                                                href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-400 hover:text-blue-300 underline font-mono text-xs"
                                                                title="View on Etherscan"
                                                            >
                                                                {shortenTxHash(tx.transactionHash)}
                                                                <span className="ml-1 inline-block">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                </span>
                                                            </a>
                                                        ) : (
                                                            <span className="text-gray-500 text-xs">Not available</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-[#0D1B2A] rounded-lg p-6 text-center">
                                    <p className="text-gray-400">No transaction history available for this material.</p>
                                    <p className="text-sm mt-2">This could be because the material was recently created or has not been transferred yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Deactivation Warning Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-bold text-red-400 mb-4">Warning: Irreversible Action</h3>
                        <p className="mb-4">
                            Deactivating this material will permanently prevent it from being used in new transactions. 
                            This action cannot be undone.
                        </p>
                        <p className="mb-6 font-semibold">
                            Are you sure you want to deactivate this material?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={() => setShowDeactivateModal(false)}
                                className="bg-gray-600 text-white py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeactivate}
                                className="bg-red-700 text-white py-2 px-4 rounded"
                            >
                                Deactivate Material
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaterialDetail;