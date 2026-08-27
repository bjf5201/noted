import { type Static, Type } from 'typebox';
import { ErrorResponse } from './shared.js';

export const UserSchema = {
  username: Type.String({ minLength: 6, description: 'User username' }),
  email: Type.String({ format: 'email', description: 'User email address' }),
  password: Type.String({ minLength: 6, description: 'User password' }),
  dateOfCreation: Type.String({
    format: 'date',
    description: 'Date of user registration/creation'
  }),
  dateOfLastAccess: Type.String({
    format: 'date',
    description: 'Date of the last time account was accessed'
  })
};

export const UserBodySchema = Type.Object(
  {
    id: Type.Integer({ description: 'User ID' }),
    ...UserSchema
  },
  {
    description: 'User schema'
  }
);

export const UserResponse = Type.Omit(UserBodySchema, ['password'], {
  description: 'Resposne-safe user schema which omits the password'
});

// POST /users/create endpoint
export const createUserSchema = {
  tags: ['user'],
  summary: 'Create user',
  description: 'Create a new user',
  body: Type.Omit(UserBodySchema, ['id', 'password', 'dateOfCreation', 'dateOfLastAccess']),
  response: {
    201: UserResponse,
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
    id: Type.String({ format: 'uuid', description: 'User ID' })
  }),
  response: {
    200: UserResponse,
    400: ErrorResponse,
    404: ErrorResponse
  }
};

export const updateUserSchema = {
  tags: ['user'],
  summary: 'Update user by id',
  description: 'Update a user by ID',
  params: Type.Object({
    id: Type.String({ format: 'uuid', description: 'User ID' })
  }),
  body: Type.Partial(
    Type.Omit(UserBodySchema, ['id', 'password', 'dateOfCreation', 'dateOfLastAccess'])
  ),
  response: {
    200: UserResponse,
    400: ErrorResponse,
    404: ErrorResponse
  }
};

export const deleteUserSchema = {
  tags: ['user'],
  summary: 'Delete user by id',
  description: 'Delete a user by ID',
  params: Type.Object({
    id: Type.String({ format: 'uuid', description: 'User ID' })
  }),
  response: {
    204: {
      description: 'No content'
    },
    404: ErrorResponse
  }
};

export type TUser = Static<typeof UserBodySchema>;
export type TUserParams = Static<typeof getUserSchema.params>;
export type TUserResponseSchema = Static<typeof UserResponse>;
export type TCreateUserBody = Static<typeof createUserSchema.body>;
export type TUpdateUserBody = Static<typeof updateUserSchema.body>;
