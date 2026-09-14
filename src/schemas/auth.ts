import { Static, Type } from 'typebox';
import { EmailSchema, StringSchema } from './shared.js';

export const CredentialsSchema = Type.Object({
  email: EmailSchema,
  password: StringSchema
});

export type TCredentials = Static<typeof CredentialsSchema>;

export interface Auth {
  id: number;
  username: string;
  email: string;
  roles: string[];
}
