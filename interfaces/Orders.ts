import { Document } from "mongoose";

export interface OrderDocument extends Document {
  userId: string;
  products: { name: string; quantity: number }[];
  totalPrice: number;
  orderStatus: string;
  totalItem: number;
  createdAt: Date;
  updateAt: Date;
}
