// Custom Modules
import { logger } from '@/lib/winston';

// Models
import Comment from '@/models/comment';
import User from '@/models/user';
import Blog from '@/models/blog';

//  Types
import type { Request, Response } from 'express';

import { NextFunction } from 'express';
import { AppError } from '@/utils/AppError';

const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUserId = req.userId;
  const { commentId } = req.params;

  try {
    // Check if the comment exists
    const comment = await Comment.findById(commentId)
      .select('user blog')
      .exec();

    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }

    // Retrieve the current user's role to check for admin privileges
    // Logic: User must own the comment OR be an admin
    let isAdmin = false;
    if (currentUserId) {
      const user = await User.findById(currentUserId).select('role').lean();
      if (user && user.role === 'admin') isAdmin = true;
    }

    // Check permissions
    if (comment.user.toString() !== currentUserId?.toString() && !isAdmin) {
      return next(
        new AppError('You do not have permission to delete this comment', 403),
      );
    }

    // Delete the comment
    await Comment.deleteOne({ _id: commentId });

    logger.info('Comment deleted successfully', {
      commentId,
      deletedBy: currentUserId,
    });

    // Decrement the blog's comments count automatically
    if (comment.blog) {
      await Blog.findByIdAndUpdate(comment.blog, {
        $inc: { commentsCount: -1 },
      });
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default deleteComment;
