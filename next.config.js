/** @type {import('next').NextConfig} */
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
        hostname: "energetic-clownfish-28.convex.cloud",
        pathname: "/**", // ✅ Fix here
      },
    ],
  },
};

export default nextConfig;
