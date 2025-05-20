'use client';

import { useState } from 'react';

const ProductFilter = ({ categories, onFilterChange, initialFilters = {} }) => {
    const [filters, setFilters] = useState({
        categoryId: initialFilters.categoryId || '',
        minPrice: initialFilters.minPrice || 0,
        maxPrice: initialFilters.maxPrice || 1000,
        minRating: initialFilters.minRating || 0,
        search: initialFilters.search || '',
    });

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRatingChange = e => {
        setFilters(prev => ({
            ...prev,
            minRating: e.target.value,
        }));
    };

    const applyFilters = () => {
        onFilterChange(filters);
    };

    const resetFilters = () => {
        const resetValues = {
            categoryId: '',
            minPrice: 0,
            maxPrice: 1000,
            minRating: 0,
            search: '',
        };
        setFilters(resetValues);
        onFilterChange(resetValues);
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>

            {/* Search */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Search</label>
                <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search products..."
                />
            </div>

            {/* Category Filter */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                    name="categoryId"
                    value={filters.categoryId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Price Range */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleInputChange}
                        className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="Min"
                    />
                    <span>-</span>
                    <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleInputChange}
                        className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="Max"
                    />
                </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Minimum Rating: {filters.minRating}</label>
                <input type="range" min="0" max="5" step="0.5" value={filters.minRating} onChange={handleRatingChange} className="w-full" />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
                <button onClick={applyFilters} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200">
                    Apply Filters
                </button>
                <button onClick={resetFilters} className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition duration-200">
                    Reset
                </button>
            </div>
        </div>
    );
};

export default ProductFilter;
