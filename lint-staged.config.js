export default {
  'src/**/*': (filenames) => [
    `pnpm format:fix ${filenames.join(' ')}`,
    `pnpm lint:fix ${filenames.join(' ')}`,
    'pnpm typecheck',
  ],
  '*/**.{json,css,html,md,mdx}': ['pnpm format:fix'],
};
