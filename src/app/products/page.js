'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { productsApi, categoriesApi } from '../../utils/api';
import { useCart } from '../../contexts/CartContext'; // Updated import path

// Debounce function to prevent too many API calls
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart(); // Get addToCart function from cart context

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 9, // Default number of items per page
    });

    // Server-side filter state (these trigger API calls when changed)
    const [activeFilters, setActiveFilters] = useState({
        categoryId: '',
        minPrice: 0,
        maxPrice: 1000,
        search: '',
        minRating: 0,
    });

    // UI state for filters (these don't trigger API calls until applied)
    const [localFilters, setLocalFilters] = useState({
        categoryId: '',
        minPrice: 0,
        maxPrice: 1000,
        search: '',
        minRating: 0,
    });

    // Track if filters have been modified
    const [filtersModified, setFiltersModified] = useState(false);

    // Use debounced search to avoid too many API calls when typing
    const debouncedSearch = useDebounce(activeFilters.search, 500);

    // Initial load of categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoriesResponse = await categoriesApi.getAll();
                setCategories(categoriesApi.processResponse(categoriesResponse));
            } catch (err) {
                console.log('Error fetching categories:', err);
            }
        };

        loadCategories();
    }, []);

    // Load products when activeFilters change
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                // Prepare filter params
                const params = {
                    page: pagination.currentPage,
                    limit: pagination.itemsPerPage,
                };

                if (activeFilters.categoryId) {
                    params.categoryId = activeFilters.categoryId;
                }

                if (activeFilters.minPrice > 0) {
                    params.minPrice = activeFilters.minPrice;
                }

                if (activeFilters.maxPrice < 1000) {
                    params.maxPrice = activeFilters.maxPrice;
                }

                if (debouncedSearch) {
                    params.search = debouncedSearch;
                }

                if (activeFilters.minRating > 0) {
                    params.minRating = activeFilters.minRating;
                }

                console.log('Applying filters:', params);

                // Fetch products with filters
                const productsResponse = await productsApi.getAll(params);
                console.log('Products API Response:', productsResponse);

                // Process response which now includes pagination data
                const { products: fetchedProducts, totalPages, currentPage, totalItems } = productsApi.processResponse(productsResponse);

                // Update products and pagination state
                setProducts(fetchedProducts);
                setPagination(prev => ({
                    ...prev,
                    currentPage: currentPage,
                    totalPages: totalPages,
                    totalItems: totalItems,
                }));

                setLoading(false);
            } catch (err) {
                console.log('Error fetching products:', err);
                setError('Failed to fetch products. Please try again later.');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeFilters, debouncedSearch, pagination.currentPage, pagination.itemsPerPage]);

    // Handler for adding items to cart
    const handleAddToCart = product => {
        // Check if product data is valid
        if (!product || !product.id) {
            console.log('Invalid product data:', product);
            return;
        }

        try {
            // Check if addToCart is available
            if (typeof addToCart !== 'function') {
                console.log('addToCart is not a function:', addToCart);
                return;
            }

            // Add the item to the cart
            addToCart(product, 1);

            console.log(`Product added to cart: ${product.name}`);
        } catch (err) {
            console.log('Error adding to cart:', err);
        }
    };

    // Update local filter state
    const updateLocalFilter = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value,
        }));
        setFiltersModified(true);
    };

    // Update local search filter
    const handleLocalSearchChange = e => {
        updateLocalFilter('search', e.target.value);
    };

    // Update local category filter
    const handleLocalCategoryChange = e => {
        updateLocalFilter('categoryId', e.target.value);
    };

    // Update local price range filter
    const handleLocalPriceChange = (e, type) => {
        const value = Number(e.target.value);
        setLocalFilters(prev => ({
            ...prev,
            [type === 'min' ? 'minPrice' : 'maxPrice']: value,
        }));
        setFiltersModified(true);
    };

    // Update local rating filter
    const handleLocalRatingChange = e => {
        updateLocalFilter('minRating', Number(e.target.value));
    };

    // Apply all filters at once
    const applyFilters = () => {
        setActiveFilters({ ...localFilters });
        setFiltersModified(false);

        // Reset to first page when applying new filters
        setPagination(prev => ({
            ...prev,
            currentPage: 1,
        }));
    };

    // Reset all filters to default values
    const resetFilters = () => {
        const defaultFilters = {
            categoryId: '',
            minPrice: 0,
            maxPrice: 1000,
            search: '',
            minRating: 0,
        };

        setLocalFilters(defaultFilters);
        setActiveFilters(defaultFilters);
        setFiltersModified(false);

        // Reset to first page when filters are reset
        setPagination(prev => ({
            ...prev,
            currentPage: 1,
        }));
    };

    // Handle page change
    const handlePageChange = newPage => {
        // Scroll to top when changing page
        window.scrollTo(0, 0);

        setPagination(prev => ({
            ...prev,
            currentPage: newPage,
        }));
    };

    // Generate pagination buttons
    const renderPaginationButtons = () => {
        if (pagination.totalPages <= 1) return null;

        const buttons = [];
        const maxVisibleButtons = 5;

        // Add "Previous" button
        buttons.push(
            <button
                key="prev"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-1 mx-1 rounded ${
                    pagination.currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
            >
                &laquo; Prev
            </button>,
        );

        // Calculate range of page numbers to show
        let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisibleButtons / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxVisibleButtons - 1);

        // Adjust if we're near the end
        if (endPage - startPage + 1 < maxVisibleButtons) {
            startPage = Math.max(1, endPage - maxVisibleButtons + 1);
        }

        // Add first page and ellipsis if needed
        if (startPage > 1) {
            buttons.push(
                <button key="1" onClick={() => handlePageChange(1)} className="px-3 py-1 mx-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200">
                    1
                </button>,
            );

            if (startPage > 2) {
                buttons.push(
                    <span key="start-ellipsis" className="px-2">
                        ...
                    </span>,
                );
            }
        }

        // Add page number buttons
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-1 mx-1 rounded ${pagination.currentPage === i ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                    {i}
                </button>,
            );
        }

        // Add last page and ellipsis if needed
        if (endPage < pagination.totalPages) {
            if (endPage < pagination.totalPages - 1) {
                buttons.push(
                    <span key="end-ellipsis" className="px-2">
                        ...
                    </span>,
                );
            }

            buttons.push(
                <button
                    key={pagination.totalPages}
                    onClick={() => handlePageChange(pagination.totalPages)}
                    className="px-3 py-1 mx-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                    {pagination.totalPages}
                </button>,
            );
        }

        // Add "Next" button
        buttons.push(
            <button
                key="next"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-1 mx-1 rounded ${
                    pagination.currentPage === pagination.totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
            >
                Next &raquo;
            </button>,
        );

        return buttons;
    };

    if (loading) {
        return <div className="text-center py-10 text-gray-800 font-medium bg-gray-50 border border-gray-200 rounded-lg shadow-sm">Loading products...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-700 font-medium bg-red-50 rounded-lg border border-red-200 mx-auto max-w-2xl p-4 shadow-sm">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-white">All Products</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full md:w-1/4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Filters</h2>

                    {/* Search */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Search</label>
                        <input
                            type="text"
                            value={localFilters.search}
                            onChange={handleLocalSearchChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 placeholder-gray-500"
                            placeholder="Search products..."
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                        <select
                            value={localFilters.categoryId}
                            onChange={handleLocalCategoryChange}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                        >
                            <option value="">All Categories</option>
                            {Array.isArray(categories) &&
                                categories.map(category => (
                                    <option key={category?.id || Math.random()} value={category?.id || ''}>
                                        {category?.name || 'Unnamed Category'}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">Price Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={localFilters.minPrice}
                                onChange={e => handleLocalPriceChange(e, 'min')}
                                className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                                min="0"
                                placeholder="Min"
                            />
                            <span className="text-gray-700">-</span>
                            <input
                                type="number"
                                value={localFilters.maxPrice}
                                onChange={e => handleLocalPriceChange(e, 'max')}
                                className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
                                min="0"
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                            Minimum Rating: <span className="font-semibold text-blue-600">{localFilters.minRating}</span>
                        </label>
                        <input type="range" min="0" max="5" step="0.5" value={localFilters.minRating} onChange={handleLocalRatingChange} className="w-full accent-blue-600" />
                    </div>

                    {/* Apply Filters Button */}
                    <button
                        onClick={applyFilters}
                        disabled={!filtersModified}
                        className={`w-full mb-2 py-2 px-4 rounded text-white font-medium shadow-sm border ${
                            filtersModified ? 'bg-blue-600 hover:bg-blue-700 border-blue-700' : 'bg-blue-400 cursor-not-allowed border-blue-400'
                        }`}
                    >
                        Apply Filters
                    </button>

                    {/* Reset Filters */}
                    <button
                        onClick={resetFilters}
                        className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-200 font-medium shadow-sm border border-gray-300"
                    >
                        Reset Filters
                    </button>
                </div>

                {/* Products Grid */}
                <div className="w-full md:w-3/4">
                    {products.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-gray-700 font-medium">No products found matching your criteria.</p>
                            <button onClick={resetFilters} className="mt-4 text-blue-600 hover:text-blue-800 hover:underline font-medium">
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.isArray(products) &&
                                    products.map(product => (
                                        <div key={product?.id || Math.random()} className="border rounded-lg overflow-hidden hover:shadow-lg transition duration-300 bg-white">
                                            <div className="h-48 bg-gray-200 relative">
                                                {product?.image ? (
                                                    <Image
                                                        src={product.image}
                                                        alt={product?.name || 'Product'}
                                                        layout="fill"
                                                        objectFit="cover"
                                                        unoptimized={!product.image.startsWith('/')} // Unoptimize external URLs
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-gray-800">{product?.name || 'Unnamed Product'}</h3>
                                                <p className="text-gray-600 text-sm mb-2">{product?.category?.name || 'Uncategorized'}</p>

                                                {/* Stock Status */}
                                                <div className="mb-2">
                                                    {product?.countInStock > 0 ? (
                                                        <p className="text-sm">
                                                            <span className="text-green-600 font-medium">In Stock</span>
                                                            <span className="text-gray-500 ml-1">({product.countInStock} available)</span>
                                                        </p>
                                                    ) : (
                                                        <p className="text-sm text-red-600 font-medium">Out of Stock</p>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-blue-600">${parseFloat(product?.price || 0).toFixed(2)}</span>
                                                    <div className="flex items-center">
                                                        <span className="text-yellow-500">★</span>
                                                        <span className="ml-1 text-gray-700">{product?.rating ? parseFloat(product.rating).toFixed(1) : '0.0'}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 flex space-x-2">
                                                    <Link
                                                        href={`/product/${product?.id || ''}`}
                                                        className="bg-blue-600 text-white py-1 px-3 rounded text-sm flex-1 text-center hover:bg-blue-700 shadow-sm"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={!(product?.countInStock > 0)}
                                                        className={`py-1 px-3 rounded text-sm shadow-sm cursor-pointer ${
                                                            product?.countInStock > 0
                                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* Pagination UI */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
                                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> -{' '}
                                                    <span className="font-medium">{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}</span> of{' '}
                                                    <span className="font-medium">{pagination.totalItems}</span> products
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-700 mr-2">Items per page:</span>
                                                <select
                                                    value={pagination.itemsPerPage}
                                                    onChange={e => {
                                                        const newItemsPerPage = Number(e.target.value);
                                                        setPagination(prev => ({
                                                            ...prev,
                                                            itemsPerPage: newItemsPerPage,
                                                            currentPage: 1, // Reset to first page when changing items per page
                                                        }));
                                                    }}
                                                    className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value={6}>6</option>
                                                    <option value={9}>9</option>
                                                    <option value={12}>12</option>
                                                    <option value={24}>24</option>
                                                </select>
                                                <div className="ml-4">
                                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                        {renderPaginationButtons()}
                                                    </nav>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mobile Pagination */}
                                        <div className="flex sm:hidden justify-between w-full">
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                                    pagination.currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            <p className="text-sm text-gray-700 self-center">
                                                Page {pagination.currentPage} of {pagination.totalPages}
                                            </p>
                                            <button
                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md ${
                                                    pagination.currentPage === pagination.totalPages
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
