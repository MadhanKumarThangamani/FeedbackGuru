import { db, saveSession, getSessions, saveFeedback } from "./dbService.js";

document.addEventListener("DOMContentLoaded", function () {
  const feedbackCard = document.getElementById("feedback-card");
  const feedbackForm = document.getElementById("feedback-form");
  const addSessionFloatButton = document.getElementById("addSession");
  const submittedCard = document.getElementById("submitted-card");

  // Initialize Sidenav
  const sideNavs = document.querySelectorAll(".sidenav");
  M.Sidenav.init(sideNavs);

  // Get session ID from query string
  const urlParams = new URLSearchParams(window.location.search);
  const sessionIdFromQuery = urlParams.get("session");

  function showSubmitted(){
    submittedCard.classList.remove('hide');
    feedbackCard.classList.add('hide');
  }
  function showFeedback(){
    submittedCard.classList.add('hide');
    feedbackCard.classList.remove('hide');
  }
  // Fetch sessions
  getSessions(db, (data) => {
    if (sessionIdFromQuery) {
      const isSubmitted = localStorage.getItem(sessionIdFromQuery) == '1';
      if(isSubmitted){
        showSubmitted();
        return;
      }
      // If session ID is provided in query string, load feedback directly
      const session = data[sessionIdFromQuery];
      if (session) {
      const sessionTitle = document.getElementById("sessionTitle");
      const sessionPresenter = document.getElementById("sessionPresenter");
      const sessionLocation = document.getElementById("sessionLocation");

      sessionTitle.innerHTML = session.title;
      sessionPresenter.innerHTML = session.presenter;      
      sessionLocation.innerHTML = session.date;

      showFeedback();
       feedbackCard.dataset.sessionId = sessionIdFromQuery;
      } else {
        M.toast({ html: "Invalid session!", classes: "red" });
      }
    } else {
      showSession();
    }
  });

    // Ratings for each category
    const feedbackRatings = {
      Communication: 0,
      Technology: 0,
      Presentation: 0,
      Interactive: 0,
    };

    // Function to render stars
    function renderStars(category, rating) {
      const starContainer = document.querySelector(
        `.feedback-section[data-category="${category}"] .stars`
      );
      starContainer.innerHTML = ""; // Clear existing stars
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("img");
        star.src = i <= rating ? "/img/star.png" : "/img/star-no.png";
        star.width = 35;
        star.height = 35;
        star.className = "pulse";
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
