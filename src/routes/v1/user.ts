// Node Modules
import { Router } from 'express';
import { param, query, body } from 'express-validator';

// Middlewares
import authenticate from '@/middlewares/authenticate';
import authorize from '@/middlewares/authorize';
import validationError from '@/middlewares/validationError';

// Controllers
import getCurrentUser from '@/controllers/v1/user/get_current_user';
// import getAllUser from '@/controllers/v1/user/get_all_user';
// import getUser from '@/controllers/v1/user/get_user';
// import updateCurrentUser from '@/controllers/v1/user/update_current_user';
// import deleteUser from '@/controllers/v1/user/delete_user';
// import deleteCurrentUser from '@/controllers/v1/user/delete_current_user';

// Models
import User from '@/models/user';

const router = Router();

router.get(
  '/current',
  authenticate,
  authorize(['admin', 'user']),
  getCurrentUser,
);

export default router;
