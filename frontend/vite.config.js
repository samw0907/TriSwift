import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./testSetup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
