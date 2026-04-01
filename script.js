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

  } catch (err) {
    console.log("error:", err);
    loading.textContent = "Could not load quotes. Please refresh.";
  }
}

// button click
newBtn.addEventListener("click", showRandomQuote);

// start
fetchQuotes();
