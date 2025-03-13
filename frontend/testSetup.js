import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};


afterEach(() => {
  cleanup();
});
