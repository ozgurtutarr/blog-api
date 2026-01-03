// Node Modules
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

// Router
import v1Routes from '@/routes/v1';

// Custom Modules
import config from '@/config';
import expressRateLimit from '@/lib/express_rate_limit';
import { connectToDatabase, disconnectFromDatabase } from './lib/mongoose';
import { logger } from '@/lib/winston';

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
      callback(
        new Error(`Not allowed by CORS policy: ${origin} is not allowed`),
      );
    }
  },
};

// Apply middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  compression({
    threshold: 1024, // only compress responses larger than 1KB
  }),
);
app.use(helmet());
app.use(expressRateLimit);

// server start function
(async () => {
  try {
    await connectToDatabase();
    app.use('/api/v1', v1Routes);

    app.listen(config.PORT, () => {
      logger.info(`Server is running on port: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    logger.error('Error starting the server:', error);
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
})();

// server shutdown handling
const handleServerShutdown = async () => {
  try {
    await disconnectFromDatabase();
    logger.warn('Shutting down server gracefully...');
    // Perform any necessary cleanup tasks here (e.g., closing database connections)
    process.exit(0);
  } catch (error) {
    logger.error('Error during server shutdown:', error);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGINT', handleServerShutdown); // Handle Ctrl+C interrupt
process.on('SIGTERM', handleServerShutdown); // Handle termination signal
process.on('uncaughtException', (error) => {
  // Handle uncaught exceptions
  logger.error('Uncaught Exception:', error);
  handleServerShutdown();
});
process.on('unhandledRejection', (reason, promise) => {
  // Handle unhandled promise rejections
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  handleServerShutdown();
});
export default app;
