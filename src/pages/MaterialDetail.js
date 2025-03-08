import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import axios from 'axios';

const MaterialDetail = () => {
    const { materialId } = useParams();
    const navigate = useNavigate();
    const [material, setMaterial] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editedMaterial, setEditedMaterial] = useState({
        name: '',
        description: '',
        specifications: '',
        unit: ''
    });
    const [transactionHistory, setTransactionHistory] = useState([]);

    useEffect(() => {
        const fetchMaterialDetails = async () => {
            try {
                setLoading(true);
                
                // Fetch material details
                const materialResponse = await axios.get(`http://localhost:8080/api/material/${materialId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                const materialData = materialResponse.data;
                setMaterial(materialData);
                setEditedMaterial({
                    name: materialData.name,
                    description: materialData.description,
                    specifications: materialData.specifications || '',
                    unit: materialData.unit || 'units'
                });
                
                // Optionally fetch blockchain transactions related to this material
                if (materialData.blockchainItemId) {
                    const blockchainResponse = await axios.get(`http://localhost:8080/api/tracing/blockchain/item/${materialData.blockchainItemId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    
                    setTransactionHistory(blockchainResponse.data || []);
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

    const handleSave = async () => {
        try {
            const response = await axios.put(`http://localhost:8080/api/supplier/materials/${materialId}`, editedMaterial, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            setMaterial({...material, ...response.data});
            setIsEditing(false);
        } catch (err) {
            console.error('Error updating material:', err);
            setError('Failed to update material. Please try again.');
        }
    };

    const handleDeactivate = async () => {
        if (window.confirm('Are you sure you want to deactivate this material? This cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:8080/api/supplier/materials/${materialId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                navigate('/supplier-dashboard');
            } catch (err) {
                console.error('Error deactivating material:', err);
                setError('Failed to deactivate material. Please try again.');
            }
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
                        <div className="space-x-4">
                            <button 
                                onClick={() => navigate('/supplier-dashboard')}
                                className="bg-gray-600 text-white py-2 px-4 rounded"
                            >
                                Back to Dashboard
                            </button>
                            {!isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="bg-[#415A77] text-white py-2 px-4 rounded"
                                >
                                    Edit Material
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSave}
                                    className="bg-green-600 text-white py-2 px-4 rounded"
                                >
                                    Save Changes
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Material Details */}
                        <div className="lg:col-span-2 bg-[#1B263B] p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Material Details</h2>
                            
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-400 mb-1">Name</label>
                                        <input 
                                            type="text" 
                                            value={editedMaterial.name}
                                            onChange={(e) => setEditedMaterial({...editedMaterial, name: e.target.value})}
                                            className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-1">Description</label>
                                        <textarea 
                                            value={editedMaterial.description}
                                            onChange={(e) => setEditedMaterial({...editedMaterial, description: e.target.value})}
                                            className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                            rows="3"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-1">Unit</label>
                                        <select
                                            value={editedMaterial.unit}
                                            onChange={(e) => setEditedMaterial({...editedMaterial, unit: e.target.value})}
                                            className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                        >
                                            <option value="units">Units</option>
                                            <option value="kg">Kilograms</option>
                                            <option value="liters">Liters</option>
                                            <option value="meters">Meters</option>
                                            <option value="pieces">Pieces</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-1">Specifications</label>
                                        <textarea 
                                            value={editedMaterial.specifications}
                                            onChange={(e) => setEditedMaterial({...editedMaterial, specifications: e.target.value})}
                                            className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                            rows="4"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-400">Current Quantity</p>
                                            <p className="text-xl font-semibold">{material.quantity} {material.unit}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Status</p>
                                            <p className={`inline-block px-3 py-1 rounded-full ${material.active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                                {material.active ? 'Active' : 'Inactive'}
                                            </p>
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
                                            <p className="font-mono">{material.blockchainItemId}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Material Actions */}
                        <div className="bg-[#1B263B] p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Actions</h2>
                            <div className="space-y-4">
                                <button 
                                    onClick={() => navigate('/material-requests')}
                                    className="w-full bg-[#415A77] text-white py-2 px-4 rounded flex items-center justify-center"
                                >
                                    <span>View Related Requests</span>
                                </button>
                                
                                <button 
                                    onClick={handleDeactivate}
                                    className="w-full bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center" 
                                    disabled={!material.active}
                                >
                                    <span>Deactivate Material</span>
                                </button>
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
                    
                    {/* Transaction History */}
                    {material.blockchainItemId && (
                        <div className="bg-[#1B263B] p-6 rounded-lg shadow mb-8">
                            <h2 className="text-xl font-semibold mb-4">Blockchain Transaction History</h2>
                            
                            {transactionHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="py-3 px-4 text-left">Transaction ID</th>
                                                <th className="py-3 px-4 text-left">Type</th>
                                                <th className="py-3 px-4 text-left">From</th>
                                                <th className="py-3 px-4 text-left">To</th>
                                                <th className="py-3 px-4 text-left">Quantity</th>
                                                <th className="py-3 px-4 text-left">Timestamp</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactionHistory.map((tx, index) => (
                                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-900">
                                                    <td className="py-3 px-4">{tx.id}</td>
                                                    <td className="py-3 px-4">{tx.actionType}</td>
                                                    <td className="py-3 px-4 font-mono text-xs">{tx.from}</td>
                                                    <td className="py-3 px-4 font-mono text-xs">{tx.to}</td>
                                                    <td className="py-3 px-4">{tx.quantityTransferred}</td>
                                                    <td className="py-3 px-4">{new Date(tx.timestamp * 1000).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-4">No transaction history available.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MaterialDetail;