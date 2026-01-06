// Node modules
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { Request, Response, NextFunction } from 'express';

// Custom modules
import { logger } from '@/lib/winston';
import { AppError } from '@/utils/AppError';

// Models
import Blog, { IBlog } from '@/models/blog';

// Purify the blog content

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const createBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, banner, status } = req.body;
    const userId = req.userId;

    if (!userId) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!title || !content) {
      return next(new AppError('Title and content are required', 400));
    }

    // Sanitize content to prevent XSS
    const cleanContent = purify.sanitize(content);

    const newBlog = await Blog.create({
      title,
      content: cleanContent,
      banner,
      status: status || 'draft',
      author: userId,
      publishedAt: status === 'published' ? new Date() : undefined,
    });

    logger.info('New blog created', { blogId: newBlog._id, author: userId });

    res.status(201).json({
      status: 'success',
      data: {
        blog: newBlog,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default createBlog;
