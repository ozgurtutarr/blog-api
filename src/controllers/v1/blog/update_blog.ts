// Custom Modules
import { logger } from '@/lib/winston';

// Models
import Blog from '@/models/blog';
import User from '@/models/user';

// Types
import type { Request, Response, NextFunction } from 'express';
import type { IBlog } from '@/models/blog';
type BlogData = Partial<Pick<IBlog, 'title' | 'content' | 'banner' | 'status'>>;

// Utils
import { AppError } from '@/utils/AppError';

const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, banner, status } = req.body as BlogData;
    const userId = req.userId;
    const slug = req.params.slug;

    // Fetch User Role
    let userRole = 'user';
    if (userId) {
      const user = await User.findById(userId).select('role').lean();
      if (user) userRole = user.role;
    }

    const blog = await Blog.findOne({ slug }).select('-__v').exec();

    if (!blog) {
      return next(new AppError('Blog not found', 404));
    }

    // Check ownership or admin
    // Mongoose ObjectId comparison needs .toString() or .equals() usually, but strict equality might fail if types differ
    // casting to string is safer.
    if (blog.author.toString() !== userId?.toString() && userRole !== 'admin') {
      return next(
        new AppError('You do not have permission to update this blog', 403),
      );
    }

    if (title) blog.title = title;
    if (content) blog.content = content;
    if (banner) blog.banner = banner;
    if (status) blog.status = status;

    // Update publishedAt if status changes to published
    if (status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    await blog.save();
    logger.info('Blog updated', { blogId: blog._id, userId });

    res.status(200).json({
      status: 'success',
      data: {
        blog,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default updateBlog;
