// ============================================================
// firebase.js — Firestore + Auth backend for the Plan de Salle app
// ============================================================
// This replaces window.storage (the artifact demo storage) with your
// real Firebase project, so data persists properly and the admin
// login is real authentication instead of a hardcoded password check.
//
// Usage in admin.html / index.html:
//   <script type="module" src="firebase.js"></script>
// then call the exported functions instead of window.storage.*
// (see the integration steps explained in chat).
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

// ------------------------------------------------------------
// 1. FIREBASE CONFIG — lestwinstable project
// ------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCr6_w7stl2azSgJXa8la-t1Lf00IU9EUk",
  authDomain: "lestwinstable.firebaseapp.com",
  projectId: "lestwinstable",
  storageBucket: "lestwinstable.firebasestorage.app",
  messagingSenderId: "851369925811",
  appId: "1:851369925811:web:bcc974b47758bca97124c6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Everything for this restaurant lives in ONE document, same shape
// as the old window.storage blob: { salle1: {...}, salle2: {...}, ... }
const STATE_DOC = doc(db, "floorplan", "state");

// ------------------------------------------------------------
// 2. READ / WRITE STATE
// ------------------------------------------------------------

// One-time read (used on first load)
export async function loadState() {
  const snap = await getDoc(STATE_DOC);
  return snap.exists() ? snap.data() : {};
}

// Write the full state object (same as saveState(state) before)
export async function saveState(state) {
  await setDoc(STATE_DOC, state);
}

// Live subscription — fires callback(state) instantly whenever ANY
// device changes a reservation. This is what makes index.html update
// in real time instead of polling every 4 seconds.
export function subscribeState(callback) {
  return onSnapshot(STATE_DOC, (snap) => {
    callback(snap.exists() ? snap.data() : {});
  });
}

// ------------------------------------------------------------
// 3. REAL LOGIN (replaces the hardcoded email/password check)
// ------------------------------------------------------------

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

// Call this once on page load in admin.html to know if someone
// is already logged in (keeps them logged in across refreshes).
export function watchAuth(callback) {
  return onAuthStateChanged(auth, (user) => callback(user));
}
