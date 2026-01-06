// Node modules
import { Schema, model, Types } from 'mongoose';

export interface IComment {
  blog: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  likesCount: number;
  replies: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      maxLength: [1000, 'Content must be less than 1000 characters'],
      trim: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    replies: {
      type: [Schema.Types.ObjectId],
      ref: 'Comment',
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default model<IComment>('Comment', commentSchema);
