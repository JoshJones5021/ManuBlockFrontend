import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getSupplyChainById, updateSupplyChain } from "../services/supplyChainApi";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";
import CustomNode from "./CustomNode"; // Import the custom node component

const nodeTypes = {
    customNode: CustomNode, // Ensure CustomNode is used directly
};

const SupplyChainPage = () => {
    const { id } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [supplyChain, setSupplyChain] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);

    // Fetch supply chain data
    useEffect(() => {
        const fetchSupplyChain = async () => {
            try {
                const data = await getSupplyChainById(id);
                setSupplyChain(data);
        
                if (data.nodes) {
                    setNodes(data.nodes.map((node, index) => ({
                        id: `${index + 1}`, // ✅ Ensure ID consistency
                        type: "customNode",
                        position: { x: node.x ?? 100, y: node.y ?? 100 },
                        data: {
                            id: `${index + 1}`,
                            label: node.type || "Unnamed",
                            name: node.name || "Unnamed Node",
                            role: node.role || "Unassigned",
                            assignedUser: node.assignedUser || "Unassigned",
                            isEditMode,
                            onDelete: handleDeleteNode,
                            onEdit: handleEditNode,
                        }
                    })));
                }
        
                if (data.edges) {
                    setEdges(data.edges.map((edge) => ({
                        id: `${edge.id}`, // ✅ Ensure ID is a string
                        source: `${edge.source}`, // ✅ Ensure consistency with node IDs
                        target: `${edge.target}`,
                        sourceHandle: edge.sourceHandle || "right", // ✅ Assign default source handle
                        targetHandle: edge.targetHandle || "left",  // ✅ Assign default target handle
                        animated: edge.animated ?? true,
                        style: { stroke: edge.strokeColor || "#778DA9", strokeWidth: edge.strokeWidth ?? 2 }
                    })));
                }
            } catch (err) {
                console.error("❌ Error fetching supply chain:", err);
            } finally {
                setLoading(false);
            }
        };        
        fetchSupplyChain();
    }, [id, isEditMode]);

    // Handle Node Drop
    const onDrop = (event) => {
        event.preventDefault();
        const nodeType = event.dataTransfer.getData("nodeType");

        if (!nodeType) return;

        const position = { x: event.clientX - 250, y: event.clientY - 100 };
        const newNode = {
            id: `${nodes.length + 1}`,
            type: "customNode",
            position,
            data: { id: `${nodes.length + 1}`, label: nodeType, name: "", role: "", assignedUser: "", isEditMode, onDelete: handleDeleteNode, onEdit: handleEditNode },
        };

        setNodes((nds) => [...nds, newNode]);
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
    const handleSaveNode = () => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === selectedNode.id ? { ...node, data: selectedNode.data } : node
            )
        );
        setIsModalOpen(false);
    };

    // Handle Node Deletion
    const handleDeleteNode = (nodeId, event) => {
        event.stopPropagation(); // ✅ Prevent modal from opening
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    };    

    // Handle Node Edit
    const handleEditNode = (nodeId) => {
        const nodeToEdit = nodes.find(node => node.id === nodeId);
        setSelectedNode(nodeToEdit);
        setIsModalOpen(true);
    };

    // Handle Node Connections
    const onConnect = useCallback(
        (params) => {
            console.log("🔗 Connecting nodes:", params);
            if (isEditMode) {
                setEdges((prevEdges) => addEdge(
                    {
                        ...params,
                        sourceHandle: params.sourceHandle || "right", // Ensure the source handle is used
                        targetHandle: params.targetHandle || "left",  // Ensure the target handle is used
                        animated: true,
                        style: { stroke: "#778DA9", strokeWidth: 2 },
                    },
                    prevEdges
                ));
            }
        },
        [setEdges, isEditMode]
    );      
    
    const onEdgeClick = (event, edge) => {
        event.stopPropagation();
        if (isEditMode) {
            setEdges(prevEdges => prevEdges.filter(e => e.id !== edge.id));
        }
    };     

    // Save Supply Chain
    const handleSaveSupplyChain = async () => {
        try {
            const updatedSupplyChain = {
                ...supplyChain,
                nodes: nodes.map(node => ({
                    x: node.position.x || 100,
                    y: node.position.y || 100,
                    type: node.data.label || "Unnamed",
                    name: node.data.name || "Unnamed Node",
                    role: node.data.role || "Unassigned",
                    assignedUser: node.data.assignedUser || "Unassigned"
                })),
                edges: edges.map(edge => ({
                    id: edge.id, 
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle || "right", // ✅ Ensure correct handle
                    targetHandle: edge.targetHandle || "left", // ✅ Ensure correct handle
                    animated: edge.animated ?? true,
                    strokeColor: edge.style?.stroke || "#778DA9",
                    strokeWidth: edge.style?.strokeWidth ?? 2
                }))                
            };

            await updateSupplyChain(id, updatedSupplyChain);
            setIsEditMode(false);
            alert("Supply Chain saved successfully!");
        } catch (error) {
            console.error("Error saving supply chain:", error);
        }
    };

    if (loading) {
        return <p className="text-white text-center mt-10">Loading...</p>;
    }

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
                        }`}
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
                                    isEditMode, // ✅ Pass edit mode flag
                                    onDelete: (nodeId, event) => handleDeleteNode(nodeId, event),
                                    onEdit: handleEditNode,
                                }
                            }))}
                            edges={edges.map(edge => ({
                                ...edge,
                                animated: isEditMode, // ✅ Animates in edit mode
                                style: {
                                    stroke: "#778DA9",
                                    strokeWidth: 2,
                                    opacity: 1, // ✅ Ensure visibility
                                }
                            }))}                                                                                   
                            onNodesChange={isEditMode ? onNodesChange : undefined}
                            onEdgesChange={isEditMode ? onEdgesChange : undefined}
                            onConnect={isEditMode ? onConnect : undefined}
                            onEdgeClick={isEditMode ? onEdgeClick : undefined} // ✅ Allow edge deletion in edit mode
                            fitView
                            nodeTypes={nodeTypes}
                            nodesDraggable={isEditMode} // ✅ Disable node dragging outside of edit mode
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

export default SupplyChainPage;