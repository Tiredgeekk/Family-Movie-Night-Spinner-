
(() => {
  "use strict";

  // Your family! Change Ashton's temporary colour when you find it out.
  const PEOPLE = {
    Charliegh: "#F2C94C", // Yellow
    Tabitha: "#35B7AD",   // Teal
    Ezra: "#4F83CC",      // Blue
    Ashton: "#B78BD4"     // Temporary lavender
  };

  const STORAGE_KEY = "family-movie-night-v1";
  const $ = id => document.getElementById(id);

  const canvas = $("wheel");
  const ctx = canvas.getContext("2d");
  const form = $("movie-form");
  const titleInput = $("movie-title");
  const ownerInput = $("movie-owner");
  const list = $("movie-list");
  const empty = $("empty");
  const search = $("search");
  const filter = $("filter");
  const spinButton = $("spin");
  const result = $("result");

  let movies = loadMovies();
  let rotation = 0;
  let spinning = false;

  function loadMovies() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(saved)) return [];

      return saved.filter(movie =>
        movie &&
        typeof movie.id === "string" &&
        typeof movie.title === "string" &&
        Object.hasOwn(PEOPLE, movie.owner)
      );
    } catch {
      return [];
    }
  }

  function saveMovies() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
    } catch {
      alert("Your browser couldn't save the list. Check your storage settings.");
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function renderList() {
    const query = search.value.trim().toLowerCase();
    const selectedPerson = filter.value;

    const visible = movies.filter(movie =>
      (selectedPerson === "all" || movie.owner === selectedPerson) &&
      (movie.title.toLowerCase().includes(query) ||
       movie.owner.toLowerCase().includes(query))
    );

    list.innerHTML = visible.map(movie => `
      <li class="movie">
        <span class="dot"
          style="background:${PEOPLE[movie.owner]}"
          aria-hidden="true"></span>
        <div class="movie-info">
          <div class="movie-title">${escapeHTML(movie.title)}</div>
          <div class="movie-owner">${escapeHTML(movie.owner)}'s pick</div>
        </div>
        <button class="remove" type="button"
          data-id="${escapeHTML(movie.id)}"
          aria-label="Remove ${escapeHTML(movie.title)}">×</button>
      </li>
    `).join("");

    empty.hidden = visible.length > 0;

    if (movies.length === 0) {
      empty.textContent = "🍿 The list is empty! Add the family's first contenders above.";
    } else if (visible.length === 0) {
      empty.textContent = "🔎 No movies found. Try another search or filter.";
    }

    $("count").textContent =
      `${movies.length} ${movies.length === 1 ? "movie" : "movies"}`;

    spinButton.disabled = spinning || movies.length === 0;
    drawWheel();
  }

  function drawWheel() {
    const size = canvas.width;
    const centre = size / 2;
    const radius = centre - 15;

    ctx.clearRect(0, 0, size, size);

    if (movies.length === 0) {
      ctx.beginPath();
      ctx.arc(centre, centre, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#F5E8EB";
      ctx.fill();
      ctx.fillStyle = "#672F3A";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText("ADD MOVIES 🍿", centre, centre);
      return;
    }

    const slice = (Math.PI * 2) / movies.length;

    ctx.save();
    ctx.translate(centre, centre);
    ctx.rotate(rotation);

    movies.forEach((movie, index) => {
      const start = -Math.PI / 2 + index * slice;
      const end = start + slice;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = PEOPLE[movie.owner];
      ctx.fill();
      ctx.strokeStyle = "#FFFCFA";
      ctx.lineWidth = movies.length > 35 ? 2 : 5;
      ctx.stroke();

      // Text gets hidden on very crowded wheels to keep it legible.
      if (movies.length <= 24) {
        ctx.save();
        ctx.rotate(start + slice / 2);
        ctx.translate(radius * 0.65, 0);
        ctx.rotate(Math.PI / 2);

        let label = movie.title;
        const maxLength = movies.length > 12 ? 12 : 19;
        if (label.length > maxLength) {
          label = label.slice(0, maxLength - 1) + "…";
        }

        ctx.fillStyle = "#30262A";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${Math.max(12, Math.min(23, 260 / movies.length + 6))}px sans-serif`;
        ctx.fillText(label, 0, 0, radius * 0.72);
        ctx.restore();
      }
    });

    ctx.restore();
  }

  function announce(title, message) {
    result.innerHTML = `
      <p class="eyebrow">THE COUNCIL HAS SPOKEN</p>
      <h2>${escapeHTML(title)}</h2>
      <p>${escapeHTML(message)}</p>
    `;
  }

  function spin() {
    if (spinning || movies.length === 0) return;

    spinning = true;
    spinButton.disabled = true;
    announce("The wheel is deciding…", "No lobbying the wheel, please.");

    const full = Math.PI * 2;
    const slice = full / movies.length;

    // Aim the centre of the selected slice at the pointer.
    const target = -(selectedIndex + 0.5) * slice;
    const current = ((rotation % full) + full) % full;
    const targetNormal = ((target % full) + full) % full;
    const distance =
      (6 + Math.random() * 2) * full +
      ((targetNormal - current + full) % full);

    const start = rotation;
    const end = start + distance;
    const duration = matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 300 : 4800;
    const startTime = performance.now();

    function animate(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);

      rotation = start + distance * eased;
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      rotation = ((end % full) + full) % full;
      drawWheel();
      spinning = false;

      
      const slice = full / movies.length;
const pointerAngle = ((-rotation % full) + full) % full;
const selectedIndex = Math.floor(pointerAngle / slice);
const winner = movies[selectedIndex];
      announce(
        `🎉 ${winner.title}`,
        `${winner.owner}'s pick! Start preparing the popcorn.`
      );

      result.style.background = PEOPLE[winner.owner] + "35";
      result.style.borderColor = PEOPLE[winner.owner];

      // Automatically remove the winning movie from the mega-list.
      movies = movies.filter(movie => movie.id !== winner.id);
      saveMovies();
      renderList();


    requestAnimationFrame(animate);
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const owner = ownerInput.value;

    if (!title || !Object.hasOwn(PEOPLE, owner)) return;

    // Stop the exact same person adding the exact same title twice.
    const duplicate = movies.some(movie =>
      movie.owner === owner &&
      movie.title.toLowerCase() === title.toLowerCase()
    );

    if (duplicate) {
      announce("Already on the list!", `${owner} has already submitted ${title}.`);
      return;
    }

    const id = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    movies.push({ id, title, owner });
    saveMovies();
    renderList();

    titleInput.value = "";
    titleInput.focus();
    announce("New contender added!", `${title} joins ${owner}'s picks.`);
    result.style.background = "";
    result.style.borderColor = "";
  });

  list.addEventListener("click", event => {
    const button = event.target.closest("[data-id]");
    if (!button) return;

    const movie = movies.find(item => item.id === button.dataset.id);
    if (!movie) return;

    movies = movies.filter(item => item.id !== movie.id);
    saveMovies();
    renderList();
    announce("Movie removed", `${movie.title} has left the council.`);
    result.style.background = "";
    result.style.borderColor = "";
  });

  $("clear").addEventListener("click", () => {
    if (!movies.length) return;

    if (confirm("Delete every movie in the mega-list? This cannot be undone.")) {
      movies = [];
      saveMovies();
      renderList();
      announce("A fresh start!", "The council awaits new submissions.");
      result.style.background = "";
      result.style.borderColor = "";
    }
  });

  search.addEventListener("input", renderList);
  filter.addEventListener("change", renderList);
  spinButton.addEventListener("click", spin);

  renderList();
})();
