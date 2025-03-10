import axios from 'axios';
import config from '../components/common/config';

const API_BASE_URL = 'http://localhost:8080/api/manufacturer';

const handleApiError = (error, customMessage) => {
    if (error.response) {
        if (error.response.status === 401) {
            localStorage.removeItem(config.AUTH.TOKEN_KEY);
            window.location.href = '/login';
            return `Session expired. Please login again.`;
        } else {
            return error.response.data.error || customMessage;
        }
    } else if (error.request) {
        return 'Network error. Please check your connection.';
    } else {
        return 'An unexpected error occurred.';
    }
};

// Product Management
export const getProducts = async (manufacturerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products/${manufacturerId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching products');
        throw new Error(errorMessage);
    }
};

export const createProduct = async (productData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/products`, productData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error creating product');
        throw new Error(errorMessage);
    }
};

export const updateProduct = async (productId, productData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error updating product');
        throw new Error(errorMessage);
    }
};

export const deactivateProduct = async (productId) => {
    try {
        await axios.delete(`${API_BASE_URL}/products/${productId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error deactivating product');
        throw new Error(errorMessage);
    }
};

// Order Management
export const getOrders = async (manufacturerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders/${manufacturerId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching orders');
        throw new Error(errorMessage);
    }
};

// Material Requests
export const getMaterialRequests = async (manufacturerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/materials/requests/${manufacturerId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching material requests');
        throw new Error(errorMessage);
    }
};

export const requestMaterials = async (materialRequestData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/materials/request`, materialRequestData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error requesting materials');
        throw new Error(errorMessage);
    }
};

// Production Management
export const getBatches = async (manufacturerId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/production/batches/${manufacturerId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching production batches');
        throw new Error(errorMessage);
    }
};

export const createBatch = async (batchData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/production/batch`, batchData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error creating production batch');
        throw new Error(errorMessage);
    }
};

export const completeBatch = async (batchId) => {
    try {
        await axios.post(`${API_BASE_URL}/production/batch/${batchId}/complete`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error completing production batch');
        throw new Error(errorMessage);
    }
};

export const rejectBatch = async (batchId) => {
    try {
        await axios.post(`${API_BASE_URL}/production/batch/${batchId}/reject`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error rejecting production batch');
        throw new Error(errorMessage);
    }
};