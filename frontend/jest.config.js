module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    moduleNameMapper: {
      "\\.(css|scss|sass)$": "identity-obj-proxy"
    },
  };
  