'use client';

import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrash, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';

export default function CartPage() {
    const { cart, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleQuantityChange = (productId, newQuantity) => {
        updateQuantity(productId, parseInt(newQuantity));
    };

    const handleRemoveItem = productId => {
        removeFromCart(productId);
    };

    const handleClearCart = () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            clearCart();
        }
    };

    const proceedToCheckout = () => {
        setIsSubmitting(true);

        try {
            // Redirect to checkout - using Next.js router for proper navigation
            router.push('/checkout');
        } catch (error) {
            console.log('Error navigating to checkout', error);
        } finally {
            // Reset submitting state after a short delay
            setTimeout(() => {
                setIsSubmitting(false);
            }, 300);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-gray-400 text-5xl mb-4">
                    <FaShoppingCart className="mx-auto" />
                </div>
                <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
                <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any products to your cart yet.</p>
                <Link href="/products" className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 inline-flex items-center">
                    <FaArrowLeft className="mr-2" /> Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center">
                <FaShoppingCart className="mr-3" /> Your Shopping Cart
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="hidden md:grid md:grid-cols-5 bg-gray-100 p-4 text-gray-600 text-sm font-semibold">
                            <div className="col-span-2">Product</div>
                            <div>Price</div>
                            <div>Quantity</div>
                            <div>Subtotal</div>
                        </div>

                        {cart?.map(item => (
                            <div key={item.id} className="border-t first:border-t-0 p-4">
                                <div className="md:grid md:grid-cols-5 gap-4 items-center">
                                    {/* Product */}
                                    <div className="md:col-span-2 flex items-center mb-4 md:mb-0 text-gray-600">
                                        <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0 mr-4 text-gray-600 relative">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    unoptimized={!item.image.startsWith('/')} // Unoptimize external URLs
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{item.name}</h3>
                                            {/* Stock information */}
                                            {item.countInStock > 0 ? (
                                                <p className="text-xs text-green-600">In Stock: {item.countInStock} available</p>
                                            ) : (
                                                <p className="text-xs text-red-600 font-medium">Out of Stock</p>
                                            )}
                                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 text-sm flex items-center mt-1 hover:text-red-700">
                                                <FaTrash className="mr-1" size={12} /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-4 md:mb-0 text-gray-600">
                                        <div className="md:hidden text-sm text-gray-600 mb-1 ">Price:</div>${parseFloat(item.price || 0).toFixed(2)}
                                    </div>

                                    {/* Quantity */}
                                    <div className="mb-4 md:mb-0 text-gray-600">
                                        <div className="md:hidden text-sm text-gray-600 mb-1">Quantity:</div>
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.countInStock || 1}
                                            value={item.quantity > (item.countInStock || 0) ? item.countInStock || 1 : item.quantity}
                                            onChange={e => handleQuantityChange(item.id, e.target.value)}
                                            className={`w-16 p-1 border rounded text-center ${!item.countInStock || item.countInStock < 1 ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            disabled={!item.countInStock || item.countInStock < 1}
                                        />
                                        {item.quantity > (item.countInStock || 0) && item.countInStock > 0 && (
                                            <p className="text-xs text-orange-500 mt-1">Adjusted to max available</p>
                                        )}
                                    </div>

                                    {/* Subtotal */}
                                    <div className="text-gray-600">
                                        <div className="md:hidden text-sm text-gray-600 mb-1">Subtotal:</div>
                                        <span className="font-semibold">${(parseFloat(item.price || 0) * parseInt(item.quantity || 1)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="p-4 border-t">
                            <div className="flex justify-between items-center">
                                <button onClick={handleClearCart} className="text-red-500 hover:text-red-700">
                                    Clear Cart
                                </button>
                                <Link href="/products" className="text-blue-600 hover:text-blue-800 flex items-center">
                                    <FaArrowLeft className="mr-2" /> Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4 text-gray-600">Order Summary</h2>

                        <div className="border-b pb-4 mb-4">
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span className="text-gray-600">Subtotal</span>
                                <span>${parseFloat(totalPrice || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span className="text-gray-600">Shipping</span>
                                <span>Free</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span className="text-gray-600">Tax</span>
                                <span>${(parseFloat(totalPrice || 0) * 0.07).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between mb-6 text-gray-600">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-lg">${(parseFloat(totalPrice || 0) + parseFloat(totalPrice || 0) * 0.07).toFixed(2)}</span>
                        </div>

                        {/* Out of stock warning */}
                        {cart.some(item => !item.countInStock || item.countInStock < 1) && (
                            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                <p className="font-medium">Some items are out of stock</p>
                                <p>Please remove out-of-stock items before proceeding.</p>
                            </div>
                        )}

                        <button
                            onClick={proceedToCheckout}
                            disabled={isSubmitting || cart.some(item => !item.countInStock || item.countInStock < 1)}
                            className={`w-full py-3 rounded-lg text-white font-bold ${
                                isSubmitting || cart.some(item => !item.countInStock || item.countInStock < 1) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isSubmitting ? 'Processing...' : 'Proceed to Checkout'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
