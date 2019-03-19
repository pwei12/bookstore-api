const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 1
  },
  quantity: 
  {
    type: Number,
    required: true,
    min: 0
  },
  author: {
    type: String,
    required: true,
    trim: true
  }
},
{ timestamps: true }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;