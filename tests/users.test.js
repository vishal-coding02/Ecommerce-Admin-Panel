const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app");
// const Users = require("../models/UserModel");

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: "test" });

  await request(app).post("/signUp").send({
    userName: "Vishal Shrivastava",
    userEmail: "vshirvastava933@gmail.com",
    userPhone: 7289975427,
    userPassword: "vishal@123",
    userRole: "user",
  });

  const res = await request(app).post("/login").send({
    userEmail: "vshirvastava933@gmail.com",
    userPassword: "vishal@123",
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User API Tests", () => {
  it("should create a user", async () => {
    const res = await request(app).post("/signUp").send({
      userName: "Vishal Shrivastava",
      userEmail: "vshirvastava933@gmail.com",
      userPhone: 7289975427,
      userPassword: "vishal@123",
      userRole: "user",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User created...!");
  });

  it("login user", async () => {
    const res = await request(app).post("/login").send({
      userEmail: "vshirvastava933@gmail.com",
      userPassword: "vishal@123",
    });

    expect(res.body).toHaveProperty("token");
    console.log("Access Token:", res.body.token);
  });

  it("should access protected route with valid token", async () => {
    const res = await request(app)
      .get("/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      `You are authorized. Welcome : Vishal Shrivastava`
    );
  });

  it("should return 404 if user not found", async () => {
    const res = await request(app).post("/login").send({
      email: "notexist@test.com",
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not found");
  });
});
