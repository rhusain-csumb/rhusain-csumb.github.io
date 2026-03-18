var attempts = parseInt(localStorage.getItem("total_attempts")) || 0;
var score = 0;

document.querySelector("#totalAttempts").innerHTML = `Total Attempts: ${attempts}`;
document.querySelector("button").addEventListener("click", gradeQuiz);

displayQ4Choices();

function displayQ4Choices() {
    let q4Array = ["Maine", "Rhode Island", "Maryland", "Delaware"];
    q4Array = _.shuffle(q4Array);

    let html = "";
    q4Array.forEach(choice => {
        html += `
        <div class="q4-option">
            <input type="radio" name="q4" id="${choice}" value="${choice}">
            <label for="${choice}">${choice}</label>
        </div>`;
    });

    document.querySelector("#q4Choices").innerHTML = html;
}

function rightAnswer(i) {
    document.querySelector(`#markImg${i}`).innerHTML = "<img src='img/checkmark.png'>";
    let f = document.querySelector(`#q${i}Feedback`);
    f.innerHTML = "Correct!";
    f.className = "feedback-msg bg-success";
    score += 10;
}

function wrongAnswer(i) {
    document.querySelector(`#markImg${i}`).innerHTML = "<img src='img/xmark.png'>";
    let f = document.querySelector(`#q${i}Feedback`);
    f.innerHTML = "Incorrect!";
    f.className = "feedback-msg bg-danger";
}

function gradeQuiz() {
    score = 0;

    if (document.querySelector("#q1").value == "") {
        document.querySelector("#validationFdbk").innerHTML = "Question 1 required!";
        return;
    }

    document.querySelector("#validationFdbk").innerHTML = "";

    if (document.querySelector("#q1").value.toLowerCase().trim() == "sacramento") rightAnswer(1); else wrongAnswer(1);

    let q2 = document.querySelector("#q2").value;
    if (q2 === "missouri") rightAnswer(2); else wrongAnswer(2);

    if (!document.querySelector("#Jackson").checked &&
        !document.querySelector("#Franklin").checked &&
        document.querySelector("#Jefferson").checked &&
        document.querySelector("#Roosevelt").checked)
        rightAnswer(3);
    else wrongAnswer(3);

    let q4 = document.querySelector("input[name=q4]:checked");
    if (q4 && q4.value == "Rhode Island") rightAnswer(4); else wrongAnswer(4);

    let q5 = document.querySelector("input[name=q5]:checked");
    if (q5 && q5.value == "true") rightAnswer(5); else wrongAnswer(5);

    if (document.querySelector("#q6").value == 50) rightAnswer(6); else wrongAnswer(6);
    if (document.querySelector("#q7").value == 5) rightAnswer(7); else wrongAnswer(7);
    if (document.querySelector("#q8").value.toLowerCase() == "#ffffff") rightAnswer(8); else wrongAnswer(8);

    let q9 = document.querySelector("#q9").value;
    if (q9.endsWith("-07-04")) rightAnswer(9); else wrongAnswer(9);

    if (document.querySelector("#q10").value == "FL") rightAnswer(10); else wrongAnswer(10);

    document.querySelector("#totalScore").innerHTML = `Score: ${score}/100`;

    let msg = document.querySelector("#congratsMessage");

    if (score > 80) {
        msg.innerHTML = "🎉 Congratulations! You scored above 80!";
        msg.className = "alert";
        msg.style.background = "#e6f9f0";
        msg.style.color = "#198754";
    } else {
        msg.innerHTML = "❌ Your score is 80 or below.";
        msg.className = "alert";
        msg.style.background = "#ffe5e5";
        msg.style.color = "#dc3545";
    }

    attempts++;
    localStorage.setItem("total_attempts", attempts);
    document.querySelector("#totalAttempts").innerHTML = `Total Attempts: ${attempts}`;
}