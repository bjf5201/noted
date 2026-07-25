export default {
  'src/**/*.{ts,tsx}': ['pnpm typecheck'],
  '**/*.{ts,tsx,js,jsx}': (filenames) => [
    `pnpm format:fix ${filenames.join(' ')}`,
    `pnpm lint:fix ${filenames.join(' ')}`,
  ],
  '*/**.{json,css,html,md,mdx}': ['pnpm format:fix'],
};
