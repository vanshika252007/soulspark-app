// =============================
// CONFIG
// =============================
const API_URL = "https://dummyjson.com/quotes?limit=100";

// =============================
// ELEMENTS
// =============================
const loadingOverlay = document.getElementById("loadingOverlay");
const featuredText   = document.getElementById("featuredText");
const featuredAuthor = document.getElementById("featuredAuthor");
const newQuoteBtn    = document.getElementById("newQuoteBtn");
const favBtn         = document.getElementById("favBtn");
const favGrid        = document.getElementById("favGrid");
const favEmpty       = document.getElementById("favEmpty");
const exploreBtn     = document.getElementById("exploreBtn");
const searchInput    = document.getElementById("searchInput");
const sortSelect     = document.getElementById("sortSelect");
const themeToggle    = document.getElementById("themeToggle");

// =============================
// STATE
// =============================
let allQuotes = [];
let currentQuote = null;
let favorites = JSON.parse(localStorage.getItem("soulspark_favs") || "[]");

// =============================
// THEME TOGGLE (FIXED)
// =============================
const savedTheme = localStorage.getItem("soulspark_theme");

if (savedTheme === "alt") {
  document.body.classList.add("alt-theme");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("alt-theme");

  const isAlt = document.body.classList.contains("alt-theme");
  localStorage.setItem("soulspark_theme", isAlt ? "alt" : "default");

  themeToggle.textContent = isAlt ? "✦ BLUE" : "✦ PURPLE";
});

// =============================
// FAVORITE BUTTON STATE
// =============================
function updateFavButton() {
  if (!currentQuote) return;

  const isSaved = favorites.some(f => f.quote === currentQuote.quote);

  favBtn.textContent = isSaved ? "♥ Saved" : "♡ Save";
  favBtn.classList.toggle("saved", isSaved);
}

// =============================
// RANDOM QUOTE
// =============================
function showRandom() {
  if (!allQuotes.length) return;

  const q = allQuotes[Math.floor(Math.random() * allQuotes.length)];
  currentQuote = q;

  featuredText.style.opacity = "0";

  setTimeout(() => {
    featuredText.textContent = `"${q.quote}"`;
    featuredAuthor.textContent = `— ${q.author}`;
    featuredText.style.opacity = "1";
    updateFavButton();
  }, 200);
}

// =============================
// RENDER FAVORITES
// =============================
function renderFavs(list = favorites) {
  favGrid.innerHTML = "";

  if (!favorites.length) {
    favEmpty.style.display = "block";
    return;
  }

  favEmpty.style.display = "none";

  if (!list.length) {
    favGrid.innerHTML = `<p class="no-results">No sparks match ✦</p>`;
    return;
  }

  list.forEach((q) => {
    const card = document.createElement("div");
    card.className = "fav-card";

    card.innerHTML = `
      <p class="fav-card-text">"${q.quote}"</p>
      <p class="fav-card-author">— ${q.author}</p>
      <button class="fav-remove">✕</button>
    `;

    card.querySelector(".fav-remove").onclick = () => {
      favorites = favorites.filter(f => f.quote !== q.quote);
      localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
      applyControls();
      updateFavButton();
    };

    favGrid.appendChild(card);
  });
}

// =============================
// SEARCH + SORT (FIXED)
// =============================
function applyControls() {
  const keyword = searchInput.value.toLowerCase().trim();
  const sort = sortSelect.value;

  let result = favorites.filter(q =>
    q.quote.toLowerCase().includes(keyword) ||
    q.author.toLowerCase().includes(keyword)
  );

  // clone before sorting (important)
  result = [...result];

  if (sort === "az") {
    result.sort((a, b) => a.quote.localeCompare(b.quote));
  } else if (sort === "za") {
    result.sort((a, b) => b.quote.localeCompare(a.quote));
  } else if (sort === "author") {
    result.sort((a, b) => a.author.localeCompare(b.author));
  }

  renderFavs(result);
}

// =============================
// FETCH API
// =============================
async function fetchQuotes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    allQuotes = data.quotes || [];
    loadingOverlay.classList.add("hidden");

    showRandom();
    applyControls();

  } catch (err) {
    console.error(err);
    loadingOverlay.innerHTML = `<p>Failed to load quotes</p>`;
  }
}

// =============================
// EVENTS
// =============================
newQuoteBtn.onclick = showRandom;

favBtn.onclick = () => {
  if (!currentQuote) return;

  const exists = favorites.some(f => f.quote === currentQuote.quote);

  if (exists) {
    favorites = favorites.filter(f => f.quote !== currentQuote.quote);
  } else {
    favorites.push(currentQuote);
  }

  localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
  updateFavButton();
  applyControls();
};

exploreBtn.onclick = () => {
  document.getElementById("explore")
    .scrollIntoView({ behavior: "smooth" });
};

searchInput.oninput = applyControls;
sortSelect.onchange = applyControls;

// =============================
// INIT
// =============================
fetchQuotes();
