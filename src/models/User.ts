import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// Base interface for the shape of the user data (no Document extension)
export interface IUser {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    githubId?: string;
    avatar?: string;
    provider?: 'local' | 'google' | 'github';

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
            minlength: 6,
        },
        googleId: { type: String, unique: true, sparse: true },
        githubId: { type: String, unique: true, sparse: true },
        avatar: String,
        provider: {
            type: String,
            enum: ['local', 'google', 'github'],
            default: 'local',
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

// Pre-save hook: Hash password before saving (modern async style)
UserSchema.pre('save', async function (this: IUserDocument) {

    if (this.password &&this.isModified('password')) {

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return this.password ? await bcrypt.compare(candidatePassword, this.password) : false;
}


export default mongoose.model<IUserDocument, IUserModel>('User', UserSchema);