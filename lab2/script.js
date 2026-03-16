let randomNumber;
let attempts;
let guesses;
let wins = 0;
let losses = 0;

const maxAttempts = 7;

const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const resetBtn = document.getElementById("resetBtn");
const errorMessage = document.getElementById("errorMessage");
const resultMessage = document.getElementById("resultMessage");
const attemptCount = document.getElementById("attemptCount");
const attemptsList = document.getElementById("attemptsList");
const winsDisplay = document.getElementById("wins");
const lossesDisplay = document.getElementById("losses");

function startGame() {
  randomNumber = Math.floor(Math.random() * 99) + 1;
  attempts = 0;
  guesses = [];

  guessInput.value = "";
  guessInput.disabled = false;
  guessBtn.disabled = false;
  guessBtn.style.display = "inline-block";
  resetBtn.style.display = "none";

  attemptCount.textContent = "0";
  attemptsList.textContent = "None yet";
  resultMessage.textContent = "";
  resultMessage.className = "";
  errorMessage.textContent = "";
}

function endGame() {
  guessBtn.disabled = true;
  guessBtn.style.display = "none";
  guessInput.disabled = true;
  resetBtn.style.display = "inline-block";
}

function handleGuess() {
  errorMessage.textContent = "";

  const guess = Number(guessInput.value);

  if (!guessInput.value) {
    errorMessage.textContent = "Please enter a number.";
    return;
  }

  if (guess > 99) {
    errorMessage.textContent = "Error: number cannot be higher than 99.";
    return;
  }

  if (guess < 1) {
    errorMessage.textContent = "Error: number must be at least 1.";
    return;
  }

  attempts++;
  guesses.push(guess);

  attemptCount.textContent = attempts;
  attemptsList.textContent = guesses.join(", ");

  if (guess === randomNumber) {
    resultMessage.textContent = "Congratulations! You guessed the number!";
    resultMessage.className = "win";
    wins++;
    winsDisplay.textContent = wins;
    endGame();
    return;
  }

  if (attempts === maxAttempts) {
    resultMessage.textContent = "You Lost! The random number was " + randomNumber + ".";
    resultMessage.className = "lose";
    losses++;
    lossesDisplay.textContent = losses;
    endGame();
    return;
  }

  if (guess < randomNumber) {
    resultMessage.textContent = "Your last guess was too low.";
    resultMessage.className = "hint";
  } else {
    resultMessage.textContent = "Your last guess was too high.";
    resultMessage.className = "hint";
  }

  guessInput.value = "";
  guessInput.focus();
}

guessBtn.addEventListener("click", handleGuess);
resetBtn.addEventListener("click", startGame);

guessInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !guessBtn.disabled) {
    handleGuess();
  }
});

startGame();