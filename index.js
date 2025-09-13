require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const userRouter = require("./routes/UserRoutes");
const cartRouter = require("./routes/CartRoutes");
const productRouter = require("./routes/ProductRoutes");
const serviceRouter = require("./routes/ServiceRoute");
const ordersRouter = require("./routes/OrderRoutes");
const logger = require("./services/Logger");
let app = express();

app.use(express.json());
app.use(cookieParser());

// setInterval(() => {
//   const mem = process.memoryUsage();
//   console.log({
//     rss: (mem.rss / 1024 / 1024).toFixed(2) + " MB",
//     heapUsed: (mem.heapUsed / 1024 / 1024).toFixed(2) + " MB",
//     external: (mem.external / 1024 / 1024).toFixed(2) + " MB",
//   });
// }, 3000);


// Logger
app.use((req, res, next) => {
  logger(req, res);
  next();
});

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

// All Routes
app.use(userRouter);
app.use(cartRouter);
app.use(productRouter);
app.use(serviceRouter);
app.use(ordersRouter);

app.listen(PORT, () => {
  console.log("Server started...");
});
