// "test" mode
process.env.NODE_ENV = "test";

// npm install supertest
const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testComp;

beforeEach(async function () {
  let result = await db.query(`
      INSERT INTO
        companies (code, name, description) VALUES ('TC', 'TestComp', 'This is a test')
        RETURNING code, name, description`);
  testComp = result.rows[0];
  console.log(testComp);
});

afterEach(async () => {
  await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
  await db.end();
});

describe("GET /companies", function () {
  test("Returns all companies", async () => {
    const response = await request(app).get(`/companies`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ companies: [testComp] });
  });
});

describe("GET /companies/:code", function () {
  test("Returns company with entered code", async () => {
    const response = await request(app).get(`/companies/${testComp.code}`);
    expect(response.body).toEqual({ company: [testComp] });
  });
});

describe("POST /companies", function () {
  test("Create new company", async () => {
    const response = await request(app).post(`/companies`).send({
      code: "google",
      name: "Google",
      description: "Search Engine",
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: {
        code: "google",
        name: "Google",
        description: "Search Engine",
      },
    });
  });
  
  test("Create new company with slugified code", async () => {
    const response = await request(app).post(`/companies`).send({
      code: "Nike Adidas",
      name: "Shoes",
      description: "Shoe Store",
    });
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({
      company: {
        code: "Nike-Adidas",
        name: "Shoes",
        description: "Shoe Store",
      },
    });
  });
});

describe("DELETE /companies/:code", function () {
  test("Deletes company with entered code", async () => {
    const response = await request(app).delete(`/companies/${testComp.code}`);
    expect(response.body).toEqual({ status: "deleted" });
  });
});
