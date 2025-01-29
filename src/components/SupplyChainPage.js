import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getSupplyChainById, updateSupplyChain } from "../services/supplyChainApi";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from "reactflow";
import "reactflow/dist/style.css";
import Navbar from "./NavBar";
import Sidebar from "./Sidebar";


const nodeTypes = [
    { id: "supply", label: "Supply", color: "bg-blue-500" },
    { id: "delivery", label: "Delivery", color: "bg-green-500" },
    { id: "manufacturing", label: "Manufacturing", color: "bg-yellow-500" },
    { id: "customer", label: "Customer", color: "bg-red-500" },
];

const roles = ["Supplier", "Manufacturer", "Distributor", "Customer"];
const users = ["John Doe", "Jane Smith", "Mike Johnson", "Emily Davis"];

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
                        id: `${index + 1}`,
                        type: "default",
                        position: { 
                            x: node.x ?? 100, 
                            y: node.y ?? 100 
                        },
                        data: { 
                            label: node.type || "Unnamed", 
                            name: node.name || "Unnamed Node", 
                            role: node.role || "Unassigned", 
                            assignedUser: node.assignedUser || "Unassigned" 
                        }
                    })));
                }
    
                if (data.edges) {
                    setEdges(data.edges.map((edge) => ({
                        ...edge,
                        animated: edge.animated ?? true,
                        style: { stroke: edge.strokeColor || "#778DA9", strokeWidth: edge.strokeWidth ?? 2 }
                    })));
                }
            } catch (err) {
                console.error("Error fetching supply chain:", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchSupplyChain();
    }, [id]);    

    // Handle Node Drop
    const onDrop = (event) => {
        event.preventDefault();
        const nodeType = event.dataTransfer.getData("nodeType");

        if (!nodeType) return;

        const position = { x: event.clientX - 250, y: event.clientY - 100 };
        const newNode = {
            id: `${nodes.length + 1}`,
            type: "default",
            position,
            data: { label: nodeType, name: "", role: "", assignedUser: "" },
        };

        setNodes((nds) => [...nds, newNode]);
    };

    // Allow Dragging from Sidebar
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData("nodeType", nodeType);
    };

    // Handle Node Click (Open Modal)
    const onNodeClick = (event, node) => {
        setSelectedNode(node);
        setIsModalOpen(true);
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

    // Handle Node Connections
    const onConnect = useCallback(
        (params) => {
            setEdges((prevEdges) => {
                const existingConnection = prevEdges.find((edge) => edge.source === params.source);
                if (existingConnection) return prevEdges; // Prevent multiple outgoing connections

                return addEdge(
                    { ...params, animated: true, style: { stroke: "#778DA9", strokeWidth: 2 } },
                    prevEdges
                );
            });
        },
        [setEdges]
    );

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
                    source: edge.source,
                    target: edge.target,
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
                            {nodeTypes.map((node) => (
                                <div
                                    key={node.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, node.label)}
                                    className={`cursor-pointer p-3 mb-2 text-white ${node.color} rounded-lg text-center`}
                                >
                                    {node.label}
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
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onNodeClick={onNodeClick}
                            fitView
                        >
                            <MiniMap />
                            <Controls />
                            <Background />
                        </ReactFlow>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplyChainPage;
