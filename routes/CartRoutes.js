const express = require("express");
const cartRouter = express.Router();
const { addToCart, removeCart, allCartItems } = require("../controllers/Carts");
const checkBlacklistedToken = require("../middlewares/CheckBlacklistedToken");
const { verifyToken } = require("../services/Auth");

cartRouter.post("/carts", verifyToken, checkBlacklistedToken, addToCart);
cartRouter.get("/cart/:id", verifyToken, checkBlacklistedToken, allCartItems);
cartRouter.delete("/cart/:id", verifyToken, checkBlacklistedToken, removeCart);

module.exports = cartRouter;
