'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi } from '@/utils/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBoxOpen, FaArrowLeft, FaHome, FaShoppingCart } from 'react-icons/fa';

export default function OrdersPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login?redirect=orders');
        }
    }, [loading, isAuthenticated, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isAuthenticated || !user) return;

            try {
                setIsLoading(true);
                setError(null);

                // Log the authentication token for debugging
                console.log('Fetching orders with auth token...');

                const response = await ordersApi.getAll();
                console.log('Orders API Response:', response);

                if (!response || !response.data) {
                    throw new Error('Invalid response from server');
                }

                // Check if the response is an array or has a data.orders property
                let fetchedOrders = [];
                if (Array.isArray(response.data)) {
                    fetchedOrders = response.data;
                } else if (response.data.orders && Array.isArray(response.data.orders)) {
                    fetchedOrders = response.data.orders;
                } else {
                    fetchedOrders = [];
                    console.warn('Unexpected response format:', response.data);
                }

                console.log('Processed orders:', fetchedOrders);
                setOrders(fetchedOrders);
            } catch (err) {
                console.log('Error fetching orders:', err);
                if (err.response) {
                    console.log('Error response:', err.response);
                    if (err.response.status === 401) {
                        setError('You need to be logged in to view your orders.');
                    } else {
                        setError(`Failed to load your orders. Server returned: ${err.response.status} ${err.response.statusText}`);
                    }
                } else if (err.request) {
                    console.log('Error request:', err.request);
                    setError('Failed to connect to the server. Please check your internet connection.');
                } else {
                    setError('Failed to load your orders. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, user]);

    // Format date in a readable way
    const formatDate = dateString => {
        if (!dateString) return 'Unknown date';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get status badge color
    const getStatusColor = status => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Show loading state while checking authentication
    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If user is not authenticated, don't render the page content
    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    // Show error message if there was a problem loading orders
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                    <p>{error}</p>
                </div>
                <div className="flex justify-center">
                    <Link href="/" className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    // Show empty state if no orders
    if (orders.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-white">My Orders</h1>
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-gray-400 text-5xl mb-4">
                        <FaBoxOpen className="mx-auto" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">You haven&apos;t placed any orders yet</h2>
                    <p className="text-gray-600 mb-8">Browse our products and place your first order!</p>
                    <div className="flex justify-center space-x-4">
                        <Link href="/products" className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center">
                            <FaShoppingCart className="mr-2" /> Start Shopping
                        </Link>
                        <Link href="/" className="bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-200 flex items-center">
                            <FaHome className="mr-2" /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-white">My Orders</h1>

            <div className="mb-6">
                <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center w-fit">
                    <FaArrowLeft className="mr-2" /> Back to Home
                </Link>
            </div>

            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 md:p-6 border-b bg-gray-50">
                            <div className="flex flex-col md:flex-row justify-between">
                                <div className="mb-2 md:mb-0">
                                    <h2 className="text-lg font-semibold text-gray-800">Order #{order.orderNumber || order.id}</h2>
                                    <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status || 'Processing'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 md:p-6">
                            <h3 className="text-md font-medium mb-3 text-gray-700">Items</h3>
                            <div className="space-y-3">
                                {order.OrderItems && order.OrderItems.length > 0 ? (
                                    order.OrderItems.map((item, index) => (
                                        <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                                            <div className="flex items-start">
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.productName || 'Product'}</p>
                                                    <p className="text-sm text-gray-600">
                                                        Qty: {item.quantity} × ${parseFloat(item.price || 0).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-gray-800">${parseFloat(item.price * item.quantity || 0).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 italic">No items available</p>
                                )}
                            </div>
                        </div>

                        <div className="p-4 md:p-6 border-t bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Payment: {order.paymentMethod || 'Credit Card'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Total</p>
                                    <p className="text-xl font-bold text-gray-800">${parseFloat(order.totalPrice || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
