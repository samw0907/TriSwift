module.exports = {
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    moduleNameMapper: {
      "\\.(css|scss|sass)$": "identity-obj-proxy",
      "^react-router-dom$": "<rootDir>/node_modules/react-router-dom"
    },
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
    },
    roots: ["<rootDir>/src"]
};
