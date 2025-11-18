import { AppError } from './AppError';
import { ErrorCodes } from './errorCodes';

/**
 * Database Error (500)
 *
 * Thrown when there's a database operation failure
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, ErrorCodes.DATABASE_ERROR, true, details);
  }
}
