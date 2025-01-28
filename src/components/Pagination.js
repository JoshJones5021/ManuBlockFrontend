import React from 'react';

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange, isSidebarOpen }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
        <div
            className={`fixed bottom-0 ${isSidebarOpen ? 'left-64' : 'left-20'} right-0 bg-[#1B263B] p-4 flex justify-center items-center shadow-md border-t border-[#415A77] transition-all duration-300`}
        >
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#415A77] text-[#E0E1DD] rounded-lg disabled:opacity-50"
                >
                    &lt;
                </button>

                {/* Page Dropdown */}
                <select
                    value={currentPage}
                    onChange={(e) => onPageChange(Number(e.target.value))}
                    className="px-4 py-2 border border-[#415A77] rounded-lg bg-[#1B263B] text-[#E0E1DD] focus:outline-none"
                >
                    {Array.from({ length: totalPages }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Page {i + 1}
                        </option>
                    ))}
                </select>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#415A77] text-[#E0E1DD] rounded-lg disabled:opacity-50"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default Pagination;
