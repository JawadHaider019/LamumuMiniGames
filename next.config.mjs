/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // 👈 enables static export
  images: {
    unoptimized: true,
  },
  basePath: '/lamumu-games', // 👈 replace with your repo name
  assetPrefix: '/lamumu-games/',
};

export default nextConfig;
