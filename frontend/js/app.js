const API = 'http://localhost:5000/api';
let allMovies = [];

window.onload = () => fetchMovies();

async function fetchMovies() {
  try {
    const res = await fetch(`${API}/movies`);
    allMovies = await res.json();
    document.getElementById('movie-count').textContent =
      `${allMovies.length} Movies`;
    renderMovies(allMovies);
  } catch (err) {
    document.getElementById('movies-grid').innerHTML =
      '<div class="placeholder">⚠️ Cannot connect to backend. Is Docker running?</div>';
  }
}

function renderMovies(movies) {
  const grid = document.getElementById('movies-grid');
  if (movies.length === 0) {
    grid.innerHTML =
      '<div class="placeholder">No movies found. Try a different search!</div>';
    return;
  }
  grid.innerHTML = movies.map(m => `
    <div class="card">
      <img
        src="${m.image}"
        alt="${m.title}"
        onerror="this.src='https://picsum.photos/seed/${m.title}/300/450'"
      />
      <button class="btn-delete" onclick="deleteMovie('${m._id}', event)">
        ✕
      </button>
      <div class="card-info">
        <div class="card-title">${m.title}</div>
        <div class="card-meta">
          <span class="card-genre">${m.genre}</span>
          <span class="card-rating">⭐ ${m.rating}</span>
        </div>
        <div class="card-year">${m.year}</div>
      </div>
    </div>
  `).join('');
}

function filterMovies() {
  const search = document.getElementById('search').value.toLowerCase();
  const genre  = document.getElementById('genre-filter').value;
  const filtered = allMovies.filter(m => {
    const matchSearch =
      m.title.toLowerCase().includes(search) ||
      m.description.toLowerCase().includes(search);
    const matchGenre = genre === '' || m.genre === genre;
    return matchSearch && matchGenre;
  });
  renderMovies(filtered);
}

function toggleForm() {
  const form = document.getElementById('add-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addMovie() {
  const movie = {
    title:       document.getElementById('f-title').value,
    genre:       document.getElementById('f-genre').value,
    year:        parseInt(document.getElementById('f-year').value),
    rating:      parseFloat(document.getElementById('f-rating').value),
    description: document.getElementById('f-desc').value,
    image:       document.getElementById('f-image').value ||
                 `https://picsum.photos/seed/${Date.now()}/300/450`
  };
  if (!movie.title || !movie.genre || !movie.year ||
      !movie.rating || !movie.description) {
    showToast('⚠️ Please fill in all fields!');
    return;
  }
  try {
    await fetch(`${API}/movies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie)
    });
    showToast('🎬 Movie added!');
    toggleForm();
    fetchMovies();
  } catch (err) {
    showToast('❌ Failed to add movie');
  }
}

async function deleteMovie(id, event) {
  event.stopPropagation();
  try {
    await fetch(`${API}/movies/${id}`, { method: 'DELETE' });
    showToast('🗑️ Movie deleted!');
    fetchMovies();
  } catch (err) {
    showToast('❌ Failed to delete');
  }
}

async function seedMovies() {
  try {
    showToast('⏳ Loading movies...');
    const res  = await fetch(`${API}/seed`, { method: 'POST' });
    const data = await res.json();
    showToast(`✅ ${data.message}`);
    fetchMovies();
  } catch (err) {
    showToast('❌ Could not load movies');
  }
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}