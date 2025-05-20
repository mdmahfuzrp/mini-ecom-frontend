'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();

        // Basic validation
        if (!formData.username || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registerData } = formData;

            // Use the register function from AuthContext
            await register(registerData);

            // Add a small delay to ensure AuthContext updates
            setTimeout(() => {
                // Redirect to homepage
                router.push('/');
            }, 100);
        } catch (error) {
            console.log('Registration error:', error);

            // Provide more specific error messages based on status code or response
            if (error.response && error.response.status === 400) {
                setError(error.response.data.message || 'Invalid registration data. Please check your information.');
            } else if (error.response && error.response.status === 409) {
                setError('This email or username is already in use. Please try another one.');
            } else if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('Registration failed. Please try again with different information.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Create an Account</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                        Username
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="username"
                        type="text"
                        name="username"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        name="password"
                        placeholder="********"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        placeholder="********"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </div>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-gray-800">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
