const mongoose = require("mongoose");
const supertest = require("supertest");
const dotenv = require("dotenv");

dotenv.config(); // loads enviroment variables into process.env

const app = require("../app");
const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const TEST_JWT = process.env.TEST_JWT;

//  Runs before all the tests
beforeAll((done) => {
  // for testing purposes, we use the test DB (stub)
  const TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    "mongodb://localhost:27017/test-blogging-app";
  mongoose.connect(TEST_DATABASE_URL);
  mongoose.connection.on("connected", async () => {
    console.log("Connected to MongoDB Successfully");
    const defaultUser = {
      firstName: process.env.DEFAULT_FIRSTNAME || "Bolaji",
      lastName: process.env.DEFAULT_LASTNAME || "Sonde",
      password: process.env.DEFAULT_PASSWORD || "qwerty",
      confirmPassword: process.env.DEFAULT_PASSWORD || "qwerty",
    };
    await User.create(defaultUser);
    done();
  });
  mongoose.connection.on("error", (err) => {
    console.log("An error occurred while connecting to MongoDB");
    console.log(err);
    done();
  });
});

//  Runs after all the tests
afterAll((done) => {
  mongoose.connection.close(done);
});

describe("blogs", () => {
  const newBlog = {
    title: "Test blog title",
    description: "Test blog description",
    body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa recus andae quibus dam voluptate minim eius. At, tempora ratione fuga perferen dis esse,excepturi nesciunt similique voluptatibus pariatur sin temporibus odit fugiat ipsum. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa recus andae quibus dam voluptate minim eius. At, tempora ratione fuga perferen dis esse,excepturi nesciunt similique voluptatibus pariatur sin temporibus odit fugiat ipsum. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa recus andae quibus dam voluptate minim eius. At, tempora ratione fuga perferen dis esse,excepturi nesciunt similique voluptatibus pariatur sin temporibus odit fugiat ipsum. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Culpa recus andae quibus dam voluptate minim eius. At, tempora ratione fuga perferen dis esse,excepturi nesciunt similique voluptatibus pariatur sin temporibus odit fugiat ipsum.",
    tags: ["jest", "test"],
  };
  const update = {
    state: "published",
  };
  test("POST /api/v1/blogs", async () => {
    const response = await supertest(app)
      .post(`/api/v1/blogs`)
      .set("Authorization", `Bearer ${TEST_JWT}`)
      .send(newBlog);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.statusCode).toBe(201);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toHaveProperty("blog");
    expect(response.body.data.blog).toHaveProperty("createdAt");
    expect(response.body.data.blog.readCount).toBe(0);
    expect(response.body.data.blog.state).toBe("draft");
  });
  //   test("PATCH /api/v1/blogs/:id", async () => {
  //     const blog = await Blog.findOne({ title: "Test blog title" });
  //     const response = await supertest(app)
  //       .get(`/api/v1/blogs/${blog._id}`)
  //       .set("Authorization", `Bearer ${TEST_JWT}`)
  //       .send(update);
  //     expect(response.headers["content-type"]).toBe(
  //       "application/json; charset=utf-8"
  //     );
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body.status).toBe("success");
  //     expect(response.body.data).toHaveProperty("blog");
  //     expect(response.body.data.blog.state).toBe("published");
  //   });
  //   test("GET /api/v1/blogs", async () => {
  //     const response = await supertest(app).get("/api/v1/blogs");
  //     expect(response.headers["content-type"]).toBe(
  //       "application/json; charset=utf-8"
  //     );
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body.status).toBe("success");
  //     expect(response.body.page).toBe(1);
  //     expect(response.body.results).toBeGreaterThan(10);
  //     expect(response.body.data).toHaveProperty("blogs");
  //   });

  //   test("GET /api/v1/blogs/:id", async () => {
  //     const blog = await Blog.findOne({ title: "Test blog title" });
  //     const response = await supertest(app).get(`/api/v1/blogs/${blog._id}`);
  //     expect(response.headers["content-type"]).toBe(
  //       "application/json; charset=utf-8"
  //     );
  //     expect(response.statusCode).toBe(200);
  //     expect(response.body.status).toBe("success");
  //     expect(response.body.data).toHaveProperty("blog");
  //     expect(response.body.data.blog._id).toBe(blog._id);
  //   });
  //   test("DELETE /api/v1/blogs/:id", async () => {
  //     const blog = await Blog.findOne({ title: "Test blog title" });
  //     const response = await supertest(app)
  //       .delete(`/api/v1/blogs/${blog._id}`)
  //       .set("Authorization", `Bearer ${TEST_JWT}`);
  //     expect(response.statusCode).toBe(204);
  //     expect(response.body.status).toBe("success");
  //     expect(response.body.data).toBeFalsy();
  //   });
});
