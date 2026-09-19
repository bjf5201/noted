const prettierConfig = {
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  printWidth: 80,
  proseWrap: 'preserve',
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
  objectWrap: 'preserve',
  overrides: [
    {
      files: '**/*.{json,jscon5,jsonc}',
      options: {
        parser: 'json',
        singleQuote: false
      }
    },
    {
      files: '**/*.{md,mdx}',
      options: {
        parser: 'mdx',
        singleQuote: false
      }
    }
  ]
};

export default prettierConfig;
