/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost', 'via.placeholder.com', 'placehold.co', 'placekitten.com'],
        unoptimized: process.env.NODE_ENV === 'development',
    },
};

export default nextConfig;
