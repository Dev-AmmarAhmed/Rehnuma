import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyCIYiP7aJgU4h26UjO3WOmC7SmA_l8EtJ8",
  authDomain: "rehnuma-society.firebaseapp.com",
  projectId: "rehnuma-society",
  appId: "1:409507107740:web:8677d798462becd6afae59"
});
const auth = getAuth(app);
const db = getFirestore(app);

// EXACT ADMIN UIDs
const ADMIN_UIDS = ["iPGPTPOsyDfdfAuSn6hZu2WsDWf1", "rtuj0PgtxWO6CGc3qo1SgiohFyn1"];

window.showScreen = (id) => {
  ["screen-loading", "screen-login", "screen-register", "screen-pending", "screen-setup", "screen-admin-dash", "screen-member-dash"].forEach(s => {
    document.getElementById(s)?.classList.toggle("hidden", s !== id);
  });
};

// 1. LOGIN ROUTING LOGIC
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.showScreen("screen-login");
  
  if (ADMIN_UIDS.includes(user.uid)) {
    window.showScreen("screen-admin-dash");
    return;
  }
  
  try {
    const snap = await getDoc(doc(db, "members", user.uid));
    if (!snap.exists()) { await signOut(auth); return window.showScreen("screen-login"); }
    const status = snap.data().status;
    
    if (status === "pending" || status === "submitted") {
      window.showScreen("screen-pending"); // NO LOGOUT HERE!
    } else if (status === "accepted" || status === "active") {
      if (snap.data().appPin) {
        window.showScreen("screen-member-dash");
      } else {
        window.showScreen("screen-setup");
      }
    }
  } catch(e) { alert(e.message); window.showScreen("screen-login"); }
});

// 2. LOGIN BUTTON
document.getElementById("btn-login").onclick = async () => {
  const e = document.getElementById("login-email").value, p = document.getElementById("login-password").value;
  const err = document.getElementById("login-error"); err.classList.add("hidden");
  if(!e || !p) return err.textContent="Email and Password required", err.classList.remove("hidden");
  try { await signInWithEmailAndPassword(auth, e, p); } 
  catch(ex) { err.textContent=ex.message; err.classList.remove("hidden"); }
};

// 3. REGISTER BUTTON FLOW
document.getElementById("btn-go-register").onclick = () => window.showScreen("screen-register");
document.getElementById("btn-submit-reg").onclick = async () => {
  const n=document.getElementById("reg-name").value, ph=document.getElementById("reg-phone").value;
  const e=document.getElementById("reg-email").value, p=document.getElementById("reg-password").value;
  const err = document.getElementById("reg-error"); err.classList.add("hidden");
  if(!n || !ph || !e || !p) return err.textContent="Fill all fields", err.classList.remove("hidden");
  try {
    const cred = await createUserWithEmailAndPassword(auth, e, p);
    await setDoc(doc(db, "members", cred.user.uid), { name: n, phone: ph, email: e, status: "submitted" });
    // onAuthStateChanged will handle routing to Pending automatically
  } catch(ex) { err.textContent=ex.message; err.classList.remove("hidden"); }
};

// 4. SETUP APP PIN (After Admin Accepts)
document.getElementById("btn-save-setup").onclick = async () => {
  const pin = document.getElementById("setup-pin").value;
  if(pin.length !== 6) return alert("Enter exactly 6 digits");
  await setDoc(doc(db, "members", auth.currentUser.uid), { appPin: pin, status: "active" }, { merge:true });
  window.showScreen("screen-member-dash");
};

// 5. MEMBER DASHBOARD (Left Drawer & Profile)
window.showMemSection = (sec) => {
  document.getElementById("mem-sec-home").classList.add("hidden");
  document.getElementById("mem-sec-profile").classList.add("hidden");
  document.getElementById("mem-sec-" + sec).classList.remove("hidden");
  document.getElementById("mem-drawer").classList.remove("open");
  
  if(sec === 'profile') {
    // Load current biometric preference
    document.getElementById("toggle-bio").checked = (localStorage.getItem("bio_" + auth.currentUser.uid) === "true");
  }
};

document.getElementById("btn-update-security").onclick = async () => {
  const p = document.getElementById("update-pin").value;
  const bio = document.getElementById("toggle-bio").checked;
  if(p && p.length === 6) await setDoc(doc(db, "members", auth.currentUser.uid), { appPin: p }, { merge:true });
  localStorage.setItem("bio_" + auth.currentUser.uid, bio ? "true" : "false");
  document.getElementById("sec-msg").textContent = "Security settings updated successfully!";
  setTimeout(()=>document.getElementById("sec-msg").textContent="", 3000);
};

// 6. ADMIN DASHBOARD (4 Bottom Tabs)
window.switchAdmTab = (t) => {
  ["home", "members", "loan", "recovery"].forEach(tab => {
    document.getElementById("nav-"+tab).classList.remove("active");
    document.getElementById("adm-view-"+tab).classList.add("hidden");
  });
  document.getElementById("nav-"+t).classList.add("active");
  document.getElementById("adm-view-"+t).classList.remove("hidden");
  if(t==="members") loadMembers();
};

async function loadMembers() {
  const box = document.getElementById("members-list"); box.innerHTML = "Loading...";
  const snap = await getDocs(collection(db, "members"));
  let h=""; snap.forEach(d=>{
    const m=d.data(); h+=`<div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.1);"><strong>${m.name}</strong><br><span style="font-size:12px;color:#94a3b8">${m.email}</span><div style="margin-top:5px;color:var(--primary);font-size:12px;font-weight:bold;">STATUS: ${m.status.toUpperCase()}</div></div>`;
  });
  box.innerHTML = h;
}

window.logoutUser = () => signOut(auth);
