module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  testPathIgnorePatterns: ["/node_modules/"],
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  }
};