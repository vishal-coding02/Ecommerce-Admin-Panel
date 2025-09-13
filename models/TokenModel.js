const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
  userToken: String,
});

const Token = mongoose.model("tokenBlacklists", tokenSchema);

module.exports = Token;
