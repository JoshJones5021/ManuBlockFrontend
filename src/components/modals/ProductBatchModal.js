import React, { useState } from 'react';
import { createBatch } from '../../services/manufacturerApi';

const ProductBatchModal = ({ closeModal, refreshData }) => {
    const [productName, setProductName] = useState('');
    const [batchSize, setBatchSize] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await createBatch({ productName, batchSize });
            refreshData();
            closeModal();
        } catch (error) {
            console.error('Error creating production batch:', error);
        }
        setProcessing(false);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Create Production Batch</h2>
                <form onSubmit={handleSubmit}>
                    <label>Product Name:</label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                    <label>Batch Size:</label>
                    <input type="number" value={batchSize} onChange={(e) => setBatchSize(e.target.value)} required />
                    <button type="submit" disabled={processing}>{processing ? 'Creating...' : 'Create'}</button>
                    <button type="button" onClick={closeModal}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default ProductBatchModal;
