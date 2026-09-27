export default {
  testEnvironment: "node",

  extensionsToTreatAsEsm: [".ts"],

  transform: {
    "^.+\\.ts$": "babel-jest",
  },

  roots: ["<rootDir>/src"],

  testMatch: ["**/*.test.ts"],

  clearMocks: true,
};
