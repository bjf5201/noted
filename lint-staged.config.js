export default {
  // run typecheck project-wide
  '**/*.{ts,tsx}': [() => 'tsc --noEmit'],

  // run formatting and linting on staged files only
  '**/*.{ts,tsx,js,jsx}': (filenames) => [
    `pnpm exec prettier --write ${filenames.join(' ')}`,
    `pnpm exec eslint --fix --quiet ${filenames.join(' ')}`
  ],

  // format non-typescript files
  '**/*.{json,css,html,md,mdx}': ['pnpm exec prettier --write']
};
