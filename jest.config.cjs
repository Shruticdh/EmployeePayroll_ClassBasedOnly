module.exports = {
  testEnvironment: 'jsdom', 
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js', 
    '@testing-library/jest-dom' 
  ],
  setupFiles: [], 
  moduleNameMapper: {
    '^.+\\.(css|less|scss|png|jpg|jpeg|gif|svg)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  collectCoverage: true, 
  coverageDirectory: 'coverage', 
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'], 
  coverageReporters: ['lcov']
};
