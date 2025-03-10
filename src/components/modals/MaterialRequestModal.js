import React, { useState, useEffect } from 'react';
import { requestMaterials } from '../../services/manufacturerApi';

const MaterialRequestModal = ({ closeModal, refreshData }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [requestData, setRequestData] = useState({
        manufacturerId: localStorage.getItem('userId'),
        supplierId: '',
        supplyChainId: localStorage.getItem('supplyChainId') || 1,
        items: [{ materialId: '', quantity: '' }],
        requestedDeliveryDate: '',
        notes: ''
    });
    const [processing, setProcessing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch suppliers and their materials
        const fetchSuppliers = async () => {
            try {
                // This should be replaced with your actual API call
                const response = await fetch('http://localhost:8080/api/suppliers', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();
                setSuppliers(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
                // Mock data for development
                setSuppliers([
                    { id: 1, username: 'Supplier A' },
                    { id: 2, username: 'Supplier B' }
                ]);
                setLoading(false);
            }
        };

        fetchSuppliers();
    }, []);

    useEffect(() => {
        // Fetch materials for selected supplier
        if (selectedSupplier) {
            const fetchMaterials = async () => {
                try {
                    // This should be replaced with your actual API call
                    const response = await fetch(`http://localhost:8080/api/supplier/materials/active/${selectedSupplier}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                    const data = await response.json();
                    setMaterials(Array.isArray(data) ? data : []);
                } catch (error) {
                    console.error('Error fetching materials:', error);
                    // Mock data for development
                    setMaterials([
                        { id: 101, name: 'Raw Material 1', unit: 'kg' },
                        { id: 102, name: 'Raw Material 2', unit: 'pieces' }
                    ]);
                }
            };

            fetchMaterials();
            setRequestData({
                ...requestData,
                supplierId: selectedSupplier,
                items: [{ materialId: '', quantity: '' }]
            });
        }
    }, [selectedSupplier]);

    const handleSupplierChange = (e) => {
        setSelectedSupplier(e.target.value);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRequestData({
            ...requestData,
            [name]: value
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...requestData.items];
        newItems[index][field] = value;
        setRequestData({
            ...requestData,
            items: newItems
        });
    };

    const addItem = () => {
        setRequestData({
            ...requestData,
            items: [...requestData.items, { materialId: '', quantity: '' }]
        });
    };

    const removeItem = (index) => {
        if (requestData.items.length > 1) {
            const newItems = [...requestData.items];
            newItems.splice(index, 1);
            setRequestData({
                ...requestData,
                items: newItems
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate items
        const validItems = requestData.items.every(item => 
            item.materialId && item.quantity && parseInt(item.quantity) > 0
        );
        
        if (!validItems) {
            alert('Please complete all material details and ensure quantities are greater than zero.');
            return;
        }
        
        setProcessing(true);
        try {
            // Format the request data
            const formattedData = {
                ...requestData,
                items: requestData.items.map(item => ({
                    materialId: parseInt(item.materialId),
                    quantity: parseInt(item.quantity)
                })),
                requestedDeliveryDate: requestData.requestedDeliveryDate ? 
                    new Date(requestData.requestedDeliveryDate).getTime() : null
            };
            
            await requestMaterials(formattedData);
            refreshData();
            closeModal();
        } catch (error) {
            console.error('Error requesting materials:', error);
            alert('Failed to request materials: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold text-[#E0E1DD] mb-4">Request Materials</h2>
                
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#E0E1DD]"></div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-1">Supplier</label>
                            <select
                                value={selectedSupplier}
                                onChange={handleSupplierChange}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                            >
                                <option value="">Select a supplier</option>
                                {Array.isArray(suppliers) && suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {selectedSupplier && (
                            <>
                                <div>
                                    <label className="block text-gray-400 mb-1">Requested Materials</label>
                                    {requestData.items.map((item, index) => (
                                        <div key={index} className="flex space-x-2 mb-2">
                                            <select
                                                value={item.materialId}
                                                onChange={(e) => handleItemChange(index, 'materialId', e.target.value)}
                                                required
                                                className="flex-grow p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                                            >
                                                <option value="">Select a material</option>
                                                {Array.isArray(materials) && materials.map(material => (
                                                    <option key={material.id} value={material.id}>
                                                        {material.name} ({material.unit})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                placeholder="Quantity"
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
                                    <label className="block text-gray-400 mb-1">Requested Delivery Date</label>
                                    <input
                                        type="date"
                                        name="requestedDeliveryDate"
                                        value={requestData.requestedDeliveryDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 mb-1">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={requestData.notes}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md bg-[#415A77] text-white"
                                        rows="3"
                                        placeholder="Any special requirements or notes for the supplier"
                                    />
                                </div>
                            </>
                        )}
                        
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
                                disabled={processing || !selectedSupplier}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-500"
                            >
                                {processing ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MaterialRequestModal;