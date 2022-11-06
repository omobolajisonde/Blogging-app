const mongoose = require("mongoose");
const supertest = require("supertest");
const dotenv = require("dotenv");

dotenv.config(); // loads enviroment variables into process.env

const app = require("../app");
// for testing purposes, we use the test DB (stub)
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
// A JWT which encodes the one user details which was created before in our database to authenticate protected routes during testing.
const TEST_JWT = process.env.TEST_JWT;

//  Runs before all the tests
beforeAll((done) => {
  mongoose.connect(TEST_DATABASE_URL);
  mongoose.connection.on("connected", async () => {
    console.log("Connected to MongoDB Successfully");
    done();
  });
  mongoose.connection.on("error", (err) => {
    console.log(err, "An error occurred while connecting to MongoDB");
    done();
  });
});

//  Runs after all the tests
afterAll((done) => {
  mongoose.connection.close(done);
});

describe("users", () => {
  let aUserId;
  test("PATCH /api/v1/users/updateMe", async () => {
    const update = {
      firstName: "Bolaji",
    };
    const response = await supertest(app)
      .patch(`/api/v1/users/updateMe`)
      .set("Authorization", `Bearer ${TEST_JWT}`)
      .send(update);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.user.firstName).toBe("Bolaji");
  });
  test("GET /api/v1/users", async () => {
    const response = await supertest(app).get("/api/v1/users");
    aUserId = response.body.data.users[0]._id;
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.page).toBe(1);
    expect(response.body.results).toBeGreaterThanOrEqual(1);
    expect(response.body.data).toHaveProperty("users");
  });

  test("GET /api/v1/users/:id", async () => {
    const response = await supertest(app).get(`/api/v1/users/${aUserId}`);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("user");
    expect(response.body.data.user._id).toBe(aUserId);
  });
  // test("DELETE /api/v1/users/deleteMe", async () => {
  //   const response = await supertest(app)
  //     .delete(`/api/v1/users/deleteMe`)
  //     .set("Authorization", `Bearer ${TEST_JWT}`);
  //   expect(response.statusCode).toBe(204);
  //   expect(response.body).toEqual({});
  // });
});
