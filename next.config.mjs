/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/programs", destination: "/events", permanent: true },
      { source: "/programs/:slug", destination: "/events", permanent: true }
    ];
  }
};

export default nextConfig;
