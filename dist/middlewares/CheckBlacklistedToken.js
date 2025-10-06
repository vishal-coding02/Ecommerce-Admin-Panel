"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Token = require("../models/TokenModel");
const checkBlacklistedToken = async (req, res, next) => {
    try {
        const blacklisted = await Token.findOne({ userToken: req.token });
        if (blacklisted) {
            return res
                .status(401)
                .json({ message: "Token is blacklisted. Please login again." });
        }
        next();
    }
    catch (err) {
        res.status(500).json({ message: "Error checking token blacklist." });
    }
};
module.exports = checkBlacklistedToken;
