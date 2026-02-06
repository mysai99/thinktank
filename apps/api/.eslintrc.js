module.exports = {
  root: true,
  extends: ['@thinktank/eslint-config/node'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
