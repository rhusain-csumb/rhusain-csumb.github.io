import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
const planets = (await import("npm-solarsystem")).default;

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

const planetNames = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune"
];

app.get("/", (req, res) => {
  const randomBg = `https://source.unsplash.com/1600x900/?space,galaxy,solar-system&t=${Date.now()}`;

  res.render("index", {
    title: "Home",
    planetNames,
    randomBg
  });
});

app.get("/planet", (req, res) => {
  try {
    const planetName = req.query.planetName;

    if (!planetName || !planetNames.includes(planetName)) {
      return res.status(404).send("Planet not found");
    }

    const methodName = `get${planetName}`;
    const planetInfo = planets[methodName]();

    res.render("planet", {
      title: planetName,
      planetNames,
      planetName,
      planetInfo
    });
  } catch (error) {
    res.status(500).send("Error loading planet page");
  }
});

app.get("/nasa", async (req, res) => {
  try {
    const url =
      "https://api.nasa.gov/planetary/apod?api_key=9mUzIkhlZCZaOoMfspg7jMmwZCZ4LiRHtkgkambD&date=2026-03-21";

    const response = await fetch(url);
    const apod = await response.json();

    res.render("nasa", {
      title: "NASA POD",
      planetNames,
      apod
    });
  } catch (error) {
    res.status(500).send("Error loading NASA Picture of the Day");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});