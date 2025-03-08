import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import axios from 'axios';

const TransferDetail = () => {
    const { transferId } = useParams();
    const navigate = useNavigate();
    const [transfer, setTransfer] = useState(null);
    const [blockchainTransaction, setBlockchainTransaction] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTransferDetails = async () => {
            try {
                setLoading(true);
                
                // Fetch transfer details
                const response = await axios.get(`http://localhost:8080/api/distributor/transport/${transferId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                const transferData = response.data;
                setTransfer(transferData);
                
                // If there's a blockchain transaction hash, fetch details
                if (transferData.blockchainTxHash) {
                    try {
                        const blockchainResponse = await axios.get(
                            `http://localhost:8080/api/tracing/blockchain/transaction/${transferData.blockchainItemId}`, 
                            {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem('token')}`
                                }
                            }
                        );
                        setBlockchainTransaction(blockchainResponse.data);
                    } catch (err) {
                        console.error('Error fetching blockchain transaction:', err);
                        // Continue without blockchain data
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching transfer details:', err);
                setError('Failed to load transfer details. Please try again later.');
                setLoading(false);
            }
        };
        
        fetchTransferDetails();
    }, [transferId]);

    // Helper to format date with time
    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleString();
    };

    // Get status class for styling
    const getStatusClass = (status) => {
        switch(status) {
            case 'Scheduled':
                return 'bg-yellow-900 text-yellow-300';
            case 'In Transit':
                return 'bg-blue-900 text-blue-300';
            case 'Delivered':
                return 'bg-green-900 text-green-300';
            default:
                return 'bg-gray-900 text-gray-300';
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

    if (!transfer) {
        return (
            <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">Transfer Not Found</h3>
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
                            <h1 className="text-2xl font-semibold">Transfer #{transfer.trackingNumber}</h1>
                            <div className="flex items-center mt-1">
                                <p className="text-gray-400 mr-2">Status:</p>
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(transfer.status)}`}>
                                    {transfer.status}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/supplier-dashboard')}
                            className="bg-[#415A77] text-white py-2 px-4 rounded"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Transfer Overview */}
                        <div className="lg:col-span-2 bg-[#1B263B] p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Transfer Overview</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-400">Transfer Type</p>
                                        <p className="font-semibold">{transfer.type}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">From</p>
                                        <p className="font-semibold">{transfer.source?.username || 'Unknown'}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">To</p>
                                        <p className="font-semibold">{transfer.destination?.username || 'Unknown'}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">Material/Product</p>
                                        <p className="font-semibold">
                                            {transfer.materialRequest 
                                                ? transfer.materialRequest.items?.[0]?.material?.name || 'Unknown Material'
                                                : transfer.order 
                                                    ? transfer.order.items?.[0]?.product?.name || 'Unknown Product'
                                                    : 'Not specified'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-400">Created At</p>
                                        <p>{formatDateTime(transfer.createdAt)}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">Scheduled Pickup</p>
                                        <p>{formatDateTime(transfer.scheduledPickupDate)}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">Actual Pickup</p>
                                        <p>{formatDateTime(transfer.actualPickupDate)}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">Scheduled Delivery</p>
                                        <p>{formatDateTime(transfer.scheduledDeliveryDate)}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">Actual Delivery</p>
                                        <p>{formatDateTime(transfer.actualDeliveryDate)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            {transfer.notes && (
                                <div className="mt-4">
                                    <p className="text-gray-400">Notes</p>
                                    <p className="whitespace-pre-wrap">{transfer.notes}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Tracking Status */}
                        <div className="bg-[#1B263B] p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Tracking Status</h2>
                            
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute h-full w-0.5 bg-gray-700 left-2.5 top-0"></div>
                                
                                {/* Status points */}
                                <div className="space-y-6 relative">
                                    <div className="flex items-start">
                                        <div className={`h-5 w-5 rounded-full mt-1 ${transfer.createdAt ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                        <div className="ml-4">
                                            <p className="font-medium">Created</p>
                                            <p className="text-sm text-gray-400">{formatDateTime(transfer.createdAt)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className={`h-5 w-5 rounded-full mt-1 ${transfer.actualPickupDate ? 'bg-green-500' : transfer.status === 'Scheduled' ? 'bg-yellow-500' : 'bg-gray-700'}`}></div>
                                        <div className="ml-4">
                                            <p className="font-medium">Pickup</p>
                                            <p className="text-sm text-gray-400">
                                                {transfer.actualPickupDate 
                                                    ? formatDateTime(transfer.actualPickupDate) 
                                                    : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className={`h-5 w-5 rounded-full mt-1 ${transfer.status === 'In Transit' ? 'bg-blue-500' : transfer.status === 'Delivered' ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                        <div className="ml-4">
                                            <p className="font-medium">In Transit</p>
                                            <p className="text-sm text-gray-400">
                                                {transfer.status === 'In Transit' ? 'Currently in transit' : 
                                                 transfer.status === 'Delivered' ? 'Completed' : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className={`h-5 w-5 rounded-full mt-1 ${transfer.actualDeliveryDate ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                                        <div className="ml-4">
                                            <p className="font-medium">Delivery</p>
                                            <p className="text-sm text-gray-400">
                                                {transfer.actualDeliveryDate 
                                                    ? formatDateTime(transfer.actualDeliveryDate) 
                                                    : 'Pending'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Associated request/order */}
                            <div className="mt-8 p-4 bg-[#0D1B2A] rounded-lg">
                                <h3 className="font-semibold mb-2">
                                    {transfer.materialRequest ? 'Associated Material Request' : 'Associated Order'}
                                </h3>
                                
                                {transfer.materialRequest && (
                                    <div>
                                        <p className="text-sm">
                                            <span className="text-gray-400">Request Number:</span> {transfer.materialRequest.requestNumber}
                                        </p>
                                        <button 
                                            onClick={() => navigate(`/material-request/${transfer.materialRequest.id}`)}
                                            className="mt-2 text-sm text-blue-400 hover:underline"
                                        >
                                            View Request Details
                                        </button>
                                    </div>
                                )}
                                
                                {transfer.order && (
                                    <div>
                                        <p className="text-sm">
                                            <span className="text-gray-400">Order Number:</span> {transfer.order.orderNumber}
                                        </p>
                                        <button 
                                            onClick={() => navigate(`/order/${transfer.order.id}`)}
                                            className="mt-2 text-sm text-blue-400 hover:underline"
                                        >
                                            View Order Details
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Blockchain Information */}
                    {transfer.blockchainTxHash && (
                        <div className="bg-[#1B263B] p-6 rounded-lg shadow mb-8">
                            <h2 className="text-xl font-semibold mb-4">Blockchain Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                <div>
                                    <p className="text-gray-400">Transaction Hash</p>
                                    <p className="font-mono break-all">{transfer.blockchainTxHash}</p>
                                </div>
                                
                                {blockchainTransaction && (
                                    <>
                                        <div>
                                            <p className="text-gray-400">Transaction ID</p>
                                            <p>{blockchainTransaction.id}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-gray-400">Item ID</p>
                                            <p>{blockchainTransaction.itemId}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-gray-400">From Address</p>
                                            <p className="font-mono text-xs break-all">{blockchainTransaction.from}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-gray-400">To Address</p>
                                            <p className="font-mono text-xs break-all">{blockchainTransaction.to}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-gray-400">Quantity</p>
                                            <p>{blockchainTransaction.quantityTransferred}</p>
                                        </div>
                                        
                                        <div>
                                            <p className="text-gray-400">Timestamp</p>
                                            <p>{formatDateTime(blockchainTransaction.timestamp * 1000)}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <a 
                                href={`https://sepolia.etherscan.io/tx/${transfer.blockchainTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline flex items-center"
                            >
                                <span>View on Etherscan</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TransferDetail;