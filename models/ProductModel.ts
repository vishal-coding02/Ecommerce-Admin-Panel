import mongoose, { Model, Schema } from "mongoose";
import { ProductDocument } from "../interfaces/Products";

const productSchema = new Schema<ProductDocument>({
  productName: String,
  productPrice: Number,
  productDescription: String,
  productStockCount: Number,
  productImg: String,
  productCategory: String,
  productSubcategory: [String],
  createdAt: Date,
  modifiedBy: Schema.Types.ObjectId,
  updateAt: Date,
});

const Product: Model<ProductDocument> = mongoose.model(
  "products",
  productSchema
);

export default Product;
