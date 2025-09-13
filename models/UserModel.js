const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  userPhone: String,
  userPassword: String,
  userStatus: String,
  userRole: String,
  createdAt: Date,
  modifiedBy: mongoose.Schema.Types.ObjectId,
  updateAt: Date,
});

const Users = mongoose.model("users", usersSchema);

module.exports = Users;
