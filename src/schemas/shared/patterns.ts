import { Type } from '@fastify/type-provider-typebox';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const PHONE_REGEX =
  /^\+?1?[-. ]?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

export const PasswordSchema = Type.String({
  pattern: PASSWORD_REGEX,
  minLength: 8,
  maxLength: 100
});

export const PhoneNumberSchema = Type.String({
  pattern: PHONE_REGEX
});

export const ShortStringSchema = Type.String({
  minLength: 1,
  maxLength: 255
});

export const LongStringSchema = Type.String({
  minLength: 1
});

export const EmailSchema = Type.String({
  format: 'email',
  minLength: 6,
  maxLength: 100
});

export const DateTimeSchema = Type.String({ format: 'date-time' });

export const IdSchema = Type.Integer({ minimum: 1 });
