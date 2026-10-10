import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username').notNull().unique(),
  email: varchar('email').notNull().unique(),
  password: varchar('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name').notNull().unique()
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id)
});

export const notes = pgTable(
  'notes',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    title: varchar('title').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
  },
  (table) => [
    unique('notes_user_id_title_unique').on(table.userId, table.title)
  ]
);

// Define relations for querying
export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  notes: many(notes)
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(userRoles)
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id]
  })
}));
