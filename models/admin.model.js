const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var adminCollection = new Schema({
  name: {
    type: String,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
});

module.exports = mongoose.model("admincollection", adminCollection);
