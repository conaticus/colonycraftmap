import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: "/tiles/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, s-maxage=31536000",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "ETag",
            value: `W/"tiles-v${process.env.NEXT_PUBLIC_TILE_VERSION}"`,
          },
        ],
      },
      {
        source: "/:path*.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
};

export default nextConfig;
