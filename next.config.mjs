/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    // Images can be up to 8 MB — raise the body limit to match.
    bodySizeLimit: "8mb"
  },
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
