const express = require("express");
const userRouter = express.Router();
const checkBlacklistedToken = require("../middlewares/CheckBlacklistedToken.js");
const {
  signUpForm,
  loginForm,
  dashboard,
  userProfile,
  updateStatus,
  deleteUser,
  logout,
  adminProfile,
} = require("../controllers/User.js");
const { verifyToken } = require("../services/Auth.js");

userRouter.post("/signUp", signUpForm);
userRouter.post("/login", loginForm);
userRouter.get(
  "/users/profile",
  verifyToken,
  checkBlacklistedToken,
  userProfile
);
userRouter.patch(
  "/users/status",
  verifyToken,
  checkBlacklistedToken,
  updateStatus
);
userRouter.delete("/users", verifyToken, checkBlacklistedToken, deleteUser);
userRouter.post("/logout", verifyToken, checkBlacklistedToken, logout);
userRouter.get("/dashboard", verifyToken, checkBlacklistedToken, dashboard);
userRouter.get(
  "/admin/profile",
  verifyToken,
  checkBlacklistedToken,
  adminProfile
);

module.exports = userRouter;
