"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/UserRoutes");
const cartRouter = require("./routes/CartRoutes");
const productRouter = require("./routes/ProductRoutes");
const serviceRouter = require("./routes/ServiceRoute");
const ordersRouter = require("./routes/OrderRoutes");
const logger = require("./services/Logger");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(cookieParser());
// Logger
app.use((req, res, next) => {
    logger(req, res);
    next();
});
// Routes
app.use(userRouter);
app.use(cartRouter);
app.use(productRouter);
app.use(serviceRouter);
app.use(ordersRouter);
exports.default = app;
