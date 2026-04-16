import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: process.env.GITHUB_ACTIONS ? "/Tasknest.-A-reminder-webapp" : "",
  assetPrefix: process.env.GITHUB_ACTIONS ? "/Tasknest.-A-reminder-webapp/" : undefined,
};

export default nextConfig;
