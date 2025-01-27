import React, { useState } from 'react';
import manublock from '../assets/manublock.png';
import dashboardIcon from '../assets/dashboard.png';
import accountIcon from '../assets/account.png';
import settingsIcon from '../assets/settings.png';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`flex h-screen ${isOpen ? 'w-64' : 'w-20'} bg-blue-900 transition-all duration-300 relative`}>
            <div className="flex flex-col w-full p-5">
                {/* Logo */}
                <div className="flex items-center">
                    <img src={manublock} alt="ManuBlock Logo" className="h-12" />
                    <span
                        className={`text-white text-xl font-bold ml-4 transition-opacity duration-200 ${
                            isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        ManuBlock
                    </span>
                </div>

                {/* Sidebar Menu Items */}
                <ul className="mt-20 space-y-6">
                    <li className="flex items-center hover:bg-blue-700 p-2 rounded cursor-pointer">
                        <img src={dashboardIcon} alt="Dashboard" className="h-6 w-6" />
                        <Link
                            to="/dashboard"
                            className={`text-white ml-4 transition-opacity duration-200 ${
                                isOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li className="flex items-center hover:bg-blue-700 p-2 rounded cursor-pointer">
                        <img src={accountIcon} alt="Profile" className="h-6 w-6" />
                        <Link
                            to="/profile"
                            className={`text-white ml-4 transition-opacity duration-200 ${
                                isOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                        >
                            Profile
                        </Link>
                    </li>
                    <li className="flex items-center hover:bg-blue-700 p-2 rounded cursor-pointer">
                        <img src={settingsIcon} alt="Settings" className="h-6 w-6" />
                        <Link
                            to="/settings"
                            className={`text-white ml-4 transition-opacity duration-200 ${
                                isOpen ? 'opacity-100' : 'opacity-0'
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
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-l-md shadow-lg hover:bg-gray-600"
            >
                {isOpen ? '<' : '>'}
            </button>
        </div>
    );
};

export default Sidebar;
