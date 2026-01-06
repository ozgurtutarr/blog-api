// Node modules
import { Schema, model, Types, Model } from 'mongoose';

// Custom modules
import { genSlug } from '@/utils';

// Interfaces
export interface IBlog {
  title: string;
  slug: string;
  content: string;
  banner: {
    publicId: string;
    url: string;
    width: number;
    height: number;
  };
  author: Types.ObjectId;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Blog Schema
const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxLength: [180, 'Title must be less than 180 characters'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      index: true, // Optimizing search by slug
    },
    content: {
      type: String, // Might be Markdown or HTML
      required: [true, 'Content is required'],
    },
    banner: {
      publicId: {
        type: String,
        required: [true, 'Banner public id is required'],
      },
      url: {
        type: String,
        required: [true, 'Banner URL is required'],
      },
      width: {
        type: Number,
        required: [true, 'Banner width is required'],
      },
      height: {
        type: Number,
        required: [true, 'Banner height is required'],
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true, // Optimizing search by author
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: '{VALUE} is not supported',
      },
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

blogSchema.pre('validate', function (next: any) {
  if (this.title && !this.slug) {
    this.slug = genSlug(this.title);
  }

  next();
});

export default model<IBlog>('Blog', blogSchema);
