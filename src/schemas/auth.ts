import { Static, Type } from 'typebox';
import {
  EmailSchema,
  PasswordSchema,
  UsernameSchema
} from './shared/patterns.js';
import { ApiFailureSchema, ApiSuccessSchema } from './shared/api.js';
import { UserDataSchema } from './user.js';

const RegisterRequestBody = Type.Object({
  email: EmailSchema,
  username: UsernameSchema,
  password: PasswordSchema
});

export const RegisterSchema = Type.Object({
  tags: ['Authentication'],
  summary: 'Register a user',
  description: 'Register a user account',
  security: [],
  body: RegisterRequestBody,
  response: Type.Object({
    201: ApiSuccessSchema(UserDataSchema),
    400: ApiFailureSchema,
    409: ApiFailureSchema,
    500: ApiFailureSchema
  })
});

const LoginRequestBody = Type.Object({
  username: UsernameSchema,
  password: PasswordSchema
});

export const LoginSchema = {
  tags: ['Authentication'],
  summary: 'User login/authentication schema',
  description: 'User login/authentication schema',
  security: [],
  body: LoginRequestBody,
  response: Type.Object({
    200: ApiSuccessSchema(UserDataSchema),
    400: ApiFailureSchema,
    401: ApiFailureSchema,
    500: ApiFailureSchema
  })
};

export type LoginRequestBody = Static<typeof LoginRequestBody>;
export type RegisterRequestBody = Static<typeof RegisterRequestBody>;
