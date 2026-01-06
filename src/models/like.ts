// Node modules
import { Schema, model, Types } from 'mongoose';

export interface ILike {
  blog?: Types.ObjectId;
  comment?: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const likeSchema = new Schema<ILike>(
  {
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes to prevent duplicate likes
likeSchema.index(
  { blog: 1, user: 1 },
  { unique: true, partialFilterExpression: { blog: { $exists: true } } },
);
likeSchema.index(
  { comment: 1, user: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true } } },
);

export default model<ILike>('Like', likeSchema);
