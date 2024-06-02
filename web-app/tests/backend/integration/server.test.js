import { test } from "vitest";
import assert from "assert";
import dotenv from "dotenv";
import { app } from "../../../backend/server.js";
import fetch from "node-fetch";

dotenv.config({ path: ".env.test" });

test("server should start correctly", async () => {
  let testPort = 5000;
  let server;
  try {
    server = app.listen(testPort);
  } catch (error) {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${testPort} is in use, trying another one...`);
      testPort++;
      server = app.listen(testPort);
    } else {
      throw error;
    }
  }
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for 1 second
    const response = await fetch(`http://localhost:${testPort}`);
    assert.strictEqual(response.ok, true);
  } finally {
    server.close();
  }
});
