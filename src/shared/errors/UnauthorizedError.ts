import { AppError } from './AppError';
import { ErrorCodes } from './errorCodes';

/**
 * Unauthorized Error (401)
 *
 * Thrown when authentication is required but failed or was not provided
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, ErrorCodes.UNAUTHORIZED, true, details);
  }
}
