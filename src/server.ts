// Node Modules
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

// Router
import v1Routes from '@/routes/v1';

// Custom Modules
import config from '@/config';
import { apiLimiter, authLimiter } from '@/lib/rateLimiters';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import { logger } from '@/lib/winston';
import httpLogger from '@/middlewares/httpLogger';
import errorHandler from '@/middlewares/errorHandler';
import { AppError } from '@/utils/AppError';

// Type Definitions
import type { CorsOptions } from 'cors';

// Express app initialization
const app = express();

// CORS configuration
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (
      config.NODE_ENV === 'development' ||
      !origin ||
      config.WHITELIST_ORIGIN.includes(origin)
    ) {
      callback(null, true);
    } else {
      logger.warn(`CORS policy: ${origin} is not allowed`);
      callback(new Error(`Not allowed by CORS policy`));
    }
  },
  credentials: true, // Allow cookies
};

// 1. Security Middlewares
app.use(helmet());
app.use(cors(corsOptions));
// Apply general limiter to all requests
app.use('/api', apiLimiter);
// Apply strict limiter to auth routes specificially
app.use('/api/v1/auth', authLimiter);

// 2. Logging Middleware
app.use(httpLogger);

// 3. Parsing Middlewares
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));

// 4. Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// 5. Routes
app.use('/api/v1', v1Routes);

// 6. 404 Handler (If no route matched)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 7. Global Error Handler
app.use(errorHandler);

// Start Server Logic
let server: any;

const startServer = async () => {
  try {
    await connectToDatabase();

    server = app.listen(config.PORT, () => {
      logger.info(`Server is running on port: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Error starting the server:', error);
    process.exit(1);
  }
};

// Only start the server if this file is the main module (not during tests)
if (require.main === module) {
  startServer();
}

// Graceful Shutdown
const gracefulShutdown = (signal: string) => {
  return async () => {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);

    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await disconnectFromDatabase();
          logger.info('Database disconnected.');
          process.exit(0);
        } catch (err) {
          logger.error('Error during database disconnection:', err);
          process.exit(1);
        }
      });
    } else {
      process.exit(0);
    }

    // Force close after 10s if not finished
    setTimeout(() => {
      logger.error(
        'Could not close connections in time, forcefully shutting down',
      );
      process.exit(1);
    }, 10000);
  };
};

process.on('SIGINT', gracefulShutdown('SIGINT'));
process.on('SIGTERM', gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

export default app;
