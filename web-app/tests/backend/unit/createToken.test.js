import { test } from "vitest";
import createToken from "../../../backend/utils/createToken.js";
import jwt from "jsonwebtoken";
import { createResponse } from "node-mocks-http";
import dotenv from "dotenv";
import assert from "assert";

dotenv.config({ path: ".env.test" });

test("should create a valid token and set the correct cookie options", () => {
  const res = createResponse();
  const userId = "testUserId";
  const token = createToken(res, userId);

  // Check if a token is returned
  assert.ok(token, "Token should be truthy");

  // Check if the token is valid
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.strictEqual(
    decoded.userId,
    userId,
    "Decoded userId should match input userId"
  );

  // Check if a cookie is set
  const cookies = res.cookies;
  assert.ok(cookies.jwt, "Cookie jwt should be truthy");

  // Check if the cookie options are set correctly
  const cookieOptions = cookies.jwt.options;
  assert.strictEqual(cookieOptions.httpOnly, true, "httpOnly should be true");
  assert.strictEqual(
    cookieOptions.secure,
    process.env.NODE_ENV === "production",
    "secure should match NODE_ENV"
  );
  assert.strictEqual(
    cookieOptions.sameSite,
    process.env.NODE_ENV === "production" ? "None" : "Lax",
    "sameSite should match NODE_ENV"
  );
});
