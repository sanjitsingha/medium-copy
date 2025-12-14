/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "fra.cloud.appwrite.io",
      },
    ],
  },

  reactCompiler: true,
};

export default nextConfig;
