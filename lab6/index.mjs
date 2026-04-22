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

// HOME / SEARCH PAGE
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
    res.status(500).send(err.message);
  }
});

app.get("/dbTest", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    res.json(rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).send(err.message);
  }
});

// SEARCH ROUTES
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
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
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
    res.status(500).send(err.message);
  }
});

// =========================
// CRUD ADMIN ROUTES
// =========================

// Admin home
app.get("/admin", (req, res) => {
  res.render("admin");
});

// ---------- AUTHORS ----------

// Show add-author form
app.get("/author/new", (req, res) => {
  res.render("newAuthor");
});

// Add new author
app.post("/author/new", async (req, res) => {
  try {
    const {
      fName,
      lName,
      birthDate,
      deathDate,
      sex,
      profession,
      country,
      portrait,
      biography
    } = req.body;

    const sql = `
      INSERT INTO q_authors
      (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      fName,
      lName,
      birthDate,
      deathDate || null,
      sex || "",
      profession || "",
      country || "",
      portrait || "",
      biography || ""
    ];

    await pool.query(sql, params);
    res.render("newAuthor", { message: "Author added!" });
  } catch (err) {
    console.error("ADD AUTHOR ERROR:", err);
    res.status(500).send(err.message);
  }
});

// List all authors
app.get("/authors", async (req, res) => {
  try {
    const [authors] = await pool.query(`
      SELECT *
      FROM q_authors
      ORDER BY lastName, firstName
    `);

    res.render("authorList", { authors });
  } catch (err) {
    console.error("LIST AUTHORS ERROR:", err);
    res.status(500).send(err.message);
  }
});

// Show edit-author form
app.get("/author/edit", async (req, res) => {
  try {
    const authorId = req.query.authorId;

    const [rows] = await pool.query(
      `
      SELECT *,
             DATE_FORMAT(dob, '%Y-%m-%d') AS dobISO,
             DATE_FORMAT(dod, '%Y-%m-%d') AS dodISO
      FROM q_authors
      WHERE authorId = ?
      `,
      [authorId]
    );

    if (rows.length === 0) {
      return res.status(404).send("Author not found");
    }

    res.render("editAuthor", { authorInfo: rows });
  } catch (err) {
    console.error("GET EDIT AUTHOR ERROR:", err);
    res.status(500).send(err.message);
  }
});

// Update author
app.post("/author/edit", async (req, res) => {
  try {
    const {
      authorId,
      fName,
      lName,
      dob,
      dod,
      sex,
      profession,
      country,
      portrait,
      biography
    } = req.body;

    const sql = `
      UPDATE q_authors
      SET firstName = ?,
          lastName = ?,
          dob = ?,
          dod = ?,
          sex = ?,
          profession = ?,
          country = ?,
          portrait = ?,
          biography = ?
      WHERE authorId = ?
    `;

    const params = [
      fName,
      lName,
      dob,
      dod || null,
      sex || "",
      profession || "",
      country || "",
      portrait || "",
      biography || "",
      authorId
    ];

    await pool.query(sql, params);
    res.redirect("/authors");
  } catch (err) {
    console.error("POST EDIT AUTHOR ERROR:", err);
    res.status(500).send(err.message);
  }
});

// Delete author
app.get("/author/delete", async (req, res) => {
  try {
    const authorId = req.query.authorId;

    await pool.query(
      `
      DELETE FROM q_authors
      WHERE authorId = ?
      `,
      [authorId]
    );

    res.redirect("/authors");
  } catch (err) {
    console.error("DELETE AUTHOR ERROR:", err);
    res.status(500).send(err.message);
  }
});

// ---------- QUOTES ----------

// Show add-quote form
app.get("/quote/new", async (req, res) => {
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

    res.render("newQuote", { authors, categories });
  } catch (err) {
    console.error("GET NEW QUOTE ERROR:", err);
    res.status(500).send(err.message);
  }
});

// Add new quote
app.post("/quote/new", async (req, res) => {
  try {
    const { quote, authorId, category, likes } = req.body;

    await pool.query(
      `
      INSERT INTO q_quotes (quote, authorId, category, likes)
      VALUES (?, ?, ?, ?)
      `,
      [quote, authorId, category, Number(likes || 0)]
    );

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

    res.render("newQuote", {
      authors,
      categories,
      message: "Quote added!"
    });
  } catch (err) {
    console.error("POST NEW QUOTE ERROR:", err);
    res.status(500).send(err.message);
  }
});

// List all quotes
app.get("/quotes", async (req, res) => {
  try {
    const [quotes] = await pool.query(`
      SELECT q_quotes.quoteId, q_quotes.quote, q_quotes.category, q_quotes.likes,
             q_quotes.authorId, q_authors.firstName, q_authors.lastName
      FROM q_quotes
      JOIN q_authors ON q_quotes.authorId = q_authors.authorId
      ORDER BY q_quotes.quoteId
    `);

    res.render("quoteList", { quotes });
  } catch (err) {
    console.error("LIST QUOTES ERROR:", err);
    res.status(500).send(err.message);
  }
});

// Show edit-quote form
app.get("/quote/edit", async (req, res) => {
  try {
    const quoteId = req.query.quoteId;

    const [quoteInfo] = await pool.query(
      `
      SELECT *
      FROM q_quotes
      WHERE quoteId = ?
      `,
      [quoteId]
    );

    if (quoteInfo.length === 0) {
      return res.status(404).send("Quote not found");
    }

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

    res.render("editQuote", {
      quoteInfo: quoteInfo[0],
      authors,
      categories
    });
  } catch (err) {
    console.error("GET EDIT QUOTE ERROR:", err);
    res.status(500).send(err.message);
  }
});

// Update quote
app.post("/quote/edit", async (req, res) => {
  try {
    const { quoteId, quote, authorId, category, likes } = req.body;

    await pool.query(
      `
      UPDATE q_quotes
      SET quote = ?,
          authorId = ?,
          category = ?,
          likes = ?
      WHERE quoteId = ?
      `,
      [quote, authorId, category, Number(likes || 0), quoteId]
    );

    res.redirect("/quotes");
  } catch (err) {
    console.error("POST EDIT QUOTE ERROR:", err);
    res.status(500).send(err.message);
  }
});

// Delete quote
app.get("/quote/delete", async (req, res) => {
  try {
    const quoteId = req.query.quoteId;

    await pool.query(
      `
      DELETE FROM q_quotes
      WHERE quoteId = ?
      `,
      [quoteId]
    );

    res.redirect("/quotes");
  } catch (err) {
    console.error("DELETE QUOTE ERROR:", err);
    res.status(500).send(err.message);
  }
});

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
