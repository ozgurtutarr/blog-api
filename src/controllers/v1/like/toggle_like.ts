import { NextFunction, Request, Response } from 'express';
import { AppError } from '@/utils/AppError';
import Like from '@/models/like';
import Blog from '@/models/blog';
import Comment from '@/models/comment';
import { Types } from 'mongoose';

const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
  const { resourceId } = req.params;
  const { resourceType } = req.body; // 'blog' or 'comment'
  const userId = req.userId;

  if (!['blog', 'comment'].includes(resourceType)) {
    return next(
      new AppError('Invalid resource type. Must be "blog" or "comment"', 400),
    );
  }

  try {
    let resourceModel: any;
    let queryFn: any;

    if (resourceType === 'blog') {
      resourceModel = Blog;
      queryFn = { blog: resourceId, user: userId };
    } else {
      resourceModel = Comment;
      queryFn = { comment: resourceId, user: userId };
    }

    // Check if resource exists
    const resource = await resourceModel
      .findById(resourceId)
      .select('_id likesCount')
      .exec();
    if (!resource) {
      return next(new AppError(`${resourceType} not found`, 404));
    }

    // Check if like already exists
    const existingLike = await Like.findOne(queryFn).exec();

    let isLiked = false;

    if (existingLike) {
      // Unlike
      await Like.deleteOne({ _id: existingLike._id });
      await resourceModel.findByIdAndUpdate(resourceId, {
        $inc: { likesCount: -1 },
      });
      isLiked = false;
    } else {
      // Like
      await Like.create({
        [resourceType]: resourceId, // 'blog': id OR 'comment': id
        user: userId,
      });
      await resourceModel.findByIdAndUpdate(resourceId, {
        $inc: { likesCount: 1 },
      });
      isLiked = true;
    }

    res.status(200).json({
      status: 'success',
      data: {
        isLiked,
        resourceId,
        resourceType,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default toggleLike;
