const app = require('./app');
const mongoose = require('mongoose');

if(process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const port = process.env.PORT;
const mongodbUri = process.env.MONGODB_URI;

mongoose.connect(mongodbUri);
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