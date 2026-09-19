import { type Static, Type } from 'typebox';
import { ErrorResponse } from './shared.js';

const passwordPattern =
  '^(?=.*?[A-Z](?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).*$';

const PasswordSchema = Type.String({
  pattern: passwordPattern,
  minLength: 8
});

export const UserSchema = {
  username: Type.String({ minLength: 6, description: 'User username' }),
  email: Type.String({ format: 'email', description: 'User email address' }),
  password: PasswordSchema,
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
    userId: Type.Integer({ description: 'User ID' }),
    ...UserSchema
  },
  {
    description: 'User schema'
  }
);

export const UserResponse = Type.Omit(
  UserBodySchema,
  ['email', 'password', 'userId'],
  {
    description: 'Resposne-safe user schema which omits the password'
  }
);

// POST /users/create endpoint
export const createUserSchema = {
  tags: ['user'],
  summary: 'Create user',
  description: 'Create a new user',
  body: Type.Omit(UserBodySchema, [
    'userId',
    'password',
    'dateOfCreation',
    'dateOfLastAccess'
  ]),
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
    userId: Type.Integer({ minimum: 1, description: 'User ID' })
  }),
  response: {
    200: UserResponse,
    400: ErrorResponse,
    404: ErrorResponse
  }
};

export const UpdateCredentialsSchema = Type.Object({
  currentPassword: PasswordSchema,
  newPassword: PasswordSchema
});

export type TUser = Static<typeof UserBodySchema>;
export type TUserParams = Static<typeof getUserSchema.params>;
export type TUserResponseSchema = Static<typeof UserResponse>;
export type TCreateUserBody = Static<typeof createUserSchema.body>;
export type TUpdateCredentials = Static<typeof UpdateCredentialsSchema>;

export type TCreateUserDto = TCreateUserBody;
export type TUserParamsDto = TUserParams;
