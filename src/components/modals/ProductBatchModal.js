import React, { useState, useEffect } from 'react';
import { createBatch } from '../../services/manufacturerApi';

const ProductBatchModal = ({ closeModal, refreshData }) => {
    const [products, setProducts] = useState([]);
    const [allocatedMaterials, setAllocatedMaterials] = useState([]);
    const [batchData, setBatchData] = useState({
        manufacturerId: localStorage.getItem('userId'),
        productId: '',
        supplyChainId: localStorage.getItem('supplyChainId') || 1,
        quantity: '',
        orderId: '', // Optional - could be linked to an order
        materials: [] // List of materials with their blockchain IDs
    });
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch products and allocated materials
        const fetchData = async () => {
            try {
                // Fetch products for this manufacturer
                // This should be replaced with your actual API call
                const productsResponse = await fetch(
                    `http://localhost:8080/api/manufacturer/products/active/${localStorage.getItem('userId')}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                const productsData = await productsResponse.json();
                setProducts(Array.isArray(productsData) ? productsData : []);

                // Fetch allocated materials
                const materialsResponse = await fetch(
                    `http://localhost:8080/api/manufacturer/materials/allocated/${localStorage.getItem('userId')}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                const materialsData = await materialsResponse.json();
                setAllocatedMaterials(Array.isArray(materialsData) ? materialsData : []);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                
                // Mock data for development
                setProducts([
                    { id: 1, name: 'Product A' },
                    { id: 2, name: 'Product B' }
                ]);
                
                setAllocatedMaterials([
                    { id: 101, materialId: 201, name: 'Steel', blockchainItemId: 1001, availableQuantity: 500, unit: 'kg' },
                    { id: 102, materialId: 202, name: 'Plastic', blockchainItemId: 1002, availableQuantity: 300, unit: 'kg' }
                ]);
                
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleProductChange = (e) => {
        setBatchData({
            ...batchData,
            productId: e.target.value,
            materials: [] // Reset materials when product changes
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBatchData({
            ...batchData,
            [name]: value
        });
    };

    const handleMaterialChange = (materialId, blockchainItemId, quantity) => {
        // Update or add material to the batch
        const existingIndex = batchData.materials.findIndex(m => m.materialId === materialId);
        
        if (existingIndex >= 0) {
            // Update existing material
            const updatedMaterials = [...batchData.materials];
            updatedMaterials[existingIndex] = {
                materialId,
                blockchainItemId,
                quantity: parseInt(quantity)
            };
            setBatchData({
                ...batchData,
                materials: updatedMaterials
            });
        } else {
            // Add new material
            setBatchData({
                ...batchData,
                materials: [
                    ...batchData.materials,
                    {
                        materialId,
                        blockchainItemId,
                        quantity: parseInt(quantity)
                    }
                ]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate batch data
        if (!batchData.productId || !batchData.quantity || batchData.quantity <= 0) {
            alert('Please select a product and enter a valid quantity.');
            return;
        }
        
        if (batchData.materials.length === 0) {
            alert('Please select at least one material for production.');
            return;
        }
        
        setProcessing(true);
        try {
            // Format the batch data
            const formattedData = {
                ...batchData,
                productId: parseInt(batchData.productId),
                quantity: parseInt(batchData.quantity),
                supplyChainId: parseInt(batchData.supplyChainId),
                orderId: batchData.orderId ? parseInt(batchData.orderId) : null
            };
            
            await createBatch(formattedData);
            refreshData();
            closeModal();
        } catch (error) {
            console.error('Error creating production batch:', error);
            alert('Failed to create production batch: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-[#E0E1DD] mb-4">Create Production Batch</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E0E1DD]"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Product</label>
                            <select
                                name="productId"
                                value={batchData.productId}
                                onChange={handleProductChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            >
                                <option value="">Select a product</option>
                                {Array.isArray(products) && products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-gray-400 mb-1">Batch Size (Quantity)</label>
                            <input
                                type="number"
                                name="quantity"
                                value={batchData.quantity}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                                placeholder="How many items to produce"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-400 mb-1">Order ID (Optional)</label>
                            <input
                                type="text"
                                name="orderId"
                                value={batchData.orderId}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                                placeholder="Link to an existing order"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-400 mb-1">Select Materials for Production</label>
                            {allocatedMaterials.length === 0 ? (
                                <div className="text-yellow-300 p-2 bg-yellow-900 bg-opacity-30 rounded-md">
                                    No allocated materials available. You need to request materials from suppliers first.
                                </div>
                            ) : (
                                <div className="space-y-3 mt-2">
                                    {Array.isArray(allocatedMaterials) && allocatedMaterials.map(material => (
                                        <div key={material.id} className="flex items-center space-x-3 p-2 border border-[#415A77] rounded-md">
                                            <div className="flex-grow">
                                                <p className="font-medium">{material.name}</p>
                                                <p className="text-xs text-gray-400">
                                                    Available: {material.availableQuantity} {material.unit}
                                                </p>
                                            </div>
                                            <input
                                                type="number"
                                                placeholder="Quantity"
                                                min="0"
                                                max={material.availableQuantity}
                                                onChange={(e) => handleMaterialChange(
                                                    material.materialId,
                                                    material.blockchainItemId,
                                                    e.target.value
                                                )}
                                                className="w-24 p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                disabled={processing || allocatedMaterials.length === 0}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-500"
                            >
                                {processing ? 'Creating...' : 'Create Batch'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProductBatchModal;