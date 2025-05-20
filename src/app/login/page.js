'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Use the login function from AuthContext
            await login(formData.email, formData.password);

            // Add a small delay to ensure AuthContext updates
            setTimeout(() => {
                // Redirect to homepage
                router.push('/');
            }, 100);
        } catch (error) {
            console.log('Login error:', error);

            // Provide more specific error messages based on status code
            if (error.response && error.response.status === 401) {
                setError('Invalid email or password. Please try again.');
            } else if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else if (error.message === 'Invalid response from login') {
                setError('Could not complete login. Please try again later.');
            } else {
                setError('Login failed. Please check your credentials and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Login to Your Account</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
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

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                        Password
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        id="password"
                        type="password"
                        name="password"
                        placeholder="********"
                        value={formData.password}
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
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>
            </form>

            <div className="text-center mt-6">
                <p className="text-sm text-gray-800">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}
