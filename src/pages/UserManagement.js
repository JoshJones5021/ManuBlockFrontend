import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import Pagination from '../components/Pagination';
import { getAllUsers, getAllRoles, deleteUser, updateUser, createUser } from '../services/userApi';
import config from '../components/common/config';
import { getSupplyChainsByUserId } from '../services/supplyChainApi';
import LoadingOverlay from '../components/LoadingOverlay';

const UserManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [userSupplyChains, setUserSupplyChains] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'delete'
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'CUSTOMER'
    });
    const [expandedRows, setExpandedRows] = useState({});
    
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setLoading(true); // ✅ Show loading overlay
    
            // Fetch users and roles in parallel
            const [usersData, rolesData] = await Promise.all([
                getAllUsers(),
                getAllRoles(), // ✅ Fetch roles again
            ]);
    
            setUsers(usersData);
            setFilteredUsers(usersData);
            setRoles(rolesData); // ✅ Set roles
    
            // Fetch supply chains for each user
            const supplyChainPromises = usersData.map(user =>
                getSupplyChainsByUserId(user.id)
                    .then(chains => ({ userId: user.id, chains }))
                    .catch(() => ({ userId: user.id, chains: [] }))
            );
    
            const supplyChainResults = await Promise.all(supplyChainPromises);
            const supplyChainMap = supplyChainResults.reduce((acc, { userId, chains }) => {
                acc[userId] = chains;
                return acc;
            }, {});
    
            setUserSupplyChains(supplyChainMap);
        } catch (error) {
            console.error('Error fetching users and roles:', error);
            alert('Failed to load user data');
        } finally {
            setLoading(false); // ✅ Hide loading overlay
        }
    };     
    
    // Fetch users and roles on component mount
    useEffect(() => {
        fetchUsers();
    }, [navigate]);
    
    // Filter users when search term changes
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredUsers(users);
        } else {
            const lowercasedSearch = searchTerm.toLowerCase();
            setFilteredUsers(
                users.filter(
                    user => 
                        user.username.toLowerCase().includes(lowercasedSearch) ||
                        user.email.toLowerCase().includes(lowercasedSearch) ||
                        user.role.toLowerCase().includes(lowercasedSearch)
                )
            );
        }
    }, [searchTerm, users]);
    
    // Handle modal open for different operations
    const handleOpenModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        
        if (mode === 'create') {
            setFormData({
                username: '',
                email: '',
                password: '',
                role: 'CUSTOMER'
            });
        } else if (mode === 'edit' && user) {
            setFormData({
                username: user.username,
                email: user.email,
                password: '',
                role: user.role
            });
        }
        
        setIsModalOpen(true);
    };
    
    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setLoading(true);
    
        try {
            if (modalMode === 'create') {
                await createUser(formData);
                alert('User created successfully');
            } else if (modalMode === 'edit' && selectedUser) {
                const updatedUserData = { ...formData };
                if (!updatedUserData.password) {
                    delete updatedUserData.password;
                }
                await updateUser(selectedUser.id, updatedUserData);
                alert('User updated successfully');
            }
    
            await fetchUsers(); // ✅ Refresh the users list
    
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error processing user data:', error);
            alert(`Error: ${error.message || 'Something went wrong'}`);
        } finally {
            setIsProcessing(false);
            setLoading(false);
        }
    };    
    
    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }
    
        setIsProcessing(true);
        setLoading(true);
    
        try {
            const response = await deleteUser(userId);
            
            if (response.error) {
                alert(response.error); // ✅ Show the error message if deletion fails
            } else {
                alert('User deleted successfully');
                await fetchUsers(); // ✅ Refresh user list after deletion
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(`Error: ${error.message || 'Failed to delete user'}`);
        } finally {
            setIsProcessing(false);
            setLoading(false);
        }
    };        

    const toggleRowExpansion = (userId) => {
        setExpandedRows(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };
    
    // Calculate pagination values
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    
    if (loading) {
        return (
            <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="flex-1 flex flex-col">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#E0E1DD]"></div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
            {loading && <LoadingOverlay message="Refreshing users..." />} 
            {isProcessing && <LoadingOverlay message="Processing..." />} 

            <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
                <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                
                <div className="flex-1 flex flex-col overflow-y-auto">
                    <Navbar />
                    
                    <div className="flex-1 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-semibold">User Management</h1>
                            <button
                                onClick={() => handleOpenModal('create')}
                                className="bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300"
                            >
                                + Add New User
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-4 w-full max-w-lg">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-[#1B263B] border border-[#415A77] rounded-lg py-2 px-4 text-[#E0E1DD] focus:outline-none focus:ring focus:ring-[#778DA9]"
                                />
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <span className="mr-2 text-[#E0E1DD]">Show</span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(parseInt(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="p-2 border border-[#415A77] rounded-lg bg-[#1B263B] text-[#E0E1DD] focus:outline-none"
                                    >
                                        <option value="4">4</option>
                                        <option value="8">8</option>
                                        <option value="12">12</option>
                                        <option value="16">16</option>
                                    </select>
                                    <span className="ml-2 text-[#E0E1DD]">entries</span>
                                </div>
                                <span className="text-[#E0E1DD]">{filteredUsers.length} Users</span>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto bg-[#1B263B] rounded-lg p-6">
                            <table className="min-w-full bg-[#0D1B2A] rounded-lg table-fixed">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="py-3 px-4 text-left">ID</th>
                                        <th className="py-3 px-4 text-left">Username</th>
                                        <th className="py-3 px-4 text-left">Email</th>
                                        <th className="py-3 px-4 text-left">Role</th>
                                        <th className="py-3 px-4 text-left">Supply Chains</th>
                                        <th className="py-3 px-4 text-left">Wallet</th>
                                        <th className="py-3 px-4 text-left"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.map((user) => (
                                        <React.Fragment key={user.id}>
                                            <tr className="border-b border-gray-700 hover:bg-gray-900">
                                                <td className="py-3 px-4">{user.id}</td>
                                                <td className="py-3 px-4 font-medium">{user.username}</td>
                                                <td className="py-3 px-4">{user.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        user.role === 'ADMIN' ? 'bg-purple-900 text-purple-300' :
                                                        user.role === 'SUPPLIER' ? 'bg-blue-900 text-blue-300' :
                                                        user.role === 'MANUFACTURER' ? 'bg-green-900 text-green-300' :
                                                        user.role === 'DISTRIBUTOR' ? 'bg-yellow-900 text-yellow-300' :
                                                        'bg-red-900 text-red-300'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button 
                                                        onClick={() => toggleRowExpansion(user.id)} 
                                                        className="text-white flex items-center space-x-2"
                                                    >
                                                        <span>
                                                            {userSupplyChains[user.id] && userSupplyChains[user.id].length > 0
                                                                ? `${userSupplyChains[user.id].length} supply chain(s)`
                                                                : 'None'}
                                                        </span>
                                                        {userSupplyChains[user.id] && userSupplyChains[user.id].length > 0 && (
                                                            <span className={`transition-transform ${expandedRows[user.id] ? 'rotate-180' : ''}`}>➕</span>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {user.walletAddress ? (
                                                        <span className="text-[#E0E1DD]">{user.walletAddress}</span>
                                                    ) : (
                                                        <span className="text-gray-500">N/A</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleOpenModal('edit', user)}
                                                            className="bg-[#415A77] text-white py-1 px-3 rounded text-sm hover:bg-[#778DA9]"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.id)}
                                                            className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700"
                                                            disabled={user.role === 'ADMIN' && users.filter(u => u.role === 'ADMIN').length <= 1}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRows[user.id] && userSupplyChains[user.id]?.length > 0 && (
                                                <tr className="border-b border-gray-700 bg-[#0D1B2A]">
                                                    <td colSpan="7" className="py-3 px-4">
                                                        <div className="p-3 bg-[#1B263B] rounded-lg flex justify-center">
                                                            <div className="flex flex-wrap justify-center gap-2">
                                                                {userSupplyChains[user.id].map((chain) => (
                                                                    <div key={chain.id} className="py-1 px-2 bg-[#415A77] rounded-md text-[#E0E1DD] text-center">
                                                                        {chain.name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <Pagination
                        totalItems={filteredUsers.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        isSidebarOpen={isSidebarOpen}
                    />
                </div>
                
                {/* User Modal (Create/Edit) */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-full max-w-md">
                            <h2 className="text-xl font-semibold mb-4 text-[#E0E1DD]">
                                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
                            </h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-400 mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 mb-1">
                                        {modalMode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required={modalMode === 'create'}
                                        className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-400 mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full p-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>
                                                {role}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="flex justify-end space-x-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-[#415A77] text-white px-4 py-2 rounded hover:bg-[#778DA9]"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : modalMode === 'create' ? 'Create User' : 'Update User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                
                {isProcessing && <LoadingOverlay message="Processing..." />}
            </div>
        </>
    );
};

export default UserManagement;