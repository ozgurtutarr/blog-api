// Node Modules
import { Router } from 'express';

// Routes
import authRoutes from '@/routes/v1/auth';
import userRoutes from '@/routes/v1/user';

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
router.use('/users', userRoutes);

export default router;
