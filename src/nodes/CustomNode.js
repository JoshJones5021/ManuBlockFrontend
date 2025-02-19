import React, { useState } from "react";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data }) => {
    const [isEditing, setIsEditing] = useState(false); // Local edit state
    const [validationErrors, setValidationErrors] = useState({}); // Validation error state

    const currentUserId = localStorage.getItem('userId'); // Get the current logged-in user's ID

    const validateFields = () => {
        const errors = {};
        if (!data.name) errors.name = 'Name is required.';
        if (!data.role) errors.role = 'Role is required.';
        if (!data.assignedUser) errors.assignedUser = 'Assigned user is required.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Function to handle user selection
    const handleUserChange = (e) => {
        const selectedUsername = e.target.value;
        const selectedUser = data.users.find(user => user.username === selectedUsername);
    
        if (selectedUser) {
            data.updateNodeData(data.id, "assignedUser", selectedUser.id); // Store user ID
            data.updateNodeData(data.id, "assignedUsername", selectedUser.username); // Store username for display
            data.updateNodeData(data.id, "role", selectedUser.role); // Auto-update role
        }
        validateFields(); // Validate fields after user change
    };

    // Function to handle role selection
    const handleRoleChange = (e) => {
        const selectedRole = e.target.value;
        data.updateNodeData(data.id, "role", selectedRole);

        // Reset user selection if their role doesn't match
        if (data.assignedUser) {
            const selectedUser = data.users.find(user => user.username === data.assignedUsername);
            if (!selectedUser || selectedUser.role !== selectedRole) {
                data.updateNodeData(data.id, "assignedUser", ""); // Clear user selection
                data.updateNodeData(data.id, "assignedUsername", ""); // Clear username display
            }
        }
        validateFields(); // Validate fields after role change
    };

    // Function to handle name change
    const handleNameChange = (e) => {
        data.updateNodeData(data.id, "name", e.target.value);
        validateFields(); // Validate fields after name change
    };

    // Filter users based on selected role
    const filteredUsers = data.role
        ? data.users.filter(user => user.role === data.role) // Show only users matching the role
        : data.users; // Show all users if no role is selected

    // Function to handle save button click
    const handleSaveClick = (e) => {
        e.stopPropagation();
        if (!validateFields()) {
            return;
        }
        setIsEditing(false);
        data.onEditStateChange(data.id, false); // Notify parent component
        setValidationErrors({}); // Clear validation errors
    };

    // Determine if the node is assigned to the current logged-in user
    const isAssignedToCurrentUser = data.assignedUser === Number(currentUserId);

    // Define the glowing border style
    const borderStyle = isAssignedToCurrentUser
        ? {
            border: '2px solid #00FF00',
            boxShadow: '0 0 10px 2px rgba(0, 255, 0, 0.7)',
        }
        : {
            border: '2px solid #415A77',
        };

    return (
        <div
            className="custom-node bg-[#1B263B] rounded-lg shadow-md relative w-[200px]"
            style={borderStyle}
        >
            {/* Always render handles but hide them outside edit mode */}
            <Handle
                id="left"
                type="target"
                position={Position.Left}
                className={`!bg-[#778DA9] ${data.isEditMode ? "opacity-100" : "opacity-0"}`}
            />
            <Handle
                id="right"
                type="source"
                position={Position.Right}
                className={`!bg-[#778DA9] ${data.isEditMode ? "opacity-100" : "opacity-0"}`}
            />

            {/* Header with Delete Button */}
            <div className="bg-[#415A77] text-white font-bold p-2 flex justify-between items-center rounded-t-lg">
                <span>{data.label}</span>
                {data.isEditMode && (
                    <button
                        className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-md flex items-center justify-center shadow-md transition"
                        onClick={(e) => {
                            data.onDelete(data.id, e);
                        }}
                    >
                        ✖
                    </button>
                )}
            </div>

            {/* Node Content */}
            <div className="p-2 text-left bg-[#1B263B] text-gray-300 text-sm rounded-b-lg">
                <div className="py-1 border-b border-[#415A77]">
                    <strong>Name:</strong> {isEditing ? (
                        <>
                            <input
                                type="text"
                                value={data.name}
                                onChange={handleNameChange}
                                className="w-full p-1 mt-1 bg-[#0D1B2A] text-white border border-[#415A77] rounded"
                            />
                            {validationErrors.name && <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>}
                        </>
                    ) : (
                        <span>{data.name}</span>
                    )}
                </div>

                {/* Role Dropdown */}
                <div className="py-1 border-b border-[#415A77]">
                    <strong>Role: </strong>
                    {isEditing ? (
                        <>
                            <select
                                value={data.role || ""}
                                onChange={handleRoleChange}
                                className="w-full p-1 mt-1 bg-[#0D1B2A] text-white border border-[#415A77] rounded"
                            >
                                <option value="">Select Role</option>
                                {data.roles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                            {validationErrors.role && <p className="text-red-500 text-xs mt-1">{validationErrors.role}</p>}
                        </>
                    ) : (
                        <span>{data.role}</span>
                    )}
                </div>

                {/* User Dropdown */}
                <div className="py-1">
                    <strong>User: </strong>
                    {isEditing ? (
                        <>
                            <select
                                value={data.assignedUsername || ""}
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
                            {validationErrors.assignedUser && <p className="text-red-500 text-xs mt-1">{validationErrors.assignedUser}</p>}
                        </>
                    ) : (
                        <span>{data.assignedUsername}</span>
                    )}
                </div>
            </div>

            {/* Footer - Full-width Edit Button */}
            {data.isEditMode && (
                <button
                    className={`w-full py-2 font-semibold rounded-b-lg flex items-center justify-center shadow-md transition ${
                        Object.keys(validationErrors).length > 0 ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                    onClick={(e) => {
                        if (isEditing) {
                            handleSaveClick(e);
                        } else {
                            e.stopPropagation();
                            setIsEditing(true); // Toggle edit mode per node
                            data.onEditStateChange(data.id, true); // Notify parent component
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