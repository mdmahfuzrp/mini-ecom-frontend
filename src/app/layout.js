import { Inter, Roboto_Mono } from 'next/font/google';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
    variable: '--font-roboto-mono',
    subsets: ['latin'],
});

export const metadata = {
    title: 'Mini E-Commerce Store',
    description: 'A simple e-commerce store built with Next.js',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen flex flex-col`}>
                <AuthProvider>
                    <CartProvider>
                        <Navbar />
                        <main className="flex-grow container mx-auto px-4 pt-24 pb-8">{children}</main>
                        <Footer />
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
