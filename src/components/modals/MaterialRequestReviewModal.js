import React, { useState } from 'react';

const MaterialRequestReviewModal = ({ isOpen, onClose, request, onApprove }) => {
    const [approvals, setApprovals] = useState(
        request?.items?.map(item => ({
            itemId: item.id,
            approvedQuantity: item.requestedQuantity
        })) || []
    );

    if (!isOpen || !request) return null;

    const handleQuantityChange = (itemId, quantity) => {
        const newApprovals = approvals.map(approval => 
            approval.itemId === itemId 
                ? { ...approval, approvedQuantity: Math.max(0, Number(quantity)) } 
                : approval
        );
        setApprovals(newApprovals);
    };

    const handleApprove = () => {
        onApprove(request.id, approvals);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-[#E0E1DD]">
                        Review Material Request #{request.requestNumber}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
                
                <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4 bg-[#0D1B2A] p-4 rounded-lg mb-4">
                        <div>
                            <p className="text-gray-400">Manufacturer:</p>
                            <p className="font-medium">{request.manufacturer?.username || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Requested Date:</p>
                            <p className="font-medium">{new Date(request.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Requested Delivery:</p>
                            <p className="font-medium">
                                {request.requestedDeliveryDate 
                                    ? new Date(request.requestedDeliveryDate).toLocaleDateString() 
                                    : 'Not specified'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400">Notes:</p>
                            <p className="font-medium">{request.notes || 'None'}</p>
                        </div>
                    </div>
                    
                    <h3 className="font-semibold mb-2">Requested Materials</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-[#0D1B2A] rounded-lg">
                            <thead>
                                <tr className="border-b border-gray-700">
                                    <th className="py-3 px-4 text-left">Material</th>
                                    <th className="py-3 px-4 text-left">In Stock</th>
                                    <th className="py-3 px-4 text-left">Requested</th>
                                    <th className="py-3 px-4 text-left">Approve Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {request.items?.map((item) => (
                                    <tr key={item.id} className="border-b border-gray-700">
                                        <td className="py-3 px-4">{item.material?.name || 'Unknown Material'}</td>
                                        <td className="py-3 px-4">
                                            {item.material?.quantity || 0} {item.material?.unit || 'units'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {item.requestedQuantity} {item.material?.unit || 'units'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.material?.quantity || 0}
                                                value={approvals.find(a => a.itemId === item.id)?.approvedQuantity || 0}
                                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                                className="w-20 p-2 bg-[#1B263B] text-white rounded border border-[#415A77]"
                                            />
                                            <span className="ml-2">{item.material?.unit || 'units'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleApprove} 
                        className="bg-[#415A77] text-white px-4 py-2 rounded hover:bg-[#778DA9]"
                    >
                        Approve Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaterialRequestReviewModal;