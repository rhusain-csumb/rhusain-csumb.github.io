let authorLinks = document.querySelectorAll(".authorLink");

for (let link of authorLinks) {
  link.addEventListener("click", getAuthorInfo);
}

async function getAuthorInfo(event) {
  event.preventDefault();

  const authorId = this.dataset.id;
  const authorInfo = document.querySelector("#authorInfo");
  const myModal = new bootstrap.Modal(document.getElementById("authorModal"));

  authorInfo.innerHTML = `<p>Loading author info...</p>`;
  myModal.show();

  try {
    const response = await fetch(`/api/author/${authorId}`);
    const data = await response.json();

    if (data.length > 0) {
      const author = data[0];

      authorInfo.innerHTML = `
        <div class="text-center">
          <h2>${author.firstName} ${author.lastName}</h2>
          <img
            src="${author.portrait}"
            alt="${author.firstName} ${author.lastName}"
            class="img-fluid mb-3"
            style="max-height: 250px;"
            onerror="this.src='/img/default-author.png'"
          >
        </div>
        <p><strong>Born:</strong> ${author.dob ? author.dob.substring(0, 10) : "N/A"}</p>
        <p><strong>Died:</strong> ${author.dod ? author.dod.substring(0, 10) : "N/A"}</p>
        <p><strong>Sex:</strong> ${author.sex}</p>
        <p><strong>Profession:</strong> ${author.profession}</p>
        <p><strong>Country:</strong> ${author.country}</p>
        <p><strong>Biography:</strong> ${author.biography}</p>
      `;
    } else {
      authorInfo.innerHTML = `<p>No author information found.</p>`;
    }
  } catch (error) {
    console.error("Error fetching author info:", error);
    authorInfo.innerHTML = `<p>Could not load author information.</p>`;
  }
}