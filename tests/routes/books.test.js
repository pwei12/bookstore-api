const request = require("supertest");
const app = require("../../app");

const booksInventory = [
  { title: "ABC", price: 9, quantity: 3, author: "Alien" },
  { title: "DEF", price: 28, quantity: 110, author: "John" },
  { title: "GHI", price: 35, quantity: 48, author: "Cecilia" },
  { title: "JKL", price: 99, quantity: 93, author: "John" },
  { title: "MNO", price: 99, quantity: 93, author: "John" }
];

describe("Books", () => {
  describe("GET /books SUCCESSFULLY", () => {
    const route = "/books";
    test("Gets data of all the books", () => {
      return request(app)
        .get(route)
        .set("Accept", "application/json")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect(booksInventory);
    });

    test("Get a book's data by title using query", () => {
      return request(app)
        .get(route)
        .query({ title: "GHI" })
        .set("Accept", "application/json")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect([{ title: "GHI", price: 35, quantity: 48, author: "Cecilia" }]);
    });

    test("Get a book's data by author using query", () => {
      return request(app)
        .get(route)
        .query({ author: "John" })
        .set("Accept", "application/json")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect([
          { title: "DEF", price: 28, quantity: 110, author: "John" },
          { title: "JKL", price: 99, quantity: 93, author: "John" },
          { title: "MNO", price: 99, quantity: 93, author: "John" }]
        );
    });

    test("Get a book's data by title and author using query", () => {
      return request(app)
        .get(route)
        .query({ title: "JKL" })
        .query({ author: "John"})
        .set("Accept", "application/json")
        .expect(200)
        .expect("Content-Type", /json/)
        .expect([{ title: "JKL", price: 99, quantity: 93, author: "John" }]);
    });
  });

  // describe("POST /books", () => {
  //   test("Add a new book", () => {
  //     return request(app)
  //       .post(route)
  //       .send({ title: "XYZ" })
  //       .expect(201)
  //       .expect("Content-Type", /json/) //by default it's json though set content-type is not done
  //       .then(res => {
  //         expect(res.body).toEqual(expect.any(Object));
  //         expect(res.body).toEqual({
  //           id: expect.any(String),
  //           title: "new title"
  //         });
  //       });
  //   });
  // });

  // describe("On route /books/123", () => {
  //   const route = "/books/123";
  //   test("Changes quantity of a book", () => {
  //     return request(app)
  //       .put(route)
  //       .send({ title: "EFG", price: 28, quantity: 100, author: "Boby" })
  //       .expect(202)
  //       .expect({ title: "EFG", price: 28, quantity: 100, author: "Boby" });
  //   });

  //   test("Changes price of a book", () => {
  //     return request(app)
  //       .patch(route)
  //       .send({ price: 10 })
  //       .expect(202)
  //       .expect({ price: 10 });
  //   });

  //   test("Remove a book", () => {
  //     return request(app)
  //       .delete(route)
  //       .expect(202);
  //   });
  // });
});
