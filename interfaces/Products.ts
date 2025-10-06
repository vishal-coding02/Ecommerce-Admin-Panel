import mongoose, { Document } from "mongoose";

export interface ProductDocument extends Document {
  productName: string;
  productPrice: number;
  productDescription: string;
  productStockCount: number;
  productImg: string;
  productCategory: string;
  productSubcategory: string[];
  createdAt: Date;
  modifiedBy: mongoose.Types.ObjectId;
  updateAt: Date;
}
