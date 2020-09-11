const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var categoriesCollection = new Schema({
  id: {
    type: String,
  },
  categoryName: { type: String },
  sideIcon: { type: String },
  displayImg: { type: String },
  subCategories: [
    {
      id: { type: String },
      name: { type: String },
      displayImg: { type: String },
    },
  ],
});

module.exports = mongoose.model("categoriescollection", categoriesCollection);

// {
//     "_id": "C1",from mongodb
//     "categoryName": "Men",
//     "sideIcon": "man",
//     "displayImg": "../assets/imgs/menDisplay.jpg"pathtoimg,
//     "subCategories": [
//         {
//             "name": "Jeans",
//             "displayImg": "../assets/imgs/jeansDisplay.jpg"pathtoimg
//         },
//         {
//             "name": "Shirts",
//             "displayImg": "../assets/imgs/shirtDisplay.jpg"pathtoimg
//         },
//         {
//             "name": "Shoes",
//             "displayImg": "../assets/imgs/shoeDisplay.jpg"pathtoimg
//         }
//     ]
// },
