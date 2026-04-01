import express from "express";
import axios from "axios";
import { faker } from "@faker-js/faker";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const siteTitle = "Software Development Life Cycle";

app.get("/", (req, res) => {
  res.render("home", {
    title: "SDLC Home",
    siteTitle
  });
});

app.get("/waterfall", (req, res) => {
  res.render("waterfall", {
    title: "Waterfall Model",
    siteTitle
  });
});

app.get("/agile", (req, res) => {
  res.render("agile", {
    title: "Agile Model",
    siteTitle
  });
});

app.get("/devops", async (req, res) => {
  let joke = null;
  let error = null;

  try {
    const response = await axios.get(
      "https://official-joke-api.appspot.com/jokes/programming/random"
    );
    joke = response.data[0];
  } catch (err) {
    error = "Could not load programming joke from the API.";
  }

  res.render("devops", {
    title: "DevOps",
    siteTitle,
    joke,
    error
  });
});

app.get("/tools", (req, res) => {
  const teamMembers = Array.from({ length: 5 }, () => ({
    name: faker.person.fullName(),
    role: faker.person.jobTitle(),
    email: faker.internet.email(),
    task: faker.hacker.phrase()
  }));

  res.render("tools", {
    title: "Project Tools",
    siteTitle,
    teamMembers
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});