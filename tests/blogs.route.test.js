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

describe("blogs", () => {
  let newBlogId;
  test("POST /api/v1/blogs", async () => {
    const newBlog = {
      title: "Test blog title",
      description: "Test blog description",
      body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa recus andae quibus dam voluptate minim eius. At, tempora ratione fuga perferen dis esse,excepturi nesciunt similique voluptatibus pariatur sin temporibus odit fugiat ipsum. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa recus andae quibus dam voluptate minim eius. At, tempora ratione fuga perferen dis esse,excepturi nesciunt similique voluptatibus pariatur sin temporibus odit fugiat ipsum. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa recus andae quibus dam voluptate minim eius. At, tempora ratione fuga perferen dis esse,excepturi nesciunt similique voluptatibus pariatur sin temporibus odit fugiat ipsum. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa recus andae quibus dam voluptate minim eius. At, tempora ratione fuga perferen dis esse,excepturi nesciunt similique voluptatibus pariatur sin temporibus odit fugiat ipsum.",
      tags: ["jest", "test"],
    };
    const response = await supertest(app)
      .post(`/api/v1/blogs`)
      .set("Authorization", `Bearer ${TEST_JWT}`)
      .send(newBlog);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    newBlogId = response.body.data.blog._id;
    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("blog");
    expect(response.body.data.blog).toHaveProperty("createdAt");
    expect(response.body.data.blog.readCount).toBe(0);
    expect(response.body.data.blog.state).toBe("draft");
  });
  test("PATCH /api/v1/blogs/:id", async () => {
    const update = {
      state: "published",
    };
    const response = await supertest(app)
      .patch(`/api/v1/blogs/${newBlogId}`)
      .set("Authorization", `Bearer ${TEST_JWT}`)
      .send(update);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("blog");
    expect(response.body.data.blog._id).toBe(newBlogId);
    expect(response.body.data.blog.state).toBe("published");
  });
  test("GET /api/v1/blogs", async () => {
    const response = await supertest(app).get("/api/v1/blogs");
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.page).toBe(1);
    expect(response.body.results).toBeGreaterThan(0);
    expect(response.body.data).toHaveProperty("blogs");
  });

  test("GET my blogs /api/v1/blogs/my", async () => {
    const response = await supertest(app)
      .get("/api/v1/blogs")
      .set("Authorization", `Bearer ${TEST_JWT}`);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.page).toBe(1);
    expect(response.body.results).toBeGreaterThan(0);
    expect(response.body.data).toHaveProperty("blogs");
    expect(response.body.data.blogs[0].state).toBe("published");
  });

  test("GET /api/v1/blogs/:id", async () => {
    const response = await supertest(app).get(`/api/v1/blogs/${newBlogId}`);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("blog");
    expect(response.body.data.blog._id).toBe(newBlogId);
    expect(response.body.data.blog.state).toBe("published");
  });
  test("DELETE /api/v1/blogs/:id", async () => {
    const response = await supertest(app)
      .delete(`/api/v1/blogs/${newBlogId}`)
      .set("Authorization", `Bearer ${TEST_JWT}`);
    expect(response.statusCode).toBe(204);
    expect(response.body).toEqual({});
  });
});
