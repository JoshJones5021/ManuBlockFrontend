import React, { useState } from 'react';
import Navbar from './NavBar';
import Sidebar from './Sidebar';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                {/* Main Content */}
                <div className="flex-1 p-8">
                    <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>
                    <form className="bg-white p-6 rounded-lg shadow-md w-2/3 mx-auto">
                        <div className="mb-4">
                            <label className="block text-gray-700">Name</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Email</label>
                            <input
                                type="email"
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Message</label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                placeholder="Enter your message"
                            ></textarea>
                        </div>
                        <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
