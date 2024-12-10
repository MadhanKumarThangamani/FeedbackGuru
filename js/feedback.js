import { db, saveSession, getSessions, saveFeedback } from "./dbService.js";

document.addEventListener("DOMContentLoaded", function () {
  const feedbackCard = document.getElementById("feedback-card");
  const feedbackForm = document.getElementById("feedback-form");
  const submittedCard = document.getElementById("submitted-card");
  const loaderWrapper = document.getElementById("loader-wrapper");
  

  // Initialize Sidenav
  const sideNavs = document.querySelectorAll(".sidenav");
  M.Sidenav.init(sideNavs);

  // Get session ID from query string
  const urlParams = new URLSearchParams(window.location.search);
  const sessionIdFromQuery = urlParams.get("session");
  loaderWrapper.classList.remove('hide');
  function showSubmitted(){
    submittedCard.classList.remove('hide');
    feedbackForm.classList.add('hide');
    loaderWrapper.classList.add('hide');
  }
  function showFeedback(){
    submittedCard.classList.add('hide');
    feedbackForm.classList.remove('hide');
    loaderWrapper.classList.add('hide');
  }
  // Fetch sessions
  getSessions(db, (data) => {
    if (sessionIdFromQuery) {
      // If session ID is provided in query string, load feedback directly
      const session = data[sessionIdFromQuery];
      if (session) {
      const sessionTitle = document.getElementById("sessionTitle");
      const sessionPresenter = document.getElementById("sessionPresenter");
      const sessionLocation = document.getElementById("sessionLocation");

      sessionTitle.innerHTML = session.title;
      sessionPresenter.innerHTML = session.presenter;      
      sessionLocation.innerHTML = session.date;

      const isSubmitted = localStorage.getItem(sessionIdFromQuery) == '1';
      if(isSubmitted){
        showSubmitted();
        return;
      }

      showFeedback();
       feedbackCard.dataset.sessionId = sessionIdFromQuery;
      } else {
        M.toast({ html: "Invalid session!", classes: "red" });
      }
    }
  });
  

    // Ratings for each category
    const feedbackRatings = {
      Rating: 0,
      // Communication: 0,
      // Technology: 0,
      // Presentation: 0,
      // Interactive: 0,
    };

    // Function to render stars
    function renderStars(category, rating) {
      const starContainer = document.querySelector(
        `.feedback-section[data-category="${category}"] .stars`
      );
      starContainer.innerHTML = ""; // Clear existing stars
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("img");
        star.src = i <= rating ? "img/star.png" : "img/star-no.png";
        star.width = 35;
        star.height = 35;
        star.className = i <= rating ? "stars_x animate__animated animate__heartBeat" : "stars_x";
        star.addEventListener("click", () => {
          feedbackRatings[category] = i;
          renderStars(category, i);
        });
        starContainer.appendChild(star);
      }
    }

    // Initialize stars
    Object.keys(feedbackRatings).forEach((category) => {
      renderStars(category, feedbackRatings[category]);
    });

    // Submit feedback
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
    
      const sessionId = feedbackCard.dataset.sessionId;
      const name = document.getElementById("name").value.trim();
      const comment = document.getElementById("comment").value.trim();

      if (!sessionId) {
        M.toast({ html: "Invalid session!", classes: "red" });
        return;
      }

      const stars = document.querySelectorAll('.stars_x'); // Get all elements with the class `.stars_x`

      // Loop through each star element in the collection
      stars.forEach((star) => {
        // Remove existing animation classes to reset animation state
        star.classList.remove('animate__animated', 'animate__tada');
      });
      
      // Check if the rating is less than or equal to 0
      if (feedbackRatings.Rating <= 0) {
        M.toast({
          html: 'Please rate and submit. At least one star should be given!',
          classes: 'red',
        });
      
        // Add animation classes to each star to provide feedback
        stars.forEach((star) => {
          star.classList.add('animate__animated', 'animate__tada');
        });
      
        return; // Exit the function early if the rating is invalid
      }
      

      const feedback = {
        ratings: feedbackRatings,
        name: name || null,
        comment: comment || null,
      };

      saveFeedback(
        db,
        sessionId,
        feedback,
        () => {
          M.toast({
            html: "Feedback submitted successfully!",
            classes: "green",
          });
          feedbackForm.reset();
          Object.keys(feedbackRatings).forEach((category) => {
            feedbackRatings[category] = 0;
            renderStars(category, 0);
          });
          localStorage.setItem(sessionId, 1);
          showSubmitted();
        },
        (error) => {
          M.toast({ html: "Error submitting feedback!", classes: "red" });
          console.error("Failed to submit feedback:", error);
        }
      );
    });
  });
