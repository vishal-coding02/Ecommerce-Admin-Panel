require("dotenv").config();
const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
const JWT_REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
let app = express();

app.use(express.json());
app.use(cookieParser());

// Server Port
const PORT = process.env.PORT;
console.log(PORT);
// Connecting with MongoDb
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDb connected");
  })
  .catch(() => {
    console.log("connection error");
  });

// Schemas & Bridges

const usersSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  userPhone: String,
  userPassword: String,
  userStatus: String,
  userRole: String,
  createdAt: Date,
  modifiedBy: mongoose.Schema.Types.ObjectId,
  updateAt: Date,
});

const Users = mongoose.model("users", usersSchema);

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

const cartSchema = mongoose.Schema({
  userId: String,
  products: [{ name: String, quantity: Number }],
  totalPrice: Number,
  orderStatus: String,
  totalItem: Number,
  createdAt: Date,
});

const Cart = mongoose.model("cart", cartSchema);

const tokenSchema = mongoose.Schema({
  userToken: String,
});

const Token = mongoose.model("tokenBlacklists", tokenSchema);

// User CRUD

app.post("/signUp", async (req, res) => {
  const hashPassword = await bcryptjs.hash(req.body.password, 10);
  console.log(hashPassword);
  const newUser = {
    userName: req.body.name,
    userEmail: req.body.email,
    userPhone: req.body.phone,
    userPassword: hashPassword,
    userStatus: "active",
    userRole: req.body.role,
    createdAt: new Date().toISOString(),
  };
  await Users.create(newUser);
  res.status(201).json({ message: "User created...!" });
});

function generateToken(user) {
  const accessToken = jwt.sign(
    {
      id: user._id,
      name: user.userName,
      role: user.userRole,
      status: user.userStatus,
    },
    JWT_ACCESS_SECRET_KEY,
    { expiresIn: "5m" }
  );
  console.log(accessToken);
  const refreshToken = jwt.sign(
    {
      id: user._id,
      name: user.userName,
      role: user.userRole,
      status: user.userStatus,
    },
    JWT_REFRESH_SECRET_KEY,
    { expiresIn: "7d" }
  );
  console.log(refreshToken);

  return { accessToken, refreshToken };
}

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ userEmail: req.body.email });
  if (!user) {
    console.log("User not found");
    return res.status(404).json({ message: "User not found" });
  }

  console.log(user);

  const isMatch = await bcryptjs.compare(req.body.password, user.userPassword);
  if (!isMatch) {
    console.log("Invalid credentials");
    return res.status(400).send("Invalid credentials");
  }

  console.log(user.userPassword);
  const { accessToken, refreshToken } = generateToken(user);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    path: "/refreshToken",
  });
  res.json({ token: accessToken });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);
  if (!token) {
    console.log("Token missing");
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET_KEY);
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    console.log("Invalid Token");
    return res.status(400).json({ message: "Invalid Token" });
  }
}

app.post("/refreshToken", (req, res) => {
  const token = req.cookies.refreshToken;
  console.log(token);
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET_KEY);
    const newAccessToken = jwt.sign(
      {
        id: payload.id,
        name: payload.name,
        role: payload.role,
        status: payload.status,
      },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: "15m" }
    );
    res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

app.use(verifyToken, async (req, res, next) => {
  const blackListToken = await Token.findOne({ userToken: req.token });
  console.log("user token", blackListToken);
  if (blackListToken) {
    res
      .status(200)
      .json({ message: "Token is blackList / please login again" });
  } else {
    next();
  }
});

app.get("/users/profile", verifyToken, async (req, res) => {
  if (req.user.role === "user") {
    if (req.user.status === "blocked") {
      res.status(200).json({
        message:
          "Your account has been blocked by admin. Please contact support.",
      });
    } else {
      res.status(200).json({
        message: `You are authorized. Welcome : ${req.user.name}`,
      });
    }
  } else {
    res.status(403).json({ message: "Access denied. Users only." });
  }
});

app.patch("/users/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const adminId = await Users.findOne({ userRole: "admin" }, { _id: 1 });
      const updatedUser = await Users.findByIdAndUpdate(
        req.body.id,
        {
          userStatus: req.body.status,
          modifiedBy: adminId,
          updateAt: new Date().toISOString(),
        },
        { new: true }
      );
      if (updatedUser) {
        res.status(200).json({
          success: true,
          message: "User status updated successfully.",
        });
      } else {
        res.status(404).json({ success: false, message: "User not found." });
      }
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating user status.",
    });
    console.log(err);
  }
});

app.delete("/users", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      await Users.findByIdAndDelete(req.body.id);
      res.status(200).json({ message: "user deleted" });
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

app.post("/logout", verifyToken, async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.body.id });
    const token = req.token;
    console.log("user token :", token);

    const blackListTokens = {
      userToken: token,
    };
    console.log(blackListTokens);
    await Token.create(blackListTokens);

    if (user) {
      res.status(200).json({ message: "Logout successful" });
    } else {
      res.status(404).json({ message: "user not found" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Something went wrong while logout user." });
  }
});

// Product CRUD

app.post("/products", verifyToken, async (req, res) => {
  if (req.user.role === "admin") {
    const newProduct = {
      productName: req.body.name,
      productPrice: req.body.price,
      productDescription: req.body.description,
      productStockCount: 0,
      productImg: "",
      productCategory: req.body.category,
      productSubcategory: req.body.subCategory,
      createdAt: new Date().toISOString(),
    };
    await Product.create(newProduct);
    res.status(201).json({ message: "product added...!" });
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
});

app.get("/products", async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const products = await Product.find();

      if (products.length > 0) {
        res.status(200).send({
          success: true,
          message: "Products fetched successfully.",
          data: products,
        });
      } else {
        res.status(404).json({
          success: false,
          message: "No products found.",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products.",
    });
  }
});

app.patch("/products/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const updatedProduct = await Product.updateMany(
        { productCategory: req.body.category },
        {
          $push: { productSubcategory: [req.body.subcategory] },
        }
      );
      if (updatedProduct) {
        res.status(200).json({
          success: true,
          message: "Product updated successfully.",
        });
      } else {
        res.status(404).json({ success: false, message: "Product not found." });
      }
    } else {
      res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while updating product.",
    });
  }
});

app.patch("/products/stock", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const adminId = await Users.findOne({ userRole: "admin" }, { _id: 1 });
      const updateStock = await Product.findByIdAndUpdate(req.body.id, {
        $inc: {
          productStockCount: req.body.stock,
        },
        $set: {
          modifiedBy: adminId,
          updatedAt: new Date().toString(),
        },
      });
      if (updateStock) {
        return res.status(200).json({
          success: true,
          message: "Stock updated successfully.",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Product not found or stock unchanged.",
        });
      }
    } else {
      res.status(403).send({
        success: false,
        message: "Only admin can update stock.",
      });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong while updating stock.",
    });
  }
});

app.delete("/products", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const deleteResult = await Product.deleteOne({ _id: req.body.id });

      if (deleteResult) {
        res.status(200).json({
          success: true,
          message: "Product deleted successfully.",
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Product not found or already deleted.",
        });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the product.",
    });
  }
});

// Admin
app.get("/dashboard", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const allProducts = await Product.find();
      const allUsers = await Users.find();
      const allOrders = await Orders.find();

      res.status(200).json({
        success: true,
        message: "Dashboard data fetched successfully.",
        totalProducts: allProducts.length,
        totalUsers: allUsers.length,
        totalOrders: allOrders.length,
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. Only admins can access the dashboard.",
      });
    }
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching dashboard data.",
    });
  }
});

app.get("/admin/profile", verifyToken, async (req, res) => {
  if (req.user.role === "admin") {
    res
      .status(200)
      .json({ message: `You are authorized. Welcome : ${req.user.name}` });
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
});

// carts
app.post("/carts", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const { product } = req.body;

      let totalPrice = 0;

      for (let item of product) {
        const productData = await Product.findOne(
          { productName: item.name },
          { productPrice: 1 }
        );

        if (productData) {
          totalPrice += productData.productPrice * item.quantity;
        }
      }
      let newCart = {
        userId: req.body.id,
        products: req.body.product,
        totalPrice: totalPrice,
        totalItem: product.length,
        orderStatus: "Pending",
        createdAt: new Date().toString(),
      };
      console.log(newCart);
      await Cart.create(newCart);
      res.status(201).json({
        success: true,
        message: "Product added to cart successfully.",
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Only users can add to cart.",
      });
    }
  } catch (err) {
    console.error("Cart Creation Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

app.get("/cart/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const myCart = await Cart.findOne({ userId: req.params.id });

      if (!myCart || myCart.products.length === 0) {
        return res.status(204).json({
          success: false,
          message: "Your cart is empty.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cart fetched successfully.",
        cart: myCart,
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Only users can access the cart.",
      });
    }
  } catch (err) {
    console.error("Cart Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your cart.",
    });
  }
});

app.delete("/cart/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const deletedCart = await Cart.findOneAndDelete({
        userId: req.params.id,
      });

      if (!deletedCart) {
        return res.status(404).json({
          success: false,
          message: "No cart found to delete.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Cart deleted successfully.",
        cart: deletedCart,
      });
    } else {
      res.status(403).json({
        success: false,
        message: "Only users can access the cart.",
      });
    }
  } catch (err) {
    console.error("Cart Deletion Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the cart.",
    });
  }
});

// Orders
app.post("/orders", verifyToken, async (req, res) => {
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
        createdAt: new Date().toString(),
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
});

app.get("/orders", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const allOrders = await Orders.find({});
      console.log(allOrders);

      res.status(200).send(allOrders);
    } else {
      res.status(403).send({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching Orders.",
    });
  }
});

app.get("/orders/:id", verifyToken, async (req, res) => {
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
});

app.patch("/orders/status", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const updateStatus = await Orders.findByIdAndUpdate(req.body.id, {
        orderStatus: req.body.status,
        updateAt: new Date().toString(),
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
});

app.listen(PORT, () => {
  console.log("Server started...");
});
