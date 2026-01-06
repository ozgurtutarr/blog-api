// Node Modules
import { Router } from 'express';

// Routes
import authRoutes from '@/routes/v1/auth';
import userRoutes from '@/routes/v1/user';

import blogRoutes from '@/routes/v1/blog';
import commentRoutes from '@/routes/v1/comment';

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
router.use('/blogs', blogRoutes);
router.use('/comments', commentRoutes);

// Like Routes (Inline for now or move to separate file if grows)
import toggleLike from '@/controllers/v1/like/toggle_like';
import authenticate from '@/middlewares/authenticate';
import { body, param } from 'express-validator';
import validationError from '@/middlewares/validationError';

router.post(
  '/likes/:resourceId',
  authenticate,
  param('resourceId').isMongoId().withMessage('Invalid ID'),
  body('resourceType')
    .isIn(['blog', 'comment'])
    .withMessage('Type must be blog or comment'),
  validationError,
  toggleLike,
);

export default router;
