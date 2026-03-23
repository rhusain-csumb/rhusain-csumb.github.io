let usernameAvailable = false;

document.querySelector("#zip").addEventListener("change", displayCity);
document.querySelector("#state").addEventListener("change", displayCounties);
document.querySelector("#username").addEventListener("input", checkUsername);
document.querySelector("#password").addEventListener("click", getSuggestedPassword);
document.querySelector("#signupForm").addEventListener("submit", validateForm);

// load all states immediately when page loads
getStates();

async function displayCity() {
  const zipCode = document.querySelector("#zip").value.trim();
  const zipError = document.querySelector("#zipError");

  if (zipCode === "") {
    clearZipFields();
    zipError.textContent = "";
    return;
  }

  const url = `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;

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
    zipError.className = "";

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

async function getStates() {
  const stateMenu = document.querySelector("#state");
  const url = "https://csumb.space/api/allStatesAPI.php";

  try {
    const response = await fetch(url);
    const data = await response.json();

    stateMenu.innerHTML = `<option value="">Select One</option>`;

    for (let i of data) {
      // this lab needs the two-letter abbreviation as the value
      const abbr = (i.usps || i.abbreviation || "").toLowerCase();
      const stateName = i.state || i.name || "";

      if (abbr && stateName) {
        stateMenu.innerHTML += `<option value="${abbr}">${stateName}</option>`;
      }
    }
  } catch (error) {
    stateMenu.innerHTML = `<option value="">Could not load states</option>`;
  }
}

async function displayCounties() {
  const state = document.querySelector("#state").value;
  const countyList = document.querySelector("#county");

  if (state === "") {
    countyList.innerHTML = `<option value="">Select County</option>`;
    return;
  }

  const url = `https://csumb.space/api/countyListAPI.php?state=${state}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // reset before appending counties
    countyList.innerHTML = `<option value="">Select County</option>`;

    for (let i of data) {
      countyList.innerHTML += `<option value="${i.county}">${i.county}</option>`;
    }
  } catch (error) {
    countyList.innerHTML = `<option value="">Select County</option>`;
  }
}

async function checkUsername() {
  const username = document.querySelector("#username").value.trim();
  const usernameError = document.querySelector("#usernameError");

  if (username.length === 0) {
    usernameError.textContent = "";
    usernameError.className = "";
    usernameAvailable = false;
    return;
  }

  if (username.length < 3) {
    usernameError.textContent = "";
    usernameError.className = "";
    usernameAvailable = false;
    return;
  }

  const url = `https://csumb.space/api/usernamesAPI.php?username=${username}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.available) {
      usernameError.textContent = "Available";
      usernameError.className = "success";
      usernameAvailable = true;
    } else {
      usernameError.textContent = "Not available";
      usernameError.className = "error";
      usernameAvailable = false;
    }
  } catch (error) {
    usernameError.textContent = "Error checking username";
    usernameError.className = "error";
    usernameAvailable = false;
  }
}

async function getSuggestedPassword() {
  const url = "https://csumb.space/api/suggestedPassword.php?length=8";

  try {
    const response = await fetch(url);
    const data = await response.json();
    document.querySelector("#suggestedPwd").textContent = `Suggested Password: ${data.password}`;
  } catch (error) {
    document.querySelector("#suggestedPwd").textContent = "";
  }
}

function validateForm(e) {
  let isValid = true;

  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value;
  const passwordAgain = document.querySelector("#passwordAgain").value;

  const formError = document.querySelector("#formError");
  const passwordError = document.querySelector("#passwordError");

  formError.textContent = "";
  passwordError.textContent = "";

  if (username.length < 3) {
    formError.textContent = "username must have at least three characters";
    isValid = false;
  } else if (!usernameAvailable) {
    formError.textContent = "username is unavailable";
    isValid = false;
  }

  if (password.length < 6) {
    passwordError.textContent = "Password must have at least six characters";
    isValid = false;
  } else if (password !== passwordAgain) {
    passwordError.textContent = "Passwords do not match";
    isValid = false;
  }

  if (!isValid) {
    e.preventDefault();
  }
}