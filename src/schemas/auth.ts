import { Static, Type } from 'typebox';
import {
  EmailSchema,
  IdSchema,
  RolesSchema,
  ShortStringSchema
} from './shared/patterns.js';
import { ApiFailureSchema, ApiSuccessSchema } from './shared/api.js';

const AuthEntitySchema = Type.Object({
  id: IdSchema,
  email: EmailSchema,
  username: Type.String({ minLength: 5 }),
  roles: Type.Array(RolesSchema, {
    description: "User's access level"
  })
});

export const AuthEnvelopeSchema = Type.Object({
  user: AuthEntitySchema
});

const CredentialsSchema = Type.Object({
  email: EmailSchema,
  password: ShortStringSchema
});

const AuthResponseSchema = {
  200: ApiSuccessSchema(AuthEnvelopeSchema),
  401: ApiFailureSchema
};

export const AuthSchema = {
  tags: ['auth'],
  summary: 'User login/auth schema',
  description: 'User login/authentication schema',
  body: CredentialsSchema,
  response: AuthResponseSchema
};

export type Credentials = Static<typeof CredentialsSchema>;
export type AuthEntity = Static<typeof AuthEntitySchema>;
