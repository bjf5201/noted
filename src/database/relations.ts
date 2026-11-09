import { defineRelations } from 'drizzle-orm';
import {
  follows,
  likes,
  notes,
  notesTags,
  preferences,
  profiles,
  roles,
  saves,
  tags,
  users,
  usersRoles
} from './schema.js';

export const relations = defineRelations(
  {
    users,
    profiles,
    roles,
    usersRoles,
    preferences,
    notes,
    tags,
    notesTags,
    follows,
    likes,
    saves
  },
  (r) => ({
    users: {
      // One-to-one
      profile: r.one.profiles({
        from: r.users.id,
        to: r.profiles.userId
      }),
      preferences: r.one.preferences({
        from: r.users.id,
        to: r.preferences.userId
      }),

      // One-to-many
      notes: r.many.notes(),
      roles: r.many.usersRoles(),
      likes: r.many.likes(),
      saves: r.many.saves(),

      // Following relationships
      following: r.many.follows({
        alias: 'user_following'
      }),
      followers: r.many.follows({
        alias: 'user_followers'
      })
    },

    profiles: {
      user: r.one.users({
        from: r.profiles.userId,
        to: r.users.id
      })
    },

    preferences: {
      user: r.one.users({
        from: r.preferences.userId,
        to: r.users.id
      })
    },

    roles: {
      users: r.many.usersRoles()
    },

    usersRoles: {
      users: r.one.users({
        from: r.usersRoles.userId,
        to: r.users.id
      }),
      role: r.one.roles({
        from: r.usersRoles.roleId,
        to: r.roles.id
      })
    },

    notes: {
      author: r.one.users({
        from: r.notes.userId,
        to: r.users.id
      }),
      tags: r.many.tags({
        from: r.notes.id.through(r.notesTags.noteId),
        to: r.tags.id.through(r.notesTags.tagId)
      }),
      likes: r.many.likes(),
      saves: r.many.saves()
    },

    tags: {
      notes: r.many.notes({
        from: r.tags.id.through(r.notesTags.tagId),
        to: r.notes.id.through(r.notesTags.noteId)
      })
    },

    notesTags: {
      note: r.one.notes({
        from: r.notesTags.noteId,
        to: r.notes.id
      }),
      tags: r.one.tags({
        from: r.notesTags.tagId,
        to: r.tags.id
      })
    },

    follows: {
      follower: r.one.users({
        from: r.follows.followerId,
        to: r.users.id,
        alias: 'user_following'
      }),
      following: r.one.users({
        from: r.follows.followingId,
        to: r.users.id,
        alias: 'user_followers'
      })
    },

    likes: {
      user: r.one.users({
        from: r.likes.userId,
        to: r.users.id
      }),
      note: r.one.notes({
        from: r.likes.noteId,
        to: r.notes.id
      })
    },

    saves: {
      user: r.one.users({
        from: r.saves.userId,
        to: r.users.id
      }),
      note: r.one.notes({
        from: r.saves.noteId,
        to: r.notes.id
      })
    }
  })
);
