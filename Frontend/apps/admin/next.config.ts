import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@capstone/ui", "@capstone/types", "@capstone/api-client"],
};

export default nextConfig;
