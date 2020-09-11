const { v4: uuidv4 } = require("uuid");
let express = require("express"),
  multer = require("multer"),
  router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const twiToken = require("./twilio");
let Category = require("../models/categories.model");
let Item = require("../models/items.model");
let adminCollection = require("../models/admin.model");
const DIR = "./public/";
const client = require("twilio")(twiToken.accountSID, twiToken.authToken);
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await cb(null, DIR);
  },
  filename: async (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
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
const verifyToken = (req, res, next) => {
  const bearerHeader = req.get("authorization");
  // console.log(bearerHeader);
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    jwt.verify(req.token, "secretKey", (err, authData) => {
      if (err) {
        res.status(403).json({ status: false, msg: "Error verifying token" });
      } else {
        console.log("token verified");
        next();
      }
    });
  } else {
    res.status(401).json({ status: false, msg: "No Token" });
  }
};

router.put("/adminLogin", (req, res, next) => {
  adminCollection
    .findOne({ email: req.body.email })
    .then((docs) => {
      var bool = bcrypt.compareSync(req.body.password, docs.password);
      if (bool) {
        jwt.sign(
          { id: docs._id },
          "secretKey",
          { expiresIn: 240 },
          (err, token) => {
            if (err) {
              res
                .status(500)
                .json({ status: false, msg: "Could not generate token" });
            }
            res.status(200).json({ status: true, token: token });
          }
        );
      } else {
        res.status(500).json({ status: false, msg: "User Does Not Exist" });
      }
    })
    .catch((err) => {
      res.status(500).json({ status: false, msg: "User Does Not Exist" });
    });
});

router.post("/addCategory", upload.single("image"), (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const category = new Category({
    id: uuidv4(),
    categoryName: req.body.name.toLowerCase(),
    sideIcon: req.body.iconName.toLowerCase(),
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

  Category.findOne({ id: req.body.id }).then((data) => {
    data.categoryName = req.body.name.toLowerCase();
    data.sideIcon = req.body.iconName.toLowerCase();
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

  Category.findOne({ id: req.body.catId }).then((data) => {
    const index = data.subCategories.findIndex((subcat) => {
      return subcat.id === req.body.subCatId;
    });
    data.subCategories[index].name = req.body.name.toLowerCase();
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
      name: req.body.name.toLowerCase(),
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
router.get("/getCategories", verifyToken, (req, res, next) => {
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
  // }
  // });
});
router.get("/getItems", verifyToken, (req, res, next) => {
  // jwt.verify(req.token, "secretKey", (err, authData) => {
  //   if (err) {
  //     res.status(403).json({ status: false, msg: "Error verifying token" });
  //   } else {
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
  //   }
  // });
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
  verifyToken,
  upload.fields([{ name: "mainImage" }, { name: "subImages" }]),
  function (req, res, next) {
    const url = req.protocol + "://" + req.get("host");
    let array = [];

    req.files.subImages.forEach((subImg) => {
      array.push(url + "/public/" + subImg.filename);
    });

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
  }
);
router.put("/delItem", (req, res, next) => {
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

router.get("/user/getCategory", (req, res, next) => {
  Category.find({}, "-subCategories")
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

router.get("/user/getSubCategory/:id", (req, res, next) => {
  Category.findOne({ categoryName: req.params.id })
    .then((data) => {
      res.status(200).json({
        status: true,
        data: data.subCategories,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: false,
        data: err,
      });
    });
});
router.get("/user/getItems/:id1/:id2", (req, res, next) => {
  Item.find({ mainCategory: req.params.id1, category: req.params.id2 })
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

router.get("/user/getItem/:id", (req, res, next) => {
  Item.findOne({ id: req.params.id })
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

router.get("/user/getOtp/:number", (req, res, next) => {
  // console.log("send otp", req.params.number);
  client.verify
    .services(twiToken.serviceID)
    .verifications.create({
      to: "+917829869921",
      channel: "sms",
    })
    .then((data) => {
      res.status(200).send({
        message: "Verification is sent!!",
        // phonenumber: req.params.number,
        data: data,
      });
    })
    .catch((err) => {
      res.status(400).send({
        message: "Wrong phone number :(",
        // phonenumber: req.params.phonenumber,
        err: err,
      });
    });
});

module.exports = router;
