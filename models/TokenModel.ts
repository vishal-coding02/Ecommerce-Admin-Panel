import mongoose, { Model, Schema } from "mongoose";
import { TokenDocument } from "../interfaces/token";

const tokenSchema = new Schema<TokenDocument>({
  userToken: String,
});

const Token: Model<TokenDocument> = mongoose.model(
  "tokenBlacklists",
  tokenSchema
);

export default Token;
