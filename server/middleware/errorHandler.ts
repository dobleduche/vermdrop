import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error implements AppError {
  statusCode = 500;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class RateLimitError extends Error implements AppError {
  statusCode = 429;
  isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

const scrubSensitive = (obj: any) => {
  try {
    if (!obj || typeof obj !== 'object') return obj;
    const clone: any = {};
    for (const [k, v] of Object.entries(obj)) {
      const key = String(k).toLowerCase();
      if (['email','telegram','twitter','tweet_url','wallet_address'].includes(key)) {
        clone[k] = '[redacted]';
      } else if (key.includes('token') || key.includes('key') || key.includes('secret')) {
        clone[k] = '[redacted]';
      } else {
        clone[k] = v;
      }
    }
    return clone;
  } catch {
    return undefined;
  }
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Log error for monitoring
  console.error(`[${new Date().toISOString()}] Error in ${req.method} ${req.path}:`, {
    error: err.message,
    stack: err.stack,
    body: scrubSensitive(req.body),
    params: scrubSensitive(req.params),
    query: scrubSensitive(req.query),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code
    }));
  } else if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof DatabaseError) {
    statusCode = err.statusCode;
    message = 'Database operation failed';
    // Don't expose internal database errors
    details = undefined;
  } else if (err instanceof RateLimitError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if ('statusCode' in err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Supabase specific errors
  if (err.message?.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
  } else if (err.message?.includes('foreign key')) {
    statusCode = 400;
    message = 'Invalid reference';
  } else if (err.message?.includes('connection')) {
    statusCode = 503;
    message = 'Service temporarily unavailable';
  }

  // Network errors
  if (err.message?.includes('ECONNREFUSED') || err.message?.includes('ENOTFOUND')) {
    statusCode = 503;
    message = 'External service unavailable';
  }

  // Security: Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  const response: any = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  if (details && !isProduction) {
    response.details = details;
  }

  if (!isProduction) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
};
