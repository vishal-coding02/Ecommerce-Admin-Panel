const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
  productName: String,
  productPrice: Number,
  productDescription: String,
  productStockCount: Number,
  productImg: String,
  productCategory: String,
  productSubcategory: [String],
  createdAt: Date,
  modifiedBy: mongoose.Schema.Types.ObjectId,
  updateAt: Date,
});

const Product = mongoose.model("products", productSchema);

module.exports = Product