'use client';

import { useState } from 'react';
import { customersApi } from '@/utils/api';

const CustomerProfileForm = ({ customer, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: customer?.firstName || '',
        lastName: customer?.lastName || '',
        address: customer?.address || '',
        city: customer?.city || '',
        state: customer?.state || '',
        zipCode: customer?.zipCode || '',
        country: customer?.country || '',
        phone: customer?.phone || '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await customersApi.createUpdateProfile(formData);

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            console.log('Error saving customer profile:', err);
            setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto bg-white text-gray-800 p-6 rounded-lg shadow">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name*
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name*
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Address*
                </label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City*
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State/Province*
                    </label>
                    <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP/Postal Code*
                    </label>
                    <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                        Country*
                    </label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div className="pt-2">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200" disabled={loading}>
                    {loading ? 'Saving...' : customer ? 'Update Profile' : 'Create Profile'}
                </button>
            </div>
        </form>
    );
};

export default CustomerProfileForm;
