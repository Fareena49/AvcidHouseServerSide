const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = 4002;
const mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectID;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect("mongodb://127.0.0.1:27017/AcidHouse", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("db connected");
});

app.listen(PORT, () => {
  console.log("Server is running", PORT);
});

app.get("/", (req, res) => {
  res.send("Server check");
});
