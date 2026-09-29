import { Router } from 'express';
import {
  createStaff,
  getMechanics,
  getAllUsers,
  getUserById,
  toggleUserStatus,
} from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/rbac.middleware';
import { validate } from '../middlewares/validate.middleware';
import { USER_ROLES } from '../constants';
import {
  createStaffSchema,
  updateUserStatusSchema,
  userQuerySchema,
} from '../validations/user.validation';

const router = Router();

router.use(authMiddleware);

router.get(
  '/mechanics',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.KASIR),
  getMechanics
);

router.post(
  '/',
  authorizeRoles(USER_ROLES.ADMIN),
  validate(createStaffSchema),
  createStaff
);

router.get(
  '/',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.PEMILIK),
  validate(userQuerySchema),
  getAllUsers
);

router.get(
  '/:id',
  authorizeRoles(USER_ROLES.ADMIN, USER_ROLES.PEMILIK),
  getUserById
);

router.patch(
  '/:id/status',
  authorizeRoles(USER_ROLES.ADMIN),
  validate(updateUserStatusSchema),
  toggleUserStatus
);

export default router;
