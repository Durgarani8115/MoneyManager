import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ESM context
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'randomuser.me',
            },
        ],
    },

    experimental: {
        serverActions: {
            bodySizeLimit: '5mb',
        },
    },
    // In monorepo setups Next may infer the wrong root when multiple lockfiles exist.
    // Set outputFileTracingRoot to the parent directory so Next traces shared files
    // from the workspace root. This is harmless in single-repo setups.
    outputFileTracingRoot: path.join(__dirname, '..'),

};

export default nextConfig;
