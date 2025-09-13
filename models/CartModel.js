const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
  userId: String,
  products: [{ name: String, quantity: Number }],
  totalPrice: Number,
  orderStatus: String,
  totalItem: Number,
  createdAt: Date,
});

const Cart = mongoose.model("cart", cartSchema);

module.exports = Cart;
