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
  _request: FastifyRequest,
  reply: FastifyReply
): void {
  if (error instanceof ApiError) {
    void reply
      .status(error.statusCode)
      .send(
        ApiResponse.failure(error.statusCode, error.message, error.details)
      );
    return;
  }
  const status =
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
      ? error.statusCode
      : 500;
  console.error('Unhandled error:', error);
  void reply
    .status(status)
    .send(
      ApiResponse.failure(
        status,
        error instanceof Error ? error.message : 'Internal Server Error'
      )
    );
}
