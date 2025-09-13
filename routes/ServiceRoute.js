const express = require("express");
const serviceRouter = express.Router();
const { refreshToken } = require("../services/Auth");

serviceRouter.post("/refreshToken", refreshToken);

module.exports = serviceRouter;
