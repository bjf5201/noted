import type { FastifyReply, FastifyRequest } from 'fastify';

import { ApiError, ApiResponse } from './api-response.js';

/**
 * Global error handler aligned with Fastify's lifecycle.
 *
 *   import { errorHandler } from "./utils/error-handler";
 *   fastify.setErrorHandler(errorHandler);
 */
export function errorHandler(
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  if (error instanceof ApiError) {
    const response = ApiResponse.failure(
      error.statusCode,
      error.code,
      error.message,
      request.id,
      error.details
    );

    void reply.status(response.statusCode).send(response.body);
    return;
  }

  const statusCode =
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
      ? error.statusCode
      : 500;

  console.error(`Unhandled error: ${error}`);

  const message =
    statusCode >= 500
      ? 'Internal Server Error'
      : error instanceof Error
        ? error.message
        : 'An unexpected error occured.';

  const response = ApiResponse.failure(
    statusCode,
    ApiResponse.getErrorCode(statusCode),
    message,
    request.id
  );

  void reply.status(response.statusCode).send(response.body);
}
