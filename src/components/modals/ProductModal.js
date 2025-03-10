import React, { useState } from 'react';
import { createProduct } from '../../services/manufacturerApi';

const ProductModal = ({ closeModal, refreshData }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await createProduct({ name, description });
            refreshData();
            closeModal();
        } catch (error) {
            console.error('Error creating product:', error);
        }
        setProcessing(false);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Create Product</h2>
                <form onSubmit={handleSubmit}>
                    <label>Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    <label>Description:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                    <button type="submit" disabled={processing}>{processing ? 'Creating...' : 'Create'}</button>
                    <button type="button" onClick={closeModal}>Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
