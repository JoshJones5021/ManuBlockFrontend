import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar/NavBar';
import Sidebar from '../components/sidebar/Sidebar';
import Pagination from '../components/Pagination';
import LoadingOverlay from '../components/LoadingOverlay';
import ProductModal from '../components/modals/ProductModal';
import MaterialRequestModal from '../components/modals/MaterialRequestModal';
import ProductionBatchModal from '../components/modals/ProductBatchModal';
import { getOrders, getMaterialRequests, requestMaterials, getBatches, createBatch, completeBatch, rejectBatch, getProducts, createProduct, updateProduct, deactivateProduct  } from '../services/manufacturerApi';
import factoryIcon from '../assets/factory.png';

const ManufacturerDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [materialRequests, setMaterialRequests] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const manufacturerId = localStorage.getItem('userId');

    useEffect(() => {
        if (userRole !== 'MANUFACTURER') {
            alert('Unauthorized access. Redirecting to dashboard.');
            navigate('/dashboard');
            return;
        }
        fetchData();
    }, []);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const productsData = await getProducts(manufacturerId);
            const ordersData = await getOrders(manufacturerId);
            const materialRequestsData = await getMaterialRequests(manufacturerId);
            const batchesData = await getBatches(manufacturerId);
            
            setProducts(productsData);
            setOrders(ordersData);
            setMaterialRequests(materialRequestsData);
            setBatches(batchesData);
        } catch (error) {
            console.error('Error fetching manufacturer data:', error);
        }
        setLoading(false);
    };
    
    return (
        <div className="flex h-screen bg-[#0D1B2A] text-[#E0E1DD]">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div className="flex-1 flex flex-col overflow-y-auto">
                <Navbar />
                <div className="flex-1 p-8">
                    <div className="flex flex-col items-center mb-6">
                        <div className="bg-[#1B263B] text-white text-center py-3 px-6 rounded-lg shadow-md w-full max-w-4xl">
                            <h1 className="text-2xl font-semibold">Manufacturer Dashboard</h1>
                        </div>
                    </div>
                    
                    {loading ? (
                        <LoadingOverlay message="Loading manufacturer data..." />
                    ) : (
                        <div>
                            <section>
                                <h2 className="text-lg font-semibold">Products</h2>
                                <button onClick={() => setIsProductModalOpen(true)} className="btn">Add Product</button>
                                <ul>
                                    {products.map(product => (
                                        <li key={product.id} className="border p-2 flex justify-between">
                                            {product.name} - {product.status}
                                            <button onClick={() => deactivateProduct(product.id)} className="btn">Deactivate</button>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                            
                            <section>
                                <h2 className="text-lg font-semibold">Orders</h2>
                                <ul>
                                    {orders.map(order => (
                                        <li key={order.id} className="border p-2">
                                            Order #{order.orderNumber} - {order.status}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                            
                            <section>
                                <h2 className="text-lg font-semibold">Material Requests</h2>
                                <button onClick={() => setIsMaterialModalOpen(true)} className="btn">Request Materials</button>
                                <ul>
                                    {materialRequests.map(request => (
                                        <li key={request.id} className="border p-2">
                                            Request #{request.requestNumber} - {request.status}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                            
                            <section>
                                <h2 className="text-lg font-semibold">Production Batches</h2>
                                <button onClick={() => setIsBatchModalOpen(true)} className="btn">New Production Batch</button>
                                <ul>
                                    {batches.map(batch => (
                                        <li key={batch.id} className="border p-2 flex justify-between">
                                            Batch #{batch.batchNumber} - {batch.status}
                                            <div>
                                                <button onClick={() => completeBatch(batch.id)} className="btn mr-2">Complete</button>
                                                <button onClick={() => rejectBatch(batch.id)} className="btn">Reject</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    )}
                </div>
                <Pagination />
            </div>
            
            {isProductModalOpen && <ProductModal closeModal={() => setIsProductModalOpen(false)} refreshData={fetchData} />}
            {isMaterialModalOpen && <MaterialRequestModal closeModal={() => setIsMaterialModalOpen(false)} refreshData={fetchData} />}
            {isBatchModalOpen && <ProductionBatchModal closeModal={() => setIsBatchModalOpen(false)} refreshData={fetchData} />}
        </div>
    );
};

export default ManufacturerDashboard;
