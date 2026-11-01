import { Type } from 'typebox';
import {
  EmailSchema,
  PasswordSchema,
  ShortStringSchema
} from './shared/patterns.js';
import { ApiFailureSchema, ApiSuccessSchema } from './shared/response.js';

const CreateUserBodySchema = Type.Object({
  username: ShortStringSchema,
  email: EmailSchema,
  password: PasswordSchema
});

const UpdateCredentialsBodySchema = Type.Object({
  currentPassword: ShortStringSchema,
  newPassword: PasswordSchema
});

const UserResponse = Type.Object({
  id: Type.Integer(),
  username: ShortStringSchema,
  email: ShortStringSchema
});

// POST /users
export const CreateUserSchema = {
  tags: ['Users'],
  summary: 'Create user',
  description: 'Create a new user',
  body: CreateUserBodySchema,
  response: {
    201: Type.Object({
      id: Type.Integer()
    }),
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
    200: Type.Array(UserResponse),
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
    200: ApiSuccessSchema,
    400: ApiFailureSchema,
    404: ApiFailureSchema
  }
};

// PUT /users
export const UpdateUserSchema = {
  tags: ['Users'],
  summary: "Update user's password",
  description: "Update the user's password",
  body: UpdateCredentialsBodySchema,
  response: {
    200: ApiSuccessSchema,
    400: ApiFailureSchema,
    401: ApiFailureSchema,
    429: ApiFailureSchema
  }
};
