import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZkDG7c2-X2hcHVom6fR3OE20H4fvxD1M",
  authDomain: "feedbackguru-28cd3.firebaseapp.com",
  projectId: "feedbackguru-28cd3",
  storageBucket: "feedbackguru-28cd3.firebasestorage.app",
  messagingSenderId: "851289945198",
  appId: "1:851289945198:web:922648f3f4016561e9227f",
  databaseURL: "https://feedbackguru-28cd3-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Save a session to Firebase
export function saveSession(db, session, onSuccess, onError) {
  const sessionsRef = ref(db, 'sessions');
  const newSessionRef = push(sessionsRef);
  set(newSessionRef, session)
    .then(() => {
      if (onSuccess) onSuccess();
    })
    .catch((error) => {
      if (onError) onError(error);
    });
}

// Retrieve sessions from Firebase
export function getSessions(db, callback) {
  const sessionsRef = ref(db, 'sessions');
  onValue(sessionsRef, (snapshot) => {
    const data = snapshot.val();
    if (callback) callback(data);
  });
}

// Save feedback to Firebase
export function saveFeedback(db, sessionId, feedback, onSuccess, onError) {
  const feedbackRef = ref(db, `sessions/${sessionId}/feedback`);
  const newFeedbackRef = push(feedbackRef);
  set(newFeedbackRef, feedback)
    .then(() => {
      if (onSuccess) onSuccess();
    })
    .catch((error) => {
      if (onError) onError(error);
    });
}
