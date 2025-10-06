const Token = require("../models/TokenModel");
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../interfaces/Users";

const checkBlacklistedToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const blacklisted = await Token.findOne({ userToken: req.token });

    if (blacklisted) {
      return res
        .status(401)
        .json({ message: "Token is blacklisted. Please login again." });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Error checking token blacklist." });
  }
};

module.exports = checkBlacklistedToken;
