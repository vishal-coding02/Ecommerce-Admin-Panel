import mongoose, { Schema, Model } from "mongoose";
import { UserDocument } from "../interfaces/Users";

const userSchema = new Schema<UserDocument>(
  {
    userName: { type: String, required: true },
    userEmail: { type: String, required: true, unique: true },
    userPhone: { type: String, required: true },
    userPassword: { type: String, required: true },
    userStatus: { type: String, default: "active" },
    userRole: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    modifiedBy: { type: Schema.Types.ObjectId, ref: "users" },
    updateAt: { type: Date },
  },
  { timestamps: true }
);

const Users: Model<UserDocument> = mongoose.model<UserDocument>(
  "users",
  userSchema
);

export default Users;
