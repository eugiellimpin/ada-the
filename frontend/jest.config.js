// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  moduleNameMapper: {
    // To make lodash-es work with Jest. See https://stackoverflow.com/a/54117206
    '^lodash-es$': 'lodash',
    // handle CSS imports
    '\\.(css|scss)$': 'identity-obj-proxy',
    ky: 'ky/umd',
  },
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  clearMocks: true,
  setupFilesAfterEnv: [
    'isomorphic-fetch'
  ],
};
