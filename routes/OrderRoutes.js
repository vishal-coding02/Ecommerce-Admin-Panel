const express = require("express");
const ordersRouter = express.Router();
const { verifyToken } = require("../services/Auth");
const {
  allOrders,
  placeOrders,
  getUserOrders,
  updateOrdersStatus,
} = require("../controllers/Orders");
const checkBlacklistedToken = require("../middlewares/CheckBlacklistedToken");

ordersRouter.post("/orders", verifyToken, checkBlacklistedToken, placeOrders);
ordersRouter.get("/orders", verifyToken, checkBlacklistedToken, allOrders);
ordersRouter.get(
  "/orders/:id",
  verifyToken,
  checkBlacklistedToken,
  getUserOrders
);
ordersRouter.patch(
  "/orders/status",
  verifyToken,
  checkBlacklistedToken,
  updateOrdersStatus
);

module.exports = ordersRouter;
