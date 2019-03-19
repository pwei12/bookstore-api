const mongoose = require("mongoose");
const bookSchema = new mongoose.Schema({
  title: String,
  price: Number,
  quantity: Number,
  author: String
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;