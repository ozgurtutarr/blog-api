// Custom Modules
import { logger } from '@/lib/winston';
import config from '@/config';

// Models
import Comment from '@/models/comment';

// Types
import { NextFunction } from 'express';
import type { Request, Response } from 'express';

const getComments = async (req: Request, res: Response, next: NextFunction) => {
  const { offset = config.defaultResOffset, limit = config.defaultResLimit } =
    req.query;

  try {
    const comments = await Comment.find()
      .populate('blog', 'banner.url title slug')
      .populate('user', 'username email firstName lastName')
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const total = await Comment.countDocuments();

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: {
        total,
        offset: Number(offset),
        limit: Number(limit),
        comments,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default getComments;
