const app = require('./app');
const port = process.env.PORT || 8081;

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/books-db');
const db = mongoose.connection;

db.on('error', err => {
  console.error("Unable to connect to database", err)
});

db.once('open', () => {
  console.log("Successfully connected to the database");
  app.listen(port, () => {
    if(process.env.NODE_ENV === "production") {
      console.log(`Server is running on Heroku with port number ${port}`);    
    } else {
      console.log(`Server is running on http://localhost:${port}`);
    }
  });
});