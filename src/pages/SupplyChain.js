import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getSupplyChainById,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    deleteEdge,
    updateSupplyChain,
    getNodes
  } from "../services/supplyChainApi";  
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import Navbar from "../components/navbar/NavBar";
import Sidebar from "../components/sidebar/Sidebar";
import CustomNode from '../nodes/CustomNode';
import config from '../components/common/config';
import LoadingOverlay from '../components/LoadingOverlay';

const nodeTypes = {
    customNode: CustomNode, // Ensure CustomNode is used directly
};

const SupplyChain = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [supplyChain, setSupplyChain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingNodes, setEditingNodes] = useState({});
    const [validationError, setValidationError] = useState('');
    const [users, setUsers] = useState([]);  
    const [roles, setRoles] = useState([]);  
    const [isSaving, setIsSaving] = useState(false);

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { setViewport } = useReactFlow();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);

    // Fetch supply chain data
    useEffect(() => {
        const fetchSupplyChainAndUsers = async () => {
            try {
                console.log("⏳ Fetching supply chain and users...");
    
                // ✅ Fetch Supply Chain Data
                const data = await getSupplyChainById(id);
                if (!data) {
                    console.error("❌ Error: Supply chain is null or undefined!");
                    return;
                }
                console.log("✅ Fetched Supply Chain:", data);
                
                // Format data for the frontend
                if (data.nodes) {
                    // Map assignedUser from backend format to frontend format
                    data.nodes = data.nodes.map(node => ({
                        ...node,
                        // If assignedUser is an object, extract the ID
                        assignedUser: typeof node.assignedUserId === 'object' && node.assignedUserId !== null 
                            ? node.assignedUserId.id 
                            : node.assignedUserId
                    }));
                }
                
                setSupplyChain(data);
    
                // ✅ Fetch Users
                const usersResponse = await fetch(`${config.API.USERS}/`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                        "Content-Type": "application/json",
                    },
                });
    
                const usersData = await usersResponse.json();
                setUsers(usersData || []);
    
                const userIdToUsername = usersData.reduce((acc, user) => {
                    acc[user.id] = user.username;
                    return acc;
                }, {});
    
                // ✅ Fetch Roles
                const rolesResponse = await fetch(`${config.API.USERS}/roles`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem(config.AUTH.TOKEN_KEY)}`,
                        "Content-Type": "application/json",
                    },
                });
    
                const rolesData = await rolesResponse.json();
                setRoles(rolesData || []);
    
                // ✅ Set Nodes with Correct Positions
                if (data.nodes) {
                    const initialNodes = data.nodes.map((node) => ({
                        id: `${node.id}`,
                        type: "customNode",
                        position: { x: node.x, y: node.y },
                        data: {
                            id: node.id,
                            label: node.name || "Unnamed Node",
                            name: node.name || "Unnamed Node",
                            role: node.role || "Unassigned",
                            assignedUser: node.assignedUser || "Unassigned",
                            assignedUsername: userIdToUsername[node.assignedUser] || "Unassigned",
                            status: node.status || "pending",
                            supplyChainId: id,
                            isEditMode,
                            onDelete: handleDeleteNode,
                            onEdit: handleEditNode,
                            previousNodeStatus: "done", // Default to "done" for starting nodes
                            edges: data.edges,
                        }
                    }));
    
                    // Calculate node positions
                    const nodePositions = calculateNodePositions(initialNodes, data.edges);
    
                    // Update nodes with positions and previous node status
                    const nodesWithPositions = initialNodes.map(node => {
                        const incomingEdges = data.edges.filter(edge =>
                            edge.target && String(edge.target.id) === node.id
                        );                        
                        
                        const previousNodeStatus = incomingEdges.length > 0
                            ? initialNodes.find(n => 
                                n.id === String(incomingEdges[0].source.id))?.data.status || "done"
                            : "done"; // Default to "done" for starting nodes
    
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                position: nodePositions[node.id],
                                previousNodeStatus,
                            }
                        };
                    });
    
                    setNodes(nodesWithPositions);
    
                    // ✅ Manually set viewport to center based on nodes' positions
                    if (initialNodes.length > 0) {
                        const avgX = initialNodes.reduce((sum, node) => sum + node.position.x, 0) / initialNodes.length;
                        const avgY = initialNodes.reduce((sum, node) => sum + node.position.y, 0) / initialNodes.length;
                        setViewport({ x: avgX - 500, y: avgY - 300, zoom: 1 }); // Manually adjust view based on average position
                    }
                }
    
                // ✅ Set Edges - handle the backend format conversion
                if (data.edges) {
                    setEdges(data.edges.map((edge) => ({
                        id: `${edge.id}`,
                        source: `${edge.source.id}`,
                        target: `${edge.target.id}`,
                        sourceHandle: edge.sourceHandle || "right",
                        targetHandle: edge.targetHandle || "left",
                        animated: edge.animated ?? true,
                        style: { stroke: edge.strokeColor || "#778DA9", strokeWidth: edge.strokeWidth ?? 2 }
                    })));
                }
    
            } catch (err) {
                console.error("❌ Error fetching supply chain or users/roles:", err);
                // Add better error handling
                if (err.response && err.response.status === 401) {
                    alert("Your session has expired. Please log in again.");
                    localStorage.removeItem(config.AUTH.TOKEN_KEY);
                    navigate('/login');
                } else {
                    alert("Failed to load supply chain data. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };
    
        fetchSupplyChainAndUsers();
    }, [id, isEditMode, navigate]);

    // Handle Node Drop
    const onDrop = async (event) => {
        event.preventDefault();
        const nodeType = event.dataTransfer.getData("nodeType");
    
        if (!nodeType) return;
    
        if (users.length === 0) {
            console.error("Users array is empty. Cannot create node.");
            return;
        }
    
        const reactFlowBounds = event.target.getBoundingClientRect();
        const position = {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        };
    
        const newNodeData = {
            name: "Unnamed Node",
            role: "CUSTOMER", // Default role
            assignedUserId: parseInt(localStorage.getItem(config.AUTH.USER_ID_KEY)) || null,
            supplyChainId: id,
            x: position.x,
            y: position.y,
            status: "pending",
        };
    
        try {
            // Send node creation request to backend
            const createdNode = await createNode(id, newNodeData);
            
            // Store the complete node data in React Flow format
            setNodes((nds) => [
                ...nds,
                {
                    id: createdNode.id.toString(),
                    type: "customNode",
                    position: { x: createdNode.x, y: createdNode.y },
                    data: {
                        ...createdNode, // Include the complete node data from response
                        id: createdNode.id,
                        label: createdNode.name,
                        supplyChainId: id,
                        isEditMode,
                        onDelete: handleDeleteNode,
                        onEdit: handleEditNode,
                        users,
                        roles,
                        updateNodeData: (nodeId, updatedData) => {
                            setNodes((prevNodes) =>
                                prevNodes.map((n) =>
                                    n.id === nodeId ? { ...n, data: { ...n.data, ...updatedData } } : n
                                )
                            );
                        },
                        onSaveNode: (nodeId) => handleSaveNode(nodeId),
                        onEditStateChange: (nodeId, isEditing) => {
                            setEditingNodes((prev) => ({
                                ...prev,
                                [nodeId]: isEditing,
                            }));
                        },
                        getStatusColor,
                        previousNodeStatus: "done",
                    },
                },
            ]);
        } catch (error) {
            console.error("Error creating node:", error);
            alert("Failed to create node. Please try again.");
        }
    };

    // Allow Dragging from Sidebar
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData("nodeType", nodeType);
    };

    const onNodeDragStop = async (event, node) => {
        setNodes((prevNodes) =>
            prevNodes.map((n) =>
                n.id === node.id
                    ? {
                        ...n,
                        position: { x: node.position.x, y: node.position.y },
                        data: {
                            ...n.data,
                            x: node.position.x,
                            y: node.position.y,
                        },
                    }
                    : n
            )
        );
    
        // Update node position in backend
        try {
            const nodeData = nodes.find(n => n.id === node.id)?.data;
            if (nodeData) {
                await updateNode(id, nodeData.id, {
                    x: node.position.x,
                    y: node.position.y,
                    name: nodeData.name,
                    role: nodeData.role,
                    status: nodeData.status,
                    assignedUser: nodeData.assignedUser ? { id: parseInt(nodeData.assignedUser) } : null
                });
            }
        } catch (error) {
            console.error("Error updating node position:", error);
        }
    };  

    const hasNodesWithoutEdges = () => {
        return nodes.some(node => {
            const nodeId = node.id;
            const hasIncomingEdge = edges.some(edge => edge.target === nodeId);
            const hasOutgoingEdge = edges.some(edge => edge.source === nodeId);
            return !hasIncomingEdge && !hasOutgoingEdge;
        });
    };

    // Handle Node Click (Open Modal)
    const onNodeClick = (event, node) => {
        if (isEditMode) {
            setSelectedNode(node);
            setIsModalOpen(true);
        }
    };

    // Handle Modal Save
    const handleSaveNode = async (nodeId) => {
        const nodeToSave = nodes.find((node) => node.id === nodeId);
    
        if (
            !nodeToSave.data.name ||
            !nodeToSave.data.role ||
            !nodeToSave.data.assignedUser
        ) {
            setValidationError("All fields must be filled.");
            return;
        }
    
        try {
            // Use the backend-generated node ID for the update request
            const backendNodeId = nodeToSave.data.id;
    
            // Format the data for the backend
            const nodeDataForBackend = {
                name: nodeToSave.data.name,
                role: nodeToSave.data.role,
                assignedUser: nodeToSave.data.assignedUser ? 
                    { id: parseInt(nodeToSave.data.assignedUser) } : null,
                status: nodeToSave.data.status,
                x: nodeToSave.position.x,
                y: nodeToSave.position.y,
            };
    
            // Save changes to the backend
            const updatedNode = await updateNode(
                nodeToSave.data.supplyChainId, 
                backendNodeId, 
                nodeDataForBackend
            );
    
            // Update local state
            setNodes((prevNodes) => {
                const updatedNodes = prevNodes.map((node) =>
                    node.id === nodeId ? { 
                        ...node, 
                        data: { 
                            ...nodeToSave.data,
                            // Ensure the assignedUser is in the correct format for frontend
                            assignedUser: updatedNode.assignedUserID || updatedNode.assignedUserId || null
                        } 
                    } : node
                );
    
                // If the current node's status is "done", update the previousNodeStatus of the next nodes
                if (nodeToSave.data.status === "done") {
                    const nextNodes = edges
                        .filter((edge) => edge.source === nodeId)
                        .map((edge) => edge.target);
    
                    nextNodes.forEach((nextNodeId) => {
                        const nextNode = updatedNodes.find((node) => node.id === nextNodeId);
                        if (nextNode) {
                            nextNode.data.previousNodeStatus = "done";
                        }
                    });
                }
    
                return updatedNodes;
            });
    
            setEditingNodes((prev) => ({
                ...prev,
                [nodeId]: false,
            }));
    
            setValidationError("");
        } catch (error) {
            console.error("Error saving node:", error);
            alert("Failed to save node changes. Please try again.");
        }
    };

    // Handle Node Deletion
    const handleDeleteNode = async (nodeId, event) => {
        if (event) event.stopPropagation();
    
        const confirmDelete = window.confirm("Are you sure you want to delete this node?");
        if (!confirmDelete) return;
    
        try {
            // Convert nodeId to string for consistency
            const nodeIdStr = String(nodeId);
    
            // Find all edges connected to this node
            const connectedEdges = edges.filter(
                (edge) => edge.source === nodeIdStr || edge.target === nodeIdStr
            );
    
            // First delete all connected edges from the backend
            const edgeDeletionPromises = connectedEdges.map((edge) =>
                deleteEdge(id, edge.id)
            );
    
            // Wait for all edge deletions to complete
            await Promise.all(edgeDeletionPromises);
    
            // Then delete the node from the backend
            await deleteNode(id, nodeId);
    
            // Update the UI by removing the node from state
            setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeIdStr));
    
            // Update the UI by removing any edges connected to this node
            setEdges((prevEdges) =>
                prevEdges.filter((edge) => edge.source !== nodeIdStr && edge.target !== nodeIdStr)
            );
    
            // ✅ Remove the node from the editing state
            setEditingNodes((prev) => {
                const updatedEditingNodes = { ...prev };
                delete updatedEditingNodes[nodeIdStr];
                return updatedEditingNodes;
            });
        } catch (error) {
            console.error("Error deleting node or its edges:", error);
            alert("An error occurred while deleting the node. Please try again.");
        }
    };    
    
    // Handle Node Edit
    const handleEditNode = (nodeId) => {
        setEditingNodes((prev) => ({
          ...prev,
          [nodeId]: true,
        }));
      };      

    // Handle Node Connections
    const onConnect = useCallback(
        async (params) => {
            if (isEditMode) {
                // Add this data transformation
                const sourceNode = nodes.find(node => node.id === params.source);
                const targetNode = nodes.find(node => node.id === params.target);
                
                if (!sourceNode || !targetNode) {
                    console.error("Source or target node not found");
                    return;
                }
                
                const newEdge = {
                    source: {
                        id: parseInt(params.source)
                    },
                    target: {
                        id: parseInt(params.target)
                    },
                    sourceHandle: params.sourceHandle || "right",
                    targetHandle: params.targetHandle || "left",
                    animated: true,
                };

                try {
                    const createdEdge = await createEdge(id, newEdge);
                    setEdges((eds) => [...eds, { 
                        ...params,
                        id: createdEdge.id.toString(),
                        animated: true
                    }]);
                } catch (error) {
                    console.error("Error creating edge:", error);
                    alert("Failed to create connection between nodes");
                }
            }
        },
        [id, isEditMode, nodes, setEdges]
    ); 
    
    const onEdgeClick = async (event, edge) => {
        event.stopPropagation();
        if (isEditMode) {
            try {
                await deleteEdge(id, edge.id);
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
            } catch (error) {
                console.error("Error deleting edge:", error);
            }
        }
    };   

    const calculateNodePositions = (nodes, edges) => {
        const nodePositions = {};
        const nodeDependencies = {};
    
        // Initialize node dependencies
        nodes.forEach(node => {
            nodeDependencies[node.id] = {
                incoming: [],
                outgoing: []
            };
        });
    
        // Populate node dependencies based on edges
        edges.forEach(edge => {
            const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
            const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
            
            // Check if the IDs exist in nodeDependencies before adding
            if (nodeDependencies[sourceId]) {
                nodeDependencies[sourceId].outgoing.push(targetId);
            }
            
            if (nodeDependencies[targetId]) {
                nodeDependencies[targetId].incoming.push(sourceId);
            }
        });
    
        // Find the starting nodes (nodes with no incoming edges)
        const startingNodes = nodes.filter(node => 
            nodeDependencies[node.id] && nodeDependencies[node.id].incoming.length === 0
        );
    
        // Perform a breadth-first search to determine node positions
        const queue = [...startingNodes];
        let position = 1;
    
        while (queue.length > 0) {
            const currentNode = queue.shift();
            if (!currentNode) continue;
            
            nodePositions[currentNode.id] = position++;
    
            // Check if the node and its dependencies exist before processing
            if (nodeDependencies[currentNode.id]) {
                nodeDependencies[currentNode.id].outgoing.forEach(targetNodeId => {
                    const targetNode = nodes.find(node => String(node.id) === String(targetNodeId));
                    if (targetNode) {
                        queue.push(targetNode);
                    }
                });
            }
        }
    
        return nodePositions;
    };

    // Save Supply Chain
    const handleSaveSupplyChain = async () => {
        if (hasNodesWithoutEdges()) {
            alert("All nodes must be connected with edges before saving.");
            return;
        }

        // Show loading overlay
        setIsSaving(true);

        try {
            // Fetch the latest nodes from the backend
            const latestNodes = await getNodes(id);

            // Map nodes directly from the fetched data
            const formattedNodes = latestNodes.map(node => ({
                id: parseInt(node.id),
                name: node.name,
                role: node.role,
                x: node.x,
                y: node.y,
                status: node.status,
                assignedUserId: node.assignedUserId ? parseInt(node.assignedUserId) : null // Ensure assignedUserId is set correctly
            }));

            // Format edges
            const formattedEdges = edges.map(edge => ({
                id: parseInt(edge.id),
                source: {
                    id: parseInt(edge.source)
                },
                target: {
                    id: parseInt(edge.target)
                },
                animated: edge.animated || true,
                strokeColor: edge.style?.stroke || "#778DA9",
                strokeWidth: edge.style?.strokeWidth || 2
            }));

            // Create the update payload
            const updatedSupplyChain = {
                id: supplyChain.id,
                name: supplyChain.name,
                description: supplyChain.description,
                nodes: formattedNodes,
                edges: formattedEdges
            };

            // Send the update to the backend
            await updateSupplyChain(id, updatedSupplyChain);
            
            // Show loading for at least 500ms
            setTimeout(() => {
                // Refresh the page
                window.location.reload();
            }, 500);
        } catch (error) {
            console.error("❌ Error updating supply chain:", error);
            setIsSaving(false);
            alert("Failed to save supply chain. Please try again.");
        }
    };

    if (loading) {
        return <p className="text-white text-center mt-10">Loading...</p>;
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "text-blue-500";
            case "processing":
                return "text-yellow-500";
            case "done":
                return "text-green-500";
            default:
                return "text-white";
        }
    };

    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 flex flex-col">
                <Navbar username="User" role="Role" toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                <div className="p-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-semibold">{supplyChain?.name || "Unnamed Supply Chain"}</h1>
                        <p className="text-gray-400">{supplyChain?.description || "No description available."}</p>
                    </div>

                    {/* Edit Mode Button */}
                    <button
                        onClick={() => isEditMode ? handleSaveSupplyChain() : setIsEditMode(true)}
                        className={`px-4 py-2 rounded transition ${
                            isEditMode ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                        } ${Object.values(editingNodes).some(isEditing => isEditing) || hasNodesWithoutEdges() ? "opacity-50 cursor-not-allowed" : ""}`} // Add faded effect and disable cursor when disabled
                        disabled={Object.values(editingNodes).some(isEditing => isEditing) || hasNodesWithoutEdges()} // Disable button when any node is being edited or if there are nodes without edges
                    >
                        {isEditMode ? "Save & Exit Edit Mode" : "Enter Edit Mode"}
                    </button>
                </div>

                <div className="flex h-full">
                    {/* Sidebar for Nodes */}
                    {isEditMode && (
                        <div className="w-1/5 bg-gray-800 p-4">
                            <h3 className="text-lg font-semibold text-white mb-3">Drag Nodes</h3>
                            {Object.keys(nodeTypes).map((key) => (
                                <div
                                    key={key}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, key)}
                                    className={`cursor-pointer p-3 mb-2 text-white bg-gray-700 rounded-lg text-center`}
                                >
                                    {key}
                                </div>
                            ))}
                            {/* Explanatory Text Box */}
                            <div className="mt-4 p-3 bg-gray-700 text-gray-400 rounded-lg italic">
                                <p className="text-sm">
                                    Drag and drop the nodes onto the canvas to create your supply chain. Connect the nodes by dragging from one node's handle to another node's handle.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* React Flow Canvas */}
                    <div
                        className="flex-1 bg-gray-900 rounded-lg border border-gray-700"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={onDrop}
                    >
                        <ReactFlow
                            nodes={nodes.map(node => ({
                                ...node,
                                type: "customNode",
                                draggable: !!editingNodes[node.id], // Only the node in edit mode is draggable
                                data: {
                                    ...node.data,
                                    isEditMode,
                                    users,
                                    roles, // Pass roles to nodes
                                    onDelete: (nodeId, event) => handleDeleteNode(nodeId, event),
                                    onEdit: handleEditNode,
                                    updateNodeData: (nodeId, updatedData) => {
                                        setNodes((prevNodes) =>
                                            prevNodes.map((n) =>
                                                n.id === nodeId ? { ...n, data: { ...n.data, ...updatedData } } : n
                                            )
                                        );
                                    },
                                    onSaveNode: (nodeId) => handleSaveNode(nodeId),
                                    onEditStateChange: (nodeId, isEditing) => {
                                        setEditingNodes((prev) => ({
                                            ...prev,
                                            [nodeId]: isEditing,
                                        }));
                                    },
                                    getStatusColor,
                                    role: node.data.role || "Unassigned",
                                    assignedUser: node.data.assignedUser || "Unassigned",
                                    assignedUsername: node.data.assignedUsername || "Unassigned",
                                }
                            }))}
                            edges={edges.filter(edge => 
                                nodes.find(node => node.id === edge.source) &&
                                nodes.find(node => node.id === edge.target)
                            ).map(edge => ({
                                ...edge,
                                animated: isEditMode,
                                deletable: isEditMode,
                                selectable: isEditMode,
                                style: {
                                    stroke: "#778DA9",
                                    strokeWidth: 2,
                                    opacity: 1,
                                }
                            }))}                                                                                                                                           
                            onNodesChange={isEditMode ? onNodesChange : undefined}
                            onEdgesChange={isEditMode ? onEdgesChange : undefined}
                            onConnect={isEditMode ? onConnect : undefined}
                            onEdgeClick={isEditMode ? onEdgeClick : undefined}
                            onNodeClick={isEditMode ? onNodeClick : undefined}
                            nodeTypes={nodeTypes}
                            nodesDraggable={false} // Disable global dragging
                            onNodeDragStop={onNodeDragStop}
                            defaultViewport={config.APP.DEFAULT_VIEWPORT} // Use config setting
                        >
                            <MiniMap />
                            <Controls />
                            <Background />
                        </ReactFlow>

                    </div>
                </div>
            </div>
            {isSaving && <LoadingOverlay message="Saving supply chain..." />}
        </div>
    );
};

export default SupplyChain;