async function fetchMovies(query = '') {
  const res = await fetch(`http://localhost:5000/movies?search=${query}`);
  const movies = await res.json();
  const moviesContainer = document.getElementById('movies-container');
  moviesContainer.innerHTML = '';

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    movieCard.innerHTML = `
      <img src="${movie.poster}" class="movie-poster" alt="${movie.title}" />
      <h2>${movie.title}</h2>
      <div class="description">
        ${movie.description.slice(0, 100)}<span class="more-btn">...more</span>
      </div>
      <div class="rating">Rating: ${movie.rating}/5</div>
      <button class="play-trailer-btn">Play Trailer</button>
      <div class="reviews">
        ${movie.reviews.slice(0, 3).map(r => `<p>${r.user}: ${r.review}</p>`).join('')}
        ${movie.reviews.length > 3 ? '<span class="review-more-btn">...more reviews</span>' : ''}
      </div>
    `;
    moviesContainer.appendChild(movieCard);

    const descriptionDiv = movieCard.querySelector('.description');
    const moreBtn = movieCard.querySelector('.more-btn');
    
    // Toggle description between "more" and "less"
    moreBtn.addEventListener('click', () => {
      const isExpanded = descriptionDiv.innerHTML.includes('...less');
      
      if (isExpanded) {
        // Slice description back to original length
        descriptionDiv.innerHTML = `${movie.description.slice(0, 100)}<span class="more-btn">...more</span>`;
        descriptionDiv.querySelector('.more-btn').addEventListener('click', toggleDescription);
      } else {
        // Expand description to full
        descriptionDiv.innerHTML = `${movie.description} <span class="less-btn">...less</span>`;
        descriptionDiv.querySelector('.less-btn').addEventListener('click', toggleDescription);
      }
    });

    // Function to toggle description between "more" and "less"
    function toggleDescription() {
      const isExpanded = descriptionDiv.innerHTML.includes('...less');
      if (isExpanded) {
        descriptionDiv.innerHTML = `${movie.description.slice(0, 100)}<span class="more-btn">...more</span>`;
        descriptionDiv.querySelector('.more-btn').addEventListener('click', toggleDescription);
      } else {
        descriptionDiv.innerHTML = `${movie.description} <span class="less-btn">...less</span>`;
        descriptionDiv.querySelector('.less-btn').addEventListener('click', toggleDescription);
      }
    }

    // Play trailer functionality
    const playBtn = movieCard.querySelector('.play-trailer-btn');
    playBtn.addEventListener('click', () => {
      const videoId = movie.trailer.split('v=')[1].split('&')[0];
      const trailerIframe = document.createElement('iframe');
      trailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&fs=1`;
      trailerIframe.width = "800";
      trailerIframe.height = "450";
      trailerIframe.frameBorder = "0";
      trailerIframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      trailerIframe.allowFullscreen = true;
      movieCard.appendChild(trailerIframe);

      playBtn.style.display = 'none';

      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'X';
      closeBtn.addEventListener('click', () => {
        movieCard.removeChild(trailerIframe);
        movieCard.removeChild(closeBtn);
        playBtn.style.display = 'inline';
      });
      movieCard.appendChild(closeBtn);
    });
  });
}

async function searchMovies() {
  const query = document.getElementById('search-input').value;
  fetchMovies(query);
}

window.onload = () => fetchMovies();
