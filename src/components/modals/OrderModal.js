import React, { useState } from 'react';
import { createOrder } from '../../services/customerApi';

const OrderModal = ({ closeModal, refreshData, products = [] }) => {
    const [orderData, setOrderData] = useState({
        customerId: localStorage.getItem('userId'),
        supplyChainId: localStorage.getItem('supplyChainId') || 1,
        items: [{ productId: '', quantity: 1 }],
        shippingAddress: '',
        requestedDeliveryDate: '',
        deliveryNotes: ''
    });
    const [processing, setProcessing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOrderData({
            ...orderData,
            [name]: value
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...orderData.items];
        newItems[index][field] = value;
        setOrderData({
            ...orderData,
            items: newItems
        });
    };

    const addItem = () => {
        setOrderData({
            ...orderData,
            items: [...orderData.items, { productId: '', quantity: 1 }]
        });
    };

    const removeItem = (index) => {
        if (orderData.items.length > 1) {
            const newItems = [...orderData.items];
            newItems.splice(index, 1);
            setOrderData({
                ...orderData,
                items: newItems
            });
        }
    };

    const calculateTotal = () => {
        let total = 0;
        orderData.items.forEach(item => {
            if (item.productId && item.quantity) {
                const product = products.find(p => p.id === parseInt(item.productId));
                if (product) {
                    total += parseFloat(product.price) * parseInt(item.quantity);
                }
            }
        });
        return total.toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate items
        const validItems = orderData.items.every(item => 
            item.productId && parseInt(item.quantity) > 0
        );
        
        if (!validItems) {
            alert('Please select a product and ensure quantities are greater than zero.');
            return;
        }
        
        if (!orderData.shippingAddress) {
            alert('Please provide a shipping address.');
            return;
        }
        
        setProcessing(true);
        try {
            // Format the order data
            const formattedData = {
                ...orderData,
                items: orderData.items.map(item => ({
                    productId: parseInt(item.productId),
                    quantity: parseInt(item.quantity)
                })),
                requestedDeliveryDate: orderData.requestedDeliveryDate ? 
                    new Date(orderData.requestedDeliveryDate).getTime() : null
            };
            
            await createOrder(formattedData);
            refreshData();
            closeModal();
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    // Format price with currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-[#E0E1DD] mb-4">Place New Order</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Shipping Address</label>
                        <textarea
                            name="shippingAddress"
                            value={orderData.shippingAddress}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            rows="3"
                            placeholder="Enter your full shipping address"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-400 mb-1">Products</label>
                        {orderData.items.map((item, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                                <select
                                    value={item.productId}
                                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                    required
                                    className="flex-grow p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                                >
                                    <option value="">Select a product</option>
                                    {Array.isArray(products) && products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} - {formatPrice(product.price)}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    required
                                    min="1"
                                    className="w-24 p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                                />
                                <button 
                                    type="button"
                                    onClick={() => removeItem(index)}
                                    className="p-2 bg-red-500 text-white rounded-md"
                                >
                                    -
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addItem}
                            className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md"
                        >
                            + Add More
                        </button>
                    </div>
                    
                    <div>
                        <label className="block text-gray-400 mb-1">Requested Delivery Date (Optional)</label>
                        <input
                            type="date"
                            name="requestedDeliveryDate"
                            value={orderData.requestedDeliveryDate}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Tomorrow
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-400 mb-1">Delivery Notes (Optional)</label>
                        <textarea
                            name="deliveryNotes"
                            value={orderData.deliveryNotes}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            rows="2"
                            placeholder="Any special delivery instructions"
                        />
                    </div>
                    
                    <div className="bg-[#0D1B2A] p-4 rounded-lg mt-4">
                        <div className="flex justify-between items-center font-semibold">
                            <span>Order Total:</span>
                            <span className="text-xl text-[#61dafb]">
                                {formatPrice(calculateTotal())}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between mt-6">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-500"
                        >
                            {processing ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderModal;