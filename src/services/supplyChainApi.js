import axios from 'axios';
import config from '../components/common/config';

const API_BASE_URL = config.API.SUPPLY_CHAINS;
const API_SUPPLIER_URL = 'http://localhost:8080/api/supplier';
const API_DISTRIBUTOR_URL = 'http://localhost:8080/api/distributor';
const API_TRACING_URL = 'http://localhost:8080/api/tracing';

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

// Materials
export const getMaterialsBySupplier = async (supplierId) => {
    try {
        const response = await axios.get(`${API_SUPPLIER_URL}/materials/${supplierId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching supplier materials');
        throw new Error(errorMessage);
    }
};

export const createMaterial = async (materialData) => {
    try {
        const response = await axios.post(`${API_SUPPLIER_URL}/materials`, materialData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error creating material');
        throw new Error(errorMessage);
    }
};

export const updateMaterial = async (materialId, materialData) => {
    try {
        const response = await axios.put(`${API_SUPPLIER_URL}/materials/${materialId}`, materialData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error updating material');
        throw new Error(errorMessage);
    }
};

export const deactivateMaterial = async (materialId) => {
    try {
        const response = await axios.delete(`${API_SUPPLIER_URL}/materials/${materialId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error deactivating material');
        throw new Error(errorMessage);
    }
};

// Material Requests
export const getPendingRequests = async (supplierId) => {
    try {
        const response = await axios.get(`${API_SUPPLIER_URL}/requests/pending/${supplierId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching pending requests');
        throw new Error(errorMessage);
    }
};

export const getRequestsByStatus = async (supplierId, status) => {
    try {
        const response = await axios.get(`${API_SUPPLIER_URL}/requests/${supplierId}/${status}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching requests by status');
        throw new Error(errorMessage);
    }
};

export const approveRequest = async (requestId, approvals) => {
    try {
        const response = await axios.post(`${API_SUPPLIER_URL}/requests/${requestId}/approve`, approvals, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error approving request');
        throw new Error(errorMessage);
    }
};

export const allocateMaterials = async (requestId) => {
    try {
        const response = await axios.post(`${API_SUPPLIER_URL}/requests/${requestId}/allocate`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error allocating materials');
        throw new Error(errorMessage);
    }
};

// Transports
export const getTransportsForSource = async (sourceId) => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/transports/source/${sourceId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching transport history');
        throw new Error(errorMessage);
    }
};

export const getTransportDetail = async (transportId) => {
    try {
        const response = await axios.get(`${API_DISTRIBUTOR_URL}/transport/${transportId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching transport details');
        throw new Error(errorMessage);
    }
};

// Blockchain Tracing
export const getBlockchainTransaction = async (transactionId) => {
    try {
        const response = await axios.get(`${API_TRACING_URL}/blockchain/transaction/${transactionId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching blockchain transaction');
        throw new Error(errorMessage);
    }
};

export const getBlockchainItemDetails = async (itemId) => {
    try {
        const response = await axios.get(`${API_TRACING_URL}/blockchain/item/${itemId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching blockchain item details');
        throw new Error(errorMessage);
    }
};

export const getSupplyChainsByUserId = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
            },
        });
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Error fetching supply chains for user');
        throw new Error(errorMessage);
    }
};
