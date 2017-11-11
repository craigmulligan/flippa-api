module.exports = {
  env: {
    node: true
  },
  parserOptions: {
    ecmaVersion: 8,
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  extends: [ 'eslint:recommended', 'prettier' ],
  rules: {
    'linebreak-style': ['error', 'unix'],
  }
};
