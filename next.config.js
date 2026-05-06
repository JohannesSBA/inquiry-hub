/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  transpilePackages: [
    "@neondatabase/auth",
    "@neondatabase/neon-js",
    "better-auth",
    "jose",
  ],
};

module.exports = nextConfig;
