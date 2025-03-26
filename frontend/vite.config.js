import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./testSetup.js",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["tests"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
