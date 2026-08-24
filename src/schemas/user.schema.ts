import { Type } from 'typebox';

// Parameters
const userIdSchema = Type.Integer();
const userUsernameSchema = Type.String({});
const userPasswordSchema = Type.String({});

// Building blocks
const UserSchema = Type.Object({
  userId: userIdSchema,
  username: userUsernameSchema,
});

const CreateUserBodySchema = Type.Object({
  username: userUsernameSchema,
  password: userPasswordSchema,
});

// POST /users/create endpoint
export const createUserSchema = {
  description: 'Create a user',
  body: CreateUserBodySchema,
  response: {
    201: UserSchema,
  },
};
