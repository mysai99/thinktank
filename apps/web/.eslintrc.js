module.exports = {
  root: true,
  extends: ['@thinktank/eslint-config/next'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
