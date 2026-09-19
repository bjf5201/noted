import { Static, Type } from 'typebox';
import {
  EmailSchema,
  ErrorResponse,
  StringSchema,
  SuccessResponse
} from 'noted/schemas/shared.js';

const CredentialsSchema = Type.Object({
  email: EmailSchema,
  password: StringSchema
});

const authResponseSchema = {
  200: SuccessResponse,
  401: ErrorResponse
};

export const authSchema = {
  tags: ['auth'],
  summary: 'User login/auth schema',
  description: 'User login/authentication schema',
  body: CredentialsSchema,
  response: authResponseSchema
};

export type TCredentials = Static<typeof CredentialsSchema>;

export interface Auth {
  id: number;
  username: string;
  email: string;
  roles: string[];
}
