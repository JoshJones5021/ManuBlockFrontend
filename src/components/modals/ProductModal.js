import React, { useState } from 'react';
import { createProduct } from '../../services/manufacturerApi';

const ProductModal = ({ closeModal, refreshData }) => {
    const [productData, setProductData] = useState({
        name: '',
        description: '',
        specifications: '',
        sku: '',
        price: '',
        manufacturerId: localStorage.getItem('userId'),
        supplyChainId: localStorage.getItem('supplyChainId') || 1, // Default if none is set
        requiredMaterialIds: []
    });
    const [processing, setProcessing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProductData({
            ...productData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            // Convert price to number
            const formattedData = {
                ...productData,
                price: parseFloat(productData.price)
            };
            
            await createProduct(formattedData);
            refreshData();
            closeModal();
        } catch (error) {
            console.error('Error creating product:', error);
            alert('Failed to create product: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-96 max-w-full">
                <h2 className="text-xl font-semibold text-[#E0E1DD] mb-4">Create New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={productData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-400 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={productData.description}
                            onChange={handleInputChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Specifications (optional)</label>
                        <textarea
                            name="specifications"
                            value={productData.specifications}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            rows="2"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-400 mb-1">SKU</label>
                            <input
                                type="text"
                                name="sku"
                                value={productData.sku}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-400 mb-1">Price</label>
                            <input
                                type="number"
                                name="price"
                                value={productData.price}
                                onChange={handleInputChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            />
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
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            {processing ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;