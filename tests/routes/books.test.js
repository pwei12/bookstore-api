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
  beforeEach(async () => {
    await Book.insertMany([
      { title: "PUT TEST", price: 9, quantity: 3, author: "haha" },
      { title: "DEF", price: 28, quantity: 110, author: "John" },
      { title: "GHI", price: 35, quantity: 48, author: "Cecilia" },
      { title: "JKL", price: 99, quantity: 93, author: "John" },
      { title: "MNO", price: 99, quantity: 93, author: "John" }
    ]);
  });
  afterEach(async () => {
    await db.dropCollection("books");
  });

  describe("GET", () => {
    test.only("Get details of all books", async () => {
      const expectedBooks = [
        { title: "PUT TEST", price: 9, quantity: 3, author: "haha" },
        { title: "DEF", price: 28, quantity: 110, author: "John" },
        { title: "GHI", price: 35, quantity: 48, author: "Cecilia" },
        { title: "JKL", price: 99, quantity: 93, author: "John" },
        { title: "MNO", price: 99, quantity: 93, author: "John" }
      ];
      const res = await request(app)
        .get(route())
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200);

        const books = res.body;
        expect(books.length).toBe(expectedBooks.length);
        books.forEach((book, index) => {
          expect(book).toEqual(expect.objectContaining(expectedBooks[index]));
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
        .then(res => {
          expect(res.body).toEqual(expect.objectContaining(expectedBooks[0]));
          done();
        });
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
    const expectedBooks = [
      { title: "POST TEST", price: 9, quantity: 3, author: "haha" },
      { title: "DEF", price: 28, quantity: 110, author: "John" },
      { title: "GHI", price: 35, quantity: 48, author: "Cecilia" },
      { title: "JKL", price: 99, quantity: 93, author: "John" },
      { title: "MNO", price: 99, quantity: 93, author: "John" }
    ];
    test("Add a new book with complete details and correct token", async () => {
      const res = await request(app)
        .post(route())
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({ title: "POST TEST", price: 9, quantity: 3, author: "haha" })
        .expect(201);

      // expect(res.body).toEqual(
      //   expect.objectContaining({
      //     title: "POST TEST",
      //     price: 9,
      //     quantity: 3,
      //     author: "haha"
      //   })
      // );

      expect(res.body.title).toBe("POST TEST");

      const book = await Book.findOne({ title: "POST TEST" });
      expect(book.title).toBe("POST TEST");
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
  beforeEach(async () => {
    await Book.insertMany([
      { title: "PUT TEST", price: 9, quantity: 3, author: "haha" },
      { title: "DELETE TEST", price: 28, quantity: 110, author: "John" },
      { title: "GHI", price: 35, quantity: 48, author: "Cecilia" },
      { title: "JKL", price: 99, quantity: 93, author: "John" },
      { title: "MNO", price: 99, quantity: 93, author: "John" }
    ]);
  });
  afterEach(async () => {
    await db.dropCollection("books");
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
    test.only("Update details of a book with valid id", async () => {
      const { _id } = await Book.findOne({ title: "PUT TEST" });
      const res = await request(app)
        .put(route(_id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .send({ title: "PUT TEST", price: 9, quantity: 23, author: "haha" })
        .expect(202);

      expect(res.body).toEqual(
        expect.objectContaining({
          title: "PUT TEST",
          author: "haha"
        })
      );
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

  describe("DELETE", () => {
    test.only("Remove a book with valid id", async () => {
      const { _id } = await Book.findOne({ title: "DELETE TEST" });
      await request(app)
        .delete(route(_id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .expect(202);
      const book = await Book.findById(_id);
      expect(book).toBe(null);
    });
    test("Fail to remove a book with invalid id", async () => {
      const id = "507f191e810c19729de860ea";
      const res = await request(app)
        .delete(route(id))
        .set("Authorization", "Bearer bearer-authorization-token")
        .expect(404);
      console.log(res.body)
    });
  });
});
