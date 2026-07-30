export default {
  // run typecheck project-wide
  'src/**/*.{ts,tsx}': [() => 'pnpm typecheck', 'pnpm test'],

  // run formatting and linting on staged files only
  '**/*.{ts,tsx,js,jsx}': (filenames) => [
    `pnpm format:fix ${filenames.join(' ')}`,
    `pnpm lint:fix ${filenames.join(' ')}`,
  ],

  // format non-typescript files
  '**/*.{json,css,html,md,mdx}': ['pnpm format:fix'],
};
