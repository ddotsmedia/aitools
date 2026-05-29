import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const monorepoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@hub/ui", "@hub/types"],
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  outputFileTracingRoot: monorepoRoot,
};
export default nextConfig;
