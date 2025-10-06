import mongoose, { Schema, Model } from "mongoose";
import { CartDocument } from "../interfaces/Carts";

const cartSchema = new Schema<CartDocument>({
  userId: { type: String, required: true },
  products: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  orderStatus: { type: String, default: "pending" },
  totalItem: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Cart: Model<CartDocument> = mongoose.model<CartDocument>(
  "cart",
  cartSchema
);

export default Cart;
