import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/supply-chains';

// Supply Chains
export const getAllSupplyChains = async () => {
    try {
        const response = await axios.get(API_BASE_URL, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching supply chains:', error);
        throw error;
    }
};

export const createSupplyChain = async (supplyChain) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create`, supplyChain, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating supply chain:', error);
        throw error;
    }
};

export const getSupplyChainById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching supply chain:', error);
        throw error;
    }
};

export const updateSupplyChain = async (id, updatedSupplyChain) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${id}`, {
            ...updatedSupplyChain,
            updatedAt: new Date().toISOString(), // Add updatedAt timestamp
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating supply chain ${id}:`, error.response?.data || error.message);
        throw error;
    }
};


export const deleteSupplyChain = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting supply chain:', error);
        throw error;
    }
};

// Nodes
export const createNode = async (supplyChainId, node) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${supplyChainId}/nodes`, node, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating node:', error);
        throw error;
    }
};

export const updateNode = async (supplyChainId, nodeId, updatedNode) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${supplyChainId}/nodes/${nodeId}`, updatedNode, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating node:', error);
        throw error;
    }
};

export const deleteNode = async (supplyChainId, nodeId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${supplyChainId}/nodes/${nodeId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting node:', error);
        throw error;
    }
};

// Edges
export const createEdge = async (supplyChainId, edge) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${supplyChainId}/edges`, edge, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating edge:', error);
        throw error;
    }
};

export const deleteEdge = async (supplyChainId, edgeId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${supplyChainId}/edges/${edgeId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting edge:', error);
        throw error;
    }
};