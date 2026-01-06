import dotenv from 'dotenv';
import type ms from 'ms';

dotenv.config();

// Fail Fast

const getEnv = (key: string, ensure: boolean = true): string => {
  const value = process.env[key];
  if (ensure && !value) {
    throw new Error(
      `FATAL ERROR: Missing required environment variable: ${key}`,
    );
  }
  return value || '';
};

const config = {
  // Server Config
  PORT: parseInt(getEnv('PORT', false) || '3000', 10),
  NODE_ENV: getEnv('NODE_ENV', false) || 'development',

  // Security
  WHITELIST_ORIGIN: getEnv('WHITELIST_ORIGIN', false).split(',') || [
    'http://localhost:3000',
  ],
  WHITELIST_ADMINS_MAIL: getEnv('WHITELIST_ADMINS_MAIL', false).split(',') || [
    'ozgur@ozgur.com',
  ],

  // Database
  MONGODB_URI: getEnv('MONGODB_URI'),

  // Logging
  LOG_LEVEL: getEnv('LOG_LEVEL', false) || 'info',

  // Authentication (JWT)
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET'),
  ACCESS_TOKEN_EXPIRY: (getEnv('ACCESS_TOKEN_EXPIRY', false) ||
    '15m') as ms.StringValue,
  REFRESH_TOKEN_EXPIRY: (getEnv('REFRESH_TOKEN_EXPIRY', false) ||
    '7d') as ms.StringValue,

  // Cloudinary (Image Upload)
  CLOUDINARY_CLOUD_NAME: getEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: getEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: getEnv('CLOUDINARY_API_SECRET'),

  // Logging Service (Logtail)
  LOGTAIL_SOURCE_TOKEN: getEnv('LOGTAIL_SOURCE_TOKEN', false), // Optional for local dev
  LOGTAIL_INGESTING_HOST: getEnv('LOGTAIL_INGESTING_HOST', false),

  // Pagination Defaults
  defaultResLimit: 20,
  defaultResOffset: 0,
};

export default config;
