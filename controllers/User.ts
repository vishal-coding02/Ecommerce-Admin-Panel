const { bcryptjs, generateToken } = require("../services/Auth");
import Users from "../models/UserModel";
const Token = require("../models/TokenModel");
const Product = require("../models/ProductModel");
const Orders = require("../models/OrderModel");
import { Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/Users";
import { LoginBody } from "../interfaces/Users";

async function signUpForm(req: Request, res: Response) {
  const hashPassword = await bcryptjs.hash(req.body.password, 10);
  console.log(hashPassword);
  const newUser = {
    userName: req.body.name,
    userEmail: req.body.email,
    userPhone: req.body.phone,
    userPassword: hashPassword,
    userStatus: "active",
    userRole: req.body.role,
    createdAt: new Date(),
  };
  await Users.create(newUser);
  res.status(201).json({ message: "User created...!" });
}

async function loginForm(req: Request<{}, {}, LoginBody>, res: Response) {
  const user = await Users.findOne({ userEmail: req.body.email });
  if (!user) {
    console.log("User not found");
    return res.status(404).json({ message: "User not found" });
  }

  console.log(user);

  const isMatch = await bcryptjs.compare(req.body.password, user.userPassword);
  if (!isMatch) {
    console.log("Invalid credentials");
    return res.status(400).json({ message: "Invalid credentials" });
  }

  console.log(user.userPassword);
  const { accessToken, refreshToken } = generateToken(user);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/refreshToken",
  });
  res.json({ token: accessToken });
}

async function userProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }

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
}

async function updateStatus(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }

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
}

async function deleteUser(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }
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
}

async function logout(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }
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
}

async function dashboard(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }
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
}

async function adminProfile(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. No user found." });
  }
  if (req.user.role === "admin") {
    res
      .status(200)
      .json({ message: `You are authorized. Welcome : ${req.user.name}` });
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
}

module.exports = {
  signUpForm,
  loginForm,
  userProfile,
  updateStatus,
  deleteUser,
  logout,
  dashboard,
  adminProfile,
};
