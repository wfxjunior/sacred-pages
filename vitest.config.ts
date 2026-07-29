import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Standalone Vitest config — deliberately independent from the Lovable Vite
// wrapper (vite.config.ts) so tests never boot TanStack Start/Nitro plugins.

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // macOS AppleDouble metadata files on ExFAT volumes (._foo.test.ts) must
    // never be collected as test files.
    exclude: ["**/._*", "**/node_modules/**"],
  },
});
