import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { updateNode } from "../services/supplyChainApi";

// Define the getRandomColor function
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const CustomNode = ({ data }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState({
        name: data.name || "",
        role: data.role || "",
        assignedUser: data.assignedUser || "",
        assignedUsername: data.assignedUsername || "",
        status: data.status || "pending",
    });
    const [validationErrors, setValidationErrors] = useState({});
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [circleColor] = useState(getRandomColor()); // Generate random color once

    const currentUserId = localStorage.getItem('userId');

    useEffect(() => {
        // Sync local state when data changes (e.g., on save from parent)
        setLocalData({
            name: data.name || "",
            role: data.role || "",
            assignedUser: data.assignedUser || "",
            assignedUsername: data.assignedUsername || "",
            status: data.status || "pending",
        });
    }, [data.name, data.role, data.assignedUser, data.assignedUsername, data.status]);

    // This useEffect will run when the component mounts and when localData.role or data.users changes
    useEffect(() => {
        // Show all users if role is unassigned or placeholder
        if (!localData.role || localData.role === "Unassigned" || localData.role === "Select Role") {
            setFilteredUsers(data.users || []);
        } else {
            // Filter users based on the selected role
            setFilteredUsers((data.users || []).filter(user => user.role === localData.role));
        }
    }, [localData.role, data.users]);      

    const validateFields = () => {
        const errors = {};
        if (!localData.name) errors.name = 'Name is required.';
        if (!localData.role) errors.role = 'Role is required.';
        if (!localData.assignedUser) errors.assignedUser = 'Assigned user is required.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Update local state instead of parent state
    const handleInputChange = (field, value) => {
        setLocalData((prev) => ({ ...prev, [field]: value }));

        if (field === "role") {
            const filteredUsers = (data.users || []).filter(user => user.role === value);
            setFilteredUsers(filteredUsers);
            if (filteredUsers.length === 1) {
                setLocalData((prev) => ({
                    ...prev,
                    assignedUser: filteredUsers[0].id,
                    assignedUsername: filteredUsers[0].username,
                }));
            } else {
                setLocalData((prev) => ({
                    ...prev,
                    assignedUser: "",
                    assignedUsername: "",
                }));
            }
        }
    };

    const handleUserChange = (e) => {
        const selectedUsername = e.target.value;
        const selectedUser = (data.users || []).find(user => user.username === selectedUsername);
    
        if (selectedUser) {
            setLocalData((prev) => ({
                ...prev,
                assignedUser: selectedUser.id,
                assignedUsername: selectedUser.username,
                role: selectedUser.role, // Auto-update role
            }));
    
            // ✅ Update the parent state immediately to trigger the highlight
            data.updateNodeData(data.id, {
                assignedUser: selectedUser.id,
                assignedUsername: selectedUser.username,
                role: selectedUser.role,
            });
        }
    };    

    const handleSaveClick = async (e) => {
        e.stopPropagation();
        if (!validateFields()) {
            alert("All fields must be filled.");
            return;
        }
    
        try {
            // Format the data for the backend
            const nodeDataForBackend = {
                name: localData.name,
                role: localData.role,
                x: data.x,
                y: data.y,
                status: localData.status,
                // Format assignedUser based on backend expectations
                assignedUser: localData.assignedUser ? { id: parseInt(localData.assignedUser) } : null
            };
    
            // Send update node request to backend
            const updatedNode = await updateNode(data.supplyChainId, data.id, nodeDataForBackend);
    
            // Update parent state with response data
            data.updateNodeData(data.id, {
                ...updatedNode,
                // Response contains assignedUserId, not assignedUser object
                assignedUser: updatedNode.assignedUserId || null
            });
    
            setIsEditing(false);
            data.onEditStateChange(data.id, false);
            setValidationErrors({});
        } catch (error) {
            console.error("Error updating node:", error);
            alert("Failed to update node. Please try again.");
        }
    };

    const isAssignedToCurrentUser = localData.assignedUser === Number(currentUserId);

    const borderStyle = isAssignedToCurrentUser
        ? {
            border: '2px solid #00FF00',
            boxShadow: '0 0 10px 2px rgba(0, 255, 0, 0.7)',
        }
        : {
            border: '2px solid #415A77',
        };

    const statusColor = {
        pending: 'bg-blue-500',
        processing: 'bg-yellow-500',
        done: 'bg-green-500',
    }[localData.status] || 'bg-gray-500';

    const toSentenceCase = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Ensure edges exist and are in an array format
    const edges = Array.isArray(data.edges) ? data.edges : [];

    // Check if the node has at least one incoming edge (it is a target node)
    const isTargetNode = edges.some(edge => {
        const edgeTarget = typeof edge.target === 'object' ? edge.target.id : edge.target;
        return edgeTarget === String(data.id) || edgeTarget === data.id;
    });

    // Check if the node has at least one outgoing edge (it connects to another node)
    const hasOutgoingEdges = edges.some(edge => {
        const edgeSource = typeof edge.source === 'object' ? edge.source.id : edge.source;
        return edgeSource === String(data.id) || edgeSource === data.id;
    });

    // Check if this is the first node (has no incoming edges)
    const isFirstNode = !isTargetNode;

    // Allow status change if:
    // - The node is the first node AND has at least one outgoing edge
    // - OR the node has an incoming edge (is a target) AND the previous node's status is "done"
    const canChangeStatus = (isFirstNode && hasOutgoingEdges) || (isTargetNode && data.previousNodeStatus === "done");

    return (
        <div
            className={`custom-node ${statusColor} rounded-lg shadow-md relative w-[200px] ${isEditing ? 'expanded' : ''}`}
            style={borderStyle}
        >
            <Handle id="left" type="target" position={Position.Left} className={`!bg-[#778DA9] ${data.isEditMode ? "opacity-100" : "opacity-0"}`} />
            <Handle id="right" type="source" position={Position.Right} className={`!bg-[#778DA9] ${data.isEditMode ? "opacity-100" : "opacity-0"}`} />

            <div className="bg-[#415A77] text-white font-bold p-2 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center">
                    {/* Circle with Position Number */}
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                        style={{ backgroundColor: circleColor }}
                    >
                        <span className="text-xs text-[#415A77] font-bold">{data.position}</span>
                    </div>
                    <span>{localData.name || "Unnamed Node"}</span>
                </div>
                {data.isEditMode && (
                    <button
                        className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-md flex items-center justify-center shadow-md transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onDelete(String(data.id), e);
                        }}
                    >
                        ✖
                    </button>
                )}
            </div>

            <div className="p-2 text-left bg-[#1B263B] text-gray-300 text-sm rounded-b-lg">
                {isEditing && (
                    <div className="py-1 border-b border-[#415A77]">
                        <strong>Name: </strong>
                        <input
                            type="text"
                            value={localData.name}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full p-1 mt-1 bg-[#0D1B2A] text-white border border-[#415A77] rounded"
                        />
                        {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
                    </div>
                )}

                <div className="py-1 border-b border-[#415A77]">
                    <strong>Role: </strong>
                    {isEditing ? (
                        <select
                            value={localData.role || ""}
                            onChange={(e) => handleInputChange("role", e.target.value)}
                            className="w-full p-1 mt-1 bg-[#0D1B2A] text-white border border-[#415A77] rounded"
                        >
                            <option value="">Select Role</option>
                            {(data.roles || []).map((role) => (
                                <option key={role} value={role}>{toSentenceCase(role)}</option>
                            ))}
                        </select>
                    ) : (
                        <span>{toSentenceCase(localData.role)}</span>
                    )}
                </div>

                <div className="py-1 border-b border-[#415A77]">
                    <strong>User: </strong>
                    {isEditing ? (
                        <select
                            value={localData.assignedUsername || ""}
                            onChange={handleUserChange}
                            className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                        >
                            <option value="">Select User</option>
                            {filteredUsers.map((user) => (
                                <option key={user.id} value={user.username}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <span>{localData.assignedUsername}</span>
                    )}
                </div>

                <div className="py-1">
                    <strong>Status: </strong>
                    {isEditing ? (
                        <select
                            value={localData.status || "pending"}
                            onChange={(e) => handleInputChange("status", e.target.value)}
                            className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                            disabled={!canChangeStatus || (localData.status === "done")}
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="done">Done</option>
                        </select>        
                    ) : (
                        <span className={data.getStatusColor(localData.status)}>{toSentenceCase(localData.status)}</span>
                    )}
                </div>
            </div>

            {data.isEditMode && (
                <button
                    className={`w-full py-2 font-semibold rounded-b-lg flex items-center justify-center shadow-md transition ${Object.keys(validationErrors).length > 0 ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                    onClick={(e) => {
                        if (isEditing) {
                            handleSaveClick(e);
                        } else {
                            e.stopPropagation();
                            setIsEditing(true);
                            data.onEditStateChange(data.id, true);
                        }
                    }}
                >
                    {isEditing ? "Save" : "Edit"}
                </button>
            )}
        </div>
    );
};

export default CustomNode;