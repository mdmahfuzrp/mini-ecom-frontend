'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { productsApi } from '@/utils/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { FaEdit } from 'react-icons/fa';

export default function ProductPage() {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const router = useRouter();
    const params = useParams();
    const id = params.id;
    const { addToCart } = useCart();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await productsApi.getById(id);

                // Extract the product data using our helper
                const productData = response.data?.product || response.data;
                setProduct(productData);

                setLoading(false);
            } catch (err) {
                console.log('Error fetching product:', err);
                setError('Failed to fetch product. Please try again later.');
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleQuantityChange = e => {
        const value = parseInt(e.target.value);
        setQuantity(value < 1 ? 1 : value);
    };

    const handleAddToCart = () => {
        if (product) {
            // Use the cart context instead of making an API call
            addToCart(product, quantity);
            router.push('/cart');
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading product details...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    if (!product) {
        return <div className="text-center py-10">Product not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Product Image */}
                <div className="w-full md:w-1/2">
                    <div className="bg-gray-100 rounded-lg overflow-hidden h-[400px] relative">
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name || 'Product'}
                                fill
                                className="object-contain"
                                unoptimized={!product.image.startsWith('/')} // Unoptimize external URLs
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">No Image Available</div>
                        )}
                    </div>
                </div>

                {/* Product Details */}
                <div className="w-full md:w-1/2">
                    <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}>
                                    ★
                                </span>
                            ))}
                            <span className="ml-2 text-gray-600">({product.rating ? parseFloat(product.rating).toFixed(1) : '0.0'})</span>
                        </div>

                        {isAuthenticated && user && product.userId === user.id && (
                            <Link href={`/products/manage?edit=${product.id}`} className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700">
                                <FaEdit /> Edit Product
                            </Link>
                        )}
                    </div>

                    <div className="text-2xl font-bold mb-4 text-blue-600">${parseFloat(product.price || 0).toFixed(2)}</div>

                    <p className="text-gray-700 mb-6">{product.description || 'No description available.'}</p>

                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-1">Category:</p>
                        <p className="font-medium">{product.category?.name || 'Uncategorized'}</p>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-1">Availability:</p>
                        <p className={`font-medium ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.countInStock > 0 ? `In Stock (${product.countInStock} available)` : 'Out of Stock'}
                        </p>
                    </div>

                    {product.countInStock > 0 && (
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="w-24">
                                <label htmlFor="quantity" className="text-sm text-gray-500 mb-1 block">
                                    Quantity:
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    max={product.countInStock}
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-black"
                                />
                            </div>

                            <button
                                onClick={handleAddToCart}
                                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-200 flex-grow cursor-pointer"
                            >
                                Add to Cart
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
