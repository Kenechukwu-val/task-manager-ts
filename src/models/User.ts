import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Base interface for the shape of the user data (no Document extension)
export interface IUser {
    name: string;
    email: string;
    password: string;
}

// Interface for the full Mongoose Document (includes _id, timestamps, methods, etc.)
export interface IUserDocument extends IUser, Document {
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Optional: Interface for the Model (if you add static methods later)
export interface IUserModel extends Model<IUserDocument> {
  // Add static methods here in the future, e.g., findByEmail()
}

const UserSchema: Schema<IUserDocument> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

// Pre-save hook: Hash password before saving (modern async style)
UserSchema.pre('save', async function (this: IUserDocument) {
  // 'this' is typed as IUserDocument thanks to the generic
    if (!this.isModified('password')) {
        return; // No need to call next()
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (
    this: IUserDocument,
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUserDocument, IUserModel>('User', UserSchema);