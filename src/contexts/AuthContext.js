'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { authApi } from '../utils/api';

// Create auth context
const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    // Refresh user from localStorage
    const refreshUser = () => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                // Set the authentication header for all future requests
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(JSON.parse(storedUser));
                return true;
            } catch (error) {
                console.log('Error refreshing user:', error);
                setError('Authentication error. Please log in again.');
                logout();
                return false;
            }
        }
        return false;
    };

    // Load user from localStorage on initial render
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    // Set the authentication header for all future requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setUser(JSON.parse(storedUser));

                    // Optionally verify token with the backend
                    try {
                        // Verify token with direct API call
                        const profileResponse = await authApi.getProfile();

                        // Use helper method to safely extract user data
                        const profileData = authApi.processUserResponse(profileResponse);

                        // Update user data with the most current information
                        if (profileData && (profileData.id || profileData._id)) {
                            setUser(profileData);
                            localStorage.setItem('user', JSON.stringify(profileData));
                        }
                    } catch (error) {
                        // Token is invalid, clear auth data
                        console.log('Token validation failed:', error);
                        logout();
                    }
                }
            } catch (error) {
                console.log('Error loading user:', error);
                setError('Authentication error. Please log in again.');
                logout();
            } finally {
                setLoading(false);
            }
        };

        loadUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Register user
    const register = async userData => {
        try {
            setLoading(true);
            setError(null);

            // Make direct API call to the backend
            const response = await authApi.register(userData);

            // Use helper methods to safely extract data
            const token = authApi.getToken(response);
            const user = authApi.processUserResponse(response);

            if (!token || !user) {
                throw new Error('Invalid response from registration');
            }

            // Save token and user to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Set auth header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            return response.data;
        } catch (error) {
            // Only log unexpected errors
            if (!error.response || ![400, 409].includes(error.response.status)) {
                console.log('Registration error:', error);
            }

            setError(error.response?.data?.message || 'Registration failed. Please try again.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            // Make direct API call to the backend
            const response = await authApi.login(email, password);

            // Use helper methods to safely extract data
            const token = authApi.getToken(response);
            const user = authApi.processUserResponse(response);

            if (!token || !user) {
                throw new Error('Invalid response from login');
            }

            // Save token and user to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Set auth header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setUser(user);
            return response.data;
        } catch (error) {
            // Don't log 401 unauthorized errors as they're expected for invalid credentials
            if (!error.response || error.response.status !== 401) {
                console.log('Login error:', error);
            }

            setError(error.response?.data?.message || 'Login failed. Please check your credentials.');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        // Remove token and user from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Remove auth header
        delete axios.defaults.headers.common['Authorization'];

        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                register,
                login,
                logout,
                refreshUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
