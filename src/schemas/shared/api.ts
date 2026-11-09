import { Static, type TSchema, Type } from '@fastify/type-provider-typebox';

/**
 * Metadata included with API response envelope
 */
export const ApiMetaSchema = Type.Object({
  requestId: Type.String()
});

/**
 * Pagination metadata for collection responses
 */
export const ApiPaginationSchema = Type.Object({
  page: Type.Integer({ minimum: 1 }),
  limit: Type.Integer({ minimum: 1 }),
  total: Type.Integer({ minimum: 0 })
});

/**
 * Metadata for API responses that include pagination
 */
export const ApiPaginatedMetaSchema = Type.Intersect([
  ApiMetaSchema,
  Type.Object({
    pagination: ApiPaginationSchema
  })
]);

/**
 * Standard timestamps included in persistent resource responses
 */
export const ResourceTimestampsSchema = Type.Object({
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

/**
 * Successful API response
 *
 * The data schema is supplied by the individual resource
 */
export const ApiSuccessSchema = <T extends TSchema>(dataSchema: T) => {
  return Type.Object({
    data: dataSchema,
    meta: ApiMetaSchema
  });
};

/**
 * Failed API response
 */
export const ApiFailureSchema = Type.Object({
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Unknown())
  }),
  meta: ApiMetaSchema
});

/**
 * API response union
 */
export const ApiResponseSchema = <T extends TSchema>(dataSchema: T) => {
  return Type.Union([ApiSuccessSchema(dataSchema), ApiFailureSchema]);
};

// Inferred types
export type ApiMeta = Static<typeof ApiMetaSchema>;
export type ApiPagination = Static<typeof ApiPaginationSchema>;
export type ApiPaginatedMeta = Static<typeof ApiPaginatedMetaSchema>;
export type ResourceTimestampes = Static<typeof ResourceTimestampsSchema>;

export type ApiSuccess<T extends TSchema> = Static<
  ReturnType<typeof ApiSuccessSchema<T>>
>;

export type ApiFailure = Static<typeof ApiFailureSchema>;

export type ApiResponse<T extends TSchema> = Static<
  ReturnType<typeof ApiResponseSchema<T>>
>;
