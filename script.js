// dummyjson API (no CORS issues)
const API_URL = "https://dummyjson.com/quotes";

// elements
const loading = document.getElementById("loading");
const quoteBox = document.getElementById("quoteBox");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const newBtn = document.getElementById("newBtn");

let allQuotes = [];

// show random quote
function showRandomQuote() {
  if (allQuotes.length === 0) return;

  const index = Math.floor(Math.random() * allQuotes.length);
  const q = allQuotes[index];

  quoteText.textContent = `"${q.quote}"`;
  quoteAuthor.textContent = `— ${q.author}`;
}


// renders all quote cards into the grid
function renderQuotes() {
  const grid = document.getElementById("quotesGrid");
  const count = document.getElementById("totalCount");
  if (!grid) return;
  grid.innerHTML = "";
  for (let i = 0; i < allQuotes.length; i++) {
    const q = allQuotes[i];
    const card = document.createElement("div");
    card.className = "card";
    const t = document.createElement("p");
    t.className = "text";
    t.textContent = '"' + q.quote + '"';
    const a = document.createElement("p");
    a.className = "author";
    a.textContent = "— " + q.author;
    card.appendChild(t);
    card.appendChild(a);
    grid.appendChild(card);
  }
  if (count) count.textContent = allQuotes.length + " quotes loaded";
}

// fetch quotes
async function fetchQuotes() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("API error: " + response.status);
    }

    const data = await response.json();
    allQuotes = data.quotes;

    console.log("quotes loaded:", allQuotes.length);

    // show UI
    loading.style.display = "none";
    quoteBox.style.display = "block";

    // first quote
    showRandomQuote();

    renderQuotes();

  } catch (err) {
    console.log("error:", err);
    loading.textContent = "Could not load quotes. Please refresh.";
  }
}

// button click
newBtn.addEventListener("click", showRandomQuote);

// start
fetchQuotes();
