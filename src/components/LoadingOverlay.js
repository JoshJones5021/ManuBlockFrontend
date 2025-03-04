import React from 'react';

const LoadingOverlay = ({ message = "Processing..." }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
      <div className="bg-[#1B263B] p-6 rounded-lg shadow-lg text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#61dafb] mb-4"></div>
        <p className="text-white text-lg font-semibold">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;