// ============================================================
//  SoulSpark – FINAL WORKING VERSION
// ============================================================

// ── DOM References ──────────────────────────────────────────
const loadingOverlay  = document.getElementById('loadingOverlay');
const featuredText    = document.getElementById('featuredText');
const featuredAuthor  = document.getElementById('featuredAuthor');
const newQuoteBtn     = document.getElementById('newQuoteBtn');
const favFeaturedBtn  = document.getElementById('favFeaturedBtn');
const searchInput     = document.getElementById('searchInput');
const authorFilter    = document.getElementById('authorFilter');
const sortSelect      = document.getElementById('sortSelect');
const quotesGrid      = document.getElementById('quotesGrid');
const noResults       = document.getElementById('noResults');
const pagination      = document.getElementById('pagination');
const favGrid         = document.getElementById('favGrid');
const favEmpty        = document.getElementById('favEmpty');
const themeToggle     = document.getElementById('themeToggle');
const exploreBtn      = document.getElementById('exploreBtn');

// ── State ────────────────────────────────────────────────────
let allQuotes = [];
let displayQuotes = [];
let currentPage = 1;
const QUOTES_PER_PAGE = 12;
let favorites = JSON.parse(localStorage.getItem('soulspark_favs') || '[]');
let currentFeaturedQuote = null;

// ── Utilities ────────────────────────────────────────────────
const cleanAuthor = (author) => (author && author.trim()) ? author.trim() : 'Unknown';
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

function saveFavorites() {
  localStorage.setItem('soulspark_favs', JSON.stringify(favorites));
}

function isFavorited(quote) {
  return favorites.some(f => f.text === quote.text && f.author === quote.author);
}

// ── Theme Toggle ────────────────────────────────────────────
const savedTheme = localStorage.getItem('soulspark_theme') || 'dark';
if (savedTheme === 'light') {
  document.body.classList.add('light');
  themeToggle.textContent = '☀';
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  themeToggle.textContent = isLight ? '☀' : '☽';
  localStorage.setItem('soulspark_theme', isLight ? 'light' : 'dark');
});

// ── Scroll ────────────────────────────────────────────
exploreBtn.addEventListener('click', () => {
  document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
});

// ── FETCH (FIXED API) ───────────────────────────────────────
async function fetchQuotes() {
  try {
    const res = await fetch("https://dummyjson.com/quotes");
    const data = await res.json();

    allQuotes = data.quotes.map(q => ({
      text: q.quote,
      author: cleanAuthor(q.author)
    }));

    hideLoading();
    setFeaturedQuote();
    populateAuthorFilter();
    applyFiltersAndRender();
    renderFavorites();

  } catch (err) {
    console.error("Fetch failed:", err);
    featuredText.textContent = "Could not load quotes 💔";
    featuredAuthor.textContent = "";
    hideLoading();
  }
}

function hideLoading() {
  loadingOverlay.classList.add('hidden');
}

// ── Featured Quote ────────────────────────────────────────────
function setFeaturedQuote(quote) {
  if (!allQuotes.length) return;

  const q = quote || randomItem(allQuotes);
  currentFeaturedQuote = q;

  featuredText.style.opacity = '0';

  setTimeout(() => {
    featuredText.textContent = `"${q.text}"`;
    featuredAuthor.textContent = `— ${q.author}`;
    featuredText.style.opacity = '1';
  }, 200);

  if (isFavorited(q)) {
    favFeaturedBtn.textContent = '♥ Saved';
    favFeaturedBtn.classList.add('saved');
  } else {
    favFeaturedBtn.textContent = '♡ Save';
    favFeaturedBtn.classList.remove('saved');
  }
}

newQuoteBtn.addEventListener('click', () => {
  setFeaturedQuote(randomItem(allQuotes));
});

favFeaturedBtn.addEventListener('click', () => {
  if (!currentFeaturedQuote) return;
  toggleFavorite(currentFeaturedQuote);
  setFeaturedQuote(currentFeaturedQuote);
  renderFavorites();
});

// ── Filters ────────────────────────────────────────────
function populateAuthorFilter() {
  const uniqueAuthors = [...new Set(allQuotes.map(q => q.author))].sort();

  uniqueAuthors.forEach(author => {
    const opt = document.createElement('option');
    opt.value = author;
    opt.textContent = author;
    authorFilter.appendChild(opt);
  });
}

function applyFiltersAndRender() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const authorVal = authorFilter.value;
  const sortVal = sortSelect.value;

  let result = authorVal
    ? allQuotes.filter(q => q.author === authorVal)
    : allQuotes;

  if (searchTerm) {
    result = result.filter(q =>
      q.text.toLowerCase().includes(searchTerm) ||
      q.author.toLowerCase().includes(searchTerm)
    );
  }

  if (sortVal === 'az') {
    result = result.slice().sort((a, b) => a.author.localeCompare(b.author));
  } else if (sortVal === 'za') {
    result = result.slice().sort((a, b) => b.author.localeCompare(a.author));
  }

  displayQuotes = result;
  currentPage = 1;
  renderGrid();
  renderPagination();
}

// ── Grid ────────────────────────────────────────────
function renderGrid() {
  quotesGrid.innerHTML = '';

  if (!displayQuotes.length) {
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');

  const start = (currentPage - 1) * QUOTES_PER_PAGE;
  const pageQuotes = displayQuotes.slice(start, start + QUOTES_PER_PAGE);

  pageQuotes.forEach(q => {
    const tile = document.createElement('div');
    tile.className = 'quote-tile';

    const favIcon = isFavorited(q) ? '♥' : '♡';

    tile.innerHTML = `
      <p class="tile-quote">"${q.text}"</p>
      <p class="tile-author">— ${q.author}</p>
      <button class="tile-fav">${favIcon}</button>
    `;

    tile.querySelector('.tile-fav').addEventListener('click', (e) => {
      toggleFavorite(q);
      e.target.textContent = isFavorited(q) ? '♥' : '♡';
      renderFavorites();
    });

    quotesGrid.appendChild(tile);
  });
}

// ── Pagination ────────────────────────────────────────────
function renderPagination() {
  pagination.innerHTML = '';
  const totalPages = Math.ceil(displayQuotes.length / QUOTES_PER_PAGE);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      renderGrid();
    };
    pagination.appendChild(btn);
  }
}

// ── Favorites ────────────────────────────────────────────
function toggleFavorite(quote) {
  if (isFavorited(quote)) {
    favorites = favorites.filter(f => f.text !== quote.text);
  } else {
    favorites.push(quote);
  }
  saveFavorites();
}

function renderFavorites() {
  favGrid.innerHTML = '';

  if (!favorites.length) {
    favEmpty.classList.remove('hidden');
    return;
  }

  favEmpty.classList.add('hidden');

  favorites.forEach(q => {
    const div = document.createElement('div');
    div.innerHTML = `<p>"${q.text}"</p><p>— ${q.author}</p>`;
    favGrid.appendChild(div);
  });
}

// ── Events ────────────────────────────────────────────
searchInput.addEventListener('input', applyFiltersAndRender);
authorFilter.addEventListener('change', applyFiltersAndRender);
sortSelect.addEventListener('change', applyFiltersAndRender);

// ── Init ────────────────────────────────────────────
fetchQuotes();