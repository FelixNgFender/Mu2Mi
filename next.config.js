const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        instrumentationHook: true,
    },
    webpack: (config) => {
        config.externals.push('@node-rs/argon2', '@node-rs/bcrypt');
        return config;
    },
    logging: {
        fetches: {
            fullUrl: true,
        },
    },
};

module.exports = withBundleAnalyzer(nextConfig);
