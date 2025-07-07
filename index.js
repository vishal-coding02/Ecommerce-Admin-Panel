const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "mysecretkey";
const mongoose = require("mongoose");
let app = express();

app.use(express.json());

// Connecting with MongoDb

mongoose
  .connect("mongodb://localhost:27017/Ecommerce")
  .then(() => {
    console.log("MongoDb connected");
  })
  .catch(() => {
    console.lo("connection error");
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

app.post("/login", async (req, res) => {
  const user = await Users.findOne({ userEmail: req.body.email });
  if (!user) {
    console.log("User not found");
    return res.status(400).send("User not found");
  }

  console.log(user);

  const isMatch = await bcryptjs.compare(req.body.password, user.userPassword);
  if (!isMatch) {
    console.log("Invalid credentials");
    return res.status(400).send("Invalid credentials");
  }

  console.log(user.userPassword);

  const token = jwt.sign(
    {
      id: user._id,
      name: user.userName,
      email: user.userEmail,
      role: user.userRole,
      status: user.userStatus,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
  res.json({ token: token });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  // console.log(token);

  if (!token) {
    console.log("Token missing");
    return res.status(401).send("Token missing");
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("Invalid Token");
    return res.status(401).send("Invalid Token");
  }
}

app.get("/userProfile", verifyToken, (req, res) => {
  if (req.user.role === "user") {
    if (req.user.status === "blocked") {
      res.send(
        "Your account has been blocked by admin. Please contact support."
      );
    } else {
      res.send("You are authorized. Welcome " + req.user.name);
    }
  } else {
    res.status(400).send({ message: "Access denied. Users only." });
  }
});

app.patch("/changeStatus", verifyToken, async (req, res) => {
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
        res.status(200).send({
          success: true,
          message: "User status updated successfully.",
        });
      } else {
        res.status(404).send({ success: false, message: "User not found." });
      }
    } else {
      res.status(400).send({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong while updating user status.",
    });
    console.log(err);
  }
});

app.delete("/deleteUser", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      await Users.findByIdAndDelete(req.body.id);
      res.status(200).send({ message: "user deleted" });
    } else {
      res.status(403).send({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    res.status(500).send({ error: "Failed to delete user" });
  }
});

// Product CRUD

app.post("/createProduct", verifyToken, async (req, res) => {
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
    res.status(403).send({ message: "Access denied. Admins only." });
  }
});

app.get("/allProducts", async (req, res) => {
  try {
    // if (req.user.role === "admin") {
    const products = await Product.find();

    if (products.length > 0) {
      res.status(200).send({
        success: true,
        message: "Products fetched successfully.",
        data: products,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "No products found.",
      });
    }
    // } else {
    //   res.status(403).send({
    //     success: false,
    //     message: "Access denied. Admins only.",
    //   });
    // }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      message: "Something went wrong while fetching products.",
    });
  }
});

app.patch("/updateProduct", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const updatedProduct = await Product.updateMany(
        { productCategory: req.body.category },
        {
          $push: { productSubcategory: [req.body.subcategory] },
        }
      );
      if (updatedProduct) {
        res.status(200).send({
          success: true,
          message: "Product updated successfully.",
        });
      } else {
        res.status(404).send({ success: false, message: "Product not found." });
      }
    } else {
      res.status(400).send({ message: "Access denied. Admins only." });
    }
  } catch (err) {
    res.status(500).send({
      success: false,
      message: "Something went wrong while updating product.",
    });
  }
});

app.delete("/deleteProduct", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const deleteResult = await Product.deleteOne({ _id: req.body.id });

      if (deleteResult) {
        res.status(200).send({
          success: true,
          message: "Product deleted successfully.",
        });
      } else {
        res.status(404).send({
          success: false,
          message: "Product not found or already deleted.",
        });
      }
    } else {
      res.status(403).send({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
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

      res.status(200).send({
        success: true,
        message: "Dashboard data fetched successfully.",
        totalProducts: allProducts.length,
        totalUsers: allUsers.length,
      });
    } else {
      res.status(403).send({
        success: false,
        message: "Access denied. Only admins can access the dashboard.",
      });
    }
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).send({
      success: false,
      message: "Something went wrong while fetching dashboard data.",
    });
  }
});

app.get("/adminProfile", verifyToken, (req, res) => {
  if (req.user.role === "admin") {
    res.send("You are authorized. Welcome " + req.user.name);
  } else {
    res.status(400).send({ message: "Access denied. Admins only." });
  }
});

// Orders

// cart
app.post("/cart/add", verifyToken, async (req, res) => {
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
      res.status(201).send({
        success: true,
        message: "Product added to cart successfully.",
      });
    } else {
      res.status(403).send({
        success: false,
        message: "Only users can add to cart.",
      });
    }
  } catch (err) {
    console.error("Cart Creation Error:", err);
    res.status(500).send({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
});

app.get("/cart/myCart/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const myCart = await Cart.findOne({ userId: req.params.id });

      if (!myCart || myCart.products.length === 0) {
        return res.status(404).send({
          success: false,
          message: "Your cart is empty.",
        });
      }

      res.status(200).send({
        success: true,
        message: "Cart fetched successfully.",
        cart: myCart,
      });
    } else {
      res.status(403).send({
        success: false,
        message: "Only users can access the cart.",
      });
    }
  } catch (err) {
    console.error("Cart Fetch Error:", err);
    res.status(500).send({
      success: false,
      message: "Something went wrong while fetching your cart.",
    });
  }
});

app.delete("/cart/remove/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const deletedCart = await Cart.findOneAndDelete({
        userId: req.params.id,
      });

      if (!deletedCart) {
        return res.status(404).send({
          success: false,
          message: "No cart found to delete.",
        });
      }

      res.status(200).send({
        success: true,
        message: "Cart deleted successfully.",
        cart: deletedCart,
      });
    } else {
      res.status(403).send({
        success: false,
        message: "Only users can access the cart.",
      });
    }
  } catch (err) {
    console.error("Cart Deletion Error:", err);
    res.status(500).send({
      success: false,
      message: "Something went wrong while deleting the cart.",
    });
  }
});

// Orders place
app.post("/orders/from-cart", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "user") {
      const cart = await Cart.findOne({ userId: req.body.id });

      if (!cart || cart.products.length === 0) {
        return res.status(400).send({ message: "Cart is empty." });
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
      res.status(201).send({
        success: true,
        message: "Order placed successfully.",
      });
    } else {
      res.status(403).send({
        success: false,
        message: "Only users can place orders.",
      });
    }
  } catch (err) {
    console.error("Order Creation Error:", err);
    res.status(500).send({
      success: false,
      message: "Something went wrong while placing the order.",
    });
  }
});

app.listen(4001, () => {
  console.log("Server started...");
});
