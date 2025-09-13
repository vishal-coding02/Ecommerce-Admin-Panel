const mongoose = require("mongoose");

const ordersSchema = mongoose.Schema({
  userId: String,
  products: [{ name: String, quantity: Number }],
  totalPrice: Number,
  orderStatus: String,
  totalItem: Number,
  createdAt: Date,
  updateAt: Date,
});

const Orders = mongoose.model("orders", ordersSchema);

module.exports = Orders