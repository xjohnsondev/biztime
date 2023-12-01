// "test" mode
process.env.NODE_ENV = "test";

// npm install supertest
const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testInv;

beforeEach(async function () {
  let insert = await db.query(`INSERT INTO
                companies (code, name, description) VALUES 
                ('apple', 'Apple Computer', 'Maker of OSX.'),
                ('ibm', 'IBM', 'Big blue.')
                RETURNING code, name, description`);
  let result = await db.query(`
        INSERT INTO
          invoices (comp_code, amt, paid, paid_date) VALUES 
          ('apple', 100, false, null),
          ('apple', 200, false, null),
          ('apple', 300, true, '2018-01-01'),
          ('ibm', 400, false, null)
          RETURNING comp_code, amt, paid, paid_date`);
  testInv = result.rows;
  console.log(testInv);
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /invoices", function () {
  test("Returns all invoices", async () => {
    const response = await request(app).get(`/invoices`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ invoices: testInv });
  });
});

describe("POST /invoices", function () {
    test("Create an invoice", async () => {
      const response = await request(app).post(`/invoices`).send({
        "comp_code" : "apple",
        "amt" : 111
      });
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({ invoices: testInv[0] });
    });
  });
