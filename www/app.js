import "./ui-init.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, sendPasswordResetEmail, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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

// Yahan dono purane Admins hain
export const ADMIN_UIDS = ["IPGPTPOsyDfdfAuSn6hZu2WsDWf1", "rtuj0PgtxWO6CGc3qo1SgiohFyn1", "Rtuj0PgtxWO6CGc3qo1SgiohFyn1"];
export const isAdminUid = (uid) => ADMIN_UIDS.includes(uid);

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

const screens = ["screen-loading","screen-login","screen-pending","screen-rejected","screen-setup","screen-register","screen-member-dash","screen-admin-dash"];
export function showScreen(id) { screens.forEach(s => document.getElementById(s)?.classList.toggle("hidden", s !== id)); }
export function isValidSecurePassword(pw) { return pw && pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /[0-9]/.test(pw) && /[@/$_&\-\?!;']/.test(pw); }

let isSessionUnlocked = false;
const getPinKey = (uid) => `rehnuma_pin_${uid}`;
const getBioKey = (uid) => `rehnuma_bio_${uid}`;

export function triggerAppLockIfNeeded() {
  const u = auth.currentUser; if (!u) return;
  const pin = localStorage.getItem(getPinKey(u.uid));
  if (pin && !isSessionUnlocked) {
    document.getElementById("unlock-pin-input").value = "";
    document.getElementById("lock-error").classList.add("hidden");
    document.getElementById("app-lock-screen").classList.remove("hidden");
    if (localStorage.getItem(getBioKey(u.uid)) === "true") attemptBiometricUnlock();
  }
}
window.lockAppNow = () => { isSessionUnlocked = false; triggerAppLockIfNeeded(); };

async function attemptBiometricUnlock() {
  try {
    if (window.Capacitor?.Plugins?.NativeBiometric) {
      await window.Capacitor.Plugins.NativeBiometric.verifyIdentity({ reason: "Unlock Rehnuma Society", title: "Rehnuma Security" });
      isSessionUnlocked = true; document.getElementById("app-lock-screen").classList.add("hidden");
    }
  } catch (e) {}
}

document.getElementById("btn-unlock-pin").onclick = () => {
  const u = auth.currentUser; if (!u) return;
  if (document.getElementById("unlock-pin-input").value.trim() === localStorage.getItem(getPinKey(u.uid))) {
    isSessionUnlocked = true; document.getElementById("app-lock-screen").classList.add("hidden");
  } else {
    document.getElementById("lock-error").textContent = "Incorrect PIN."; document.getElementById("lock-error").classList.remove("hidden");
  }
};
document.getElementById("btn-unlock-bio").onclick = attemptBiometricUnlock;
document.getElementById("btn-lock-logout").onclick = () => window.logoutUser();

async function routeUser(user) {
  showScreen("screen-loading");
  
  // Strict Admin Check
  if (isAdminUid(user.uid)) {
    if (!localStorage.getItem(getPinKey(user.uid))) showScreen("screen-setup");
    else { showScreen("screen-admin-dash"); triggerAppLockIfNeeded(); }
    return;
  }
  
  try {
    const snap = await getDoc(doc(db, "members", user.uid));
    if (!snap.exists()) { 
      // DEBUG: Agar admin fail hua, toh yahan UID dikhega!
      const regTitle = document.querySelector("#screen-register h3");
      if(regTitle) regTitle.innerHTML = `Member Registration<br><span style="color:#ef4444;font-size:12px;">Debug Your UID: ${user.uid}</span>`;
      showScreen("screen-register"); 
      return; 
    }
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
      showScreen("screen-member-dash"); triggerAppLockIfNeeded();
    } else showScreen("screen-register");
  } catch (e) {
    alert("Firestore Error: " + e.message);
    showScreen("screen-register");
  }
}

onAuthStateChanged(auth, u => {
  if (u) routeUser(u);
  else { isSessionUnlocked = false; document.getElementById("app-lock-screen").classList.add("hidden"); showScreen("screen-login"); }
});

document.getElementById("toggle-pw").onchange = (e) => document.getElementById("login-password").type = e.target.checked ? "text" : "password";

document.getElementById("btn-forgot-pw").onclick = async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  if (!email) return alert("Email daalo pehle bhai!");
  try { await sendPasswordResetEmail(auth, email); alert("Password reset link bhej diya gaya hai!"); } 
  catch (ex) { alert("Error: " + ex.message); }
};

document.getElementById("btn-login").onclick = async () => {
  const email = document.getElementById("login-email").value.trim();
  const pw = document.getElementById("login-password").value;
  const err = document.getElementById("login-error");
  err.classList.add("hidden");
  if (!email || !pw) { err.textContent = "Email aur password dono daalo."; err.classList.remove("hidden"); return; }
  const btn = document.getElementById("btn-login"); btn.disabled = true; btn.textContent = "Loading...";
  try {
    await signInWithEmailAndPassword(auth, email, pw);
  } catch (signInErr) {
    try { await createUserWithEmailAndPassword(auth, email, pw); } 
    catch (ce) {
      if (ce.code === "auth/email-already-in-use") err.textContent = "Wrong password. 'Forgot Password' try karo.";
      else err.textContent = "Error: " + ce.message;
      err.classList.remove("hidden");
    }
  } finally { btn.disabled = false; btn.textContent = "Sign In / Register"; }
};

document.getElementById("btn-google").onclick = async () => {
  const err = document.getElementById("login-error"); err.classList.add("hidden");
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (e) {
    err.innerHTML = "<b>Google Fail:</b> " + e.message;
    err.classList.remove("hidden");
  }
};

document.getElementById("btn-complete-setup").onclick = async () => {
  const u = auth.currentUser; if (!u) return;
  const pw = document.getElementById("setup-password").value;
  const pin = document.getElementById("setup-pin").value.trim();
  const bio = document.getElementById("setup-bio").checked;
  const err = document.getElementById("setup-error"); err.classList.add("hidden");
  if (!isValidSecurePassword(pw)) { err.textContent = "Password 8 chars lamba, 1 Capital, 1 Small, 1 Num, 1 Special chahye."; err.classList.remove("hidden"); return; }
  if (!/^\d{6}$/.test(pin)) { err.textContent = "6-digit PIN daalo."; err.classList.remove("hidden"); return; }
  try {
    try { await updatePassword(u, pw); } catch (e) {}
    localStorage.setItem(getPinKey(u.uid), pin); localStorage.setItem(getBioKey(u.uid), bio ? "true" : "false");
    isSessionUnlocked = true;
    if (!isAdminUid(u.uid)) await updateDoc(doc(db, "members", u.uid), { status: "active", appPin: pin, activatedAt: serverTimestamp() });
    await routeUser(u);
  } catch (e) { err.textContent = e.message; err.classList.remove("hidden"); }
};
window.logoutUser = async () => { isSessionUnlocked = false; await signOut(auth); };
if (window.Capacitor?.Plugins?.App) window.Capacitor.Plugins.App.addListener("appStateChange", ({ isActive }) => { if (!isActive) window.lockAppNow(); else triggerAppLockIfNeeded(); });
