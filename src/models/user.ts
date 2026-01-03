// Node Modules
import { Schema, model, CallbackError } from 'mongoose';
import bcrypt from 'bcrypt';

// Types

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  firstName?: string;
  lastName?: string;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    x?: string;
    youtube?: string;
  };
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      maxLength: [20, 'Username must be less than 20 characters'],
      unique: [true, 'Username must be unique'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      maxLength: [50, 'Email must be less than 50 characters'],
      unique: [true, 'Email must be unique'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['admin', 'user'],
        message: '{VALUE} is not supported',
      },
      default: 'user',
    },
    firstName: {
      type: String,
      maxLength: [20, 'First name must be less than 20 characters'],
    },
    lastName: {
      type: String,
      maxLength: [20, 'Last name must be less than 20 characters'],
    },
    socialLinks: {
      website: {
        type: String,
        maxLength: [100, 'Website address must be less than 100 characters'],
      },
      facebook: {
        type: String,
        maxLength: [
          100,
          'Facebook profile url must be less than 100 characters',
        ],
      },
      instagram: {
        type: String,
        maxLength: [
          100,
          'Instagram profile url must be less than 100 characters',
        ],
      },
      linkedin: {
        type: String,
        maxLength: [
          100,
          'LinkedIn profile url must be less than 100 characters',
        ],
      },
      x: {
        type: String,
        maxLength: [100, 'X profile url must be less than 100 characters'],
      },
      youtube: {
        type: String,
        maxLength: [
          100,
          'Youtube channel url must be less than 100 characters',
        ],
      },
    },
  },
  {
    timestamps: true,
  },
);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  // Hash the password
  this.password = await bcrypt.hash(this.password, 10);
});

export default model<IUser>('User', userSchema);
