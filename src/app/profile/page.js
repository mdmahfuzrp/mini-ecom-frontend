'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

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

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-6 mb-6">
                    <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-3xl font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{user?.username || 'User'}</h2>
                        <p className="text-gray-600">{user?.email || 'email@example.com'}</p>
                        <p className="text-sm text-gray-500">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Account Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Username:</span>
                                <span className="font-medium text-gray-600">{user?.username}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium text-gray-600">{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
