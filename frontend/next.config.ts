import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output:
    process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,

  /**
   * Same-origin proxy to the API.
   *
   * Routing browser calls through this path keeps them on the frontend's own
   * origin, so the cookies are first-party and "strict" behaves. Set
   * NEXT_PUBLIC_API_URL to "/api/backend" to use it.
   *
   * Returning a plain array means these are checked *after* the filesystem,
   * so the /api/auth/clear-session route handler still wins.
   */
  async rewrites() {
    const backend = process.env.BACKEND_API_URL;

    if (!backend) {
      return [];
    }

    return [
      {
        source: "/api/backend/:path*",
        destination: `${backend.replace(/\/+$/, "")}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
