require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/UserRoutes");
const cartRouter = require("./routes/CartRoutes");
const productRouter = require("./routes/ProductRoutes");
const serviceRouter = require("./routes/ServiceRoute");
const ordersRouter = require("./routes/OrderRoutes");
const logger = require("./services/Logger");

const app = express();
app.use(express.json());
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

module.exports = app;  
