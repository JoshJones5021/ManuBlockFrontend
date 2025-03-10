import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import Pagination from '../components/Pagination';
import LoadingOverlay from '../components/LoadingOverlay';
import OrderModal from '../components/modals/OrderModal';
import { getOrders, getAvailableProducts, cancelOrder, confirmDelivery } from '../services/customerApi';

const CustomerDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [processing, setProcessing] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ show: false, action: null, item: null });
    
    const navigate = useNavigate();
    const customerId = localStorage.getItem('userId');

    useEffect(() => {
        const userRole = localStorage.getItem('role');
        if (userRole !== 'CUSTOMER') {
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
            const productsData = await getAvailableProducts();
            const ordersData = await getOrders(customerId);
            
            setProducts(Array.isArray(productsData) ? productsData : []);
            setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async (orderId) => {
        setProcessing(true);
        try {
            await cancelOrder(orderId);
            await fetchData();
            setConfirmModal({ show: false, action: null, item: null });
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Failed to cancel order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirmDelivery = async (orderId) => {
        setProcessing(true);
        try {
            await confirmDelivery(orderId);
            await fetchData();
            setConfirmModal({ show: false, action: null, item: null });
        } catch (error) {
            console.error('Error confirming delivery:', error);
            alert('Failed to confirm delivery. Please try again.');
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
            default:
                return 0;
        }
    };

    // Status badge renderer
    const renderStatusBadge = (status) => {
        const statusClasses = {
            'Requested': 'bg-yellow-900 text-yellow-300',
            'In Production': 'bg-blue-800 text-blue-200',
            'Ready for Shipment': 'bg-indigo-900 text-indigo-300',
            'In Transit': 'bg-blue-700 text-blue-200',
            'Delivered': 'bg-green-700 text-green-200',
            'Completed': 'bg-green-800 text-green-200',
            'Cancelled': 'bg-red-800 text-red-200',
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-700 text-gray-300'}`}>
                {status}
            </span>
        );
    };

    // Format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-y-auto">
                <Navbar />

                <div className="flex-1 p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-[#1B263B] text-white text-center py-3 px-6 rounded-lg shadow-md w-full max-w-4xl">
                            <h1 className="text-2xl font-semibold">Customer Dashboard</h1>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Available Products</h3>
                            <p className="text-2xl font-semibold">{products.length}</p>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">My Orders</h3>
                            <p className="text-2xl font-semibold">{orders.length}</p>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Active Orders</h3>
                            <p className="text-2xl font-semibold">
                                {orders.filter(o => 
                                    o.status !== 'Completed' && o.status !== 'Cancelled'
                                ).length}
                            </p>
                        </div>
                        
                        <div className="bg-[#1B263B] p-4 rounded-lg shadow">
                            <h3 className="text-gray-400 mb-1">Pending Delivery</h3>
                            <p className="text-2xl font-semibold">
                                {orders.filter(o => o.status === 'In Transit').length}
                            </p>
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
                                Available Products
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-2 px-4 rounded-t-lg ${
                                    activeTab === 'orders' ? 'bg-[#415A77] font-semibold' : 'bg-[#1B263B]'
                                }`}
                            >
                                My Orders
                                {orders.filter(o => o.status === 'Delivered').length > 0 && (
                                    <span className="ml-2 bg-green-500 text-white rounded-full px-2 py-0.5 text-xs">
                                        {orders.filter(o => o.status === 'Delivered').length}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            {activeTab === 'products' && (
                                <button
                                    onClick={() => setIsOrderModalOpen(true)}
                                    className="bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300"
                                >
                                    + Place New Order
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {getCurrentItems().length === 0 ? (
                                            <div className="col-span-full text-center py-10">
                                                <p className="text-gray-400">No products available at this time.</p>
                                            </div>
                                        ) : (
                                            getCurrentItems().map(product => (
                                                <div key={product.id} className="bg-[#0D1B2A] rounded-lg overflow-hidden shadow-lg border border-[#415A77]">
                                                    <div className="h-40 bg-[#415A77] flex items-center justify-center">
                                                        <span className="text-5xl text-[#E0E1DD] opacity-50">
                                                            {product.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div className="p-4">
                                                        <h3 className="text-lg font-semibold">{product.name}</h3>
                                                        <p className="text-gray-400 text-sm line-clamp-2 h-10">{product.description}</p>
                                                        <div className="mt-3 flex justify-between items-center">
                                                            <span className="text-xl font-bold text-[#61dafb]">
                                                                {formatPrice(product.price)}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setIsOrderModalOpen(true);
                                                                    // You could pre-select this product in the order modal
                                                                }}
                                                                className="px-3 py-1 bg-[#415A77] rounded-md hover:bg-[#778DA9] transition-colors"
                                                            >
                                                                Order
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {activeTab === 'orders' && (
                                    <div className="overflow-x-auto">
                                        {getCurrentItems().length === 0 ? (
                                            <div className="text-center py-10">
                                                <p className="text-gray-400">No orders found. Place your first order!</p>
                                            </div>
                                        ) : (
                                            <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                                <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="py-3 px-4 text-left">Order #</th>
                                                        <th className="py-3 px-4 text-left">Date</th>
                                                        <th className="py-3 px-4 text-left">Items</th>
                                                        <th className="py-3 px-4 text-left">Status</th>
                                                        <th className="py-3 px-4 text-left">Delivery Date</th>
                                                        <th className="py-3 px-4 text-left">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getCurrentItems().map((order) => (
                                                        <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-900">
                                                            <td className="py-3 px-4">{order.orderNumber}</td>
                                                            <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                            <td className="py-3 px-4">
                                                                {order.items?.length || 0} item(s)
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {renderStatusBadge(order.status)}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                {order.actualDeliveryDate ? 
                                                                    new Date(order.actualDeliveryDate).toLocaleDateString() : 
                                                                    order.requestedDeliveryDate ?
                                                                    new Date(order.requestedDeliveryDate).toLocaleDateString() + ' (Est.)' :
                                                                    'Not scheduled'}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                                                                    {order.status === 'Requested' && (
                                                                        <button
                                                                            onClick={() => setConfirmModal({
                                                                                show: true,
                                                                                action: 'cancelOrder',
                                                                                item: order
                                                                            })}
                                                                            className="text-xs bg-red-700 text-white py-1 px-2 rounded hover:bg-red-600"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    )}
                                                                    {order.status === 'Delivered' && (
                                                                        <button
                                                                            onClick={() => setConfirmModal({
                                                                                show: true,
                                                                                action: 'confirmDelivery',
                                                                                item: order
                                                                            })}
                                                                            className="text-xs bg-green-700 text-white py-1 px-2 rounded hover:bg-green-600"
                                                                        >
                                                                            Confirm Receipt
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => navigate(`/order/${order.id}`)}
                                                                        className="text-xs bg-gray-700 text-white py-1 px-2 rounded hover:bg-gray-600"
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
            {isOrderModalOpen && (
                <OrderModal 
                    closeModal={() => setIsOrderModalOpen(false)} 
                    refreshData={fetchData} 
                    products={products}
                />
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-md max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
                        
                        {confirmModal.action === 'cancelOrder' && (
                            <p className="mb-6">
                                Are you sure you want to cancel order {confirmModal.item.orderNumber}?
                                This action cannot be undone.
                            </p>
                        )}
                        
                        {confirmModal.action === 'confirmDelivery' && (
                            <p className="mb-6">
                                Are you sure you want to confirm receipt of order {confirmModal.item.orderNumber}?
                                This will mark the order as completed.
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
                                    if (confirmModal.action === 'cancelOrder') {
                                        handleCancelOrder(confirmModal.item.id);
                                    } else if (confirmModal.action === 'confirmDelivery') {
                                        handleConfirmDelivery(confirmModal.item.id);
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

export default CustomerDashboard;