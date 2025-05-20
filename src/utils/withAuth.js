'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Higher-order component to protect routes that require authentication
export default function withAuth(Component) {
    return function ProtectedRoute(props) {
        const { isAuthenticated, loading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            // If auth state is loaded and user is not authenticated, redirect to login
            if (!loading && !isAuthenticated) {
                router.push('/login');
            }
        }, [loading, isAuthenticated, router]);

        // Show loading spinner while checking authentication
        if (loading) {
            return (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        // If not authenticated, don't render the component
        // (useEffect will handle the redirect)
        if (!isAuthenticated) {
            return null;
        }

        // If authenticated, render the protected component
        return <Component {...props} />;
    };
}
