import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../../shared/errors';

/**
 * Validation Middleware
 *
 * Validates request data (body, params, query) against a Zod schema.
 * Throws ValidationError if validation fails.
 *
 * Usage:
 * router.post('/', validate(createUserSchema), controller.createUser);
 */
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate request data against schema
      const validated = (await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      })) as any;

      // Replace request data with validated (and potentially transformed) data
      req.body = validated.body || req.body;
      req.params = validated.params || req.params;
      req.query = validated.query || req.query;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod errors into a readable format
        const errors = error.issues.map((err: z.ZodIssue) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(
          new ValidationError('Request validation failed', {
            errors,
          })
        );
      } else {
        next(error);
      }
    }
  };
};
