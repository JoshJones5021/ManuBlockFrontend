import React, { useState } from 'react';
import { requestMaterials } from '../../services/manufacturerApi';

const MaterialRequestModal = ({ closeModal, refreshData }) => {
    const [materialName, setMaterialName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await requestMaterials({ materialName, quantity });
            refreshData();
            closeModal();
        } catch (error) {
            console.error('Error requesting materials:', error);
        }
        setProcessing(false);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Request Materials</h2>
                <form onSubmit={handleSubmit}>
                    <label>Material Name:</label>
                    <input type="text" value={materialName} onChange={(e) => setMaterialName(e.target.value)} required />
                    <label>Quantity:</label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    <button type="submit" disabled={processing}>{processing ? 'Requesting...' : 'Request'}</button>
                    <button type="button" onClick={closeModal}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default MaterialRequestModal;
