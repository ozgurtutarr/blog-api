// Custom Models
import config from '@/config';
import { logger } from '@/lib/winston';

// Models
import Blog from '@/models/blog';
import User from '@/models/user';

// Types
import type { Request, Response, NextFunction } from 'express';
interface QueryType {
  status?: 'draft' | 'published';
}

import { AppError } from '@/utils/AppError';

const getAllBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || config.defaultResLimit;
    const offset =
      parseInt(req.query.offset as string) || config.defaultResOffset;
    const query: any = {};

    // Determine user role to filter logs
    let userRole = 'user';
    if (userId) {
      const user = await User.findById(userId).select('role').lean();
      if (user) userRole = user.role;
    }

    // Show only the published post to a normal user
    if (userRole === 'user') {
      query.status = 'published';
    }

    const total = await Blog.countDocuments(query);
    const blogs = await Blog.find(query)
      .select('-banner.publicId -__v')
      .populate('author', 'firstName lastName username email')
      .limit(limit)
      .skip(offset)
      .sort({ publishedAt: 'desc', createdAt: 'desc' }) // Sort by published date, fallback to created
      .lean()
      .exec();

    res.status(200).json({
      status: 'success',
      results: blogs.length,
      data: {
        total,
        limit,
        offset,
        blogs,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default getAllBlogs;
