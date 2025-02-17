import React, { useState } from 'react';
import { createSupplyChain } from '../services/supplyChainApi';

const CreateSupplyChainModal = ({ isOpen, onClose, onRefresh }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createSupplyChain({ name, description });
            onRefresh();
            onClose();
        } catch (error) {
            console.error('Error creating supply chain:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-96">
                <h2 className="text-xl font-semibold text-[#E0E1DD] mb-4">Create Supply Chain</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Supply Chain Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md bg-[#415A77] text-white"
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full p-3 border border-gray-300 rounded-md bg-[#415A77] text-white"
                    />
                    <div className="flex justify-between">
                        <button type="button" onClick={onClose} className="bg-red-500 px-4 py-2 rounded">
                            Cancel
                        </button>
                        <button type="submit" className="bg-green-500 px-4 py-2 rounded">
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSupplyChainModal;