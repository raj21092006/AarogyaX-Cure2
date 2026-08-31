/* ==========================================================================
   FIREBASE CONFIGURATION & REALTIME DATABASE INITIALIZATION (Project: data-d3a3e)
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAJkK1MQHDJ7Jf3mmwJ5vn-etKqmQmaTpw",
  authDomain: "data-d3a3e.firebaseapp.com",
  databaseURL: "https://data-d3a3e-default-rtdb.firebaseio.com",
  projectId: "data-d3a3e",
  storageBucket: "data-d3a3e.firebasestorage.app",
  messagingSenderId: "214468155859",
  appId: "1:214468155859:web:43a59e9006ba11c91d7726",
  measurementId: "G-XDNNX6Q0LQ"
};

// Initialize Firebase if Compat SDK loaded
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("🔥 Firebase Realtime Database & Firestore initialized for 'data-d3a3e'!");
  }
}

// Global Firebase Accessors
window.getFirebaseAuth = function() {
  if (typeof firebase !== 'undefined' && firebase.auth) {
    return firebase.auth();
  }
  return null;
};

window.getFirebaseFirestore = function() {
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    return firebase.firestore();
  }
  return null;
};

window.getFirebaseDatabase = function() {
  if (typeof firebase !== 'undefined' && firebase.database) {
    return firebase.database();
  }
  return null;
};

// Helper: Get active authenticated or stored user profile
window.getCurrentUser = function() {
  const savedUser = localStorage.getItem("aarogyax_user");
  if (savedUser) {
    try { return JSON.parse(savedUser); } catch(e) {}
  }
  return {
    uid: "guest_user",
    name: "Guest Patient",
    email: "patient@aarogyax.org",
    phone: "+91 98765 43210",
    bloodGroup: "B+",
    role: "patient",
    emergencyContacts: []
  };
};

window.saveCurrentUser = function(userObj) {
  if (userObj.emergencyContacts && userObj.emergencyContacts.length > 5) {
    userObj.emergencyContacts = userObj.emergencyContacts.slice(0, 5);
  }
  localStorage.setItem("aarogyax_user", JSON.stringify(userObj));
  
  // Realtime Sync to Firebase
  try {
    const db = window.getFirebaseFirestore();
    const rtdb = window.getFirebaseDatabase();
    if (db && userObj.uid) {
      db.collection("users").doc(userObj.uid).set(userObj, { merge: true }).catch(() => {});
    }
    if (rtdb && userObj.uid) {
      rtdb.ref("users/" + userObj.uid).update(userObj).catch(() => {});
    }
  } catch(e) {}
};
