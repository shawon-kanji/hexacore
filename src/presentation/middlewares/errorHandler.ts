import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors';
import { logger } from '../../shared/utils/logger';

/**
 * Global Error Handler Middleware
 *
 * Catches all errors thrown in the application and returns a standardized error response.
 * Logs errors appropriately based on type (operational vs programming errors).
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,

  _next: NextFunction
) => {
  // Default error values
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;
  let isOperational = false;

  // Handle AppError instances (our custom errors)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.errorCode;
    message = err.message;
    details = err.details;
    isOperational = err.isOperational;
  }

  // Log the error
  if (isOperational) {
    // Operational errors are expected and logged as warnings
    logger.warn(
      {
        errorCode,
        message,
        details,
        path: req.path,
        method: req.method,
      },
      'Operational error occurred'
    );
  } else {
    // Programming errors are unexpected and logged as errors with stack trace
    logger.error(
      {
        error: err,
        errorCode,
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
      },
      'Programming error occurred'
    );
  }

  // Send error response
  const errorResponse: any = {
    success: false,
    error: {
      code: errorCode,
      message,
    },
  };

  // Include details in development mode
  if (details && process.env.NODE_ENV === 'development') {
    errorResponse.error.details = details;
  }

  // Include stack trace in development mode for programming errors
  if (!isOperational && process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found Handler
 *
 * Catches requests to undefined routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
