import { AppError } from './AppError';
import { ErrorCodes } from './errorCodes';

/**
 * Not Found Error (404)
 *
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, ErrorCodes.RESOURCE_NOT_FOUND, true, details);
  }
}
