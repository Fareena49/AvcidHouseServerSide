let express = require("express"),
  mongoose = require("mongoose"),
  cors = require("cors"),
  bodyParser = require("body-parser"),
  dbConfig = require("./db");

var adminCollection = require("./models/admin.model");
const api = require("./services/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const cp = require("cookie-parser");
const bp = require("body-parser");
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

app.use(passport.initialize());
//initializes the passport configuration.
require("./models/passport-config")(passport);
//imports our configuration file which holds our verification callbacks and things like the secret for signing.
app.use(cp());
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
//custom Middleware for logging the each request going to the API
app.use((req, res, next) => {
  if (req.body) log.info(req.body);
  if (req.params) log.info(req.params);
  if (req.query) log.info(req.query);
  log.info(
    `Received a ${req.method} request from ${req.ip} for                ${req.url}`
  );
  next();
});

app.use("/users", require("./routes/user"));
//registers our authentication routes with Express.

app.use(
  "/path",
  passport.authenticate("jwt", { session: false }),
  require("path/to/route/file")
);

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
