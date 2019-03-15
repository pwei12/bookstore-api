const app = require('./app');
const port = process.env.PORT || 8081;

app.listen(port, () => {
  if(process.env.NODE_ENV === "prod") {
    console.log(`Server is running on Heroku with port number ${port}`);    
  }
    console.log(`Server is running on http://localhost:${port}`);
  });