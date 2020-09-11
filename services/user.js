const { v4: uuidv4 } = require("uuid");
let express = require("express"),
  multer = require("multer"),
  mongoose = require("mongoose"),
  router = express.Router();
const fs = require("fs");

require("dotenv").config();
const secret = process.env.SECRET || "the default secret";
//gives us access to our environment variables
//and sets the secret object.
const passport = require("passport");
const jwt = require("jsonwebtoken");

// User model
let User = require("../models/User");
let Category = require("../models/categories.model");
let Item = require("../models/items.model");

const DIR = "./public/";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await cb(null, DIR);
  },
  filename: async (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    // console.log(fileName);
    await cb(null, uuidv4() + "-" + fileName);
  },
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

router.post("/user-profile", upload.single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  console.log(url);
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    image: url + "/public/" + req.file.filename,
  });
  user
    .save()
    .then((result) => {
      res.status(201).json({
        message: "User registered successfully!",
        userCreated: {
          _id: result._id,
          image: result.image,
        },
      });
    })
    .catch((err) => {
      console.log(err),
        res.status(500).json({
          error: err,
        });
    });
});
router.post("/addCategory", upload.single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const category = new Category({
    id: uuidv4(),
    categoryName: req.body.name,
    sideIcon: req.body.iconName,
    displayImg: url + "/public/" + req.file.filename,
    subCategories: [],
  });
  category
    .save()
    .then((result) => {
      res.status(200).json({
        status: true,
        message: "Category added successfully!",
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        error: err,
      });
    });
});
router.post("/editCategory", upload.single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  console.log(req.body);
  Category.findOne({ id: req.body.id }).then((data) => {
    data.categoryName = req.body.name;
    data.sideIcon = req.body.iconName;
    if (req.body.imageEdited === "true") {
      fs.unlink(DIR + data.displayImg.split("/").pop(), (err) => {
        if (err) {
          res.status(500).json({
            status: false,
            error: err,
          });
        } else {
          if (req.file) {
            data.displayImg = url + "/public/" + req.file.filename;
          }
          data
            .save()
            .then((data) => {
              res.status(200).json({
                status: true,
                message: "Category added successfully!",
              });
            })

            .catch((err) => {
              res.status(500).json({
                status: false,
                error: "No",
              });
            });
        }
      });
    } else {
      data
        .save()
        .then((data) => {
          res.status(200).json({
            status: true,
            message: "Category added successfully!",
          });
        })

        .catch((err) => {
          res.status(500).json({
            status: false,
            error: "No",
          });
        });
    }
  });
});
router.post("/editSubCategory", upload.single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  console.log(req.body);
  Category.findOne({ id: req.body.catId }).then((data) => {
    const index = data.subCategories.findIndex((subcat) => {
      return subcat.id === req.body.subCatId;
    });
    data.subCategories[index].name = req.body.name;
    if (req.body.imageEdited === "true") {
      fs.unlink(
        DIR + data.subCategories[index].displayImg.split("/").pop(),
        (err) => {
          if (err) {
            res.status(500).json({
              status: false,
              error: err,
            });
          } else {
            if (req.file) {
              data.subCategories[index].displayImg =
                url + "/public/" + req.file.filename;
            }
            data
              .save()
              .then((data) => {
                res.status(200).json({
                  status: true,
                  message: "SubCategory edited successfully!",
                });
              })

              .catch((err) => {
                res.status(500).json({
                  status: false,
                  error: "No",
                });
              });
          }
        }
      );
    } else {
      data
        .save()
        .then((data) => {
          res.status(200).json({
            status: true,
            message: "SubCategory edited successfully!",
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: false,
            error: "No",
          });
        });
    }
  });
});

router.put("/addSubCategory", upload.single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  Category.findOne({ id: req.body.id }).then((data) => {
    data.subCategories.push({
      id: uuidv4(),
      name: req.body.name,
      displayImg: url + "/public/" + req.file.filename,
    });
    data
      .save()
      .then((result) => {
        res.status(200).json({
          status: true,
          message: "Category added successfully!",
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          error: err,
        });
      });
  });
});
router.get("/getCategories", (req, res, next) => {
  Category.find({})
    .then((data) => {
      res.status(200).json({
        status: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        data: err,
      });
    });
});
router.get("/getItems", (req, res, next) => {
  Item.find({})
    .then((data) => {
      res.status(200).json({
        status: true,
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        data: err,
      });
    });
});
router.put("/delSubCategory", (req, res, next) => {
  Category.findOne({ id: req.body.catId })
    .then((data) => {
      const index = data.subCategories.findIndex((subcat) => {
        return subcat.id === req.body.subId;
      });
      data.subCategories.splice(index, 1);
      data
        .save()
        .then((savedData) => {
          fs.unlink(DIR + req.body.imgPath.split("/").pop(), (err) => {
            if (err) {
              res.status(500).json({
                status: false,
                data: err,
              });
            } else {
              res.status(200).json({
                status: true,
                data: data,
              });
            }
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: false,
            data: err,
          });
        });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        data: err,
      });
    });
});
router.put("/delCategory", (req, res, next) => {
  Category.deleteOne({ id: req.body.catId })
    .then((data) => {
      fs.unlink(DIR + req.body.imgPath.split("/").pop(), (err) => {
        if (err) {
          res.status(500).json({
            status: false,
            data: err,
          });
        } else {
          res.status(200).json({
            status: true,
            data: data,
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        data: err,
      });
    });
});
router.post(
  "/addItem",
  upload.fields([{ name: "mainImage" }, { name: "subImages" }]),
  function (req, res, next) {
    // console.log(req.files);
    const url = req.protocol + "://" + req.get("host");
    let array = [];
    console.log(JSON.parse(req.body.sizeQtyArray));
    req.files.subImages.forEach((subImg) => {
      array.push(url + "/public/" + subImg.filename);
    });
    // req.body.sizeQtyArray.forEach((item) => {
    //   console.log(item);
    // });

    const item = new Item({
      id: uuidv4(),
      itemId: req.body.itemId,
      name: req.body.name,
      sex: req.body.sex,
      price: req.body.price,
      sizes: JSON.parse(req.body.sizeQtyArray),
      mainCategory: req.body.selectedCategory,
      category: req.body.selectedSubCategory,
      displayImg: url + "/public/" + req.files.mainImage[0].filename,
      best: req.body.best,
      totalQty: req.body.totalQty,
      subImages: array,
    });
    item
      .save()
      .then((data) => {
        res.status(200).json({
          status: true,
          data: data,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: false,
          data: err,
        });
      });
    // console.log(req.files.mainImage);
    // console.log(req.files.subImages);
    // req.files.forEach((file)=>{
    //   console.log(file);
    // })
  }
);
router.put("/delItem", (req, res, next) => {
  console.log(req.body.obj);
  Item.deleteOne({ id: req.body.obj.id })
    .then((data) => {
      fs.unlink(DIR + req.body.obj.displayImg.split("/").pop(), (err) => {
        if (err) {
          res.status(500).json({
            status: false,
            data: err,
          });
        } else {
          req.body.obj.subImages.forEach((item, index) => {
            fs.unlink(DIR + item.split("/").pop(), (err) => {
              if (err) {
                res.status(500).json({
                  status: false,
                  data: err,
                });
              }
              if (index === req.body.obj.subImages.length - 1) {
                res.status(200).json({
                  status: true,
                  data: data,
                });
              }
            });
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        data: err,
      });
    });
});

//imports Passport and the JsonWebToken library for some utilities
router.post("/register", (req, res) => {
  User.findOne({ emailAddress: req.body.emailAddress }).then((user) => {
    if (user) {
      let error = "Email Address Exists in Database.";
      return res.status(400).json(error);
    } else {
      const newUser = new User({
        name: req.body.name,
        emailAddress: req.body.emailAddress,
        password: req.body.password,
      });
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => res.status(400).json(err));
        });
      });
    }
  });
});
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then((user) => {
    if (!user) {
      errors.email = "No Account Found";
      return res.status(404).json(errors);
    }
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        const payload = {
          id: user._id,
          name: user.userName,
        };
        jwt.sign(payload, secret, { expiresIn: 36000 }, (err, token) => {
          if (err)
            res.status(500).json({ error: "Error signing token", raw: err });
          res.json({
            success: true,
            token: `Bearer ${token}`,
          });
        });
      } else {
        errors.password = "Password is incorrect";
        res.status(400).json(errors);
      }
    });
  });
});

module.exports = router;
