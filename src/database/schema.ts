import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/*
UTILS
**/
export function setFutureDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
const PROFILE_IMAGE_URI = 'https://localhost:3000/images/defaultProfile.jpg';
const visibilityEnum = pgEnum('visibility', ['public', 'private']);
const timestamps = {
  createdAt: timestamp('created_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
    precision: 3,
    withTimezone: true
  })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date())
};

/*
TABLE DEFINITIONS
**/

// SESSIONS
export const sessions = pgTable(
  'sessions',
  {
    tokenHash: varchar('token_hash', { length: 64 }).primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date'
    })
      .notNull()
      .$defaultFn(() => setFutureDate(90)),
    lastAccessedAt: timestamp('last_accessed_at', {
      withTimezone: true,
      mode: 'date'
    })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date())
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_expires_at_idx').on(table.expiresAt)
  ]
);

// USERS
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 20 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash').notNull(),
    profileImageUri: text('profile_image_uri')
      .notNull()
      .default(PROFILE_IMAGE_URI),
    ...timestamps
  },
  (table) => [
    check(
      'users_username_length_check',
      sql`char_length(${table.username}) >= 3`
    )
  ]
);

// PROFILES
export const profiles = pgTable('profiles', {
  userId: integer('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull().default(''),
  summary: text('summary').notNull().default(''),
  bio: text('bio').notNull().default(''),
  keywords: text('keywords').array().notNull().default([]),
  ...timestamps
});

// ROLES
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique()
});

// USERS <-> ROLES
export const usersRoles = pgTable(
  'users_roles',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' })
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })]
);

// PREFERENCES
export const preferences = pgTable('preferences', {
  userId: integer('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  visibility: visibilityEnum().notNull().default('private'),
  ...timestamps
});

// NOTES
export const notes = pgTable(
  'notes',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 100 }).notNull(),
    content: text('content').notNull(),
    headerImageUri: text('header_image_uri'),
    visibility: visibilityEnum().notNull().default('private'),
    ...timestamps
  },
  (table) => [
    unique('notes_user_id_title_unique').on(table.userId, table.title),
    index('notes_user_id_created_at_idx').on(table.userId, table.createdAt),
    index('notes_visibility_created_at_idx').on(
      table.visibility,
      table.createdAt
    )
  ]
);

// TAGS
export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique()
});

// NOTES <-> TAGS
export const notesTags = pgTable(
  'notes_tags',
  {
    noteId: integer('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' })
  },
  (table) => [
    primaryKey({ columns: [table.noteId, table.tagId] }),
    index('notes_tags_tag_id_idx').on(table.tagId)
  ]
);

// FOLLOWS
export const follows = pgTable(
  'follows',
  {
    followerId: integer('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: integer('following_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
    check(
      'follows_no_self_follow',
      sql`${table.followerId} <> ${table.followingId}`
    ),
    index('follows_following_id_idx').on(table.followingId)
  ]
);

export const likes = pgTable(
  'likes',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    noteId: integer('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.noteId] }),
    index('likes_note_id_idx').on(table.noteId)
  ]
);

export const saves = pgTable(
  'saves',
  {
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    noteId: integer('note_id')
      .notNull()
      .references(() => notes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .defaultNow()
      .notNull()
  },
  (table) => [primaryKey({ columns: [table.userId, table.noteId] })]
);
