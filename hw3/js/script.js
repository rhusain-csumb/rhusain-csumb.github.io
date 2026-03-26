const form = document.getElementById("characterForm");
const nameInput = document.getElementById("name");
const speciesSelect = document.getElementById("species");
const nameError = document.getElementById("nameError");
const results = document.getElementById("results");
const statusMessage = document.getElementById("statusMessage");
const resetBtn = document.getElementById("resetBtn");

// Validation
function validateName() {
  const value = nameInput.value.trim();

  if (value === "") {
    nameError.textContent = "Name is required";
    return false;
  }

  if (value.length < 2) {
    nameError.textContent = "Must be at least 2 characters";
    return false;
  }

  nameError.textContent = "";
  return true;
}

// Create card
function createCard(character) {
  return `
    <div class="card">
      <img src="${character.image}" alt="${character.name}">
      <div class="card-content">
        <h3>${character.name}</h3>
        <p>Status: ${character.status}</p>
        <p>Species: ${character.species}</p>
        <p>Origin: ${character.origin.name}</p>
      </div>
    </div>
  `;
}

// Fetch data
async function fetchCharacters(e) {
  e.preventDefault();

  if (!validateName()) return;

  const name = nameInput.value.trim();
  const species = speciesSelect.value;

  let url = `https://rickandmortyapi.com/api/character/?name=${name}`;

  if (species) {
    url += `&species=${species}`;
  }

  statusMessage.textContent = "Loading...";
  results.innerHTML = "";

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error("No results found");

    const data = await response.json();

    results.innerHTML = data.results.map(createCard).join("");
    statusMessage.textContent = "Results loaded!";
  } catch (err) {
    results.innerHTML = "<p>No characters found.</p>";
    statusMessage.textContent = err.message;
  }
}

// Clear
function clearResults() {
  results.innerHTML = "";
  statusMessage.textContent = "Enter a character name to begin.";
  nameError.textContent = "";
}

// Event listeners
form.addEventListener("submit", fetchCharacters);
nameInput.addEventListener("input", validateName);
resetBtn.addEventListener("click", clearResults);