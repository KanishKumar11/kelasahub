import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // react-pdf and exceljs run only on the server; keep them out of the bundler.
  serverExternalPackages: ["@react-pdf/renderer", "exceljs"],
  // PDF routes read fonts + logo from disk; make sure serverless bundles include them.
  outputFileTracingIncludes: {
    "/api/admin/pdf/*": ["./assets/**"],
  },
  experimental: {
    // The dev cache grows to hundreds of MB; this machine's drive is nearly full.
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
