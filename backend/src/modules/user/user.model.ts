import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../../utils/hash";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    avatarUrl?: string;
    comparePassword(value: string): Promise<boolean>;
    omitPassword(): Omit<IUser, "password">;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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
        // Optional now: only set for users who actually sign up with email/password.
        // OAuth-only users (google, facebook, ...) never get one — the Account model
        // is what decides how a user is allowed to log in, not this field.
        password: {
            type: String,
            select: false,
        },
       
        avatarUrl: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (this.isModified("password") && this.password) {
        this.password = await hashValue(this.password);
    }
});

userSchema.methods.comparePassword = async function (password: string) {
    if (!this.password) return false;
    return await compareValue(password, this.password);
};

userSchema.methods.omitPassword = function () {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;