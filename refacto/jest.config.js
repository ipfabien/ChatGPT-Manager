module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json'],
  transform: {},
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
}; 