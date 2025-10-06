"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
// DB Connect
mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDb connected"))
    .catch(() => console.log("connection error"));
// Server Listen
app_1.default.listen(PORT, () => {
    console.log(`Server started on port ${PORT}...`);
});
