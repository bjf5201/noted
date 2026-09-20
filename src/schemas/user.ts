import { Type } from 'typebox';
import { ErrorResponse, SuccessResponse } from './shared.js';

const passwordPattern =
  '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).*$';

const PasswordSchema = Type.String({
  pattern: passwordPattern,
  minLength: 8
});

const UpdateCredentialsSchema = Type.Object({
  currentPassword: PasswordSchema,
  newPassword: PasswordSchema
});

export const UserSchema = Type.Object({
  username: Type.String({ minLength: 6, description: 'User username' }),
  email: Type.String({ format: 'email', description: 'User email address' }),
  password: PasswordSchema,
  createdAt: Type.String({
    format: 'date',
    description: 'Date of user registration/creation'
  })
});

export const CreateUserBodySchema = Type.Omit(UserSchema, ['createdAt']);

export const UserResponse = Type.Omit(
  UserSchema,
  ['email', 'password', 'createdAt'],
  {
    description: 'Response-safe user schema which omits the password'
  }
);

// POST /users/create endpoint
export const createUserSchema = {
  tags: ['user'],
  summary: 'Create user',
  description: 'Create a new user',
  body: CreateUserBodySchema,
  response: {
    201: SuccessResponse,
    400: ErrorResponse,
    500: ErrorResponse
  }
};

// GET /users
export const getAllUsersSchema = {
  tags: ['user'],
  summary: 'Get all users',
  description: 'Get all users',
  response: {
    200: Type.Array(UserResponse)
  }
};

// GET /user/:userId
export const getUserSchema = {
  tags: ['user'],
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

// PUT /user/update
export const updateUserSchema = {
  tags: ['user'],
  summary: "Update user's password",
  description: "Update the user's password",
  body: UpdateCredentialsSchema,
  response: {
    200: SuccessResponse,
    400: ErrorResponse,
    401: ErrorResponse
  }
};
