let usernameAvailable = false;

// Event listeners
document.querySelector("#zip").addEventListener("change", displayCity);
document.querySelector("#state").addEventListener("change", displayCounties);
document.querySelector("#username").addEventListener("input", checkUsername);
document.querySelector("#password").addEventListener("click", getSuggestedPassword);
document.querySelector("#signupForm").addEventListener("submit", validateForm);

// Load all states when page loads
getStates();

async function displayCity() {
  const zip = document.querySelector("#zip").value.trim();
  const zipError = document.querySelector("#zipError");

  if (zip === "") {
    clearZipFields();
    zipError.textContent = "";
    return;
  }

  const url = `https://csumb.space/api/cityInfoAPI.php?zip=${zip}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || data === false) {
      clearZipFields();
      zipError.textContent = "Zip code not found";
      zipError.className = "error";
      return;
    }

    zipError.textContent = "";
    document.querySelector("#city").textContent = data.city;
    document.querySelector("#latitude").textContent = data.latitude;
    document.querySelector("#longitude").textContent = data.longitude;
  } catch (error) {
    clearZipFields();
    zipError.textContent = "Zip code not found";
    zipError.className = "error";
  }
}

function clearZipFields() {
  document.querySelector("#city").textContent = "";
  document.querySelector("#latitude").textContent = "";
  document.querySelector("#longitude").textContent = "";
}

async function displayCounties() {
  const state = document.querySelector("#state").value;
  const county = document.querySelector("#county");

  if (state === "") {
    county.innerHTML = '<option value="">Select One</option>';
    return;
  }

  const url = `https://csumb.space/api/countyListAPI.php?state=${state}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    county.innerHTML = '<option value="">Select One</option>';

    for (let i of data) {
      county.innerHTML += `<option value="${i.county}">${i.county}</option>`;
    }
  } catch (error) {
    county.innerHTML = '<option value="">Select One</option>';
  }
}

async function checkUsername() {
  const username = document.querySelector("#username").value.trim();
  const msg = document.querySelector("#usernameError");

  if (username === "") {
    msg.textContent = "";
    msg.className = "";
    usernameAvailable = false;
    return;
  }

  const url = `https://csumb.space/api/usernamesAPI.php?username=${username}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.available) {
      msg.textContent = "Username available";
      msg.className = "success";
      usernameAvailable = true;
    } else {
      msg.textContent = "Username unavailable";
      msg.className = "error";
      usernameAvailable = false;
    }
  } catch (error) {
    msg.textContent = "Unable to check username";
    msg.className = "error";
    usernameAvailable = false;
  }
}

async function getSuggestedPassword() {
  const url = "https://csumb.space/api/suggestedPassword.php?length=8";

  try {
    const response = await fetch(url);
    const data = await response.json();
    document.querySelector("#suggestedPwd").textContent = `Suggested: ${data.password}`;
  } catch (error) {
    document.querySelector("#suggestedPwd").textContent = "";
  }
}

async function getStates() {
  const url = "https://csumb.space/api/allStatesAPI.php";
  const stateMenu = document.querySelector("#state");

  try {
    const response = await fetch(url);
    const data = await response.json();

    stateMenu.innerHTML = '<option value="">Select One</option>';

    for (let i of data) {
      stateMenu.innerHTML += `<option value="${i.usps.toLowerCase()}">${i.state}</option>`;
    }
  } catch (error) {
    stateMenu.innerHTML = '<option value="">Could not load states</option>';
  }
}

function validateForm(e) {
  let isValid = true;

  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value;
  const passwordAgain = document.querySelector("#passwordAgain").value;

  const usernameError = document.querySelector("#usernameError");
  const passwordError = document.querySelector("#passwordError");

  passwordError.textContent = "";

  if (username.length === 0) {
    usernameError.textContent = "Username Required!";
    usernameError.className = "error";
    isValid = false;
  } else if (!usernameAvailable) {
    usernameError.textContent = "Username unavailable";
    usernameError.className = "error";
    isValid = false;
  }

  if (password.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters";
    passwordError.className = "error";
    isValid = false;
  } else if (password !== passwordAgain) {
    passwordError.textContent = "Passwords do not match";
    passwordError.className = "error";
    isValid = false;
  }

  if (!isValid) {
    e.preventDefault();
  }
}