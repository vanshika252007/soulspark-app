// DummyJSON Quotes API - proper CORS, no key needed
const API_URL = "https://dummyjson.com/quotes?limit=100";

// elements
const loadingOverlay = document.getElementById("loadingOverlay");
const featuredText   = document.getElementById("featuredText");
const featuredAuthor = document.getElementById("featuredAuthor");
const newQuoteBtn    = document.getElementById("newQuoteBtn");
const favBtn         = document.getElementById("favBtn");
const favGrid        = document.getElementById("favGrid");
const favEmpty       = document.getElementById("favEmpty");
const exploreBtn     = document.getElementById("exploreBtn");
const themeToggle    = document.getElementById("themeToggle");
const themeIcon      = document.getElementById("themeIcon");
const searchInput = document.getElementById("searchInput");

// state
let allQuotes    = [];
let currentQuote = null;
let favorites    = JSON.parse(localStorage.getItem("soulspark_favs") || "[]");

// ── theme toggle ───────────────────────────────────────────

const savedTheme = localStorage.getItem("soulspark_theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
themeIcon.textContent = savedTheme === "light" ? "☀" : "☽";

themeToggle.addEventListener("click", function() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  themeIcon.textContent = next === "light" ? "☀" : "☽";
  localStorage.setItem("soulspark_theme", next);
});

// ── helpers ────────────────────────────────────────────────

function isFaved(q) {
  return favorites.some(function(f) { return f.quote === q.quote; });
}

function saveFavs() {
  localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
}

function searchQuotes(keyword) {
  const results = allQuotes.filter(function(q) {
    return q.quote.toLowerCase().includes(keyword.toLowerCase()) ||
           q.author.toLowerCase().includes(keyword.toLowerCase());
  });

  // 🔥 DEBUG (you will SEE it's working)
  console.log("Search results:", results.length);

  if (results.length === 0) {
    featuredText.textContent = "No matching wisdom found...";
    featuredAuthor.textContent = "— ✦";
    return;
  }

  // 👉 SHOW FIRST RESULT (not random)
  currentQuote = results[0];

  featuredText.textContent   = "\u201c" + currentQuote.quote + "\u201d";
  featuredAuthor.textContent = "\u2014 " + currentQuote.author;

  favBtn.textContent = isFaved(currentQuote) ? "♥ Saved" : "♡ Save";
  isFaved(currentQuote)
    ? favBtn.classList.add("saved")
    : favBtn.classList.remove("saved");
}

// ── featured quote ─────────────────────────────────────────

function showRandom() {
  if (allQuotes.length === 0) return;
  const index = Math.floor(Math.random() * allQuotes.length);
  currentQuote = allQuotes[index];

  featuredText.style.opacity = "0";
  setTimeout(function() {
    featuredText.textContent   = "\u201c" + currentQuote.quote + "\u201d";
    featuredAuthor.textContent = "\u2014 " + currentQuote.author;
    featuredText.style.opacity    = "1";
    featuredText.style.transition = "opacity 0.5s";
  }, 200);

  favBtn.textContent = isFaved(currentQuote) ? "♥ Saved" : "♡ Save";
  isFaved(currentQuote) ? favBtn.classList.add("saved") : favBtn.classList.remove("saved");
}

// ── favorites ──────────────────────────────────────────────

function renderFavs() {
  favGrid.innerHTML = "";

  if (favorites.length === 0) {
    favEmpty.classList.remove("hidden");
    return;
  }

  favEmpty.classList.add("hidden");

  favorites.forEach(function(q, i) {
    const card = document.createElement("div");
    card.className = "fav-card";
    card.style.animationDelay = (i * 0.05) + "s";

    const text = document.createElement("p");
    text.className = "fav-card-text";
    text.textContent = "\u201c" + q.quote + "\u201d";

    const author = document.createElement("p");
    author.className = "fav-card-author";
    author.textContent = "\u2014 " + q.author;

    const removeBtn = document.createElement("button");
    removeBtn.className = "fav-remove";
    removeBtn.textContent = "♥";
    removeBtn.title = "Remove";

    removeBtn.addEventListener("click", function() {
      favorites = favorites.filter(function(f) { return f.quote !== q.quote; });
      saveFavs();
      renderFavs();
      if (currentQuote && currentQuote.quote === q.quote) {
        favBtn.textContent = "♡ Save";
        favBtn.classList.remove("saved");
      }
    });

    card.appendChild(text);
    card.appendChild(author);
    card.appendChild(removeBtn);
    favGrid.appendChild(card);
  });
}

// ── fetch ──────────────────────────────────────────────────

async function fetchQuotes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    allQuotes = data.quotes;
    console.log("quotes loaded:", allQuotes.length);
    loadingOverlay.classList.add("hidden");
    showRandom();
    renderFavs();
  } catch (err) {
    console.log("error:", err);
    loadingOverlay.innerHTML = "<p style='color:#9a8fb0;font-style:italic;padding:2rem;'>Could not load quotes. Please refresh.</p>";
  }
}

// ── events ─────────────────────────────────────────────────

newQuoteBtn.addEventListener("click", showRandom);

favBtn.addEventListener("click", function() {
  if (!currentQuote) return;
  if (isFaved(currentQuote)) {
    favorites = favorites.filter(function(f) { return f.quote !== currentQuote.quote; });
    favBtn.textContent = "♡ Save";
    favBtn.classList.remove("saved");
  } else {
    favorites.push(currentQuote);
    favBtn.textContent = "♥ Saved";
    favBtn.classList.add("saved");
  }
  saveFavs();
  renderFavs();
});



searchInput.addEventListener("input", function(e) {
  const value = e.target.value.trim();

  console.log("Typing:", value); // 👈 DEBUG

  if (value === "") {
    showRandom();
  } else {
    searchQuotes(value);
  }
});

// ── start ──────────────────────────────────────────────────
fetchQuotes();
