'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { productsApi, categoriesApi } from '@/utils/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ManageProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image: '',
        categoryId: '',
    });
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();

    // Fetch products and categories when component mounts
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user's products
                const productsResponse = await productsApi.getAll({ userId: user.id });
                const { products: productsList } = productsApi.processResponse(productsResponse);
                setProducts(Array.isArray(productsList) ? productsList : []);

                // Fetch categories for product form
                const categoriesResponse = await categoriesApi.getAll();
                const categoriesList = categoriesApi.processResponse(categoriesResponse);
                setCategories(Array.isArray(categoriesList) ? categoriesList : []);

                setLoading(false);
            } catch (err) {
                console.log('Error fetching data:', err);
                setError('Failed to load data. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated, user, router]);

    const handleCreateEdit = async e => {
        e.preventDefault();

        try {
            setLoading(true);
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                countInStock: parseInt(formData.stock, 10),
                categoryId: parseInt(formData.categoryId, 10),
            };

            let response;
            if (editingProduct) {
                // Update existing product
                response = await productsApi.update(editingProduct.id, productData);
                setProducts(prevProducts => prevProducts.map(product => (product.id === editingProduct.id ? { ...response.data.product } : product)));
            } else {
                // Create new product
                response = await productsApi.create(productData);
                setProducts(prevProducts => [...prevProducts, response.data.product]);
            }

            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                image: '',
                categoryId: '',
            });
            setShowForm(false);
            setEditingProduct(null);
            setLoading(false);
        } catch (err) {
            console.log('Error saving product:', err);
            setError(err.response?.data?.message || 'Failed to save product. Please try again.');
            setLoading(false);
        }
    };

    const handleDelete = async productId => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            setLoading(true);
            await productsApi.delete(productId);
            setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
            setLoading(false);
        } catch (err) {
            console.log('Error deleting product:', err);
            setError(err.response?.data?.message || 'Failed to delete product. Please try again.');
            setLoading(false);
        }
    };

    const handleEdit = product => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.countInStock !== undefined ? product.countInStock.toString() : '0',
            image: product.image || '',
            categoryId: product.categoryId.toString(),
        });
        setShowForm(true);
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to manage your products</h1>
                <Link href="/login" className="text-blue-600 hover:underline">
                    Go to Login
                </Link>
            </div>
        );
    }

    if (loading && products.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Your Products</h1>
                <div className="text-center py-10">
                    <div
                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                    >
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                    </div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-4">Manage Your Products</h1>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            <div className="mb-6">
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                            name: '',
                            description: '',
                            price: '',
                            stock: '',
                            image: '',
                            categoryId: '',
                        });
                        setShowForm(!showForm);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    {showForm ? 'Cancel' : 'Add New Product'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white shadow-md rounded p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>

                    <form onSubmit={handleCreateEdit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                    Product Name*
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryId">
                                    Category*
                                </label>
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                                    Price*
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stock">
                                    Stock*
                                </label>
                                <input
                                    type="number"
                                    id="stock"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                                Image URL
                            </label>
                            <input
                                type="text"
                                id="image"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2">
                                Cancel
                            </button>
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" disabled={loading}>
                                {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {products.length === 0 ? (
                <div className="bg-white shadow-md rounded p-6 text-center">
                    <p className="text-gray-700 mb-4">You haven&apos;t created any products yet.</p>
                    <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                        Create Your First Product
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full object-cover" src={product.image || 'https://via.placeholder.com/150'} alt={product.name} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">${parseFloat(product.price).toFixed(2)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.countInStock || 0}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/product/${product.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                                            View
                                        </Link>
                                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
