import React from "react";
import { Handle, Position } from "reactflow";

const CustomNode = ({ data }) => {
    return (
        <div className="custom-node bg-[#1B263B] rounded-lg shadow-md border border-[#415A77] relative w-[200px]">
            {/* ✅ Only show connection handles in edit mode */}
            {data.isEditMode && (
                <>
                    <Handle id="left" type="target" position={Position.Left} className="!bg-[#778DA9]" />
                    <Handle id="right" type="source" position={Position.Right} className="!bg-[#778DA9]" />
                </>
            )}

            {/* Header with Delete Button */}
            <div className="bg-[#415A77] text-white font-bold p-2 flex justify-between items-center rounded-t-lg">
                <span>{data.label}</span>
                {data.isEditMode && (
                    <button
                        className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-md flex items-center justify-center shadow-md transition"
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onDelete(data.id);
                        }}
                    >
                        ✖
                    </button>
                )}
            </div>

            {/* Node Content - Table-like Structure */}
            <div className="p-2 text-left bg-[#1B263B] text-gray-300 text-sm">
                <div className="py-1 border-b border-[#415A77]"><strong>Name:</strong> {data.name}</div>
                <div className="py-1 border-b border-[#415A77]"><strong>Role:</strong> {data.role}</div>
                <div className="py-1"><strong>User:</strong> {data.assignedUser}</div>
            </div>

            {/* Footer - Full-width Edit Button */}
            {data.isEditMode && (
                <button
                    className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-b-lg flex items-center justify-center shadow-md transition"
                    onClick={(e) => {
                        e.stopPropagation();
                        data.onEdit(data.id);
                    }}
                >
                    Edit
                </button>
            )}
        </div>
    );
};

export default CustomNode;
