import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import Pagination from '../components/Pagination';
import LoadingOverlay from '../components/LoadingOverlay';
import { 
    getTransportsForDistributor,
    getTransportsForSource,
    getTransportDetail,
    updateTransportStatus,
    getReadyMaterialRequests,
    getManufacturers,
    scheduleTransport,
    recordPickup,
    recordDelivery
} from '../services/distributorApi';

const DistributorDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('incoming');
    const [incomingTransfers, setIncomingTransfers] = useState([]);
    const [outgoingTransfers, setOutgoingTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [selectedTransfer, setSelectedTransfer] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [statusAction, setStatusAction] = useState(null);
    const [scheduleFormData, setScheduleFormData] = useState({
        materialRequestId: '',
        destinationId: '',
        scheduledPickupDate: '',
        scheduledDeliveryDate: '',
        notes: ''
    });
    const [availableRequests, setAvailableRequests] = useState([]);
    const [availableDestinations, setAvailableDestinations] = useState([]);
    
    const navigate = useNavigate();
    const distributorId = localStorage.getItem('userId');

    useEffect(() => {
        const userRole = localStorage.getItem('role');
        if (userRole !== 'DISTRIBUTOR') {
            alert('Unauthorized access. Redirecting to dashboard.');
            navigate('/dashboard');
            return;
        }
    
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        
        // Set active tab if specified
        if (tabParam) {
            setActiveTab(tabParam);
        }
        
        fetchDistributorData();
    }, [window.location.search]);

    useEffect(() => {
        if (isScheduleModalOpen) {
            fetchSchedulingOptions();
        }
    }, [isScheduleModalOpen]);

    const handleScheduleTransfer = async () => {
        setProcessing(true);
        try {
            // Format the data for API
            const transferData = {
                materialRequestId: parseInt(scheduleFormData.materialRequestId),
                distributorId: parseInt(distributorId),
                destinationId: parseInt(scheduleFormData.destinationId),
                scheduledPickupDate: new Date(scheduleFormData.scheduledPickupDate).getTime(),
                scheduledDeliveryDate: new Date(scheduleFormData.scheduledDeliveryDate).getTime(),
                notes: scheduleFormData.notes
            };
            
            // Use the API service function
            await scheduleTransport(transferData);
            
            alert('Transfer scheduled successfully');
            setIsScheduleModalOpen(false);
            fetchDistributorData(); // Refresh data
            
            // Reset form data
            setScheduleFormData({
                materialRequestId: '',
                destinationId: '',
                scheduledPickupDate: '',
                scheduledDeliveryDate: '',
                notes: ''
            });
        } catch (error) {
            console.error('Error scheduling transfer:', error);
            alert(`Failed to schedule transfer: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };
    
    // Fetch available material requests and destinations for scheduling
    const fetchSchedulingOptions = async () => {
        try {
            // Use our API services to fetch the data
            const requests = await getReadyMaterialRequests().catch(() => []);
            const destinations = await getManufacturers().catch(() => []);
            
            setAvailableRequests(Array.isArray(requests) ? requests : []);
            setAvailableDestinations(Array.isArray(destinations) ? destinations : []);
        } catch (error) {
            console.error('Error fetching scheduling options:', error);
            setAvailableRequests([]);
            setAvailableDestinations([]);
        }
    };

    const fetchDistributorData = async () => {
        setLoading(true);
        try {
            // Use the existing endpoint to fetch all transfers
            const allTransfers = await getTransportsForDistributor(distributorId);
            
            // Filter the transfers into incoming and outgoing
            const incomingData = allTransfers.filter(transfer => 
                transfer.destination && transfer.destination.id === parseInt(distributorId)
            );
            
            const outgoingData = allTransfers.filter(transfer => 
                transfer.source && transfer.source.id === parseInt(distributorId)
            );
            
            setIncomingTransfers(incomingData);
            setOutgoingTransfers(outgoingData);
        } catch (error) {
            console.error('Error fetching distributor data:', error);
            // Set empty arrays on error
            setIncomingTransfers([]);
            setOutgoingTransfers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (transferId) => {
        navigate(`/transfer/${transferId}`);
    };

    const handleActionClick = (transfer, action) => {
        setSelectedTransfer(transfer);
        setStatusAction(action);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (!selectedTransfer || !statusAction) return;
        
        setProcessing(true);
        try {
            if (statusAction === 'enRoute') {
                await recordPickup(selectedTransfer.id);
            } else if (statusAction === 'received') {
                await recordDelivery(selectedTransfer.id);
            } else {
                throw new Error('Invalid action');
            }
            
            await fetchDistributorData();
            setIsConfirmModalOpen(false);
        } catch (error) {
            console.error('Error updating transfer status:', error);
            alert('Failed to update transfer status. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // Get current items based on active tab
    const currentItems = activeTab === 'incoming' 
        ? incomingTransfers.slice(indexOfFirstItem, indexOfLastItem)
        : outgoingTransfers.slice(indexOfFirstItem, indexOfLastItem);

    const totalItems = activeTab === 'incoming' 
        ? incomingTransfers.length 
        : outgoingTransfers.length;

    // Status badge renderer
    const renderStatusBadge = (status) => {
        const statusClasses = {
            'Scheduled': 'bg-yellow-900 text-yellow-300',
            'In Transit': 'bg-blue-900 text-blue-300',
            'Delivered': 'bg-green-900 text-green-300',
            'Cancelled': 'bg-red-900 text-red-300'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-900 text-gray-300'}`}>
                {status}
            </span>
        );
    };

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-y-auto">
                <Navbar />

                <div className="flex-1 p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-[#1B263B] text-white text-center py-3 px-6 rounded-lg shadow-md w-full max-w-4xl">
                            <h1 className="text-2xl font-semibold">Distributor Dashboard</h1>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Incoming Transfers</h3>
                            <p className="text-2xl font-semibold">{incomingTransfers.length}</p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span>Scheduled: {incomingTransfers.filter(t => t.status === 'Scheduled').length}</span>
                                <span>In Transit: {incomingTransfers.filter(t => t.status === 'In Transit').length}</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Outgoing Transfers</h3>
                            <p className="text-2xl font-semibold">{outgoingTransfers.length}</p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span>Scheduled: {outgoingTransfers.filter(t => t.status === 'Scheduled').length}</span>
                                <span>In Transit: {outgoingTransfers.filter(t => t.status === 'In Transit').length}</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Completed Transfers</h3>
                            <p className="text-2xl font-semibold">
                                {incomingTransfers.filter(t => t.status === 'Delivered').length + 
                                 outgoingTransfers.filter(t => t.status === 'Delivered').length}
                            </p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span>Received: {incomingTransfers.filter(t => t.status === 'Delivered').length}</span>
                                <span>Sent: {outgoingTransfers.filter(t => t.status === 'Delivered').length}</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Pending Actions</h3>
                            <p className="text-2xl font-semibold">
                                {incomingTransfers.filter(t => t.status === 'In Transit').length + 
                                 outgoingTransfers.filter(t => t.status === 'Scheduled').length}
                            </p>
                            <div className="w-full bg-gray-700 h-2 rounded-full mt-2">
                                <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{
                                        width: `${Math.min(100, 
                                        ((incomingTransfers.filter(t => t.status === 'In Transit').length + 
                                          outgoingTransfers.filter(t => t.status === 'Scheduled').length) / 
                                          Math.max(1, incomingTransfers.length + outgoingTransfers.length)) * 100
                                        )}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('incoming')}
                                className={`py-2 px-4 rounded-t-lg ${
                                    activeTab === 'incoming' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Incoming Transfers
                                {incomingTransfers.filter(t => t.status === 'In Transit').length > 0 && (
                                    <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                                        {incomingTransfers.filter(t => t.status === 'In Transit').length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('outgoing')}
                                className={`py-2 px-4 rounded-t-lg relative ${
                                    activeTab === 'outgoing' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Outgoing Transfers
                                {outgoingTransfers.filter(t => t.status === 'Scheduled').length > 0 && (
                                    <span className="ml-2 bg-yellow-500 text-white rounded-full px-2 py-0.5 text-xs">
                                        {outgoingTransfers.filter(t => t.status === 'Scheduled').length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsScheduleModalOpen(true)}
                                className="bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300 mr-4"
                            >
                                + Schedule New Transfer
                            </button>
                        
                            <div className="flex items-center">
                                <span className="mr-2 text-[#E0E1DD]">Show</span>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(parseInt(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="p-2 border border-[#415A77] rounded-lg bg-[#1B263B] text-[#E0E1DD] focus:outline-none"
                                >
                                    <option value="4">4</option>
                                    <option value="8">8</option>
                                    <option value="12">12</option>
                                    <option value="16">16</option>
                                </select>
                                <span className="ml-2 text-[#E0E1DD]">entries</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="bg-[#1B263B] rounded-lg p-6 min-h-[400px]">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E0E1DD]"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {currentItems.length === 0 ? (
                                    <div className="text-center py-10">
                                        <p className="text-gray-400">
                                            No {activeTab === 'incoming' ? 'incoming' : 'outgoing'} transfers found.
                                        </p>
                                    </div>
                                ) : (
                                    <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                        <thead>
                                            <tr className="border-b border-gray-700">
                                                <th className="py-3 px-4 text-left">Transfer #</th>
                                                <th className="py-3 px-4 text-left">
                                                    {activeTab === 'incoming' ? 'From' : 'To'}
                                                </th>
                                                <th className="py-3 px-4 text-left">Material/Product</th>
                                                <th className="py-3 px-4 text-left">
                                                    {activeTab === 'incoming' ? 'Scheduled Delivery' : 'Scheduled Pickup'}
                                                </th>
                                                <th className="py-3 px-4 text-left">Status</th>
                                                <th className="py-3 px-4 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentItems.map((transfer) => (
                                                <tr key={transfer.id} className="border-b border-gray-700 hover:bg-gray-900">
                                                    <td className="py-3 px-4">{transfer.trackingNumber}</td>
                                                    <td className="py-3 px-4">
                                                        {activeTab === 'incoming' 
                                                            ? transfer.source?.username || 'Unknown' 
                                                            : transfer.destination?.username || 'Unknown'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {transfer.materialRequest
                                                            ? transfer.materialRequest.items?.[0]?.material?.name || 'Unknown Material'
                                                            : transfer.order
                                                                ? transfer.order.items?.[0]?.product?.name || 'Unknown Product'
                                                                : 'Not specified'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {activeTab === 'incoming' 
                                                            ? formatDate(transfer.scheduledDeliveryDate)
                                                            : formatDate(transfer.scheduledPickupDate)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {renderStatusBadge(transfer.status)}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex space-x-2">
                                                            {/* Action buttons based on status and tab */}
                                                            {activeTab === 'outgoing' && transfer.status === 'Scheduled' && (
                                                                <button
                                                                    onClick={() => handleActionClick(transfer, 'enRoute')}
                                                                    className="bg-blue-700 text-white py-1 px-3 rounded text-sm hover:bg-blue-600"
                                                                >
                                                                    Mark En Route
                                                                </button>
                                                            )}
        
                                                            {activeTab === 'incoming' && transfer.status === 'In Transit' && (
                                                                <button
                                                                    onClick={() => handleActionClick(transfer, 'received')}
                                                                    className="bg-green-700 text-white py-1 px-3 rounded text-sm hover:bg-green-600"
                                                                >
                                                                    Mark Received
                                                                </button>
                                                            )}
                                                            
                                                            <button
                                                                onClick={() => handleViewDetails(transfer.id)}
                                                                className="bg-gray-700 text-white py-1 px-3 rounded text-sm hover:bg-gray-600"
                                                            >
                                                                Details
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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

            {/* Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-md max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
                        <p className="mb-6">
                            {statusAction === 'enRoute' 
                                ? 'Are you sure you want to mark this transfer as en route? This will update the status to "In Transit".'
                                : 'Are you sure you want to mark this transfer as received? This will complete the transfer process.'}
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className="bg-[#415A77] text-white px-4 py-2 rounded hover:bg-[#778DA9]"
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Transfer Modal */}
            {isScheduleModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-md max-w-lg w-full">
                        <h2 className="text-xl font-semibold mb-4">Schedule New Transfer</h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleScheduleTransfer();
                        }} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 mb-1">Material Request</label>
                                <select
                                    value={scheduleFormData.materialRequestId}
                                    onChange={(e) => setScheduleFormData({
                                        ...scheduleFormData,
                                        materialRequestId: e.target.value
                                    })}
                                    className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                    required
                                    onClick={() => {
                                        if (!availableRequests || availableRequests.length === 0) {
                                            fetchSchedulingOptions();
                                        }
                                    }}
                                >
                                    <option value="">Select Material Request</option>
                                    {Array.isArray(availableRequests) && availableRequests.map(request => (
                                        <option key={request.id} value={request.id}>
                                            #{request.requestNumber} - {request.items && request.items[0]?.material?.name || 'Unknown Material'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-gray-400 mb-1">Destination</label>
                                <select
                                    value={scheduleFormData.destinationId}
                                    onChange={(e) => setScheduleFormData({
                                        ...scheduleFormData,
                                        destinationId: e.target.value
                                    })}
                                    className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                    required
                                    onClick={() => {
                                        if (!availableDestinations || availableDestinations.length === 0) {
                                            fetchSchedulingOptions();
                                        }
                                    }}
                                >
                                    <option value="">Select Destination</option>
                                    {Array.isArray(availableDestinations) && availableDestinations.map(destination => (
                                        <option key={destination.id} value={destination.id}>
                                            {destination.username} - {destination.role}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 mb-1">Scheduled Pickup</label>
                                    <input
                                        type="date"
                                        value={scheduleFormData.scheduledPickupDate}
                                        onChange={(e) => setScheduleFormData({
                                            ...scheduleFormData,
                                            scheduledPickupDate: e.target.value
                                        })}
                                        className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 mb-1">Scheduled Delivery</label>
                                    <input
                                        type="date"
                                        value={scheduleFormData.scheduledDeliveryDate}
                                        onChange={(e) => setScheduleFormData({
                                            ...scheduleFormData,
                                            scheduledDeliveryDate: e.target.value
                                        })}
                                        className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                        required
                                        min={scheduleFormData.scheduledPickupDate || new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-400 mb-1">Notes</label>
                                <textarea
                                    value={scheduleFormData.notes}
                                    onChange={(e) => setScheduleFormData({
                                        ...scheduleFormData,
                                        notes: e.target.value
                                    })}
                                    className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                    rows="3"
                                    placeholder="Optional notes about this transfer"
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsScheduleModalOpen(false)}
                                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#415A77] text-white px-4 py-2 rounded hover:bg-[#778DA9]"
                                    disabled={processing}
                                >
                                    {processing ? 'Processing...' : 'Schedule Transfer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {processing && <LoadingOverlay message="Updating transfer status..." />}
        </div>
    );
};

export default DistributorDashboard;