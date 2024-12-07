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
      <div class="rating">Average Rating: ${movie.avgRating ? movie.avgRating : 'No ratings yet'}</div>
      <button class="play-trailer-btn">Play Trailer</button>
      <div class="reviews">
        <h3>User Reviews</h3>
        ${movie.reviews.slice(0, 3).map(r => `<p><strong>${r.user}</strong>: ${r.review}</p>`).join('')}
        ${movie.reviews.length > 3 ? '<span class="review-more-btn">...more reviews</span>' : ''}
      </div>
      
      <!-- User review form -->
      <div class="user-review">
        <input type="text" id="user-name-${movie._id}" placeholder="Your name (optional)" />
        <input type="text" id="review-input-${movie._id}" placeholder="Write a review" />
        <input type="number" id="rating-input-${movie._id}" min="1" max="5" placeholder="Rating (1-5)" />
        <button onclick="submitReview('${movie._id}')">Submit Review</button>
      </div>
    `;
    moviesContainer.appendChild(movieCard);

    const descriptionDiv = movieCard.querySelector('.description');
    const moreBtn = movieCard.querySelector('.more-btn');
    
    moreBtn.addEventListener('click', () => {
      const isExpanded = descriptionDiv.innerHTML.includes('...less');
      
      if (isExpanded) {
        descriptionDiv.innerHTML = `${movie.description.slice(0, 100)}<span class="more-btn">...more</span>`;
      } else {
        descriptionDiv.innerHTML = `${movie.description} <span class="less-btn">...less</span>`;
      }
    });

    // Play trailer functionality
    const playBtn = movieCard.querySelector('.play-trailer-btn');
    playBtn.addEventListener('click', () => {
      const videoId = movie.trailer.split('v=')[1].split('&')[0];
      const trailerIframe = document.createElement('iframe');
      trailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&fs=1`;
      trailerIframe.width = "100%";
      trailerIframe.height = "200";
      trailerIframe.frameBorder = "0";
      trailerIframe.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
      trailerIframe.allowFullscreen = true;
      movieCard.appendChild(trailerIframe);

      playBtn.style.display = 'none';

      const closeBtn = document.createElement('button');
      closeBtn.textContent = 'Close Trailer';
      closeBtn.classList.add('close-trailer-btn');
      closeBtn.addEventListener('click', () => {
        movieCard.removeChild(trailerIframe);
        movieCard.removeChild(closeBtn);
        playBtn.style.display = 'inline';
      });
      movieCard.appendChild(closeBtn);
    });
  });
}

async function submitReview(movieId) {
  const review = document.getElementById(`review-input-${movieId}`).value;
  const rating = document.getElementById(`rating-input-${movieId}`).value;
  const userName = document.getElementById(`user-name-${movieId}`).value || "Anonymous";  // Get the user's name

  if (!review || !rating || rating < 1 || rating > 5) {
    alert("Please provide a valid review and rating (1-5).");
    return;
  }

  const response = await fetch(`http://localhost:5000/movies/${movieId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ review, rating, user: userName }),  // Send user name along with the review
  });

  const updatedMovie = await response.json();
  if (updatedMovie) {
    alert('Review submitted successfully!');
    fetchMovies();  // Refresh the movie list with updated reviews and ratings
  } else {
    alert('Failed to submit review.');
  }
}

async function searchMovies() {
  const query = document.getElementById('search-input').value;
  fetchMovies(query);
}

window.onload = () => fetchMovies();
