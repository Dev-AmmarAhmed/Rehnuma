import "./ui-init.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIYiP7aJgU4h26UjO3WOmC7SmA_l8EtJ8",
  authDomain: "rehnuma-society.firebaseapp.com",
  databaseURL: "https://rehnuma-society-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rehnuma-society",
  storageBucket: "rehnuma-society.firebasestorage.app",
  messagingSenderId: "409507107740",
  appId: "1:409507107740:web:8677d798462becd6afae59"
};

export const ADMIN_UID = "IPGPTPOsyDfdfAuSn6hZu2WsDWf1";
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

const screens = ["screen-loading","screen-login","screen-pending","screen-rejected","screen-setup","screen-register","screen-member-dash","screen-admin-dash"];
export function showScreen(id) {
  screens.forEach(s => document.getElementById(s)?.classList.toggle("hidden", s !== id));
}

export function isValidSecurePassword(pw) {
  return pw && pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[@/$_&\-\?!;']/.test(pw);
}

let isSessionUnlocked = false;
const getPinKey = (uid) => `rehnuma_pin_${uid}`;
const getBioKey = (uid) => `rehnuma_bio_${uid}`;

export function triggerAppLockIfNeeded() {
  const u = auth.currentUser;
  if (!u) return;
  const pin = localStorage.getItem(getPinKey(u.uid));
  if (pin && !isSessionUnlocked) {
    document.getElementById("unlock-pin-input").value = "";
    document.getElementById("lock-error").classList.add("hidden");
    document.getElementById("app-lock-screen").classList.remove("hidden");
    if (localStorage.getItem(getBioKey(u.uid)) === "true") attemptBiometricUnlock();
  }
}

window.lockAppNow = () => { isSessionUnlocked = false; triggerAppLockIfNeeded(); };

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") isSessionUnlocked = false;
  else triggerAppLockIfNeeded();
});

async function attemptBiometricUnlock() {
  try {
    if (window.Capacitor?.Plugins?.NativeBiometric) {
      await window.Capacitor.Plugins.NativeBiometric.verifyIdentity({
        reason: "Unlock Rehnuma Society",
        title: "Rehnuma Security Lock",
        subtitle: "Under management MDBTW Association"
      });
      isSessionUnlocked = true;
      document.getElementById("app-lock-screen").classList.add("hidden");
    }
  } catch (e) {}
}

document.getElementById("btn-unlock-pin").onclick = () => {
  const u = auth.currentUser;
  if (!u) return;
  const val = document.getElementById("unlock-pin-input").value.trim();
  if (val === localStorage.getItem(getPinKey(u.uid))) {
    isSessionUnlocked = true;
    document.getElementById("app-lock-screen").classList.add("hidden");
  } else {
    const err = document.getElementById("lock-error");
    err.textContent = "Incorrect 6-digit PIN.";
    err.classList.remove("hidden");
  }
};

document.getElementById("btn-unlock-bio").onclick = attemptBiometricUnlock;
document.getElementById("btn-lock-logout").onclick = () => window.logoutUser();

async function routeUser(user) {
  showScreen("screen-loading");
  try {
    if (user.uid === ADMIN_UID) {
      if (!localStorage.getItem(getPinKey(user.uid))) showScreen("screen-setup");
      else { showScreen("screen-admin-dash"); triggerAppLockIfNeeded(); }
      return;
    }
    const snap = await getDoc(doc(db, "members", user.uid));
    if (!snap.exists()) { showScreen("screen-register"); return; }
    const data = snap.data();
    const st = (data.status || "").toLowerCase();
    if (st === "pending") showScreen("screen-pending");
    else if (st === "rejected") showScreen("screen-rejected");
    else if (st === "accepted") showScreen("screen-setup");
    else if (st === "active") {
      if (data.appPin && !localStorage.getItem(getPinKey(user.uid))) {
        localStorage.setItem(getPinKey(user.uid), data.appPin);
        localStorage.setItem(getBioKey(user.uid), "true");
      }
      showScreen("screen-member-dash");
      triggerAppLockIfNeeded();
    } else showScreen("screen-register");
  } catch (e) { showScreen("screen-login"); }
}

onAuthStateChanged(auth, u => {
  if (u) routeUser(u);
  else { isSessionUnlocked = false; document.getElementById("app-lock-screen").classList.add("hidden"); showScreen("screen-login"); }
});

document.getElementById("btn-login").onclick = async () => {
  const email = document.getElementById("login-email").value.trim();
  const pw = document.getElementById("login-password").value;
  const err = document.getElementById("login-error");
  err.classList.add("hidden");
  if (!email || !pw) { err.textContent = "Enter email and password."; err.classList.remove("hidden"); return; }
  try { await signInWithEmailAndPassword(auth, email, pw); }
  catch (e) {
    try { await createUserWithEmailAndPassword(auth, email, pw); }
    catch (e2) { err.textContent = "Invalid credentials."; err.classList.remove("hidden"); }
  }
};

document.getElementById("btn-google").onclick = async () => {
  const err = document.getElementById("login-error");
  err.classList.add("hidden");
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (e) { err.textContent = e.message; err.classList.remove("hidden"); }
};

document.getElementById("btn-complete-setup").onclick = async () => {
  const u = auth.currentUser;
  if (!u) return;
  const pw = document.getElementById("setup-password").value;
  const pin = document.getElementById("setup-pin").value.trim();
  const bio = document.getElementById("setup-bio").checked;
  const err = document.getElementById("setup-error");
  err.classList.add("hidden");
  if (!isValidSecurePassword(pw)) { err.textContent = "Password needs 8+ chars (1 Cap, 1 Small, 1 Num, 1 Special @/$_&-?!;')."; err.classList.remove("hidden"); return; }
  if (!/^\d{6}$/.test(pin)) { err.textContent = "Enter a 6-digit numeric PIN."; err.classList.remove("hidden"); return; }
  try {
    try { await updatePassword(u, pw); } catch (e) {}
    localStorage.setItem(getPinKey(u.uid), pin);
    localStorage.setItem(getBioKey(u.uid), bio ? "true" : "false");
    isSessionUnlocked = true;
    if (u.uid !== ADMIN_UID) {
      await updateDoc(doc(db, "members", u.uid), { status: "active", appPin: pin, activatedAt: serverTimestamp() });
    }
    await routeUser(u);
  } catch (e) { err.textContent = e.message; err.classList.remove("hidden"); }
};

window.logoutUser = async () => { isSessionUnlocked = false; await signOut(auth); };
