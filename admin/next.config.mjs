/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  images: {
    remotePatterns: [
      // Local IP image server
      {
        protocol: "http",
        hostname: "192.168.1.51",
        port: "6006",
        pathname: "/storage/**",
      },

      // Another local IP (previously in domains)
      {
        protocol: "http",
        hostname: "192.168.1.27",
        pathname: "/**",
      },

      // Flag CDN (HTTPS)
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },

      // Uncomment if you use Google profile images
      // {
      //   protocol: "https",
      //   hostname: "lh3.googleusercontent.com",
      //   pathname: "/**",
      // },
    ],
  },
};

export default nextConfig;