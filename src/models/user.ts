// Node Modules
import { Schema, model, Model, CallbackError } from 'mongoose';
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
  createdAt: Date;
  updatedAt: Date;
}

// Interface for User Instance Methods
export interface IUserMethods {
  correctPassword(candidatePassword: string): Promise<boolean>;
}

// Combine Interface
type UserModel = Model<IUser, {}, IUserMethods>;

// User Schema Schema<DocType, Model, InstanceMethods>
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      maxLength: [20, 'Username must be less than 20 characters'],
      unique: true, // simplified unique check
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      maxLength: [50, 'Email must be less than 50 characters'],
      unique: true,
      lowercase: true,
      trim: true,
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
      trim: true,
    },
    lastName: {
      type: String,
      maxLength: [20, 'Last name must be less than 20 characters'],
      trim: true,
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

// Pre-save hook to hash password
userSchema.pre('save', async function () {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return;

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default model<IUser, UserModel>('User', userSchema);
