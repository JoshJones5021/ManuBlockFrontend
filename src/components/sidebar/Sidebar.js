import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import manublock from '../../assets/manublock.png';
import dashboardIcon from '../../assets/dashboard.png';
import accountIcon from '../../assets/account.png';
import settingsIcon from '../../assets/settings.png';
import usersIcon from '../../assets/users.png';
import transfersIcon from '../../assets/transfers.png';
import factoryIcon from '../../assets/factory.png';
import config from '../common/config';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const userRole = localStorage.getItem(config.AUTH.ROLE_KEY);
    const location = useLocation();
    const currentPath = location.pathname;

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
                    {userRole === 'ADMIN' && (
                        <Link to="/dashboard" className="block">
                            <li className={`flex items-center ${currentPath === '/dashboard' ? 'bg-[#415A77]' : 'hover:bg-[#415A77]'} p-2 rounded cursor-pointer`}>
                                <img src={dashboardIcon} alt="Dashboard" className="h-6 w-6" />
                                <span className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                    isSidebarOpen ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    Dashboard
                                </span>
                            </li>
                        </Link>
                    )}

                    {userRole === 'SUPPLIER' && (
                        <Link to="/supplier-dashboard" className="block">
                            <li className={`flex items-center ${currentPath === '/supplier-dashboard' ? 'bg-[#415A77]' : 'hover:bg-[#415A77]'} p-2 rounded cursor-pointer`}>
                                <img src={dashboardIcon} alt="Supplier Dashboard" className="h-6 w-6" />
                                <span className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                    isSidebarOpen ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    Dashboard
                                </span>
                            </li>
                        </Link>
                    )}

                    {userRole === 'DISTRIBUTOR' && (
                        <Link to="/distributor-dashboard" className="block">
                            <li className={`flex items-center ${currentPath === '/distributor-dashboard' ? 'bg-[#415A77]' : 'hover:bg-[#415A77]'} p-2 rounded cursor-pointer`}>
                                <img src={transfersIcon || dashboardIcon} alt="Distributor Dashboard" className="h-6 w-6" />
                                <span className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                    isSidebarOpen ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    Dashboard
                                </span>
                            </li>
                        </Link>
                    )}

                    {userRole === 'MANUFACTURER' && (
                        <Link to="/manufacturer-dashboard" className="block">
                            <li className={`flex items-center ${currentPath === '/manufacturer-dashboard' ? 'bg-[#415A77]' : 'hover:bg-[#415A77]'} p-2 rounded cursor-pointer`}>
                                <img src={factoryIcon} alt="Manufacturer Dashboard" className="h-6 w-6" />
                                <span className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                    isSidebarOpen ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    Dashboard
                                </span>
                            </li>
                        </Link>
                    )}

                    <Link to="/profile" className="block">
                        <li className={`flex items-center ${currentPath === '/profile' ? 'bg-[#415A77]' : 'hover:bg-[#415A77]'} p-2 rounded cursor-pointer`}>
                            <img src={accountIcon} alt="Profile" className="h-6 w-6" />
                            <span className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                isSidebarOpen ? 'opacity-100' : 'opacity-0'
                            }`}>
                                Profile
                            </span>
                        </li>
                    </Link>

                    <Link to="/settings" className="block">
                        <li className={`flex items-center ${currentPath === '/settings' ? 'bg-[#415A77]' : 'hover:bg-[#415A77]'} p-2 rounded cursor-pointer`}>
                            <img src={settingsIcon} alt="Settings" className="h-6 w-6" />
                            <span className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                isSidebarOpen ? 'opacity-100' : 'opacity-0'
                            }`}>
                                Settings
                            </span>
                        </li>
                    </Link>

                    {userRole === 'ADMIN' && (
                        <Link to="/user-management" className="block">
                            <li className={`flex items-center ${currentPath === '/user-management' ? 'bg-[#415A77]' : 'hover:bg-[#415A77]'} p-2 rounded cursor-pointer`}>
                                <img src={usersIcon} alt="User Management" className="h-6 w-6" />
                                <span className={`text-[#E0E1DD] ml-4 transition-opacity duration-200 ${
                                    isSidebarOpen ? 'opacity-100' : 'opacity-0'
                                }`}>
                                    Users
                                </span>
                            </li>
                        </Link>
                    )}
                </ul>
            </div>

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