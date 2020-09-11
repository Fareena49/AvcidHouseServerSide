let express = require("express"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  https = require("https"),
  dbConfig = require("./db");
var adminCollection = require("./models/admin.model");
const api = require("./services/user");
const bcrypt = require("bcryptjs");
const fs = require("fs");

// MongoDB Configuration
mongoose.Promise = global.Promise;
mongoose
  .connect(dbConfig.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Database sucessfully connected");
    },
    (error) => {
      console.log("Database could not be connected: " + error);
    }
  );
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};
const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());

app.use("/public", express.static("public"));

app.use("/api", api);

const port = 3001;
const httpsPort = 433;

app.use((req, res, next) => {
  // Error goes via `next()` method
  setImmediate(() => {
    next(new Error("Something went wrong"));
  });
});

app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});

// const server = https.createServer(options, app); Needed to make https.Dont remove it.

app.listen(port, () => {
  adminCollection.countDocuments({}, (err, count) => {
    if (!err && count === 0) {
      var admin = new adminCollection({
        name: "Fawaz",
        password: bcrypt.hashSync("acidHouse", 10),
        email: "faazmanegar456@gmail.com",
      });
      admin.save().then((data) => {
        console.log("saved");
      });
    }
  });
  console.log("App is running on port: " + port);
});
