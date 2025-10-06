const mongoose = require("mongoose");
import app from "./app"

const PORT = process.env.PORT || 5000;

// DB Connect
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDb connected"))
  .catch(() => console.log("connection error"));

// Server Listen
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}...`);
});
