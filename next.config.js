/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
