import { test } from "vitest";
import assert from "assert";
import dotenv from "dotenv";
import path from "path";
import { connectMySQL } from "../../../backend/server.js";

if (!process.env.MYSQL_HOST) {
  const envPath = path.resolve(process.cwd(), ".env.test");
  dotenv.config({ path: envPath });
}

test("should connect to MySQL successfully", async () => {
  const { connection, pool, host } = await connectMySQL();
  assert.ok(host, "Host should be defined");
  assert.strictEqual(host, process.env.MYSQL_HOST);
  await pool.end();
});

test("should have the environment variables set", async () => {
  const { connection, pool } = await connectMySQL();
  assert.ok(process.env.MYSQL_USER, "MYSQL_USER should be defined");
  assert.ok(process.env.MYSQL_PASSWORD, "MYSQL_PASSWORD should be defined");
  assert.ok(process.env.MYSQL_HOST, "MYSQL_HOST should be defined");
  assert.ok(process.env.MYSQL_DB_NAME, "MYSQL_DB_NAME should be defined");
  await pool.end();
});

test("should create test_user table and insert a row", async () => {
  const { connection, pool } = await connectMySQL("sql_cinephoria_test");

  // Create the test_user table
  await connection.execute(`
  CREATE TABLE test_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userFirstName VARCHAR(255) NOT NULL,
    userLastName VARCHAR(255) NOT NULL,
    userPassword VARCHAR(255) NOT NULL,
    userEmail VARCHAR(255) UNIQUE NOT NULL,
    userRole ENUM('admin', 'employee', 'customer') NOT NULL DEFAULT 'customer',
    userCreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    userUpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
`);

  // Insert a row into the test_user table
  await connection.execute(`
    INSERT INTO test_user 
    (userFirstName, userLastName, userPassword, userEmail, userRole, userCreatedAt, userUpdatedAt) 
    VALUES 
    ('John', 'Doe', 'password123', 'john.doe@example.com', 'customer', NOW(), NOW());
  `);

  // Query the test_user table
  const [rows] = await connection.execute("SELECT * FROM test_user");

  // Check that the row was inserted
  assert.ok(rows.length > 0, "Query result should not be empty");
  assert.strictEqual(rows[0].userFirstName, "John");
  assert.strictEqual(rows[0].userLastName, "Doe");
  assert.strictEqual(rows[0].userEmail, "john.doe@example.com");
  assert.strictEqual(rows[0].userRole, "customer");

  await pool.end();
});

test("should query the database", async () => {
  const { connection, pool } = await connectMySQL("sql_cinephoria_test");
  const [rows] = await connection.execute("SELECT * FROM test_user");
  assert.ok(rows.length > 0, "Query result should not be empty");
  await pool.end();
});

test("should delete the test_user table", async () => {
  const { connection, pool } = await connectMySQL("sql_cinephoria_test");
  await connection.execute("DROP TABLE test_user");
  await pool.end();
});
