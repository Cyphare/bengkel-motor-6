import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { USER_ROLES } from '../constants';
import { sendCreated, sendPaginated, sendSuccess } from '../utils/response';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/appError';

export const createStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError(`Email '${email}' sudah digunakan oleh pengguna lain`);
    }

    const staff = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
    });

    sendCreated(res, `Akun staf (${role}) berhasil dibuat`, staff);
  } catch (error) {
    next(error);
  }
};

export const getMechanics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const mechanics = await User.find({
      role: USER_ROLES.MEKANIK,
      isActive: true,
    })
      .select('name email phone isActive createdAt')
      .sort({ name: 1 });

    sendSuccess(res, 'Daftar mekanik aktif berhasil diambil', mechanics);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    sendPaginated(res, 'Daftar pengguna berhasil diambil', users, {
      page,
      limit,
      total,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    sendSuccess(res, 'Detail pengguna berhasil diambil', user);
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isActive } = req.body;
    const targetUserId = req.params.id;

    // Prevent admin from disabling their own account
    if (req.user?.id === targetUserId && !isActive) {
      throw new BadRequestError('Anda tidak dapat menonaktifkan akun admin Anda sendiri');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw new NotFoundError('Pengguna tidak ditemukan');
    }

    user.isActive = isActive;
    await user.save();

    const statusText = isActive ? 'diaktifkan' : 'dinonaktifkan';
    sendSuccess(res, `Akun pengguna ${user.name} berhasil ${statusText}`, user);
  } catch (error) {
    next(error);
  }
};
