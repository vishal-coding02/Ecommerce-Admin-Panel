const Cart = require("../models/CartModel");
const Orders = require("../models/OrderModel");

async function placeOrders(req, res) {
  try {
    if (req.user.role === "user") {
      const cart = await Cart.findOne({ userId: req.body.id, _id });

      if (!cart || cart.products.length === 0) {
        return res.status(204).json({ message: "Cart is empty." });
      }

      let newOrder = {
        userId: cart.userId,
        products: cart.products,
        totalPrice: cart.totalPrice,
        totalItem: cart.products.length,
        orderStatus: cart.orderStatus,
        createdAt: new Date(),
      };

      await Orders.create(newOrder);
      await Cart.deleteOne({ userId: cart.userId });
      res.status(201).json({
        success: true,
        message: "Order placed successfully.",
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Only users can place orders.",
      });
    }
  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while placing the order.",
    });
  }
}

async function allOrders(req, res) {
  try {
    if (req.user.role === "admin") {
      const allOrders = await Orders.find({});
      console.log(allOrders);

      res.status(200).send(allOrders);
    } else {
      res.status(403).send({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    console.error("Orders Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching Orders.",
    });
  }
}

async function getUserOrders(req, res) {
  try {
    if (req.user.role === "user") {
      const myOrders = await Orders.findOne({ userId: req.params.id });
      console.log(myOrders);

      res.status(200).json({ data: myOrders });
    } else {
      res.status(403).json({ message: "Access denied. User only." });
    }
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching Orders.",
    });
  }
}

async function updateOrdersStatus(req, res) {
  try {
    if (req.user.role === "admin") {
      const updateStatus = await Orders.findByIdAndUpdate(req.body.id, {
        orderStatus: req.body.status,
        updateAt: new Date(),
      });

      if (updateStatus) {
        return res.status(200).json({
          success: true,
          message: "Order status updated successfully.",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Order not found or status already same.",
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admin can update order status.",
      });
    }
  } catch (err) {
    console.error("Order status update error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating order status.",
    });
  }
}

module.exports = { placeOrders, allOrders, getUserOrders, updateOrdersStatus };
