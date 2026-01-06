// Node Modules
import mongoose from 'mongoose';

// Custom Modules
import config from '@/config';
import { logger } from '@/lib/winston';

// Type Definitions
import type { ConnectOptions } from 'mongoose';

// Constants
const MAX_RETRIES = 5;
const RETRY_INTERVAL = 5000; // 5 seconds

const clientOptions: ConnectOptions = {
  dbName: 'blog-api',
  appName: 'Blog API',
  autoIndex: config.NODE_ENV !== 'production', // Don't build indexes in production
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

// Event Listeners for better observability
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to DB Cluster');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected');
});

export const connectToDatabase = async (retryCount = 0): Promise<void> => {
  try {
    await mongoose.connect(config.MONGODB_URI, clientOptions);
    logger.info('Successfully connected to MongoDB.');
  } catch (err) {
    logger.error(
      `Failed to connect to MongoDB (Attempt ${retryCount + 1}/${MAX_RETRIES})`,
      err,
    );

    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying connection in ${RETRY_INTERVAL / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      return connectToDatabase(retryCount + 1);
    } else {
      logger.error('Max retries reached. Exiting application...');
      process.exit(1); // Fatal error, kill the process so Docker/PM2 can restart it
    }
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from the database successfully.');
  } catch (err) {
    logger.error('Error disconnecting from the database', err);
    throw err;
  }
};
