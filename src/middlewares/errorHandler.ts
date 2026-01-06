import { Request, Response, NextFunction } from 'express';
import { logger } from '@/lib/winston';
import { AppError } from '@/utils/AppError';
import config from '@/config';

const errorHandler = (
  err: AppError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = err;

  // If it's not an instance of AppError, wrap it
  if (!(error instanceof AppError)) {
    const statusCode = (error as any).statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new AppError(message, statusCode);
  }

  const statusCode = (error as AppError).statusCode;
  const message = error.message;

  // Log the error
  logger.error(`[${req.method}] ${req.originalUrl} - ${message}`, {
    stack: error.stack,
    ip: req.ip,
  });

  // Send response
  if (config.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status: (error as AppError).status,
      message: message,
      stack: error.stack,
      error: error,
    });
  } else {
    // Production response: Don't leak stack traces
    if ((error as AppError).isOperational) {
      res.status(statusCode).json({
        status: (error as AppError).status,
        message: message,
      });
    } else {
      // Programming or other unknown error: don't leak details
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }
};

export default errorHandler;
