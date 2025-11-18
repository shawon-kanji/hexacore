import { Response } from 'express';

/**
 * Response Message Codes
 *
 * Standard message codes for consistent API responses
 */
export const ResponseCodes = {
  // Success codes
  SUCCESS: 'SUCCESS',
  CREATED: 'CREATED',
  UPDATED: 'UPDATED',
  DELETED: 'DELETED',
  FETCHED: 'FETCHED',

  // Info codes
  NO_CONTENT: 'NO_CONTENT',
  ACCEPTED: 'ACCEPTED',
} as const;

export type ResponseCode = (typeof ResponseCodes)[keyof typeof ResponseCodes];

/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  code: ResponseCode;
  message: string;
  data?: T;
  meta?: {
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * Response Helper Class
 *
 * Provides methods to send standardized API responses
 */
export class ResponseHandler {
  /**
   * Send success response (200)
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operation successful',
    meta?: Record<string, any>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      code: ResponseCodes.SUCCESS,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send created response (201)
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully',
    meta?: Record<string, any>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      code: ResponseCodes.CREATED,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
    return res.status(201).json(response);
  }

  /**
   * Send updated response (200)
   */
  static updated<T>(
    res: Response,
    data: T,
    message: string = 'Resource updated successfully',
    meta?: Record<string, any>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      code: ResponseCodes.UPDATED,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send deleted response (200)
   */
  static deleted(
    res: Response,
    message: string = 'Resource deleted successfully',
    meta?: Record<string, any>
  ): Response {
    const response: ApiResponse = {
      success: true,
      code: ResponseCodes.DELETED,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send fetched response (200)
   */
  static fetched<T>(
    res: Response,
    data: T,
    message: string = 'Data fetched successfully',
    meta?: Record<string, any>
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      code: ResponseCodes.FETCHED,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send paginated response (200)
   */
  static paginated<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = 'Data fetched successfully'
  ): Response {
    const response: ApiResponse<T[]> = {
      success: true,
      code: ResponseCodes.FETCHED,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        pagination,
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send no content response (204)
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
