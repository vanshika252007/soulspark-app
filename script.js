// ============================================================
// SoulSpark — script.js
// Milestone 3: Search (.filter), Sort (.sort), Dark Mode Toggle
// ============================================================

const API_URL = "https://dummyjson.com/quotes?limit=100";

// --- Elements ---
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

let allQuotes    = [];
let currentQuote = null;
let favorites    = JSON.parse(localStorage.getItem("soulspark_favs") || "[]");

// ============================================================
// COMMIT 3: Theme Toggle — Default Dark ↔ Moonrise Navy Dark
// ============================================================
const savedTheme = localStorage.getItem("soulspark_theme");
if (savedTheme === "alt") {
  document.body.classList.add("alt-theme");
  themeToggle.textContent = "✦ PURPLE";
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("alt-theme");
  const isAlt = document.body.classList.contains("alt-theme");
  themeToggle.textContent = isAlt ? "✦ PURPLE" : "✦ NAVY";
  localStorage.setItem("soulspark_theme", isAlt ? "alt" : "default");
});

// ============================================================
// Update Save Button State
// ============================================================
function updateFavButton() {
  if (!currentQuote) return;
  const isFaved = favorites.some(f => f.quote === currentQuote.quote);
  favBtn.textContent = isFaved ? "♥ Saved" : "♡ Save";
  favBtn.classList.toggle("saved", isFaved);
}

// ============================================================
// Show Random Quote
// ============================================================
function showRandom() {
  if (allQuotes.length === 0) return;
  const index    = Math.floor(Math.random() * allQuotes.length);
  currentQuote   = allQuotes[index];
  featuredText.style.opacity = "0";
  setTimeout(() => {
    featuredText.textContent  = `"${currentQuote.quote}"`;
    featuredAuthor.textContent = `— ${currentQuote.author}`;
    featuredText.style.opacity    = "1";
    featuredText.style.transition = "opacity 0.5s";
    updateFavButton();
  }, 200);
}

// ============================================================
// Render Favorites
// ============================================================
function renderFavs(filtered = null) {
  const toRender = filtered !== null ? filtered : favorites;
  favGrid.innerHTML = "";

  // Nothing saved at all
  if (favorites.length === 0) {
    favEmpty.style.display = "block";
    return;
  }
  favEmpty.style.display = "none";

  // Saved items exist but search/sort returns nothing
  if (toRender.length === 0) {
    favGrid.innerHTML = `<p class="no-results">No sparks match your search ✦</p>`;
    return;
  }

  toRender.forEach((q, i) => {
    const card = document.createElement("div");
    card.className = "fav-card";
    card.style.animationDelay = i * 0.05 + "s";

    const text = document.createElement("p");
    text.className = "fav-card-text";
    text.textContent = `"${q.quote}"`;

    const author = document.createElement("p");
    author.className = "fav-card-author";
    author.textContent = `— ${q.author}`;

    const removeBtn = document.createElement("button");
    removeBtn.className = "fav-remove";
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => {
      // ✅ HOF: .filter() to remove from favorites
      favorites = favorites.filter(f => f.quote !== q.quote);
      localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
      applyControls();
      updateFavButton();
    });

    card.appendChild(text);
    card.appendChild(author);
    card.appendChild(removeBtn);
    favGrid.appendChild(card);
  });
}

// ============================================================
// COMMIT 1 & 2: Search (.filter) + Sort (.sort)
// ============================================================
function applyControls() {
  const keyword = searchInput.value.toLowerCase().trim();
  const sortVal = sortSelect.value;

  // ✅ HOF: .filter() — search by quote text or author name
  let result = favorites.filter(q =>
    q.quote.toLowerCase().includes(keyword) ||
    q.author.toLowerCase().includes(keyword)
  );

  // ✅ HOF: .sort() — sort by quote text or author
  if (sortVal === "az") {
    result = result.sort((a, b) => a.quote.localeCompare(b.quote));
  } else if (sortVal === "za") {
    result = result.sort((a, b) => b.quote.localeCompare(a.quote));
  } else if (sortVal === "author") {
    result = result.sort((a, b) => a.author.localeCompare(b.author));
  }

  renderFavs(result);
}

// ============================================================
// Fetch Quotes from API
// ============================================================
async function fetchQuotes() {
  try {
    const response = await fetch(API_URL);
    const data     = await response.json();
    allQuotes      = data.quotes;
    loadingOverlay.classList.add("hidden");
    showRandom();
    applyControls();
  } catch (err) {
    console.log("error:", err);
    loadingOverlay.innerHTML =
      "<p style='color:#9a8fb0;padding:2rem;'>Could not load quotes. Please refresh.</p>";
  }
}

// ============================================================
// Event Listeners
// ============================================================

// New random quote
newQuoteBtn.addEventListener("click", showRandom);

// Save / unsave current quote
favBtn.addEventListener("click", () => {
  if (!currentQuote) return;
  if (favorites.some(f => f.quote === currentQuote.quote)) {
    // ✅ HOF: .filter() to remove
    favorites = favorites.filter(f => f.quote !== currentQuote.quote);
  } else {
    favorites.push(currentQuote);
  }
  localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
  updateFavButton();
  applyControls();
});

// Scroll to explore
exploreBtn.addEventListener("click", () => {
  document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});

// COMMIT 1: Search input
searchInput.addEventListener("input", applyControls);

// COMMIT 2: Sort dropdown
sortSelect.addEventListener("change", applyControls);

// ============================================================
// Init
// ============================================================
fetchQuotes();
