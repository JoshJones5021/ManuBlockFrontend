import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import Pagination from '../components/Pagination';
import { getAllSupplyChains, createSupplyChain, deleteSupplyChain } from '../services/supplyChainApi'; // Import API functions

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [supplyChains, setSupplyChains] = useState([]);
    const [itemsPerPage, setItemsPerPage] = useState(16);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredChains, setFilteredChains] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSupplyChain, setNewSupplyChain] = useState({ name: '', description: '' });
    const [isCreating, setIsCreating] = useState(false);

    const [user, setUser] = useState({ username: '', role: '' });
    const navigate = useNavigate();

    // Fetch supply chains on load
    useEffect(() => {
        const fetchSupplyChains = async () => {
            try {
                const fetchedChains = await getAllSupplyChains();
                setSupplyChains(fetchedChains);
                setFilteredChains(fetchedChains); // Initialize filtered chains
            } catch (error) {
                console.error('Error fetching supply chains:', error);
            }
        };

        fetchSupplyChains();
    }, []);

    useEffect(() => {
        const fetchUserData = () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) throw new Error('User not logged in');

                const decodedToken = jwtDecode(token);
                setUser({ username: decodedToken.username, role: decodedToken.role });
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);

    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredChains(supplyChains);
        } else {
            setFilteredChains(
                supplyChains.filter((chain) =>
                    chain.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
    }, [searchTerm, supplyChains]);

    const totalPages = Math.ceil(filteredChains.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const selectedSupplyChains = filteredChains.slice(startIndex, startIndex + itemsPerPage);

    const handleOpenModal = () => {
        setNewSupplyChain({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const handleCreateSupplyChain = async () => {
        if (!newSupplyChain.name.trim() || !newSupplyChain.description.trim()) {
            alert('Please fill in both fields.');
            return;
        }

        setIsCreating(true);
        try {
            const createdChain = await createSupplyChain(newSupplyChain);
            setSupplyChains([...supplyChains, createdChain]);
            setFilteredChains([...filteredChains, createdChain]); // Update filtered chains
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error creating supply chain:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteSupplyChain = async (id) => {
        try {
            await deleteSupplyChain(id);
            setSupplyChains(supplyChains.filter(chain => chain.id !== id));
            setFilteredChains(filteredChains.filter(chain => chain.id !== id));
        } catch (error) {
            console.error('Error deleting supply chain:', error);
        }
    };

    const formatDateTime = (dateTime) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateTime).toLocaleDateString(undefined, options);
    };

    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex-1 flex flex-col overflow-y-auto">
                <Navbar username={user.username} role={user.role} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                <div className="flex-1 p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-[#1B263B] text-white text-center py-3 px-6 rounded-lg shadow-md w-full max-w-2xl">
                            <h1 className="text-2xl font-semibold">
                                {user.username ? `${user.username}'s ${user.role} Dashboard!` : 'Loading...'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={handleOpenModal}
                            className="bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300"
                        >
                            + Create New Supply Chain
                        </button>

                        <div className="flex items-center space-x-4 w-full max-w-lg">
                            <input
                                type="text"
                                placeholder="Search supply chains..."
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
                            <span className="text-[#E0E1DD]">{filteredChains.length} Results</span>
                        </div>
                    </div>

                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {selectedSupplyChains.map((chain) => (
                            <div
                                key={chain.id}
                                className="bg-[#1B263B] p-6 rounded-lg shadow-md border border-[#415A77] hover:shadow-lg transition duration-300 relative"
                            >
                                <button
                                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-md flex items-center justify-center shadow-md transition"
                                    onClick={() => handleDeleteSupplyChain(chain.id)}
                                >
                                    ✖
                                </button>
                                <h2 className="text-xl font-semibold text-[#E0E1DD]">{chain.name}</h2>
                                <p className="text-[#778DA9] mt-2">{chain.description}</p>
                                <p className="text-[#778DA9] mt-2 text-xs">Created: {formatDateTime(chain.createdAt)}</p>
                                <p className="text-[#778DA9] mt-1 text-xs">Updated: {formatDateTime(chain.updatedAt)}</p>
                                <button
                                    onClick={() => navigate(`/supply-chain/${chain.id}`)}
                                    className="mt-4 bg-[#415A77] text-white py-2 px-4 rounded hover:bg-[#778DA9] transition duration-300"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <Pagination
                    totalItems={filteredChains.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    isSidebarOpen={isSidebarOpen}
                />
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
                >
                    <div className="bg-[#1B263B] p-6 rounded-lg shadow-md w-96">
                        <h2 className="text-xl font-semibold mb-4 text-[#E0E1DD]">Create Supply Chain</h2>
                        <input
                            type="text"
                            placeholder="Supply Chain Name"
                            value={newSupplyChain.name}
                            onChange={(e) => setNewSupplyChain({ ...newSupplyChain, name: e.target.value })}
                            className="w-full p-2 mb-2 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                        />
                        <input
                            type="text"
                            placeholder="Description"
                            value={newSupplyChain.description}
                            onChange={(e) => setNewSupplyChain({ ...newSupplyChain, description: e.target.value })}
                            className="w-full p-2 mb-4 bg-[#0D1B2A] text-white rounded border border-[#415A77]"
                        />
                        <button
                            onClick={handleCreateSupplyChain}
                            className="bg-green-500 px-4 py-2 rounded text-white mr-2"
                            disabled={isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </button>
                        <button onClick={() => setIsModalOpen(false)} className="bg-red-500 px-4 py-2 rounded text-white">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;