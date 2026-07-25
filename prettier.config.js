const prettierConfig = {
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  printWidth: 100,
  proseWrap: 'preserve',
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,
  overrides: [
    {
      files: '**/*.{json,jscon5,jsonc}',
      options: {
        parser: 'json',
        singleQuote: false,
      },
    },
    {
      files: '**/*.{md,mdx}',
      options: {
        parser: 'mdx',
        singleQuote: false,
      },
    },
  ],
};

export default prettierConfig;
