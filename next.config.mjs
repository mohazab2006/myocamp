import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname
  },
  async redirects() {
    return [
      { source: "/programs", destination: "/events", permanent: true },
      { source: "/programs/:slug", destination: "/events", permanent: true }
    ];
  }
};

export default nextConfig;
