'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ordersApi, customersApi } from '../../utils/api';
import Link from 'next/link';
import { FaArrowLeft, FaCreditCard, FaCheck } from 'react-icons/fa';

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Form fields
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        phone: '',
        paymentMethod: 'credit_card',
    });

    // Form errors
    const [errors, setErrors] = useState({});

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login?redirect=checkout');
        }
    }, [loading, isAuthenticated, router]);

    // Pre-fill form with user data if available
    useEffect(() => {
        if (user && user.email) {
            setFormData(prevState => ({
                ...prevState,
                email: user.email,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            }));

            // Fetch customer profile to pre-fill shipping information
            const fetchCustomerProfile = async () => {
                try {
                    const response = await customersApi.getProfile();
                    const customerData = customersApi.processResponse(response);

                    if (customerData) {
                        console.log('Customer profile fetched for checkout:', customerData);
                        setFormData(prevState => ({
                            ...prevState,
                            firstName: customerData.firstName || prevState.firstName,
                            lastName: customerData.lastName || prevState.lastName,
                            address: customerData.address || '',
                            city: customerData.city || '',
                            state: customerData.state || '',
                            zipCode: customerData.zipCode || '',
                            country: customerData.country || '',
                            phone: customerData.phone || '',
                        }));
                    }
                } catch (error) {
                    console.log('No existing customer profile found or error fetching profile:', error);
                    // Don't display error to user, just continue with default form data
                    // A 404 is expected if the customer hasn't created a profile yet
                    if (error.response && error.response.status !== 404) {
                        console.log('Unexpected error fetching customer profile:', error);
                    }
                }
            };

            fetchCustomerProfile();
        }
    }, [user]);

    useEffect(() => {
        // Redirect to cart if cart is empty
        if (cart.length === 0 && !orderPlaced) {
            router.push('/cart');
        }
    }, [cart, orderPlaced, router]);

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Clear error when field is updated
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields
        const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode', 'country', 'phone'];

        requiredFields.forEach(field => {
            if (!formData[field].trim()) {
                newErrors[field] = 'This field is required';
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Phone validation
        if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);

            // First, check if the user is authenticated
            if (!isAuthenticated || !user) {
                router.push('/login?redirect=checkout');
                return;
            }

            console.log('Starting checkout process...');

            // Step 1: First create/update customer profile
            const customerData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country,
                phone: formData.phone,
            };

            console.log('Creating/updating customer profile:', customerData);
            const customerResponse = await customersApi.createUpdateProfile(customerData);
            console.log('Customer profile response:', customerResponse);

            if (!customerResponse || !customerResponse.data || !customerResponse.data.customer) {
                throw new Error('Failed to create or update customer profile');
            }

            const customer = customerResponse.data.customer;
            console.log('Customer profile created/updated:', customer);

            // Step 2: Create the order with the customer ID
            const orderData = {
                customerId: customer.id,
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
                paymentMethod: formData.paymentMethod,
            };

            console.log('Creating order:', orderData);
            const orderResponse = await ordersApi.create(orderData);
            console.log('Order response:', orderResponse);

            if (!orderResponse || !orderResponse.data) {
                throw new Error('Failed to create order');
            }

            // Check for specific stock-related errors
            if (orderResponse.data.error && orderResponse.data.error.includes('Insufficient stock')) {
                throw new Error(orderResponse.data.error || 'Some items are out of stock. Please return to cart and update quantities.');
            }

            // Extract order ID
            const order = orderResponse.data.order || orderResponse.data;
            const newOrderId = order.id || order._id;

            console.log('Order created with ID:', newOrderId);

            // Set order ID and mark as placed
            setOrderId(newOrderId);
            setOrderPlaced(true);

            // Clear the cart
            clearCart();

            console.log('Order process completed successfully!');
        } catch (error) {
            console.log('Error placing order:', error);

            // More detailed error handling
            let errorMessage = 'There was an error placing your order. Please try again.';

            if (error.response) {
                console.log('Error response:', error.response.data);
                errorMessage = error.response.data.message || errorMessage;

                // Handle specific error cases
                if (error.response.status === 404 && error.response.data.message.includes('Customer not found')) {
                    errorMessage = 'Your customer profile is not found. Please reload the page and try again.';
                } else if (error.response.status === 400 && error.response.data.message.includes('Insufficient stock')) {
                    errorMessage = 'Some items in your cart are out of stock. Please review your cart and try again.';
                }
            }

            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading state while checking authentication
    if (loading) {
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

    if (orderPlaced) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaCheck className="text-green-600 text-3xl" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">Order Confirmed!</h1>
                    <p className="text-gray-700 mb-6">Thank you for your purchase. Your order #{orderId} has been placed successfully.</p>
                    <Link href="/" className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Customer Information Form */}
                <div className="lg:w-2/3">
                    <form onSubmit={handleSubmit}>
                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Customer Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium mb-1 text-gray-700">
                                        First Name*
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium mb-1 text-gray-700">
                                        Last Name*
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
                                    Email Address*
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>

                            <div className="mb-4">
                                <label htmlFor="phone" className="block text-sm font-medium mb-1 text-gray-700">
                                    Phone Number*
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Shipping Address</h2>

                            <div className="mb-4">
                                <label htmlFor="address" className="block text-sm font-medium mb-1 text-gray-700">
                                    Street Address*
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                        errors.address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium mb-1 text-gray-700">
                                        City*
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                            errors.city ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium mb-1 text-gray-700">
                                        State/Province*
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                            errors.state ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="zipCode" className="block text-sm font-medium mb-1 text-gray-700">
                                        ZIP/Postal Code*
                                    </label>
                                    <input
                                        type="text"
                                        id="zipCode"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                            errors.zipCode ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                                </div>

                                <div>
                                    <label htmlFor="country" className="block text-sm font-medium mb-1 text-gray-700">
                                        Country*
                                    </label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${
                                            errors.country ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 mb-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Payment Method</h2>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="credit_card"
                                        name="paymentMethod"
                                        value="credit_card"
                                        checked={formData.paymentMethod === 'credit_card'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor="credit_card" className="flex items-center text-gray-700">
                                        <FaCreditCard className="mr-2 text-blue-600" />
                                        Credit Card
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        id="paypal"
                                        name="paymentMethod"
                                        value="paypal"
                                        checked={formData.paymentMethod === 'paypal'}
                                        onChange={handleInputChange}
                                        className="mr-2"
                                    />
                                    <label htmlFor="paypal" className="flex items-center text-gray-700">
                                        <span className="mr-2 text-blue-700 font-bold">Pay</span>
                                        <span className="text-blue-400 font-bold">Pal</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 border-t pt-6">
                                <p className="text-sm text-gray-700 mb-4">For demo purposes, no actual payment will be processed.</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <Link href="/cart" className="flex items-center text-blue-600 hover:text-blue-800">
                                <FaArrowLeft className="mr-2" /> Back to Cart
                            </Link>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`py-3 px-6 rounded-lg text-white font-bold ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isLoading ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>

                        <div className="mb-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between py-2 border-b">
                                    <div className="flex items-center">
                                        <div className="mr-2 text-gray-700">{item.quantity}x</div>
                                        <div className="font-medium text-gray-800">{item.name}</div>
                                    </div>
                                    <div className="font-medium text-gray-800">${(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="border-b pb-4 mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-800">${parseFloat(totalPrice || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-800">Free</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax (7%)</span>
                                <span className="text-gray-800">${(parseFloat(totalPrice || 0) * 0.07).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="font-bold text-lg text-gray-800">${(parseFloat(totalPrice || 0) + parseFloat(totalPrice || 0) * 0.07).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
