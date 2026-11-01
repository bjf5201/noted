import { Static, type TSchema, Type } from '@fastify/type-provider-typebox';

export const ApiSuccessSchema = <T extends TSchema>(dataSchema: T) => {
  return Type.Object({
    success: Type.Literal(true),
    code: Type.Integer({ minimum: 100, maximum: 299 }),
    data: dataSchema,
    message: Type.Optional(Type.String())
  });
};

export const ApiFailureSchema = Type.Object({
  success: Type.Literal(false),
  code: Type.Integer({ minimum: 300, maximum: 599 }),
  error: Type.String(),
  details: Type.Optional(Type.Unknown())
});

export const ApiResponseSchema = <T extends TSchema>(dataSchema: T) => {
  return Type.Union([ApiSuccessSchema(dataSchema), ApiFailureSchema]);
};

export type ApiSuccess<T extends TSchema> = Static<
  ReturnType<typeof ApiSuccessSchema<T>>
>;

export type ApiFailure = Static<typeof ApiFailureSchema>;

export type ApiResult<T extends TSchema> = Static<
  ReturnType<typeof ApiResponseSchema<T>>
>;
