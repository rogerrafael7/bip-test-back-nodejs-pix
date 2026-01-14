import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ApiError } from '../types';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(
    {
      event: 'unhandled_error',
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    },
    'Unhandled error occurred'
  );

  const isCircuitOpen = error.message === 'Service temporarily unavailable';

  const response: ApiError = {
    error: isCircuitOpen ? 'Service temporarily unavailable' : 'Internal server error',
    code: isCircuitOpen ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
  };

  res.status(isCircuitOpen ? 503 : 500).json(response);
};
