// Node modules
import { v2 as cloudinary } from 'cloudinary';

// Custom modules

import { logger } from '@/lib/winston';

// Models

import Blog from '@/models/blog';
import User from '@/models/user';

// Types
import type { Request, Response, NextFunction } from 'express';

import { AppError } from '@/utils/AppError';

const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const blogId = req.params.blogId;

    // Fetch User Role
    let userRole = 'user';
    if (userId) {
      const user = await User.findById(userId).select('role').lean();
      if (user) userRole = user.role;
    }

    const blog = await Blog.findById(blogId)
      .select('author banner.publicId')
      .exec();

    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    // Check ownership or admin
    if (blog.author.toString() !== userId?.toString() && userRole !== 'admin') {
      return next(
        new AppError('You do not have permission to delete this blog', 403),
      );
    }

    // Delete image from Cloudinary
    if (blog.banner && blog.banner.publicId) {
      try {
        await cloudinary.uploader.destroy(blog.banner.publicId);
        logger.info('Blog banner deleted from cloudinary', {
          publicId: blog.banner.publicId,
        });
      } catch (imgErr) {
        logger.error('Failed to delete blog banner from Cloudinary', imgErr);
        // Continue deletion of blog post even if image deletion fails, valid strategy?
        // Usually yes, to avoid orphaned records. Or we could throw error.
        // Let's log and proceed.
      }
    }

    await Blog.deleteOne({ _id: blogId });
    logger.info('Blog deleted successfully', { blogId, userId });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default deleteBlog;
