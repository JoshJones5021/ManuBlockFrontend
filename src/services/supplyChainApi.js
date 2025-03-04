import axios from 'axios';
import config from '../components/common/config';

const API_BASE_URL = config.API.SUPPLY_CHAINS;

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

// Supply Chains
export const getAllSupplyChains = async () => {
    try {
        const response = await axios.get(API_BASE_URL, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching supply chains');
        throw new Error(errorMessage);
    }
};

export const createSupplyChain = async (supplyChain) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create`, supplyChain, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error creating supply chain');
        throw new Error(errorMessage);
    }
};

export const getSupplyChainById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching supply chain');
        throw new Error(errorMessage);
    }
};

export const updateSupplyChain = async (id, updatedSupplyChain) => {
    try {
        // Convert nodes format if needed
        const formattedNodes = updatedSupplyChain.nodes?.map(node => ({
            id: node.id,
            name: node.name,
            role: node.role,
            x: node.x,
            y: node.y,
            status: node.status,
            assignedUserId: node.assignedUser ? 
                (typeof node.assignedUser === 'object' ? node.assignedUser.id : node.assignedUser) : 
                node.assignedUserId
        }));

        // Format the update data
        const formattedData = {
            ...updatedSupplyChain,
            nodes: formattedNodes,
            updatedAt: new Date().toISOString()
        };

        const response = await axios.put(`${API_BASE_URL}/${id}`, formattedData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, `Error updating supply chain ${id}`);
        throw new Error(errorMessage);
    }
};

export const deleteSupplyChain = async (id) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error deleting supply chain');
        throw new Error(errorMessage);
    }
};

// Nodes
export const createNode = async (supplyChainId, node) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${supplyChainId}/nodes`, node, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error creating node');
        throw new Error(errorMessage);
    }
};

export const getNodes = async (supplyChainId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${supplyChainId}/nodes`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching nodes');
        throw new Error(errorMessage);
    }
};

export const getNodeById = async (supplyChainId, nodeId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${supplyChainId}/nodes/${nodeId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching node');
        throw new Error(errorMessage);
    }
};

export const updateNode = async (supplyChainId, nodeId, updatedNode) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${supplyChainId}/nodes/${nodeId}`, updatedNode, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error updating node');
        throw new Error(errorMessage);
    }
};

export const deleteNode = async (supplyChainId, nodeId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${supplyChainId}/nodes/${nodeId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error deleting node');
        throw new Error(errorMessage);
    }
};

// Edges
export const createEdge = async (supplyChainId, edge) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/${supplyChainId}/edges`, edge, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error creating edge');
        throw new Error(errorMessage);
    }
};

export const getEdges = async (supplyChainId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${supplyChainId}/edges`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching edges');
        throw new Error(errorMessage);
    }
};

export const getEdgeById = async (supplyChainId, edgeId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${supplyChainId}/edges/${edgeId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching edge');
        throw new Error(errorMessage);
    }
};

export const updateEdge = async (supplyChainId, edgeId, updatedEdge) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/${supplyChainId}/edges/${edgeId}`, updatedEdge, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error updating edge');
        throw new Error(errorMessage);
    }
};

export const deleteEdge = async (supplyChainId, edgeId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${supplyChainId}/edges/${edgeId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error deleting edge');
        throw new Error(errorMessage);
    }
};