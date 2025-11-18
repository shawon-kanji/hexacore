import { AppError } from './AppError';
import { ErrorCodes } from './errorCodes';

/**
 * Validation Error (400)
 *
 * Thrown when input validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, ErrorCodes.VALIDATION_FAILED, true, details);
  }
}
