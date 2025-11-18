import { AppError } from './AppError';
import { ErrorCodes } from './errorCodes';

/**
 * Conflict Error (409)
 *
 * Thrown when there's a conflict with existing data (e.g., duplicate email)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, ErrorCodes.RESOURCE_ALREADY_EXISTS, true, details);
  }
}
