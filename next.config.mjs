/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "plwijljbqehnmjllwkbk.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
    ],
  },

  reactCompiler: true,
};

export default nextConfig;
