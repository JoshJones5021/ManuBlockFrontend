import React from 'react';
import manublock from '../assets/manublock.png';
import dashboardIcon from '../assets/dashboard.png';
import accountIcon from '../assets/account.png';
import settingsIcon from '../assets/settings.png';
import { Link } from 'react-router-dom';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    return (
        <div
            className={`flex h-screen ${
                isSidebarOpen ? 'w-64' : 'w-20'
            } bg-[#1B263B] border-r border-[#415A77] transition-all duration-200 relative`}
        >
            <div className="flex flex-col w-full p-4">
                {/* Logo */}
                <div className="flex items-center mb-10">
                    <img src={manublock} alt="ManuBlock Logo" className="h-10 w-10" />
                    {isSidebarOpen && (
                        <span className="text-white text-xl font-bold ml-4">ManuBlock</span>
                    )}
                </div>

                {/* Sidebar Menu Items */}
                <ul className="space-y-6">
                    <li className="flex items-center hover:bg-[#415A77] p-2 rounded cursor-pointer">
                        <img src={dashboardIcon} alt="Dashboard" className="h-6 w-6" />
                        <Link
                            to="/dashboard"
                            className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                isSidebarOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li className="flex items-center hover:bg-[#415A77] p-2 rounded cursor-pointer">
                        <img src={accountIcon} alt="Profile" className="h-6 w-6" />
                        <Link
                            to="/profile"
                            className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                isSidebarOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            Profile
                        </Link>
                    </li>
                    <li className="flex items-center hover:bg-[#415A77] p-2 rounded cursor-pointer">
                        <img src={settingsIcon} alt="Settings" className="h-6 w-6" />
                        <Link
                            to="/settings"
                            className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                isSidebarOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            Settings
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Toggle Button on Sidebar Edge */}
            <button
                onClick={toggleSidebar}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#415A77] text-white p-2 rounded-l-md shadow-lg hover:bg-gray-600"
            >
                {isSidebarOpen ? '<' : '>'}
            </button>
        </div>
    );
};

export default Sidebar;
