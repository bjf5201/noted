const seededPassword = 'Password123$';

export const seedUsers = {
  basic: {
    username: 'basic',
    email: 'basic@example.com',
    password: seededPassword
  },
  moderator: {
    username: 'moderator',
    email: 'moderator@example.com',
    password: seededPassword
  },
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    password: seededPassword
  }
} as const;
