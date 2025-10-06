import mongoose, { Document } from "mongoose";

export interface Product {
  name: string;
  quantity: number;
}

export interface CartDocument extends Document {
  userId: string;
  products: Product[];
  totalPrice: number;
  orderStatus: string;
  totalItem: number;
  createdAt: Date;
}
