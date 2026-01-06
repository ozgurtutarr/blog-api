// Custom Modules
import { logger } from '@/lib/winston';

// Models
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import { NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

// Types
import type { Request, Response } from 'express';

const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content) {
      return next(new AppError('Content is required', 400));
    }

    // Check if the blog post exists
    const blog = await Blog.findById(blogId).select('_id').exec();

    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    // Create a new comment
    const newComment = await Comment.create({
      blog: blogId,
      content,
      user: userId,
    });

    // Atomic increment of comments count
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });

    logger.info('New comment created', { commentId: newComment._id, blogId });

    res.status(201).json({
      status: 'success',
      data: {
        comment: newComment,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default createComment;
