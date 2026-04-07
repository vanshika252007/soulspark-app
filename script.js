// dummyjson API - has CORS, no key needed
const API_URL = "https://corsproxy.io/?https://dummyjson.com/quotes?limit=0";

// elements - updated to match new HTML ids
const loadingOverlay = document.getElementById("loadingOverlay");
const featuredText   = document.getElementById("featuredText");
const featuredAuthor = document.getElementById("featuredAuthor");
const newQuoteBtn    = document.getElementById("newQuoteBtn");
const favBtn         = document.getElementById("favBtn");
const favGrid        = document.getElementById("favGrid");
const favEmpty       = document.getElementById("favEmpty");
const exploreBtn     = document.getElementById("exploreBtn");

let allQuotes    = [];
let currentQuote = null;
let favorites    = JSON.parse(localStorage.getItem("soulspark_favs") || "[]");

// commit 27: show random quote with fade effect and fav button state
function showRandom() {
  if (allQuotes.length === 0) return;
  const index = Math.floor(Math.random() * allQuotes.length);
  currentQuote = allQuotes[index];

  featuredText.style.opacity = "0";
  setTimeout(function() {
    featuredText.textContent = '"' + currentQuote.quote + '"';
    featuredAuthor.textContent = "— " + currentQuote.author;
    featuredText.style.opacity = "1";
    featuredText.style.transition = "opacity 0.5s";
  }, 200);

  const isFaved = favorites.some(function(f) { return f.quote === currentQuote.quote; });
  favBtn.textContent = isFaved ? "♥ Saved" : "♡ Save";
  isFaved ? favBtn.classList.add("saved") : favBtn.classList.remove("saved");
}

// commit 28: render favorites into the grid
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
    card.style.animationDelay = i * 0.05 + "s";

    const text = document.createElement("p");
    text.className = "fav-card-text";
    text.textContent = '"' + q.quote + '"';

    const author = document.createElement("p");
    author.className = "fav-card-author";
    author.textContent = "— " + q.author;

    const rb = document.createElement("button");
    rb.className = "fav-remove";
    rb.textContent = "♥";

    rb.addEventListener("click", function() {
      favorites = favorites.filter(function(f) { return f.quote !== q.quote; });
      localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
      renderFavs();
      if (currentQuote && currentQuote.quote === q.quote) {
        favBtn.textContent = "♡ Save";
        favBtn.classList.remove("saved");
      }
    });

    card.appendChild(text);
    card.appendChild(author);
    card.appendChild(rb);
    favGrid.appendChild(card);
  });
}

// commit 29: updated fetchQuotes + all event listeners
async function fetchQuotes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("API error: " + response.status);
    }
    const data = await response.json();
    allQuotes = data.quotes;
    console.log("quotes loaded:", allQuotes.length);

    // hide loading overlay
    loadingOverlay.classList.add("hidden");

    showRandom();
    renderFavs();

  } catch (err) {
    console.log("error:", err);
    loadingOverlay.innerHTML = "<p style='color:#9a8fb0;font-style:italic;padding:2rem;'>Could not load quotes. Please refresh.</p>";
  }
}

// new quote button
newQuoteBtn.addEventListener("click", showRandom);

// save / unsave button
favBtn.addEventListener("click", function() {
  if (!currentQuote) return;

  if (favorites.some(function(f) { return f.quote === currentQuote.quote; })) {
    favorites = favorites.filter(function(f) { return f.quote !== currentQuote.quote; });
    favBtn.textContent = "♡ Save";
    favBtn.classList.remove("saved");
  } else {
    favorites.push(currentQuote);
    favBtn.textContent = "♥ Saved";
    favBtn.classList.add("saved");
  }

  localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
  renderFavs();
});

// scroll to featured section
exploreBtn.addEventListener("click", function() {
  document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});

// start
fetchQuotes();
