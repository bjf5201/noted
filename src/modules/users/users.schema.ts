import { Static, Type } from 'typebox';
import {
  DateTimeSchema,
  EmailSchema,
  IdSchema,
  RolesSchema,
  ShortStringSchema
} from '../../shared/schemas/patterns.js';
import {
  ApiFailureSchema,
  ApiSuccessSchema
} from '../../shared/schemas/api.js';

const UserEntitySchema = Type.Object({
  id: IdSchema,
  username: ShortStringSchema,
  email: EmailSchema,
  roles: RolesSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema
});

export const UserDataSchema = Type.Object({
  user: UserEntitySchema
});

// GET /users
export const GetAllUsersSchema = {
  tags: ['Users'],
  summary: 'Get all users',
  description: 'Get all users',
  response: {
    200: ApiSuccessSchema(Type.Array(UserDataSchema)),
    400: ApiFailureSchema,
    404: ApiFailureSchema
  }
};

// GET /users/:userId
export const GetUserSchema = {
  tags: ['Users'],
  summary: 'Get user by id',
  description: 'Get a user by ID',
  params: Type.Object({
    userId: Type.Integer({ minimum: 1, description: 'User ID' })
  }),
  response: {
    200: ApiSuccessSchema(UserDataSchema),
    400: ApiFailureSchema,
    404: ApiFailureSchema
  }
};

export type UserEntity = Static<typeof UserEntitySchema>;
