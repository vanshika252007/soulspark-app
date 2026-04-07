const featuredText = document.getElementById("featuredText");
const featuredAuthor = document.getElementById("featuredAuthor");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const favBtn = document.getElementById("favBtn");
const favGrid = document.getElementById("favGrid");
const favEmpty = document.getElementById("favEmpty");
const exploreBtn = document.getElementById("exploreBtn");
const loadingOverlay = document.getElementById("loadingOverlay");

let currentQuote = null;
let favorites = JSON.parse(localStorage.getItem("soulspark_favs")) || [];

// fetch from CLEAN API
async function fetchQuote() {
  try {
    const res = await fetch("https://api.quotable.io/random");
    const data = await res.json();

    currentQuote = {
      text: data.content,
      author: data.author
    };

    updateUI();
    loadingOverlay.classList.add("hidden");

  } catch (err) {
    loadingOverlay.classList.add("hidden");
    featuredText.innerText = "Failed to load quote.";
  }
}

function updateUI() {
  featuredText.style.opacity = 0;

  setTimeout(() => {
    featuredText.innerText = `"${currentQuote.text}"`;
    featuredAuthor.innerText = "— " + currentQuote.author;
    featuredText.style.opacity = 1;
  }, 200);

  checkFav();
}

function checkFav() {
  const exists = favorites.some(f => f.text === currentQuote.text);

  favBtn.innerText = exists ? "♥ Saved" : "♡ Save";
  favBtn.classList.toggle("saved", exists);
}

newQuoteBtn.onclick = fetchQuote;

favBtn.onclick = () => {
  if (!currentQuote) return;

  const exists = favorites.some(f => f.text === currentQuote.text);

  if (exists) {
    favorites = favorites.filter(f => f.text !== currentQuote.text);
  } else {
    favorites.push(currentQuote);
  }

  localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
  renderFavs();
  checkFav();
};

function renderFavs() {
  favGrid.innerHTML = "";

  if (favorites.length === 0) {
    favEmpty.classList.remove("hidden");
    return;
  }

  favEmpty.classList.add("hidden");

  favorites.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "fav-card";

    card.innerHTML = `
      <p class="fav-card-text">"${q.text}"</p>
      <p class="fav-card-author">— ${q.author}</p>
      <button class="fav-remove">✕</button>
    `;

    card.querySelector(".fav-remove").onclick = () => {
      favorites.splice(i, 1);
      localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
      renderFavs();
    };

    favGrid.appendChild(card);
  });
}

exploreBtn.onclick = () => {
  document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
};

// init
fetchQuote();
renderFavs();
