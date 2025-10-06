import { Document } from "mongoose";

export interface JwtPayload {
  _id: string;
  userName: string;
  userRole: string;
  userStatus: string;
}

export interface TokenDocument extends Document {
  userToken: string;
}
