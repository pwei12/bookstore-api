const express = require("express");
const router = express.Router();

const books = [
    {title: "ABC", price: 9, quantity: 3, author: "Alien"},
    {title: "DEF", price: 28, quantity: 110, author: "John"},
    {title: "GHI", price: 35, quantity: 48, author: "Cecilia"},
    {title: "JKL", price: 99, quantity: 93, author: "John"},
    {title: "MNO", price: 99, quantity: 93, author: "John"}
];

router
    .route('/')
    .get((req,res) => {
        if(Object.entries(req.query.length>0)){
            const queryEntries = Object.entries(req.query); //creates an array of arrays containing 2 items, 1st item=key, 2nd=value
            let filteredBooks = books;
            const keysArray = Object.keys(req.query);
            const valuesArray = Object.values(req.query);
            for (const [key, value] of queryEntries)  {
                if(!keysArray.includes(key) ){
                    res.send("Invalid query key");
                }else if(!valuesArray.includes(value)){
                    res.send("Invalid query value");
                }else {
                    filteredBooks = filteredBooks.filter(book => book[key].toLowerCase() === value.toLowerCase());
                }
            }
            res.json(filteredBooks);
        }
        res.json(books)
    })
    .post((req,res) => {
        const book = req.body;
        book.id = "123"; 
        book.title = "new title";
        res.status(201).json(book)
    });

    router
    .route("/:id")
    .put((req, res) => {
        res.status(202).json(req.body)
    })
    .patch((req,res) => {
        res.status(202).json(req.body)
    })
    .delete((req, res) => {
        res.status(202).end(); 
    });

module.exports = router;