import { Router } from 'express';

import authRoutes from './auth';
const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'API v1 is working!',
    status: 200,
    version: '1.0.0',
    docs: 'https:localhost3000',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);

export default router;
