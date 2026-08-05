export default {
  // run typecheck project-wide
  'src/**/*.{ts,tsx}': [() => 'pnpm typecheck'],

  // run formatting and linting on staged files only
  '**/*.{ts,tsx,js,jsx}': (filenames) => [
    `pnpm format ${filenames.join(' ')}`,
    `pnpm lint ${filenames.join(' ')}`,
  ],

  // format non-typescript files
  '**/*.{json,css,html,md,mdx}': ['pnpm format'],
};
