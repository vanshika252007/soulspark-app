// dummyjson API (stable)
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

let allQuotes    = [];
let currentQuote = null;
let favorites    = JSON.parse(localStorage.getItem("soulspark_favs") || "[]");

// 🔥 keep button state always correct
function updateFavButton() {
if (!currentQuote) return;

const isFaved = favorites.some(f => f.quote === currentQuote.quote);

favBtn.textContent = isFaved ? "♥ Saved" : "♡ Save";
favBtn.classList.toggle("saved", isFaved);
}

// show random quote with animation
function showRandom() {
if (allQuotes.length === 0) return;

const index = Math.floor(Math.random() * allQuotes.length);
currentQuote = allQuotes[index];

featuredText.style.opacity = "0";

setTimeout(() => {
featuredText.textContent = '"' + currentQuote.quote + '"';
featuredAuthor.textContent = "— " + currentQuote.author;
featuredText.style.opacity = "1";
featuredText.style.transition = "opacity 0.5s";

```
updateFavButton();
```

}, 200);
}

// render favorites
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
card.style.animationDelay = i * 0.05 + "s";

```
const text = document.createElement("p");
text.className = "fav-card-text";
text.textContent = '"' + q.quote + '"';

const author = document.createElement("p");
author.className = "fav-card-author";
author.textContent = "— " + q.author;

const removeBtn = document.createElement("button");
removeBtn.className = "fav-remove";
removeBtn.textContent = "✕";

removeBtn.addEventListener("click", () => {
  favorites = favorites.filter(f => f.quote !== q.quote);
  localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
  renderFavs();
  updateFavButton();
});

card.appendChild(text);
card.appendChild(author);
card.appendChild(removeBtn);
favGrid.appendChild(card);
```

});
}

// fetch quotes
async function fetchQuotes() {
try {
const res = await fetch(API_URL);

```
if (!res.ok) {
  throw new Error("API error: " + res.status);
}

const data = await res.json();
allQuotes = data.quotes;

console.log("quotes loaded:", allQuotes.length);

loadingOverlay.classList.add("hidden");

showRandom();
renderFavs();
```

} catch (err) {
console.log("error:", err);
loadingOverlay.innerHTML = "<p style='color:#9a8fb0;font-style:italic;padding:2rem;'>Could not load quotes. Please refresh.</p>";
}
}

// events
newQuoteBtn.addEventListener("click", showRandom);

favBtn.addEventListener("click", () => {
if (!currentQuote) return;

if (favorites.some(f => f.quote === currentQuote.quote)) {
favorites = favorites.filter(f => f.quote !== currentQuote.quote);
} else {
favorites.push(currentQuote);
}

localStorage.setItem("soulspark_favs", JSON.stringify(favorites));
updateFavButton();
renderFavs();
});

exploreBtn.addEventListener("click", () => {
document.getElementById("explore").scrollIntoView({ behavior: "smooth" });
});

// init
fetchQuotes();
