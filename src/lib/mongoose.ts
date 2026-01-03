// Node Modules
import mongoose from 'mongoose';

// Custom Modules
import config from '@/config';
import { logger } from '@/lib/winston';

// Type Definitions
import type { ConnectOptions } from 'mongoose';

// Constants
const clientOptions: ConnectOptions = {
  dbName: 'blog-api',
  appName: 'Blog API',
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true,
  },
};

export const connectToDatabase = async (): Promise<void> => {
  if (!config.MONGODB_URI) {
    throw new Error('MongoDB URI is not defined in the configuration.');
  }

  try {
    await mongoose.connect(config.MONGODB_URI, clientOptions);

    logger.info('Connected to the database successfully.');
  } catch (err) {
    logger.error('Error connecting to the database', err);
    throw err;
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
