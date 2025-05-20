import Link from 'next/link';
import { FaTwitter, FaFacebook, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTags } from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <div className="container mx-auto px-4 pt-12 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <FaTags className="text-blue-300 mr-2" size={24} />
                            <h3 className="text-xl font-bold">Mini E-Commerce</h3>
                        </div>
                        <p className="text-gray-200">Your one-stop shop for all your online shopping needs with the best prices and quality products.</p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-gray-200 hover:text-blue-300 transition-colors" aria-label="Twitter">
                                <FaTwitter size={20} />
                            </a>
                            <a href="#" className="text-gray-200 hover:text-blue-300 transition-colors" aria-label="Facebook">
                                <FaFacebook size={20} />
                            </a>
                            <a href="#" className="text-gray-200 hover:text-blue-300 transition-colors" aria-label="Instagram">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="text-gray-200 hover:text-blue-300 transition-colors" aria-label="LinkedIn">
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 text-blue-300">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-gray-200 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-gray-200 hover:text-white transition-colors">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-gray-200 hover:text-white transition-colors">
                                    Cart
                                </Link>
                            </li>
                            <li>
                                <Link href="/customer" className="text-gray-200 hover:text-white transition-colors">
                                    My Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 text-blue-300">Customer Service</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="#" className="text-gray-200 hover:text-white transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-200 hover:text-white transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-200 hover:text-white transition-colors">
                                    Shipping Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-gray-200 hover:text-white transition-colors">
                                    Returns & Refunds
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 text-blue-300">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center">
                                <FaPhone className="text-blue-300 mr-3" />
                                <span className="text-gray-200">(123) 456-7890</span>
                            </li>
                            <li className="flex items-center">
                                <FaEnvelope className="text-blue-300 mr-3" />
                                <span className="text-gray-200">info@miniecommerce.com</span>
                            </li>
                            <li className="flex items-start">
                                <FaMapMarkerAlt className="text-blue-300 mr-3 mt-1" />
                                <span className="text-gray-200">123 E-Commerce St, Web City, Digital State, 12345</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-200">
                    <p>&copy; {currentYear} Mini E-Commerce. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
