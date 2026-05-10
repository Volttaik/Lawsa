/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [{ protocol: 'https', hostname: '**' }],
        unoptimized: true,
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '500mb',
        },
    },
};

export default nextConfig;
