import { db, saveSession, getSessions, saveFeedback } from './dbService.js';

document.addEventListener('DOMContentLoaded', function () {
  const sessionList = document.getElementById('session-list');
  const feedbackCard = document.getElementById('feedback-card');
  const feedbackForm = document.getElementById('feedback-form');
  const addSessionFloatButton = document.getElementById('addSession');
  

  // Initialize Sidenav
  const sideNavs = document.querySelectorAll('.sidenav');
  M.Sidenav.init(sideNavs);

  // Fetch sessions
  getSessions(db, (data) => {
    debugger
    sessionList.innerHTML = ''; // Clear the list

    if (!data) {
      sessionList.innerHTML = '<div class="empty-template">No sessions available. Add a new session!</div>';
      return;
    }

    Object.keys(data).forEach((key) => {
      const session = data[key];
      if (!session.isActive) return; // Only allow active sessions

      sessionList.innerHTML += `
        <div class="card-panel session white row cursor" data-id="${key}">
          <img src="/img/guru.png" alt="session thumb">
          <div class="session-details">
            <div class="session-title">${session.title}</div>
            <span class="session-leader">${session.presenter}</span>
            <span class="session-location">${session.location} at ${session.date}</span>
          </div>
        </div>
      `;
    });

   function showFeedback(){
     feedbackCard.style.display = 'block';
     sessionList.style.display = 'none';  
     addSessionFloatButton.style.display = 'none';
    }

    function showSession(){
        feedbackCard.style.display = 'none';
        sessionList.style.display = 'block';
        addSessionFloatButton.style.display = 'block';
    }
    // Show feedback card for a session
    document.querySelectorAll('.session').forEach(session => {
      session.addEventListener('click', () => {
        showFeedback();
        const sessionId = session.dataset.id;
        feedbackCard.dataset.sessionId = sessionId;
      });
    });
  });

  // Add session
  const addSessionForm = document.querySelector('.add-session');
  addSessionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const presenter = document.getElementById('Presenter').value.trim();
    const location = document.getElementById('Location').value.trim();
    const date = document.getElementById('SessionDate').value.trim();

    if (!title || !presenter || !location || !date) {
      M.toast({ html: 'All fields are required!', classes: 'red' });
      return;
    }

    const newSession = {
      id: crypto.randomUUID(),
      title,
      presenter,
      location,
      date,
      isActive: true
    };

    saveSession(db, newSession, () => {
      M.toast({ html: 'Session added successfully!', classes: 'green' });
      addSessionForm.reset();
    }, (error) => {
      M.toast({ html: 'Failed to add session!', classes: 'red' });
      console.error(error);
    });
  });

  // Ratings for each category
  const feedbackRatings = {
    Communication: 0,
    Technology: 0,
    Presentation: 0,
    Interactive: 0
  };

  // Function to render stars
  function renderStars(category, rating) {
    const starContainer = document.querySelector(`.feedback-section[data-category="${category}"] .stars`);
    starContainer.innerHTML = ''; // Clear existing stars
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('img');
      star.src = i <= rating ? '/img/star.png' : '/img/star-no.png';
      star.width = 35;
      star.height = 35;
      star.className = 'pulse';
      star.addEventListener('click', () => {
        feedbackRatings[category] = i;
        renderStars(category, i);
      });
      starContainer.appendChild(star);
    }
  }

  // Initialize stars
  Object.keys(feedbackRatings).forEach(category => {
    renderStars(category, feedbackRatings[category]);
  });

  // Submit feedback
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const sessionId = feedbackCard.dataset.sessionId;
    const name = document.getElementById('name').value.trim();
    const comment = document.getElementById('comment').value.trim();

    if (!sessionId) {
      M.toast({ html: 'Invalid session!', classes: 'red' });
      return;
    }

    const feedback = {
      ratings: feedbackRatings,
      name: name || null,
      comment: comment || null
    };

    saveFeedback(db, sessionId, feedback, () => {
      M.toast({ html: 'Feedback submitted successfully!', classes: 'green' });
      feedbackForm.reset();
      feedbackCard.style.display = 'none';
      sessionList.style.display = 'block';
      Object.keys(feedbackRatings).forEach(category => {
        feedbackRatings[category] = 0;
        renderStars(category, 0);
      });
    }, (error) => {
      M.toast({ html: 'Error submitting feedback!', classes: 'red' });
      console.error('Failed to submit feedback:', error);
    });
  });
});
