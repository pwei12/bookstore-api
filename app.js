const express = require("express");
const app = express();

const books = require("./routes/books");

app.use(express.static('public'));
app.use(express.json());
app.use("/books", books);

module.exports = app;