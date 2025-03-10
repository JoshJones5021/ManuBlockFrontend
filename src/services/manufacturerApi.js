import axios from 'axios';
const API_BASE_URL = '/api/manufacturer';

// Product Management
export const getProducts = async (manufacturerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products/${manufacturerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/products`, productData);
        return response.data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData);
        return response.data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

export const deactivateProduct = async (productId) => {
    try {
        await axios.delete(`${API_BASE_URL}/products/${productId}`);
    } catch (error) {
        console.error('Error deactivating product:', error);
        throw error;
    }
};

// Order Management
export const getOrders = async (manufacturerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/${manufacturerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

// Material Requests
export const getMaterialRequests = async (manufacturerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/materials/requests/${manufacturerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching material requests:', error);
        throw error;
    }
};

export const requestMaterials = async (materialRequestData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/materials/request`, materialRequestData);
        return response.data;
    } catch (error) {
        console.error('Error requesting materials:', error);
        throw error;
    }
};

// Production Management
export const getBatches = async (manufacturerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/production/batches/${manufacturerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching production batches:', error);
        throw error;
    }
};

export const createBatch = async (batchData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/production/batch`, batchData);
        return response.data;
    } catch (error) {
        console.error('Error creating production batch:', error);
        throw error;
    }
};

export const completeBatch = async (batchId) => {
    try {
        await axios.post(`${API_BASE_URL}/production/batch/${batchId}/complete`);
    } catch (error) {
        console.error('Error completing production batch:', error);
        throw error;
    }
};

export const rejectBatch = async (batchId) => {
    try {
        await axios.post(`${API_BASE_URL}/production/batch/${batchId}/reject`);
    } catch (error) {
        console.error('Error rejecting production batch:', error);
        throw error;
    }
};
