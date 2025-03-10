import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import LoadingOverlay from '../components/LoadingOverlay';
import { getOrderDetails, cancelOrder, confirmDelivery } from '../services/customerApi';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ show: false, action: null });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const orderData = await getOrderDetails(orderId);
                setOrder(orderData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to load order details. Please try again later.');
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const handleCancelOrder = async () => {
        setProcessing(true);
        try {
            await cancelOrder(orderId);
            // Update the order status locally
            setOrder(prevOrder => ({
                ...prevOrder,
                status: 'Cancelled'
            }));
            setConfirmModal({ show: false, action: null });
        } catch (err) {
            console.error('Error cancelling order:', err);
            setError('Failed to cancel order. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirmDelivery = async () => {
        setProcessing(true);
        try {
            await confirmDelivery(orderId);
            // Update the order status locally
            setOrder(prevOrder => ({
                ...prevOrder,
                status: 'Completed',
                actualDeliveryDate: new Date().toISOString()
            }));
            setConfirmModal({ show: false, action: null });
        } catch (err) {
            console.error('Error confirming delivery:', err);
            setError('Failed to confirm delivery. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    // Format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleString();
    };

    // Get status badge class
    const getStatusClass = (status) => {
        switch(status) {
            case 'Requested':
                return 'bg-yellow-900 text-yellow-300';
            case 'In Production':
                return 'bg-blue-800 text-blue-200';
            case 'Ready for Shipment':
                return 'bg-indigo-900 text-indigo-300';
            case 'In Transit':
                return 'bg-blue-700 text-blue-200';
            case 'Delivered':
                return 'bg-green-700 text-green-200';
            case 'Completed':
                return 'bg-green-800 text-green-200';
            case 'Cancelled':
                return 'bg-red-800 text-red-200';
            default:
                return 'bg-gray-700 text-gray-300';
        }
    };

    // Calculate totals
    const calculateSubtotal = () => {
        if (!order || !order.items) return 0;
        return order.items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0);
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
                                onClick={() => navigate('/dashboard')}
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

    if (!order) {
        return (
            <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-2">Order Not Found</h3>
                            <button 
                                onClick={() => navigate('/dashboard')}
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
                            <h1 className="text-2xl font-semibold">Order #{order.orderNumber}</h1>
                            <div className="flex items-center mt-1">
                                <p className="text-gray-400 mr-2">Status:</p>
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/dashboard?tab=orders')}
                            className="bg-[#415A77] text-white py-2 px-4 rounded"
                        >
                            Back to Orders
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Order Overview */}
                        <div className="lg:col-span-2 bg-[#1B263B] p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-400">Order Date</p>
                                        <p className="font-semibold">{formatDate(order.createdAt)}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">Shipping Address</p>
                                        <p className="whitespace-pre-wrap">{order.shippingAddress}</p>
                                    </div>
                                    
                                    {order.deliveryNotes && (
                                        <div>
                                            <p className="text-gray-400">Delivery Notes</p>
                                            <p className="whitespace-pre-wrap">{order.deliveryNotes}</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-400">Requested Delivery</p>
                                        <p>{order.requestedDeliveryDate ? formatDate(order.requestedDeliveryDate) : 'Not specified'}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-gray-400">Actual Delivery</p>
                                        <p>{order.actualDeliveryDate ? formatDate(order.actualDeliveryDate) : 'Not yet delivered'}</p>
                                    </div>
                                    
                                    {order.blockchainTxHash && (
                                        <div>
                                            <p className="text-gray-400">Blockchain Verification</p>
                                            <div className="flex items-center">
                                                <span className="text-green-500 mr-2">✓ Verified</span>
                                                <span className="font-mono text-xs truncate">{order.blockchainTxHash.substring(0, 10)}...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Order Actions */}
                        <div className="bg-[#1B263B] p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4">Order Actions</h2>
                            <div className="space-y-4">
                                {order.status === 'Requested' && (
                                    <button 
                                        onClick={() => setConfirmModal({ show: true, action: 'cancel' })}
                                        className="w-full bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center"
                                    >
                                        <span>Cancel Order</span>
                                    </button>
                                )}
                                
                                {order.status === 'Delivered' && (
                                    <button 
                                        onClick={() => setConfirmModal({ show: true, action: 'confirm' })}
                                        className="w-full bg-green-700 text-white py-2 px-4 rounded flex items-center justify-center"
                                    >
                                        <span>Confirm Receipt</span>
                                    </button>
                                )}
                                
                                {(order.status === 'Completed' || order.status === 'Cancelled') && (
                                    <button 
                                        onClick={() => setConfirmModal({ show: true, action: 'reorder' })}
                                        className="w-full bg-[#415A77] text-white py-2 px-4 rounded flex items-center justify-center"
                                    >
                                        <span>Place Similar Order</span>
                                    </button>
                                )}
                            </div>
                            
                            <div className="mt-6 bg-[#0D1B2A] p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Order Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Subtotal:</span>
                                        <span>{formatPrice(calculateSubtotal())}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Shipping:</span>
                                        <span>{formatPrice(0)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold border-t border-gray-700 pt-2 mt-2">
                                        <span>Total:</span>
                                        <span className="text-[#61dafb]">{formatPrice(calculateSubtotal())}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Items */}
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="py-3 px-4 text-left">Product</th>
                                        <th className="py-3 px-4 text-left">Price</th>
                                        <th className="py-3 px-4 text-left">Quantity</th>
                                        <th className="py-3 px-4 text-left">Total</th>
                                        <th className="py-3 px-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items && order.items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-900">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                                                    <p className="text-xs text-gray-400">{item.product?.sku || ''}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">{formatPrice(item.price / item.quantity)}</td>
                                            <td className="py-3 px-4">{item.quantity}</td>
                                            <td className="py-3 px-4">{formatPrice(item.price)}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(item.status || order.status)}`}>
                                                    {item.status || order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Order Timeline */}
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
                        
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute h-full w-0.5 bg-gray-700 left-2.5 top-0"></div>
                            
                            {/* Status points */}
                            <div className="space-y-6 relative">
                                <div className="flex items-start">
                                    <div className={`h-5 w-5 rounded-full mt-1 bg-green-500`}></div>
                                    <div className="ml-4">
                                        <p className="font-medium">Order Placed</p>
                                        <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className={`h-5 w-5 rounded-full mt-1 ${
                                        ['In Production', 'Ready for Shipment', 'In Transit', 'Delivered', 'Completed'].includes(order.status) 
                                            ? 'bg-green-500' 
                                            : order.status === 'Cancelled' 
                                                ? 'bg-red-500' 
                                                : 'bg-gray-700'
                                    }`}></div>
                                    <div className="ml-4">
                                        <p className="font-medium">In Production</p>
                                        <p className="text-sm text-gray-400">
                                            {order.status === 'Requested' 
                                                ? 'Pending' 
                                                : order.status === 'Cancelled' 
                                                    ? 'Cancelled' 
                                                    : 'Processing started'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className={`h-5 w-5 rounded-full mt-1 ${
                                        ['Ready for Shipment', 'In Transit', 'Delivered', 'Completed'].includes(order.status) 
                                            ? 'bg-green-500' 
                                            : 'bg-gray-700'
                                    }`}></div>
                                    <div className="ml-4">
                                        <p className="font-medium">Ready for Shipment</p>
                                        <p className="text-sm text-gray-400">
                                            {['Ready for Shipment', 'In Transit', 'Delivered', 'Completed'].includes(order.status) 
                                                ? 'Products ready for shipping' 
                                                : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className={`h-5 w-5 rounded-full mt-1 ${
                                        ['In Transit', 'Delivered', 'Completed'].includes(order.status) 
                                            ? 'bg-green-500' 
                                            : 'bg-gray-700'
                                    }`}></div>
                                    <div className="ml-4">
                                        <p className="font-medium">In Transit</p>
                                        <p className="text-sm text-gray-400">
                                            {['In Transit', 'Delivered', 'Completed'].includes(order.status) 
                                                ? 'Order is on the way' 
                                                : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className={`h-5 w-5 rounded-full mt-1 ${
                                        ['Delivered', 'Completed'].includes(order.status) 
                                            ? 'bg-green-500' 
                                            : 'bg-gray-700'
                                    }`}></div>
                                    <div className="ml-4">
                                        <p className="font-medium">Delivered</p>
                                        <p className="text-sm text-gray-400">
                                            {['Delivered', 'Completed'].includes(order.status) 
                                                ? 'Order delivered on ' + formatDate(order.actualDeliveryDate || new Date())
                                                : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <div className={`h-5 w-5 rounded-full mt-1 ${
                                        order.status === 'Completed'
                                            ? 'bg-green-500' 
                                            : 'bg-gray-700'
                                    }`}></div>
                                    <div className="ml-4">
                                        <p className="font-medium">Completed</p>
                                        <p className="text-sm text-gray-400">
                                            {order.status === 'Completed' 
                                                ? 'Order completed and confirmed'
                                                : 'Pending confirmation'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-md max-w-md w-full">
                        <h2 className="text-xl font-semibold mb-4">Confirm Action</h2>
                        
                        {confirmModal.action === 'cancel' && (
                            <p className="mb-6">
                                Are you sure you want to cancel this order? 
                                This action cannot be undone.
                            </p>
                        )}
                        
                        {confirmModal.action === 'confirm' && (
                            <p className="mb-6">
                                Confirm that you have received this order?
                                This will mark the order as completed.
                            </p>
                        )}
                        
                        {confirmModal.action === 'reorder' && (
                            <p className="mb-6">
                                Would you like to place a new order with the same items?
                            </p>
                        )}
                        
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setConfirmModal({ show: false, action: null })}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmModal.action === 'cancel') {
                                        handleCancelOrder();
                                    } else if (confirmModal.action === 'confirm') {
                                        handleConfirmDelivery();
                                    } else if (confirmModal.action === 'reorder') {
                                        // Logic for placing a similar order
                                        navigate('/dashboard?tab=products');
                                        setConfirmModal({ show: false, action: null });
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

export default OrderDetail;