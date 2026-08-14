import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output:
    process.env.NEXT_OUTPUT_STANDALONE === "true" ? "standalone" : undefined,

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
