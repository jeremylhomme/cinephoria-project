import { test } from "vitest";
import assert from "assert";

import { connectMongoDB } from "../../../backend/server.js";

test("should connect to MongoDB with success", async () => {
  const { connection, db, host } = await connectMongoDB();
  try {
    assert.ok(host, "Host should be defined");
    assert.strictEqual(host, process.env.MONGODB_HOST);
  } finally {
    await connection.close();
  }
});

test("should have the environment variables set", () => {
  assert.ok(process.env.MONGODB_USERNAME, "MONGODB_USERNAME should be defined");
  assert.ok(process.env.MONGODB_PORT, "MONGODB_PORT should be defined");
  assert.ok(process.env.MONGODB_PASSWORD, "MONGODB_PASSWORD should be defined");
  assert.ok(process.env.MONGODB_HOST, "MONGODB_HOST should be defined");
  assert.ok(process.env.MONGODB_NAME, "MONGODB_NAME should be defined");
});

test("should insert a document into the database", async () => {
  const { connection, db } = await connectMongoDB();
  try {
    const testDocument = {
      sessionId: "session1",
      userId: "user1",
      movieId: "movie1",
      seatsBooked: [],
      bookingPrice: 10,
      bookingStatus: "pending",
      bookingCreatedAt: new Date(),
    };
    const insertResult = await db
      .collection("booking_test")
      .insertOne(testDocument);
    assert.ok(insertResult.insertedId, "Inserted document should have an ID");
  } finally {
    await connection.close();
  }
});

test("should query the database", async () => {
  const { connection, db } = await connectMongoDB();
  try {
    const result = await db
      .collection("booking_test")
      .findOne({ sessionId: "session1" });
    assert.ok(result, "Query result should be defined");
    assert.strictEqual(
      result.sessionId,
      "session1",
      "Document should be the one we inserted"
    );
  } finally {
    await connection.close();
  }
});

test("should delete a document from the database", async () => {
  const { connection, db } = await connectMongoDB();
  try {
    const testDocument = await db
      .collection("booking_test")
      .findOne({ sessionId: "session1" });
    const deleteResult = await db
      .collection("booking_test")
      .deleteOne({ _id: testDocument._id });
    assert.strictEqual(
      deleteResult.deletedCount,
      1,
      "One document should be deleted"
    );
  } finally {
    await connection.close();
  }
});
