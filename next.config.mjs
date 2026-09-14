/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Prevents duplicate Leaflet map instantiation in dev mode
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
