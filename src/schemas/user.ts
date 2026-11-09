import { Type } from 'typebox';
import {
  DateTimeSchema,
  EmailSchema,
  IdSchema,
  PasswordSchema,
  ShortStringSchema
} from './shared/patterns.js';
import { ApiFailureSchema, ApiSuccessSchema } from './shared/api.js';

const UserEntitySchema = Type.Object({
  id: IdSchema,
  username: ShortStringSchema,
  createdAt: DateTimeSchema,
  updatedAt: DateTimeSchema
});

const UserRegisterBodySchema = Type.Object({
  username: ShortStringSchema,
  email: EmailSchema,
  password: PasswordSchema
});

const UpdatePasswordBodySchema = Type.Object({
  currentPassword: ShortStringSchema,
  newPassword: PasswordSchema
});

// POST /users
export const CreateUserSchema = {
  tags: ['Users'],
  summary: 'Create user',
  description: 'Create a new user',
  body: UserRegisterBodySchema,
  response: {
    201: ApiSuccessSchema(UserEntitySchema),
    409: ApiFailureSchema,
    500: ApiFailureSchema
  }
};

// GET /users
export const GetAllUsersSchema = {
  tags: ['Users'],
  summary: 'Get all users',
  description: 'Get all users',
  response: {
    200: ApiSuccessSchema(Type.Array(UserEntitySchema)),
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
    200: ApiSuccessSchema(UserEntitySchema),
    400: ApiFailureSchema,
    404: ApiFailureSchema
  }
};

// PUT /users
export const UpdateUserSchema = {
  tags: ['Users'],
  summary: "Update user's password",
  description: "Update the user's password",
  body: UpdatePasswordBodySchema,
  response: {
    200: ApiSuccessSchema(Type.Literal('Password updated successfully.')),
    400: ApiFailureSchema,
    401: ApiFailureSchema,
    429: ApiFailureSchema
  }
};
