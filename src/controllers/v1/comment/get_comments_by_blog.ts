// Custom Modules
import { logger } from '@/lib/winston';

// Models
import Blog from '@/models/blog';
import Comment from '@/models/comment';

import { NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

// Types
import type { Request, Response } from 'express';

const getCommentsByBlog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { slug } = req.params;

  try {
    // Check if the blog post exist by its slug
    const blog = await Blog.findOne({ slug }).select('_id').exec();

    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    // Find all comments for this blog
    const comments = await Comment.find({ blog: blog._id })
      .populate('user', 'username firstName lastName')
      .sort({ createdAt: -1 }) // Newest first
      .lean()
      .exec();

    res.status(200).json({
      status: 'success',
      results: comments.length,
      data: {
        comments,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default getCommentsByBlog;
