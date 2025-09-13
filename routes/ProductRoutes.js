const express = require("express");
const productRouter = express.Router();
const { verifyToken } = require("../services/Auth");
const checkBlacklistedToken = require("../middlewares/CheckBlacklistedToken.js");
const {
  allProducts,
  createProducts,
  updateStatus,
  updateStock,
  deleteProduct,
} = require("../controllers/Products");

productRouter.post(
  "/products",
  verifyToken,
  checkBlacklistedToken,
  createProducts
);
productRouter.get("/products", verifyToken, checkBlacklistedToken, allProducts);
productRouter.patch("/products/status", checkBlacklistedToken, updateStatus);
productRouter.patch(
  "/products/stock",
  verifyToken,
  checkBlacklistedToken,
  updateStock
);
productRouter.delete(
  "/products",
  verifyToken,
  checkBlacklistedToken,
  deleteProduct
);

module.exports = productRouter;
