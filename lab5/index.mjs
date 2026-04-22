import express from "express";
import mysql from "mysql2/promise";

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false
  }
});

app.get("/", async (req, res) => {
  try {
    const [authors] = await pool.query(`
      SELECT authorId, firstName, lastName
      FROM q_authors
      ORDER BY lastName, firstName
    `);

    const [categories] = await pool.query(`
      SELECT DISTINCT category
      FROM q_quotes
      ORDER BY category
    `);

    res.render("index", { authors, categories });
  } catch (err) {
    console.error("HOME ERROR:", err);
    res.send(err.message);
  }
});

app.get("/dbTest", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    res.json(rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.send(err.message);
  }
});

app.get("/searchByKeyword", async (req, res) => {
  try {
    const keyword = req.query.keyword ?? "";

    const [quotes] = await pool.query(
      `
      SELECT q_quotes.quote, q_quotes.category, q_quotes.likes,
             q_authors.firstName, q_authors.lastName, q_quotes.authorId
      FROM q_quotes
      JOIN q_authors ON q_quotes.authorId = q_authors.authorId
      WHERE q_quotes.quote LIKE ?
      ORDER BY q_quotes.likes DESC
      `,
      [`%${keyword}%`]
    );

    res.render("results", { quotes });
  } catch (err) {
    console.error("KEYWORD ERROR:", err);
    res.send(err.message);
  }
});

app.get("/searchByAuthor", async (req, res) => {
  try {
    const authorId = req.query.authorId;

    const [quotes] = await pool.query(
      `
      SELECT q_quotes.quote, q_quotes.category, q_quotes.likes,
             q_authors.firstName, q_authors.lastName, q_quotes.authorId
      FROM q_quotes
      JOIN q_authors ON q_quotes.authorId = q_authors.authorId
      WHERE q_quotes.authorId = ?
      ORDER BY q_quotes.likes DESC
      `,
      [authorId]
    );

    res.render("results", { quotes });
  } catch (err) {
    console.error("AUTHOR ERROR:", err);
    res.send(err.message);
  }
});

app.get("/searchByCategory", async (req, res) => {
  try {
    const category = req.query.category;

    const [quotes] = await pool.query(
      `
      SELECT q_quotes.quote, q_quotes.category, q_quotes.likes,
             q_authors.firstName, q_authors.lastName, q_quotes.authorId
      FROM q_quotes
      JOIN q_authors ON q_quotes.authorId = q_authors.authorId
      WHERE q_quotes.category = ?
      ORDER BY q_quotes.likes DESC
      `,
      [category]
    );

    res.render("results", { quotes });
  } catch (err) {
    console.error("CATEGORY ERROR:", err);
    res.send(err.message);
  }
});

app.get("/searchByLikes", async (req, res) => {
  try {
    const minLikes = Number(req.query.minLikes ?? 0);
    const maxLikes = Number(req.query.maxLikes ?? 999999);

    const [quotes] = await pool.query(
      `
      SELECT q_quotes.quote, q_quotes.category, q_quotes.likes,
             q_authors.firstName, q_authors.lastName, q_quotes.authorId
      FROM q_quotes
      JOIN q_authors ON q_quotes.authorId = q_authors.authorId
      WHERE q_quotes.likes BETWEEN ? AND ?
      ORDER BY q_quotes.likes DESC
      `,
      [minLikes, maxLikes]
    );

    res.render("results", { quotes });
  } catch (err) {
    console.error("LIKES ERROR:", err);
    res.send(err.message);
  }
});

app.get("/api/author/:id", async (req, res) => {
  try {
    const authorId = req.params.id;

    const [rows] = await pool.query(
      `
      SELECT *
      FROM q_authors
      WHERE authorId = ?
      `,
      [authorId]
    );

    res.json(rows);
  } catch (err) {
    console.error("API ERROR:", err);
    res.send(err.message);
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
