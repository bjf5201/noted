import { Type } from '@fastify/type-provider-typebox';

export const ErrorResponse = Type.Object(
  {
    statusCode: Type.Number({ description: 'HTTP status code' }),
    error: Type.String({ description: 'Error type' }),
    message: Type.String({ description: 'Error message' })
  },
  {
    additionalProperties: true,
    description: 'Standard error response'
  }
);

export const SuccessResponse = Type.Object(
  {
    success: Type.Boolean({ descripton: "Operation's success indicator" }),
    message: Type.String({ description: 'Response message' })
  },
  {
    description: 'Standard succesful operation response'
  }
);

export const StringSchema = Type.String({
  minLength: 1,
  maxLength: 255
});

export const EmailSchema = Type.String({
  format: 'email',
  minLength: 1,
  maxLength: 255
});

export const DateTimeSchema = Type.String({ format: 'date-time' });

export const IdSchema = Type.Integer({ minimum: 1 });
