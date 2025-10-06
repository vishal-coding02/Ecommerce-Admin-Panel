import mongoose, { Schema, Model } from "mongoose";
import { OrderDocument } from "../interfaces/Orders";

const ordersSchema = new Schema<OrderDocument>({
  userId: { type: String, required: true },
  products: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  orderStatus: { type: String, default: "Pending" },
  totalItem: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now },
});

const Orders: Model<OrderDocument> = mongoose.model<OrderDocument>(
  "orders",
  ordersSchema
);

export default Orders;
