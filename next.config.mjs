/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/programs", destination: "/events", permanent: true },
      { source: "/programs/:slug", destination: "/events", permanent: true },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.myo.camp" }],
        destination: "https://myo.camp/:path*",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
