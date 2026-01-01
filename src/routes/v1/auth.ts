import { Router } from 'express';

import register from '@/controllers/v1/auth/register';

const router = Router();

router.post('/register', register);

export default router;
