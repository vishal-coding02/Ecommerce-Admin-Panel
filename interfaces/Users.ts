import mongoose, { Document } from "mongoose";

export interface UserDocument extends Document {
  userName: string;
  userEmail: string;
  userPhone: string;
  userPassword: string;
  userStatus: string;
  userRole: string;
  createdAt: Date;
  modifiedBy?: mongoose.Types.ObjectId;
  updateAt?: Date;
}

import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    role: string;
    status: string;
  };
  token: string;
}

export interface LoginBody {
  email: string;
  password: string;
}
