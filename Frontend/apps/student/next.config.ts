import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@capstone/ui", "@capstone/types", "@capstone/api-client"],
  outputFileTracingRoot: monorepoRoot,
  devIndicators: false,
};

export default nextConfig;
