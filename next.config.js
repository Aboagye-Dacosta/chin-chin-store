/** @type {import('next').NextConfig} */
const baseUrl = process.env.BASE_URL
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: baseUrl,
        pathname: "/**", // ✅ Fix here
      },
    ],
  },
};

export default nextConfig;
