const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var itemsCollection = new Schema({
  id: { type: String },
  itemId: {
    type: String,
  },
  name: {
    type: String,
  },
  sex: {
    type: String,
  },
  price: {
    type: Number,
  },
  sizes: [
    {
      id: { type: Number },
      name: { type: String },
      qty: { type: Number },
    },
  ],
  mainCategory: {
    type: String,
  },
  category: {
    type: String,
  },
  displayImg: {
    type: String,
  },
  best: {
    type: Boolean,
  },
  totalQty: {
    type: Number,
  },
  subImages: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("itemsCollection", itemsCollection);

// {"_id": "1M",from mongodb
//             "itemId": "11",
//             "name": "Denim Jeans",
//             "sex": "male",
//             "price": 1000,
//             "sizes": [
//                 {
//                     "name": "XS",
//                     "qty": 3
//                 },
//                 {
//                     "name": "S",
//                     "qty": 4
//                 },
//                 {
//                     "name": "M",
//                     "qty": 2
//                 },
//                 {
//                     "name": "L",
//                     "qty": 1
//                 },
//                 {
//                     "name": "XL",
//                     "qty": 0
//                 }
//             ],
//             "mainCategory": "Men",
//             "category": "Jeans",
//             "displayImg": "../assets/imgs/denimJeans.jpg",
//             "subImages": [
//                 "../assets/imgs/1.jpg",
//                 "../assets/imgs/2.jpg",
//                 "../assets/imgs/3.jpg",
//                 "../assets/imgs/4.jpg",
//                 "../assets/imgs/5.jpg"
//             ]
//         }
