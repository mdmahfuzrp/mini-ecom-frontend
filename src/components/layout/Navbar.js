'use client';

import Link from 'next/link';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTags, FaChevronDown, FaBoxOpen, FaAddressCard } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const Navbar = () => {
    const { totalItems } = useCart();
    const { user, logout, isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const router = useRouter();
    const userMenuRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        const handleClickOutside = event => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white text-gray-800 shadow-md' : 'bg-gradient-to-r from-blue-700 to-indigo-800 text-white'
            }`}
        >
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className={`text-xl font-bold ${isScrolled ? 'text-blue-600' : 'text-white'}`}>
                            <span className="flex items-center">
                                <FaTags className="mr-2" />
                                Mini E-Commerce
                            </span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link href="/products" className={`font-medium hover:text-opacity-80 transition-colors ${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white'}`}>
                            Products
                        </Link>

                        {/* Cart Icon */}
                        <Link href="/cart" className="relative">
                            <FaShoppingCart size={20} className={`${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white hover:text-blue-100'} transition-colors`} />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>
                            )}
                        </Link>

                        {/* Auth Links */}
                        {isAuthenticated ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={toggleUserMenu}
                                    className={`flex items-center gap-1.5 font-medium ${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white'} transition-colors`}
                                >
                                    <FaUser size={16} />
                                    <span>{user?.username || 'Profile'}</span>
                                    <FaChevronDown className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} size={12} />
                                </button>

                                {/* User Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                                            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FaUser className="mr-2 text-gray-500" size={14} />
                                            My Profile
                                        </Link>
                                        <Link
                                            href="/customer"
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FaAddressCard className="mr-2 text-gray-500" size={14} />
                                            My Account
                                        </Link>
                                        <Link
                                            href="/orders"
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FaBoxOpen className="mr-2 text-gray-500" size={14} />
                                            My Orders
                                        </Link>
                                        <Link
                                            href="/products/manage"
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <FaTags className="mr-2 text-gray-500" size={14} />
                                            Manage Products
                                        </Link>
                                        <div className="border-t border-gray-100">
                                            <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                                                <FaSignOutAlt className="mr-2" size={14} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/login"
                                    className={`flex items-center gap-1.5 font-medium ${isScrolled ? 'text-gray-600 hover:text-blue-600' : 'text-white'} transition-colors`}
                                >
                                    <FaSignInAlt size={16} />
                                    <span>Login</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className={`px-4 py-1.5 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-1.5 font-medium shadow-sm`}
                                >
                                    <FaUserPlus size={16} />
                                    <span>Register</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <Link href="/cart" className="relative">
                            <FaShoppingCart size={20} className={`${isScrolled ? 'text-gray-600' : 'text-white'}`} />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>
                            )}
                        </Link>
                        <button onClick={toggleMobileMenu} className="focus:outline-none">
                            <div
                                className={`block w-6 transform transition-all duration-300 ${isScrolled ? 'bg-gray-600' : 'bg-white'} h-0.5 m-1.5 ${
                                    isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                                }`}
                            ></div>
                            <div
                                className={`block w-6 ${isScrolled ? 'bg-gray-600' : 'bg-white'} h-0.5 m-1.5 ${
                                    isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                                } transition-opacity duration-300`}
                            ></div>
                            <div
                                className={`block w-6 transform transition-all duration-300 ${isScrolled ? 'bg-gray-600' : 'bg-white'} h-0.5 m-1.5 ${
                                    isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                                }`}
                            ></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-96 py-4' : 'max-h-0'} ${
                    isScrolled ? 'bg-white text-gray-800' : 'bg-blue-800 text-white'
                }`}
            >
                <div className="container mx-auto px-4 space-y-3">
                    <Link href="/products" className="flex items-center py-2 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        Products
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <div className="py-2 border-t border-blue-600 mt-2">
                                <p className="text-sm mb-1 opacity-90 font-medium">My Account</p>
                                <Link href="/profile" className="flex items-center py-2 font-medium hover:text-blue-300" onClick={() => setIsMobileMenuOpen(false)}>
                                    <FaUser className="mr-2" size={14} />
                                    My Profile
                                </Link>
                                <Link href="/customer" className="flex items-center py-2 font-medium hover:text-blue-300" onClick={() => setIsMobileMenuOpen(false)}>
                                    <FaAddressCard className="mr-2" size={14} />
                                    Account Details
                                </Link>
                                <Link href="/orders" className="flex items-center py-2 font-medium hover:text-blue-300" onClick={() => setIsMobileMenuOpen(false)}>
                                    <FaBoxOpen className="mr-2" size={14} />
                                    My Orders
                                </Link>
                                <Link href="/products/manage" className="flex items-center py-2 font-medium hover:text-blue-300" onClick={() => setIsMobileMenuOpen(false)}>
                                    <FaTags className="mr-2" size={14} />
                                    Manage Products
                                </Link>
                            </div>
                            <div className="border-t border-blue-600 pt-2">
                                <button onClick={handleLogout} className="flex items-center w-full text-left py-2 font-medium text-red-300 hover:text-red-200">
                                    <FaSignOutAlt className="mr-2" size={14} />
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="border-t border-blue-600 mt-2 pt-2 space-y-3">
                            <Link href="/login" className="flex items-center py-2 font-medium hover:text-blue-300" onClick={() => setIsMobileMenuOpen(false)}>
                                <FaSignInAlt className="mr-2" size={14} />
                                Login
                            </Link>
                            <Link href="/register" className="flex items-center py-2 font-medium hover:text-blue-300" onClick={() => setIsMobileMenuOpen(false)}>
                                <FaUserPlus className="mr-2" size={14} />
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
