import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    getMaterialsBySupplier, 
    getPendingRequests, 
    getTransportsForSource,
    createMaterial,
    approveRequest,
    allocateMaterials,
    getSupplyChainsByUserId
} from '../services/supplyChainApi';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import Pagination from '../components/Pagination';
import MaterialRequestReviewModal from '../components/modals/MaterialRequestReviewModal';

const SupplierDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory');
    const [materials, setMaterials] = useState([]);
    const [requests, setRequests] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [supplyChains, setSupplyChains] = useState([]);
    const [selectedSupplyChain, setSelectedSupplyChain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    // New material form
    const [newMaterial, setNewMaterial] = useState({
        name: '',
        description: '',
        quantity: 0,
        unit: 'units',
        specifications: '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const supplierId = localStorage.getItem('userId');

    useEffect(() => {
        const userRole = localStorage.getItem('role');
        if (userRole !== 'SUPPLIER') {
            alert('Unauthorized access. Redirecting to dashboard.');
            navigate('/dashboard');
            return;
        }

        fetchSupplierData();
    }, []);

    const fetchSupplierData = async () => {
        setLoading(true);
        try {
            const materialsData = await getMaterialsBySupplier(supplierId);
            setMaterials(materialsData);

            const requestsData = await getPendingRequests(supplierId);
            setRequests(requestsData);

            const transfersData = await getTransportsForSource(supplierId);
            setTransfers(transfersData);

            // ✅ Fetch supply chains the supplier is assigned to
            const chains = await getSupplyChainsByUserId(supplierId);
            setSupplyChains(chains);

            if (chains.length > 0) {
                setSelectedSupplyChain(chains[0].id); // ✅ Default to the first one
            }
        } catch (error) {
            console.error('Error fetching supplier data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (materialId) => {
        console.log(`Navigating to /material/${materialId}`); // Debugging
        if (!materialId) {
            console.error("❌ Material ID is undefined!");
            return;
        }
        navigate(`/material/${materialId}`);
    };
    

    const handleCreateMaterial = async () => {
        try {
            if (!selectedSupplyChain) {
                alert('Please select a supply chain.');
                return;
            }

            const materialData = {
                ...newMaterial,
                supplierId,
                supplyChainId: selectedSupplyChain, // ✅ Use selected supply chain
            };

            const createdMaterial = await createMaterial(materialData);
            setMaterials([...materials, createdMaterial]);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating material:', error);
            alert("Failed to create material. Please try again.");
        }
    };

    const handleApproveRequest = async (requestId, approvals) => {
        try {
            await approveRequest(requestId, approvals);

            // Update requests list
            const updatedRequests = requests.map(req => 
                req.id === requestId ? { ...req, status: 'Approved' } : req
            );
            setRequests(updatedRequests);
        } catch (error) {
            console.error('Error approving request:', error);
            alert('Failed to approve request. Please try again.');
        }
    };

    const handleAllocateMaterials = async (requestId) => {
        try {
            await allocateMaterials(requestId);

            // Update requests list
            const updatedRequests = requests.map(req => 
                req.id === requestId ? { ...req, status: 'Allocated' } : req
            );
            setRequests(updatedRequests);
            
            // Refresh materials to show updated quantities
            fetchSupplierData();
        } catch (error) {
            console.error('Error allocating materials:', error);
            alert('Failed to allocate materials. Please try again.');
        }
    };

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // Get current items based on active tab
    const currentItems = activeTab === 'inventory' 
        ? materials.slice(indexOfFirstItem, indexOfLastItem)
        : activeTab === 'requests' 
            ? requests.slice(indexOfFirstItem, indexOfLastItem)
            : transfers.slice(indexOfFirstItem, indexOfLastItem);

    const totalItems = activeTab === 'inventory' 
        ? materials.length 
        : activeTab === 'requests' 
            ? requests.length 
            : transfers.length;

    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-y-auto">
                <Navbar />

                <div className="flex-1 p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-[#1B263B] text-white text-center py-3 px-6 rounded-lg shadow-md w-full max-w-4xl">
                            <h1 className="text-2xl font-semibold">Supplier Dashboard</h1>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`py-2 px-4 rounded-t-lg ${
                                    activeTab === 'inventory' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Material Inventory
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`py-2 px-4 rounded-t-lg relative ${
                                    activeTab === 'requests' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Material Requests
                                {requests.filter(r => r.status === 'Requested').length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        {requests.filter(r => r.status === 'Requested').length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('transfers')}
                                className={`py-2 px-4 rounded-t-lg ${
                                    activeTab === 'transfers' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Transfer History
                            </button>
                        </div>

                        {activeTab === 'inventory' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300"
                            >
                                + Add New Material
                            </button>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="bg-[#1B263B] rounded-lg p-6 min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E0E1DD]"></div>
                            </div>
                        ) : activeTab === 'inventory' ? (
                            <div>
                                {currentItems.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400">No materials found. Create your first material!</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {currentItems.map((material) => (
                                            <div key={material.id} className="bg-[#0D1B2A] p-5 rounded-lg shadow-md border border-[#415A77]">
                                                <h3 className="text-lg font-semibold">{material.name}</h3>
                                                <p className="text-gray-400 text-sm mt-1">{material.description}</p>
                                                <div className="mt-3 bg-[#1B263B] p-3 rounded-md">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400">Quantity:</span>
                                                        <span className="font-medium">{material.quantity} {material.unit}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-gray-400">Status:</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            material.active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                                        }`}>
                                                            {material.active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex justify-end">
                                                <button 
                                                    className="text-sm bg-[#415A77] text-white px-3 py-1 rounded hover:bg-[#778DA9]"
                                                    onClick={() => handleViewDetails(material.id)} // ✅ Delayed execution
                                                >
                                                    Details
                                                </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : activeTab === 'requests' ? (
                            <div>
                                {currentItems.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400">No material requests at this time.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                            <thead>
                                                <tr className="border-b border-gray-700">
                                                    <th className="py-3 px-4 text-left">Request #</th>
                                                    <th className="py-3 px-4 text-left">Manufacturer</th>
                                                    <th className="py-3 px-4 text-left">Requested Date</th>
                                                    <th className="py-3 px-4 text-left">Status</th>
                                                    <th className="py-3 px-4 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((request) => (
                                                    <tr key={request.id} className="border-b border-gray-700 hover:bg-gray-900">
                                                        <td className="py-3 px-4">{request.requestNumber}</td>
                                                        <td className="py-3 px-4">{request.manufacturer.username}</td>
                                                        <td className="py-3 px-4">{new Date(request.createdAt).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                request.status === 'Requested' ? 'bg-yellow-900 text-yellow-300' :
                                                                request.status === 'Approved' ? 'bg-blue-900 text-blue-300' :
                                                                request.status === 'Allocated' ? 'bg-purple-900 text-purple-300' :
                                                                request.status === 'Ready for Pickup' ? 'bg-green-900 text-green-300' :
                                                                'bg-gray-900 text-gray-300'
                                                            }`}>
                                                                {request.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {request.status === 'Requested' && (
                                                                <button
                                                                onClick={() => {
                                                                    setSelectedRequest(request);
                                                                    setIsReviewModalOpen(true);
                                                                }}
                                                                className="bg-[#415A77] text-white py-1 px-3 rounded text-sm hover:bg-[#778DA9]"
                                                                >
                                                                    Review
                                                                </button>
                                                            )}
                                                            {request.status === 'Approved' && (
                                                                <button
                                                                    onClick={() => handleAllocateMaterials(request.id)}
                                                                    className="bg-purple-700 text-white py-1 px-3 rounded text-sm hover:bg-purple-600"
                                                                >
                                                                    Allocate
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {/* Navigate to request details */}}
                                                                className="bg-gray-700 text-white py-1 px-3 rounded text-sm hover:bg-gray-600 ml-2"
                                                            >
                                                                Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                {currentItems.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400">No transfer history found.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                            <thead>
                                                <tr className="border-b border-gray-700">
                                                    <th className="py-3 px-4 text-left">Transfer #</th>
                                                    <th className="py-3 px-4 text-left">Material</th>
                                                    <th className="py-3 px-4 text-left">Destination</th>
                                                    <th className="py-3 px-4 text-left">Date</th>
                                                    <th className="py-3 px-4 text-left">Status</th>
                                                    <th className="py-3 px-4 text-left">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((transfer) => (
                                                    <tr key={transfer.id} className="border-b border-gray-700 hover:bg-gray-900">
                                                        <td className="py-3 px-4">{transfer.trackingNumber}</td>
                                                        <td className="py-3 px-4">{transfer.materialRequest?.items[0]?.material.name || 'N/A'}</td>
                                                        <td className="py-3 px-4">{transfer.destination.username}</td>
                                                        <td className="py-3 px-4">{new Date(transfer.createdAt).toLocaleDateString()}</td>
                                                        <td className="py-3 px-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                transfer.status === 'Scheduled' ? 'bg-yellow-900 text-yellow-300' :
                                                                transfer.status === 'In Transit' ? 'bg-blue-900 text-blue-300' :
                                                                transfer.status === 'Delivered' ? 'bg-green-900 text-green-300' :
                                                                'bg-gray-900 text-gray-300'
                                                            }`}>
                                                                {transfer.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                onClick={() => {/* Navigate to transfer details */}}
                                                                className="bg-gray-700 text-white py-1 px-3 rounded text-sm hover:bg-gray-600"
                                                            >
                                                                Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <Pagination
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    isSidebarOpen={isSidebarOpen}
                />
            </div>

            {/* Add New Material Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                >
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-96">
                        <h2 className="text-xl font-semibold mb-4 text-[#E0E1DD]">Add New Material</h2>
                        <div className="space-y-4">
                             {/* ✅ Supply Chain Selector */}
                             <div>
                                <label className="block text-gray-400 mb-1">Select Supply Chain</label>
                                <select
                                    value={selectedSupplyChain}
                                    onChange={(e) => setSelectedSupplyChain(e.target.value)}
                                    className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                >
                                    {supplyChains.map((chain) => (
                                        <option key={chain.id} value={chain.id}>
                                            {chain.name} (ID: {chain.id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="text"
                                placeholder="Material Name"
                                value={newMaterial.name}
                                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                            />
                            <textarea
                                placeholder="Description"
                                value={newMaterial.description}
                                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                                className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                rows="3"
                            />
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    value={newMaterial.quantity}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseInt(e.target.value) })}
                                    className="flex-1 p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                    min="1"
                                />
                                <select
                                    value={newMaterial.unit}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                                    className="flex-1 p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                >
                                    <option value="units">Units</option>
                                    <option value="kg">Kilograms</option>
                                    <option value="liters">Liters</option>
                                    <option value="meters">Meters</option>
                                    <option value="pieces">Pieces</option>
                                </select>
                            </div>
                            <textarea
                                placeholder="Specifications (optional)"
                                value={newMaterial.specifications}
                                onChange={(e) => setNewMaterial({ ...newMaterial, specifications: e.target.value })}
                                className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                rows="3"
                            />
                        </div>
                        <div className="flex justify-between mt-6">
                            <button onClick={() => setIsModalOpen(false)} className="bg-red-500 px-4 py-2 rounded text-white">
                                Cancel
                            </button>
                            <button onClick={handleCreateMaterial} className="bg-green-500 px-4 py-2 rounded text-white">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Material Request Review Modal */}
            <MaterialRequestReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                request={selectedRequest}
                onApprove={handleApproveRequest}
            />
        </div>
    );
};

export default SupplierDashboard;