// Custom Modules
import { AppError } from '@/utils/AppError';
import uploadToCloudinary from '@/lib/cloudinary';
import { logger } from '@/lib/winston';

// Models
import Blog from '@/models/blog';

// Types
import type { Request, Response, NextFunction } from 'express';

// CONSTANTS
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const uploadBlogBanner = (method: 'post' | 'put') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (method === 'put' && !req.file) {
        return next();
      }

      if (!req.file) {
        throw new AppError('Blog banner is required', 400);
      }

      if (req.file.size > MAX_FILE_SIZE) {
        throw new AppError('File size must be less than 2MB', 413);
      }

      const { blogId } = req.params;
      let existingPublicId: string | undefined;

      // If updating, try to find existing blog to replace image
      if (blogId) {
        const blog = await Blog.findById(blogId)
          .select('banner.publicId')
          .lean();
        if (blog?.banner?.publicId) {
          existingPublicId = blog.banner.publicId;
        }
      }

      const data = await uploadToCloudinary(
        req.file.buffer,
        existingPublicId
          ? existingPublicId.replace('blog-api/', '')
          : undefined,
      );

      if (!data) {
        throw new AppError(
          'Error while uploading blog banner to cloudinary',
          500,
        );
      }

      const newBanner = {
        publicId: data.public_id,
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };

      req.body.banner = newBanner;
      next();
    } catch (err: any) {
      if (err.http_code) {
        return next(new AppError(err.message, err.http_code));
      }
      next(err);
    }
  };
};

export default uploadBlogBanner;
