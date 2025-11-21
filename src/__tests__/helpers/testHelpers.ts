import { Response } from 'express';

/**
 * Creates a mock Express Response object for testing controllers
 */
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Waits for a specified time (useful for async operations in tests)
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Helper to extract error message from thrown errors
 */
export const getErrorMessage = (fn: () => void): string => {
  try {
    fn();
    return '';
  } catch (error: any) {
    return error.message;
  }
};

/**
 * Helper to extract error message from async thrown errors
 */
export const getAsyncErrorMessage = async (fn: () => Promise<void>): Promise<string> => {
  try {
    await fn();
    return '';
  } catch (error: any) {
    return error.message;
  }
};
