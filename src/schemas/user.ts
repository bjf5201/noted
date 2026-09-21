import { Type } from 'typebox';
import {
  EmailSchema,
  ErrorResponse,
  StringSchema,
  SuccessResponse
} from './shared.js';

const passwordPattern =
  '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$';

const PasswordSchema = Type.String({
  pattern: passwordPattern,
  minLength: 8,
  maxLength: 255
});

const CreateUserBodySchema = Type.Object({
  username: StringSchema,
  email: EmailSchema,
  password: PasswordSchema
});

const UpdateCredentialsBodySchema = Type.Object({
  currentPassword: StringSchema,
  newPassword: PasswordSchema
});

const UserResponse = Type.Object({
  id: Type.Integer(),
  username: StringSchema,
  email: StringSchema
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
    409: ErrorResponse,
    500: ErrorResponse
  }
};

// GET /users
export const getAllUsersSchema = {
  tags: ['Users'],
  summary: 'Get all users',
  description: 'Get all users',
  response: {
    200: Type.Array(UserResponse),
    400: ErrorResponse,
    404: ErrorResponse
  }
};

// GET /users/:userId
export const getUserSchema = {
  tags: ['Users'],
  summary: 'Get user by id',
  description: 'Get a user by ID',
  params: Type.Object({
    userId: Type.Integer({ minimum: 1, description: 'User ID' })
  }),
  response: {
    200: UserResponse,
    400: ErrorResponse,
    404: ErrorResponse
  }
};

// PUT /users
export const updateUserSchema = {
  tags: ['Users'],
  summary: "Update user's password",
  description: "Update the user's password",
  body: UpdateCredentialsBodySchema,
  response: {
    200: SuccessResponse,
    400: ErrorResponse,
    401: ErrorResponse,
    429: ErrorResponse
  }
};
