/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "^@core/(.*)$": "<rootDir>/core/$1",
    "^__mocks__/(.*)$": "<rootDir>/__mocks__/$1",
    "\\.(css|less)$": "<rootDir>/__mocks__/styles.ts",
  },

  // A preset that is used as a base for Jest's configuration
  preset: "ts-jest",
};
