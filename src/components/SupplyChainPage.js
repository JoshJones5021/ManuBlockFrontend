import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './NavBar';
import Sidebar from './Sidebar';

const SupplyChainPage = () => {
    const { id } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [supplyChain, setSupplyChain] = useState(null);

    useEffect(() => {
        const fetchSupplyChain = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/supply-chains/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setSupplyChain(data);
            } catch (error) {
                console.error('Error fetching supply chain:', error);
            }
        };

        fetchSupplyChain();
    }, [id]);

    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className="flex-1 flex flex-col">
                <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

                <div className="p-8">
                    {supplyChain ? (
                        <div>
                            <h1 className="text-3xl font-semibold">{supplyChain.name}</h1>
                            <p className="mt-4">{supplyChain.description}</p>
                        </div>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupplyChainPage;
