'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { customersApi, ordersApi } from '@/utils/api';
import Link from 'next/link';
import { FaUser, FaBox, FaAddressCard, FaSignOutAlt } from 'react-icons/fa';
import CustomerProfileForm from '@/components/customer/CustomerProfileForm';

export default function CustomerPage() {
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileSuccess, setProfileSuccess] = useState(false);

    // Fetch customer data from the backend
    useEffect(() => {
        const fetchCustomerData = async () => {
            if (!isAuthenticated) return;

            try {
                setLoading(true);
                setError(null);

                // Get customer profile
                const customerResponse = await customersApi.getProfile();
                const customerData = customersApi.processResponse(customerResponse);

                if (!customerData) {
                    throw new Error('No customer profile found. Please complete your profile.');
                }

                setCustomer(customerData);

                try {
                    // Get orders for this customer
                    const ordersResponse = await ordersApi.getAll();
                    const processedOrders = ordersApi.processResponse(ordersResponse);
                    setOrders(Array.isArray(processedOrders) ? processedOrders : []);
                } catch (orderErr) {
                    console.log('Error fetching orders:', orderErr);
                    // Continue with customer profile even if orders fail to load
                    setOrders([]);
                }

                setLoading(false);
            } catch (err) {
                console.log('Error fetching customer data:', err);

                if (err.response && err.response.status === 404) {
                    setError('Customer profile not found. Please create your profile below.');
                } else if (err.response && err.response.status === 401) {
                    setError('Your session has expired. Please log in again.');
                    logout(); // Logout the user if their session is invalid
                } else if (err.message && err.message.includes('profile')) {
                    setError(err.message);
                } else {
                    setError('Failed to load customer data. Please try again.');
                }

                setLoading(false);
            }
        };

        fetchCustomerData();
    }, [isAuthenticated, user, logout]);

    const handleProfileUpdate = () => {
        setProfileSuccess(true);

        // Refetch customer data after successful profile update
        customersApi
            .getProfile()
            .then(response => {
                const customerData = customersApi.processResponse(response);
                setCustomer(customerData);

                // Hide success message after 3 seconds
                setTimeout(() => {
                    setProfileSuccess(false);
                }, 3000);
            })
            .catch(err => {
                console.log('Error fetching updated profile:', err);
                setError('Failed to refresh your profile. Please reload the page.');
            });
    };

    if (loading) {
        return (
            <div className="text-center py-10">
                <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                >
                    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <p className="mt-4 text-gray-600">Loading account information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="text-center py-6 bg-red-50 rounded-lg mb-6">
                    <p className="text-red-600 mb-4">{error}</p>
                    {error.includes('session') && (
                        <Link href="/login" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">
                            Go to Login
                        </Link>
                    )}
                    {!error.includes('session') && !error.includes('profile') && (
                        <button
                            onClick={() => {
                                setLoading(true);
                                setError(null);

                                // Retry fetching customer data
                                customersApi
                                    .getProfile()
                                    .then(response => {
                                        const customerData = customersApi.processResponse(response);
                                        if (customerData) {
                                            setCustomer(customerData);
                                            // Try to load orders as well
                                            return ordersApi.getAll();
                                        } else {
                                            throw new Error('No customer profile found');
                                        }
                                    })
                                    .then(ordersResponse => {
                                        try {
                                            const processedOrders = ordersApi.processResponse(ordersResponse);
                                            setOrders(Array.isArray(processedOrders) ? processedOrders : []);
                                        } catch (e) {
                                            console.log('Error processing orders:', e);
                                            setOrders([]);
                                        }
                                        setLoading(false);
                                    })
                                    .catch(err => {
                                        console.log('Error retrying customer data fetch:', err);

                                        if (err.response && err.response.status === 401) {
                                            setError('Your session has expired. Please log in again.');
                                            logout();
                                        } else if (err.message.includes('profile')) {
                                            setError(err.message);
                                        } else {
                                            setError('Failed to load customer data. Please refresh the page or try again later.');
                                        }
                                        setLoading(false);
                                    });
                            }}
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                        >
                            Retry
                        </button>
                    )}
                    {error.includes('profile') && !error.includes('session') && (
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold mb-4">Create Your Customer Profile</h2>
                            <CustomerProfileForm
                                onSuccess={() => {
                                    setError(null);
                                    setLoading(true);
                                    // Refetch customer data after successful profile creation
                                    customersApi
                                        .getProfile()
                                        .then(response => {
                                            setCustomer(customersApi.processResponse(response));
                                            setLoading(false);
                                        })
                                        .catch(err => {
                                            console.log('Error fetching updated profile:', err);
                                            setError('Failed to load your new profile. Please refresh the page.');
                                            setLoading(false);
                                        });
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
                    <h1 className="text-2xl font-bold mb-6 text-center text-white">Login to Your Account</h1>
                    <p className="text-center mb-6 text-gray-700">Please login to view your account details</p>
                    <Link href="/login" className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Make sure customer object exists before rendering
    if (!customer) {
        return <div className="text-center py-10 text-gray-800">Unable to load customer information</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-white">My Account</h1>

            {profileSuccess && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">Profile updated successfully!</div>}

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="md:w-1/4">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <FaUser />
                                </div>
                                <div className="ml-4">
                                    <h2 className="font-semibold text-gray-800">
                                        {customer?.firstName || ''} {customer?.lastName || ''}
                                        {!customer?.firstName && !customer?.lastName && 'Customer'}
                                    </h2>
                                    <p className="text-sm text-gray-600">{customer?.User?.email || user?.email || 'No email provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                                            activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <FaUser className="mr-3" /> Profile
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                                            activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <FaBox className="mr-3" /> Orders
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => setActiveTab('address')}
                                        className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${
                                            activeTab === 'address' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <FaAddressCard className="mr-3" /> Address
                                    </button>
                                </li>
                                <li>
                                    <button onClick={logout} className="w-full text-left px-4 py-2 rounded-lg flex items-center text-red-600 hover:bg-red-50">
                                        <FaSignOutAlt className="mr-3" /> Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="md:w-3/4">
                    <div className="bg-white rounded-lg shadow p-6">
                        {activeTab === 'profile' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6 text-gray-800">Profile Information</h2>
                                <CustomerProfileForm customer={customer} onSuccess={handleProfileUpdate} />
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6 text-gray-800">Order History</h2>

                                {orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600">You haven&apos;t placed any orders yet.</p>
                                        <Link href="/products" className="text-blue-600 hover:underline mt-2 inline-block">
                                            Browse Products
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {orders.map(order => (
                                            <div key={order?.id || Math.random()} className="border rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 p-4 flex justify-between items-center">
                                                    <div>
                                                        <span className="text-sm text-gray-600">Order #{order?.id || 'N/A'}</span>
                                                        <div className="font-medium text-gray-800">{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs ${
                                                                order?.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}
                                                        >
                                                            {order?.isPaid ? 'Paid' : 'Payment Pending'}
                                                        </span>
                                                        <span
                                                            className={`inline-block px-3 py-1 rounded-full text-xs ${
                                                                order?.status === 'delivered'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : order?.status === 'processing'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                        >
                                                            {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4">
                                                    {Array.isArray(order?.OrderItems) &&
                                                        order.OrderItems.map(item => (
                                                            <div key={item?.id || Math.random()} className="flex justify-between py-2 border-b last:border-b-0">
                                                                <div>
                                                                    <div className="font-medium text-gray-800">{item?.Product?.name || item?.productName || 'Product'}</div>
                                                                    <div className="text-sm text-gray-600">Quantity: {item?.quantity || 0}</div>
                                                                </div>
                                                                <div className="font-medium text-gray-800">${parseFloat(item?.price || 0).toFixed(2)}</div>
                                                            </div>
                                                        ))}
                                                </div>

                                                <div className="bg-gray-50 p-4 flex justify-between">
                                                    <span className="font-semibold text-gray-800">Total</span>
                                                    <span className="font-semibold text-gray-800">${parseFloat(order?.totalAmount || order?.totalPrice || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'address' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6 text-gray-800">Address Information</h2>
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-gray-800">Shipping Address</h3>
                                        <div className="mt-2">
                                            {customer?.firstName && customer?.lastName ? (
                                                <p className="text-gray-700">
                                                    {customer.firstName} {customer.lastName}
                                                </p>
                                            ) : (
                                                <p className="text-gray-500 italic">No name provided</p>
                                            )}

                                            {customer?.address ? <p className="text-gray-700">{customer.address}</p> : <p className="text-gray-500 italic">No address provided</p>}

                                            {customer?.city || customer?.state || customer?.zipCode ? (
                                                <p className="text-gray-700">
                                                    {customer?.city || ''}
                                                    {customer?.city && (customer?.state || customer?.zipCode) ? ', ' : ''}
                                                    {customer?.state || ''} {customer?.zipCode || ''}
                                                </p>
                                            ) : null}

                                            {customer?.country && <p className="text-gray-700">{customer.country}</p>}

                                            {customer?.phone ? (
                                                <p className="mt-1 text-gray-700">Phone: {customer.phone}</p>
                                            ) : (
                                                <p className="text-gray-500 italic mt-1">No phone number provided</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <p className="text-sm text-gray-600 mb-2">To update your address information, please visit the Profile tab.</p>
                                        <button onClick={() => setActiveTab('profile')} className="text-blue-600 hover:underline text-sm">
                                            Edit in Profile
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
