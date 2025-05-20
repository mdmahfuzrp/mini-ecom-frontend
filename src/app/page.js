'use client';
import ProductCard from '@/components/product/ProductCard';
import { productsApi, categoriesApi } from '../utils/api';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log('Starting API requests from Home page');

                // Fetch featured products (highest rated)
                console.log('Fetching featured products...');
                const productsResponse = await productsApi.getFeatured(4);
                console.log('Featured products response:', productsResponse);

                // Set products from the response data
                const processedResponse = productsApi.processResponse(productsResponse);
                console.log('Processed products:', processedResponse);
                setFeaturedProducts(processedResponse.products);

                // Fetch categories
                console.log('Fetching categories...');
                const categoriesResponse = await categoriesApi.getAll();
                console.log('Categories response:', categoriesResponse);

                // Set categories from the response data
                const processedCategories = categoriesApi.processResponse(categoriesResponse);
                console.log('Processed categories:', processedCategories);
                setCategories(processedCategories);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching homepage data:', error);
                if (error.response) {
                    console.error('Error response:', error.response.status, error.response.data);
                } else if (error.request) {
                    console.error('No response received:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
                setFeaturedProducts([]);
                setCategories([]);
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array to run only once on mount

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative bg-gray-900 text-white rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-90"></div>
                <div className="relative container mx-auto px-6 py-16 flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">Welcome to Mini E-Commerce</h1>
                    <p className="text-xl mb-8 max-w-2xl text-white drop-shadow-sm">Discover amazing products at unbeatable prices. Shop now and experience the difference!</p>
                    <Link href="/products" className="bg-white text-blue-700 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition duration-300 shadow-md">
                        Browse Products
                    </Link>
                </div>
            </section>

            {/* Featured Categories */}
            <section className="py-8">
                <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {loading
                        ? // Loading skeleton for categories
                          Array(4)
                              .fill(0)
                              .map((_, index) => (
                                  <div key={index} className="bg-gray-100 p-6 rounded-lg animate-pulse">
                                      <div className="h-5 bg-gray-200 rounded"></div>
                                  </div>
                              ))
                        : categories.map(category => (
                              <Link key={category.id} href={`/products?categoryId=${category.id}`}>
                                  <div className="bg-gray-100 p-6 rounded-lg text-center hover:shadow-lg transition duration-300 border border-gray-200">
                                      <h3 className="font-semibold text-gray-800">{category.name}</h3>
                                      {category.description && <p className="text-sm text-gray-600 mt-2">{category.description}</p>}
                                  </div>
                              </Link>
                          ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Featured Products</h2>
                    <Link href="/products" className="text-blue-600 hover:underline">
                        View All
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {loading
                        ? // Loading skeleton for products
                          Array(4)
                              .fill(0)
                              .map((_, index) => (
                                  <div key={index} className="border rounded-lg overflow-hidden animate-pulse">
                                      <div className="h-48 bg-gray-200"></div>
                                      <div className="p-4 space-y-2">
                                          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                          <div className="flex justify-between pt-2">
                                              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                                              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                                          </div>
                                      </div>
                                  </div>
                              ))
                        : featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-8 bg-gray-50 -mx-4 px-4 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Why Shop With Us</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                        <div className="text-blue-600 text-4xl mb-3">🚚</div>
                        <h3 className="font-semibold mb-2 text-gray-800">Free Shipping</h3>
                        <p className="text-gray-700">On all orders over $50</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-blue-600 text-4xl mb-3">🔒</div>
                        <h3 className="font-semibold mb-2 text-gray-800">Secure Payment</h3>
                        <p className="text-gray-700">100% secure payment</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-blue-600 text-4xl mb-3">♻️</div>
                        <h3 className="font-semibold mb-2 text-gray-800">Easy Returns</h3>
                        <p className="text-gray-700">30 day return policy</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
