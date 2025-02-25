import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
    getSupplyChainById,
    createNode,
    updateNode,
    deleteNode,
    createEdge,
    deleteEdge,
    updateSupplyChain
  } from "../services/supplyChainApi";  
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, useReactFlow } from "reactflow";
import "reactflow/dist/style.css";
import Navbar from "../components/navbar/NavBar";
import Sidebar from "../components/sidebar/Sidebar";
import CustomNode from '../nodes/CustomNode';

const nodeTypes = {
    customNode: CustomNode, // Ensure CustomNode is used directly
};

const SupplyChain = () => {
    const { id } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [supplyChain, setSupplyChain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingNodes, setEditingNodes] = useState({});
    const [validationError, setValidationError] = useState('');
    const [users, setUsers] = useState([]);  
    const [roles, setRoles] = useState([]);  

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
                setSupplyChain(data);
    
                // ✅ Fetch Users
                const usersResponse = await fetch("http://localhost:8080/api/users/", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
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
                const rolesResponse = await fetch("http://localhost:8080/api/users/roles", {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
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
                        }
                    }));
    
                    // Calculate node positions
                    const nodePositions = calculateNodePositions(initialNodes, data.edges);
    
                    // Update nodes with positions
                    const nodesWithPositions = initialNodes.map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            position: nodePositions[node.id]
                        }
                    }));
    
                    setNodes(nodesWithPositions);
    
                    // ✅ Manually set viewport to center based on nodes' positions
                    if (initialNodes.length > 0) {
                        const avgX = initialNodes.reduce((sum, node) => sum + node.position.x, 0) / initialNodes.length;
                        const avgY = initialNodes.reduce((sum, node) => sum + node.position.y, 0) / initialNodes.length;
                        setViewport({ x: avgX - 500, y: avgY - 300, zoom: 1 }); // Manually adjust view based on average position
                    }
                }
    
                // ✅ Set Edges
                if (data.edges) {
                    setEdges(data.edges.map((edge) => ({
                        id: `${edge.id}`,
                        source: `${edge.source}`,
                        target: `${edge.target}`,
                        sourceHandle: edge.sourceHandle || "right",
                        targetHandle: edge.targetHandle || "left",
                        animated: edge.animated ?? true,
                        style: { stroke: edge.strokeColor || "#778DA9", strokeWidth: edge.strokeWidth ?? 2 }
                    })));
                }
    
            } catch (err) {
                console.error("❌ Error fetching supply chain or users/roles:", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchSupplyChainAndUsers();
    }, [id]);

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
    
        const newNode = {
            id: null, // Set id to null for the POST request
            type: "customNode",
            position,
            data: {
                name: "Unnamed Node",
                role: "",
                assignedUser: "",
                assignedUsername: "",
                status: "pending",
                supplyChainId: id, // Include supplyChainId
                x: position.x, // Include x position
                y: position.y, // Include y position
                isEditMode,
                users, // Pass users to the new node
                roles, // Pass roles to the new node
                onDelete: handleDeleteNode,
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
            },
        };
    
        // Send node creation request to backend
        try {
            const createdNode = await createNode(id, {
                name: newNode.data.name,
                role: newNode.data.role,
                assignedUser: newNode.data.assignedUser,
                supplyChainId: newNode.data.supplyChainId,
                x: newNode.position.x,
                y: newNode.position.y,
                status: newNode.data.status,
            });
            newNode.id = createdNode.id; // Assign backend-generated ID
            newNode.data.id = createdNode.id; // Assign backend-generated ID to data
            setNodes((nds) => [
                ...nds,
                {
                    ...newNode,
                    id: createdNode.id.toString(), // Ensure the ID is a string
                    position: { x: createdNode.x, y: createdNode.y }, // Use the position from the backend
                    data: {
                        ...newNode.data,
                        id: createdNode.id,
                        x: createdNode.x,
                        y: createdNode.y,
                    },
                },
            ]);
        } catch (error) {
            console.error("Error creating node:", error);
        }
    };

    // Allow Dragging from Sidebar
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData("nodeType", nodeType);
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

            // Save changes to the backend
            await updateNode(nodeToSave.data.supplyChainId, backendNodeId, {
                name: nodeToSave.data.name,
                role: nodeToSave.data.role,
                assignedUser: nodeToSave.data.assignedUser,
                status: nodeToSave.data.status,
                x: nodeToSave.position.x,
                y: nodeToSave.position.y,
            });

            // Update local state
            setNodes((prevNodes) =>
                prevNodes.map((node) =>
                    node.id === nodeId ? { ...node, data: { ...nodeToSave.data } } : node
                )
            );

            setEditingNodes((prev) => ({
                ...prev,
                [nodeId]: false,
            }));

            setValidationError("");
        } catch (error) {
            console.error("Error saving node:", error);
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
                const newEdge = {
                    source: params.source,
                    target: params.target,
                    sourceHandle: params.sourceHandle || "right",
                    targetHandle: params.targetHandle || "left",
                    animated: true,
                };

                try {
                    const createdEdge = await createEdge(id, newEdge);
                    setEdges((eds) => [...eds, { ...newEdge, id: createdEdge.id }]);
                } catch (error) {
                    console.error("Error creating edge:", error);
                }
            }
        },
        [id, isEditMode, setEdges]
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
            nodeDependencies[edge.source].outgoing.push(edge.target);
            nodeDependencies[edge.target].incoming.push(edge.source);
        });
    
        // Find the starting nodes (nodes with no incoming edges)
        const startingNodes = nodes.filter(node => nodeDependencies[node.id].incoming.length === 0);
    
        // Perform a breadth-first search to determine node positions
        const queue = [...startingNodes];
        let position = 1;
    
        while (queue.length > 0) {
            const currentNode = queue.shift();
            nodePositions[currentNode.id] = position++;
    
            nodeDependencies[currentNode.id].outgoing.forEach(targetNodeId => {
                queue.push(nodes.find(node => node.id === targetNodeId));
            });
        }
    
        return nodePositions;
    };

    // Save Supply Chain
    const handleSaveSupplyChain = async () => {
        try {
            // 🔄 Fetch the latest nodes from the backend before saving
            const latestNodesResponse = await fetch(`http://localhost:8080/api/supply-chains/${id}/nodes`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });
    
            const latestNodes = await latestNodesResponse.json();
    
            // 🔄 Fetch the latest edges from the backend (optional, but keeps consistency)
            const latestEdgesResponse = await fetch(`http://localhost:8080/api/supply-chains/${id}/edges`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json"
                }
            });
    
            const latestEdges = await latestEdgesResponse.json();
    
            // Update the entire supply chain with the latest node & edge data
            const updatedSupplyChain = {
                id: supplyChain.id,
                name: supplyChain.name,
                description: supplyChain.description,
                updatedAt: new Date().toISOString(),
                nodes: latestNodes.map((node) => ({
                    id: node.id,
                    name: node.name,
                    role: node.role,
                    assignedUser: node.assignedUser,
                    status: node.status,
                    x: node.x,
                    y: node.y,
                })),
                edges: latestEdges.map((edge) => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle,
                    targetHandle: edge.targetHandle,
                    animated: edge.animated,
                })),
            };
    
            // ✅ Send the updated supply chain to the backend
            const response = await updateSupplyChain(id, updatedSupplyChain);
    
            // Update the state to reflect the saved changes
            setSupplyChain((prev) => ({
                ...prev,
                updatedAt: response.updatedAt
            }));
    
            setIsEditMode(false);
            alert("✅ Supply chain updated successfully!");
        } catch (error) {
            console.error("❌ Error updating supply chain:", error);
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
                        } ${Object.values(editingNodes).some(isEditing => isEditing) ? "opacity-50 cursor-not-allowed" : ""}`} // Add faded effect and disable cursor when disabled
                        disabled={Object.values(editingNodes).some(isEditing => isEditing)} // Disable button when any node is being edited
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
                            nodeTypes={nodeTypes}
                            nodesDraggable={isEditMode}
                            fitViewOnInit={false}  // 🔥 Prevent auto-fit on load
                            defaultViewport={{ x: 0, y: 0, zoom: 1 }} // Set your initial viewport settings
                        >
                            <MiniMap />
                            <Controls />
                            <Background />
                        </ReactFlow>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                >
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-96">
                        <h2 className="text-xl font-semibold mb-4 text-[#E0E1DD]">Edit Node</h2>
                        <input
                            type="text"
                            placeholder="Node Name"
                            value={selectedNode?.data?.name || ''}
                            onChange={(e) => setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, name: e.target.value } })}
                            className="w-full p-2 mb-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                        />
                        <input
                            type="text"
                            placeholder="Role"
                            value={selectedNode?.data?.role || ''}
                            onChange={(e) => setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, role: e.target.value } })}
                            className="w-full p-2 mb-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                        />
                        <input
                            type="text"
                            placeholder="Assigned User"
                            value={selectedNode?.data?.assignedUser || ''}
                            onChange={(e) => setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, assignedUser: e.target.value } })}
                            className="w-full p-2 mb-4 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                        />
                        <select
                            value={selectedNode?.data?.status || "pending"}
                            onChange={(e) => setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, status: e.target.value } })}
                            className="w-full p-2 mb-4 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="done">Done</option>
                        </select>
                        <span className={getStatusColor(selectedNode?.data?.status)}>
                            {selectedNode?.data?.status}
                        </span>
                        <button
                            onClick={handleSaveNode}
                            className="bg-green-500 px-4 py-2 rounded text-white mr-2"
                        >
                            Save
                        </button>
                        <button onClick={() => setIsModalOpen(false)} className="bg-red-500 px-4 py-2 rounded text-white">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplyChain;