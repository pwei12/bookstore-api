const request = require("supertest");
const app = require("../../app");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const Book = require("../../models/book");

const route = (params = "") => {
  const path = "/books";
  return `${path}/${params}`;
};

let mongoServer; 
let db;
describe("On route /books", () => {
  beforeAll(async () => {
    mongoServer = new MongoMemoryServer(); //create new db, same as doing mongod in terminal/shell
    const mongoUri = await mongoServer.getConnectionString();
    await mongoose.connect(mongoUri);
    db = mongoose.connection;
  });

  afterAll(async () => {
    mongoose.disconnect();
    await mongoServer.stop();
  });

  describe("GET", () => {
    beforeEach(async () => {
        await Book.insertMany([
          { id: 1, title: "ABC", price: 9, quantity: 3, author: "Alien" },
          { id: 2, title: "DEF", price: 28, quantity: 110, author: "John" },
          { id: 3, title: "GHI", price: 35, quantity: 48, author: "Cecilia" },
          { id: 4, title: "JKL", price: 99, quantity: 93, author: "John" },
          { id: 5, title: "MNO", price: 99, quantity: 93, author: "John" }
        ]);      
    });
    afterEach(async() => {
      await db.dropCollection("books");
    });
    
    test.only("Get details of all books", (done) => {
      const expectedBooks = [
        { id: 1, title: "ABC", price: 9, quantity: 3, author: "Alien" },
        { id: 2, title: "DEF", price: 28, quantity: 110, author: "John" },
        { id: 3, title: "GHI", price: 35, quantity: 48, author: "Cecilia" },
        { id: 4, title: "JKL", price: 99, quantity: 93, author: "John" },
        { id: 5, title: "MNO", price: 99, quantity: 93, author: "John" }
      ];
      request(app)
        .get(route())
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .then(res => {
          const books = res.body;
          books.forEach((book, index) => {
            expect(book).toEqual(
              expect.objectContaining(expectedBooks[index]
            ));
            //or
            // expect(book.title).toBe(expectedBooks[index].title);
            // expect(book.author).toBe(expectedBooks[index].autor);
          });
          // expect(books[0].toEqual(
          //   expect.objectContaining({
          //     title: "ABC",
          //     price: 9,
          //     quantity: 3,
          //     author: "Alien"
          //   })
          // ))
          // done();
        }, done)
        .catch(err => {
         // res.send(err);
        });
    });
    test("Get a book's details by title using query", done => {
      const expectedBooks = [
        { id: 3, title: "GHI", price: 35, quantity: 48, author: "Cecilia" }
      ];
      request(app)
        .get(route())
        .query({ title: "GHI" })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        // .then(res => {
        //   const book = res.body[0];
        //   expect(book.title).toEqual("Alien");
        // });
        .then(res => {
            expect(res.body).toEqual(
              expect.objectContaining(expectedBooks[0]
            ));
          done();
        })
    });
    test("Get books' details by author and title using query", done => {
      request(app)
        .get(route())
        .query({ author: "John", title: "JKL" })
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect([
          { id: 2, title: "DEF", price: 28, quantity: 110, author: "John" },
          { id: 4, title: "JKL", price: 99, quantity: 93, author: "John" },
          { id: 5, title: "MNO", price: 99, quantity: 93, author: "John" }
        ])
        .expect(200, done);
    });
  });

  describe("POST", () => {
    test("Add a new book with complete details and correct token", done => {
      request(app)
        .post(route())
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({
          id: 235,
          title: "XYZ",
          price: 18.9,
          quantity: 11,
          author: "Lilian"
        })
        .expect("Content-Type", /json/)
        .expect(201)
        .then(res => {
          expect(res.body).toEqual(
            expect.objectContaining({
              title: "XYZ",
              price: 18.9,
              quantity: 11,
              author: "Lilian"
            })
          );
          done();
        });
    });
    xtest("Fail to add a new book with incorrect token", async () => {
      await request(app)
        .post(route())
        .set("Authorization", "Bearer invalid-authorization-token")
        .send({
          id: 235,
          title: "XYZ",
          price: 18.9,
          quantity: 11,
          author: "Lilian"
        })
        .catch(res => {
          expect(res.status).toBe(403);
        });
    });
    xtest("Fail to add a new book without any token", done => {
      request(app)
        .post(route())
        .send({
          id: 235,
          title: "XYZ",
          price: 18.9,
          quantity: 11,
          author: "Lilian"
        })
        .expect(403, done);
    });
    test("Fail to add new book without full details", done => {
      request(app)
        .post(route())
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({ title: "XYZ" })
        .expect({ errMsg: "Please fill in title, price, quantity and author" })
        .expect(400, done);
    });
  });
});

describe("On route /books/:id", () => {
  describe("DELETE", () => {
    test("Remove a book with valid id", done => {
      const id = 2;
      request(app)
        .delete(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .expect(202, done);
    });
    test("Fail to remove a book with invalid id", done => {
      const id = 12;
      request(app)
        .delete(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .expect({ errMsg: `There's no book with id ${id}` })
        .expect(400, done);
    });
  });

  describe("GET", () => {
    test("Return details of book with valid id", done => {
      const id = 1;
      request(app)
        .get(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .expect({ id: 1, title: "ABC", price: 9, quantity: 3, author: "Alien" })
        .expect(200, done);
    });
    test("Failt to get details of book invalid id", done => {
      const id = 2;
      request(app)
        .get(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .expect({ errMsg: `There's no book with id ${id}.` })
        .expect(400, done);
    });
  });

  describe("PUT", () => {
    test("Update details of a book with valid id", done => {
      const id = 1;
      request(app)
        .put(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({ title: "ABC", price: 9, quantity: 23, author: "Alien" })
        .expect({
          id: id,
          title: "ABC",
          price: 9,
          quantity: 23,
          author: "Alien"
        })
        .expect(202, done);
    });
    test("Fail to update details of a book with invalid id", done => {
      const id = 2;
      request(app)
        .put(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({ title: "DEF", price: 28, quantity: 10, author: "John" })
        .expect({ errMsg: `There's no book with id ${id}` })
        .expect(400, done);
    });
    test("Fail to update details of a book without complete details", done => {
      const id = 1;
      request(app)
        .put(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({ quantity: 23 })
        .expect({ errMsg: "Please send full entity." })
        .expect(400, done);
    });
  });

  describe("PATCH", () => {
    test("Update details of a book with valid id", done => {
      const id = 1;
      request(app)
        .patch(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({ title: "ABC2" })
        .expect({
          id: id,
          title: "ABC2",
          price: 9,
          quantity: 23,
          author: "Alien"
        })
        .expect(202, done);
    });
    test("Fail to update details of a book with invalid id", done => {
      const id = 2;
      request(app)
        .patch(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({ title: "DEF2" })
        .expect({ errMsg: `There's no book with id ${id}` })
        .expect(400, done);
    });
  });
});
