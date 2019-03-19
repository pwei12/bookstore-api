const express = require("express");
const router = express.Router();

const Book = require("../models/book");

// let books = [
//   { id: 1, title: "ABC", price: 9, quantity: 3, author: "Alien" },
//   { id: 2, title: "DEF", price: 28, quantity: 110, author: "John" },
//   { id: 3, title: "GHI", price: 35, quantity: 48, author: "Cecilia" },
//   { id: 4, title: "JKL", price: 99, quantity: 93, author: "John" },
//   { id: 5, title: "MNO", price: 99, quantity: 93, author: "John" }
// ];

const verifyToken = (req, res, next) => {
  const {authorization} = req.headers;
  if(authorization){
   authorization === "Bearer bearer-authorization-token" ? next() : res.status(403);
  } else {
    res.status(403);
  }
}
router
  .route("/")
  .get((req, res) => {
    if (Object.entries(req.query).length>0) {
      const queryEntries = Object.entries(req.query); //creates an array of arrays containing 2 items, 1st item=key, 2nd=value
      const booksToBePopulated = [
        { id: 1, title: "ABC", price: 9, quantity: 3, author: "Alien" },
        { id: 2, title: "DEF", price: 28, quantity: 110, author: "John" }
      ];
      const books = Promise.all(
        booksToBePopulated.map(async book => {
          return await Book.create(book);
        })
      );
      let booksToBeMatched = books;
      let booksFound = [];
      queryEntries.forEach(([key, value]) => {
        booksToBeMatched.map(book => {
          if (book[key].toLowerCase() === value.toLowerCase()) {
            booksFound = booksFound.concat(book);
          }
        });
        booksToBeMatched = booksToBeMatched.filter(
          book => book[key].toLowerCase() !== value.toLowerCase()
        );
      });
      res.json(booksFound);
    } else {
      res.json(books);
    }
  })
  .post(verifyToken, (req, res) => {
    if (
      !req.body.title ||
      !req.body.price ||
      !req.body.quantity ||
      !req.body.author
    ) {
      return res
        .status(400)
        .json({ errMsg: "Please fill in title, price, quantity and author" });
    }

    const newBook = new Book(req.body);
    newBook.save(err => {
      if(err){
        return res.status(500).end();
      }
      return res.status(201).json(newBook);
    });
  });

router
  .route("/:id")
  .get(verifyToken, (req, res) => {
    const found = books.some(book => book.id === parseInt(req.params.id));
    if (found) {
      const bookFound = books.filter(
        book => book.id === parseInt(req.params.id)
      );
      res.json(bookFound[0]);
    } else {
      res
        .status(400)
        .json({ errMsg: `There's no book with id ${req.params.id}.` });
    }
  })
  .put(verifyToken, (req, res) => {
    const found = books.some(book => book.id === parseInt(req.params.id));
    if (found) {
      books.forEach(book => {
        if (book.id === parseInt(req.params.id)) {
          const keys = Object.keys(book);
          keys.forEach(key =>
            key === "id"
              // ? (book[key] = `${book[key]}`)
              ? (book[key])
              : (book[key] = req.body[key]
                  ? req.body[key]
                  : res
                      .status(400)
                      .json({ errMsg: "Please send full entity." }))
          );
          res.status(202).json(book);
        }
      });
    } else {
      res
        .status(400)
        .json({ errMsg: `There's no book with id ${req.params.id}` });
    }
  })
  .patch(verifyToken, (req, res) => {
    const found = books.some(book => book.id === parseInt(req.params.id));
    if (found) {
      books.forEach(book => {
        if (book.id === parseInt(req.params.id)) {
          const keys = Object.keys(book);
          keys.forEach(
            key => (book[key] = req.body[key] ? req.body[key] : book[key])
          );
          res.status(202).json(book);
        }
      });
    } else {
      res
        .status(400)
        .json({ errMsg: `There's no book with id ${req.params.id}` });
    }
  })
  .delete(verifyToken, (req, res) => {
    const found = books.some(book => book.id === parseInt(req.params.id));
    if (found) {
      books = books.filter(book => book.id !== parseInt(req.params.id));
      res.status(202).json(books);
    } else {
      res
        .status(400)
        .json({ errMsg: `There's no book with id ${req.params.id}` });
    }
  });

module.exports = router;
