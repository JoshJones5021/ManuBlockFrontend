import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import Pagination from '../components/Pagination';
import LoadingOverlay from '../components/LoadingOverlay';
import ProductModal from '../components/modals/ProductModal';
import MaterialRequestModal from '../components/modals/MaterialRequestModal';
import ProductBatchModal from '../components/modals/ProductBatchModal';
import { 
    getOrders, 
    getMaterialRequests, 
    getBatches, 
    getProducts, 
    completeBatch, 
    rejectBatch, 
    deactivateProduct 
} from '../services/manufacturerApi';

const ManufacturerDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [materialRequests, setMaterialRequests] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [processing, setProcessing] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ show: false, action: null, item: null });
    
    const navigate = useNavigate();
    const manufacturerId = localStorage.getItem('userId');

    useEffect(() => {
        const userRole = localStorage.getItem('role');
        if (userRole !== 'MANUFACTURER') {
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
        
        fetchData();
    }, [window.location.search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const productsData = await getProducts(manufacturerId);
            const ordersData = await getOrders(manufacturerId);
            const materialRequestsData = await getMaterialRequests(manufacturerId);
            const batchesData = await getBatches(manufacturerId);
            
            setProducts(productsData || []);
            setOrders(ordersData || []);
            setMaterialRequests(materialRequestsData || []);
            setBatches(batchesData || []);
        } catch (error) {
            console.error('Error fetching manufacturer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteBatch = async (batchId) => {
        setProcessing(true);
        try {
            await completeBatch(batchId);
            await fetchData();
            setConfirmModal({ show: false, action: null, item: null });
        } catch (error) {
            console.error('Error completing batch:', error);
            alert('Failed to complete batch. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleRejectBatch = async (batchId) => {
        setProcessing(true);
        try {
            await rejectBatch(batchId);
            await fetchData();
            setConfirmModal({ show: false, action: null, item: null });
        } catch (error) {
            console.error('Error rejecting batch:', error);
            alert('Failed to reject batch. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeactivateProduct = async (productId) => {
        setProcessing(true);
        try {
            await deactivateProduct(productId);
            await fetchData();
            setConfirmModal({ show: false, action: null, item: null });
        } catch (error) {
            console.error('Error deactivating product:', error);
            alert('Failed to deactivate product. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    
    // Get current items based on active tab
    const getCurrentItems = () => {
        switch(activeTab) {
            case 'products':
                return products.slice(indexOfFirstItem, indexOfLastItem);
            case 'orders':
                return orders.slice(indexOfFirstItem, indexOfLastItem);
            case 'materials':
                return materialRequests.slice(indexOfFirstItem, indexOfLastItem);
            case 'production':
                return batches.slice(indexOfFirstItem, indexOfLastItem);
            default:
                return [];
        }
    };

    const getTotalItems = () => {
        switch(activeTab) {
            case 'products':
                return products.length;
            case 'orders':
                return orders.length;
            case 'materials':
                return materialRequests.length;
            case 'production':
                return batches.length;
            default:
                return 0;
        }
    };

    // Status badge renderer
    const renderStatusBadge = (status) => {
        const statusClasses = {
            'active': 'bg-green-900 text-green-300',
            'inactive': 'bg-red-900 text-red-300',
            'Requested': 'bg-yellow-900 text-yellow-300',
            'Approved': 'bg-blue-900 text-blue-300',
            'Allocated': 'bg-purple-900 text-purple-300',
            'In Transit': 'bg-blue-700 text-blue-200',
            'Delivered': 'bg-green-700 text-green-200',
            'Planned': 'bg-yellow-800 text-yellow-200',
            'In Production': 'bg-blue-800 text-blue-200',
            'Completed': 'bg-green-800 text-green-200',
            'Rejected': 'bg-red-800 text-red-200',
            'In QC': 'bg-purple-800 text-purple-200',
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-700 text-gray-300'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-y-auto">
                <Navbar />

                <div className="flex-1 p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-[#1B263B] text-white text-center py-3 px-6 rounded-lg shadow-md w-full max-w-4xl">
                            <h1 className="text-2xl font-semibold">Manufacturer Dashboard</h1>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Products</h3>
                            <p className="text-2xl font-semibold">{products.length}</p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span>Active: {products.filter(p => p.active).length}</span>
                                <span>Inactive: {products.filter(p => !p.active).length}</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Material Requests</h3>
                            <p className="text-2xl font-semibold">{materialRequests.length}</p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span>Pending: {materialRequests.filter(r => r.status === 'Requested').length}</span>
                                <span>In Transit: {materialRequests.filter(r => r.status === 'In Transit').length}</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Production Batches</h3>
                            <p className="text-2xl font-semibold">{batches.length}</p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span>In Progress: {batches.filter(b => b.status === 'In Production').length}</span>
                                <span>Completed: {batches.filter(b => b.status === 'Completed').length}</span>
                            </div>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Orders</h3>
                            <p className="text-2xl font-semibold">{orders.length}</p>
                            <div className="flex justify-between mt-2 text-sm">
                                <span>New: {orders.filter(o => o.status === 'Requested').length}</span>
                                <span>In Production: {orders.filter(o => o.status === 'In Production').length}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`py-2 px-4 rounded-t-lg ${
                                    activeTab === 'products' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Products
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-2 px-4 rounded-t-lg ${
                                    activeTab === 'orders' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Orders
                                {orders.filter(o => o.status === 'Requested').length > 0 && (
                                    <span className="ml-2 bg-yellow-500 text-white rounded-full px-2 py-0.5 text-xs">
                                        {orders.filter(o => o.status === 'Requested').length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`py-2 px-4 rounded-t-lg ${
                                    activeTab === 'materials' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Material Requests
                            </button>
                            <button
                                onClick={() => setActiveTab('production')}
                                className={`py-2 px-4 rounded-t-lg ${
                                    activeTab === 'production' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                Production Batches
                                {batches.filter(b => b.status === 'In Production').length > 0 && (
                                    <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                                        {batches.filter(b => b.status === 'In Production').length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            {activeTab === 'products' && (
                                <button
                                    onClick={() => setIsProductModalOpen(true)}
                                    className="bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300"
                                >
                                    + Add New Product
                                </button>
                            )}
                            {activeTab === 'materials' && (
                                <button
                                    onClick={() => setIsMaterialModalOpen(true)}
                                    className="bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300"
                                >
                                    + Request Materials
                                </button>
                            )}
                            {activeTab === 'production' && (
                                <button
                                    onClick={() => setIsBatchModalOpen(true)}
                                    className="bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300"
                                >
                                    + Create Production Batch
                                </button>
                            )}
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
                            <>
                                {activeTab === 'products' && (
                                    <div className="overflow-x-auto">
                                        {getCurrentItems().length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400">No products found. Create your first product!</p>
                                            </div>
                                        ) : (
                                            <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                                <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="py-3 px-4 text-left">Product Name</th>
                                                        <th className="py-3 px-4 text-left">SKU</th>
                                                        <th className="py-3 px-4 text-left">Price</th>
                                                        <th className="py-3 px-4 text-left">Available Qty</th>
                                                        <th className="py-3 px-4 text-left">Status</th>
                                                        <th className="py-3 px-4 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentItems().map((product) => (
                                                        <tr key={product.id} className="border-b border-gray-700 hover:bg-gray-900">
                                                            <td className="py-3 px-4">{product.name}</td>
                                                            <td className="py-3 px-4">{product.sku || 'N/A'}</td>
                                                            <td className="py-3 px-4">${parseFloat(product.price).toFixed(2)}</td>
                                                            <td className="py-3 px-4">{product.availableQuantity || 0}</td>
                                                            <td className="py-3 px-4">
                                                                {renderStatusBadge(product.active ? 'active' : 'inactive')}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex space-x-2">
                                                                    {product.active && (
                                                                        <button
                                                                            onClick={() => setConfirmModal({
                                                                                show: true,
                                                                                action: 'deactivateProduct',
                                                                                item: product
                                                                            })}
                                                                            className="bg-red-700 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                                                                        >
                                                                            Deactivate
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => navigate(`/product/${product.id}`)}
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

                                {activeTab === 'orders' && (
                                    <div className="overflow-x-auto">
                                        {getCurrentItems().length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400">No orders found.</p>
                                            </div>
                                        ) : (
                                            <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                                <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="py-3 px-4 text-left">Order #</th>
                                                        <th className="py-3 px-4 text-left">Customer</th>
                                                        <th className="py-3 px-4 text-left">Created Date</th>
                                                        <th className="py-3 px-4 text-left">Requested Delivery</th>
                                                        <th className="py-3 px-4 text-left">Status</th>
                                                        <th className="py-3 px-4 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentItems().map((order) => (
                                                        <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-900">
                                                            <td className="py-3 px-4">{order.orderNumber}</td>
                                                            <td className="py-3 px-4">{order.customer?.username || 'Unknown'}</td>
                                                            <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                            <td className="py-3 px-4">
                                                                {order.requestedDeliveryDate ? 
                                                                    new Date(order.requestedDeliveryDate).toLocaleDateString() : 
                                                                    'Not specified'}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {renderStatusBadge(order.status)}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <button
                                                                    onClick={() => navigate(`/order/${order.id}`)}
                                                                    className="bg-gray-700 text-white py-1 px-3 rounded text-sm hover:bg-gray-600"
                                                                >
                                                                    Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'materials' && (
                                    <div className="overflow-x-auto">
                                        {getCurrentItems().length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400">No material requests found. Create your first request!</p>
                                            </div>
                                        ) : (
                                            <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                                <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="py-3 px-4 text-left">Request #</th>
                                                        <th className="py-3 px-4 text-left">Supplier</th>
                                                        <th className="py-3 px-4 text-left">Items</th>
                                                        <th className="py-3 px-4 text-left">Requested Delivery</th>
                                                        <th className="py-3 px-4 text-left">Status</th>
                                                        <th className="py-3 px-4 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentItems().map((request) => (
                                                        <tr key={request.id} className="border-b border-gray-700 hover:bg-gray-900">
                                                            <td className="py-3 px-4">{request.requestNumber}</td>
                                                            <td className="py-3 px-4">{request.supplier?.username || 'Unknown'}</td>
                                                            <td className="py-3 px-4">
                                                                {request.items?.length || 0} item(s)
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {request.requestedDeliveryDate ? 
                                                                    new Date(request.requestedDeliveryDate).toLocaleDateString() : 
                                                                    'Not specified'}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {renderStatusBadge(request.status)}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <button
                                                                    onClick={() => navigate(`/material-request/${request.id}`)}
                                                                    className="bg-gray-700 text-white py-1 px-3 rounded text-sm hover:bg-gray-600"
                                                                >
                                                                    Details
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'production' && (
                                    <div className="overflow-x-auto">
                                        {getCurrentItems().length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400">No production batches found. Create your first batch!</p>
                                            </div>
                                        ) : (
                                            <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                                <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="py-3 px-4 text-left">Batch #</th>
                                                        <th className="py-3 px-4 text-left">Product</th>
                                                        <th className="py-3 px-4 text-left">Quantity</th>
                                                        <th className="py-3 px-4 text-left">Start Date</th>
                                                        <th className="py-3 px-4 text-left">Status</th>
                                                        <th className="py-3 px-4 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentItems().map((batch) => (
                                                        <tr key={batch.id} className="border-b border-gray-700 hover:bg-gray-900">
                                                            <td className="py-3 px-4">{batch.batchNumber}</td>
                                                            <td className="py-3 px-4">{batch.product?.name || 'Unknown'}</td>
                                                            <td className="py-3 px-4">{batch.quantity}</td>
                                                            <td className="py-3 px-4">
                                                                {batch.startDate ? 
                                                                    new Date(batch.startDate).toLocaleDateString() : 
                                                                    'Not started'}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {renderStatusBadge(batch.status)}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex space-x-2">
                                                                    {batch.status === 'In Production' && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => setConfirmModal({
                                                                                    show: true,
                                                                                    action: 'completeBatch',
                                                                                    item: batch
                                                                                })}
                                                                                className="bg-green-700 text-white py-1 px-3 rounded text-sm hover:bg-green-600"
                                                                            >
                                                                                Complete
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setConfirmModal({
                                                                                    show: true,
                                                                                    action: 'rejectBatch',
                                                                                    item: batch
                                                                                })}
                                                                                className="bg-red-700 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
                                                                            >
                                                                                Reject
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    <button
                                                                        onClick={() => navigate(`/batch/${batch.id}`)}
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
                            </>
                        )}
                    </div>
                </div>

                <Pagination
                    totalItems={getTotalItems()}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    isSidebarOpen={isSidebarOpen}
                />
            </div>
            
            {/* Modals */}
            {isProductModalOpen && (
                <ProductModal 
                    closeModal={() => setIsProductModalOpen(false)} 
                    refreshData={fetchData} 
                />
            )}
            
            {isMaterialModalOpen && (
                <MaterialRequestModal 
                    closeModal={() => setIsMaterialModalOpen(false)} 
                    refreshData={fetchData} 
                />
            )}
            
            {isBatchModalOpen && (
                <ProductBatchModal 
                    closeModal={() => setIsBatchModalOpen(false)} 
                    refreshData={fetchData} 
                />
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-md max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
                        
                        {confirmModal.action === 'completeBatch' && (
                            <p className="mb-6">
                                Are you sure you want to mark batch {confirmModal.item.batchNumber} as complete?
                                This will update the product inventory and cannot be undone.
                            </p>
                        )}
                        
                        {confirmModal.action === 'rejectBatch' && (
                            <p className="mb-6">
                                Are you sure you want to reject batch {confirmModal.item.batchNumber}?
                                This will mark the batch as failed and cannot be undone.
                            </p>
                        )}
                        
                        {confirmModal.action === 'deactivateProduct' && (
                            <p className="mb-6">
                                Are you sure you want to deactivate product "{confirmModal.item.name}"?
                                This will prevent new orders for this product.
                            </p>
                        )}
                        
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setConfirmModal({ show: false, action: null, item: null })}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmModal.action === 'completeBatch') {
                                        handleCompleteBatch(confirmModal.item.id);
                                    } else if (confirmModal.action === 'rejectBatch') {
                                        handleRejectBatch(confirmModal.item.id);
                                    } else if (confirmModal.action === 'deactivateProduct') {
                                        handleDeactivateProduct(confirmModal.item.id);
                                    }
                                }}
                                className="bg-[#415A77] text-white px-4 py-2 rounded hover:bg-[#778DA9]"
                                disabled={processing}
                            >
                                {processing ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {processing && <LoadingOverlay message="Processing action..." />}
        </div>
    );
};

export default ManufacturerDashboard;